export const USER_SPAM_LIMIT_BEFORE_BAN = 2;
export const CALL_QUEUE_EXPIRATION_SECS = 60 * 60;
export const CALL_QUEUE_SAFE_THRESHOLD = 60 * 5;
export const SPAM_BAN_EXPIRAION_SECS = 60 * 5;

export const DEFAULT_FAILED_ATTEMPTS_BAN = 3;

export enum USER_WALLET {
  DEFAULT = 'default',
}

export enum ENV_KEY {
  PORT = 'PORT',
  NODE_ENV = 'NODE_ENV',

  APP_CRYPTO_ADMIN_PIN = 'APP_CRYPTO_ADMIN_PIN',
  APP_CRYPTO_DEFAULT_USER_PIN = 'APP_CRYPTO_DEFAULT_USER_PIN',
  APP_CRYPTO_PRIVATE_KEY = 'APP_CRYPTO_PRIVATE_KEY',

  ADMIN_SECRET_TOKEN = 'ADMIN_SECRET_TOKEN',

  REDIS_HOST = 'REDIS_HOST',
  REDIS_PORT = 'REDIS_PORT',
  REDIS_PASSWORD = 'REDIS_PASSWORD',
  SERVICE_NAME = 'SERVICE_NAME',

  GOOGLE_RECAPTCHA_SECRET = 'GOOGLE_RECAPTCHA_SECRET',
  GOOGLE_RECAPTCHA_VERIFY_ENDPOINT = 'GOOGLE_RECAPTCHA_VERIFY_ENDPOINT',
  GOOGLE_RECAPTCHA_ENABLED = 'GOOGLE_RECAPTCHA_ENABLED',

  AUDIT_WEBHOOK_URL = 'AUDIT_WEBHOOK_URL',
  APP_PUBLIC_URL = 'APP_PUBLIC_URL',

  COMM_GATEWAY_URL = 'COMM_GATEWAY_URL',
  COMM_GATEWAY_SECRET = 'COMM_GATEWAY_SECRET',
  COMM_GATEWAY_ACCOUNT = 'COMM_GATEWAY_ACCOUNT',
  EMAIL_VERIFICATION_TEMPLATE = 'EMAIL_VERIFICATION_TEMPLATE',
  EMAIL_PASSWORD_RESET_TEMPLATE = 'EMAIL_PASSWORD_RESET_TEMPLATE',
  EMAIL_INVESTMENT_VERIFICATION_TEMPLATE = 'EMAIL_INVESTMENT_VERIFICATION_TEMPLATE',
  EMAIL_BANK_DEPOSIT_APPROVED_TEMPLATE = 'EMAIL_BANK_DEPOSIT_APPROVED_TEMPLATE',
  EMAIL_CRYPTO_DEPOSIT_EXECUTED_TEMPLATE = 'EMAIL_CRYPTO_DEPOSIT_EXECUTED_TEMPLATE',
  EMAIL_BANK_DEPOSIT_REJECTED_TEMPLATE = 'EMAIL_BANK_DEPOSIT_REJECTED_TEMPLATE',
  EMAIL_CRYPTO_DEPOSIT_FAILED_TEMPLATE = 'EMAIL_CRYPTO_DEPOSIT_FAILED_TEMPLATE',
  EMAIL_USER_KYC_APPROVED_TEMPLATE = 'EMAIL_USER_KYC_APPROVED_TEMPLATE',
  EMAIL_USER_KYC_REJECTED_TEMPLATE = 'EMAIL_USER_KYC_REJECTED_TEMPLATE',
  EMAIL_PACKAGE_INVESTMENT_INVOICE_TEMPLATE = 'EMAIL_PACKAGE_INVESTMENT_INVOICE_TEMPLATE',
  EMAIL_PACKAGE_INVESTMENT_INVOICE_DOWNLOAD_INSTRUCTION_TEMPLATE = 'EMAIL_PACKAGE_INVESTMENT_INVOICE_DOWNLOAD_INSTRUCTION_TEMPLATE',

  FIRST_USER_USERNAME = 'FIRST_USER_USERNAME',
  FIRST_USER_EMAIL = 'FIRST_USER_EMAIL',

  JWT_SECRET = 'JWT_SECRET',
  JWT_EXPIRATION = 'JWT_EXPIRATION',

