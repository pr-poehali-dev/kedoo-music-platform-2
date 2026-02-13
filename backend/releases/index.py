"""API для управления релизами"""
import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def handler(event: dict, context) -> dict:
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        if method == 'GET':
            params = event.get('queryStringParameters', {})
            user_id = params.get('user_id')
            release_id = params.get('release_id')
            status = params.get('status')
            
            if release_id:
                cur.execute("""
                    SELECT r.*, 
                           COALESCE(json_agg(
                               json_build_object(
                                   'id', t.id,
                                   'track_name', t.track_name,
                                   'artists', t.artists,
                                   'audio_url', t.audio_url,
                                   'isrc', t.isrc,
                                   'version', t.version,
                                   'musicians', t.musicians,
                                   'lyricists', t.lyricists,
                                   'tiktok_moment', t.tiktok_moment,
                                   'has_explicit', t.has_explicit,
                                   'has_lyrics', t.has_lyrics,
                                   'language', t.language,
                                   'lyrics', t.lyrics,
                                   'track_order', t.track_order
                               ) ORDER BY t.track_order
                           ) FILTER (WHERE t.id IS NOT NULL), '[]') as tracks
                    FROM releases r
                    LEFT JOIN tracks t ON r.id = t.release_id
                    WHERE r.id = %s
                    GROUP BY r.id
                """, (release_id,))
                release = cur.fetchone()
                
                if not release:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Release not found'}),
                        'isBase64Encoded': False
                    }
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'release': dict(release)}, default=str),
                    'isBase64Encoded': False
                }
            
            query = "SELECT * FROM releases WHERE 1=1"
            query_params = []
            
            if user_id:
                query += " AND user_id = %s"
                query_params.append(user_id)
            
            if status:
                query += " AND status = %s"
                query_params.append(status)
            
            query += " ORDER BY created_at DESC"
            
            cur.execute(query, query_params)
            releases = [dict(row) for row in cur.fetchall()]
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'releases': releases}, default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            
            cur.execute("""
                INSERT INTO releases (user_id, album_name, artists, cover_url, upc, old_release_date, is_rerelease, status)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING *
            """, (
                body.get('user_id'),
                body.get('album_name'),
                body.get('artists'),
                body.get('cover_url'),
                body.get('upc'),
                body.get('old_release_date'),
                body.get('is_rerelease', False),
                body.get('status', 'draft')
            ))
            
            release = dict(cur.fetchone())
            
            tracks = body.get('tracks', [])
            for idx, track in enumerate(tracks):
                cur.execute("""
                    INSERT INTO tracks (release_id, track_name, artists, audio_url, isrc, version, musicians, lyricists, tiktok_moment, has_explicit, has_lyrics, language, lyrics, track_order)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    release['id'],
                    track.get('track_name'),
                    track.get('artists'),
                    track.get('audio_url'),
                    track.get('isrc'),
                    track.get('version', 'Original'),
                    track.get('musicians'),
                    track.get('lyricists'),
                    track.get('tiktok_moment'),
                    track.get('has_explicit', False),
                    track.get('has_lyrics', False),
                    track.get('language'),
                    track.get('lyrics'),
                    idx + 1
                ))
            
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'release': release}, default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            release_id = body.get('release_id')
            
            if not release_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Missing release_id'}),
                    'isBase64Encoded': False
                }
            
            updates = []
            params = []
            
            fields = ['album_name', 'artists', 'cover_url', 'upc', 'old_release_date', 'is_rerelease', 'status', 'rejection_reason']
            for field in fields:
                if field in body:
                    updates.append(f"{field} = %s")
                    params.append(body[field])
            
            if updates:
                params.append(release_id)
                query = f"UPDATE releases SET {', '.join(updates)}, updated_at = CURRENT_TIMESTAMP WHERE id = %s RETURNING *"
                cur.execute(query, params)
                release = dict(cur.fetchone())
                
                if 'tracks' in body:
                    cur.execute("SELECT id FROM tracks WHERE release_id = %s", (release_id,))
                    existing_tracks = [row['id'] for row in cur.fetchall()]
                    
                    for idx, track in enumerate(body['tracks']):
                        if track.get('id') and track['id'] in existing_tracks:
                            cur.execute("""
                                UPDATE tracks SET track_name = %s, artists = %s, audio_url = %s, isrc = %s, version = %s, 
                                                  musicians = %s, lyricists = %s, tiktok_moment = %s, has_explicit = %s, 
                                                  has_lyrics = %s, language = %s, lyrics = %s, track_order = %s
                                WHERE id = %s
                            """, (
                                track.get('track_name'), track.get('artists'), track.get('audio_url'), 
                                track.get('isrc'), track.get('version'), track.get('musicians'), 
                                track.get('lyricists'), track.get('tiktok_moment'), track.get('has_explicit'),
                                track.get('has_lyrics'), track.get('language'), track.get('lyrics'), idx + 1, track['id']
                            ))
                        else:
                            cur.execute("""
                                INSERT INTO tracks (release_id, track_name, artists, audio_url, isrc, version, musicians, lyricists, tiktok_moment, has_explicit, has_lyrics, language, lyrics, track_order)
                                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                            """, (
                                release_id, track.get('track_name'), track.get('artists'), track.get('audio_url'),
                                track.get('isrc'), track.get('version'), track.get('musicians'), track.get('lyricists'),
                                track.get('tiktok_moment'), track.get('has_explicit'), track.get('has_lyrics'),
                                track.get('language'), track.get('lyrics'), idx + 1
                            ))
                
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'release': release}, default=str),
                    'isBase64Encoded': False
                }
        
        elif method == 'DELETE':
            params = event.get('queryStringParameters') or {}
            release_id = params.get('release_id')
            
            if not release_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Missing release_id'}),
                    'isBase64Encoded': False
                }
            
            cur.execute("DELETE FROM t_p13732906_kedoo_music_platform.tracks WHERE release_id = %s", (release_id,))
            cur.execute("DELETE FROM t_p13732906_kedoo_music_platform.releases WHERE id = %s", (release_id,))
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Release deleted'}),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
    
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()