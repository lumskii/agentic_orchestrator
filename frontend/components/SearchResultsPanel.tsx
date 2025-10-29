import React from 'react'
import { SearchResult } from '../types'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface SearchResultsPanelProps {
  results: SearchResult[]
}

export function SearchResultsPanel({ results }: SearchResultsPanelProps) {
  const chartData = results.slice(0, 5).map((r) => ({
    name: r.title.slice(0, 20) + '...',
    score: r.score,
  }))

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
      <h3 className="text-white font-semibold text-lg mb-4">
        Hybrid Search Results
      </h3>

      <div className="mb-6">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
            <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} />
            <YAxis stroke="#a1a1aa" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#18181b',
                border: '1px solid #3f3f46',
              }}
              labelStyle={{
                color: '#fff',
              }}
            />
            <Bar dataKey="score" fill="#00B8D9" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {results.map((result, index) => (
          <div
            key={index}
            className="border border-zinc-800 rounded-lg p-4 hover:border-[#00B8D9] transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="text-white font-medium text-sm">{result.title}</h4>
              <span className="text-[#00B8D9] font-semibold text-sm">
                {result.score.toFixed(2)}
              </span>
            </div>
            <p className="text-zinc-400 text-xs mb-2">{result.content}</p>
            <span
              className={`text-xs px-2 py-1 rounded ${result.type === 'hybrid' ? 'bg-[#00B8D9]/10 text-[#00B8D9]' : result.type === 'vector' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}
            >
              {result.type.toUpperCase()}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
