@app.get("/api/detections/swarm")
async def get_swarm_detections():
    """Get detection data for all drones in swarm"""
    try:
        # Mock swarm detection data - replace with real drone API
        swarm_data = {
            "GUARD-01": {"detection": "Clear", "confidence": 0.0},
            "GUARD-02": {"detection": "Human", "confidence": 0.85},
            "GUARD-03": {"detection": "Clear", "confidence": 0.0},
            "GUARD-04": {"detection": "Human", "confidence": 0.92},
            "GUARD-05": {"detection": "Unknown", "confidence": 0.0}
        }
        
        logger.info("✅ Swarm detection data retrieved")
        return JSONResponse(swarm_data)
        
    except Exception as e:
        logger.error(f"❌ Swarm detection failed: {e}")
        return JSONResponse({
            "error": "Failed to get swarm detection data"
        }, status_code=500)

@app.get("/api/detections/recent")
async def get_recent_detections():
    """Get recent detection history"""
    try:
        # Mock recent detections - replace with real database
        recent_data = {
            "count": 2,
            "detections": [
                {
                    "drone_id": "GUARD-02",
                    "detection": "Human",
                    "confidence": 0.85,
                    "timestamp": time.time() - 300,
                    "location": {"lat": 28.7055, "lon": 77.1100}
                },
                {
                    "drone_id": "GUARD-04", 
                    "detection": "Human",
                    "confidence": 0.92,
                    "timestamp": time.time() - 150,
                    "location": {"lat": 28.7020, "lon": 77.0950}
                }
            ]
        }
        
        logger.info("✅ Recent detections retrieved")
        return JSONResponse(recent_data)
        
    except Exception as e:
        logger.error(f"❌ Recent detections failed: {e}")
        return JSONResponse({
            "error": "Failed to get recent detections"
        }, status_code=500)