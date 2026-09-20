import React, { useState } from 'react';
import { 
  Calendar, MessageSquareCode, FileText, CreditCard, Bell, 
  HelpCircle, Search, LogOut, ArrowRight, User as UserIcon, 
  Sparkles, ChevronRight, RefreshCw, Cpu, UserCheck, Clock,
  Menu, X
} from 'lucide-react';
import SchedulerTab from './SchedulerTab';
import ComplaintsTab from './ComplaintsTab';
import DocumentsTab from './DocumentsTab';
import FeesTab from './FeesTab';
import NotificationsTab from './NotificationsTab';
import LostFoundTab from './LostFoundTab';
import AttendanceTab from './AttendanceTab';
import FloatingAIChatbot from './FloatingAIChatbot';
import MarkdownView from './MarkdownView';
import { apiUrl } from '../api';

const AGENTS = [
  { name: "Scheduler Agent", icon: Calendar, color: "#6d28d9", desc: "Timetable, exams, holidays, and bookings" },
  { name: "Complaint Agent", icon: MessageSquareCode, color: "#4f46e5", desc: "Hostel, classroom, bus, maintenance issues" },
  { name: "Document Request Agent", icon: FileText, color: "#4338ca", desc: "Bonafide, certificates, ID cards, hall tickets" },
  { name: "Fee & Payment Agent", icon: CreditCard, color: "#7c3aed", desc: "Tuition, exams, payment history & dues" },
  { name: "Notification Agent", icon: Bell, color: "#6366f1", desc: "Announcements, placements, alerts & circulars" },
  { name: "Lost & Found Agent", icon: HelpCircle, color: "#5b21b6", desc: "Registry for lost items, reports and matches" }
];

const RECENT_SEARCHES = [
  { label: "My Class Timetable", query: "Show my class timetable", agent: "Scheduler Agent" },
  { label: "My Attendance & Cutoff Status", query: "What is my attendance percentage and exam eligibility?", agent: "Scheduler Agent" },
  { label: "Internal Exam Schedule", query: "When is my internal exam?", agent: "Scheduler Agent" },
  { label: "Bonafide Certificate Request", query: "I need a Bonafide Certificate", agent: "Document Request Agent" },
  { label: "Placement Drive Zoho", query: "Any placement drives?", agent: "Notification Agent" }
];

