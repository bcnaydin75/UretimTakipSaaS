// Veritabanı tip tanımları

// Sipariş tipi - user_id eklendi
export interface Order {
    id: string
    user_id: string // Kullanıcı ID
    customer_name: string
    company_name: string | null // Firma adı
    product_name: string
    dimensions: string | null
    status: 'Kesim' | 'Döşeme' | 'Boya' | 'Paket' | 'Sevk'
    delivery_date: string | null
    is_urgent: boolean
    price: number // Fiyat alanı (TL cinsinden)
    quantity: number | null
    unit_price: number | null
    is_shipped: boolean | null
    created_at: string
    updated_at: string
}

// Yeni sipariş oluşturma tipi - price eklendi
export interface NewOrder {
    customer_name: string
    company_name?: string | null // Firma adı
    product_name: string
    dimensions?: string
    delivery_date?: string
    is_urgent?: boolean
    price: number // Fiyat zorunlu alan
    quantity?: number
    unit_price?: number
}

// Müşteri tipi - user_id eklendi
export interface Customer {
    id: string
    user_id: string
    name: string
    company_name: string | null
    created_at: string
}

// Ayarlar tipi - user_id eklendi, flat yapıya geçildi
export interface Setting {
    id: string
    user_id: string
    workshop_name: string | null
    tax_no: string | null
    tax_office: string | null
    adres: string | null
    iban: string | null
    bank_name: string | null
    account_holder: string | null
    language: string | null
    created_at: string
    updated_at: string
}

