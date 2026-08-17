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
    ...(mode === 'development' ? [VueDevtools({ launchEditor: 'code' })] : []),
    {
      name: 'production-protection',
      apply: 'build',
      transformIndexHtml(html) {
        return html.replace('</head>', `
  <script>
  (function(){
    setInterval(()=>{
      const w=window,f=Function,b=setInterval;
      if(w.outerWidth-w.innerWidth>200||w.outerHeight-w.innerHeight>200){
        document.body.style.filter='blur(15px)';
        document.body.innerHTML='<div style="position:fixed;inset:0;background:#0d1117;color:#f87171;display:flex;align-items:center;justify-content:center;font-size:1.5rem;flex-direction:column;gap:1rem;z-index:999999"><div>⚠️</div><div>DevTools معطول</div></div>';
      }
    },1500);
  })();
  </script>
  </head>`);
      },
    },
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
    sourcemap: false,
    chunkSizeWarningLimit: 700,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
      mangle: {
        toplevel: true,
      },
      format: {
        comments: false,
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            if (id.includes('vue') || id.includes('vue-router') || id.includes('pinia')) return 'vendor-framework';
            if (id.includes('three') || id.includes('@tresjs')) return 'vendor-three';
            if (id.includes('pixi')) return 'vendor-pixi';
            if (id.includes('matter-js') || id.includes('box2d') || id.includes('liquidfun')) return 'vendor-physics';
            if (id.includes('katex')) return 'vendor-katex';
            if (id.includes('splitpanes')) return 'vendor-splitpanes';
            if (id.includes('chart') || id.includes('d3') || id.includes('echarts')) return 'vendor-charts';
            if (id.includes('sentry')) return 'vendor-sentry';
            return 'vendor';
          }
          if (id.includes('/modules/chemistry/')) return 'chemistry';
          if (id.includes('/pages/admin')) return 'admin';
          if (id.includes('/pages/teacher') || id.includes('/components/teacher/')) return 'teacher';
          if (id.includes('/pages/school') || id.includes('/components/school/')) return 'school';
          if (id.includes('/pages/student') || id.includes('/components/student/')) return 'student';
          if (id.includes('/modules/physics/')) return 'physics';
          if (id.includes('/modules/biology/')) return 'biology';
          if (id.includes('/locales/electric-workshop') || id.includes('/locales/electricWorkshop')) return 'locale-electric-workshop';
          if (id.includes('/locales/biology')) return 'locale-biology';
          if (id.includes('/locales/chemistry')) return 'locale-chemistry';
          if (id.includes('/locales/experiments/')) return 'locale-experiments';
          if (id.includes('/locales/')) return 'locale-shared';
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
