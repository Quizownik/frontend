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
        quizGreen: '#00f59f',
        quizBlue: '#5BC0EB',
        quizPurple: '#7f00b2',
        quizRed: '#c55050',
      },
    },
  },
  plugins: [],
}

