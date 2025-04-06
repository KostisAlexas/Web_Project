import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './NavBar.css';

const NavBar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  // Ελέγχει αν υπάρχει το token
  const checkToken = () => {
    const cookies = document.cookie.split(';');
    return cookies.some(cookie => cookie.trim().startsWith('token='));
  };

  useEffect(() => {
    // Ελέγχουμε την ύπαρξη του token κατά το mount
    setIsLoggedIn(checkToken());
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout', {}, { withCredentials: true });
      setIsLoggedIn(false); // Ενημέρωση κατάστασης
      navigate('/'); // Ανακατεύθυνση στην αρχική σελίδα
    } catch (error) {
      console.error('Σφάλμα κατά την αποσύνδεση:', error);
    }
  };

  const handleClick = () => {
    if (isLoggedIn) {
      handleLogout();
    } else {
      navigate('/login');
    }
  };

  const buttonText = isLoggedIn ? 'Αποσύνδεση' : 'Σύνδεση';

  return (
    <nav className="navbar">
      <div className="button-container">
        <button onClick={handleClick}>
          {buttonText}
        </button>
      </div>
    </nav>
  );
};

export default NavBar;
