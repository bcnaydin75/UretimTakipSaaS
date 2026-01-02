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
    AreaChart,
    Area,
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

/**
 * İstatistikler Sayfası
 * 
 * Üretim istatistiklerini, grafikleri ve 
 * performans metriklerini gösterir.
 */

export default function Istatistikler() {
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
                processChartData(ordersResult.data)
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

    // Haftalık veri işleme
    const processChartData = (ordersData: Order[]) => {
        // Son 7 günün verilerini hazırla
        const last7Days = []
        const today = new Date()

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today)
            date.setDate(date.getDate() - i)
            const dateStr = date.toISOString().split('T')[0]

            // O gün oluşturulan siparişleri say
            const dayOrders = ordersData.filter((o) => {
                const orderDate = new Date(o.created_at).toISOString().split('T')[0]
                return orderDate === dateStr
            })

            // Ürün tiplerine göre grupla (basit bir yaklaşım)
            const koltuk = dayOrders.filter((o) =>
                o.product_name.toLowerCase().includes('koltuk')
            ).length
            const masa = dayOrders.filter((o) =>
                o.product_name.toLowerCase().includes('masa')
            ).length
            const dolap = dayOrders.filter((o) =>
                o.product_name.toLowerCase().includes('dolap')
            ).length

            last7Days.push({
                gun: date.toLocaleDateString('tr-TR', { weekday: 'short' }),
                koltuk,
                masa,
                dolap,
            })
        }

        setHaftalikVeri(last7Days)
    }

    const [haftalikVeri, setHaftalikVeri] = useState([
        { gun: 'Pzt', koltuk: 0, masa: 0, dolap: 0 },
        { gun: 'Sal', koltuk: 0, masa: 0, dolap: 0 },
        { gun: 'Çar', koltuk: 0, masa: 0, dolap: 0 },
        { gun: 'Per', koltuk: 0, masa: 0, dolap: 0 },
        { gun: 'Cum', koltuk: 0, masa: 0, dolap: 0 },
        { gun: 'Cmt', koltuk: 0, masa: 0, dolap: 0 },
        { gun: 'Paz', koltuk: 0, masa: 0, dolap: 0 },
    ])

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
                    İstatistikler
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                    Üretim performansınızı analiz edin
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
                                    Aylık Üretim
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
                                    Ortalama Tamamlanma
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
                                    Aktif Müşteri
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
                                    Aylık Gelir
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

            {/* Haftalık Üretim Performansı - Area Chart */}
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
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
                        📊 Haftalık Üretim Performansı
                    </h2>
                    <ResponsiveContainer width="100%" height={350}>
                        <AreaChart data={haftalikVeri}>
                            <defs>
                                <linearGradient id="colorKoltuk" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorMasa" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorDolap" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
                            <XAxis
                                dataKey="gun"
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
                            <Legend />
                            <Area
                                type="monotone"
                                dataKey="koltuk"
                                stackId="1"
                                stroke="#6366f1"
                                fillOpacity={1}
                                fill="url(#colorKoltuk)"
                                name="Koltuk"
                            />
                            <Area
                                type="monotone"
                                dataKey="masa"
                                stackId="1"
                                stroke="#3b82f6"
                                fillOpacity={1}
                                fill="url(#colorMasa)"
                                name="Masa"
                            />
                            <Area
                                type="monotone"
                                dataKey="dolap"
                                stackId="1"
                                stroke="#8b5cf6"
                                fillOpacity={1}
                                fill="url(#colorDolap)"
                                name="Dolap"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
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
