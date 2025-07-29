import apiClient from './apiClient';

const fileAPI = {
  // Upload a CSV file
  uploadFile: async (file, fileType) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileType', fileType);
    
    return apiClient.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  // Get all files
  getFiles: async () => {
    return apiClient.get('/files');
  },
  
  // Get a single file by ID
  getFile: async (fileId) => {
    return apiClient.get(`/files/${fileId}`);
  },
  
  // Update file status
  updateFileStatus: async (fileId, status) => {
    return apiClient.put(`/files/${fileId}/status`, { status });
  },
  
  // Delete a file
  deleteFile: async (fileId) => {
    return apiClient.delete(`/files/${fileId}`);
  },
  
  // Get files by type
  getFilesByType: async (fileType) => {
    return apiClient.get(`/files?fileType=${fileType}`);
  }
};

export default fileAPI;
