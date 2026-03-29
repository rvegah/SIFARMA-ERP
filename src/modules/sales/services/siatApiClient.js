// ============================================================================
// siatApiClient.js
// Cliente HTTP para el backend SiatAPI (.NET 8)
// ============================================================================

import axios from 'axios';

const SIAT_API_BASE_URL = import.meta.env.VITE_SIAT_API_URL || import.meta.env.VITE_API_URL;

const siatApiClient = axios.create({
  baseURL: SIAT_API_BASE_URL,
  timeout: 45000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

siatApiClient.interceptors.request.use(
  (config) => {
    if (import.meta.env.DEV) {
      console.log(`[SiatAPI] ${config.method?.toUpperCase()} ${config.url}`, config.data || '');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

siatApiClient.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(`[SiatAPI] ✅ ${response.config.url}`, response.data);
    }
    return response;
  },
  (error) => {
    if (import.meta.env.DEV) {
      console.error(`[SiatAPI] ❌ ${error.config?.url}`, error.response?.data || error.message);
    }
    return Promise.reject(error);
  }
);

export default siatApiClient;