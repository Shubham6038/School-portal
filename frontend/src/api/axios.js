import axios from 'axios';

const apiBaseUrl = import.meta.env.PROD
  ? 'https://school-portal-2-bb5g.onrender.com/api'
  : 'http://localhost:5000/api';

const API = axios.create({
  baseURL: apiBaseUrl,
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;