export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // This sets the default sans font to Inter
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}