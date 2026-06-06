import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Load ALL env vars (no VITE_ prefix filter) so the key stays server-side
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: 'https://api.weather-ai.co/v1',
          changeOrigin: true,
          rewrite: path => path.replace(/^\/api/, ''),
          headers: { Authorization: `Bearer ${env.WEATHER_API_KEY}` },
        },
      },
    },
  }
})
