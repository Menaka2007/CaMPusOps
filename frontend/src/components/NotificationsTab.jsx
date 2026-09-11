import React, { useState, useEffect } from 'react';
import { Bell, RefreshCw, AlertCircle, Tag, User, Calendar } from 'lucide-react';

const NotificationsTab = ({ user }) => {
  const [filter, setFilter] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/admin/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data || []);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => n.category?.toLowerCase() === filter.toLowerCase());

  const getCategoryBadgeStyle = (category) => {
    const cat = category?.toLowerCase();
    if (cat === 'emergency') return { bg: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', border: 'rgba(239, 68, 68, 0.3)' };
    if (cat === 'placement') return { bg: 'rgba(16, 185, 129, 0.12)', color: '#10b981', border: 'rgba(16, 185, 129, 0.3)' };
    if (cat === 'workshop') return { bg: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6', border: 'rgba(59, 130, 246, 0.3)' };
    if (cat === 'exam') return { bg: 'rgba(245, 158, 11, 0.12)', color: '#d97706', border: 'rgba(245, 158, 11, 0.3)' };
    if (cat === 'teacher_notice') return { bg: 'rgba(139, 92, 246, 0.12)', color: '#8b5cf6', border: 'rgba(139, 92, 246, 0.3)' };
    if (cat === 'student_post') return { bg: 'rgba(236, 72, 153, 0.12)', color: '#ec4899', border: 'rgba(236, 72, 153, 0.3)' };
    if (cat === 'lost_found') return { bg: 'rgba(99, 102, 241, 0.12)', color: '#6366f1', border: 'rgba(99, 102, 241, 0.3)' };
    return { bg: 'rgba(109, 40, 217, 0.1)', color: 'var(--primary)', border: 'rgba(109, 40, 217, 0.2)' };
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bell /> Campus Bulletin Board & Announcements
          </h3>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
            Synchronized live updates across students, staff, and administration
          </p>
        </div>
        <button 
          onClick={fetchNotifications} 
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.45rem 0.9rem', background: 'rgba(109, 40, 217, 0.08)', border: '1px solid rgba(109, 40, 217, 0.15)', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {[
          { id: 'all', label: 'All Announcements' },
          { id: 'circular', label: 'Circulars' },
          { id: 'placement', label: 'Placement' },
          { id: 'workshop', label: 'Workshops' },
          { id: 'emergency', label: 'Emergency Alerts' },
          { id: 'exam', label: 'Exam Notices' },
          { id: 'lost_found', label: 'Lost & Found' },
          { id: 'teacher_notice', label: 'Faculty Notices' },
          { id: 'student_post', label: 'Student Posts' }
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: '9999px',
              border: filter === f.id ? '1px solid var(--primary)' : '1px solid rgba(0,0,0,0.1)',
              background: filter === f.id ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'rgba(255,255,255,0.85)',
              color: filter === f.id ? '#fff' : '#64748b',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.8rem',
              boxShadow: filter === f.id ? '0 4px 10px rgba(109, 40, 217, 0.2)' : 'none',
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
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '160px' }}>
            <RefreshCw className="animate-spin" size={26} style={{ color: 'var(--primary)' }} />
          </div>
        ) : filteredNotifications.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {filteredNotifications.map((item) => {
              const badge = getCategoryBadgeStyle(item.category);
              const isEmergency = item.category?.toLowerCase() === 'emergency';

              return (
                <div 
                  key={item.id} 
                  style={{ 
                    padding: '1.25rem', 
                    borderRadius: '0.75rem', 
                    background: isEmergency ? 'rgba(239, 68, 68, 0.04)' : '#fff',
                    border: isEmergency ? '1px solid rgba(239, 68, 68, 0.25)' : '1px solid #f1f5f9',
                    borderLeft: `4px solid ${badge.color}`,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                    transition: 'all 0.15s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ 
                        fontSize: '0.65rem', 
                        fontWeight: 700, 
                        background: badge.bg, 
                        color: badge.color, 
                        border: `1px solid ${badge.border}`,
                        padding: '0.2rem 0.5rem', 
                        borderRadius: '0.35rem',
                        textTransform: 'uppercase'
                      }}>
                        {item.category?.replace('_', ' ')}
                      </span>
                      <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#1e293b' }}>
                        {item.title}
                      </h4>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem', whiteSpace: 'nowrap' }}>
                      <Calendar size={12} /> {item.date}
                    </span>
                  </div>

                  <p style={{ margin: '0.5rem 0', fontSize: '0.875rem', color: '#475569', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                    {item.content}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f8fafc', paddingTop: '0.5rem', marginTop: '0.5rem', fontSize: '0.75rem', color: '#64748b' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <User size={13} style={{ color: 'var(--primary)' }} />
                      Posted by: <strong style={{ color: '#334155' }}>{item.sender_name || 'Campus Administrator'}</strong> ({item.sender_role || 'admin'})
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
            <AlertCircle style={{ display: 'block', margin: '0 auto 0.5rem', opacity: 0.5 }} size={32} />
            <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>No announcements found</div>
            <p style={{ fontSize: '0.8rem', margin: '0.25rem 0 0 0' }}>There are currently no active notifications for this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsTab;
