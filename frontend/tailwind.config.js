/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        medicalBlue: '#0f6ba8',
        medicalGreen: '#1f9d76',
        surface: '#f3fbff',
        calm: '#d8f3dc',
        urgent: '#ef4444',
      },
      boxShadow: {
        float: '0 15px 35px rgba(15, 107, 168, 0.22)',
      },
      keyframes: {
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.06)' },
        },
      },
      animation: {
        heartbeat: 'heartbeat 1.2s infinite',
      },
    },
  },
  plugins: [],
};
