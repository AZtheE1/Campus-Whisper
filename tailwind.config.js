/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./App.tsx",
        "./src/**/*.{js,ts,jsx,tsx}" // wildcard
    ],
    theme: {
        extend: {},
    },
    plugins: [],
    darkMode: 'class',
}
