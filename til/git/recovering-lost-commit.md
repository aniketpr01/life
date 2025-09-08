# Recovering a Lost Commit in Git

If you accidentally lose a commit (maybe through a bad rebase or reset), you can often recover it using `git reflog`.

```bash
# View the reflog to see recent HEAD movements
git reflog

# Find the commit hash you want to recover
# Then checkout or cherry-pick it
git cherry-pick <lost-commit-hash>
```

**Key Learning:** Git keeps a reference log of where HEAD has been, making most "lost" commits recoverable for about 30 days.

*Date: January 8, 2025*
*Tags: #git #recovery #reflog*