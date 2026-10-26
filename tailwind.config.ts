import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: 'rgb(var(--ink) / <alpha-value>)', 2: 'rgb(var(--ink-2) / <alpha-value>)', 3: 'rgb(var(--ink-3) / <alpha-value>)' },
        ivory: 'rgb(var(--ivory) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        brass: { DEFAULT: 'rgb(var(--brass) / <alpha-value>)', light: 'rgb(var(--brass-light) / <alpha-value>)', deep: 'rgb(var(--brass-deep) / <alpha-value>)' },
        moss: 'rgb(var(--moss) / <alpha-value>)',
        danger: 'rgb(var(--danger) / <alpha-value>)',
      },
      fontFamily: {
        display: ['"Bodoni Moda Variable"', 'Didot', 'Georgia', 'serif'],
        sans: ['"Manrope Variable"', 'system-ui', 'sans-serif'],
      },
      transitionTimingFunction: {
        expo: 'cubic-bezier(0.16, 1, 0.3, 1)',
        quart: 'cubic-bezier(0.76, 0, 0.24, 1)',
      },
      // Height-based variants for phones with short viewports (browser bars included).
      screens: { xs: '380px', short: { raw: '(max-height: 760px)' }, tiny: { raw: '(max-height: 600px)' } },
    },
  },
  plugins: [],
} satisfies Config;
