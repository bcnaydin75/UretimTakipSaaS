'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Archive, Loader2, Search, FileText, X, Phone } from 'lucide-react'
import { getAllOrders, getSettings } from '@/app/actions/orders'
import type { Order } from '@/utils/supabase'
import { formatPrice } from '@/utils/priceFormatter'
import { useLanguage } from '@/contexts/LanguageContext'

/**
 * Satış Arşivi Sayfası
 * 
 * Durumu 'Sevk' olan tüm tamamlanmış siparişleri gösterir.
 * Grid yapısında modern kartlar ile satış fiyatları görüntülenir.
 */

export default function SatisArsivi() {
    const { t, language } = useLanguage()
    const [orders, setOrders] = useState<Order[]>([])
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const [settings, setSettings] = useState<Record<string, string>>({})

    useEffect(() => {
        fetchCompletedOrders()
        fetchSettings()
    }, [])

    useEffect(() => {
        // Arama filtresi
        if (!searchQuery.trim()) {
            setFilteredOrders(orders)
        } else {
            const query = searchQuery.toLowerCase()
            setFilteredOrders(
                orders.filter(
                    (order) =>
                        order.customer_name.toLowerCase().includes(query) ||
                        order.product_name.toLowerCase().includes(query)
                )
            )
        }
    }, [searchQuery, orders])

    const fetchSettings = async () => {
        try {
            const result = await getSettings()
            if (result.success) {
                setSettings(result.data)
            }
        } catch (error) {
            console.error('Error fetching settings:', error)
        }
    }

    // Tamamlanmış siparişleri yükle (status = 'Sevk')
    const fetchCompletedOrders = async () => {
        setLoading(true)
        try {
            const result = await getAllOrders()
            if (result.success) {
                // Sadece 'Sevk' durumunda ve sevkiyatı onaylanmış siparişleri filtrele
                const completedOrders = result.data.filter((order) =>
                    order.status === 'Sevk' && order.is_shipped === true
                )
                // Tarihe göre sırala (en yeni önce)
                completedOrders.sort((a, b) => {
                    const dateA = new Date(a.created_at).getTime()
                    const dateB = new Date(b.created_at).getTime()
                    return dateB - dateA
                })
                setOrders(completedOrders)
                setFilteredOrders(completedOrders)
            }
        } catch (error) {
            console.error('Error fetching completed orders:', error)
        } finally {
            setLoading(false)
        }
    }

    const calculateKDV = (price: number) => {
        return price * 0.20 // %20 KDV
    }

    const calculateSubtotal = (price: number) => {
        return price / 1.20 // KDV hariç tutar
    }

    // Tarih formatlama
    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        const locale = language === 'tr' ? 'tr-TR' : language === 'en' ? 'en-US' : 'ar-SA'
        return date.toLocaleDateString(locale, {
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
                        {t('sales_archive')}
                    </h1>
                </div>
                <p className="text-slate-600 dark:text-slate-400">
                    {t('completed_orders')}
                </p>
            </motion.div>

            {/* Arama Kutusu */}
            <div className="mt-6 mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder={t('search')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
            </div>

            {/* Loading Durumu */}
            {loading ? (
                <div className="flex items-center justify-center py-20 mt-8">
                    <div className="text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto mb-4" />
                        <p className="text-slate-600 dark:text-slate-400">{t('sales_loading')}</p>
                    </div>
                </div>
            ) : filteredOrders.length > 0 ? (
                /* Grid Yapısı - Modern Kartlar */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
                    {filteredOrders.map((order, index) => (
                        <motion.div
                            key={order.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all"
                        >
                            {/* Sipariş No - Üst Köşe */}
                            <div className="flex items-center justify-between mb-4">
                                <span className={`text-[10px] font-extrabold tracking-widest text-white px-3 py-1.5 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.4)] uppercase ${order.order_number ? 'bg-gradient-to-r from-indigo-600 to-blue-500' : 'bg-red-500'}`}>
                                    {t('order_number')} : {order.order_number ? `#${order.order_number}` : 'Hata: No Yok'}
                                </span>
                            </div>

                            {/* Müşteri Bilgileri */}
                            <div className="mb-4 text-left">
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                                    {t('customer')}
                                </p>
                                <p className="font-semibold text-slate-800 dark:text-slate-200">
                                    {order.customer_name}
                                </p>
                                {order.customer_phone && (
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-indigo-500" />
                                        {order.customer_phone}
                                    </p>
                                )}
                            </div>

                            {/* Ürün Bilgileri */}
                            <div className="mb-4 text-left">
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                                    {t('product')}
                                </p>
                                <p className="font-medium text-slate-700 dark:text-slate-300">
                                    {order.product_name}
                                </p>
                            </div>

                            {/* Satış Fiyatı - Büyük Punto */}
                            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                                    {t('sale_price')}
                                </p>
                                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                                    {formatPrice(order.price)} {t('currency_tl')}
                                </p>
                            </div>

                            {/* Tarih Bilgisi */}
                            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                                    📅 {formatDate(order.created_at)}
                                </p>
                                <button
                                    onClick={() => setSelectedOrder(order)}
                                    className="w-full px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                                >
                                    <FileText className="w-4 h-4" />
                                    {t('generate_invoice')}
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="mt-8 bg-white dark:bg-slate-800 rounded-xl p-12 shadow-lg border border-slate-200 dark:border-slate-700 text-center">
                    <Archive className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <p className="text-lg font-semibold text-slate-600 dark:text-slate-400">
                        {searchQuery ? t('search_no_results') : t('no_completed_orders_yet')}
                    </p>
                </div>
            )}

            {/* Fatura Modal */}
            <AnimatePresence>
                {selectedOrder && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedOrder(null)}
                            className="fixed inset-0 bg-black/50 z-50"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
                                {/* Header - Sticky */}
                                <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 z-10 no-print">
                                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                                        {t('invoice')}
                                    </h2>
                                    <button
                                        onClick={() => setSelectedOrder(null)}
                                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                    >
                                        <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                                    </button>
                                </div>

                                {/* Scrollable Content */}
                                <div className="flex-1 overflow-y-auto p-8 invoice-container">
                                    {/* Modern Header */}
                                    <div className="flex justify-between items-center mb-10 border-b-2 border-slate-800 pb-8">
                                        <div>
                                            <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">
                                                {settings['atolye_adi'] || t('workshop_default')}
                                            </h1>
                                        </div>
                                        <div className="text-right">
                                            <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase leading-none">
                                                {t('invoice')}
                                            </h2>
                                            <div className="text-sm text-slate-600 dark:text-slate-400 mt-3 space-y-1">
                                                <p><span className="font-bold">{t('invoice_number')}:</span> #{selectedOrder.id.slice(0, 8).toUpperCase()}</p>
                                                <p><span className="font-bold">{t('date')}:</span> {formatDate(selectedOrder.created_at)}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bilgi Sütunları (Alıcı & Satıcı) */}
                                    <div className="grid grid-cols-2 gap-12 mb-10">
                                        {/* Satıcı Bilgileri */}
                                        <div>
                                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                                                {t('seller_info')}
                                            </h3>
                                            <div className="space-y-1 text-slate-800 dark:text-slate-200">
                                                <p className="font-bold text-lg">{settings['atolye_adi'] || t('workshop_default')}</p>
                                                <p className="text-sm leading-relaxed">{settings['adres'] || t('not_specified')}</p>
                                                <div className="text-sm mt-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                                                    <p><span className="font-semibold text-slate-500">{t('tax_office')}:</span> {settings['vergi_dairesi'] || '-'}</p>
                                                    <p><span className="font-semibold text-slate-500">{t('tax_number')}:</span> {settings['vergi_no'] || '-'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Alıcı Bilgileri */}
                                        <div>
                                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                                                {t('buyer_info')}
                                            </h3>
                                            <div className="space-y-1 text-slate-800 dark:text-slate-200">
                                                <p className="font-bold text-lg">{selectedOrder.customer_name}</p>
                                                {selectedOrder.company_name && (
                                                    <p className="text-md font-medium text-slate-600 dark:text-slate-400">{selectedOrder.company_name}</p>
                                                )}
                                                {/* Adres bilgisi siparişte varsa eklenebilir, şu an yok */}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Ürün Tablosu - Modern Zebra Style */}
                                    <div className="mb-10 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-slate-900 text-white">
                                                    <th className="px-4 py-3 font-bold uppercase text-xs tracking-wider">{t('product')}</th>
                                                    <th className="px-4 py-3 font-bold uppercase text-xs tracking-wider text-center">{t('quantity')}</th>
                                                    <th className="px-4 py-3 font-bold uppercase text-xs tracking-wider text-right">{t('unit_price')}</th>
                                                    <th className="px-4 py-3 font-bold uppercase text-xs tracking-wider text-right">{t('total_price')}</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                                <tr className="even:bg-slate-50 dark:even:bg-slate-800/50">
                                                    <td className="px-4 py-4 text-slate-800 dark:text-slate-200 font-medium">
                                                        {selectedOrder.product_name}
                                                    </td>
                                                    <td className="px-4 py-4 text-center text-slate-700 dark:text-slate-300">
                                                        {selectedOrder.quantity || 1}
                                                    </td>
                                                    <td className="px-4 py-4 text-right text-slate-700 dark:text-slate-300">
                                                        {formatPrice(selectedOrder.unit_price || selectedOrder.price)} {t('currency_tl')}
                                                    </td>
                                                    <td className="px-4 py-4 text-right font-bold text-slate-900 dark:text-white">
                                                        {formatPrice(selectedOrder.price)} {t('currency_tl')}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Toplam Hesaplamalar & Alt Bilgi */}
                                    <div className="flex justify-between items-start">
                                        {/* Ödeme Bilgileri */}
                                        <div className="max-w-md">
                                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                                                {t('payment_info')}
                                            </h3>
                                            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                                                <p className="text-sm font-bold text-slate-900 dark:text-white">{settings['banka_adi'] || '-'}</p>
                                                <p className="text-xs text-slate-500 font-mono tracking-tighter">{settings['iban'] || '-'}</p>
                                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{settings['hesap_sahibi'] || '-'}</p>
                                            </div>
                                            <p className="text-sm italic text-slate-500 mt-4">
                                                {t('thank_you_note')}
                                            </p>
                                        </div>

                                        {/* Hesaplama */}
                                        <div className="w-64 space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500 font-medium">{t('subtotal')}:</span>
                                                <span className="text-slate-900 dark:text-white font-bold">{formatPrice(calculateSubtotal(selectedOrder.price))} {t('currency_tl')}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500 font-medium">{t('vat')}:</span>
                                                <span className="text-slate-900 dark:text-white font-bold">{formatPrice(calculateKDV(calculateSubtotal(selectedOrder.price)))} {t('currency_tl')}</span>
                                            </div>
                                            <div className="flex justify-between items-center pt-3 border-t-2 border-slate-900 dark:border-white">
                                                <span className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter">{t('grand_total')}:</span>
                                                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                                                    {formatPrice(selectedOrder.price)} {t('currency_tl')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Yazdır Butonu & CSS */}
                                    <div className="mt-12 flex justify-end no-print">
                                        <button
                                            onClick={() => window.print()}
                                            className="px-8 py-3 bg-slate-900 hover:bg-black text-white rounded-xl transition-all font-bold flex items-center gap-2 shadow-lg hover:shadow-xl active:scale-95"
                                        >
                                            <FileText className="w-5 h-5" />
                                            {t('print')}
                                        </button>
                                    </div>

                                    <style jsx global>{`
                                        @media print {
                                            body * {
                                                visibility: hidden;
                                            }
                                            .invoice-container, .invoice-container * {
                                                visibility: visible;
                                            }
                                            .invoice-container {
                                                position: absolute;
                                                left: 0;
                                                top: 0;
                                                width: 100%;
                                                padding: 2cm !important;
                                                color: black !important;
                                                background: white !important;
                                            }
                                            .no-print {
                                                display: none !important;
                                            }
                                            .dark {
                                                color-scheme: light !important;
                                            }
                                            .invoice-container table thead tr {
                                                background-color: #0f172a !important;
                                                -webkit-print-color-adjust: exact;
                                            }
                                            .invoice-container table tbody tr:nth-child(even) {
                                                background-color: #f8fafc !important;
                                                -webkit-print-color-adjust: exact;
                                            }
                                            @page {
                                                size: A4;
                                                margin: 0;
                                            }
                                        }
                                    `}</style>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </main>
    )
}

