import axios from 'axios';

const API_URL = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_URL) || '/api';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

export async function fetchStatic<T>(path: string): Promise<T> {
  const res = await fetch(`/data/${path}`);
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);
