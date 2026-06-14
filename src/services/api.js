import axios from 'axios';

// Create two separate instances
const studentApi = axios.create({
  baseURL: 'https://fully-quiz-management-system-backend.onrender.com/api',
  withCredentials: false,
  headers: { 'Content-Type': 'application/json' }
});

const adminApi = axios.create({
  baseURL: 'https://fully-quiz-management-system-backend.onrender.com/api',
  withCredentials: false,
  headers: { 'Content-Type': 'application/json' }
});

// --------------------
// Student Request
// --------------------
studentApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log(`📤 Student API: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// --------------------
// Admin Request
// --------------------
adminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminAccessToken');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log(`📤 Admin API: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// --------------------
// Student Response (NO REFRESH LOGIC)
// --------------------
studentApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// --------------------
// Admin Response (NO REFRESH LOGIC)
// --------------------
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminAccessToken');
      localStorage.removeItem('admin');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// Export both instances
export { studentApi, adminApi };

// Default export for existing code
// const api = studentApi;
// export default api;