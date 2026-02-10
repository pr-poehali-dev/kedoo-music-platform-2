CREATE TABLE releases (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    album_name VARCHAR(255) NOT NULL,
    artists TEXT NOT NULL,
    cover_url TEXT,
    upc VARCHAR(50),
    old_release_date DATE,
    is_rerelease BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'draft',
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_status CHECK (status IN ('draft', 'on_moderation', 'accepted', 'rejected'))
);

CREATE INDEX idx_releases_user_id ON releases(user_id);
CREATE INDEX idx_releases_status ON releases(status);