'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Archive, Loader2 } from 'lucide-react'
import { getAllOrders } from '@/app/actions/orders'
import type { Order } from '@/utils/supabase'
import { formatPrice } from '@/utils/priceFormatter'

/**
 * Satış Arşivi Sayfası
 * 
 * Durumu 'Sevk' olan tüm tamamlanmış siparişleri gösterir.
 * Grid yapısında modern kartlar ile satış fiyatları görüntülenir.
 */

export default function SatisArsivi() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)

    // Sayfa yüklendiğinde tamamlanmış siparişleri çek
    useEffect(() => {
        fetchCompletedOrders()
    }, [])

    // Tamamlanmış siparişleri yükle (status = 'Sevk')
    const fetchCompletedOrders = async () => {
        setLoading(true)
        try {
            const result = await getAllOrders()
            if (result.success) {
                // Sadece 'Sevk' durumundaki siparişleri filtrele
                const completedOrders = result.data.filter((order) => order.status === 'Sevk')
                // Tarihe göre sırala (en yeni önce)
                completedOrders.sort((a, b) => {
                    const dateA = new Date(a.created_at).getTime()
                    const dateB = new Date(b.created_at).getTime()
                    return dateB - dateA
                })
                setOrders(completedOrders)
            }
        } catch (error) {
            console.error('Error fetching completed orders:', error)
        } finally {
            setLoading(false)
        }
    }

    // Tarih formatlama
    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
    }

    return (
        <main className="p-6 md:p-8">
            {/* Sayfa Başlığı */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
            >
                <div className="flex items-center gap-3 mb-2">
                    <Archive className="w-8 h-8 text-indigo-500" />
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200">
                        Satış Arşivi
                    </h1>
                </div>
                <p className="text-slate-600 dark:text-slate-400">
                    Tamamlanmış ve sevk edilmiş tüm siparişler
                </p>
            </motion.div>

            {/* Loading Durumu */}
            {loading ? (
                <div className="flex items-center justify-center py-20 mt-8">
                    <div className="text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto mb-4" />
                        <p className="text-slate-600 dark:text-slate-400">Satışlar yükleniyor...</p>
                    </div>
                </div>
            ) : orders.length > 0 ? (
                /* Grid Yapısı - Modern Kartlar */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
                    {orders.map((order, index) => (
                        <motion.div
                            key={order.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all"
                        >
                            {/* Müşteri Adı */}
                            <div className="mb-4">
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                                    Müşteri
                                </p>
                                <p className="font-semibold text-slate-800 dark:text-slate-200">
                                    {order.customer_name}
                                </p>
                            </div>

                            {/* Ürün Adı */}
                            <div className="mb-4">
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                                    Ürün
                                </p>
                                <p className="font-medium text-slate-700 dark:text-slate-300">
                                    {order.product_name}
                                </p>
                            </div>

                            {/* Satış Fiyatı - Büyük Punto */}
                            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                                    Satış Fiyatı
                                </p>
                                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                                    {formatPrice(order.price)} TL
                                </p>
                            </div>

                            {/* Tarih Bilgisi */}
                            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    📅 {formatDate(order.created_at)}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="mt-8 bg-white dark:bg-slate-800 rounded-xl p-12 shadow-lg border border-slate-200 dark:border-slate-700 text-center">
                    <Archive className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <p className="text-lg font-semibold text-slate-600 dark:text-slate-400">
                        Henüz tamamlanmış sipariş bulunmuyor
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">
                        Siparişler sevk edildikçe burada görünecek
                    </p>
                </div>
            )}
        </main>
    )
}

