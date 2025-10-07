import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@tests": path.resolve(__dirname, "./tests"),
      "@config": path.resolve(__dirname, "./config"),
      "@scripts": path.resolve(__dirname, "./scripts"),
      "@docs": path.resolve(__dirname, "./docs"),
    },
  },
  optimizeDeps: {
    exclude: ['openai'], // Force rebuild without OpenAI
  },
}));
