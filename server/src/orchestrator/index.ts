/**
 * Main orchestrator controller
 * Coordinates multi-agent workflow execution using LangGraph
 */

import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger.js';
import type { OrchestratorRun, RunStep } from '../types.js';
import { runWorkflow } from './langgraph.js';

class Orchestrator {
  private runs: Map<string, OrchestratorRun> = new Map();

  /**
   * Start a new orchestrator run
   */
  async startRun(config: { question: string; serviceId: string }): Promise<OrchestratorRun> {
    const runId = uuidv4();
    
    const run: OrchestratorRun = {
      id: runId,
      status: 'pending',
      startTime: new Date(),
      steps: [],
      metadata: {
        question: config.question,
        serviceId: config.serviceId,
      },
    };
    
    this.runs.set(runId, run);
    logger.info(`Created new run: ${runId}`);
    
    // Start workflow asynchronously
    this.executeWorkflow(runId, config).catch(error => {
      logger.error(`Workflow failed for run ${runId}`, error);
      run.status = 'failed';
      run.endTime = new Date();
    });
    
    return run;
  }

  /**
   * Execute the multi-agent workflow
   */
  private async executeWorkflow(
    runId: string, 
    config: { question: string; serviceId: string }
  ): Promise<void> {
    const run = this.runs.get(runId);
    if (!run) throw new Error(`Run ${runId} not found`);
    
    try {
      run.status = 'running';
      logger.info(`Starting workflow for run: ${runId}`);
      
      // Execute LangGraph workflow
      const result = await runWorkflow({
        runId,
        question: config.question,
        serviceId: config.serviceId,
      });
      
      run.steps = result.steps;
      run.status = 'completed';
      run.endTime = new Date();
      run.metadata.result = result.data;
      
      logger.info(`Workflow completed for run: ${runId}`);
    } catch (error) {
      logger.error(`Workflow execution failed for run ${runId}`, error);
      run.status = 'failed';
      run.endTime = new Date();
      run.metadata.error = error instanceof Error ? error.message : 'Unknown error';
      throw error;
    }
  }

  /**
   * Get run by ID
   */
  async getRun(runId: string): Promise<OrchestratorRun | undefined> {
    return this.runs.get(runId);
  }

  /**
   * List all runs
   */
  async listRuns(): Promise<OrchestratorRun[]> {
    return Array.from(this.runs.values()).sort(
      (a, b) => b.startTime.getTime() - a.startTime.getTime()
    );
  }

  /**
   * Cancel a running workflow
   */
  async cancelRun(runId: string): Promise<void> {
    const run = this.runs.get(runId);
    if (!run) throw new Error(`Run ${runId} not found`);
    
    if (run.status === 'running') {
      run.status = 'failed';
      run.endTime = new Date();
      run.metadata.cancelled = true;
      logger.info(`Cancelled run: ${runId}`);
    }
  }
}

export const orchestrator = new Orchestrator();
