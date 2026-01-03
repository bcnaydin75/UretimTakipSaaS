# 🏭 SaaS Mobilya Üretim Takip Sistemi

Modern, tam kapsamlı ve çok dilli bir SaaS Üretim Takip Dashboard'u. Mobilya atölyelerinin ve imalatçıların üretim süreçlerini dijitalleştirmek, verimliliği artırmak ve müşteri yönetimini kolaylaştırmak için tasarlanmıştır.

## ✨ Öne Çıkan Özellikler

### 🏗️ SaaS Mimarisi & Güvenlik
- **Multi-tenant Yapı**: Her kullanıcı (atölye) sadece kendi verilerine erişebilir. Veriler `user_id` bazlı tam izolasyon altındadır.
- **Supabase Kimlik Doğrulama**: Güvenli giriş/çıkış işlemleri ve oturum yönetimi.
- **Middleware Koruması**: Yetkisiz erişimlerin engellenmesi ve otomatik yönlendirme.
- **Row Level Security (RLS)**: Veritabanı seviyesinde en üst düzey veri güvenliği.

### ⚙️ EAV Tabanlı Dinamik Ayarlar
- **Esnek Ayar Sistemi**: Atölye adı, vergi bilgileri, adres ve banka detayları EAV (Entity-Attribute-Value) yapısında saklanır.
- **Hızlı Güncelleme**: Tüm ayarlar tek bir form üzerinden dinamik olarak güncellenebilir ve anında sisteme yansır.
- **Tek Satır Kısıtlaması**: Her kullanıcı için veritabanında tekil bir ayar seti yönetilir (`UNIQUE(user_id, setting_key)`).

### 🌍 Çok Dilli Yapı (i18n)
- **3 Dil Desteği**: Türkçe (TR), İngilizce (EN) ve Arapça (AR) dilleri arasında anlık geçiş.
- **Dinamik Çeviri**: Hata mesajlarından toast bildirimlerine, faturadan dashboard istatistiklerine kadar her şey %100 dile duyarlıdır.
- **RTL Desteği**: Arapça için sağdan sola okuma uyumluluğu.

### 📑 Dinamik & Kurumsal Fatura Sistemi
- **Modern Tasarım**: Profesyonel, temiz ve kurumsal fatura görünümü.
- **Otomatik Hesaplama**: KDV, ara toplam ve genel toplam hesaplamaları otomatik yapılır.
- **Yazdırılabilir Form**: A4 kağıt boyutuna tam uyumlu, tarayıcı üzerinden doğrudan çıktı alınabilir yapı.
- **Akıllı Bilgi Çekme**: Müşteri ve firma bilgileri sistemden otomatik çekilerek hatasız fatura oluşturulur.

### 📊 Üretim & Satış Yönetimi
- **5 Aşamalı Takip**: Kesim ➔ Döşeme ➔ Boya ➔ Paket ➔ Sevk akışıyla gerçek zamanlı üretim izleme.
- **Satış Arşivi**: Tamamlanan işlerin geçmişe dönük takibi ve raporlanması.
- **Dashboard Özetleri**: Kritik gecikmeler, aktif siparişler ve aylık performans metrikleri.
- **Akıllı Müşteri Hafızası**: Önceki siparişlerden müşteri ve firma bilgilerini otomatik hatırlama.

### 📱 Modern UI/UX
- **Mobil/Tablet Uyumluluk**: Her cihazda kusursuz çalışan responsive tasarım.
- **Sticky Modallar**: Kaydırılabilir içerik alanı ile ekran dışına taşmayan akıllı modal yapısı.
- **Dark/Light Mode**: Göz yormayan karanlık tema ve klasik aydınlık tema desteği.
- **Framer Motion**: Akıcı ve profesyonel arayüz animasyonları.

## 🛠️ Teknolojiler

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend/DB**: Supabase (PostgreSQL, Auth, RLS)
- **State/Context**: React Context API, Toast Context, Language Context
- **Animasyon**: Framer Motion
- **İkonlar**: Lucide React

## 🚀 Hızlı Başlangıç

1. **Bağımlılıkları Yükleyin**:
```bash
npm install
```

2. **Çevre Değişkenlerini Ayarlayın**:
`.env.local` dosyası oluşturun ve Supabase bilgilerinizi ekleyin.

3. **Geliştirme Sunucusunu Başlatın**:
```bash
npm run dev
```

4. **Kullanıma Hazır**: Tarayıcınızda `localhost:3000` adresine gidin.

## 📝 Lisans

Bu proje eğitim ve portfolyo amaçlıdır.
