# 🚀 Life - Modern Personal Knowledge Repository

A beautiful Next.js application for managing your personal knowledge repository with a HackMD-like editor and modern viewer.

## ✨ Features

- **🎨 Modern Next.js Interface** - Beautiful, responsive UI with Tailwind CSS
- **✍️ HackMD-like Editor** - Split-pane markdown editor with live preview
- **📚 Smart Viewer** - Filter, search, and browse your posts
- **🔗 GitHub Integration** - Direct push/pull from private repositories
- **🌙 Dark Mode** - Built-in theme switching
- **📱 Responsive Design** - Works on all devices
- **⚡ Fast Performance** - Server-side rendering with Next.js

## 🚀 Quick Start

### Simple Commands

```bash
# Start the blog server
./blog

# Or explicitly
./blog start

# Stop the server
./blog stop

# Check status
./blog status

# Restart
./blog restart
```

### First Time Setup

1. **Start the server:**
   ```bash
   ./blog start
   ```

2. **Open in browser:**
   - Home: http://localhost:3000
   - Editor: http://localhost:3000/editor
   - Viewer: http://localhost:3000/viewer

3. **Setup GitHub integration:**
   - Click "Setup GitHub" in the editor
   - Generate a Personal Access Token at GitHub
   - Paste the token and save

## 📝 Usage

### Writing Posts

1. Go to http://localhost:3000/editor
2. Choose a post type (TIL, Journal, Blog, 100 Days, Learning)
3. Add category and title
4. Write in markdown with live preview
5. Click "Push to GitHub" to save directly to your repo

### Viewing Posts

1. Go to http://localhost:3000/viewer
2. Filter by type, search, or browse all posts
3. Click "Refresh" to get latest from GitHub
4. Click any post to read full content

### Post Types

- **💡 TIL (Today I Learned)** - Quick technical notes
- **📔 Daily Journal** - Personal reflections and thoughts
- **📝 Dev Blog** - In-depth technical articles
- **💪 100 Days of Code** - Challenge progress tracking
- **📚 Learning Log** - Course and study progress

## 🛠️ Technical Details

### Stack

- **Frontend:** Next.js 15 + React 19 + TypeScript
- **Styling:** Tailwind CSS + Lucide Icons
- **Markdown:** react-markdown + syntax highlighting
- **GitHub API:** Direct integration with Personal Access Tokens

### Project Structure

```
life-editor/
├── src/
│   ├── app/
│   │   ├── editor/         # HackMD-like editor
│   │   ├── viewer/         # Modern post viewer
│   │   └── page.tsx        # Homepage
│   ├── components/         # Shared components
│   ├── lib/
│   │   └── github.ts       # GitHub API service
│   └── types/              # TypeScript definitions
└── blog                    # Server control script
```

### GitHub Integration

The app uses GitHub's REST API to:
- Fetch all markdown files from your repository
- Create/update files directly in GitHub
- Maintain proper commit history
- Support private repositories

## 🔧 Advanced Usage

### Manual Development

```bash
cd life-editor
npm install
npm run dev
```

### Building for Production

```bash
cd life-editor
npm run build
npm start
```

### Environment Variables

Create `.env.local` in `life-editor/` (optional):

```
NEXT_PUBLIC_GITHUB_OWNER=aniketpr01
NEXT_PUBLIC_GITHUB_REPO=life
```

## 🎯 Keyboard Shortcuts

### Editor
- `Cmd/Ctrl + S` - Save to GitHub
- `Cmd/Ctrl + B` - Bold text
- `Cmd/Ctrl + I` - Italic text

### Navigation
- `Cmd/Ctrl + E` - Go to Editor
- `Cmd/Ctrl + V` - Go to Viewer

## 📊 Features Comparison

| Feature | Old HTML Version | New Next.js Version |
|---------|-----------------|-------------------|
| Interface | Basic HTML/CSS | Modern Next.js + Tailwind |
| Editor | Simple textarea | HackMD-like split view |
| Preview | Basic markdown | Rich preview with syntax highlighting |
| GitHub Integration | Manual tokens | Seamless API integration |
| Performance | Client-only | SSR + optimized |
| Mobile Support | Basic | Fully responsive |
| Customization | Limited | Extensive theming |

## 🤝 Contributing

This is a personal knowledge repository, but feel free to fork and customize for your own use!

## 📝 License

MIT License - feel free to use and modify as needed.

---

**Happy writing!** ✍️🌱