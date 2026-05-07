# SECURITY: how to scrub leaked secrets and PII from this repo

This file documents the one-time cleanup required because two things were committed that should not have been:

1. A live Google Gemini API key in `ai-assistant.js` (`AIzaSy...`).
2. A real assessment with 29 personal attributes in `user_data/assessment_history.json` and `user_data/assessment_results.json`.

Deleting these files in a new commit is not enough. They remain in git history and can still be recovered by anyone who clones the repo. The steps below remove them from history entirely.

> Run these on a clean local clone. Back up the repo first.

## Step 0 — Revoke the leaked Gemini key first

Before anything else, open Google Cloud Console → APIs & Services → Credentials, find the API key starting with `AIzaSyDGef...`, and **delete it**. Then create a new key and store it in a server-side environment variable, never in client-side JS. This step matters even before the scrub, because the key is already public and can be abused right now.

## Step 1 — Install git-filter-repo

`git-filter-repo` is the official replacement for `git filter-branch` and is much faster and safer.

```bash
# macOS
brew install git-filter-repo

# Ubuntu/Debian
sudo apt install git-filter-repo

# pip (cross-platform)
pip install git-filter-repo
```

## Step 2 — Make a fresh mirror clone

Always operate on a fresh mirror so you don't lose anything.

```bash
cd ~
git clone --mirror https://github.com/Tranquil666/PRAKRITI-AI.git PRAKRITI-AI-scrub
cd PRAKRITI-AI-scrub
```

## Step 3 — Remove the user_data directory from all history

```bash
git filter-repo --path user_data --invert-paths
```

This rewrites every commit so `user_data/` never existed.

## Step 4 — Replace the leaked API key string in all history

Create a file called `replacements.txt` with one line:

```
AIzaSyDGeftpKyhZ1dYh03h_dKwWD2CNZ_PirpY==>REDACTED_GEMINI_KEY
```

Then run:

```bash
git filter-repo --replace-text replacements.txt
```

Every occurrence of the key in every commit is replaced with `REDACTED_GEMINI_KEY`.

## Step 5 — Verify

```bash
# Should print nothing
git log -p --all | grep "AIzaSy" || echo "Key removed."

# Should print nothing
git log --all --diff-filter=A -- 'user_data/*' || echo "user_data history removed."
```

## Step 6 — Force-push the rewritten history

```bash
git remote add origin https://github.com/Tranquil666/PRAKRITI-AI.git
git push --force --all
git push --force --tags
```

## Step 7 — Invalidate caches and forks

History rewrites do not affect existing forks or anyone who already cloned the repo. After the force push:

1. Open the GitHub repo settings and consider whether to make the repo private temporarily, then back to public after the rewrite settles.
2. If anyone has forked the repo, the leaked key may still live in their fork. Check the network graph at `https://github.com/Tranquil666/PRAKRITI-AI/network`. If forks exist, ask GitHub Support to expire the cached views (`https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository`).
3. Rotate any other credentials that may have been used alongside the Gemini key (e.g. the same Google Cloud project's OAuth client secrets).

## Step 8 — Add the .gitignore (already added in this commit)

`user_data/`, `.env*`, `*.log`, build outputs, and OS noise are now ignored. Future writes from the app's "save assessment" feature should target `localStorage` only and never touch the repo working tree.

## Step 9 — Move LLM calls server-side

The medium-term fix is to remove the Gemini call from the browser entirely. Suggested architecture:

```
Browser  →  /api/ayurveda-chat  (Vercel/Cloudflare Function)  →  Gemini API
                ▲
                │ key lives in env var
```

A 30-line Vercel function reads `process.env.GEMINI_API_KEY` and forwards the prompt. The browser never sees the key.

---

Any time a secret is committed in the future, follow Steps 1–7 again. A leak that lasts ten minutes on a public repo should be treated as fully exposed.
