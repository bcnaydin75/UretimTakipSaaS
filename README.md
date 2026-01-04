# 🏭  SaaS Mobilya Üretim Takip Sistemi

[![Canlı Demo](https://img.shields.io/badge/🚀-Canlı%20Demo-indigo?style=for-the-badge)](https://uretim-takip-saa-s.vercel.app)

Modern, tam kapsamlı ve çok dilli bir SaaS Üretim Takip Dashboard'u. Mobilya atölyelerinin ve imalatçıların üretim süreçlerini dijitalleştirmek, verimliliği artırmak ve müşteri yönetimini kolaylaştırmak için tasarlanmıştır.

## ✨ Öne Çıkan Özellikler

### 🏗️ SaaS Mimarisi & Üst Düzey Güvenlik
- **Multi-tenant (Çoklu Kiracı) Yapısı**: Her kullanıcı (atölye) tamamen izole edilmiş bir çalışma alanına sahiptir. Veriler `user_id` bazlı filtrelenir.
- **Row Level Security (RLS)**: Veritabanı seviyesinde uygulanan RLS politikaları sayesinde, bir kullanıcı asla başka bir kullanıcının verisine erişemez; tam veri gizliliği ve güvenliği sağlanır.
- **Supabase Kimlik Doğrulama**: Güvenli kayıt, giriş/çıkış işlemleri ve gelişmiş oturum yönetimi.
- **Middleware Koruması**: Yetkisiz erişimlerin anlık tespiti ve güvenli yönlendirme.

### 🌍 Çok Dilli Yapı & RTL Desteği (i18n)
- **3 Dil Desteği**: Türkçe (TR), İngilizce (EN) ve Arapça (AR) dilleri arasında anlık geçiş imkanı.
- **RTL Uyumluluğu**: Arapça dili seçildiğinde tüm arayüz sağdan sola (Right-to-Left) düzenine otomatik olarak uyum sağlar.
- **Dinamik Çeviri**: Hata mesajları, sistem bildirimleri, fatura detayları ve tüm UI elemanları %100 dile duyarlıdır.

### ⚙️ Akıllı Ayar ve Yönetim Sistemi
- **EAV Tabanlı Dinamik Ayarlar**: Atölye bilgileri, vergi detayları ve banka bilgileri esnek EAV yapısında saklanır.
- **WhatsApp Bildirim Sistemi**: Sipariş "Sevk" aşamasına geçtiğinde müşteriye otomatik bilgilendirme mesajı gönderilir (Entegrasyon aşamasında).
- **Tekil Ayar Güvenliği**: Her kullanıcı için veritabanında tutarlı ve tekil bir ayar seti yönetilir (`UNIQUE(user_id, setting_key)`).

### 📑 Dinamik & Kurumsal Fatura Sistemi
- **Profesyonel Tasarım**: Kurumsal standartlara uygun, temiz ve modern fatura çıktısı.
- **Otomatik Hesaplamalar**: KDV, ara toplam ve genel toplam değerleri sistem tarafından hatasız hesaplanır.
- **A4 Yazdırma Uyumluluğu**: Tarayıcı üzerinden doğrudan A4 boyutunda, taşma yapmayan profesyonel çıktı desteği.

### 📊 Üretim & Satış Yönetimi
- **5 Aşamalı Üretim Akışı**: Kesim ➔ Döşeme ➔ Boya ➔ Paket ➔ Sevk süreciyle gerçek zamanlı izleme.
- **Satış Arşivi & Performans**: Tamamlanan işlerin geçmişe dönük takibi ve aylık ciro/verimlilik analizleri.
- **Akıllı Müşteri Hafızası**: Önceki siparişlerden müşteri ve firma bilgilerini otomatik tamamlama özelliği.

## 🚀 Sisteme Erişim

Proje şu an canlı ortamda çalışmaktadır. Herhangi bir yerel kurulum yapmanıza gerek kalmadan aşağıdaki bağlantı üzerinden sisteme erişebilirsiniz:

**Canlı Uygulama Linki:** [https://uretim-takip-saa-s.vercel.app](https://uretim-takip-saa-s.vercel.app)

> **Not:** Sisteme giriş yapabilmek için geçerli bir kullanıcı hesabı gerekmektedir. Kayıt ve yetkilendirme işlemleri Row Level Security (RLS) ile korunmaktadır.

## 🛠️ Teknolojiler

- **Frontend**: [Next.js 14](https://nextjs.org/) (App Router), TypeScript, Tailwind CSS
- **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL, Auth, RLS)
- **Deployment**: [Vercel](https://vercel.com/)
- **Animasyon**: Framer Motion
- **İkon Seti**: Lucide React
- **State Yönetimi**: React Context API

## 📝 Lisans

Bu proje eğitim ve portfolyo amaçlıdır.
