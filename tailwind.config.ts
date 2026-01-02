import type { Config } from 'tailwindcss'

const config: Config = {
    // Dark mode'u class-based olarak yönetiyoruz
    // Bu sayede JavaScript ile tema değişikliği yapabiliyoruz
    darkMode: 'class',
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            // Tema renklerini özelleştiriyoruz
            colors: {
                // Açık tema renkleri
                light: {
                    bg: '#ffffff',
                    surface: '#f8f9fa',
                    text: '#1a1a1a',
                    border: '#e5e7eb',
                },
                // Koyu tema renkleri
                dark: {
                    bg: '#0f172a',
                    surface: '#1e293b',
                    text: '#f1f5f9',
                    border: '#334155',
                },
            },
        },
    },
    plugins: [],
}
export default config

