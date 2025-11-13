// Database Layer - MongoDB API Client

class Database {
  constructor() {
    // Get API base URL dynamically
    this.getApiBaseUrl = () => {
      if (window.API_CONFIG?.getApiBaseUrl) {
        return window.API_CONFIG.getApiBaseUrl();
      }
      // Fallback: use relative URL
      return '/api';
    };
  }

  async getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  // Project operations
  async saveProject(project) {
    try {
      const response = await fetch(`${this.getApiBaseUrl()}/projects`, {
        method: 'POST',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify(project),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save project');
      }

      return await response.json();
    } catch (error) {
      console.error('Save project error:', error);
      throw error;
    }
  }

  async getAllProjects() {
    try {
      const response = await fetch(`${this.getApiBaseUrl()}/projects`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }

      return await response.json();
    } catch (error) {
      console.error('Get all projects error:', error);
      // Return empty array on error
      return [];
    }
  }

  async getProjectById(id) {
    try {
      const response = await fetch(`${this.getApiBaseUrl()}/projects/${id}`);
      
      if (!response.ok) {
        throw new Error('Project not found');
      }

      return await response.json();
    } catch (error) {
      console.error('Get project error:', error);
      throw error;
    }
  }

  async getUserProjects(userId) {
    try {
      const response = await fetch(`${this.getApiBaseUrl()}/projects/user/${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch user projects');
      }

      return await response.json();
    } catch (error) {
      console.error('Get user projects error:', error);
      return [];
    }
  }

  async updateProject(id, updates) {
    try {
      const response = await fetch(`${this.getApiBaseUrl()}/projects/${id}`, {
        method: 'PUT',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update project');
      }

      return await response.json();
    } catch (error) {
      console.error('Update project error:', error);
      throw error;
    }
  }

  // Contribution operations
  async saveContribution(contribution) {
    try {
      const response = await fetch(`${this.getApiBaseUrl()}/contributions`, {
        method: 'POST',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify(contribution),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save contribution');
      }

      return await response.json();
    } catch (error) {
      console.error('Save contribution error:', error);
      throw error;
    }
  }

  async getProjectContributions(projectId) {
    try {
      const response = await fetch(`${this.getApiBaseUrl()}/contributions/project/${projectId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch contributions');
      }

      return await response.json();
    } catch (error) {
      console.error('Get project contributions error:', error);
      return [];
    }
  }

  async getUserContributions(userId) {
    try {
      const response = await fetch(`${this.getApiBaseUrl()}/contributions/user/${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch user contributions');
      }

      return await response.json();
    } catch (error) {
      console.error('Get user contributions error:', error);
      return [];
    }
  }

  // Leaderboards
  async getContributionLeaderboard(limit = 10) {
    try {
      const response = await fetch(`${this.getApiBaseUrl()}/leaderboard/contributions?limit=${encodeURIComponent(limit)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch contribution leaderboard');
      }
      return await response.json();
    } catch (error) {
      console.error('Get contribution leaderboard error:', error);
      return [];
    }
  }

  async getPublishesLeaderboard(limit = 10) {
    try {
      const response = await fetch(`${this.getApiBaseUrl()}/leaderboard/publishes?limit=${encodeURIComponent(limit)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch publishes leaderboard');
      }
      return await response.json();
    } catch (error) {
      console.error('Get publishes leaderboard error:', error);
      return [];
    }
  }
}

// Export singleton instance
const db = new Database();
