import React, { useEffect, useMemo, useState } from 'react';
import { getPatients } from '../services/api';
import { getSeverityColor, severityColorMap, severityFilters } from '../utils/severity';
import ReportLinks from '../components/ReportLinks';
import './Dashboard.css';

const PAGE_SIZE = 6;

const Dashboard = () => {
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await getPatients();
        setPatients(response || []);
      } catch (err) {
        setError(err.message || 'Unable to load patient history.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      const matchesQuery = searchQuery
        ? [patient.name, patient.patientCode]
            .filter(Boolean)
            .some((field) => field.toLowerCase().includes(searchQuery.toLowerCase()))
        : true;

      const matchesSeverity = severityFilter
        ? patient.severityClass === severityFilter
        : true;

      return matchesQuery && matchesSeverity;
    });
  }, [patients, searchQuery, severityFilter]);

  // Compute severity distribution stats from full patient list
  const severityStats = useMemo(() => {
    const counts = {};
    for (const p of patients) {
      const cls = p.severityClass || 'Unknown';
      counts[cls] = (counts[cls] || 0) + 1;
    }
    return counts;
  }, [patients]);

  const totalPages = Math.max(1, Math.ceil(filteredPatients.length / PAGE_SIZE));
  const currentPageItems = filteredPatients.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  return (
    <div className="dashboard-page">
      <div className="dashboard-hero glass-card">
        <div>
          <h1>Researcher Dashboard</h1>
          <p>Review patient analysis history, severity trends, and download detailed reports.</p>
        </div>
      </div>

      {/* Summary statistics bar */}
      {!loading && !error && patients.length > 0 && (
        <div className="dashboard-stats glass-card">
          <span className="stat-item stat-total">
            Total: {patients.length}
          </span>
          {Object.entries(severityStats).map(([cls, count]) => (
            <span key={cls} className="stat-item">
              <span className="stat-dot" style={{ backgroundColor: getSeverityColor(cls) }} />
              {cls}: {count}
            </span>
          ))}
        </div>
      )}

      <div className="dashboard-toolbar glass-card">
        <div className="toolbar-row">
          <div className="filter-group">
            <label>Search by patient name or code</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patient name or code"
            />
          </div>

          <div className="filter-group">
            <label>Severity filter</label>
            <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}>
              {severityFilters.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading && <div className="dashboard-status">Loading patient history…</div>}
      {error && <div className="dashboard-status dashboard-error">{error}</div>}

      {!loading && !error && (
        <>
          <div className="dashboard-grid">
            {currentPageItems.length > 0 ? (
              currentPageItems.map((patient) => (
                <article key={patient.patientCode || patient.name} className="patient-card glass-card">
                  <div className="patient-card-header">
                    <div>
                      <h2>{patient.name || 'Unknown patient'}</h2>
                      <p className="patient-meta">Code: {patient.patientCode || '—'}</p>
                    </div>
                    <span className="severity-pill" style={{ backgroundColor: getSeverityColor(patient.severityClass) }}>
                      {patient.severityClass || 'Unknown'}
                    </span>
                  </div>

                  <div className="patient-details">
                    <div>
                      <p><strong>Doctor:</strong> {patient.doctorName || 'Unassigned'}</p>
                      <p><strong>Age:</strong> {patient.age ?? '—'}</p>
                    </div>
                    <div>
                      <p><strong>Confidence:</strong> {((patient.confidence ?? 0) * 100).toFixed(1)}%</p>
                      <p><strong>Date:</strong> {patient.date || 'Unknown'}</p>
                    </div>
                  </div>

                  <ReportLinks
                    urls={
                      patient.reportUrl
                        ? { report: patient.reportUrl, mri: patient.mriUrl, heatmap: patient.heatmapUrl }
                        : patient.urls
                    }
                  />
                </article>
              ))
            ) : (
              <div className="dashboard-empty">No analysis history found for the selected filters.</div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="pagination-controls glass-card">
              <button type="button" disabled={currentPage === 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}>
                Previous
              </button>
              <span>Page {currentPage} of {totalPages}</span>
              <button type="button" disabled={currentPage === totalPages} onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}>
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;

