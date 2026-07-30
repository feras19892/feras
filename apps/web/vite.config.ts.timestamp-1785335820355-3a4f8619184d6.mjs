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
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("vue") || id.includes("vue-router") || id.includes("pinia")) return "vendor-framework";
            if (id.includes("chart") || id.includes("d3") || id.includes("echarts")) return "vendor-charts";
            return "vendor";
          }
          if (id.includes("/modules/chemistry/")) return "chemistry";
          if (id.includes("/pages/admin")) return "admin";
          if (id.includes("/locales/")) return "locales";
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxmZXJhc1xcXFxEZXNrdG9wXFxcXGZlcmFzXFxcXGFwcHNcXFxcd2ViXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxmZXJhc1xcXFxEZXNrdG9wXFxcXGZlcmFzXFxcXGFwcHNcXFxcd2ViXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9mZXJhcy9EZXNrdG9wL2ZlcmFzL2FwcHMvd2ViL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgdnVlIGZyb20gJ0B2aXRlanMvcGx1Z2luLXZ1ZSc7XG5pbXBvcnQgSW5zcGVjdCBmcm9tICd2aXRlLXBsdWdpbi1pbnNwZWN0JztcbmltcG9ydCBWdWVEZXZ0b29scyBmcm9tICd2aXRlLXBsdWdpbi12dWUtZGV2dG9vbHMnO1xuaW1wb3J0IHsgZmlsZVVSTFRvUGF0aCwgVVJMIH0gZnJvbSAnbm9kZTp1cmwnO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiAoe1xuICBwbHVnaW5zOiBbXG4gICAgdnVlKCksXG4gICAgSW5zcGVjdCh7XG4gICAgICBlbmFibGVkOiBtb2RlID09PSAnZGV2ZWxvcG1lbnQnLFxuICAgICAgYnVpbGQ6IGZhbHNlLFxuICAgICAgb3V0cHV0RGlyOiAnLnZpdGUtaW5zcGVjdCcsXG4gICAgfSksXG4gICAgVnVlRGV2dG9vbHMoeyBsYXVuY2hFZGl0b3I6ICdjb2RlJyB9KSxcbiAgXSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICAnQCc6IGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnLi9zcmMnLCBpbXBvcnQubWV0YS51cmwpKSxcbiAgICAgICdAc2hhcmVkJzogZmlsZVVSTFRvUGF0aChuZXcgVVJMKCcuL3NyYy9zaGFyZWQnLCBpbXBvcnQubWV0YS51cmwpKSxcbiAgICAgICdAbW9kdWxlcyc6IGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnLi9zcmMvbW9kdWxlcycsIGltcG9ydC5tZXRhLnVybCkpLFxuICAgIH0sXG4gIH0sXG4gIG9wdGltaXplRGVwczoge1xuICAgIGV4Y2x1ZGU6IFsnQG15LW1vZGVybi1hcHAvbWF0aC1lbmdpbmUnXSxcbiAgfSxcbiAgYnVpbGQ6IHtcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgbWFudWFsQ2h1bmtzKGlkOiBzdHJpbmcpIHtcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcycpKSB7XG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ3Z1ZScpIHx8IGlkLmluY2x1ZGVzKCd2dWUtcm91dGVyJykgfHwgaWQuaW5jbHVkZXMoJ3BpbmlhJykpIHJldHVybiAndmVuZG9yLWZyYW1ld29yayc7XG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ2NoYXJ0JykgfHwgaWQuaW5jbHVkZXMoJ2QzJykgfHwgaWQuaW5jbHVkZXMoJ2VjaGFydHMnKSkgcmV0dXJuICd2ZW5kb3ItY2hhcnRzJztcbiAgICAgICAgICAgIHJldHVybiAndmVuZG9yJztcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCcvbW9kdWxlcy9jaGVtaXN0cnkvJykpIHJldHVybiAnY2hlbWlzdHJ5JztcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJy9wYWdlcy9hZG1pbicpKSByZXR1cm4gJ2FkbWluJztcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJy9sb2NhbGVzLycpKSByZXR1cm4gJ2xvY2FsZXMnO1xuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICBzZXJ2ZXI6IHtcbiAgICBwb3J0OiA1MTczLFxuICAgIGhvc3Q6ICcwLjAuMC4wJyxcbiAgICBjb3JzOiB0cnVlLFxuICAgIGFsbG93ZWRIb3N0czogWycudHJ5Y2xvdWRmbGFyZS5jb20nLCAnLmxvY2EubHQnLCAnLnNlcnZlb3VzZXJjb250ZW50LmNvbScsICcubmdyb2stZnJlZS5kZXYnLCAnLm5ncm9rLmlvJ10sXG4gICAgcHJveHk6IHtcbiAgICAgICcvYXBpJzoge1xuICAgICAgICB0YXJnZXQ6ICdodHRwOi8vbG9jYWxob3N0OjMwMDAnLFxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIHByZXZpZXc6IHtcbiAgICBwb3J0OiA1MTczLFxuICAgIGhvc3Q6ICcwLjAuMC4wJyxcbiAgICBjb3JzOiB0cnVlLFxuICAgIGFsbG93ZWRIb3N0czogWycudHJ5Y2xvdWRmbGFyZS5jb20nLCAnLmxvY2EubHQnLCAnLnNlcnZlb3VzZXJjb250ZW50LmNvbScsICcubmdyb2stZnJlZS5kZXYnLCAnLm5ncm9rLmlvJ10sXG4gICAgcHJveHk6IHtcbiAgICAgICcvYXBpJzoge1xuICAgICAgICB0YXJnZXQ6ICdodHRwOi8vbG9jYWxob3N0OjMwMDAnLFxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG59KSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQStTLFNBQVMsb0JBQW9CO0FBQzVVLE9BQU8sU0FBUztBQUNoQixPQUFPLGFBQWE7QUFDcEIsT0FBTyxpQkFBaUI7QUFDeEIsU0FBUyxlQUFlLFdBQVc7QUFKNEosSUFBTSwyQ0FBMkM7QUFNaFAsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE9BQU87QUFBQSxFQUN6QyxTQUFTO0FBQUEsSUFDUCxJQUFJO0FBQUEsSUFDSixRQUFRO0FBQUEsTUFDTixTQUFTLFNBQVM7QUFBQSxNQUNsQixPQUFPO0FBQUEsTUFDUCxXQUFXO0FBQUEsSUFDYixDQUFDO0FBQUEsSUFDRCxZQUFZLEVBQUUsY0FBYyxPQUFPLENBQUM7QUFBQSxFQUN0QztBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxjQUFjLElBQUksSUFBSSxTQUFTLHdDQUFlLENBQUM7QUFBQSxNQUNwRCxXQUFXLGNBQWMsSUFBSSxJQUFJLGdCQUFnQix3Q0FBZSxDQUFDO0FBQUEsTUFDakUsWUFBWSxjQUFjLElBQUksSUFBSSxpQkFBaUIsd0NBQWUsQ0FBQztBQUFBLElBQ3JFO0FBQUEsRUFDRjtBQUFBLEVBQ0EsY0FBYztBQUFBLElBQ1osU0FBUyxDQUFDLDRCQUE0QjtBQUFBLEVBQ3hDO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTCxlQUFlO0FBQUEsTUFDYixRQUFRO0FBQUEsUUFDTixhQUFhLElBQVk7QUFDdkIsY0FBSSxHQUFHLFNBQVMsY0FBYyxHQUFHO0FBQy9CLGdCQUFJLEdBQUcsU0FBUyxLQUFLLEtBQUssR0FBRyxTQUFTLFlBQVksS0FBSyxHQUFHLFNBQVMsT0FBTyxFQUFHLFFBQU87QUFDcEYsZ0JBQUksR0FBRyxTQUFTLE9BQU8sS0FBSyxHQUFHLFNBQVMsSUFBSSxLQUFLLEdBQUcsU0FBUyxTQUFTLEVBQUcsUUFBTztBQUNoRixtQkFBTztBQUFBLFVBQ1Q7QUFDQSxjQUFJLEdBQUcsU0FBUyxxQkFBcUIsRUFBRyxRQUFPO0FBQy9DLGNBQUksR0FBRyxTQUFTLGNBQWMsRUFBRyxRQUFPO0FBQ3hDLGNBQUksR0FBRyxTQUFTLFdBQVcsRUFBRyxRQUFPO0FBQUEsUUFDdkM7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLGNBQWMsQ0FBQyxzQkFBc0IsWUFBWSwwQkFBMEIsbUJBQW1CLFdBQVc7QUFBQSxJQUN6RyxPQUFPO0FBQUEsTUFDTCxRQUFRO0FBQUEsUUFDTixRQUFRO0FBQUEsUUFDUixjQUFjO0FBQUEsTUFDaEI7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sY0FBYyxDQUFDLHNCQUFzQixZQUFZLDBCQUEwQixtQkFBbUIsV0FBVztBQUFBLElBQ3pHLE9BQU87QUFBQSxNQUNMLFFBQVE7QUFBQSxRQUNOLFFBQVE7QUFBQSxRQUNSLGNBQWM7QUFBQSxNQUNoQjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0YsRUFBRTsiLAogICJuYW1lcyI6IFtdCn0K
