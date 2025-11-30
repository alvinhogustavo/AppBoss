
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Setting the third parameter to '' loads all env vars regardless of the `VITE_` prefix.
  const env = loadEnv(mode, (process as any).cwd(), '')

  return {
    plugins: [react()],
    define: {
      // This is crucial: it replaces 'process.env.API_KEY' in your code
      // with the actual value from Vercel's environment variables during build.
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    },
  }
})