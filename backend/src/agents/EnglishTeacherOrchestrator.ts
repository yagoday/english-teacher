import { MultiAgentOrchestrator } from "multi-agent-orchestrator";
import type { ConversationMessage } from "multi-agent-orchestrator";
import { createOpenAIClient } from "./config/agentConfig";
import { createVocabularyAgent } from "./agents/vocabularyAgent";
import { createConversationAgent } from "./agents/conversationAgent";
import { createFixerAgent } from "./agents/fixerAgent";
import { createClassifier } from "./agents/classifier";
import { ConversationService } from "../services/conversationService";
import { MessageService } from "../services/messageService";
import { IMessage } from "../models/Message";
import OpenAI from "openai";

interface AgentResponse {
  text: string;
  audioUrl?: string;
}

export class EnglishTeacherOrchestrator {
  private orchestrator: MultiAgentOrchestrator;
  private openAIClient: OpenAI;
  private audioCache: Map<string, string>;
  private readonly MAX_CACHE_SIZE = 100; // Maximum number of cached items
  private readonly MAX_PHRASE_LENGTH = 50; // Maximum characters in a cached phrase

  constructor() {
    this.openAIClient = createOpenAIClient();
    this.audioCache = new Map();

    // Create agents
    const vocabularyAgent = createVocabularyAgent(this.openAIClient);
    const conversationAgent = createConversationAgent(this.openAIClient);
    const fixerAgent = createFixerAgent(this.openAIClient);
    const classifier = createClassifier(process.env.OPENAI_API_KEY!);

    // Initialize the orchestrator
    this.orchestrator = new MultiAgentOrchestrator({
      classifier,
      defaultAgent: conversationAgent
    });
    
    // Add agents to the orchestrator
    this.orchestrator.addAgent(vocabularyAgent);
    this.orchestrator.addAgent(conversationAgent);
    this.orchestrator.addAgent(fixerAgent);

    console.debug('Orchestrator initialized with agents:', [
      vocabularyAgent.name, 
      conversationAgent.name, 
      fixerAgent.name
    ]);
  }

  /**
   * Split text into meaningful phrases for caching
   */
  private splitIntoPhrases(text: string): string[] {
    // Split on common punctuation that indicates phrase boundaries
    const rawPhrases = text.split(/([,.!?])\s+/);
    const phrases: string[] = [];
    
    let currentPhrase = '';
    for (const phrase of rawPhrases) {
      if (!phrase.trim()) continue;
      
      // If adding this phrase would exceed MAX_PHRASE_LENGTH, store current and start new
      if ((currentPhrase + ' ' + phrase).length > this.MAX_PHRASE_LENGTH && currentPhrase) {
        phrases.push(currentPhrase.trim());
        currentPhrase = phrase;
      } else {
        currentPhrase = currentPhrase ? `${currentPhrase} ${phrase}` : phrase;
      }
    }
    
    if (currentPhrase) {
      phrases.push(currentPhrase.trim());
    }

    return phrases.filter(p => p.length > 0);
  }

  /**
   * Generate speech for a single phrase
   */
  private async generateSpeechForPhrase(phrase: string): Promise<string> {
    const cacheKey = phrase.toLowerCase().trim();

    // Check cache first
    const cachedAudio = this.audioCache.get(cacheKey);
    if (cachedAudio) {
      console.debug(`Cache hit for phrase: "${phrase}"`);
      return cachedAudio;
    }

    console.debug(`Cache miss for phrase: "${phrase}"`);
    try {
      const mp3 = await this.openAIClient.audio.speech.create({
        model: "tts-1",
        voice: "nova",
        input: phrase,
      });

      const arrayBuffer = await mp3.arrayBuffer();
      const base64String = Buffer.from(arrayBuffer).toString('base64');
      const base64Data = `data:audio/mp3;base64,${base64String}`;

      // Cache the result if it's not too large
      if (base64Data.length < 1024 * 1024) { // 1MB limit for phrase cache
        if (this.audioCache.size >= this.MAX_CACHE_SIZE) {
          const firstKey = this.audioCache.keys().next().value;
          this.audioCache.delete(firstKey);
        }
        this.audioCache.set(cacheKey, base64Data);
        console.debug(`Cached phrase: "${phrase}"`);
      }

      return base64Data;
    } catch (error) {
      console.error('Error generating speech for phrase:', phrase, error);
      return '';
    }
  }

