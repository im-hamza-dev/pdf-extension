/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#588AE8', //'#588AE8',
          secondary: '#5a5387',
          accent: '#574269',
        },
      },
    },
  },
  plugins: [],
};
