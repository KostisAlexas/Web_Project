import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import './DiplomaCard.css';

const DiplomaCard = ({ diploma, onHeightChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const cardRef = useRef(null);
  const fileInputRef = useRef(null);

  const toggleExpand = () => setIsExpanded((prev) => !prev);

  useEffect(() => {
    if (cardRef.current) {
      const height = isExpanded ? cardRef.current.scrollHeight : cardRef.current.offsetHeight;
      onHeightChange(diploma.id, height);
    }
  }, [isExpanded, onHeightChange, diploma.id, uploadStatus]);

  const {
    t: title,
    d: description,
    assignee,
    supervisor,
    m1,
    m2,
    link,
    created,
    exam_date: examDate,
  } = diploma;

  const handleFileSelect = (event) => {
    event.stopPropagation(); // Prevent card expansion when clicking file input
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setUploadStatus('Επιλέχθηκε: ' + file.name);
    }
  };

  const handleUpload = async (event) => {
    event.stopPropagation(); // Prevent card expansion when clicking upload button
    
    if (!selectedFile) {
      setUploadStatus('Παρακαλώ επιλέξτε ένα αρχείο πρώτα.');
      return;
    }

    try {
      setUploadStatus('Μεταφόρτωση...');
      
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('diplomaId', diploma.id);

      // Εδώ θα προσθέσετε το endpoint του backend σας
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Σφάλμα κατά τη μεταφόρτωση');
      }

      setUploadStatus('Επιτυχής μεταφόρτωση!');
      setSelectedFile(null);
      fileInputRef.current.value = ''; // Καθαρισμός του input
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('Σφάλμα κατά τη μεταφόρτωση. Παρακαλώ δοκιμάστε ξανά.');
    }
  };

  return (
    <div
      ref={cardRef}
      className={`diploma-card ${isExpanded ? 'expanded' : ''}`}
      onClick={toggleExpand}
    >
      <div className="diploma-header" role="button" tabIndex={0} aria-expanded={isExpanded}>
        <h2>{title || 'No Title'}</h2>
        <p className="supervisor"><strong>Επιβλέποντας:</strong> {supervisor || 'Unknown'}</p>
        <span className="toggle-icon">{isExpanded ? '\u25BC' : '\u25B6'}</span>
      </div>
      {isExpanded && (
        <div className="diploma-details">
          <p><i>「 {description || 'No Description Available'} 」</i></p>
          <p><strong>Εκπονείται απο:</strong> {assignee}</p>
          <p><strong>1ο Μέλος:</strong> {m1}</p>
          <p><strong>2ο Μέλος:</strong> {m2}</p>
          <p><strong>Δημιουργήθηκε:</strong> {new Date(created).toLocaleDateString()}</p>
          {examDate && <p><strong>Ημερομηνία Εξέτασης:</strong> {new Date(examDate).toLocaleDateString()}</p>}
          
          {/* File Upload Section */}
          <div className="file-upload-section" onClick={(e) => e.stopPropagation()}>
            <h3>Μεταφόρτωση Αρχείου</h3>
            <div className="file-upload-controls">
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="file-input"
                accept=".pdf,.doc,.docx"
              />
              <button 
                onClick={handleUpload}
                className="upload-button"
                disabled={!selectedFile}
              >
                Μεταφόρτωση
              </button>
            </div>
            {uploadStatus && (
              <p className={`upload-status ${uploadStatus.includes('Επιτυχής') ? 'success' : ''}`}>
                {uploadStatus}
              </p>
            )}
          </div>

          <a href={link} target="_blank" rel="noopener noreferrer" className="view-link">
            Περισσότερα
          </a>
        </div>
      )}
    </div>
  );
};

DiplomaCard.propTypes = {
  diploma: PropTypes.shape({
    id: PropTypes.number.isRequired,
    t: PropTypes.string,
    d: PropTypes.string,
    assignee: PropTypes.string,
    supervisor: PropTypes.string,
    m1: PropTypes.string,
    m2: PropTypes.string,
    link: PropTypes.string,
    created: PropTypes.string,
    exam_date: PropTypes.string,
  }).isRequired,
  onHeightChange: PropTypes.func.isRequired,
};

export default DiplomaCard;