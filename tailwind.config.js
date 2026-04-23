/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
                mono: ['"Space Mono"', 'monospace'],
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            colors: {
                paper: {
                    50:  '#FDFAF5',
                    100: '#F7F3EC',
                    200: '#EDE5D8',
                    300: '#DDD0BC',
                    400: '#C4A882',
                    500: '#A8855A',
                },
                ink: {
                    900: '#1A1714',
                    800: '#2C2820',
                    700: '#3D3830',
                },
            },
            animation: {
                'fade-up': 'fadeUp 0.5s ease forwards',
                'fade-in': 'fadeIn 0.3s ease forwards',
            },
            keyframes: {
                fadeUp: {
                    '0%': { opacity: '0', transform: 'translateY(16px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
            },
        },
    },
    plugins: [],
}