  GOOGLE_CLIENT_ID = 'GOOGLE_CLIENT_ID',
  GOOGLE_CLIENT_SECRET = 'GOOGLE_CLIENT_SECRET',
  GOOGLE_CALLBACK_URL = 'GOOGLE_CALLBACK_URL',

  RECIPIENT_ADDRESS = 'RECIPIENT_ADDRESS',

  BALANCE_SERVICE_URL = 'BALANCE_SERVICE_URL',

  BSC_PROVIDER_URL = 'BSC_PROVIDER_URL',
  BSC_CHAIN_ID = 'BSC_CHAIN_ID',
  SYSTEM_PRIVATE_KEY = 'SYSTEM_PRIVATE_KEY',
  USDT_CONTRACT_ADDRESS = 'USDT_CONTRACT_ADDRESS',
  ETH_RPC_URL = 'ETH_RPC_URL',
  ETH_PRIVATE_KEY = 'ETH_PRIVATE_KEY',
  ETH_BLOCKCHAIN_NAME = 'ETH_BLOCKCHAIN_NAME',

  OSS_ACCESS_KEY = 'OSS_ACCESS_KEY',
  OSS_SECRET = 'OSS_SECRET',
  OSS_BUCKET_NAME = 'OSS_BUCKET_NAME',
  OSS_REGION = 'OSS_REGION',
  OSS_API_VERSION = 'OSS_API_VERSION',
  OSS_ROLE_ARN = 'OSS_ROLE_ARN',

  INDEXER_SERVICE_URL = 'INDEXER_SERVICE_URL',
  PARTNER_INDEXER_PRIVATE_KEY = 'PARTNER_INDEXER_PRIVATE_KEY',
  PARTNER_INDEXER_ACCESS_KEY_ID = 'PARTNER_INDEXER_ACCESS_KEY_ID',
  PARTNER_INDEXER_ACCESS_KEY_SECRET = 'PARTNER_INDEXER_ACCESS_KEY_SECRET',

  BCC_EMAIL = 'BCC_EMAIL',

  // API Signature
  API_SECRET_KEY = 'API_SECRET_KEY',
  API_KEY = 'API_KEY',
}

