import React from 'react'
import { Agent } from '../types'
import {
  CheckCircle as CheckCircleIcon,
  Loader as LoaderIcon,
  Circle as CircleIcon,
  XCircle as XCircleIcon,
} from 'lucide-react'
import { motion } from 'framer-motion'

interface AgentProgressCardProps {
  agent: Agent
  index: number
}

export function AgentProgressCard({ agent, index }: AgentProgressCardProps) {
  const getStatusIcon = () => {
    switch (agent.status) {
      case 'completed':
        return <CheckCircleIcon className="text-green-500" size={24} />
      case 'running':
        return <LoaderIcon className="text-[#00B8D9] animate-spin" size={24} />
      case 'failed':
        return <XCircleIcon className="text-red-500" size={24} />
      default:
        return <CircleIcon className="text-zinc-600" size={24} />
    }
  }

  const getStatusColor = () => {
    switch (agent.status) {
      case 'completed':
        return 'border-green-500 bg-green-500/10'
      case 'running':
        return 'border-[#00B8D9] bg-[#00B8D9]/10'
      case 'failed':
        return 'border-red-500 bg-red-500/10'
      default:
        return 'border-zinc-700 bg-zinc-800/50'
    }
  }

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        delay: index * 0.1,
      }}
      className={`border rounded-lg p-4 ${getStatusColor()}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{agent.icon}</span>
          <div>
            <h4 className="text-white font-semibold">{agent.name}</h4>
            <p className="text-zinc-400 text-sm capitalize">{agent.status}</p>
          </div>
        </div>
        {getStatusIcon()}
      </div>

      {agent.status !== 'pending' && (
        <div className="space-y-2">
          <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
            <motion.div
              initial={{
                width: 0,
              }}
              animate={{
                width: `${agent.progress}%`,
              }}
              transition={{
                duration: 0.5,
              }}
              className="h-full bg-[#00B8D9]"
            />
          </div>
          <div className="flex justify-between text-xs text-zinc-500">
            <span>{agent.progress}% complete</span>
            {agent.completedAt && (
              <span>
                Completed: {new Date(agent.completedAt).toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
      )}
    </motion.div>
  )
}