  /**
   * Concatenate multiple base64 audio strings
   */
  private async concatenateAudioBase64(base64Audios: string[]): Promise<string> {
    try {
      // Extract the actual base64 data from each string (remove the data:audio/mp3;base64, prefix)
      const buffers = base64Audios.map(base64Audio => {
        const base64Data = base64Audio.split(',')[1];
        return Buffer.from(base64Data, 'base64');
      });

      // Concatenate all buffers
      const concatenatedBuffer = Buffer.concat(buffers);
      
      // Convert back to base64 with the proper prefix
      return `data:audio/mp3;base64,${concatenatedBuffer.toString('base64')}`;
    } catch (error) {
      console.error('Error concatenating audio:', error);
      // Return the first audio segment as fallback
      return base64Audios[0];
    }
  }

  /**
   * Generate speech from text using OpenAI TTS with phrase-level caching
   */
  private async generateSpeech(text: string): Promise<string> {
    const startTime = Date.now();
    console.debug('Starting TTS generation for text:', text);

    // Split into phrases
    const phrases = this.splitIntoPhrases(text);
    console.debug('Split into phrases:', phrases);

    // Generate audio for each phrase (potentially from cache)
    const audioPromises = phrases.map(phrase => this.generateSpeechForPhrase(phrase));
    const audioResults = await Promise.all(audioPromises);

    // Filter out any failed generations
    const validAudioResults = audioResults.filter(audio => audio.length > 0);

    if (validAudioResults.length === 0) {
      console.error('No valid audio generated for any phrase');
      return '';
    }

    // If we only have one phrase, return it directly
    if (validAudioResults.length === 1) {
      console.debug(`Single phrase TTS completed in ${Date.now() - startTime}ms`);
      return validAudioResults[0];
    }

    // Concatenate all audio segments
    console.debug(`Concatenating ${validAudioResults.length} audio segments`);
    const concatenatedAudio = await this.concatenateAudioBase64(validAudioResults);
    console.debug(`Multi-phrase TTS completed in ${Date.now() - startTime}ms`);
    return concatenatedAudio;
  }

  /**
   * Process input text through the appropriate agent with conversation type context
   */
  async processInput(text: string, userId: string, conversationId: string): Promise<AgentResponse> {
    const startTime = Date.now();
    try {
      console.debug('Starting to process input:', text);
      
      // Get the conversation to determine its type
      const conversation = await ConversationService.getConversationById(conversationId);
      if (!conversation) {
        throw new Error('Conversation not found');
      }
      
      // Add conversation type to context
      const conversationType = conversation.type || 'Free';
      const contextData = { conversationType };
      
      const routingStartTime = Date.now();
      const response = await this.orchestrator.routeRequest(
        text,
        userId,
        conversationId,
        contextData // Pass type as context to agents
      );
      console.debug(`Routing and agent response completed in ${Date.now() - routingStartTime}ms`);

      // Extract the text response
      let textResponse: string;
      if (typeof response === 'string') {
        textResponse = response;
      } else if (response && typeof response === 'object') {
        const responseObj = response as { output?: string; content?: string[] };
        // Handle response object
        if (responseObj.output) {
          textResponse = responseObj.output;
        } else if (responseObj.content && Array.isArray(responseObj.content) && responseObj.content.length > 0) {
          textResponse = responseObj.content[0];
        } else {
          console.warn('Unexpected response format:', response);
          textResponse = 'No response generated';
        }
      } else {
        textResponse = 'No response generated';
      }

      // Clean up the text response
      textResponse = textResponse.trim();
      if (!textResponse) {
        textResponse = 'No response generated';
      }

      console.debug('Extracted text response:', textResponse);

      // Generate speech for the response
      const ttsStartTime = Date.now();
      const audioUrl = await this.generateSpeech(textResponse);
      console.debug(`TTS generation completed in ${Date.now() - ttsStartTime}ms`);

      const result = {
        text: textResponse,
        audioUrl: audioUrl || undefined
      };

      console.debug(`Total processing time: ${Date.now() - startTime}ms`);
      return result;
    } catch (error) {
      console.error('Orchestration error:', error);
      return {
        text: 'Sorry, I encountered an error processing your request.'
      };
    }
  }

