/**
 * Fiyat formatlama utility fonksiyonları
 * Türkçe format: 16.000,00
 */

/**
 * Sayıyı Türkçe formatına çevir (16.000,00)
 */
export function formatPrice(value: number | string): string {
    const numValue = typeof value === 'string' ? parseFloat(value.replace(/\./g, '').replace(',', '.')) : value
    if (isNaN(numValue)) return '0,00'
    return new Intl.NumberFormat('tr-TR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(numValue)
}

/**
 * Formatlanmış string'i saf sayıya çevir (16.000,00 -> 16000.00)
 */
export function parsePrice(formattedValue: string): number {
    // Nokta ve virgülü temizle, sadece rakamları al
    const cleaned = formattedValue.replace(/\./g, '').replace(',', '.')
    const parsed = parseFloat(cleaned)
    return isNaN(parsed) ? 0 : parsed
}

/**
 * Input değerini formatla (kullanıcı yazarken)
 */
export function formatPriceInput(value: string): string {
    // Sadece rakam ve virgül/nokta bırak
    const cleaned = value.replace(/[^\d,.]/g, '')

    // Eğer boşsa boş döndür
    if (!cleaned) return ''

    // Virgül varsa ondalık kısmı olarak işle
    if (cleaned.includes(',')) {
        const parts = cleaned.split(',')
        const integerPart = parts[0].replace(/\./g, '')
        const decimalPart = parts[1]?.slice(0, 2) || ''

        // Binlik ayırıcı ekle
        const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
        return decimalPart ? `${formattedInteger},${decimalPart}` : `${formattedInteger},`
    }

    // Sadece tam sayı ise binlik ayırıcı ekle
    const numValue = cleaned.replace(/\./g, '')
    if (!numValue) return ''

    const formatted = numValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    return formatted
}

