import OpenAI from 'openai';

export const createOpenAIClient = () => {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
};

export const AGENT_MODEL = "gpt-3.5-turbo-0125"; 