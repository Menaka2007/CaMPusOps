import React, { useState, useEffect } from 'react';
import { Calendar, Clock, BookOpen, UserPlus, RefreshCw, Trash2, Plus, Bell } from 'lucide-react';
import TimetableGrid from './TimetableGrid';

const SchedulerTab = ({ user }) => {
  const [activeView, setActiveView] = useState('dashboard'); // dashboard, timetable, exams, holidays, reminders, booking
  const [data, setData] = useState('');
  const [timetableData, setTimetableData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Reminder state
  const [reminders, setReminders] = useState([]);
  const [newReminderTitle, setNewReminderTitle] = useState('');
  const [newReminderDate, setNewReminderDate] = useState('');
  const [newReminderTime, setNewReminderTime] = useState('09:00 AM');

  // Booking state
  const [bookingChat, setBookingChat] = useState([]);
  const [bookingInput, setBookingInput] = useState('');
  const [inBookingSession, setInBookingSession] = useState(false);

  const fetchSchedulerData = async (viewName) => {
    setLoading(true);
    if (viewName === 'timetable') {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/timetable/student/${user.roll_no}`);
        if (res.ok) {
          const resData = await res.json();
          setTimetableData(resData.timetable || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
      return;
    }

    let query = 'dashboard';
    if (viewName === 'exams') query = 'exam';
    if (viewName === 'holidays') query = 'holiday';

    try {
      const res = await fetch('http://127.0.0.1:8000/api/direct-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_name: 'Scheduler Agent',
          query: query,
          roll_no: user.roll_no,
          name: user.name
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

  const fetchReminders = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/direct-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_name: 'Scheduler Agent',
          query: 'show reminders',
          roll_no: user.roll_no,
          name: user.name
        })
      });
      const resData = await res.json();
      setReminders(parseReminders(resData.response));
    } catch (err) {
      console.error(err);
    }
  };

  const parseReminders = (text) => {
    if (!text || text.includes('no active reminders')) return [];
    return text.split('\n')
      .filter(l => l.startsWith('- '))
      .map(line => {
        const cleaned = line.replace('- ', '');
        const idMatch = cleaned.match(/#(\d+)/);
        const id = idMatch ? idMatch[1] : '';
        const content = cleaned.replace(/#\d+:\s*/, '');
        return { id, text: content };
      });
  };

  const handleAddReminder = async (e) => {
    e.preventDefault();
    if (!newReminderTitle.trim()) return;
    try {
      await fetch('http://127.0.0.1:8000/api/direct-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_name: 'Scheduler Agent',
          query: `set reminder for ${newReminderTitle} on ${newReminderDate || new Date().toISOString().split('T')[0]} at ${newReminderTime}`,
          roll_no: user.roll_no,
          name: user.name
        })
      });
      setNewReminderTitle('');
      fetchReminders();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteReminder = async (id) => {
    try {
      await fetch('http://127.0.0.1:8000/api/direct-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_name: 'Scheduler Agent',
          query: `delete reminder ${id}`,
          roll_no: user.roll_no,
          name: user.name
        })
      });
      fetchReminders();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!bookingInput.trim()) return;

    const userText = bookingInput;
    setBookingChat(prev => [...prev, { sender: 'user', text: userText }]);
    setBookingInput('');

    try {
      const res = await fetch('http://127.0.0.1:8000/api/direct-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_name: 'Scheduler Agent',
          query: userText,
          roll_no: user.roll_no,
          name: user.name
        })
      });
      const resData = await res.json();
      setBookingChat(prev => [...prev, { sender: 'bot', text: resData.response }]);
      if (resData.response.includes('Booked Successfully') || resData.response.includes('cancelled')) {
        setInBookingSession(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const startBookingSession = async () => {
    setInBookingSession(true);
    setBookingChat([]);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/direct-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_name: 'Scheduler Agent',
          query: 'book appointment',
          roll_no: user.roll_no,
          name: user.name
        })
      });
      const resData = await res.json();
      setBookingChat([{ sender: 'bot', text: resData.response }]);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeView === 'reminders') {
      fetchReminders();
    } else if (activeView !== 'booking') {
      fetchSchedulerData(activeView);
    }
  }, [user, activeView]);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Tab Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar /> Academic Planner & Scheduler
        </h3>
        {activeView !== 'reminders' && activeView !== 'booking' && (
          <button 
            onClick={() => fetchSchedulerData(activeView)} 
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.4rem 0.8rem', background: 'rgba(109, 40, 217, 0.08)', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        )}
      </div>

      {/* View Selectors */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {[
          { id: 'dashboard', label: 'Overview', icon: Calendar },
          { id: 'timetable', label: 'Timetable', icon: Clock },
          { id: 'exams', label: 'Exams', icon: BookOpen },
          { id: 'reminders', label: 'My Reminders', icon: Bell },
          { id: 'booking', label: 'Book Faculty', icon: UserPlus }
        ].map((v) => {
          const Icon = v.icon;
          return (
            <button
              key={v.id}
              onClick={() => setActiveView(v.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.5rem 1rem',
                borderRadius: '9999px',
                border: activeView === v.id ? '1px solid var(--primary)' : '1px solid rgba(0,0,0,0.1)',
                background: activeView === v.id ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'rgba(255,255,255,0.8)',
                color: activeView === v.id ? '#fff' : '#64748b',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.8rem',
                transition: 'all 0.2s'
              }}
            >
              <Icon size={14} />
              {v.label}
            </button>
          );
        })}
      </div>

      {/* Main View Area */}
      {activeView === 'reminders' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Add Reminder */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h4 style={{ margin: '0 0 1rem 0', fontWeight: 600 }}>Create Reminder</h4>
            <form onSubmit={handleAddReminder} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem', color: '#475569' }}>Reminder Title</label>
                <input 
                  type="text" 
                  value={newReminderTitle} 
                  onChange={(e) => setNewReminderTitle(e.target.value)}
                  placeholder="e.g. Submit ML report, Pay exam fees..."
                  required
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(109, 40, 217, 0.2)', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem', color: '#475569' }}>Date</label>
                  <input 
                    type="date" 
                    value={newReminderDate} 
                    onChange={(e) => setNewReminderDate(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(109, 40, 217, 0.2)', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem', color: '#475569' }}>Time</label>
                  <input 
                    type="text" 
                    value={newReminderTime} 
                    onChange={(e) => setNewReminderTime(e.target.value)}
                    placeholder="e.g. 09:00 AM"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(109, 40, 217, 0.2)', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
              <button 
                type="submit" 
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <Plus size={16} /> Save Reminder
              </button>
            </form>
          </div>

          {/* Reminders List */}
          <div className="glass-card" style={{ padding: '1.5rem', maxHeight: '400px', overflowY: 'auto' }}>
            <h4 style={{ margin: '0 0 1rem 0', fontWeight: 600 }}>Active Reminders</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {reminders.length > 0 ? (
                reminders.map((r) => (
                  <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem', borderRadius: '0.5rem', border: '1px solid rgba(0,0,0,0.05)', background: '#fff' }}>
                    <div style={{ fontSize: '0.875rem', color: '#1e1b4b', fontWeight: 500 }}>
                      {r.text}
                    </div>
                    <button 
                      onClick={() => handleDeleteReminder(r.id)}
                      style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.25rem' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              ) : (
                <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem', marginTop: '2rem' }}>No reminders scheduled.</p>
              )}
            </div>
          </div>
        </div>
      ) : activeView === 'booking' ? (
        <div className="glass-card" style={{ padding: '1.5rem', minHeight: '350px', display: 'flex', flexDirection: 'column' }}>
          <h4 style={{ margin: '0 0 1rem 0', fontWeight: 600 }}>Book Faculty Appointment</h4>
          {!inBookingSession ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, gap: '1rem' }}>
              <p style={{ color: '#64748b', fontSize: '0.9rem', textAlign: 'center' }}>Click below to initiate a guided, step-by-step appointment booking conversation.</p>
              <button 
                onClick={startBookingSession}
                style={{ padding: '0.75rem 1.5rem', borderRadius: '0.5rem', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}
              >
                Start Booking Session
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
              {/* Chat messages */}
              <div style={{ flexGrow: 1, minHeight: '200px', maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem', padding: '0.5rem', background: 'rgba(0,0,0,0.01)', borderRadius: '0.5rem' }}>
                {bookingChat.map((m, idx) => (
                  <div key={idx} style={{ 
                    alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                    background: m.sender === 'user' ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : '#fff',
                    color: m.sender === 'user' ? '#fff' : '#1e1b4b',
                    padding: '0.75rem',
                    borderRadius: '0.75rem',
                    maxWidth: '80%',
                    fontSize: '0.85rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    whiteSpace: 'pre-line'
                  }}>
                    {m.text}
                  </div>
                ))}
              </div>
              {/* Chat Input */}
              <form onSubmit={handleBookingSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  value={bookingInput}
                  onChange={(e) => setBookingInput(e.target.value)}
                  placeholder="Type your response..."
                  style={{ flexGrow: 1, padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(109, 40, 217, 0.2)', outline: 'none' }}
                />
                <button 
                  type="submit"
                  style={{ padding: '0.75rem 1.25rem', borderRadius: '0.5rem', background: 'var(--primary)', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}
                >
                  Send
                </button>
              </form>
            </div>
          )}
        </div>
      ) : activeView === 'timetable' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '150px' }}>
              <RefreshCw className="animate-spin" size={24} style={{ color: 'var(--primary)' }} />
            </div>
          ) : (
            <TimetableGrid timetable={timetableData} />
          )}
        </div>
      ) : (
        <div className="glass-card" style={{ padding: '2rem', minHeight: '250px' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '150px' }}>
              <RefreshCw className="animate-spin" size={24} style={{ color: 'var(--primary)' }} />
            </div>
          ) : data ? (
            <div style={{ overflowY: 'auto', whiteSpace: 'pre-line', fontSize: '0.95rem', color: '#1e1b4b', lineHeight: '1.7' }}>
              {data.split('\n').map((line, i) => {
                if (line.startsWith('### ')) {
                  return <h4 key={i} style={{ fontSize: '1.15rem', fontWeight: 700, margin: '1rem 0 0.5rem 0', color: 'var(--primary)' }}>{line.replace('### ', '')}</h4>;
                }
                if (line.startsWith('#### ')) {
                  return <h5 key={i} style={{ fontSize: '1rem', fontWeight: 700, margin: '0.75rem 0 0.25rem 0', color: 'var(--secondary)' }}>{line.replace('#### ', '')}</h5>;
                }
                if (line.startsWith('- ')) {
                  return <li key={i} style={{ marginLeft: '1rem', marginBottom: '0.25rem' }}>{line.replace('- ', '')}</li>;
                }
                return <p key={i} style={{ margin: '0.5rem 0' }}>{line}</p>;
              })}
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: '#94a3b8' }}>No data loaded.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default SchedulerTab;
