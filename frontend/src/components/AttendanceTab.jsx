import React, { useState, useEffect } from 'react';
import { 
  UserCheck, AlertTriangle, CheckCircle, Clock, BookOpen, 
  Calendar, RefreshCw, Sparkles, TrendingUp, AlertCircle, Filter, ArrowUpRight 
} from 'lucide-react';
import { apiUrl } from '../api';

const AttendanceTab = ({ user, onAskChatbot }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionFilter, setSessionFilter] = useState('all'); // all, present, absent
  const [subjectFilter, setSubjectFilter] = useState('all');

  const fetchAttendance = async () => {
    setLoading(true);
    setError(null);
    try {
      const rollNo = user?.roll_no || '717721L101';
      const res = await fetch(apiUrl(`http://127.0.0.1:8000/api/student/attendance/${encodeURIComponent(rollNo)}`));
      if (!res.ok) {
        throw new Error('Failed to load attendance records');
      }
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Attendance fetch error:", err);
      setError(err.message || 'Error fetching attendance records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [user]);

  // Determine status color scheme
  const getStatusColor = (pct) => {
    if (pct >= 80) return { text: '#059669', bg: 'rgba(5, 150, 105, 0.1)', border: '#10b981' };
    if (pct >= 75) return { text: '#d97706', bg: 'rgba(217, 119, 6, 0.1)', border: '#f59e0b' };
    return { text: '#dc2626', bg: 'rgba(220, 38, 38, 0.1)', border: '#ef4444' };
  };

  const getStatusBadge = (pct) => {
    if (pct >= 80) return { label: 'Safe', color: '#059669', bg: 'rgba(5, 150, 105, 0.12)' };
    if (pct >= 75) return { label: 'Warning', color: '#d97706', bg: 'rgba(217, 119, 6, 0.12)' };
    return { label: 'Critical (<75%)', color: '#dc2626', bg: 'rgba(220, 38, 38, 0.12)' };
  };

  if (loading) {
    return (
      <div className="glass-card" style={{ padding: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', minHeight: '350px' }}>
        <RefreshCw size={36} className="animate-spin" style={{ color: 'var(--primary)' }} />
        <p style={{ color: '#64748b', fontSize: '0.95rem', fontWeight: 500 }}>Retrieving official attendance logs from campus registry...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', minHeight: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <AlertCircle size={48} style={{ color: '#ef4444', marginBottom: '1rem' }} />
        <h4 style={{ margin: 0, color: '#1e1b4b', fontWeight: 700 }}>Attendance Records Unavailable</h4>
        <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '420px', margin: '0.5rem 0 1.5rem 0' }}>
          {error || 'Unable to connect to the database. Please ensure your register number is active.'}
        </p>
        <button
          onClick={fetchAttendance}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.6rem 1.25rem',
            borderRadius: '9999px',
            background: 'var(--primary)',
            color: '#fff',
            border: 'none',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <RefreshCw size={16} /> Retry
        </button>
      </div>
    );
  }

  // Filter recent sessions
  const filteredSessions = (data.recent_sessions || []).filter(session => {
    const matchesStatus = 
      sessionFilter === 'all' ? true :
      sessionFilter === 'present' ? session.status.toLowerCase() === 'present' :
      session.status.toLowerCase() === 'absent';

    const matchesSubject = 
      subjectFilter === 'all' ? true :
      session.subject.toLowerCase() === subjectFilter.toLowerCase();

    return matchesStatus && matchesSubject;
  });

  const overallColors = getStatusColor(data.overall_percentage);
  const isEligible = data.is_eligible_for_exams;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              ACADEMIC STANDING & COMPLIANCE
            </span>
            <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '9999px', background: 'rgba(109, 40, 217, 0.1)', color: 'var(--primary)', fontWeight: 600 }}>
              Dept: {data.department} | Year {data.year}
            </span>
          </div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#1e1b4b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserCheck size={26} style={{ color: 'var(--primary)' }} />
            Attendance & Exam Eligibility
          </h2>
        </div>

        <button
          onClick={fetchAttendance}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            borderRadius: '9999px',
            background: 'rgba(109, 40, 217, 0.08)',
            border: '1px solid rgba(109, 40, 217, 0.15)',
            color: 'var(--primary)',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <RefreshCw size={14} /> Refresh Logs
        </button>
      </div>

      {/* Statutory 75% Cutoff Alert Banner */}
      {!isEligible ? (
        <div style={{
          padding: '1.25rem 1.5rem',
          borderRadius: '1rem',
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(245, 158, 11, 0.08))',
          border: '1.5px solid rgba(239, 68, 68, 0.3)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '1rem',
          boxShadow: '0 4px 20px rgba(239, 68, 68, 0.08)'
        }}>
          <div style={{
            padding: '0.5rem',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.15)',
            color: '#dc2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <AlertTriangle size={24} />
          </div>
          <div style={{ flexGrow: 1 }}>
            <h4 style={{ margin: '0 0 0.35rem 0', fontSize: '1.05rem', fontWeight: 700, color: '#991b1b' }}>
              Statutory Exam Cutoff Warning: Low Attendance Detected
            </h4>
            <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.875rem', color: '#7f1d1d', lineHeight: '1.5' }}>
              University statutory regulations require a minimum of <strong>75% attendance</strong> in each subject to appear for end-semester examinations. You currently have <strong>{data.low_attendance_subjects.length}</strong> subject(s) below this threshold.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {data.subjects.filter(s => s.is_low).map((s, idx) => (
                <div key={idx} style={{
                  padding: '0.4rem 0.8rem',
                  borderRadius: '0.5rem',
                  background: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: '#b91c1c',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}>
                  <span>{s.subject}: <strong>{s.percentage}%</strong></span>
                  <span style={{ color: '#64748b', fontWeight: 400 }}>|</span>
                  <span>Must attend next <strong>{s.classes_needed_for_75}</strong> consecutive classes</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div style={{
          padding: '1rem 1.5rem',
          borderRadius: '1rem',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(5, 150, 105, 0.04))',
          border: '1.5px solid rgba(16, 185, 129, 0.25)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            padding: '0.4rem',
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.15)',
            color: '#059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <CheckCircle size={22} />
          </div>
          <div>
            <h4 style={{ margin: '0 0 0.2rem 0', fontSize: '0.95rem', fontWeight: 700, color: '#065f46' }}>
              Full Statutory Compliance: Eligible for Examinations
            </h4>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#047857' }}>
              Your attendance satisfies the 75% statutory requirement across all subjects. Maintain regular presence to ensure hall ticket release.
            </p>
          </div>
        </div>
      )}

      {/* KPI Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem' }}>
        
        {/* Overall Percentage Card */}
        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Overall Attendance</span>
            <div style={{ padding: '0.35rem', borderRadius: '0.5rem', background: overallColors.bg, color: overallColors.text }}>
              <TrendingUp size={16} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: overallColors.text }}>
              {data.overall_percentage}%
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: overallColors.text, padding: '0.2rem 0.5rem', borderRadius: '9999px', background: overallColors.bg }}>
              {data.overall_percentage >= 75 ? 'Safe Standing' : 'Cutoff Warning'}
            </span>
          </div>
          <div style={{ marginTop: '0.75rem', background: 'rgba(0, 0, 0, 0.06)', borderRadius: '9999px', height: '6px', overflow: 'hidden' }}>
            <div style={{ width: `${Math.min(100, data.overall_percentage)}%`, height: '100%', background: overallColors.border, borderRadius: '9999px', transition: 'width 0.8s ease-in-out' }} />
          </div>
        </div>

        {/* Classes Attended */}
        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Sessions Attended</span>
            <div style={{ padding: '0.35rem', borderRadius: '0.5rem', background: 'rgba(37, 99, 235, 0.1)', color: 'var(--secondary)' }}>
              <CheckCircle size={16} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1e1b4b' }}>
            {data.attended_classes} <span style={{ fontSize: '1rem', fontWeight: 500, color: '#64748b' }}>/ {data.total_classes}</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
            Total scheduled hours in this academic term
          </div>
        </div>

        {/* Missed Sessions */}
        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Absent Hours</span>
            <div style={{ padding: '0.35rem', borderRadius: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', color: '#dc2626' }}>
              <Clock size={16} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: data.missed_classes > 5 ? '#dc2626' : '#1e1b4b' }}>
            {data.missed_classes} <span style={{ fontSize: '1rem', fontWeight: 500, color: '#64748b' }}>sessions</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
            {data.missed_classes === 0 ? 'Perfect record!' : 'Includes authorized OD and leaves'}
          </div>
        </div>

        {/* Examination Clearance */}
        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Exam Clearance</span>
            <div style={{ padding: '0.35rem', borderRadius: '0.5rem', background: isEligible ? 'rgba(5, 150, 105, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: isEligible ? '#059669' : '#dc2626' }}>
              <BookOpen size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: isEligible ? '#059669' : '#dc2626', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.25rem' }}>
            {isEligible ? 'Eligible to Appear ✅' : 'Action Required ⚠️'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.65rem' }}>
            {isEligible ? 'Hall ticket will be issued automatically' : 'Consult HoD for condonation / recovery'}
          </div>
        </div>

      </div>

      {/* Subject-Wise Attendance Breakdown */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#1e1b4b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen size={20} style={{ color: 'var(--primary)' }} />
            Subject-Wise Attendance Analytics
          </h3>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Cutoff Threshold: 75% minimum</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          {data.subjects.map((sub, idx) => {
            const badge = getStatusBadge(sub.percentage);
            const color = getStatusColor(sub.percentage);

            return (
              <div 
                key={idx} 
                className="glass-card" 
                style={{ 
                  padding: '1.25rem', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '0.75rem',
                  border: sub.is_low ? '1.5px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--glass-border)'
                }}
              >
                {/* Subject Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#1e1b4b' }}>
                      {sub.subject}
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {sub.attended_classes} of {sub.total_classes} classes attended ({sub.missed_classes} missed)
                    </span>
                  </div>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    fontWeight: 700, 
                    padding: '0.25rem 0.6rem', 
                    borderRadius: '9999px', 
                    background: badge.bg, 
                    color: badge.color,
                    flexShrink: 0
                  }}>
                    {badge.label}
                  </span>
                </div>

                {/* Progress Bar & Percentage */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    <span style={{ color: color.text }}>{sub.percentage}%</span>
                    <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 500 }}>Cutoff: 75%</span>
                  </div>
                  <div style={{ background: 'rgba(0, 0, 0, 0.06)', borderRadius: '9999px', height: '8px', overflow: 'hidden', position: 'relative' }}>
                    {/* 75% indicator line */}
                    <div style={{ position: 'absolute', left: '75%', top: 0, bottom: 0, width: '2px', background: 'rgba(239, 68, 68, 0.5)', zIndex: 2 }} />
                    <div 
                      style={{ 
                        width: `${Math.min(100, sub.percentage)}%`, 
                        height: '100%', 
                        background: color.border, 
                        borderRadius: '9999px',
                        transition: 'width 0.8s ease-in-out'
                      }} 
                    />
                  </div>
                </div>

                {/* Recovery / Standing Notice */}
                {sub.is_low ? (
                  <div style={{ 
                    padding: '0.5rem 0.75rem', 
                    borderRadius: '0.5rem', 
                    background: 'rgba(239, 68, 68, 0.08)', 
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    fontSize: '0.75rem',
                    color: '#991b1b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}>
                    <AlertTriangle size={14} style={{ flexShrink: 0 }} />
                    <span>Must attend next <strong>{sub.classes_needed_for_75} consecutive classes</strong> to clear 75% cutoff.</span>
                  </div>
                ) : (
                  <div style={{ 
                    padding: '0.4rem 0.6rem', 
                    borderRadius: '0.5rem', 
                    background: 'rgba(5, 150, 105, 0.06)', 
                    fontSize: '0.75rem',
                    color: '#047857',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}>
                    <CheckCircle size={14} />
                    <span>Meets university eligibility criteria</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Assistant Quick Inquiries */}
      <div className="glass-card" style={{ padding: '1.25rem 1.5rem', background: 'linear-gradient(135deg, rgba(109, 40, 217, 0.05), rgba(37, 99, 235, 0.05))', border: '1px solid rgba(109, 40, 217, 0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <Sparkles size={16} style={{ color: 'var(--primary)' }} />
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>Ask AI Assistant About Attendance</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {[
            "Am I eligible for semester exams?",
            "What is my attendance in Engineering Physics?",
            "How many classes do I need to attend to cross 75%?",
            "What is my attendance percentage?"
          ].map((prompt, i) => (
            <button
              key={i}
              onClick={() => {
                if (onAskChatbot) {
                  onAskChatbot(prompt);
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.4rem 0.85rem',
                borderRadius: '9999px',
                background: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid rgba(109, 40, 217, 0.15)',
                color: '#1e1b4b',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(109, 40, 217, 0.15)'}
            >
              <span>{prompt}</span>
              <ArrowUpRight size={12} style={{ color: 'var(--primary)' }} />
            </button>
          ))}
        </div>
      </div>

      {/* Real-Time Session Log Table */}
      <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        {/* Table Header & Controls */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#1e1b4b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={18} style={{ color: 'var(--primary)' }} />
              Recent Class Attendance Logs
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Live records submitted by department staff</span>
          </div>

          {/* Filter Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'rgba(0,0,0,0.04)', padding: '0.2rem', borderRadius: '0.5rem' }}>
              {['all', 'present', 'absent'].map(f => (
                <button
                  key={f}
                  onClick={() => setSessionFilter(f)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '0.35rem',
                    border: 'none',
                    background: sessionFilter === f ? '#fff' : 'transparent',
                    color: sessionFilter === f ? 'var(--primary)' : '#64748b',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    boxShadow: sessionFilter === f ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                    textTransform: 'capitalize'
                  }}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Subject Selector */}
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              style={{
                padding: '0.4rem 0.75rem',
                borderRadius: '0.5rem',
                border: '1px solid rgba(109, 40, 217, 0.15)',
                background: 'rgba(255, 255, 255, 0.9)',
                color: '#1e1b4b',
                fontSize: '0.75rem',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Subjects</option>
              {data.subjects.map((s, i) => (
                <option key={i} value={s.subject}>{s.subject}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Sessions Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1.5px solid rgba(109, 40, 217, 0.1)', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '0.75rem' }}>Date</th>
                <th style={{ padding: '0.75rem' }}>Slot / Period</th>
                <th style={{ padding: '0.75rem' }}>Subject</th>
                <th style={{ padding: '0.75rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredSessions.length > 0 ? (
                filteredSessions.map((session, idx) => {
                  const isPresent = session.status.toLowerCase() === 'present';
                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid rgba(109, 40, 217, 0.05)', transition: 'background 0.2s' }}>
                      <td style={{ padding: '0.75rem', fontWeight: 600, color: '#1e1b4b' }}>
                        {session.date}
                      </td>
                      <td style={{ padding: '0.75rem', color: '#64748b' }}>
                        Slot {session.slot_index || 1}
                      </td>
                      <td style={{ padding: '0.75rem', fontWeight: 600, color: '#334155' }}>
                        {session.subject}
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          padding: '0.25rem 0.65rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          background: isPresent ? 'rgba(5, 150, 105, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color: isPresent ? '#059669' : '#dc2626'
                        }}>
                          {isPresent ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
                          {session.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                    No sessions match the selected filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};

export default AttendanceTab;
