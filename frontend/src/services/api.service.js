const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://mdmcv4-backend-production-b615.up.railway.app/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async getArtists() { return this.request('/artists'); }
  async getArtist(id) { return this.request(`/artists/${id}`); }
  async createArtist(data) { return this.request('/artists', { method: 'POST', body: JSON.stringify(data) }); }
  async updateArtist(id, data) { return this.request(`/artists/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
  async deleteArtist(id) { return this.request(`/artists/${id}`, { method: 'DELETE' }); }
  
  async getSmartlinks() { return this.request('/smartlinks'); }
  async getSmartlink(id) { return this.request(`/smartlinks/${id}`); }
  async createSmartlink(data) { return this.request('/smartlinks', { method: 'POST', body: JSON.stringify(data) }); }
  async updateSmartlink(id, data) { return this.request(`/smartlinks/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
  async deleteSmartlink(id) { return this.request(`/smartlinks/${id}`, { method: 'DELETE' }); }
}

export default new ApiService();

