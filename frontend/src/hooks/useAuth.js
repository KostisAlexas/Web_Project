import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api/auth';

function useAuth() {
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await axios.get(`${API_URL}/check`, { withCredentials: true });
        setAuthenticated(true);
      } catch {
        setAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  return authenticated;
}

export default useAuth;
