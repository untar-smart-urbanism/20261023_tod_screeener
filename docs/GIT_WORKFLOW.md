# Git workflow and commands

Commands are examples. Adapt them to your operating system (macOS/Linux terminal, Windows PowerShell or Git Bash) and to your framework.

## Concepts in plain language
| Term | Meaning (planning-document analogy) |
|---|---|
| Repository | The project file that holds every version of every document |
| Commit | A saved, labelled revision ("Add sources page") |
| Branch | A working copy for one change, kept apart from the approved version (`main`) |
| Push / pull | Upload your revisions to GitHub / download others' revisions |
| Pull request | A request for review before a branch is merged |
| Merge | Accepting the reviewed revision into `main` |
| Issue | A recorded task or requirement, one per feature |

## Flow
Requirement → issue → branch → plan → implement → inspect diff → test → review → merge

## Create and clone
```bash
gh auth login
gh repo create tod-screener --private --clone
cd tod-screener
```

## Everyday commands
```bash
git switch -c feature/sources    # new branch for one change
git status                       # what changed?
git diff --stat                  # which files changed?
git add -A
git commit -m "Add sources page"
git push -u origin feature/sources
gh pr create --fill              # open a pull request
```

## Safety checks
```bash
git check-ignore -v .env         # must print the rule that ignores .env
git log --oneline -5
```

## Inspecting an AI change: five things to look for
1. A new dependency you did not ask for (`package.json`)
2. A hard-coded assumption (e.g. `800` fixed instead of a setting)
3. A secret in code (keys belong in `.env`)
4. Files outside the requested scope
5. Deleted logic or tests
