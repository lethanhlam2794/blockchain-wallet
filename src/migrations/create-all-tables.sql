-- Migration: Create all tables for Ether NestJS API
-- Run this SQL script to create all necessary database tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: system_users
CREATE TABLE IF NOT EXISTS system_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) NOT NULL UNIQUE,
    "fullName" VARCHAR(255),
    role VARCHAR(50) DEFAULT 'operator',
    status VARCHAR(20) DEFAULT 'active',
    "createdBy" VARCHAR(100),
    "updatedBy" VARCHAR(100),
    "deletedBy" VARCHAR(100),
    password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_system_users_username ON system_users(username);
CREATE INDEX IF NOT EXISTS idx_system_users_created_at ON system_users(created_at);

-- Table: users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(100),
    username VARCHAR(30) NOT NULL,
    password TEXT NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    status VARCHAR(20) DEFAULT 'active',
    is_verified BOOLEAN DEFAULT false,
    passcode TEXT,
    token VARCHAR(255),
    wallet_address VARCHAR(255) UNIQUE,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    CONSTRAINT users_email_unique UNIQUE (email),
    CONSTRAINT users_username_unique UNIQUE (username)
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Table: wallets
CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    address VARCHAR(255) NOT NULL UNIQUE,
    private_key TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    label VARCHAR(100),
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    CONSTRAINT fk_wallets_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_wallets_status_address ON wallets(status, address);
CREATE UNIQUE INDEX IF NOT EXISTS idx_wallets_address_unique ON wallets(address);

-- Table: tokens
CREATE TABLE IF NOT EXISTS tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    address VARCHAR(255) NOT NULL,
    symbol VARCHAR(50) NOT NULL,
    name VARCHAR(100),
    decimals INTEGER DEFAULT 18,
    chain_id BIGINT NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    label VARCHAR(100),
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    CONSTRAINT tokens_address_chainid_unique UNIQUE (address, chain_id)
);

CREATE INDEX IF NOT EXISTS idx_tokens_status_chainid ON tokens(status, chain_id);
CREATE INDEX IF NOT EXISTS idx_tokens_symbol ON tokens(symbol);
CREATE INDEX IF NOT EXISTS idx_tokens_created_at ON tokens(created_at);

-- Table: system_roles
CREATE TABLE IF NOT EXISTS system_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    "isSuperAdmin" BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_system_roles_name ON system_roles(name);
CREATE INDEX IF NOT EXISTS idx_system_roles_created_at ON system_roles(created_at);

-- Table: system_entities
CREATE TABLE IF NOT EXISTS system_entities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_system_entities_name ON system_entities(name);
CREATE INDEX IF NOT EXISTS idx_system_entities_created_at ON system_entities(created_at);

-- Table: entity_permissions
CREATE TABLE IF NOT EXISTS entity_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_entity_permissions_name ON entity_permissions(name);
CREATE INDEX IF NOT EXISTS idx_entity_permissions_created_at ON entity_permissions(created_at);

-- Table: role_permissions
CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "roleName" VARCHAR(100) NOT NULL,
    "entityName" VARCHAR(100) NOT NULL,
    permissions TEXT[] NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    CONSTRAINT role_permissions_role_entity_unique UNIQUE ("roleName", "entityName")
);

CREATE INDEX IF NOT EXISTS idx_role_permissions_rolename ON role_permissions("roleName");
CREATE INDEX IF NOT EXISTS idx_role_permissions_entityname ON role_permissions("entityName");
CREATE INDEX IF NOT EXISTS idx_role_permissions_created_at ON role_permissions(created_at);

-- Table: user_role_permissions
CREATE TABLE IF NOT EXISTS user_role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID NOT NULL,
    "entityName" VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL,
    permissions TEXT[] NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    CONSTRAINT user_role_permissions_user_entity_type_unique UNIQUE ("userId", "entityName", type)
);

CREATE INDEX IF NOT EXISTS idx_user_role_permissions_userid ON user_role_permissions("userId");
CREATE INDEX IF NOT EXISTS idx_user_role_permissions_entityname ON user_role_permissions("entityName");
CREATE INDEX IF NOT EXISTS idx_user_role_permissions_created_at ON user_role_permissions(created_at);

-- Table: blockchain_configs
CREATE TABLE IF NOT EXISTS blockchain_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(255) NOT NULL,
    rpc_url TEXT NOT NULL,
    chain_id BIGINT NOT NULL,
    network VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    native_currency VARCHAR(255),
    currency_symbol VARCHAR(10),
    block_time INTEGER,
    explorer_url TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_blockchain_configs_status_name ON blockchain_configs(status, name);
CREATE INDEX IF NOT EXISTS idx_blockchain_configs_created_at ON blockchain_configs(created_at);

-- Table: blockchain_calls
CREATE TABLE IF NOT EXISTS blockchain_calls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    signature_type VARCHAR(20) NOT NULL,
    backend_method VARCHAR(10) NOT NULL,
    backend_path VARCHAR(500) NOT NULL,
    wallet_address VARCHAR(255),
    signature TEXT,
    timestamp BIGINT,
    request_body JSONB,
    request_query JSONB,
    request_headers JSONB,
    status VARCHAR(50) DEFAULT 'scheduled',
    backend_response TEXT,
    backend_status_code INTEGER,
    error_message TEXT,
    ref_code VARCHAR(255),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_blockchain_calls_status ON blockchain_calls(status);
CREATE INDEX IF NOT EXISTS idx_blockchain_calls_wallet_address ON blockchain_calls(wallet_address);
CREATE INDEX IF NOT EXISTS idx_blockchain_calls_backend_path ON blockchain_calls(backend_path, backend_method);
CREATE INDEX IF NOT EXISTS idx_blockchain_calls_created_at ON blockchain_calls(created_at);
CREATE INDEX IF NOT EXISTS idx_blockchain_calls_ref_code ON blockchain_calls(ref_code);

-- Comments
COMMENT ON TABLE system_users IS 'System administrators and operators';
COMMENT ON TABLE users IS 'Application users';
COMMENT ON TABLE wallets IS 'EVM wallets for users';
COMMENT ON TABLE tokens IS 'ERC20 tokens configuration';
COMMENT ON TABLE system_roles IS 'System roles (super_admin, admin, operator, user)';
COMMENT ON TABLE system_entities IS 'System entities for permission management';
COMMENT ON TABLE entity_permissions IS 'Available permissions for entities';
COMMENT ON TABLE role_permissions IS 'Permissions assigned to roles';
COMMENT ON TABLE user_role_permissions IS 'Custom permissions for specific users';
COMMENT ON TABLE blockchain_configs IS 'Blockchain network configurations';
COMMENT ON TABLE blockchain_calls IS 'Log of blockchain API calls';

