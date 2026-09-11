import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, Sparkles, Send, X, MessageSquare, ChevronRight, ChevronLeft, 
  RefreshCw, Zap, Clock, ShieldCheck, CheckCircle2 
} from 'lucide-react';
import MarkdownView from './MarkdownView';
import StatusBadge from './StatusBadge';
import { apiUrl } from '../api';

const FloatingAIChatbot = ({ user, isDocked = true }) => {
  const [isOpen, setIsOpen] = useState(true); // Default open in docked layout
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      agent: 'CampusOps AI Guard',
      text: `Hello ${user?.name || 'Student'}! 👋 I am your CampusOps AI Guard. Ask me about your class schedule today, fee dues, attendance, or maintenance requests!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const userRollNo = user?.roll_no || user?.register_number || user?.faculty_id || '717721L101';
  const userName = user?.name || 'Student';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, loading]);

  const handleSendMessage = async (queryText) => {
    const textToSend = queryText || inputValue;
    if (!textToSend.trim() || loading) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!queryText) setInputValue('');
    setLoading(true);

    try {
      const res = await fetch(apiUrl('http://127.0.0.1:8000/api/query'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: textToSend,
          roll_no: userRollNo,
          name: userName
        })
      });

      if (!res.ok) {
        throw new Error('Failed to reach AI Assistant server');
      }

      const data = await res.json();
      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        agent: data.agent || 'CampusOps AI Guard',
        text: data.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error('Chatbot error:', err);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          agent: 'System Alert',
          text: '⚠️ Unable to connect to CampusOps AI backend. Please ensure the backend server is running on port 8000.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickPills = [
    { label: "⏰ Today's Classes", query: 'What is my class schedule today?' },
    { label: '📅 My Timetable', query: 'Show my class timetable' },
    { label: '📊 Attendance Status', query: 'What is my attendance percentage and exam eligibility?' },
    { label: '🛠️ Submit Maintenance', query: 'complaint about classroom: AC remote missing in Room 304' },
    { label: '📜 Apply Bonafide', query: 'I need a bonafide certificate for bank loan' },
    { label: '💳 Check Fee Dues', query: 'What are my pending fee dues?' }
  ];

  const isInputEmpty = !inputValue.trim();

  // Collapsed docked rail
  if (isDocked && !isOpen) {
    return (
      <div
        style={{
          width: '52px',
          flexShrink: 0,
          margin: '1rem 1rem 1rem 0',
          height: 'calc(100vh - 2rem)',
          position: 'sticky',
          top: '1rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          paddingTop: '1rem',
          boxSizing: 'border-box'
        }}
      >
        <button
          onClick={() => setIsOpen(true)}
          title="Expand AI Guard Panel"
          className="glass-card"
          style={{
            width: '46px',
            height: '180px',
            borderRadius: '1rem',
            background: 'linear-gradient(180deg, #1e1b4b 0%, #4338ca 60%, #d97706 100%)',
            color: '#fff',
            border: '1px solid rgba(217, 119, 6, 0.4)',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            padding: '0.5rem',
            boxShadow: '0 8px 24px rgba(217, 119, 6, 0.25)',
            transition: 'all 0.25s ease'
          }}
        >
          <span style={{ fontSize: '1.1rem' }}>👑</span>
          <span 
            style={{ 
              writingMode: 'vertical-rl', 
              transform: 'rotate(180deg)', 
              fontSize: '0.78rem', 
              fontWeight: 800, 
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#fef3c7'
            }}
          >
            Royal Guard
          </span>
          <ChevronLeft size={16} style={{ color: '#fbbf24' }} />
        </button>
      </div>
    );
  }

  return (
    <aside
      className="glass-card"
      style={{
        width: '360px',
        flexShrink: 0,
        margin: '1rem 1rem 1rem 0',
        height: 'calc(100vh - 2rem)',
        position: 'sticky',
        top: '1rem',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '1.25rem',
        overflow: 'hidden',
        boxSizing: 'border-box',
        border: '1px solid rgba(109, 40, 217, 0.18)',
        boxShadow: '0 12px 36px rgba(109, 40, 217, 0.08)',
        background: '#ffffff'
      }}
    >
      {/* Panel Header */}
      <div
        style={{
          padding: '1.1rem 1.25rem',
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 55%, #92400e 100%)',
          borderBottom: '2px solid rgba(217, 119, 6, 0.4)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(217, 119, 6, 0.2)', border: '1.5px solid rgba(251, 191, 36, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
            👑
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#fff' }}>
              Royal Campus Guard <Sparkles size={13} style={{ color: '#fbbf24' }} />
            </h4>
            <div style={{ fontSize: '0.72rem', color: '#fef3c7', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.15rem' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fbbf24', boxShadow: '0 0 6px #fbbf24' }}></span>
              Imperial Concierge Active
            </div>
          </div>
        </div>

        {/* Collapse Button */}
        <button
          onClick={() => setIsOpen(false)}
          title="Collapse Panel"
          style={{
            background: 'rgba(255, 255, 255, 0.15)',
            border: 'none',
            color: '#ffffff',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Quick Action Pills Row - Wraps cleanly into 2 rows, never clipped */}
      <div
        style={{
          padding: '0.6rem 0.75rem',
          background: 'rgba(248, 250, 252, 0.95)',
          borderBottom: '1px solid rgba(109, 40, 217, 0.08)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.35rem',
          flexShrink: 0
        }}
      >
        {quickPills.map((pill, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(pill.query)}
            style={{
              padding: '0.3rem 0.65rem',
              borderRadius: '9999px',
              border: '1px solid rgba(109, 40, 217, 0.15)',
              background: '#ffffff',
              fontSize: '0.72rem',
              fontWeight: 600,
              color: '#334155',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              transition: 'all 0.15s ease',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary)';
              e.currentTarget.style.color = 'var(--primary)';
              e.currentTarget.style.background = 'rgba(109, 40, 217, 0.04)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(109, 40, 217, 0.15)';
              e.currentTarget.style.color = '#334155';
              e.currentTarget.style.background = '#ffffff';
            }}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area - Proper padding all around */}
      <div
        style={{
          flexGrow: 1,
          overflowY: 'auto',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem',
          background: '#f8fafc',
          boxSizing: 'border-box'
        }}
      >
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const isModerationAlert = msg.text.includes('AI Moderation Alert');

          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isUser ? 'flex-end' : 'flex-start',
                width: '100%'
              }}
            >
              {!isUser && (
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.2rem', paddingLeft: '0.2rem' }}>
                  🤖 {msg.agent}
                </span>
              )}
              <div
                style={{
                  maxWidth: isUser ? '85%' : '94%',
                  padding: '0.8rem 1rem',
                  borderRadius: isUser ? '1rem 1rem 0.25rem 1rem' : '1rem 1rem 1rem 0.25rem',
                  background: isUser
                    ? 'linear-gradient(135deg, #1e1b4b 0%, #4338ca 100%)'
                    : isModerationAlert
                    ? 'rgba(239, 68, 68, 0.08)'
                    : '#ffffff',
                  color: isUser ? '#ffffff' : '#1e293b',
                  border: isUser
                    ? '1px solid rgba(217, 119, 6, 0.35)'
                    : isModerationAlert
                    ? '1px solid rgba(239, 68, 68, 0.3)'
                    : '1px solid rgba(217, 119, 6, 0.18)',
                  boxShadow: isUser ? '0 4px 14px rgba(30, 27, 75, 0.2)' : '0 2px 6px rgba(0, 0, 0, 0.03)',
                  fontSize: '0.84rem',
                  lineHeight: '1.48',
                  wordBreak: 'break-word',
                  boxSizing: 'border-box'
                }}
              >
                {isUser ? (
                  <span>{msg.text}</span>
                ) : (
                  <MarkdownView 
                    content={msg.text} 
                    onActionClick={(action) => handleSendMessage(action)} 
                  />
                )}
              </div>
              <span style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '0.2rem', padding: '0 0.2rem' }}>
                {msg.timestamp}
              </span>
            </div>
          );
        })}

        {/* Subtle typing / reasoning indicator */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.2rem', paddingLeft: '0.2rem' }}>
              🤖 CampusOps AI Guard
            </span>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.65rem 0.95rem',
                borderRadius: '1rem 1rem 1rem 0.25rem',
                background: '#ffffff',
                border: '1px solid rgba(109, 40, 217, 0.12)',
                boxShadow: '0 2px 5px rgba(0, 0, 0, 0.04)'
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)', animation: 'pulse-slow 1.2s infinite' }} />
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--secondary)', animation: 'pulse-slow 1.2s infinite 0.2s' }} />
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)', animation: 'pulse-slow 1.2s infinite 0.4s' }} />
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500, marginLeft: '0.25rem' }}>
                Reasoning across specialist databases...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Footer */}
      <div
        style={{
          padding: '0.75rem 0.9rem',
          background: '#ffffff',
          borderTop: '1px solid rgba(109, 40, 217, 0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          flexShrink: 0
        }}
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Ask AI or submit query..."
          style={{
            flexGrow: 1,
            padding: '0.65rem 0.9rem',
            borderRadius: '9999px',
            border: '1.5px solid rgba(109, 40, 217, 0.15)',
            fontSize: '0.82rem',
            outline: 'none',
            background: 'rgba(248, 250, 252, 0.8)',
            color: '#1e293b',
            transition: 'border-color 0.2s',
            boxSizing: 'border-box'
          }}
          onFocus={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
          onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(109, 40, 217, 0.15)'}
        />
        <button
          onClick={() => handleSendMessage()}
          disabled={isInputEmpty || loading}
          title={isInputEmpty ? 'Type a message to send' : 'Send message'}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: isInputEmpty ? 'rgba(0,0,0,0.1)' : 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
            color: '#ffffff',
            border: isInputEmpty ? 'none' : '1px solid rgba(251, 191, 36, 0.4)',
            cursor: isInputEmpty || loading ? 'not-allowed' : 'pointer',
            opacity: isInputEmpty || loading ? 0.35 : 1,
            pointerEvents: isInputEmpty || loading ? 'none' : 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: isInputEmpty ? 'none' : '0 4px 12px rgba(217, 119, 6, 0.35)',
            transition: 'all 0.2s ease'
          }}
        >
          {loading ? <RefreshCw size={14} className="animate-spin" /> : <Send size={15} />}
        </button>
      </div>
    </aside>
  );
};

export default FloatingAIChatbot;
