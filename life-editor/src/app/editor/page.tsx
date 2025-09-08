'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Bold, Italic, Underline, Strikethrough, Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Code, Link2, Image, Table, Minus, CheckSquare,
  Home, Upload, Download, Eye, EyeOff, Settings, Share2, MoreHorizontal,
  Search, ChevronDown, User, Save, Clock, Edit3, FileText, PenTool,
  Undo, Redo, AlignLeft, AlignCenter, AlignRight, Type, Hash, Loader2
} from 'lucide-react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import dynamic from 'next/dynamic';
import { GitHubService } from '@/lib/github';
import { BlogPost } from '@/types';
import MermaidDiagram from '@/components/MermaidDiagram';
import SyntaxHighlightedEditor from '@/components/SyntaxHighlightedEditor';

const templates = {
  plain: '', // Empty plain format
  til: `# What I Learned Today

Brief description of your discovery or learning...

## Example

\`\`\`javascript
// Add a code example if relevant
const example = "Your code here";
\`\`\`

**Key Takeaway:** What's the main insight?

**Date:** ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
**Tags:** #learning #technology`,
  
  journal: `# ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} - Daily Reflection

## 🎯 Today's Goals
- [ ] What did I want to accomplish today?
- [ ] Any specific targets or milestones?
- [ ] Personal or work objectives?

## 💭 Thoughts & Reflections
How am I feeling today? What's on my mind?

## 🚀 What I Accomplished  
- What did I actually get done today?
- Any wins, big or small?
- Progress on ongoing projects?

## 📚 What I Learned
- New insights or knowledge gained
- Skills practiced or improved
- Interesting discoveries

## 🔮 Tomorrow's Focus
- What are my priorities for tomorrow?
- Any preparation needed?

## 🙏 Gratitude
What am I thankful for today?

---
**Mood:** How are you feeling?
**Weather:** What's it like outside?
**Tags:** #journal #daily #reflection`,
  
  blog: `# Your Blog Post Title

*Published: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} | Estimated read time: 5 min*

## Introduction

Start with a compelling hook. What problem are you solving or what insight are you sharing?

## Main Content

### Section 1
Explain your main points here...

### Section 2  
Add more details, examples, or explanations...

### Code Example (if applicable)

\`\`\`javascript
// Provide practical examples
const example = {
  concept: "Show don't just tell",
  implementation: "Working code examples"
};
\`\`\`

## Key Takeaways

1. **Main Point 1:** What's the key insight?
2. **Main Point 2:** What should readers remember?
3. **Main Point 3:** What's the actionable advice?

## Conclusion

Wrap up your thoughts and provide next steps or further reading.

---
**Tags:** #blog #tutorial #development`,
  
  '100days': `# Day [X] - [Topic/Project Name]

**Date:** ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

## Today's Progress
✅ Achievement 1
✅ Achievement 2
✅ Achievement 3

## Thoughts
[Reflection on the day's work]

## What I Learned
- Learning point 1
- Learning point 2

## Code Snippets
\`\`\`javascript
// Your code
\`\`\`

## Link to Work
- [Link 1](url)
- [Link 2](url)

## Tomorrow's Plan
- Task 1
- Task 2

---

**Time Spent:** [X] hours
**Total Time:** [X] hours

#100DaysOfCode #Day[X] #[Topic]`,
  
  learning: `# [Course/Topic Name] Learning Journey

## Overview
**Started:** ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
**Goal:** [Your goal]
**Timeline:** [Expected duration]

## Learning Path

### Phase 1: [Phase Name] (Week X-Y)
- [ ] Topic 1
- [ ] Topic 2
- [ ] Topic 3

## Resources

### Courses
- [ ] **Course Name** - Platform

### Books
- [ ] "Book Title" by Author

## Current Focus
🎯 **This Week:** [Current topic]

## Notes & Key Concepts

### [Concept Name]
\`\`\`javascript
// Code example
\`\`\`
**Key Insight:** [Your understanding]

## Reflections

**Week X:** [Your reflection]

---

*Last Updated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}*`
};

