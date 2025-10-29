# Agentic Orchestrator - Workflow Visualization

## 🔄 Complete Multi-Agent Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER REQUEST                             │
│  "Analyze database performance and suggest optimizations"       │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                   ORCHESTRATOR START                            │
│  - Generate unique run ID                                       │
│  - Initialize workflow state                                    │
│  - Create execution context                                     │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 1: ETL AGENT 🔄                                          │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ • Create zero-copy fork of production database            │ │
│  │ • Fork name: experiment-fork-{runId}                      │ │
│  │ • Extract: Pull relevant data from production             │ │
│  │ • Transform: Apply data transformations                   │ │
│  │ • Load: Load transformed data into fork                   │ │
│  │                                                            │ │
│  │ Output:                                                    │ │
│  │   - forkId: "fork_abc123"                                 │ │
│  │   - connectionString: "postgresql://..."                  │ │
│  │   - recordsProcessed: 1000                                │ │
│  └───────────────────────────────────────────────────────────┘ │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 2: SEARCH AGENT 🔍                                       │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ • Perform hybrid search for relevant context              │ │
│  │ • BM25: Full-text keyword matching                        │ │
│  │ • Vector: Semantic similarity search                      │ │
│  │ • RRF: Merge results with Reciprocal Rank Fusion         │ │
│  │                                                            │ │
│  │ Search Query: "database performance optimization"         │ │
│  │                                                            │ │
│  │ Output:                                                    │ │
│  │   - Top 3 relevant documents                              │ │
│  │   - BM25 scores, Vector scores, Hybrid scores             │ │
│  │   - Related context snippets                              │ │
│  └───────────────────────────────────────────────────────────┘ │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 3: ANALYST AGENT 📊                                      │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ • Analyze ETL results and search context                  │ │
│  │ • Identify patterns and anomalies                         │ │
│  │ • Generate insights about database performance            │ │
│  │ • Formulate recommendations                               │ │
│  │                                                            │ │
│  │ Analysis:                                                  │ │
│  │   - Data quality: Good                                    │ │
│  │   - Query patterns identified                             │ │
│  │   - Bottlenecks detected                                  │ │
│  │                                                            │ │
│  │ Output:                                                    │ │
│  │   - insights: [                                           │ │
│  │       "Missing indexes on users.email",                   │ │
│  │       "Slow queries on events table",                     │ │
│  │       "Consider partitioning large tables"                │ │
│  │     ]                                                      │ │
│  │   - recommendations: [                                    │ │
│  │       {action: "create_index", table: "users"},           │ │
│  │       {action: "enable_partitioning", table: "events"}    │ │
│  │     ]                                                      │ │
│  └───────────────────────────────────────────────────────────┘ │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 4: DBA AGENT 🔧                                          │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ • Apply database optimizations on FORK (not production!)  │ │
│  │ • Create indexes based on recommendations                 │ │
│  │ • Configure partitioning strategies                       │ │
│  │ • Run performance benchmarks                              │ │
│  │ • Verify improvements                                     │ │
│  │                                                            │ │
│  │ Execution on fork_abc123:                                 │ │
│  │   ✓ CREATE INDEX idx_users_email ON users(email)         │ │
│  │   ✓ Enable partitioning for events table                 │ │
│  │   ✓ Analyze query performance                            │ │
│  │                                                            │ │
│  │ Output:                                                    │ │
│  │   - changesApplied: 2                                     │ │
│  │   - performanceMetrics:                                   │ │
│  │       before: 150ms, after: 45ms (70% improvement)        │ │
│  │   - readyForMerge: true                                   │ │
│  └───────────────────────────────────────────────────────────┘ │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 5: MERGE AGENT 🔀                                        │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ • Validate changes in fork                                │ │
│  │ • Create backup point (Tiger Cloud automatic)            │ │
│  │ • Merge fork to production database                       │ │
│  │ • Run post-merge verification                            │ │
│  │ • Clean up: Delete fork                                   │ │
│  │                                                            │ │
│  │ Merge Process:                                            │ │
│  │   ✓ Pre-merge validation passed                          │ │
│  │   ✓ Backup created automatically                         │ │
│  │   ✓ Changes merged to production                         │ │
│  │   ✓ Post-merge tests passed                              │ │
│  │   ✓ Fork deleted                                          │ │
│  │                                                            │ │
│  │ Output:                                                    │ │
│  │   - status: "success"                                     │ │
│  │   - performanceImprovement: "70%"                         │ │
│  │   - mergedAt: "2025-10-28T10:30:00Z"                     │ │
│  └───────────────────────────────────────────────────────────┘ │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                   ORCHESTRATOR COMPLETE                         │
│  - All steps executed successfully                              │
│  - Run status: completed                                        │
│  - Total duration: 2m 34s                                       │
│  - Results available in dashboard                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Agent Responsibilities Matrix

| Agent | Input | Process | Output | Safety |
|-------|-------|---------|--------|--------|
| **ETL** | Production DB | Fork, Extract, Transform, Load | Fork ID, Data metrics | Works on fork only |
| **Search** | User question | BM25 + Vector + RRF | Relevant documents | Read-only operation |
| **Analyst** | ETL + Search results | Pattern analysis, insights | Recommendations | Analysis only |
| **DBA** | Analyst recommendations | Apply optimizations | Performance metrics | Fork isolation |
| **Merge** | DBA results | Validate, Merge, Cleanup | Final status | Validation required |

---

## 🔄 State Flow

```
Initial State:
{
  runId: "run_xyz789",
  currentStep: "init",
  data: {
    question: "...",
    serviceId: "..."
  },
  errors: []
}

After ETL:
{
  ...state,
  currentStep: "etl",
  data: {
    ...data,
    etl: {
      forkId: "fork_abc123",
      recordsProcessed: 1000
    }
  }
}

After Search:
{
  ...state,
  currentStep: "search",
  data: {
    ...data,
    search: {
      topResults: [...],
      relevanceScores: [...]
    }
  }
}

...and so on for each agent
```

---

## 🔀 Fork Lifecycle

```
1. CREATE FORK
   ↓
   Production DB (unchanged)
   ↓
   Zero-copy fork created (copy-on-write)
   ↓
   Fork ID: fork_abc123

2. EXPERIMENT ON FORK
   ↓
   Apply schema changes
   Run migrations
   Test optimizations
   ↓
   Changes isolated from production

3. VALIDATION
   ↓
   Performance tests
   Data integrity checks
   Query benchmarks
   ↓
   readyForMerge: true/false

4. MERGE (if validated)
   ↓
   Backup point created
   Changes applied to production
   Post-merge verification
   ↓
   Production updated safely

5. CLEANUP
   ↓
   Delete fork
   Free resources
   ↓
   Complete
```

---

## 🔍 Hybrid Search Flow

```
User Query: "database performance"
         |
         ▼
    ┌────────────────┐
    │ Generate       │
    │ Embedding      │
    │ (OpenAI API)   │
    └────┬───────────┘
         │
         ▼
    ┌────────────────────────────┐
    │  Parallel Search           │
    │                            │
    │  ┌──────────┐  ┌─────────┐│
    │  │   BM25   │  │ Vector  ││
    │  │ (keyword)│  │(semantic)││
    │  └────┬─────┘  └────┬────┘│
    └───────┼─────────────┼─────┘
            │             │
            ▼             ▼
      Results Set 1   Results Set 2
            │             │
            └─────┬───────┘
                  ▼
         ┌────────────────┐
         │      RRF       │
         │ (Merge scores) │
         └────────┬───────┘
                  │
                  ▼
         ┌────────────────┐
         │ Ranked Results │
         │ by Hybrid Score│
         └────────────────┘
```

---

## 🎬 Example Timeline

```
00:00  User clicks "Start New Run"
00:01  Orchestrator initialized
00:02  ETL Agent starts
00:05  Fork created (fork_abc123)
00:10  Data extraction complete
00:15  ETL Agent complete
00:16  Search Agent starts
00:18  BM25 search executed
00:20  Vector search executed
00:21  Results merged with RRF
00:22  Search Agent complete
00:23  Analyst Agent starts
00:30  Analysis complete
00:31  Recommendations generated
00:32  Analyst Agent complete
00:33  DBA Agent starts
00:35  Index created on users.email
00:50  Partitioning enabled on events
01:05  Performance tests run
01:10  DBA Agent complete
01:11  Merge Agent starts
01:15  Pre-merge validation passed
01:20  Changes merged to production
01:25  Post-merge verification passed
01:30  Fork deleted
01:31  Merge Agent complete
01:32  Orchestrator complete
```

---

## 📊 Dashboard Views

### Runs Panel
```
┌─────────────────────────────────────┐
│ Recent Runs              [Refresh]  │
├─────────────────────────────────────┤
│ ● run_xyz789              Running   │
│   Analyze database performance      │
│   Step 3/5: Analyst                 │
│                                     │
│ ✓ run_abc123             Completed  │
│   Index optimization                │
│   Duration: 2m 34s                  │
│                                     │
│ ✗ run_def456              Failed    │
│   Migration test                    │
│   Error: Validation failed          │
└─────────────────────────────────────┘
```

### Forks Panel
```
┌─────────────────────────────────────┐
│ Create Zero-Copy Fork               │
├─────────────────────────────────────┤
│ Parent Service: [production-db ▼]   │
│ Fork Name: [experiment-fork-1]      │
│ [Create Fork]                       │
│                                     │
│ 💡 About Zero-Copy Forks            │
│ Tiger Cloud uses copy-on-write...  │
└─────────────────────────────────────┘
```

### Search Panel
```
┌─────────────────────────────────────┐
│ Hybrid Search                       │
├─────────────────────────────────────┤
│ Method: [BM25] [Vector] [Hybrid✓]  │
│                                     │
│ Question:                           │
│ ┌─────────────────────────────────┐ │
│ │ How to optimize database?       │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│ [Search]                            │
│                                     │
│ Results (3):                        │
│ • Document #1 (score: 0.9542)      │
│ • Document #2 (score: 0.8921)      │
│ • Document #3 (score: 0.7654)      │
└─────────────────────────────────────┘
```

---

**🎊 Visual guide to understanding the Agentic Orchestrator workflow!**