export const ERR_CODE = {
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR'.toLowerCase(),
  INVALID_CAPTCHA_TOKEN: 'INVALID_CAPTCHA_TOKEN'.toLowerCase(),
  NOT_FOUND: 'NOT_FOUND'.toLowerCase(),
  BAD_REQUEST: 'BAD_REQUEST'.toLowerCase(),
  ALREADY_EXISTS: 'ALREADY_EXISTS'.toLowerCase(),
  UNAUTHORIZED: 'UNAUTHORIZED'.toLowerCase(),
  UNPROCESSABLE_ENTITY: 'UNPROCESSABLE_ENTITY'.toLowerCase(),
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS'.toLowerCase(),
  USERNAME_ALREADY_EXISTS: 'USERNAME_ALREADY_EXISTS'.toLowerCase(),
  USER_WALLET_ADDRESS_ALREADY_EXISTS:
    'USER_WALLET_ADDRESS_ALREADY_EXISTS'.toLowerCase(),
  REFERRAL_CODE_NOT_FOUND: 'REFERRAL_CODE_NOT_FOUND'.toLowerCase(),
  EMAIL_NOT_VALID: 'EMAIL_NOT_VALID'.toLowerCase(),
  USER_NOT_FOUND: 'USER_NOT_FOUND'.toLowerCase(),
  ACCOUNT_DEACTIVATED: 'ACCOUNT_DEACTIVATED'.toLowerCase(),
  USER_ALREADY_VERIFIED: 'USER_ALREADY_VERIFIED'.toLowerCase(),
  PASSWORD_INCORRECT: 'PASSWORD_INCORRECT'.toLowerCase(),
  USER_NOT_VERIFIED: 'USER_NOT_VERIFIED'.toLowerCase(),
  FORBIDDEN: 'FORBIDDEN'.toLowerCase(),
  OLD_PASSWORD_AND_NEW_PASSWORD_CANNOT_BE_THE_SAME:
    'OLD_PASSWORD_AND_NEW_PASSWORD_CANNOT_BE_THE_SAME'.toLowerCase(),
  NEW_PASSWORD_AND_OLD_PASSWORD_REQUIRED:
    'NEW_PASSWORD_AND_OLD_PASSWORD_REQUIRED'.toLowerCase(),
  PASSWORD_SAME_AS_OLD: 'PASSWORD_SAME_AS_OLD'.toLowerCase(),
  NEW_PASSWORD_REQUIRED: 'NEW_PASSWORD_REQUIRED'.toLowerCase(),
  PASSWORD_OR_USERNAME_INCORRECT:
    'PASSWORD_OR_USERNAME_INCORRECT'.toLowerCase(),
  KYC_ALREADY_PROCESSED: 'KYC_ALREADY_PROCESSED'.toLowerCase(),
  KYC_IS_PROCESSING: 'KYC_IS_PROCESSING'.toLowerCase(),
  FEATURE_DISABLED: 'FEATURE_DISABLED'.toLowerCase(),
  TRANSACTION_ALREADY_USED_TO_STAKE:
    'TRANSACTION_ALREADY_USED_TO_STAKE'.toLowerCase(),
  WALLET_NOT_LINKED_YET: 'WALLET_NOT_LINKED_YET'.toLowerCase(),
  TRANSACTION_FAILED_OR_NOT_FOUND:
    'TRANSACTION_FAILED_OR_NOT_FOUND'.toLowerCase(),
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS'.toLowerCase(),
  TRANSACTION_HASH_ALREADY_EXISTS:
    'TRANSACTION_HASH_ALREADY_EXISTS'.toLowerCase(),
  INSUFFICIENT_KYC_LEVEL_TO_DEPOSIT:
    'INSUFFICIENT_KYC_LEVEL_TO_DEPOSIT'.toLowerCase(),
  NEW_PASSWORD_MUST_BE_DIFFERENT_FROM_OLD_PASSWORD:
    'NEW_PASSWORD_MUST_BE_DIFFERENT_FROM_OLD_PASSWORD'.toLowerCase(),
  INVALID_PASSWORD_FORMAT: 'INVALID_PASSWORD_FORMAT'.toLowerCase(),
  PASSCODE_NOT_EXISTS: 'PASSCODE_NOT_EXISTS'.toLowerCase(),
  PASSCODE_INVALID: 'PASSCODE_INVALID'.toLowerCase(),
  OLD_PASSWORD_INCORRECT: 'OLD_PASSWORD_INCORRECT'.toLowerCase(),
  STATUS_KYC_PROCESSED: 'STATUS_KYC_PROCESSED'.toLowerCase(),
  SAS_NOT_FOUND: 'SAS_NOT_FOUND'.toLowerCase(),
  PACKAGE_NOT_FOUND: 'PACKAGE_NOT_FOUND'.toLowerCase(),
  SAS_PROJECT_IS_NOT_OPEN: 'SAS_PROJECT_IS_NOT_OPEN'.toLowerCase(),
  SAS_PROJECT_IS_FULL: 'SAS_PROJECT_IS_FULL'.toLowerCase(),
  PACKAGE_IS_NOT_ACTIVE: 'PACKAGE_IS_NOT_ACTIVE'.toLowerCase(),
  INVALID_OTP: 'INVALID_OTP'.toLowerCase(),
  INVESTMENT_ALREADY_VERIFIED: 'INVESTMENT_ALREADY_VERIFIED'.toLowerCase(),
  OTP_ALREADY_SENT: 'OTP_ALREADY_SENT'.toLowerCase(),
  DEPOSIT_PROCESSED: 'DEPOSIT_PROCESSED'.toLowerCase(),
  USER_NOT_FOUND_OR_BANNED: 'USER_NOT_FOUND_OR_BANNED'.toLowerCase(),
  ANTI_PHISHING_CODE_SAME_AS_OLD:
    'ANTI_PHISHING_CODE_SAME_AS_OLD'.toLowerCase(),
  ANTI_PHISHING_CODE_INVALID: 'ANTI_PHISHING_CODE_INVALID'.toLowerCase(),
  KYC_PHONE_IS_EXISTED: 'KYC_PHONE_IS_EXISTED'.toLowerCase(),
  KYC_NATIONAL_ID_IS_EXISTED: 'KYC_NATIONAL_ID_IS_EXISTED'.toLowerCase(),
  PACKAGE_INVESTOR_NOT_FOUND: 'PACKAGE_INVESTOR_NOT_FOUND'.toLowerCase(),
  INVESTMENT_USER_MISMATCH: 'INVESTMENT_USER_MISMATCH'.toLowerCase(),
};

