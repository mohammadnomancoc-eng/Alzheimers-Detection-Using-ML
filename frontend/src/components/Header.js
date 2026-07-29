import React, { useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import './Header.css';

const Header = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToSection = (targetId) => {
    if (!targetId || targetId === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    let el = document.getElementById(targetId);
    if (!el && targetId === 'form') {
      el = document.querySelector('.main-form-section');
    }
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (location.pathname === '/' && location.state?.scrollTo) {
      const targetId = location.state.scrollTo;
      const timer = setTimeout(() => {
        scrollToSection(targetId);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [location]);

  const handleNavClick = (targetId) => {
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: targetId } });
    } else {
      scrollToSection(targetId);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="header">
      <div className="container">
        <div className="logo-container" onClick={() => handleNavClick('top')} style={{ cursor: 'pointer' }}>
          <Logo showSubtitle={true} />
        </div>

        <nav className="nav">
          <ul>
            <li>
              <button type="button" className="nav-link" onClick={() => handleNavClick('top')}>
                Home
              </button>
            </li>
            <li>
              <button type="button" className="nav-link" onClick={() => handleNavClick('about')}>
                About
              </button>
            </li>
            <li>
              <button type="button" className="nav-link generate-report-btn" onClick={() => handleNavClick('form')}>
                Generate Report
              </button>
            </li>
            <li>
              <button type="button" className="nav-link" onClick={() => handleNavClick('contact')}>
                Contact
              </button>
            </li>
            {isAuthenticated && (
              <li>
                <NavLink to="/dashboard" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                  Dashboard
                </NavLink>
              </li>
            )}
            {!isAuthenticated ? (
              <li>
                <NavLink to="/login" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                  Login
                </NavLink>
              </li>
            ) : (
              <li>
                <button type="button" className="nav-link" onClick={handleLogout}>
                  Logout
                </button>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;

