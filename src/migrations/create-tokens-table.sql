-- Migration script: Tạo bảng tokens
-- Chạy script này để tạo bảng tokens nếu chưa tồn tại

-- ============================================
-- Tạo bảng tokens
-- ============================================
CREATE TABLE IF NOT EXISTS tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  address VARCHAR(255) NOT NULL,
  symbol VARCHAR(50) NOT NULL,
  name VARCHAR(100),
  decimals INT NOT NULL DEFAULT 18,
  chain_id BIGINT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  label VARCHAR(100),
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP,
  
  -- Unique constraint: mỗi address + chainId chỉ tồn tại 1 lần
  CONSTRAINT UQ_tokens_address_chain_id UNIQUE (address, chain_id)
);

-- ============================================
-- Tạo indexes
-- ============================================
-- Index cho status và chainId (để query nhanh)
CREATE INDEX IF NOT EXISTS IDX_tokens_status_chainId ON tokens (status, chain_id);

-- Index cho symbol (để tìm kiếm theo symbol)
CREATE INDEX IF NOT EXISTS IDX_tokens_symbol ON tokens (symbol);

-- Index cho created_at (từ Audit model)
CREATE INDEX IF NOT EXISTS IDX_tokens_created_at ON tokens (created_at);

-- ============================================
-- Comments
-- ============================================
COMMENT ON TABLE tokens IS 'Bảng lưu thông tin các ERC20 tokens đã import';
COMMENT ON COLUMN tokens.address IS 'Địa chỉ contract của token';
COMMENT ON COLUMN tokens.symbol IS 'Symbol của token (ví dụ: USDT, USDC)';
COMMENT ON COLUMN tokens.name IS 'Tên đầy đủ của token';
COMMENT ON COLUMN tokens.decimals IS 'Số decimals của token (mặc định: 18)';
COMMENT ON COLUMN tokens.chain_id IS 'Chain ID của blockchain (phải tồn tại trong blockchain_configs)';
COMMENT ON COLUMN tokens.status IS 'Trạng thái: active, inactive';
COMMENT ON COLUMN tokens.label IS 'Nhãn tùy chỉnh cho token';
COMMENT ON COLUMN tokens.description IS 'Mô tả về token';
COMMENT ON COLUMN tokens.metadata IS 'Metadata bổ sung dạng JSON';

