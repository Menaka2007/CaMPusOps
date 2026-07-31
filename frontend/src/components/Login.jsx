import React, { useState } from 'react';
import { GraduationCap, Briefcase, ShieldAlert, Sparkles, KeyRound } from 'lucide-react';

const Login = ({ onLoginSuccess }) => {
  const [role, setRole] = useState(null); // 'student' | 'staff' | 'admin'
  const [rollNo, setRollNo] = useState(''); // Stores Register Number / Faculty ID
  const [fullName, setFullName] = useState(''); // Stores Full Name
  const [username, setUsername] = useState(''); // Stores Admin Username
  const [password, setPassword] = useState(''); // Stores Admin Password
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setError('');
    // Auto-fill credentials for easy evaluation
    if (selectedRole === 'student') {
      setRollNo('717721L101');
      setFullName('Aravind Swamy');
    } else if (selectedRole === 'staff') {
      setRollNo('STAFF001');
      setFullName('Dr. Balasubramanian');
    } else if (selectedRole === 'admin') {
      setUsername('samyuktha');
      setPassword('password123');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    let endpoint = '';
    let payload = {};

    if (role === 'student') {
      const trimmedName = fullName.trim();
      const allowedNames = [
        "J. Samhitha",
        "S. Chandrika",
        "Menaka S",
        "Vinisha",
        "Anushya",
        "Varsha",
        "Kanishka",
        "Prega",
        "Akshaya",
        "Madhumita"
      ];
      
      const lowerNames = allowedNames.map(name => name.toLowerCase());
      
      // Do not allow duplicate names
      const nameSet = new Set(lowerNames);
      if (nameSet.size !== allowedNames.length) {
        setError("Duplicate names are not allowed in the configuration.");
        setLoading(false);
        return;
      }
      
      if (!nameSet.has(trimmedName.toLowerCase())) {
        setError("Access Denied. You are not a registered student.");
        setLoading(false);
        return;
      }
      
      endpoint = 'http://127.0.0.1:8000/api/login/student';
      payload = { register_number: rollNo, name: trimmedName };
    } else if (role === 'staff') {
      endpoint = 'http://127.0.0.1:8000/api/login/staff';
      payload = { faculty_id: rollNo, name: fullName };
    } else if (role === 'admin') {
      endpoint = 'http://127.0.0.1:8000/api/login/admin';
      payload = { username, password };
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Login failed');
      }

      const userData = await response.json();
      
      // Store session data according to specifications
      // Note: This is demo-level authentication for the local project, no JWT/server sessions.
      sessionStorage.setItem('role', role);
      if (role === 'student') {
        sessionStorage.setItem('student_id', userData.student_id);
        sessionStorage.setItem('register_number', userData.roll_no);
        sessionStorage.setItem('name', userData.name);
      } else if (role === 'staff') {
        sessionStorage.setItem('faculty_id', userData.faculty_id);
        sessionStorage.setItem('name', userData.name);
        sessionStorage.setItem('department', userData.department);
      } else if (role === 'admin') {
        sessionStorage.setItem('username', username);
      }
      
      // Save global user object for React application routing
      sessionStorage.setItem('user', JSON.stringify(userData));

      onLoginSuccess(userData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-height-screen flex flex-col items-center justify-center p-6" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      
      {/* College Logo / Header area */}
      <div className="text-center mb-8 animate-fade-in" style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 1.5rem', background: 'rgba(109, 40, 217, 0.08)', borderRadius: '9999px', border: '1px solid rgba(109, 40, 217, 0.15)', marginBottom: '1rem' }}>
          <Sparkles size={16} className="text-purple-600" style={{ color: 'var(--primary)' }} />
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)', letterSpacing: '0.05em' }}>SRI ESWAR COLLEGE OF ENGINEERING</span>
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, background: 'linear-gradient(to right, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '0.5rem 0' }}>
          Smart Campus Assistant
        </h1>
        <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Multi-Agent AI Powered Campus Operations</p>
      </div>

      {!role ? (
        <div className="animate-fade-in" style={{ width: '100%', maxWidth: '900px' }}>
          <h2 style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 600, color: '#475569', marginBottom: '2rem' }}>Select your portal to continue</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', width: '100%' }}>
            
            {/* Student Card */}
            <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', cursor: 'pointer' }} onClick={() => handleRoleSelect('student')}>
              <div style={{ padding: '1.25rem', background: 'rgba(109, 40, 217, 0.1)', borderRadius: '1rem', color: 'var(--primary)', marginBottom: '1.5rem' }}>
                <GraduationCap size={40} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Student Login</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Access timetable, exams, pay fees, file complaints, and view notifications.</p>
              <button style={{ width: '100%', padding: '0.75rem', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '0.75rem', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}>Enter Student Portal</button>
            </div>

            {/* Staff Card */}
            <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', cursor: 'pointer' }} onClick={() => handleRoleSelect('staff')}>
              <div style={{ padding: '1.25rem', background: 'rgba(37, 99, 235, 0.1)', borderRadius: '1rem', color: 'var(--secondary)', marginBottom: '1.5rem' }}>
                <Briefcase size={40} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Staff Login</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Coordinate classes, manage complaints, respond to consultation requests.</p>
              <button style={{ width: '100%', padding: '0.75rem', background: 'var(--secondary)', color: '#fff', border: 'none', borderRadius: '0.75rem', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}>Enter Staff Portal</button>
            </div>

            {/* Admin Card */}
            <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', cursor: 'pointer' }} onClick={() => handleRoleSelect('admin')}>
              <div style={{ padding: '1.25rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '1rem', color: '#ef4444', marginBottom: '1.5rem' }}>
                <ShieldAlert size={40} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Admin Login</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Manage academic configurations, overall notifications, and dashboard stats.</p>
              <button style={{ width: '100%', padding: '0.75rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '0.75rem', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}>Enter Admin Portal</button>
            </div>

          </div>
        </div>
      ) : (
        <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, textTransform: 'capitalize' }}>{role} Login</h3>
            <button onClick={() => setRole(null)} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>Change Portal</button>
          </div>

          <form onSubmit={handleSubmit}>
            
            {role === 'student' && (
              <>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Register Number</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="text" 
                      value={rollNo}
                      onChange={(e) => setRollNo(e.target.value)}
                      placeholder="e.g. 717721L101"
                      style={{ width: '100%', padding: '0.75rem', paddingLeft: '2.5rem', borderRadius: '0.75rem', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }}
                      required
                    />
                    <GraduationCap size={18} style={{ position: 'absolute', left: '0.875rem', top: '1rem', color: '#94a3b8' }} />
                  </div>
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="text" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Aravind Swamy"
                      style={{ width: '100%', padding: '0.75rem', paddingLeft: '2.5rem', borderRadius: '0.75rem', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }}
                      required
                    />
                    <Sparkles size={18} style={{ position: 'absolute', left: '0.875rem', top: '1rem', color: '#94a3b8' }} />
                  </div>
                </div>
              </>
            )}

            {role === 'staff' && (
              <>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Faculty ID</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="text" 
                      value={rollNo}
                      onChange={(e) => setRollNo(e.target.value)}
                      placeholder="e.g. STAFF001"
                      style={{ width: '100%', padding: '0.75rem', paddingLeft: '2.5rem', borderRadius: '0.75rem', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }}
                      required
                    />
                    <Briefcase size={18} style={{ position: 'absolute', left: '0.875rem', top: '1rem', color: '#94a3b8' }} />
                  </div>
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Faculty Name</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="text" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Dr. Balasubramanian"
                      style={{ width: '100%', padding: '0.75rem', paddingLeft: '2.5rem', borderRadius: '0.75rem', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }}
                      required
                    />
                    <Sparkles size={18} style={{ position: 'absolute', left: '0.875rem', top: '1rem', color: '#94a3b8' }} />
                  </div>
                </div>
              </>
            )}

            {role === 'admin' && (
              <>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Admin Username</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="text" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. admin"
                      style={{ width: '100%', padding: '0.75rem', paddingLeft: '2.5rem', borderRadius: '0.75rem', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }}
                      required
                    />
                    <ShieldAlert size={18} style={{ position: 'absolute', left: '0.875rem', top: '1rem', color: '#94a3b8' }} />
                  </div>
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      style={{ width: '100%', padding: '0.75rem', paddingLeft: '2.5rem', borderRadius: '0.75rem', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }}
                      required
                    />
                    <KeyRound size={18} style={{ position: 'absolute', left: '0.875rem', top: '1rem', color: '#94a3b8' }} />
                  </div>
                </div>
              </>
            )}

            {error && (
              <div style={{ color: '#ef4444', background: '#fef2f2', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.875rem', marginBottom: '1.25rem', border: '1px solid #fee2e2' }}>
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              style={{ width: '100%', padding: '0.75rem', background: role === 'admin' ? '#ef4444' : role === 'staff' ? 'var(--secondary)' : 'var(--primary)', color: '#fff', border: 'none', borderRadius: '0.75rem', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8' }}>
            Sri Eswar College of Engineering | Smart Campus Assistant System
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
