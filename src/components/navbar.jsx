// src/components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { currentUser, logout } from '../auth/auth';

export default function Navbar() {
  const [user, setUser] = useState(() => currentUser());
  const location = useLocation();

  useEffect(() => {
    const sync = () => setUser(currentUser());
    window.addEventListener('storage', sync);
    window.addEventListener('focus', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('focus', sync);
    };
  }, []);

  const doLogout = () => {
    logout();
    setUser(null);
    window.location.href = '/login';
  };

  // Hide navbar on auth pages
  const authPages = ['/', '/login', '/signup'];
  const isAuthPage = authPages.includes(location.pathname);

  return (
    <header className="navbar">
      <div className="navbar-inner container">
        
        {/* LEFT: Brand */}
        <div className="brand-row">
          <Link to="/" className="brand">IntelliFace</Link>
        </div>

        {/* RIGHT: Navigation */}
        {!isAuthPage && (
          <nav className="nav-links">
            {!user && (
              <>
                <Link to="/login" className="nav-link">Sign in</Link>
                <Link to="/signup" className="nav-link button">Sign up</Link>
              </>
            )}

            {user && (
              <>
                <Link to="/dashboard" className="nav-link">Dashboard</Link>
                <Link to="/classroom" className="nav-link">Classroom</Link>
                <Link to="/enroll" className="nav-link">Enrollment</Link>

                <span style={{ color: 'var(--muted)', marginLeft: 8 }}>
                  {user.name}
                </span>

                <button
                  onClick={doLogout}
                  className="nav-link button"
                  style={{ marginLeft: 8 }}
                >
                  Logout
                </button>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
