import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#112334",
        sand: "#f7f3ea",
        ember: "#c86c4b",
        moss: "#667d70",
        gold: "#d7c29a",
        paper: "#fffdf8",
        slate: "#5e6b75",
        fog: "#edf0ea"
      },
      boxShadow: {
        card: "0 22px 60px rgba(17, 35, 52, 0.08)",
        panel: "0 28px 90px rgba(17, 35, 52, 0.12)"
      },
      fontFamily: {
        sans: ["Avenir Next", "Segoe UI", "Helvetica Neue", "Arial", "sans-serif"],
        serif: ["Canela", "Iowan Old Style", "Georgia", "Times New Roman", "serif"]
      }
    }
  },
  plugins: []
};

export default config;
