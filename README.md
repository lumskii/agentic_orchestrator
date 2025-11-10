# Agentic Orchestrator 🧩

**A multi-agent orchestration platform built for the Agentic Postgres Challenge**, demonstrating how multiple AI agents collaborate safely on forked Postgres environments using Tiger Cloud, MCP (Model Context Protocol), and hybrid BM25 + vector search for intelligent database operations.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![Tiger Cloud](https://img.shields.io/badge/Tiger-Cloud-orange)](https://tigerdata.com/)

---

## � Challenge Overview

This project is a submission for the **Agentic Postgres Challenge** hosted by **DEV Community** and **Tiger Data**[[1]](#citations).

**Challenge Details:**
- **Deadline:** November 9, 2025
- **Total Prizes:** $3,000 ($1,000 per winner)
- **Judging Criteria:**
  - ✅ Use of technology (Tiger Cloud, MCP, pgvectorscale)
  - ✅ Usability and accessibility
  - ✅ Creativity and innovation
  - ✅ Real-world applicability

**What Makes This Special:**  
Traditional database operations are risky—schema changes, query optimizations, and data migrations can break production systems. **Agentic Orchestrator** solves this by using Tiger Cloud's **zero-copy forks** to create instant, isolated database branches where AI agents can safely experiment, optimize, and validate changes before merging back to production.

---

## ⚙️ Core Features

### 🎯 **Tiger Cloud Integration**
- **Tiger CLI + MCP** — Three-line setup for natural-language database control:
  ```bash
  curl -fsSL https://cli.tigerdata.com | sh
  tiger auth login
  tiger mcp install
  ```
- **Instant Forks** — Copy-on-write Postgres forks in seconds, no data duplication
- **Fluid Storage** — High-IOPS architecture enabling zero-copy branching at scale

### 🔍 **Hybrid Search Engine**
- **BM25 Full-Text Search** — Keyword precision using PostgreSQL's `pg_textsearch`
- **Vector Similarity** — Semantic understanding via `pgvectorscale` and embeddings
- **Reciprocal Rank Fusion (RRF)** — Intelligent result merging for optimal relevance

### 🤖 **Multi-Agent Orchestration**
Five specialized agents working in sequence:
1. **ETL Agent** — Data extraction, transformation, and loading in isolated forks
2. **Search Agent** — Context retrieval using hybrid search
3. **Analyst Agent** — Pattern analysis and insight generation
4. **DBA Agent** — Safe schema changes and query optimization
5. **Merge Agent** — Validation and production deployment

### ♿ **Accessibility & Usability**
- Keyboard navigation support
- High color contrast (WCAG AA compliant)
- Screen reader friendly
- Responsive design for all devices
- Real-time status updates  

---

## 🧱 Architecture

```
agentic-orchestrator/
├── frontend/              # Next.js 14 + React + Tailwind CSS
│   ├── components/       # RunsPanel, ForksPanel, SearchPanel
│   ├── pages/            # Dashboard and routing
│   └── lib/              # API client with typed interfaces
│
├── server/               # Fastify backend with TypeScript
│   ├── src/
│   │   ├── orchestrator/ # Multi-agent workflow engine
│   │   │   ├── agents/   # ETL, Search, Analyst, DBA, Merge
│   │   │   └── langgraph.ts  # Workflow definition
│   │   ├── services/     # Core business logic
│   │   │   ├── tigerWrapper.ts   # Tiger CLI integration
│   │   │   ├── mcpClient.ts      # MCP client
│   │   │   ├── search.ts         # Hybrid search
│   │   │   └── db.ts             # PostgreSQL pool
│   │   ├── routes/       # REST API endpoints
│   │   └── utils/        # Config, logging, SQL templates
│   └── package.json
│
├── scripts/              # Automation and setup
│   ├── quickstart.sh     # One-command setup (Bash)
│   ├── quickstart.bat    # One-command setup (Windows)
│   ├── setupTiger.sh     # Tiger CLI installation
│   ├── createFork.sh     # Fork creation helper
│   ├── enableSearch.sql  # Search extensions setup
│   └── populateVectors.ts # Sample data seeding
│
├── docker/               # Local development environment
│   └── docker-compose.yml # PostgreSQL 16 + pgAdmin
│
├── prisma/               # Database schema and migrations
│   └── schema.prisma
│
└── package.json          # Root package with concurrent scripts
```

### **Directory Responsibilities**

| Directory | Purpose |
|-----------|---------|
| `frontend/` | User interface for monitoring runs, managing forks, and executing searches |
| `server/orchestrator/` | Multi-agent workflow coordination using LangGraph patterns |
| `server/services/` | Integration with Tiger Cloud, MCP, PostgreSQL, and search engines |
| `server/routes/` | RESTful API for runs, forks, and question-answering |
| `scripts/` | Setup automation, database initialization, and utility tools |
| `docker/` | Local PostgreSQL instance for development and testing |
| `prisma/` | Type-safe database schema and query builder |

---

## 🚀 Setup Instructions

### **Prerequisites**
- Node.js 18+ and npm
- PostgreSQL 14+ (or use Docker)
- Tiger Cloud account (sign up at [tigerdata.com](https://tigerdata.com))
- OpenAI API key (for embeddings)

### **Step 1: Clone and Install**

```bash
git clone https://github.com/lumskii/agentic-orchestrator
cd agentic-orchestrator
npm run install:all
```

This installs dependencies for root, server, and frontend in one command.

### **Step 2: Setup Tiger CLI + MCP**

```bash
# Install Tiger CLI
curl -fsSL https://cli.tigerdata.com | sh

# Authenticate with your Tiger Cloud account
tiger auth login

# Install Model Context Protocol
tiger mcp install
```

**What this does:**  
Tiger CLI connects your local environment to Tiger Cloud services. MCP enables natural-language database operations like "create a fork called experiment-1" or "show me all services."

### **Step 3: Configure Environment**

```bash
# Copy environment template
cp .env.example .env
```

Edit `.env` with your credentials:

```bash
# Tiger Cloud Configuration
TIGER_API_KEY=your_tiger_api_key_here
SERVICE_ID=your_service_id_here

# Database Connection
DATABASE_URL=postgresql://user:password@host:port/database

# OpenAI (for embeddings)
OPENAI_API_KEY=your_openai_api_key_here

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### **Step 4: Start Local PostgreSQL (Optional)**

If you don't have a Tiger Cloud service yet:

```bash
cd docker
docker-compose up -d
```

This starts:
- PostgreSQL 16 on port 5432
- pgAdmin 4 on port 5050 (admin@admin.com / admin)

### **Step 5: Initialize Database**

```bash
# Run search extensions setup
psql $DATABASE_URL -f scripts/enableSearch.sql

# Or if using Docker:
docker exec -i agentic_postgres psql -U postgres -d agentic_orchestrator < scripts/enableSearch.sql

# Seed sample documents
cd server
npm run seed
```

### **Step 6: Run the Application**

```bash
# From root directory
npm run dev
```

This starts both servers concurrently:
- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:5000
- **API Docs:** http://localhost:5000/health

---

## 🤖 Multi-Agent Workflow

### **Agent Responsibilities**

#### **1. ETL Agent** 🔄
**Purpose:** Prepare data in an isolated environment

```typescript
async function runETLAgent(state: WorkflowState) {
  // Create zero-copy fork
  const fork = await tigerWrapper.createFork(
    state.data.serviceId, 
    `etl-fork-${state.runId}`
  );
  
  // Extract data from production
  const data = await extractData(fork.connectionString);
  
  // Transform according to schema
  const transformed = await transformData(data);
  
  // Load into fork
  await loadData(fork.connectionString, transformed);
  
  return { forkId: fork.id, recordsProcessed: data.length };
}
```

#### **2. Search Agent** 🔍
**Purpose:** Find relevant context using hybrid search

```typescript
async function runSearchAgent(state: WorkflowState) {
  const question = state.data.question;
  
  // Perform hybrid search (BM25 + Vector + RRF)
  const results = await searchService.hybridSearch(question, 5);
  
  return { 
    query: question, 
    topResults: results.slice(0, 3),
    method: 'hybrid'
  };
}
```

#### **3. Analyst Agent** 📊
**Purpose:** Generate insights and recommendations

```typescript
async function runAnalystAgent(state: WorkflowState) {
  const { etl, search } = state.data;
  
  // Analyze patterns
  const insights = await analyzeData(etl, search);
  
  // Generate recommendations
  const recommendations = [
    { action: 'create_index', table: 'users', column: 'email' },
    { action: 'enable_partitioning', table: 'events' }
  ];
  
  return { insights, recommendations };
}
```

#### **4. DBA Agent** 🔧
**Purpose:** Apply optimizations safely on fork

```typescript
async function runDBAAgent(state: WorkflowState) {
  const { analyst, etl } = state.data;
  
  // Apply changes to FORK (not production!)
  for (const rec of analyst.recommendations) {
    await applyOptimization(etl.forkId, rec);
  }
  
  // Benchmark performance
  const metrics = await benchmarkPerformance(etl.forkId);
  
  return { 
    changesApplied: analyst.recommendations.length,
    performanceMetrics: metrics,
    readyForMerge: true 
  };
}
```

#### **5. Merge Agent** 🔀
**Purpose:** Validate and deploy to production

```typescript
async function runMergeAgent(state: WorkflowState) {
  const { etl, dba } = state.data;
  
  // Pre-merge validation
  if (!dba.readyForMerge) throw new Error('Not ready');
  
  // Merge fork to production
  await tigerWrapper.mergeFork(etl.forkId, state.data.serviceId);
  
  // Cleanup
  await tigerWrapper.deleteService(etl.forkId);
  
  return { status: 'success', mergedAt: new Date() };
}
```

---

## � Hybrid Search Demo

### **How It Works**

Hybrid search combines **keyword precision** (BM25) with **semantic understanding** (vector embeddings):

1. **BM25 Ranking** — PostgreSQL's full-text search ranks documents by term frequency
2. **Vector Similarity** — pgvectorscale computes cosine similarity between embeddings
3. **Reciprocal Rank Fusion** — Merges both result sets for optimal relevance

### **SQL Implementation**

```sql
WITH bm25_results AS (
  -- BM25 full-text search
  SELECT 
    id,
    ROW_NUMBER() OVER (
      ORDER BY ts_rank_cd(
        to_tsvector('english', body), 
        plainto_tsquery('database optimization')
      ) DESC
    ) as rank
  FROM documents
  WHERE to_tsvector('english', body) @@ plainto_tsquery('database optimization')
  LIMIT 100
),
vector_results AS (
  -- Vector similarity search
  SELECT 
    id,
    ROW_NUMBER() OVER (
      ORDER BY embedding <=> '[0.1, 0.2, ...]'::vector
    ) as rank
  FROM documents
  WHERE embedding IS NOT NULL
  LIMIT 100
)
-- Reciprocal Rank Fusion
SELECT 
  COALESCE(b.id, v.id) as id,
  d.title,
  d.body,
  COALESCE(1.0 / (60 + b.rank), 0) as bm25_score,
  COALESCE(1.0 / (60 + v.rank), 0) as vector_score,
  (COALESCE(1.0 / (60 + b.rank), 0) + COALESCE(1.0 / (60 + v.rank), 0)) as hybrid_score
FROM bm25_results b
FULL OUTER JOIN vector_results v ON b.id = v.id
JOIN documents d ON d.id = COALESCE(b.id, v.id)
ORDER BY hybrid_score DESC
LIMIT 10;
```

### **Example Query**

```bash
# Using the API
curl -X POST http://localhost:3001/api/questions \
  -H "Content-Type: application/json" \
  -d '{
    "question": "How do I optimize slow queries?",
    "method": "hybrid"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "question": "How do I optimize slow queries?",
    "answer": "Based on hybrid search results...",
    "sources": [
      {
        "id": 3,
        "content": "Database Index Optimization Strategies...",
        "bm25Score": 0.8542,
        "vectorScore": 0.9123,
        "hybridScore": 1.7665
      }
    ],
    "method": "hybrid"
  }
}
```

---

## 🐯 Key Tiger Features Demonstrated

| Feature | How It's Used | Benefit |
|---------|---------------|---------|
| **Tiger MCP** | Natural-language database control via `tiger mcp install` | Simplifies agent-database interactions |
| **Tiger CLI** | Fork creation, deletion, and service monitoring | Automated database branching |
| **pg_textsearch** | BM25 keyword relevance ranking | Precise full-text search |
| **pgvectorscale** | High-throughput vector similarity search | Semantic understanding at scale |
| **Fluid Storage** | Zero-copy fork creation with copy-on-write | Instant branches without data duplication |
| **Memory API** | Stores agent conversation context (optional) | Maintains workflow state |

---

## 🎥 Demo Video

> **📹 Watch the 3-minute walkthrough** demonstrating:
> 1. Creating a zero-copy fork with Tiger CLI
> 2. Multi-agent workflow execution
> 3. Hybrid search in action (BM25 + Vector)
> 4. Safe merge to production
> 5. Fork cleanup and resource management

**Video Link:** [Demo video](https://www.loom.com/share/396d1111c6e74cada7d6688d9948c54a)

**Screenshots:**

| Dashboard | Fork Creation | Hybrid Search |
|-----------|---------------|---------------|
| ![alt text](image.png) | ![alt text](image-1.png) | ![alt text](image-2.png) |

---

## 📊 Usage Examples

### **Example 1: Start an Orchestrator Run**

```typescript
// Via API
const response = await fetch('http://localhost:3000/api/runs', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    question: 'Analyze database performance and suggest optimizations',
    serviceId: 'svc_abc123'
  })
});

