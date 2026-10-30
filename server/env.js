// Minimal .env loader for the server (no dependency). Existing environment variables win.
// .env is ignored by Git; .env.example documents the names.
import { readFileSync, existsSync } from "node:fs";

export function loadEnv(path = new URL("../.env", import.meta.url)) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
