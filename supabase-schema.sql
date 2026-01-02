-- Supabase Veritabanı Şeması
-- Bu SQL kodunu Supabase Dashboard > SQL Editor'de çalıştırın
-- Orders tablosunu oluştur
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_name TEXT NOT NULL,
    product_name TEXT NOT NULL,
    dimensions TEXT,
    status TEXT NOT NULL DEFAULT 'Kesim',
    delivery_date DATE,
    is_urgent BOOLEAN DEFAULT false,
    price NUMERIC(10, 2) DEFAULT 0,
    -- Fiyat alanı eklendi (TL cinsinden)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Status değerleri için check constraint
ALTER TABLE orders
ADD CONSTRAINT status_check CHECK (
        status IN ('Kesim', 'Döşeme', 'Boya', 'Paket', 'Sevk')
    );
-- Index'ler (performans için)
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_date ON orders(delivery_date);
CREATE INDEX IF NOT EXISTS idx_orders_is_urgent ON orders(is_urgent);
CREATE INDEX IF NOT EXISTS idx_orders_price ON orders(price);
-- Updated_at otomatik güncelleme için trigger
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ language 'plpgsql';
CREATE TRIGGER update_orders_updated_at BEFORE
UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- Row Level Security (RLS) - Tüm kullanıcılar okuyabilsin ve yazabilsin
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all operations for all users" ON orders FOR ALL USING (true) WITH CHECK (true);
-- Settings tablosu oluştur (Ayarlar için)
CREATE TABLE IF NOT EXISTS settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    -- 'atolye_adi', 'vergi_no', 'adres' gibi
    value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Settings için index
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);
-- Settings için trigger (updated_at)
CREATE TRIGGER update_settings_updated_at BEFORE
UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- Settings için RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all operations for all users" ON settings FOR ALL USING (true) WITH CHECK (true);
-- Varsayılan ayarları ekle (opsiyonel)
INSERT INTO settings (key, value)
VALUES ('atolye_adi', 'İnegöl Mobilya Ltd.'),
    ('vergi_no', '1234567890'),
    (
        'adres',
        'İnegöl Organize Sanayi Bölgesi, 16400 İnegöl/Bursa'
    ) ON CONFLICT (key) DO NOTHING;