/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Times New Roman", "Times", "serif"],
        display: ["Times New Roman", "Times", "serif"],
      },
      colors: {
        crm: {
          bg: "#f5f0e6",
          "bg-deep": "#efe5d4",
          surface: "#ffffff",
          border: "rgba(36,32,26,0.08)",
          copy: "#1b2433",
          "copy-soft": "#6b7280",
          heading: "#12213e",
          primary: "#3b6fe0",
          "primary-light": "rgba(59,111,224,0.08)",
          accent: "#ff8f3f",
          success: "#1d9b6c",
          "success-light": "rgba(29,155,108,0.08)",
          warning: "#da8e21",
          "warning-light": "rgba(218,142,33,0.08)",
          danger: "#d3534b",
          "danger-light": "rgba(211,83,75,0.08)",
          violet: "#7c3aed",
          "violet-light": "rgba(124,58,237,0.08)",
        },
      },
      boxShadow: {
        card: "0 2px 12px rgba(28,31,38,0.06)",
        "card-lg": "0 8px 32px rgba(28,31,38,0.08)",
        sidebar: "2px 0 12px rgba(28,31,38,0.04)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.25rem",
      },
    },
  },
  plugins: [],
};
