// Centralized API configuration for Local & Production (Vercel)
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

/**
 * Resolves API URL based on environment:
 * - If VITE_API_BASE_URL is set (e.g. pointing to external backend), replaces localhost:8000 with it.
 * - In production on Vercel (without external base URL), converts localhost:8000 into relative /api/... routes.
 * - In local development, continues pointing to http://127.0.0.1:8000.
 */
export const apiUrl = (endpoint) => {
  if (!endpoint) return '';

  if (endpoint.startsWith('http://127.0.0.1:8000') || endpoint.startsWith('http://localhost:8000')) {
    if (API_BASE_URL) {
      return endpoint.replace(/https?:\/\/(127\.0\.0\.1|localhost):8000/, API_BASE_URL);
    }
    if (import.meta.env.PROD) {
      return endpoint.replace(/https?:\/\/(127\.0\.0\.1|localhost):8000/, '');
    }
    return endpoint;
  }
  
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }

  const clean = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${clean}`;
};

export default apiUrl;
