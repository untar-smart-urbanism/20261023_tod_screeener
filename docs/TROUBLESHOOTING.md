# Troubleshooting

Stuck for more than 3 minutes? Work through this list, then ask for help.

| Symptom | Likely cause | Try |
|---|---|---|
| `Authentication failed` / password rejected | GitHub does not accept account passwords for Git | `gh auth login`, a personal access token, or SSH; check with `gh auth status` |
| `command not found` (Windows: "is not recognized…") | Tool not installed or not on PATH | Install Git / Node.js LTS, then open a **new** terminal |
| `npm install` errors | Dependency or version problem | Read the **first** error; check `node -v`; delete `node_modules/` and reinstall |
| `EADDRINUSE … :5173` | Another dev server is still running | Stop it with Ctrl+C in the other terminal, or use the next port Vite offers |
| Blank page | Runtime error in the browser | Open developer tools → Console; fix the first red error |
| Build broke after a change | The last edit introduced the error | `git restore <file>` or `git stash` to return to the last working version |
