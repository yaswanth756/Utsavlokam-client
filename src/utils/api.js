// Centralized API configuration for the frontend
// Reads from Vite env var VITE_BACKEND_API; falls back to localhost during development

export const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API || "http://localhost:3000";

export function buildApiUrl(path) {
  const normalizedBase = BACKEND_API_URL.replace(/\/$/, "");
  const normalizedPath = String(path || "").startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}


