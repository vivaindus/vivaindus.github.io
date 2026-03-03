module.exports = {
  important: '#invoice-root', // Scopes all utility classes
  corePlugins: {
    preflight: false, // Prevents Tailwind from resetting your site's global styles
  },
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  corePlugins: {
    preflight: false, // Prevents Tailwind from affecting other pages
  },
  plugins: [], // No Tailwind Forms needed with our custom inputs
}