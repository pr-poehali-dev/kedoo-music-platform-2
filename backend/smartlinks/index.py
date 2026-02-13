"""API для управления смартлинками"""
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
        if method == 'GET':
            params_dict = event.get('queryStringParameters') or {}
            user_id = params_dict.get('user_id')
            status = params_dict.get('status')
            smartlink_id = params_dict.get('smartlink_id')
            
            if smartlink_id:
                cur.execute(
                    "SELECT * FROM t_p13732906_kedoo_music_platform.smartlinks WHERE id = %s",
                    (smartlink_id,)
                )
                smartlink = cur.fetchone()
                return {
                    'statusCode': 200 if smartlink else 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'smartlink': dict(smartlink) if smartlink else None}, default=str),
                    'isBase64Encoded': False
                }
            
            query = "SELECT * FROM t_p13732906_kedoo_music_platform.smartlinks WHERE 1=1"
            params = []
            
            if user_id:
                query += " AND user_id = %s"
                params.append(user_id)
            
            if status:
                query += " AND status = %s"
                params.append(status)
            
            query += " ORDER BY created_at DESC"
            cur.execute(query, params)
            smartlinks = [dict(row) for row in cur.fetchall()]
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'smartlinks': smartlinks}, default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            user_id = body.get('user_id')
            release_name = body.get('release_name')
            artists = body.get('artists')
            cover_url = body.get('cover_url')
            upc = body.get('upc')
            
            if not all([user_id, release_name, artists]):
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Missing required fields'}),
                    'isBase64Encoded': False
                }
            
            cur.execute(
                """INSERT INTO t_p13732906_kedoo_music_platform.smartlinks 
                (user_id, release_name, artists, cover_url, upc, status) 
                VALUES (%s, %s, %s, %s, %s, %s) 
                RETURNING id, user_id, release_name, artists, cover_url, upc, status, smartlink_url, rejection_reason, created_at, updated_at""",
                (user_id, release_name, artists, cover_url, upc, body.get('status', 'on_moderation'))
            )
            smartlink = dict(cur.fetchone())
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'smartlink': smartlink}, default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            smartlink_id = body.get('smartlink_id')
            
            if not smartlink_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Missing smartlink_id'}),
                    'isBase64Encoded': False
                }
            
            updates = []
            params = []
            
            for field in ['release_name', 'artists', 'cover_url', 'upc', 'status', 'rejection_reason', 'smartlink_url']:
                if field in body:
                    updates.append(f"{field} = %s")
                    params.append(body[field])
            
            if not updates:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'No fields to update'}),
                    'isBase64Encoded': False
                }
            
            params.append(smartlink_id)
            query = f"""UPDATE t_p13732906_kedoo_music_platform.smartlinks 
                       SET {', '.join(updates)}, updated_at = CURRENT_TIMESTAMP 
                       WHERE id = %s 
                       RETURNING *"""
            
            cur.execute(query, params)
            smartlink = cur.fetchone()
            
            if not smartlink:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Smartlink not found'}),
                    'isBase64Encoded': False
                }
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'smartlink': dict(smartlink)}, default=str),
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