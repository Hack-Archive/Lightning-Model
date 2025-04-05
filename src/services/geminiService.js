import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

const defaultGenerationConfig = {
  temperature: 0.7,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 1024,
};

const MODEL_NAME = 'gemini-1.5-flash';

class GeminiService {
  constructor() {
    this.model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      generationConfig: defaultGenerationConfig,
    });
  }

  async sendMessage(message, chatHistory = []) {
    try {
      const startTime = Date.now();
      const formattedMessage = this.addCodeFormattingInstructions(message);
      
      const chat = this.model.startChat({
        history: chatHistory.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        })),
      });
      
      const result = await chat.sendMessage(formattedMessage);
      const response = result.response;
      const responseText = response.text();
      const formattedResponse = this.formatResponseWithCodeBlocks(responseText);
      const latencyMs = Date.now() - startTime;
      
      return {
        content: formattedResponse,
        latencyMs,
      };
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw error;
    }
  }