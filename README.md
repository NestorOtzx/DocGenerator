# DocGenerator

AI-powered GitHub repository documentation generator.

## Live demo

https://nestorotzx.github.io/DocGenerator/

## What it does

DocGenerator is a React single-page app that uses GitHub Models to generate Markdown documentation for a GitHub repository.

- Select an AI provider and model from the GitHub Models catalog
- Select the documentation language, with English as the default
- Enter a GitHub Personal Access Token
- Paste a public GitHub repository URL
- Generate `README.md` and `ARQUITECTURA.md`
- Preview both documents in the browser
- Download each document as a `.md` file

## Supported model families

The app ships with popular text-generation models available through GitHub Models, including:

- GitHub Copilot as the recommended default workflow
- OpenAI GPT-4.1, GPT-4o, GPT-5, o-series
- Microsoft Phi and MAI-DS-R1
- DeepSeek R1 and V3
- Meta Llama
- Mistral and Codestral
- xAI Grok
- Cohere Command
- AI21 Jamba

Availability depends on your GitHub Models catalog, account, organization, and token permissions.

## Tech Stack

- **React 19 + Vite** - frontend framework and build tool
- **Tailwind CSS v4** - utility-first styling
- **react-markdown + remark-gfm** - rendered Markdown with GitHub Flavored Markdown support
- **GitHub REST API** - fetches the repository tree and file contents
- **GitHub Models API** (`models.github.ai`) - runs the selected AI model

## Getting started

### Prerequisites

- Node.js >= 18
- A GitHub Personal Access Token with:
  - `models:read` permission for GitHub Models
  - `repo` or repository contents read access only if you want private repository support

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

## Deploy to GitHub Pages

```bash
npm run deploy
```

This publishes the `dist` folder to the `gh-pages` branch.  
The app is configured to be served from `/DocGenerator/`.

## How to create a GitHub token

1. Open the [GitHub Models catalog](https://github.com/marketplace/models) and confirm that the selected model is visible for your account or organization.
2. Go to [GitHub Settings - Personal access tokens - Fine-grained tokens](https://github.com/settings/tokens/new).
3. Under **Permissions - Models**, select **Read-only**.
4. Optionally add **Contents: Read-only** for private repository support.
5. Copy the token and paste it into the app.

The same token is used for every provider in the selector because all model calls go through GitHub Models.

## Security

Your token is used only in the browser to call:

- `api.github.com`
- `models.github.ai`

It is never sent to a custom backend, logged, or persisted in browser storage.
