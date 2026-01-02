'use server'

import { supabase, type Order, type NewOrder } from '@/utils/supabase'
import { revalidatePath } from 'next/cache'

/**
 * Yeni sipariş ekle - price alanı eklendi
 */
export async function createOrder(orderData: NewOrder) {
    try {
        const { data, error } = await supabase
            .from('orders')
            .insert([
                {
                    customer_name: orderData.customer_name,
                    product_name: orderData.product_name,
                    dimensions: orderData.dimensions || null,
                    delivery_date: orderData.delivery_date || null,
                    is_urgent: orderData.is_urgent || false,
                    price: orderData.price, // Fiyat zorunlu alan - sayısal değer olarak kaydediliyor
                    status: 'Kesim', // Varsayılan status
                },
            ])
            .select()
            .single()

        if (error) {
            console.error('Supabase error:', error)
            return { success: false, error: error.message }
        }

        // Sayfaları yeniden validate et
        revalidatePath('/')
        revalidatePath('/uretim')
        revalidatePath('/istatistikler')

        return { success: true, data }
    } catch (error) {
        console.error('Error creating order:', error)
        return { success: false, error: 'Bir hata oluştu' }
    }
}

/**
 * Sipariş status'unu güncelle
 */
export async function updateOrderStatus(orderId: string, newStatus: Order['status']) {
    try {
        const { error } = await supabase
            .from('orders')
            .update({ status: newStatus })
            .eq('id', orderId)

        if (error) {
            console.error('Supabase error:', error)
            return { success: false, error: error.message }
        }

        // Sayfaları yeniden validate et
        revalidatePath('/')
        revalidatePath('/uretim')
        revalidatePath('/istatistikler')

        return { success: true }
    } catch (error) {
        console.error('Error updating order status:', error)
        return { success: false, error: 'Bir hata oluştu' }
    }
}

/**
 * Tüm siparişleri getir
 */
export async function getAllOrders() {
    try {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Supabase error:', error)
            return { success: false, error: error.message, data: [] }
        }

        return { success: true, data: data as Order[] }
    } catch (error) {
        console.error('Error fetching orders:', error)
        return { success: false, error: 'Bir hata oluştu', data: [] }
    }
}

/**
 * Status'e göre siparişleri getir
 */
export async function getOrdersByStatus(status: Order['status']) {
    try {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('status', status)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Supabase error:', error)
            return { success: false, error: error.message, data: [] }
        }

        return { success: true, data: data as Order[] }
    } catch (error) {
        console.error('Error fetching orders by status:', error)
        return { success: false, error: 'Bir hata oluştu', data: [] }
    }
}

/**
 * Dashboard istatistikleri getir - Aylık gelir hesaplaması güncellendi
 */
export async function getDashboardStats() {
    try {
        // Tüm siparişleri getir
        const { data: allOrders, error } = await supabase
            .from('orders')
            .select('*')

        if (error) {
            console.error('Supabase error:', error)
            return {
                success: false,
                stats: {
                    aktifSiparisler: 0,
                    kritikGecikmeler: 0,
                    boyahanedekiIsler: 0,
                    tamamlananBuAy: 0,
                },
            }
        }

        const orders = allOrders as Order[]
        const today = new Date()
        const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1)

        // Aktif siparişler (Sevk hariç)
        const aktifSiparisler = orders.filter(
            (o) => o.status !== 'Sevk'
        ).length

        // Kritik gecikmeler (teslimat tarihi geçmiş ve Sevk değil)
        const kritikGecikmeler = orders.filter((o) => {
            if (o.status === 'Sevk' || !o.delivery_date) return false
            const deliveryDate = new Date(o.delivery_date)
            return deliveryDate < today
        }).length

        // Boyahanedeki işler
        const boyahanedekiIsler = orders.filter((o) => o.status === 'Boya').length

        // Bu ay tamamlanan (Sevk durumunda ve bu ay oluşturulmuş)
        const tamamlananBuAy = orders.filter((o) => {
            if (o.status !== 'Sevk') return false
            const createdAt = new Date(o.created_at)
            return createdAt >= thisMonthStart
        }).length

        return {
            success: true,
            stats: {
                aktifSiparisler,
                kritikGecikmeler,
                boyahanedekiIsler,
                tamamlananBuAy,
            },
        }
    } catch (error) {
        console.error('Error fetching dashboard stats:', error)
        return {
            success: false,
            stats: {
                aktifSiparisler: 0,
                kritikGecikmeler: 0,
                boyahanedekiIsler: 0,
                tamamlananBuAy: 0,
            },
        }
    }
}

/**
 * Aylık gelir hesapla - Veritabanındaki bu ay oluşturulan tüm siparişlerin price toplamı
 * Statik 15.000 ekleme mantığı kaldırıldı, gerçek price değerleri toplanıyor
 */
