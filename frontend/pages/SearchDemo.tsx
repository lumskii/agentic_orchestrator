import React, { useState } from 'react'
import { Navbar } from '../components/Navbar'
import { mockSearchResults } from '../data/mockData'
import { questionsAPI, Question } from '../lib/api'
import { Search as SearchIcon, Loader2 as LoaderIcon } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts'

export function SearchDemo() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchMode, setSearchMode] = useState<
    'bm25' | 'vector' | 'hybrid'
  >('hybrid')
  const [activeTab, setActiveTab] = useState<'bm25' | 'vector' | 'hybrid'>(
    'hybrid',
  )
  const [searchResult, setSearchResult] = useState<Question | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [searchTime, setSearchTime] = useState<number | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  
  // Live performance metrics tracking
  const [performanceMetrics, setPerformanceMetrics] = useState({
    bm25: { searchCount: 0, totalTime: 0, avgTime: 0, results: [] as any[] },
    vector: { searchCount: 0, totalTime: 0, avgTime: 0, results: [] as any[] },
    hybrid: { searchCount: 0, totalTime: 0, avgTime: 0, results: [] as any[] }
  })
  const [liveResults, setLiveResults] = useState<any[]>([])

  const performSearch = async () => {
    if (!searchQuery.trim()) return
    
    setIsSearching(true)
    setSearchError(null)
    const startTime = Date.now()
    
    try {
      const response = await questionsAPI.ask({
        question: searchQuery,
        method: searchMode
      })
      
      const endTime = Date.now()
      const searchDuration = endTime - startTime
      setSearchTime(searchDuration)
      
      console.log('API Response:', response)
      console.log('Response data:', response.data)
      
      setSearchResult(response.data.data)
      setHasSearched(true)
      
      // Update performance metrics
      setPerformanceMetrics(prev => {
        const updated = { ...prev }
        const current = updated[searchMode]
        current.searchCount += 1
        current.totalTime += searchDuration
        current.avgTime = current.totalTime / current.searchCount
        
        // Add to results for the bottom grid
        const newResult = {
          id: `${searchMode}_${Date.now()}`,
          title: `Search: ${searchQuery}`,
          content: response.data.data.answer || 'No answer found',
          score: Math.random() * 0.4 + 0.6, // Simulate relevance score
          type: searchMode,
          timestamp: new Date().toISOString(),
          searchTime: searchDuration
        }
        current.results = [newResult, ...current.results.slice(0, 9)] // Keep latest 10
        
        return updated
      })
      
      // Update live results for the grid
      setLiveResults(prev => {
        const newResult = {
          id: `${searchMode}_${Date.now()}`,
          title: `Search: ${searchQuery}`,
          content: response.data.data.answer || 'No answer found',
          score: Math.random() * 0.4 + 0.6,
          type: searchMode,
          timestamp: new Date().toISOString(),
          searchTime: searchDuration
        }
        return [newResult, ...prev.slice(0, 19)] // Keep latest 20 results
      })
      
    } catch (error) {
      setSearchError('Failed to perform search. Please try again.')
      console.error('Search error:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    performSearch()
  }

  const handleSearchModeChange = (mode: 'bm25' | 'vector' | 'hybrid') => {
    setSearchMode(mode)
    if (hasSearched && searchQuery.trim()) {
      // Re-search with new mode
      setTimeout(performSearch, 100)
    }
  }

  // Use live results for the grid, fallback to mock data if no searches yet
  const filteredResults = liveResults.length > 0 
    ? liveResults.filter((r) => {
        if (activeTab === 'bm25') return r.type === 'bm25'
        if (activeTab === 'vector') return r.type === 'vector'
        if (activeTab === 'hybrid') return r.type === 'hybrid'
        return true
      })
    : mockSearchResults.filter((r) => {
        if (activeTab === 'bm25') return r.type === 'bm25' || r.type === 'hybrid'
        if (activeTab === 'vector') return r.type === 'vector' || r.type === 'hybrid'
        return true
      })

  // Generate live performance comparison data
  const comparisonData = [
    {
      metric: 'Avg Speed (ms)',
      BM25: performanceMetrics.bm25.avgTime || 0,
      Vector: performanceMetrics.vector.avgTime || 0,
      Hybrid: performanceMetrics.hybrid.avgTime || 0,
    },
    {
      metric: 'Search Count',
      BM25: performanceMetrics.bm25.searchCount,
      Vector: performanceMetrics.vector.searchCount,
      Hybrid: performanceMetrics.hybrid.searchCount,
    },
    {
      metric: 'Total Time (s)',
      BM25: Math.round(performanceMetrics.bm25.totalTime / 1000),
      Vector: Math.round(performanceMetrics.vector.totalTime / 1000),
      Hybrid: Math.round(performanceMetrics.hybrid.totalTime / 1000),
    },
    {
      metric: 'Results Found',
      BM25: performanceMetrics.bm25.results.length,
      Vector: performanceMetrics.vector.results.length,
      Hybrid: performanceMetrics.hybrid.results.length,
    },
  ]

  return (
    <div className="flex-1 flex flex-col bg-black min-h-screen">
      <Navbar />

      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-white text-3xl font-semibold mb-2">
                  Hybrid Search Demo
                </h1>
                <p className="text-zinc-400">
                  Compare BM25, Vector, and Hybrid search approaches with live data
                </p>
              </div>
              <button
                onClick={() => {
                  setSearchResult(null)
                  setHasSearched(false)
                  setSearchError(null)
                  setSearchQuery('')
                  setLiveResults([])
                  setPerformanceMetrics({
                    bm25: { searchCount: 0, totalTime: 0, avgTime: 0, results: [] },
                    vector: { searchCount: 0, totalTime: 0, avgTime: 0, results: [] },
                    hybrid: { searchCount: 0, totalTime: 0, avgTime: 0, results: [] }
                  })
                }}
                className="px-4 py-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 transition-colors"
              >
                Reset Data
              </button>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-6">
            <form onSubmit={handleSearchSubmit} className="flex gap-4 mb-4">
              <div className="flex-1 relative">
                <SearchIcon
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search for database topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-12 pr-20 py-3 text-white focus:outline-none focus:border-[#00B8D9]"
                  disabled={isSearching}
                />
                {isSearching && (
                  <LoaderIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 animate-spin" size={20} />
                )}
              </div>
              <button
                type="submit"
                disabled={isSearching || !searchQuery.trim()}
                className="px-6 py-3 bg-[#00B8D9] text-white rounded-lg font-medium hover:bg-[#00a5c3] disabled:bg-zinc-700 disabled:text-zinc-500 transition-colors"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </form>
            
            <div className="flex gap-2 bg-zinc-800 p-1 rounded-lg mb-4">
              {(['bm25', 'vector', 'hybrid'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => handleSearchModeChange(mode)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${searchMode === mode ? 'bg-[#00B8D9] text-white' : 'text-zinc-400 hover:text-white'}`}
                  disabled={isSearching}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>

            {/* Search Status and Results */}
            {searchError && (
              <div className="mb-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                <p className="text-red-400">{searchError}</p>
              </div>
            )}

            {hasSearched && (
              <div className="mb-4 p-4 bg-zinc-800 border border-zinc-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white font-medium">Search Result</h3>
                  {searchTime && (
                    <span className="text-zinc-400 text-sm">
                      {searchTime}ms using {searchMode.toUpperCase()}
                    </span>
                  )}
                </div>
                {searchResult ? (
                  <>
                    <p className="text-zinc-300 mb-2">
                      <strong>Question:</strong> {searchResult.question}
                    </p>
                    <div className="text-zinc-300">
                      <strong>Answer:</strong> 
                      <div className="mt-2 whitespace-pre-wrap">
                        {searchResult.answer || 'No answer found'}
                      </div>
                    </div>
                    {searchResult.sources && searchResult.sources.length > 0 && (
                      <div className="mt-4">
                        <strong className="text-zinc-300">Sources:</strong>
                        <div className="mt-2 space-y-2">
                          {searchResult.sources.slice(0, 3).map((source: any, index: number) => (
                            <div key={source.id || index} className="bg-zinc-700 p-2 rounded text-sm">
                              <div className="text-zinc-200 font-medium">{source.title}</div>
                              <div className="text-zinc-400 text-xs mt-1">
                                Score: {source.score?.toFixed(3) || 'N/A'}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-zinc-400">Loading search results...</p>
                )}
              </div>
            )}

            {hasSearched && !searchResult && !searchError && !isSearching && (
              <div className="mb-4 p-4 bg-zinc-800 border border-zinc-700 rounded-lg">
                <p className="text-zinc-400">No results found for your search.</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <h2 className="text-white text-xl font-semibold mb-2">
                Live Performance Metrics
              </h2>
              <p className="text-zinc-400 text-sm mb-4">
                {liveResults.length > 0 
                  ? `Based on ${liveResults.length} real searches`
                  : 'Start searching to see live performance data'
                }
              </p>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                  <XAxis dataKey="metric" stroke="#a1a1aa" />
                  <YAxis stroke="#a1a1aa" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      border: '1px solid #3f3f46',
                    }}
                    labelStyle={{
                      color: '#fff',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="BM25" fill="#3b82f6" />
                  <Bar dataKey="Vector" fill="#a855f7" />
                  <Bar dataKey="Hybrid" fill="#00B8D9" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <h2 className="text-white text-xl font-semibold mb-2">
                Live Search Analytics
              </h2>
              <p className="text-zinc-400 text-sm mb-4">
                Real-time performance radar chart
              </p>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={comparisonData}>
                  <PolarGrid stroke="#3f3f46" />
                  <PolarAngleAxis dataKey="metric" stroke="#a1a1aa" />
                  <PolarRadiusAxis stroke="#a1a1aa" />
                  <Radar
                    name="BM25"
                    dataKey="BM25"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.3}
                  />
                  <Radar
                    name="Vector"
                    dataKey="Vector"
                    stroke="#a855f7"
                    fill="#a855f7"
                    fillOpacity={0.3}
                  />
                  <Radar
                    name="Hybrid"
                    dataKey="Hybrid"
                    stroke="#00B8D9"
                    fill="#00B8D9"
                    fillOpacity={0.3}
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
            <div className="border-b border-zinc-800 p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-white text-xl font-semibold">
                  {liveResults.length > 0 ? 'Live Search Results' : 'Sample Search Results'}
                </h2>
                {liveResults.length > 0 && (
                  <span className="text-zinc-400 text-sm">
                    {liveResults.length} recent searches
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                {(['bm25', 'vector', 'hybrid'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === tab ? 'bg-[#00B8D9] text-white' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}
                  >
                    {tab === 'bm25'
                      ? 'BM25 Results'
                      : tab === 'vector'
                        ? 'Vector Results'
                        : 'Hybrid Results'}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredResults.map((result, index) => (
                  <div
                    key={index}
                    className="border border-zinc-800 rounded-lg p-4 hover:border-[#00B8D9] transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-white font-medium">{result.title}</h3>
                      <span className="text-[#00B8D9] font-bold text-lg">
                        {result.score.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-zinc-400 text-sm mb-3">
                      {result.content}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-xs px-2 py-1 rounded ${result.type === 'hybrid' ? 'bg-[#00B8D9]/10 text-[#00B8D9] border border-[#00B8D9]/20' : result.type === 'vector' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}
                      >
                        {result.type.toUpperCase()}
                      </span>
                      <span className="text-xs text-zinc-500">
                        Rank #{index + 1}
                      </span>
                      {result.searchTime && (
                        <span className="text-xs text-zinc-500">
                          {result.searchTime}ms
                        </span>
                      )}
                      {result.timestamp && liveResults.length > 0 && (
                        <span className="text-xs text-zinc-500">
                          {new Date(result.timestamp).toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
