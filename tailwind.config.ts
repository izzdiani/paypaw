import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        paw: {
          cream: "#fffafd",
          blush: "#f9e8ff",
          lavender: "#e9d5ff",
          lilac: "#c4b5fd",
          purple: "#7c3aed",
          plum: "#4c1d95",
          mint: "#d9fbe8"
        }
      },
      boxShadow: {
        soft: "0 18px 50px rgba(124, 58, 237, 0.14)"
      }
    }
  },
  plugins: []
};

export default config;
