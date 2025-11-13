// API Configuration for MongoDB Backend
// Use relative URL when served from same server (avoids CORS issues)
const getApiBaseUrl = () => {
  // Always use relative URL when possible - works when frontend and backend are on same origin
  return '/api';
};

const API_CONFIG = {
  // Backend API URL - function that returns the base URL
  getApiBaseUrl: getApiBaseUrl,
  // You can use OpenAI, Hugging Face, or any summarization API
  SUMMARIZATION_API: "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
  // Or use OpenAI: "https://api.openai.com/v1/chat/completions"
};

// Make API_CONFIG globally available
window.API_CONFIG = API_CONFIG;
