// src/pages/Home.js - Check the imports at the top
import React, { useState, useRef } from 'react';
import PredictionForm from '../components/PredictionForm';
import ResultsDisplay from '../components/ResultsDisplay';  // This should work now
import './Home.css';
const Home = () => {
  const [predictionResult, setPredictionResult] = useState(null);
  const formRef = useRef(null);
  const aboutRef = useRef(null);
  const contactRef = useRef(null);

  const handlePredictionComplete = (result) => {
    setPredictionResult(result);
    // Scroll to results if they're not already visible
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNewAnalysis = () => {
    setPredictionResult(null);
    // Keep user at the same position (form section)
  };

  const scrollToForm = () => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>Early Detection of Alzheimer's Disease</h1>
            <p>
              Using advanced AI to analyze MRI scans and detect early signs 
              of Alzheimer's disease. Get quick, accurate screening results 
              within minutes.
            </p>
            <button 
              className="cta-button"
              onClick={scrollToForm}
            >
              Start Free Analysis
            </button>
          </div>
          <div className="hero-image">
            <div className="brain-illustration">
              <div className="brain-lobe"></div>
              <div className="brain-lobe"></div>
              <div className="neural-network"></div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="how-it-works">
        <div className="container">
          <h2>How It Works</h2>
          <div className="steps">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Upload MRI Scan</h3>
              <p>Upload your brain MRI scan image in JPG or PNG format</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3>AI Analysis</h3>
              <p>Our AI model analyzes the scan using deep learning algorithms</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3>Get Results</h3>
              <p>Receive detailed analysis with confidence scores and recommendations</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Form Section */}
      <section 
        id="form"
        ref={formRef} 
        className="main-form-section"
      >
        <div className="container">
          <div className="section-header">
            <h2>Upload Your MRI Scan</h2>
            <p>Fill in the details below to get your analysis</p>
          </div>
          
          {predictionResult ? (
            <>
              <ResultsDisplay result={predictionResult} />
              <div className="back-button-container">
                <button className="btn-secondary" onClick={handleNewAnalysis}>
                  Perform Another Analysis
                </button>
              </div>
            </>
          ) : (
            <PredictionForm onPredictionComplete={handlePredictionComplete} />
          )}
        </div>
      </section>

      {/* About Section */}
      <section id="about" ref={aboutRef} className="about">
        <div className="container">
          <h2>About Our Technology</h2>
          <div className="about-content">
            <div className="about-text">
              <p>
                Our AI system uses state-of-the-art convolutional neural networks 
                trained on thousands of MRI scans to detect patterns associated 
                with Alzheimer's disease.
              </p>
              <ul>
                <li>95% accuracy in clinical validation studies</li>
                <li>Quick results in under 30 seconds</li>
                <li>HIPAA compliant and secure</li>
                <li>Used by medical professionals worldwide</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" ref={contactRef} className="contact">
        <div className="container">
          <h2>Need Help?</h2>
          <p>
            For questions about the analysis or to consult with a specialist, 
            please contact us at <strong>mohammadnomancoc@gmail.com</strong>
          </p>
          <p style={{ marginTop: '1rem' }}>
            Contact us at: <strong>+91 7028106759</strong>
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;