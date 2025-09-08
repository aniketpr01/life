export interface BlogPost {
  id: string;
  title: string;
  content: string;
  type: 'plain' | 'til' | 'journal' | 'blog' | '100days' | 'learning';
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  filename: string;
  path: string;
}

export interface GitHubFile {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string;
  type: string;
  content?: string;
  encoding?: string;
}

export interface EditorSettings {
  theme: 'light' | 'dark';
  fontSize: number;
  wordWrap: boolean;
  showLineNumbers: boolean;
  autoSave: boolean;
}

export interface GitHubAuth {
  token: string;
  username: string;
  connected: boolean;
}