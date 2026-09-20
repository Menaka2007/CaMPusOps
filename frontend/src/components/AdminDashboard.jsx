import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Users, Bell, FileText, CheckCircle2, AlertTriangle, 
  ArrowRight, Search, LogOut, Radio, Send, RefreshCw, Layers,
  BookOpen, Calendar, Clock, DollarSign, MapPin, Activity, 
  Plus, Trash2, Edit, ToggleLeft, ToggleRight, Eye, Briefcase, 
  Key, Truck, Home, BarChart2, FileSpreadsheet, Download, Check, X,
  Settings, UserCheck, Shield, HelpCircle
} from 'lucide-react';
import FloatingAIChatbot from './FloatingAIChatbot';
import StatusBadge from './StatusBadge';
import MarkdownView from './MarkdownView';
import { apiUrl } from '../api';

const AdminDashboard = ({ user, onLogout }) => {
  // Navigation
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Success / Error Toast State
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState(null); // { title, message, onConfirm }

  // Search & Filter state for tables
  const [statusFilter, setStatusFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('All');
  const [yearFilter, setYearFilter] = useState('All');

  // Real Database Metrics & Lists (Fetched from API)
  const [metrics, setMetrics] = useState({
    total_students: 60,
    total_staff: 18,
    total_departments: 5,
    pending_complaints: 0,
    pending_docs: 0,
    outstanding_fees: 45000
  });
  const [complaints, setComplaints] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Client-Side Simulated Datasets for Modules
  const [students, setStudents] = useState([
    { id: 1, roll_no: '717721L101', name: 'Aravind', dept: 'CSE', year: 3, email: 'aravind.s@sece.ac.in', status: 'Active' },
    { id: 2, roll_no: '717721L102', name: 'Dharshini Priya', dept: 'ECE', year: 3, email: 'dharshini.p@sece.ac.in', status: 'Active' },
    { id: 3, roll_no: '717721L103', name: 'Kavin Kumar', dept: 'IT', year: 4, email: 'kavin.k@sece.ac.in', status: 'Active' },
    { id: 4, roll_no: '717721L104', name: 'Shruti Sen', dept: 'CSE', year: 3, email: 'shruti.s@sece.ac.in', status: 'Inactive' },
    { id: 5, roll_no: '717721L105', name: 'Manoj Kumar', dept: 'MECH', year: 2, email: 'manoj.k@sece.ac.in', status: 'Active' }
  ]);

  const [staff, setStaff] = useState([
    { id: 1, staff_id: 'STAFF001', name: 'Dr. Ramakrishnan', dept: 'CSE', designation: 'Professor & Head', email: 'ramakrishnan.cse@sece.ac.in', status: 'Active' },
    { id: 2, staff_id: 'STAFF002', name: 'Dr. Kavitha', dept: 'ECE', designation: 'Professor', email: 'kavitha.ece@sece.ac.in', status: 'Active' },
    { id: 3, staff_id: 'STAFF003', name: 'Mr. Vignesh', dept: 'IT', designation: 'Assistant Professor', email: 'vignesh.it@sece.ac.in', status: 'Active' },
    { id: 4, staff_id: 'STAFF004', name: 'Mrs. Shanthi', dept: 'EEE', designation: 'Associate Professor', email: 'shanthi.eee@sece.ac.in', status: 'Active' }
  ]);

  const [departments, setDepartments] = useState([
    { id: 1, name: 'Computer Science and Engineering', code: 'CSE', hod: 'Dr. Ramakrishnan', rooms: 12 },
    { id: 2, name: 'Electronics and Communication', code: 'ECE', hod: 'Dr. Kavitha', rooms: 10 },
    { id: 3, name: 'Information Technology', code: 'IT', hod: 'Mr. Vignesh', rooms: 8 },
    { id: 4, name: 'Mechanical Engineering', code: 'MECH', hod: 'Dr. V. Anand', rooms: 15 },
    { id: 5, name: 'Electrical and Electronics', code: 'EEE', hod: 'Mrs. Shanthi', rooms: 9 }
  ]);

  const [courses, setCourses] = useState([
    { id: 1, code: 'CS301', name: 'Data Structures & Algorithms', dept: 'CSE', year: 2, credits: 4 },
    { id: 2, code: 'CS502', name: 'Database Management Systems', dept: 'CSE', year: 3, credits: 3 },
    { id: 3, code: 'EC302', name: 'Digital Electronics', dept: 'ECE', year: 2, credits: 4 },
    { id: 4, code: 'IT401', name: 'Web Technology', dept: 'IT', year: 3, credits: 3 }
  ]);

  const [timetables, setTimetables] = useState([
    { id: 1, dept: 'CSE', year: 3, day: 'Monday', slots: ['DBMS', 'DSA', 'Library', 'OS', 'Aptitude', 'Seminar'] },
    { id: 2, dept: 'ECE', year: 3, day: 'Monday', slots: ['Digital Comm', 'DSP Lab', 'DSP Lab', 'Microcontroller', 'Sports', 'Placement'] }
  ]);

  const [exams, setExams] = useState([
    { id: 1, subject: 'Database Management Systems', code: 'CS502', date: '2026-08-12', time: '10:00 AM - 01:00 PM', type: 'Semester Internal' },
    { id: 2, subject: 'Operating Systems', code: 'CS503', date: '2026-08-14', time: '10:00 AM - 01:00 PM', type: 'Semester Internal' }
  ]);

  const [fees, setFees] = useState([
    { id: 1, roll_no: '717721L101', name: 'Aravind Swamy', type: 'Tuition Fee', total: 85000, paid: 85000, due_date: '2026-06-30', status: 'Paid' },
    { id: 2, roll_no: '717721L102', name: 'Dharshini Priya', type: 'Hostel Fee', total: 60000, paid: 40000, due_date: '2026-08-15', status: 'Partial' },
    { id: 3, roll_no: '717721L103', name: 'Kavin Kumar', type: 'Transport Fee', total: 25000, paid: 0, due_date: '2026-08-10', status: 'Pending' }
  ]);

  const [placements, setPlacements] = useState([
    { id: 1, company: 'Zoho Corporation', role: 'Software Developer', CTC: '8.5 LPA', date: '2026-08-05', eligible_cgpa: 7.5, status: 'Active' },
    { id: 2, company: 'Cognizant', role: 'Programmer Analyst', CTC: '4.5 LPA', date: '2026-08-18', eligible_cgpa: 6.0, status: 'Active' }
  ]);

  const [events, setEvents] = useState([]);

  const [hostel, setHostel] = useState([
    { id: 1, block: 'A-Block (Boys)', room_no: '101', capacity: 4, filled: 3, status: 'Available' },
    { id: 2, block: 'B-Block (Girls)', room_no: '204', capacity: 4, filled: 4, status: 'Full' }
  ]);

  const [transport, setTransport] = useState([
    { id: 1, route_no: 'Route 15', destination: 'Gandhipuram', driver: 'Muthu K.', phone: '+91 98765 43210', capacity: 55, students: 48 },
    { id: 2, route_no: 'Route 22', destination: 'Tiruppur', driver: 'Ramasamy A.', phone: '+91 97654 32109', capacity: 55, students: 53 }
  ]);

  const [aiAgents, setAiAgents] = useState([
    { name: 'Scheduler Agent', status: true, total_queries: 148, error_rate: '0.6%' },
    { name: 'Complaint Agent', status: true, total_queries: 92, error_rate: '1.2%' },
    { name: 'Document Request Agent', status: true, total_queries: 110, error_rate: '0.0%' },
    { name: 'Fee & Payment Agent', status: true, total_queries: 76, error_rate: '0.8%' },
    { name: 'Notification Agent', status: true, total_queries: 43, error_rate: '0.0%' },
    { name: 'Lost & Found Agent', status: true, total_queries: 65, error_rate: '2.5%' }
  ]);

  const [auditLogs, setAuditLogs] = useState([
    { timestamp: '2026-07-31 09:12:15', user: 'ADMIN001', action: 'Approved Bonafide Request #34', status: 'Success' },
    { timestamp: '2026-07-31 08:44:03', user: 'ADMIN001', action: 'Added placement drive Zoho', status: 'Success' },
    { timestamp: '2026-07-31 08:15:20', user: 'ADMIN001', action: 'Modified timetable ECE Year 3', status: 'Success' },
    { timestamp: '2026-07-30 16:50:11', user: 'ADMIN001', action: 'Broadcast placement circular', status: 'Success' }
  ]);

  const [roles, setRoles] = useState([
    { role: 'Admin', access: 'Full Control', users: 3 },
    { role: 'Staff / Faculty', access: 'View & Update Assign Module', users: 18 },
    { role: 'Student', access: 'Standard Personal Portal Only', users: 120 }
  ]);

  // Settings state
  const [settings, setSettings] = useState({
    academic_year: '2026-2027',
    semester: 'Odd Semester',
    working_days: 5,
    campus_name: 'Sri Eshwar College of Engineering',
    email_template: 'Dear Student, your request for document has been approved.',
  });

  // Modal / Form addition states
  const [modalType, setModalType] = useState(null); // 'student', 'staff', 'dept', 'timetable', 'exam', 'notification', 'placement', 'event'
  const [editItem, setEditItem] = useState(null);

  // Form Fields
  const [studentForm, setStudentForm] = useState({ roll_no: '', name: '', dept: 'CSE', year: 3, email: '', status: 'Active' });
  const [staffForm, setStaffForm] = useState({ staff_id: '', name: '', dept: 'CSE', designation: 'Professor', email: '', status: 'Active' });
  const [deptForm, setDeptForm] = useState({ name: '', code: '', hod: '', rooms: 10 });
  const [timetableForm, setTimetableForm] = useState({ dept: 'CSE', year: 3, day: 'Monday', slots: ['', '', '', '', '', ''] });
  const [examForm, setExamForm] = useState({ subject: '', code: '', date: '', time: '', type: 'Semester Internal' });
  const [placementForm, setPlacementForm] = useState({ company: '', role: '', CTC: '', date: '', eligible_cgpa: 6.5, status: 'Active' });
  const [eventForm, setEventForm] = useState({ name: '', type: '', date: '', venue: '', registrations: 0 });
  const [broadcastForm, setBroadcastForm] = useState({ title: '', content: '', category: 'circular', target: 'all', pin: false });

  // Fetch metrics & lists
  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const metRes = await fetch(apiUrl('http://127.0.0.1:8000/api/admin/metrics'));
      if (metRes.ok) {
        const data = await metRes.json();
        setMetrics(prev => ({ ...prev, ...data }));
      }

      const compRes = await fetch(apiUrl('http://127.0.0.1:8000/api/admin/complaints'));
      if (compRes.ok) {
        const data = await compRes.json();
        setComplaints(data);
      }

      const docRes = await fetch(apiUrl('http://127.0.0.1:8000/api/admin/documents'));
      if (docRes.ok) {
        const data = await docRes.json();
        setDocuments(data);
      }

      const notifRes = await fetch(apiUrl('http://127.0.0.1:8000/api/admin/notifications'));
      if (notifRes.ok) {
        const data = await notifRes.json();
        setNotifications(data);
      }

      const calRes = await fetch(apiUrl('http://127.0.0.1:8000/api/academic-calendar'));
      if (calRes.ok) {
        const data = await calRes.json();
        setEvents(data.calendar || []);
      }
    } catch (error) {
      console.error("Error syncing admin DB data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Update Database actions
  const handleUpdateComplaint = async (id, status, staffName = 'Unassigned') => {
    try {
      const res = await fetch(apiUrl('http://127.0.0.1:8000/api/admin/complaints/update'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      if (res.ok) {
        showToast(`Complaint #${id} updated to ${status}`);
        // Log action
        const newLog = {
          timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
          user: 'ADMIN001',
          action: `Updated Complaint #${id} to ${status} (Assigned: ${staffName})`,
          status: 'Success'
        };
        setAuditLogs([newLog, ...auditLogs]);
        fetchAdminData();
      }
    } catch (error) {
      showToast("Failed to update complaint", "error");
    }
  };

  const handleCleanSpamComplaints = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl('http://127.0.0.1:8000/api/admin/complaints/clean-spam'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      showToast(data.message, 'success');
      const newLog = {
        timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
        user: 'ADMIN001',
        action: `Executed AI Spam Purge Engine`,
        status: 'Success'
      };
      setAuditLogs([newLog, ...auditLogs]);
      fetchAdminData();
    } catch (err) {
      console.error(err);
      showToast('Failed to purge spam complaints.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDocument = async (id, status, remarks = '') => {
    try {
      const res = await fetch(apiUrl('http://127.0.0.1:8000/api/admin/documents/update'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      if (res.ok) {
        showToast(`Request #${id} marked as ${status}`);
        
        // Auto certificate generation if Approved
        if (status.includes('Approved') || status.includes('Ready')) {
          generateCertificatePDF(id);
        }

        const newLog = {
          timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
          user: 'ADMIN001',
          action: `Processed Document Request #${id} to ${status}`,
          status: 'Success'
        };
        setAuditLogs([newLog, ...auditLogs]);
        fetchAdminData();
      }
    } catch (error) {
      showToast("Failed to process document request", "error");
    }
  };

  // PDF Certificate Generator Simulation
  const generateCertificatePDF = (id) => {
    const docRequest = documents.find(d => d.id === id) || { type: 'Bonafide Certificate', student_name: 'Aravind Swamy', roll_no: '717721L101' };
    const certHTML = `
      <html>
      <head>
        <title>Download Certificate</title>
        <style>
          body { font-family: 'Times New Roman', serif; padding: 40px; border: 10px double #4f46e5; text-align: center; }
          .logo { font-size: 20px; font-weight: bold; color: #4f46e5; }
          .title { font-size: 28px; margin: 30px 0; font-weight: bold; text-transform: uppercase; }
          .content { font-size: 18px; line-height: 1.8; text-align: justify; margin: 40px; }
          .footer { margin-top: 80px; display: flex; justify-content: space-between; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="logo">SRI ESHWAR COLLEGE OF ENGINEERING</div>
        <div style="font-size: 14px; color: #555;">Coimbatore, Tamil Nadu</div>
        <div class="title">${docRequest.type}</div>
        <div class="content">
          This is to certify that Mr./Ms. <b>${docRequest.student_name || 'Student'}</b>, Roll No: <b>${docRequest.roll_no}</b>, 
          is a bonafide student of this institution studying in the department of <b>Computer Science and Engineering</b> 
          during the academic year ${settings.academic_year}.
        </div>
        <div class="footer">
          <div>Date: ${new Date().toLocaleDateString()}</div>
          <div>Principal Signature</div>
        </div>
        <script>window.print();</script>
      </body>
      </html>
    `;
    
    const blob = new Blob([certHTML], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${docRequest.type.replace(/\s+/g, '_')}_${docRequest.roll_no}.html`;
    link.click();
    showToast("Certificate downloaded successfully");
  };

  // Add / Edit Student
  const handleStudentSubmit = (e) => {
    e.preventDefault();
    if (editItem) {
      setStudents(students.map(s => s.id === editItem.id ? { ...s, ...studentForm } : s));
      showToast(`Student ${studentForm.name} details updated.`);
    } else {
      const newStudent = { id: Date.now(), ...studentForm };
      setStudents([...students, newStudent]);
      showToast(`Student ${studentForm.name} registered.`);
    }
    setModalType(null);
    setEditItem(null);
  };

  // Import mock CSV students
  const handleImportStudents = () => {
    const imported = [
      { id: 101, roll_no: '717721L110', name: 'Nithin R.', dept: 'CSE', year: 3, email: 'nithin.r@sece.ac.in', status: 'Active' },
      { id: 102, roll_no: '717721L111', name: 'Preetha S.', dept: 'ECE', year: 2, email: 'preetha.s@sece.ac.in', status: 'Active' }
    ];
    setStudents([...students, ...imported]);
    showToast("Imported 2 students from campus database CSV file");
  };

  const handleExportStudents = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(students, null, 2))}`;
    const link = document.createElement('a');
    link.href = jsonString;
    link.download = "students_export.json";
    link.click();
    showToast("Students list exported successfully");
  };

  // Add / Edit Staff
  const handleStaffSubmit = (e) => {
    e.preventDefault();
    if (editItem) {
      setStaff(staff.map(s => s.id === editItem.id ? { ...s, ...staffForm } : s));
      showToast(`Staff ${staffForm.name} details updated.`);
    } else {
      const newStaff = { id: Date.now(), ...staffForm };
      setStaff([...staff, newStaff]);
      showToast(`Staff ${staffForm.name} added successfully.`);
    }
    setModalType(null);
    setEditItem(null);
  };

  // Post targeted Notification
  const handlePostNotification = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(apiUrl('http://127.0.0.1:8000/api/admin/notifications/add'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: broadcastForm.title,
          content: `${broadcastForm.content} (Target: ${broadcastForm.target.toUpperCase()})`,
          category: broadcastForm.category,
          sender_name: 'Campus Registrar',
          sender_role: 'admin'
        })
      });
      if (res.ok) {
        showToast("Notification broadcasted and scheduled successfully.");
        setBroadcastForm({ title: '', content: '', category: 'circular', target: 'all', pin: false });
        fetchAdminData();
      }
    } catch (e) {
      showToast("Notification failed to post", "error");
    }
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!eventForm.name.trim()) return;
    try {
      const res = await fetch(apiUrl('http://127.0.0.1:8000/api/academic-calendar/add'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: eventForm.name.trim(),
          date: eventForm.date || new Date().toISOString().split('T')[0],
          type: eventForm.type || 'event'
        })
      });
      if (res.ok) {
        showToast("Event scheduled and synchronized across all portals!");
        setModalType(null);
        setEventForm({ name: '', type: 'event', date: '', venue: '', registrations: 0 });
        fetchAdminData();
      } else {
        showToast("Failed to schedule event", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error scheduling event", "error");
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      const res = await fetch(apiUrl('http://127.0.0.1:8000/api/academic-calendar/delete'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        showToast("Event removed from academic calendar");
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
      showToast("Error deleting event", "error");
    }
  };

  // Toggle AI Agent state
  const handleToggleAgent = (name) => {
    setAiAgents(aiAgents.map(agent => 
      agent.name === name ? { ...agent, status: !agent.status } : agent
    ));
    showToast(`Toggled configuration state for ${name}`);
  };

  // Sidebar Modules List (22)
  const sidebarTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Layers },
    { id: 'students', label: 'Student Management', icon: Users },
    { id: 'staff', label: 'Staff Management', icon: UserCheck },
    { id: 'departments', label: 'Department Management', icon: BookOpen },
    { id: 'courses', label: 'Course Management', icon: HelpCircle },
    { id: 'timetable', label: 'Timetable Management', icon: Clock },
    { id: 'exams', label: 'Exam Management', icon: Calendar },
    { id: 'documents', label: 'Document Management', icon: FileText, count: metrics.pending_docs },
    { id: 'complaints', label: 'Complaint Management', icon: AlertTriangle, count: metrics.pending_complaints },
    { id: 'fees', label: 'Fee Management', icon: DollarSign },
    { id: 'attendance', label: 'Attendance Management', icon: BarChart2 },
    { id: 'placements', label: 'Placement Management', icon: Briefcase },
    { id: 'events', label: 'Event Management', icon: Activity },
    { id: 'hostel', label: 'Hostel Management', icon: Home },
    { id: 'transport', label: 'Transport Management', icon: Truck },
    { id: 'broadcast', label: 'Notification Center', icon: Radio, count: notifications.length },
    { id: 'roles', label: 'Roles & Permissions', icon: Shield },
    { id: 'settings', label: 'System Settings', icon: Settings },
    { id: 'audit', label: 'Audit Logs', icon: FileSpreadsheet }
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-gradient)', fontFamily: "'Inter', sans-serif" }}>
      
      {/* Toast Alert popup */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '1rem 1.5rem',
          borderRadius: '0.75rem',
          background: toast.type === 'success' ? '#10b981' : '#ef4444',
          color: '#fff',
          fontWeight: 600,
          zIndex: 9999,
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
          animation: 'fade-in 0.3s ease-out'
        }}>
          {toast.message}
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.4)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div className="glass-card" style={{ padding: '2rem', maxWidth: '400px', width: '90%' }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>{confirmModal.title}</h3>
            <p style={{ margin: '1rem 0 1.5rem 0', color: '#64748b', fontSize: '0.9rem' }}>{confirmModal.message}</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setConfirmModal(null)} 
                style={{ padding: '0.5rem 1rem', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600 }}
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal(null);
                }} 
                style={{ padding: '0.5rem 1rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600 }}
              >
                Proceed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Module Forms Modal */}
      {modalType && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.4)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div className="glass-card" style={{ padding: '2rem', maxWidth: '500px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem' }}>
              {editItem ? 'Edit Details' : 'Add New Entry'}
            </h3>
            
            {modalType === 'student' && (
              <form onSubmit={handleStudentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>Roll Number</label>
                  <input type="text" required value={studentForm.roll_no} onChange={e => setStudentForm({...studentForm, roll_no: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>Student Name</label>
                  <input type="text" required value={studentForm.name} onChange={e => setStudentForm({...studentForm, name: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>Department</label>
                  <select value={studentForm.dept} onChange={e => setStudentForm({...studentForm, dept: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', background: '#fff' }}>
                    <option value="CSE">CSE</option>
                    <option value="ECE">ECE</option>
                    <option value="IT">IT</option>
                    <option value="MECH">MECH</option>
                    <option value="EEE">EEE</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>Year</label>
                  <input type="number" min="1" max="4" required value={studentForm.year} onChange={e => setStudentForm({...studentForm, year: parseInt(e.target.value)})} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>Email Address</label>
                  <input type="email" required value={studentForm.email} onChange={e => setStudentForm({...studentForm, email: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }} />
                </div>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <button type="button" onClick={() => setModalType(null)} style={{ padding: '0.5rem 1rem', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '0.375rem', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ padding: '0.5rem 1rem', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}>Save Student</button>
                </div>
              </form>
            )}

            {modalType === 'staff' && (
              <form onSubmit={handleStaffSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>Staff ID</label>
                  <input type="text" required value={staffForm.staff_id} onChange={e => setStaffForm({...staffForm, staff_id: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>Staff Name</label>
                  <input type="text" required value={staffForm.name} onChange={e => setStaffForm({...staffForm, name: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>Department</label>
                  <select value={staffForm.dept} onChange={e => setStaffForm({...staffForm, dept: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', background: '#fff' }}>
                    <option value="CSE">CSE</option>
                    <option value="ECE">ECE</option>
                    <option value="IT">IT</option>
                    <option value="MECH">MECH</option>
                    <option value="EEE">EEE</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>Designation</label>
                  <input type="text" required value={staffForm.designation} onChange={e => setStaffForm({...staffForm, designation: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>Email Address</label>
                  <input type="email" required value={staffForm.email} onChange={e => setStaffForm({...staffForm, email: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }} />
                </div>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <button type="button" onClick={() => setModalType(null)} style={{ padding: '0.5rem 1rem', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '0.375rem', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ padding: '0.5rem 1rem', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}>Save Staff</button>
                </div>
              </form>
            )}

            {modalType === 'event' && (
              <form onSubmit={handleAddEvent} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Add Campus Event</h4>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>Event Title</label>
                  <input type="text" required placeholder="e.g. Annual Technical Symposium" value={eventForm.name} onChange={e => setEventForm({...eventForm, name: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>Event Type</label>
                  <select value={eventForm.type} onChange={e => setEventForm({...eventForm, type: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', background: '#fff' }}>
                    <option value="event">Campus Event</option>
                    <option value="holiday">Holiday</option>
                    <option value="exam">Exam</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>Date</label>
                  <input type="date" required value={eventForm.date} onChange={e => setEventForm({...eventForm, date: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }} />
                </div>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <button type="button" onClick={() => setModalType(null)} style={{ padding: '0.5rem 1rem', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '0.375rem', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ padding: '0.5rem 1rem', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}>Save & Broadcast Event</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Sidebar with 22 Control Tabs */}
      <aside className="glass-card" style={{
        width: '320px',
        margin: '1rem',
        marginRight: '0',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem',
        borderRadius: '1.25rem',
        height: 'calc(100vh - 2rem)',
        position: 'sticky',
        top: '1rem',
        boxSizing: 'border-box',
        overflowY: 'auto'
      }}>
        
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '1.25rem', borderBottom: '1px solid rgba(217, 119, 6, 0.2)', marginBottom: '1.25rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #1e1b4b, #4338ca)', border: '1.5px solid rgba(217, 119, 6, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbf24', fontSize: '1.2rem' }}>
            👑
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: '#1e1b4b' }}>Royal Control Center</h4>
            <span style={{ fontSize: '0.68rem', color: '#b45309', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase' }}>SRI ESHWAR AUTONOMOUS SUITE</span>
          </div>
        </div>

        {/* Sidebar Tabs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flexGrow: 1 }}>
          {sidebarTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSearchQuery('');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.6rem 0.85rem',
                  borderRadius: '0.65rem',
                  border: 'none',
                  background: isActive ? 'rgba(109, 40, 217, 0.08)' : 'transparent',
                  textAlign: 'left',
                  cursor: 'pointer',
                  width: '100%',
                  color: isActive ? 'var(--primary)' : '#475569',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.85rem',
                  transition: 'all 0.2s'
                }}
              >
                <Icon size={16} />
                <span style={{ flexGrow: 1 }}>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span style={{ fontSize: '0.65rem', background: '#ef4444', color: '#fff', padding: '0.15rem 0.4rem', borderRadius: '9999px', fontWeight: 700 }}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Profile Card & Logout */}
        <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(109, 40, 217, 0.1)', paddingTop: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(109, 40, 217, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: 'bold' }}>
              A
            </div>
            <div>
              <h5 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700 }}>{user.name}</h5>
              <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>{user.role} Portal</span>
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
              padding: '0.65rem',
              borderRadius: '0.5rem',
              background: 'rgba(239, 68, 68, 0.05)',
              border: '1px solid rgba(239, 68, 68, 0.15)',
              color: '#ef4444',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
              transition: 'all 0.2s'
            }}
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>

      </aside>

      {/* Main Administrative Viewport */}
      <main style={{ flexGrow: 1, minWidth: 0, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', boxSizing: 'border-box', overflowY: 'auto', height: '100vh' }}>
        
        {/* Top bar with sync and search */}
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div style={{ position: 'relative', width: '350px' }}>
            <input 
              type="text" 
              placeholder="Search across records..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.55rem 1rem',
                paddingLeft: '2.5rem',
                borderRadius: '9999px',
                border: '1px solid rgba(109, 40, 217, 0.15)',
                outline: 'none',
                background: 'rgba(255, 255, 255, 0.8)',
                fontSize: '0.85rem'
              }}
            />
            <Search size={14} style={{ position: 'absolute', left: '0.875rem', top: '0.7rem', color: '#94a3b8' }} />
          </div>

          <button 
            onClick={fetchAdminData} 
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.5rem 1rem', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.8rem', color: '#475569', fontWeight: 600, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Sync Data
          </button>
        </header>

        {/* ==================================================
            TAB: DASHBOARD OVERVIEW
            ================================================== */}
        {activeTab === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Banner */}
            <div className="glass-card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(109, 40, 217, 0.05), rgba(37, 99, 235, 0.05))', borderLeft: '5px solid var(--primary)' }}>
              <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: '#1e1b4b' }}>Operational Control Center</h2>
              <p style={{ margin: '0.35rem 0 0 0', color: '#475569', fontSize: '0.85rem' }}>Real-time statistics, alerts, metrics, and configurations across Sri Eshwar institutional divisions.</p>
            </div>

            {/* KPI Cards Grid (12 items) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              
              <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ padding: '0.65rem', borderRadius: '0.5rem', background: 'rgba(109, 40, 217, 0.1)', color: 'var(--primary)' }}><Users size={22} /></div>
                <div>
                  <span style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Total Students</span>
                  <h3 style={{ margin: '0.15rem 0 0 0', fontSize: '1.4rem', fontWeight: 800 }}>{metrics.total_students}</h3>
                </div>
              </div>

              <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ padding: '0.65rem', borderRadius: '0.5rem', background: 'rgba(37, 99, 235, 0.1)', color: 'var(--secondary)' }}><UserCheck size={22} /></div>
                <div>
                  <span style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Total Staff</span>
                  <h3 style={{ margin: '0.15rem 0 0 0', fontSize: '1.4rem', fontWeight: 800 }}>{staff.length}</h3>
                </div>
              </div>

              <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ padding: '0.65rem', borderRadius: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}><BookOpen size={22} /></div>
                <div>
                  <span style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Departments</span>
                  <h3 style={{ margin: '0.15rem 0 0 0', fontSize: '1.4rem', fontWeight: 800 }}>{departments.length}</h3>
                </div>
              </div>

              <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ padding: '0.65rem', borderRadius: '0.5rem', background: 'rgba(249, 115, 22, 0.1)', color: '#f97316' }}><FileText size={22} /></div>
                <div>
                  <span style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Pending Docs</span>
                  <h3 style={{ margin: '0.15rem 0 0 0', fontSize: '1.4rem', fontWeight: 800 }}>{documents.filter(d => !d.status.includes('Approved') && !d.status.includes('Rejected')).length}</h3>
                </div>
              </div>

              <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ padding: '0.65rem', borderRadius: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}><AlertTriangle size={22} /></div>
                <div>
                  <span style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Pending Complaints</span>
                  <h3 style={{ margin: '0.15rem 0 0 0', fontSize: '1.4rem', fontWeight: 800 }}>{complaints.filter(c => c.status !== 'Resolved').length}</h3>
                </div>
              </div>

              <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ padding: '0.65rem', borderRadius: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}><DollarSign size={22} /></div>
                <div>
                  <span style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Pending Dues</span>
                  <h3 style={{ margin: '0.15rem 0 0 0', fontSize: '1.25rem', fontWeight: 800 }}>₹{fees.filter(f => f.status !== 'Paid').reduce((sum, item) => sum + (item.total - item.paid), 0).toLocaleString('en-IN')}</h3>
                </div>
              </div>

              <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ padding: '0.65rem', borderRadius: '0.5rem', background: 'rgba(109, 40, 217, 0.1)', color: 'var(--primary)' }}><BarChart2 size={22} /></div>
                <div>
                  <span style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Attendance Avg</span>
                  <h3 style={{ margin: '0.15rem 0 0 0', fontSize: '1.4rem', fontWeight: 800 }}>92.4%</h3>
                </div>
              </div>

              <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ padding: '0.65rem', borderRadius: '0.5rem', background: 'rgba(37, 99, 235, 0.1)', color: 'var(--secondary)' }}><Activity size={22} /></div>
                <div>
                  <span style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Upcoming Events</span>
                  <h3 style={{ margin: '0.15rem 0 0 0', fontSize: '1.4rem', fontWeight: 800 }}>{events.length}</h3>
                </div>
              </div>

              <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ padding: '0.65rem', borderRadius: '0.5rem', background: 'rgba(109, 40, 217, 0.1)', color: 'var(--primary)' }}><Briefcase size={22} /></div>
                <div>
                  <span style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Placement Drives</span>
                  <h3 style={{ margin: '0.15rem 0 0 0', fontSize: '1.4rem', fontWeight: 800 }}>{placements.length}</h3>
                </div>
              </div>

              <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ padding: '0.65rem', borderRadius: '0.5rem', background: 'rgba(249, 115, 22, 0.1)', color: '#f97316' }}><Bell size={22} /></div>
                <div>
                  <span style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Notifications</span>
                  <h3 style={{ margin: '0.15rem 0 0 0', fontSize: '1.4rem', fontWeight: 800 }}>12</h3>
                </div>
              </div>

              <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ padding: '0.65rem', borderRadius: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}><Radio size={22} /></div>
                <div>
                  <span style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Active AI Agents</span>
                  <h3 style={{ margin: '0.15rem 0 0 0', fontSize: '1.4rem', fontWeight: 800 }}>{aiAgents.filter(a => a.status).length}</h3>
                </div>
              </div>

              <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ padding: '0.65rem', borderRadius: '0.5rem', background: 'rgba(109, 40, 217, 0.1)', color: 'var(--primary)' }}><FileSpreadsheet size={22} /></div>
                <div>
                  <span style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Audit Actions</span>
                  <h3 style={{ margin: '0.15rem 0 0 0', fontSize: '1.4rem', fontWeight: 800 }}>{auditLogs.length}</h3>
                </div>
              </div>

            </div>

            {/* Quick Summary Panels */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
              {/* Placement & Performance stats */}
              <div className="glass-card" style={{ padding: '1.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, marginBottom: '1rem' }}>Specialist AI Agents Performance</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {aiAgents.map((agent, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: agent.status ? '#10b981' : '#cbd5e1' }} />
                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{agent.name}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem', color: '#64748b' }}>
                        <span>Queries: <b>{agent.total_queries}</b></span>
                        <span>Err: <b>{agent.error_rate}</b></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent System Log Activity */}
              <div className="glass-card" style={{ padding: '1.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, marginBottom: '1rem' }}>Recent Operations Log</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', height: '240px', overflowY: 'auto' }}>
                  {auditLogs.map((log, i) => (
                    <div key={i} style={{ fontSize: '0.75rem', borderLeft: '2px solid var(--primary)', paddingLeft: '0.5rem', marginBottom: '0.25rem' }}>
                      <div style={{ fontWeight: 700 }}>{log.action}</div>
                      <div style={{ color: '#94a3b8' }}>{log.timestamp} - by {log.user}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ==================================================
            TAB: STUDENT MANAGEMENT
            ================================================== */}
        {activeTab === 'students' && (
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>Student Directory</h3>
                <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.75rem', color: '#64748b' }}>Search, add, modify active student roster details</p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={handleImportStudents} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.45rem 0.85rem', background: '#f1f5f9', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}><Download size={14} /> Import CSV</button>
                <button onClick={handleExportStudents} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.45rem 0.85rem', background: '#f1f5f9', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}><FileSpreadsheet size={14} /> Export JSON</button>
                <button onClick={() => { setEditItem(null); setStudentForm({ roll_no: '', name: '', dept: 'CSE', year: 3, email: '', status: 'Active' }); setModalType('student'); }} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.45rem 0.85rem', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}><Plus size={14} /> Add Student</button>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                    <th style={{ padding: '0.75rem', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Roll No</th>
                    <th style={{ padding: '0.75rem', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Student Name</th>
                    <th style={{ padding: '0.75rem', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Department</th>
                    <th style={{ padding: '0.75rem', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Year</th>
                    <th style={{ padding: '0.75rem', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Email</th>
                    <th style={{ padding: '0.75rem', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', textAlign: 'center' }}>Status</th>
                    <th style={{ padding: '0.75rem', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.roll_no.toLowerCase().includes(searchQuery.toLowerCase())).map((student) => (
                    <tr key={student.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.85rem 0.75rem', fontSize: '0.85rem', fontWeight: 700 }}>{student.roll_no}</td>
                      <td style={{ padding: '0.85rem 0.75rem', fontSize: '0.85rem', fontWeight: 600 }}>{student.name}</td>
                      <td style={{ padding: '0.85rem 0.75rem', fontSize: '0.85rem' }}>{student.dept}</td>
                      <td style={{ padding: '0.85rem 0.75rem', fontSize: '0.85rem' }}>Year {student.year}</td>
                      <td style={{ padding: '0.85rem 0.75rem', fontSize: '0.85rem', color: '#64748b' }}>{student.email}</td>
                      <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.45rem', borderRadius: '9999px', background: student.status === 'Active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: student.status === 'Active' ? '#10b981' : '#ef4444', fontWeight: 700 }}>{student.status}</span>
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                          <button onClick={() => {
                            setStudents(students.map(s => s.id === student.id ? { ...s, status: s.status === 'Active' ? 'Inactive' : 'Active' } : s));
                            showToast(`Status toggled for ${student.name}`);
                          }} style={{ padding: '0.25rem', border: 'none', background: 'none', cursor: 'pointer', color: '#475569' }} title="Toggle Status">
                            {student.status === 'Active' ? <ToggleRight size={18} style={{ color: '#10b981' }} /> : <ToggleLeft size={18} style={{ color: '#ef4444' }} />}
                          </button>
                          <button onClick={() => { setEditItem(student); setStudentForm(student); setModalType('student'); }} style={{ padding: '0.25rem', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--primary)' }} title="Edit"><Edit size={16} /></button>
                          <button onClick={() => {
                            setConfirmModal({
                              title: 'De-register Student',
                              message: `Are you sure you want to delete student ${student.name}? This action is irreversible.`,
                              onConfirm: () => {
                                setStudents(students.filter(s => s.id !== student.id));
                                showToast(`Student ${student.name} removed from roster`);
                              }
                            });
                          }} style={{ padding: '0.25rem', border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444' }} title="Delete"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================================================
            TAB: STAFF MANAGEMENT
            ================================================== */}
        {activeTab === 'staff' && (
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>Faculty & Staff Directory</h3>
                <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.75rem', color: '#64748b' }}>Manage teaching and non-teaching roles</p>
              </div>
              <button onClick={() => { setEditItem(null); setStaffForm({ staff_id: '', name: '', dept: 'CSE', designation: 'Professor', email: '', status: 'Active' }); setModalType('staff'); }} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.45rem 0.85rem', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}><Plus size={14} /> Add Faculty</button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                    <th style={{ padding: '0.75rem', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Staff ID</th>
                    <th style={{ padding: '0.75rem', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Name</th>
                    <th style={{ padding: '0.75rem', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Department</th>
                    <th style={{ padding: '0.75rem', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Designation</th>
                    <th style={{ padding: '0.75rem', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Email</th>
                    <th style={{ padding: '0.75rem', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', textAlign: 'center' }}>Status</th>
                    <th style={{ padding: '0.75rem', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.staff_id.toLowerCase().includes(searchQuery.toLowerCase())).map((st) => (
                    <tr key={st.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.85rem 0.75rem', fontSize: '0.85rem', fontWeight: 700 }}>{st.staff_id}</td>
                      <td style={{ padding: '0.85rem 0.75rem', fontSize: '0.85rem', fontWeight: 600 }}>{st.name}</td>
                      <td style={{ padding: '0.85rem 0.75rem', fontSize: '0.85rem' }}>{st.dept}</td>
                      <td style={{ padding: '0.85rem 0.75rem', fontSize: '0.85rem', fontWeight: 500, color: '#475569' }}>{st.designation}</td>
                      <td style={{ padding: '0.85rem 0.75rem', fontSize: '0.85rem', color: '#64748b' }}>{st.email}</td>
                      <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.45rem', borderRadius: '9999px', background: st.status === 'Active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: st.status === 'Active' ? '#10b981' : '#ef4444', fontWeight: 700 }}>{st.status}</span>
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                          <button onClick={() => { setEditItem(st); setStaffForm(st); setModalType('staff'); }} style={{ padding: '0.25rem', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--primary)' }} title="Edit"><Edit size={16} /></button>
                          <button onClick={() => {
                            setConfirmModal({
                              title: 'De-register Staff',
                              message: `Are you sure you want to delete staff ${st.name}?`,
                              onConfirm: () => {
                                setStaff(staff.filter(item => item.id !== st.id));
                                showToast(`Staff ${st.name} removed successfully`);
                              }
                            });
                          }} style={{ padding: '0.25rem', border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444' }} title="Delete"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================================================
            TAB: DEPARTMENT MANAGEMENT
            ================================================== */}
        {activeTab === 'departments' && (
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>Institutional Departments</h3>
                <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.75rem', color: '#64748b' }}>Manage HOD assignments, faculties, and locations</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {departments.map((dept) => (
                <div key={dept.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 800 }}>CODE: {dept.code}</div>
                  <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>{dept.name}</h4>
                  <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.5rem' }}>Head of Department: <b>{dept.hod}</b></div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Lectures / Labs rooms: {dept.rooms}</div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', alignSelf: 'flex-end' }}>
                    <button onClick={() => showToast("Edit Department features loaded")} style={{ padding: '0.35rem 0.65rem', border: '1px solid #cbd5e1', background: '#fff', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>Assign HOD</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================================================
            TAB: COURSE MANAGEMENT
            ================================================== */}
        {activeTab === 'courses' && (
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.5rem' }}>Course Curriculum Matrix</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '0.75rem', fontSize: '0.75rem', color: '#64748b' }}>Course Code</th>
                    <th style={{ padding: '0.75rem', fontSize: '0.75rem', color: '#64748b' }}>Subject Name</th>
                    <th style={{ padding: '0.75rem', fontSize: '0.75rem', color: '#64748b' }}>Department</th>
                    <th style={{ padding: '0.75rem', fontSize: '0.75rem', color: '#64748b' }}>Year Target</th>
                    <th style={{ padding: '0.75rem', fontSize: '0.75rem', color: '#64748b' }}>Credits</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map(c => (
                    <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.85rem 0.75rem', fontWeight: 700 }}>{c.code}</td>
                      <td style={{ padding: '0.85rem 0.75rem', fontWeight: 600 }}>{c.name}</td>
                      <td style={{ padding: '0.85rem 0.75rem' }}>{c.dept}</td>
                      <td style={{ padding: '0.85rem 0.75rem' }}>Year {c.year}</td>
                      <td style={{ padding: '0.85rem 0.75rem' }}>{c.credits} Credits</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================================================
            TAB: TIMETABLE MANAGEMENT
            ================================================== */}
        {activeTab === 'timetable' && (
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>Master Timetable Schedule</h3>
                <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.75rem', color: '#64748b' }}>Publish slots, edit day configurations</p>
              </div>
              <button onClick={() => showToast("Upload Timetable File (.xlsx) simulation triggered")} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.45rem 0.85rem', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}><Plus size={14} /> Upload Timetable</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {timetables.map((item, i) => (
                <div key={i} className="glass-card" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <h4 style={{ margin: 0 }}>Dept: {item.dept} | Year: {item.year} ({item.day})</h4>
                    <button style={{ padding: '0.25rem 0.5rem', background: '#10b981', border: 'none', color: '#fff', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: 700 }}>Published</button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.5rem' }}>
                    {item.slots.map((slot, sIdx) => (
                      <div key={sIdx} style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '0.375rem', textAlign: 'center', fontSize: '0.8rem', border: '1px solid #e2e8f0' }}>
                        <div style={{ color: '#94a3b8', fontSize: '0.65rem' }}>Period {sIdx+1}</div>
                        <div style={{ fontWeight: 700, color: 'var(--primary)', marginTop: '0.15rem' }}>{slot}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================================================
            TAB: EXAM MANAGEMENT
            ================================================== */}
        {activeTab === 'exams' && (
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.5rem' }}>Exam Calendar Schedules</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '0.75rem', fontSize: '0.75rem', color: '#64748b' }}>Subject Name</th>
                    <th style={{ padding: '0.75rem', fontSize: '0.75rem', color: '#64748b' }}>Code</th>
                    <th style={{ padding: '0.75rem', fontSize: '0.75rem', color: '#64748b' }}>Exam Date</th>
                    <th style={{ padding: '0.75rem', fontSize: '0.75rem', color: '#64748b' }}>Session Time</th>
                    <th style={{ padding: '0.75rem', fontSize: '0.75rem', color: '#64748b' }}>Type</th>
                    <th style={{ padding: '0.75rem', fontSize: '0.75rem', color: '#64748b', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {exams.map(ex => (
                    <tr key={ex.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.85rem 0.75rem', fontWeight: 700 }}>{ex.subject}</td>
                      <td style={{ padding: '0.85rem 0.75rem' }}>{ex.code}</td>
                      <td style={{ padding: '0.85rem 0.75rem' }}>{ex.date}</td>
                      <td style={{ padding: '0.85rem 0.75rem' }}>{ex.time}</td>
                      <td style={{ padding: '0.85rem 0.75rem' }}><span style={{ fontSize: '0.7rem', padding: '0.15rem 0.45rem', borderRadius: '9999px', background: 'rgba(109, 40, 217, 0.1)', color: 'var(--primary)', fontWeight: 700 }}>{ex.type}</span></td>
                      <td style={{ padding: '0.85rem 0.75rem', textAlign: 'right' }}>
                        <button onClick={() => showToast("Exam marks results published successfully")} style={{ padding: '0.35rem 0.6rem', border: 'none', background: 'var(--secondary)', color: '#fff', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>Publish Results</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================================================
            TAB: DOCUMENT MANAGEMENT
            ================================================== */}
        {activeTab === 'documents' && (
          <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Process Document Requests</h3>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>Approve, reject, or generate PDF certificates requested by students</p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', background: '#f8fafc', padding: '0.75rem', borderRadius: '0.5rem' }}>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>Filter Status</span>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: '100%', padding: '0.45rem', borderRadius: '0.25rem', border: '1px solid #cbd5e1', background: '#fff', fontSize: '0.8rem' }}>
                  <option value="All">All Requests</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left', color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>ID</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Student</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Requested Document</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Requested Date</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center', color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', width: '120px' }}>Status</th>
                    <th style={{ padding: '0.75rem', textAlign: 'right', color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', width: '240px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.filter(d => statusFilter === 'All' ? true : d.status.includes(statusFilter)).map(d => {
                    const isApproved = d.status.includes('Approved') || d.status.includes('Ready');
                    const isRejected = d.status.includes('Rejected');
                    const isPending = !isApproved && !isRejected;
                    return (
                      <tr key={d.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '1rem 0.75rem', fontSize: '0.85rem', fontWeight: 700 }}>#{d.id}</td>
                        <td style={{ padding: '1rem 0.75rem' }}>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{d.student_name || 'Student'}</div>
                          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{d.roll_no}</div>
                        </td>
                        <td style={{ padding: '1rem 0.75rem', fontSize: '0.85rem', color: '#1e293b', fontWeight: 600 }}>{d.type}</td>
                        <td style={{ padding: '1rem 0.75rem', fontSize: '0.85rem', color: '#475569' }}>{d.requested_date}</td>
                        <td style={{ padding: '1rem 0.75rem', textAlign: 'center' }}>
                          <span style={{
                            padding: '0.2rem 0.5rem',
                            borderRadius: '9999px',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            background: isApproved ? 'rgba(16, 185, 129, 0.12)' : isRejected ? 'rgba(239, 68, 68, 0.12)' : 'rgba(249, 115, 22, 0.12)',
                            color: isApproved ? '#10b981' : isRejected ? '#ef4444' : '#f97316'
                          }}>
                            {d.status}
                          </span>
                        </td>
                        <td style={{ padding: '1rem 0.75rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            {isPending && (
                              <>
                                <button 
                                  onClick={() => handleUpdateDocument(d.id, 'Approved & Ready to Collect')}
                                  style={{ padding: '0.35rem 0.6rem', border: 'none', borderRadius: '0.375rem', fontSize: '0.75rem', background: '#10b981', color: '#fff', cursor: 'pointer', fontWeight: 600 }}
                                >
                                  Approve & Ready
                                </button>
                                <button 
                                  onClick={() => {
                                    setConfirmModal({
                                      title: 'Reject Request',
                                      message: 'Are you sure you want to reject this request? Remarks will be recorded.',
                                      onConfirm: () => handleUpdateDocument(d.id, 'Rejected')
                                    });
                                  }}
                                  style={{ padding: '0.35rem 0.6rem', border: '1px solid #fee2e2', borderRadius: '0.375rem', fontSize: '0.75rem', background: '#fff', color: '#ef4444', cursor: 'pointer', fontWeight: 600 }}
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            {isApproved && (
                              <button 
                                onClick={() => generateCertificatePDF(d.id)}
                                style={{ padding: '0.35rem 0.6rem', border: '1px solid #cbd5e1', background: '#fff', borderRadius: '0.375rem', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                              >
                                <Download size={12} /> Download PDF
                              </button>
                            )}
                            {isRejected && <span style={{ fontSize: '0.8rem', color: '#ef4444', fontStyle: 'italic' }}>Rejected</span>}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================================================
            TAB: COMPLAINT MANAGEMENT
            ================================================== */}
        {activeTab === 'complaints' && (
          <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Complaint Escalation Center</h3>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>Resolve operational tickets, inspect AI priority levels, and purge unusual/spam complaints</p>
              </div>
              <button
                onClick={handleCleanSpamComplaints}
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.55rem 1.1rem',
                  borderRadius: '0.5rem',
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.3)',
                  transition: 'all 0.2s ease'
                }}
              >
                <ShieldAlert size={16} />
                <span>AI Auto-Purge Spam Complaints</span>
              </button>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '750px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left', color: '#64748b', fontSize: '0.75rem', fontWeight: 700 }}>ID</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', color: '#64748b', fontSize: '0.75rem', fontWeight: 700 }}>Student</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', color: '#64748b', fontSize: '0.75rem', fontWeight: 700 }}>Category</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', color: '#64748b', fontSize: '0.75rem', fontWeight: 700 }}>Description</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center', color: '#64748b', fontSize: '0.75rem', fontWeight: 700 }}>AI Priority</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center', color: '#64748b', fontSize: '0.75rem', fontWeight: 700 }}>AI Moderation</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center', color: '#64748b', fontSize: '0.75rem', fontWeight: 700 }}>Status</th>
                    <th style={{ padding: '0.75rem', textAlign: 'right', color: '#64748b', fontSize: '0.75rem', fontWeight: 700, width: '200px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map(c => {
                    const isPending = c.status === 'Pending';
                    const isProgress = c.status === 'In Progress';
                    const isResolved = c.status === 'Resolved';
                    const aiFlag = c.ai_flag || 'Verified Genuine ✅';
                    const priority = c.priority || 'Medium Priority 🛠️';

                    return (
                      <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '1rem 0.75rem', fontSize: '0.85rem', fontWeight: 700 }}>#{c.id}</td>
                        <td style={{ padding: '1rem 0.75rem' }}>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{c.student_name || 'Student'}</div>
                          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{c.roll_no}</div>
                        </td>
                        <td style={{ padding: '1rem 0.75rem', fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>{c.category}</td>
                        <td style={{ padding: '1rem 0.75rem', fontSize: '0.85rem', color: '#1e293b' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <span>{c.description}</span>
                            {c.photo && (
                              <div style={{ display: 'inline-block', width: 'fit-content' }}>
                                <img 
                                  src={c.photo} 
                                  alt="Complaint Attachment" 
                                  onClick={() => {
                                    const win = window.open();
                                    if (win) {
                                      win.document.write(`
                                        <html>
                                          <head>
                                            <title>Complaint Photo Preview</title>
                                            <style>
                                              body { margin: 0; display: flex; justify: center; align-items: center; background: #000; height: 100vh; }
                                              img { max-width: 100%; max-height: 100%; object-fit: contain; }
                                            </style>
                                          </head>
                                          <body>
                                            <img src="${c.photo}" alt="Complaint Photo" />
                                          </body>
                                        </html>
                                      `);
                                      win.document.close();
                                    }
                                  }}
                                  style={{ 
                                    width: '60px', 
                                    height: '60px', 
                                    objectFit: 'cover', 
                                    borderRadius: '0.375rem', 
                                    cursor: 'pointer',
                                    border: '1px solid #cbd5e1',
                                    transition: 'transform 0.2s',
                                  }}
                                  onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                  onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                />
                              </div>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '1rem 0.75rem', textAlign: 'center' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4c1d95', background: 'rgba(109, 40, 217, 0.08)', padding: '0.25rem 0.5rem', borderRadius: '0.375rem' }}>
                            {priority}
                          </span>
                        </td>
                        <td style={{ padding: '1rem 0.75rem', textAlign: 'center' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: aiFlag.includes('Verified') ? '#047857' : '#b91c1c', background: aiFlag.includes('Verified') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', padding: '0.25rem 0.5rem', borderRadius: '0.375rem' }}>
                            {aiFlag}
                          </span>
                        </td>
                        <td style={{ padding: '1rem 0.75rem', textAlign: 'center' }}>
                          <span style={{
                            padding: '0.2rem 0.5rem',
                            borderRadius: '9999px',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            background: isResolved ? 'rgba(16, 185, 129, 0.12)' : isProgress ? 'rgba(249, 115, 22, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                            color: isResolved ? '#10b981' : isProgress ? '#f97316' : '#ef4444'
                          }}>
                            {c.status}
                          </span>
                        </td>
                        <td style={{ padding: '1rem 0.75rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                            {isPending && (
                              <>
                                <button 
                                  onClick={() => handleUpdateComplaint(c.id, 'In Progress', 'Estate Manager')}
                                  style={{ padding: '0.35rem 0.6rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', fontSize: '0.75rem', background: '#fff', color: '#475569', cursor: 'pointer', fontWeight: 600 }}
                                >
                                  Assign Staff
                                </button>
                                <button 
                                  onClick={() => handleUpdateComplaint(c.id, 'Resolved')}
                                  style={{ padding: '0.35rem 0.6rem', border: 'none', borderRadius: '0.375rem', fontSize: '0.75rem', background: '#10b981', color: '#fff', cursor: 'pointer', fontWeight: 600 }}
                                >
                                  Resolve
                                </button>
                              </>
                            )}
                            {isProgress && (
                              <button 
                                onClick={() => handleUpdateComplaint(c.id, 'Resolved')}
                                style={{ padding: '0.35rem 0.6rem', border: 'none', borderRadius: '0.375rem', fontSize: '0.75rem', background: '#10b981', color: '#fff', cursor: 'pointer', fontWeight: 600 }}
                              >
                                Complete Ticket
                              </button>
                            )}
                            {isResolved && <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>Resolved</span>}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================================================
            TAB: FEE MANAGEMENT
            ================================================== */}
        {activeTab === 'fees' && (
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>Fee Ledger Structure</h3>
                <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.75rem', color: '#64748b' }}>Track student dues, structure changes, fee waivers</p>
              </div>
              <button onClick={() => showToast("Broadcasting due alerts via SMS and email")} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.45rem 0.85rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}><Bell size={14} /> Send Due Notifications</button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '0.75rem', fontSize: '0.75rem', color: '#64748b' }}>Student</th>
                    <th style={{ padding: '0.75rem', fontSize: '0.75rem', color: '#64748b' }}>Fee Type</th>
                    <th style={{ padding: '0.75rem', fontSize: '0.75rem', color: '#64748b' }}>Total Fee</th>
                    <th style={{ padding: '0.75rem', fontSize: '0.75rem', color: '#64748b' }}>Paid</th>
                    <th style={{ padding: '0.75rem', fontSize: '0.75rem', color: '#64748b' }}>Balance</th>
                    <th style={{ padding: '0.75rem', fontSize: '0.75rem', color: '#64748b' }}>Due Date</th>
                    <th style={{ padding: '0.75rem', fontSize: '0.75rem', color: '#64748b', textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {fees.map(f => (
                    <tr key={f.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.85rem 0.75rem' }}>
                        <div style={{ fontWeight: 700 }}>{f.name}</div>
                        <div style={{ fontSize: '0.65rem', color: '#64748b' }}>{f.roll_no}</div>
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem', fontWeight: 600 }}>{f.type}</td>
                      <td style={{ padding: '0.85rem 0.75rem' }}>₹{f.total.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '0.85rem 0.75rem', color: '#10b981' }}>₹{f.paid.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '0.85rem 0.75rem', color: '#ef4444', fontWeight: 700 }}>₹{(f.total - f.paid).toLocaleString('en-IN')}</td>
                      <td style={{ padding: '0.85rem 0.75rem' }}>{f.due_date}</td>
                      <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.45rem', borderRadius: '9999px', background: f.status === 'Paid' ? 'rgba(16, 185, 129, 0.1)' : f.status === 'Partial' ? 'rgba(249, 115, 22, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: f.status === 'Paid' ? '#10b981' : f.status === 'Partial' ? '#f97316' : '#ef4444', fontWeight: 700 }}>{f.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================================================
            TAB: ATTENDANCE MANAGEMENT
            ================================================== */}
        {activeTab === 'attendance' && (
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.5rem' }}>Student Attendance Ledger</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>CSE Department Avg</div>
                <h3 style={{ margin: '0.25rem 0', fontSize: '1.5rem', fontWeight: 800 }}>94.1%</h3>
                <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden', marginTop: '0.5rem' }}>
                  <div style={{ width: '94%', height: '100%', background: 'var(--primary)' }} />
                </div>
              </div>
              <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>ECE Department Avg</div>
                <h3 style={{ margin: '0.25rem 0', fontSize: '1.5rem', fontWeight: 800 }}>91.5%</h3>
                <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden', marginTop: '0.5rem' }}>
                  <div style={{ width: '91.5%', height: '100%', background: 'var(--primary)' }} />
                </div>
              </div>
              <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>IT Department Avg</div>
                <h3 style={{ margin: '0.25rem 0', fontSize: '1.5rem', fontWeight: 800 }}>93.8%</h3>
                <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden', marginTop: '0.5rem' }}>
                  <div style={{ width: '93.8%', height: '100%', background: 'var(--primary)' }} />
                </div>
              </div>
            </div>
            <button onClick={() => showToast("Exporting attendance metrics report...")} style={{ padding: '0.5rem 1rem', background: '#f1f5f9', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>Export Attendance Report</button>
          </div>
        )}

        {/* ==================================================
            TAB: PLACEMENT MANAGEMENT
            ================================================== */}
        {activeTab === 'placements' && (
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>Placement & Internship Drives</h3>
                <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.75rem', color: '#64748b' }}>Configure recruiters drives schedules and criteria</p>
              </div>
              <button onClick={() => { setPlacementForm({ company: '', role: '', CTC: '', date: '', eligible_cgpa: 6.5, status: 'Active' }); setModalType('placement'); showToast("Create drive form active"); }} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.45rem 0.85rem', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}><Plus size={14} /> Add Drive</button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '0.75rem', fontSize: '0.75rem', color: '#64748b' }}>Company</th>
                    <th style={{ padding: '0.75rem', fontSize: '0.75rem', color: '#64748b' }}>Designation Role</th>
                    <th style={{ padding: '0.75rem', fontSize: '0.75rem', color: '#64748b' }}>CTC Package</th>
                    <th style={{ padding: '0.75rem', fontSize: '0.75rem', color: '#64748b' }}>Drive Date</th>
                    <th style={{ padding: '0.75rem', fontSize: '0.75rem', color: '#64748b' }}>CGPA Target</th>
                    <th style={{ padding: '0.75rem', fontSize: '0.75rem', color: '#64748b', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {placements.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.85rem 0.75rem', fontWeight: 700 }}>{p.company}</td>
                      <td style={{ padding: '0.85rem 0.75rem', fontWeight: 600 }}>{p.role}</td>
                      <td style={{ padding: '0.85rem 0.75rem', color: '#10b981', fontWeight: 700 }}>{p.CTC}</td>
                      <td style={{ padding: '0.85rem 0.75rem' }}>{p.date}</td>
                      <td style={{ padding: '0.85rem 0.75rem' }}>&gt;= {p.eligible_cgpa} CGPA</td>
                      <td style={{ padding: '0.85rem 0.75rem', textAlign: 'right' }}>
                        <button onClick={() => showToast(`Emailed eligible students list for ${p.company}`)} style={{ padding: '0.25rem 0.5rem', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '0.25rem', fontSize: '0.75rem', cursor: 'pointer' }}>Manage Eligible List</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================================================
            TAB: EVENT MANAGEMENT
            ================================================== */}
        {activeTab === 'events' && (
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>Campus Events Management</h3>
                <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.75rem', color: '#64748b' }}>
                  Synchronized academic calendar and campus events across staff, students, and administration
                </p>
              </div>
              <button 
                onClick={() => { 
                  setEventForm({ name: '', type: 'event', date: new Date().toISOString().split('T')[0], venue: '', registrations: 0 }); 
                  setModalType('event'); 
                }} 
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.45rem 0.85rem', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}
              >
                <Plus size={14} /> Add Event
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              {events.map(ev => {
                const cleanTitle = (ev.title || ev.name || '').split(' |tags:')[0].split(' |category:')[0];
                return (
                  <div key={ev.id} className="glass-card" style={{ padding: '1.25rem', position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ 
                        fontSize: '0.65rem', 
                        padding: '0.2rem 0.45rem', 
                        borderRadius: '0.35rem', 
                        background: ev.type === 'holiday' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(109, 40, 217, 0.1)', 
                        color: ev.type === 'holiday' ? '#ef4444' : 'var(--primary)', 
                        fontWeight: 800,
                        textTransform: 'uppercase'
                      }}>
                        {ev.type || 'Event'}
                      </span>
                      <button 
                        onClick={() => handleDeleteEvent(ev.id)}
                        style={{ border: 'none', background: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', cursor: 'pointer', padding: '0.35rem', borderRadius: '0.35rem' }}
                        title="Delete Event"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <h4 style={{ margin: '0.5rem 0 0.35rem 0', fontSize: '1rem', color: '#1e293b' }}>{cleanTitle}</h4>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>📅 Date: <b>{ev.date}</b></div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ==================================================
            TAB: HOSTEL & TRANSPORT MANAGEMENT
            ================================================== */}
        {activeTab === 'hostel' && (
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.5rem' }}>Hostel Room Allocations</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '0.75rem', fontSize: '0.75rem', color: '#64748b' }}>Block</th>
                    <th style={{ padding: '0.75rem', fontSize: '0.75rem', color: '#64748b' }}>Room No</th>
                    <th style={{ padding: '0.75rem', fontSize: '0.75rem', color: '#64748b' }}>Capacity</th>
                    <th style={{ padding: '0.75rem', fontSize: '0.75rem', color: '#64748b' }}>Filled</th>
                    <th style={{ padding: '0.75rem', fontSize: '0.75rem', color: '#64748b', textAlign: 'center' }}>Availability Status</th>
                  </tr>
                </thead>
                <tbody>
                  {hostel.map(h => (
                    <tr key={h.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.85rem 0.75rem', fontWeight: 700 }}>{h.block}</td>
                      <td style={{ padding: '0.85rem 0.75rem' }}>{h.room_no}</td>
                      <td style={{ padding: '0.85rem 0.75rem' }}>{h.capacity} beds</td>
                      <td style={{ padding: '0.85rem 0.75rem' }}>{h.filled} beds</td>
                      <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.45rem', borderRadius: '9999px', background: h.status === 'Available' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: h.status === 'Available' ? '#10b981' : '#ef4444', fontWeight: 700 }}>{h.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'transport' && (
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.5rem' }}>College Bus Routing Control</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '0.75rem', fontSize: '0.75rem', color: '#64748b' }}>Route / Bus No</th>
                    <th style={{ padding: '0.75rem', fontSize: '0.75rem', color: '#64748b' }}>Destination</th>
                    <th style={{ padding: '0.75rem', fontSize: '0.75rem', color: '#64748b' }}>Driver Assigned</th>
                    <th style={{ padding: '0.75rem', fontSize: '0.75rem', color: '#64748b' }}>Contact</th>
                    <th style={{ padding: '0.75rem', fontSize: '0.75rem', color: '#64748b' }}>Capacity Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transport.map(t => (
                    <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.85rem 0.75rem', fontWeight: 700 }}>{t.route_no}</td>
                      <td style={{ padding: '0.85rem 0.75rem', fontWeight: 600 }}>{t.destination}</td>
                      <td style={{ padding: '0.85rem 0.75rem' }}>{t.driver}</td>
                      <td style={{ padding: '0.85rem 0.75rem' }}>{t.phone}</td>
                      <td style={{ padding: '0.85rem 0.75rem' }}>{t.students} / {t.capacity} Students allocated</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================================================
            TAB: BROADCAST NOTIFICATIONS
            ================================================== */}
        {activeTab === 'broadcast' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
            <div className="glass-card" style={{ padding: '2rem' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Broadcast & Notifications Center</h3>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>Post circulars, placements, and emergency notices with target audience segmentation</p>
              </div>

              <form onSubmit={handlePostNotification} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>Announcement Title</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. End Semester internal exams scheduled calendar"
                    value={broadcastForm.title}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>Category / Type</label>
                    <select
                      value={broadcastForm.category}
                      onChange={(e) => setBroadcastForm({ ...broadcastForm, category: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', outline: 'none', background: '#fff' }}
                    >
                      <option value="circular">General Circular</option>
                      <option value="placement">Placement Alert</option>
                      <option value="emergency">Emergency Alert</option>
                      <option value="workshop">Workshop & Event</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>Target Audience</label>
                    <select
                      value={broadcastForm.target}
                      onChange={(e) => setBroadcastForm({ ...broadcastForm, target: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', outline: 'none', background: '#fff' }}
                    >
                      <option value="all">All Campus (Staff & Students)</option>
                      <option value="staff">All Staff / Faculty</option>
                      <option value="cse">CSE Department Only</option>
                      <option value="ece">ECE Department Only</option>
                      <option value="y3">Year 3 Students Only</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>Content Details</label>
                  <textarea 
                    required
                    rows={4}
                    placeholder="Detailed announcement content details here..."
                    value={broadcastForm.content}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, content: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="checkbox" id="pinAnnounce" checked={broadcastForm.pin} onChange={e => setBroadcastForm({...broadcastForm, pin: e.target.checked})} />
                  <label htmlFor="pinAnnounce" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Pin announcement to top of portal dashboard</label>
                </div>

                <button 
                  type="submit"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.5rem',
                    border: 'none',
                    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                    color: '#fff',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 6px -1px rgba(109, 40, 217, 0.2)'
                  }}
                >
                  <Send size={16} /> Broadcast Announcement
                </button>
              </form>
            </div>

            <div className="glass-card" style={{ padding: '1.5rem', maxHeight: '600px', overflowY: 'auto' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, marginBottom: '1rem' }}>Active Announcements & Alerts</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {notifications.map((n) => {
                  const isLostFound = n.category === 'lost_found';
                  const isEmergency = n.category === 'emergency';
                  const isPlacement = n.category === 'placement';
                  
                  const cardBg = isEmergency ? 'rgba(239, 68, 68, 0.05)' : isLostFound ? 'rgba(109, 40, 217, 0.03)' : '#fff';
                  const borderLeftColor = isEmergency ? '#ef4444' : isLostFound ? 'var(--primary)' : '#cbd5e1';
                  
                  return (
                    <div key={n.id} style={{ padding: '1rem', borderRadius: '0.5rem', border: '1px solid rgba(0,0,0,0.05)', borderLeft: `4px solid ${borderLeftColor}`, background: cardBg, textAlign: 'left' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e1b4b' }}>{n.title}</span>
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>{n.date}</span>
                      </div>
                      <p style={{ margin: '0.5rem 0', fontSize: '0.8rem', color: '#475569', whiteSpace: 'pre-line', lineHeight: '1.4' }}>{n.content}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748b', borderTop: '1px solid rgba(0,0,0,0.03)', paddingTop: '0.35rem', marginTop: '0.35rem' }}>
                        <span>By: <b>{n.sender_name}</b> ({n.sender_role})</span>
                        <span style={{ textTransform: 'uppercase', fontWeight: 700, fontSize: '0.65rem', color: 'var(--primary)' }}>{n.category.replace('_', ' ')}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================
            TAB: ROLES & PERMISSIONS
            ================================================== */}
        {activeTab === 'roles' && (
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, marginBottom: '1rem' }}>User Roles & Access Levels</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '0.75rem', fontSize: '0.75rem', color: '#64748b' }}>Role Level</th>
                    <th style={{ padding: '0.75rem', fontSize: '0.75rem', color: '#64748b' }}>Scope Permission Access</th>
                    <th style={{ padding: '0.75rem', fontSize: '0.75rem', color: '#64748b' }}>Total Roster Users</th>
                    <th style={{ padding: '0.75rem', fontSize: '0.75rem', color: '#64748b', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map((r, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.85rem 0.75rem', fontWeight: 700 }}>{r.role}</td>
                      <td style={{ padding: '0.85rem 0.75rem', fontWeight: 500, color: 'var(--primary)' }}>{r.access}</td>
                      <td style={{ padding: '0.85rem 0.75rem' }}>{r.users} users</td>
                      <td style={{ padding: '0.85rem 0.75rem', textAlign: 'right' }}>
                        <button onClick={() => showToast(`Edit permissions scope trigger for ${r.role}`)} style={{ padding: '0.25rem 0.5rem', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '0.25rem', fontSize: '0.75rem', cursor: 'pointer' }}>Modify Access Rights</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================================================
            TAB: SYSTEM SETTINGS
            ================================================== */}
        {activeTab === 'settings' && (
          <div className="glass-card" style={{ padding: '2rem', maxWidth: '600px' }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem' }}>System Configurations</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>Current Academic Year</label>
                <input type="text" value={settings.academic_year} onChange={e => setSettings({...settings, academic_year: e.target.value})} style={{ width: '100%', padding: '0.55rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>Active Cycle Semester</label>
                <select value={settings.semester} onChange={e => setSettings({...settings, semester: e.target.value})} style={{ width: '100%', padding: '0.55rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', background: '#fff' }}>
                  <option value="Odd Semester">Odd Semester</option>
                  <option value="Even Semester">Even Semester</option>
                  <option value="Summer Term">Summer Term</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>Institutional Campus Name</label>
                <input type="text" value={settings.campus_name} onChange={e => setSettings({...settings, campus_name: e.target.value})} style={{ width: '100%', padding: '0.55rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }} />
              </div>
              <button onClick={() => showToast("Global campus configurations saved.")} style={{ padding: '0.65rem 1rem', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontWeight: 700 }}>Save Configurations</button>
            </div>
          </div>
        )}

        {/* ==================================================
            TAB: AUDIT LOGS
            ================================================== */}
        {activeTab === 'audit' && (
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.5rem' }}>Security Audit Ledger Logs</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '0.75rem', fontSize: '0.75rem', color: '#64748b' }}>Action Date/Time</th>
                    <th style={{ padding: '0.75rem', fontSize: '0.75rem', color: '#64748b' }}>Operated By</th>
                    <th style={{ padding: '0.75rem', fontSize: '0.75rem', color: '#64748b' }}>Task Details</th>
                    <th style={{ padding: '0.75rem', fontSize: '0.75rem', color: '#64748b', textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.85rem 0.75rem', fontSize: '0.8rem', color: '#64748b' }}>{log.timestamp}</td>
                      <td style={{ padding: '0.85rem 0.75rem', fontWeight: 700, fontSize: '0.8rem' }}>{log.user}</td>
                      <td style={{ padding: '0.85rem 0.75rem', fontSize: '0.85rem', color: '#1e293b' }}>{log.action}</td>
                      <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}><span style={{ padding: '0.15rem 0.45rem', fontSize: '0.7rem', fontWeight: 700, background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '9999px' }}>{log.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* Docked AI Guard Panel */}
      <FloatingAIChatbot user={user} isDocked={true} />

    </div>
  );
};

export default AdminDashboard;
