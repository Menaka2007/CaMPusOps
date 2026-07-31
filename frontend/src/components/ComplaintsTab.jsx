import React, { useState, useEffect } from 'react';
import { MessageSquareCode, Plus, AlertCircle, RefreshCw } from 'lucide-react';

const ComplaintsTab = ({ user }) => {
  const [complaints, setComplaints] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('classroom');
  const [statusMessage, setStatusMessage] = useState('');
  const [photo, setPhoto] = useState(null);
  const [venue, setVenue] = useState('');

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/direct-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_name: 'Complaint Agent',
          query: 'status',
          roll_no: user.roll_no,
          name: user.name
        })
      });
      const data = await res.json();
      setComplaints(data.response);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [user]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    setSubmitting(true);
    setStatusMessage('');
    // Construct query that triggers backend complaint registration
    // Needs to contain category/location (classroom, hostel, bus, etc.), venue and issue description
    const venueText = venue.trim() ? ` at ${venue.trim()}` : '';
    const formattedQuery = `complaint about ${category}${venueText}: ${description}`;

    try {
      const res = await fetch('http://127.0.0.1:8000/api/direct-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_name: 'Complaint Agent',
          query: formattedQuery,
          roll_no: user.roll_no,
          name: user.name,
          photo: photo
        })
      });
      const data = await res.json();
      setStatusMessage(data.response);
      setDescription('');
      setVenue('');
      setPhoto(null);
      const fileInput = document.getElementById('complaint-photo-input');
      if (fileInput) fileInput.value = '';
      fetchComplaints();
    } catch (err) {
      console.error(err);
      setStatusMessage('Failed to file complaint. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MessageSquareCode /> Complaint & Maintenance Registry
        </h3>
        <button 
          onClick={fetchComplaints} 
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.4rem 0.8rem', background: 'rgba(109, 40, 217, 0.08)', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* File Complaint Form */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h4 style={{ margin: '0 0 1rem 0', fontWeight: 600 }}>File a New Complaint</h4>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem', color: '#475569' }}>Category / Department</label>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(109, 40, 217, 0.2)', outline: 'none' }}
              >
                <option value="classroom">Classroom Maintenance</option>
                <option value="hostel">Hostel Block</option>
                <option value="bus">College Bus Services</option>
                <option value="eee lab">Electrical Lab / Equipment</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem', color: '#475569' }}>Venue / Location (Optional)</label>
              <input 
                type="text" 
                value={venue} 
                onChange={(e) => setVenue(e.target.value)}
                placeholder="e.g. Room 304, Block C, Bus 12"
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(109, 40, 217, 0.2)', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem', color: '#475569' }}>Describe the Issue</label>
              <textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. AC remote missing in Room 304, leak in Block C bathroom..."
                rows={4}
                required
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(109, 40, 217, 0.2)', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem', color: '#475569' }}>Attach Photo (Optional)</label>
              <input 
                id="complaint-photo-input"
                type="file" 
                accept="image/*" 
                onChange={handleFileChange}
                style={{ width: '100%', padding: '0.5rem 0', fontSize: '0.85rem' }}
              />
              {photo && (
                <div style={{ marginTop: '0.5rem', position: 'relative', display: 'inline-block' }}>
                  <img src={photo} alt="Preview" style={{ maxWidth: '100%', maxHeight: '100px', borderRadius: '0.375rem', border: '1px solid rgba(0,0,0,0.1)' }} />
                  <button 
                    type="button" 
                    onClick={() => {
                      setPhoto(null);
                      const fileInput = document.getElementById('complaint-photo-input');
                      if (fileInput) fileInput.value = '';
                    }} 
                    style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    X
                  </button>
                </div>
              )}
            </div>
            <button 
              type="submit" 
              disabled={submitting}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              {submitting ? <RefreshCw size={16} className="animate-spin" /> : <Plus size={16} />}
              Submit Complaint
            </button>
          </form>

          {statusMessage && (
            <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: '0.5rem', background: 'rgba(5, 150, 105, 0.08)', border: '1px solid rgba(5, 150, 105, 0.2)', fontSize: '0.9rem', color: '#065f46', whiteSpace: 'pre-line' }}>
              {statusMessage}
            </div>
          )}
        </div>

        {/* Complaints History */}
        <div className="glass-card" style={{ padding: '1.5rem', maxHeight: '450px', overflowY: 'auto' }}>
          <h4 style={{ margin: '0 0 1rem 0', fontWeight: 600 }}>Active Complaints History</h4>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
              <RefreshCw className="animate-spin" style={{ color: 'var(--primary)' }} />
            </div>
          ) : complaints ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {complaints.split('\n').map((line, i) => {
                if (line.startsWith('### ')) return null;
                if (line.startsWith('- ')) {
                  const cleaned = line.replace('- ', '');
                  const isPending = cleaned.includes('Pending');
                  const isInProgress = cleaned.includes('In Progress');
                  const statusBg = isPending ? 'rgba(217, 119, 6, 0.1)' : isInProgress ? 'rgba(37, 99, 235, 0.1)' : 'rgba(5, 150, 105, 0.1)';
                  const statusColor = isPending ? '#d97706' : isInProgress ? '#2563eb' : '#059669';

                  return (
                    <div key={i} style={{ padding: '0.85rem', borderRadius: '0.5rem', border: '1px solid rgba(0,0,0,0.05)', background: '#fff' }}>
                      <div style={{ fontSize: '0.875rem', color: '#1e1b4b', marginBottom: '0.5rem', fontWeight: 500 }}>
                        {cleaned.split('|')[0]}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '9999px', background: statusBg, color: statusColor, fontWeight: 600 }}>
                          {isPending ? '⏳ Pending' : isInProgress ? '⚙️ In Progress' : '✅ Resolved'}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {cleaned.split('|')[1]?.replace('Status:', '')?.trim() || ''}
                        </span>
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
              No complaints registered yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplaintsTab;
