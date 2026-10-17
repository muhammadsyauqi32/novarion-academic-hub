import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#41C2A1',
          'mint-soft': '#C9FBD4',
          cream: '#EAEAB7',
          orange: '#FFAE5D',
          navy: '#0D1B2A',
        },
        canvas: '#F8FBF9',
        surface: {
          DEFAULT: '#FFFFFF',
          soft: '#F1F7F3',
        },
        border: '#E2ECE8',
        'text-primary': '#203B34',
        'text-muted': '#63756F',
        'teal-deep': '#176C5B',
        danger: {
          surface: '#FEF3F2',
          border: '#FECDCA',
          text: '#B42318',
        },
        warning: {
          surface: '#FFFAEB',
          border: '#FEDF89',
          text: '#B54708',
        },
        success: {
          surface: '#ECFDF3',
          border: '#A6F4C5',
          text: '#027A48',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        heading: ['var(--font-heading)', 'Space Grotesk', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '14px',
        input: '10px',
        modal: '16px',
      },
    },
  },
  plugins: [],
};

export default config;
