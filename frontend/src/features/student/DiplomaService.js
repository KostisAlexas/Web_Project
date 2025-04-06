import axios from 'axios';

const API_URL = 'http://localhost:3000/api/students/diplomas';

const diplomaService = {
  getDiplomas: async () => {
    const response = await axios.get(API_URL, { withCredentials: true });
    return response.data.diplomas || [];
  },
  
  uploadFile: async (diplomaId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post(
      `${API_URL}/upload/${diplomaId}`, 
      formData, 
      { 
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      }
    );
    return response.data;
  },

  // Προσθήκη της νέας μεθόδου
  getFilesByDiplomaId: async (diplomaId) => {
    try {
      const response = await axios.get(`${API_URL}/files/${diplomaId}`, { 
        withCredentials: true 
      });
      console.log('Files response:', response.data); // Για debugging
      return response.data.files || [];
    } catch (error) {
      console.error('Error fetching files:', error);
      return [];
    }
  },
  
  getStudentFiles: async () => {
    const response = await axios.get(`${API_URL}/files`, { withCredentials: true });
    return response.data.files || [];
  }
};

export default diplomaService;