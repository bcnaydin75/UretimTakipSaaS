/**
 * SMS Servis Entegrasyonu (Simülasyon)
 * 
 * Bu dosya SMS gönderim işlemlerini yönetir. Şimdilik konsola log basar.
 * İleride Netgsm, Twilio vb. servislerin API anahtarları buraya eklenebilir.
 */

interface SMSParams {
    to: string; // Telefon numarası (Format: 05XX XXX XX XX)
    message: string;
}

/**
 * Belirtilen numaraya SMS gönderir
 */
export async function sendSMSNotification({ to, message }: SMSParams) {
    try {
        // Telefon numarasındaki boşlukları temizle
        const cleanNumber = to.replace(/\s+/g, '');

        console.log('--- SMS GÖNDERİLİYOR ---');
        console.log(`Kime: ${cleanNumber}`);
        console.log(`Mesaj: ${message}`);
        console.log('--- SMS BAŞARIYLA GÖNDERİLDİ (SİMÜLASYON) ---');

        // Simüle edilmiş API gecikmesi
        await new Promise(resolve => setTimeout(resolve, 1000));

        return { success: true };
    } catch (error) {
        console.error('SMS gönderimi sırasında hata oluştu:', error);
        return { success: false, error: 'sms_send_error' };
    }
}

/**
 * Sipariş sevkiyatı için hazır mesaj taslağı oluşturur
 */
export function createShipmentMessage(customerPhone: string, orderNumber: string, productName: string) {
    return `Sayın müşterimiz, ${customerPhone} numarasına kayıtlı ${orderNumber} nolu ${productName} siparişiniz sevkiyata çıkmıştır. Hayırlı olsun, iyi günler dileriz.`;
}