export enum HEADER_KEY {
  CAPTCHA_TOKEN = 'X-Captcha-Token',
  LOG_ID = 'X-Log-ID',
  SESSION_TOKEN = 'X-Session-Token',
  ACCESS_KEY_ID = 'X-Access-Key-ID',
  ACCESS_KEY_SECRET = 'X-Access-Key-Secret',
  ALIX_PAY_ACCESS_TOKEN = 'Access-Token',
  PAYLOAD_SIGNATURE = 'X-Payload-Signature',
  PARTNER_ACCESS_SECRET = 'X-Partner-Access-Secret',
  AUTHORIZATION = 'AUTHORIZATION',
  X_DATA_SIGNATURE = 'X-Data-Signature',
  X_REQUEST_LANGUAGE = 'X-Request-Language',
  REF_CODE = 'X-Ref-Code',
}

export const INJECTION_TOKEN = {
  CRYPTO_BANK_SERVICE: Symbol.for('CRYPTO_BANK_SERVICE'),
  BSC_WEB3_GATEWAY: Symbol.for('BSC_WEB3_GATEWAY'),
  AUDIT_SERVICE: Symbol.for('AUDIT_SERVICE'),
  HTTP_SERVICE: Symbol.for('HTTP_SERVICE'),
  REDIS_SERVICE: Symbol.for('REDIS_SERVICE'),
  SYNC_TASK_QUEUE: Symbol.for('SYNC_TASK_QUEUE'),
  BLOCKCHAIN_SERVICE: Symbol.for('BLOCKCHAIN_SERVICE'),
  ETH_PROVIDER: Symbol.for('ETH_PROVIDER'),
  ETH_WALLET: Symbol.for('ETH_WALLET'),
};

export const APP_ACTION = {
  BAN_TOO_MANY_FAILED_ATTEMPTS: 'BAN_TOO_MANY_FAILED_ATTEMPTS'.toLowerCase(),
  HANDLE_EXCEPTION: 'HANDLE_EXCEPTION'.toLowerCase(),
  API_CALL: 'API_CALL'.toLowerCase(),
  SEND_HTTP_REQUEST: 'SEND_HTTP_REQUEST'.toLowerCase(),
  REGISTER: 'REGISTER'.toLowerCase(),
  LOGIN: 'LOGIN'.toLowerCase(),
  FORGOT_PASSWORD: 'FORGOT_PASSWORD'.toLowerCase(),
  CHANGE_PASSWORD: 'CHANGE_PASSWORD'.toLowerCase(),
  SOCIAL_LOGIN: 'SOCIAL_LOGIN'.toLowerCase(),
  GET_USER_BALANCE_HISTORY: 'GET_USER_BALANCE_HISTORY'.toLowerCase(),
  VIEW_TRANSFER_WALLET_HISTORY: 'VIEW_TRANSFER_WALLET_HISTORY'.toLowerCase(),
  GET_USER_BALANCE: 'GET_USER_BALANCE'.toLowerCase(),
  GET_ALL_BULK_BALANCE: 'GET_ALL_BULK_BALANCE'.toLowerCase(),
  GET_BULK_USER_BALANCES: 'GET_BULK_USER_BALANCES'.toLowerCase(),
  EXEC_BULK_BALANCE_OPERATIONS: 'EXEC_BULK_BALANCE_OPERATIONS'.toLowerCase(),
  SEND_CREDIT_REQUEST: 'SEND_CREDIT_REQUEST'.toLowerCase(),
  SEND_DEBIT_REQUEST: 'SEND_DEBIT_REQUEST'.toLowerCase(),
  HANDLE_USER_DEPOSIT_CRYPTO: 'HANDLE_USER_DEPOSIT_CRYPTO'.toLowerCase(),
  CLEAN_TX_OUTBOX: 'CLEAN_TX_OUTBOX'.toLowerCase(),
  PUBLISH_KAFKA_MESSAGE: 'PUBLISH_KAFKA_MESSAGE'.toLowerCase(),
  TRANSFER_USDT_FROM_POOL: 'TRANSFER_USDT_FROM_POOL'.toLowerCase(),
  CREATE_PASSCODE: 'CREATE_PASSCODE'.toLowerCase(),
  UPDATE_PASSCODE: 'UPDATE_PASSCODE'.toLowerCase(),
  HANDLE_OTP_ATTEMPT: 'HANDLE_OTP_ATTEMPT'.toLowerCase(),
  HANDLE_ANTI_PHISHING_CODE_ATTEMPT:
    'HANDLE_ANTI_PHISHING_CODE_ATTEMPT'.toLowerCase(),
  APPROVE_KYC_REQUEST: 'APPROVE_KYC_REQUEST'.toLowerCase(),
  REJECT_KYC_REQUEST: 'REJECT_KYC_REQUEST'.toLowerCase(),
  CREATE_SAS: 'CREATE_SAS'.toLowerCase(),
  UPDATE_SAS: 'UPDATE_SAS'.toLowerCase(),
  DELETE_SAS: 'DELETE_SAS'.toLowerCase(),
  CREATE_PACKAGE: 'CREATE_PACKAGE'.toLowerCase(),
  UPDATE_PACKAGE: 'UPDATE_PACKAGE'.toLowerCase(),
  DELETE_PACKAGE: 'DELETE_PACKAGE'.toLowerCase(),
  CREATE_PROCESS: 'CREATE_PROCESS'.toLowerCase(),
  UPDATE_PROCESS: 'UPDATE_PROCESS'.toLowerCase(),
  DELETE_PROCESS: 'DELETE_PROCESS'.toLowerCase(),
  CREATE_SAS_CONFIG: 'CREATE_SAS_CONFIG'.toLowerCase(),
  UPDATE_SAS_CONFIG: 'UPDATE_SAS_CONFIG'.toLowerCase(),
  DELETE_SAS_CONFIG: 'DELETE_SAS_CONFIG'.toLowerCase(),
  CREATE_SAS_DETAIL: 'CREATE_SAS_DETAIL'.toLowerCase(),
  UPDATE_SAS_DETAIL_FIELDS: 'UPDATE_SAS_DETAIL_FIELDS'.toLowerCase(),
  DELETE_SAS_DETAIL: 'DELETE_SAS_DETAIL'.toLowerCase(),
  CREATE_PARTNER_USER: 'CREATE_PARTNER_USER'.toLowerCase(),
};

