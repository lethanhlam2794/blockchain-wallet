-- Seed data cho blockchain configs
-- Chạy file này để insert dữ liệu mẫu vào database

INSERT INTO blockchain_configs (
  id,
  name,
  display_name,
  rpc_url,
  chain_id,
  network,
  status,
  native_currency,
  currency_symbol,
  block_time,
  explorer_url,
  metadata,
  created_at,
  updated_at
) VALUES
  (
    gen_random_uuid(),
    'ethereum',
    'Ethereum Mainnet',
    'https://eth.llamarpc.com',
    1,
    'mainnet',
    'active',
    'Ether',
    'ETH',
    12,
    'https://etherscan.io',
    '{"isTestnet": false}'::jsonb,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    'ethereum-sepolia',
    'Ethereum Sepolia Testnet',
    'https://rpc.sepolia.org',
    11155111,
    'sepolia',
    'active',
    'Ether',
    'ETH',
    12,
    'https://sepolia.etherscan.io',
    '{"isTestnet": true}'::jsonb,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    'bsc',
    'Binance Smart Chain',
    'https://bsc-dataseed1.binance.org',
    56,
    'mainnet',
    'active',
    'BNB',
    'BNB',
    3,
    'https://bscscan.com',
    '{"isTestnet": false}'::jsonb,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    'bsc-testnet',
    'BSC Testnet',
    'https://data-seed-prebsc-1-s1.binance.org:8545',
    97,
    'testnet',
    'active',
    'BNB',
    'BNB',
    3,
    'https://testnet.bscscan.com',
    '{"isTestnet": true}'::jsonb,
    NOW(),
    NOW()
  )
ON CONFLICT (name) DO NOTHING;

