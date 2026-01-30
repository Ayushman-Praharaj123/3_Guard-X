#!/usr/bin/env python3
"""
Verify Backend Build Script
"""

def verify_build():
    print("🔍 Verifying Guard-X Backend Build...")
    print("=" * 50)
    
    try:
        # Check Python version
        import sys
        print(f"✅ Python: {sys.version}")
        
        # Check core dependencies
        import fastapi
        print(f"✅ FastAPI: {fastapi.__version__}")
        
        import uvicorn
        print(f"✅ Uvicorn: {uvicorn.__version__}")
        
        import torch
        print(f"✅ PyTorch: {torch.__version__}")
        
        import ultralytics
        print(f"✅ Ultralytics: {ultralytics.__version__}")
        
        import cv2
        print(f"✅ OpenCV: {cv2.__version__}")
        
        # Check model loading
        from ultralytics import YOLO
        model = YOLO('yolov8n.pt')
        print("✅ YOLO model loading: OK")
        
        # Check app import
        from app import app
        print("✅ FastAPI app import: OK")
        
        print("\n" + "=" * 50)
        print("🎉 BUILD VERIFICATION SUCCESSFUL!")
        print("Ready for deployment! 🚀")
        
    except ImportError as e:
        print(f"❌ Missing dependency: {e}")
        return False
    except Exception as e:
        print(f"❌ Build error: {e}")
        return False
    
    return True

if __name__ == "__main__":
    verify_build()