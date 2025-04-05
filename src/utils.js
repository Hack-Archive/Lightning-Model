export const estimateTokenCount = (text) => {
    if (!text) return 0;
    return Math.ceil(text.length / 4);
  };
  
  export const estimateResponseTokens = (promptTokens) => {
    const multiplier = 1.2 + Math.random() * 0.6;
    return Math.floor(promptTokens * multiplier);
  };