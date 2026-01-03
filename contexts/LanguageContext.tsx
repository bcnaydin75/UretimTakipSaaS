'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Language = 'tr' | 'en' | 'ar'

interface LanguageContextType {
    language: Language
    setLanguage: (lang: Language) => void
    t: (key: string) => string
}

const translations: Record<Language, Record<string, string>> = {
    tr: {
        // Genel
        'dashboard': 'Dashboard',
        'production_tracking': 'Üretim Takibi',
        'statistics': 'İstatistikler',
        'settings': 'Ayarlar',
        'login': 'Giriş Yap',
        'logout': 'Çıkış Yap',
        'email': 'E-posta',
        'password': 'Şifre',
        'save': 'Kaydet',
        'cancel': 'İptal',
        'error': 'Hata',
        'success': 'Başarılı',
        'loading': 'Yükleniyor...',
        'saving': 'Kaydediliyor...',

        // Sipariş
        'new_order': 'Yeni Sipariş Ekle',
        'customer_name': 'Müşteri Adı',
        'product_name': 'Ürün Adı',
        'quantity': 'Adet',
        'unit_price': 'Birim Fiyat',
        'total_price': 'Toplam Fiyat',
        'dimensions': 'Ölçüler',
        'delivery_date': 'Teslimat Tarihi',
        'urgent_order': 'Acil Sipariş',
        'existing_customer': 'Var Olan Müşteri',
        'company_name': 'Firma Adı',
        'order_added': 'Sipariş Eklenmiştir',
        'order_updated': 'Sipariş Güncellenmiştir',
        'order_cancelled': 'Sipariş İptal Edilmiştir',
        'shipment_confirmed': 'Sevkiyat Onaylandı',

        // Üretim Aşamaları
        'cutting': 'Kesim',
        'upholstery': 'Döşeme',
        'paint': 'Boya',
        'package': 'Paket',
        'shipment': 'Sevk',

        // Dashboard
        'active_orders': 'Aktif Siparişler',
        'critical_delays': 'Kritik Gecikmeler',
        'paint_shop': 'Boyahanedeki İşler',
        'completed_this_month': 'Tamamlanan Bu Ay',
        'monthly_revenue': 'Aylık Gelir',
        'urgent_orders': 'Acil İşler',

        // İstatistikler
        'monthly_production': 'Aylık Üretim',
        'average_completion': 'Ortalama Tamamlanma',
        'active_customers': 'Aktif Müşteri',
        'monthly_production_performance': 'Aylık Üretim Performansı',
        'month': 'Ay',
        'total_quantity': 'Toplam Adet',
        'stage_distribution': 'Aşamaya Göre İş Dağılımı',

        // Ayarlar
        'workshop_name': 'Atölye Adı',
        'tax_number': 'Vergi No',
        'iban': 'IBAN',
        'bank_name': 'Banka Adı',
        'account_holder': 'Hesap Sahibi',
        'language_settings': 'Dil Ayarları',
        'select_language': 'Dil Seçin',
        'general_settings': 'Genel Ayarlar',
        'save_settings': 'Ayarları Kaydet',
        'settings_saved': 'Ayarlar başarıyla kaydedildi!',
        'logout_confirm_title': 'Oturumu Kapat',
        'logout_confirm_message': 'Oturumu kapatmak istediğinize emin misiniz?',
        'yes': 'Evet',
        'no': 'Hayır',
        'yes_logout': 'Evet, Çıkış Yap',

        // Arşiv
        'sales_archive': 'Satış Arşivi',
        'completed_orders': 'Tamamlanmış ve sevk edilmiş tüm siparişler',
        'search': 'Müşteri veya ürün adı ile ara...',
        'generate_invoice': 'Fatura Çıkar',
        'invoice': 'Fatura',
        'invoice_number': 'Fatura No',
        'date': 'Tarih',
        'customer': 'Müşteri',
        'product': 'Ürün',
        'subtotal': 'Ara Toplam',
        'vat': 'KDV (%20)',
        'grand_total': 'Genel Toplam',
        'payment_info': 'Ödeme Bilgileri',
        'print': 'Yazdır',

        // Genel Arşiv
        'general_archive': 'Genel Arşiv',
        'monthly_sales': 'Aylık Satışlar',
        'total_revenue': 'Toplam Gelir',
        'total_orders': 'Toplam Sipariş',
        'unique_customers': 'Benzersiz Müşteri',
        'sales_details': 'Satış Detayları',
        'tax_office': 'Vergi Dairesi',
        'address': 'Adres',
        'select_customer': 'Müşteri seçin...',
        'enter_price': 'Fiyat girin...',
        'enter_quantity': 'Adet girin...',
        'enter_dimensions': 'Ölçüleri girin...',
        'enter_delivery_date': 'Teslimat tarihini seçin...',
        'enter_customer_name': 'Müşteri adını girin...',
        'cancel_order_title': 'Siparişi İptal Et',
        'cancel_order_message': 'Bu siparişi iptal etmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
        'confirm_shipment_title': 'Sevkiyat Onayı',
        'confirm_shipment_message': 'Sevkiyatı onaylıyor musunuz?',
        'yes_cancel': 'Evet, İptal Et',
        'next_stage': 'Sonraki Aşamaya Geç',
        'updating': 'Güncelleniyor...',
        'no_work_in_stage': 'Bu aşamada iş yok',
        'back_to_previous': 'Bir önceki aşamaya geri al',
        'confirm_shipment': 'Sevkiyatı onayla',
        'cancel_order': 'Siparişi iptal et',
        'urgent': 'ACİL',
        'yes_confirm': 'Evet, Onayla',
        'cancelling': 'İptal Ediliyor...',
        'error_occurred': 'Hata Oluştu',
        'session_closing': 'Oturum Kapatılıyor',
        'settings_loading': 'Ayarlar yükleniyor...',
        'production_tracking_system': 'Üretim Takip Sistemi',
        'logging_in': 'Giriş yapılıyor...',
        'error_please_try_again': 'Bir hata oluştu. Lütfen tekrar deneyin.',
        'enter_workshop_name': 'Atölye adını girin',
        'enter_tax_number': 'Vergi numarasını girin',
        'enter_tax_office': 'Vergi dairesi adını girin',
        'enter_address': 'Adresi girin',
        'enter_iban': 'IBAN girin',
        'select_bank': 'Banka seçin...',
        'enter_account_holder': 'Hesap sahibinin adı',
        'order_added_success': 'Sipariş Eklendi',
        'error_occurred_toast': 'Hata Oluştu',
        'logout_in_progress': 'Çıkış Yapılıyor',
        'enter_company_name': 'Firma adını girin',
        'enter_product_name': 'Ürün adını girin',
        'order_updated_success': 'Sipariş Güncellenmiştir',
        'order_cancelled_success': 'Sipariş İptal Edilmiştir',
        'order_back_success': 'Sipariş Geri Alındı',
        'shipment_confirmed_success': 'Sevkiyat Onaylandı',
        'error_prefix': 'Hata: ',
        'error_generic': 'Bir hata oluştu',
        'confirming': 'Onaylanıyor...',
        'shipment_confirm_note': 'Bu işlem siparişi Satış Arşivi\'ne taşıyacaktır.',
    },
    en: {
        // General
        'dashboard': 'Dashboard',
        'production_tracking': 'Production Tracking',
        'statistics': 'Statistics',
        'settings': 'Settings',
        'login': 'Login',
        'logout': 'Logout',
        'email': 'Email',
        'password': 'Password',
        'save': 'Save',
        'cancel': 'Cancel',
        'error': 'Error',
        'success': 'Success',
        'loading': 'Loading...',
        'saving': 'Saving...',

        // Order
        'new_order': 'Add New Order',
        'customer_name': 'Customer Name',
        'product_name': 'Product Name',
        'quantity': 'Quantity',
        'unit_price': 'Unit Price',
        'total_price': 'Total Price',
        'dimensions': 'Dimensions',
        'delivery_date': 'Delivery Date',
        'urgent_order': 'Urgent Order',
        'existing_customer': 'Existing Customer',
        'company_name': 'Company Name',
        'order_added': 'Order Added',
        'order_updated': 'Order Updated',
        'order_cancelled': 'Order Cancelled',
        'shipment_confirmed': 'Shipment Confirmed',

        // Production Stages
        'cutting': 'Cutting',
        'upholstery': 'Upholstery',
        'paint': 'Paint',
        'package': 'Package',
        'shipment': 'Shipment',

        // Dashboard
        'active_orders': 'Active Orders',
        'critical_delays': 'Critical Delays',
        'paint_shop': 'Paint Shop Jobs',
        'completed_this_month': 'Completed This Month',
        'monthly_revenue': 'Monthly Revenue',
        'urgent_orders': 'Urgent Orders',

        // Statistics
        'monthly_production': 'Monthly Production',
        'average_completion': 'Average Completion',
        'active_customers': 'Active Customers',
        'monthly_production_performance': 'Monthly Production Performance',
        'month': 'Month',
        'total_quantity': 'Total Quantity',
        'stage_distribution': 'Stage Distribution',

        // Settings
        'workshop_name': 'Workshop Name',
        'tax_number': 'Tax Number',
        'iban': 'IBAN',
        'bank_name': 'Bank Name',
        'account_holder': 'Account Holder',
        'language_settings': 'Language Settings',
        'select_language': 'Select Language',
        'general_settings': 'General Settings',
        'save_settings': 'Save Settings',
        'settings_saved': 'Settings saved successfully!',
        'logout_confirm_title': 'Logout',
        'logout_confirm_message': 'Are you sure you want to log out?',
        'yes': 'Yes',
        'no': 'No',
        'yes_logout': 'Yes, Logout',

        // Archive
        'sales_archive': 'Sales Archive',
        'completed_orders': 'All completed and shipped orders',
        'search': 'Search by customer or product name...',
        'generate_invoice': 'Generate Invoice',
        'invoice': 'Invoice',
        'invoice_number': 'Invoice No',
        'date': 'Date',
        'customer': 'Customer',
        'product': 'Product',
        'subtotal': 'Subtotal',
        'vat': 'VAT (%20)',
        'grand_total': 'Grand Total',
        'payment_info': 'Payment Information',
        'print': 'Print',

        // General Archive
        'general_archive': 'General Archive',
        'monthly_sales': 'Monthly Sales',
        'total_revenue': 'Total Revenue',
        'total_orders': 'Total Orders',
        'unique_customers': 'Unique Customers',
        'sales_details': 'Sales Details',
        'tax_office': 'Tax Office',
        'address': 'Address',
        'select_customer': 'Select customer...',
        'enter_price': 'Enter price...',
        'enter_quantity': 'Enter quantity...',
        'enter_dimensions': 'Enter dimensions...',
        'enter_delivery_date': 'Select delivery date...',
        'enter_customer_name': 'Enter customer name...',
        'cancel_order_title': 'Cancel Order',
        'cancel_order_message': 'Are you sure you want to cancel this order? This action cannot be undone.',
        'confirm_shipment_title': 'Confirm Shipment',
        'confirm_shipment_message': 'Do you confirm the shipment?',
        'yes_cancel': 'Yes, Cancel',
        'next_stage': 'Next Stage',
        'updating': 'Updating...',
        'no_work_in_stage': 'No work in this stage',
        'back_to_previous': 'Move to previous stage',
        'confirm_shipment': 'Confirm shipment',
        'cancel_order': 'Cancel order',
        'urgent': 'URGENT',
        'yes_confirm': 'Yes, Confirm',
        'cancelling': 'Cancelling...',
        'error_occurred': 'Error Occurred',
        'session_closing': 'Closing Session',
        'settings_loading': 'Loading settings...',
        'production_tracking_system': 'Production Tracking System',
        'logging_in': 'Logging in...',
        'error_please_try_again': 'An error occurred. Please try again.',
        'enter_workshop_name': 'Enter workshop name',
        'enter_tax_number': 'Enter tax number',
        'enter_tax_office': 'Enter tax office name',
        'enter_address': 'Enter address',
        'enter_iban': 'Enter IBAN',
        'select_bank': 'Select bank...',
        'enter_account_holder': 'Account holder name',
        'order_added_success': 'Order Added',
        'error_occurred_toast': 'Error Occurred',
        'logout_in_progress': 'Logging Out',
        'enter_company_name': 'Enter company name',
        'enter_product_name': 'Enter product name',
        'order_updated_success': 'Order Updated',
        'order_cancelled_success': 'Order Cancelled',
        'order_back_success': 'Order Reverted',
        'shipment_confirmed_success': 'Shipment Confirmed',
        'error_prefix': 'Error: ',
        'error_generic': 'An error occurred',
        'confirming': 'Confirming...',
        'shipment_confirm_note': 'This action will move the order to Sales Archive.',
    },
    ar: {
        // عام
        'dashboard': 'لوحة التحكم',
        'production_tracking': 'تتبع الإنتاج',
        'statistics': 'الإحصائيات',
        'settings': 'الإعدادات',
        'login': 'تسجيل الدخول',
        'logout': 'تسجيل الخروج',
        'email': 'البريد الإلكتروني',
        'password': 'كلمة المرور',
        'save': 'حفظ',
        'cancel': 'إلغاء',
        'error': 'خطأ',
        'success': 'نجاح',
        'loading': 'جاري التحميل...',
        'saving': 'جاري الحفظ...',

        // الطلب
        'new_order': 'إضافة طلب جديد',
        'customer_name': 'اسم العميل',
        'product_name': 'اسم المنتج',
        'quantity': 'الكمية',
        'unit_price': 'سعر الوحدة',
        'total_price': 'السعر الإجمالي',
        'dimensions': 'الأبعاد',
        'delivery_date': 'تاريخ التسليم',
        'urgent_order': 'طلب عاجل',
        'existing_customer': 'عميل موجود',
        'company_name': 'اسم الشركة',
        'order_added': 'تمت إضافة الطلب',
        'order_updated': 'تم تحديث الطلب',
        'order_cancelled': 'تم إلغاء الطلب',
        'shipment_confirmed': 'تم تأكيد الشحنة',

        // مراحل الإنتاج
        'cutting': 'القطع',
        'upholstery': 'التنجيد',
        'paint': 'الطلاء',
        'package': 'التعبئة',
        'shipment': 'الشحن',

        // لوحة التحكم
        'active_orders': 'الطلبات النشطة',
        'critical_delays': 'التأخيرات الحرجة',
        'paint_shop': 'أعمال ورشة الطلاء',
        'completed_this_month': 'المكتملة هذا الشهر',
        'monthly_revenue': 'الإيرادات الشهرية',
        'urgent_orders': 'الطلبات العاجلة',

        // الإحصائيات
        'monthly_production': 'الإنتاج الشهري',
        'average_completion': 'متوسط الإتمام',
        'active_customers': 'العملاء النشطون',
        'monthly_production_performance': 'أداء الإنتاج الشهري',
        'month': 'الشهر',
        'total_quantity': 'الكمية الإجمالية',
        'stage_distribution': 'توزيع المرحلة',

        // الإعدادات
        'workshop_name': 'اسم الورشة',
        'tax_number': 'الرقم الضريبي',
        'iban': 'رقم الآيبان',
        'bank_name': 'اسم البنك',
        'account_holder': 'صاحب الحساب',
        'language_settings': 'إعدادات اللغة',
        'select_language': 'اختر اللغة',
        'general_settings': 'الإعدادات العامة',
        'save_settings': 'حفظ الإعدادات',
        'settings_saved': 'تم حفظ الإعدادات بنجاح!',
        'logout_confirm_title': 'تسجيل الخروج',
        'logout_confirm_message': 'هل أنت متأكد أنك تريد تسجيل الخروج؟',
        'yes': 'نعم',
        'no': 'لا',
        'yes_logout': 'نعم، تسجيل الخروج',

        // الأرشيف
        'sales_archive': 'أرشيف المبيعات',
        'completed_orders': 'جميع الطلبات المكتملة والمشحونة',
        'search': 'البحث عن طريق اسم العميل أو المنتج...',
        'generate_invoice': 'إنشاء فاتورة',
        'invoice': 'فاتورة',
        'invoice_number': 'رقم الفاتورة',
        'date': 'التاريخ',
        'customer': 'العميل',
        'product': 'المنتج',
        'subtotal': 'المجموع الفرعي',
        'vat': 'ضريبة القيمة المضافة (%20)',
        'grand_total': 'المجموع الكلي',
        'payment_info': 'معلومات الدفع',
        'print': 'طباعة',

        // الأرشيف العام
        'general_archive': 'الأرشيف العام',
        'monthly_sales': 'المبيعات الشهرية',
        'total_revenue': 'إجمالي الإيرادات',
        'total_orders': 'إجمالي الطلبات',
        'unique_customers': 'العملاء الفريدون',
        'sales_details': 'تفاصيل المبيعات',
        'tax_office': 'مكتب الضرائب',
        'address': 'العنوان',
        'select_customer': 'اختر العميل...',
        'enter_price': 'أدخل السعر...',
        'enter_quantity': 'أدخل الكمية...',
        'enter_dimensions': 'أدخل الأبعاد...',
        'enter_delivery_date': 'اختر تاريخ التسليم...',
        'enter_customer_name': 'أدخل اسم العميل...',
        'cancel_order_title': 'إلغاء الطلب',
        'cancel_order_message': 'هل أنت متأكد أنك تريد إلغاء هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء.',
        'confirm_shipment_title': 'تأكيد الشحنة',
        'confirm_shipment_message': 'هل تؤكد الشحنة؟',
        'yes_cancel': 'نعم، إلغاء',
        'next_stage': 'المرحلة التالية',
        'updating': 'جاري التحديث...',
        'no_work_in_stage': 'لا يوجد عمل في هذه المرحلة',
        'back_to_previous': 'الرجوع إلى المرحلة السابقة',
        'confirm_shipment': 'تأكيد الشحنة',
        'cancel_order': 'إلغاء الطلب',
        'urgent': 'عاجل',
        'yes_confirm': 'نعم، تأكيد',
        'cancelling': 'جاري الإلغاء...',
        'error_occurred': 'حدث خطأ',
        'session_closing': 'جاري إغلاق الجلسة',
        'settings_loading': 'جاري تحميل الإعدادات...',
        'production_tracking_system': 'نظام تتبع الإنتاج',
        'logging_in': 'جاري تسجيل الدخول...',
        'error_please_try_again': 'حدث خطأ. يرجى المحاولة مرة أخرى.',
        'enter_workshop_name': 'أدخل اسم الورشة',
        'enter_tax_number': 'أدخل الرقم الضريبي',
        'enter_tax_office': 'أدخل اسم مكتب الضرائب',
        'enter_address': 'أدخل العنوان',
        'enter_iban': 'أدخل رقم الآيبان',
        'select_bank': 'اختر البنك...',
        'enter_account_holder': 'اسم صاحب الحساب',
        'order_added_success': 'تمت إضافة الطلب',
        'error_occurred_toast': 'حدث خطأ',
        'logout_in_progress': 'جاري تسجيل الخروج',
        'enter_company_name': 'أدخل اسم الشركة',
        'enter_product_name': 'أدخل اسم المنتج',
        'order_updated_success': 'تم تحديث الطلب',
        'order_cancelled_success': 'تم إلغاء الطلب',
        'order_back_success': 'تم إرجاع الطلب',
        'shipment_confirmed_success': 'تم تأكيد الشحنة',
        'error_prefix': 'خطأ: ',
        'error_generic': 'حدث خطأ',
        'confirming': 'جاري التأكيد...',
        'shipment_confirm_note': 'سيؤدي هذا الإجراء إلى نقل الطلب إلى أرشيف المبيعات.',
    },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>('tr')

    useEffect(() => {
        const saved = localStorage.getItem('language') as Language | null
        if (saved && ['tr', 'en', 'ar'].includes(saved)) {
            setLanguageState(saved)
        }
    }, [])

    const setLanguage = (lang: Language) => {
        setLanguageState(lang)
        localStorage.setItem('language', lang)
    }

    const t = (key: string): string => {
        return translations[language][key] || key
    }

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    const context = useContext(LanguageContext)
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider')
    }
    return context
}