export async function getMonthlyRevenue() {
    try {
        // Bu ay oluşturulan tüm siparişleri getir
        const today = new Date()
        const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1)
        thisMonthStart.setHours(0, 0, 0, 0)

        // Ayın son günü
        const thisMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)
        thisMonthEnd.setHours(23, 59, 59, 999)

        const { data, error } = await supabase
            .from('orders')
            .select('price')
            .gte('created_at', thisMonthStart.toISOString())
            .lte('created_at', thisMonthEnd.toISOString())

        if (error) {
            console.error('Supabase error:', error)
            return { success: false, revenue: 0 }
        }

        // Tüm fiyatları topla - Her siparişin gerçek price değerini kullan
        const totalRevenue = (data as { price: number }[]).reduce(
            (sum, order) => {
                const price = typeof order.price === 'number' ? order.price : parseFloat(order.price) || 0
                return sum + price
            },
            0
        )

        return { success: true, revenue: totalRevenue }
    } catch (error) {
        console.error('Error calculating monthly revenue:', error)
        return { success: false, revenue: 0 }
    }
}

/**
 * Acil bekleyen işleri getir - 5 gün kuralı eklendi
 * KURAL: Teslim tarihine 5 gün veya daha az kaldıysa acil sayılır
 */
export async function getUrgentOrders() {
    try {
        const today = new Date()
        today.setHours(0, 0, 0, 0) // Bugünün başlangıcı

        // 5 gün sonrası
        const fiveDaysLater = new Date(today)
        fiveDaysLater.setDate(fiveDaysLater.getDate() + 5)

        // Tüm siparişleri getir (Sevk hariç)
        const { data: allOrders, error } = await supabase
            .from('orders')
            .select('*')
            .neq('status', 'Sevk')
            .order('delivery_date', { ascending: true })

        if (error) {
            console.error('Supabase error:', error)
            return { success: false, error: error.message, data: [] }
        }

        // Client-side filtreleme: 5 gün kuralına göre acil olanları bul
        const urgentOrders = (allOrders as Order[]).filter((order) => {
            // Manuel olarak işaretlenmiş acil siparişler
            if (order.is_urgent) return true

            // Teslimat tarihi varsa kontrol et
            if (order.delivery_date) {
                const deliveryDate = new Date(order.delivery_date)
                deliveryDate.setHours(0, 0, 0, 0)

                // Teslim tarihine 5 gün veya daha az kaldıysa acil
                const daysUntilDelivery = Math.ceil(
                    (deliveryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
                )

                // 5 gün veya daha az kaldıysa ve henüz geçmediyse acil
                if (daysUntilDelivery <= 5 && daysUntilDelivery >= 0) {
                    return true
                }

                // Teslim tarihi geçmişse de acil
                if (daysUntilDelivery < 0) {
                    return true
                }
            }

            return false
        })

        // Sınır yok - tüm acil işleri döndür
        return { success: true, data: urgentOrders }
    } catch (error) {
        console.error('Error fetching urgent orders:', error)
        return { success: false, error: 'Bir hata oluştu', data: [] }
    }
}

/**
 * Ayarları getir - Settings tablosundan key-value çiftlerini al
 */
export async function getSettings() {
    try {
        // Tüm ayarları çek
        const { data, error } = await supabase
            .from('settings')
            .select('key, value')

        if (error) {
            console.error('Supabase error:', error)
            return { success: false, error: error.message, data: {} }
        }

        // Key-value çiftlerine dönüştür
        const settings: Record<string, string> = {}
        if (data) {
            data.forEach((setting: { key: string; value: string }) => {
                settings[setting.key] = setting.value
            })
        }

        return { success: true, data: settings }
    } catch (error) {
        console.error('Error fetching settings:', error)
        return { success: false, error: 'Bir hata oluştu', data: {} }
    }
}

/**
 * Ayarları güncelle - Her bir ayar için ayrı ayrı upsert işlemi
 */
export async function updateSettings(settings: Record<string, string>) {
    try {
        // Her bir ayar için ayrı ayrı upsert işlemi yap
        for (const [key, value] of Object.entries(settings)) {
            const { error } = await supabase
                .from('settings')
                .upsert(
                    { key, value },
                    { onConflict: 'key' }
                )

            if (error) {
                console.error(`Supabase error updating ${key}:`, error)
                return { success: false, error: error.message }
            }
        }

        // Sayfayı yeniden validate et
        revalidatePath('/ayarlar')

        return { success: true }
    } catch (error) {
        console.error('Error updating settings:', error)
        return { success: false, error: 'Bir hata oluştu' }
    }
}
