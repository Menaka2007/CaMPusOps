import React, { useState, useEffect } from 'react';
import { FileText, Plus, AlertCircle, RefreshCw, Download } from 'lucide-react';

const DocumentsTab = ({ user }) => {
  const [docs, setDocs] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [docType, setDocType] = useState('bonafide');
  const [statusMessage, setStatusMessage] = useState('');

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/direct-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_name: 'Document Request Agent',
          query: 'status',
          roll_no: user.roll_no,
          name: user.name
        })
      });
      const data = await res.json();
      setDocs(data.response);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatusMessage('');

    // Query that triggers backend document request
    const formattedQuery = `I need a ${docType} certificate`;

    try {
      const res = await fetch('http://127.0.0.1:8000/api/direct-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_name: 'Document Request Agent',
          query: formattedQuery,
          roll_no: user.roll_no,
          name: user.name
        })
      });
      const data = await res.json();
      setStatusMessage(data.response);
      fetchDocuments();
    } catch (err) {
      console.error(err);
      setStatusMessage('Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownload = (docName, rollNo, studentName) => {
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
        <div class="title">${docName}</div>
        <div class="content">
          This is to certify that Mr./Ms. <b>${studentName}</b>, Roll No: <b>${rollNo}</b>, 
          is a bonafide student of this institution studying in the institution during this academic cycle.
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
    link.download = `${docName.replace(/\s+/g, '_')}_${rollNo}.html`;
    link.click();
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText /> Document Request Hub
        </h3>
        <button 
          onClick={fetchDocuments} 
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.4rem 0.8rem', background: 'rgba(109, 40, 217, 0.08)', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Request Document Form */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h4 style={{ margin: '0 0 1rem 0', fontWeight: 600 }}>Apply for a Document</h4>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: '#475569' }}>Select Document Type</label>
              <select 
                value={docType} 
                onChange={(e) => setDocType(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(109, 40, 217, 0.2)', outline: 'none', fontSize: '0.9rem' }}
              >
                <option value="bonafide">Bonafide Certificate</option>
                <option value="study">Study Certificate</option>
                <option value="transfer">Transfer Certificate</option>
                <option value="conduct">Conduct Certificate</option>
                <option value="hall ticket">Hall Ticket</option>
                <option value="no due">No Due Certificate</option>
                <option value="degree">Degree Certificate</option>
                <option value="id card">Replacement ID Card</option>
              </select>
            </div>
            <button 
              type="submit" 
              disabled={submitting}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              {submitting ? <RefreshCw size={16} className="animate-spin" /> : <Plus size={16} />}
              Submit Request
            </button>
          </form>

          {statusMessage && (
            <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: '0.5rem', background: 'rgba(5, 150, 105, 0.08)', border: '1px solid rgba(5, 150, 105, 0.2)', fontSize: '0.9rem', color: '#065f46', whiteSpace: 'pre-line' }}>
              {statusMessage}
            </div>
          )}
        </div>

        {/* Requests Status History */}
        <div className="glass-card" style={{ padding: '1.5rem', maxHeight: '450px', overflowY: 'auto' }}>
          <h4 style={{ margin: '0 0 1rem 0', fontWeight: 600 }}>Active Requests Status</h4>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
              <RefreshCw className="animate-spin" style={{ color: 'var(--primary)' }} />
            </div>
          ) : docs ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {docs.split('\n').map((line, i) => {
                if (line.startsWith('### ')) return null;
                if (line.startsWith('- ')) {
                  const cleaned = line.replace('- ', '');
                  const isApproved = cleaned.includes('Approved') || cleaned.includes('Ready');
                  const isPending = cleaned.includes('Pending');
                  const statusBg = isApproved ? 'rgba(5, 150, 105, 0.1)' : isPending ? 'rgba(217, 119, 6, 0.1)' : 'rgba(109, 40, 217, 0.1)';
                  const statusColor = isApproved ? '#059669' : isPending ? '#d97706' : 'var(--primary)';

                  return (
                    <div key={i} style={{ padding: '0.85rem', borderRadius: '0.5rem', border: '1px solid rgba(0,0,0,0.05)', background: '#fff' }}>
                      <div style={{ fontSize: '0.875rem', color: '#1e1b4b', marginBottom: '0.5rem', fontWeight: 500 }}>
                        {cleaned.split(':')[0]}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '9999px', background: statusBg, color: statusColor, fontWeight: 600 }}>
                          {cleaned.split('Status:')[1]?.split('(')[0]?.trim() || 'Submitted'}
                        </span>
                        {isApproved ? (
                          <button 
                            onClick={() => handleDownload(cleaned.split(':')[0]?.replace(/\*\*/g, '')?.replace(/#\d+\s+/g, '')?.trim() || 'Certificate', user.roll_no, user.name)}
                            style={{ 
                              padding: '0.3rem 0.6rem', 
                              background: '#10b981', 
                              color: '#fff', 
                              border: 'none', 
                              borderRadius: '0.375rem', 
                              fontSize: '0.75rem', 
                              cursor: 'pointer', 
                              fontWeight: 600,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem' 
                            }}
                          >
                            <Download size={12} /> Download
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {cleaned.split('Requested:')[1]?.replace(')', '')?.trim() || ''}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                }
                return <p key={i} style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>{line}</p>;
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
              <AlertCircle style={{ display: 'block', margin: '0 auto 0.5rem', opacity: 0.5 }} />
              No active document requests.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentsTab;
