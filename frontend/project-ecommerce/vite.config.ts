import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendHost = env.VITE_BACKEND_HOST || 'http://localhost:8080'

  return {
    plugins: [
      tailwindcss(),
      react(),
      babel({ presets: [reactCompilerPreset()] })
    ],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: backendHost,
          changeOrigin: true,
          secure: false,
        },
        '/healthz': {
          target: backendHost,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})
