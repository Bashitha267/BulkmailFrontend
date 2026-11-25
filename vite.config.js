import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // Where `npm run dev` forwards /api calls. Defaults to a backend on this machine.
  const devTarget = env.VITE_DEV_API_TARGET || 'http://localhost:5000'

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': { target: devTarget, changeOrigin: true },
        '/uploads': { target: devTarget, changeOrigin: true },
      },
    },
  }
})
