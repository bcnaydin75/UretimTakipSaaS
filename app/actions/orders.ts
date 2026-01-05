'use server'

import { createClient } from '@/utils/supabase-server'
import { type Order, type NewOrder } from '@/utils/supabase'
import { revalidatePath } from 'next/cache'

/**
 * Mevcut kullanıcıyı getir
 */
async function getCurrentUser() {
    const supabase = createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) {
        return null
    }
    return user
}

/**
 * Yeni sipariş ekle - user_id eklendi
 */
export async function createOrder(orderData: NewOrder) {
    try {
        const user = await getCurrentUser()
        if (!user) return { success: false, error: 'auth_error' }

        const supabase = createClient()

        // Sipariş numarası üretimi (eğer DB trigger kullanılmazsa)
        // Ancak DB trigger kullanmak daha sağlıklı olduğu için burada sadece veri geçiyoruz

        const { data, error } = await supabase
            .from('orders')
            .insert([
                {
                    user_id: user.id,
                    customer_name: orderData.customer_name,
                    customer_phone: orderData.customer_phone || null,
                    order_number: orderData.order_number || null, // Manuel set edilebilir veya trigger'a bırakılabilir
                    company_name: orderData.company_name || null,
                    product_name: orderData.product_name,
                    dimensions: orderData.dimensions || null,
                    delivery_date: orderData.delivery_date || null,
                    is_urgent: orderData.is_urgent || false,
                    price: orderData.price,
                    quantity: orderData.quantity || 1,
                    unit_price: orderData.unit_price || 0,
                    status: 'Kesim',
                },
            ])
            .select()
            .single()

        if (error) {
            console.error('Supabase error:', error)
            return { success: false, error: error.message }
        }

        revalidatePath('/')
        revalidatePath('/uretim')
        revalidatePath('/istatistikler')

        return { success: true, data }
    } catch (error) {
        console.error('Error creating order:', error)
        return { success: false, error: 'error_generic' }
    }
}

/**
 * Sipariş status'unu güncelle - user_id filtresi eklendi
 */
export async function updateOrderStatus(orderId: string, newStatus: Order['status']) {
    try {
        const user = await getCurrentUser()
        if (!user) return { success: false, error: 'auth_error' }

        const supabase = createClient()
        const { error } = await supabase
            .from('orders')
            .update({ status: newStatus })
            .eq('id', orderId)
            .eq('user_id', user.id)

        if (error) {
            console.error('Supabase error:', error)
            return { success: false, error: error.message }
        }

        revalidatePath('/')
        revalidatePath('/uretim')
        revalidatePath('/istatistikler')

        return { success: true }
    } catch (error) {
        console.error('Error updating order status:', error)
        return { success: false, error: 'error_generic' }
    }
}

/**
 * Tüm siparişleri getir - user_id filtresi eklendi
 */
export async function getAllOrders() {
    try {
        const user = await getCurrentUser()
        if (!user) return { success: false, error: 'auth_error', data: [] }

        const supabase = createClient()
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Supabase error:', error)
            return { success: false, error: error.message, data: [] }
        }

        return { success: true, data: data as Order[] }
    } catch (error) {
        console.error('Error fetching orders:', error)
        return { success: false, error: 'error_generic', data: [] }
    }
}

/**
 * Status'e göre siparişleri getir - user_id filtresi eklendi
 */
export async function getOrdersByStatus(status: Order['status']) {
    try {
        const user = await getCurrentUser()
        if (!user) return { success: false, error: 'auth_error', data: [] }

        const supabase = createClient()
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('status', status)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Supabase error:', error)
            return { success: false, error: error.message, data: [] }
        }

        return { success: true, data: data as Order[] }
    } catch (error) {
        console.error('Error fetching orders by status:', error)
        return { success: false, error: 'error_generic', data: [] }
    }
}

/**
 * Dashboard istatistikleri getir - user_id filtresi eklendi
 */
