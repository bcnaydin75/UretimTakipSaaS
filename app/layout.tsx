import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { SidebarWrapper } from '@/components/SidebarWrapper'

// Google Fonts'tan Inter fontunu yüklüyoruz
const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Mobilya Üretim Takip Sistemi',
    description: 'Modern mobilya atölyesi üretim takip dashboard\'u',
    icons: {
        icon: '/favicon.ico',
    }
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="tr" suppressHydrationWarning>
            {/* suppressHydrationWarning: Tema değişikliği sırasında hydration uyarılarını önler */}
            <body className={inter.className}>
                {/* ThemeProvider: Tüm uygulamayı tema context'i ile sarıyoruz */}
                {/* Bu sayede herhangi bir bileşende tema durumuna erişebiliriz */}
                <ThemeProvider>
                    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
                        {/* Global Sidebar - Tüm sayfalarda sabit */}
                        <SidebarWrapper />
                        {/* Ana içerik - Sidebar'ın yanında */}
                        <div className="md:ml-64">
                            {children}
                        </div>
                    </div>
                </ThemeProvider>
            </body>
        </html>
    )
}

