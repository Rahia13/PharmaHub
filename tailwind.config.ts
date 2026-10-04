import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#00A664",
          dark: "#008a53",
          light: "#E6F7EF",
        },
        navy: {
          DEFAULT: "#0B1B33",
          light: "#132743",
        },
        surface: "#F8FAFC",
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 2px rgba(11, 27, 51, 0.06), 0 1px 6px rgba(11, 27, 51, 0.06)",
      },
    },
  },
  plugins: [],
};
export default config;
