// Centralized API configuration for local development and deployed clients.
export const API_URL = import.meta.env.VITE_API_URL || '';

/**
 * Resolves API URL based on environment:
 * - If VITE_API_URL is set, replaces local backend URLs with the deployed backend.
 * - Without it, converts local backend URLs into relative /api/... routes for the Vite proxy.
 */
export const apiUrl = (endpoint) => {
  if (!endpoint) return '';

  if (endpoint.startsWith('http://127.0.0.1:8000') || endpoint.startsWith('http://localhost:8000')) {
    if (API_URL) {
      return endpoint.replace(/https?:\/\/(127\.0\.0\.1|localhost):8000/, API_URL);
    }
    // Route via relative path so both Vite proxy (Laptop & Mobile) and Vercel serverless work seamlessly
    return endpoint.replace(/https?:\/\/(127\.0\.0\.1|localhost):8000/, '');
  }
  
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }

  const clean = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_URL}${clean}`;
};

export default apiUrl;
