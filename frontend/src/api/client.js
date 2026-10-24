import axios from 'axios';

const rawEnvUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
let cleanBase = rawEnvUrl.trim().replace(/\/+$/, '');
// Ensure it ends with /api cleanly without duplicating (e.g. avoiding /api/api)
if (!cleanBase.endsWith('/api')) {
  cleanBase = `${cleanBase}/api`;
}
const API_BASE_URL = cleanBase;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const analyzeCase = async ({ firText, perspective }) => {
  const response = await apiClient.post('/analyze', {
    fir_text: firText,
    perspective: perspective,
  });
  return response.data;
};

export const verifyCitation = async ({ argument, passages }) => {
  const response = await apiClient.post('/verify', {
    argument,
    passages,
  });
  return response.data;
};

export const uploadPDF = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const checkHealth = async () => {
  const response = await apiClient.get('/health');
  return response.data;
};
