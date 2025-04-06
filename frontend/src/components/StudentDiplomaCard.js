import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import diplomaService from '../features/student/DiplomaService';
import './DiplomaCard.css';

const StudentDiplomaCard = ({ diploma }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [files, setFiles] = useState([]); // Αρχεία που συνδέονται με τη διπλωματική
  const [previewFile, setPreviewFile] = useState(null); // Αρχείο για προεπισκόπηση

  // Επαναχρησιμοποιούμενη συνάρτηση για φόρτωση αρχείων
  const fetchFiles = useCallback(async () => {
    try {
      const filesData = await diplomaService.getFilesByDiplomaId(diploma.id);
      console.log('Fetched files:', filesData); // Προσθήκη για debugging
      setFiles(filesData);
    } catch (error) {
      console.error('Failed to fetch files:', error);
    }
  }, [diploma.id]);

  
  useEffect(() => {
    const fetchDiplomaFiles = async () => {
      try {
        const filesData = await diplomaService.getFilesByDiplomaId(diploma.id);
        console.log('Fetched files:', filesData);
        setFiles(filesData);
      } catch (error) {
        console.error('Failed to fetch files:', error);
        setFiles([]); // Σε περίπτωση σφάλματος, καθαρίζουμε τα αρχεία
      }
    };
  
    fetchDiplomaFiles();
  }, [diploma.id]); // Εξάρτηση μόνο από το diploma.id


  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setUploadStatus(`Selected: ${file.name}`);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadStatus('Please select a file first.');
      return;
    }
    try {
      setUploadStatus('Uploading...');
      await diplomaService.uploadFile(diploma.id, selectedFile);
      setUploadStatus('File uploaded successfully!');
      setSelectedFile(null);

      // Φόρτωση αρχείων μετά το upload
      fetchFiles();
    } catch {
      setUploadStatus('Upload failed. Please try again.');
    }
  };

  const handlePreview = (filePath) => {
    setPreviewFile(filePath); // Ορίζει το αρχείο για προεπισκόπηση
  };

  const handleClosePreview = () => {
    setPreviewFile(null); // Κλείνει το modal προεπισκόπησης
  };

  return (
    <div className="diploma-card expanded">
      <div className="diploma-header">
        <h2>{diploma.t || 'No Title'}</h2>
        <p><strong>Supervisor:</strong> {diploma.supervisor || 'Unknown'}</p>
      </div>
      <div className="diploma-details">
        <p><i>「 {diploma.d || 'No Description Available'} 」</i></p>
        <p><strong>Assignee:</strong> {diploma.assignee || 'Unknown'}</p>
        <p><strong>1st Member:</strong> {diploma.m1 || 'Unknown'}</p>
        <p><strong>2nd Member:</strong> {diploma.m2 || 'Unknown'}</p>
        <p><strong>Created:</strong> {new Date(diploma.created).toLocaleDateString()}</p>
        {diploma.exam_date && (
          <p><strong>Exam Date:</strong> {new Date(diploma.exam_date).toLocaleDateString()}</p>
        )}

        <div className="file-upload-section">
          <h3>Upload File</h3>
          <div className="file-upload-controls">
            <input
              type="file"
              onChange={handleFileSelect}
              className="file-input"
              accept=".pdf,.doc,.docx"
            />
            <button onClick={handleUpload} className="upload-button" disabled={!selectedFile}>
              Upload
            </button>
          </div>
          {uploadStatus && <p className="upload-status">{uploadStatus}</p>}
        </div>

        <div className="file-list-section">
  <h3>Uploaded Files</h3>
  {files.length === 0 ? (
    <p>No files available.</p>
  ) : (
    <ul>
      {files.map((file) => (
        <li key={file.id}>
          <span>{file.file_name}</span>
          <button 
            onClick={() => handlePreview(file.download_url)}
            className="preview-button"
          >
            Preview
          </button>
          <a
            href={file.download_url}
            download={file.file_name}
            className="download-link"
          >
            Download
          </a>
        </li>
      ))}
    </ul>
  )}
</div>

        {/* Modal για προεπισκόπηση */}
        {previewFile && (
          <div className="preview-modal">
            <div className="preview-header">
              <button onClick={handleClosePreview} className="close-button">
                Close
              </button>
            </div>
            <iframe
              src={previewFile}
              title="File Preview"
              className="preview-iframe"
            ></iframe>
          </div>
        )}
      </div>
    </div>
  );
};

StudentDiplomaCard.propTypes = {
  diploma: PropTypes.shape({
    id: PropTypes.number.isRequired,
    t: PropTypes.string,
    d: PropTypes.string,
    assignee: PropTypes.string,
    supervisor: PropTypes.string,
    m1: PropTypes.string,
    m2: PropTypes.string,
    created: PropTypes.string,
    exam_date: PropTypes.string,
  }).isRequired,
};

export default StudentDiplomaCard;
