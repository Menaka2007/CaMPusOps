import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, AlertCircle, PlayCircle, ShieldCheck, ShieldAlert } from 'lucide-react';

/**
 * Standardized semantic status badge across Student, Staff, and Admin portals.
 * - Blue: In Progress / Submitted / Active
 * - Green: Approved / Paid / Safe / Resolved / Genuine
 * - Amber: Pending / Warning / In Review / Due Soon
 * - Red: Overdue / Rejected / Critical / Filtered / Absent / Cancelled
 * - Gray: Closed / Default
 */
const StatusBadge = ({ status = '', size = 'sm', showIcon = true, className = '', style = {} }) => {
  const s = (status || '').toString().toLowerCase().trim();

  // Normalize color scheme
  let color = '#2563eb'; // Blue default (in progress / submitted)
  let bg = 'rgba(37, 99, 235, 0.1)';
  let border = 'rgba(37, 99, 235, 0.25)';
  let Icon = PlayCircle;
  let label = status;

  if (
    s.includes('paid') || 
    s.includes('approved') || 
    s.includes('resolved') || 
    s.includes('safe') || 
    s.includes('eligible') || 
    s.includes('genuine') || 
    s.includes('confirmed') ||
    s.includes('active') && !s.includes('in progress')
  ) {
    color = '#059669'; // Green
    bg = 'rgba(5, 150, 105, 0.1)';
    border = 'rgba(5, 150, 105, 0.25)';
    Icon = CheckCircle2;
  } else if (
    s.includes('pending') || 
    s.includes('warning') || 
    s.includes('in review') || 
    s.includes('due') || 
    s.includes('partial')
  ) {
    color = '#d97706'; // Amber
    bg = 'rgba(217, 119, 6, 0.1)';
    border = 'rgba(217, 119, 6, 0.25)';
    Icon = Clock;
  } else if (
    s.includes('overdue') || 
    s.includes('rejected') || 
    s.includes('critical') || 
    s.includes('failed') || 
    s.includes('absent') || 
    s.includes('cancelled') || 
    s.includes('filtered') ||
    s.includes('spam') ||
    s.includes('flagged')
  ) {
    color = '#dc2626'; // Red
    bg = 'rgba(220, 38, 38, 0.1)';
    border = 'rgba(220, 38, 38, 0.25)';
    Icon = AlertTriangle;
  } else if (
    s.includes('in progress') || 
    s.includes('submitted') || 
    s.includes('processing') || 
    s.includes('under review')
  ) {
    color = '#2563eb'; // Blue
    bg = 'rgba(37, 99, 235, 0.1)';
    border = 'rgba(37, 99, 235, 0.25)';
    Icon = PlayCircle;
  }

  // Clean label of any residual emojis or markdown asterisks
  const cleanLabel = (label || '')
    .replace(/[✅❌⏳⚙️⚠️🛠️•]/g, '')
    .replace(/\*\*/g, '')
    .trim();

  const isSmall = size === 'sm';

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: isSmall ? '0.3rem' : '0.45rem',
        padding: isSmall ? '0.2rem 0.55rem' : '0.35rem 0.8rem',
        borderRadius: '9999px',
        fontSize: isSmall ? '0.75rem' : '0.82rem',
        fontWeight: 600,
        letterSpacing: '0.01em',
        color: color,
        background: bg,
        border: `1px solid ${border}`,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        transition: 'all 0.15s ease',
        ...style
      }}
    >
      {showIcon && <Icon size={isSmall ? 12 : 14} style={{ flexShrink: 0 }} />}
      <span>{cleanLabel || status}</span>
    </span>
  );
};

export default StatusBadge;
