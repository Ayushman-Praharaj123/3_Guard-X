"""
Test Socket.IO Connection
This script tests if Socket.IO server is working correctly
"""

import asyncio
import socketio

async def test_connection():
    """Test Socket.IO connection with authentication"""
    
    # Create a Socket.IO client
    sio = socketio.AsyncClient()
    
    # Test token (you'll need to get a real token from login)
    test_token = "your-jwt-token-here"
    
    @sio.event
    async def connect():
        print("✅ Connected to Socket.IO server!")
        print(f"   Session ID: {sio.sid}")
    
    @sio.event
    async def disconnect():
        print("🔌 Disconnected from Socket.IO server")
    
    @sio.event
    async def connect_error(data):
        print(f"❌ Connection error: {data}")
    
    try:
        print("🔌 Attempting to connect to Socket.IO server...")
        print("   URL: http://localhost:8000")
        print("   Path: /socket.io")
        
        await sio.connect(
            'http://localhost:8000',
            socketio_path='/socket.io',
            auth={'token': test_token},
            transports=['websocket', 'polling']
        )
        
        # Wait a bit
        await asyncio.sleep(2)
        
        # Disconnect
        await sio.disconnect()
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    print("=" * 70)
    print("Guard-X Socket.IO Connection Test")
    print("=" * 70)
    print()
    print("NOTE: You need to:")
    print("1. Start the backend server first: python server.py")
    print("2. Get a JWT token by logging in via the API")
    print("3. Update the test_token variable in this script")
    print()
    print("=" * 70)
    print()
    
    asyncio.run(test_connection())

