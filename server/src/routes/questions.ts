/**
 * API routes for question answering with hybrid search
 * Demonstrates RAG (Retrieval-Augmented Generation)
 */

import type { FastifyPluginAsync } from 'fastify';
import { searchService } from '../services/search.js';
import { logger } from '../utils/logger.js';
import type { SearchResult } from '../types.js';

/**
 * Generate answer using LLM based on search results
 */
async function generateAnswer(question: string, searchResults: SearchResult[]): Promise<string> {
  logger.info(`Generating answer for question: ${question}`);
  
  const openaiApiKey = process.env.OPENAI_API_KEY;
  
  if (!openaiApiKey) {
    // Fallback to rule-based response generation
    return generateRuleBasedAnswer(question, searchResults);
  }
  
  try {
    // Prepare context from search results
    const context = searchResults
      .slice(0, 3) // Use top 3 results
      .map(result => `Title: ${result.title}\nContent: ${result.content}\nRelevance: ${result.score}`)
      .join('\n\n---\n\n');
    
    const systemPrompt = `You are a helpful AI assistant for a multi-agent orchestration platform. 
Answer questions based on the provided context from the knowledge base. 
Be concise, accurate, and helpful. If the context doesn't contain enough information, say so.`;
    
    const userPrompt = `Question: ${question}\n\nContext from knowledge base:\n${context}\n\nAnswer:`;
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }
    
    const data = await response.json() as { choices: Array<{ message: { content: string } }> };
    return data.choices[0].message.content;
    
  } catch (error) {
    logger.error('Failed to generate LLM answer, falling back to rule-based', error);
    return generateRuleBasedAnswer(question, searchResults);
  }
}

/**
 * Get sample search results when database is empty
 */
function getSampleResults(query: string): SearchResult[] {
  const sampleDocs = [
    {
      id: 'sample-1',
      title: 'Zero-Copy Database Forks',
      content: 'Zero-copy database forks are an advanced database technique that allows creating copies of database instances without physically duplicating the underlying data files. Instead of copying all data blocks, zero-copy forks use copy-on-write semantics where the forked database shares the same physical storage until modifications occur. This approach dramatically reduces the time and storage space required to create database copies for testing, development, or analytics workloads. Popular implementations include PostgreSQL with pg_basebackup, MySQL with binary logs, and specialized systems like Neon and PlanetScale that built zero-copy branching into their architecture from the ground up.',
      metadata: { category: 'database', difficulty: 'advanced', tags: ['fork', 'zero-copy', 'performance'] }
    },
    {
      id: 'sample-2',
      title: 'Database Performance Optimization',
      content: 'Database performance optimization involves multiple strategies including indexing, query optimization, connection pooling, and caching mechanisms. Proper indexing is crucial for fast query execution, while query optimization ensures efficient SQL execution plans. Connection pooling reduces the overhead of establishing database connections, and caching layers like Redis can dramatically reduce database load by storing frequently accessed data in memory. Additional techniques include database sharding, read replicas, and query result caching.',
      metadata: { category: 'database', difficulty: 'intermediate', tags: ['performance', 'optimization', 'indexing'] }
    },
    {
      id: 'sample-3',
      title: 'Multi-Agent Database Orchestration',
      content: 'Multi-agent database orchestration involves coordinating multiple autonomous agents to manage database operations, schema changes, and data workflows. This approach enables distributed decision-making for database management tasks, where ETL agents handle data extraction and transformation, search agents manage query optimization, analyst agents perform data analysis, and DBA agents execute schema modifications. The orchestration system uses workflow engines like LangGraph to coordinate agent interactions and ensure consistent database state across operations.',
      metadata: { category: 'orchestration', difficulty: 'advanced', tags: ['agents', 'workflow', 'coordination'] }
    },
    {
      id: 'sample-4',
      title: 'Hybrid Search Implementation',
      content: 'Hybrid search combines traditional full-text search (BM25) with modern vector similarity search to provide more accurate and contextually relevant results. BM25 excels at exact keyword matching and term frequency analysis, while vector search using embeddings captures semantic meaning and context. The combination uses techniques like Reciprocal Rank Fusion (RRF) to merge results from both approaches, typically achieving better precision and recall than either method alone. Implementation often involves PostgreSQL with pgvector extension for vector operations.',
      metadata: { category: 'search', difficulty: 'advanced', tags: ['hybrid', 'bm25', 'vector', 'embeddings'] }
    },
    {
      id: 'sample-5',
      title: 'Database Fork Management',
      content: 'Database fork management involves creating, maintaining, and merging database branches for development, testing, and analytics purposes. Modern database platforms provide APIs for programmatic fork creation, allowing developers to spin up isolated database copies for feature development or data analysis. Fork management includes handling schema migrations, data synchronization, conflict resolution, and automated cleanup of unused forks. Advanced platforms offer zero-downtime merging and rollback capabilities.',
      metadata: { category: 'database', difficulty: 'intermediate', tags: ['fork', 'management', 'branching'] }
    }
  ];

  // Filter results based on query relevance
  const queryLower = query.toLowerCase();
  const filteredDocs = sampleDocs.filter(doc => 
    doc.title.toLowerCase().includes(queryLower) ||
    doc.content.toLowerCase().includes(queryLower) ||
    doc.metadata.tags.some(tag => tag.toLowerCase().includes(queryLower))
  );

  // If no matches, return all docs
  const docsToReturn = filteredDocs.length > 0 ? filteredDocs : sampleDocs;

  return docsToReturn.slice(0, 3).map((doc, index) => ({
    id: doc.id,
    title: doc.title,
    content: doc.content,
    bm25Score: 0.9 - (index * 0.1),
    vectorScore: 0.85 - (index * 0.1),
    hybridScore: 0.9 - (index * 0.1),
    score: 0.9 - (index * 0.1),
    metadata: doc.metadata,
  }));
}

