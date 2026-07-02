 
CREATE TABLE live_sessions (

    session_id BIGSERIAL PRIMARY KEY , 
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






CREATE TABLE session_viewers (

    id BIGSERIAL PRIMARY KEY,

    session_id BIGINT NOT NULL,

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