export default function EditorPage() {
  const [content, setContent] = useState('');
  const [showPreview, setShowPreview] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [filename, setFilename] = useState('');
  const [postType, setPostType] = useState<BlogPost['type']>('plain');
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  const [showTemplates, setShowTemplates] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const githubService = useRef(new GitHubService());

  useEffect(() => {
    const savedContent = localStorage.getItem('hackmd-content');
    if (savedContent) {
      setContent(savedContent);
    }
    // Start with blank content by default (Plain format)
  }, []);

  const generateFilename = useCallback(() => {
    const date = new Date().toISOString().split('T')[0];
    const cleanTitle = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    
    let path = '';
    switch (postType) {
      case 'plain':
        path = `notes/${cleanTitle || 'untitled'}.md`;
        break;
      case 'til':
        path = `til/${category || 'general'}/${cleanTitle || 'new-entry'}.md`;
        break;
      case 'journal':
        path = `daily-journal/${date.substring(0, 4)}/${date.substring(5, 7)}/${date.substring(8)}-${cleanTitle || 'entry'}.md`;
        break;
      case 'blog':
        path = `dev-blog/${date}-${cleanTitle || 'post'}.md`;
        break;
      case '100days':
        const dayNum = prompt('Enter day number (e.g., 002):') || '001';
        path = `100-days-of-code/day-${dayNum.padStart(3, '0')}.md`;
        break;
      case 'learning':
        path = `learning-log/${cleanTitle || 'topic'}.md`;
        break;
    }
    
    setFilename(path);
  }, [postType, category, title]);

  useEffect(() => {
    generateFilename();
  }, [generateFilename]);

  const updateCursorPosition = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const position = textarea.selectionStart;
    const textBeforeCursor = content.substring(0, position);
    const lines = textBeforeCursor.split('\n');
    const line = lines.length;
    const column = lines[lines.length - 1].length + 1;
    
    setCursorPosition({ line, column });
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    localStorage.setItem('hackmd-content', newContent);
    updateCursorPosition();
  };

  const handleCursorMove = () => {
    updateCursorPosition();
  };

  const saveToGitHub = async () => {
    if (!content || !filename) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
      return;
    }

    setSaving(true);
    setSaveStatus('saving');

    try {
      const existingFile = await githubService.current.getFile(filename);
      const message = `${existingFile ? 'Update' : 'Add'} ${filename.split('/').pop()}`;
      
      const result = await githubService.current.createOrUpdateFile(
        filename,
        content,
        message,
        existingFile?.sha
      );

      if (result.success) {
        setSaveStatus('saved');
        if (window.confirm('Post saved to GitHub! Clear editor for new post?')) {
          setContent('');
          setTitle('');
          setCategory('');
          localStorage.removeItem('hackmd-content');
        }
      } else {
        setSaveStatus('error');
        alert('Error saving to GitHub: ' + result.error);
      }
    } catch (error) {
      setSaveStatus('error');
      alert('Failed to save to GitHub: ' + (error as Error).message);
    }

    setSaving(false);
    setTimeout(() => setSaveStatus('idle'), 3000);
  };

  const insertMarkdown = (before: string, after: string = before, placeholder?: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const replacement = before + (selectedText || placeholder || 'text') + after;
    
    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);
    localStorage.setItem('hackmd-content', newContent);
    
    setTimeout(() => {
      textarea.focus();
      const newPos = start + before.length;
      textarea.setSelectionRange(newPos, newPos + (selectedText || placeholder || 'text').length);
      updateCursorPosition();
    }, 0);
  };

  const insertAtCursor = (text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const newContent = content.substring(0, start) + text + content.substring(start);
    setContent(newContent);
    localStorage.setItem('hackmd-content', newContent);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + text.length, start + text.length);
      updateCursorPosition();
    }, 0);
  };

  const loadTemplate = (type: BlogPost['type']) => {
    setContent(templates[type]);
    setPostType(type);
    setShowTemplates(false);
    localStorage.setItem('hackmd-content', templates[type]);
  };

  // Auto-load template when dropdown changes
  const handleTypeChange = (newType: BlogPost['type']) => {
    if (newType !== postType) {
      // Only load template if it's not Plain format
      if (newType !== 'plain') {
        if (!content.trim()) {
          setContent(templates[newType]);
          localStorage.setItem('hackmd-content', templates[newType]);
        } else {
          const shouldLoadTemplate = window.confirm(
            `Switch to ${newType.toUpperCase()} template? This will replace your current content.`
          );
          if (shouldLoadTemplate) {
            setContent(templates[newType]);
            localStorage.setItem('hackmd-content', templates[newType]);
          }
        }
      } else {
        // Plain format - clear content or ask to clear
        if (content.trim() && !content.includes('# What I Learned') && !content.includes('Daily Reflection')) {
          // Don't clear if it's custom content
        } else {
          setContent('');
          localStorage.setItem('hackmd-content', '');
        }
      }
    }
    setPostType(newType);
  };

  const downloadFile = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.split('/').pop() || 'document.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  const charCount = content.length;
  const lineCount = content.split('\n').length;
  const spaceCount = (content.match(/ /g) || []).length;

  return (
    <>
      <div className="hackmd-container">
        {/* HackMD Header - Exact replica */}
        <div className="hackmd-header">
          <div className="hackmd-header-left">
            <div className="workspace-info">
              <div className="workspace-avatar">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z"/>
                </svg>
              </div>
              <span className="workspace-name">My workspace</span>
              <div className="workspace-icons">
                <button title="Edit workspace"><Edit3 size={14} /></button>
                <button title="Workspace settings"><Settings size={14} /></button>
                <button title="View workspace"><Eye size={14} /></button>
                <button title="Add new document">+</button>
              </div>
            </div>
          </div>
          
          <div className="hackmd-header-center">
            <div className="document-info">
              <span className="document-icon">🔒</span>
              <span className="document-path">My workspace / {title || 'Untitled'}</span>
              <button title="Document info">ℹ️</button>
              <button title="Document options"><MoreHorizontal size={14} /></button>
            </div>
          </div>
          
          <div className="hackmd-header-right">
            <div className="header-actions">
              <span className="view-count">👁 1</span>
              <ChevronDown size={14} />
              <div className="user-avatar">A</div>
              <button className="share-button">
                <Share2 size={14} />
                Share
              </button>
              <button title="More options"><MoreHorizontal size={14} /></button>
            </div>
          </div>
        </div>

        {/* Templates Dropdown */}
        <div className="template-bar">
          <select 
            value={postType}
            onChange={(e) => handleTypeChange(e.target.value as BlogPost['type'])}
            className="template-select"
          >
            <option value="plain">📄 Plain</option>
            <option value="til">💡 TIL</option>
            <option value="journal">📔 Journal</option>
            <option value="blog">📝 Blog</option>
            <option value="100days">💪 100 Days</option>
            <option value="learning">📚 Learning</option>
          </select>
          
          <button 
            onClick={() => setShowTemplates(!showTemplates)}
            className="template-btn"
          >
            📝 Templates
          </button>
          
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Category"
            className="category-input"
          />
          
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="title-input"
          />
          
          <button 
            onClick={() => {
              if (window.confirm('Clear editor and start fresh?')) {
                setContent('');
                setTitle('');
                setCategory('');
                localStorage.removeItem('hackmd-content');
              }
            }}
            className="clear-btn"
          >
            🗑️ Clear
          </button>
        </div>

        {/* Template Buttons */}
        {showTemplates && (
          <div className="template-popup">
            {Object.entries(templates).map(([type, _]) => (
              <button
                key={type}
                onClick={() => loadTemplate(type as BlogPost['type'])}
                className="template-option"
              >
                {type === 'plain' && '📄 Plain Template'}
                {type === 'til' && '💡 TIL Template'}
                {type === 'journal' && '📔 Journal Template'}
                {type === 'blog' && '📝 Blog Template'}
                {type === '100days' && '💪 100 Days Template'}
                {type === 'learning' && '📚 Learning Template'}
              </button>
            ))}
          </div>
        )}

        {/* HackMD Toolbar - Exact replica */}
        <div className="hackmd-toolbar">
          <div className="toolbar-section">
            <button title="Undo"><Undo size={16} /></button>
            <button title="Redo"><Redo size={16} /></button>
          </div>

          <div className="toolbar-section">
            <button onClick={() => insertMarkdown('**')} title="Bold" className="toolbar-btn">
              <Bold size={16} />
            </button>
            <button onClick={() => insertMarkdown('*')} title="Italic" className="toolbar-btn">
              <Italic size={16} />
            </button>
            <button onClick={() => insertMarkdown('<u>', '</u>')} title="Underline" className="toolbar-btn">
              <Underline size={16} />
            </button>
            <button onClick={() => insertMarkdown('~~')} title="Strikethrough" className="toolbar-btn">
              <Strikethrough size={16} />
            </button>
          </div>

          <div className="toolbar-section">
            <button onClick={() => insertAtCursor('\n# ')} title="Heading" className="toolbar-btn">H</button>
            <button onClick={() => insertAtCursor('\n# ')} title="H1" className="toolbar-btn">H1</button>
            <button onClick={() => insertAtCursor('\n## ')} title="H2" className="toolbar-btn">H2</button>
            <button onClick={() => insertAtCursor('\n### ')} title="H3" className="toolbar-btn">H3</button>
          </div>

          <div className="toolbar-section">
            <button onClick={() => insertMarkdown('`')} title="Inline Code" className="toolbar-btn">
              <Code size={16} />
            </button>
            <button onClick={() => insertAtCursor('\n```\n\n```\n')} title="Code Block" className="toolbar-btn">⧈⧈</button>
            <button onClick={() => insertAtCursor('\n```mermaid\ngraph TD\n    A[Start] --> B[End]\n```\n')} title="Mermaid Diagram" className="toolbar-btn">📊</button>
          </div>

          <div className="toolbar-section">
            <button onClick={() => insertAtCursor('\n- ')} title="Bullet List" className="toolbar-btn">
              <List size={16} />
            </button>
            <button onClick={() => insertAtCursor('\n1. ')} title="Numbered List" className="toolbar-btn">
              <ListOrdered size={16} />
            </button>
            <button onClick={() => insertAtCursor('\n- [ ] ')} title="Task List" className="toolbar-btn">
              <CheckSquare size={16} />
            </button>
          </div>

          <div className="toolbar-section">
            <button onClick={() => insertMarkdown('[', '](url)', 'link text')} title="Link" className="toolbar-btn">
              <Link2 size={16} />
            </button>
            <button onClick={() => insertAtCursor('![alt text](image-url)')} title="Image" className="toolbar-btn">
              <Image size={16} />
            </button>
            <button onClick={() => insertAtCursor('\n| Column 1 | Column 2 |\n|----------|----------|\n| Data 1   | Data 2   |\n')} title="Table" className="toolbar-btn">
              <Table size={16} />
            </button>
          </div>

          <div className="toolbar-section">
            <button onClick={() => insertAtCursor('\n---\n')} title="Horizontal Rule" className="toolbar-btn">
              <Minus size={16} />
            </button>
            <button onClick={() => insertAtCursor('\n> ')} title="Quote" className="toolbar-btn">
              <Quote size={16} />
            </button>
          </div>

          <div className="toolbar-section">
            <button onClick={() => insertAtCursor('\n:::info\nInfo content\n:::')} title="Info" className="toolbar-btn info-btn">🛈</button>
            <button onClick={() => insertAtCursor('\n:::warning\nWarning content\n:::')} title="Warning" className="toolbar-btn warning-btn">⚠</button>
            <button onClick={() => insertAtCursor('\n:::danger\nDanger content\n:::')} title="Danger" className="toolbar-btn danger-btn">🚨</button>
          </div>

          <div className="toolbar-actions">
            <button onClick={() => setShowPreview(!showPreview)} title="Toggle Preview" className="toolbar-btn">
              {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
            <button onClick={downloadFile} title="Download" className="toolbar-btn">
              <Download size={16} />
            </button>
          </div>
        </div>

        {/* Prominent Action Buttons */}
        <div className="action-bar">
          <div className="action-buttons">
            <Link href="/viewer" className="action-btn viewer-btn">
              <Eye size={18} />
              View All Posts
            </Link>
            
            <button 
              onClick={saveToGitHub} 
              disabled={saving} 
              className="action-btn github-btn"
              title="Push to GitHub"
            >
              {saving ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Pushing...
                </>
              ) : (
                <>
                  <Upload size={18} />
                  Push to GitHub
                </>
              )}
            </button>
          </div>
          
          <div className="save-status-display">
            {saveStatus === 'saved' && <span className="status-saved">✅ Saved to GitHub!</span>}
            {saveStatus === 'error' && <span className="status-error">❌ Push failed</span>}
          </div>
        </div>

        {/* Main Editor Area - Exact HackMD Layout */}
        <div className="hackmd-main">
          {/* Editor Side */}
          <div className={`hackmd-editor-side ${showPreview ? 'split-mode' : 'full-mode'}`}>
            <div className="editor-wrapper">
              <div className="line-numbers-column">
                {Array.from({ length: Math.max(lineCount, 20) }, (_, i) => (
                  <div key={i + 1} className="line-number">{i + 1}</div>
                ))}
              </div>
              <textarea
                ref={textareaRef}
                value={content}
                onChange={handleContentChange}
                onSelect={handleCursorMove}
                onKeyUp={handleCursorMove}
                onClick={handleCursorMove}
                className="hackmd-editor-textarea"
                placeholder=""
                spellCheck="false"
              />
            </div>
          </div>

          {/* Preview Side */}
          {showPreview && (
            <div className="hackmd-preview-side">
              <div className="preview-header-info">
                <div className="preview-meta">
                  <div className="change-info">
                    <Clock size={14} />
                    <span>CHANGED 24 DAYS AGO</span>
                  </div>
                  <div className="preview-actions">
                    <button title="Favorite">🤍</button>
                    <button title="Save">📁</button>
                    <button title="Edit">✏️</button>
                    <button title="Notifications">🔔</button>
                    <button title="Comments">💬</button>
                  </div>
                </div>
                
                {content.includes('#') && (
                  <h1 className="preview-document-title">
                    {content.split('\n').find(line => line.startsWith('#'))?.replace(/^#+\s*/, '') || 'Untitled'}
                  </h1>
                )}
              </div>
              
              <div className="preview-content-area">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkBreaks]}
                  rehypePlugins={[rehypeHighlight, rehypeRaw]}
                  components={{
                    div: ({ className, children, ...props }) => {
                      if (className?.includes('info')) {
                        return <div className="hackmd-alert info-alert" {...props}>{children}</div>;
                      }
                      if (className?.includes('warning')) {
                        return <div className="hackmd-alert warning-alert" {...props}>{children}</div>;
                      }
                      if (className?.includes('danger')) {
                        return <div className="hackmd-alert danger-alert" {...props}>{children}</div>;
                      }
                      return <div className={className} {...props}>{children}</div>;
                    },
                    code: ({ node, className, children, ...props }) => {
                      const match = /language-(\w+)/.exec(className || '');
                      const language = match?.[1];
                      
                      if (language === 'mermaid') {
                        return <MermaidDiagram chart={String(children)} />;
                      }
                      
                      return (
                        <code className={className} {...props} style={{ color: '#f0f6fc' }}>
                          {children}
                        </code>
                      );
                    },
                    p: ({ children, ...props }) => (
                      <p {...props} style={{ color: '#e6edf3' }}>
                        {children}
                      </p>
                    ),
                    h1: ({ children, ...props }) => (
                      <h1 {...props} style={{ color: '#f0f6fc' }}>
                        {children}
                      </h1>
                    ),
                    h2: ({ children, ...props }) => (
                      <h2 {...props} style={{ color: '#f0f6fc' }}>
                        {children}
                      </h2>
                    ),
                    h3: ({ children, ...props }) => (
                      <h3 {...props} style={{ color: '#f0f6fc' }}>
                        {children}
                      </h3>
                    ),
                    li: ({ children, ...props }) => (
                      <li {...props} style={{ color: '#e6edf3' }}>
                        {children}
                      </li>
                    ),
                    strong: ({ children, ...props }) => (
                      <strong {...props} style={{ color: '#f0f6fc' }}>
                        {children}
                      </strong>
                    ),
                    em: ({ children, ...props }) => (
                      <em {...props} style={{ color: '#e6edf3' }}>
                        {children}
                      </em>
                    )
                  }}
                >
                  {content || '*Start typing to see preview...*'}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>

        {/* HackMD Status Bar - Exact replica */}
        <div className="hackmd-statusbar">
          <div className="statusbar-content">
            <span>Line {cursorPosition.line}, Column {cursorPosition.column}</span>
            <span>-</span>
            <span>{charCount} chars</span>
            <span>-</span>
            <span>Spaces: {spaceCount}</span>
            <span>-</span>
            <span>GITHUB</span>
            <span>-</span>
            <span>Length: {charCount}</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .hackmd-container {
          height: 100vh;
          display: flex;
          flex-direction: column;
          background: #f7f8fc;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: #333;
        }

        /* Header - Exact HackMD styling */
        .hackmd-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #22272e; /* dark dimmed */
          color: #adbac7;
          padding: 8px 16px;
          height: 44px;
          font-size: 13px;
        }

        .hackmd-header-left {
          display: flex;
          align-items: center;
        }

        .workspace-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .workspace-avatar {
          width: 20px;
          height: 20px;
          background: #666;
          border-radius: 3px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ccc;
        }

        .workspace-name {
          color: #ccc;
          font-weight: normal;
        }

        .workspace-icons {
          display: flex;
          gap: 4px;
          margin-left: 8px;
        }

        .workspace-icons button {
          background: none;
          border: none;
          color: #999;
          cursor: pointer;
          padding: 2px;
          font-size: 12px;
        }

        .workspace-icons button:hover {
          color: #ccc;
        }

        .hackmd-header-center {
          display: flex;
          align-items: center;
        }

        .document-info {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(173, 186, 199, 0.08);
          padding: 4px 12px;
          border-radius: 4px;
        }

        .document-icon {
          font-size: 12px;
        }

        .document-path {
          color: #adbac7;
          font-size: 13px;
        }

        .hackmd-header-right {
          display: flex;
          align-items: center;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .view-count {
          color: #768390;
          font-size: 12px;
        }

        .user-avatar {
          width: 24px;
          height: 24px;
          background: #4dabf7;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 500;
        }

        .share-button {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: #316dca;
          color: #cdd9e5;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          cursor: pointer;
        }

        .share-button:hover {
          background: #4683d6;
        }

        /* Template Bar */
        .template-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #2d333b;
          padding: 8px 16px;
          border-bottom: 1px solid #373e47;
          font-size: 13px;
        }

        .template-select, .category-input, .title-input {
          padding: 4px 8px;
          border: 1px solid #444c56;
          border-radius: 3px;
          background: #22272e;
          color: #adbac7;
          font-size: 13px;
        }

        .template-btn, .view-posts-btn, .clear-btn {
          padding: 4px 8px;
          background: #316dca;
          color: #cdd9e5;
          border: none;
          border-radius: 3px;
          font-size: 12px;
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
        }

        .clear-btn {
          background: #dc3545;
        }

        .clear-btn:hover {
          background: #c82333;
        }

        /* Prominent Action Bar */
        .action-bar {
          background: #22272e;
          border-bottom: 1px solid #373e47;
          padding: 12px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-height: 52px;
        }

        .action-buttons {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          min-width: 140px;
          justify-content: center;
        }

        .viewer-btn {
          background: #2d333b;
          color: #adbac7;
          border: 1px solid #444c56;
        }

        .viewer-btn:hover {
          background: #373e47;
          color: #cdd9e5;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }

        .github-btn {
          background: #238636;
          color: #ffffff;
          border: 1px solid #2ea043;
          box-shadow: 0 2px 4px rgba(35, 134, 54, 0.2);
        }

        .github-btn:hover {
          background: #2ea043;
          transform: translateY(-1px);
          box-shadow: 0 6px 12px rgba(35, 134, 54, 0.3);
        }

        .github-btn:disabled {
          background: #656d76;
          border-color: #656d76;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .save-status-display {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .status-saved {
          color: #3fb950;
          font-weight: 600;
          font-size: 14px;
        }

        .status-error {
          color: #f85149;
          font-weight: 600;
          font-size: 14px;
        }

        .template-popup {
          position: absolute;
          top: 132px;
          left: 16px;
          background: #22272e;
          border: 1px solid #373e47;
          border-radius: 4px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          z-index: 100;
        }

        .template-option {
          display: block;
          width: 200px;
          padding: 8px 12px;
          background: none;
          border: none;
          text-align: left;
          cursor: pointer;
          font-size: 13px;
        }

        .template-option:hover {
          background: #2d333b;
        }

        /* Toolbar - Exact HackMD styling */
        .hackmd-toolbar {
          display: flex;
          align-items: center;
          background: #2d333b;
          border-bottom: 1px solid #dee2e6;
          padding: 6px 16px;
          gap: 8px;
          min-height: 36px;
        }

        .toolbar-section {
          display: flex;
          gap: 2px;
          padding: 0 4px;
          border-right: 1px solid #373e47;
        }

        .toolbar-section:last-child {
          border-right: none;
        }

        .toolbar-btn {
          padding: 4px 6px;
          background: none;
          border: none;
          color: #adbac7;
          cursor: pointer;
          border-radius: 3px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
        }

        .toolbar-btn:hover {
          background: #2d333b;
          color: #cdd9e5;
        }

        .info-btn { color: #17a2b8; }
        .warning-btn { color: #ffc107; }
        .danger-btn { color: #dc3545; }
        .github-btn { color: #28a745; }

        .toolbar-actions {
          margin-left: auto;
          display: flex;
          gap: 2px;
        }

        /* Main Area */
        .hackmd-main {
          flex: 1;
          display: flex;
          overflow: hidden;
        }

        /* Editor - Exact HackMD dark teal theme */
        .hackmd-editor-side {
          background: #0f343a; /* teal editor bg similar to screenshot */
          position: relative;
          overflow: hidden;
          display: flex;
        }

        .hackmd-editor-side.split-mode {
          width: 50%;
          border-right: 1px solid #0a2a2f;
        }

        .hackmd-editor-side.full-mode {
          width: 100%;
        }

        .editor-wrapper {
          display: flex;
          width: 100%;
          height: 100%;
        }

        .line-numbers-column {
          background: #0b2a30;
          padding: 16px 12px 16px 16px;
          font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Fira Code', monospace;
          font-size: 13px;
          line-height: 22px;
          color: #66aeb2;
          min-width: 48px;
          text-align: right;
          user-select: none;
          border-right: 1px solid #0a2a2f;
        }

        .line-number {
          height: 22px;
          display: flex;
          align-items: center;
          justify-content: flex-end;
        }

        .hackmd-editor-textarea {
          flex: 1;
          background: #0f343a;
          color: #e8f4f8;
          border: none;
          outline: none;
          padding: 16px;
          font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Fira Code', monospace;
          font-size: 13px;
          line-height: 22px;
          resize: none;
          white-space: pre;
          word-wrap: normal;
          overflow-wrap: normal;
          tab-size: 4;
        }

        .hackmd-editor-textarea::selection {
          background: rgba(83, 155, 245, 0.25);
        }

        /* Preview - Dark theme to match HackMD */
        .hackmd-preview-side {
          width: 50%;
          background: #22272e; /* dark dimmed */
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }

        .preview-header-info {
          background: #22272e;
          padding: 20px 32px;
          border-bottom: 1px solid #373e47;
        }

        .preview-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .change-info {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: #768390;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .preview-actions {
          display: flex;
          gap: 8px;
        }

        .preview-actions button {
          background: none;
          border: none;
          font-size: 16px;
          cursor: pointer;
          padding: 4px;
          border-radius: 3px;
        }

        .preview-actions button:hover {
          background: #2d333b;
        }

        .preview-document-title {
          font-size: 32px;
          font-weight: 600;
          color: #cdd9e5;
          margin: 0;
          line-height: 1.25;
        }

        .preview-content-area {
          flex: 1;
          padding: 0 32px 32px 32px;
          background: #22272e;
        }

        /* Typography */
        .preview-content-area a {
          color: #58a6ff;
          text-decoration: none;
        }

        .preview-content-area a:hover {
          color: #79c0ff;
          text-decoration: underline;
        }

        .preview-content-area strong {
          color: #e6edf3;
        }

        .preview-content-area em {
          color: #c9d1d9;
        }

        .preview-content-area hr {
          border: none;
          border-top: 1px solid #30363d;
          margin: 24px 0;
        }

        .preview-content-area li::marker {
          color: #8b949e;
        }

        .preview-content-area h1 {
          font-size: 2em;
          font-weight: 600;
          margin: 24px 0 16px 0;
          color: #f0f6fc !important;
          border-bottom: 1px solid #373e47;
          padding-bottom: 8px;
        }

        .preview-content-area h2 {
          font-size: 1.5em;
          font-weight: 600;
          margin: 24px 0 12px 0;
          color: #f0f6fc !important;
        }

        .preview-content-area h3 {
          font-size: 1.25em;
          font-weight: 600;
          margin: 20px 0 8px 0;
          color: #f0f6fc !important;
        }

        .preview-content-area p {
          margin: 16px 0;
          line-height: 1.6;
          color: #e6edf3 !important;
        }

        .preview-content-area ul, .preview-content-area ol {
          margin: 16px 0;
          padding-left: 32px;
          color: #e6edf3 !important;
        }

        .preview-content-area li {
          margin: 4px 0;
          line-height: 1.6;
          color: #e6edf3 !important;
        }

        .preview-content-area code {
          background: #2d333b;
          padding: 3px 6px;
          border-radius: 3px;
          font-family: 'SF Mono', Monaco, monospace;
          font-size: 0.9em;
          color: #adbac7;
        }

        .preview-content-area pre {
          background: #2d333b;
          border-radius: 6px;
          padding: 16px;
          overflow-x: auto;
          font-family: 'SF Mono', Monaco, monospace;
          font-size: 13px;
          line-height: 1.45;
          border: 1px solid #444c56;
          color: #adbac7;
        }

        .preview-content-area pre code {
          background: transparent;
          padding: 0;
          color: inherit;
        }

        .preview-content-area blockquote {
          margin: 16px 0;
          padding-left: 16px;
          border-left: 4px solid #373e47;
          color: #768390;
        }

        /* Tables */
        .preview-content-area table {
          width: 100%;
          border-collapse: collapse;
          margin: 16px 0;
          background: #22272e;
          color: #adbac7;
          border: 1px solid #373e47;
        }

        .preview-content-area th,
        .preview-content-area td {
          border: 1px solid #373e47;
          padding: 8px 12px;
        }

        .preview-content-area th {
          background: #2d333b;
          color: #cdd9e5;
          font-weight: 600;
        }

        .preview-content-area tbody tr:nth-child(odd) {
          background: #242b33;
        }

        /* Images */
        .preview-content-area img {
          max-width: 100%;
          border-radius: 6px;
          border: 1px solid #373e47;
        }

        .hackmd-alert {
          padding: 12px 16px;
          margin: 16px 0;
          border-radius: 6px;
          border-left: 4px solid;
        }

        .info-alert {
          background: rgba(49, 109, 202, 0.15);
          border-left-color: #316dca;
          color: #9ecbff;
        }

        .warning-alert {
          background: rgba(176, 136, 0, 0.15);
          border-left-color: #b08800;
          color: #ffd985;
        }

        .danger-alert {
          background: rgba(229, 83, 75, 0.15);
          border-left-color: #e5534b;
          color: #ffb4aa;
        }

        /* Status Bar - Exact HackMD styling */
        .hackmd-statusbar {
          background: #2d333b;
          border-top: 1px solid #373e47;
          padding: 4px 16px;
          font-size: 11px;
          color: #768390;
          height: 26px;
          display: flex;
          align-items: center;
        }

        .statusbar-content {
          display: flex;
          align-items: center;
          gap: 8px;
        }
      `}</style>
    </>
  );
}
