'use client';

import { useState, useEffect } from 'react';

// Error suppression handled by global components
import { 
  Search, 
  Filter, 
  RefreshCw, 
  Calendar,
  FileText,
  Home,
  PenTool,
  ChevronLeft,
  ChevronRight,
  Eye,
  Tag,
  Clock,
  X,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import { GitHubService } from '@/lib/github';
import { BlogPost, GitHubFile } from '@/types';
import { format, parseISO, formatDistanceToNow } from 'date-fns';
import MermaidDiagram from '@/components/MermaidDiagram';

interface ViewerState {
  posts: BlogPost[];
  filteredPosts: BlogPost[];
  loading: boolean;
  searchTerm: string;
  selectedType: string;
  sortBy: string;
  currentPage: number;
  postsPerPage: number;
  selectedPost: BlogPost | null;
  showModal: boolean;
}

export default function ViewerPage() {
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<ViewerState>({
    posts: [],
    filteredPosts: [],
    loading: true,
    searchTerm: '',
    selectedType: 'all',
    sortBy: 'newest',
    currentPage: 1,
    postsPerPage: 9,
    selectedPost: null,
    showModal: false,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const [stats, setStats] = useState({
    total: 0,
    thisWeek: 0,
    thisMonth: 0,
    categories: 0,
  });

  const githubService = new GitHubService();

  useEffect(() => {
    if (!mounted) return;
    
    // Prevent hydration mismatch by delaying initial load
    const timer = setTimeout(() => {
      loadPosts();
      
      // Check for URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const typeFilter = urlParams.get('type');
      if (typeFilter) {
        setState(prev => ({ ...prev, selectedType: typeFilter }));
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [mounted]);

  useEffect(() => {
    filterPosts();
  }, [state.posts, state.searchTerm, state.selectedType, state.sortBy]);

  const loadPosts = async () => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const files = await githubService.getAllPosts();
      const posts = await Promise.all(
        files.map(async (file) => {
          const content = await fetchFileContent(file.download_url);
          return fileToPost(file, content);
        })
      );

      setState(prev => ({ 
        ...prev, 
        posts: posts.filter(Boolean) as BlogPost[], 
        loading: false 
      }));
      
      updateStats(posts.filter(Boolean) as BlogPost[]);
    } catch (error) {
      console.error('Error loading posts:', error);
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const fetchFileContent = async (url: string): Promise<string> => {
    try {
      const response = await fetch(url);
      return await response.text();
    } catch (error) {
      console.error('Error fetching file content:', error);
      return '';
    }
  };

  const fileToPost = (file: GitHubFile, content: string): BlogPost | null => {
    if (!file.name.endsWith('.md') || file.name === 'README.md') return null;

    const title = extractTitleFromContent(content) || file.name.replace('.md', '').replace(/-/g, ' ');
    const type = getPostTypeFromPath(file.path);
    const category = getCategoryFromPath(file.path);
    const tags = extractTagsFromContent(content);
    const date = extractDateFromPath(file.path);

    return {
      id: file.sha,
      title,
      content,
      type,
      category,
      tags,
      createdAt: date.toISOString(),
      updatedAt: date.toISOString(),
      filename: file.name,
      path: file.path,
    };
  };

  const extractTitleFromContent = (content: string): string | null => {
    const lines = content.split('\n');
    for (const line of lines) {
      if (line.startsWith('# ')) {
        return line.substring(2).trim();
      }
    }
    return null;
  };

  const getPostTypeFromPath = (path: string): BlogPost['type'] => {
    if (path.includes('til')) return 'til';
    if (path.includes('daily-journal')) return 'journal';
    if (path.includes('dev-blog')) return 'blog';
    if (path.includes('100-days')) return '100days';
    if (path.includes('learning-log')) return 'learning';
    return 'til';
  };

  const getCategoryFromPath = (path: string): string => {
    const parts = path.split('/');
    if (parts.length > 2) {
      return parts[1];
    }
    return 'general';
  };

  const extractTagsFromContent = (content: string): string[] => {
    // Only extract tags from specific sections, avoid code blocks and colors
    const lines = content.split('\n');
    const tagLines = lines.filter(line => 
      line.includes('*Tags:') || 
      line.includes('**Tags:**') || 
      (line.startsWith('#') && line.includes('tag'))
    );
    
    const tagText = tagLines.join(' ');
    const tagRegex = /#[a-zA-Z][a-zA-Z0-9-]{2,}/g; // Must start with letter, be 3+ chars
    const matches = tagText.match(tagRegex) || [];
    
    return matches
      .map(tag => tag.substring(1))
      .filter(tag => 
        tag.length > 2 && 
        /^[a-zA-Z]/.test(tag) &&
        !tag.match(/^[0-9a-f]{3,6}$/i) // Filter out hex colors
      )
      .slice(0, 3); // Limit to 3 tags max
  };

  const extractDateFromPath = (path: string): Date => {
    const patterns = [
      /(\d{4})[/-](\d{2})[/-](\d{2})/,
      /day-(\d{3})/,
    ];

    for (const pattern of patterns) {
      const match = path.match(pattern);
      if (match) {
        if (pattern.source.includes('day-')) {
          const dayNum = parseInt(match[1]);
          const baseDate = new Date('2025-01-08');
          baseDate.setDate(baseDate.getDate() + dayNum - 1);
          return baseDate;
        } else {
          return new Date(`${match[1]}-${match[2]}-${match[3]}`);
        }
      }
    }

    return new Date();
  };

  const filterPosts = () => {
    let filtered = [...state.posts];

    // Filter by type
    if (state.selectedType !== 'all') {
      filtered = filtered.filter(post => post.type === state.selectedType);
    }

    // Filter by search term
    if (state.searchTerm) {
      const search = state.searchTerm.toLowerCase();
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(search) ||
        post.content.toLowerCase().includes(search) ||
        post.category.toLowerCase().includes(search) ||
        post.tags.some(tag => tag.toLowerCase().includes(search))
      );
    }

    // Sort posts
    switch (state.sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    setState(prev => ({ ...prev, filteredPosts: filtered, currentPage: 1 }));
  };

  const updateStats = (posts: BlogPost[]) => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const thisWeek = posts.filter(post => new Date(post.createdAt) >= weekAgo).length;
    const thisMonth = posts.filter(post => new Date(post.createdAt) >= monthAgo).length;
    const categories = new Set(posts.map(post => post.category)).size;

    setStats({
      total: posts.length,
      thisWeek,
      thisMonth,
      categories,
    });
  };

  const refreshPosts = async () => {
    await loadPosts();
  };

  const openPost = (post: BlogPost) => {
    setState(prev => ({ ...prev, selectedPost: post, showModal: true }));
  };

  const closeModal = () => {
    setState(prev => ({ ...prev, selectedPost: null, showModal: false }));
  };

  const getPostTypeLabel = (type: BlogPost['type']) => {
    const labels = {
      til: 'TIL',
      journal: 'Journal',
      blog: 'Blog',
      '100days': '100 Days',
      learning: 'Learning'
    };
    return labels[type];
  };

  const getPostTypeColor = (type: BlogPost['type']) => {
    const colors = {
      til: 'bg-blue-900/20 text-blue-300',
      journal: 'bg-green-900/20 text-green-300',
      blog: 'bg-purple-900/20 text-purple-300',
      '100days': 'bg-red-900/20 text-red-300',
      learning: 'bg-orange-900/20 text-orange-300'
    } as const;
    return colors[type];
  };

  const getPaginatedPosts = () => {
    const startIndex = (state.currentPage - 1) * state.postsPerPage;
    const endIndex = startIndex + state.postsPerPage;
    return state.filteredPosts.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(state.filteredPosts.length / state.postsPerPage);

  if (!mounted) {
    return (
      <div className="page-viewer min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-viewer min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center text-blue-600 hover:text-blue-700">
                <Home className="h-5 w-5 mr-2" />
                <span className="font-semibold">Life</span>
              </Link>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Blog Viewer
              </h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={refreshPosts}
                disabled={state.loading}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${state.loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <Link
                href="/editor"
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                <PenTool className="h-4 w-4 mr-2" />
                Write New
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: "Total Posts", value: stats.total, icon: <FileText className="h-5 w-5" /> },
            { label: "This Week", value: stats.thisWeek, icon: <Calendar className="h-5 w-5" /> },
            { label: "This Month", value: stats.thisMonth, icon: <Clock className="h-5 w-5" /> },
            { label: "Categories", value: stats.categories, icon: <Tag className="h-5 w-5" /> }
          ].map((stat, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                </div>
                <div className="text-blue-500">{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  value={state.searchTerm}
                  onChange={(e) => setState(prev => ({ ...prev, searchTerm: e.target.value }))}
                  placeholder="Search posts..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            
            <select
              value={state.selectedType}
              onChange={(e) => setState(prev => ({ ...prev, selectedType: e.target.value }))}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Types</option>
              <option value="til">TIL</option>
              <option value="journal">Journal</option>
              <option value="blog">Blog</option>
              <option value="100days">100 Days</option>
              <option value="learning">Learning</option>
            </select>
            
            <select
              value={state.sortBy}
              onChange={(e) => setState(prev => ({ ...prev, sortBy: e.target.value }))}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">By Title</option>
            </select>
          </div>
        </div>

        {/* Loading state */}
        {state.loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-600 dark:text-gray-400">Loading posts...</span>
          </div>
        )}

        {/* Posts grid */}
        {!state.loading && state.filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No posts found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Try adjusting your filters or create a new post</p>
            <Link
              href="/editor"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <PenTool className="h-4 w-4 mr-2" />
              Write New Post
            </Link>
          </div>
        )}

        {!state.loading && state.filteredPosts.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {getPaginatedPosts().map((post, index) => (
                <div
                  key={`${post.id}-${index}-${post.path}`}
                  onClick={() => openPost(post)}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPostTypeColor(post.type)}`}>
                        {getPostTypeLabel(post.type)}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDistanceToNow(parseISO(post.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {post.title}
                    </h3>
                    
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                      {post.content.replace(/[#*`]/g, '').substring(0, 120)}...
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {post.tags
                          .filter(tag => tag && tag.length > 2 && /^[a-zA-Z]/.test(tag))
                          .slice(0, 2)
                          .map((tag) => (
                          <span key={tag} className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
                            #{tag}
                          </span>
                        ))}
                        {post.tags.filter(tag => tag && tag.length > 2 && /^[a-zA-Z]/.test(tag)).length > 2 && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            +{post.tags.filter(tag => tag && tag.length > 2 && /^[a-zA-Z]/.test(tag)).length - 2} more
                          </span>
                        )}
                      </div>
                      
                      <button className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                        <Eye className="h-4 w-4 mr-1" />
                        Read
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2">
                <button
                  onClick={() => setState(prev => ({ ...prev, currentPage: Math.max(1, prev.currentPage - 1) }))}
                  disabled={state.currentPage === 1}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </button>
                
                <span className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                  Page {state.currentPage} of {totalPages}
                </span>
                
                <button
                  onClick={() => setState(prev => ({ ...prev, currentPage: Math.min(totalPages, prev.currentPage + 1) }))}
                  disabled={state.currentPage === totalPages}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Post Modal */}
      {state.showModal && state.selectedPost && (
        <div className="dimmed-modal fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="modal-container rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="modal-header flex items-center justify-between p-6 border-b">
              <div className="flex items-center space-x-3">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPostTypeColor(state.selectedPost.type)}`}>
                  {getPostTypeLabel(state.selectedPost.type)}
                </span>
                <h2 className="modal-title text-xl font-semibold">
                  {state.selectedPost.title}
                </h2>
              </div>
              <button
                onClick={closeModal}
                className="close-btn p-2"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="modal-content p-6 overflow-y-auto max-h-[70vh]">
              <div className="dimmed-prose max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkBreaks]}
                  rehypePlugins={[rehypeHighlight, rehypeRaw]}
                  components={{
                    code: ({ node, className, children, ...props }) => {
                      const match = /language-(\w+)/.exec(className || '');
                      const language = match?.[1];
                      
                      if (language === 'mermaid') {
                        return <MermaidDiagram chart={String(children)} />;
                      }
                      
                      return <code className={className} {...props}>{children}</code>;
                    }
                  }}
                >
                  {state.selectedPost.content}
                </ReactMarkdown>
              </div>
            </div>
            
            <div className="modal-footer flex items-center justify-between p-6 border-t">
              <div className="footer-meta flex items-center space-x-4 text-sm">
                <span>Category: {state.selectedPost.category}</span>
                <span>•</span>
                <span>{format(parseISO(state.selectedPost.createdAt), 'PPP')}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                {state.selectedPost.tags
                  .filter(tag => tag && tag.length > 2 && /^[a-zA-Z]/.test(tag))
                  .slice(0, 5)
                  .map((tag) => (
                  <span key={tag} className="text-xs text-blue-300 bg-blue-900/20 px-2 py-1 rounded">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <style jsx>{`
        .dimmed-modal .modal-container { background: #22272e; border: 1px solid #373e47; color: #adbac7; }
        .dimmed-modal .modal-header { background: #22272e; border-color: #373e47; }
        .dimmed-modal .modal-title { color: #cdd9e5; }
        .dimmed-modal .close-btn { color: #768390; }
        .dimmed-modal .close-btn:hover { color: #cdd9e5; background: #2d333b; border-radius: 6px; }
        .dimmed-modal .modal-content { background: #22272e; }
        .dimmed-modal .modal-footer { background: #2d333b; border-color: #373e47; }
        .dimmed-modal .footer-meta { color: #768390; }
        
        .dimmed-prose h1, .dimmed-prose h2, .dimmed-prose h3,
        .dimmed-prose h4, .dimmed-prose h5, .dimmed-prose h6 { color: #cdd9e5; margin: 24px 0 12px 0; }
        .dimmed-prose p { color: #adbac7; line-height: 1.7; margin: 16px 0; }
        .dimmed-prose a { color: #539bf5; text-decoration: none; }
        .dimmed-prose a:hover { color: #6cb6ff; text-decoration: underline; }
        .dimmed-prose hr { border: none; border-top: 1px solid #373e47; margin: 24px 0; }
        .dimmed-prose code { background: #2d333b; color: #adbac7; padding: 2px 6px; border-radius: 4px; }
        .dimmed-prose pre { background: #2d333b; color: #adbac7; border: 1px solid #444c56; padding: 16px; border-radius: 6px; overflow-x: auto; }
        .dimmed-prose pre code { background: transparent; padding: 0; }
        .dimmed-prose blockquote { border-left: 4px solid #373e47; color: #768390; padding-left: 16px; margin: 16px 0; }
        .dimmed-prose table { width: 100%; border-collapse: collapse; border: 1px solid #373e47; margin: 16px 0; }
        .dimmed-prose th, .dimmed-prose td { border: 1px solid #373e47; padding: 8px 12px; }
        .dimmed-prose th { background: #2d333b; color: #cdd9e5; }
        .dimmed-prose tbody tr:nth-child(odd) { background: #242b33; }
        .dimmed-prose img { max-width: 100%; border-radius: 6px; border: 1px solid #373e47; }
      `}</style>
    </div>
  );
}
