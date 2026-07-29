import React from 'react';
import faviconImg from '../favicon.jpg';
import './Logo.css';

export const LogoIcon = ({ className = '', size = 36 }) => (
  <img
    src={faviconImg}
    alt="AlzheimerAI Logo"
    className={`logo-icon-img ${className}`}
    style={{ width: size, height: size, objectFit: 'cover', borderRadius: '10px' }}
  />
);

export const Logo = ({ showSubtitle = true, className = '' }) => {
  return (
    <div className={`logo-lockup ${className}`}>
      <LogoIcon size={38} className="logo-icon-img" />
      <div className="logo-text-wrapper">
        <span className="logo-wordmark">
          <span className="wordmark-main">Alzheimer</span>
          <span className="wordmark-accent">AI</span>
        </span>
        {showSubtitle && (
          <span className="logo-subtitle">Early Detection System</span>
        )}
      </div>
    </div>
  );
};

export default Logo;
