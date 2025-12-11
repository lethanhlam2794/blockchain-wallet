# Ether NestJS API

Ứng dụng NestJS với Swagger và hỗ trợ Ethereum (ether.js).

## Tính năng

- ✅ Swagger API Documentation
- ✅ Ethereum integration với ethers.js
- ✅ Quản lý wallet
- ✅ Gửi và theo dõi transactions
- ✅ Utilities cho Ethereum
- ✅ Blockchain Config Management (lưu RPC URL, Chain ID vào database)

## Cài đặt

```bash
yarn install
```

## Cấu hình

Tạo file `.local.env` (ưu tiên) hoặc `.env`:

```bash
cp .env.example .local.env  # nếu bạn có sẵn .env.example
```

Cấu hình các biến môi trường:

- `PORT`: Port chạy ứng dụng (mặc định: 3000)
- `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_SCHEMA`
- `DB_SYNCHRONIZE`: `true/false` (chỉ bật trên dev)
- `DB_LOGGING`: `true/false`
- `ETH_BLOCKCHAIN_NAME`: Tên blockchain config trong DB (mặc định: `ethereum`)
- `ETH_RPC_URL`: Fallback RPC URL nếu không tìm thấy trong DB (mặc định: https://eth.llamarpc.com)
- `ETH_PRIVATE_KEY`: Private key cho wallet (optional)

### Setup Blockchain Configs

Sau khi setup database, chạy file seed để insert dữ liệu mẫu:

```bash
psql -h $DB_HOST -U $DB_USERNAME -d $DB_SCHEMA -f src/modules/blockchain-config/seed.sql
```

Hoặc tạo config qua API:

```bash
POST /blockchain-configs
{
  "name": "ethereum",
  "displayName": "Ethereum Mainnet",
  "rpcUrl": "https://eth.llamarpc.com",
  "chainId": 1,
  "network": "mainnet",
  "nativeCurrency": "Ether",
  "currencySymbol": "ETH",
  "blockTime": 12,
  "explorerUrl": "https://etherscan.io"
}
```

## Chạy ứng dụng

```bash
# Development
yarn start:dev

# Production
yarn build
yarn start:prod
```

## Swagger Documentation

Sau khi chạy ứng dụng, truy cập Swagger tại:

```
http://localhost:3000/api
```

## API Endpoints

### Wallet

- `POST /ether/wallet/set` - Thiết lập wallet từ private key
- `GET /ether/wallet/balance` - Lấy số dư của wallet hiện tại

### Balance

- `GET /ether/balance/:address` - Lấy số dư của một địa chỉ

### Transaction

- `POST /ether/transaction/send` - Gửi ETH transaction
- `GET /ether/transaction/:hash` - Lấy thông tin transaction
- `GET /ether/transaction/:hash/receipt` - Lấy transaction receipt

### Block

- `GET /ether/block/number` - Lấy block number hiện tại
- `GET /ether/block/:number` - Lấy thông tin block

### Utilities

- `GET /ether/validate-address/:address` - Validate địa chỉ Ethereum
- `GET /ether/utils/parse-ether?amount=0.1` - Chuyển đổi ETH sang Wei
- `GET /ether/utils/format-ether?amount=100000000000000000` - Chuyển đổi Wei sang ETH

### Blockchain Config Management

- `POST /blockchain-configs` - Tạo blockchain config mới
- `GET /blockchain-configs` - Lấy tất cả configs active
- `GET /blockchain-configs/:id` - Lấy config theo ID
- `GET /blockchain-configs/name/:name` - Lấy config theo name
- `GET /blockchain-configs/chain-id/:chainId` - Lấy config theo chain ID
- `PATCH /blockchain-configs/:id` - Cập nhật config
- `DELETE /blockchain-configs/:id` - Xóa config (soft delete)

## Cấu trúc dự án

```
src/
├── main.ts                 # Entry point với Swagger setup
├── app.module.ts          # Root module
├── modules/
│   ├── blockchain-config/ # Blockchain config management
│   │   ├── entities/
│   │   │   └── blockchain-config.entity.ts
│   │   ├── dto/
│   │   ├── blockchain-config.service.ts
│   │   ├── blockchain-config.controller.ts
│   │   ├── blockchain-config.module.ts
│   │   └── seed.sql       # Seed data mẫu
│   └── ether/
│       ├── ether.module.ts
│       ├── ether.service.ts
│       ├── ether.controller.ts
│       └── dto/
└── shared/                # Shared utilities, constants, models
```

## Scripts

- `yarn build` - Build ứng dụng
- `yarn start:dev` - Chạy development mode với watch
- `yarn start:prod` - Chạy production mode
- `yarn lint` - Chạy linter
- `yarn test` - Chạy tests
# blockchain-wallet
