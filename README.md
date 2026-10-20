# StudyNest
A study app for notes, flashcards (spaced repetition), quizzes, exam planning and progress analytics.
React 18 + Vite 6 + React Router 7 + LocalStorage. No backend and no API key needed.

## Run (Windows or any OS, Node 20+)
```
npm ci
npm run dev
npm run build
npm test
```

## Structure
- `src/services/storage.js`: the only file that touches LocalStorage.
- `src/utils/srs.js`: SM-2-style spaced repetition (documented inside).
- `src/utils/quiz.js`: scoring and a heuristic question generator (not an AI model).
- `src/utils/backup.js`: JSON export/import validation, merge and replace.
- `src/pages/Assistant.jsx`: heuristic mode. Set `VITE_AI_ENDPOINT` to your own server-side proxy to add AI. Never put API keys in client code.

## Renamed from StudyOS: compatibility notes
The app was renamed from StudyOS to StudyNest. Some internal identifiers keep the old name on purpose so existing data and backups keep working:
- LocalStorage key `studyos:v1` (and `studyos:v1:corrupt` for the unreadable-data copy).
- The `"app": "StudyOS"` marker inside exported backup files. Backups from before and after the rename import in either direction.

## Rename the GitHub repository and redeploy
1. GitHub: repository, Settings, General, Repository name, enter `studynest`, then Rename. GitHub redirects old URLs, but update them anyway.
2. Update your local remote: `git remote set-url origin https://github.com/<your-username>/studynest.git`
3. If you use GitHub Pages with a project site, the URL becomes `https://<your-username>.github.io/studynest/`. If you set a `base` in `vite.config.js`, change it to `/studynest/`. (None is set by default.)
4. Vercel/Netlify: rename the project in its settings if you want the new subdomain, reconnect the repo if it asks, then trigger a redeploy.
5. Same domain keeps LocalStorage data. A new domain or subdomain starts empty, so use Export JSON on the old site and Import on the new one.
6. Update the repo description, the portfolio and resume links, and screenshot captions (none are bundled in this project).
