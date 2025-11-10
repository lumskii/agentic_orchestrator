import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { mockRuns, mockSearchResults } from '../data/mockData'
import { Navbar } from '../components/Navbar'
import { AgentProgressCard } from '../components/AgentProgressCard'
import { ForkLifecycleCard } from '../components/ForkLifecycleCard'
import { ConsoleLogPanel } from '../components/ConsoleLogPanel'
import { SearchResultsPanel } from '../components/SearchResultsPanel'
import { ReportResultsPanel } from '../components/ReportResultsPanel'
import { PageLoader } from '../components/LoadingSpinner'
import { PageError } from '../components/ErrorDisplay'
import { runsAPI } from '../lib/api'
import type { Run, Agent } from '../types'
import type { Run as APIRun } from '../lib/api'
import { 
  ArrowLeft as ArrowLeftIcon, 
  CheckCircle as CheckCircleIcon, 
  Trash as TrashIcon
} from 'lucide-react'

export function RunDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [run, setRun] = useState<Run | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mergeStatus, setMergeStatus] = useState<{
    type: 'loading' | 'success' | 'error'
    message: string
    details?: string
  } | null>(null)

  useEffect(() => {
    if (id) {
      loadRunDetails(id)
    }
  }, [id])

  const loadRunDetails = async (runId: string) => {
    try {
      setLoading(true)
      setError(null)
      
      // Try API first
      const response = await runsAPI.get(runId)
      if (response.data.success && response.data.data) {
        // Transform API data to frontend Run format
        const apiRun = response.data.data
        
        // Map API steps to frontend agents with proper status
        const agentMap = [
          { id: 'etl', name: 'ETL Agent', icon: '🧱' },
          { id: 'search', name: 'Search Agent', icon: '🔍' },
          { id: 'analyst', name: 'Analyst Agent', icon: '📊' },
          { id: 'dba', name: 'DBA Agent', icon: '⚙️' },
          { id: 'merge', name: 'Merge Agent', icon: '✅' }
        ]
        
        const transformedAgents = agentMap.map(agentTemplate => {
          const step = apiRun.steps?.find((s: any) => s.agent === agentTemplate.id || s.name === agentTemplate.id)
          if (step) {
            return {
              ...agentTemplate,
              status: step.status as Agent['status'],
              progress: step.status === 'completed' ? 100 : step.status === 'running' ? 50 : 0
            }
          }
          return {
            ...agentTemplate,
            status: 'pending' as Agent['status'],
            progress: 0
          }
        })
        
        // Count completed agents
        const completedCount = transformedAgents.filter(a => a.status === 'completed').length
        
        // Calculate duration
        let duration = 'In progress'
        if (apiRun.endTime && apiRun.startTime) {
          const start = new Date(apiRun.startTime)
          const end = new Date(apiRun.endTime)
          const diffMs = end.getTime() - start.getTime()
          const diffSecs = Math.floor(diffMs / 1000)
          const diffMins = Math.floor(diffSecs / 60)
          if (diffMins > 0) {
            duration = `${diffMins}m ${diffSecs % 60}s`
          } else {
            duration = `${diffSecs}s`
          }
        }
        
        // Create logs from steps and errors
        const logs = ['[INFO] Run started...']
        if (apiRun.steps && apiRun.steps.length > 0) {
          apiRun.steps.forEach((step: any) => {
            logs.push(`[INFO] ${step.name || step.agent} agent: ${step.status}`)
            if (step.status === 'failed' && step.error) {
              logs.push(`[ERROR] ${step.name || step.agent}: ${step.error}`)
            }
          })
        }
        
        // Handle run-level errors
        if (apiRun.status === 'failed') {
          if (apiRun.metadata?.error) {
            logs.push(`[ERROR] Run failed: ${apiRun.metadata.error}`)
          } else {
            logs.push('[ERROR] Run failed with unknown error')
          }
        }
        
        // If run failed but no steps were executed, mark all agents as failed
        if (apiRun.status === 'failed' && (!apiRun.steps || apiRun.steps.length === 0)) {
          transformedAgents.forEach(agent => {
            agent.status = 'failed'
            agent.progress = 0
          })
        }
        
        // Map API status to frontend status
        const mapStatus = (apiStatus: string): Run['status'] => {
          switch (apiStatus) {
            case 'running': return 'active'
            case 'completed': return 'completed'
            case 'failed': return 'failed'
            default: return 'pending'
          }
        }

        const transformedRun: Run = {
          id: apiRun.id,
          status: mapStatus(apiRun.status),
          forkName: `fork-${apiRun.id.slice(0, 8)}`,
          forkServiceId: apiRun.metadata?.serviceId || 'api-service',
          agentsCompleted: completedCount,
          totalAgents: 5,
          startedAt: apiRun.startTime,
          endedAt: apiRun.endTime,
          duration,
          agents: transformedAgents,
          logs
        }
        setRun(transformedRun)
      } else {
        // Fallback to mock data
        const mockRun = mockRuns.find((r) => r.id === runId)
        if (mockRun) {
          setRun(mockRun)
        } else {
          setError('Run not found')
        }
      }
    } catch (apiError) {
      console.warn('API failed, falling back to mock data:', apiError)
      // Fallback to mock data
      const mockRun = mockRuns.find((r) => r.id === runId)
      if (mockRun) {
        setRun(mockRun)
      } else {
        setError('Run not found')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleApproveMerge = async () => {
    if (!run || !id) return
    
    setMergeStatus({
      type: 'loading',
      message: 'Approving merge...',
      details: 'Validating changes and merging to production'
    })

    try {
      const response = await fetch(`http://localhost:5000/api/runs/${id}/approve-merge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      })

      const result = await response.json()

      if (result.success) {
        const mergeData = result.data
        const isAlreadyApproved = mergeData.status === 'already_approved'
        
        setMergeStatus({
          type: 'success',
          message: isAlreadyApproved ? 'Already merged to production' : 'Merge approved successfully!',
          details: `Changes merged at ${new Date(mergeData.mergedAt).toLocaleString()}. Performance improvement: ${mergeData.performanceImprovement}. Rollback available.${isAlreadyApproved ? ' (Previously merged)' : ''}`
        })

        // Refresh run data to show updated status
        setTimeout(() => {
          loadRunDetails(id)
          setMergeStatus(null)
        }, 5000)
      } else {
        throw new Error(result.error || 'Merge approval failed')
      }
      
    } catch (error) {
      setMergeStatus({
        type: 'error',
        message: 'Merge approval failed',
        details: error instanceof Error ? error.message : 'An unexpected error occurred'
      })
    }
  }

  const handleDeleteFork = async () => {
    if (!run || !id) return
    
    const confirmed = window.confirm(
      'Are you sure you want to delete this fork? This action cannot be undone.'
    )
    
    if (!confirmed) return

    try {
      await runsAPI.delete(id)
      navigate('/')
    } catch (error) {
      console.error('Failed to delete fork:', error)
      // Show error message or toast notification
    }
  }

  // Loading state
  if (loading) {
    return <PageLoader text="Loading run details..." />
  }

  // Error state
  if (error || !run) {
    return (
      <PageError 
        title={error || 'Run not found'}
        message="The requested run could not be found or loaded."
        onGoBack={() => navigate('/')}
      />
    )
  }

  const allAgentsCompleted = run.agents.every((a: Agent) => a.status === 'completed')

  return (
    <div className="flex-1 flex flex-col bg-black min-h-screen">
      <Navbar />

      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6"
          >
            <ArrowLeftIcon size={18} />
            Back to Dashboard
          </button>

          {allAgentsCompleted && run.status === 'completed' && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6 flex items-center gap-3">
              <CheckCircleIcon className="text-green-500" size={24} />
              <p className="text-green-500 font-medium">
                All agents completed successfully!
              </p>
            </div>
          )}

          {run.status === 'failed' && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 flex items-center gap-3">
              <TrashIcon className="text-red-500" size={24} />
              <div>
                <p className="text-red-500 font-medium">Run Failed</p>
                <p className="text-red-400 text-sm mt-1">
                  {run.logs.find(log => log.includes('[ERROR]'))?.replace('[ERROR] Run failed: ', '') || 'An error occurred during execution'}
                </p>
              </div>
            </div>
          )}

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-white text-2xl font-semibold mb-2">
                  {run.id}
                </h1>
                <p className="text-zinc-400">
                  Fork Service ID: {run.forkServiceId}
                </p>
              </div>
              <span
                className={`px-4 py-2 rounded-lg font-medium ${
                  run.status === 'completed' ? 'bg-green-500/10 text-green-500' : 
                  run.status === 'active' ? 'bg-[#00B8D9]/10 text-[#00B8D9]' : 
                  run.status === 'failed' ? 'bg-red-500/10 text-red-500' :
                  'bg-zinc-500/10 text-zinc-500'
                }`}
              >
                {run.status.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-4 border-t border-zinc-800">
              <div>
                <p className="text-zinc-500 text-sm mb-1">Started</p>
                <p className="text-white">
                  {new Date(run.startedAt).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-zinc-500 text-sm mb-1">Duration</p>
                <p className="text-white">{run.duration || 'In progress'}</p>
              </div>
              <div>
                <p className="text-zinc-500 text-sm mb-1">Progress</p>
                <p className="text-white">
                  {run.agentsCompleted}/{run.totalAgents} agents
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="text-white text-xl font-semibold mb-4">
                  Agent Progress
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {run.agents.map((agent: Agent, index: number) => (
                    <AgentProgressCard
                      key={agent.id}
                      agent={agent}
                      index={index}
                    />
                  ))}
                </div>
              </div>

              <ForkLifecycleCard
                forkName={run.forkName}
                forkServiceId={run.forkServiceId}
                status={run.status}
              />

              <ReportResultsPanel run={run} />

              <ConsoleLogPanel logs={run.logs} />

              <div className="flex gap-3">
                <button
                  onClick={() => handleApproveMerge()}
                  disabled={!allAgentsCompleted}
                  className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${allAgentsCompleted ? 'bg-[#00B8D9] text-white hover:bg-[#00a5c3]' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}`}
                >
                  <CheckCircleIcon className="inline mr-2" size={18} />
                  Approve Merge
                </button>
                <button 
                  onClick={() => handleDeleteFork()}
                  className="px-6 py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors font-medium"
                >
                  <TrashIcon className="inline mr-2" size={18} />
                  Delete Fork
                </button>
              </div>
              
              {mergeStatus && (
                <div className={`p-4 rounded-lg border ${
                  mergeStatus.type === 'success' 
                    ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                    : mergeStatus.type === 'error'
                    ? 'bg-red-500/10 border-red-500/20 text-red-400'
                    : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                }`}>
                  <div className="flex items-center gap-2">
                    {mergeStatus.type === 'loading' && (
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    )}
                    <span className="font-medium">{mergeStatus.message}</span>
                  </div>
                  {mergeStatus.details && (
                    <p className="text-sm mt-2 opacity-80">{mergeStatus.details}</p>
                  )}
                </div>
              )}
            </div>

            <div>
              <SearchResultsPanel results={mockSearchResults} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
