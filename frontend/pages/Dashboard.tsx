import React, { useState, useEffect } from 'react'
import { Navbar } from '../components/Navbar'
import { RunTable } from '../components/RunTable'
import { NewRunModal } from '../components/NewRunModal'
import { TableLoader } from '../components/LoadingSpinner'
import { InlineError } from '../components/ErrorDisplay'
import { mockRuns } from '../data/mockData'
import { runsAPI } from '../lib/api'
import { Search as SearchIcon } from 'lucide-react'

export function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [runs, setRuns] = useState(mockRuns)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load runs from API on mount
  useEffect(() => {
    loadRuns()
  }, [])

  const loadRuns = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await runsAPI.list()
      if (response.data.success && response.data.data.length > 0) {
        // Cast the API response to the same shape as mockRuns to satisfy the state type
        setRuns(response.data.data as unknown as typeof mockRuns)
      }
    } catch (error) {
      console.error('Failed to load runs:', error)
      setError('Failed to load runs from server. Using demo data.')
      // Keep using mock data if API fails
    } finally {
      setLoading(false)
    }
  }

  const handleNewRun = async (data: { dataset: string; question: string }) => {
    console.log('Creating new run:', data)
    const response = await runsAPI.create({
      question: data.question || 'Analyze database performance and suggest optimizations',
      serviceId: data.dataset,
    })
    if (response.data.success) {
      await loadRuns()
    }
  }

  const filteredRuns = runs.filter((run) => {
    const matchesSearch =
      run.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      run.forkName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || run.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="flex-1 flex flex-col bg-black min-h-screen">
      <Navbar onNewRun={() => setIsModalOpen(true)} />

      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex-1 relative">
              <SearchIcon
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                size={18}
              />
              <input
                type="text"
                placeholder="Search runs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-[#00B8D9]"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'active', 'completed', 'failed'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${statusFilter === status ? 'bg-[#00B8D9] text-white' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'}`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="mb-4">
              <InlineError 
                title="Connection Issue"
                message={error}
                onRetry={loadRuns}
              />
            </div>
          )}

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
            {loading ? (
              <TableLoader text="Loading runs..." />
            ) : (
              <RunTable runs={filteredRuns} />
            )}
          </div>
        </div>
      </div>

      <NewRunModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleNewRun}
      />
    </div>
  )
}
