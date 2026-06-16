*******************************  MOBILE USERS SCHEMA  ************************************************

Auth Table creation :

CREATE TABLE users (
    user_id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT,
    firebase_uid VARCHAR(255) UNIQUE,
    account_status VARCHAR(20) DEFAULT 'active'
        CHECK (account_status IN ('active', 'suspended', 'deleted')),
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

Devices table:
CREATE TABLE user_devices (
    device_id BIGSERIAL PRIMARY KEY,

    user_id BIGINT NOT NULL
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    device_fingerprint VARCHAR(255) NOT NULL,

    device_name VARCHAR(255),
    platform VARCHAR(100),
    browser VARCHAR(100),

    ip_address INET,
    last_active_at TIMESTAMPTZ DEFAULT NOW(),

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id, device_fingerprint)
);

token

CREATE TABLE refresh_tokens (
    token_id BIGSERIAL PRIMARY KEY,

    user_id BIGINT NOT NULL
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    device_id BIGINT NOT NULL
        REFERENCES user_devices(device_id)
        ON DELETE CASCADE,

    token_hash TEXT NOT NULL,

    expires_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    revoked BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

*******************************  MOBILE USERS SCHEMA ENDS ************************************************
