import React, { useState } from 'react'
import { ChevronDown as ChevronDownIcon, ChevronUp as ChevronUpIcon, Terminal as TerminalIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ConsoleLogPanelProps {
  logs: string[]
}

export function ConsoleLogPanel({ logs }: ConsoleLogPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <TerminalIcon className="text-[#00B8D9]" size={20} />
          <h3 className="text-white font-semibold">Console Output</h3>
          <span className="text-zinc-500 text-sm">({logs.length} entries)</span>
        </div>
        {isExpanded ? (
          <ChevronUpIcon size={20} className="text-zinc-400" />
        ) : (
          <ChevronDownIcon size={20} className="text-zinc-400" />
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{
              height: 0,
            }}
            animate={{
              height: 'auto',
            }}
            exit={{
              height: 0,
            }}
            className="overflow-hidden"
          >
            <div className="bg-black p-4 max-h-96 overflow-y-auto font-mono text-sm">
              {logs.map((log, index) => (
                <motion.div
                  key={index}
                  initial={{
                    opacity: 0,
                    x: -10,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  transition={{
                    delay: index * 0.05,
                  }}
                  className="text-green-400 mb-1"
                >
                  {log}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
