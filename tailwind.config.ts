import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        cardinal: {
          DEFAULT: "#C8102E",
          dark: "#9B0E24",
          soft: "#F8D7DC",
        },
        gold: {
          DEFAULT: "#F1BE48",
          dark: "#C99512",
          soft: "#FBF0D4",
        },
        ink: {
          DEFAULT: "#1C1917",
          muted: "#57534E",
        },
        paper: {
          DEFAULT: "#F7F3EC",
          card: "#FFFcf7",
        },
      },
      boxShadow: {
        card: "0 10px 40px -16px rgba(28, 25, 23, 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
