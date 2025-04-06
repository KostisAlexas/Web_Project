import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from './authService';
import './Login.css';

function Login() {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const dashboardUrl = await authService.login(id, password);
      navigate(dashboardUrl);
    } catch (error) {
      console.error('Login error:', error.response || error.message);
      alert('Σφάλμα σύνδεσης: Ελέγξτε τα στοιχεία σας.');
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="login-header">
          <div className="back-link" onClick={handleBack}>
          ⏴Πίσω
          </div>
          <h2 className="login-heading">Σύνδεση</h2>
        </div>
        <form onSubmit={(e) => e.preventDefault()}>
          <label htmlFor="email" className="login-label">ID:</label>
          <input
            type="text"
            id="email"
            className="login-input"
            placeholder="Εισαγωγή ID"
            value={id}
            onChange={(e) => setId(e.target.value)}
          />
          <label htmlFor="password" className="login-label">Κωδικός:</label>
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            className="login-input"
            placeholder="Εισαγωγή Κωδικού"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="checkbox-container">
            <input
              type="checkbox"
              id="show-password"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
            />
            <label htmlFor="show-password" className="checkbox-label">Εμφάνισε Κωδικό</label>
          </div>
          <button className="login-button" onClick={handleLogin}>ΣΥΝΔΕΣΟΥ</button>
        </form>
        <div className="login-links">
          <a href="/#" className="login-link">Ξέχασα Κωδικό / ID</a>
          <a href="/#" className="login-link">Τα στοιχεία μου ειναι έγγυρα αλλα δεν συνδέομαι</a>
        </div>
      </div>
    </div>
  );
}

export default Login;
