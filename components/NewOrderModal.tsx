'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2 } from 'lucide-react'
import { createOrder, getUniqueCustomersFromOrders } from '@/app/actions/orders'
import { formatPriceInput, parsePrice } from '@/utils/priceFormatter'
import { useToast } from '@/contexts/ToastContext'
import { useLanguage } from '@/contexts/LanguageContext'

interface CustomerFromOrders {
    customer_name: string
    company_name: string | null
}

interface NewOrderModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export function NewOrderModal({ isOpen, onClose, onSuccess }: NewOrderModalProps) {
    const { showToast } = useToast()
    const { t, language } = useLanguage()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [useExistingCustomer, setUseExistingCustomer] = useState(false)
    const [customers, setCustomers] = useState<CustomerFromOrders[]>([])
    const [selectedCustomerName, setSelectedCustomerName] = useState<string>('')
    const [formData, setFormData] = useState({
        customer_name: '',
        company_name: '',
        product_name: '',
        dimensions: '',
        delivery_date: '',
        is_urgent: false,
        price: '',
        quantity: '1',
        unit_price: '',
    })
    const [priceRaw, setPriceRaw] = useState('')

    // Müşterileri orders tablosundan yükle
    useEffect(() => {
        if (isOpen && useExistingCustomer) {
            fetchCustomers()
        }
    }, [isOpen, useExistingCustomer])

    const fetchCustomers = async () => {
        try {
            const result = await getUniqueCustomersFromOrders()
            if (result.success) {
                setCustomers(result.data)
            }
        } catch (err) {
            console.error('Error fetching customers:', err)
        }
    }

    // Müşteri seçildiğinde otomatik doldur
    useEffect(() => {
        if (selectedCustomerName && useExistingCustomer) {
            const customer = customers.find(c => c.customer_name === selectedCustomerName)
            if (customer) {
                setFormData(prev => ({
                    ...prev,
                    customer_name: customer.customer_name,
                    company_name: customer.company_name || '',
                }))
            }
        }
    }, [selectedCustomerName, customers, useExistingCustomer])

    // Toplam fiyat hesaplama
    useEffect(() => {
        const quantity = parseFloat(formData.quantity) || 0
        const unitPrice = parsePrice(formData.unit_price) || 0
        const total = quantity * unitPrice
        if (total > 0) {
            setFormData(prev => ({
                ...prev,
                price: formatPriceInput(total.toString()),
            }))
        }
    }, [formData.quantity, formData.unit_price])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const price = parsePrice(formData.price)
            const quantity = parseInt(formData.quantity) || 1

            if (!formData.dimensions || formData.dimensions.trim() === '') {
                setError('Ölçüler alanı zorunludur')
                setLoading(false)
                return
            }

            if (!formData.price || price <= 0) {
                setError('Lütfen geçerli bir fiyat girin')
                setLoading(false)
                return
            }

            if (quantity <= 0) {
                setError('Adet 0\'dan büyük olmalıdır')
                setLoading(false)
                return
            }

            const result = await createOrder({
                customer_name: formData.customer_name,
                company_name: formData.company_name || null,
                product_name: formData.product_name,
                dimensions: formData.dimensions || undefined,
                delivery_date: formData.delivery_date || undefined,
                is_urgent: formData.is_urgent,
                price: price,
                quantity: quantity,
                unit_price: parsePrice(formData.unit_price) || 0,
            })

