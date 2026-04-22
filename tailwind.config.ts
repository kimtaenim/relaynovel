import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: {
          light: "#F4E8D0",
          DEFAULT: "#E8D5A8",
          dark: "#D4BC82",
        },
        ink: {
          DEFAULT: "#2B1810",
          faded: "#5A4638",
        },
        seal: "#8B0000",
        leather: {
          DEFAULT: "#7A5230",
          dark: "#5C3E24",
          light: "#9C6E44",
        },
        brass: {
          DEFAULT: "#B8860B",
          light: "#D4A52A",
          dark: "#8B6508",
        },
        champagne: {
          DEFAULT: "#CFB071",
          light: "#FAEDC6",
          mid: "#EAD49A",
          dark: "#7A6638",
          text: "#EAD49A",
        },
        verdigris: "#4A6670",
        pewter: "#708090",
        mahogany: {
          DEFAULT: "#4A2C1A",
          dark: "#2E1B10",
          light: "#6B4226",
        },
      },
      fontFamily: {
        display: ['"Cinzel"', '"Cormorant Garamond"', "serif"],
        serif: ['"EB Garamond"', '"Noto Serif KR"', "serif"],
        script: ['"IM Fell DW Pica"', '"Noto Serif KR"', "serif"],
      },
      backgroundImage: {
        "parchment-grain":
          "radial-gradient(ellipse at center, rgba(210,180,140,0) 0%, rgba(120,85,50,0.15) 100%)",
        "mahogany-wood":
          "linear-gradient(180deg, #5C3A22 0%, #3E2615 40%, #5C3A22 60%, #2E1B10 100%)",
        "leather-grain":
          "radial-gradient(ellipse at 30% 30%, rgba(156,110,68,0.4) 0%, rgba(92,62,36,0) 70%)",
      },
      boxShadow: {
        "book-spine":
          "inset -3px 0 6px rgba(0,0,0,0.5), inset 3px 0 3px rgba(255,220,160,0.15), 2px 2px 6px rgba(0,0,0,0.4)",
        "plaque": "inset 0 2px 4px rgba(255,230,140,0.4), 0 2px 8px rgba(0,0,0,0.5)",
        "parchment": "0 8px 24px rgba(0,0,0,0.4), inset 0 0 40px rgba(120,85,50,0.15)",
      },
    },
  },
  plugins: [],
};

export default config;
