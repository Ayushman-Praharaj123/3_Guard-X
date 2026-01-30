"""
Guard-X Camera Stream Handler
This module processes incoming video frames from all camera sources.

Data flow:
Socket.IO Frame → Decode JPEG → Numpy Array → AI Engine → Detection Result

Responsibilities:
- Receive base64-encoded JPEG frames from Socket.IO
- Decode frames to OpenCV format (numpy arrays)
- Forward frames to AI engine for detection
- Handle both USB camera and remote laptop sources identically
- Return detection results with bounding boxes and labels
- Optimize frame processing for 8-10 FPS target

Frame Format:
- Input: base64-encoded JPEG string
- Processing: OpenCV numpy array (BGR)
- Output: Detection dict with boxes, labels, confidences
"""

import cv2
import numpy as np
import base64
import logging
from typing import Optional
from ai_engine import AIEngine
import asyncio

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global AI engine instance
ai_engine = None

# Frame caching for ultra-high FPS performance
camera_frame_counts = {}  # camera_id -> count
camera_detections_cache = {}  # camera_id -> last_detections


async def initialize_ai_engine():
    """Initialize the AI engine on startup"""
    global ai_engine
    if ai_engine is None:
        ai_engine = AIEngine()
        await ai_engine.load_models()
        logger.info("✅ Camera stream handler initialized with AI engine")


def decode_frame(frame_base64: str) -> Optional[np.ndarray]:
    """
    Decode base64 JPEG frame to OpenCV numpy array
    
    Args:
        frame_base64: Base64-encoded JPEG image string
        
    Returns:
        OpenCV image as numpy array (BGR format) or None if decode fails
    """
    try:
        # Remove data URL prefix if present
        if ',' in frame_base64:
            frame_base64 = frame_base64.split(',')[1]
        
        # Decode base64 to bytes
        frame_bytes = base64.b64decode(frame_base64)
        
        # Convert bytes to numpy array
        nparr = np.frombuffer(frame_bytes, np.uint8)
        
        # Decode JPEG to OpenCV image
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if frame is None:
            logger.error("❌ Failed to decode JPEG frame")
            return None
        
        return frame
        
    except Exception as e:
        logger.error(f"❌ Frame decode error: {e}")
        return None


def encode_frame(frame: np.ndarray, quality: int = 60) -> Optional[str]:
    """
    Encode OpenCV frame to base64 JPEG
    
    Args:
        frame: OpenCV image as numpy array
        quality: JPEG quality (0-100), default 60 for performance
        
    Returns:
        Base64-encoded JPEG string or None if encode fails
    """
    try:
        # Encode frame to JPEG
        encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), quality]
        _, buffer = cv2.imencode('.jpg', frame, encode_param)
        
        # Convert to base64
        frame_base64 = base64.b64encode(buffer).decode('utf-8')
        
        return frame_base64
        
    except Exception as e:
        logger.error(f"❌ Frame encode error: {e}")
        return None


def draw_detections(frame: np.ndarray, detections: dict) -> np.ndarray:
    """
    Draw bounding boxes and labels on frame
    
    Args:
        frame: OpenCV image
        detections: Detection dict with boxes, labels, confidences
        
    Returns:
        Annotated frame
    """
    annotated = frame.copy()
    
    boxes = detections.get('boxes', [])
    labels = detections.get('labels', [])
    confidences = detections.get('confidences', [])
    
    # Color mapping for different threat types
    color_map = {
        'Human': (0, 255, 255),    # Yellow
        'Weapon': (0, 0, 255),      # Red
        'Vehicle': (255, 0, 0),     # Blue
    }
    
    for i, box in enumerate(boxes):
        x1, y1, x2, y2 = box
        label = labels[i] if i < len(labels) else 'Unknown'
        conf = confidences[i] if i < len(confidences) else 0.0
        
        # Get color for this label
        color = color_map.get(label, (0, 255, 0))
        
        # Draw bounding box
        cv2.rectangle(annotated, (x1, y1), (x2, y2), color, 2)
        
        # Draw label background
        label_text = f"{label} {conf:.2f}"
        (text_width, text_height), _ = cv2.getTextSize(
            label_text, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1
        )
        cv2.rectangle(
            annotated,
            (x1, y1 - text_height - 10),
            (x1 + text_width, y1),
            color,
            -1
        )
        
        # Draw label text
        cv2.putText(
            annotated,
            label_text,
            (x1, y1 - 5),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.5,
            (0, 0, 0),
            1
        )
    
    return annotated


async def process_camera_frame(frame_base64: str, camera_id: str, camera_sid: str) -> Optional[dict]:
    """
    Process incoming camera frame through AI pipeline
    
    Args:
        frame_base64: Base64-encoded JPEG frame
        camera_id: Camera identifier
        camera_sid: Socket.IO session ID
        
    Returns:
        Detection result dict with annotated frame and detections
    """
    global ai_engine, camera_frame_counts, camera_detections_cache
    
    if ai_engine is None:
        await initialize_ai_engine()
    
    # Decode frame
    frame = decode_frame(frame_base64)
    if frame is None:
        return None
    
    # Initialize state for new cameras
    if camera_id not in camera_frame_counts:
        camera_frame_counts[camera_id] = 0
        camera_detections_cache[camera_id] = {'boxes': [], 'labels': [], 'confidences': [], 'count': 0}
    
    camera_frame_counts[camera_id] += 1
    
    # Run AI detection every 5th frame to maintain 50+ FPS smoothness
    # We use cached boxes for intermediate frames
    if camera_frame_counts[camera_id] % 5 == 0:
        detections = await ai_engine.detect(frame, camera_id)
        camera_detections_cache[camera_id] = detections
        # Reset count periodically to prevent overflow (though unlikely)
        if camera_frame_counts[camera_id] > 1000:
            camera_frame_counts[camera_id] = 0
    else:
        detections = camera_detections_cache[camera_id]
    
    # Draw detections on frame (using current or cached detections)
    annotated_frame = draw_detections(frame, detections)
    
    # Encode annotated frame (Lower quality 40 for high FPS smoothness)
    annotated_base64 = encode_frame(annotated_frame, quality=40)
    
    if annotated_base64 is None:
        return None
    
    # Return complete result
    return {
        'camera_id': camera_id,
        'camera_sid': camera_sid,
        'frame': annotated_base64,
        'detections': detections,
        'timestamp': asyncio.get_event_loop().time()
    }

