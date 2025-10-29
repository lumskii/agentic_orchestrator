import { useState } from 'react';
import { questionsAPI } from '../lib/api';

export default function SearchPanel() {
  const [question, setQuestion] = useState('');
  const [method, setMethod] = useState<'bm25' | 'vector' | 'hybrid'>('hybrid');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSearch = async () => {
    if (!question.trim()) return;

    try {
      setLoading(true);
      const response = await questionsAPI.ask({ question, method });
      if (response.data.success) {
        setResult(response.data.data);
      }
    } catch (error) {
      console.error('Search failed:', error);
      alert('Search failed. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Search Input */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">🔍 Hybrid Search</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Search Method</label>
            <div className="flex space-x-3">
              {(['bm25', 'vector', 'hybrid'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMethod(m)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    method === m
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {m.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Question</label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What are zero-copy database forks?"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            />
          </div>

          <button
            onClick={handleSearch}
            disabled={loading || !question.trim()}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        <div className="mt-6 space-y-3">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="font-medium text-sm mb-2">📊 BM25 (Keyword)</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Full-text search using term frequency and inverse document frequency
            </p>
          </div>

          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <h3 className="font-medium text-sm mb-2">🧠 Vector (Semantic)</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Semantic search using OpenAI embeddings and cosine similarity
            </p>
          </div>

          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <h3 className="font-medium text-sm mb-2">⚡ Hybrid (RRF)</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Combines BM25 and vector search using Reciprocal Rank Fusion
            </p>
          </div>
        </div>
      </div>

      {/* Search Results */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Results</h2>

        {!result ? (
          <p className="text-gray-500 text-center py-8">
            Enter a question and click Search to see results
          </p>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <p className="text-sm font-medium text-gray-500 mb-2">Answer</p>
              <p className="text-sm">{result.answer}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500 mb-3">
                Top Sources ({result.sources?.length || 0})
              </p>
              <div className="space-y-3">
                {result.sources?.map((source: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-medium text-gray-500">
                        Document #{source.id}
                      </span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Score: {source.hybridScore.toFixed(4)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {source.content}...
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500">
                Search method: <span className="font-medium">{result.method}</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
