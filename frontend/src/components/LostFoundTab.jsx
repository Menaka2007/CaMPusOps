import React, { useState, useEffect } from 'react';
import { HelpCircle, Plus, RefreshCw, AlertCircle, Search } from 'lucide-react';

const LostFoundTab = ({ user }) => {
  const [items, setItems] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState('lost'); // lost, found
  const [itemType, setItemType] = useState('id card');
  const [details, setDetails] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  // Form Fields
  const [rollNo, setRollNo] = useState(user.roll_no || '');
  const [name, setName] = useState(user.name || '');
  const [dept, setDept] = useState(user.dept || '');

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/direct-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_name: 'Lost & Found Agent',
          query: 'list',
          roll_no: user.roll_no,
          name: user.name
        })
      });
      const data = await res.json();
      setItems(data.response);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!details.trim() || !rollNo.trim() || !name.trim() || !dept.trim()) return;

    setSubmitting(true);
    setStatusMessage('');

    // Trigger backend lost/found logic with keywords
    const formattedQuery = `I ${status} a ${itemType} near ${details}`;

    try {
      const res = await fetch('http://127.0.0.1:8000/api/direct-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_name: 'Lost & Found Agent',
          query: formattedQuery,
          roll_no: rollNo.trim(),
          name: name.trim(),
          dept: dept.trim()
        })
      });
      const data = await res.json();
      setStatusMessage(data.response);
      setDetails('');
      fetchItems();
    } catch (err) {
      console.error(err);
      setStatusMessage('Failed to file report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <HelpCircle /> Lost & Found Database
        </h3>
        <button 
          onClick={fetchItems} 
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.4rem 0.8rem', background: 'rgba(109, 40, 217, 0.08)', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '1.5rem' }}>
        {/* Report form */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h4 style={{ margin: '0 0 1rem 0', fontWeight: 600 }}>File a Lost/Found Report</h4>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <label style={{ flex: 1, cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="status" 
                  value="lost" 
                  checked={status === 'lost'} 
                  onChange={() => setStatus('lost')} 
                  style={{ marginRight: '0.5rem' }} 
                />
                Lost Item
              </label>
              <label style={{ flex: 1, cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="status" 
                  value="found" 
                  checked={status === 'found'} 
                  onChange={() => setStatus('found')} 
                  style={{ marginRight: '0.5rem' }} 
                />
                Found Item
              </label>
            </div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 200px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem', color: '#475569' }}>Register Number</label>
                <input 
                  type="text" 
                  value={rollNo} 
                  onChange={(e) => setRollNo(e.target.value)} 
                  required
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(109, 40, 217, 0.2)', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ flex: '1 1 200px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem', color: '#475569' }}>Student or Faculty Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(109, 40, 217, 0.2)', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem', color: '#475569' }}>Department</label>
              <input 
                type="text" 
                value={dept} 
                onChange={(e) => setDept(e.target.value)} 
                required
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(109, 40, 217, 0.2)', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem', color: '#475569' }}>Item Type</label>
              <select 
                value={itemType} 
                onChange={(e) => setItemType(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(109, 40, 217, 0.2)', outline: 'none' }}
              >
                <option value="id card">ID Card</option>
                <option value="water bottle">Water Bottle</option>
                <option value="charger">Charger</option>
                <option value="laptop">Laptop</option>
                <option value="keys">Keys</option>
                <option value="phone">Phone</option>
                <option value="bag">Bag</option>
                <option value="calculator">Calculator</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem', color: '#475569' }}>Where did you find/lose it?</label>
              <textarea 
                value={details} 
                onChange={(e) => setDetails(e.target.value)}
                placeholder="e.g. library near system 20, canteen outer seats..."
                rows={3}
                required
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(109, 40, 217, 0.2)', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
              />
            </div>
            <button 
              type="submit" 
              disabled={submitting}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              {submitting ? <RefreshCw size={16} className="animate-spin" /> : <Plus size={16} />}
              Submit Report
            </button>
          </form>

          {statusMessage && (
            <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: '0.5rem', background: 'rgba(5, 150, 105, 0.08)', border: '1px solid rgba(5, 150, 105, 0.2)', fontSize: '0.9rem', color: '#065f46', whiteSpace: 'pre-line' }}>
              {statusMessage}
            </div>
          )}
        </div>

        {/* Registry list */}
        <div className="glass-card" style={{ padding: '1.5rem', maxHeight: '450px', overflowY: 'auto' }}>
          <h4 style={{ margin: '0 0 1rem 0', fontWeight: 600 }}>Active Lost & Found Registry</h4>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
              <RefreshCw className="animate-spin" style={{ color: 'var(--primary)' }} />
            </div>
          ) : items ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {items.split('\n').map((line, i) => {
                if (line.startsWith('### ')) return null;
                if (line.startsWith('- ')) {
                  const cleaned = line.replace('- ', '');
                  const isLost = cleaned.includes('🔍 Lost');
                  const statusBg = isLost ? 'rgba(220, 38, 38, 0.1)' : 'rgba(5, 150, 105, 0.1)';
                  const statusColor = isLost ? '#dc2626' : '#059669';

                  // Format: - **🔍 Lost - Title**: "details" | Reported by: name (date) | Contact: contact
                  const titlePart = cleaned.split('**:')[0]?.replace('**', '') || '';
                  const rest = cleaned.split('**:')[1] || '';
                  const desc = rest.split('|')[0]?.replace(/"/g, '')?.trim() || '';
                  const reporter = rest.split('|')[1]?.replace('Reported by:', '')?.trim() || '';
                  const contact = rest.split('|')[2]?.replace('Contact:', '')?.trim() || '';

                  return (
                    <div key={i} style={{ padding: '0.85rem', borderRadius: '0.5rem', border: '1px solid rgba(0,0,0,0.05)', background: '#fff' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e1b4b' }}>
                          {titlePart.replace(/🔍 Lost - |🎁 Found - /, '')}
                        </span>
                        <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '9999px', background: statusBg, color: statusColor, fontWeight: 700 }}>
                          {isLost ? 'LOST' : 'FOUND'}
                        </span>
                      </div>
                      <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.825rem', color: '#475569' }}>"{desc}"</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#94a3b8' }}>
                        <span>By: {reporter}</span>
                        <span>Contact: {contact}</span>
                      </div>
                    </div>
                  );
                }
                return <p key={i} style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>{line}</p>;
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
              <AlertCircle style={{ display: 'block', margin: '0 auto 0.5rem', opacity: 0.5 }} />
              No items reported.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LostFoundTab;
