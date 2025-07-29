import api from "./apiClient";

const shipmentAPI = {
  // Get all shipments
  getShipments: async (companyId = null) => {
    try {
      const params = companyId ? { companyId } : {};
      const response = await api.get("/shipments", { params });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get shipment by ID
  getShipmentById: async (shipmentId) => {
    try {
      const response = await api.get(`/shipments/${shipmentId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Create shipment
  createShipment: async (shipmentData) => {
    try {
      const response = await api.post("/shipments", shipmentData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Update shipment
  updateShipment: async (shipmentId, shipmentData) => {
    try {
      const response = await api.put(`/shipments/${shipmentId}`, shipmentData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Delete shipment
  deleteShipment: async (shipmentId) => {
    try {
      const response = await api.delete(`/shipments/${shipmentId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Upload shipment document
  uploadShipmentDocument: async (shipmentId, formData) => {
    try {
      const response = await api.post(`/shipments/${shipmentId}/documents`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get shipment statistics
  getShipmentStats: async () => {
    try {
      const response = await api.get("/shipments/stats");
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Track shipment
  trackShipment: async (trackingNumber) => {
    try {
      const response = await api.get(`/shipments/track/${trackingNumber}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get shipment documents
  getShipmentDocuments: async (shipmentId) => {
    try {
      const response = await api.get(`/shipments/${shipmentId}/documents`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Download shipment document
  downloadShipmentDocument: async (shipmentId, documentId) => {
    try {
      const response = await api.get(`/shipments/${shipmentId}/documents/${documentId}/download`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Delete shipment document
  deleteShipmentDocument: async (shipmentId, documentId) => {
    try {
      const response = await api.delete(`/shipments/${shipmentId}/documents/${documentId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
};

export default shipmentAPI;
