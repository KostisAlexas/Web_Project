import axios from 'axios';

const API_URL = 'http://localhost:3000/api/professors/diplomas';


export const createDiploma = async ({ title, description, file }) => {
  const formData = new FormData();
  formData.append('title', title.trim());
  formData.append('description', description.trim());
  if (file) {
    formData.append('file', file);
  }

  try {
    const response = await axios.post(API_URL, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('Error creating diploma:', error);
    throw error;
  }
};


const getDiplomas = async () => {
  try {
    const response = await axios.get(API_URL, { withCredentials: true });
    return response.data.diplomas || [];
  } catch (error) {
    console.error('Error fetching diplomas:', error);
    throw error;
  }
};

const uploadFile = async (diplomaId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('diplomaId', diplomaId);

  try {
    const response = await axios.post(`${API_URL}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

const searchStudents = async (query) => {
  try {
    const response = await axios.get(`${API_URL}/searchStudents`, {
      params: { query },
      withCredentials: true,
    });
    return response.data.students;
  } catch (error) {
    console.error('Error searching students:', error);
    throw error;
  }
};

const assignStudent = async (diplomaId, studentId) => {
  try {
    const response = await axios.post(
      `${API_URL}/assignStudent`,
      { diplomaId, studentId },
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error('Error assigning student:', error);
    throw error;
  }
};

const unassignStudent = async (diplomaId) => {
  try {
    const response = await axios.post(
      `${API_URL}/unassignStudent`,
      { diplomaId },
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error('Error unassigning student:', error);
    throw error;
  }
};

const changeDiplomaStatus = async (diplomaId) => {
  try {
    const response = await axios.post(
      `${API_URL}/changeStatus`,
      { diplomaId }, // Only send diplomaId in the request body
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error('Error changing diploma status:', error);
    throw error;
  }
};


export const diplomaService = {
  getDiplomas,
  createDiploma,
  uploadFile,
  searchStudents,
  assignStudent,
  unassignStudent,
  changeDiplomaStatus,
};

export default diplomaService;
