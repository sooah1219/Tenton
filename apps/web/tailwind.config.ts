import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        tenton: {
          black: "#1A1A1A",
          brown: "#482818",
          red: "#9D3B2E",
          bg: "#FEFBF8",
          border: "#C6BCB7",
          muted: "#e4dfdc",
        },
      },
    },
  },
  plugins: [],
};

export default config;