/**
 * Fallback rule-based answer generation
 */
function generateRuleBasedAnswer(question: string, searchResults: SearchResult[]): string {
  const questionLower = question.toLowerCase();
  
  logger.info(`Generating rule-based answer for "${question}" with ${searchResults.length} results`);
  
  if (searchResults.length === 0) {
    return "I couldn't find any relevant information in the knowledge base to answer your question. Please try rephrasing or asking about topics that were uploaded to the database.";
  }
  
  // Log the search results for debugging
  searchResults.forEach((result, index) => {
    logger.debug(`Search result ${index + 1}: ${result.title} (score: ${result.score})`);
  });
  
  const topResult = searchResults[0];
  // Use an even lower threshold for BM25 scores since they can be quite low for partial matches
  const relevantCount = searchResults.filter(r => r.score > 0.01).length;
  
  let answer = `Based on the uploaded data, here's what I found:\n\n`;
  
  // Check if this is a customer-related query
  const isCustomerQuery = questionLower.includes('customer') || questionLower.includes('purchase') || 
                         questionLower.includes('similar') || questionLower.includes('who') ||
                         questionLower.includes('city') || questionLower.includes('income');
  
  if (isCustomerQuery && searchResults.length > 0) {
    // For customer queries, provide a more comprehensive view
    answer += `I found ${searchResults.length} customer record(s) that might be relevant:\n\n`;
    
    searchResults.slice(0, 3).forEach((result, index) => {
      answer += `**${index + 1}. ${result.title}**\n`;
      
      // Parse customer data for better formatting
      const lines = result.content.split('\n');
      const customerInfo = lines.filter(line => 
        line.includes('city:') || line.includes('annual_income:') || 
        line.includes('product_category:') || line.includes('purchase_amount:')
      ).join('\n');
      
      if (customerInfo) {
        answer += customerInfo + '\n\n';
      } else {
        // Fallback to showing first 200 chars
        answer += result.content.substring(0, 200) + '...\n\n';
      }
    });
    
    // Add helpful context for customer queries
    if (questionLower.includes('tech') || questionLower.includes('gadget') || questionLower.includes('electronic')) {
      const electronicsCustomers = searchResults.filter(r => 
        r.content.toLowerCase().includes('electronic')
      );
      if (electronicsCustomers.length > 0) {
        answer += `\n**Electronics customers found:** ${electronicsCustomers.length}\n`;
        electronicsCustomers.forEach(customer => {
          answer += `- ${customer.title}\n`;
        });
      }
    }
  } else {
    // Always provide the top result content for non-customer queries
    answer += `**${topResult.title}**\n\n`;
    
    // Provide more complete content from the document
    if (topResult.content.length > 500) {
      answer += topResult.content.substring(0, 500) + '...';
    } else {
      answer += topResult.content;
    }
  }
  
  if (relevantCount > 1) {
    answer += `\n\n**Additional relevant information:**`;
    searchResults.slice(1, Math.min(3, searchResults.length)).forEach((result, index) => {
      answer += `\n\n${index + 2}. **${result.title}**`;
      const preview = result.content.length > 200 ? result.content.substring(0, 200) + '...' : result.content;
      answer += `\n   ${preview}`;
    });
  }
  
  answer += `\n\n---\n*Found ${relevantCount} relevant document(s) in the knowledge base.*`;
  
  return answer;
}

const questionsRoutes: FastifyPluginAsync = async (fastify) => {
  // Ask a question using hybrid search
  fastify.post('/', async (request, reply) => {
    try {
      const { question, method } = request.body as { 
        question: string; 
        method?: 'bm25' | 'vector' | 'hybrid' 
      };
      
      if (!question) {
        return reply.code(400).send({ 
          success: false, 
          error: 'question is required' 
        });
      }
      
      const searchMethod = method || 'hybrid';
      let results;
      
      switch (searchMethod) {
        case 'bm25':
          results = await searchService.bm25Search(question);
          break;
        case 'vector':
          results = await searchService.vectorSearch(question);
          break;
        case 'hybrid':
        default:
          results = await searchService.hybridSearch(question);
          break;
      }
      
      // If no results found, provide sample data
      if (results.length === 0) {
        results = getSampleResults(question);
      }
      
      // Generate comprehensive answer using LLM
      const answer = await generateAnswer(question, results);
      
      return { 
        success: true, 
        data: {
          question,
          answer,
          sources: results,
          method: searchMethod,
        }
      };
    } catch (error) {
      logger.error('Failed to answer question', error);
      reply.code(500).send({ success: false, error: 'Failed to answer question' });
    }
  });

  // Index a new document
  fastify.post('/index', async (request, reply) => {
    try {
      const { title, content, metadata } = request.body as { 
        title: string; 
        content: string;
        metadata?: Record<string, any>;
      };
      
      if (!title || !content) {
        return reply.code(400).send({ 
          success: false, 
          error: 'title and content are required' 
        });
      }
      
      const docId = await searchService.indexDocument(title, content, metadata);
      
      return { 
        success: true, 
        data: { id: docId, message: 'Document indexed successfully' }
      };
    } catch (error) {
      logger.error('Failed to index document', error);
      reply.code(500).send({ success: false, error: 'Failed to index document' });
    }
  });
};

export default questionsRoutes;
