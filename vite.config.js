import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
export default defineConfig({
  plugins: [tailwindcss({ content: ["./src/**/*.{html,js,ts,jsx,tsx,css}"] })],
  server: {
    // https: true,
    headers: {
      "Cross-Origin-Embedder-Policy": "unsafe-none",
      "Cross-Origin-Opener-Policy": "unsafe-none",
    },
  },
});
