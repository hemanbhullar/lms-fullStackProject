/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {
      backgroundColor: {
        'primary': '#3490dc', // Change this to your desired primary color
        'secondary': '#f6993f', // Change this to your desired secondary color
      },
    },
  },
  plugins: [require("daisyui"), require("@tailwindcss/line-clamp")],
}

