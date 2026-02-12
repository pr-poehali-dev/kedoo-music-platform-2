-- Add moderator user (moder@radish.ru / zzzz-2014)
-- Password hash for 'zzzz-2014' using SHA256
INSERT INTO t_p13732906_kedoo_music_platform.users (email, username, password_hash, role) 
VALUES ('moder@radish.ru', 'moderator', '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', 'moderator') 
ON CONFLICT (email) DO NOTHING;