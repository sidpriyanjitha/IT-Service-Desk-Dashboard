export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#172033',
        brand: {
          50: '#eef8ff',
          100: '#d8efff',
          500: '#1976d2',
          600: '#145fad',
          700: '#124d8a'
        }
      },
      boxShadow: {
        soft: '0 18px 45px rgba(23, 32, 51, 0.08)'
      }
    },
  },
  plugins: [],
};
