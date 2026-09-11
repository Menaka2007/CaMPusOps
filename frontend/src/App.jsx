import React, { useState } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import StaffDashboard from './components/StaffDashboard';
import AdminDashboard from './components/AdminDashboard';
function App() {
  // Check sessionStorage on load (demo-level session validation)
  const [user, setUser] = useState(() => {
    const savedUser = sessionStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    sessionStorage.clear();
    setUser(null);
  };

  return (
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
  );
}

export default App;
