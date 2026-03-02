/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/invoice-engine/**/*.js",
    "./engine-data/**/*.js",
  ],
  theme: {
    extend: {},
  },
  // This prevents Tailwind from resetting global styles for your other calculators
  corePlugins: {
    preflight: false,
  }
}