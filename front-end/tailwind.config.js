/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  darkMode: "class",
  theme: {
    container: {
      center: true,
    },
    extend: {
      boxShadow: {
        hard: "0 3px 6px -4px #0000001f,0 6px 16px #00000014,0 9px 28px 8px #0000000d",
      },
      colors: {
        primary: "#0862b0",
        dark: "#1f1f1f",
        "dark-sec": "#262626",
        // "dark-sec": "#303030",
      },
      animation: {
        meteor: "meteor 5s linear infinite",
      },
      keyframes: {
        meteor: {
          "0%": { transform: "rotate(215deg) translateX(0)", opacity: 0 },
          "10%": { opacity: 1 },
          "70%": { opacity: 1 },
          "100%": {
            transform: "rotate(215deg) translateX(-500px)",
            opacity: 0,
          },
        },
      },
    },
  },
  plugins: [],
};
