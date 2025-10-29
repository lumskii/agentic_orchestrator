import React, { useState } from 'react'
import { Navbar } from '../components/Navbar'
import { mockSearchResults } from '../data/mockData'
import { Search as SearchIcon } from 'lucide-react'
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
    'semantic' | 'keyword' | 'hybrid'
  >('hybrid')
  const [activeTab, setActiveTab] = useState<'bm25' | 'vector' | 'hybrid'>(
    'hybrid',
  )

  const filteredResults = mockSearchResults.filter((r) => {
    if (activeTab === 'bm25') return r.type === 'bm25' || r.type === 'hybrid'
    if (activeTab === 'vector')
      return r.type === 'vector' || r.type === 'hybrid'
    return true
  })

  const comparisonData = [
    {
      metric: 'Precision',
      BM25: 0.72,
      Vector: 0.85,
      Hybrid: 0.92,
    },
    {
      metric: 'Recall',
      BM25: 0.68,
      Vector: 0.78,
      Hybrid: 0.88,
    },
    {
      metric: 'F1 Score',
      BM25: 0.7,
      Vector: 0.81,
      Hybrid: 0.9,
    },
    {
      metric: 'Speed',
      BM25: 0.95,
      Vector: 0.65,
      Hybrid: 0.8,
    },
  ]

  return (
    <div className="flex-1 flex flex-col bg-black min-h-screen">
      <Navbar />

      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-white text-3xl font-semibold mb-2">
              Hybrid Search Demo
            </h1>
            <p className="text-zinc-400">
              Compare BM25, Vector, and Hybrid search approaches
            </p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-6">
            <div className="flex gap-4 mb-4">
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
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-12 pr-4 py-3 text-white focus:outline-none focus:border-[#00B8D9]"
                />
              </div>
              <div className="flex gap-2 bg-zinc-800 p-1 rounded-lg">
                {(['semantic', 'keyword', 'hybrid'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setSearchMode(mode)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${searchMode === mode ? 'bg-[#00B8D9] text-white' : 'text-zinc-400 hover:text-white'}`}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <h2 className="text-white text-xl font-semibold mb-4">
                Performance Comparison
              </h2>
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
              <h2 className="text-white text-xl font-semibold mb-4">
                Search Quality Radar
              </h2>
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
            <div className="border-b border-zinc-800 p-4 flex gap-2">
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
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2 py-1 rounded ${result.type === 'hybrid' ? 'bg-[#00B8D9]/10 text-[#00B8D9] border border-[#00B8D9]/20' : result.type === 'vector' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}
                      >
                        {result.type.toUpperCase()}
                      </span>
                      <span className="text-xs text-zinc-500">
                        Rank #{index + 1}
                      </span>
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
