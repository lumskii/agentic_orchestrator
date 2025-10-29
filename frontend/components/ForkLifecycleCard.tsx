import React from 'react'
import { GitBranch as GitBranchIcon, Play as PlayIcon, Trash as TrashIcon } from 'lucide-react'
import { motion } from 'framer-motion'

interface ForkLifecycleCardProps {
  forkName: string
  forkServiceId: string
  status: string
}

export function ForkLifecycleCard({
  forkName,
  forkServiceId,
  status,
}: ForkLifecycleCardProps) {
  const stages = [
    {
      label: 'Fork Created',
      icon: GitBranchIcon,
      completed: true,
    },
    {
      label: 'Work in Progress',
      icon: PlayIcon,
      completed: status === 'active' || status === 'completed',
    },
    {
      label: 'Fork Deleted',
      icon: TrashIcon,
      completed: status === 'completed',
    },
  ]

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
      <h3 className="text-white font-semibold text-lg mb-2">Fork Lifecycle</h3>
      <p className="text-zinc-400 text-sm mb-6">
        <span className="font-mono">{forkName}</span> • {forkServiceId}
      </p>

      <div className="flex items-center justify-between relative">
        {/* Progress line */}
        <div className="absolute top-6 left-0 right-0 h-0.5 bg-zinc-800" />
        <motion.div
          initial={{
            width: 0,
          }}
          animate={{
            width:
              status === 'completed'
                ? '100%'
                : status === 'active'
                  ? '50%'
                  : '33%',
          }}
          transition={{
            duration: 1,
          }}
          className="absolute top-6 left-0 h-0.5 bg-[#00B8D9]"
        />

        {stages.map((stage, index) => {
          const Icon = stage.icon
          return (
            <div
              key={index}
              className="flex flex-col items-center gap-2 relative z-10"
            >
              <motion.div
                initial={{
                  scale: 0,
                }}
                animate={{
                  scale: 1,
                }}
                transition={{
                  delay: index * 0.2,
                }}
                className={`w-12 h-12 rounded-full flex items-center justify-center ${stage.completed ? 'bg-[#00B8D9] text-white' : 'bg-zinc-800 text-zinc-500'}`}
              >
                <Icon size={20} />
              </motion.div>
              <span
                className={`text-sm ${stage.completed ? 'text-white' : 'text-zinc-500'}`}
              >
                {stage.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
