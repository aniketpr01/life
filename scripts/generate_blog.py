#!/usr/bin/env python3
"""
Blog View Generator for Life Repository
Generates a paginated blog view from all journal entries
"""

import os
import re
import argparse
from datetime import datetime, timedelta
from pathlib import Path
from typing import List, Dict, Tuple

class BlogEntry:
    def __init__(self, filepath: str, content: str, entry_type: str):
        self.filepath = filepath
        self.content = content
        self.entry_type = entry_type
        self.date = self.extract_date(filepath, content)
        self.title = self.extract_title(content)
        
    def extract_date(self, filepath: str, content: str) -> datetime:
        """Extract date from filepath or content"""
        # Try to extract from filepath first
        date_patterns = [
            r'(\d{4})[/-](\d{2})[/-](\d{2})',  # YYYY-MM-DD or YYYY/MM/DD
            r'(\d{4})(\d{2})(\d{2})',           # YYYYMMDD
            r'day-(\d+)',                        # day-001 format
        ]
        
        for pattern in date_patterns:
            match = re.search(pattern, filepath)
            if match:
                if 'day-' in pattern:
                    # For 100 days of code, calculate date from day number
                    day_num = int(match.group(1))
                    base_date = datetime(2025, 1, 8)  # Starting date
                    return base_date + timedelta(days=day_num - 1)
                else:
                    year, month, day = match.groups()
                    return datetime(int(year), int(month), int(day))
        
        # Try to extract from content
        date_match = re.search(r'\*?Date:?\s*([^*\n]+)', content)
        if date_match:
            try:
                return datetime.strptime(date_match.group(1).strip(), '%B %d, %Y')
            except:
                try:
                    return datetime.strptime(date_match.group(1).strip(), '%Y-%m-%d')
                except:
                    pass
        
        # Default to file modification time
        return datetime.fromtimestamp(os.path.getmtime(filepath))
    
    def extract_title(self, content: str) -> str:
        """Extract title from content"""
        lines = content.split('\n')
        for line in lines:
            if line.startswith('# '):
                return line[2:].strip()
        return os.path.basename(self.filepath).replace('.md', '').replace('-', ' ').title()