const Dashboard = ({ user, onLogout }) => {
  const [query, setQuery] = useState('');
  const [selectedAgent, setSelectedAgent] = useState(null); // Direct agent query override if clicked in sidebar
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [response, setResponse] = useState(null);
  const [activeAgent, setActiveAgent] = useState(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const triggerSearch = async (searchQuery, directAgentName = null) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setResponse(null);
    setActiveAgent(null);

    // Initial logs to demonstrate orchestrator flow
    const logList = [
      { step: "User Input Received", desc: `"${searchQuery}"`, status: "done" }
    ];
    setLogs(logList);

    try {
      let url = 'http://127.0.0.1:8000/api/query';
      let payload = {
        query: searchQuery,
        roll_no: user.roll_no,
        name: user.name
      };

      if (directAgentName) {
        url = 'http://127.0.0.1:8000/api/direct-agent';
        payload.agent_name = directAgentName;
        logList.push({ step: "Routing Direct Agent", desc: `Directly targeting ${directAgentName}`, status: "pending" });
        setLogs([...logList]);
      } else {
        logList.push({ step: "Orchestrator Parsing Intent", desc: "Analyzing linguistic patterns...", status: "pending" });
        setLogs([...logList]);
      }

      const res = await fetch(apiUrl(url), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Query processing failed');

      const data = await res.json();

      // Complete the orchestration workflow logs
      logList[logList.length - 1].status = "done";
      logList.push({ step: "Intent Identified", desc: `Routed to ${data.agent}`, status: "done" });
      logList.push({ step: "Database Query Executed", desc: "Retrieved Sri Eshwar records", status: "done" });
      logList.push({ step: "Response Formulated", desc: "Success", status: "done" });
      
      setLogs(logList);
      setResponse(data.response);
      setActiveAgent(data.agent);
    } catch (err) {
      logList.push({ step: "Error", desc: err.message, status: "error" });
      setLogs(logList);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    triggerSearch(query, selectedAgent);
  };

  const handleRecentClick = (item) => {
    setQuery(item.query);
    triggerSearch(item.query);
  };

  const handleAgentSelect = (agentName) => {
    if (selectedAgent === agentName) {
      setSelectedAgent(null); // Deselect
      setActiveAgent(null);
    } else {
      setSelectedAgent(agentName);
      setActiveAgent(agentName);
      setResponse(null); // Show the interactive tab instead of text output
    }
  };

  const handleActionClick = (action) => {
    const act = (action || '').toLowerCase();
    if (act.includes('timetable') || act.includes('schedule')) {
      setActiveAgent("Scheduler Agent");
      setSelectedAgent("Scheduler Agent");
    } else if (act.includes('attendance')) {
      setActiveAgent("Attendance & Eligibility");
      setSelectedAgent(null);
    } else if (act.includes('complaint') || act.includes('maintenance')) {
      setActiveAgent("Complaint Agent");
      setSelectedAgent("Complaint Agent");
    } else if (act.includes('document') || act.includes('bonafide')) {
      setActiveAgent("Document Request Agent");
      setSelectedAgent("Document Request Agent");
    } else if (act.includes('fee') || act.includes('dues')) {
      setActiveAgent("Fee & Payment Agent");
      setSelectedAgent("Fee & Payment Agent");
    } else if (act.includes('notification') || act.includes('placement')) {
      setActiveAgent("Notification Agent");
      setSelectedAgent("Notification Agent");
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-gradient)' }}>
      
      {/* Sidebar */}
      <aside className="glass-card" style={{ width: '290px', minWidth: '290px', margin: '1rem', marginRight: '0', display: 'flex', flexDirection: 'column', padding: '1.5rem', borderRadius: '1.25rem', height: 'calc(100vh - 2rem)', position: 'sticky', top: '1rem', boxSizing: 'border-box' }}>
        
        {/* Profile Card */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(109, 40, 217, 0.1)', marginBottom: '1.5rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <UserIcon size={20} />
          </div>
          <div style={{ overflow: 'hidden' }}>
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user.name}</h4>
            <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>{user.role} | {user.roll_no}</span>
          </div>
        </div>

        {/* Direct Academic Portal - Timetable & Attendance */}
        <div style={{ marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
            Academic Records
          </div>

          {/* Class Timetable Button */}
          <button
            onClick={() => {
              setActiveAgent("Scheduler Agent");
              setSelectedAgent("Scheduler Agent");
              setResponse(null);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: '0.75rem',
              border: activeAgent === "Scheduler Agent" ? '1.5px solid var(--secondary)' : '1.5px solid rgba(37, 99, 235, 0.15)',
              background: activeAgent === "Scheduler Agent" ? 'rgba(37, 99, 235, 0.12)' : 'rgba(37, 99, 235, 0.04)',
              textAlign: 'left',
              cursor: 'pointer',
              width: '100%',
              color: activeAgent === "Scheduler Agent" ? 'var(--secondary)' : '#1e1b4b',
              transition: 'all 0.2s',
              boxSizing: 'border-box'
            }}
          >
            <div style={{ padding: '0.35rem', borderRadius: '0.5rem', background: 'rgba(37, 99, 235, 0.15)', color: 'var(--secondary)' }}>
              <Clock size={18} />
            </div>
            <div style={{ flexGrow: 1 }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 700 }}>Class Timetable</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Mon–Fri periods & venues</div>
            </div>
            {activeAgent === "Scheduler Agent" && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--secondary)' }} />}
          </button>

          {/* Attendance & Eligibility Button */}
          <button
            onClick={() => {
              setActiveAgent("Attendance & Eligibility");
              setSelectedAgent(null);
              setResponse(null);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: '0.75rem',
              border: activeAgent === "Attendance & Eligibility" ? '1.5px solid #059669' : '1.5px solid rgba(5, 150, 105, 0.2)',
              background: activeAgent === "Attendance & Eligibility" ? 'rgba(5, 150, 105, 0.12)' : 'rgba(5, 150, 105, 0.04)',
              textAlign: 'left',
              cursor: 'pointer',
              width: '100%',
              color: activeAgent === "Attendance & Eligibility" ? '#059669' : '#1e1b4b',
              transition: 'all 0.2s',
              boxSizing: 'border-box'
            }}
          >
            <div style={{ padding: '0.35rem', borderRadius: '0.5rem', background: 'rgba(5, 150, 105, 0.15)', color: '#059669' }}>
              <UserCheck size={18} />
            </div>
            <div style={{ flexGrow: 1 }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 700 }}>Attendance & Eligibility</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>75% cutoff & subject logs</div>
            </div>
            {activeAgent === "Attendance & Eligibility" && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#059669' }} />}
          </button>
        </div>

        {/* Navigation / Agents Header */}
        <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
          Specialist Agents
        </div>

        {/* Agents List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flexGrow: 1, overflowY: 'auto' }}>
          {AGENTS.map((agent) => {
            const Icon = agent.icon;
            const isSelected = selectedAgent === agent.name;
            const isActive = activeAgent === agent.name;

            return (
              <button
                key={agent.name}
                onClick={() => handleAgentSelect(agent.name)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.75rem',
                  border: isSelected ? `1.5px solid ${agent.color}` : '1.5px solid transparent',
                  background: isSelected ? 'rgba(109, 40, 217, 0.08)' : isActive ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
                  textAlign: 'left',
                  cursor: 'pointer',
                  width: '100%',
                  color: isSelected ? 'var(--primary)' : '#475569',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box'
                }}
              >
                <div style={{ padding: '0.35rem', borderRadius: '0.5rem', background: `${agent.color}15`, color: agent.color, flexShrink: 0 }}>
                  <Icon size={18} />
                </div>
                <div style={{ flexGrow: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{agent.name}</div>
                  <div 
                    title={agent.desc}
                    style={{ 
                      fontSize: '0.72rem', 
                      color: '#64748b', 
                      lineHeight: 1.3,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      wordBreak: 'break-word'
                    }}
                  >
                    {agent.desc}
                  </div>
                </div>
                {isActive && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2563eb', flexShrink: 0 }} />}
              </button>
            );
          })}
        </div>

        {/* Logout */}
        <button 
          onClick={onLogout} 
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', border: 'none', cursor: 'pointer', marginTop: '1rem', fontWeight: 600 }}
        >
          <LogOut size={16} />
          Sign Out
        </button>

      </aside>

      {/* Main Panel */}
      <main style={{ flexGrow: 1, minWidth: 0, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', boxSizing: 'border-box', overflowY: 'auto' }}>
        
        {/* Top Header */}
        <header className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 2rem', border: '1px solid rgba(217, 119, 6, 0.25)', boxShadow: '0 8px 30px rgba(217, 119, 6, 0.08)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.15rem' }}>
              <span style={{ fontSize: '0.85rem' }}>👑</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#b45309', letterSpacing: '0.08em', textTransform: 'uppercase' }}>SRI ESHWAR COLLEGE OF ENGINEERING</span>
            </div>
            <h2 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 900, color: '#1e1b4b', letterSpacing: '-0.02em' }}>Royal Campus Operations Suite</h2>
          </div>
          <div className="royal-crest-badge">
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981' }} />
            <Cpu size={14} style={{ color: '#d97706' }} />
            Autonomous Core Active
          </div>
        </header>

        {/* Center Search / Orchestrator Agent */}
        <section className="glass-card" style={{ padding: '2.75rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '220px', border: '1px solid rgba(217, 119, 6, 0.2)', background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,251,235,0.8) 100%)' }}>
          
          <div className="royal-crest-badge" style={{ marginBottom: '1rem' }}>
            <span>👑</span> Imperial AI Assistant & Academic Concierge
          </div>

          <h1 style={{ margin: '0 0 1.5rem 0', fontSize: '2.25rem', fontWeight: 900, textAlign: 'center', background: 'linear-gradient(135deg, #1e1b4b 0%, #4338ca 45%, #b45309 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.025em' }}>
            How can I assist your campus life today?
          </h1>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} style={{ width: '100%', maxWidth: '720px', position: 'relative' }}>
            <input
              type="text"
              placeholder={selectedAgent ? `Ask ${selectedAgent} anything...` : "Ask anything: 'When is my exam?', 'Apply for bonafide', 'Fan not working'..."}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '1.2rem 1.5rem',
                paddingLeft: '3.6rem',
                paddingRight: '4.8rem',
                borderRadius: '9999px',
                border: '2px solid rgba(217, 119, 6, 0.3)',
                outline: 'none',
                background: '#ffffff',
                fontSize: '1.02rem',
                boxShadow: '0 12px 30px -6px rgba(217, 119, 6, 0.12), 0 2px 8px rgba(0,0,0,0.03)',
                boxSizing: 'border-box',
                transition: 'all 0.25s'
              }}
            />
            <Search size={22} style={{ position: 'absolute', left: '1.35rem', top: '1.35rem', color: '#d97706' }} />
            <button
              type="submit"
              disabled={loading}
              className="btn-royal-gold"
              style={{
                position: 'absolute',
                right: '0.45rem',
                top: '0.45rem',
                bottom: '0.45rem',
                padding: '0 1.5rem',
                borderRadius: '9999px',
                border: 'none',
                boxShadow: '0 4px 14px rgba(217, 119, 6, 0.4)'
              }}
            >
              {loading ? <RefreshCw className="animate-spin" size={16} /> : <ArrowRight size={18} />}
            </button>
          </form>

          {/* Direct Agent Badge Reminder */}
          {selectedAgent && (
            <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: '#64748b' }}>
              Filtering queries directly through <strong style={{ color: 'var(--primary)' }}>{selectedAgent}</strong>.
              <button onClick={() => setSelectedAgent(null)} style={{ background: 'none', border: 'none', color: 'var(--secondary)', marginLeft: '0.5rem', cursor: 'pointer', textDecoration: 'underline' }}>Clear filter</button>
            </div>
          )}

        </section>

        {/* Recent Searches */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {RECENT_SEARCHES.map((item, idx) => (
            <div 
              key={idx} 
              className="glass-card glass-card-interactive" 
              onClick={() => handleRecentClick(item)}
              style={{ 
                padding: '1.25rem', 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                gap: '1rem',
                borderLeft: '4px solid var(--primary)',
                background: 'rgba(255, 255, 255, 0.9)'
              }}
            >
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{item.agent}</span>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', fontWeight: 700, color: '#1e293b' }}>{item.label}</p>
              </div>
              <ChevronRight size={18} style={{ color: 'var(--primary-light)' }} />
            </div>
          ))}
        </section>

        {/* Orchestrator Logs & Output Area */}
        <section style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', flexGrow: 1, minHeight: '300px' }}>
          
          {/* Main Answer View */}
          <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', overflowY: 'auto' }}>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, gap: '1rem' }}>
                <RefreshCw size={36} className="animate-spin" style={{ color: 'var(--primary)', animation: 'spin 2s linear infinite' }} />
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Querying Sri Eshwar databases...</p>
              </div>
            ) : activeAgent ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flexGrow: 1 }}>
                {response && (
                  <div style={{ padding: '1.5rem', borderRadius: '0.875rem', background: 'rgba(109, 40, 217, 0.04)', border: '1px solid rgba(109, 40, 217, 0.1)', fontSize: '0.9rem', color: '#1e1b4b', lineHeight: '1.6', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontWeight: 700, marginBottom: '1rem', fontSize: '0.95rem' }}>
                      <Sparkles size={16} /> AI Orchestrator Response
                    </div>
                    
                    {/* Render AI response properly via MarkdownView */}
                    <MarkdownView content={response} onActionClick={handleActionClick} />

                    {(query.toLowerCase().includes('attendance') || response.includes('Attendance') || response.includes('Cutoff') || response.includes('Eligibility')) && (
                      <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => {
                            setActiveAgent("Attendance & Eligibility");
                            setSelectedAgent(null);
                          }}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            padding: '0.5rem 1rem',
                            borderRadius: '9999px',
                            background: '#059669',
                            color: '#fff',
                            border: 'none',
                            fontSize: '0.825rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(5, 150, 105, 0.25)'
                          }}
                        >
                          <UserCheck size={15} /> Open Full Attendance & Eligibility Portal
                        </button>
                      </div>
                    )}
                  </div>
                )}
                <div style={{ flexGrow: 1 }}>
                  {activeAgent === "Attendance & Eligibility" && (
                    <AttendanceTab 
                      user={user} 
                      onAskChatbot={(q) => { 
                        setQuery(q); 
                        triggerSearch(q); 
                      }} 
                    />
                  )}
                  {activeAgent === "Scheduler Agent" && (
                    <SchedulerTab user={user} initialView="timetable" />
                  )}
                  {activeAgent === "Complaint Agent" && <ComplaintsTab user={user} />}
                  {activeAgent === "Document Request Agent" && <DocumentsTab user={user} />}
                  {activeAgent === "Fee & Payment Agent" && <FeesTab user={user} />}
                  {activeAgent === "Notification Agent" && <NotificationsTab user={user} />}
                  {activeAgent === "Lost & Found Agent" && <LostFoundTab user={user} />}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, color: '#94a3b8', textAlign: 'center', padding: '3rem 1rem' }}>
                <Cpu size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <p style={{ margin: 0, fontSize: '0.95rem' }}>Ask Sri Eshwar Campus Assistant a question using the search bar above.</p>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem' }}>The Orchestrator Agent will automatically route your question to the specialist AI agent.</p>
              </div>
            )}
          </div>

        </section>

      </main>

      {/* Docked AI Guard Panel */}
      <FloatingAIChatbot user={user} isDocked={true} />

    </div>
  );
};

export default Dashboard;
