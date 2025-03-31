import { defineConfig } from 'sanity';

export default defineConfig({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
  dataset: import.meta.env.VITE_SANITY_DATASET,
  apiVersion: '2023-05-03',
  plugins: [],
  cors: {
    allowOrigins: [
      'http://localhost:5000',
      'http://localhost:5173', // Vite default port
      'http://127.0.0.1:5000'
    ],
    allowCredentials: true,
    allowHeaders: [
      'Authorization',
      'Content-Type',
      'X-Sanity-Project-ID'
    ],
    allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS']
  },
  // Add CORS options
  api: {
    cors: true,
    credentials: true,
    withCredentials: true
  }
});
