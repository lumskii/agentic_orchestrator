import { useState } from 'react';
import type { Run } from '../lib/api';

interface RunsPanelProps {
  runs: Run[];
  onRefresh: () => void;
}

export default function RunsPanel({ runs, onRefresh }: RunsPanelProps) {
  const [selectedRun, setSelectedRun] = useState<Run | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'running':
        return 'text-blue-600 bg-blue-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Runs List */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Runs</h2>
          <button onClick={onRefresh} className="text-primary hover:text-blue-600">
            🔄 Refresh
          </button>
        </div>

        <div className="space-y-3">
          {runs.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No runs yet. Start one to begin!</p>
          ) : (
            runs.map((run) => (
              <div
                key={run.id}
                onClick={() => setSelectedRun(run)}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedRun?.id === run.id
                    ? 'border-primary bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{run.id.substring(0, 8)}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(run.startTime).toLocaleString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(run.status)}`}>
                    {run.status}
                  </span>
                </div>
                {run.metadata.question && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    {run.metadata.question}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Run Details */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Run Details</h2>

        {!selectedRun ? (
          <p className="text-gray-500 text-center py-8">Select a run to view details</p>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Run ID</p>
              <p className="mt-1">{selectedRun.id}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">Status</p>
              <span className={`mt-1 inline-block px-3 py-1 rounded text-sm font-medium ${getStatusColor(selectedRun.status)}`}>
                {selectedRun.status}
              </span>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">Question</p>
              <p className="mt-1">{selectedRun.metadata.question || 'N/A'}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">Execution Timeline</p>
              <div className="mt-2 space-y-2">
                {selectedRun.steps.map((step, idx) => (
                  <div key={idx} className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      step.status === 'completed' ? 'bg-green-500' :
                      step.status === 'running' ? 'bg-blue-500' :
                      step.status === 'failed' ? 'bg-red-500' : 'bg-gray-300'
                    }`} />
                    <span className="text-sm">{step.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {selectedRun.metadata.result && (
              <div>
                <p className="text-sm font-medium text-gray-500">Result</p>
                <pre className="mt-1 text-xs bg-gray-100 dark:bg-gray-900 p-3 rounded overflow-auto max-h-64">
                  {JSON.stringify(selectedRun.metadata.result, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
