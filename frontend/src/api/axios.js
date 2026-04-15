import axios from "axios";

const baseURL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "");

const instance = axios.create({
  baseURL,
  timeout: 8000,
  withCredentials: true,   // Always send cookies (httpOnly tokens) with every request
});

// ── Auto-refresh on 401 ───────────────────────────────────────────
// When the access token expires the server returns 401.
// We silently POST /auth/refresh — the browser automatically sends the
// httpOnly refresh cookie.  On success the server sets a fresh access
// token cookie and we retry the original request.

let isRefreshing = false;
let failedQueue  = [];

function processQueue(error) {
  failedQueue.forEach(p => (error ? p.reject(error) : p.resolve()));
  failedQueue = [];
}

instance.interceptors.response.use(
  response => response,
  async error => {
    const status     = error?.response?.status;
    const requestUrl = String(error?.config?.url || "");
    const isAuthCall = requestUrl.includes("/auth/login")    ||
                       requestUrl.includes("/auth/register") ||
                       requestUrl.includes("/auth/refresh");

    if (status === 401 && !isAuthCall && !error.config._retry) {
      // Queue additional requests while refresh is in flight
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => instance(error.config));
      }

      error.config._retry = true;
      isRefreshing = true;

      try {
        // No body needed — the refresh cookie is sent automatically by the browser
        await axios.post(`${baseURL}/auth/refresh`, {}, { withCredentials: true });
        processQueue(null);
        return instance(error.config);   // Retry original request with fresh cookie
      } catch (refreshErr) {
        processQueue(refreshErr);
        // Refresh failed — session is truly over; redirect to login
        if (typeof window !== "undefined" && window.location.pathname !== "/login") {
          window.location.replace("/login");
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default instance;
