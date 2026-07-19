import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import Inspect from 'vite-plugin-inspect';
import VueDevtools from 'vite-plugin-vue-devtools';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig(({ mode }) => ({
  plugins: [
    vue(),
    Inspect({
      enabled: mode === 'development',
      build: false,
      outputDir: '.vite-inspect',
    }),
    VueDevtools({ launchEditor: 'code' }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@shared': fileURLToPath(new URL('./src/shared', import.meta.url)),
      '@modules': fileURLToPath(new URL('./src/modules', import.meta.url)),
    },
  },
  optimizeDeps: {
    exclude: ['@my-modern-app/math-engine'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            if (id.includes('vue') || id.includes('vue-router') || id.includes('pinia')) return 'vendor-framework';
            if (id.includes('chart') || id.includes('d3') || id.includes('echarts')) return 'vendor-charts';
            return 'vendor';
          }
          if (id.includes('/modules/chemistry/')) return 'chemistry';
          if (id.includes('/pages/admin')) return 'admin';
          if (id.includes('/locales/')) return 'locales';
        },
      },
    },
  },
  server: {
    port: 5173,
    host: '0.0.0.0',
    cors: true,
    allowedHosts: ['.trycloudflare.com', '.loca.lt', '.serveousercontent.com', '.ngrok-free.dev', '.ngrok.io'],
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 5173,
    host: '0.0.0.0',
    cors: true,
    allowedHosts: ['.trycloudflare.com', '.loca.lt', '.serveousercontent.com', '.ngrok-free.dev', '.ngrok.io'],
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
}));