class BlogGenerator:
    def __init__(self, repo_path: str = '.'):
        self.repo_path = Path(repo_path)
        self.entries: List[BlogEntry] = []
        
    def collect_entries(self):
        """Collect all markdown entries from different formats"""
        patterns = [
            ('til/**/*.md', 'TIL'),
            ('daily-journal/**/*.md', 'Journal'),
            ('dev-blog/*.md', 'Blog'),
            ('100-days-of-code/*.md', '100Days'),
            ('learning-log/*.md', 'Learning'),
        ]
        
        for pattern, entry_type in patterns:
            for filepath in self.repo_path.glob(pattern):
                if filepath.name != 'README.md':
                    try:
                        content = filepath.read_text(encoding='utf-8')
                        entry = BlogEntry(str(filepath), content, entry_type)
                        self.entries.append(entry)
                    except Exception as e:
                        print(f"Error reading {filepath}: {e}")
        
        # Sort by date (newest first)
        self.entries.sort(key=lambda x: x.date, reverse=True)
    
    def generate_blog_view(self, days: int = 5, output_file: str = 'blog-view.md'):
        """Generate paginated blog view"""
        if not self.entries:
            self.collect_entries()
        
        pages = []
        current_page = []
        current_days = 0
        last_date = None
        
        for entry in self.entries:
            if last_date is None or entry.date.date() != last_date:
                current_days += 1
                last_date = entry.date.date()
            
            if current_days > days:
                if current_page:
                    pages.append(current_page)
                    current_page = []
                    current_days = 1
                    last_date = entry.date.date()
            
            current_page.append(entry)
        
        if current_page:
            pages.append(current_page)
        
        # Generate markdown output
        output = self.format_blog_pages(pages, days)
        
        # Write to file
        output_path = self.repo_path / output_file
        output_path.write_text(output, encoding='utf-8')
        print(f"Blog view generated: {output_file}")
        
        return output_path
    
    def format_blog_pages(self, pages: List[List[BlogEntry]], days_per_page: int) -> str:
        """Format blog pages as markdown"""
        output = []
        output.append("# 📚 Blog View - All Entries\n")
        output.append(f"> Showing entries from the last {days_per_page} days per page\n\n")
        
        # Navigation
        if len(pages) > 1:
            output.append("## 📑 Pages\n")
            for i, page in enumerate(pages, 1):
                start_date = page[0].date.strftime('%b %d')
                end_date = page[-1].date.strftime('%b %d, %Y')
                output.append(f"- [Page {i}: {end_date} - {start_date}](#page-{i})\n")
            output.append("\n---\n\n")
        
        # Generate each page
        for page_num, page in enumerate(pages, 1):
            output.append(f"## Page {page_num}\n")
            
            # Group entries by date
            entries_by_date: Dict[str, List[BlogEntry]] = {}
            for entry in page:
                date_str = entry.date.strftime('%A, %B %d, %Y')
                if date_str not in entries_by_date:
                    entries_by_date[date_str] = []
                entries_by_date[date_str].append(entry)
            
            # Format each day's entries
            for date_str, entries in entries_by_date.items():
                output.append(f"### 📅 {date_str}\n")
                
                for entry in entries:
                    # Entry header
                    badge = self.get_badge(entry.entry_type)
                    output.append(f"#### {badge} {entry.title}\n")
                    output.append(f"*Type: {entry.entry_type} | [View Full Entry]({entry.filepath})*\n\n")
                    
                    # Entry preview (first 500 chars or until first code block)
                    preview = self.get_preview(entry.content)
                    output.append(preview)
                    output.append("\n\n")
                
                output.append("---\n\n")
            
            # Page navigation
            if len(pages) > 1:
                nav = []
                if page_num > 1:
                    nav.append(f"[← Previous Page](#page-{page_num-1})")
                nav.append("[Back to Top](#-blog-view---all-entries)")
                if page_num < len(pages):
                    nav.append(f"[Next Page →](#page-{page_num+1})")
                output.append(" | ".join(nav) + "\n\n")
                output.append("---\n\n")
        
        # Footer
        output.append(f"\n*Generated on {datetime.now().strftime('%B %d, %Y at %I:%M %p')}*\n")
        output.append(f"*Total Entries: {len(self.entries)}*\n")
        
        return ''.join(output)
    
    def get_badge(self, entry_type: str) -> str:
        """Get emoji badge for entry type"""
        badges = {
            'TIL': '💡',
            'Journal': '📔',
            'Blog': '📝',
            '100Days': '💪',
            'Learning': '📚'
        }
        return badges.get(entry_type, '📄')
    
    def get_preview(self, content: str, max_length: int = 500) -> str:
        """Get preview of content"""
        # Remove the title line
        lines = content.split('\n')
        content_lines = []
        skip_title = True
        
        for line in lines:
            if skip_title and line.startswith('# '):
                skip_title = False
                continue
            content_lines.append(line)
        
        preview_text = '\n'.join(content_lines).strip()
        
        # Find first code block or limit by length
        code_block_start = preview_text.find('```')
        if code_block_start > 0 and code_block_start < max_length:
            preview_text = preview_text[:code_block_start].strip()
            preview_text += "\n\n*[Code example included in full entry...]*"
        elif len(preview_text) > max_length:
            preview_text = preview_text[:max_length].strip()
            preview_text += "... *[Continue reading →]*"
        
        return preview_text

def main():
    parser = argparse.ArgumentParser(description='Generate blog view for Life repository')
    parser.add_argument('--days', type=int, default=5, help='Number of days per page')
    parser.add_argument('--output', type=str, default='blog-view.md', help='Output file name')
    parser.add_argument('--path', type=str, default='.', help='Repository path')
    
    args = parser.parse_args()
    
    generator = BlogGenerator(args.path)
    generator.collect_entries()
    generator.generate_blog_view(args.days, args.output)
    
    print(f"Found {len(generator.entries)} entries")
    print(f"Blog view saved to {args.output}")

if __name__ == '__main__':
    main()