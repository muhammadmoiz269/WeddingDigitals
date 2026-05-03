'use client';

import { useEffect, useRef, useCallback } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  maxLength?: number;
  minRows?: number;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ');
}

const ICONS = {
  bold: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 4h8a4 4 0 0 1 0 8H6V4zm0 8h9a4 4 0 0 1 0 8H6v-8z"/>
    </svg>
  ),
  italic: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11 4h2l-4 16h-2l4-16z"/>
    </svg>
  ),
  underline: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 3v9a4 4 0 0 0 8 0V3h2v9a6 6 0 0 1-12 0V3h2zM4 20h16v2H4v-2z"/>
    </svg>
  ),
  bulletList: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm0 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm0 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2zM8 5h12v2H8V5zm0 6h12v2H8v-2zm0 6h12v2H8v-2z"/>
    </svg>
  ),
  orderedList: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M5 6.5h1V4H4.5v.5H5v2zm0 6h1v.5H4.5V13H6v1H4v-.5h1.5V13H4v-1h1.5v-.5H4V11h2v1H5v.5zm-1 5v.5h2v.5H4v1.5h2V21H4v.5h3v-4H4zM8 5h12v2H8V5zm0 6h12v2H8v-2zm0 6h12v2H8v-2z"/>
    </svg>
  ),
  clearFormat: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 5v.18L8.82 8h2.4l-.72 1.68 2.1 2.1L14.21 8H20V5H6zm8.06 9.06L12.5 15.62 10.94 14.06 3.27 21.73l1.41 1.41 4.09-4.09 1.56 1.56 8.67-8.67-4.94-3.88z"/>
    </svg>
  ),
};

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write something…',
  maxLength = 5000,
  minRows = 4,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isComposing = useRef(false);

  useEffect(() => {
    const el = editorRef.current;
    if (!el || el.innerHTML === value) return;
    el.innerHTML = value;
  }, [value]);

  const execCmd = useCallback((cmd: string) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false);
    onChange(editorRef.current?.innerHTML ?? '');
  }, [onChange]);

  const handleInput = useCallback(() => {
    if (isComposing.current) return;
    const el = editorRef.current;
    if (!el) return;
    const html = el.innerHTML;
    if (stripHtml(html).length > maxLength) { el.innerHTML = value; return; }
    onChange(html);
  }, [onChange, maxLength, value]);

  const plainLen = stripHtml(value).length;
  const isWarn  = plainLen / maxLength > 0.9;
  const isLimit = plainLen >= maxLength;

  const tools = [
    { cmd: 'bold',                icon: ICONS.bold,        title: 'Bold (Ctrl+B)' },
    { cmd: 'italic',              icon: ICONS.italic,      title: 'Italic (Ctrl+I)' },
    { cmd: 'underline',           icon: ICONS.underline,   title: 'Underline (Ctrl+U)' },
    { cmd: 'insertUnorderedList', icon: ICONS.bulletList,  title: 'Bullet list' },
    { cmd: 'insertOrderedList',   icon: ICONS.orderedList, title: 'Numbered list' },
  ];

  return (
    <div className="rte-wrap">
      {/* Toolbar */}
      <div className="rte-toolbar">
        {tools.map(({ cmd, icon, title }) => (
          <button
            key={cmd}
            type="button"
            title={title}
            className="rte-btn"
            onMouseDown={(e) => { e.preventDefault(); execCmd(cmd); }}
          >
            {icon}
          </button>
        ))}
        <span className="rte-sep" />
        <button
          type="button"
          title="Clear formatting"
          className="rte-btn"
          onMouseDown={(e) => { e.preventDefault(); execCmd('removeFormat'); }}
        >
          {ICONS.clearFormat}
        </button>
      </div>

      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        className={`rte-body${isLimit ? ' rte-body--limit' : ''}`}
        style={{ minHeight: `${minRows * 1.65}rem` }}
        data-placeholder={placeholder}
        onInput={handleInput}
        onCompositionStart={() => { isComposing.current = true; }}
        onCompositionEnd={() => { isComposing.current = false; handleInput(); }}
        onPaste={(e) => {
          e.preventDefault();
          document.execCommand('insertText', false, e.clipboardData.getData('text/plain'));
        }}
      />

      {/* Footer */}
      <div className="rte-footer">
        <span className={`rte-count${isWarn ? ' rte-count--warn' : ''}${isLimit ? ' rte-count--error' : ''}`}>
          {plainLen.toLocaleString()} / {maxLength.toLocaleString()} chars
        </span>
      </div>

      <style>{`
        /* ── Wrapper — matches admin dark theme ── */
        .rte-wrap {
          background: #1C1916;
          border: 1px solid rgba(201,169,110,0.15);
          border-radius: 8px;
          overflow: hidden;
          transition: border-color .2s, box-shadow .2s;
          font-family: inherit;
        }
        .rte-wrap:focus-within {
          border-color: rgba(201,169,110,0.5);
          box-shadow: 0 0 0 3px rgba(201,169,110,0.08);
        }

        /* ── Toolbar ── */
        .rte-toolbar {
          display: flex;
          align-items: center;
          gap: 2px;
          padding: 5px 8px;
          background: #151210;
          border-bottom: 1px solid rgba(201,169,110,0.1);
        }
        .rte-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border: 1px solid transparent;
          border-radius: 5px;
          background: transparent;
          color: #a09080;
          cursor: pointer;
          transition: background .14s, color .14s, border-color .14s;
          flex-shrink: 0;
        }
        .rte-btn:hover {
          background: rgba(201,169,110,0.12);
          color: #C9A96E;
          border-color: rgba(201,169,110,0.2);
        }
        .rte-btn:active {
          background: rgba(201,169,110,0.22);
        }
        .rte-sep {
          display: inline-block;
          width: 1px;
          height: 18px;
          background: rgba(201,169,110,0.15);
          margin: 0 4px;
          flex-shrink: 0;
        }

        /* ── Editable body ── */
        .rte-body {
          padding: 10px 12px;
          font-size: .875rem;
          line-height: 1.65;
          color: #EDE5D8;
          outline: none;
          overflow-y: auto;
          caret-color: #C9A96E;
        }
        .rte-body:empty::before {
          content: attr(data-placeholder);
          color: #3a2a1a;
          pointer-events: none;
        }
        .rte-body--limit { background: #1f1010; }
        .rte-body strong { font-weight: 700; color: #EDE5D8; }
        .rte-body em     { font-style: italic; }
        .rte-body u      { text-decoration: underline; }
        .rte-body ul     { list-style: disc;    padding-left: 1.3rem; margin: .3rem 0; }
        .rte-body ol     { list-style: decimal; padding-left: 1.3rem; margin: .3rem 0; }
        .rte-body li     { margin-bottom: .15rem; }

        /* ── Footer ── */
        .rte-footer {
          display: flex;
          justify-content: flex-end;
          padding: 3px 10px;
          background: #151210;
          border-top: 1px solid rgba(201,169,110,0.08);
        }
        .rte-count        { font-size: .7rem; color: #5a4a3a; }
        .rte-count--warn  { color: #b45309; }
        .rte-count--error { color: #dc2626; font-weight: 600; }
      `}</style>
    </div>
  );
}
