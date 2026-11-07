import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: 'var(--brand-primary, #41C2A1)',
          'mint-soft': 'var(--brand-mint-soft, #C9FBD4)',
          cream: 'var(--brand-cream, #EAEAB7)',
          orange: 'var(--brand-orange, #FFAE5D)',
          navy: 'var(--brand-navy, #0D1B2A)',
          foreground: 'var(--brand-foreground, #112A24)',
        },
        canvas: 'var(--canvas, #FAF9F5)',
        surface: {
          DEFAULT: 'var(--surface, #FFFFFF)',
          soft: 'var(--surface-soft, #F1F6F4)',
          hover: 'var(--surface-hover, #E8F1ED)',
        },
        border: {
          DEFAULT: 'var(--border, #DFEAE5)',
          strong: 'var(--border-strong, #CADBD4)',
        },
        'text-primary': 'var(--text-primary, #112A24)',
        'text-muted': 'var(--text-muted, #5A7169)',
        'teal-deep': 'var(--teal-deep, #176C5B)',
        danger: {
          surface: 'var(--danger-surface, #FEF3F2)',
          border: 'var(--danger-border, #FECDCA)',
          text: 'var(--danger-text, #B42318)',
        },
        warning: {
          surface: 'var(--warning-surface, #FFFAEB)',
          border: 'var(--warning-border, #FEDF89)',
          text: 'var(--warning-text, #B54708)',
        },
        success: {
          surface: 'var(--success-surface, #ECFDF3)',
          border: 'var(--success-border, #A6F4C5)',
          text: 'var(--success-text, #027A48)',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        heading: ['var(--font-heading)', 'Space Grotesk', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        enrika: ['Enrika', 'var(--font-heading)', 'Space Grotesk', 'sans-serif'],
      },
      borderRadius: {
        xs: '4px',
        sharp: '0px',
        card: '12px',
        input: '8px',
        modal: '16px',
      },
    },
  },
  plugins: [],
};

export default config;
