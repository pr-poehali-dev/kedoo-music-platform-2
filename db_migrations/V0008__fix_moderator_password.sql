-- Update moderator password to correct hash for 'zzzz-2014'
UPDATE t_p13732906_kedoo_music_platform.users 
SET password_hash = '46b4c1181f74333264bed400fd463194b36fd7cf3ffee8ff8ebcbc36608c0bd0' 
WHERE email = 'moder@radish.ru';