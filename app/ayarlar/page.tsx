'use client'

import { ThemeToggle } from '@/components/ThemeToggle'
import { useTheme } from '@/contexts/ThemeContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { useToast } from '@/contexts/ToastContext'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import {
  Building2,
  FileText,
  Save,
  Loader2,
  Globe,
  CreditCard,
  Banknote,
  User,
  MapPin,
  Receipt
} from 'lucide-react'
import { getSettings, updateSettings } from '@/app/actions/orders'

export default function Ayarlar() {
  const { theme } = useTheme()
  const { language, setLanguage, t } = useLanguage()
  const { showToast } = useToast()

  // Loading durumu
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Genel Ayarlar - Supabase'den yüklenecek
  const [genelAyarlar, setGenelAyarlar] = useState({
    atolyeAdi: '',
    vergiNo: '',
    vergiDairesi: '',
    adres: '',
    iban: '',
    bankaAdi: '',
    hesapSahibi: '',
  })

  // Sayfa yüklendiğinde ayarları Supabase'den çek
  useEffect(() => {
    fetchSettings()
  }, [])

  // Ayarları Supabase'den yükle
  const fetchSettings = async () => {
    setLoading(true)
    try {
      const result = await getSettings()
      if (result.success && result.data) {
        // Supabase'den gelen verileri state'e aktar
        const settings = result.data as Record<string, string>
        setGenelAyarlar({
          atolyeAdi: settings['atolye_adi'] || '',
          vergiNo: settings['vergi_no'] || '',
          vergiDairesi: settings['vergi_dairesi'] || '',
          adres: settings['adres'] || '',
          iban: settings['iban'] || '',
          bankaAdi: settings['banka_adi'] || '',
          hesapSahibi: settings['hesap_sahibi'] || '',
        })
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  // Genel ayar değişikliği
  const handleGenelChange = (field: string, value: string) => {
    setGenelAyarlar((prev) => ({ ...prev, [field]: value }))
  }

  // Ayarları Supabase'e kaydet
  const handleSave = async () => {
    setSaving(true)
    try {
      // Genel ayarları Supabase formatına çevir
      const settingsToSave = {
        atolye_adi: genelAyarlar.atolyeAdi,
        vergi_no: genelAyarlar.vergiNo,
        vergi_dairesi: genelAyarlar.vergiDairesi,
        adres: genelAyarlar.adres,
        iban: genelAyarlar.iban,
        banka_adi: genelAyarlar.bankaAdi,
        hesap_sahibi: genelAyarlar.hesapSahibi,
      }

      const result = await updateSettings(settingsToSave)

      if (result.success) {
        showToast(t('settings_saved'), 'success')
        // Verileri yeniden yükle
        await fetchSettings()
      } else {
        showToast(t('error_prefix') + result.error, 'error')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      showToast(t('error_please_try_again'), 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="p-6 md:p-8">
      {/* Sayfa Başlığı */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2">
          {t('settings')}
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          {language === 'tr' ? 'Uygulama ve hesap ayarlarınızı yönetin' : language === 'en' ? 'Manage your application and account settings' : 'إدارة إعدادات التطبيق والحساب'}
        </p>
      </motion.div>

      {/* Loading Durumu */}
      {loading ? (
        <div className="flex items-center justify-center py-20 mt-8">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">{t('settings_loading')}</p>
          </div>
        </div>
      ) : (
        <div className="mt-8 space-y-6 max-w-4xl">
          {/* Genel Ayarlar - Supabase'den yükleniyor */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700"
          >
            <div className="flex items-center gap-3 mb-6">
              <Building2 className="w-6 h-6 text-indigo-500" />
              <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                {t('general_settings')}
              </h2>
            </div>
            <div className="space-y-4">
              {/* Atölye Adı */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  <Building2 className="w-4 h-4" /> {t('workshop_name')}
                </label>
                <input
                  type="text"
                  value={genelAyarlar.atolyeAdi}
                  onChange={(e) => handleGenelChange('atolyeAdi', e.target.value)}
                  placeholder={t('enter_workshop_name')}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              {/* Vergi No */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  <FileText className="w-4 h-4" /> {t('tax_number')}
                </label>
                <input
                  type="text"
                  value={genelAyarlar.vergiNo}
                  onChange={(e) => handleGenelChange('vergiNo', e.target.value)}
                  placeholder={t('enter_tax_number')}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              {/* Vergi Dairesi */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  <Receipt className="w-4 h-4" /> {t('tax_office')}
                </label>
                <input
                  type="text"
                  value={genelAyarlar.vergiDairesi}
                  onChange={(e) => handleGenelChange('vergiDairesi', e.target.value)}
                  placeholder={t('enter_tax_office')}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              {/* Adres */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  <MapPin className="w-4 h-4" /> {t('address')}
                </label>
                <textarea
                  value={genelAyarlar.adres}
                  onChange={(e) => handleGenelChange('adres', e.target.value)}
                  rows={3}
                  placeholder={t('enter_address')}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
              {/* IBAN */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  <CreditCard className="w-4 h-4" /> {t('iban')}
                </label>
                <input
                  type="text"
                  value={genelAyarlar.iban}
                  onChange={(e) => handleGenelChange('iban', e.target.value)}
                  placeholder={t('enter_iban')}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              {/* Banka Adı - Select */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  <Banknote className="w-4 h-4" /> {t('bank_name')}
                </label>
                <select
                  value={genelAyarlar.bankaAdi}
                  onChange={(e) => handleGenelChange('bankaAdi', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">{t('select_bank')}</option>
                  <option value="Ziraat Bankası">Ziraat Bankası</option>
                  <option value="Garanti BBVA">Garanti BBVA</option>
                  <option value="İş Bankası">İş Bankası</option>
                  <option value="Akbank">Akbank</option>
                  <option value="Yapı Kredi">Yapı Kredi</option>
                  <option value="QNB Finansbank">QNB Finansbank</option>
                  <option value="Vakıfbank">Vakıfbank</option>
                  <option value="Halkbank">Halkbank</option>
                </select>
              </div>
              {/* Hesap Sahibi */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  <User className="w-4 h-4" /> {t('account_holder')}
                </label>
                <input
                  type="text"
                  value={genelAyarlar.hesapSahibi}
                  onChange={(e) => handleGenelChange('hesapSahibi', e.target.value)}
                  placeholder={t('enter_account_holder')}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </motion.div>

          {/* Dil Ayarları */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700"
          >
            <div className="flex items-center gap-3 mb-6">
              <Globe className="w-6 h-6 text-indigo-500" />
              <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                {t('language_settings')}
              </h2>
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t('select_language')}
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'tr' | 'en' | 'ar')}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="tr">Türkçe</option>
                <option value="en">English</option>
                <option value="ar">العربية</option>
              </select>
            </div>
          </motion.div>

          {/* Kaydet Butonu */}
          <div className="flex justify-end pt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-8 py-3 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-600 shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('saving')}
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {t('save_settings')}
                </>
              )}
            </motion.button>
          </div>
        </div>
      )}
    </main>
  )
}
