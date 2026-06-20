import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#10212b",
        sand: "#f5efe2",
        ember: "#ea6a3b",
        moss: "#4d6b57",
        gold: "#d6ad43",
        paper: "#fffdf7"
      },
      boxShadow: {
        card: "0 18px 45px rgba(16, 33, 43, 0.12)"
      },
      fontFamily: {
        sans: ["Avenir Next", "Segoe UI", "Helvetica Neue", "sans-serif"],
        serif: ["Iowan Old Style", "Palatino Linotype", "Book Antiqua", "serif"]
      }
    }
  },
  plugins: []
};

export default config;
