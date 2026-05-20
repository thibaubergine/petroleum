import axios from 'axios';

// En production : données statiques JSON dans /public/data/
// En dev : proxy vers le backend FastAPI si disponible
const API_URL = import.meta.env.VITE_API_URL || '/api';
const USE_STATIC = import.meta.env.VITE_USE_STATIC === 'true' || import.meta.env.PROD;

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Helper pour charger les données statiques JSON
export async function fetchStatic<T>(path: string): Promise<T> {
  const res = await fetch(`/data/${path}`);
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
}

export { USE_STATIC };

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);
