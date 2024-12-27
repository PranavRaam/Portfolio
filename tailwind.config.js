/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"Akkurat Mono"', 'Arial', 'Helvetica', 'sans-serif'],
        serif: ['"Times New Roman"', 'serif'],
      },
      backgroundImage: {
        'radial-gradient': 'radial-gradient(circle, rgba(0, 0, 0, 0) 60%, rgba(0, 0, 0, 1) 100%)',
      },
      perspective: {
        '500': '500px',
      },
      zIndex: {
        '-10': '-10',
      }
    },
  },
  plugins: [],
}