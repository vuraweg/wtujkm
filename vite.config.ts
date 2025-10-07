import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  optimizeDeps: {
    exclude: ['lucide-react'],
  },

  // 👇 Add this section to route API requests through your dev server
  server: {
    proxy: {
      '/longchat': {
        target: 'https://api.longchat.dev', // ✅ Base URL of your LongChat API
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/longchat/, ''),
      },
    },
  },
});
