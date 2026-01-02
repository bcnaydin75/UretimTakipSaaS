'use client'

import { ThemeToggle } from '@/components/ThemeToggle'
import { useTheme } from '@/contexts/ThemeContext'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import {
  Building2,
  MapPin,
  FileText,
  Save,
  Loader2
} from 'lucide-react'
import { getSettings, updateSettings } from '@/app/actions/orders'

export default function Ayarlar() {
  const { theme } = useTheme()

  // Loading durumu
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Genel Ayarlar - Supabase'den yüklenecek
  const [genelAyarlar, setGenelAyarlar] = useState({
    atolyeAdi: '',
    vergiNo: '',
    adres: '',
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
          adres: settings['adres'] || '',
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
        adres: genelAyarlar.adres,
      }

      const result = await updateSettings(settingsToSave)

      if (result.success) {
        // Başarılı bildirimi göster
        alert('✅ Ayarlar başarıyla kaydedildi!')
        // Verileri yeniden yükle
        await fetchSettings()
      } else {
        alert('❌ Hata: ' + result.error)
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('❌ Bir hata oluştu. Lütfen tekrar deneyin.')
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
          Ayarlar
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Uygulama ve hesap ayarlarınızı yönetin
        </p>
      </motion.div>

      {/* Loading Durumu */}
      {loading ? (
        <div className="flex items-center justify-center py-20 mt-8">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">Ayarlar yükleniyor...</p>
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
                Genel Ayarlar
              </h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  <Building2 className="w-4 h-4" /> Atölye Adı
                </label>
                <input
                  type="text"
                  value={genelAyarlar.atolyeAdi}
                  onChange={(e) => handleGenelChange('atolyeAdi', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  <FileText className="w-4 h-4" /> Vergi No
                </label>
                <input
                  type="text"
                  value={genelAyarlar.vergiNo}
                  onChange={(e) => handleGenelChange('vergiNo', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  <MapPin className="w-4 h-4" /> Adres
                </label>
                <textarea
                  value={genelAyarlar.adres}
                  onChange={(e) => handleGenelChange('adres', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
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
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Ayarları Kaydet
                </>
              )}
            </motion.button>
          </div>
        </div>
      )}
    </main>
  )
}
