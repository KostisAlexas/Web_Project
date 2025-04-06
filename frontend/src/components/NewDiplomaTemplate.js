// NewDiplomaTemplate.jsx
import React, { useState } from 'react';
import { createDiploma } from '../features/professor/diplomaService';
import './NewDiplomaTemplate.css';

const NewDiplomaTemplate = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    file: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      file: e.target.files[0]
    }));
  };

  const clearForm = () => {
    setFormData({
      title: '',
      description: '',
      file: null
    });
    setError(null);
    setSuccess(false);
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Παρακαλώ συμπληρώστε τον τίτλο και την περιγραφή');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createDiploma({
        title: formData.title.trim(),
        description: formData.description.trim(),  // Σωστό όνομα πεδίου
        file: formData.file
      });
      setSuccess(true);
      clearForm();
    } catch (err) {
      console.error('Error creating diploma:', err);
      setError('Κάτι πήγε στραβά. Παρακαλώ δοκιμάστε ξανά.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="new-diploma-template">
      <h2 className="form-title">Νέο Πρότυπο Διπλώματος</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Τίτλος *</label>
          <input
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Εισάγετε τίτλο"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Περιγραφή *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Εισάγετε περιγραφή"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="file">Αρχείο</label>
          <input
            id="file"
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx"
            disabled={loading}
          />
          <small className="file-info">Αποδεκτοί τύποι: PDF, DOC, DOCX</small>
        </div>

        {error && <div className="error-message" role="alert">{error}</div>}
        {success && (
          <div className="success-message" role="alert">
            Το πρότυπο διπλώματος δημιουργήθηκε με επιτυχία!
          </div>
        )}

        <div className="action-buttons">
          <button
            type="button"
            className="clear-button"
            onClick={clearForm}
            disabled={loading}
          >
            🗑
          </button>
          <button
            type="submit"
            className="save-button"
            disabled={loading}
          >
            {loading ? '...' : '✔'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewDiplomaTemplate;