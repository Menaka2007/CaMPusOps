import React, { useState } from 'react';
import { 
  Calendar, MessageSquareCode, FileText, CreditCard, Bell, 
  HelpCircle, Search, LogOut, ArrowRight, User as UserIcon, 
  Sparkles, CheckCircle2, ChevronRight, RefreshCw, Cpu
} from 'lucide-react';
import SchedulerTab from './SchedulerTab';
import ComplaintsTab from './ComplaintsTab';
import DocumentsTab from './DocumentsTab';
import FeesTab from './FeesTab';
import NotificationsTab from './NotificationsTab';
import LostFoundTab from './LostFoundTab';

const AGENTS = [
  { name: "Scheduler Agent", icon: Calendar, color: "#6d28d9", desc: "Timetable, exams, holidays, and bookings" },
  { name: "Complaint Agent", icon: MessageSquareCode, color: "#2563eb", desc: "Hostel, classroom, bus, maintenance issues" },
  { name: "Document Request Agent", icon: FileText, color: "#059669", desc: "Bonafide, certificates, ID cards, hall tickets" },
  { name: "Fee & Payment Agent", icon: CreditCard, color: "#d97706", desc: "Tuition, exams, payment history & dues" },
  { name: "Notification Agent", icon: Bell, color: "#dc2626", desc: "Announcements, placements, alerts & circulars" },
  { name: "Lost & Found Agent", icon: HelpCircle, color: "#4f46e5", desc: "Registry for lost items, reports and matches" }
];

const RECENT_SEARCHES = [
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

      const res = await fetch(url, {
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

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-gradient)' }}>
      
      {/* Sidebar */}
      <aside className="glass-card" style={{ width: '300px', margin: '1rem', marginRight: '0', display: 'flex', flexDirection: 'column', padding: '1.5rem', borderRadius: '1.25rem', height: 'calc(100vh - 2rem)', position: 'sticky', top: '1rem', boxSizing: 'border-box' }}>
        
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

        {/* Navigation / Agents Header */}
        <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.05em', marginBottom: '1rem' }}>
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
                <div style={{ padding: '0.35rem', borderRadius: '0.5rem', background: `${agent.color}15`, color: agent.color }}>
                  <Icon size={18} />
                </div>
                <div style={{ flexGrow: 1 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{agent.name}</div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: '170px' }}>{agent.desc}</div>
                </div>
                {isActive && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2563eb' }} />}
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
      <main style={{ flexGrow: 1, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', boxSizing: 'border-box', overflowY: 'auto' }}>
        
        {/* Top Header */}
        <header className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.05em' }}>SRI ESHWAR CAMPUS OPERATIONS</span>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Smart Campus Assistant</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.75rem', background: 'rgba(37, 99, 235, 0.08)', borderRadius: '9999px', fontSize: '0.8rem', color: 'var(--secondary)', fontWeight: 600 }}>
            <Cpu size={14} />
            Orchestrator Mode Active
          </div>
        </header>

        {/* Center Search / Orchestrator Agent */}
        <section className="glass-card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '220px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Sparkles size={24} style={{ color: 'var(--primary)' }} />
            <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 800, background: 'linear-gradient(to right, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              How can I assist your campus life today?
            </h1>
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} style={{ width: '100%', maxWidth: '720px', position: 'relative' }}>
            <input
              type="text"
              placeholder={selectedAgent ? `Ask ${selectedAgent} anything...` : "Ask anything: 'When is my exam?', 'Apply for bonafide', 'Fan not working'..."}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '1.15rem 1.5rem',
                paddingLeft: '3.5rem',
                paddingRight: '4rem',
                borderRadius: '9999px',
                border: '1.5px solid rgba(109, 40, 217, 0.15)',
                outline: 'none',
                background: 'rgba(255, 255, 255, 0.95)',
                fontSize: '1rem',
                boxShadow: '0 4px 20px rgba(109, 40, 217, 0.04)',
                boxSizing: 'border-box',
                transition: 'all 0.3s'
              }}
            />
            <Search size={20} style={{ position: 'absolute', left: '1.25rem', top: '1.25rem', color: '#94a3b8' }} />
            <button
              type="submit"
              disabled={loading}
              style={{
                position: 'absolute',
                right: '0.5rem',
                top: '0.5rem',
                bottom: '0.5rem',
                padding: '0 1.25rem',
                borderRadius: '9999px',
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {loading ? <RefreshCw className="animate-spin" size={16} /> : <ArrowRight size={16} />}
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
              className="glass-card" 
              onClick={() => handleRecentClick(item)}
              style={{ padding: '1.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}
            >
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase' }}>{item.agent}</span>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', fontWeight: 600 }}>{item.label}</p>
              </div>
              <ChevronRight size={18} style={{ color: '#94a3b8' }} />
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
                  <div style={{ padding: '1.25rem', borderRadius: '0.75rem', background: 'rgba(109, 40, 217, 0.05)', border: '1px solid rgba(109, 40, 217, 0.1)', fontSize: '0.9rem', color: '#1e1b4b', lineHeight: '1.6' }}>
                    <h5 style={{ margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--primary)', fontWeight: 700 }}>
                      <Sparkles size={14} /> AI Response Summary
                    </h5>
                    <div style={{ whiteSpace: 'pre-line' }}>
                      {response.split('\n').map((line, i) => {
                        if (line.startsWith('### ')) {
                          return <h5 key={i} style={{ fontSize: '1rem', fontWeight: 700, margin: '0.75rem 0 0.25rem 0', color: 'var(--primary)' }}>{line.replace('### ', '')}</h5>;
                        }
                        if (line.startsWith('#### ')) {
                          return <h6 key={i} style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0.5rem 0 0.25rem 0', color: 'var(--secondary)' }}>{line.replace('#### ', '')}</h6>;
                        }
                        if (line.startsWith('- ')) {
                          return <li key={i} style={{ marginLeft: '1rem', marginBottom: '0.2rem' }}>{line.replace('- ', '')}</li>;
                        }
                        return <p key={i} style={{ margin: '0.4rem 0' }}>{line}</p>;
                      })}
                    </div>
                  </div>
                )}
                <div style={{ flexGrow: 1 }}>
                  {activeAgent === "Scheduler Agent" && <SchedulerTab user={user} />}
                  {activeAgent === "Complaint Agent" && <ComplaintsTab user={user} />}
                  {activeAgent === "Document Request Agent" && <DocumentsTab user={user} />}
                  {activeAgent === "Fee & Payment Agent" && <FeesTab user={user} />}
                  {activeAgent === "Notification Agent" && <NotificationsTab user={user} />}
                  {activeAgent === "Lost & Found Agent" && <LostFoundTab user={user} />}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, color: '#94a3b8', textAlign: 'center' }}>
                <Cpu size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <p style={{ margin: 0, fontSize: '0.95rem' }}>Ask Sri Eshwar Campus Assistant a question using the search bar above.</p>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem' }}>The Orchestrator Agent will automatically route your question to the specialist AI agent.</p>
              </div>
            )}
          </div>

        </section>

      </main>

    </div>
  );
};

export default Dashboard;
