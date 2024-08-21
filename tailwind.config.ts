import { type Config } from "tailwindcss";

const config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#222222", // Dark background color
        secondary: "#353535", // Secondary background for panels
        highlighted: "#3370c7", // Highlight color for buttons
        highlightedText: "#00FFFF", // Text color for highlighted elements
        link: "#c8f0ff",
        accent: "#3a3a3c", // Accent color for borders and buttons
        textPrimary: "#e5e5e7", // Primary text color
        textSecondary: "#a1a1a6", // Secondary text color
        border: "#4a4a4e", // Border color for inputs and buttons
        inputBg: "#2b2b2f", // Input background color
        inputBgDark: "#1f1f1f", // Darker input background
      },
      maxWidth: {
        container: "100%",
      },
    },
  },
  prefix: "",
} satisfies Config;

export default config;