const run = await response.json();
console.log(run.data.id); // run_xyz789
```

### **Example 2: Create a Database Fork**

```bash
# Via Tiger CLI
tiger service fork svc_abc123 --name experiment-fork-1

# Via Script
./scripts/createFork.sh svc_abc123 experiment-fork-1

# Via API
curl -X POST http://localhost:3001/api/forks \
  -H "Content-Type: application/json" \
  -d '{"serviceId":"svc_abc123","name":"experiment-fork-1"}'
```

### **Example 3: Hybrid Search Query**

```bash
# BM25 only
curl -X POST http://localhost:3001/api/questions \
  -d '{"question":"database indexing","method":"bm25"}'

# Vector only
curl -X POST http://localhost:3001/api/questions \
  -d '{"question":"database indexing","method":"vector"}'

# Hybrid (RRF)
curl -X POST http://localhost:3001/api/questions \
  -d '{"question":"database indexing","method":"hybrid"}'
```

---

## 🧪 Testing the System

### **1. Health Check**
```bash
curl http://localhost:3001/health
# Response: {"status":"ok","timestamp":"2025-10-28T18:00:00Z"}
```

### **2. List Available Services**
```bash
curl http://localhost:3001/api/forks/services
```

### **3. Monitor Active Runs**
```bash
curl http://localhost:3001/api/runs
```

### **4. Test Hybrid Search**
```bash
curl -X POST http://localhost:3001/api/questions \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What are zero-copy database forks?",
    "method": "hybrid"
  }'
