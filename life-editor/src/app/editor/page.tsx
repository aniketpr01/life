'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
  const [mounted, setMounted] = useState(false);
  const [content, setContent] = useState('');
  const [previewContent, setPreviewContent] = useState('');
  const [viewMode, setViewMode] = useState<'edit' | 'split' | 'preview'>('split');
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [filename, setFilename] = useState('');
  const [postType, setPostType] = useState<BlogPost['type']>('plain');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchCache, setSearchCache] = useState<Map<string, any[]>>(new Map());
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  const [showTemplates, setShowTemplates] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const githubService = useRef(new GitHubService());

  useEffect(() => {
    setMounted(true);
    
    // Check if we're editing an existing file from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const editPath = urlParams.get('edit');
    const editTitle = urlParams.get('title');
    
    if (editPath && editTitle) {
      // Load existing file for editing
      loadExistingFile(editPath, editTitle);
    } else {
      const savedContent = localStorage.getItem('hackmd-content');
      if (savedContent) {
        setContent(savedContent);
        setPreviewContent(savedContent);
      }
      // Start with blank content by default (Plain format)
    }
  }, []);

  // Debounce preview rendering to keep typing smooth
  useEffect(() => {
    const t = setTimeout(() => setPreviewContent(content), 120);
    return () => clearTimeout(t);
  }, [content]);

  const loadExistingFile = async (path: string, title: string) => {
    try {
      const existingFile = await githubService.current.getFile(path);
      if (existingFile && existingFile.content) {
        const content = atob(existingFile.content); // Decode base64
        setContent(content);
        setTitle(title);
        
        // Set post type based on path
        if (path.includes('til')) setPostType('til');
        else if (path.includes('daily-journal')) setPostType('journal');
        else if (path.includes('dev-blog')) setPostType('blog');
        else if (path.includes('100-days')) setPostType('100days');
        else if (path.includes('learning-log')) setPostType('learning');
        else if (path.includes('notes')) setPostType('plain');
        
        localStorage.setItem('hackmd-content', content);
      }
    } catch (error) {
      console.error('Error loading existing file:', error);
      alert('Error loading file for editing');
    }
  };

  const generateFilename = useCallback(() => {
    const today = new Date();
    const cleanTitle = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    
    // Generate DDMMYY format for today's date
    const todayFormat = today.getDate().toString().padStart(2, '0') + 
                       (today.getMonth() + 1).toString().padStart(2, '0') + 
                       today.getFullYear().toString().slice(-2);
    
    const isoDate = today.toISOString().split('T')[0];
    
    let path = '';
    switch (postType) {
      case 'plain':
        // Use today's date if no title provided
        path = `notes/${cleanTitle || todayFormat}.md`;
        break;
      case 'til':
        path = `til/general/${cleanTitle || todayFormat}.md`;
        break;
      case 'journal':
        path = `daily-journal/${isoDate.substring(0, 4)}/${isoDate.substring(5, 7)}/${isoDate.substring(8)}-${cleanTitle || 'entry'}.md`;
        break;
      case 'blog':
        path = `dev-blog/${isoDate}-${cleanTitle || 'post'}.md`;
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
  }, [postType, title]);

  useEffect(() => {
    generateFilename();
  }, [generateFilename]);

  const rafRef = useRef<number | null>(null);
  const updateCursorPosition = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const compute = () => {
      const position = textarea.selectionStart;
      const textBeforeCursor = content.substring(0, position);
      const lines = textBeforeCursor.split('\n');
      const line = lines.length;
      const column = lines[lines.length - 1].length + 1;
      setCursorPosition({ line, column });
    };

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(compute);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    updateCursorPosition();
  };

  const handleCursorMove = () => {
    updateCursorPosition();
  };

  // Debounce localStorage writes for content to avoid blocking keystrokes
  useEffect(() => {
    const t = setTimeout(() => {
      try { localStorage.setItem('hackmd-content', content); } catch {}
    }, 300);
    return () => clearTimeout(t);
  }, [content]);

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
      
      // TEMPORARY SAFETY: Disable daily append until we can make it 100% safe
      if (existingFile && !window.location.search.includes('edit=')) {
        // File exists - ALWAYS ask user, never auto-append (safety first)
        setSaving(false);
        setSaveStatus('idle');
        
        const isDaily = !title.trim() && filename.includes(new Date().getDate().toString().padStart(2, '0') + 
                       (new Date().getMonth() + 1).toString().padStart(2, '0') + 
                       new Date().getFullYear().toString().slice(-2));
        
        const action = window.confirm(
          `File "${filename}" already exists. ${isDaily ? '⚠️ DAILY FILE DETECTED' : ''}\n\nClick OK to edit the existing file (SAFE), or Cancel to create a new file with a different name.`
        );
        
        if (action) {
          // Redirect to edit the existing file (SAFE option)
          const editUrl = `/editor?edit=${encodeURIComponent(filename)}&title=${encodeURIComponent(title || filename.split('/').pop()?.replace('.md', '') || 'Untitled')}`;
          window.location.href = editUrl;
          return;
        } else {
          // Ask for new filename to avoid conflicts
          const newTitle = prompt('Enter a new title for your post (to avoid overwriting):');
          if (newTitle) {
            setTitle(newTitle);
            return; // This will regenerate filename
          } else {
            return; // Cancel operation
          }
        }
      } else {
        // New file or editing mode
        message = `${existingFile ? 'Update' : 'Add'} ${filename.split('/').pop()}`;
      }
      
      const result = await githubService.current.createOrUpdateFile(
        filename,
        finalContent,
        message,
        existingFile?.sha
      );

      if (result.success && !isDaily) {
        setSaveStatus('saved');
        if (window.confirm('Post saved to GitHub! Clear editor for new post?')) {
          setContent('');
          setTitle('');
          setCategory('');
          localStorage.removeItem('hackmd-content');
          // Clear URL params
          window.history.replaceState({}, '', '/editor');
        }
      } else if (!result.success) {
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

  // Fuzzy search functionality
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    // Check cache first
    if (searchCache.has(query.toLowerCase())) {
      const cachedResults = searchCache.get(query.toLowerCase()) || [];
      setSearchResults(cachedResults);
      setShowSearchResults(true);
      return;
    }

    try {
      const files = await githubService.current.getAllPosts();
      const results: any[] = [];

      const getContent = async (file: any) => {
        // Prefer embedded base64 content if present (older API path)
        if (file?.content && file?.encoding === 'base64') {
          return atob(file.content.replace(/\s/g, ''));
        }
        // Otherwise use cached download content by SHA
        const key = `post-content:${file.sha}`;
        const cached = typeof window !== 'undefined' ? sessionStorage.getItem(key) : null;
        if (cached) return cached;
        const res = await fetch(file.download_url);
        const text = await res.text();
        if (typeof window !== 'undefined') { try { sessionStorage.setItem(key, text); } catch {} }
        return text;
      };

      for (const file of files) {
        const content = await getContent(file);
        const lowerQuery = query.toLowerCase();
        
        // Search in filename, content, and path
        const filenameMatch = file.name.toLowerCase().includes(lowerQuery);
        const contentMatch = content.toLowerCase().includes(lowerQuery);
        const pathMatch = file.path.toLowerCase().includes(lowerQuery);
        
        if (filenameMatch || contentMatch || pathMatch) {
          // Extract snippet around match
          const contentLines = content.split('\n');
          let snippet = '';
          let matchLine = '';
          
          for (const line of contentLines) {
            if (line.toLowerCase().includes(lowerQuery)) {
              matchLine = line;
              break;
            }
          }
          
          if (matchLine) {
            const index = matchLine.toLowerCase().indexOf(lowerQuery);
            const start = Math.max(0, index - 50);
            const end = Math.min(matchLine.length, index + 100);
            snippet = matchLine.substring(start, end);
            if (start > 0) snippet = '...' + snippet;
            if (end < matchLine.length) snippet = snippet + '...';
          }

          results.push({
            file,
            snippet: snippet || content.substring(0, 100) + '...',
            matchType: filenameMatch ? 'filename' : contentMatch ? 'content' : 'path',
            title: content.split('\n').find(line => line.startsWith('#'))?.replace(/^#+\s*/, '') || 
                   file.name.replace('.md', '').replace(/-/g, ' ')
          });
        }
      }

      // Sort by relevance (filename matches first, then content)
      results.sort((a, b) => {
        if (a.matchType === 'filename' && b.matchType !== 'filename') return -1;
        if (b.matchType === 'filename' && a.matchType !== 'filename') return 1;
        return 0;
      });

      // Cache the results
      const newCache = new Map(searchCache);
      newCache.set(query.toLowerCase(), results);
      setSearchCache(newCache);

      setSearchResults(results);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Search error:', error);
    }
  }, [searchCache]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        performSearch(searchQuery);
      } else {
        setShowSearchResults(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, performSearch]);

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

  const charCount = useMemo(() => content.length, [content]);
  const lineCount = useMemo(() => content.split('\n').length, [content]);
  const spaceCount = useMemo(() => (content.match(/ /g) || []).length, [content]);
  const lineNumbers = useMemo(() => Array.from({ length: Math.max(lineCount, 20) }, (_, i) => i + 1), [lineCount]);

  if (!mounted) {
    return (
      <div className="hackmd-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f7f8fc' }}>
        <div style={{ textAlign: 'center', color: '#666' }}>
          <div style={{ marginBottom: '16px', fontSize: '24px' }}>⏳</div>
          <div>Loading editor...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="hackmd-container">

        {/* Templates Dropdown */}
        <div className="template-bar">
          <div className="view-mode-toggle">
            <button 
              onClick={() => setViewMode('edit')}
              className={`view-btn ${viewMode === 'edit' ? 'active' : ''}`}
              title="Full Editor Mode"
            >
              <Edit3 size={16} />
            </button>
            <button 
              onClick={() => setViewMode('split')}
              className={`view-btn ${viewMode === 'split' ? 'active' : ''}`}
              title="Split View"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <rect x="2" y="3" width="5" height="10" rx="1"/>
                <rect x="9" y="3" width="5" height="10" rx="1"/>
              </svg>
            </button>
            <button 
              onClick={() => setViewMode('preview')}
              className={`view-btn ${viewMode === 'preview' ? 'active' : ''}`}
              title="Full Preview Mode"
            >
              <Eye size={16} />
            </button>
          </div>

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
          
          <div className="search-container">
            <div className="search-input-wrapper">
              <Search size={14} className="search-icon" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search all posts..."
                className="search-input"
                onFocus={() => searchQuery && setShowSearchResults(true)}
              />
              {searchQuery && (
                <button 
                  onClick={() => {
                    setSearchQuery('');
                    setShowSearchResults(false);
                  }}
                  className="search-clear"
                >
                  ✕
                </button>
              )}
            </div>
            
            {/* Search Results Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.slice(0, 8).map((result, index) => (
                  <div 
                    key={index}
                    className="search-result-item"
                    onClick={() => {
                      const editUrl = `/editor?edit=${encodeURIComponent(result.file.path)}&title=${encodeURIComponent(result.title)}`;
                      window.location.href = editUrl;
                    }}
                  >
                    <div className="result-title">{result.title}</div>
                    <div className="result-path">{result.file.path}</div>
                    <div className="result-snippet" dangerouslySetInnerHTML={{
                      __html: result.snippet.replace(
                        new RegExp(`(${searchQuery})`, 'gi'),
                        '<mark>$1</mark>'
                      )
                    }} />
                  </div>
                ))}
                {searchResults.length > 8 && (
                  <div className="search-more">
                    +{searchResults.length - 8} more results
                  </div>
                )}
              </div>
            )}
          </div>
          
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
          
          <Link href="/viewer" className="prominent-viewer-btn" style={{ color: '#ffffff', textDecoration: 'none' }}>
            👁️ View All Posts
          </Link>
          
          <button 
            onClick={saveToGitHub} 
            disabled={saving} 
            className="prominent-github-btn"
            title="Push to GitHub"
          >
            {saving ? (
              <>
                <span className="spinner">⏳</span>
                Pushing...
              </>
            ) : (
              <>
                🚀 Push to GitHub
              </>
            )}
          </button>
          
          <div className="status-indicators">
            <span className="filename-display">📁 {filename}</span>
            {!title.trim() && mounted && (
              <span className="daily-indicator">
                ⚠️ Daily File - Will ask before overwriting (SAFE MODE)
              </span>
            )}
            {saveStatus === 'saved' && <span className="save-indicator saved">✅ Saved!</span>}
            {saveStatus === 'error' && <span className="save-indicator error">❌ Error</span>}
          </div>
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



        {/* Main Editor Area - Exact HackMD Layout */}
        <div className="hackmd-main">
          {/* Editor Side */}
          {(viewMode === 'edit' || viewMode === 'split') && (
            <div className={`hackmd-editor-side ${viewMode === 'split' ? 'split-mode' : 'full-mode'}`}>
            <div className="editor-wrapper">
              <div className="line-numbers-column">
                {lineNumbers.map((n) => (
                  <div key={n} className="line-number">{n}</div>
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
          )}

          {/* Preview Side */}
          {(viewMode === 'preview' || viewMode === 'split') && (
            <div className={`hackmd-preview-side ${viewMode === 'preview' ? 'full-preview-mode' : 'split-preview-mode'}`}>
              <div className="preview-header-info">
                <div className="preview-meta">
                  <div className="change-info">
                    <Clock size={14} />
                    <span>CHANGED 24 DAYS AGO</span>
                  </div>
                </div>
                
              </div>
              
              <div className="preview-content-area">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkBreaks]}
                  rehypePlugins={[rehypeRaw, rehypeHighlight]}
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
                        <code className={className} {...props} style={{ color: '#f0f6fc', background: '#2d333b', padding: '2px 4px', borderRadius: '3px' }}>
                          {children}
                        </code>
                      );
                    },
                    pre: ({ children, ...props }) => (
                      <pre {...props} style={{ 
                        background: '#2d333b', 
                        color: '#e6edf3', 
                        padding: '16px', 
                        borderRadius: '6px',
                        border: '1px solid #444c56',
                        overflow: 'auto'
                      }}>
                        {children}
                      </pre>
                    ),
                    p: ({ children, ...props }) => (
                      <p {...props} style={{ color: '#e6edf3', marginBottom: '16px' }}>
                        {children}
                      </p>
                    ),
                    h1: ({ children, ...props }) => (
                      <h1 {...props} className="preview-h1">
                        {children}
                      </h1>
                    ),
                    h2: ({ children, ...props }) => (
                      <h2 {...props} className="preview-h2">
                        {children}
                      </h2>
                    ),
                    h3: ({ children, ...props }) => (
                      <h3 {...props} className="preview-h3">
                        {children}
                      </h3>
                    ),
                    ul: ({ children, ...props }) => (
                      <ul {...props} style={{ 
                        color: '#e6edf3', 
                        paddingLeft: '24px', 
                        marginBottom: '16px',
                        listStyleType: 'disc'
                      }}>
                        {children}
                      </ul>
                    ),
                    ol: ({ children, ...props }) => (
                      <ol {...props} style={{ 
                        color: '#e6edf3', 
                        paddingLeft: '24px', 
                        marginBottom: '16px',
                        listStyleType: 'decimal'
                      }}>
                        {children}
                      </ol>
                    ),
                    li: ({ children, ...props }) => (
                      <li {...props} style={{ 
                        color: '#e6edf3', 
                        marginBottom: '4px',
                        lineHeight: '1.6'
                      }}>
                        {children}
                      </li>
                    ),
                    strong: ({ children, ...props }) => (
                      <strong {...props} style={{ color: '#f0f6fc', fontWeight: '600' }}>
                        {children}
                      </strong>
                    ),
                    em: ({ children, ...props }) => (
                      <em {...props} style={{ color: '#e6edf3', fontStyle: 'italic' }}>
                        {children}
                      </em>
                    ),
                    blockquote: ({ children, ...props }) => (
                      <blockquote {...props} style={{ 
                        color: '#768390', 
                        borderLeft: '4px solid #4dabf7',
                        paddingLeft: '16px',
                        margin: '16px 0',
                        fontStyle: 'italic'
                      }}>
                        {children}
                      </blockquote>
                    ),
                    a: ({ children, ...props }) => (
                      <a {...props} style={{ 
                        color: '#58a6ff',
                        textDecoration: 'none'
                      }}>
                        {children}
                      </a>
                    ),
                    table: ({ children, ...props }) => (
                      <table {...props} style={{ 
                        width: '100%',
                        borderCollapse: 'collapse',
                        margin: '16px 0',
                        background: '#22272e',
                        border: '1px solid #373e47'
                      }}>
                        {children}
                      </table>
                    ),
                    th: ({ children, ...props }) => (
                      <th {...props} style={{ 
                        background: '#2d333b',
                        color: '#cdd9e5',
                        border: '1px solid #373e47',
                        padding: '8px 12px',
                        textAlign: 'left'
                      }}>
                        {children}
                      </th>
                    ),
                    td: ({ children, ...props }) => (
                      <td {...props} style={{ 
                        color: '#adbac7',
                        border: '1px solid #373e47',
                        padding: '8px 12px'
                      }}>
                        {children}
                      </td>
                    ),
                    hr: ({ ...props }) => (
                      <hr {...props} style={{ 
                        border: 'none',
                        borderTop: '1px solid #373e47',
                        margin: '24px 0'
                      }} />
                    )
                  }}
                >
                  {previewContent || '*Start typing to see preview...*'}
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

        /* View Mode Toggle */
        .view-mode-toggle {
          display: flex;
          background: #22272e;
          border: 1px solid #373e47;
          border-radius: 6px;
          overflow: hidden;
        }

        .view-btn {
          padding: 6px 10px;
          background: none;
          border: none;
          color: #768390;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          border-right: 1px solid #373e47;
          transition: all 0.2s ease;
        }

        .view-btn:last-child {
          border-right: none;
        }

        .view-btn:hover {
          background: #2d333b;
          color: #adbac7;
        }

        .view-btn.active {
          background: #4dabf7;
          color: white;
        }

        /* Search Container */
        .search-container {
          position: relative;
          flex: 1;
          max-width: 300px;
        }

        .search-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 8px;
          color: #768390;
          pointer-events: none;
        }

        .search-input {
          width: 100%;
          padding: 4px 8px 4px 28px;
          border: 1px solid #444c56;
          border-radius: 4px;
          background: #22272e;
          color: #adbac7;
          font-size: 13px;
          outline: none;
        }

        .search-input:focus {
          border-color: #4dabf7;
          box-shadow: 0 0 0 2px rgba(77, 171, 247, 0.1);
        }

        .search-clear {
          position: absolute;
          right: 6px;
          background: none;
          border: none;
          color: #768390;
          cursor: pointer;
          font-size: 12px;
          padding: 2px;
        }

        .search-clear:hover {
          color: #adbac7;
        }

        /* Search Results Dropdown */
        .search-results {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: #22272e;
          border: 1px solid #373e47;
          border-radius: 6px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.3);
          max-height: 400px;
          overflow-y: auto;
          z-index: 1000;
          margin-top: 4px;
        }

        .search-result-item {
          padding: 12px;
          border-bottom: 1px solid #373e47;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .search-result-item:hover {
          background: #2d333b;
        }

        .search-result-item:last-child {
          border-bottom: none;
        }

        .result-title {
          font-weight: 600;
          color: #cdd9e5;
          font-size: 14px;
          margin-bottom: 4px;
        }

        .result-path {
          font-size: 12px;
          color: #768390;
          font-family: monospace;
          margin-bottom: 6px;
        }

        .result-snippet {
          font-size: 13px;
          color: #adbac7;
          line-height: 1.4;
        }

        .result-snippet mark {
          background: #ffd60a;
          color: #1c1f24;
          padding: 1px 2px;
          border-radius: 2px;
        }

        .search-more {
          padding: 8px 12px;
          color: #768390;
          font-size: 12px;
          text-align: center;
          border-top: 1px solid #373e47;
        }

        .template-select, .title-input {
          padding: 4px 8px;
          border: 1px solid #444c56;
          border-radius: 3px;
          background: #22272e;
          color: #adbac7;
          font-size: 13px;
        }

        .template-btn, .clear-btn {
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

        /* Prominent Action Buttons in Template Bar */
        .prominent-viewer-btn, .prominent-github-btn {
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
          min-width: 120px;
          justify-content: center;
        }

        .prominent-viewer-btn {
          background: #4dabf7;
          color: #ffffff !important;
          border: 1px solid #339af0;
          box-shadow: 0 2px 8px rgba(77, 171, 247, 0.3);
        }

        .prominent-viewer-btn:hover {
          background: #339af0;
          color: #ffffff !important;
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(77, 171, 247, 0.4);
        }

        .prominent-github-btn {
          background: #40c057;
          color: white;
          border: 1px solid #37b24d;
          box-shadow: 0 2px 8px rgba(64, 192, 87, 0.3);
        }

        .prominent-github-btn:hover {
          background: #37b24d;
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(64, 192, 87, 0.4);
        }

        .prominent-github-btn:disabled {
          background: #868e96;
          border-color: #868e96;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Status Indicators */
        .status-indicators {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .save-indicator {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
        }

        .save-indicator.saved {
          background: rgba(64, 192, 87, 0.2);
          color: #40c057;
        }

        .save-indicator.error {
          background: rgba(248, 81, 73, 0.2);
          color: #f85149;
        }

        .filename-display {
          padding: 4px 8px;
          background: rgba(77, 171, 247, 0.1);
          color: #4dabf7;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          font-family: monospace;
        }

        .daily-indicator {
          padding: 4px 8px;
          background: rgba(255, 206, 84, 0.1);
          color: #ffce54;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          font-style: italic;
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
          background: #22272e; /* dark dimmed */
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }

        .split-preview-mode {
          width: 50%;
        }

        .full-preview-mode {
          width: 100%;
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

        .preview-content-area ul {
          margin: 16px 0;
          padding-left: 32px;
          color: #e6edf3 !important;
          list-style-type: disc !important;
          list-style-position: outside !important;
        }

        .preview-content-area ol {
          margin: 16px 0;
          padding-left: 32px;
          color: #e6edf3 !important;
          list-style-type: decimal !important;
          list-style-position: outside !important;
        }

        .preview-content-area li {
          margin: 4px 0;
          line-height: 1.6;
          color: #e6edf3 !important;
          display: list-item !important;
        }

        .preview-content-area li::marker {
          color: #4dabf7 !important;
        }

        /* Fix header rendering */
        .preview-h1 {
          color: #f0f6fc !important;
          font-size: 2rem !important;
          font-weight: 600 !important;
          margin-bottom: 16px !important;
          margin-top: 24px !important;
          border-bottom: 1px solid #373e47 !important;
          padding-bottom: 8px !important;
          display: block !important;
        }

        .preview-h2 {
          color: #f0f6fc !important;
          font-size: 1.5rem !important;
          font-weight: 600 !important;
          margin-bottom: 12px !important;
          margin-top: 24px !important;
          display: block !important;
        }

        .preview-h3 {
          color: #f0f6fc !important;
          font-size: 1.25rem !important;
          font-weight: 600 !important;
          margin-bottom: 8px !important;
          margin-top: 20px !important;
          display: block !important;
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
