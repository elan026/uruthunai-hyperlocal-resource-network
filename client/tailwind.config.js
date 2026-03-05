/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#308ce8',
                    light: '#137fec',
                    dark: '#1152d4',
                },
                success: '#22c55e',
                warning: '#eab308',
                danger: '#ef4444',
                info: '#3b82f6',
                emergency: {
                    red: '#ec1313',
                    bg: '#221010',
                },
                'bg-light': '#f6f7f8',
                'bg-dark': '#111921',
                navy: {
                    50: '#eef2ff',
                    100: '#e0e7ff',
                    200: '#c7d2fe',
                    300: '#a5b4fc',
                    400: '#818cf8',
                    500: '#6366f1',
                    600: '#4f46e5',
                    700: '#1e3a8a',
                    800: '#1e2a5e',
                    900: '#0f172a',
                },
            },
            fontFamily: {
                sans: ['Inter', 'Public Sans', 'sans-serif'],
                display: ['Inter', 'Public Sans', 'sans-serif'],
            },
            borderRadius: {
                DEFAULT: '0.25rem',
                lg: '0.5rem',
                xl: '0.75rem',
                '2xl': '1rem',
                '3xl': '1.5rem',
                full: '9999px',
            },
            // Motion utilities
            keyframes: {
                'smooth-fade-in': {
                    from: { opacity: '0', transform: 'translateY(12px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
                'smooth-slide-up': {
                    from: { opacity: '0', transform: 'translateY(24px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
                'smooth-slide-down': {
                    from: { opacity: '0', transform: 'translateY(-24px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
                'smooth-scale-in': {
                    from: { opacity: '0', transform: 'scale(0.96)' },
                    to: { opacity: '1', transform: 'scale(1)' },
                },
                'hover-lift': {
                    from: { transform: 'translateY(0) scale(1)', boxShadow: '0 1px 3px rgba(0,0,0,0.12)' },
                    to: { transform: 'translateY(-4px) scale(1.01)', boxShadow: '0 20px 40px rgba(0,0,0,0.08)' },
                },
                'nav-underline': {
                    from: { transform: 'scaleX(0)' },
                    to: { transform: 'scaleX(1)' },
                },
                'icon-bounce': {
                    '0%, 100%': { transform: 'translateY(0) rotate(0)' },
                    '50%': { transform: 'translateY(-2px) rotate(3deg)' },
                },
                'float': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-8px)' },
                },
            },
            animation: {
                'smooth-fade': 'smooth-fade-in 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
                'smooth-slide': 'smooth-slide-up 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
                'smooth-slide-down': 'smooth-slide-down 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
                'soft-scale': 'smooth-scale-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                'icon-bounce': 'icon-bounce 0.5s ease-in-out',
                'float': 'float 6s ease-in-out infinite',
            },
            transitionTimingFunction: {
                'smooth': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                'smooth-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
                'bounce-soft': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
            },
            transitionDuration: {
                '400': '400ms',
                '600': '600ms',
                '800': '800ms',
            },
        },
    },
    plugins: [],
}
