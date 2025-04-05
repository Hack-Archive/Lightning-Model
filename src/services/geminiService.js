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

  addCodeFormattingInstructions(message) {
    const codeKeywords = [
      'code', 'program', 'function', 'script', 'algorithm', 
      'python', 'javascript', 'typescript', 'java', 'c++', 'c#'
    ];
    
    const containsCodeRequest = codeKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );
    
    if (containsCodeRequest) {
      return `${message}\n\nPlease format any code in your response using proper markdown code blocks with language specification. For example:
\`\`\`python
print("Hello World")
\`\`\``;
    }
    
    return message;
  }

  formatResponseWithCodeBlocks(response) {
    const indentedCodeBlockRegex = /(?:^|\n)( {4,}[^\n]+(?:\n {4,}[^\n]+)*)/g;
    
    let formattedResponse = response.replace(indentedCodeBlockRegex, (match, codeBlock) => {
      let language = this.detectCodeLanguage(codeBlock);
      const dedentedCode = codeBlock.replace(/^ {4}/gm, '');
      return `\n\`\`\`${language}\n${dedentedCode}\n\`\`\``;
    });
    
    const possibleInlineCodeRegex = /\b(if|def|function|var|let|const|import|from|class|return)\b[^`\n;{}[\]()]*[;{}[\]())]/g;
    
    formattedResponse = formattedResponse.replace(possibleInlineCodeRegex, (match) => {
      if (!match.includes('```')) {
        return `\`${match}\``;
      }
      return match;
    });
    
    return formattedResponse;
  }

  detectCodeLanguage(code) {
    code = code.toLowerCase();
    
    if (code.includes('def ') || code.includes('import ') && code.includes('print(')) {
      return 'python';
    } else if (code.includes('function') || code.includes('var ') || code.includes('let ') || code.includes('const ')) {
      return 'javascript';
    } else if (code.includes('public class') || code.includes('public static void main')) {
      return 'java';
    } else if (code.includes('#include') || code.includes('int main()')) {
      return 'cpp';
    } else if (code.includes('<html') || code.includes('<!doctype html')) {
      return 'html';
    } else if (code.includes('.then(') || code.includes('async/await')) {
      return 'javascript';
    } else {
      return 'plaintext';
    }
  }

  getEstimatedPrice() {
    const PRICE_PER_REQUEST = 0.000005;
    return PRICE_PER_REQUEST;
  }
}

const geminiService = new GeminiService();
export default geminiService;