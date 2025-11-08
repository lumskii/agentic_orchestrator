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
 * Fallback rule-based answer generation
 */
function generateRuleBasedAnswer(question: string, searchResults: SearchResult[]): string {
  const questionLower = question.toLowerCase();
  
  if (searchResults.length === 0) {
    return "I couldn't find any relevant information in the knowledge base to answer your question. Please try rephrasing or asking about topics related to agent coordination, database integration, or workflow execution.";
  }
  
  const topResult = searchResults[0];
  const relevantCount = searchResults.filter(r => r.score > 0.5).length;
  
  let answer = `Based on the available documentation, here's what I found:\n\n`;
  
  // Determine answer type based on question
  if (questionLower.includes('how') || questionLower.includes('what')) {
    answer += `**${topResult.title}**\n\n${topResult.content.substring(0, 300)}...`;
  } else if (questionLower.includes('coordination') || questionLower.includes('agent')) {
    answer += `For agent coordination, the key concepts involve: ${topResult.content.substring(0, 200)}...`;
  } else if (questionLower.includes('database') || questionLower.includes('integration')) {
    answer += `Regarding database integration: ${topResult.content.substring(0, 200)}...`;
  } else {
    answer += topResult.content.substring(0, 250) + '...';
  }
  
  answer += `\n\nI found ${relevantCount} relevant document(s) that may help answer your question.`;
  
  if (searchResults.length > 1) {
    answer += ` Additional related topics include: ${searchResults.slice(1, 3).map(r => r.title).join(', ')}.`;
  }
  
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
