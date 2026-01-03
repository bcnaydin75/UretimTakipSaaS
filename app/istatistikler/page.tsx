'use client'

import {
    TrendingUp,
    Calendar,
    Users,
    DollarSign,
    Loader2
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts'
import { getAllOrders, getDashboardStats, getMonthlyRevenue } from '@/app/actions/orders'
import type { Order } from '@/utils/supabase'
import { useLanguage } from '@/contexts/LanguageContext'

/**
 * İstatistikler Sayfası
 * 
 * Üretim istatistiklerini, grafikleri ve 
 * performans metriklerini gösterir.
 */

export default function Istatistikler() {
    const { t, language } = useLanguage()
    const [loading, setLoading] = useState(true)
    const [orders, setOrders] = useState<Order[]>([])
    const [stats, setStats] = useState({
        aylikUretim: 0,
        ortalamaTamamlanma: '0 gün',
        aktifMusteri: 0,
        aylikGelir: '₺0',
    })

    useEffect(() => {
        fetchData()
    }, [])

    // İstatistik verilerini yükle
    const fetchData = async () => {
        setLoading(true)
        try {
            // Paralel olarak tüm verileri çek
            const [ordersResult, statsResult, revenueResult] = await Promise.all([
                getAllOrders(),
                getDashboardStats(),
                getMonthlyRevenue(), // Aylık gelir hesaplaması eklendi
            ])

            if (ordersResult.success) {
                setOrders(ordersResult.data)
                const monthlyData = calculateMonthlyProduction(ordersResult.data)
                setMonthlyProduction(monthlyData)
            }

            if (statsResult.success) {
                // İstatistikleri hesapla
                const totalOrders = ordersResult.success ? ordersResult.data.length : 0
                const completedOrders = ordersResult.success
                    ? ordersResult.data.filter((o) => o.status === 'Sevk').length
                    : 0

                // Bu ay oluşturulan siparişler
                const thisMonth = new Date()
                thisMonth.setDate(1)
                const thisMonthOrders = ordersResult.success
                    ? ordersResult.data.filter((o) => new Date(o.created_at) >= thisMonth)
                    : []

                // Ortalama tamamlanma süresi (basit hesaplama)
                const avgDays = completedOrders > 0 ? (totalOrders / completedOrders).toFixed(1) : '0'

                // Benzersiz müşteri sayısı
                const uniqueCustomers = ordersResult.success
                    ? new Set(ordersResult.data.map((o) => o.customer_name)).size
                    : 0

                // Aylık gelir - veritabanından gelen gerçek değer
                const revenue = revenueResult.success ? revenueResult.revenue : 0

                setStats({
                    aylikUretim: thisMonthOrders.length,
                    ortalamaTamamlanma: `${avgDays} gün`,
                    aktifMusteri: uniqueCustomers,
                    aylikGelir: `₺${new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(revenue)}`, // Veritabanından gelen gerçek gelir - Türkçe format
                })
            }
        } catch (error) {
            console.error('Error fetching statistics:', error)
        } finally {
            setLoading(false)
        }
    }

    // Aylık üretim verilerini hesapla
    const calculateMonthlyProduction = (ordersData: Order[]) => {
        const monthlyData: Record<string, { total: number; year: number; month: number }> = {}
        const monthNames = [
            'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
            'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
        ]

        ordersData.forEach((order) => {
            const date = new Date(order.created_at)
            const year = date.getFullYear()
            const month = date.getMonth()
            const monthName = `${monthNames[month]} ${year}`
            const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`

            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = { total: 0, year, month }
            }

            // quantity sütunundan adet bilgisini al (varsa, yoksa 1)
            const quantity = order.quantity || 1
            monthlyData[monthKey].total += quantity
        })

        // Ayları tarih sırasına göre sırala (en yeni önce)
        return Object.entries(monthlyData)
            .map(([key, data]) => ({
                month: `${monthNames[data.month]} ${data.year}`,
                total: data.total,
                sortKey: `${data.year}-${String(data.month + 1).padStart(2, '0')}`
            }))
            .sort((a, b) => b.sortKey.localeCompare(a.sortKey))
    }

    const [monthlyProduction, setMonthlyProduction] = useState<Array<{ month: string; total: number }>>([])

    // Aşamaya göre iş dağılımı
    const asamaDagilimi = [
        {
            asama: 'Kesim',
            isSayisi: orders.filter((o) => o.status === 'Kesim').length,
        },
        {
            asama: 'Döşeme',
            isSayisi: orders.filter((o) => o.status === 'Döşeme').length,
        },
        {
            asama: 'Boya',
            isSayisi: orders.filter((o) => o.status === 'Boya').length,
        },
        {
            asama: 'Paket',
            isSayisi: orders.filter((o) => o.status === 'Paket').length,
        },
        {
            asama: 'Sevk',
            isSayisi: orders.filter((o) => o.status === 'Sevk').length,
        },
    ]

    return (
        <main className="p-6 md:p-8">
            {/* Sayfa Başlığı */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
            >
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                    {t('statistics')}
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                    {language === 'tr' ? 'Üretim performansınızı analiz edin' : language === 'en' ? 'Analyze your production performance' : 'حلل أداء الإنتاج'}
                </p>
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
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    {t('monthly_production')}
                                </p>
                                <p className="text-3xl font-bold mt-2 text-slate-800 dark:text-slate-200">
                                    {stats.aylikUretim}
                                </p>
                            </div>
                            <div className="p-3 rounded-lg bg-indigo-500 dark:bg-indigo-600">
                                <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    {t('average_completion')}
                                </p>
                                <p className="text-3xl font-bold mt-2 text-slate-800 dark:text-slate-200">
                                    {stats.ortalamaTamamlanma}
                                </p>
                            </div>
                            <div className="p-3 rounded-lg bg-blue-500 dark:bg-blue-600">
                                <Calendar className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                        className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    {t('active_customers')}
                                </p>
                                <p className="text-3xl font-bold mt-2 text-slate-800 dark:text-slate-200">
                                    {stats.aktifMusteri}
                                </p>
                            </div>
                            <div className="p-3 rounded-lg bg-indigo-500 dark:bg-indigo-600">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.3 }}
                        className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    {t('monthly_revenue')}
                                </p>
                                <p className="text-3xl font-bold mt-2 text-slate-800 dark:text-slate-200">
                                    {stats.aylikGelir}
                                </p>
                            </div>
                            <div className="p-3 rounded-lg bg-blue-500 dark:bg-blue-600">
                                <DollarSign className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Aylık Üretim Performansı Tablosu */}
            {loading ? (
                <div className="mt-8 bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                    <div className="h-64 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                    </div>
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                    className="mt-8 bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700"
                >
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-6">
                        📊 {t('monthly_production_performance')}
                    </h2>
                    {monthlyProduction.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-700">
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                            {t('month')}
                                        </th>
                                        <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                            {t('total_quantity')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {monthlyProduction.map((item, index) => (
                                        <motion.tr
                                            key={item.month}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.3, delay: index * 0.05 }}
                                            className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                                        >
                                            <td className="py-4 px-4 text-slate-800 dark:text-slate-200 font-medium">
                                                {item.month}
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                                                    {item.total.toLocaleString('tr-TR')} {language === 'tr' ? 'Adet' : language === 'en' ? 'Pcs' : 'قطعة'}
                                                </span>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-slate-500 dark:text-slate-400">
                                Henüz üretim verisi bulunmuyor
                            </p>
                        </div>
                    )}
                </motion.div>
            )}

            {/* Aşamaya Göre İş Dağılımı - Bar Chart */}
            {loading ? (
                <div className="mt-8 bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                    <div className="h-64 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                    </div>
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.5 }}
                    className="mt-8 bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700"
                >
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
                        📈 Aşamaya Göre İş Dağılımı
                    </h2>
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={asamaDagilimi}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
                            <XAxis
                                dataKey="asama"
                                stroke="#64748b"
                                className="dark:stroke-slate-400"
                            />
                            <YAxis
                                stroke="#64748b"
                                className="dark:stroke-slate-400"
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                }}
                            />
                            <Bar
                                dataKey="isSayisi"
                                fill="#6366f1"
                                radius={[8, 8, 0, 0]}
                                name="İş Sayısı"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>
            )}
        </main>
    )
}