export enum APP_EVENTS {
  USER_INVESTMENT_COMPLETED = 'user_investment.completed',
  PAID_COMMISSION_COMPLETED = 'paid_commission.completed',
}

export enum METADATA_KEY {
  MAX_CONCURRENCY_CALL = 'max_concurrency_call',
  RATE_LIMITING = 'rate_limiting',
  USER_ID_EXTRACTOR = 'user_id_extractor',
  MAX_ATTEMPTS_ALLOWED = 'max_attempts_allowed',
}

export const DEFAULT_MAX_CONCURRENT_CALL = 1;
export const MAX_SEND_EMAIL_RECORDS_PER_MINUTE = 2;

export const TTL_1_HOUR = 60 * 60;
export const TTL_1_DAY = 24 * 60 * 60;
export const TTL_2_MINUTES = 2 * 60;
export const TTL_3_MINUTES = 3 * 60;
export const TTL_5_MINUTES = 5 * 60;

export enum GATEWAYS_ACCOUNT {
  DEFAULT_ACCOUNT = 'defaultaccount',
}

export enum EMAIL_TEMPLATE {
  EXAMPLE_VERIFY = 'example-verify',
  EXAMPLE_FORGOT = 'example-forgot',

  BRICKIMMO_VERIFY_INVEST = 'brickimmo/auth/otp',

  BRICKIMMO_BANK_DEPOSIT_APPROVED = 'brickimmo/bank-deposit/approved',
  BRICKIMMO_BANK_DEPOSIT_REJECTED = 'brickimmo/bank-deposit/rejected',

  BRICKIMMO_CRYPTO_DEPOSIT_EXECUTED = 'brickimmo/crypto-deposit/executed',
  BRICKIMMO_CRYPTO_DEPOSIT_FAILED = 'brickimmo/crypto-deposit/failed',

  BRICKIMMO_USER_KYC_APPROVED = 'brickimmo/kyc/successful',
  BRICKIMMO_USER_KYC_REJECTED = 'brickimmo/kyc/failed',

