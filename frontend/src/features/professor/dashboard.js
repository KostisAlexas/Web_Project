import React, { useState, useEffect } from 'react';
import DiplomaCard from '../../components/DiplomaCard';
import NewDiplomaTemplate from '../../components/NewDiplomaTemplate';
import diplomaService from './diplomaService';
import './dashboard.css';

const Dashboard = () => {
  const [diplomas, setDiplomas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heights, setHeights] = useState({});
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);

  useEffect(() => {
    const fetchDiplomas = async () => {
      try {
        const data = await diplomaService.getDiplomas();
        setDiplomas(data);
      } catch (error) {
        console.error('Failed to fetch diplomas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDiplomas();
  }, []);

  const handleHeightChange = (id, height) => {
    setHeights((prevHeights) => ({ ...prevHeights, [id]: height }));
  };

  const calculatePositions = () => {
    let offset = 0;
    return diplomas.map((diploma) => {
      const height = heights[diploma.id] || 100;
      const position = offset;
      offset += height + 20;
      return { id: diploma.id, position };
    });
  };

  const toggleTemplate = (e) => {
    e.stopPropagation(); // Prevent interaction with the template from triggering the collapse
    setIsTemplateOpen((prev) => !prev);
  };

  const positions = calculatePositions();

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
      {/* Button and template */}
      <div className={`template-container ${isTemplateOpen ? 'expanded' : ''}`}>
        <div className="template-header" onClick={toggleTemplate}>
          <span className="plus-icon">{isTemplateOpen ? '-' : '+'}</span>
        </div>
        {isTemplateOpen && (
          <NewDiplomaTemplate onSave={() => setIsTemplateOpen(false)} />
        )}
      </div>

      {/* Existing diplomas */}
      <div
        style={{
          position: 'relative',
          height: positions[positions.length - 1]?.position + 150,
        }}
      >
        {positions.map(({ id, position }) => {
          const diploma = diplomas.find((d) => d.id === id);
          return (
            <div
              key={id}
              style={{
                position: 'absolute',
                top: `${position}px`,
                width: '100%',
              }}
            >
              <DiplomaCard
                diploma={diploma}
                onHeightChange={handleHeightChange}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;