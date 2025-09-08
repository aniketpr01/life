# 🚀 Life - My Personal Knowledge Repository

> A collection of daily learnings, thoughts, and technical discoveries organized for easy reference and continuous growth.

## 🌐 View Blog

**[📖 View Latest Posts](https://aniketpr01.github.io/life/)** | **[📅 View All Entries](./blog-view.md)**

---

## 📚 Repository Structure

This repository uses multiple popular formats for documenting different types of content:

### 1. 📝 [Today I Learned (TIL)](./til)
Short, concise write-ups about small things I learn day to day across various technologies. Inspired by [jbranchaud/til](https://github.com/jbranchaud/til).

**Categories:** Git | JavaScript | Python | [More...](./til)

**Latest TILs:**
- [Git: Recovering a Lost Commit](./til/git/recovering-lost-commit.md)
- [JavaScript: Optional Chaining in Depth](./til/javascript/optional-chaining.md)
- [Python: Using Walrus Operator](./til/python/walrus-operator.md)

---

### 2. 📅 [Daily Journal](./daily-journal)
Personal daily reflections, goals, and general life updates organized by date.

**Format:** `YYYY/MM/DD-entry-title.md`

**Recent Entries:**
- [2025/01/08 - Starting My GitHub Journal](./daily-journal/2025/01/08-starting-github-journal.md)

---

### 3. 💻 [Dev Blog](./dev-blog)
Longer technical articles and tutorials that warrant more than a TIL entry.

**Recent Posts:**
- [Building a CLI Tool with Node.js](./dev-blog/2025-01-08-building-cli-tool.md)

---

### 4. 💪 [100 Days of Code](./100-days-of-code)
Tracking my coding challenge progress with daily logs and project updates.

**Current Progress:** Day 1 of 100

**Latest Update:** [Day 1 - Setting Up Development Environment](./100-days-of-code/day-001.md)

---

### 5. 📖 [Learning Log](./learning-log)
Documenting my learning journey through courses, books, and tutorials.

**Currently Learning:**
- [Full Stack Web Development](./learning-log/fullstack-webdev.md)

---

## 📖 How to Use This Repository

### 🎯 Using Templates

Templates are available in [`resources/templates.md`](./resources/templates.md) for each format. Copy and customize them for your entries.

#### Quick Template Usage:

```bash
# Copy a template for a new TIL entry
cp resources/templates.md til/javascript/new-topic.md

# Copy for a daily journal
cp resources/templates.md daily-journal/2025/01/09-your-title.md
```

### ✍️ Creating New Entries

#### 1. **TIL (Today I Learned)**

```bash
# Create a new TIL entry
echo "# Your TIL Title" > til/javascript/array-methods.md

# Edit with your favorite editor
vim til/javascript/array-methods.md
# or
code til/javascript/array-methods.md
```

**Example TIL Entry:**
```markdown
# Array.flat() in JavaScript

The `flat()` method creates a new array with all sub-array elements concatenated.

```javascript
const nested = [1, [2, 3], [4, [5, 6]]];
console.log(nested.flat());    // [1, 2, 3, 4, [5, 6]]
console.log(nested.flat(2));   // [1, 2, 3, 4, 5, 6]
```

**Key Learning:** The depth parameter controls how deep to flatten.

*Date: January 9, 2025*
*Tags: #javascript #arrays*
```

#### 2. **Daily Journal**

```bash
# Create today's journal entry
mkdir -p daily-journal/2025/01
echo "# January 9, 2025 - Your Title" > daily-journal/2025/01/09-your-title.md
```

#### 3. **Dev Blog**

```bash
# Create a new blog post
echo "# Your Blog Title" > dev-blog/2025-01-09-topic.md
```

### 📝 Markdown Formatting Guide

#### Basic Syntax

```markdown
# H1 Heading
## H2 Heading
### H3 Heading

**Bold text**
*Italic text*
***Bold and italic***
~~Strikethrough~~

[Link text](https://example.com)
![Image alt text](image-url.jpg)

- Unordered list item
- Another item
  - Nested item

1. Ordered list
2. Second item
   1. Nested item

> Blockquote

`inline code`

```language
// Code block
const example = "Hello World";
```

| Column 1 | Column 2 |
|----------|----------|
| Data 1   | Data 2   |

---  (Horizontal rule)

- [ ] Todo item
- [x] Completed item
```

#### Advanced Formatting

**Collapsible Sections:**
```markdown
<details>
<summary>Click to expand</summary>

Hidden content here

</details>
```

**Alerts/Callouts:**
```markdown
> **Note:** Important information
> 
> **Warning:** Be careful with this
> 
> **Tip:** Helpful suggestion
```

**Emoji Shortcuts:**
- ✅ `:white_check_mark:` - Completed
- 🚀 `:rocket:` - Launch/Start
- 💡 `:bulb:` - Idea
- 📝 `:memo:` - Documentation
- 🐛 `:bug:` - Bug fix
- ✨ `:sparkles:` - New feature

### 🔄 Git Workflow

#### Daily Workflow

```bash
# 1. Navigate to your repository
cd ~/Blockchain/Development/Personal/life

# 2. Create/edit your entry
vim til/python/new-learning.md

# 3. Check what changed
git status

# 4. Stage your changes
git add .
# Or stage specific files
git add til/python/new-learning.md

# 5. Commit with descriptive message
git commit -m "til: Add Python decorator explanation"

# 6. Push to GitHub
git push origin main
```

#### Commit Message Examples

```bash
# TIL entries
git commit -m "til: Add JavaScript promise chaining explanation"
git commit -m "til(git): Document interactive rebase workflow"

# Daily journal
git commit -m "journal: Add daily reflection for Jan 9, 2025"
git commit -m "journal: Update goals and accomplishments"

# Blog posts
git commit -m "blog: Publish article on React hooks"
git commit -m "blog: Add tutorial on Docker basics"

# 100 Days of Code
git commit -m "100days: Complete Day 2 - Todo app with localStorage"

# Learning log
git commit -m "learning: Update progress on JavaScript course"

# Multiple changes
git commit -m "Update multiple entries

- til: Add Python type hints
- journal: Daily entry for Jan 9
- 100days: Day 2 progress"
```

#### Useful Git Commands

```bash
# View commit history
git log --oneline -10

# View changes before committing
git diff

# Amend last commit (before pushing)
git commit --amend -m "New message"

# Pull latest changes
git pull origin main

# Create a branch for major changes
git checkout -b feature/new-format
git push -u origin feature/new-format

# Stash changes temporarily
git stash
git stash pop

# View remote URL
git remote -v
```

### 🌐 Viewing Your Blog

#### Option 1: GitHub Interface
Navigate to your repository at https://github.com/aniketpr01/life

#### Option 2: Local Markdown Preview
```bash
# Using Python's grip
pip install grip
grip README.md

# Using VS Code
code README.md  # Then press Ctrl+Shift+V

# Using markdown-cli
npm install -g markdown-cli
markdown README.md > preview.html
open preview.html
```

#### Option 3: Blog View (Paginated)
Run the blog generator script:
```bash
# Generate blog view
python3 scripts/generate_blog.py

# View the generated blog
open blog-view.md
```

#### Option 4: GitHub Pages (Auto-generated)
Your blog is automatically available at:
https://aniketpr01.github.io/life/

### 📊 Automation Scripts

#### Generate Blog View
```bash
# This script creates a paginated blog view
python3 scripts/generate_blog.py --days 5 --output blog-view.md
```

#### Update Statistics
```bash
# Update the statistics in README
python3 scripts/update_stats.py
```

#### Bulk Commit
```bash
# Commit all today's changes at once
./scripts/daily_commit.sh "Today's learnings and updates"
```

### 🔍 Quick Navigation

| Format | Purpose | Update Frequency | Entry Length |
|--------|---------|------------------|--------------|
| [TIL](./til) | Quick tech learnings | Daily | 1-2 paragraphs |
| [Daily Journal](./daily-journal) | Personal reflections | Daily | Variable |
| [Dev Blog](./dev-blog) | Technical articles | Weekly | 5+ min read |
| [100 Days](./100-days-of-code) | Coding challenge | Daily | Brief update |
| [Learning Log](./learning-log) | Course progress | As needed | Detailed notes |

## 📊 Statistics

- **Total TIL Entries:** 3
- **Blog Posts:** 1
- **Days of Code:** 1
- **Started:** January 8, 2025

## 🏷️ Topics

`git` `javascript` `python` `web-development` `algorithms` `devops` `productivity` `learning`

## 💡 Pro Tips

1. **Consistency > Perfection**: Small daily entries are better than perfect weekly ones
2. **Use Templates**: Start with templates and customize as needed
3. **Tag Everything**: Use hashtags for easy searching later
4. **Include Code**: Always add code examples in TIL entries
5. **Review Weekly**: Look back at your week's entries every Sunday
6. **Public Learning**: Share interesting TILs on social media
7. **Backup**: GitHub is your backup, push regularly

## 🤝 Connect

Feel free to explore, learn from my journey, and share your thoughts!

## 📝 Notes

- All entries are written in Markdown
- Commits follow conventional commit format
- Updated regularly with new learnings and insights
- Blog view regenerated daily via GitHub Actions

---

*"Learning in public - one commit at a time"* 🌱