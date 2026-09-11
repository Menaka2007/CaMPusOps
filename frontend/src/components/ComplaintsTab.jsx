import React, { useState, useEffect } from 'react';
import { MessageSquareCode, Plus, AlertCircle, RefreshCw, ShieldAlert, CheckCircle2 } from 'lucide-react';
import StatusBadge from './StatusBadge';
import MarkdownView from './MarkdownView';
import { apiUrl } from '../api';

const ComplaintsTab = ({ user }) => {
  const [complaints, setComplaints] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('classroom');
  const [statusMessage, setStatusMessage] = useState('');
  const [photo, setPhoto] = useState(null);
  const [venue, setVenue] = useState('');

  const userRollNo = user?.roll_no || user?.register_number || user?.faculty_id || '717721L101';

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl('http://127.0.0.1:8000/api/direct-agent'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_name: 'Complaint Agent',
          query: 'status',
          roll_no: userRollNo,
          name: user?.name || ''
        })
      });
      const data = await res.json();
      setComplaints(data.response || '');
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
    const venueText = venue.trim() ? ` at ${venue.trim()}` : '';
    const formattedQuery = `complaint about ${category}${venueText}: ${description}`;

    try {
      const res = await fetch(apiUrl('http://127.0.0.1:8000/api/direct-agent'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_name: 'Complaint Agent',
          query: formattedQuery,
          roll_no: userRollNo,
          name: user?.name || '',
          photo: photo
        })
      });
      const data = await res.json();
      setStatusMessage(data.response || '');
      
      // If complaint was genuine & registered, clear the description input
      if (data.response && !data.response.includes('AI Moderation Alert')) {
        setDescription('');
        setVenue('');
        setPhoto(null);
        const fileInput = document.getElementById('complaint-photo-input');
        if (fileInput) fileInput.value = '';
      }
      fetchComplaints();
    } catch (err) {
      console.error(err);
      setStatusMessage('Failed to file complaint. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const hasHistory = complaints && (complaints.includes('- ') || complaints.includes('Status:'));
  const isAiRejected = statusMessage.includes('AI Moderation Alert') || statusMessage.includes('Auto-Filtered');

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
          <h4 style={{ margin: '0 0 1rem 0', fontWeight: 700, color: '#1e293b' }}>File a New Complaint</h4>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem', color: '#475569' }}>Category / Department</label>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(109, 40, 217, 0.2)', outline: 'none', background: '#fff', fontSize: '0.9rem' }}
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
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(109, 40, 217, 0.2)', outline: 'none', boxSizing: 'border-box', background: '#fff', fontSize: '0.9rem' }}
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
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(109, 40, 217, 0.2)', outline: 'none', resize: 'vertical', boxSizing: 'border-box', background: '#fff', fontSize: '0.9rem' }}
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
              style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(109, 40, 217, 0.15)' }}
            >
              {submitting ? <RefreshCw size={16} className="animate-spin" /> : <Plus size={16} />}
              Submit Complaint
            </button>
          </form>

          {statusMessage && (
            <div 
              style={{ 
                marginTop: '1rem', 
                padding: '1rem', 
                borderRadius: '0.75rem', 
                background: isAiRejected ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)', 
                border: isAiRejected ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)', 
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.95rem', color: isAiRejected ? '#b91c1c' : '#047857' }}>
                {isAiRejected ? <ShieldAlert size={18} style={{ color: '#ef4444' }} /> : <CheckCircle2 size={18} style={{ color: '#10b981' }} />}
                {isAiRejected ? 'AI Safety Guard Auto-Filtered' : 'AI Verified & Logged'}
              </div>
              <MarkdownView content={statusMessage} />
            </div>
          )}
        </div>

        {/* Complaints History & Activity Feed */}
        <div className="glass-card" style={{ padding: '1.5rem', maxHeight: '520px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ margin: 0, fontWeight: 700, color: '#1e293b' }}>Active Complaints Activity Feed</h4>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Live Tracker</span>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1, padding: '2rem' }}>
              <RefreshCw className="animate-spin" style={{ color: 'var(--primary)' }} />
            </div>
          ) : hasHistory ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto', paddingRight: '0.25rem' }}>
              {complaints.split('\n').map((line, i) => {
                const trimmedLine = line.trim();
                if (!trimmedLine.startsWith('- ')) {
                  if (trimmedLine.startsWith('### ')) {
                    return <h5 key={i} style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)', margin: '0.5rem 0' }}>{trimmedLine.replace('### ', '')}</h5>;
                  }
                  return null;
                }
                const cleaned = trimmedLine.replace('- ', '');
                const isPending = cleaned.toLowerCase().includes('pending');
                const isInProgress = cleaned.toLowerCase().includes('in progress');
                const statusStr = isPending ? 'Pending' : isInProgress ? 'In Progress' : 'Resolved';

                const parts = cleaned.split('| Status:');
                const titleAndDesc = parts[0] || cleaned;
                const statusAndDate = parts[1] || '';

                const cleanTitle = titleAndDesc.replace(/[\*\_]/g, '').trim();
                const cleanDate = statusAndDate.replace(/[\*\_]/g, '').trim();

                return (
                  <div 
                    key={i} 
                    style={{ 
                      padding: '0.85rem 1rem', 
                      borderRadius: '0.625rem', 
                      border: '1px solid rgba(109, 40, 217, 0.08)', 
                      background: '#ffffff',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div 
                      title={cleanTitle}
                      style={{ 
                        fontSize: '0.875rem', 
                        color: '#1e293b', 
                        marginBottom: '0.5rem', 
                        fontWeight: 600,
                        lineHeight: 1.45,
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word'
                      }}
                    >
                      {cleanTitle}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <StatusBadge status={statusStr} />
                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
                        {cleanDate}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8', flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <AlertCircle style={{ marginBottom: '0.5rem', opacity: 0.5 }} size={28} />
              No complaints registered yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplaintsTab;
