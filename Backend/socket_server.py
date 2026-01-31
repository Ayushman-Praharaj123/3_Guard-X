"""
Guard-X Socket.IO Server
This module manages real-time Socket.IO connections for the multi-camera surveillance system.

Data flow:
Camera Client → Socket.IO → Server → AI Engine → Admin Dashboard

Responsibilities:
- Authenticate Socket.IO connections using JWT tokens
- Manage camera and admin rooms
- Route video frames from cameras to AI engine
- Broadcast detection results to admin dashboard
- Handle deploy/stop commands from admin
- Track connected cameras and admins
"""

import socketio
import asyncio
from typing import Dict, Set
from jose import jwt, JWTError
from auth import SECRET_KEY, ALGORITHM
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Semaphore to limit concurrent AI processing (prevent CPU overload)
# Increased to 32 for better throughput with 6+ cameras at 10 FPS
ai_semaphore = asyncio.Semaphore(32)

# Create Socket.IO server with CORS support
# Allow all origins for local network deployment
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins='*',  # Allow all origins for local network
    logger=True,
    engineio_logger=True,
    max_http_buffer_size=5000000,  # Increase buffer size to 5MB for video frames
    ping_timeout=20,
    ping_interval=10
)

# Track connected clients
connected_cameras: Dict[str, dict] = {}  # sid -> {username, camera_id, deployed}
connected_admins: Set[str] = set()  # set of admin sids
deployed_cameras: Set[str] = set()  # set of deployed camera sids


