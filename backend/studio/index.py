"""API для работы со студией: промо-релизы, видео, аккаунты платформ"""
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
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        params = event.get('queryStringParameters') or {}
        entity_type = params.get('type')
        
        if method == 'GET':
            user_id = params.get('user_id')
            status = params.get('status')
            entity_id = params.get('id')
            
            if entity_type == 'promo':
                table = 't_p13732906_kedoo_music_platform.promo_releases'
            elif entity_type == 'video':
                table = 't_p13732906_kedoo_music_platform.videos'
            elif entity_type == 'platform':
                table = 't_p13732906_kedoo_music_platform.platform_accounts'
            else:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Missing or invalid type parameter'}),
                    'isBase64Encoded': False
                }
            
            if entity_id:
                cur.execute(f"SELECT * FROM {table} WHERE id = %s", (entity_id,))
                entity = cur.fetchone()
                return {
                    'statusCode': 200 if entity else 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({entity_type: dict(entity) if entity else None}, default=str),
                    'isBase64Encoded': False
                }
            
            query = f"SELECT * FROM {table} WHERE 1=1"
            query_params = []
            
            if user_id:
                query += " AND user_id = %s"
                query_params.append(user_id)
            
            if status:
                query += " AND status = %s"
                query_params.append(status)
            
            query += " ORDER BY created_at DESC"
            cur.execute(query, query_params)
            entities = [dict(row) for row in cur.fetchall()]
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({f'{entity_type}s': entities}, default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            user_id = body.get('user_id')
            
            if not user_id or not entity_type:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Missing user_id or type'}),
                    'isBase64Encoded': False
                }
            
            if entity_type == 'promo':
                cur.execute(
                    """INSERT INTO t_p13732906_kedoo_music_platform.promo_releases 
                    (user_id, upc, release_description, key_track_isrc, key_track_name, 
                     key_track_description, artists, smartlink_url, status) 
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s) 
                    RETURNING *""",
                    (user_id, body.get('upc'), body.get('release_description'), 
                     body.get('key_track_isrc'), body.get('key_track_name'),
                     body.get('key_track_description'), body.get('artists'), body.get('smartlink_url'),
                     body.get('status', 'on_moderation'))
                )
            
            elif entity_type == 'video':
                cur.execute(
                    """INSERT INTO t_p13732906_kedoo_music_platform.videos 
                    (user_id, video_url, name, artist, cover_url, status) 
                    VALUES (%s, %s, %s, %s, %s, %s) 
                    RETURNING *""",
                    (user_id, body.get('video_url'), body.get('name'), 
                     body.get('artist'), body.get('cover_url'), body.get('status', 'on_moderation'))
                )
            
            elif entity_type == 'platform':
                cur.execute(
                    """INSERT INTO t_p13732906_kedoo_music_platform.platform_accounts 
                    (user_id, platform_name, artist_name, links, status) 
                    VALUES (%s, %s, %s, %s, %s) 
                    RETURNING *""",
                    (user_id, body.get('platform_name'), body.get('artist_name'),
                     json.dumps(body.get('links', {})) if body.get('links') else None,
                     body.get('status', 'on_moderation'))
                )
            else:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Invalid type'}),
                    'isBase64Encoded': False
                }
            
            entity = dict(cur.fetchone())
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({entity_type: entity}, default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            entity_id = body.get('id')
            
            if not entity_id or not entity_type:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Missing id or type'}),
                    'isBase64Encoded': False
                }
            
            if entity_type == 'promo':
                table = 't_p13732906_kedoo_music_platform.promo_releases'
                allowed_fields = ['status', 'rejection_reason']
            elif entity_type == 'video':
                table = 't_p13732906_kedoo_music_platform.videos'
                allowed_fields = ['status', 'rejection_reason']
            elif entity_type == 'platform':
                table = 't_p13732906_kedoo_music_platform.platform_accounts'
                allowed_fields = ['status', 'rejection_reason']
            else:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Invalid type'}),
                    'isBase64Encoded': False
                }
            
            updates = []
            query_params = []
            
            for field in allowed_fields:
                if field in body:
                    updates.append(f"{field} = %s")
                    query_params.append(body[field])
            
            if not updates:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'No fields to update'}),
                    'isBase64Encoded': False
                }
            
            query_params.append(entity_id)
            query = f"UPDATE {table} SET {', '.join(updates)}, updated_at = CURRENT_TIMESTAMP WHERE id = %s RETURNING *"
            
            cur.execute(query, query_params)
            entity = cur.fetchone()
            
            if not entity:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Entity not found'}),
                    'isBase64Encoded': False
                }
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({entity_type: dict(entity)}, default=str),
                'isBase64Encoded': False
            }
        
        else:
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