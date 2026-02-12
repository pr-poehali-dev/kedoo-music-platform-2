-- SmartLinks table
CREATE TABLE IF NOT EXISTS t_p13732906_kedoo_music_platform.smartlinks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    release_name VARCHAR(500) NOT NULL,
    artists VARCHAR(1000) NOT NULL,
    cover_url TEXT,
    upc VARCHAR(100),
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'on_moderation', 'accepted', 'rejected')),
    rejection_reason TEXT,
    smartlink_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Promo Releases table (Studio -> Submit for promo)
CREATE TABLE IF NOT EXISTS t_p13732906_kedoo_music_platform.promo_releases (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    upc VARCHAR(100) NOT NULL,
    release_description TEXT,
    key_track_isrc VARCHAR(100),
    key_track_name VARCHAR(500),
    key_track_description TEXT,
    artists VARCHAR(1000),
    smartlink_url TEXT,
    status VARCHAR(50) DEFAULT 'on_moderation' CHECK (status IN ('on_moderation', 'accepted', 'rejected')),
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Videos table (Studio -> Add video to platforms)
CREATE TABLE IF NOT EXISTS t_p13732906_kedoo_music_platform.videos (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    video_url TEXT,
    video_name VARCHAR(500) NOT NULL,
    artist_name VARCHAR(500) NOT NULL,
    cover_url TEXT,
    status VARCHAR(50) DEFAULT 'on_moderation' CHECK (status IN ('on_moderation', 'accepted', 'rejected')),
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Platform Accounts table (Studio -> Platform accounts)
CREATE TABLE IF NOT EXISTS t_p13732906_kedoo_music_platform.platform_accounts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    platform VARCHAR(100) NOT NULL CHECK (platform IN ('yandex_music', 'vk_music', 'spotify', 'apple_music', 'youtube_music')),
    artist_description TEXT,
    latest_release_upc VARCHAR(100),
    upcoming_release_upc VARCHAR(100),
    artist_photo_url TEXT,
    artist_video_url TEXT,
    links JSONB,
    youtube_channel_url TEXT,
    youtube_artist_card_url TEXT,
    status VARCHAR(50) DEFAULT 'on_moderation' CHECK (status IN ('on_moderation', 'accepted', 'rejected')),
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_smartlinks_user_id ON t_p13732906_kedoo_music_platform.smartlinks(user_id);
CREATE INDEX IF NOT EXISTS idx_smartlinks_status ON t_p13732906_kedoo_music_platform.smartlinks(status);
CREATE INDEX IF NOT EXISTS idx_promo_releases_user_id ON t_p13732906_kedoo_music_platform.promo_releases(user_id);
CREATE INDEX IF NOT EXISTS idx_promo_releases_status ON t_p13732906_kedoo_music_platform.promo_releases(status);
CREATE INDEX IF NOT EXISTS idx_videos_user_id ON t_p13732906_kedoo_music_platform.videos(user_id);
CREATE INDEX IF NOT EXISTS idx_videos_status ON t_p13732906_kedoo_music_platform.videos(status);
CREATE INDEX IF NOT EXISTS idx_platform_accounts_user_id ON t_p13732906_kedoo_music_platform.platform_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_platform_accounts_status ON t_p13732906_kedoo_music_platform.platform_accounts(status);