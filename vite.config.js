import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/moneyfunx/',
  plugins: [],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
    extensions: ['.js', '.ts', '.json'],
  },
  test: {
    coverage: {
      provider: 'v8',
      include: ['src'],
    },
    exclue: ['build', 'node_modules'],
  },
});
