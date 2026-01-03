'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Archive, Loader2, Search, FileText, X } from 'lucide-react'
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
                        <p className="text-slate-600 dark:text-slate-400">Satışlar yükleniyor...</p>
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
                        {searchQuery ? 'Arama sonucu bulunamadı' : 'Henüz tamamlanmış sipariş bulunmuyor'}
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
                            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                                <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
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

                                <div className="p-8">
                                    {/* Logo ve Firma Bilgileri */}
                                    <div className="text-center mb-8">
                                        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                                            ARAY YAZILIM
                                        </h1>
                                        <p className="text-slate-600 dark:text-slate-400 text-lg">
                                            {settings['atolye_adi'] || t('workshop_name')}
                                        </p>
                                        {settings['adres'] && (
                                            <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">
                                                {settings['adres']}
                                            </p>
                                        )}
                                        {settings['vergi_no'] && (
                                            <p className="text-sm text-slate-500 dark:text-slate-500">
                                                {t('tax_number')}: {settings['vergi_no']}
                                            </p>
                                        )}
                                        {settings['vergi_dairesi'] && (
                                            <p className="text-sm text-slate-500 dark:text-slate-500">
                                                {t('tax_office')}: {settings['vergi_dairesi']}
                                            </p>
                                        )}
                                    </div>

                                    {/* Alıcı Bilgileri */}
                                    <div className="mb-8 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                                            {language === 'tr' ? 'Alıcı Bilgileri' : language === 'en' ? 'Buyer Information' : 'معلومات المشتري'}
                                        </h3>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-slate-600 dark:text-slate-400">{t('customer_name')}:</span>
                                                <span className="font-semibold">{selectedOrder.customer_name}</span>
                                            </div>
                                            {selectedOrder.company_name && (
                                                <div className="flex justify-between">
                                                    <span className="text-slate-600 dark:text-slate-400">{t('company_name')}:</span>
                                                    <span className="font-semibold">{selectedOrder.company_name}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Fatura Detayları */}
                                    <div className="space-y-4 mb-8">
                                        <div className="flex justify-between">
                                            <span className="text-slate-600 dark:text-slate-400">{t('invoice_number')}:</span>
                                            <span className="font-semibold">{selectedOrder.id.slice(0, 8)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-600 dark:text-slate-400">{t('date')}:</span>
                                            <span>{formatDate(selectedOrder.created_at)}</span>
                                        </div>
                                    </div>

                                    {/* Ürün Tablosu */}
                                    <div className="border-t border-b border-slate-200 dark:border-slate-700 py-4 mb-4">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-slate-200 dark:border-slate-700">
                                                    <th className="text-left py-2 text-slate-600 dark:text-slate-400">{t('product')}</th>
                                                    <th className="text-right py-2 text-slate-600 dark:text-slate-400">{t('quantity')}</th>
                                                    <th className="text-right py-2 text-slate-600 dark:text-slate-400">{t('unit_price')}</th>
                                                    <th className="text-right py-2 text-slate-600 dark:text-slate-400">{t('total_price')}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td className="py-2">{selectedOrder.product_name}</td>
                                                    <td className="text-right py-2">{selectedOrder.quantity || 1}</td>
                                                    <td className="text-right py-2">
                                                        {formatPrice(selectedOrder.unit_price || selectedOrder.price)} TL
                                                    </td>
                                                    <td className="text-right py-2 font-semibold">
                                                        {formatPrice(selectedOrder.price)} TL
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Toplam Hesaplamalar */}
                                    <div className="space-y-2 text-right">
                                        <div className="flex justify-end gap-4">
                                            <span className="text-slate-600 dark:text-slate-400">{t('subtotal')}:</span>
                                            <span>{formatPrice(calculateSubtotal(selectedOrder.price))} TL</span>
                                        </div>
                                        <div className="flex justify-end gap-4">
                                            <span className="text-slate-600 dark:text-slate-400">{t('vat')}:</span>
                                            <span>{formatPrice(calculateKDV(calculateSubtotal(selectedOrder.price)))} TL</span>
                                        </div>
                                        <div className="flex justify-end gap-4 text-xl font-bold pt-2 border-t border-slate-200 dark:border-slate-700">
                                            <span>{t('grand_total')}:</span>
                                            <span className="text-indigo-600 dark:text-indigo-400">
                                                {formatPrice(selectedOrder.price)} TL
                                            </span>
                                        </div>
                                    </div>

                                    {/* Ödeme Bilgileri - Settings'ten gelen tüm veriler */}
                                    <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                                            {t('payment_info')}:
                                        </p>
                                        <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                                            {settings['vergi_no'] && (
                                                <p>{t('tax_number')}: {settings['vergi_no']}</p>
                                            )}
                                            {settings['vergi_dairesi'] && (
                                                <p>{t('tax_office')}: {settings['vergi_dairesi']}</p>
                                            )}
                                            {settings['adres'] && (
                                                <p>{t('address')}: {settings['adres']}</p>
                                            )}
                                            {settings['banka_adi'] && (
                                                <p>{t('bank_name')}: {settings['banka_adi']}</p>
                                            )}
                                            {settings['iban'] && (
                                                <p className="font-semibold mt-2">{t('iban')}: {settings['iban']}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Yazdır Butonu */}
                                    <div className="mt-6 flex justify-end">
                                        <button
                                            onClick={() => window.print()}
                                            className="px-6 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                                        >
                                            {t('print')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </main>
    )
}

