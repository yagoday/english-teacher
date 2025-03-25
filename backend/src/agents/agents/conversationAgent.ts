import { OpenAIAgent } from "multi-agent-orchestrator";
import { AGENT_MODEL } from "../config/agentConfig";
import type OpenAI from 'openai';

export const createConversationAgent = (client: OpenAI) => {
  return new OpenAIAgent({
    name: "conversation",
    description: "Handles general English conversation practice and dialogue with Hebrew-speaking children",
    client,
    model: AGENT_MODEL,
    streaming: false,
    saveChat: true,
    logger: console,
    customSystemPrompt: {
      template: `You are a friendly English teacher for Hebrew-speaking children.
        Keep responses short and simple, 1-3 sentences maximum.
        Use basic vocabulary they can understand.`
    }
  });
}; 