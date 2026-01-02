'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

// Tema tipini tanımlıyoruz: 'light' veya 'dark'
type Theme = 'light' | 'dark'

// Context'in tipini tanımlıyoruz
// Bu context, tema durumunu ve değiştirme fonksiyonunu içerir
interface ThemeContextType {
    theme: Theme
    toggleTheme: () => void
}

// Context'i oluşturuyoruz (başlangıç değeri undefined)
const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// ThemeProvider bileşeni: Tema durumunu yönetir
export function ThemeProvider({ children }: { children: React.ReactNode }) {
    // useState: Tema durumunu tutar
    // Başlangıçta 'light' olarak ayarlıyoruz
    const [theme, setTheme] = useState<Theme>('light')

    // useEffect: Bileşen mount olduğunda çalışır
    // localStorage'dan kaydedilmiş tema tercihini okur
    useEffect(() => {
        // localStorage'dan 'theme' anahtarıyla kaydedilmiş değeri alıyoruz
        const savedTheme = localStorage.getItem('theme') as Theme | null

        // Eğer kaydedilmiş bir tema varsa, onu kullanıyoruz
        // Yoksa sistem tercihini kontrol ediyoruz (prefers-color-scheme)
        if (savedTheme) {
            setTheme(savedTheme)
            // HTML elementine 'dark' class'ını ekliyoruz (Tailwind dark mode için gerekli)
            if (savedTheme === 'dark') {
                document.documentElement.classList.add('dark')
            }
        } else {
            // Sistem tercihini kontrol ediyoruz
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
            setTheme(systemTheme)
            if (systemTheme === 'dark') {
                document.documentElement.classList.add('dark')
            }
        }
    }, [])

    // Tema değiştirme fonksiyonu
    const toggleTheme = () => {
        // Mevcut temanın tersini alıyoruz
        const newTheme = theme === 'light' ? 'dark' : 'light'

        // State'i güncelliyoruz
        setTheme(newTheme)

        // localStorage'a kaydediyoruz (sayfa yenilendiğinde hatırlasın)
        localStorage.setItem('theme', newTheme)

        // HTML elementine 'dark' class'ını ekliyoruz veya kaldırıyoruz
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    }

    // Context.Provider ile tüm alt bileşenlere tema durumunu sağlıyoruz
    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

// Custom hook: Tema context'ine erişmek için kullanılır
// Bu hook sayesinde herhangi bir bileşende useTheme() çağırarak tema durumuna erişebiliriz
export function useTheme() {
    const context = useContext(ThemeContext)

    // Eğer context tanımlı değilse (yani ThemeProvider dışında kullanılmışsa) hata veriyoruz
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider')
    }

    return context
}

