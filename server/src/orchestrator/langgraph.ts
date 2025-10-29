/**
 * LangGraph workflow definition
 * Orchestrates agent execution in a directed graph
 */

import { logger } from '../utils/logger.js';
import type { RunStep, WorkflowState } from '../types.js';
import { runETLAgent } from './agents/etlAgent.js';
import { runSearchAgent } from './agents/searchAgent.js';
import { runAnalystAgent } from './agents/analystAgent.js';
import { runDBAAgent } from './agents/dbaAgent.js';
import { runMergeAgent } from './agents/mergeAgent.js';
// TODO: Uncomment when implementing actual LangGraph workflow
// import { StateGraph } from '@langchain/langgraph';

/**
 * Define the workflow graph structure
 * 
 * Workflow: ETL → Search → Analyst → DBA → Merge
 */
export async function runWorkflow(input: {
  runId: string;
  question: string;
  serviceId: string;
}): Promise<{ steps: RunStep[]; data: any }> {
  logger.info(`Executing LangGraph workflow for run: ${input.runId}`);
  
  const steps: RunStep[] = [];
  const state: WorkflowState = {
    runId: input.runId,
    currentStep: 'init',
    data: {
      question: input.question,
      serviceId: input.serviceId,
    },
    errors: [],
  };

  try {
    // Step 1: ETL Agent - Data extraction and transformation
    steps.push(await executeAgent('etl', runETLAgent, state));
    
    // Step 2: Search Agent - Hybrid search for relevant context
    steps.push(await executeAgent('search', runSearchAgent, state));
    
    // Step 3: Analyst Agent - Analyze data and generate insights
    steps.push(await executeAgent('analyst', runAnalystAgent, state));
    
    // Step 4: DBA Agent - Optimize and apply database changes
    steps.push(await executeAgent('dba', runDBAAgent, state));
    
    // Step 5: Merge Agent - Merge fork back to production
    steps.push(await executeAgent('merge', runMergeAgent, state));
    
    logger.info(`Workflow completed successfully for run: ${input.runId}`);
    
    return { steps, data: state.data };
  } catch (error) {
    logger.error(`Workflow failed for run ${input.runId}`, error);
    throw error;
  }
}

/**
 * Execute a single agent and track its step
 */
async function executeAgent(
  agentName: string,
  agentFunc: (state: WorkflowState) => Promise<any>,
  state: WorkflowState
): Promise<RunStep> {
  const step: RunStep = {
    name: agentName,
    agent: agentName,
    status: 'running',
    startTime: new Date(),
  };
  
  try {
    state.currentStep = agentName;
    logger.info(`Executing agent: ${agentName}`);
    
    const output = await agentFunc(state);
    
    step.status = 'completed';
    step.endTime = new Date();
    step.output = output;
    
    // Store output in shared state
    state.data[agentName] = output;
    
    logger.info(`Agent ${agentName} completed successfully`);
  } catch (error) {
    step.status = 'failed';
    step.endTime = new Date();
    step.error = error instanceof Error ? error.message : 'Unknown error';
    
    state.errors.push(step.error);
    logger.error(`Agent ${agentName} failed`, error);
    
    throw error;
  }
  
  return step;
}
