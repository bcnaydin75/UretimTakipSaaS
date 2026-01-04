-- Supabase Veritabanı Şeması (Multi-tenant Destekli)
-- Bu SQL kodunu Supabase Dashboard > SQL Editor'de çalıştırın
-- 1. Orders tablosunu oluştur/güncelle
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
    -- Kullanıcı ID
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    order_number TEXT UNIQUE,
    company_name TEXT,
    product_name TEXT NOT NULL,
    dimensions TEXT,
    status TEXT NOT NULL DEFAULT 'Kesim',
    delivery_date DATE,
    is_urgent BOOLEAN DEFAULT false,
    price NUMERIC(10, 2) DEFAULT 0,
    quantity INTEGER DEFAULT 1,
    unit_price NUMERIC(12, 2) DEFAULT 0,
    is_shipped BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Status değerleri için check constraint
DO $$ BEGIN
ALTER TABLE orders
ADD CONSTRAINT status_check CHECK (
        status IN ('Kesim', 'Döşeme', 'Boya', 'Paket', 'Sevk')
    );
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
-- Index'ler
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_date ON orders(delivery_date);
-- 2. Settings tablosunu oluştur/güncelle
-- Key-Value yapısı: Her ayar ayrı bir satır olarak saklanır
DROP TABLE IF EXISTS settings CASCADE;
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) DEFAULT auth.uid(),
    setting_key TEXT NOT NULL,
    value TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (user_id, setting_key)
);
-- Index'ler
CREATE INDEX IF NOT EXISTS idx_settings_user_id ON settings(user_id);
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(setting_key);
-- RLS Politikaları
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can only see their own settings" ON settings;
CREATE POLICY "Users can only see their own settings" ON settings FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
-- Updated_at tetikleyicisi
DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
CREATE TRIGGER update_settings_updated_at BEFORE
UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- 3. Customers tablosunu oluştur/güncelle
DROP TABLE IF EXISTS customers CASCADE;
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
    name TEXT NOT NULL,
    company_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, name)
);
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
-- 4. RLS Politikaları (Her kullanıcı sadece kendi verisini görsün)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
-- Orders politikaları
DROP POLICY IF EXISTS "Users can only see their own orders" ON orders;
CREATE POLICY "Users can only see their own orders" ON orders FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
-- Settings politikaları
DROP POLICY IF EXISTS "Users can only see their own settings" ON settings;
CREATE POLICY "Users can only see their own settings" ON settings FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
-- Customers politikaları
DROP POLICY IF EXISTS "Users can only see their own customers" ON customers;
CREATE POLICY "Users can only see their own customers" ON customers FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
-- 5. Updated_at tetikleyicisi
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ language 'plpgsql';
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at BEFORE
UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
CREATE TRIGGER update_settings_updated_at BEFORE
UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- 7. Sipariş numarası üretme fonksiyonu (YYMM-XXXX)
CREATE OR REPLACE FUNCTION generate_order_number() RETURNS TRIGGER AS $$
DECLARE new_order_num TEXT;
year_month TEXT;
random_part TEXT;
BEGIN -- YYMM formatında yıl ve ay al (Örn: 2401)
year_month := to_char(NOW(), 'YYMM');
LOOP -- 4 haneli rastgele sayı üret (1000-9999 arası)
random_part := floor(random() * 9000 + 1000)::TEXT;
new_order_num := year_month || '-' || random_part;
-- Eğer bu numara daha önce yoksa döngüden çık
EXIT
WHEN NOT EXISTS (
    SELECT 1
    FROM orders
    WHERE order_number = new_order_num
);
END LOOP;
NEW.order_number := new_order_num;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Sipariş eklenmeden önce numarayı otomatik üret
DROP TRIGGER IF EXISTS trigger_generate_order_number ON orders;
CREATE TRIGGER trigger_generate_order_number BEFORE
INSERT ON orders FOR EACH ROW
    WHEN (NEW.order_number IS NULL) EXECUTE FUNCTION generate_order_number();
-- 8. Aylık Raporlar Görünümü (View)
CREATE OR REPLACE VIEW monthly_stats AS
SELECT user_id,
    to_char(created_at, 'YYYY-MM') as month_id,
    SUM(price) as total_profit,
    COUNT(id) as total_sales,
    COUNT(DISTINCT customer_name) as unique_customers
FROM orders
GROUP BY user_id,
    month_id;