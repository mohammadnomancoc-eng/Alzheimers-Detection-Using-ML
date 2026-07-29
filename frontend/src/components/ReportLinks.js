import React from 'react';

const ReportLinks = ({ urls }) => {
  if (!urls) return null;

  const openLink = (link) => {
    if (link) {
      window.open(link, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="file-links-section">
      <h3>Generated Files</h3>
      <div className="file-links">
        {urls.mri && (
          <a href={urls.mri} target="_blank" rel="noopener noreferrer" className="file-link">
            <span className="file-icon">🖼️</span>
            View MRI Image
          </a>
        )}

        {urls.heatmap && (
          <a href={urls.heatmap} target="_blank" rel="noopener noreferrer" className="file-link">
            <span className="file-icon">🔥</span>
            View Heatmap
          </a>
        )}

        {urls.report && (
          <button type="button" onClick={() => openLink(urls.report)} className="file-link download-btn">
            <span className="file-icon">📄</span>
            Download PDF Report
          </button>
        )}
      </div>
    </div>
  );
};

export default ReportLinks;
