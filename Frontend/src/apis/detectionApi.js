import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export async function detectHuman(file) {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await axios.post(`${API_URL}/detect`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 30000, // 30 seconds
    });

    // Handle military response format
    const data = response.data;
    
    // Check if it's the new military format
    if (data.detection) {
      return {
        success: true,
        boxes: data.detection.bounding_boxes || [],
        count: data.detection.targets_identified || 0,
        confidences: data.detection.confidence_scores || [],
        timestamp: data.timestamp,
        imageSize: data.image_metadata?.dimensions ? {
          width: parseInt(data.image_metadata.dimensions.split('x')[0]),
          height: parseInt(data.image_metadata.dimensions.split('x')[1])
        } : null,
        modelUsed: data.detection.model_used,
        processingTime: data.detection.processing_time,
        threatLevel: data.detection.threat_assessment,
        operationId: data.operation_id,
        operator: data.operator
      };
    }
    
    // Fallback for old format
    return {
      success: data.success || true,
      boxes: data.boxes || [],
      count: data.count || 0,
      confidences: data.confidence_scores || data.confidences || [],
      timestamp: data.timestamp,
      imageSize: data.image_size,
      modelUsed: data.model_used,
      processingTime: data.processing_time
    };
    
  } catch (error) {
    console.error("Detection API Error:", error);
    
    if (error.code === 'ECONNABORTED') {
      throw new Error("Detection timeout - processing took too long");
    }
    
    // Handle military error responses
    const errorMessage = error.response?.data?.detail || 
                        error.response?.data?.message || 
                        "Guard-X AI system connection failed";
    throw new Error(errorMessage);
  }
}

export async function checkHealth() {
  try {
    const response = await axios.get(`${API_URL}/health`);
    return response.data;
  } catch (error) {
    console.error("Health check failed:", error);
    return { status: 'offline', error: error.message };
  }
}

export async function getModelsInfo() {
  try {
    const response = await axios.get(`${API_URL}/models`);
    return response.data;
  } catch (error) {
    console.error("Models info failed:", error);
    return { available_models: [], active_model: null };
  }
}
