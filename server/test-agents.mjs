#!/usr/bin/env node

/**
 * Comprehensive Test Script for Agentic Orchestrator
 * Tests all customized agents and services with real logic
 */

import { logger } from '../src/utils/logger.js';
import { runETLAgent } from '../src/orchestrator/agents/etlAgent.js';
import { runDBAAgent } from '../src/orchestrator/agents/dbaAgent.js';
import { runMergeAgent } from '../src/orchestrator/agents/mergeAgent.js';
import { searchService } from '../src/services/search.js';
import { mcpClient } from '../src/services/mcpClient.js';
import { tigerWrapper } from '../src/services/tigerWrapper.js';

async function testAgents() {
  console.log('🚀 Testing Multi-Agent Orchestration Platform');
  console.log('==============================================\n');

  try {
    // Test 1: ETL Agent
    console.log('📊 Testing ETL Agent...');
    const etlState = {
      runId: 'test_run_001',
      data: {
        serviceId: 'svc_test_123',
        sourceConfig: { type: 'postgresql', host: 'source.db' },
        transformRules: { normalize: true, validate: true }
      }
    };
    
    const etlResult = await runETLAgent(etlState);
    console.log('✅ ETL Agent completed:', {
      forkId: etlResult.forkId,
      recordsProcessed: etlResult.recordsExtracted,
      sampleData: etlResult.sampleData?.length || 0
    });

    // Test 2: DBA Agent with ETL results
    console.log('\n🔧 Testing DBA Agent...');
    const dbaState = {
      runId: 'test_run_001',
      data: {
        analyst: {
          recommendations: [
            { action: 'create_index', table: 'users', column: 'email' },
            { action: 'enable_partitioning', table: 'events' },
            { action: 'optimize_query', table: 'analytics' }
          ]
        },
        etl: etlResult
      }
    };
    
    const dbaResult = await runDBAAgent(dbaState);
    console.log('✅ DBA Agent completed:', {
      changesApplied: dbaResult.appliedChanges?.length || 0,
      readyForMerge: dbaResult.readyForMerge,
      verificationPassed: dbaResult.verificationResults?.overall_success
    });

    // Test 3: Merge Agent
    console.log('\n🔀 Testing Merge Agent...');
    const mergeState = {
      runId: 'test_run_001',
      data: {
        serviceId: 'svc_test_123',
        etl: etlResult,
        dba: dbaResult
      }
    };
    
    const mergeResult = await runMergeAgent(mergeState);
    console.log('✅ Merge Agent completed:', {
      status: mergeResult.status,
      changesApplied: mergeResult.changesApplied,
      verificationPassed: mergeResult.postMergeValidation?.verification_passed
    });

    // Test 4: Search Service
    console.log('\n🔍 Testing Search Service...');
    const searchResults = await searchService.hybridSearch('coordination patterns', 3);
    console.log('✅ Search Service completed:', {
      resultsFound: searchResults.length,
      topResult: searchResults[0]?.title || 'No results',
      avgScore: searchResults.reduce((sum, r) => sum + r.score, 0) / searchResults.length || 0
    });

    // Test 5: Tiger Wrapper Service
    console.log('\n🐅 Testing Tiger Wrapper Service...');
    const services = await tigerWrapper.listServices();
    console.log('✅ Tiger Wrapper completed:', {
      servicesFound: services.length,
      firstService: services[0]?.name || 'No services'
    });

    // Test 6: MCP Client
    console.log('\n🔌 Testing MCP Client...');
    await mcpClient.connect();
    const mcpTools = await mcpClient.getTools();
    const docQuery = await mcpClient.queryGuides('how to create forks');
    console.log('✅ MCP Client completed:', {
      toolsAvailable: mcpTools.length,
      documentationWorking: docQuery.length > 0
    });

    console.log('\n🎉 All agents and services tested successfully!');
    console.log('\nSummary:');
    console.log('- ETL Agent: Real data extraction, transformation, and loading');
    console.log('- DBA Agent: Actual database optimization with verification');
    console.log('- Merge Agent: Production deployment with safety checks');
    console.log('- Search Service: OpenAI embeddings with deterministic fallback');
    console.log('- Tiger Wrapper: Real CLI integration with mock fallbacks');
    console.log('- MCP Client: Full protocol implementation with built-in tools');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    await mcpClient.disconnect();
  }
}

// Run the test
testAgents().then(() => {
  console.log('\n✨ Agent testing completed successfully!');
  process.exit(0);
}).catch(error => {
  console.error('💥 Agent testing failed:', error);
  process.exit(1);
});