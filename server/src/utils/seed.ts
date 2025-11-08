import { PrismaClient } from '../../../node_modules/@prisma/client/index.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data (optional - remove if you want to keep existing data)
  console.log('🧹 Cleaning existing data...');
  await prisma.fork.deleteMany();
  await prisma.run.deleteMany();
  await prisma.document.deleteMany();

  // Seed Documents
  console.log('📄 Seeding documents...');
  const documents = await prisma.document.createMany({
    data: [
      {
        title: 'AI Agent Coordination Manual',
        content: 'This document outlines the coordination patterns for multi-agent systems in the orchestration platform.',
        embedding: JSON.stringify([0.1, 0.2, 0.3, 0.4, 0.5]), // Mock embedding
        metadata: {
          type: 'manual',
          category: 'coordination',
          version: '1.0',
          tags: ['ai', 'agents', 'coordination']
        }
      },
      {
        title: 'Database Integration Guide',
        content: 'Step-by-step guide for integrating Tiger PostgreSQL with the orchestration platform.',
        embedding: JSON.stringify([0.2, 0.3, 0.4, 0.5, 0.6]), // Mock embedding
        metadata: {
          type: 'guide',
          category: 'database',
          version: '1.0',
          tags: ['database', 'postgres', 'tiger', 'integration']
        }
      },
      {
        title: 'Workflow Execution Patterns',
        content: 'Common patterns and best practices for executing complex workflows in distributed agent systems.',
        embedding: JSON.stringify([0.3, 0.4, 0.5, 0.6, 0.7]), // Mock embedding
        metadata: {
          type: 'reference',
          category: 'workflows',
          version: '1.0',
          tags: ['workflows', 'patterns', 'execution']
        }
      }
    ]
  });

  // Seed Runs
  console.log('🏃 Seeding runs...');
  const runs = await prisma.run.createMany({
    data: [
      {
        id: 'run_document_analysis_001',
        status: 'completed',
        startTime: new Date('2025-11-08T10:00:00Z'),
        endTime: new Date('2025-11-08T10:05:30Z'),
        steps: [
          { step: 'initialize', status: 'completed', timestamp: '2025-11-08T10:00:00Z' },
          { step: 'load_documents', status: 'completed', timestamp: '2025-11-08T10:01:00Z' },
          { step: 'analyze_content', status: 'completed', timestamp: '2025-11-08T10:03:00Z' },
          { step: 'generate_summary', status: 'completed', timestamp: '2025-11-08T10:05:00Z' },
          { step: 'finalize', status: 'completed', timestamp: '2025-11-08T10:05:30Z' }
        ],
        metadata: {
          agent: 'document_analyzer',
          version: '1.0',
          documentsProcessed: 3,
          totalTokens: 1500
        }
      },
      {
        id: 'run_workflow_coordination_002',
        status: 'running',
        startTime: new Date('2025-11-08T11:00:00Z'),
        steps: [
          { step: 'initialize', status: 'completed', timestamp: '2025-11-08T11:00:00Z' },
          { step: 'setup_agents', status: 'completed', timestamp: '2025-11-08T11:01:00Z' },
          { step: 'coordinate_tasks', status: 'running', timestamp: '2025-11-08T11:02:00Z' }
        ],
        metadata: {
          agent: 'workflow_coordinator',
          version: '1.0',
          activeAgents: 5,
          pendingTasks: 12
        }
      },
      {
        id: 'run_data_migration_003',
        status: 'failed',
        startTime: new Date('2025-11-08T09:00:00Z'),
        endTime: new Date('2025-11-08T09:15:00Z'),
        steps: [
          { step: 'initialize', status: 'completed', timestamp: '2025-11-08T09:00:00Z' },
          { step: 'validate_source', status: 'completed', timestamp: '2025-11-08T09:05:00Z' },
          { step: 'migrate_data', status: 'failed', timestamp: '2025-11-08T09:15:00Z', error: 'Connection timeout' }
        ],
        metadata: {
          agent: 'data_migrator',
          version: '1.0',
          sourceDb: 'legacy_system',
          error: 'Database connection timeout after 10 minutes'
        }
      }
    ]
  });

  // Seed Forks
  console.log('🍴 Seeding forks...');
  const forks = await prisma.fork.createMany({
    data: [
      {
        id: 'fork_development_env',
        parentServiceId: 'tiger_main_service',
        name: 'Development Environment',
        connectionString: 'postgres://dev_user:dev_pass@localhost:5432/dev_orchestrator'
      },
      {
        id: 'fork_staging_env',
        parentServiceId: 'tiger_main_service',
        name: 'Staging Environment',
        connectionString: 'postgres://staging_user:staging_pass@staging.example.com:5432/staging_orchestrator'
      },
      {
        id: 'fork_test_analytics',
        parentServiceId: 'tiger_analytics_service',
        name: 'Analytics Testing Fork',
        connectionString: 'postgres://test_user:test_pass@localhost:5433/test_analytics'
      }
    ]
  });

  console.log('✅ Seed completed successfully!');
  console.log(`📄 Created ${documents.count} documents`);
  console.log(`🏃 Created ${runs.count} runs`);
  console.log(`🍴 Created ${forks.count} forks`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });