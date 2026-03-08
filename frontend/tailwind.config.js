/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class", // enables dark mode toggle
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {

      /* -------------------------------- */
      /* Temple Color System              */
      /* -------------------------------- */

      colors: {
        ivory: "#FFF8F0",
        saffron: "#FF8C00",
        gold: "#FAD5A5",
        charcoal: "#2C2C2C",
        warmgray: "#8B7355",
        coral: "#FF6B6B",
        forest: "#228B22",
      },

      /* -------------------------------- */
      /* Fonts                            */
      /* -------------------------------- */

      fontFamily: {

        // body text
        sans: ['Lato', 'sans-serif'],

        // headings
        heading: ['"EB Garamond"', 'serif'],

        // fallback
        body: ['Lato', 'sans-serif'],
      },

      /* -------------------------------- */
      /* Border Radius                    */
      /* -------------------------------- */

      borderRadius: {
        temple: "20px",
      },

      /* -------------------------------- */
      /* Shadows                          */
      /* -------------------------------- */

      boxShadow: {
        temple: "0 8px 24px rgba(0,0,0,0.08)",
        glow: "0 0 10px rgba(255,140,0,0.4)",
      },

      /* -------------------------------- */
      /* Animations                       */
      /* -------------------------------- */

      keyframes: {

        saffronGlow: {
          "0%,100%": { boxShadow: "0 0 0px rgba(255,140,0,0)" },
          "50%": { boxShadow: "0 0 12px rgba(255,140,0,0.6)" },
        },

        floatSoft: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        }

      },

      animation: {
        glow: "saffronGlow 2s infinite",
        float: "floatSoft 4s ease-in-out infinite",
      },

    },
  },

  plugins: [],
};