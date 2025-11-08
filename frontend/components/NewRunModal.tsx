import React, { useState } from 'react'
import { X as XIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface NewRunModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { dataset: string; question: string }) => Promise<void>
}

export function NewRunModal({ isOpen, onClose, onSubmit }: NewRunModalProps) {
  const [dataset, setDataset] = useState('sample-analytics')
  const [question, setQuestion] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return
    
    try {
      setIsSubmitting(true)
      await onSubmit({
        dataset,
        question,
      })
      onClose()
      // Reset form
      setDataset('sample-analytics')
      setQuestion('')
    } catch (error) {
      console.error('Failed to create run:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.95,
              y: 20,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.95,
              y: 20,
            }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl z-50"
          >
            <div className="flex items-center justify-between p-6 border-b border-zinc-800">
              <h2 className="text-white text-xl font-semibold">
                Create New Run
              </h2>
              <button
                onClick={onClose}
                className="text-zinc-400 hover:text-white"
              >
                <XIcon size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-zinc-300 text-sm font-medium mb-2">
                  Dataset
                </label>
                <select
                  value={dataset}
                  onChange={(e) => setDataset(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#00B8D9]"
                >
                  <option value="sample-analytics">
                    Sample Analytics Data
                  </option>
                  <option value="customer-data">Customer Database</option>
                  <option value="sales-records">Sales Records</option>
                  <option value="ml-training">ML Training Set</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-300 text-sm font-medium mb-2">
                  Analysis Question (Optional)
                </label>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="What insights would you like to discover?"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#00B8D9] resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-[#00B8D9] text-white rounded-lg hover:bg-[#00a5c3] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Starting...
                    </>
                  ) : (
                    'Start Run'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
