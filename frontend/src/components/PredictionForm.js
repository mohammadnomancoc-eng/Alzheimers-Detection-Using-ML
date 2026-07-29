import React, { useState, useRef } from 'react';
import { predictAlzheimer } from '../services/api';
import './PredictionForm.css';

const PredictionForm = ({ onPredictionComplete }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    age: '',
    gender: 'male',
    doctor_name: '',
    email: '',
    city: '',
    patient_code: '',
    consent_given: 'no',
    image: null
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      if (!file.type.match('image.*')) {
        setError('Please upload an image file (JPG, PNG, JPEG)');
        return;
      }
      
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size should be less than 10MB');
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        image: file
      }));
      
      setError('');
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      
      // Check file type
      if (!file.type.match('image.*')) {
        setError('Please upload an image file (JPG, PNG, JPEG)');
        return;
      }
      
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size should be less than 10MB');
        return;
      }
      
      // Create a fake event object to reuse handleFileChange
      const fakeEvent = {
        target: {
          files: [file]
        }
      };
      handleFileChange(fakeEvent);
    }
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Validate form
  if (formData.consent_given !== 'yes') {
    setError('You must give consent to proceed');
    return;
  }
  
  if (!formData.image) {
    setError('Please upload an MRI scan image');
    return;
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.email)) {
    setError('Please enter a valid email address');
    return;
  }
  
  // Validate age
  const age = parseInt(formData.age);
  if (isNaN(age) || age < 1 || age > 120) {
    setError('Please enter a valid age (1-120)');
    return;
  }
  
  setLoading(true);
  setError('');

  try {
    // Make API call
    const result = await predictAlzheimer(formData);
    
    console.log('Prediction result:', result);
    
    // Pass result to parent component
    onPredictionComplete({
      ...result,
      patientInfo: { ...formData }
    });

  } catch (err) {
    console.error('Prediction error:', err);
    setError(err.message || 'Failed to process prediction. Please try again.');
  } finally {
    setLoading(false);
  }
};

  const removeFile = () => {
    setFormData(prev => ({...prev, image: null}));
    setPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="prediction-form-container">
      <h2>Upload MRI Scan for Analysis</h2>
      <form onSubmit={handleSubmit} className="prediction-form">
        
        <div className="form-row">
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              required
              placeholder="Enter full name"
            />
          </div>
          
          <div className="form-group">
            <label>Age *</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              required
              min="1"
              max="120"
              placeholder="Age"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Gender *</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Patient Code</label>
            <input
              type="text"
              name="patient_code"
              value={formData.patient_code}
              onChange={handleChange}
              placeholder="Optional patient code"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Doctor's Name</label>
            <input
              type="text"
              name="doctor_name"
              value={formData.doctor_name}
              onChange={handleChange}
              placeholder="Optional"
            />
          </div>
          
          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="email@example.com"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="City"
            />
          </div>
          
          <div className="form-group">
            <label>Consent Given *</label>
            <select
              name="consent_given"
              value={formData.consent_given}
              onChange={handleChange}
              required
            >
              <option value="no">No</option>
              <option value="yes">Yes, I give consent</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>MRI Scan Image *</label>
          <div 
            className={`file-upload-area ${dragOver ? 'drag-over' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="file-input-wrapper">
              <input
                type="file"
                id="mri-upload"
                name="image"
                accept="image/*"
                onChange={handleFileChange}
                required
                className="file-input"
                ref={fileInputRef}
              />
              <label htmlFor="mri-upload" className="file-input-label">
                <div className="upload-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                </div>
                <div className="upload-text">
                  <span className="browse-text">Click to browse</span>
                  <span className="drag-text">or drag and drop</span>
                </div>
                <div className="file-types">JPG, PNG, JPEG up to 10MB</div>
              </label>
            </div>
            
            {formData.image ? (
              <div className="selected-file-info">
                <div className="file-preview">
                  <div className="file-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                      <polyline points="13 2 13 9 20 9"></polyline>
                    </svg>
                  </div>
                  <div className="file-details">
                    <span className="file-name">{formData.image.name}</span>
                    <span className="file-size">
                      {(formData.image.size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>
                  <button 
                    type="button" 
                    className="remove-file"
                    onClick={removeFile}
                  >
                    ×
                  </button>
                </div>
              </div>
            ) : (
              <div className="no-file-selected">
                No file chosen
              </div>
            )}
            
            {preview && (
              <div className="image-preview">
                <div className="preview-header">
                  <h4>Image Preview</h4>
                  <button 
                    type="button" 
                    className="close-preview"
                    onClick={() => setPreview('')}
                  >
                    ×
                  </button>
                </div>
                <div className="preview-container">
                  <img src={preview} alt="MRI Scan Preview" />
                </div>
              </div>
            )}
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <button 
          type="submit" 
          className="submit-btn"
          disabled={loading || formData.consent_given !== 'yes'}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Processing...
            </>
          ) : 'Analyze MRI Scan'}
        </button>
        
        <p className="disclaimer">
          * This tool is for research purposes only. Always consult with qualified healthcare professionals for medical diagnosis.
          All uploaded data is processed securely and deleted after analysis.
        </p>
      </form>
    </div>
  );
};

// Make sure to export default
export default PredictionForm;