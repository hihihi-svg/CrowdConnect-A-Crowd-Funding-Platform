// API utilities for summarization and other services

class API {
  constructor() {
    this.summarizationCache = new Map();
  }

  // Summarize project text using Hugging Face API (or OpenAI)
  async summarizeProject(project) {
    const cacheKey = `project_${project.id}`;
    if (this.summarizationCache.has(cacheKey)) {
      return this.summarizationCache.get(cacheKey);
    }

    const textToSummarize = `
      Title: ${project.title}
      Description: ${project.description}
      Motivation: ${project.motivation}
      Problem Statement: ${project.problemStatement}
      Solution: ${project.solution}
    `.trim();

    try {
      // Check if API_CONFIG is available and configured
      if (!window.API_CONFIG || !window.API_CONFIG.SUMMARIZATION_API || window.API_CONFIG.SUMMARIZATION_API.includes('YOUR_')) {
        // Use fallback summarization
        return this.summarizeText(textToSummarize);
      }

      // Using Hugging Face Inference API (free tier available)
      const response = await fetch(window.API_CONFIG.SUMMARIZATION_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer YOUR_HUGGINGFACE_TOKEN' // Replace with your token in config.js
        },
        body: JSON.stringify({
          inputs: textToSummarize,
          parameters: {
            max_length: 150,
            min_length: 50
          }
        })
      });

      if (!response.ok) {
        throw new Error('Summarization API failed');
      }

      const data = await response.json();
      const summary = Array.isArray(data) ? data[0]?.summary_text : data.summary_text || textToSummarize.substring(0, 200) + '...';
      
      this.summarizationCache.set(cacheKey, summary);
      return summary;
    } catch (error) {
      console.error('Summarization error:', error);
      // Fallback: return truncated text
      return this.summarizeText(textToSummarize);
    }
  }

  // Summarize multiple projects
  async summarizeProjects(projects) {
    const summaries = await Promise.all(
      projects.map(project => this.summarizeProject(project))
    );
    return summaries;
  }

  // Alternative: Simple text summarization (client-side fallback)
  summarizeText(text, maxLength = 200) {
    if (text.length <= maxLength) return text;
    const sentences = text.split(/[.!?]+/);
    let summary = '';
    for (const sentence of sentences) {
      if ((summary + sentence).length <= maxLength) {
        summary += sentence + '. ';
      } else {
        break;
      }
    }
    return summary || text.substring(0, maxLength) + '...';
  }
}

const api = new API();