  BRICKIMMO_PACKAGE_INVESTMENT_INVOICE = 'brickimmo/package-investment/invoice',
  BRICKIMMO_PACKAGE_INVESTMENT_INVOICE_DOWNLOAD_INSTRUCTION = 'brickimmo/package-investment/invoice-download-instruction',
}

export enum ENTITY_STATUS {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  INACTIVE = 'inactive',
  DELETED = 'deleted',
}

export enum SOCIAL_PROVIDER {
  GOOGLE = 'google',
}

export enum KYC_IMAGE_TYPE {
  FRONT_CERTIFICATE = 'front_certificate',
  BACK_CERTIFICATE = 'back_certificate',
  SELFIE_ONLY = 'selfie_only',
  SELFIE_WITH_NATIONAL_ID = 'selfie_with_national_id',
  SELFIE_VIDEO = 'selfie_video',
  UTILITY_BILL = 'utility_bill',
  BANK_STATEMENT = 'bank_statement',
  TAX_NOTICE_GOVERNMENT = 'tax_notice_government',
  FINANCIAL_DOCUMENT = 'financial_document',
}

export enum KYC_STATUS {
  APPROVED = 'approved',
  PENDING = 'pending',
  REJECTED = 'rejected',
}

export enum APP_CURRENCY {
  EUR = 'eur',
  EURV = 'eurv',
  USDT = 'usdt',
  USDC = 'usdc',
}

export enum LANGUAGE {
  VI = 'vi',
  EN = 'en',
  FR = 'fr',
}

export enum BLOCKCHAIN_NETWORK {
  BSC = 'bsc',
  BSC_TESTNET = 'bsc_testnet',
  VNC = 'vnc',
}

export enum BALANCE_ACTION {
  CREDIT = 'credit',
  DEBIT = 'debit',
  ADMIN_CREDIT = 'admin_credit',
  ADMIN_DEBIT = 'admin_debit',
  LOCK = 'lock',
  ROLLBACK = 'rollback',
  CRYPTO_DEPOSIT = 'crypto_deposit',
  CRYPTO_WITHDRAW = 'crypto_withdraw',
  SETTLE_ORDER_PAYMENT = 'settle_order_payment',
  MOVE_BALANCE_BETWEEN_WALLETS = 'move_balance_between_wallets',
  LOAN_BET = 'loan_bet',
  LOAN_REPAYMENT = 'loan_payment',
  SWAP = 'swap',
  APPROVE_SWAP = 'approve_swap',
  REJECT_SWAP = 'reject_swap',
  PARTNER_DEPOSIT = 'partner_deposit',
  PURCHASE_PACKAGE = 'purchase_package',
  BANK_TRANSFER = 'bank_transfer',
  PAY_BRANCH_COMMISSION = 'pay_branch_commission',
  DEPOSIT_ONCHAIN = 'deposit_onchain',
}

export enum BALANCE_HISTORY_STATUS {
  COMPLETED = 'completed',
  PENDING = 'pending',
  FAILED = 'failed',
}

export const TransferrableCurrencies = [APP_CURRENCY.EURV];

export enum BLOCKCHAIN_CALL_STATUS {
  UNDER_REVIEW = 'under_review',
  SCHEDULED = 'scheduled',
  EXECUTED = 'executed',
  FAILED = 'failed',
  REJECTED = 'rejected',
}

export enum SYSTEM_CONFIG {
  DEPOSIT = 'deposit',
  BANK_DEPOSIT = 'bank_deposit',
  EXCHANGE_RATE = 'exchange_rate',
  REFERRAL_COMMISSION = 'referral_commission',
}

export enum FEE_UNIT {
  PERCENTAGE = 'percentage',
  VALUE = 'value',
}

export enum ORDER_FEE {
  OVERNIGHT = 'overnight',
  PLACE_BET = 'place_bet',
  WITHDRAW = 'withdraw',
}

export enum CONTRACT_TYPE {
  BEP20 = 'bep20',
  CUSTOM = 'custom',
  ERC20 = 'erc20',
  ARD_MEDIATOR_V3 = 'card_mediator_v3',
}

export const DEFAULT_TX_TIMEOUT = 30000;

export enum KYC_LEVEL {
  LEVEL_0 = 0,
  LEVEL_1 = 1,
}

