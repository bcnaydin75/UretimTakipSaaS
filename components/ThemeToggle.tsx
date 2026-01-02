'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { motion } from 'framer-motion'

/**
 * ThemeToggle Bileşeni
 * 
 * Bu bileşen, kullanıcının tema değiştirmesini sağlar.
 * Framer Motion ile animasyonlu bir geçiş yapar.
 */
export function ThemeToggle() {
  // useTheme hook'u ile tema durumuna ve toggle fonksiyonuna erişiyoruz
  const { theme, toggleTheme } = useTheme()
  
  return (
    <motion.button
      // Framer Motion: Butona tıklandığında hafif bir scale animasyonu
      whileTap={{ scale: 0.95 }}
      // onClick: Tema değiştirme fonksiyonunu çağırıyoruz
      onClick={toggleTheme}
      className="
        relative 
        p-2 
        rounded-lg 
        bg-gray-200 dark:bg-slate-700 
        hover:bg-gray-300 dark:hover:bg-slate-600 
        transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-blue-500
      "
      aria-label="Tema değiştir"
    >
      {/* Motion.div: İkon geçişi için animasyon */}
      <motion.div
        // initial: Başlangıç durumu (döndürme açısı 0)
        initial={false}
        // animate: Animasyon durumu (tema dark ise 180 derece döndür)
        animate={{ rotate: theme === 'dark' ? 180 : 0 }}
        // transition: Animasyon süresi ve tipi
        transition={{ duration: 0.3, type: 'tween' }}
      >
        {/* Tema dark ise Moon, light ise Sun ikonu gösteriliyor */}
        {theme === 'dark' ? (
          <Moon className="w-5 h-5 text-yellow-400" />
        ) : (
          <Sun className="w-5 h-5 text-orange-500" />
        )}
      </motion.div>
    </motion.button>
  )
}

