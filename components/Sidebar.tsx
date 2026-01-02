'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    ClipboardList,
    BarChart3,
    Settings,
    Menu,
    X,
    Archive
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { ThemeToggle } from './ThemeToggle'

/**
 * Sidebar Bileşeni
 * 
 * Responsive navigasyon menüsü. Mobilde hamburger menü ile açılıp kapanır.
 * Framer Motion ile yumuşak animasyonlar içerir.
 */

// Menü öğelerinin tipi
interface MenuItem {
    name: string
    href: string
    icon: React.ComponentType<{ className?: string }>
}

// Menü öğelerini tanımlıyoruz
const menuItems: MenuItem[] = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Üretim Takibi', href: '/uretim', icon: ClipboardList },
    { name: 'Satış Arşivi', href: '/satis-arsivi', icon: Archive },
    { name: 'İstatistikler', href: '/istatistikler', icon: BarChart3 },
    { name: 'Ayarlar', href: '/ayarlar', icon: Settings },
]

export function Sidebar() {
    // useState: Sidebar'ın açık/kapalı durumunu tutar
    // Mobilde başlangıçta kapalı, desktop'ta açık olmalı
    const [isOpen, setIsOpen] = useState(false)
    // useState: Ekran genişliğini tutar (SSR sorununu önlemek için)
    const [isDesktop, setIsDesktop] = useState(false)

    // usePathname: Next.js hook'u, mevcut sayfa yolunu döndürür
    // Aktif menü öğesini vurgulamak için kullanılır
    const pathname = usePathname()

    // useEffect: Ekran genişliğini kontrol eder
    // SSR sırasında window objesi olmadığı için useEffect içinde kontrol ediyoruz
    useEffect(() => {
        const checkDesktop = () => {
            const isDesktopWidth = window.innerWidth >= 768
            setIsDesktop(isDesktopWidth)
            // Desktop'ta sidebar her zaman açık, mobilde kapalı
            if (isDesktopWidth) {
                setIsOpen(true)
            } else {
                setIsOpen(false)
            }
        }

        // İlk yüklemede kontrol et
        checkDesktop()

        // Ekran boyutu değiştiğinde kontrol et
        window.addEventListener('resize', checkDesktop)

        // Cleanup: Component unmount olduğunda event listener'ı kaldır
        return () => window.removeEventListener('resize', checkDesktop)
    }, [])

    // Menüyü aç/kapat fonksiyonu
    const toggleSidebar = () => {
        setIsOpen(!isOpen)
    }

    return (
        <>
            {/* Hamburger Menü Butonu - Sadece mobilde görünür */}
            <button
                onClick={toggleSidebar}
                className="
          fixed 
          top-4 
          left-4 
          z-50 
          p-2 
          rounded-lg 
          bg-white dark:bg-slate-800 
          shadow-lg 
          md:hidden
          focus:outline-none focus:ring-2 focus:ring-blue-500
        "
                aria-label="Menüyü aç/kapat"
            >
                {isOpen ? (
                    <X className="w-6 h-6 text-slate-700 dark:text-slate-300" />
                ) : (
                    <Menu className="w-6 h-6 text-slate-700 dark:text-slate-300" />
                )}
            </button>

            {/* Overlay - Mobilde sidebar açıkken arka planı karartır */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        // initial: Başlangıç durumu (opacity 0)
                        initial={{ opacity: 0 }}
                        // animate: Animasyon durumu (opacity 1)
                        animate={{ opacity: 1 }}
                        // exit: Çıkış animasyonu (opacity 0)
                        exit={{ opacity: 0 }}
                        // onClick: Overlay'e tıklandığında sidebar'ı kapat
                        onClick={toggleSidebar}
                        className="
              fixed 
              inset-0 
              bg-black/50 
              z-40 
              md:hidden
            "
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
                // initial: Başlangıç durumu (mobilde soldan dışarıda)
                initial={false}
                // animate: Animasyon durumu
                // Mobilde: isOpen true ise x:0 (görünür), false ise x:-100% (gizli)
                // Desktop'ta: her zaman görünür (x:0)
                animate={{
                    x: isOpen || isDesktop ? 0 : -256,
                }}
                // transition: Animasyon süresi ve tipi
                transition={{ type: 'tween', duration: 0.3 }}
                className="
          fixed 
          left-0 
          top-0 
          h-full 
          w-64 
          bg-white dark:bg-slate-800 
          shadow-xl 
          z-40
          md:translate-x-0
          flex flex-col
          scrollbar-thin
        "
            >
                {/* Sidebar Header */}
                <div className="
          p-6 
          border-b 
          border-slate-200 dark:border-slate-700
          flex items-center justify-between
        ">
                    <h1 className="
            text-xl 
            font-bold 
            text-slate-800 dark:text-slate-200
          ">
                        🏭 Üretim Takip
                    </h1>
                    {/* Tema değiştirme butonu */}
                    <ThemeToggle />
                </div>

                {/* Menü Öğeleri */}
                <nav className="flex-1 p-4 space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon
                        // pathname ile mevcut sayfa yolunu karşılaştırıyoruz
                        const isActive = pathname === item.href

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => {
                                    // Mobilde menü öğesine tıklandığında sidebar'ı kapat
                                    if (!isDesktop) {
                                        setIsOpen(false)
                                    }
                                }}
                                className={`
                  flex 
                  items-center 
                  gap-3 
                  p-3 
                  rounded-lg 
                  transition-all duration-200
                  ${isActive
                                        ? 'bg-indigo-500 text-white shadow-md'
                                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                                    }
                `}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="font-medium">{item.name}</span>
                            </Link>
                        )
                    })}
                </nav>

                {/* Sidebar Footer */}
                <div className="
          p-4 
          border-t 
          border-slate-200 dark:border-slate-700
          text-sm 
          text-slate-500 dark:text-slate-400
        ">
                    <p>© 2024 Mobilya Atölyesi</p>
                </div>
            </motion.aside>
        </>
    )
}

