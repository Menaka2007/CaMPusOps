import React, { useState, useEffect } from 'react';
import { Bell, RefreshCw, AlertCircle } from 'lucide-react';

const NotificationsTab = ({ user }) => {
  const [filter, setFilter] = useState('all'); // all, placement, workshop, emergency, exam, lost_found, teacher_notice, student_post
  const [notifs, setNotifs] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async (selectedFilter) => {
    setLoading(true);
    let query = selectedFilter || 'all';

    try {
      const res = await fetch('http://127.0.0.1:8000/api/direct-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_name: 'Notification Agent',
          query: query,
          roll_no: user.roll_no,
          name: user.name
        })
      });
      const data = await res.json();
      setNotifs(data.response);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(filter);
  }, [user, filter]);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Bell /> Bulletin Board & Announcements
        </h3>
        <button 
          onClick={() => fetchNotifications(filter)} 
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.4rem 0.8rem', background: 'rgba(109, 40, 217, 0.08)', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {[
          { id: 'all', label: 'All' },
          { id: 'circular', label: 'Circulars' },
          { id: 'placement', label: 'Placement' },
          { id: 'workshop', label: 'Workshop' },
          { id: 'emergency', label: 'Emergency' },
          { id: 'exam', label: 'Exam' },
          { id: 'lost_found', label: 'Lost & Found' },
          { id: 'teacher_notice', label: 'Teacher Notices' },
          { id: 'student_post', label: 'Student Posts' }
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            style={{
              padding: '0.4rem 0.8rem',
              borderRadius: '9999px',
              border: filter === f.id ? '1px solid var(--primary)' : '1px solid rgba(0,0,0,0.1)',
              background: filter === f.id ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'rgba(255,255,255,0.8)',
              color: filter === f.id ? '#fff' : '#64748b',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.8rem',
              textTransform: 'uppercase',
              boxShadow: '0 2px 5px rgba(0,0,0,0.02)',
              transition: 'all 0.2s'
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Main Bulletins */}
      <div className="glass-card" style={{ padding: '1.5rem', minHeight: '200px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '150px' }}>
            <RefreshCw className="animate-spin" size={24} style={{ color: 'var(--primary)' }} />
          </div>
        ) : notifs ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {notifs.split('---').map((section, idx) => {
              const cleanedSection = section.trim();
              if (!cleanedSection) return null;

              // Parse Title, Date, Content
              const lines = cleanedSection.split('\n');
              const headerLine = lines.find(l => l.startsWith('#### ')) || '';
              const contentLines = lines.filter(l => !l.startsWith('#### ') && !l.startsWith('### '));
              
              const titleAndDate = headerLine.replace('#### ', '');
              const title = titleAndDate.split('(')[0]?.trim() || 'Notice';
              const date = titleAndDate.split('(')[1]?.replace(')', '')?.trim() || '';

              // Extract sender info if present
              const senderLineIndex = contentLines.findIndex(l => l.startsWith('Posted by:'));
              let senderText = '';
              let actualContentLines = [...contentLines];
              if (senderLineIndex !== -1) {
                senderText = contentLines[senderLineIndex].replace('Posted by: ', '');
                actualContentLines.splice(senderLineIndex, 1);
              }

              return (
                <div key={idx} style={{ paddingBottom: '1rem', borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)' }}>
                      {title}
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>{date}</span>
                  </div>
                  {senderText && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        fontWeight: 600, 
                        background: 'rgba(109, 40, 217, 0.08)', 
                        color: 'var(--primary)', 
                        padding: '0.2rem 0.6rem', 
                        borderRadius: '0.35rem' 
                      }}>
                        {senderText}
                      </span>
                    </div>
                  )}
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#475569', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                    {actualContentLines.join('\n').trim()}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
            <AlertCircle style={{ display: 'block', margin: '0 auto 0.5rem', opacity: 0.5 }} />
            No notifications available.
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsTab;
