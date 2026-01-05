'use client'

import {
    Scissors,
    Sofa,
    Paintbrush,
    Package,
    Truck,
    ArrowRight,
    Loader2,
    RotateCcw,
    X,
    Check,
    Phone
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { getAllOrders, updateOrderStatus, deleteOrder, confirmShipment } from '@/app/actions/orders'
// import { supabase } from '@/utils/supabase'
import type { Order } from '@/utils/supabase'
import { useToast } from '@/contexts/ToastContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { sendSMSNotification, createShipmentMessage } from '@/utils/sms_service'

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
    prevStatus?: UretimAsamasi
}

// Aşama tanımları - Her aşamanın görsel özellikleri
// Not: 'ad' alanı artık kullanılmıyor, t() fonksiyonu ile çeviri yapılıyor
const asamalar: AsamaBilgisi[] = [
    {
        id: 'Kesim',
        ad: 'Kesim', // Eski kod uyumluluğu için, artık kullanılmıyor
        icon: Scissors,
        renk: 'bg-blue-500',
        renkDark: 'bg-blue-600',
        renkAcik: 'bg-blue-100 dark:bg-blue-900/30',
        nextStatus: 'Döşeme',
        prevStatus: undefined,
    },
    {
        id: 'Döşeme',
        ad: 'Döşeme', // Eski kod uyumluluğu için, artık kullanılmıyor
        icon: Sofa,
        renk: 'bg-purple-500',
        renkDark: 'bg-purple-600',
        renkAcik: 'bg-purple-100 dark:bg-purple-900/30',
        nextStatus: 'Boya',
        prevStatus: 'Kesim',
    },
    {
        id: 'Boya',
        ad: 'Boya', // Eski kod uyumluluğu için, artık kullanılmıyor
        icon: Paintbrush,
        renk: 'bg-orange-500',
        renkDark: 'bg-orange-600',
        renkAcik: 'bg-orange-100 dark:bg-orange-900/30',
        nextStatus: 'Paket',
        prevStatus: 'Döşeme',
    },
    {
        id: 'Paket',
        ad: 'Paket', // Eski kod uyumluluğu için, artık kullanılmıyor
        icon: Package,
        renk: 'bg-green-500',
        renkDark: 'bg-green-600',
        renkAcik: 'bg-green-100 dark:bg-green-900/30',
        nextStatus: 'Sevk',
        prevStatus: 'Boya',
    },
    {
        id: 'Sevk',
        ad: 'Sevk', // Eski kod uyumluluğu için, artık kullanılmıyor
        icon: Truck,
        renk: 'bg-red-500',
        renkDark: 'bg-red-600',
        renkAcik: 'bg-red-100 dark:bg-red-900/30',
        prevStatus: 'Paket',
    },
]

