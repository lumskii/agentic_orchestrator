import React, { useState, useRef } from 'react'
import { Navbar } from '../components/Navbar'
import { questionsAPI } from '../lib/api'
import { 
  Upload as UploadIcon, 
  File as FileIcon, 
  Database as DatabaseIcon,
  Key as KeyIcon,
  Settings as SettingsIcon,
  Trash2 as TrashIcon,
  Check as CheckIcon,
  AlertCircle as AlertIcon,
  Info as InfoIcon
} from 'lucide-react'

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  uploadedAt: string
  status: 'uploading' | 'processing' | 'indexed' | 'error'
  recordCount?: number
}

export function Settings() {
  const [activeTab, setActiveTab] = useState<'data' | 'knowledge' | 'api' | 'system'>('data')
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [dragOver, setDragOver] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [dbConnection, setDbConnection] = useState('')
  const [useTigerDB, setUseTigerDB] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const tabs = [
    { id: 'data' as const, label: 'Data Upload', icon: UploadIcon },
    { id: 'knowledge' as const, label: 'Knowledge Base', icon: DatabaseIcon },
    { id: 'api' as const, label: 'API Config', icon: KeyIcon },
    { id: 'system' as const, label: 'System', icon: SettingsIcon },
  ]

  const handleFileUpload = async (files: FileList) => {
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const fileId = `file_${Date.now()}_${i}`
      
      // Add file to uploaded files list
      const uploadedFile: UploadedFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
        status: 'uploading'
      }
      
      setUploadedFiles(prev => [...prev, uploadedFile])
      
      // Simulate upload and processing
      try {
        // Update status to processing
        setUploadedFiles(prev => 
          prev.map(f => f.id === fileId ? { ...f, status: 'processing' as const } : f)
        )
        
        let recordCount = 0
        
        if (useTigerDB) {
          // Use TigerDB for file storage and processing
          const result = await uploadFileToTigerDB(file)
          recordCount = result.data.documentsExtracted
        } else {
          // Original browser-based processing
          const content = await readFileContent(file)
          
          // Process based on file type
          let documents = []
          if (file.type === 'application/json' || file.name.endsWith('.json')) {
            documents = processJsonFile(content)
          } else if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
            documents = processCsvFile(content)
          } else {
            documents = processTextFile(content, file.name)
          }
          
          // Index documents
          await indexDocuments(documents)
          recordCount = documents.length
        }
        
        // Update status to indexed
        setUploadedFiles(prev => 
          prev.map(f => f.id === fileId ? { 
            ...f, 
            status: 'indexed' as const,
            recordCount: recordCount 
          } : f)
        )
        
      } catch (error) {
        console.error('File processing error:', error)
        setUploadedFiles(prev => 
          prev.map(f => f.id === fileId ? { ...f, status: 'error' as const } : f)
        )
      }
    }
  }

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.onerror = reject
      reader.readAsText(file)
    })
  }

  const processJsonFile = (content: string) => {
    const data = JSON.parse(content)
    if (Array.isArray(data)) {
      return data.map(item => ({
        title: item.title || item.name || 'Untitled',
        content: item.content || item.description || JSON.stringify(item),
        metadata: { source: 'json_upload', ...item }
      }))
    } else {
      return [{
        title: data.title || data.name || 'JSON Document',
        content: data.content || data.description || JSON.stringify(data),
        metadata: { source: 'json_upload', ...data }
      }]
    }
  }

  const processCsvFile = (content: string) => {
    const lines = content.split('\n')
    const headers = lines[0].split(',').map(h => h.trim())
    const documents = []
    
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',').map(v => v.trim())
        const record: any = {}
        headers.forEach((header, index) => {
          record[header] = values[index] || ''
        })
        
        documents.push({
          title: record.title || record.name || `Row ${i}`,
          content: Object.entries(record).map(([k, v]) => `${k}: ${v}`).join('\n'),
          metadata: { source: 'csv_upload', row: i, ...record }
        })
      }
    }
    
    return documents
  }

  const processTextFile = (content: string, filename: string) => {
    // Split text into chunks for better indexing
    const chunks = content.split('\n\n').filter(chunk => chunk.trim().length > 0)
    
    return chunks.map((chunk, index) => ({
      title: `${filename} - Part ${index + 1}`,
      content: chunk.trim(),
      metadata: { source: 'text_upload', filename, part: index + 1 }
    }))
  }

  const indexDocuments = async (documents: any[]) => {
    // Index documents using the real API
    for (const doc of documents) {
      try {
        await questionsAPI.index({
          title: doc.title,
          content: doc.content,
          metadata: doc.metadata
        })
        // Small delay to prevent overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (error) {
        console.error('Failed to index document:', doc.title, error)
        throw error
      }
    }
  }

  const uploadFileToTigerDB = async (file: File): Promise<any> => {
    const content = await readFileContent(file)
    
    const response = await fetch('http://localhost:5000/api/files/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filename: file.name,
        content: content,
        mimeType: file.type || 'text/plain',
        metadata: {
          originalSize: file.size,
          lastModified: file.lastModified,
          uploadMethod: 'tiger_db'
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`)
    }

    return response.json()
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files) {
      handleFileUpload(e.dataTransfer.files)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading':
      case 'processing':
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      case 'indexed':
        return <CheckIcon className="w-4 h-4 text-green-500" />
      case 'error':
        return <AlertIcon className="w-4 h-4 text-red-500" />
    }
  }

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId))
  }

  return (
    <div className="flex-1 flex flex-col bg-black min-h-screen">
      <Navbar />
      
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-white text-3xl font-semibold mb-2">Settings</h1>
            <p className="text-zinc-400">
              Configure data sources, API settings, and system preferences
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-zinc-800 mb-6">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors border-b-2 ${
                    activeTab === tab.id
                      ? 'text-[#00B8D9] border-[#00B8D9]'
                      : 'text-zinc-400 border-transparent hover:text-white'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Data Upload Tab */}
          {activeTab === 'data' && (
            <div className="space-y-6">
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <h2 className="text-white text-xl font-semibold mb-4">Upload Data Files</h2>
                <p className="text-zinc-400 mb-4">
                  Upload CSV, JSON, or text files to be indexed and analyzed by the system.
                  Supported formats: .csv, .json, .txt, .md
                </p>
                
                {/* TigerDB Toggle */}
                <div className="mb-6 p-4 bg-zinc-800 border border-zinc-700 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-medium mb-1">🐅 TigerDB Native Storage</h3>
                      <p className="text-zinc-400 text-sm">
                        Store files directly in TigerDB with binary storage, analytics, and fork capabilities
                      </p>
                    </div>
                    <button
                      onClick={() => setUseTigerDB(!useTigerDB)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        useTigerDB ? 'bg-[#00B8D9]' : 'bg-zinc-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          useTigerDB ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  {useTigerDB && (
                    <div className="mt-3 text-xs text-green-400 flex items-center gap-1">
                      <CheckIcon className="w-3 h-3" />
                      <span>Enhanced: Binary storage, time-series analytics, zero-copy forks</span>
                    </div>
                  )}
                </div>
                
                {/* Upload Area */}
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragOver
                      ? 'border-[#00B8D9] bg-[#00B8D9]/5'
                      : 'border-zinc-700 hover:border-zinc-600'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <UploadIcon className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
                  <h3 className="text-white font-medium mb-2">
                    Drag and drop files here, or click to browse
                  </h3>
                  <p className="text-zinc-400 text-sm mb-4">
                    Maximum file size: 10MB per file
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-[#00B8D9] text-white rounded-lg hover:bg-[#00a5c3] transition-colors"
                  >
                    Choose Files
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".csv,.json,.txt,.md"
                    className="hidden"
                    onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                  />
                </div>
              </div>

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                  <h3 className="text-white text-lg font-semibold mb-4">Uploaded Files</h3>
                  <div className="space-y-3">
                    {uploadedFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <FileIcon className="w-5 h-5 text-zinc-400" />
                          <div>
                            <p className="text-white font-medium">{file.name}</p>
                            <p className="text-zinc-400 text-sm">
                              {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleString()}
                              {file.recordCount && ` • ${file.recordCount} records`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(file.status)}
                            <span className={`text-sm font-medium ${
                              file.status === 'indexed' ? 'text-green-500' :
                              file.status === 'error' ? 'text-red-500' : 'text-blue-500'
                            }`}>
                              {file.status === 'indexed' ? 'Indexed' :
                               file.status === 'error' ? 'Error' :
                               file.status === 'processing' ? 'Processing' : 'Uploading'}
                            </span>
                          </div>
                          <button
                            onClick={() => removeFile(file.id)}
                            className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-700 rounded-lg transition-colors"
                          >
                            <TrashIcon size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Knowledge Base Tab */}
          {activeTab === 'knowledge' && (
            <div className="space-y-6">
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <h2 className="text-white text-xl font-semibold mb-4">Knowledge Base Management</h2>
                <p className="text-zinc-400 mb-6">
                  Manage indexed documents and add sample data for testing and demonstration.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => {
                      // Add sample database documents
                      const sampleDocs = [
                        {
                          title: "Advanced Database Indexing Strategies",
                          content: "Database indexing is crucial for query performance. B-tree indexes are most common, but specialized indexes like GIN, GiST, and BRIN in PostgreSQL offer unique advantages. Composite indexes can optimize multi-column queries, while partial indexes reduce storage overhead for conditional queries. Understanding index selectivity and cardinality helps determine optimal indexing strategies.",
                          metadata: { category: "database", difficulty: "advanced", tags: ["indexing", "performance", "postgresql"] }
                        },
                        {
                          title: "Multi-Tenant Database Architecture",
                          content: "Multi-tenant databases support multiple customers (tenants) within a single database instance. Common patterns include shared database with shared schema, shared database with separate schemas, and separate databases per tenant. Each approach has trade-offs in terms of isolation, performance, maintenance overhead, and cost. Tenant identification and data isolation are critical security considerations.",
                          metadata: { category: "database", difficulty: "advanced", tags: ["multi-tenant", "architecture", "security"] }
                        },
                        {
                          title: "Database Connection Pooling Best Practices",
                          content: "Connection pooling reduces the overhead of establishing database connections by reusing existing connections. Pool sizing depends on application concurrency and database capacity. PgBouncer for PostgreSQL and connection pools in ORMs like Prisma help optimize connection management. Monitor pool utilization and connection lifecycle to prevent resource leaks and ensure optimal performance.",
                          metadata: { category: "database", difficulty: "intermediate", tags: ["connection-pooling", "performance", "scalability"] }
                        }
                      ]
                      
                      Promise.all(
                        sampleDocs.map(doc => questionsAPI.index(doc))
                      ).then(() => {
                        alert('Sample database documents added successfully!')
                      }).catch(error => {
                        console.error('Failed to add sample documents:', error)
                        alert('Failed to add some documents. Check console for details.')
                      })
                    }}
                    className="p-4 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg transition-colors text-left"
                  >
                    <DatabaseIcon className="w-6 h-6 text-[#00B8D9] mb-2" />
                    <h3 className="text-white font-medium mb-1">Add Sample Database Docs</h3>
                    <p className="text-zinc-400 text-sm">
                      Add 3 sample documents about database topics for testing search functionality
                    </p>
                  </button>
                  
                  <button
                    onClick={() => {
                      // Add sample AI/ML documents
                      const sampleDocs = [
                        {
                          title: "Large Language Model Fine-tuning",
                          content: "Fine-tuning LLMs involves adapting pre-trained models to specific tasks or domains. Techniques include full fine-tuning, parameter-efficient methods like LoRA (Low-Rank Adaptation), and prompt tuning. The choice depends on available compute resources, data size, and target performance. Hyperparameter optimization for learning rate, batch size, and training epochs is crucial for successful fine-tuning.",
                          metadata: { category: "ai", difficulty: "advanced", tags: ["llm", "fine-tuning", "machine-learning"] }
                        },
                        {
                          title: "Vector Embeddings and Similarity Search",
                          content: "Vector embeddings represent text, images, or other data as high-dimensional vectors capturing semantic meaning. Similarity search using cosine similarity, dot product, or Euclidean distance enables semantic retrieval. Vector databases like Pinecone, Weaviate, and PostgreSQL with pgvector extension provide efficient storage and search capabilities for embedding-based applications.",
                          metadata: { category: "ai", difficulty: "intermediate", tags: ["embeddings", "vector-search", "semantic-search"] }
                        },
                        {
                          title: "Agent-Based AI Systems",
                          content: "Agent-based AI systems consist of autonomous agents that can perceive, reason, and act in their environment. Each agent has specific capabilities and can collaborate with other agents to solve complex tasks. Frameworks like LangGraph, CrewAI, and AutoGen enable orchestration of multi-agent workflows for tasks like code generation, data analysis, and content creation.",
                          metadata: { category: "ai", difficulty: "advanced", tags: ["agents", "orchestration", "automation"] }
                        }
                      ]
                      
                      Promise.all(
                        sampleDocs.map(doc => questionsAPI.index(doc))
                      ).then(() => {
                        alert('Sample AI/ML documents added successfully!')
                      }).catch(error => {
                        console.error('Failed to add sample documents:', error)
                        alert('Failed to add some documents. Check console for details.')
                      })
                    }}
                    className="p-4 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg transition-colors text-left"
                  >
                    <div className="w-6 h-6 text-purple-400 mb-2 font-bold text-lg">🤖</div>
                    <h3 className="text-white font-medium mb-1">Add Sample AI/ML Docs</h3>
                    <p className="text-zinc-400 text-sm">
                      Add 3 sample documents about AI and machine learning topics
                    </p>
                  </button>
                </div>
                
                <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <InfoIcon className="w-5 h-5 text-amber-400" />
                    <span className="text-amber-400 font-medium">Quick Start</span>
                  </div>
                  <p className="text-amber-400 text-sm">
                    Click the buttons above to add sample documents to your knowledge base. 
                    This will give you immediate content to test search functionality with relevant, 
                    detailed information across different domains.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* API Configuration Tab */}
          {activeTab === 'api' && (
            <div className="space-y-6">
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <h2 className="text-white text-xl font-semibold mb-4">API Configuration</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-white font-medium mb-2">OpenAI API Key</label>
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="sk-..."
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#00B8D9]"
                    />
                    <p className="text-zinc-400 text-sm mt-1">
                      Required for AI-powered search and analysis features
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-white font-medium mb-2">Database Connection</label>
                    <input
                      type="text"
                      value={dbConnection}
                      onChange={(e) => setDbConnection(e.target.value)}
                      placeholder="postgresql://..."
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#00B8D9]"
                    />
                    <p className="text-zinc-400 text-sm mt-1">
                      PostgreSQL connection string for data storage
                    </p>
                  </div>
                  
                  <button className="px-6 py-3 bg-[#00B8D9] text-white rounded-lg hover:bg-[#00a5c3] transition-colors font-medium">
                    Save Configuration
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* System Settings Tab */}
          {activeTab === 'system' && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <h2 className="text-white text-xl font-semibold mb-4">System Settings</h2>
              <div className="flex items-center gap-2 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <InfoIcon className="w-5 h-5 text-blue-400" />
                <p className="text-blue-400">
                  System settings panel coming soon. This will include performance tuning, 
                  logging configuration, and system monitoring options.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}