'use client'

import {
    Scissors,
    Sofa,
    Paintbrush,
    Package,
    Truck,
    ArrowRight,
    Loader2
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { getAllOrders, updateOrderStatus } from '@/app/actions/orders'
import type { Order } from '@/utils/supabase'

/**
 * Üretim Takibi Sayfası
 * 
 * 5 aşamalı üretim sürecini gösterir:
 * 1. Kesim ➔ 2. Döşeme ➔ 3. Boya ➔ 4. Paket ➔ 5. Sevk
 * Her aşamanın kendine özgü rengi ve ikonu vardır.
 */

// Üretim aşamaları tipi (veritabanındaki status değerleriyle eşleşmeli)
type UretimAsamasi = 'Kesim' | 'Döşeme' | 'Boya' | 'Paket' | 'Sevk'

// Aşama bilgileri
interface AsamaBilgisi {
    id: UretimAsamasi
    ad: string
    icon: React.ComponentType<{ className?: string }>
    renk: string
    renkDark: string
    renkAcik: string
    nextStatus?: UretimAsamasi
}

// Aşama tanımları - Her aşamanın görsel özellikleri
const asamalar: AsamaBilgisi[] = [
    {
        id: 'Kesim',
        ad: 'Kesim',
        icon: Scissors,
        renk: 'bg-blue-500',
        renkDark: 'bg-blue-600',
        renkAcik: 'bg-blue-100 dark:bg-blue-900/30',
        nextStatus: 'Döşeme',
    },
    {
        id: 'Döşeme',
        ad: 'Döşeme',
        icon: Sofa,
        renk: 'bg-purple-500',
        renkDark: 'bg-purple-600',
        renkAcik: 'bg-purple-100 dark:bg-purple-900/30',
        nextStatus: 'Boya',
    },
    {
        id: 'Boya',
        ad: 'Boya',
        icon: Paintbrush,
        renk: 'bg-orange-500',
        renkDark: 'bg-orange-600',
        renkAcik: 'bg-orange-100 dark:bg-orange-900/30',
        nextStatus: 'Paket',
    },
    {
        id: 'Paket',
        ad: 'Paket',
        icon: Package,
        renk: 'bg-green-500',
        renkDark: 'bg-green-600',
        renkAcik: 'bg-green-100 dark:bg-green-900/30',
        nextStatus: 'Sevk',
    },
    {
        id: 'Sevk',
        ad: 'Sevk',
        icon: Truck,
        renk: 'bg-red-500',
        renkDark: 'bg-red-600',
        renkAcik: 'bg-red-100 dark:bg-red-900/30',
    },
]

export default function UretimTakibi() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true) // Yükleme durumu
    const [updating, setUpdating] = useState<string | null>(null) // Güncelleme durumu

    // Sayfa yüklendiğinde verileri çek
    useEffect(() => {
        fetchOrders()
    }, [])

    // Siparişleri Supabase'den yükle
    const fetchOrders = async () => {
        setLoading(true)
        try {
            const result = await getAllOrders()
            if (result.success) {
                setOrders(result.data)
            } else {
                console.error('Error fetching orders:', result.error)
            }
        } catch (error) {
            console.error('Error fetching orders:', error)
        } finally {
            setLoading(false)
        }
    }

    // Status güncelleme fonksiyonu - Siparişi bir sonraki aşamaya taşır
    const handleStatusUpdate = async (orderId: string, currentStatus: UretimAsamasi) => {
        const asama = asamalar.find((a) => a.id === currentStatus)
        if (!asama || !asama.nextStatus) return

        setUpdating(orderId) // Güncelleme durumunu başlat
        try {
            const result = await updateOrderStatus(orderId, asama.nextStatus)
            if (result.success) {
                // Başarılı olursa local state'i güncelle (optimistic update)
                setOrders((prev) =>
                    prev.map((order) =>
                        order.id === orderId
                            ? { ...order, status: asama.nextStatus! }
                            : order
                    )
                )
            } else {
                alert('Hata: ' + result.error)
            }
        } catch (error) {
            console.error('Error updating status:', error)
            alert('Bir hata oluştu')
        } finally {
            setUpdating(null) // Güncelleme durumunu sıfırla
        }
    }

    // Her aşamadaki işleri filtrele - Status'a göre siparişleri grupla
    const asamaIcerik = (asamaId: UretimAsamasi) => {
        return orders.filter((order) => order.status === asamaId)
    }

    // Tarih formatlama - Türkçe formatında göster
    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Belirtilmemiş'
        const date = new Date(dateString)
        return date.toLocaleDateString('tr-TR')
    }

    return (
        <main className="p-6 md:p-8">
            {/* Sayfa Başlığı */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
            >
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                    Üretim Takibi
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                    Tüm üretim aşamalarını takip edin
                </p>
            </motion.div>

            {/* Loading State */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                </div>
            ) : (
                /* Aşamalar Grid'i - Responsive tasarım */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mt-8">
                    {asamalar.map((asama, index) => {
                        const Icon = asama.icon
                        const asamaIsleri = asamaIcerik(asama.id)

                        return (
                            <motion.div
                                key={asama.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden min-w-[280px]"
                            >
                                {/* Aşama Başlığı */}
                                <div className={`${asama.renk} p-5 text-white flex items-center gap-3`}>
                                    <Icon className="w-6 h-6" />
                                    <h3 className="font-semibold text-lg">{asama.ad}</h3>
                                    {/* Aşamadaki iş sayısı */}
                                    <span className="ml-auto bg-white/20 px-3 py-1.5 rounded-full text-sm font-medium">
                                        {asamaIsleri.length}
                                    </span>
                                </div>

                                {/* Aşamadaki İşler Listesi */}
                                <div className="p-5 space-y-3 max-h-[600px] overflow-y-auto scrollbar-thin">
                                    {asamaIsleri.length > 0 ? (
                                        asamaIsleri.map((order) => (
                                            <motion.div
                                                key={order.id}
                                                whileHover={{ scale: 1.02, y: -2 }}
                                                className={`p-4 rounded-lg ${asama.renkAcik} border border-slate-200 dark:border-slate-700 transition-all duration-200 shadow-sm hover:shadow-md`}
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex-1">
                                                        <p className="font-semibold text-slate-800 dark:text-slate-200 text-base mb-1">
                                                            {order.product_name}
                                                        </p>
                                                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                                                            👤 {order.customer_name}
                                                        </p>
                                                        {order.dimensions && (
                                                            <p className="text-xs text-slate-500 dark:text-slate-500 mb-1">
                                                                📏 {order.dimensions}
                                                            </p>
                                                        )}
                                                        <p className="text-xs text-slate-500 dark:text-slate-500 font-mono">
                                                            📅 {formatDate(order.delivery_date)}
                                                        </p>
                                                        {order.is_urgent && (
                                                            <span className="inline-block mt-1 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full font-medium">
                                                                ACİL
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Sonraki Aşamaya Geç Butonu */}
                                                {asama.nextStatus && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(order.id, asama.id)}
                                                        disabled={updating === order.id}
                                                        className="w-full mt-3 flex items-center justify-center gap-2 px-3 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                                                    >
                                                        {updating === order.id ? (
                                                            <>
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                                Güncelleniyor...
                                                            </>
                                                        ) : (
                                                            <>
                                                                Sonraki Aşamaya Geç
                                                                <ArrowRight className="w-4 h-4" />
                                                            </>
                                                        )}
                                                    </button>
                                                )}
                                            </motion.div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">
                                            Bu aşamada iş yok
                                        </p>
                                    )}
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            )}
        </main>
    )
}