```

---

## 🏅 Submission Details

- **DEV Submission:** [Link to DEV Article]
- **GitHub Repository:** [https://github.com/lumskii/agentic-orchestrator](https://github.com/lumskii/agentic-orchestrator)
- **Live Demo:** [Coming Soon]
- **Contact:** lumi8866@gmail.com | [Twitter/X Handle]

---

## 📚 Citations / References

<a name="citations"></a>

1. **Agentic Postgres Challenge** — DEV Community + Tiger Data, October 2025  
   [Challenge Announcement](https://dev.to/challenges/tigerdata)

2. **Tiger CLI Documentation** — Tiger Data  
   [https://docs.tigerdata.com/cli](https://docs.tigerdata.com/cli)

3. **Model Context Protocol (MCP)** — Anthropic  
   [https://modelcontextprotocol.io](https://modelcontextprotocol.io)

4. **BM25 Ranking Function** — PostgreSQL Full-Text Search  
   [https://www.postgresql.org/docs/current/textsearch-controls.html](https://www.postgresql.org/docs/current/textsearch-controls.html)

5. **pgvectorscale Extension** — Timescale  
   [https://github.com/timescale/pgvectorscale](https://github.com/timescale/pgvectorscale)

6. **Fluid Storage Architecture** — Tiger Data Blog  
   [https://tigerdata.com/blog/fluid-storage](https://tigerdata.com/blog/fluid-storage)

7. **LangGraph Multi-Agent Patterns** — LangChain  
   [https://langchain-ai.github.io/langgraph/](https://langchain-ai.github.io/langgraph/)

---

## 👨‍💻 Credits

**Developed by Olu Mike Sholola for the Agentic Postgres Challenge** — showcasing the power of AI-native databases, zero-copy branching, and multi-agent orchestration for safe, intelligent database operations.

**Technologies Used:**
- TypeScript, Node.js, Next.js 14, React 18
- Fastify, PostgreSQL, Prisma ORM
- Tiger Cloud, Tiger CLI, Tiger MCP
- pg_textsearch, pgvectorscale
- LangGraph, LangChain, OpenAI
- Docker, Tailwind CSS

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## � Acknowledgments

Special thanks to:
- **Tiger Data** team for creating an incredible Agentic Postgres platform
- **DEV Community** for hosting this challenge
- **Timescale** for pgvectorscale
- **LangChain** team for multi-agent patterns
- The open-source community

---

<div align="center">

**🎊 Built for the Agentic Postgres Challenge 2025 🎊**

[Report Bug](https://github.com/lumskii/agentic-orchestrator/issues) · 
[Request Feature](https://github.com/lumskii/agentic-orchestrator/issues) · 
[View Demo](https://www.loom.com/share/396d1111c6e74cada7d6688d9948c54a)

</div>
