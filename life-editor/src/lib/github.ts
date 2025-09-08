import { GitHubFile } from '@/types';

const REPO_OWNER = 'aniketpr01';
const REPO_NAME = 'life';
const API_BASE = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`;

export class GitHubService {
  private token: string | null = null;

  constructor(token?: string) {
    // Always use the environment token first
    this.token = process.env.NEXT_PUBLIC_GITHUB_TOKEN || 
                 token || 
                 (typeof window !== 'undefined' ? localStorage.getItem('githubToken') : null);
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers['Authorization'] = `token ${this.token}`;
    }
    
    return headers;
  }

  async testConnection(): Promise<{ connected: boolean; username?: string; error?: string }> {
    if (!this.token) {
      return { connected: false, error: 'No token provided' };
    }

    try {
      const response = await fetch(`${API_BASE}`, {
        headers: this.getHeaders(),
      });

      if (response.ok) {
        const repo = await response.json();
        return { connected: true, username: repo.owner.login };
      } else {
        return { connected: false, error: 'Invalid token' };
      }
    } catch (error) {
      return { connected: false, error: 'Connection failed' };
    }
  }

  async getFile(path: string): Promise<GitHubFile | null> {
    try {
      const response = await fetch(`${API_BASE}/contents/${path}`, {
        headers: this.getHeaders(),
      });

      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error('Error fetching file:', error);
      return null;
    }
  }

  async listFiles(path: string = ''): Promise<GitHubFile[]> {
    try {
      const response = await fetch(`${API_BASE}/contents/${path}`, {
        headers: this.getHeaders(),
      });

      if (response.ok) {
        const files = await response.json();
        return Array.isArray(files) ? files : [files];
      }
      return [];
    } catch (error) {
      console.error('Error listing files:', error);
      return [];
    }
  }

  async createOrUpdateFile(
    path: string,
    content: string,
    message: string,
    sha?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const body: any = {
        message,
        content: btoa(unescape(encodeURIComponent(content))), // Base64 encode with UTF-8
        branch: 'main',
      };

      if (sha) {
        body.sha = sha;
      }

      const response = await fetch(`${API_BASE}/contents/${path}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(body),
      });

      if (response.ok) {
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, error: error.message || 'Failed to save file' };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  }

  async getAllPosts(): Promise<GitHubFile[]> {
    const paths = ['til', 'daily-journal', 'dev-blog', '100-days-of-code', 'learning-log'];
    const allFiles: GitHubFile[] = [];

    for (const path of paths) {
      const files = await this.listFiles(path);
      for (const file of files) {
        if (file.type === 'dir') {
          const subFiles = await this.listFiles(file.path);
          allFiles.push(...subFiles.filter(f => f.name.endsWith('.md') && f.name !== 'README.md'));
        } else if (file.name.endsWith('.md') && file.name !== 'README.md') {
          allFiles.push(file);
        }
      }
    }

    return allFiles.sort((a, b) => {
      const dateA = this.extractDateFromPath(a.path);
      const dateB = this.extractDateFromPath(b.path);
      return dateB.getTime() - dateA.getTime();
    });
  }

  private extractDateFromPath(path: string): Date {
    // Extract date from various path formats
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
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('githubToken', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('githubToken');
    }
  }
}