  /**
   * Generate a conversation opening based on type
   */
  async generateConversationOpening(_userId: string, type: string): Promise<AgentResponse> {
    const prompt = `You are an English teacher for Hebrew-speaking children. 
      Generate a friendly opening message for a ${type} conversation. 
      For QnA, be ready to answer questions. 
      For Test, explain you'll be testing their knowledge. 
      For Free, encourage open conversation. 
      For Teach, explain you'll help them learn new concepts.
      Keep your response 2 sentences, friendly, and appropriate for children aged 5-12 and should only refert to ${type} conversation.`;
    
    try {
      const response = await this.openAIClient.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: prompt }]
      });
      
      const text = response.choices[0].message.content || `Welcome to your ${type} English session!`;
      const audioUrl = await this.generateSpeech(text);
      
      return { text, audioUrl };
    } catch (error) {
      console.error('Error generating conversation opening:', error);
      return { 
        text: `Welcome to your ${type} English session! I'm here to help you practice.`
      };
    }
  }
  
  /**
   * Generate a conversation summary and title when ending a conversation
   */
  async generateConversationSummary(conversationId: string): Promise<{ title: string, summary: string }> {
    try {
      // Get the conversation with its messages
      const conversation = await ConversationService.getConversationById(conversationId);
      if (!conversation) {
        throw new Error('Conversation not found');
      }
      
      // Get messages for this conversation
      const messages = await MessageService.getConversationMessages(conversationId);
      
      // Create a condensed message history for the LLM
      const messageHistory = messages.map((msg: IMessage) => 
        `${msg.sender.toUpperCase()}: ${msg.text}`
      ).join("\n").slice(0, 4000); // Limit size to fit in context window
      
      const prompt = `Here is a transcript of a ${conversation.type} English learning conversation with a child:
        ${messageHistory}
        
        Based on this conversation, provide:
        1. TITLE: A short, concise title that captures the essence of this conversation (max 50 characters)
        2. SUMMARY: A brief summary (2-3 sentences) highlighting what was discussed and any learning outcomes`;
      
      const response = await this.openAIClient.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: prompt }]
      });
      
      const content = response.choices[0].message.content || "";
      
      // Extract title and summary using regex
      const titleMatch = content.match(/TITLE:\s*(.*?)(?:\n|$)/i);
      const summaryMatch = content.match(/SUMMARY:\s*(.*?)(?:\n|$)/i);
      
      const title = titleMatch ? titleMatch[1].trim() : conversation.title || "Untitled Conversation";
      const summary = summaryMatch ? summaryMatch[1].trim() : "No summary available.";
      
      return { title, summary };
    } catch (error) {
      console.error('Error generating conversation summary:', error);
      return { 
        title: "English Practice Session", 
        summary: "A conversation to practice English skills."
      };
    }
  }
  
  /**
   * End the current conversation and generate a summary
   */
  async endConversation(conversationId: string): Promise<void> {
    try {
      // Generate summary and title
      const { title, summary } = await this.generateConversationSummary(conversationId);
      
      // Update the conversation in the database
      await ConversationService.completeConversationWithSummary(conversationId, summary, title);
      
      // Reset the orchestrator session
      this.resetConversation();
    } catch (error) {
      console.error('Error ending conversation:', error);
    }
  }

  /**
   * Reset the conversation
   */
  resetConversation(): void {
    //this.sessionId = `session-${Date.now()}`;
  }

  /**
   * Get the current chat history
   */
  getChatHistory(): ConversationMessage[] {
    return [];  // Chat history is handled internally by the orchestrator
  }

  /**
   * Clear the audio cache
   */
  clearAudioCache(): void {
    this.audioCache.clear();
    console.debug('Audio cache cleared');
  }
} 