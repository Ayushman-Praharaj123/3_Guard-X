import torch
import cv2
import numpy as np
from ultralytics import YOLO
from pathlib import Path
import time
from PIL import Image
import asyncio

class ModelWrapper:
    def __init__(self):
        self.models = {}
        self.active_model_name = None
        self.confidence_threshold = 0.5
        self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
        
    async def load_models(self):
        """Load both custom and fallback models"""
        print("🔄 Loading AI models...")
        
        # Try to load custom trained model first
        # Check multiple possible locations for best.pt
        base_path = Path(__file__).parent
        custom_model_paths = [
            base_path / "best.pt",
            base_path / "models" / "best.pt",
            Path("best.pt"),
            Path("models/best.pt")
        ]
        
        for path in custom_model_paths:
            print(f"🔍 Checking for custom model at: {path.absolute()}")
            if path.exists():
                try:
                    model = YOLO(str(path))
                    model.to(self.device)
                    self.models['custom'] = model
                    self.active_model_name = 'custom'
                    print(f"✅ Custom model loaded successfully from: {path} on {self.device}")
                    break
                except Exception as e:
                    print(f"❌ Custom model failed from {path}: {e}")
        
        # Load fallback YOLO model if custom not loaded or as a backup
        try:
            print(f"🔍 Loading fallback YOLO model on {self.device}...")
            model = YOLO('yolov8n.pt')
            model.to(self.device)
            self.models['yolo'] = model
            if not self.active_model_name:
                self.active_model_name = 'yolo'
            print("✅ YOLO fallback model loaded")
        except Exception as e:
            print(f"❌ YOLO model failed: {e}")
            
        print(f"🎯 Final Active model: {self.active_model_name}")
        print(f"📦 Loaded models: {list(self.models.keys())}")
    
    async def detect_humans(self, image, confidence=None):
        """Enhanced human detection with better accuracy using all loaded models"""
        conf = confidence or self.confidence_threshold
        print(f"🔄 Starting detection with all loaded models, threshold: {conf}")
        
        if not self.models:
            print("❌ No models loaded!")
            raise Exception("No models loaded")
            
        start_time = time.time()
        
        # Convert PIL to numpy array
        img_array = np.array(image)
        
        # Extract results from all models
        boxes = []
        confidences = []
        labels = []
        
        for model_name, model in self.models.items():
            print(f"🤖 Running {model_name} detection...")
            try:
                if model_name == 'yolo':
                    results = model(img_array, conf=conf, classes=[0])  # class 0 = person
                else:
                    results = model(img_array, conf=conf)
                
                if len(results) > 0 and results[0].boxes is not None:
                    print(f"📦 Model {model_name} found {len(results[0].boxes)} boxes")
                    for i, box in enumerate(results[0].boxes):
                        coords = box.xyxy[0].cpu().numpy()
                        confidence_val = box.conf[0].cpu().numpy()
                        cls = int(box.cls[0].cpu().numpy())
                        
                        class_name = results[0].names[cls] if hasattr(results[0], 'names') else 'Unknown'
                        
                        # Filter for Human detections only
                        if class_name.lower() not in ['person', 'human']:
                            continue
                            
                        boxes.append([
                            float(coords[0]), float(coords[1]), 
                            float(coords[2]), float(coords[3])
                        ])
                        confidences.append(float(confidence_val))
                        labels.append(class_name)
            except Exception as e:
                print(f"❌ Error with model {model_name}: {e}")
        
        processing_time = time.time() - start_time
        
        result = {
            "boxes": boxes,
            "count": len(boxes),
            "confidences": confidences,
            "labels": labels,
            "model_type": "multi-model",
            "processing_time": round(processing_time, 3),
            "confidence_threshold": conf
        }
        
        print(f"✅ Final result: {result['count']} detections found")
        return result
    
    async def detect_realtime_frame(self, frame):
        """Optimized detection for real-time video frames"""
        if not self.models or self.active_model_name not in self.models:
            return {"boxes": [], "count": 0, "confidences": []}
            
        model = self.models[self.active_model_name]
        
        try:
            # Resize frame for faster processing
            height, width = frame.shape[:2]
            scale_factor = 1.0
            
            if width > 640:
                scale_factor = 640 / width
                new_width = 640
                new_height = int(height * scale_factor)
                frame = cv2.resize(frame, (new_width, new_height))
                
            boxes = []
            confidences = []
            labels = []
            
            # Using 0.25 instead of 0.3 for better sensitivity
            detection_conf = 0.25
            
            # Run detection on all loaded models to ensure maximum coverage
            for model_name, model in self.models.items():
                try:
                    # For standard YOLO, we can filter for persons (class 0)
                    if model_name == 'yolo':
                        results = model(frame, conf=detection_conf, classes=[0], verbose=False)
                    else:
                        results = model(frame, conf=detection_conf, verbose=False)
                    
                    if len(results) > 0 and results[0].boxes is not None:
                        for box in results[0].boxes:
                            coords = box.xyxy[0].cpu().numpy()
                            confidence = box.conf[0].cpu().numpy()
                            cls = int(box.cls[0].cpu().numpy())
                            
                            # Get class name
                            class_name = results[0].names[cls] if hasattr(results[0], 'names') else 'Unknown'
                            
                            # Filter for Human detections only
                            if class_name.lower() not in ['person', 'human']:
                                continue
                                
                            # Scale back to original size if resized
                            if scale_factor != 1.0:
                                coords = coords / scale_factor
                            
                            boxes.append([
                                float(coords[0]), float(coords[1]), 
                                float(coords[2]), float(coords[3])
                            ])
                            confidences.append(float(confidence))
                            labels.append(class_name)
                            
                        if len(results[0].boxes) > 0:
                            print(f"🤖 Model {model_name} detected {len(results[0].boxes)} objects")
                except Exception as e:
                    print(f"❌ Error with model {model_name}: {e}")
            
            return {
                "boxes": boxes,
                "count": len(boxes),
                "confidences": confidences,
                "labels": labels
            }
            
        except Exception as e:
            print(f"❌ Real-time detection error: {e}")
            return {"boxes": [], "count": 0, "confidences": []}
    
    async def get_health_status(self):
        """Get model health status"""
        return {
            "models_loaded": len(self.models) > 0,
            "active_model": self.active_model_name,
            "available_models": list(self.models.keys()),
            "device": self.device,
            "confidence_threshold": self.confidence_threshold,
            "models": {
                name: {
                    "loaded": True,
                    "type": "YOLO" if name == "yolo" else "Custom",
                    "status": "OPERATIONAL"
                } for name in self.models.keys()
            }
        }
    
    async def get_models_info(self):
        """Get information about available models"""
        return [
            {
                "name": name,
                "type": info["type"],
                "path": info["path"],
                "loaded": info["loaded"],
                "active": name == self.active_model_name
            }
            for name, info in self.models.items()
        ]




