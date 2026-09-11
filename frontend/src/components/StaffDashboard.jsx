import React, { useState, useEffect } from 'react';
import { 
  Calendar, BookOpen, Clock, User, LogOut, Plus, Trash2, 
  Download, Search, Bell, Moon, Sun, ShieldAlert, GraduationCap, Briefcase
} from 'lucide-react';
import { getSubjectDetails } from './TimetableGrid';
import FloatingAIChatbot from './FloatingAIChatbot';
import StatusBadge from './StatusBadge';
import MarkdownView from './MarkdownView';
import { apiUrl } from '../api';


const StaffDashboard = ({ user, onLogout }) => {
  const [timetable, setTimetable] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [invigilations, setInvigilations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState(3);
  const [activeTab, setActiveTab] = useState('teaching');
  const [calendar, setCalendar] = useState([]);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSlot, setNewSlot] = useState({
    year: 3,
    day: 'Monday',
    slot_index: 1,
    subject: ''
  });

  // Attendance States
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [attendanceForm, setAttendanceForm] = useState({
    year: 3,
    subject: '',
    slot_index: 1,
    date: new Date().toISOString().split('T')[0]
  });
  const [attendanceRecords, setAttendanceRecords] = useState({}); // roll_no -> 'present'/'absent'
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceMessage, setAttendanceMessage] = useState('');

  // Woke Event States
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [newEventCategory, setNewEventCategory] = useState('Intersectionality & Privilege');
  const [isVegan, setIsVegan] = useState(true);
  const [isPronounCheck, setIsPronounCheck] = useState(true);
  const [isZeroWaste, setIsZeroWaste] = useState(true);
  const [isSafeSpace, setIsSafeSpace] = useState(true);
  const [isSubmittingEvent, setIsSubmittingEvent] = useState(false);
  const [eventMessage, setEventMessage] = useState('');
  
  // Notices States
  const [notices, setNotices] = useState([]);
  const [newNotice, setNewNotice] = useState({
    title: '',
    content: '',
    category: 'circular'
  });
  const [noticeMessage, setNoticeMessage] = useState('');
  const [isSubmittingNotice, setIsSubmittingNotice] = useState(false);

  const parseEvent = (ev) => {
    const rawTitle = ev.title || '';
    if (rawTitle.includes(' |tags:')) {
      const parts = rawTitle.split(' |tags:');
      const titleText = parts[0];
      const rest = parts[1] || '';
      const subParts = rest.split(' |category:');
      const tagsStr = subParts[0] || '';
      const category = subParts[1] || 'General Inclusion';
      return {
        id: ev.id,
        title: titleText,
        date: ev.date,
        tags: tagsStr ? tagsStr.split(',') : [],
        category
      };
    }
    
    // Fallback parsing for seeded default events
    let category = 'Diversity & Inclusion';
    let tags = [];
    if (rawTitle.includes('Pronoun') || rawTitle.includes('Gender')) {
      category = 'LGBTQIA+ & Pronouns';
      tags = ['🏳️‍🌈 She/They Friendly', '🧠 Safe Space Certified'];
    } else if (rawTitle.includes('Decolonizing') || rawTitle.includes('Intersectionality')) {
      category = 'Decolonizing Science';
      tags = ['🧠 Safe Space Certified'];
    } else if (rawTitle.includes('Eco-Anxiety') || rawTitle.includes('Climate')) {
      category = 'Climate & Eco-Justice';
      tags = ['♻️ Carbon Neutral'];
    } else if (rawTitle.includes('ESHWARIA') || rawTitle.includes('Cultural')) {
      category = 'Climate & Eco-Justice';
      tags = ['🌱 Vegan', '♻️ Carbon Neutral'];
    } else {
      tags = ['🧠 Safe Space Certified'];
    }
    return {
      id: ev.id,
      title: rawTitle,
      date: ev.date,
      tags,
      category
    };
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;
    setIsSubmittingEvent(true);
    setEventMessage('');

    let wokeTitle = newEventTitle.trim();
    const tags = [];
    if (isVegan) tags.push("🌱 Vegan");
    if (isPronounCheck) tags.push("🏳️‍🌈 She/They Friendly");
    if (isZeroWaste) tags.push("♻️ Carbon Neutral");
    if (isSafeSpace) tags.push("🧠 Safe Space Certified");
    
    const titleWithMeta = `${wokeTitle} |tags:${tags.join(",")} |category:${newEventCategory}`;

    try {
      const res = await fetch(apiUrl('http://127.0.0.1:8000/api/academic-calendar/add'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: titleWithMeta,
          date: newEventDate,
          type: 'event'
        })
      });

      if (res.ok) {
        setEventMessage("Woke event organized successfully! 🎉");
        setNewEventTitle('');
        fetchData();
        setTimeout(() => setEventMessage(''), 3000);
      } else {
        setEventMessage("Failed to organize event.");
      }
    } catch (err) {
      console.error(err);
      setEventMessage("Error organizing event.");
    } finally {
      setIsSubmittingEvent(false);
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this event?")) return;
    try {
      const res = await fetch(apiUrl('http://127.0.0.1:8000/api/academic-calendar/delete'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const dept = user.dept || 'CSE';

  const fetchStudentsForAttendance = async (year) => {
    const defaultStudentList = [
      { roll_no: "717721L101", name: "Aravind Swamy" },
      { roll_no: "717721L102", name: "J. Samhitha" },
      { roll_no: "717721L103", name: "Vinisha" },
      { roll_no: "717721L104", name: "Anushya" },
      { roll_no: "717721L105", name: "Varsha" },
      { roll_no: "717721L106", name: "Kanishka" },
      { roll_no: "717721L107", name: "Prega" },
      { roll_no: "717721L108", name: "Akshaya" },
      { roll_no: "717721L109", name: "Madhumita" },
      { roll_no: "717721L110", name: "S. Chandrika" },
      { roll_no: "717721L111", name: "Menaka S" }
    ];

    try {
      const res = await fetch(apiUrl(`http://127.0.0.1:8000/api/staff/students?dept=${dept}&year=${year}`));
      if (res.ok) {
        let data = await res.json();
        if (!data || data.length === 0) {
          data = defaultStudentList;
        }
        setStudents(data);
        const initial = {};
        data.forEach(s => {
          initial[s.roll_no] = 'present';
        });
        setAttendanceRecords(initial);
      } else {
        setStudents(defaultStudentList);
        const initial = {};
        defaultStudentList.forEach(s => { initial[s.roll_no] = 'present'; });
        setAttendanceRecords(initial);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      setStudents(defaultStudentList);
      const initial = {};
      defaultStudentList.forEach(s => { initial[s.roll_no] = 'present'; });
      setAttendanceRecords(initial);
    }
  };

  useEffect(() => {
    if (isAttendanceModalOpen) {
      fetchStudentsForAttendance(attendanceForm.year);
    }
  }, [isAttendanceModalOpen, attendanceForm.year]);

  const handleSubmitAttendance = async (e) => {
    e.preventDefault();
    if (!attendanceForm.subject.trim()) {
      setAttendanceMessage("Please enter a subject name.");
      return;
    }
    setAttendanceLoading(true);
    setAttendanceMessage('');
    try {
      const recordsArray = Object.keys(attendanceRecords).map(roll => ({
        roll_no: roll,
        status: attendanceRecords[roll]
      }));

      const res = await fetch(apiUrl('http://127.0.0.1:8000/api/staff/attendance/submit'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dept: dept,
          year: parseInt(attendanceForm.year),
          subject: attendanceForm.subject,
          slot_index: parseInt(attendanceForm.slot_index),
          date: attendanceForm.date,
          records: recordsArray
        })
      });

      if (res.ok) {
        setAttendanceMessage('Attendance submitted successfully!');
        setTimeout(() => {
          setIsAttendanceModalOpen(false);
          setAttendanceMessage('');
        }, 1500);
      } else {
        const errorData = await res.json();
        setAttendanceMessage(`Error: ${errorData.detail || 'Failed to submit'}`);
      }
    } catch (error) {
      console.error("Error submitting attendance:", error);
      setAttendanceMessage("Error submitting attendance");
    } finally {
      setAttendanceLoading(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Timetable
      const ttRes = await fetch(apiUrl(`http://127.0.0.1:8000/api/staff/timetable/${dept}`));
      if (ttRes.ok) {
        const data = await ttRes.json();
        setTimetable(data.timetable);
      }

      // Fetch Meetings
      const mtRes = await fetch(apiUrl(`http://127.0.0.1:8000/api/staff/meetings`));
      if (mtRes.ok) {
        const data = await mtRes.json();
        setMeetings(data.meetings);
      }

      // Fetch Invigilations
      const invRes = await fetch(apiUrl(`http://127.0.0.1:8000/api/staff/invigilations`));
      if (invRes.ok) {
        const data = await invRes.json();
        setInvigilations(data.invigilations);
      }

      // Fetch Academic Calendar
      const calRes = await fetch(apiUrl(`http://127.0.0.1:8000/api/academic-calendar`));
      if (calRes.ok) {
        const data = await calRes.json();
        setCalendar(data.calendar || []);
      }

      // Fetch Notices
      const noticesRes = await fetch(apiUrl(`http://127.0.0.1:8000/api/admin/notifications`));
      if (noticesRes.ok) {
        const data = await noticesRes.json();
        setNotices(data || []);
      }
    } catch (error) {
      console.error("Error fetching staff dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBroadcastNotice = async (e) => {
    e.preventDefault();
    if (!newNotice.title.trim() || !newNotice.content.trim()) return;
    setIsSubmittingNotice(true);
    setNoticeMessage('');

    try {
      const res = await fetch(apiUrl('http://127.0.0.1:8000/api/admin/notifications/add'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newNotice.title.trim(),
          content: newNotice.content.trim(),
          category: newNotice.category,
          sender_name: user.name,
          sender_role: 'teacher'
        })
      });

      if (res.ok) {
        setNoticeMessage("Notice broadcasted successfully! 📢");
        setNewNotice({ title: '', content: '', category: 'circular' });
        // Refresh notices list
        const noticesRes = await fetch(apiUrl(`http://127.0.0.1:8000/api/admin/notifications`));
        if (noticesRes.ok) {
          const data = await noticesRes.json();
          setNotices(data || []);
        }
        setTimeout(() => setNoticeMessage(''), 3000);
      } else {
        setNoticeMessage("Failed to broadcast notice.");
      }
    } catch (err) {
      console.error(err);
      setNoticeMessage("Error broadcasting notice.");
    } finally {
      setIsSubmittingNotice(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dept]);

  const handleAddSlot = async (e) => {
    e.preventDefault();
    if (!newSlot.subject.trim()) return;

    try {
      const res = await fetch(apiUrl('http://127.0.0.1:8000/api/staff/timetable/add'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dept: dept,
          year: parseInt(newSlot.year),
          day: newSlot.day,
          slot_index: parseInt(newSlot.slot_index),
          subject: newSlot.subject
        })
      });

      if (res.ok) {
        setIsModalOpen(false);
        setNewSlot({ ...newSlot, subject: '' });
        fetchData();
      }
    } catch (error) {
      console.error("Error adding slot:", error);
    }
  };

  const handleDeleteSlot = async (year, day, slotIndex) => {
    if (!window.confirm("Are you sure you want to remove this class slot?")) return;

    try {
      const res = await fetch(apiUrl('http://127.0.0.1:8000/api/staff/timetable/delete'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dept: dept,
          year: parseInt(year),
          day: day,
          slot_index: parseInt(slotIndex)
        })
      });

      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Error deleting slot:", error);
    }
  };

  // Helper to find slot content
  const getSlotContent = (day, slotNum) => {
    const dayData = timetable.find(t => t.day === day && t.year === selectedYear);
    if (!dayData) return "";
    return dayData[`slot_${slotNum}`] || "";
  };

  // Calculate lecture counts
  const totalLectures = timetable
    .filter(t => t.year === selectedYear)
    .reduce((acc, curr) => {
      let count = 0;
      for (let i = 1; i <= 4; i++) {
        if (curr[`slot_${i}`] && curr[`slot_${i}`].trim() !== '') count++;
      }
      return acc + count;
    }, 0);

  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const SLOTS = [
    { num: 1, name: 'PERIOD 1', time: '09:00 AM - 10:30 AM' },
    { num: 2, name: 'PERIOD 2', time: '10:30 AM - 12:00 PM' },
    { num: 3, name: 'PERIOD 3', time: '01:00 PM - 02:30 PM' },
    { num: 4, name: 'PERIOD 4', time: '02:30 PM - 04:00 PM' }
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-gradient)', fontFamily: "'Inter', sans-serif" }}>
      
      {/* Sidebar */}
      <aside className="glass-card" style={{ width: '300px', margin: '1rem', marginRight: '0', display: 'flex', flexDirection: 'column', padding: '1.5rem', borderRadius: '1.25rem', height: 'calc(100vh - 2rem)', position: 'sticky', top: '1rem', boxSizing: 'border-box' }}>
        
        {/* Logo / Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(217, 119, 6, 0.2)', marginBottom: '1.5rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #1e1b4b, #4338ca)', border: '1.5px solid rgba(217, 119, 6, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbf24', fontSize: '1.2rem', boxSizing: 'border-box' }}>
            👑
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: '#1e1b4b' }}>Royal Faculty Hub</h4>
            <span style={{ fontSize: '0.68rem', color: '#b45309', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase' }}>SRI ESHWAR AUTONOMOUS SUITE</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flexGrow: 1 }}>
          <button 
            onClick={() => setActiveTab('teaching')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: '0.75rem',
              border: 'none',
              background: activeTab === 'teaching' ? 'rgba(109, 40, 217, 0.08)' : 'transparent',
              textAlign: 'left',
              cursor: 'pointer',
              width: '100%',
              color: activeTab === 'teaching' ? 'var(--primary)' : '#475569',
              fontWeight: activeTab === 'teaching' ? 700 : 500
            }}
          >
            <Briefcase size={18} />
            Teaching Hub
          </button>
          
          <button 
            onClick={() => setActiveTab('events')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: '0.75rem',
              border: 'none',
              background: activeTab === 'events' ? 'rgba(109, 40, 217, 0.08)' : 'transparent',
              textAlign: 'left',
              cursor: 'pointer',
              width: '100%',
              color: activeTab === 'events' ? 'var(--primary)' : '#475569',
              fontWeight: activeTab === 'events' ? 700 : 500
            }}
          >
            <Calendar size={18} />
            College Events
          </button>

          <button 
            onClick={() => setActiveTab('notices')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: '0.75rem',
              border: 'none',
              background: activeTab === 'notices' ? 'rgba(109, 40, 217, 0.08)' : 'transparent',
              textAlign: 'left',
              cursor: 'pointer',
              width: '100%',
              color: activeTab === 'notices' ? 'var(--primary)' : '#475569',
              fontWeight: activeTab === 'notices' ? 700 : 500
            }}
          >
            <Bell size={18} />
            Notices & Alerts
          </button>
        </div>

        {/* Profile Card & Logout */}
        <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(109, 40, 217, 0.1)', paddingTop: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: 'bold' }}>
              {user.name.charAt(0)}
            </div>
            <div>
              <h5 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700 }}>{user.name}</h5>
              <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>{user.role}</span>
            </div>
          </div>
          
          <button 
            onClick={onLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              width: '100%',
              padding: '0.75rem',
              borderRadius: '0.75rem',
              background: 'none',
              border: '1px solid #fee2e2',
              color: '#ef4444',
              cursor: 'pointer',
              fontWeight: 600,
              transition: 'all 0.2s'
            }}
          >
            <LogOut size={16} />
            Disconnect Portal
          </button>
        </div>

      </aside>

      {/* Main Content Area */}
      <main style={{ flexGrow: 1, minWidth: 0, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', boxSizing: 'border-box', overflowY: 'auto' }}>
        
        {/* Top Header */}
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div style={{ position: 'relative', width: '380px' }}>
            <input 
              type="text" 
              placeholder="Search subjects, faculty or classroom..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 1rem',
                paddingLeft: '2.5rem',
                borderRadius: '9999px',
                border: '1px solid rgba(109, 40, 217, 0.15)',
                outline: 'none',
                background: 'rgba(255, 255, 255, 0.8)',
                fontSize: '0.9rem'
              }}
            />
            <Search size={16} style={{ position: 'absolute', left: '0.875rem', top: '0.8rem', color: '#94a3b8' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Swap selector */}
            <div style={{ background: '#f1f5f9', padding: '0.25rem', borderRadius: '9999px', display: 'flex', gap: '0.25rem' }}>
              <span style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', color: '#64748b', fontWeight: 600 }}>SWAP:</span>
              <button style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', borderRadius: '9999px', border: 'none', background: 'none', color: '#64748b', cursor: 'pointer' }}>Student</button>
              <button style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', borderRadius: '9999px', border: 'none', background: 'var(--primary)', color: '#fff', fontWeight: 600 }}>Staff</button>
              <button style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', borderRadius: '9999px', border: 'none', background: 'none', color: '#64748b', cursor: 'pointer' }}>Admin</button>
            </div>

            <button style={{ width: '40px', height: '40px', borderRadius: '50%', border: 'none', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <Moon size={18} />
            </button>
            
            <button style={{ width: '40px', height: '40px', borderRadius: '50%', border: 'none', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', cursor: 'pointer', position: 'relative', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <Bell size={18} />
              <span style={{ position: 'absolute', top: '8px', right: '8px', width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }}></span>
            </button>
          </div>
        </header>

        {/* Content Layout Grid (Main + Side Panels) */}
        {activeTab === 'teaching' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>
            
            {/* Left Main Dashboard */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Stat Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                
                <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(109, 40, 217, 0.1)', color: 'var(--primary)' }}>
                    <Calendar size={24} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Weekly Classes</span>
                    <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '1.25rem', fontWeight: 800 }}>{totalLectures} Lectures</h3>
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(109, 40, 217, 0.1)', color: 'var(--primary)' }}>
                    <Clock size={24} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Free Periods</span>
                    <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '1.25rem', fontWeight: 800 }}>{20 - totalLectures} Slots</h3>
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                    <User size={24} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Student Strength</span>
                    <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '1.25rem', fontWeight: 800 }}>60 Students</h3>
                  </div>
                </div>

                <div 
                  className="glass-card" 
                  onClick={() => {
                    setAttendanceForm({
                      year: selectedYear,
                      subject: '',
                      slot_index: 1,
                      date: new Date().toISOString().split('T')[0]
                    });
                    setIsAttendanceModalOpen(true);
                  }}
                  style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}
                >
                  <div style={{ padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(109, 40, 217, 0.05)', color: 'var(--primary)' }}>
                    <BookOpen size={24} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Attendance Shortcut</span>
                    <h4 style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700 }}>Mark Attendance Now →</h4>
                  </div>
                </div>

              </div>

              {/* Teaching Schedule Section */}
              <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Teaching Schedule</h3>
                      <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>Department of {dept}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f8fafc', padding: '0.25rem 0.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Filter:</span>
                      <select 
                        value={selectedYear} 
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        style={{ padding: '0.25rem 0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', fontSize: '0.8rem', outline: 'none', background: '#fff', fontWeight: 600, color: '#475569', cursor: 'pointer' }}
                      >
                        <option value={1}>Year 1</option>
                        <option value={2}>Year 2</option>
                        <option value={3}>Year 3</option>
                        <option value={4}>Year 4</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button 
                      onClick={() => {
                        setNewSlot(prev => ({ ...prev, year: selectedYear }));
                        setIsModalOpen(true);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.5rem',
                        border: 'none',
                        background: 'var(--primary)',
                        color: '#fff',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                      }}
                    >
                      <Plus size={16} /> Add Schedule Slot
                    </button>
                    <button 
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.5rem',
                        border: '1px solid #cbd5e1',
                        background: '#fff',
                        color: '#475569',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                      }}
                    >
                      <Download size={16} /> Download Timetable PDF
                    </button>
                  </div>
                </div>

                {/* Timetable Grid View */}
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left', padding: '0.75rem', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', width: '100px' }}>Day</th>
                        {SLOTS.map(slot => (
                          <th key={slot.num} style={{ textAlign: 'center', padding: '0.75rem', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                            <div>{slot.name}</div>
                            <div style={{ fontSize: '0.65rem', fontWeight: 500, textTransform: 'none', marginTop: '0.15rem' }}>{slot.time}</div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {DAYS.map(day => (
                        <tr key={day} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '1rem 0.75rem', fontWeight: 700, fontSize: '0.875rem', color: '#334155' }}>{day}</td>
                          {SLOTS.map(slot => {
                            const val = getSlotContent(day, slot.num);
                            const details = getSubjectDetails(val);
                            return (
                              <td key={slot.num} style={{ padding: '0.75rem', textAlign: 'center' }}>
                                {val ? (
                                  <div style={{ 
                                    background: 'rgba(109, 40, 217, 0.05)', 
                                    border: '1px solid rgba(109, 40, 217, 0.1)', 
                                    borderRadius: '0.5rem', 
                                    padding: '0.75rem',
                                    position: 'relative',
                                    textAlign: 'left'
                                  }}>
                                    <button 
                                      onClick={() => handleDeleteSlot(selectedYear, day, slot.num)}
                                      style={{
                                        position: 'absolute',
                                        top: '6px',
                                        right: '6px',
                                        border: 'none',
                                        background: 'none',
                                        color: '#ef4444',
                                        cursor: 'pointer',
                                        padding: '2px',
                                        borderRadius: '4px'
                                      }}
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', paddingRight: '12px' }}>{val}</div>
                                    <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.25rem' }}>{details.venue}</div>
                                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{details.faculty}</div>
                                  </div>
                                ) : (
                                  <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontStyle: 'italic' }}>No Class</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>

            </div>

            {/* Right Side Info Panels */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Department Meetings Panel */}
              <div className="glass-card" style={{ padding: '1.5rem' }}>
                <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Department Meetings</h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {meetings.map(meeting => (
                    <div key={meeting.id} style={{ padding: '1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.75rem' }}>
                      <h5 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', fontWeight: 700, color: '#1e293b' }}>{meeting.title}</h5>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.75rem', color: '#64748b' }}>
                        <div>📅 {meeting.time}</div>
                        <div>📍 {meeting.location}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Exam Invigilation Duty Panel */}
              <div className="glass-card" style={{ padding: '1.5rem' }}>
                <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Exam Invigilation Duty</h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {invigilations.map(inv => (
                    <div key={inv.id} style={{ padding: '1rem', background: '#fff1f2', border: '1px solid #ffe4e6', borderRadius: '0.75rem' }}>
                      <h5 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', fontWeight: 700, color: '#9f1239' }}>{inv.title}</h5>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.75rem', color: '#be123c' }}>
                        <div>📅 {inv.time}</div>
                        <div>📍 {inv.location}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        ) : activeTab === 'events' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem', alignItems: 'start' }}>
            
            {/* Left: Events List & Metrics */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Woke Stats Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                <div className="glass-card" style={{ padding: '1.25rem', background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.1), rgba(139, 92, 246, 0.15))', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                  <span style={{ fontSize: '0.7rem', color: '#6d28d9', textTransform: 'uppercase', fontWeight: 700 }}>Safe Space Zones</span>
                  <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '1.5rem', fontWeight: 800, color: '#5b21b6' }}>4 Active</h3>
                  <span style={{ fontSize: '0.65rem', color: '#7c3aed', marginTop: '0.25rem', display: 'block' }}>100% De-escalation Certified</span>
                </div>
                
                <div className="glass-card" style={{ padding: '1.25rem', background: 'linear-gradient(135deg, rgba(52, 211, 153, 0.1), rgba(16, 185, 129, 0.15))', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  <span style={{ fontSize: '0.7rem', color: '#047857', textTransform: 'uppercase', fontWeight: 700 }}>Carbon Offset Rate</span>
                  <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '1.5rem', fontWeight: 800, color: '#065f46' }}>94.2% Offset</h3>
                  <span style={{ fontSize: '0.65rem', color: '#059669', marginTop: '0.25rem', display: 'block' }}>Goal: Zero-Waste by 2027</span>
                </div>

                <div className="glass-card" style={{ padding: '1.25rem', background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.15))', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                  <span style={{ fontSize: '0.7rem', color: '#b45309', textTransform: 'uppercase', fontWeight: 700 }}>Pronoun Diversity</span>
                  <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '1.5rem', fontWeight: 800, color: '#92400e' }}>100% Welcoming</h3>
                  <span style={{ fontSize: '0.65rem', color: '#d97706', marginTop: '0.25rem', display: 'block' }}>Intersectional Inclusion</span>
                </div>
              </div>

              {/* Events List */}
              <div className="glass-card" style={{ padding: '1.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>📢 Active College Initiatives & Events</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 500, background: 'rgba(109, 40, 217, 0.1)', color: 'var(--primary)', padding: '0.2rem 0.5rem', borderRadius: '9999px' }}>
                    {calendar.filter(e => e.type === 'event').length} Listed
                  </span>
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {calendar.filter(e => e.type === 'event').map(e => {
                    const parsed = parseEvent(e);
                    return (
                      <div 
                        key={parsed.id} 
                        style={{ 
                          padding: '1.25rem', 
                          background: 'rgba(255,255,255,0.6)', 
                          border: '1px solid rgba(109, 40, 217, 0.08)', 
                          borderRadius: '1rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'start',
                          transition: 'all 0.2s',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ 
                              fontSize: '0.65rem', 
                              padding: '0.25rem 0.5rem', 
                              borderRadius: '0.5rem', 
                              background: 'rgba(109, 40, 217, 0.08)', 
                              color: 'var(--primary)', 
                              fontWeight: 700,
                              textTransform: 'uppercase'
                            }}>
                              {parsed.category}
                            </span>
                            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>
                              📅 {parsed.date}
                            </span>
                          </div>
                          
                          <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>
                            {parsed.title}
                          </h4>

                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                            {parsed.tags.map(t => (
                              <span key={t} style={{ 
                                fontSize: '0.7rem', 
                                padding: '0.15rem 0.4rem', 
                                borderRadius: '0.35rem', 
                                background: t.includes('Vegan') ? 'rgba(16, 185, 129, 0.08)' : t.includes('Neutral') ? 'rgba(59, 130, 246, 0.08)' : 'rgba(245, 158, 11, 0.08)',
                                color: t.includes('Vegan') ? '#10b981' : t.includes('Neutral') ? '#3b82f6' : '#d97706',
                                fontWeight: 600
                              }}>
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>

                        <button 
                          onClick={() => handleDeleteEvent(parsed.id)}
                          style={{
                            border: 'none',
                            background: 'rgba(239, 68, 68, 0.08)',
                            color: '#ef4444',
                            cursor: 'pointer',
                            padding: '0.5rem',
                            borderRadius: '0.5rem',
                            transition: 'all 0.15s'
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right: Organize New Woke Event Form */}
            <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>Organize Woke Event</h3>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>Schedule a progressive space on campus.</p>
              </div>

              {eventMessage && (
                <div style={{ 
                  padding: '0.75rem 1rem', 
                  borderRadius: '0.5rem', 
                  background: 'rgba(109, 40, 217, 0.08)', 
                  color: 'var(--primary)',
                  fontSize: '0.85rem',
                  fontWeight: 600
                }}>
                  {eventMessage}
                </div>
              )}

              <form onSubmit={handleAddEvent} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>Event Title</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Decolonizing STEM Seminar"
                    value={newEventTitle}
                    onChange={(e) => setNewEventTitle(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', boxSizing: 'border-box', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>Date</label>
                  <input 
                    type="date" 
                    required 
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', boxSizing: 'border-box', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>Woke Category Focus</label>
                  <select 
                    value={newEventCategory}
                    onChange={(e) => setNewEventCategory(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', outline: 'none', background: '#fff' }}
                  >
                    <option value="Intersectionality & Privilege">Intersectionality & Privilege</option>
                    <option value="Climate & Eco-Justice">Climate & Eco-Justice</option>
                    <option value="Mindfulness & Healing">Mindfulness & Healing</option>
                    <option value="LGBTQIA+ & Pronouns">LGBTQIA+ & Pronouns</option>
                    <option value="Decolonizing Science">Decolonizing Science</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.25rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Inclusivity Checkbox Checklist</label>
                  
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#334155', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={isVegan}
                      onChange={(e) => setIsVegan(e.target.checked)}
                      style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                    />
                    Serve 100% Vegan Catered Food 🌱
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#334155', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={isPronounCheck}
                      onChange={(e) => setIsPronounCheck(e.target.checked)}
                      style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                    />
                    Mandatory Pronoun Badge Check-In 🏳️‍🌈
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#334155', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={isZeroWaste}
                      onChange={(e) => setIsZeroWaste(e.target.checked)}
                      style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                    />
                    Zero-Waste / Carbon Offset Event ♻️
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#334155', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={isSafeSpace}
                      onChange={(e) => setIsSafeSpace(e.target.checked)}
                      style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                    />
                    Safe Space Certified & Trigger Warnings 🧠
                  </label>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmittingEvent}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: 'none',
                    background: 'var(--primary)',
                    color: '#fff',
                    fontWeight: 700,
                    cursor: isSubmittingEvent ? 'not-allowed' : 'pointer',
                    marginTop: '0.5rem',
                    boxShadow: '0 4px 12px rgba(109, 40, 217, 0.2)'
                  }}
                >
                  {isSubmittingEvent ? 'Creating Safe Space...' : 'Organize Event ✊'}
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem', alignItems: 'start' }}>
            {/* Left: Broadcast Form */}
            <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Broadcast Faculty Notice</h3>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>Post announcements instantly to the student portal.</p>
              </div>

              {noticeMessage && (
                <div style={{ 
                  padding: '0.75rem 1rem', 
                  borderRadius: '0.5rem', 
                  background: 'rgba(109, 40, 217, 0.08)', 
                  color: 'var(--primary)',
                  fontSize: '0.85rem',
                  fontWeight: 600
                }}>
                  {noticeMessage}
                </div>
              )}

              <form onSubmit={handleBroadcastNotice} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>Notice Title</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Special Lecture on Quantum Computing"
                    value={newNotice.title}
                    onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', boxSizing: 'border-box', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>Category</label>
                  <select 
                    value={newNotice.category}
                    onChange={(e) => setNewNotice({ ...newNotice, category: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', outline: 'none', background: '#fff' }}
                  >
                    <option value="circular">Circular / General Announcement</option>
                    <option value="placement">Placement Drive</option>
                    <option value="workshop">Workshop & Seminars</option>
                    <option value="exam">Exam Notices</option>
                    <option value="emergency">Emergency / Alerts</option>
                    <option value="lost_found">Lost & Found</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>Notice Content</label>
                  <textarea 
                    required 
                    rows={6}
                    placeholder="Provide details about the notice..."
                    value={newNotice.content}
                    onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', boxSizing: 'border-box', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmittingNotice}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: 'none',
                    background: 'var(--primary)',
                    color: '#fff',
                    fontWeight: 700,
                    cursor: isSubmittingNotice ? 'not-allowed' : 'pointer',
                    marginTop: '0.5rem',
                    boxShadow: '0 4px 12px rgba(109, 40, 217, 0.2)'
                  }}
                >
                  {isSubmittingNotice ? 'Broadcasting...' : 'Broadcast Notice 📢'}
                </button>
              </form>
            </div>

            {/* Right: Previously Broadcasted Notices */}
            <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>Broadcasted Announcements</h3>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>History of notices posted across campus.</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {notices.map((n, idx) => {
                  const cat_emoji = 
                    n.category === 'circular' ? '📢' :
                    n.category === 'placement' ? '💼' :
                    n.category === 'workshop' ? '🎓' :
                    n.category === 'emergency' ? '🚨' :
                    n.category === 'exam' ? '📋' :
                    n.category === 'lost_found' ? '🔍' : '🔔';
                  return (
                    <div key={n.id || idx} style={{ padding: '1rem', background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(109, 40, 217, 0.08)', borderRadius: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '1rem' }}>{cat_emoji}</span>
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>{n.date}</span>
                      </div>
                      <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)' }}>{n.title}</h4>
                      <div style={{ margin: '0 0 0.5rem 0', fontSize: '0.825rem' }}>
                        <MarkdownView content={n.content} />
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>
                        By: {n.sender_name} ({n.sender_role})
                      </div>
                    </div>
                  );
                })}
                {notices.length === 0 && (
                  <div style={{ textAlign: 'center', color: '#94a3b8', padding: '1.5rem 0', fontSize: '0.85rem' }}>
                    No announcements found.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Docked AI Guard Panel */}
      <FloatingAIChatbot user={user} isDocked={true} />

      {/* Add Slot Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="glass-card" style={{ padding: '2rem', width: '100%', maxWidth: '400px', background: '#fff' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', fontWeight: 800 }}>Add Schedule Slot</h3>
            
            <form onSubmit={handleAddSlot} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>Year</label>
                <select 
                  value={newSlot.year}
                  onChange={(e) => setNewSlot({ ...newSlot, year: parseInt(e.target.value) })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }}
                >
                  <option value={1}>Year 1</option>
                  <option value={2}>Year 2</option>
                  <option value={3}>Year 3</option>
                  <option value={4}>Year 4</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>Day</label>
                <select 
                  value={newSlot.day}
                  onChange={(e) => setNewSlot({ ...newSlot, day: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }}
                >
                  {DAYS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>Slot / Period</label>
                <select 
                  value={newSlot.slot_index}
                  onChange={(e) => setNewSlot({ ...newSlot, slot_index: parseInt(e.target.value) })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }}
                >
                  <option value={1}>Period 1 (09:00 AM - 10:30 AM)</option>
                  <option value={2}>Period 2 (10:30 AM - 12:00 PM)</option>
                  <option value={3}>Period 3 (01:00 PM - 02:30 PM)</option>
                  <option value={4}>Period 4 (02:30 PM - 04:00 PM)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>Subject Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Compiler Design"
                  value={newSlot.subject}
                  onChange={(e) => setNewSlot({ ...newSlot, subject: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  style={{ flexGrow: 1, padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  style={{ flexGrow: 1, padding: '0.5rem', borderRadius: '0.5rem', border: 'none', background: 'var(--primary)', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
                >
                  Save Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Attendance Modal */}
      {isAttendanceModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="glass-card" style={{ padding: '2rem', width: '100%', maxWidth: '520px', background: '#fff', borderRadius: '1.25rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Mark Class Attendance</h3>
                <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.75rem', color: '#64748b' }}>Department of {dept}</p>
              </div>
              <button 
                onClick={() => setIsAttendanceModalOpen(false)}
                style={{ border: 'none', background: 'none', fontSize: '1.25rem', color: '#94a3b8', cursor: 'pointer', fontWeight: 'bold' }}
              >
                &times;
              </button>
            </div>
            
            {attendanceMessage && (
              <div style={{ 
                padding: '0.75rem 1rem', 
                borderRadius: '0.5rem', 
                background: attendanceMessage.includes('successfully') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                color: attendanceMessage.includes('successfully') ? '#10b981' : '#ef4444',
                fontSize: '0.85rem',
                fontWeight: 600,
                marginBottom: '1rem'
              }}>
                {attendanceMessage}
              </div>
            )}

            <form onSubmit={handleSubmitAttendance} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.3rem' }}>Year</label>
                  <select 
                    value={attendanceForm.year}
                    onChange={(e) => setAttendanceForm({ ...attendanceForm, year: parseInt(e.target.value) })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.85rem' }}
                  >
                    <option value={1}>Year 1</option>
                    <option value={2}>Year 2</option>
                    <option value={3}>Year 3</option>
                    <option value={4}>Year 4</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.3rem' }}>Date</label>
                  <input 
                    type="date"
                    value={attendanceForm.date}
                    onChange={(e) => setAttendanceForm({ ...attendanceForm, date: e.target.value })}
                    style={{ width: '100%', padding: '0.45rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.3rem' }}>Slot / Period</label>
                  <select 
                    value={attendanceForm.slot_index}
                    onChange={(e) => setAttendanceForm({ ...attendanceForm, slot_index: parseInt(e.target.value) })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.85rem' }}
                  >
                    <option value={1}>Period 1 (09:00 - 10:30)</option>
                    <option value={2}>Period 2 (10:30 - 12:00)</option>
                    <option value={3}>Period 3 (01:00 - 02:30)</option>
                    <option value={4}>Period 4 (02:30 - 04:00)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.3rem' }}>Subject Name</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Machine Learning"
                    value={attendanceForm.subject}
                    onChange={(e) => setAttendanceForm({ ...attendanceForm, subject: e.target.value })}
                    style={{ width: '100%', padding: '0.48rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* Student Checklist Area */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '0.75rem', overflow: 'hidden', marginTop: '0.5rem' }}>
                <div style={{ background: '#f8fafc', padding: '0.6rem 1rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Students ({students.length})</span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      type="button" 
                      onClick={() => {
                        const updated = {};
                        students.forEach(s => { updated[s.roll_no] = 'present'; });
                        setAttendanceRecords(updated);
                      }}
                      style={{ border: 'none', background: 'none', fontSize: '0.7rem', color: '#10b981', fontWeight: 700, cursor: 'pointer' }}
                    >
                      All Present
                    </button>
                    <span style={{ color: '#cbd5e1', fontSize: '0.7rem' }}>|</span>
                    <button 
                      type="button" 
                      onClick={() => {
                        const updated = {};
                        students.forEach(s => { updated[s.roll_no] = 'absent'; });
                        setAttendanceRecords(updated);
                      }}
                      style={{ border: 'none', background: 'none', fontSize: '0.7rem', color: '#ef4444', fontWeight: 700, cursor: 'pointer' }}
                    >
                      All Absent
                    </button>
                  </div>
                </div>

                <div style={{ maxHeight: '220px', overflowY: 'auto', padding: '0.5rem 0' }}>
                  {students.length > 0 ? (
                    students.map(student => {
                      const isPresent = attendanceRecords[student.roll_no] === 'present';
                      return (
                        <div key={student.roll_no} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 1rem', borderBottom: '1px solid #f1f5f9' }}>
                          <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>{student.name}</div>
                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{student.roll_no}</div>
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => {
                              setAttendanceRecords(prev => ({
                                ...prev,
                                [student.roll_no]: isPresent ? 'absent' : 'present'
                              }));
                            }}
                            style={{
                              border: 'none',
                              borderRadius: '9999px',
                              padding: '0.25rem 0.75rem',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              background: isPresent ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                              color: isPresent ? '#10b981' : '#ef4444',
                              transition: 'all 0.15s'
                            }}
                          >
                            {isPresent ? '✓ Present' : '✗ Absent'}
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ padding: '2rem 1rem', textAlignment: 'center', color: '#94a3b8', fontSize: '0.85rem', textAlign: 'center' }}>
                      No students found for Year {attendanceForm.year}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button 
                  type="button" 
                  onClick={() => setIsAttendanceModalOpen(false)}
                  style={{ flexGrow: 1, padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={attendanceLoading || students.length === 0}
                  style={{ flexGrow: 1, padding: '0.6rem', borderRadius: '0.5rem', border: 'none', background: 'var(--primary)', color: '#fff', fontWeight: 700, cursor: students.length === 0 ? 'not-allowed' : 'pointer', fontSize: '0.875rem' }}
                >
                  {attendanceLoading ? 'Saving...' : 'Submit Attendance'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default StaffDashboard;
