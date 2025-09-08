import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
      fontFamily: {
        'serif-stylish': ['Crimson Text', 'Source Serif Pro', 'Georgia', 'serif'],
        'sans-elegant': ['Inter', 'system-ui', 'sans-serif'],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            fontFamily: 'Crimson Text, Georgia, serif',
            fontSize: '1.1rem',
            lineHeight: '1.8',
            letterSpacing: '0.025em',
            color: '#e8eaed',
            h1: { 
              color: '#e8eaed',
              fontFamily: 'Crimson Text, serif',
              fontWeight: '600',
              fontSize: '2.5rem',
              letterSpacing: '0.015em',
              marginBottom: '1.5rem',
            },
            h2: { 
              color: '#d1d5db',
              fontFamily: 'Crimson Text, serif',
              fontWeight: '600',
              fontSize: '2rem',
              letterSpacing: '0.015em',
              marginTop: '2rem',
              marginBottom: '1rem',
            },
            h3: { 
              color: '#b8bcc5',
              fontFamily: 'Crimson Text, serif',
              fontWeight: '600',
              fontSize: '1.5rem',
              letterSpacing: '0.015em',
            },
            p: { 
              color: '#e8eaed',
              marginBottom: '1.25rem',
            },
            li: { 
              color: '#e8eaed',
              marginBottom: '0.5rem',
            },
            strong: { 
              color: '#f3f4f6',
              fontWeight: '600',
            },
            em: {
              color: '#d1d5db',
              fontStyle: 'italic',
            },
            code: { 
              color: '#fbbf24',
              backgroundColor: '#2d3548',
              padding: '0.25rem 0.5rem',
              borderRadius: '0.375rem',
              fontSize: '0.9em',
              fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, monospace',
            },
            pre: { 
              backgroundColor: '#1e293b',
              color: '#e2e8f0',
              padding: '1.5rem',
              borderRadius: '0.75rem',
              border: '1px solid #3d4759',
              fontSize: '0.9rem',
              lineHeight: '1.6',
            },
            blockquote: {
              color: '#94a3b8',
              borderLeftColor: '#6366f1',
              borderLeftWidth: '4px',
              paddingLeft: '1.5rem',
              fontStyle: 'italic',
              fontSize: '1.1rem',
            },
            a: {
              color: '#818cf8',
              textDecoration: 'underline',
              textDecorationColor: 'rgba(129, 140, 248, 0.3)',
              textUnderlineOffset: '3px',
              '&:hover': {
                color: '#a5b4fc',
                textDecorationColor: 'rgba(165, 180, 252, 0.6)',
              },
            },
            ul: {
              paddingLeft: '1.5rem',
            },
            ol: {
              paddingLeft: '1.5rem',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} satisfies Config;