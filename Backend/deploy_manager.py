"""
Guard-X Deploy Manager
This module manages camera deployment authorization and lifecycle.

Data flow:
Admin Deploy Command → Validate → Authorize Camera → Track Status

Responsibilities:
- Track which cameras are deployed vs idle
- Validate admin authorization for deploy/stop commands
- Reject unauthorized frame streams from non-deployed cameras
- Maintain deployment state across connections
- Provide deployment status to admin dashboard

Deployment States:
- IDLE: Camera connected but not authorized to stream
- DEPLOYED: Camera authorized and actively streaming
- DISCONNECTED: Camera lost connection
"""

import logging
from typing import Dict, Set, Optional
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class DeployManager:
    """Manages camera deployment authorization and tracking"""
    
    def __init__(self):
        # Track deployment status
        self.deployed_cameras: Dict[str, dict] = {}  # sid -> deployment info
        self.deployment_history: list = []  # Historical deployment records
        
    def deploy_camera(self, camera_sid: str, camera_id: str, admin_username: str) -> bool:
        """
        Deploy a camera for streaming
        
        Args:
            camera_sid: Socket.IO session ID of camera
            camera_id: Camera identifier
            admin_username: Username of admin issuing command
            
        Returns:
            True if deployment successful, False otherwise
        """
        if camera_sid in self.deployed_cameras:
            logger.warning(f"⚠️ Camera already deployed: {camera_id}")
            return False
        
        deployment_info = {
            'camera_sid': camera_sid,
            'camera_id': camera_id,
            'deployed_by': admin_username,
            'deployed_at': datetime.now().isoformat(),
            'status': 'DEPLOYED',
            'frame_count': 0
        }
        
        self.deployed_cameras[camera_sid] = deployment_info
        
        # Add to history
        self.deployment_history.append({
            **deployment_info,
            'action': 'DEPLOY'
        })
        
        logger.info(f"🚀 Camera deployed: {camera_id} by {admin_username}")
        return True
    
    def stop_camera(self, camera_sid: str, admin_username: str) -> bool:
        """
        Stop a deployed camera
        
        Args:
            camera_sid: Socket.IO session ID of camera
            admin_username: Username of admin issuing command
            
        Returns:
            True if stop successful, False otherwise
        """
        if camera_sid not in self.deployed_cameras:
            logger.warning(f"⚠️ Camera not deployed: {camera_sid}")
            return False
        
        deployment_info = self.deployed_cameras[camera_sid]
        camera_id = deployment_info['camera_id']
        
        # Add to history
        self.deployment_history.append({
            'camera_sid': camera_sid,
            'camera_id': camera_id,
            'stopped_by': admin_username,
            'stopped_at': datetime.now().isoformat(),
            'action': 'STOP',
            'frame_count': deployment_info['frame_count']
        })
        
        # Remove from deployed
        del self.deployed_cameras[camera_sid]
        
        logger.info(f"🛑 Camera stopped: {camera_id} by {admin_username}")
        return True
    
    def is_deployed(self, camera_sid: str) -> bool:
        """
        Check if camera is currently deployed
        
        Args:
            camera_sid: Socket.IO session ID of camera
            
        Returns:
            True if deployed, False otherwise
        """
        return camera_sid in self.deployed_cameras
    
    def increment_frame_count(self, camera_sid: str):
        """
        Increment frame count for deployed camera
        
        Args:
            camera_sid: Socket.IO session ID of camera
        """
        if camera_sid in self.deployed_cameras:
            self.deployed_cameras[camera_sid]['frame_count'] += 1
    
    def get_deployment_info(self, camera_sid: str) -> Optional[dict]:
        """
        Get deployment information for a camera
        
        Args:
            camera_sid: Socket.IO session ID of camera
            
        Returns:
            Deployment info dict or None if not deployed
        """
        return self.deployed_cameras.get(camera_sid)
    
    def get_all_deployed(self) -> Dict[str, dict]:
        """
        Get all currently deployed cameras
        
        Returns:
            Dict of deployed cameras {sid: deployment_info}
        """
        return self.deployed_cameras.copy()
    
    def get_deployment_history(self, limit: int = 100) -> list:
        """
        Get deployment history
        
        Args:
            limit: Maximum number of records to return
            
        Returns:
            List of deployment history records
        """
        return self.deployment_history[-limit:]
    
    def camera_disconnected(self, camera_sid: str):
        """
        Handle camera disconnection
        
        Args:
            camera_sid: Socket.IO session ID of camera
        """
        if camera_sid in self.deployed_cameras:
            deployment_info = self.deployed_cameras[camera_sid]
            camera_id = deployment_info['camera_id']
            
            # Add to history
            self.deployment_history.append({
                'camera_sid': camera_sid,
                'camera_id': camera_id,
                'disconnected_at': datetime.now().isoformat(),
                'action': 'DISCONNECT',
                'frame_count': deployment_info['frame_count']
            })
            
            # Remove from deployed
            del self.deployed_cameras[camera_sid]
            
            logger.info(f"📡 Camera disconnected: {camera_id}")


# Global deploy manager instance
deploy_manager = DeployManager()


def get_deploy_manager() -> DeployManager:
    """Get the global deploy manager instance"""
    return deploy_manager

