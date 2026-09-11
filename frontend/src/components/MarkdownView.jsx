import React from 'react';
import { Sparkles } from 'lucide-react';

/**
 * Reusable Markdown parser for chat bubbles, agent confirmations, fee responses, and activity feed items.
 * Parses headings, bold, inline code, lists, blockquotes, action chips, and markdown tables.
 */
const parseInline = (text) => {
  if (!text) return null;
  
  // Split on bold (**text**) and code (`code`)
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      const inner = part.slice(2, -2);
      return <strong key={index} style={{ fontWeight: 700, color: '#0f172a' }}>{inner}</strong>;
    } else if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      const inner = part.slice(1, -1);
      return (
        <code 
          key={index} 
          style={{ 
            background: 'rgba(109, 40, 217, 0.08)', 
            color: 'var(--primary)', 
            padding: '0.1rem 0.35rem', 
            borderRadius: '0.25rem', 
            fontSize: '0.82em', 
            fontFamily: 'monospace',
            fontWeight: 600
          }}
        >
          {inner}
        </code>
      );
    }
    return part;
  });
};

const MarkdownView = ({ content = '', onActionClick = null, className = '', style = {} }) => {
  if (!content) return null;

  const lines = content.toString().split('\n');
  const elements = [];
  let currentList = [];
  let currentTable = [];

  const flushList = (key) => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`ul-${key}`} style={{ margin: '0.4rem 0', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {currentList.map((item, idx) => (
            <li key={idx} style={{ fontSize: '0.86rem', color: '#334155', lineHeight: '1.5' }}>
              {parseInline(item)}
            </li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  const flushTable = (key) => {
    if (currentTable.length > 0) {
      const headerRow = currentTable[0];
      const bodyRows = currentTable.slice(1);

      elements.push(
        <div key={`tbl-${key}`} style={{ overflowX: 'auto', margin: '0.6rem 0', borderRadius: '0.5rem', border: '1px solid rgba(109, 40, 217, 0.12)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
            {headerRow && (
              <thead>
                <tr style={{ background: 'rgba(109, 40, 217, 0.05)', borderBottom: '1.5px solid rgba(109, 40, 217, 0.15)' }}>
                  {headerRow.map((col, ci) => (
                    <th key={ci} style={{ padding: '0.5rem 0.75rem', fontWeight: 700, color: 'var(--primary)' }}>
                      {parseInline(col)}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {bodyRows.map((row, ri) => (
                <tr key={ri} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)', background: ri % 2 === 0 ? '#fff' : 'rgba(248, 250, 252, 0.6)' }}>
                  {row.map((cell, ci) => (
                    <td key={ci} style={{ padding: '0.45rem 0.75rem', color: '#334155' }}>
                      {parseInline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      currentTable = [];
    }
  };

  lines.forEach((line, i) => {
    const trimmed = line.trim();

    // Table divider line (|:---|:---| or |--|--)
    if (trimmed.startsWith('|') && trimmed.includes('---')) {
      return; // Skip table header divider
    }

    // Table rows
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      flushList(i);
      const cells = trimmed
        .split('|')
        .slice(1, -1)
        .map(c => c.trim());
      currentTable.push(cells);
      return;
    } else {
      flushTable(i);
    }

    // Action Chips: [Action: Label]
    if (trimmed.includes('[Action:')) {
      flushList(i);
      const actionMatch = trimmed.match(/\[Action:\s*(.*?)\]/);
      const actionLabel = actionMatch ? actionMatch[1] : trimmed.replace(/^[-•]\s*/, '');
      elements.push(
        <button
          key={`act-${i}`}
          onClick={() => onActionClick && onActionClick(actionLabel)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.35rem 0.75rem',
            borderRadius: '9999px',
            background: 'linear-gradient(135deg, rgba(109, 40, 217, 0.12), rgba(79, 70, 229, 0.12))',
            border: '1.5px solid rgba(109, 40, 217, 0.25)',
            color: 'var(--primary)',
            fontWeight: 700,
            fontSize: '0.78rem',
            cursor: 'pointer',
            margin: '0.25rem 0.3rem 0.25rem 0',
            transition: 'all 0.15s ease',
            boxShadow: '0 2px 4px rgba(109, 40, 217, 0.06)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(109, 40, 217, 0.2), rgba(79, 70, 229, 0.2))';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(109, 40, 217, 0.12), rgba(79, 70, 229, 0.12))';
          }}
        >
          <Sparkles size={12} style={{ color: 'var(--primary)' }} />
          <span>{actionLabel}</span>
        </button>
      );
      return;
    }

    // List items
    if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
      const itemText = trimmed.replace(/^[-•]\s*/, '');
      currentList.push(itemText);
      return;
    }

    flushList(i);

    if (!trimmed) {
      return;
    }

    // Headings
    if (trimmed.startsWith('### ')) {
      elements.push(
        <div 
          key={i} 
          style={{ 
            fontSize: '1rem', 
            fontWeight: 700, 
            color: 'var(--primary)', 
            margin: '0.6rem 0 0.3rem 0', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.35rem' 
          }}
        >
          {parseInline(trimmed.replace('### ', ''))}
        </div>
      );
    } else if (trimmed.startsWith('#### ')) {
      elements.push(
        <div 
          key={i} 
          style={{ 
            fontSize: '0.9rem', 
            fontWeight: 700, 
            color: 'var(--secondary)', 
            margin: '0.5rem 0 0.2rem 0' 
          }}
        >
          {parseInline(trimmed.replace('#### ', ''))}
        </div>
      );
    } else if (trimmed === '---') {
      elements.push(
        <hr key={i} style={{ border: 'none', borderTop: '1px solid rgba(109, 40, 217, 0.12)', margin: '0.6rem 0' }} />
      );
    } else if (trimmed.startsWith('> ')) {
      elements.push(
        <blockquote 
          key={i} 
          style={{ 
            margin: '0.4rem 0', 
            padding: '0.45rem 0.85rem', 
            background: 'rgba(109, 40, 217, 0.05)', 
            borderLeft: '3px solid var(--primary)', 
            borderRadius: '0.35rem', 
            fontSize: '0.84rem', 
            color: '#475569', 
            fontStyle: 'italic' 
          }}
        >
          {parseInline(trimmed.replace('> ', ''))}
        </blockquote>
      );
    } else {
      elements.push(
        <p key={i} style={{ margin: '0.35rem 0', fontSize: '0.86rem', color: '#1e293b', lineHeight: '1.5' }}>
          {parseInline(trimmed)}
        </p>
      );
    }
  });

  flushList('end');
  flushTable('end');

  return (
    <div className={className} style={{ width: '100%', wordBreak: 'break-word', ...style }}>
      {elements}
    </div>
  );
};

export default MarkdownView;
