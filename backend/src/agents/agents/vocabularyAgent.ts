import { OpenAIAgent } from "multi-agent-orchestrator";
import { AGENT_MODEL } from "../config/agentConfig";
import type OpenAI from 'openai';

export const createVocabularyAgent = (client: OpenAI) => {
  return new OpenAIAgent({
    name: "vocabulary",
    description: "Specializes in explaining English vocabulary, word meanings, translations, and usage to Hebrew-speaking children",
    client,
    model: AGENT_MODEL,
    streaming: false,
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
}; 