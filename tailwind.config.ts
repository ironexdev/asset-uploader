import { type Config } from "tailwindcss";

const config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-header":
          "linear-gradient(180deg, rgba(85,124,214,1) 0%, rgba(100,102,194,1) 100%)",
        "gradient-button":
          "linear-gradient(90deg, rgba(85,124,214,1) 0%, rgba(100,102,194,1) 100%)",
        "gradient-button-disabled":
          "linear-gradient(90deg, #3e424a 0%, #3e424a 100%)",
      },
      backgroundColor: {
        body: "#222222",
        primary: "#222222",
        secondary: "#3e424a",
        accent: "#353535",
        input: "#31343b",
        "button-primary": "#525df0",
        "button-secondary": "#109565",
        "button-destroy": "#e34d4d",
        header: "#3f61b1",
        toast: {
          DEFAULT: "#D1ECF1",
          error: "#F8D7DA",
          info: "#D1ECF1",
          loading: "#E2E3E5",
          success: "#D4EDDA",
          warning: "#FFF3CD",
        },
      },
      borderColor: {
        primary: "#3e424a",
        header: "#948cff",
      },
      textColor: {
        primary: "#FFFFFF",
        secondary: "#9ec4ff",
        disabled: "#BBBBBB",
        link: "#8ce9ff",
        toast: {
          DEFAULT: "#0C5460",
          error: "#721C24",
          info: "#0C5460",
          loading: "#383D41",
          success: "#155724",
          warning: "#856404",
        },
      },
      maxWidth: {
        container: "100%",
      },
    },
  },
  prefix: "",
} satisfies Config;

export default config;
