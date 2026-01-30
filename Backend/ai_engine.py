
from ultralytics import YOLO
import torch
import cv2
import numpy as np
from pathlib import Path
import logging
from typing import Dict, List, Tuple
import asyncio

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class AIEngine:
    """Multi-model AI detection engine for Guard-X surveillance"""
    
    def __init__(self):
        self.models: Dict[str, YOLO] = {}
        self.model_loaded = False
        self.confidence_threshold = 0.25  # Lowered from 0.4 for better sensitivity
        self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
        
        # Base path for models
        base_path = Path(__file__).parent
        
        # Model paths - check multiple locations
        self.model_paths = {
            'custom': str(base_path / 'best.pt'),
            'fallback': 'yolov8n.pt'
        }
        
        # Class name mapping
        self.class_names = {
            'person': 'Human',
            'human': 'Human'
        }
    
    async def load_models(self):
        """
        Load all available YOLO models
        Try custom models first, fallback to pretrained
        """
        logger.info(f"🔄 Loading AI models for AIEngine on {self.device}...")
        
        models_loaded = 0
        
        # Try loading custom models
        for model_type, model_path in self.model_paths.items():
            path = Path(model_path)
            
            # Additional fallback check for best.pt at root if absolute path fails
            if model_type == 'custom' and not path.exists():
                path = Path('best.pt')

            if path.exists() or model_type == 'fallback':
                try:
                    logger.info(f"🔍 Loading {model_type} model from: {path if path.exists() else model_path}")
                    model = YOLO(str(path) if path.exists() else model_path)
                    model.to(self.device)
                    self.models[model_type] = model
                    logger.info(f"✅ Loaded {model_type} model")
                    models_loaded += 1
                except Exception as e:
                    logger.error(f"❌ Failed to load {model_type} model: {e}")
        
        self.model_loaded = models_loaded > 0
        logger.info(f"🎯 AI Engine ready with {models_loaded} model(s): {list(self.models.keys())}")
        return self.model_loaded
    
    async def detect(self, frame: np.ndarray, camera_id: str) -> dict:
        """
        Run detection on frame using loaded models (Multi-model Human Detection)
        Optimized for 50 FPS with redundant custom + fallback strategy
        """
        if not self.model_loaded:
            return {
                'camera_id': camera_id,
                'boxes': [],
                'labels': [],
                'confidences': [],
                'count': 0
            }
        
        # Resize frame for performance (640x480 max)
        height, width = frame.shape[:2]
        scale = 1.0
        if width > 640:
            scale = 640 / width
            new_width = 640
            new_height = int(height * scale)
            detection_frame = cv2.resize(frame, (new_width, new_height))
        else:
            detection_frame = frame
        
        all_boxes = []
        all_labels = []
        all_confidences = []
        
        # Run inference on each model
        for model_type, model in self.models.items():
            try:
                # Optimized: For fallback YOLO, only detect persons (class 0)
                if model_type == 'fallback':
                    results = model(detection_frame, conf=self.confidence_threshold, classes=[0], verbose=False)
                else:
                    results = model(detection_frame, conf=self.confidence_threshold, verbose=False)
                
                for result in results:
                    boxes = result.boxes
                    if boxes is None: continue
                    
                    for box in boxes:
                        # Extract box coordinates
                        coords = box.xyxy[0].cpu().numpy()
                        x1, y1, x2, y2 = coords
                        
                        # Scale back to original size
                        if scale != 1.0:
                            x1, y1, x2, y2 = x1 / scale, y1 / scale, x2 / scale, y2 / scale
                        
                        conf = float(box.conf[0].cpu().numpy())
                        cls = int(box.cls[0].cpu().numpy())
                        
                        # Get class name
                        class_name = result.names[cls] if hasattr(result, 'names') else 'Unknown'
                        
                        # Map to our class names and filter for Human only
                        label = self.class_names.get(class_name.lower())
                        if label != 'Human' and class_name.lower() not in ['person', 'human']:
                            continue
                        
                        # Final label is always 'Human' as per user request
                        label = 'Human'
                        
                        # Add detection
                        all_boxes.append([int(x1), int(y1), int(x2), int(y2)])
                        all_labels.append(label)
                        all_confidences.append(conf)
                        
            except Exception as e:
                logger.error(f"❌ Detection error with {model_type}: {e}")
        
        return {
            'camera_id': camera_id,
            'boxes': all_boxes,
            'labels': all_labels,
            'confidences': all_confidences,
            'count': len(all_boxes)
        }

