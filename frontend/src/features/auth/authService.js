import axios from 'axios';

const API_URL = 'http://localhost:3000/api/auth';

// Login method
const login = async (id, password) => {
  const response = await axios.post(
    `${API_URL}/login`,
    { id, password },
    { withCredentials: true } // Ενεργοποίηση cookies
  );
  return response.data.dashboard;
};

// Logout method
const logout = async () => {
  try {
    await axios.post(`${API_URL}/logout`, {}, { withCredentials: true });
  } catch (error) {
    console.error('Error during logout:', error);
    throw error;
  }
};


const authService = { login, logout };
export default authService;

