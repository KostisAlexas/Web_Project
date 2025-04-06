import React, { useState } from 'react';
import './announcementObject.css';

const AnnouncementObject = ({ who, photo, what, when }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const defaultPhoto = '/profilePicks/default-profile-pick.png';

  const handleClick = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div 
      className={`announcement-container ${isExpanded ? 'expanded' : ''}`}
      onClick={handleClick}
    >
      <div className="announcement-header">
        <img
          src={photo || defaultPhoto}
          alt={`${who}'s profile`}
          className="announcement-photo"
        />
        <span className="announcement-who">{who}</span>
      </div>
      <div className="announcement-body">
        <p className="announcement-what">{what}</p>
        <p className="announcement-when">{new Date(when).toLocaleString()}</p>
        {!photo && <div className="announcement-fade"></div>}
      </div>
    </div>
  );
};

export default AnnouncementObject;