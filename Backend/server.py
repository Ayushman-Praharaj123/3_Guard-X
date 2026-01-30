import uvicorn
from pathlib import Path
import socketio

# Import FastAPI app
from app import app as fastapi_app

# Import Socket.IO server
from socket_server import sio
from camera_stream import initialize_ai_engine

# Create Socket.IO ASGI application
socket_app = socketio.ASGIApp(
    sio,
    other_asgi_app=fastapi_app,
    socketio_path='/socket.io'
)

# This is the main ASGI application
app = socket_app


# Add startup initialization
@fastapi_app.on_event("startup")
async def startup_event():
    """Initialize AI engine and systems on startup"""
    print("=" * 70)
    print("  GUARD-X MULTI-CAMERA DRONE SURVEILLANCE SYSTEM INITIALIZING...")
    print("=" * 70)
    
    # Initialize AI engine
    await initialize_ai_engine()
    
    print(" GUARD-X SYSTEM OPERATIONAL")
    print("Socket.IO server ready on ws://localhost:8000/socket.io")
    print("REST API ready on http://localhost:8000/api")
    print(" API Docs: http://localhost:8000/docs")
    print("=" * 70)


if __name__ == "__main__":
    print("=" * 70)
    print("GUARD-X AI DRONE SURVEILLANCE SYSTEM")
    print("=" * 70)
    print("🔹 Admin Node: http://localhost:8000")
    print("🔹 Socket.IO: ws://localhost:8000/socket.io")
    print("🔹 API Docs: http://localhost:8000/docs")
    print("🔹 Frontend: http://localhost:5173")
    print("=" * 70)
    
    # Check for models
    models_dir = Path("models")
    if not models_dir.exists():
        models_dir.mkdir()
        print(" Created models/ directory")
    
    custom_models = list(models_dir.glob("*.pt"))
    if custom_models:
        print(f" Found {len(custom_models)} custom model(s):")
        for model in custom_models:
            print(f"   - {model.name}")
    else:
        print("  No custom models found, will use YOLO fallback")
        print("   Place custom models in Backend/models/ directory:")
        print("   - models/human.pt")
        print("   - models/weapon.pt")
        print("   - models/vehicle.pt")
    
    print("=" * 70)
    print(" Starting server...")
    print("=" * 70)
    
    uvicorn.run(
        "server:app",
        host="0.0.0.0",
        port=8000,
        reload=False,
        log_level="info"
    )

