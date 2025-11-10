import React from 'react'
import { 
  TrendingUp as TrendingUpIcon,
  Database as DatabaseIcon, 
  Zap as ZapIcon,
  CheckCircle as CheckCircleIcon,
  AlertTriangle as AlertTriangleIcon,
  BarChart3 as BarChart3Icon,
  Clock as ClockIcon
} from 'lucide-react'
import type { Run } from '../types'

interface ReportResultsPanelProps {
  run: Run
}

export function ReportResultsPanel({ run }: ReportResultsPanelProps) {
  // Extract results from run metadata
  const results = (run as any).metadata?.result || {}
  const { analyst, dba, etl, search } = results

  if (!analyst && !dba && !etl && !search) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <h3 className="text-white text-lg font-semibold mb-4">Report Results</h3>
        <p className="text-zinc-400">No detailed results available for this run.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Main Question and Summary */}
      {results.question && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <h3 className="text-white text-lg font-semibold mb-2">📋 Analysis Question</h3>
          <p className="text-zinc-300 bg-zinc-800 p-3 rounded-lg italic">"{results.question}"</p>
        </div>
      )}

      {/* ETL Results */}
      {etl && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <DatabaseIcon className="text-blue-400" size={20} />
            <h3 className="text-white text-lg font-semibold">Data Processing Results</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-zinc-800 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-400">{etl.recordsExtracted || 0}</div>
              <div className="text-sm text-zinc-400">Records Extracted</div>
            </div>
            <div className="bg-zinc-800 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-400">{etl.recordsTransformed || 0}</div>
              <div className="text-sm text-zinc-400">Records Transformed</div>
            </div>
            <div className="bg-zinc-800 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-400">{etl.recordsLoaded || 0}</div>
              <div className="text-sm text-zinc-400">Records Loaded</div>
            </div>
          </div>

          {etl.sampleData && etl.sampleData.length > 0 && (
            <div>
              <h4 className="text-zinc-300 font-medium mb-2">Sample Processed Data:</h4>
              <div className="bg-zinc-800 p-3 rounded-lg max-h-40 overflow-y-auto">
                {etl.sampleData.slice(0, 3).map((item: any, index: number) => (
                  <div key={index} className="text-sm text-zinc-300 mb-2">
                    <span className="text-green-400">{item.name}</span> - {item.category} ({item.priority} priority)
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search Results */}
      {search && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <ZapIcon className="text-yellow-400" size={20} />
            <h3 className="text-white text-lg font-semibold">Search Context Results</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-zinc-800 p-4 rounded-lg">
              <div className="text-2xl font-bold text-yellow-400">{search.resultsCount || 0}</div>
              <div className="text-sm text-zinc-400">Relevant Sources Found</div>
            </div>
            <div className="bg-zinc-800 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-400">
                {search.topResults?.[0]?.hybridScore ? (search.topResults[0].hybridScore * 100).toFixed(0) + '%' : 'N/A'}
              </div>
              <div className="text-sm text-zinc-400">Top Relevance Score</div>
            </div>
          </div>

          {search.topResults && search.topResults.length > 0 && (
            <div>
              <h4 className="text-zinc-300 font-medium mb-2">Top Relevant Sources:</h4>
              <div className="space-y-2">
                {search.topResults.slice(0, 2).map((result: any, index: number) => (
                  <div key={index} className="bg-zinc-800 p-3 rounded-lg">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-sm font-medium text-green-400">Source {index + 1}</span>
                      <span className="text-xs text-zinc-400">{(result.hybridScore * 100).toFixed(0)}% match</span>
                    </div>
                    <p className="text-sm text-zinc-300">{result.content.substring(0, 120)}...</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Analyst Insights */}
      {analyst && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3Icon className="text-purple-400" size={20} />
            <h3 className="text-white text-lg font-semibold">Analysis & Insights</h3>
            {analyst.confidence && (
              <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">
                {(analyst.confidence * 100).toFixed(0)}% confidence
              </span>
            )}
          </div>

          {analyst.insights && analyst.insights.length > 0 && (
            <div className="mb-6">
              <h4 className="text-zinc-300 font-medium mb-3 flex items-center gap-2">
                <TrendingUpIcon size={16} className="text-green-400" />
                Key Insights
              </h4>
              <div className="space-y-2">
                {analyst.insights.map((insight: string, index: number) => (
                  <div key={index} className="flex items-start gap-3 bg-zinc-800 p-3 rounded-lg">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-zinc-300">{insight}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {analyst.recommendations && analyst.recommendations.length > 0 && (
            <div>
              <h4 className="text-zinc-300 font-medium mb-3 flex items-center gap-2">
                <CheckCircleIcon size={16} className="text-blue-400" />
                Recommendations
              </h4>
              <div className="space-y-2">
                {analyst.recommendations.map((rec: any, index: number) => (
                  <div key={index} className="bg-zinc-800 p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-blue-400">
                        {rec.action?.replace('_', ' ')?.toUpperCase()} - {rec.table}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        rec.priority === 'high' ? 'bg-red-500/20 text-red-300' :
                        rec.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-green-500/20 text-green-300'
                      }`}>
                        {rec.priority} priority
                      </span>
                    </div>
                    {rec.column && (
                      <p className="text-xs text-zinc-400">Target: {rec.column}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* DBA Performance Results */}
      {dba && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <ZapIcon className="text-orange-400" size={20} />
            <h3 className="text-white text-lg font-semibold">Performance Improvements</h3>
          </div>

          {dba.performanceMetrics && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-zinc-800 p-4 rounded-lg">
                <div className="text-2xl font-bold text-red-400">{dba.performanceMetrics.queryTime?.before || 0}ms</div>
                <div className="text-sm text-zinc-400">Query Time (Before)</div>
              </div>
              <div className="bg-zinc-800 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-400">{dba.performanceMetrics.queryTime?.after || 0}ms</div>
                <div className="text-sm text-zinc-400">Query Time (After)</div>
              </div>
              <div className="bg-zinc-800 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-400">{dba.performanceMetrics.queryTime?.improvement || '0%'}</div>
                <div className="text-sm text-zinc-400">Performance Gain</div>
              </div>
            </div>
          )}

          {dba.appliedChanges && dba.appliedChanges.length > 0 && (
            <div>
              <h4 className="text-zinc-300 font-medium mb-3 flex items-center gap-2">
                <CheckCircleIcon size={16} className="text-green-400" />
                Applied Changes ({dba.appliedChanges.length})
              </h4>
              <div className="space-y-2">
                {dba.appliedChanges.map((change: any, index: number) => (
                  <div key={index} className="bg-zinc-800 p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-green-400">
                        {change.action?.replace('_', ' ')?.toUpperCase()}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-green-300">✓ Applied</span>
                        <ClockIcon size={12} className="text-zinc-400" />
                        <span className="text-xs text-zinc-400">
                          {new Date(change.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-400">
                      Table: {change.table} | Priority: {change.priority}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}