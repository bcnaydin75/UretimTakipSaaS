'use client'

import {
    ClipboardList,
    AlertTriangle,
    Paintbrush,
    CheckCircle2,
    Clock,
    ArrowRight,
    Plus,
    Loader2
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { NewOrderModal } from '@/components/NewOrderModal'
import { getDashboardStats, getUrgentOrders, getMonthlyRevenue } from '@/app/actions/orders'
import type { Order } from '@/utils/supabase'
import { useLanguage } from '@/contexts/LanguageContext'

/**
 * Dashboard Sayfası
 * 
 * Mobilya üretim takip sisteminin ana kontrol paneli.
 * Aktif siparişler, kritik gecikmeler ve acil işler görüntülenir.
 */

export default function Dashboard() {
    const { t, language } = useLanguage()
    const router = useRouter() // Next.js router eklendi
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        aktifSiparisler: 0,
        kritikGecikmeler: 0,
        boyahanedekiIsler: 0,
        tamamlananBuAy: 0,
    })
    const [monthlyRevenue, setMonthlyRevenue] = useState(0) // Aylık gelir state'i eklendi
    const [urgentOrders, setUrgentOrders] = useState<Order[]>([])

    // Dashboard verilerini yükle
    const fetchData = async () => {
        setLoading(true)
        try {
            // Paralel olarak tüm verileri çek
            const [statsResult, urgentResult, revenueResult] = await Promise.all([
                getDashboardStats(),
                getUrgentOrders(),
                getMonthlyRevenue(), // Aylık gelir hesaplaması eklendi
            ])

            if (statsResult.success) {
                setStats(statsResult.stats)
            }

            if (urgentResult.success) {
                setUrgentOrders(urgentResult.data)
            }

            if (revenueResult.success) {
                setMonthlyRevenue(revenueResult.revenue)
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleModalSuccess = () => {
        fetchData() // Verileri yeniden yükle
    }

    // Gecikme hesaplama fonksiyonu - Teslim tarihine kaç gün kaldığını hesaplar
    const calculateDelay = (deliveryDate: string | null): number => {
        if (!deliveryDate) return 0
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const delivery = new Date(deliveryDate)
        delivery.setHours(0, 0, 0, 0)
        const diffTime = delivery.getTime() - today.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        // Negatif değer gecikme, pozitif değer kalan gün
        return diffDays < 0 ? Math.abs(diffDays) : 0
    }

    // Teslim tarihine kaç gün kaldığını hesapla (5 gün kuralı için)
    const calculateDaysUntilDelivery = (deliveryDate: string | null): number => {
        if (!deliveryDate) return 999 // Tarih yoksa çok büyük sayı döndür
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const delivery = new Date(deliveryDate)
        delivery.setHours(0, 0, 0, 0)
        const diffTime = delivery.getTime() - today.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays
    }

    return (
        <main className="p-6 md:p-8">
            {/* Sayfa Başlığı */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex items-center justify-between"
            >
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                        {t('dashboard')}
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        {t('dashboard_description')}
                    </p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-500 text-white rounded-xl font-semibold hover:bg-indigo-600 shadow-lg shadow-indigo-500/20 transition-all"
                >
                    <Plus className="w-5 h-5" />
                    {t('new_order')}
                </motion.button>
            </motion.div>

            {/* İstatistik Kartları */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                    {[...Array(4)].map((_, i) => (
                        <div
                            key={i}
                            className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 animate-pulse"
                        >
                            <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                    {/* Aktif Siparişler - Mavi */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-shadow"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                                    {t('active_orders')}
                                </p>
                                <p className="text-3xl font-bold mt-2 text-blue-600 dark:text-blue-400">
                                    {stats.aktifSiparisler}
                                </p>
                            </div>
                            <div className="p-3 rounded-lg bg-blue-500 dark:bg-blue-600">
                                <ClipboardList className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </motion.div>

                    {/* Kritik Gecikmeler - Kırmızı */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                        className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-shadow"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                                    {t('critical_delays')}
                                </p>
                                <p className="text-3xl font-bold mt-2 text-red-600 dark:text-red-400">
                                    {stats.kritikGecikmeler}
                                </p>
                            </div>
                            <div className="p-3 rounded-lg bg-red-500 dark:bg-red-600">
                                <AlertTriangle className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </motion.div>

                    {/* Boyahanedeki İşler - Turuncu */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.3 }}
                        className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-shadow"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                                    {t('paint_shop')}
                                </p>
                                <p className="text-3xl font-bold mt-2 text-orange-600 dark:text-orange-400">
                                    {stats.boyahanedekiIsler}
                                </p>
                            </div>
                            <div className="p-3 rounded-lg bg-orange-500 dark:bg-orange-600">
                                <Paintbrush className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </motion.div>

                    {/* Aylık Gelir - Yeşil - Veritabanındaki tüm siparişlerin price toplamı */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.4 }}
                        className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-shadow"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                                    {t('monthly_revenue')}
                                </p>
                                <p className="text-3xl font-bold mt-2 text-green-600 dark:text-green-400">
                                    {t('currency_symbol')}{new Intl.NumberFormat(language === 'tr' ? 'tr-TR' : language === 'en' ? 'en-US' : 'ar-SA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(monthlyRevenue)}
                                </p>
                            </div>
                            <div className="p-3 rounded-lg bg-green-500 dark:bg-green-600">
                                <CheckCircle2 className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Acil Bekleyen İşler Listesi */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="mt-8 bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700"
            >
                <div className="flex items-center gap-3 mb-6">
                    <Clock className="w-6 h-6 text-orange-500" />
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
                        {t('urgent_pending_tasks')}
                    </h2>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                    </div>
                ) : urgentOrders.length > 0 ? (
                    <div className="space-y-3">
                        {urgentOrders.map((order, index) => {
                            // 5 gün kuralına göre acil durumu kontrol et
                            const daysUntilDelivery = calculateDaysUntilDelivery(order.delivery_date)
                            const delay = calculateDelay(order.delivery_date)
                            // Acil: Manuel işaretlenmiş, gecikmiş veya 5 gün veya daha az kaldıysa
                            const isCritical = order.is_urgent || delay > 0 || (daysUntilDelivery <= 5 && daysUntilDelivery >= 0)

                            return (
                                <motion.div
                                    key={order.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                                    className={`
                                        p-4 rounded-lg border-2 transition-all cursor-pointer
                                        ${isCritical
                                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                            : 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                                        }
                                        hover:shadow-md
                                    `}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold text-slate-800 dark:text-slate-200">
                                                    {order.product_name}
                                                </h3>
                                                {isCritical && (
                                                    <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full font-medium">
                                                        {t('critical')}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                👤 {order.customer_name}
                                            </p>
                                            <div className="flex items-center gap-4 mt-2">
                                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                                    📍 {order.status}
                                                </span>
                                                {delay > 0 && (
                                                    <span className="text-xs font-medium text-red-600 dark:text-red-400">
                                                        ⏰ {delay} {t('days_delay')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => router.push('/uretim')}
                                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors ml-4"
                                            aria-label="Üretim Takibi sayfasına git"
                                        >
                                            <ArrowRight className="w-5 h-5 text-slate-400 hover:text-indigo-500 transition-colors" />
                                        </button>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                ) : (
                    <p className="text-center py-8 text-slate-500 dark:text-slate-400">
                        {t('no_urgent_orders')}
                    </p>
                )}
            </motion.div>

            {/* Yeni Sipariş Modal */}
            <NewOrderModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleModalSuccess}
            />
        </main>
    )
}