def verify_token(token: str) -> dict:
    """Verify JWT token and extract user data"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError as e:
        logger.error(f"Token verification failed: {e}")
        return None


@sio.event
async def connect(sid, environ, auth):
    """
    Handle new Socket.IO connection
    Authenticate using JWT token from auth dict
    """
    logger.info(f"🔌 New connection attempt: {sid}")
    logger.info(f"   Auth data: {auth}")
    
    token = None
    if auth and 'token' in auth:
        token = auth['token']
    
    # Fallback to query parameters if not in auth dict
    if not token:
        query_string = environ.get('QUERY_STRING', '')
        from urllib.parse import parse_qs
        params = parse_qs(query_string)
        if 'token' in params:
            token = params['token'][0]
            logger.info(f"   Token found in query parameters")

    if not token:
        logger.warning(f"❌ Connection rejected - no token: {sid}")
        return False
    
    logger.info(f"   Token received: {token[:20]}..." if token else "   Token: None")
    user_data = verify_token(token)
    
    if not user_data:
        logger.warning(f"❌ Connection rejected - invalid token: {sid}")
        return False
    
    username = user_data.get('sub')
    role = user_data.get('role', 'OPERATOR')
    
    logger.info(f"✅ Authenticated: {username} ({role}) - {sid}")
    
    # Join appropriate room based on role
    if role == 'ADMIN':
        await sio.enter_room(sid, 'admin_room')
        connected_admins.add(sid)
        logger.info(f"👑 Admin joined: {username} - {sid}")
        
        # Send current camera list to admin
        camera_list = [
            {
                'sid': cam_sid,
                'username': cam_data['username'],
                'camera_id': cam_data['camera_id'],
                'deployed': cam_data['deployed']
            }
            for cam_sid, cam_data in connected_cameras.items()
        ]
        await sio.emit('camera:list', {'cameras': camera_list}, room=sid)
        
    else:
        # Camera client
        camera_id = user_data.get('camera_id', username)
        connected_cameras[sid] = {
            'username': username,
            'camera_id': camera_id,
            'deployed': False
        }
        await sio.enter_room(sid, 'camera_room')
        logger.info(f"📹 Camera joined: {camera_id} - {sid}")
        
        # Notify all admins about new camera
        await sio.emit('camera:connected', {
            'sid': sid,
            'username': username,
            'camera_id': camera_id
        }, room='admin_room')
    
    return True


@sio.event
async def disconnect(sid):
    """Handle client disconnect"""
    logger.info(f"🔌 Disconnect: {sid}")
    
    # Check if admin
    if sid in connected_admins:
        connected_admins.remove(sid)
        logger.info(f"👑 Admin disconnected: {sid}")
    
    # Check if camera
    if sid in connected_cameras:
        camera_data = connected_cameras[sid]
        camera_id = camera_data['camera_id']
        del connected_cameras[sid]
        
        if sid in deployed_cameras:
            deployed_cameras.remove(sid)
        
        logger.info(f"📹 Camera disconnected: {camera_id} - {sid}")
        
        # Notify admins
        await sio.emit('camera:disconnect', {
            'sid': sid,
            'camera_id': camera_id
        }, room='admin_room')


@sio.event
async def deploy_start(sid, data):
    """
    Admin command to deploy a camera
    Only admins can issue this command
    """
    if sid not in connected_admins:
        logger.warning(f"❌ Unauthorized deploy attempt from: {sid}")
        return

    target_sid = data.get('camera_sid')

    if target_sid not in connected_cameras:
        logger.warning(f"❌ Camera not found: {target_sid}")
        await sio.emit('deploy:failed', {
            'error': 'Camera not connected'
        }, room=sid)
        return

    # Mark camera as deployed
    connected_cameras[target_sid]['deployed'] = True
    deployed_cameras.add(target_sid)

    camera_id = connected_cameras[target_sid]['camera_id']
    logger.info(f"🚀 Deploying camera: {camera_id} - {target_sid}")

    # Send deploy command to camera
    await sio.emit('deploy:assigned', {
        'camera_id': camera_id,
        'message': 'Start streaming'
    }, room=target_sid)

    # Confirm to admin
    await sio.emit('deploy:success', {
        'camera_sid': target_sid,
        'camera_id': camera_id
    }, room=sid)


@sio.event
async def deploy_stop(sid, data):
    """
    Admin command to stop a camera
    Only admins can issue this command
    """
    if sid not in connected_admins:
        logger.warning(f"❌ Unauthorized stop attempt from: {sid}")
        return

    target_sid = data.get('camera_sid')

    if target_sid not in connected_cameras:
        logger.warning(f"❌ Camera not found: {target_sid}")
        return

    # Mark camera as not deployed
    connected_cameras[target_sid]['deployed'] = False
    if target_sid in deployed_cameras:
        deployed_cameras.remove(target_sid)

    camera_id = connected_cameras[target_sid]['camera_id']
    logger.info(f"🛑 Stopping camera: {camera_id} - {target_sid}")

    # Send stop command to camera
    await sio.emit('deploy:stop', {
        'camera_id': camera_id,
        'message': 'Stop streaming'
    }, room=target_sid)


@sio.event
async def camera_frame(sid, data):
    """
    Receive video frame from camera client
    Only deployed cameras can send frames
    """
    if sid not in connected_cameras:
        logger.warning(f"❌ Unauthorized frame from: {sid}")
        return

    if sid not in deployed_cameras:
        logger.warning(f"❌ Frame from non-deployed camera: {sid}")
        return

    camera_id = connected_cameras[sid]['camera_id']
    frame_data = data.get('frame')

    if not frame_data:
        return

    # logger.info(f"📸 Received frame from {camera_id} ({len(frame_data)} bytes)")

    try:
        async with ai_semaphore:
            # Import here to avoid circular dependency
            from camera_stream import process_camera_frame

            # Process frame through AI engine
            detection_result = await process_camera_frame(frame_data, camera_id, sid)

            # Broadcast to admins only (not back to operator to reduce their CPU load)
            if detection_result:
                # logger.info(f"📡 Broadcasting detection for {camera_id} to admin_room")
                await sio.emit('detection:result', detection_result, room='admin_room')
                # REMOVED: Sending back to operator - reduces their rendering overhead by 50%
                # await sio.emit('detection:result', detection_result, room=sid)
            else:
                logger.warning(f"⚠️ process_camera_frame returned None for {camera_id}")
            
    except Exception as e:
        logger.error(f"❌ Error processing camera frame from {camera_id}: {e}")
        import traceback
        logger.error(traceback.format_exc())


# Export socket server and utilities
def get_socket_app():
    """Get Socket.IO ASGI application"""
    return socketio.ASGIApp(sio)


def get_sio():
    """Get Socket.IO server instance"""
    return sio


def get_connected_cameras():
    """Get list of connected cameras"""
    return connected_cameras


def get_deployed_cameras():
    """Get list of deployed cameras"""
    return deployed_cameras

