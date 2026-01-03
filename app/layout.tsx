import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { ToastProvider } from '@/contexts/ToastContext'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { AuthProvider } from '@/components/AuthProvider'
import { SidebarWrapper } from '@/components/SidebarWrapper'
import { ContentWrapper } from '@/components/ContentWrapper'

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
                <ThemeProvider>
                    <LanguageProvider>
                        <ToastProvider>
                            <AuthProvider>
                                <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
                                    <SidebarWrapper />
                                    <ContentWrapper>
                                        {children}
                                    </ContentWrapper>
                                </div>
                            </AuthProvider>
                        </ToastProvider>
                    </LanguageProvider>
                </ThemeProvider>
            </body>
        </html>
    )
}

