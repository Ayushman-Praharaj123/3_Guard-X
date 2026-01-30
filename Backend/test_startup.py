"""
Quick Test Script to Verify Backend Can Start
Run this before starting the full server to check for import errors
"""

import sys

print("=" * 70)
print("TEST GUARD-X BACKEND STARTUP TEST")
print("=" * 70)

# Test 1: Python version
print("\n[1] Testing Python version...")
print(f"   Python {sys.version}")
if sys.version_info < (3, 8):
    print("   [X] ERROR: Python 3.8+ required!")
    sys.exit(1)
print("   [OK] Python version OK")

# Test 2: Import FastAPI
print("\n[2] Testing FastAPI import...")
try:
    import fastapi
    print(f"   [OK] FastAPI {fastapi.__version__} installed")
except ImportError as e:
    print(f"   [X] ERROR: {e}")
    print("   Run: pip install fastapi")
    sys.exit(1)

# Test 3: Import Uvicorn
print("\n[3] Testing Uvicorn import...")
try:
    import uvicorn
    print(f"   [OK] Uvicorn installed")
except ImportError as e:
    print(f"   [X] ERROR: {e}")
    print("   Run: pip install uvicorn[standard]")
    sys.exit(1)

# Test 4: Import Socket.IO
print("\n[4] Testing Socket.IO import...")
try:
    import socketio
    print(f"   [OK] Socket.IO installed")
except ImportError as e:
    print(f"   [X] ERROR: {e}")
    print("   Run: pip install python-socketio")
    sys.exit(1)

# Test 5: Import PyTorch
print("\n[5] Testing PyTorch import...")
try:
    import torch
    print(f"   [OK] PyTorch {torch.__version__} installed")
except ImportError as e:
    print(f"   [X] ERROR: {e}")
    print("   Run: pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu")
    sys.exit(1)

# Test 6: Import Ultralytics (YOLO)
print("\n[6] Testing Ultralytics (YOLO) import...")
try:
    import ultralytics
    print(f"   [OK] Ultralytics {ultralytics.__version__} installed")
except ImportError as e:
    print(f"   [X] ERROR: {e}")
    print("   Run: pip install ultralytics")
    sys.exit(1)

# Test 7: Import OpenCV
print("\n[7] Testing OpenCV import...")
try:
    import cv2
    print(f"   [OK] OpenCV {cv2.__version__} installed")
except ImportError as e:
    print(f"   [X] ERROR: {e}")
    print("   Run: pip install opencv-python-headless")
    sys.exit(1)

# Test 8: Import JWT
print("\n[8] Testing JWT import...")
try:
    from jose import jwt
    print(f"   [OK] python-jose installed")
except ImportError as e:
    print(f"   [X] ERROR: {e}")
    print("   Run: pip install python-jose[cryptography]")
    sys.exit(1)

# Test 9: Import project modules
print("\n[9] Testing project modules...")
try:
    from auth import authenticate_army_user, create_access_token
    print("   [OK] auth.py imported")
except Exception as e:
    print(f"   [X] ERROR importing auth.py: {e}")
    sys.exit(1)

try:
    from model_wrapper import ModelWrapper
    print("   [OK] model_wrapper.py imported")
except Exception as e:
    print(f"   [X] ERROR importing model_wrapper.py: {e}")
    sys.exit(1)

try:
    from socket_server import sio
    print("   [OK] socket_server.py imported")
except Exception as e:
    print(f"   [X] ERROR importing socket_server.py: {e}")
    sys.exit(1)

try:
    from camera_stream import initialize_ai_engine
    print("   [OK] camera_stream.py imported")
except Exception as e:
    print(f"   [X] ERROR importing camera_stream.py: {e}")
    sys.exit(1)

try:
    from app import app
    print("   [OK] app.py imported")
except Exception as e:
    print(f"   [X] ERROR importing app.py: {e}")
    sys.exit(1)

# Test 10: Check models directory
print("\n[10] Checking models directory...")
from pathlib import Path
models_dir = Path("models")
if not models_dir.exists():
    print("   [!] models/ directory doesn't exist, creating...")
    models_dir.mkdir()
    print("   [OK] Created models/ directory")
else:
    print("   [OK] models/ directory exists")

custom_models = list(models_dir.glob("*.pt"))
if custom_models:
    print(f"   [OK] Found {len(custom_models)} custom model(s):")
    for model in custom_models:
        print(f"      - {model.name}")
else:
    print("   [!] No custom models found (will use YOLO fallback)")

print("\n" + "=" * 70)
print("[OK] ALL TESTS PASSED!")
print("=" * 70)
print("\n🚀 You can now start the server:")
print("   python server.py")
print("=" * 70)

