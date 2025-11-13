// MongoDB API Authentication Handler

class AuthManager {
  constructor() {
    this.currentUser = null;
    this.authToken = null;
    this.authStateListeners = [];
  }

  async init() {
    // Check for stored token
    const token = localStorage.getItem('authToken');
    if (token) {
      this.authToken = token;
      await this.getCurrentUser();
    }
  }

  onAuthStateChanged(callback) {
    this.authStateListeners.push(callback);
    if (this.currentUser) {
      callback(this.currentUser);
    }
  }

  notifyAuthStateChange(user) {
    this.currentUser = user;
    this.authStateListeners.forEach(listener => listener(user));
  }

  async signUp(email, password, name) {
    try {
      const apiUrl = window.API_CONFIG?.getApiBaseUrl ? window.API_CONFIG.getApiBaseUrl() : '/api';
      const response = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Store token
      this.authToken = data.token;
      localStorage.setItem('authToken', data.token);

      // Set current user
      this.currentUser = {
        uid: data.user.id,
        email: data.user.email,
        displayName: data.user.name,
      };

      this.notifyAuthStateChange(this.currentUser);
      return this.currentUser;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  async signIn(email, password) {
    try {
      const apiUrl = window.API_CONFIG?.getApiBaseUrl ? window.API_CONFIG.getApiBaseUrl() : '/api';
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store token
      this.authToken = data.token;
      localStorage.setItem('authToken', data.token);

      // Set current user
      this.currentUser = {
        uid: data.user.id,
        email: data.user.email,
        displayName: data.user.name,
      };

      this.notifyAuthStateChange(this.currentUser);
      return this.currentUser;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  async signInWithGoogle() {
    // Google OAuth would require additional setup
    // For now, show a message
    throw new Error('Google Sign-In requires additional OAuth setup. Please use email/password for now.');
  }

  async getCurrentUser() {
    if (!this.authToken) {
      return null;
    }

    try {
      const apiUrl = window.API_CONFIG?.getApiBaseUrl ? window.API_CONFIG.getApiBaseUrl() : '/api';
      const response = await fetch(`${apiUrl}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
        },
      });

      if (!response.ok) {
        // Token invalid, clear it
        this.authToken = null;
        localStorage.removeItem('authToken');
        this.currentUser = null;
        this.notifyAuthStateChange(null);
        return null;
      }

      const data = await response.json();
      this.currentUser = {
        uid: data.id,
        email: data.email,
        displayName: data.name,
      };

      this.notifyAuthStateChange(this.currentUser);
      return this.currentUser;
    } catch (error) {
      console.error('Get current user error:', error);
      this.authToken = null;
      localStorage.removeItem('authToken');
      this.currentUser = null;
      this.notifyAuthStateChange(null);
      return null;
    }
  }

  async signOut() {
    try {
      this.authToken = null;
      this.currentUser = null;
      localStorage.removeItem('authToken');
      this.notifyAuthStateChange(null);
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  getAuthToken() {
    return this.authToken;
  }

  handleAuthError(error) {
    let message = 'An error occurred';
    if (error.message) {
      message = error.message;
    }
    return new Error(message);
  }
}

const authManager = new AuthManager();