            if (result.success) {
                setFormData({
                    customer_name: '',
                    company_name: '',
                    product_name: '',
                    dimensions: '',
                    delivery_date: '',
                    is_urgent: false,
                    price: '',
                    quantity: '1',
                    unit_price: '',
                })
                setUseExistingCustomer(false)
                setSelectedCustomerName('')
                setPriceRaw('')
                showToast(t('order_added'), 'success')
                onSuccess()
                onClose()
            } else {
                setError(result.error || 'Bir hata oluştu')
                showToast(result.error || 'Bir hata oluştu', 'error')
            }
        } catch (err) {
            setError('Bir hata oluştu. Lütfen tekrar deneyin.')
            showToast('Bir hata oluştu. Lütfen tekrar deneyin.', 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target

        if (name === 'price' || name === 'unit_price') {
            const formatted = formatPriceInput(value)
            setFormData((prev) => ({ ...prev, [name]: formatted }))
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
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                                    {t('new_order')}
                                </h2>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                                </button>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="p-6">
                                {error && (
                                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-4">
                                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Var Olan Müşteri Checkbox - Full Width */}
                                    <div className="md:col-span-2 flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="useExistingCustomer"
                                            checked={useExistingCustomer}
                                            onChange={(e) => {
                                                setUseExistingCustomer(e.target.checked)
                                                if (!e.target.checked) {
                                                    setSelectedCustomerName('')
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        customer_name: '',
                                                        company_name: '',
                                                    }))
                                                }
                                            }}
                                            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                                        />
                                        <label htmlFor="useExistingCustomer" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                            {t('existing_customer')}
                                        </label>
                                    </div>

                                    {/* Müşteri Seçimi */}
                                    {useExistingCustomer ? (
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                {t('customer_name')} <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={selectedCustomerName}
                                                onChange={(e) => setSelectedCustomerName(e.target.value)}
                                                required
                                                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            >
                                                <option value="">{t('select_customer')}</option>
                                                {customers.map((customer, index) => (
                                                    <option key={index} value={customer.customer_name}>
                                                        {customer.customer_name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    ) : (
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                {t('customer_name')} <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="customer_name"
                                                value={formData.customer_name}
                                                onChange={handleChange}
                                                required
                                                placeholder={t('enter_customer_name')}
                                                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>
                                    )}

                                    {/* Firma Adı */}
                                    {!useExistingCustomer && (
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                {t('company_name')}
                                            </label>
                                            <input
                                                type="text"
                                                name="company_name"
                                                value={formData.company_name}
                                                onChange={handleChange}
                                                placeholder={t('enter_company_name')}
                                                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>
                                    )}

                                    {/* Ürün Adı */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            {t('product_name')} <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="product_name"
                                            value={formData.product_name}
                                            onChange={handleChange}
                                            required
                                            placeholder={t('enter_product_name')}
                                            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    {/* Ölçüler - Zorunlu */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            {t('dimensions')} <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            name="dimensions"
                                            value={formData.dimensions}
                                            onChange={handleChange}
                                            required
                                            rows={2}
                                            placeholder={t('enter_dimensions')}
                                            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                        />
                                    </div>

                                    {/* Adet */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            {t('quantity')} <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            name="quantity"
                                            value={formData.quantity}
                                            onChange={handleChange}
                                            required
                                            min="1"
                                            placeholder={t('enter_quantity')}
                                            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    {/* Birim Fiyat */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            {t('unit_price')} (TL)
                                        </label>
                                        <input
                                            type="text"
                                            name="unit_price"
                                            value={formData.unit_price}
                                            onChange={handleChange}
                                            placeholder={language === 'tr' ? '16.000,00' : '16.000,00'}
                                            inputMode="numeric"
                                            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    {/* Toplam Fiyat (Otomatik Hesaplanan) */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            {t('total_price')} (TL) <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleChange}
                                            required
                                            placeholder={language === 'tr' ? '16.000,00' : '16.000,00'}
                                            inputMode="numeric"
                                            readOnly
                                            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                            {language === 'tr' ? 'Adet × Birim Fiyat = Toplam Fiyat (otomatik hesaplanır)' : language === 'en' ? 'Quantity × Unit Price = Total Price (calculated automatically)' : 'الكمية × سعر الوحدة = السعر الإجمالي (محسوب تلقائياً)'}
                                        </p>
                                    </div>

                                    {/* Teslimat Tarihi */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            {t('delivery_date')}
                                        </label>
                                        <input
                                            type="date"
                                            name="delivery_date"
                                            value={formData.delivery_date}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
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
                                            {t('urgent_order')}
                                        </label>
                                    </div>

                                    {/* Butonlar */}
                                    <div className="md:col-span-2 flex gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                        >
                                            {t('cancel')}
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="flex-1 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    {t('saving')}
                                                </>
                                            ) : (
                                                t('save')
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
