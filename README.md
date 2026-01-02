# 🏭 Mobilya Üretim Takip Sistemi

Modern, tam kapsamlı bir SaaS Dashboard prototipi. Mobilya atölyesinin üretim sürecini takip etmek için tasarlanmıştır.

## ✨ Özellikler

- 🌓 **Dark/Light Mode**: Kullanıcı tercihine göre tema değiştirme
- 📱 **Responsive Tasarım**: Mobil ve desktop uyumlu
- 🎨 **Modern UI**: Tailwind CSS ve Framer Motion ile animasyonlu arayüz
- 📊 **Dashboard**: Aktif işler, geciken işler ve özet istatistikler
- 🔄 **Üretim Takibi**: 5 aşamalı interaktif üretim süreci (Kesim ➔ Döşeme ➔ Boya ➔ Paket ➔ Sevk)
- 📈 **İstatistikler**: Performans metrikleri ve grafikler
- ⚙️ **Ayarlar**: Profil, bildirim tercihleri ve dil seçimi

## 🚀 Kurulum

1. Bağımlılıkları yükleyin:
```bash
npm install
```

2. Geliştirme sunucusunu başlatın:
```bash
npm run dev
```

3. Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresini açın.

## 🛠️ Teknolojiler

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Framer Motion** (Animasyonlar)
- **Lucide React** (İkonlar)

## 📁 Proje Yapısı

```
├── app/                    # Next.js App Router sayfaları
│   ├── page.tsx           # Dashboard ana sayfa
│   ├── uretim/            # Üretim takibi sayfası
│   ├── istatistikler/     # İstatistikler sayfası
│   ├── ayarlar/           # Ayarlar sayfası
│   └── layout.tsx         # Ana layout
├── components/             # React bileşenleri
│   ├── Sidebar.tsx        # Navigasyon menüsü
│   └── ThemeToggle.tsx    # Tema değiştirme butonu
├── contexts/              # React Context'leri
│   └── ThemeContext.tsx   # Tema yönetimi
└── package.json
```

## 📝 Öğrenme Notları

Kod içinde detaylı Türkçe yorum satırları bulunmaktadır. Özellikle:

- **State Yönetimi**: `useState` ve `useContext` kullanımı
- **Tema Değişimi**: Context API ile global state yönetimi
- **Animasyonlar**: Framer Motion ile yumuşak geçişler
- **Responsive Tasarım**: Tailwind CSS breakpoint'leri

## 🎯 Gelecek Geliştirmeler

- [ ] API entegrasyonu
- [ ] Gerçek zamanlı bildirimler
- [ ] Grafik kütüphanesi entegrasyonu (Chart.js/Recharts)
- [ ] Kullanıcı kimlik doğrulama
- [ ] Veritabanı entegrasyonu

## 📄 Lisans

Bu proje eğitim amaçlıdır.

