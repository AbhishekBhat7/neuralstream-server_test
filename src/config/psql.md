*******************************  MOBILE USERS SCHEMA  ************************************************
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO rosettes_neuralstream_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO rosettes_neuralstream_user;
GRANT USAGE ON SCHEMA public TO rosettes_neuralstream_user;

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


session for live data streaming

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE live_sessions (

    session_id UUID PRIMARY KEY
        DEFAULT gen_random_uuid(),

    host_user_id BIGINT NOT NULL,

    device_id BIGINT NOT NULL,

    session_name VARCHAR(100),

    status VARCHAR(20)
        NOT NULL
        DEFAULT 'ACTIVE',

    started_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    ended_at TIMESTAMP,

    FOREIGN KEY(host_user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    FOREIGN KEY(device_id)
        REFERENCES user_devices(device_id)
        ON DELETE CASCADE
);

CREATE INDEX idx_live_sessions_host
ON live_sessions(host_user_id);

CREATE INDEX idx_live_sessions_status
ON live_sessions(status);

session_viewers

CREATE TABLE session_viewers (

    id BIGSERIAL PRIMARY KEY,

    session_id UUID NOT NULL,

    viewer_user_id BIGINT NOT NULL,

    device_id BIGINT NOT NULL,

    status VARCHAR(20)
        DEFAULT 'CONNECTED',

    joined_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    left_at TIMESTAMP,

    FOREIGN KEY(session_id)
        REFERENCES live_sessions(session_id)
        ON DELETE CASCADE,

    FOREIGN KEY(viewer_user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    FOREIGN KEY(device_id)
        REFERENCES user_devices(device_id)
        ON DELETE CASCADE,

    UNIQUE(session_id, device_id)
);

CREATE INDEX idx_session_viewers_session
ON session_viewers(session_id);

CREATE INDEX idx_session_viewers_user
ON session_viewers(viewer_user_id);

CREATE UNIQUE INDEX idx_active_device_session
ON live_sessions(device_id)
WHERE status = 'ACTIVE';

ALTER TABLE live_sessions
ADD CONSTRAINT chk_live_session_status
CHECK (
    status IN ('ACTIVE','ENDED')
);

ALTER TABLE session_viewers
ADD CONSTRAINT chk_viewer_status
CHECK (
    status IN ('CONNECTED','DISCONNECTED')
);
*******************************  MOBILE USERS SCHEMA ENDS ************************************************
