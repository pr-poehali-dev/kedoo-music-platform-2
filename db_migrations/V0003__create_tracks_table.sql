CREATE TABLE tracks (
    id SERIAL PRIMARY KEY,
    release_id INTEGER REFERENCES releases(id),
    track_name VARCHAR(255) NOT NULL,
    artists TEXT NOT NULL,
    audio_url TEXT,
    isrc VARCHAR(50),
    version VARCHAR(50) DEFAULT 'Original',
    musicians TEXT,
    lyricists TEXT,
    tiktok_moment VARCHAR(10),
    has_explicit BOOLEAN DEFAULT FALSE,
    has_lyrics BOOLEAN DEFAULT FALSE,
    language VARCHAR(50),
    lyrics TEXT,
    track_order INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tracks_release_id ON tracks(release_id);