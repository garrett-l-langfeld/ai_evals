import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#14263a",
        sand: "#161f2e",
        ember: "#b86f4d",
        moss: "#6f7f73",
        gold: "#d3bea0",
        paper: "#f6f2ea",
        slate: "#5f6d79",
        fog: "#e8ece8"
      },
      boxShadow: {
        card: "0 18px 48px rgba(20, 38, 58, 0.08)",
        panel: "0 24px 76px rgba(20, 38, 58, 0.12)"
      },
      fontFamily: {
        sans: ["Avenir Next", "Helvetica Neue", "Segoe UI", "Arial", "sans-serif"],
        serif: ["Iowan Old Style", "Baskerville", "Georgia", "Times New Roman", "serif"]
      }
    }
  },
  plugins: []
};

export default config;
