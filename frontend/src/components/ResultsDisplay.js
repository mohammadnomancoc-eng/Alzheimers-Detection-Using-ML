import React from 'react';
import './ResultsDisplay.css';
import ReportLinks from './ReportLinks';
import { getSeverityColor } from '../utils/severity';

const ResultsDisplay = ({ result }) => {
  if (!result) return null;

  const { patientInfo, patient_id, patient_code, prediction, urls } = result;
  const predictionData = prediction || {};
  const label = predictionData.label || 'Unknown';
  const confidence = predictionData.confidence || 0;

  const getSeverityMessage = (severity) => {
    const messages = {
      Normal: "No significant signs of Alzheimer's detected.",
      NonDemented: "No significant signs of Alzheimer's detected.",
      VeryMildDemented: 'Very mild cognitive impairment detected.',
      MildDemented: "Mild Alzheimer's disease detected.",
      ModerateDemented: "Moderate Alzheimer's disease detected.",
      SevereDemented: "Severe Alzheimer's disease detected.",
    };
    return messages[severity] || 'Analysis complete.';
  };

  const getRecommendations = (severity) => {
    const recommendations = {
      Normal: [
        'Continue regular cognitive exercises',
        'Maintain healthy lifestyle',
        'Annual cognitive screening recommended',
      ],
      NonDemented: [
        'Continue regular cognitive exercises',
        'Maintain healthy lifestyle',
        'Annual cognitive screening recommended',
      ],
      VeryMildDemented: [
        'Consult with neurologist',
        'Begin cognitive therapy',
        'Regular monitoring every 6 months',
      ],
      MildDemented: [
        'Immediate consultation with specialist',
        'Consider medication options',
        'Start memory care activities',
      ],
      ModerateDemented: [
        'Urgent specialist consultation needed',
        'Medication management required',
        'Consider caregiver support',
      ],
      SevereDemented: [
        'Immediate medical attention required',
        'Full-time care may be necessary',
        'Advanced care planning recommended',
      ],
    };
    return recommendations[severity] || [];
  };

  const downloadReport = () => {
    if (urls?.report) {
      window.open(urls.report, '_blank');
    }
  };

  return (
    <div className="results-container">
      <div className="results-header">
        <h2>Analysis Results</h2>
        <div className="result-meta">
          {patient_id && <p className="result-id">Patient ID: {patient_id}</p>}
          {patient_code && <p className="result-code">Code: {patient_code}</p>}
          <p className="result-timestamp">Analyzed: {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      <div className="patient-summary">
        <h3>Patient Information</h3>
        <div className="patient-details">
          <p><strong>Name:</strong> {patientInfo?.full_name || 'N/A'}</p>
          <p><strong>Age:</strong> {patientInfo?.age || 'N/A'}</p>
          <p><strong>Gender:</strong> {patientInfo?.gender || 'N/A'}</p>
          {patientInfo?.doctor_name && <p><strong>Doctor:</strong> {patientInfo.doctor_name}</p>}
          {patientInfo?.email && <p><strong>Email:</strong> {patientInfo.email}</p>}
          {patientInfo?.city && <p><strong>City:</strong> {patientInfo.city}</p>}
        </div>
      </div>

      <div className="severity-card" style={{ borderColor: getSeverityColor(label) }}>
        <div className="severity-header">
          <h3>Diagnosis: {label}</h3>
          <span className="confidence-badge" style={{ backgroundColor: getSeverityColor(label) }}>
            Confidence: {(confidence * 100).toFixed(1)}%
          </span>
        </div>
        <p className="severity-message">{getSeverityMessage(label)}</p>
      </div>

      {confidence > 0 && (
        <div className="confidence-meter">
          <h4>Confidence Level</h4>
          <div className="meter-bar">
            <div className="meter-fill" style={{ width: `${confidence * 100}%`, backgroundColor: getSeverityColor(label) }} />
          </div>
          <div className="meter-labels">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      )}

      <ReportLinks urls={urls} />

      <div className="recommendations">
        <h3>Recommendations</h3>
        <ul>
          {getRecommendations(label).map((rec, index) => (
            <li key={index}>{rec}</li>
          ))}
        </ul>
      </div>

      <div className="next-steps">
        <h3>Next Steps</h3>
        <div className="steps-grid">
          <div className="step">
            <div className="step-icon">1</div>
            <h4>Consult Specialist</h4>
            <p>Schedule appointment with a neurologist for detailed evaluation</p>
          </div>
          <div className="step">
            <div className="step-icon">2</div>
            <h4>Further Testing</h4>
            <p>Consider additional tests like PET scan or cerebrospinal fluid analysis</p>
          </div>
          <div className="step">
            <div className="step-icon">3</div>
            <h4>Treatment Plan</h4>
            <p>Discuss medication and therapy options with healthcare provider</p>
          </div>
        </div>
      </div>

      <div className="disclaimer-box">
        <h4>Important Notice</h4>
        <p>
          This analysis is based on AI algorithms and should be used as a screening tool only.
          It is not a substitute for professional medical diagnosis. Always consult with
          qualified healthcare professionals for medical decisions.
        </p>
      </div>

      <div className="actions">
        {urls?.report && (
          <button className="btn-primary" onClick={downloadReport}>
            Download Full Report
          </button>
        )}
        <button className="btn-secondary" onClick={() => window.print()}>
          Print Summary
        </button>
      </div>
    </div>
  );
};

export default ResultsDisplay;
