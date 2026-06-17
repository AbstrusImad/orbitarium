/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink0: 'var(--ink0)',
        ink1: 'var(--ink1)',
        ink2: 'var(--ink2)',
        ink3: 'var(--ink3)',
        ink4: 'var(--ink4)',
        ink5: 'var(--ink5)',
        bone: 'var(--bone)',
        bone2: 'var(--bone2)',
        ash: 'var(--ash)',
        mute: 'var(--mute)',
        dim: 'var(--dim)',
        sage: 'var(--sage)',
        sagetext: 'var(--sage-text)',
        champagne: 'var(--champagne)',
        infotext: 'var(--info-text)',
        ember: 'var(--ember)',
        crimson: 'var(--crimson)'
      },
      fontFamily: {
        head: ['Sora', 'system-ui', 'sans-serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace']
      },
      borderColor: {
        line1: 'var(--line1)',
        line2: 'var(--line2)',
        line3: 'var(--line3)'
      }
    }
  },
  plugins: []
}
