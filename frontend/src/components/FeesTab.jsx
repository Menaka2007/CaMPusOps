import React, { useState, useEffect } from 'react';
import { CreditCard, History, Award, RefreshCw, AlertCircle, Calendar } from 'lucide-react';
import StatusBadge from './StatusBadge';
import MarkdownView from './MarkdownView';
import { apiUrl } from '../api';

const FeesTab = ({ user }) => {
  const [activeSubTab, setActiveSubTab] = useState('dues'); // dues, history, scholarship
  const [data, setData] = useState('');
  const [loading, setLoading] = useState(false);

  // Dynamic Query inputs defaulting to current logged-in student details
  const [studentNameInput, setStudentNameInput] = useState(user?.name || '');
  const [registerNoInput, setRegisterNoInput] = useState(user?.roll_no || '');

  const fetchData = async (subTab, nameVal = studentNameInput, rollVal = registerNoInput) => {
    setLoading(true);
    let query = 'dues';
    if (subTab === 'history') query = 'history';
    if (subTab === 'scholarship') query = 'scholarship';

    try {
      const res = await fetch(apiUrl('http://127.0.0.1:8000/api/direct-agent'), {
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
      setData(resData.response || '');
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

  // Helper to parse fee items into structured rows
  const parseFeeTable = (rawText) => {
    if (!rawText) return { headerLines: [], feeRows: [], footerLines: [] };
    const lines = rawText.split('\n');
    const headerLines = [];
    const feeRows = [];
    const footerLines = [];

    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('- ') && trimmed.includes('|')) {
        const parts = trimmed.replace(/^- /, '').split('|');
        if (parts.length >= 3) {
          const col1 = parts[0].trim().replace(/\*\*/g, '');
          const col2 = parts[1].trim().replace(/\*\*/g, '');
          const col3 = parts[2].trim().replace(/\*\*/g, '');

          // e.g. "Tuition Fee (Annual): ₹1,25,000"
          const titleParts = col1.split(':');
          const feeType = titleParts[0]?.trim() || col1;
          const totalAmount = titleParts[1]?.trim() || '-';

          // e.g. "Paid: ₹1,25,000"
          const paidParts = col2.split(':');
          const paidAmount = paidParts[1]?.trim() || col2;

          // e.g. "Due: ₹0 (Fully Paid ✅)" or "Due: ₹45,000 (Pending ⚠️)"
          const dueParts = col3.split(':');
          const dueRaw = dueParts[1]?.trim() || col3;
          const isPaid = dueRaw.toLowerCase().includes('fully paid') || dueRaw.includes('✅') || dueRaw.startsWith('₹0');
          const dueAmount = dueRaw.replace(/\(.*?\)/g, '').replace(/[✅⚠️]/g, '').trim();

          const deadline = isPaid ? 'Cleared / Completed' : 'Due by End of Term';

          feeRows.push({
            feeType,
            totalAmount,
            paidAmount,
            dueAmount: dueAmount || '₹0',
            status: isPaid ? 'Paid' : 'Pending',
            deadline
          });
          return;
        }
      }

      if (feeRows.length === 0) {
        headerLines.push(line);
      } else {
        footerLines.push(line);
      }
    });

    return { headerLines, feeRows, footerLines };
  };

  const { headerLines, feeRows, footerLines } = parseFeeTable(data);

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
          className="btn-royal-gold"
          style={{ padding: '0.65rem 1.6rem', border: 'none', borderRadius: '0.5rem', fontWeight: 800, cursor: 'pointer', fontSize: '0.9rem', boxShadow: '0 4px 14px rgba(217, 119, 6, 0.35)' }}
        >
          {loading ? 'Fetching Ledger...' : 'Check Payment Status'}
        </button>
      </form>

      {/* Sub Tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid rgba(217, 119, 6, 0.15)', paddingBottom: '0.5rem' }}>
        <button 
          onClick={() => setActiveSubTab('dues')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', border: 'none', background: 'none', borderBottom: activeSubTab === 'dues' ? '2.5px solid #d97706' : '2.5px solid transparent', color: activeSubTab === 'dues' ? '#b45309' : '#64748b', fontWeight: 700, cursor: 'pointer' }}
        >
          <CreditCard size={16} /> Dues & Fees
        </button>
        <button 
          onClick={() => setActiveSubTab('history')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', border: 'none', background: 'none', borderBottom: activeSubTab === 'history' ? '2.5px solid #d97706' : '2.5px solid transparent', color: activeSubTab === 'history' ? '#b45309' : '#64748b', fontWeight: 700, cursor: 'pointer' }}
        >
          <History size={16} /> Payment History
        </button>
        <button 
          onClick={() => setActiveSubTab('scholarship')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', border: 'none', background: 'none', borderBottom: activeSubTab === 'scholarship' ? '2.5px solid #d97706' : '2.5px solid transparent', color: activeSubTab === 'scholarship' ? '#b45309' : '#64748b', fontWeight: 700, cursor: 'pointer' }}
        >
          <Award size={16} /> Scholarship
        </button>
      </div>

      {/* Main Content Area */}
      <div className="glass-card" style={{ padding: '1.75rem', minHeight: '220px', border: '1px solid rgba(217, 119, 6, 0.2)' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '160px' }}>
            <RefreshCw className="animate-spin" size={26} style={{ color: '#d97706' }} />
          </div>
        ) : data ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Header info (e.g. title) rendered with markdown */}
            {headerLines.length > 0 && (
              <MarkdownView content={headerLines.join('\n')} />
            )}

            {/* If structured fee rows exist (e.g. dues tab), render clean table */}
            {feeRows.length > 0 ? (
              <div style={{ overflowX: 'auto', borderRadius: '0.75rem', border: '1.5px solid rgba(217, 119, 6, 0.25)', boxShadow: '0 4px 18px rgba(217, 119, 6, 0.07)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ background: 'linear-gradient(135deg, rgba(255, 251, 235, 0.95) 0%, rgba(245, 243, 255, 0.95) 100%)', borderBottom: '2px solid rgba(217, 119, 6, 0.25)', color: '#1e1b4b', fontWeight: 800 }}>
                      <th style={{ padding: '0.9rem 1rem' }}>Fee Type</th>
                      <th style={{ padding: '0.9rem 1rem' }}>Total Amount</th>
                      <th style={{ padding: '0.9rem 1rem' }}>Paid Amount</th>
                      <th style={{ padding: '0.9rem 1rem' }}>Due Amount</th>
                      <th style={{ padding: '0.9rem 1rem', textAlign: 'center' }}>Status</th>
                      <th style={{ padding: '0.9rem 1rem' }}>Deadline</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feeRows.map((row, idx) => (
                      <tr 
                        key={idx} 
                        style={{ 
                          borderBottom: '1px solid rgba(0,0,0,0.04)',
                          background: idx % 2 === 0 ? '#ffffff' : 'rgba(248, 250, 252, 0.6)'
                        }}
                      >
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#1e293b' }}>
                          {row.feeType}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', color: '#475569', fontWeight: 600 }}>
                          {row.totalAmount}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', color: '#059669', fontWeight: 600 }}>
                          {row.paidAmount}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', color: row.dueAmount === '₹0' ? '#64748b' : '#dc2626', fontWeight: 700 }}>
                          {row.dueAmount}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                          <StatusBadge status={row.status} />
                        </td>
                        <td style={{ padding: '0.85rem 1rem', color: '#64748b', fontSize: '0.8rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Calendar size={13} style={{ color: '#94a3b8' }} />
                            <span>{row.deadline}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}

            {/* Footer lines or non-table content (History, Scholarship, etc.) rendered with markdown */}
            {footerLines.length > 0 && (
              <div style={{ marginTop: feeRows.length > 0 ? '0.5rem' : '0' }}>
                <MarkdownView content={footerLines.join('\n')} />
              </div>
            )}
            {feeRows.length === 0 && headerLines.length === 0 && (
              <MarkdownView content={data} />
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
            <AlertCircle style={{ display: 'block', margin: '0 auto 0.5rem', opacity: 0.5 }} />
            No fee information found for student {registerNoInput}.
          </div>
        )}
      </div>
    </div>
  );
};

export default FeesTab;
