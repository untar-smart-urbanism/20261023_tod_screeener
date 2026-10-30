# Prompt log

Record prompts that worked and prompts that didn't, and what you learned. **Never paste API keys or personal data here.**
Assignment for Meeting 2: at least **one successful** and **one unsuccessful** prompt.

| # | Date | Tool | Goal | Result | Lesson |
|---|---|---|---|---|---|
| 1 | YYYY-MM-DD | Claude / Codex | | ✅ / ❌ | |

---

## Entry template

### [#] Short title: ✅ worked / ❌ did not work
- **Date / tool / model:**
- **Goal:** what I wanted
- **Prompt:**
  ```
  (paste the prompt)
  ```
- **What happened:** files changed, errors, behaviour
- **How I verified it:** checks I ran
- **Lesson / next time:**

---

## Example entries (replace with your own)

### [E1] Sources page: ✅ worked
- **Goal:** add a data-source page.
- **Prompt:** *Context: Vite + React app (see README, AGENTS.md). User: planning team checking where data come from. Objective: add a Sources page listing each dataset's name, file, owner, licence, date and CRS. Existing code: follow app/pages/Home.jsx, register in PAGES in app/App.jsx. Constraints: no new dependencies; don't touch analysis/. Acceptance: page reachable from nav; both sample files listed; no console errors. Verify: tell me the run command and three checks. Inspect first and list the files you'd change. Do not edit yet.*
- **What happened:** the plan listed 2 files; after approval only those changed.
- **Lesson:** naming the files to follow and the acceptance criteria kept the change small.

### [E2] "Add a map": ❌ did not work
- **Prompt:** *add a map*
- **What happened:** the AI added a second mapping library and changed three unrelated files.
- **Lesson / next time:** name the existing library (Leaflet), the data file, and the files it may change.
