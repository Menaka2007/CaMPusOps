import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import StaffDashboard from './components/StaffDashboard';
import AdminDashboard from './components/AdminDashboard';
import ErrorBoundary from './components/ErrorBoundary';
import { apiUrl } from './api';

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = sessionStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Wake up Render backend on app load to eliminate cold-start lag
  useEffect(() => {
    fetch(apiUrl('http://127.0.0.1:8000/health')).catch(() => {});
    // Re-ping every 10 minutes to keep it warm
    const interval = setInterval(() => {
      fetch(apiUrl('http://127.0.0.1:8000/health')).catch(() => {});
    }, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    sessionStorage.clear();
    setUser(null);
  };

  return (
    <ErrorBoundary>
      <div>
        {user ? (
          <>
            {user.role === 'admin' ? (
              <AdminDashboard user={user} onLogout={handleLogout} />
            ) : user.role === 'staff' ? (
              <StaffDashboard user={user} onLogout={handleLogout} />
            ) : (
              <Dashboard user={user} onLogout={handleLogout} />
            )}
          </>
        ) : (
          <Login onLoginSuccess={handleLoginSuccess} />
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;
