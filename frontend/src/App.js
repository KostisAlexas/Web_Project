import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Footer from './components/Footer';
import PublicRoutes from './routes/PublicRoutes';
import AuthRoutes from './routes/AuthRoutes';
import ProfessorRoutes from './routes/ProfessorRoutes';
import StudentRoutes from './routes/StudentRoutes';
import SecretariatRoutes from './routes/SecretariatRoutes';

function App() {
  return (
    <Router>
      <div className="app-container">
        <PublicRoutes />
        <AuthRoutes />
        <ProfessorRoutes />
        <StudentRoutes />
        <SecretariatRoutes />
        <Footer />
      </div>
    </Router>
  );
}

export default App;