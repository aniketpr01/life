#!/bin/bash

# Daily Commit Script for Life Repository
# Usage: ./scripts/daily_commit.sh "Your commit message"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get commit message or use default
MESSAGE=${1:-"Daily update: Add new learnings and journal entries"}

echo -e "${YELLOW}📝 Starting daily commit process...${NC}"

# Navigate to repository root
cd "$(dirname "$0")/.." || exit

# Check if there are changes to commit
if [ -z "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}No changes to commit. Repository is clean.${NC}"
    exit 0
fi

# Generate blog view
echo -e "${GREEN}📚 Generating blog view...${NC}"
python3 scripts/generate_blog.py

# Show git status
echo -e "${GREEN}📊 Current git status:${NC}"
git status --short

# Stage all changes
echo -e "${GREEN}📦 Staging all changes...${NC}"
git add .

# Show what will be committed
echo -e "${GREEN}📋 Changes to be committed:${NC}"
git diff --cached --stat

# Commit with message
echo -e "${GREEN}💾 Committing changes...${NC}"
git commit -m "$MESSAGE

📅 $(date '+%B %d, %Y')
🕐 $(date '+%I:%M %p %Z')"

# Push to remote
echo -e "${GREEN}🚀 Pushing to GitHub...${NC}"
git push origin main

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Successfully committed and pushed all changes!${NC}"
    echo -e "${GREEN}🌐 View at: https://github.com/aniketpr01/life${NC}"
else
    echo -e "${RED}❌ Error pushing to GitHub. Please check your connection and try again.${NC}"
    exit 1
fi