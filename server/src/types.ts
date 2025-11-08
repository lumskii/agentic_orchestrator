/**
 * Shared TypeScript type definitions for the orchestrator
 */

export interface OrchestratorRun {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  steps: RunStep[];
  metadata: Record<string, any>;
}

export interface RunStep {
  name: string;
  agent: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime?: Date;
  endTime?: Date;
  output?: any;
  error?: string;
}

export interface TigerService {
  id: string;
  name: string;
  status: string;
  region: string;
  createdAt: Date;
}

export interface TigerFork {
  id: string;
  parentServiceId: string;
  name: string;
  createdAt: Date;
  connectionString?: string;
}

export interface SearchResult {
  id: string;
  title: string;
  content: string;
  bm25Score: number;
  vectorScore: number;
  hybridScore: number;
  score: number; // Combined score for ranking
  metadata?: Record<string, any>;
}

export interface Question {
  id: string;
  text: string;
  answer?: string;
  sources?: SearchResult[];
  createdAt: Date;
}

export interface AgentConfig {
  name: string;
  model?: string;
  temperature?: number;
  systemPrompt?: string;
}

export interface WorkflowState {
  runId: string;
  currentStep: string;
  data: Record<string, any>;
  errors: string[];
}
