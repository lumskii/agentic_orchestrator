/**
 * Search Agent
 * Performs hybrid search (BM25 + Vector) to find relevant context
 */

import { logger } from '../../utils/logger.js';
import { searchService } from '../../services/search.js';
import type { WorkflowState } from '../../types.js';

export async function runSearchAgent(state: WorkflowState): Promise<any> {
  logger.info('🔍 Search Agent: Performing hybrid search for relevant context...');
  
  try {
    const question = state.data.question;
    
    // Step 1: Perform hybrid search
    logger.info(`🔎 Searching for: "${question}"`);
    const results = await searchService.hybridSearch(question, 5);
    
    logger.info(`📚 Found ${results.length} relevant documents`);
    
    // Step 2: Rank and filter results
    const topResults = results
      .sort((a, b) => b.hybridScore - a.hybridScore)
      .slice(0, 3);
    
    logger.info('📊 Search scores:');
    topResults.forEach((result, idx) => {
      logger.info(`  ${idx + 1}. BM25: ${result.bm25Score.toFixed(4)}, Vector: ${result.vectorScore.toFixed(4)}, Hybrid: ${result.hybridScore.toFixed(4)}`);
    });
    
    const result = {
      query: question,
      resultsCount: results.length,
      topResults: topResults.map(r => ({
        id: r.id,
        content: r.content.substring(0, 200),
        hybridScore: r.hybridScore,
      })),
      searchMethod: 'hybrid',
    };
    
    logger.info('✨ Search Agent: Context retrieval completed');
    return result;
  } catch (error) {
    logger.error('❌ Search Agent failed', error);
    throw error;
  }
}
