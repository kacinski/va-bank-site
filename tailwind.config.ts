import { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Izhitsa', 'serif'],
        serif: ['Merriweather', 'serif'],
      },
      colors: {
        imperial: {
          burgundy: '#6D1A36',
          gold: '#C9B037',
          cream: '#F8F5E4',
          walnut: '#4B2E19',
        },
        newspaper: {
          base: '#F7F3E3', // light cream
          edge: '#E2D3B1', // sepia edge
        },
      },
      backgroundImage: {
        'newspaper-fibers': "url('/newspaper-fibers.png')",
      },
      boxShadow: {
        'salon': '0 4px 24px 0 rgba(77, 30, 55, 0.15)',
        'page': '0 8px 48px 0 rgba(75, 46, 25, 0.18)',
      },
    },
  },
  plugins: [],
};
export default config;
