'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Calendar, Loader2, DollarSign, Users, Package, ArrowLeft } from 'lucide-react'
import { getAllOrders } from '@/app/actions/orders'
import type { Order } from '@/utils/supabase'
import { formatPrice } from '@/utils/priceFormatter'
import { useLanguage } from '@/contexts/LanguageContext'

interface MonthlyData {
    month: string
    monthName: string
    orders: Order[]
    totalRevenue: number
    totalOrders: number
    uniqueCustomers: number
}

export default function Arsiv() {
    const { t, language } = useLanguage()
    const [loading, setLoading] = useState(true)
    const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
    const [selectedMonth, setSelectedMonth] = useState<string | null>(null)

    useEffect(() => {
        fetchMonthlyData()
    }, [])

    const fetchMonthlyData = async () => {
        setLoading(true)
        try {
            const result = await getAllOrders()
            if (result.success) {
                const completedOrders = result.data.filter((order) =>
                    order.status === 'Sevk' && order.is_shipped === true
                )

                // Aylara göre grupla
                const grouped: Record<string, Order[]> = {}
                completedOrders.forEach((order) => {
                    const date = new Date(order.created_at)
                    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
                    if (!grouped[monthKey]) {
                        grouped[monthKey] = []
                    }
                    grouped[monthKey].push(order)
                })

                // Aylık verileri hesapla
                const months: MonthlyData[] = Object.keys(grouped)
                    .sort()
                    .reverse()
                    .map((monthKey) => {
                        const orders = grouped[monthKey]
                        const date = new Date(monthKey + '-01')
                        const monthNames = [
                            'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
                            'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
                        ]

                        return {
                            month: monthKey,
                            monthName: `${monthNames[date.getMonth()]} ${date.getFullYear()}`,
                            orders,
                            totalRevenue: orders.reduce((sum, o) => sum + o.price, 0),
                            totalOrders: orders.length,
                            uniqueCustomers: new Set(orders.map(o => o.customer_name)).size,
                        }
                    })

                setMonthlyData(months)
            }
        } catch (error) {
            console.error('Error fetching monthly data:', error)
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
    }

    const selectedMonthData = monthlyData.find(m => m.month === selectedMonth)

    return (
        <main className="p-6 md:p-8">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
            >
                <div className="flex items-center gap-3 mb-2">
                    <Calendar className="w-8 h-8 text-indigo-500" />
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200">
                        {t('general_archive')}
                    </h1>
                </div>
                <p className="text-slate-600 dark:text-slate-400">
                    {language === 'tr' ? 'Aylık satış raporları ve detayları' : language === 'en' ? 'Monthly sales reports and details' : 'تقارير المبيعات الشهرية والتفاصيل'}
                </p>
            </motion.div>

            {loading ? (
                <div className="flex items-center justify-center py-20 mt-8">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                </div>
            ) : selectedMonthData ? (
                <div className="mt-8">
                    <button
                        onClick={() => setSelectedMonth(null)}
                        className="mb-6 flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-indigo-500 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        {language === 'tr' ? 'Geri Dön' : language === 'en' ? 'Go Back' : 'رجوع'}
                    </button>

                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 mb-6">
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6">
                            {selectedMonthData.monthName} Detayları
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{t('total_revenue')}</p>
                                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                                    {formatPrice(selectedMonthData.totalRevenue)} TL
                                </p>
                            </div>
                            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{t('total_orders')}</p>
                                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    {selectedMonthData.totalOrders}
                                </p>
                            </div>
                            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{t('unique_customers')}</p>
                                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                    {selectedMonthData.uniqueCustomers}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
                                {t('sales_details')}
                            </h3>
                            {selectedMonthData.orders.map((order) => (
                                <div
                                    key={order.id}
                                    className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold text-slate-800 dark:text-slate-200">
                                                {order.product_name}
                                            </p>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                Müşteri: {order.customer_name}
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                                                {formatDate(order.created_at)}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-indigo-600 dark:text-indigo-400">
                                                {formatPrice(order.price)} TL
                                            </p>
                                            {order.quantity && order.unit_price && (
                                                <p className="text-xs text-slate-500 dark:text-slate-500">
                                                    {order.quantity} adet × {formatPrice(order.unit_price)} TL
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                    {monthlyData.map((month, index) => (
                        <motion.div
                            key={month.month}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            onClick={() => setSelectedMonth(month.month)}
                            className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all cursor-pointer"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <Calendar className="w-6 h-6 text-indigo-500" />
                                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">
                                    {month.monthName}
                                </h3>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                                        <DollarSign className="w-4 h-4" />
                                        Toplam Gelir
                                    </span>
                                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                                        {formatPrice(month.totalRevenue)} TL
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                                        <Package className="w-4 h-4" />
                                        Sipariş Sayısı
                                    </span>
                                    <span className="font-semibold">{month.totalOrders}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                                        <Users className="w-4 h-4" />
                                        Müşteri Sayısı
                                    </span>
                                    <span className="font-semibold">{month.uniqueCustomers}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </main>
    )
}

