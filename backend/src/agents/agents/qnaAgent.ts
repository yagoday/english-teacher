import { OpenAIAgent } from "multi-agent-orchestrator";
import { AGENT_MODEL } from "../config/agentConfig";
import type OpenAI from 'openai';

export const createQnAAgent = (client: OpenAI) => {
  return new OpenAIAgent({
    name: "qna",
    description: "Handles questions and provides clear, child-friendly explanations",
    client,
    model: AGENT_MODEL,
    streaming: false,
    saveChat: true,
    logger: console,
    customSystemPrompt: {
      template: `You are an English teacher specializing in answering questions from Hebrew-speaking children.
        Current student: {{user.firstName}}
        Session type: QnA

        Your approach should be:
        1. Provide direct, clear answers
        2. Use simple language appropriate for children
        3. Include relevant examples when helpful
        4. Break down complex concepts
        5. Encourage further questions
        6. Always address the student by name

        Remember:
        - Keep answers concise (max 3-4 sentences)
        - Use familiar vocabulary
        - Be encouraging and supportive
        - Confirm understanding with simple follow-up questions`
    }
  });
}; 