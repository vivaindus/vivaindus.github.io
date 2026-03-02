/** @type {import('tailwindcss').Config} */
module.exports = {
  // ONLY scan these files for tailwind classes
  content: [
    "./pages/invoice-engine/**/*.js",
    "./engine-data/**/*.js",
  ],
  theme: {
    extend: {
      spacing: { 'a4-w': '210mm', 'a4-h': '297mm' },
    },
  },
  corePlugins: {
    // THIS IS CRITICAL: It stops Tailwind from resetting styles on your other apps
    preflight: false, 
  },
  plugins: [require('@tailwindcss/forms')],
}