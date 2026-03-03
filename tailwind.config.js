/** @type {import('tailwindcss').Config} */
module.exports = {
  important: '#invoice-root',
  content: [
    "./pages/invoice-engine/**/*.{js,ts,jsx,tsx}", // Target only invoice
    "./engine-data/**/*.{js,ts,jsx,tsx}",         // Target only invoice logic
  ],
  theme: {
    extend: {},
  },
  corePlugins: {
    preflight: false, // Prevents Tailwind from affecting other pages
  },
  plugins: [], // No Tailwind Forms needed with our custom inputs
}