import type { Config } from 'tailwindcss'
import scrollbar from 'tailwind-scrollbar';

export default {
  content: ["./src/**/*.{html,js,ts}"],
  theme: {
    extend: {
      keyframes: {
        modernSpin: {
          '0%, 37.5%': {
            transform: 'rotate(0deg) scale(1)',
          },
          '55%': {
            transform: 'rotate(25deg) scale(1.1)',
          },
          '85%': {
            transform: 'rotate(-385deg) scale(1.1)',
          },
          '100%': {
            transform: 'rotate(-360deg) scale(1)',
          },
        },
      },
      animation: {
        'google-loader': 'modernSpin 3s cubic-bezier(0.76, 0, 0.24, 1) infinite',
      },
    },
  },
  plugins: [scrollbar],
} satisfies Config
