'use client';

import { useEffect, useRef, useCallback } from 'react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  onCursorChange?: () => void;
  placeholder?: string;
}

export default function SyntaxHighlightedEditor({ value, onChange, onCursorChange, placeholder }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    updateHighlight();
  };

  const handleScroll = () => {
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  const updateHighlight = useCallback(() => {
    if (!highlightRef.current) return;

    const highlightedText = value
      // Headers
      .replace(/^(#{1,6})\s(.+)$/gm, '<span class="syntax-header">$1</span> <span class="syntax-header-text">$2</span>')
      // Bold
      .replace(/\*\*([^*]+)\*\*/g, '<span class="syntax-markup">**</span><span class="syntax-bold">$1</span><span class="syntax-markup">**</span>')
      // Italic  
      .replace(/\*([^*]+)\*/g, '<span class="syntax-markup">*</span><span class="syntax-italic">$1</span><span class="syntax-markup">*</span>')
      // Inline code
      .replace(/`([^`]+)`/g, '<span class="syntax-markup">`</span><span class="syntax-code">$1</span><span class="syntax-markup">`</span>')
      // Code blocks
      .replace(/^```(\w+)?$/gm, '<span class="syntax-code-fence">```$1</span>')
      .replace(/^```$/gm, '<span class="syntax-code-fence">```</span>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<span class="syntax-markup">[</span><span class="syntax-link-text">$1</span><span class="syntax-markup">](</span><span class="syntax-url">$2</span><span class="syntax-markup">)</span>')
      // Lists
      .replace(/^(\s*)[-*+]\s/gm, '$1<span class="syntax-list-marker">- </span>')
      .replace(/^(\s*)(\d+)\.\s/gm, '$1<span class="syntax-list-marker">$2. </span>')
      // Quotes
      .replace(/^>\s(.+)$/gm, '<span class="syntax-quote-marker">&gt; </span><span class="syntax-quote">$1</span>')
      // Horizontal rules
      .replace(/^---$/gm, '<span class="syntax-hr">---</span>')
      // Comments/annotations
      .replace(/^#\s(.+)$/gm, '<span class="syntax-comment"># $1</span>');

    highlightRef.current.innerHTML = highlightedText + '\n';
  }, [value]);

  useEffect(() => {
    updateHighlight();
  }, [value, updateHighlight]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.addEventListener('scroll', handleScroll);
      return () => {
        textareaRef.current?.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);

  return (
    <div ref={containerRef} className="syntax-editor-container">
      <pre 
        ref={highlightRef}
        className="syntax-highlight-layer"
        aria-hidden="true"
      />
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onSelect={onCursorChange}
        onKeyUp={onCursorChange}
        onClick={onCursorChange}
        placeholder={placeholder}
        spellCheck="false"
        className="syntax-textarea"
      />
      
      <style jsx>{`
        .syntax-editor-container {
          position: relative;
          flex: 1;
        }

        .syntax-highlight-layer {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          margin: 0;
          padding: 16px;
          font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Fira Code', monospace;
          font-size: 13px;
          line-height: 22px;
          color: transparent;
          white-space: pre;
          word-wrap: normal;
          overflow-wrap: normal;
          tab-size: 4;
          pointer-events: none;
          z-index: 1;
          border: none;
          outline: none;
          background: transparent;
          overflow: hidden;
        }

        .syntax-textarea {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          margin: 0;
          padding: 16px;
          font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Fira Code', monospace;
          font-size: 13px;
          line-height: 22px;
          background: transparent;
          color: transparent;
          caret-color: #ffffff;
          border: none;
          outline: none;
          resize: none;
          white-space: pre;
          word-wrap: normal;
          overflow-wrap: normal;
          tab-size: 4;
          z-index: 2;
        }

        .syntax-textarea::selection {
          background: rgba(255, 255, 255, 0.2);
        }

        /* HackMD Syntax Highlighting Colors */
        :global(.syntax-header) {
          color: #4dabf7 !important;
          font-weight: bold;
        }

        :global(.syntax-header-text) {
          color: #ffd43b !important;
          font-weight: bold;
        }

        :global(.syntax-markup) {
          color: #69db7c !important;
        }

        :global(.syntax-bold) {
          color: #ffd43b !important;
          font-weight: bold;
        }

        :global(.syntax-italic) {
          color: #ffd43b !important;
          font-style: italic;
        }

        :global(.syntax-code) {
          color: #ff8cc8 !important;
          background: rgba(255, 140, 200, 0.1);
        }

        :global(.syntax-code-fence) {
          color: #69db7c !important;
        }

        :global(.syntax-link-text) {
          color: #74c0fc !important;
        }

        :global(.syntax-url) {
          color: #69db7c !important;
        }

        :global(.syntax-list-marker) {
          color: #4dabf7 !important;
        }

        :global(.syntax-quote-marker) {
          color: #69db7c !important;
        }

        :global(.syntax-quote) {
          color: #ced4da !important;
          font-style: italic;
        }

        :global(.syntax-hr) {
          color: #69db7c !important;
        }

        :global(.syntax-comment) {
          color: #868e96 !important;
          font-style: italic;
        }
      `}</style>
    </div>
  );
}