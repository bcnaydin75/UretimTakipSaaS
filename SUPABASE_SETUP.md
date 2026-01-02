# Supabase Kurulum Rehberi

Bu proje Supabase kullanarak dinamik veri yönetimi sağlar. Aşağıdaki adımları takip ederek projeyi çalışır hale getirebilirsiniz.

## 1. Supabase Projesi Oluşturma

1. [Supabase](https://supabase.com) sitesine gidin ve bir hesap oluşturun
2. Yeni bir proje oluşturun
3. Proje ayarlarından **Project URL** ve **anon/public key** değerlerini kopyalayın

## 2. Veritabanı Tablosunu Oluşturma

1. Supabase Dashboard'da **SQL Editor** sekmesine gidin
2. `supabase-schema.sql` dosyasındaki SQL kodunu kopyalayın
3. SQL Editor'e yapıştırın ve **Run** butonuna tıklayın
4. Tablo başarıyla oluşturulduğunda onay mesajı göreceksiniz

## 3. Environment Variables Ayarlama

1. Proje kök dizininde `.env.local` dosyası oluşturun
2. Aşağıdaki değerleri kendi Supabase bilgilerinizle doldurun:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Örnek:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 4. Projeyi Çalıştırma

```bash
# Bağımlılıkları yükle (eğer henüz yapmadıysanız)
npm install

# Development server'ı başlat
npm run dev
```

## 5. Test Etme

1. Tarayıcıda `http://localhost:3000` adresine gidin
2. Dashboard'da **"Yeni Sipariş Ekle"** butonuna tıklayın
3. Bir sipariş ekleyin
4. **Üretim Takibi** sayfasında siparişinizin göründüğünü kontrol edin
5. **"Sonraki Aşamaya Geç"** butonuyla status'u güncelleyin

## Veritabanı Şeması

### Orders Tablosu

| Sütun | Tip | Açıklama |
|-------|-----|----------|
| id | UUID | Benzersiz ID (otomatik) |
| customer_name | TEXT | Müşteri adı |
| product_name | TEXT | Ürün adı |
| dimensions | TEXT | Ölçüler (opsiyonel) |
| status | TEXT | Durum (Kesim, Döşeme, Boya, Paket, Sevk) |
| delivery_date | DATE | Teslimat tarihi (opsiyonel) |
| is_urgent | BOOLEAN | Acil sipariş mi? |
| created_at | TIMESTAMP | Oluşturulma tarihi (otomatik) |
| updated_at | TIMESTAMP | Güncellenme tarihi (otomatik) |

## Güvenlik Notları

- `.env.local` dosyasını asla Git'e commit etmeyin
- Production'da Row Level Security (RLS) politikalarını gözden geçirin
- Supabase Dashboard'da API ayarlarını kontrol edin

## Sorun Giderme

### "Supabase environment variables are not set" uyarısı
- `.env.local` dosyasının doğru konumda olduğundan emin olun
- Environment variable'ların doğru yazıldığını kontrol edin
- Development server'ı yeniden başlatın

### Veritabanı bağlantı hatası
- Supabase projenizin aktif olduğundan emin olun
- URL ve KEY değerlerinin doğru olduğunu kontrol edin
- Supabase Dashboard'da proje durumunu kontrol edin

## İletişim

Sorularınız için GitHub Issues kullanabilirsiniz.

