-- Migration script: Chuẩn hóa dữ liệu thành lowercase
-- Chạy script này để update tất cả dữ liệu hiện có thành lowercase

-- ============================================
-- 1. Bảng blockchain_configs
-- ============================================
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'blockchain_configs') THEN
    UPDATE blockchain_configs
    SET 
      name = LOWER(name),
      network = LOWER(network)
    WHERE 
      name != LOWER(name) OR network != LOWER(network);
    
    RAISE NOTICE 'Đã chuẩn hóa bảng blockchain_configs';
  ELSE
    RAISE NOTICE 'Bảng blockchain_configs không tồn tại, bỏ qua';
  END IF;
END $$;

-- ============================================
-- 2. Bảng tokens
-- ============================================
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tokens') THEN
    UPDATE tokens
    SET 
      address = LOWER(address),
      symbol = LOWER(symbol)
    WHERE 
      address != LOWER(address) OR symbol != LOWER(symbol);
    
    RAISE NOTICE 'Đã chuẩn hóa bảng tokens';
  ELSE
    RAISE NOTICE 'Bảng tokens không tồn tại, bỏ qua';
  END IF;
END $$;

-- ============================================
-- 3. Bảng wallets
-- ============================================
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'wallets') THEN
    UPDATE wallets
    SET 
      address = LOWER(address)
    WHERE 
      address != LOWER(address);
    
    RAISE NOTICE 'Đã chuẩn hóa bảng wallets';
  ELSE
    RAISE NOTICE 'Bảng wallets không tồn tại, bỏ qua';
  END IF;
END $$;

-- ============================================
-- Kiểm tra kết quả (optional - có thể comment lại)
-- ============================================
-- SELECT 'blockchain_configs' as table_name, COUNT(*) as updated_count
-- FROM blockchain_configs
-- WHERE name = LOWER(name) AND network = LOWER(network);

-- SELECT 'tokens' as table_name, COUNT(*) as updated_count
-- FROM tokens
-- WHERE address = LOWER(address) AND symbol = LOWER(symbol);

-- SELECT 'wallets' as table_name, COUNT(*) as updated_count
-- FROM wallets
-- WHERE address = LOWER(address);

