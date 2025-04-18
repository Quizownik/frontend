/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx,tsx,ts}"],
  theme: {
    extend: {
      fontFamily: {
        quiz: ['Fredoka', 'sans-serif'],
      },
      colors: {
        quizPink: '#FF7EB9',
        quizYellow: '#FEE440',
        quizGreen: '#00F5D4',
        quizBlue: '#5BC0EB',
      },
    },
  },
  plugins: [],
}

