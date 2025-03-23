import { MultiAgentOrchestrator, OpenAIAgent, OpenAIClassifier } from "multi-agent-orchestrator";
import { ConversationMessage } from "multi-agent-orchestrator";
import OpenAI from 'openai';

interface AgentResponse {
  text: string;
  audioUrl?: string;
}

export class EnglishTeacherOrchestrator {
  private orchestrator: MultiAgentOrchestrator;
  private userId: string;
  private sessionId: string;
  private openAIClient: OpenAI;
  private audioCache: Map<string, string>;
  private readonly MAX_CACHE_SIZE = 100; // Maximum number of cached items
  private readonly MAX_PHRASE_LENGTH = 50; // Maximum characters in a cached phrase

  constructor() {
    this.openAIClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.audioCache = new Map();

    // Initialize and add the vocabulary agent
    const vocabularyAgent = new OpenAIAgent({
      name: "vocabulary",
      description: "Specializes in explaining English vocabulary, word meanings, translations, and usage to Hebrew-speaking children",
      client: this.openAIClient,
      model: "gpt-3.5-turbo-0125",  // Faster model
      streaming: false,  // Disable streaming for now
      saveChat: true,
      logger: console,
      customSystemPrompt: {
        template: `You are a vocabulary teacher for Hebrew-speaking children learning English.
          First explain words using very simple English (1-2 short sentences).
          If they say no, respond with just: "[English word in Hebrew is [Hebrew word]"
          Example: "A dog is a friendly pet animal."
          If they say no: "dog is כלב"
          Always use examples from a child's daily life.
          Keep all responses brief and friendly.`
      }
    });

    // Initialize and add the conversation agent
    const conversationAgent = new OpenAIAgent({
      name: "conversation",
      description: "Handles general English conversation practice and dialogue with Hebrew-speaking children",
      client: this.openAIClient,
      model: "gpt-3.5-turbo-0125",  // Faster model
      streaming: false,  // Disable streaming for now
      saveChat: true,
      logger: console,
      customSystemPrompt: {
        template: `You are a friendly English teacher for Hebrew-speaking children.
          Keep responses short and simple, 1-2 sentences maximum.
          Use basic vocabulary they can understand.`
      }
    });

    // Initialize the OpenAI classifier
    const classifier = new OpenAIClassifier({
      apiKey: process.env.OPENAI_API_KEY!,
      modelId: "gpt-3.5-turbo-0125",  // Faster model
      inferenceConfig: {
        temperature: 0.3,
        maxTokens: 100
      }
    });

    // Set the classifier's system prompt
    classifier.setSystemPrompt(`You are a routing classifier for an English learning system.
      Your task is to analyze each input and route it to the most appropriate agent.
      You will receive the chat history to understand the context of each message.
      
      Available agents:
      1. "vocabulary": For questions about word meanings, translations, or usage
         Examples: "What does 'hello' mean?", "How do you say 'dog' in English?"
         IMPORTANT: If a user responds "no" or "I don't understand" after a vocabulary explanation,
         route back to "vocabulary" so it can provide the Hebrew translation.
      
      2. "conversation": For general conversation and practice
         Examples: "Hello!", "How are you?"

      Rules:
      - For questions about meanings or translations -> select "vocabulary"
      - For responses to vocabulary explanations (like "no", "I don't understand") -> select "vocabulary"
      - For greetings or general chat -> select "conversation"
      - When unsure -> select "conversation"

      You must use the analyzePrompt function with:
      - userinput: The original text
      - selected_agent: Either "vocabulary" or "conversation"
      - confidence: Number between 0 and 1`);

    // Initialize the orchestrator with the OpenAI classifier
    this.orchestrator = new MultiAgentOrchestrator({
      classifier,
      defaultAgent: conversationAgent
    });
    
    this.userId = 'default-user';
    this.sessionId = `session-${Date.now()}`;

    // Add agents to the orchestrator
    this.orchestrator.addAgent(vocabularyAgent);
    this.orchestrator.addAgent(conversationAgent);

    // Enable debug logging
    console.debug('Orchestrator initialized with agents:', [vocabularyAgent.name, conversationAgent.name]);
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
   * Process input text through the appropriate agent
   */
  async processInput(text: string): Promise<AgentResponse> {
    const startTime = Date.now();
    try {
      console.debug('Starting to process input:', text);
      
      const routingStartTime = Date.now();
      const response = await this.orchestrator.routeRequest(
        text,
        this.userId,
        this.sessionId
      );
      console.debug(`Routing and agent response completed in ${Date.now() - routingStartTime}ms`);
      // console.debug('Raw response:', response);

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

      // console.debug('Final response:', result);
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
   * Reset the conversation
   */
  resetConversation(): void {
    this.sessionId = `session-${Date.now()}`;
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