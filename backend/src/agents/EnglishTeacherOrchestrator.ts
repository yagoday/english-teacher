import { MultiAgentOrchestrator } from "multi-agent-orchestrator";
import { createOpenAIClient } from "./config/agentConfig";
import { createVocabularyAgent } from "./agents/vocabularyAgent";
import { createConversationAgent } from "./agents/conversationAgent";
import { createFixerAgent } from "./agents/fixerAgent";
import { createClassifier } from "./agents/classifier";
import { ConversationService } from "../services/conversationService";
import { MessageService } from "../services/messageService";
import { IMessage } from "../models/Message";
import OpenAI from "openai";
import { SpeechUtils } from "./utils/speechUtils";
import { UserService } from "../services/userService";

interface AgentResponse {
  text: string;
  audioUrl?: string;
}

export class EnglishTeacherOrchestrator {
  private orchestrator: MultiAgentOrchestrator;
  private openAIClient: OpenAI;
  private speechUtils: SpeechUtils;

  constructor() {
    this.openAIClient = createOpenAIClient();
    this.speechUtils = new SpeechUtils(this.openAIClient);

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
      const audioUrl = await this.speechUtils.generateSpeech(textResponse);
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
  async generateConversationOpening(userId: string, type: string): Promise<AgentResponse> {
    try {
      // Get user information
      const user = await UserService.getUserById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const firstName = user.name.split(' ')[0];
      
      // Define type-specific prompts and fallbacks
      const typePrompts = {
        QnA: {
          prompt: `You are an English teacher for Hebrew-speaking children.
            ${firstName} is here for a Question and Answer session.
            Create a warm, inviting opening that:
            1. Greets ${firstName} personally
            2. Tell them you are about to ask them questions to help them learn English
            3. Start with a simple question, like how is there day going or something similar.
            Keep it to 2-3 short, simple sentences.
            Make it sound natural and friendly, like talking to a young friend.`,
          fallback: `Hi ${firstName}! I'm excited to answer all your English questions today. What would you like to know about?`
        },
        Free: {
          prompt: `You are an English teacher for Hebrew-speaking children.
            ${firstName} is here for a free conversation practice.
            Create a casual, friendly opening that:
            1. Greets ${firstName} warmly
            2. Invites them to chat about anything they like
            3. Makes them feel excited about practicing English conversation
            Keep it to 2-3 short, simple sentences.
            Make it playful and encouraging.`,
          fallback: `Hey ${firstName}! Let's have a fun chat in English about anything you like. What's on your mind today?`
        },
        Teach: {
          prompt: `You are an English teacher for Hebrew-speaking children.
            ${firstName} is here to learn new English concepts.
            Create an enthusiastic opening that:
            1. Greets ${firstName} with energy
            2. Mentions you'll be learning new things together
            3. Makes learning sound exciting and fun
            4. Ask them to think of a word or phrase they want to learn
            Keep it to 2-3 short, simple sentences.
            Make it motivating and positive.`,
          fallback: `Hi ${firstName}! I'm excited to teach you some cool new English words and phrases today. Are you ready to learn something fun?`
        }
      };

      const typeConfig = typePrompts[type as keyof typeof typePrompts] || typePrompts.Free;
      
      try {
        const response = await this.openAIClient.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "system", content: typeConfig.prompt }]
        });
        
        const text = response.choices[0].message.content || typeConfig.fallback;
        const audioUrl = await this.speechUtils.generateSpeech(text);
        
        return { text, audioUrl };
      } catch (error) {
        console.error('Error generating conversation opening:', error);
        return { text: typeConfig.fallback };
      }
    } catch (error) {
      console.error('Error getting user:', error);
      return {
        text: `Welcome to your English session! I'm here to help you practice.`
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
    } catch (error) {
      console.error('Error ending conversation:', error);
    }
  }

  /**
   * Clear the audio cache
   */
  clearAudioCache(): void {
    this.speechUtils.clearAudioCache();
    console.debug('Audio cache cleared');
  }
} 