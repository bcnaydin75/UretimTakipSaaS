'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, Zap, AlertCircle } from 'lucide-react'
import { createOrder, getUniqueCustomersFromOrders } from '@/app/actions/orders'
import { formatPriceInput, parsePrice } from '@/utils/priceFormatter'
import { useToast } from '@/contexts/ToastContext'
import { useLanguage } from '@/contexts/LanguageContext'

interface CustomerFromOrders {
    customer_name: string
    company_name: string | null
    customer_phone: string | null
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
    const [today] = useState(new Date().toISOString().split('T')[0])
    const [formData, setFormData] = useState({
        customer_name: '',
        customer_phone: '',
        company_name: '',
        product_name: '',
        dimensions: '',
        delivery_date: '',
        is_urgent: false,
        price: '',
        quantity: '1',
        unit_price: '',
    })

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
                    customer_phone: customer.customer_phone || '',
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
                setError(t('dimensions_required'))
                setLoading(false)
                return
            }

            if (!formData.delivery_date) {
                setError(t('delivery_date_required'))
                setLoading(false)
                return
            }

            if (formData.customer_phone && formData.customer_phone.trim() !== '') {
                const digits = formData.customer_phone.replace(/\D/g, '')
                if (digits.length < 10) {
                    setError(t('invalid_phone_format'))
                    setLoading(false)
                    return
                }
            }

            if (!formData.price || price <= 0) {
                setError(t('enter_valid_price'))
                setLoading(false)
                return
            }

            if (quantity <= 0) {
                setError(t('quantity_greater_than_zero'))
                setLoading(false)
                return
            }

            const result = await createOrder({
                customer_name: formData.customer_name,
                customer_phone: formData.customer_phone || null,
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
                    customer_phone: '',
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
                showToast(t('order_added_success'), 'success')
                onSuccess()
                onClose()
            } else {
                setError(result.error || t('error_generic'))
                showToast(result.error || t('error_generic'), 'error')
            }
        } catch (err) {
            setError(t('error_occurred_try_again'))
            showToast(t('error_occurred_try_again'), 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target

        if (name === 'price' || name === 'unit_price') {
            const formatted = formatPriceInput(value)
            setFormData((prev) => ({ ...prev, [name]: formatted }))
        } else if (name === 'customer_phone') {
            // Sadece rakamları al
            const digits = value.replace(/\D/g, '').slice(0, 11)

            // 05XX XXX XX XX formatına getir
            let formatted = digits
            if (digits.length > 0) {
                if (digits[0] !== '0') formatted = '0' + digits

                if (formatted.length > 4 && formatted.length <= 7) {
                    formatted = `${formatted.slice(0, 4)} ${formatted.slice(4)}`
                } else if (formatted.length > 7 && formatted.length <= 9) {
                    formatted = `${formatted.slice(0, 4)} ${formatted.slice(4, 7)} ${formatted.slice(7)}`
                } else if (formatted.length > 9) {
                    formatted = `${formatted.slice(0, 4)} ${formatted.slice(4, 7)} ${formatted.slice(7, 9)} ${formatted.slice(9, 11)}`
                }
            }

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
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col">
                            {/* Header - Sticky */}
                            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 z-10">
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

                            {/* Scrollable Content */}
                            <div className="flex-1 overflow-y-auto p-6">
                                <form id="new-order-form" onSubmit={handleSubmit}>
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="p-3 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-r-lg mb-4 flex items-center gap-3"
                                        >
                                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                                            <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
                                        </motion.div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Müşteri Seçimi & Tip Seçimi */}
                                        <div className="md:col-span-2 space-y-4">
                                            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        id="useExistingCustomer"
                                                        checked={useExistingCustomer}
                                                        onChange={(e) => {
                                                            setUseExistingCustomer(e.target.checked)
                                                            if (!e.target.checked) {
                                                                setSelectedCustomerName('')
                                                            }
                                                        }}
                                                        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                                                    />
                                                    <label htmlFor="useExistingCustomer" className="text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                                                        {t('existing_customer')}
                                                    </label>
                                                </div>
                                                {useExistingCustomer && (
                                                    <select
                                                        value={selectedCustomerName}
                                                        onChange={(e) => setSelectedCustomerName(e.target.value)}
                                                        className="text-sm px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 max-w-[200px]"
                                                    >
                                                        <option value="">{t('select_customer')}</option>
                                                        {customers.map((customer, index) => (
                                                            <option key={index} value={customer.customer_name}>
                                                                {customer.customer_name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                                        readOnly={useExistingCustomer}
                                                        placeholder={t('enter_customer_name')}
                                                        className={`w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${useExistingCustomer ? 'bg-slate-100 dark:bg-slate-800 cursor-not-allowed' : ''}`}
                                                    />
                                                </div>

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

                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                        {t('customer_phone')}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="customer_phone"
                                                        value={formData.customer_phone}
                                                        onChange={handleChange}
                                                        placeholder="05XX XXX XX XX"
                                                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                    />
                                                </div>
                                            </div>
                                        </div>

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
                                                rows={1}
                                                placeholder={t('enter_dimensions')}
                                                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none min-h-[42px]"
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
                                                {t('unit_price')} ({t('currency_tl')})
                                            </label>
                                            <input
                                                type="text"
                                                name="unit_price"
                                                value={formData.unit_price}
                                                onChange={handleChange}
                                                placeholder="16.000,00"
                                                inputMode="numeric"
                                                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>

                                        {/* Toplam Fiyat (Otomatik Hesaplanan) */}
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                {t('total_price')} ({t('currency_tl')}) <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="price"
                                                value={formData.price}
                                                onChange={handleChange}
                                                required
                                                placeholder="16.000,00"
                                                inputMode="numeric"
                                                readOnly
                                                className="w-full max-w-[150px] px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:outline-none font-bold shadow-none"
                                            />
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                {t('quantity_unit_price_total')} ({t('calculated_automatically')})
                                            </p>
                                        </div>

                                        {/* Teslimat Tarihi */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                {t('delivery_date')} <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="date"
                                                name="delivery_date"
                                                value={formData.delivery_date}
                                                onChange={handleChange}
                                                required
                                                min={today}
                                                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>

                                        {/* Acil Sipariş Butonu (Toggle) */}
                                        <div className="flex flex-col justify-end">
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, is_urgent: !prev.is_urgent }))}
                                                className={`
                                                    flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 transition-all duration-200
                                                    ${formData.is_urgent
                                                        ? 'bg-[#D97706] border-[#D97706] text-white shadow-lg shadow-orange-500/30'
                                                        : 'bg-transparent border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-[#D97706] hover:text-[#D97706]'
                                                    }
                                                `}
                                            >
                                                <Zap className={`w-4 h-4 ${formData.is_urgent ? 'fill-current' : ''}`} />
                                                <span className="text-sm font-bold uppercase tracking-wider">
                                                    {t('urgent_order')}
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>

                            {/* Footer - Sticky */}
                            <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                >
                                    {t('cancel')}
                                </button>
                                <button
                                    type="submit"
                                    form="new-order-form"
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
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
