import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Run } from '../types'
import {
  Clock as ClockIcon,
  CheckCircle as CheckCircleIcon,
  XCircle as XCircleIcon,
  Loader as LoaderIcon,
} from 'lucide-react'

interface RunTableProps {
  runs: Run[]
}

export function RunTable({ runs }: RunTableProps) {
  const navigate = useNavigate()

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="text-green-500" size={18} />
      case 'active':
        return <LoaderIcon className="text-[#00B8D9] animate-spin" size={18} />
      case 'failed':
        return <XCircleIcon className="text-red-500" size={18} />
      default:
        return <ClockIcon className="text-zinc-500" size={18} />
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: 'bg-green-500/10 text-green-500 border-green-500/20',
      active: 'bg-[#00B8D9]/10 text-[#00B8D9] border-[#00B8D9]/20',
      failed: 'bg-red-500/10 text-red-500 border-red-500/20',
      pending: 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20',
    }

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles]}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  if (runs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-6xl mb-4">🚀</div>
        <h3 className="text-white text-xl font-semibold mb-2">No runs yet</h3>
        <p className="text-zinc-500 mb-6">
          Click "+ New Run" to start your first orchestration
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-zinc-800">
            <th className="text-left py-4 px-4 text-zinc-400 font-medium text-sm">
              Status
            </th>
            <th className="text-left py-4 px-4 text-zinc-400 font-medium text-sm">
              Run ID
            </th>
            <th className="text-left py-4 px-4 text-zinc-400 font-medium text-sm">
              Fork Name
            </th>
            <th className="text-left py-4 px-4 text-zinc-400 font-medium text-sm">
              Progress
            </th>
            <th className="text-left py-4 px-4 text-zinc-400 font-medium text-sm">
              Started
            </th>
            <th className="text-left py-4 px-4 text-zinc-400 font-medium text-sm">
              Duration
            </th>
            <th className="text-left py-4 px-4 text-zinc-400 font-medium text-sm"></th>
          </tr>
        </thead>
        <tbody>
          {runs.map((run) => (
            <tr
              key={run.id}
              className="border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors cursor-pointer"
              onClick={() => navigate(`/run/${run.id}`)}
            >
              <td className="py-4 px-4">
                <div className="flex items-center gap-2">
                  {getStatusIcon(run.status)}
                  {getStatusBadge(run.status)}
                </div>
              </td>
              <td className="py-4 px-4">
                <span className="text-white font-mono text-sm">{run.id}</span>
              </td>
              <td className="py-4 px-4">
                <span className="text-zinc-300">{run.forkName}</span>
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-300 text-sm">
                    {run.agentsCompleted}/{run.totalAgents}
                  </span>
                  <div className="w-24 h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#00B8D9] transition-all"
                      style={{
                        width: `${(run.agentsCompleted / run.totalAgents) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </td>
              <td className="py-4 px-4">
                <span className="text-zinc-400 text-sm">
                  {new Date(run.startedAt).toLocaleString()}
                </span>
              </td>
              <td className="py-4 px-4">
                <span className="text-zinc-400 text-sm">
                  {run.duration || 'In progress'}
                </span>
              </td>
              <td className="py-4 px-4">
                <button
                  className="text-[#00B8D9] hover:text-[#00a5c3] text-sm font-medium"
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate(`/run/${run.id}`)
                  }}
                >
                  View Details →
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
