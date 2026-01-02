'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2 } from 'lucide-react'
import { createOrder } from '@/app/actions/orders'
import { formatPriceInput, parsePrice } from '@/utils/priceFormatter'

interface NewOrderModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export function NewOrderModal({ isOpen, onClose, onSuccess }: NewOrderModalProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        customer_name: '',
        product_name: '',
        dimensions: '',
        delivery_date: '',
        is_urgent: false,
        price: '', // Formatlanmış fiyat (görüntü için)
    })
    const [priceRaw, setPriceRaw] = useState('') // Saf sayı (veritabanı için)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            // Fiyat validasyonu - saf sayıyı kullan
            const price = parsePrice(formData.price)
            if (!formData.price || price <= 0) {
                setError('Lütfen geçerli bir fiyat girin (0\'dan büyük bir sayı)')
                setLoading(false)
                return
            }

            // Fiyatı decimal/float olarak veritabanına kaydet (saf sayı)
            const result = await createOrder({
                customer_name: formData.customer_name,
                product_name: formData.product_name,
                dimensions: formData.dimensions || undefined,
                delivery_date: formData.delivery_date || undefined,
                is_urgent: formData.is_urgent,
                price: price, // Saf sayı olarak kaydediliyor (16000.00)
            })

            if (result.success) {
                // Formu temizle
                setFormData({
                    customer_name: '',
                    product_name: '',
                    dimensions: '',
                    delivery_date: '',
                    is_urgent: false,
                    price: '', // Formatlanmış fiyat temizleme
                })
                setPriceRaw('') // Saf sayı temizleme
                onSuccess()
                onClose()
            } else {
                setError(result.error || 'Bir hata oluştu')
            }
        } catch (err) {
            setError('Bir hata oluştu. Lütfen tekrar deneyin.')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target

        // Fiyat alanı için özel işleme
        if (name === 'price') {
            // Formatlanmış değeri göster
            const formatted = formatPriceInput(value)
            setFormData((prev) => ({ ...prev, [name]: formatted }))
            // Saf sayıyı sakla (veritabanı için)
            const parsed = parsePrice(value)
            setPriceRaw(parsed.toString())
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
            }))
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                                    Yeni Sipariş Ekle
                                </h2>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                                </button>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                {error && (
                                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                                    </div>
                                )}

                                {/* Müşteri Adı */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Müşteri Adı <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="customer_name"
                                        value={formData.customer_name}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                {/* Ürün Adı */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Ürün Adı <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="product_name"
                                        value={formData.product_name}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                {/* Ölçüler */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Ölçüler
                                    </label>
                                    <textarea
                                        name="dimensions"
                                        value={formData.dimensions}
                                        onChange={handleChange}
                                        rows={2}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                    />
                                </div>

                                {/* Teslimat Tarihi */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Teslimat Tarihi
                                    </label>
                                    <input
                                        type="date"
                                        name="delivery_date"
                                        value={formData.delivery_date}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                {/* Fiyat (TL) */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Fiyat (TL) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        required
                                        placeholder="16.000,00"
                                        inputMode="numeric"
                                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        Sadece rakam girin, formatlama otomatik yapılır
                                    </p>
                                </div>

                                {/* Acil Mi */}
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        name="is_urgent"
                                        id="is_urgent"
                                        checked={formData.is_urgent}
                                        onChange={handleChange}
                                        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                                    />
                                    <label htmlFor="is_urgent" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Acil Sipariş
                                    </label>
                                </div>

                                {/* Butonlar */}
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        İptal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Kaydediliyor...
                                            </>
                                        ) : (
                                            'Kaydet'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

