import type { Config } from 'tailwindcss';

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar))',
          foreground: 'hsl(var(--sidebar-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
          surface: 'hsl(var(--card-surface))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        border: 'hsl(var(--border))',
        ring: 'hsl(var(--ring))',
        danger: 'hsl(var(--danger))',
        success: 'hsl(var(--success))',
        warning: 'hsl(var(--warning))',
        severity: {
          critical: {
            DEFAULT: 'hsl(var(--severity-critical))',
            foreground: 'hsl(var(--severity-critical-fg))',
          },
          high: {
            DEFAULT: 'hsl(var(--severity-high))',
            foreground: 'hsl(var(--severity-high-fg))',
          },
          medium: {
            DEFAULT: 'hsl(var(--severity-medium))',
            foreground: 'hsl(var(--severity-medium-fg))',
          },
          low: {
            DEFAULT: 'hsl(var(--severity-low))',
            foreground: 'hsl(var(--severity-low-fg))',
          },
          info: {
            DEFAULT: 'hsl(var(--severity-info))',
            foreground: 'hsl(var(--severity-info-fg))',
          },
        },
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
      },
      transitionDuration: {
        fast: 'var(--duration-fast)',
        normal: 'var(--duration-normal)',
        slow: 'var(--duration-slow)',
      },
    },
  },
  plugins: [],
} satisfies Config;
