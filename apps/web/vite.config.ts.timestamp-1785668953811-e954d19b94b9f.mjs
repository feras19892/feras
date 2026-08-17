// vite.config.ts
import { defineConfig } from "file:///C:/Users/feras/Desktop/feras/node_modules/vite/dist/node/index.js";
import vue from "file:///C:/Users/feras/Desktop/feras/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import Inspect from "file:///C:/Users/feras/Desktop/feras/node_modules/vite-plugin-inspect/dist/index.mjs";
import VueDevtools from "file:///C:/Users/feras/Desktop/feras/node_modules/vite-plugin-vue-devtools/dist/vite.mjs";
import { fileURLToPath, URL } from "node:url";
var __vite_injected_original_import_meta_url = "file:///C:/Users/feras/Desktop/feras/apps/web/vite.config.ts";
var vite_config_default = defineConfig(({ mode }) => ({
  plugins: [
    vue(),
    Inspect({
      enabled: mode === "development",
      build: false,
      outputDir: ".vite-inspect"
    }),
    VueDevtools({ launchEditor: "code" })
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", __vite_injected_original_import_meta_url)),
      "@shared": fileURLToPath(new URL("./src/shared", __vite_injected_original_import_meta_url)),
      "@modules": fileURLToPath(new URL("./src/modules", __vite_injected_original_import_meta_url))
    }
  },
  optimizeDeps: {
    exclude: ["@my-modern-app/math-engine"]
  },
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("vue") || id.includes("vue-router") || id.includes("pinia")) return "vendor-framework";
            if (id.includes("three") || id.includes("@tresjs")) return "vendor-three";
            if (id.includes("pixi")) return "vendor-pixi";
            if (id.includes("matter-js") || id.includes("box2d") || id.includes("liquidfun")) return "vendor-physics";
            if (id.includes("katex")) return "vendor-katex";
            if (id.includes("splitpanes")) return "vendor-splitpanes";
            if (id.includes("chart") || id.includes("d3") || id.includes("echarts")) return "vendor-charts";
            if (id.includes("sentry")) return "vendor-sentry";
            return "vendor";
          }
          if (id.includes("/modules/chemistry/")) return "chemistry";
          if (id.includes("/pages/admin")) return "admin";
          if (id.includes("/locales/electric-workshop") || id.includes("/locales/electricWorkshop")) return "locale-electric-workshop";
          if (id.includes("/locales/biology")) return "locale-biology";
          if (id.includes("/locales/chemistry")) return "locale-chemistry";
          if (id.includes("/locales/experiments/")) return "locale-experiments";
          if (id.includes("/locales/")) return "locale-shared";
        }
      }
    }
  },
  server: {
    port: 5173,
    host: "0.0.0.0",
    cors: true,
    allowedHosts: [".trycloudflare.com", ".loca.lt", ".serveousercontent.com", ".ngrok-free.dev", ".ngrok.io"],
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true
      }
    }
  },
  preview: {
    port: 5173,
    host: "0.0.0.0",
    cors: true,
    allowedHosts: [".trycloudflare.com", ".loca.lt", ".serveousercontent.com", ".ngrok-free.dev", ".ngrok.io"],
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true
      }
    }
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxmZXJhc1xcXFxEZXNrdG9wXFxcXGZlcmFzXFxcXGFwcHNcXFxcd2ViXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxmZXJhc1xcXFxEZXNrdG9wXFxcXGZlcmFzXFxcXGFwcHNcXFxcd2ViXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9mZXJhcy9EZXNrdG9wL2ZlcmFzL2FwcHMvd2ViL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgdnVlIGZyb20gJ0B2aXRlanMvcGx1Z2luLXZ1ZSc7XG5pbXBvcnQgSW5zcGVjdCBmcm9tICd2aXRlLXBsdWdpbi1pbnNwZWN0JztcbmltcG9ydCBWdWVEZXZ0b29scyBmcm9tICd2aXRlLXBsdWdpbi12dWUtZGV2dG9vbHMnO1xuaW1wb3J0IHsgZmlsZVVSTFRvUGF0aCwgVVJMIH0gZnJvbSAnbm9kZTp1cmwnO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiAoe1xuICBwbHVnaW5zOiBbXG4gICAgdnVlKCksXG4gICAgSW5zcGVjdCh7XG4gICAgICBlbmFibGVkOiBtb2RlID09PSAnZGV2ZWxvcG1lbnQnLFxuICAgICAgYnVpbGQ6IGZhbHNlLFxuICAgICAgb3V0cHV0RGlyOiAnLnZpdGUtaW5zcGVjdCcsXG4gICAgfSksXG4gICAgVnVlRGV2dG9vbHMoeyBsYXVuY2hFZGl0b3I6ICdjb2RlJyB9KSxcbiAgXSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICAnQCc6IGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnLi9zcmMnLCBpbXBvcnQubWV0YS51cmwpKSxcbiAgICAgICdAc2hhcmVkJzogZmlsZVVSTFRvUGF0aChuZXcgVVJMKCcuL3NyYy9zaGFyZWQnLCBpbXBvcnQubWV0YS51cmwpKSxcbiAgICAgICdAbW9kdWxlcyc6IGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnLi9zcmMvbW9kdWxlcycsIGltcG9ydC5tZXRhLnVybCkpLFxuICAgIH0sXG4gIH0sXG4gIG9wdGltaXplRGVwczoge1xuICAgIGV4Y2x1ZGU6IFsnQG15LW1vZGVybi1hcHAvbWF0aC1lbmdpbmUnXSxcbiAgfSxcbiAgYnVpbGQ6IHtcbiAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDcwMCxcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgbWFudWFsQ2h1bmtzKGlkOiBzdHJpbmcpIHtcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcycpKSB7XG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ3Z1ZScpIHx8IGlkLmluY2x1ZGVzKCd2dWUtcm91dGVyJykgfHwgaWQuaW5jbHVkZXMoJ3BpbmlhJykpIHJldHVybiAndmVuZG9yLWZyYW1ld29yayc7XG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ3RocmVlJykgfHwgaWQuaW5jbHVkZXMoJ0B0cmVzanMnKSkgcmV0dXJuICd2ZW5kb3ItdGhyZWUnO1xuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdwaXhpJykpIHJldHVybiAndmVuZG9yLXBpeGknO1xuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdtYXR0ZXItanMnKSB8fCBpZC5pbmNsdWRlcygnYm94MmQnKSB8fCBpZC5pbmNsdWRlcygnbGlxdWlkZnVuJykpIHJldHVybiAndmVuZG9yLXBoeXNpY3MnO1xuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdrYXRleCcpKSByZXR1cm4gJ3ZlbmRvci1rYXRleCc7XG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ3NwbGl0cGFuZXMnKSkgcmV0dXJuICd2ZW5kb3Itc3BsaXRwYW5lcyc7XG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ2NoYXJ0JykgfHwgaWQuaW5jbHVkZXMoJ2QzJykgfHwgaWQuaW5jbHVkZXMoJ2VjaGFydHMnKSkgcmV0dXJuICd2ZW5kb3ItY2hhcnRzJztcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnc2VudHJ5JykpIHJldHVybiAndmVuZG9yLXNlbnRyeSc7XG4gICAgICAgICAgICByZXR1cm4gJ3ZlbmRvcic7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnL21vZHVsZXMvY2hlbWlzdHJ5LycpKSByZXR1cm4gJ2NoZW1pc3RyeSc7XG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCcvcGFnZXMvYWRtaW4nKSkgcmV0dXJuICdhZG1pbic7XG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCcvbG9jYWxlcy9lbGVjdHJpYy13b3Jrc2hvcCcpIHx8IGlkLmluY2x1ZGVzKCcvbG9jYWxlcy9lbGVjdHJpY1dvcmtzaG9wJykpIHJldHVybiAnbG9jYWxlLWVsZWN0cmljLXdvcmtzaG9wJztcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJy9sb2NhbGVzL2Jpb2xvZ3knKSkgcmV0dXJuICdsb2NhbGUtYmlvbG9neSc7XG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCcvbG9jYWxlcy9jaGVtaXN0cnknKSkgcmV0dXJuICdsb2NhbGUtY2hlbWlzdHJ5JztcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJy9sb2NhbGVzL2V4cGVyaW1lbnRzLycpKSByZXR1cm4gJ2xvY2FsZS1leHBlcmltZW50cyc7XG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCcvbG9jYWxlcy8nKSkgcmV0dXJuICdsb2NhbGUtc2hhcmVkJztcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAgc2VydmVyOiB7XG4gICAgcG9ydDogNTE3MyxcbiAgICBob3N0OiAnMC4wLjAuMCcsXG4gICAgY29yczogdHJ1ZSxcbiAgICBhbGxvd2VkSG9zdHM6IFsnLnRyeWNsb3VkZmxhcmUuY29tJywgJy5sb2NhLmx0JywgJy5zZXJ2ZW91c2VyY29udGVudC5jb20nLCAnLm5ncm9rLWZyZWUuZGV2JywgJy5uZ3Jvay5pbyddLFxuICAgIHByb3h5OiB7XG4gICAgICAnL2FwaSc6IHtcbiAgICAgICAgdGFyZ2V0OiAnaHR0cDovL2xvY2FsaG9zdDozMDAwJyxcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICBwcmV2aWV3OiB7XG4gICAgcG9ydDogNTE3MyxcbiAgICBob3N0OiAnMC4wLjAuMCcsXG4gICAgY29yczogdHJ1ZSxcbiAgICBhbGxvd2VkSG9zdHM6IFsnLnRyeWNsb3VkZmxhcmUuY29tJywgJy5sb2NhLmx0JywgJy5zZXJ2ZW91c2VyY29udGVudC5jb20nLCAnLm5ncm9rLWZyZWUuZGV2JywgJy5uZ3Jvay5pbyddLFxuICAgIHByb3h5OiB7XG4gICAgICAnL2FwaSc6IHtcbiAgICAgICAgdGFyZ2V0OiAnaHR0cDovL2xvY2FsaG9zdDozMDAwJyxcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxufSkpO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUErUyxTQUFTLG9CQUFvQjtBQUM1VSxPQUFPLFNBQVM7QUFDaEIsT0FBTyxhQUFhO0FBQ3BCLE9BQU8saUJBQWlCO0FBQ3hCLFNBQVMsZUFBZSxXQUFXO0FBSjRKLElBQU0sMkNBQTJDO0FBTWhQLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsS0FBSyxPQUFPO0FBQUEsRUFDekMsU0FBUztBQUFBLElBQ1AsSUFBSTtBQUFBLElBQ0osUUFBUTtBQUFBLE1BQ04sU0FBUyxTQUFTO0FBQUEsTUFDbEIsT0FBTztBQUFBLE1BQ1AsV0FBVztBQUFBLElB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
