import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add response interceptor for better error handling
    this.client.interceptors.response.use(
      response => response,
      error => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // Sessions
  async createSession(sessionData) {
    const response = await this.client.post('/sessions', sessionData);
    return response.data;
  }

  async getSession(sessionId) {
    // Check if it's a 6-character code (for students)
    if (sessionId && sessionId.length === 6) {
      const response = await this.client.get(`/sessions/code/${sessionId}`);
      return response.data;
    }
    // Otherwise, use full ObjectId
    const response = await this.client.get(`/sessions/${sessionId}`);
    return response.data;
  }

  async endSession(sessionId) {
    const response = await this.client.patch(`/sessions/${sessionId}/end`);
    return response.data;
  }

  // Doubts
  async submitDoubt(doubtData) {
    console.log('📤 Submitting doubt:', doubtData);
    const response = await this.client.post('/doubts', doubtData);
    return response.data;
  }

  async getDoubts(sessionId, filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await this.client.get(`/doubts/session/${sessionId}?${params}`);
    return response.data;
  }

  async markAnswered(doubtId, answer = '') {
    console.log('✅ Marking doubt as answered:', doubtId);
    const response = await this.client.patch(`/doubts/${doubtId}/answer`, { answer });
    return response.data;
  }

  async upvoteDoubt(doubtId, studentId) {
    const response = await this.client.post(`/doubts/${doubtId}/upvote`, { studentId });
    return response.data;
  }

  // Confusion
  async submitConfusion(confusionData) {
    console.log('📊 Submitting confusion:', confusionData);
    const response = await this.client.post('/confusion', confusionData);
    return response.data;
  }

  async getConfusionStats(sessionId) {
    const response = await this.client.get(`/confusion/stats/${sessionId}`);
    return response.data;
  }

  // Analytics
  async getSessionAnalytics(sessionId) {
    const response = await this.client.get(`/analytics/session/${sessionId}`);
    return response.data;
  }
}

export default new ApiService();
