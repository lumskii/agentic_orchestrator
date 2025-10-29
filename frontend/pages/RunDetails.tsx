import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { mockRuns, mockSearchResults } from '../data/mockData'
import { Navbar } from '../components/Navbar'
import { AgentProgressCard } from '../components/AgentProgressCard'
import { ForkLifecycleCard } from '../components/ForkLifecycleCard'
import { ConsoleLogPanel } from '../components/ConsoleLogPanel'
import { SearchResultsPanel } from '../components/SearchResultsPanel'
import { ArrowLeft as ArrowLeftIcon, CheckCircle as CheckCircleIcon, Trash as TrashIcon } from 'lucide-react'

export function RunDetails() {
  const { id } = useParams()
  const navigate = useNavigate()

  const run = mockRuns.find((r) => r.id === id)

  if (!run) {
    return (
      <div className="flex-1 flex items-center justify-center bg-black min-h-screen">
        <div className="text-center">
          <h2 className="text-white text-2xl font-semibold mb-2">
            Run not found
          </h2>
          <button
            onClick={() => navigate('/')}
            className="text-[#00B8D9] hover:text-[#00a5c3]"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const allAgentsCompleted = run.agents.every((a) => a.status === 'completed')

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

          {allAgentsCompleted && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6 flex items-center gap-3">
              <CheckCircleIcon className="text-green-500" size={24} />
              <p className="text-green-500 font-medium">
                All agents completed successfully!
              </p>
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
                className={`px-4 py-2 rounded-lg font-medium ${run.status === 'completed' ? 'bg-green-500/10 text-green-500' : run.status === 'active' ? 'bg-[#00B8D9]/10 text-[#00B8D9]' : 'bg-red-500/10 text-red-500'}`}
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
                  {run.agents.map((agent, index) => (
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

              <ConsoleLogPanel logs={run.logs} />

              <div className="flex gap-3">
                <button
                  disabled={!allAgentsCompleted}
                  className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${allAgentsCompleted ? 'bg-[#00B8D9] text-white hover:bg-[#00a5c3]' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}`}
                >
                  <CheckCircleIcon className="inline mr-2" size={18} />
                  Approve Merge
                </button>
                <button className="px-6 py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors font-medium">
                  <TrashIcon className="inline mr-2" size={18} />
                  Delete Fork
                </button>
              </div>
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