export async function getDashboardStats() {
    try {
        const user = await getCurrentUser()
        if (!user) return {
            success: false,
            stats: { aktifSiparisler: 0, kritikGecikmeler: 0, boyahanedekiIsler: 0, tamamlananBuAy: 0 },
        }

        const supabase = createClient()
        const { data: allOrders, error } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', user.id)

        if (error) {
            console.error('Supabase error:', error)
            return {
                success: false,
                stats: { aktifSiparisler: 0, kritikGecikmeler: 0, boyahanedekiIsler: 0, tamamlananBuAy: 0 },
            }
        }

        const orders = allOrders as Order[]
        const today = new Date()
        const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1)

        const aktifSiparisler = orders.filter((o) => o.status !== 'Sevk').length
        const kritikGecikmeler = orders.filter((o) => {
            if (o.status === 'Sevk' || !o.delivery_date) return false
            const deliveryDate = new Date(o.delivery_date)
            return deliveryDate < today
        }).length
        const boyahanedekiIsler = orders.filter((o) => o.status === 'Boya').length
        const tamamlananBuAy = orders.filter((o) => {
            if (o.status !== 'Sevk') return false
            const createdAt = new Date(o.created_at)
            return createdAt >= thisMonthStart
        }).length

        return {
            success: true,
            stats: { aktifSiparisler, kritikGecikmeler, boyahanedekiIsler, tamamlananBuAy },
        }
    } catch (error) {
        console.error('Error fetching dashboard stats:', error)
        return {
            success: false,
            stats: { aktifSiparisler: 0, kritikGecikmeler: 0, boyahanedekiIsler: 0, tamamlananBuAy: 0 },
        }
    }
}

/**
 * Aylık gelir hesapla - user_id filtresi eklendi
 */
export async function getMonthlyRevenue() {
    try {
        const user = await getCurrentUser()
        if (!user) return { success: false, revenue: 0 }

        const today = new Date()
        const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1)
        thisMonthStart.setHours(0, 0, 0, 0)
        const thisMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)
        thisMonthEnd.setHours(23, 59, 59, 999)

        const supabase = createClient()
        const { data, error } = await supabase
            .from('orders')
            .select('price')
            .eq('user_id', user.id)
            .eq('status', 'Sevk')
            .eq('is_shipped', true)
            .gte('created_at', thisMonthStart.toISOString())
            .lte('created_at', thisMonthEnd.toISOString())

        if (error) {
            console.error('Supabase error:', error)
            return { success: false, revenue: 0 }
        }

        const totalRevenue = (data as { price: number }[]).reduce((sum, order) => {
            const price = typeof order.price === 'number' ? order.price : parseFloat(order.price) || 0
            return sum + price
        }, 0)

        return { success: true, revenue: totalRevenue }
    } catch (error) {
        console.error('Error calculating monthly revenue:', error)
        return { success: false, revenue: 0 }
    }
}

/**
 * Acil bekleyen işleri getir - user_id filtresi eklendi
 */
