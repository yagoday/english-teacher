import { OpenAIClassifier } from "multi-agent-orchestrator";
import { AGENT_MODEL } from "../config/agentConfig";

export const createClassifier = (apiKey: string) => {
  const classifier = new OpenAIClassifier({
    apiKey,
    modelId: AGENT_MODEL,
    inferenceConfig: {
      temperature: 0.3,
      maxTokens: 100
    }
  });

  classifier.setSystemPrompt(`You are a routing classifier for an English learning system.
    Your task is to analyze each input and route it to the most appropriate agent.
    You will receive the chat history to understand the context of each message.
    
    Available agents:
    1. "vocabulary": For questions about word meanings, translations, or usage
       Examples: "What does 'hello' mean?", "How do you say 'dog' in English?"
    
    2. "conversation": For general conversation and practice
       Examples: "Hello!", "How are you?"
    
    3. "fixer": For correcting grammar and pronunciation mistakes. Every input which is not proper english should be routed here.
       Examples: "I goes to school", "I eated lunch", any input with clear grammar mistakes
       Also route to "fixer" to verify correction attempts after a fix was suggested

    Rules:
    - For questions about meanings or translations -> select "vocabulary"
    - For responses to vocabulary explanations -> select "vocabulary"
    - For inputs with grammar/word usage mistakes, or bad english -> select "fixer"
    - For responses after a fixer correction -> select "fixer" to verify
    - For greetings or general chat -> select "conversation"
    - When unsure -> select "conversation"

    You must use the analyzePrompt function with:
    - userinput: The original text
    - selected_agent: "vocabulary", "conversation", or "fixer"
    - confidence: Number between 0 and 1`);

  return classifier;
}; 