export default function UretimTakibi() {
    const { showToast } = useToast()
    const { t, language } = useLanguage()

    // Aşama ID'lerini çeviri key'lerine dönüştür
    const getStageTranslationKey = (stageId: string): string => {
        const mapping: Record<string, string> = {
            'Kesim': 'cutting',
            'Döşeme': 'upholstery',
            'Boya': 'paint',
            'Paket': 'package',
            'Sevk': 'shipment',
        }
        return mapping[stageId] || stageId
    }
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true) // Yükleme durumu
    const [updating, setUpdating] = useState<string | null>(null) // Güncelleme durumu
    const [cancelOrderId, setCancelOrderId] = useState<string | null>(null) // İptal edilecek sipariş ID
    const [confirmShipId, setConfirmShipId] = useState<string | null>(null) // Sevkiyat onayı için sipariş ID
    const [stats, setStats] = useState({
        toplam: 0,
        tamamlanan: 0,
        devamEden: 0,
        geciken: 0,
        yuzde: 0
    })

    // Sayfa yüklendiğinde verileri çek
    useEffect(() => {
        fetchOrders()
    }, [])

    // Siparişleri Supabase'den yükle - is_shipped=true olanları filtrele
    const fetchOrders = async () => {
        setLoading(true)
        try {
            const result = await getAllOrders()
            if (result.success) {
                // Sevkiyatı onaylanmış (is_shipped=true) siparişleri filtrele
                const activeOrders = result.data.filter(order => !order.is_shipped)
                setOrders(activeOrders)

                // İstatistikleri hesapla
                const total = result.data.length
                const completed = result.data.filter(o => o.is_shipped).length
                const ongoing = activeOrders.length

                const today = new Date()
                today.setHours(0, 0, 0, 0)
                const delayed = activeOrders.filter(o => {
                    if (!o.delivery_date) return false
                    return new Date(o.delivery_date) < today
                }).length

                const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

                setStats({
                    toplam: total,
                    tamamlanan: completed,
                    devamEden: ongoing,
                    geciken: delayed,
                    yuzde: percentage
                })
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
                showToast(t('order_updated_success'), 'success')
            } else {
                showToast(t('error_prefix') + t(result.error || 'error_generic'), 'error')
            }
        } catch (error) {
            console.error('Error updating status:', error)
            showToast(t('error_generic'), 'error')
        } finally {
            setUpdating(null) // Güncelleme durumunu sıfırla
        }
    }

    // Status geri alma fonksiyonu - Siparişi bir önceki aşamaya taşır
    const handleStatusBack = async (orderId: string, currentStatus: UretimAsamasi) => {
        const asama = asamalar.find((a) => a.id === currentStatus)
        if (!asama || !asama.prevStatus) return

        setUpdating(orderId)
        try {
            const result = await updateOrderStatus(orderId, asama.prevStatus)
            if (result.success) {
                setOrders((prev) =>
                    prev.map((order) =>
                        order.id === orderId
                            ? { ...order, status: asama.prevStatus! }
                            : order
                    )
                )
                showToast(t('order_back_success'), 'success')
            } else {
                showToast(t('error_prefix') + t(result.error || 'error_generic'), 'error')
            }
        } catch (error) {
            console.error('Error updating status:', error)
            showToast(t('error_generic'), 'error')
        } finally {
            setUpdating(null)
        }
    }

    // Sipariş iptal fonksiyonu
    const handleCancelOrder = async (orderId: string) => {
        setUpdating(orderId)
        try {
            const result = await deleteOrder(orderId)
            if (result.success) {
                setOrders((prev) => prev.filter((order) => order.id !== orderId))
                setCancelOrderId(null)
                showToast(t('order_cancelled_success'), 'success')
            } else {
                showToast(t('error_prefix') + t(result.error || 'error_generic'), 'error')
            }
        } catch (error) {
            console.error('Error canceling order:', error)
            showToast(t('error_generic'), 'error')
        } finally {
            setUpdating(null)
        }
    }

    // Sevkiyat onay fonksiyonu
    const handleConfirmShipment = async (orderId: string) => {
        const order = orders.find(o => o.id === orderId)

        // Telefon numarası kontrolü
        if (!order?.customer_phone || order.customer_phone.trim() === '') {
            showToast(t('phone_required_for_shipment'), 'error')
            return
        }

        // Telefon formatı kontrolü (En az 10 rakam olmalı: 05XX XXX XX XX)
        const digits = order.customer_phone.replace(/\D/g, '')
        if (digits.length < 10) {
            showToast(t('invalid_phone_format'), 'error')
            return
        }

        setUpdating(orderId)
        try {
            const result = await confirmShipment(orderId)
            if (result.success) {
                // SMS Gönderimi (Arka planda çalışabilir)
                sendSMSNotification({
                    to: order.customer_phone,
                    message: createShipmentMessage(
                        order.customer_phone,
                        order.order_number || '---',
                        order.product_name
                    )
                }).then(smsResult => {
                    if (!smsResult.success) {
                        console.error('SMS gönderilemedi:', smsResult.error)
                    }
                })

                setOrders((prev) =>
                    prev.map((order) =>
                        order.id === orderId
                            ? { ...order, is_shipped: true }
                            : order
                    )
                )

                // İstatistikleri anlık güncelle (Optimistic Update)
                setStats(prev => {
                    const newTamamlanan = prev.tamamlanan + 1
                    const newDevamEden = Math.max(0, prev.devamEden - 1)
                    const newYuzde = prev.toplam > 0 ? Math.round((newTamamlanan / prev.toplam) * 100) : 0

                    // Eğer geciken bir iş ise geciken sayısını da azalt
                    let newGeciken = prev.geciken
                    if (order.delivery_date) {
                        const today = new Date()
                        today.setHours(0, 0, 0, 0)
                        if (new Date(order.delivery_date) < today) {
                            newGeciken = Math.max(0, prev.geciken - 1)
                        }
                    }

                    return {
                        ...prev,
                        tamamlanan: newTamamlanan,
                        devamEden: newDevamEden,
                        geciken: newGeciken,
                        yuzde: newYuzde
                    }
                })

                setConfirmShipId(null)
                showToast(t('shipment_confirmed_success'), 'success')
                // Siparişi listeden kaldır (artık arşivde)
                setTimeout(() => {
                    setOrders((prev) => prev.filter((order) => order.id !== orderId))
                }, 1000)
            } else {
                showToast(t('error_prefix') + t(result.error || 'error_generic'), 'error')
            }
        } catch (error) {
            console.error('Error confirming shipment:', error)
            showToast(t('error_generic'), 'error')
        } finally {
            setUpdating(null)
        }
    }

    // Her aşamadaki işleri filtrele - Status'a göre siparişleri grupla
    const asamaIcerik = (asamaId: UretimAsamasi) => {
        return orders.filter((order) => order.status === asamaId)
    }

    // Tarih formatlama - Dinamik dile göre göster
    const formatDate = (dateString: string | null) => {
        if (!dateString) return t('not_specified')
        const date = new Date(dateString)
        const locale = language === 'tr' ? 'tr-TR' : language === 'en' ? 'en-US' : 'ar-SA'
        return date.toLocaleDateString(locale)
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
                    {t('production_tracking')}
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                    {t('production_tracking_description')}
                </p>
            </motion.div>

            {/* 🔥 Genel Üretim Durumu Paneli */}
            {!loading && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mt-8 mb-12 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-700"
                >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                <span>🔥</span> {t('general_production_status') || 'Genel Üretim Durumu'}
                            </h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                {t('production_summary_desc') || 'Tüm siparişlerin genel ilerleme durumu'}
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                                    %{stats.yuzde}
                                </span>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    {t('completed') || 'Tamamlanan'}
                                </p>
                            </div>
                            <div className="w-32 md:w-48 h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${stats.yuzde}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: t('total_orders'), value: stats.toplam, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', icon: Package },
                            { label: t('completed'), value: stats.tamamlanan, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20', icon: Check },
                            { label: t('in_progress'), value: stats.devamEden, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', icon: Loader2 },
                            { label: t('delayed'), value: stats.geciken, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', icon: X },
                        ].map((stat, i) => (
                            <div key={i} className={`${stat.bg} p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 transition-all hover:scale-[1.02]`}>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className={`p-2 rounded-lg bg-white dark:bg-slate-800 shadow-sm ${stat.color}`}>
                                        <stat.icon className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight">
                                        {stat.label}
                                    </span>
                                </div>
                                <div className={`text-2xl font-black ${stat.color}`}>
                                    {stat.value}
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

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
                                    <h3 className="font-semibold text-lg">{t(getStageTranslationKey(asama.id))}</h3>
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
                                                className={`p-4 rounded-lg ${asama.renkAcik} border border-slate-200 dark:border-slate-700 transition-all duration-200 shadow-sm hover:shadow-md relative`}
                                            >
                                                {/* Üst Başlık Alanı: Geri/İptal ve Onay Butonları */}
                                                <div className="flex items-center justify-between mb-4 relative z-10">
                                                    {/* Sol Üst: Geri ve İptal Butonları */}
                                                    <div className="flex items-center gap-2 flex-shrink-0 min-w-[32px]">
                                                        {asama.prevStatus && (
                                                            <button
                                                                onClick={() => handleStatusBack(order.id, asama.id)}
                                                                disabled={updating === order.id}
                                                                className="p-1.5 bg-white dark:bg-slate-700 rounded-lg shadow-md hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
                                                                title={t('back_to_previous')}
                                                            >
                                                                <RotateCcw className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => setCancelOrderId(order.id)}
                                                            disabled={updating === order.id}
                                                            className="p-1.5 bg-red-500 rounded-lg shadow-md hover:bg-red-600 transition-colors disabled:opacity-50"
                                                            title={t('cancel_order')}
                                                        >
                                                            <X className="w-4 h-4 text-white" />
                                                        </button>
                                                    </div>

                                                    {/* Sağ Üst: Onay Butonu (Sadece Sevk aşamasında) */}
                                                    <div className="flex-shrink-0 min-w-[32px] flex justify-end">
                                                        {asama.id === 'Sevk' && !order.is_shipped && (
                                                            <button
                                                                onClick={() => setConfirmShipId(order.id)}
                                                                disabled={updating === order.id}
                                                                className="p-1.5 bg-green-500 rounded-lg shadow-md hover:bg-green-600 transition-colors disabled:opacity-50"
                                                                title={t('confirm_shipment')}
                                                            >
                                                                <Check className="w-4 h-4 text-white" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex-1 text-left">
                                                        {/* Sipariş No - Ürün İsminin Üstünde (Mor Tasarım) */}
                                                        <div className="mb-2">
                                                            <span className="inline-block text-[10px] font-extrabold tracking-widest text-white bg-gradient-to-r from-indigo-600 to-blue-500 px-3 py-1.5 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.4)] uppercase">
                                                                {t('order_number')} : #{order.order_number || t('generating')}
                                                            </span>
                                                        </div>
                                                        <p className="font-semibold text-slate-800 dark:text-slate-200 text-base mb-1">
                                                            {order.product_name}
                                                        </p>
                                                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                                                            👤 {order.customer_name}
                                                        </p>
                                                        {order.customer_phone && (
                                                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-2">
                                                                <Phone className="w-4 h-4 text-indigo-500" />
                                                                {order.customer_phone}
                                                            </p>
                                                        )}
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
                                                                {t('urgent')}
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
                                                                {t('updating')}
                                                            </>
                                                        ) : (
                                                            <>
                                                                {t('next_stage')}
                                                                <ArrowRight className="w-4 h-4" />
                                                            </>
                                                        )}
                                                    </button>
                                                )}
                                            </motion.div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">
                                            {t('no_work_in_stage')}
                                        </p>
                                    )}
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            )}

            {/* İptal Onay Modal */}
            <AnimatePresence>
                {cancelOrderId && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setCancelOrderId(null)}
                            className="fixed inset-0 bg-black/50 z-50"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md p-6">
                                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">
                                    {t('cancel_order_title')}
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 mb-6">
                                    {t('cancel_order_message')}
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setCancelOrderId(null)}
                                        className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        {t('no')}
                                    </button>
                                    <button
                                        onClick={() => handleCancelOrder(cancelOrderId)}
                                        disabled={updating === cancelOrderId}
                                        className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                                    >
                                        {updating === cancelOrderId ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                {t('updating')}
                                            </>
                                        ) : (
                                            t('yes_cancel')
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Sevkiyat Onay Modal */}
            <AnimatePresence>
                {confirmShipId && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setConfirmShipId(null)}
                            className="fixed inset-0 bg-black/50 z-50"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md p-6">
                                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">
                                    {t('confirm_shipment_title')}
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 mb-6">
                                    {t('confirm_shipment_message')} {t('shipment_confirm_note')}
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setConfirmShipId(null)}
                                        className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        {t('no')}
                                    </button>
                                    <button
                                        onClick={() => handleConfirmShipment(confirmShipId)}
                                        disabled={updating === confirmShipId}
                                        className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                                    >
                                        {updating === confirmShipId ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                {t('confirming')}
                                            </>
                                        ) : (
                                            t('yes_confirm')
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </main>
    )
}