export async function getUrgentOrders() {
    try {
        const user = await getCurrentUser()
        if (!user) return { success: false, error: 'auth_error', data: [] }

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const supabase = createClient()
        const { data: allOrders, error } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', user.id)
            .neq('status', 'Sevk')
            .order('delivery_date', { ascending: true })

        if (error) {
            console.error('Supabase error:', error)
            return { success: false, error: error.message, data: [] }
        }

        const urgentOrders = (allOrders as Order[]).filter((order) => {
            if (order.is_urgent) return true
            if (order.delivery_date) {
                const deliveryDate = new Date(order.delivery_date)
                deliveryDate.setHours(0, 0, 0, 0)
                const daysUntilDelivery = Math.ceil((deliveryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                if (daysUntilDelivery <= 5 && daysUntilDelivery >= 0) return true
                if (daysUntilDelivery < 0) return true
            }
            return false
        })

        return { success: true, data: urgentOrders }
    } catch (error) {
        console.error('Error fetching urgent orders:', error)
        return { success: false, error: 'error_generic', data: [] }
    }
}

/**
 * Ayarları getir - Key-Value yapısına göre
 */
export async function getSettings() {
    try {
        const user = await getCurrentUser()
        if (!user) return { success: false, error: 'auth_error', data: {} }

        const supabase = createClient()
        const { data, error } = await supabase
            .from('settings')
            .select('setting_key, value')
            .eq('user_id', user.id)

        if (error) {
            console.error('Supabase error:', error)
            return { success: false, error: error.message, data: {} }
        }

        // Key-Value listesini objeye dönüştür
        const settingsObj = (data || []).reduce((acc: Record<string, string>, item) => {
            acc[item.setting_key] = item.value || ''
            return acc
        }, {})

        return { success: true, data: settingsObj }
    } catch (error) {
        console.error('Error fetching settings:', error)
        return { success: false, error: 'error_generic', data: {} }
    }
}

/**
 * Ayarları güncelle - Key-Value yapısına göre UPSERT
 */
export async function updateSettings(settings: Record<string, string>) {
    try {
        const user = await getCurrentUser()
        if (!user) return { success: false, error: 'auth_error' }

        const supabase = createClient()

        // Gelen objeyi Supabase'in beklediği satır formatına çeviriyoruz
        const upsertData = Object.entries(settings).map(([key, value]) => ({
            user_id: user.id,
            setting_key: key,
            value: value
        }))

        // ON CONFLICT (user_id, setting_key) üzerinden güncelleme yapar
        const { error } = await supabase
            .from('settings')
            .upsert(upsertData, {
                onConflict: 'user_id, setting_key'
            })

        if (error) {
            console.error('Supabase error updating settings:', error)
            return { success: false, error: error.message }
        }

        revalidatePath('/ayarlar')
        return { success: true }
    } catch (error) {
        console.error('Error updating settings:', error)
        return { success: false, error: 'error_generic' }
    }
}

/**
 * Siparişi sil - user_id filtresi eklendi
 */
export async function deleteOrder(orderId: string) {
    try {
        const user = await getCurrentUser()
        if (!user) return { success: false, error: 'auth_error' }

        const supabase = createClient()
        const { error } = await supabase
            .from('orders')
            .delete()
            .eq('id', orderId)
            .eq('user_id', user.id)

        if (error) {
            console.error('Supabase error:', error)
            return { success: false, error: error.message }
        }

        revalidatePath('/')
        revalidatePath('/uretim')
        revalidatePath('/istatistikler')

        return { success: true }
    } catch (error) {
        console.error('Error deleting order:', error)
        return { success: false, error: 'error_generic' }
    }
}

/**
 * Müşterileri getir - user_id filtresi eklendi
 */
export async function getCustomers() {
    try {
        const user = await getCurrentUser()
        if (!user) return { success: false, error: 'auth_error', data: [] }

        const supabase = createClient()
        const { data, error } = await supabase
            .from('customers')
            .select('*')
            .eq('user_id', user.id)
            .order('name', { ascending: true })

        if (error) {
            console.error('Supabase error:', error)
            return { success: false, error: error.message, data: [] }
        }

        return { success: true, data: data || [] }
    } catch (error) {
        console.error('Error fetching customers:', error)
        return { success: false, error: 'error_generic', data: [] }
    }
}

/**
 * Orders tablosundan benzersiz müşteri isimlerini ve en son kullanılan company_name'i getir - user_id filtresi eklendi
 */
export async function getUniqueCustomersFromOrders() {
    try {
        const user = await getCurrentUser()
        if (!user) return { success: false, error: 'auth_error', data: [] }

        const supabase = createClient()
        const { data, error } = await supabase
            .from('orders')
            .select('customer_name, company_name, customer_phone, created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Supabase error:', error)
            return { success: false, error: error.message, data: [] }
        }

        if (!data || data.length === 0) return { success: true, data: [] }

        const customerMap = new Map<string, { customer_name: string; company_name: string | null; customer_phone: string | null }>()
        data.forEach((order) => {
            const customerName = order.customer_name
            if (!customerMap.has(customerName)) {
                customerMap.set(customerName, {
                    customer_name: customerName,
                    company_name: order.company_name,
                    customer_phone: order.customer_phone,
                })
            }
        })

        const uniqueCustomers = Array.from(customerMap.values()).sort((a, b) =>
            a.customer_name.localeCompare(b.customer_name, 'tr')
        )

        return { success: true, data: uniqueCustomers }
    } catch (error) {
        console.error('Error fetching unique customers from orders:', error)
        return { success: false, error: 'error_generic', data: [] }
    }
}

/**
 * Sevkiyatı onayla - user_id filtresi eklendi
 */
export async function confirmShipment(orderId: string) {
    try {
        const user = await getCurrentUser()
        if (!user) return { success: false, error: 'auth_error' }

        const supabase = createClient()
        const { error } = await supabase
            .from('orders')
            .update({ is_shipped: true })
            .eq('id', orderId)
            .eq('user_id', user.id)

        if (error) {
            console.error('Supabase error:', error)
            return { success: false, error: error.message }
        }

        revalidatePath('/')
        revalidatePath('/uretim')
        revalidatePath('/satis-arsivi')

        return { success: true }
    } catch (error) {
        console.error('Error confirming shipment:', error)
        return { success: false, error: 'error_generic' }
    }
}
