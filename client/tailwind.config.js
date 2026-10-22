/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2E7D32',
          dark: '#1B5E20',
          light: '#F1F8E9',
          mid: '#4CAF50'
        },
        accent: {
          DEFAULT: '#FF8F00',
          light: '#FFF3E0'
        },
        danger: '#C62828',
        success: '#1B5E20',
        surface: '#FAFAFA'
      },
      fontFamily: {
        heading: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'Roboto', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};
