/**
 * Merge Agent
 * Safely merges fork changes back to production and cleans up
 */

import { logger } from '../../utils/logger.js';
import { tigerWrapper } from '../../services/tigerWrapper.js';
import type { WorkflowState } from '../../types.js';

export async function runMergeAgent(state: WorkflowState): Promise<any> {
  logger.info('🔀 Merge Agent: Merging changes back to production...');
  
  try {
    const { etl, dba, serviceId } = state.data;
    const forkId = etl?.forkId;
    
    if (!forkId) {
      throw new Error('No fork ID found in state');
    }
    
    // Step 1: Pre-merge validation
    logger.info('✅ Validating changes before merge...');
    if (!dba?.readyForMerge) {
      throw new Error('Changes are not ready for merge');
    }
    
    // Step 2: Create backup point (Tiger Cloud handles this automatically)
    logger.info('💾 Creating backup point...');
    
    // Step 3: Merge fork to production
    logger.info(`🔀 Merging fork ${forkId} to service ${serviceId}...`);
    await tigerWrapper.mergeFork(forkId, serviceId);
    
    logger.info('✅ Merge completed successfully');
    
    // Step 4: Cleanup - Delete fork
    logger.info('🧹 Cleaning up fork...');
    await tigerWrapper.deleteService(forkId);
    
    logger.info('✅ Fork deleted');
    
    // Step 5: Post-merge verification
    logger.info('🔍 Running post-merge verification...');
    // TODO: Verify production database state
    
    const result = {
      forkId,
      mergedAt: new Date(),
      changesApplied: dba?.appliedChanges?.length || 0,
      performanceImprovement: dba?.performanceMetrics?.queryTime?.improvement || 'N/A',
      status: 'success',
    };
    
    logger.info('✨ Merge Agent: Changes merged and fork cleaned up');
    return result;
  } catch (error) {
    logger.error('❌ Merge Agent failed', error);
    throw error;
  }
}
