import React, { useState, useEffect } from 'react';
import StudentDiplomaCard from '../../components/StudentDiplomaCard';
import diplomaService from './DiplomaService';
//import './dashboard.css';

const Dashboard = () => {
  const [diplomas, setDiplomas] = useState([]); // Διπλωματικές εργασίες
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDiplomas = async () => {
      try {
        const diplomasData = await diplomaService.getDiplomas();
        setDiplomas(diplomasData);
      } catch (error) {
        console.error('Failed to fetch diplomas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDiplomas();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-message">
        <img
          src="/thesis_default_icon.png"
          alt="Loading..."
          className="message-image"
        />
      </div>
    );
  }

  if (!diplomas.length) {
    return (
      <div className="dashboard-message">
        <img
          src="/thesis_default_icon.png"
          alt="No diplomas available"
          className="message-image"
        />
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div>
        {/* Προβολή διπλωματικών και των αντίστοιχων αρχείων */}
        {diplomas.map((diploma) => (
          <StudentDiplomaCard key={diploma.id} diploma={diploma} />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
