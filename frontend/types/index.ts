export type RunStatus = 'active' | 'completed' | 'failed' | 'pending'
export type AgentStatus = 'pending' | 'running' | 'completed' | 'failed'
export type ForkState = 'created' | 'in_progress' | 'deleted'

export interface Agent {
  id: string
  name: string
  icon: string
  status: AgentStatus
  progress: number
  startedAt?: string
  completedAt?: string
}

export interface Run {
  id: string
  status: RunStatus
  forkName: string
  forkServiceId: string
  agentsCompleted: number
  totalAgents: number
  startedAt: string
  endedAt?: string
  duration?: string
  agents: Agent[]
  logs: string[]
}

export interface SearchResult {
  title: string
  score: number
  type: 'bm25' | 'vector' | 'hybrid'
  content: string
}

export interface ForkLifecycle {
  state: ForkState
  timestamp: string
}
