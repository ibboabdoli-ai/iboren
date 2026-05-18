import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#F5F0E8",
        porcelain: "#FFFDF8",
        ink: "#202020",
        burgundy: "#6B2737",
        gold: "#D4A574",
        plum: "#3B183F",
        night: "#020504",
        teal: "#59C7B7"
      },
      fontFamily: {
        display: ["Georgia", "serif"],
        body: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      boxShadow: {
        luxe: "0 28px 90px rgba(107, 39, 55, 0.16)",
        soft: "0 18px 55px rgba(32, 32, 32, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
