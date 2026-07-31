import React, { useState, useEffect } from 'react';
import { CreditCard, History, Award, RefreshCw, AlertCircle } from 'lucide-react';

const FeesTab = ({ user }) => {
  const [activeSubTab, setActiveSubTab] = useState('dues'); // dues, history, scholarship
  const [data, setData] = useState('');
  const [loading, setLoading] = useState(false);

  // Dynamic Query inputs defaulting to current logged-in student details
  const [studentNameInput, setStudentNameInput] = useState(user.name || '');
  const [registerNoInput, setRegisterNoInput] = useState(user.roll_no || '');

  const fetchData = async (subTab, nameVal = studentNameInput, rollVal = registerNoInput) => {
    setLoading(true);
    let query = 'dues';
    if (subTab === 'history') query = 'history';
    if (subTab === 'scholarship') query = 'scholarship';

    try {
      const res = await fetch('http://127.0.0.1:8000/api/direct-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_name: 'Fee & Payment Agent',
          query: query,
          roll_no: rollVal.trim(),
          name: nameVal.trim()
        })
      });
      const resData = await res.json();
      setData(resData.response);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(activeSubTab);
  }, [user, activeSubTab]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData(activeSubTab);
  };

  const renderLine = (line, i) => {
    if (line.startsWith('### ')) {
      return (
        <h4 key={i} style={{ 
          fontSize: '1.15rem', 
          fontWeight: 800, 
          margin: '1.5rem 0 1rem 0', 
          color: 'var(--primary)', 
          borderBottom: '2px solid rgba(109, 40, 217, 0.1)', 
          paddingBottom: '0.5rem' 
        }}>
          {line.replace('### ', '')}
        </h4>
      );
    }
    
    if (line.startsWith('- ')) {
      const cleaned = line.replace('- ', '');
      const parts = cleaned.split('|');
      
      if (parts.length >= 3) {
        const titleAndTotal = parts[0].trim().replace(/\*\*/g, '');
        const paidVal = parts[1].trim().replace(/\*\*/g, '');
        const dueVal = parts[2].trim().replace(/\*\*/g, '');
        
        const isPaid = dueVal.includes('Fully Paid') || dueVal.includes('✅');
        
        return (
          <div key={i} style={{ 
            padding: '1rem', 
            borderBottom: '1px solid rgba(109, 40, 217, 0.08)', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            background: isPaid ? 'rgba(16, 185, 129, 0.02)' : 'rgba(239, 68, 68, 0.02)',
            borderRadius: '0.75rem',
            marginBottom: '0.5rem'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.95rem' }}>
                {titleAndTotal}
              </span>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                {paidVal}
              </span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ 
                fontWeight: 700, 
                fontSize: '0.8rem',
                padding: '0.35rem 0.85rem',
                borderRadius: '9999px',
                background: isPaid ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                color: isPaid ? '#10b981' : '#ef4444',
                display: 'inline-block'
              }}>
                {dueVal}
              </span>
            </div>
          </div>
        );
      } else {
        // Fallback for list items (e.g. payment history list)
        const formatted = cleaned.replace(/\*\*(.*?)\*\*/g, '$1');
        return (
          <div key={i} style={{ 
            padding: '0.75rem 1rem', 
            borderBottom: '1px solid rgba(0,0,0,0.04)', 
            color: '#334155',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>•</span>
            <span>{formatted}</span>
          </div>
        );
      }
    }
    
    // Check for inline bold formatting in normal text lines
    if (line.includes('**')) {
      const parts = line.split('**');
      return (
        <p key={i} style={{ margin: '0.5rem 0', color: '#475569', fontSize: '0.9rem', lineHeight: '1.6' }}>
          {parts.map((part, index) => index % 2 === 1 ? <strong key={index} style={{ color: '#1e293b', fontWeight: 700 }}>{part}</strong> : part)}
        </p>
      );
    }

    return <p key={i} style={{ margin: '0.5rem 0', color: '#475569', fontSize: '0.9rem', lineHeight: '1.6' }}>{line}</p>;
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CreditCard /> Fee & Payment Ledger
        </h3>
        <button 
          onClick={() => fetchData(activeSubTab)} 
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.4rem 0.8rem', background: 'rgba(109, 40, 217, 0.08)', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Student Details Search Form */}
      <form onSubmit={handleSearchSubmit} className="glass-card" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'end', flexWrap: 'wrap' }}>
        <div style={{ flexGrow: 1, minWidth: '200px' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>Student Name</label>
          <input 
            type="text" 
            placeholder="Enter Student Name" 
            value={studentNameInput}
            onChange={(e) => setStudentNameInput(e.target.value)}
            style={{ width: '100%', padding: '0.55rem 1rem', borderRadius: '0.5rem', border: '1px solid rgba(109, 40, 217, 0.15)', outline: 'none', background: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ flexGrow: 1, minWidth: '200px' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>Register Number / Roll Number</label>
          <input 
            type="text" 
            placeholder="Enter Register Number" 
            value={registerNoInput}
            onChange={(e) => setRegisterNoInput(e.target.value)}
            style={{ width: '100%', padding: '0.55rem 1rem', borderRadius: '0.5rem', border: '1px solid rgba(109, 40, 217, 0.15)', outline: 'none', background: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', boxSizing: 'border-box' }}
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          style={{ padding: '0.6rem 1.5rem', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '0.5rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(109, 40, 217, 0.15)' }}
        >
          {loading ? 'Fetching Ledger...' : 'Check Payment Status'}
        </button>
      </form>

      {/* Sub Tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '0.5rem' }}>
        <button 
          onClick={() => setActiveSubTab('dues')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', border: 'none', background: 'none', borderBottom: activeSubTab === 'dues' ? '2px solid var(--primary)' : '2px solid transparent', color: activeSubTab === 'dues' ? 'var(--primary)' : '#64748b', fontWeight: 600, cursor: 'pointer' }}
        >
          <CreditCard size={16} /> Dues & Fees
        </button>
        <button 
          onClick={() => setActiveSubTab('history')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', border: 'none', background: 'none', borderBottom: activeSubTab === 'history' ? '2px solid var(--primary)' : '2px solid transparent', color: activeSubTab === 'history' ? 'var(--primary)' : '#64748b', fontWeight: 600, cursor: 'pointer' }}
        >
          <History size={16} /> Payment History
        </button>
        <button 
          onClick={() => setActiveSubTab('scholarship')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', border: 'none', background: 'none', borderBottom: activeSubTab === 'scholarship' ? '2px solid var(--primary)' : '2px solid transparent', color: activeSubTab === 'scholarship' ? 'var(--primary)' : '#64748b', fontWeight: 600, cursor: 'pointer' }}
        >
          <Award size={16} /> Scholarship
        </button>
      </div>

      {/* Main Content Area */}
      <div className="glass-card" style={{ padding: '2rem', minHeight: '200px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '150px' }}>
            <RefreshCw className="animate-spin" size={24} style={{ color: 'var(--primary)' }} />
          </div>
        ) : data ? (
          <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', fontSize: '0.95rem' }}>
            {data.split('\n').map((line, i) => renderLine(line, i))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
            <AlertCircle style={{ display: 'block', margin: '0 auto 0.5rem', opacity: 0.5 }} />
            No fee information found for student {registerNoInput}.
          </div>
        )}
      </div>
    </div>
  );
};

export default FeesTab;
