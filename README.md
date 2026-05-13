# DocGenerator

AI-powered GitHub repository documentation generator.

## What it does

DocGenerator is a React web application that uses **GitHub Copilot / GitHub Models** to automatically create comprehensive Markdown documentation for any public GitHub repository.

- Enter your **GitHub Personal Access Token** (securely masked, never stored)
- Paste a **public GitHub repository URL**
- Watch documentation stream in real-time as the AI analyses the source code
- **Download** the finished documentation as a `.md` file

## Tech Stack

- **React 19 + Vite** — frontend framework and build tool
- **Tailwind CSS v4** — utility-first styling
- **react-markdown + remark-gfm** — rendered Markdown with GitHub Flavored Markdown support
- **GitHub REST API** — fetches the repository tree and file contents
- **GitHub Models API** (`models.inference.ai.azure.com`) — GPT-4o via GitHub Copilot for documentation generation

## Getting started

### Prerequisites

- Node.js ≥ 18
- A **GitHub Personal Access Token** with:
  - `models:read` permission (required for GitHub Models / Copilot AI)
  - `repo` permission (only needed for private repositories)

### Local development

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

### Build for production

```bash
npm run build
npm run preview
```

## How to create a GitHub token

1. Go to [GitHub Settings → Personal access tokens → Fine-grained tokens](https://github.com/settings/tokens/new).
2. Under **Permissions → Models**, select **Read-only**.
3. Copy the token and paste it into the app.

## Security

Your GitHub token is used **only in the browser** to call:
- `api.github.com` (fetch repo contents)
- `models.inference.ai.azure.com` (GitHub Models AI inference)

It is **never** sent to any third-party server, logged, or persisted in any storage.
