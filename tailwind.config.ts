import { type Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      screens: {
        "2xl": "1640px",
      },
    },
    extend: {
      backgroundImage: {
        "gradient-purple-blue":
          "linear-gradient(45deg, rgba(138,34,207,1) 0%, rgba(97,157,240,1) 100%)",
        "gradient-footer":
          "linear-gradient(to bottom, rgba(53,53,53,1) 0%, rgba(24,24,24,1) 100%)",
        "gradient-rainbow":
          "linear-gradient(90deg, rgba(255,0,184,1) 0%, rgba(0,133,255,1) 50%, rgba(5,255,0,1) 100%)",
        "gradient-rainbow-radial":
          "radial-gradient(circle, rgba(255,0,184,1) 0%, rgba(0,133,255,1) 50%, rgba(5,255,0,1) 100%)",
        "gradient-golden":
          "linear-gradient(45deg, rgba(255,225,189,1) 0%, rgba(255,212,125,1) 100%)",
        "image-bojbe": "url(/static/bojbe.png)",
        "image-home-wallpaper": "url(/static/home-wallpaper.png)",
        "image-waves":
          "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' version='1.1' xmlns:xlink='http://www.w3.org/1999/xlink' xmlns:svgjs='http://svgjs.dev/svgjs' width='2560' height='1440' preserveAspectRatio='none' viewBox='0 0 2560 1440'%3e%3cg mask='url(%26quot%3b%23SvgjsMask23298%26quot%3b)' fill='none'%3e%3crect width='2560' height='1440' x='0' y='0' fill='url(%26quot%3b%23SvgjsLinearGradient23299%26quot%3b)'%3e%3c/rect%3e%3cpath d='M2560 0L1287.96 0L2560 397.03z' fill='rgba(255%2c 255%2c 255%2c .1)'%3e%3c/path%3e%3cpath d='M1287.96 0L2560 397.03L2560 555.39L642.12 0z' fill='rgba(255%2c 255%2c 255%2c .075)'%3e%3c/path%3e%3cpath d='M642.1199999999999 0L2560 555.39L2560 1104.4299999999998L465.1799999999999 0z' fill='rgba(255%2c 255%2c 255%2c .05)'%3e%3c/path%3e%3cpath d='M465.17999999999984 0L2560 1104.4299999999998L2560 1325.3899999999999L256.14999999999986 0z' fill='rgba(255%2c 255%2c 255%2c .025)'%3e%3c/path%3e%3cpath d='M0 1440L948.95 1440L0 947.37z' fill='rgba(0%2c 0%2c 0%2c .1)'%3e%3c/path%3e%3cpath d='M0 947.37L948.95 1440L1354.6100000000001 1440L0 466.65z' fill='rgba(0%2c 0%2c 0%2c .075)'%3e%3c/path%3e%3cpath d='M0 466.65L1354.6100000000001 1440L2104.04 1440L0 178.53999999999996z' fill='rgba(0%2c 0%2c 0%2c .05)'%3e%3c/path%3e%3cpath d='M0 178.53999999999996L2104.04 1440L2409.37 1440L0 56.10999999999996z' fill='rgba(0%2c 0%2c 0%2c .025)'%3e%3c/path%3e%3c/g%3e%3cdefs%3e%3cmask id='SvgjsMask23298'%3e%3crect width='2560' height='1440' fill='white'%3e%3c/rect%3e%3c/mask%3e%3clinearGradient x1='100%25' y1='50%25' x2='0%25' y2='50%25' gradientUnits='userSpaceOnUse' id='SvgjsLinearGradient23299'%3e%3cstop stop-color='rgba(15%2c 30%2c 21%2c 1)' offset='0'%3e%3c/stop%3e%3cstop stop-color='rgba(24%2c 24%2c 24%2c 1)' offset='0.3'%3e%3c/stop%3e%3cstop stop-color='rgba(24%2c 24%2c 24%2c 1)' offset='0.7'%3e%3c/stop%3e%3cstop stop-color='rgba(32%2c 15%2c 40%2c 1)' offset='1'%3e%3c/stop%3e%3c/linearGradient%3e%3c/defs%3e%3c/svg%3e\")",
      },
      borderRadius: {
        sm: "3px",
        md: "5px",
        lg: "10px",
        xl: "25px",
        "2xl": "50px",
        "3xl": "100px",
        circle: "50%",
      },
      boxShadow: {
        "fifty-black": "0 0 50px 0 rgba(0,0,0,0.1)",
        "twenty-black": "0 0 20px 0 rgba(0,0,0,0.2)",
      },
      backgroundColor: {
        primary: "#282828",
        select: {
          DEFAULT: "#FFFFFF",
          muted: "#BBBBBB",
          highlighted: "#EEEEEE",
        },
        button: {
          primary: "#282828",
          highlighted: "#3D3D3D",
        },
        input: {
          DEFAULT: "#FFFFFF",
        },
        social: {
          apple: "#000000",
          facebook: "#1877F2",
          google: "#FFFFFF",
        },
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
        primary: "#666666",
        secondary: "#3D3D3D",
        toast: "rgba(0, 0, 0, 0.05)",
      },
      keyframes: {
        "pop-in": {
          "0%": {
            opacity: "0",
            transform: "scale(0.1)",
          },
          "100%": {
            opacity: "1",
            transform: "scale(1)",
          },
        },
      },
      ringColor: {
        primary: {
          DEFAULT: "#EEEEEE",
          focused: "#DDDDDD",
          error: "#FF9090",
        },
      },
      ringOffsetColor: {
        primary: "#282828",
      },
      textColor: {
        primary: {
          DEFAULT: "#000000",
          muted: "#AAAAAA",
          highlighted: "#FFE1BD",
          error: "#FF9090",
        },
        secondary: {
          DEFAULT: "#FFFFFF",
          muted: "#BBBBBB",
        },
        toast: {
          DEFAULT: "#0C5460",
          error: "#721C24",
          info: "#0C5460",
          loading: "#383D41",
          success: "#155724",
          warning: "#856404",
        },
        select: {
          DEFAULT: "#000000",
          muted: "#BBBBBB",
        },
      },
      fontFamily: {
        sans: ["var(--font-ubuntu)"],
      },
    },
  },
} satisfies Config;

export default config;
