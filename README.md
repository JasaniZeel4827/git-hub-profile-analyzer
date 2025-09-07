# GitHub Profile Finder & Analyzer

A Next.js 15 app that lets you search any GitHub username and instantly view a polished profile plus smart analytics, including total stars, top languages, top repositories, account age (in days), and more.

## Features
- **Search GitHub users** and display profile details (name, bio, location, company, blog, followers/following, public repos)
- **Analytics summary**
  - Total stars across repositories
  - Language distribution (count of repos per language)
  - Top repositories by stars
  - Account age (days since account creation)
  - Total repositories fetched
- **Recent searches** stored locally for quick reuse
- **Beautiful UI** using shadcn/ui, Radix primitives, Tailwind CSS
- **Light/Dark mode** with a simple theme toggle

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript, React 19
- **Styling**: Tailwind CSS, tailwind-merge, tailwindcss-animate
- **UI**: shadcn/ui components (Radix UI), lucide-react icons
- **Charts**: recharts (used in analytics component)

## Project Structure
```
app/
  api/
    github/
      user/[username]/route.ts     # Fetch GitHub user profile
      repos/[username]/route.ts    # Fetch user repositories (first 100)
  page.tsx                         # Main page: search + profile + analytics
components/
  profile-analytics.tsx            # Analytics UI (languages, stars, top repos)
  theme-toggle.tsx                 # Light/Dark mode toggle
  ui/*                             # shadcn/ui components
lib/
  utils.ts                         # Utility helpers
styles/, public/, tailwind.config.ts, tsconfig.json, etc.
```

## API Routes (Internal)
These routes proxy GitHub’s REST API and are used by the client.

- `GET /api/github/user/[username]`
  - Proxies `GET https://api.github.com/users/[username]`
  - Returns the GitHub user profile JSON

- `GET /api/github/repos/[username]`
  - Proxies `GET https://api.github.com/users/[username]/repos?per_page=100&sort=updated&direction=desc`
  - Returns up to 100 repos (sorted by last update) for analytics

Notes:
- Calls include headers `Accept: application/vnd.github.v3+json` and a `User-Agent` string.
- These endpoints do not use authentication by default; unauthenticated GitHub API requests are rate-limited (typically 60 requests/hour per IP). See Troubleshooting below.

## Getting Started

### Prerequisites
- Node.js 18+ recommended
- pnpm (preferred) or npm/yarn

### Install
```bash
pnpm install
# or
npm install
```

### Run Dev Server
```bash
pnpm dev
# or
npm run dev
```
Then open `http://localhost:3000`.

### Build and Start (Production)
```bash
pnpm build
pnpm start
# or
npm run build
npm start
```

## Usage
1. Open the app and enter a GitHub username (e.g., `vercel`, `torvalds`).
2. Submit to fetch the profile and repositories.
3. Explore the analytics panel for stars, languages, top repos, and account age.
4. Click a repo or the profile link to open it on GitHub.
5. Reuse recent searches via the badges under the search bar.

## Customization Tips
- UI theming is handled via shadcn/ui + Tailwind. Update styles in `app/globals.css` or component classes.
- Analytics logic is computed in `app/page.tsx` after repos are fetched. Extend it to add metrics like average stars per repo, forks, issues, commit activity (requires additional endpoints), etc.
- `components/profile-analytics.tsx` is the place to modify analytics visualizations.




