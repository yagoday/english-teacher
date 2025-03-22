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

  constructor() {
    this.openAIClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Initialize and add the vocabulary agent
    const vocabularyAgent = new OpenAIAgent({
      name: "vocabulary",  // Simplified name for matching
      description: "Specializes in explaining English vocabulary, word meanings, translations, and usage to Hebrew-speaking children",
      client: this.openAIClient,
      model: "gpt-4-0125-preview",  // GPT-4-0mini model
      streaming: false,
      saveChat: true,
      logger: console,
      customSystemPrompt: {
        template: `You are a vocabulary teacher for Hebrew-speaking children learning English.
          First explain words using very simple English (1-2 short sentences).
          Then ask "Do you understand?"
          If they say no, respond with just: "[English word] is [Hebrew word]"
          Example: "A dog is a friendly pet animal. Do you understand?"
          If they say no: "dog is כלב"
          Always use examples from a child's daily life.
          Keep all responses brief and friendly.`
      }
    });

    // Initialize and add the conversation agent
    const conversationAgent = new OpenAIAgent({
      name: "conversation",  // Simplified name for matching
      description: "Handles general English conversation practice and dialogue with Hebrew-speaking children",
      client: this.openAIClient,
      model: "gpt-4-0125-preview",  // GPT-4-0mini model
      streaming: false,
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
      modelId: "gpt-4-0125-preview",  // GPT-4-0mini model
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
   * Generate speech from text using OpenAI TTS
   */
  private async generateSpeech(text: string): Promise<string> {
    try {
      const mp3 = await this.openAIClient.audio.speech.create({
        model: "tts-1",
        voice: "nova", // Using a friendly, clear voice
        input: text,
      });

      // Convert the raw audio data to base64
      const buffer = Buffer.from(await mp3.arrayBuffer());
      return `data:audio/mp3;base64,${buffer.toString('base64')}`;
    } catch (error) {
      console.error('Error generating speech:', error);
      return '';
    }
  }

  /**
   * Process input text through the appropriate agent
   */
  async processInput(text: string): Promise<AgentResponse> {
    try {
      console.debug('Processing input:', text);
      const response = await this.orchestrator.routeRequest(
        text,
        this.userId,
        this.sessionId
      );
      console.debug('Received response:', response);

      // Extract the text response
      let textResponse: string;
      if (typeof response === 'string') {
        textResponse = response;
      } else {
        const responseObj = response as any;
        textResponse = responseObj.output || 
          (responseObj.content && Array.isArray(responseObj.content) && responseObj.content.length > 0 
            ? responseObj.content[0] 
            : 'No response generated');
      }

      // Generate speech for the response
      const audioUrl = await this.generateSpeech(textResponse);

      return {
        text: textResponse,
        audioUrl
      };
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
} 