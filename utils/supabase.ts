import { createClient } from '@supabase/supabase-js'

// Supabase client oluşturma
// .env.local dosyasından environment variable'ları okuyoruz
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase environment variables are not set. Please check your .env.local file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Veritabanı tip tanımları

// Sipariş tipi - price alanı eklendi
export interface Order {
    id: string
    customer_name: string
    product_name: string
    dimensions: string | null
    status: 'Kesim' | 'Döşeme' | 'Boya' | 'Paket' | 'Sevk'
    delivery_date: string | null
    is_urgent: boolean
    price: number // Fiyat alanı (TL cinsinden)
    created_at: string
    updated_at: string
}

// Yeni sipariş oluşturma tipi - price eklendi
export interface NewOrder {
    customer_name: string
    product_name: string
    dimensions?: string
    delivery_date?: string
    is_urgent?: boolean
    price: number // Fiyat zorunlu alan
}

// Ayarlar tipi
export interface Setting {
    id: string
    key: string
    value: string
    created_at: string
    updated_at: string
}