export const KYC_PERMISSIONS = {
  [KYC_LEVEL.LEVEL_0]: {
    canDeposit: false,
  },
  [KYC_LEVEL.LEVEL_1]: {
    canDeposit: true,
  },
  default: {
    canDeposit: false,
  },
};

export const TTL_10_MINUTES = 10 * 60;

export enum BANK_DEPOSIT_STATUS {
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

export enum USER_TYPE {
  MARKETING = 'marketing',
  MANAGER = 'manager',
  USER = 'user',
  GUEST = 'guest',
}

// ============== SAS ENUMS ==============

/**
 * SAS Status - Trạng thái của dự án SAS
 * UI Reference: Badge trên card và detail page
 */
export enum SAS_STATUS {
  DRAFT = 'draft', // Đang soạn thảo
  UPCOMING = 'upcoming', // Sắp mở (Opens in 4 days)
  FUNDRAISING = 'fundraising', // Đang gọi vốn (Fundraising Opens)
  FUNDED = 'funded', // Đã đạt mục tiêu (100% funded)
  IN_PROGRESS = 'in_progress', // Đang thực hiện dự án (Acquisition, Renovation)
  COMPLETED = 'completed', // Hoàn thành (Payout done)
  CANCELLED = 'cancelled', // Hủy bỏ
}

export const SAS_ACTIVE = [
  SAS_STATUS.FUNDRAISING,
  SAS_STATUS.FUNDED,
  SAS_STATUS.IN_PROGRESS,
];

/**
 * Property Type - Loại bất động sản
 * UI Reference: "1 House" section trên Overview tab
 */
export enum PROPERTY_TYPE {
  APARTMENT = 'apartment', // Căn hộ
  HOUSE = 'house', // Nhà (Example: "1 House")
  STUDIO = 'studio', // Studio
  COMMERCIAL = 'commercial', // Thương mại
  LAND = 'land', // Đất
  MIXED_USE = 'mixed_use', // Hỗn hợp
}

/**
 * Payout Frequency - Tần suất chi trả lợi nhuận
 * UI Reference: "Payout: Monthly" trong Overview tab
 */
export enum PAYOUT_FREQUENCY {
  MONTHLY = 'monthly', // Hàng tháng (Example: "Monthly")
  QUARTERLY = 'quarterly', // Hàng quý
  YEARLY = 'yearly', // Hàng năm
  AT_EXIT = 'at_exit', // Khi thoát (bán tài sản)
}

/**
 * Process Phase - Các giai đoạn trong Investment Roadmap
 * UI Reference: Investment Roadmap section trong Overview tab
 */
export enum PROCESS_PHASE {
  UPCOMING = 'upcoming', // Phase 1: Upcoming
  FUNDRAISING_OPENS = 'fundraising_opens', // Phase 2: Fundraising Opens
  FUNDRAISING_END = 'fundraising_end', // Phase 3: Fundraising End
  LEGAL_REVIEW = 'legal_review', // Phase 4: Legal Review
  ACQUISITION = 'acquisition', // Phase 5: Acquisition
  RENOVATION = 'renovation', // Phase 6: Renovation
  SELL_OR_LEASE = 'sell_or_lease', // Phase 7: Sell or Lease
  PAYOUT = 'payout', // Phase 8: Payout
}

/**
 * Process Status - Trạng thái của từng phase
 */
export enum PROCESS_STATUS {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum COMMISSION_TYPE {
  BRANCH = 'branch',
}

export enum COMMISSION_PAYOUT_STATUS {
  PENDING = 'pending',
  FAILED = 'failed',
  PAID = 'paid',
  NOT_PAID = 'not_paid',
  ACCRUED = 'accrued',
}

export const PAID_COMMISSION = [
  COMMISSION_PAYOUT_STATUS.PAID,
  COMMISSION_PAYOUT_STATUS.ACCRUED,
  COMMISSION_PAYOUT_STATUS.PENDING,
];

export enum HISTORY_FAIL_REASON {
  FAILED_TO_DEBIT = 'failed_to_debit',
  FAILED_TO_CREDIT = 'failed_to_credit',
}

export enum PACKAGE_SIGN_STATUS {
  NOT_SIGNED = 'not_signed',
  SIGNED = 'signed',
}

export const DEFAULT_SETTINGS = {
  document_language: 'en',
  email_language: 'en',
};
