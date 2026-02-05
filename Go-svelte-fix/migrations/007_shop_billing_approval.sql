-- 007: Shop billing info + approval system
-- Each shop has its own billing info (can inherit from vendor or be overridden)
-- Shops start as 'pending' and must be approved by admin

-- Add billing fields to shops
ALTER TABLE shops ADD COLUMN IF NOT EXISTS billing_company VARCHAR(255);
ALTER TABLE shops ADD COLUMN IF NOT EXISTS billing_ico VARCHAR(20);
ALTER TABLE shops ADD COLUMN IF NOT EXISTS billing_dic VARCHAR(20);
ALTER TABLE shops ADD COLUMN IF NOT EXISTS billing_ic_dph VARCHAR(25);
ALTER TABLE shops ADD COLUMN IF NOT EXISTS billing_address VARCHAR(500);
ALTER TABLE shops ADD COLUMN IF NOT EXISTS billing_city VARCHAR(100);
ALTER TABLE shops ADD COLUMN IF NOT EXISTS billing_zip VARCHAR(20);
ALTER TABLE shops ADD COLUMN IF NOT EXISTS billing_country VARCHAR(5) DEFAULT 'SK';
ALTER TABLE shops ADD COLUMN IF NOT EXISTS billing_contact_person VARCHAR(255);
ALTER TABLE shops ADD COLUMN IF NOT EXISTS billing_phone VARCHAR(50);
ALTER TABLE shops ADD COLUMN IF NOT EXISTS billing_email VARCHAR(255);

-- Add rejection reason to shops
ALTER TABLE shops ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE shops ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP;
ALTER TABLE shops ADD COLUMN IF NOT EXISTS approved_by VARCHAR(255);

-- Add billing fields to vendors (if not exist)
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS billing_address VARCHAR(500);
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS billing_city VARCHAR(100);
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS billing_zip VARCHAR(20);
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS billing_country VARCHAR(5) DEFAULT 'SK';

-- Make credit_balance on vendor level (shared across shops)
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS credit_balance DECIMAL(10,2) DEFAULT 0;

-- Copy existing shop credits to vendor (one-time migration)
DO $$
BEGIN
    UPDATE vendors v SET credit_balance = (
        SELECT COALESCE(SUM(s.credit_balance), 0) FROM shops s WHERE s.vendor_id = v.id
    ) WHERE v.credit_balance = 0 OR v.credit_balance IS NULL;
END $$;
