import { useState, useRef, useCallback } from 'react';
import TokenInput from './components/TokenInput';
import RepoInput from './components/RepoInput';
import DocViewer from './components/DocViewer';
import DownloadButton from './components/DownloadButton';
import ProgressBar from './components/ProgressBar';
import { parseRepoUrl, fetchRepoInfo, fetchFileTree, fetchFileContent } from './services/github';
import { generateDocumentation } from './services/copilot';

const STEPS = [
  'Fetching repository info',
  'Loading file tree',
  'Reading source files',
  'Generating documentation with AI',
];

export default function App() {
  const [token, setToken] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [error, setError] = useState(null);
  const [markdown, setMarkdown] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [repoName, setRepoName] = useState('');

  const markdownRef = useRef('');

  const handleGenerate = useCallback(async () => {
    setError(null);
    setMarkdown('');
    markdownRef.current = '';
    setStreaming(false);

    // Validate inputs
    if (!token.trim()) {
      setError('Please enter your GitHub Personal Access Token.');
      return;
    }

    const parsed = parseRepoUrl(repoUrl);
    if (!parsed) {
      setError(
        'Invalid repository URL. Use https://github.com/owner/repo or owner/repo format.',
      );
      return;
    }

    const { owner, repo } = parsed;
    setLoading(true);
    setCurrentStep(0);

    try {
      // Step 1: Fetch repo metadata
      const repoInfo = await fetchRepoInfo(owner, repo, token);
      setRepoName(repoInfo.full_name);

      // Step 2: Fetch file tree
      setCurrentStep(1);
      const files = await fetchFileTree(owner, repo, token);

      // Step 3: Load file contents in parallel (batches of 10)
      setCurrentStep(2);
      const filesWithContent = await loadFileContents(files, owner, repo, token);

      // Step 4: Generate documentation
      setCurrentStep(3);
      setStreaming(true);

      await generateDocumentation(repoInfo, filesWithContent, token, (chunk) => {
        markdownRef.current += chunk;
        setMarkdown(markdownRef.current);
      });

      setCurrentStep(STEPS.length); // all done
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
      setStreaming(false);
    }
  }, [token, repoUrl]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-violet-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-violet-600 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
              stroke="white" strokeWidth={2} className="w-5 h-5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1={16} y1={13} x2={8} y2={13} />
              <line x1={16} y1={17} x2={8} y2={17} />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">DocGenerator</h1>
            <p className="text-xs text-gray-500">AI-powered GitHub repository documentation</p>
          </div>
          <div className="ml-auto">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
              bg-violet-100 text-violet-700 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
              Powered by GitHub Copilot
            </span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        {/* Intro card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            Generate Documentation for Any Public GitHub Repo
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Enter your GitHub token and a public repository URL. DocGenerator will analyse
            the source code and produce comprehensive Markdown documentation using GitHub Copilot.
          </p>

          <div className="flex flex-col gap-4">
            <TokenInput
              value={token}
              onChange={setToken}
              disabled={loading}
            />
            <RepoInput
              value={repoUrl}
              onChange={setRepoUrl}
              onSubmit={handleGenerate}
              disabled={loading}
              loading={loading}
            />
          </div>

          {/* How to get a token */}
          <details className="mt-4 text-sm text-gray-500">
            <summary className="cursor-pointer font-medium text-gray-600 hover:text-violet-600">
              How to create a GitHub token?
            </summary>
            <ol className="mt-2 ml-4 list-decimal space-y-1 text-gray-500">
              <li>
                Go to{' '}
                <a
                  href="https://github.com/settings/tokens/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-600 underline"
                >
                  GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens
                </a>
              </li>
              <li>Click <strong>Generate new token</strong>.</li>
              <li>
                Under <em>Permissions → Models</em> select <strong>Read-only</strong> access
                (needed for GitHub Models / Copilot AI).
              </li>
              <li>
                Optionally add <strong>Contents: Read-only</strong> if you want private repo support.
              </li>
              <li>Copy the token and paste it above.</li>
            </ol>
          </details>
        </div>

        {/* Progress */}
        {loading && (
          <ProgressBar steps={STEPS} currentStep={currentStep} />
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth={2}
              className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5">
              <circle cx={12} cy={12} r={10} />
              <line x1={12} y1={8} x2={12} y2={12} />
              <line x1={12} y1={16} x2={12} y2={16} />
            </svg>
            <div>
              <p className="text-sm font-semibold text-red-700">Error</p>
              <p className="text-sm text-red-600 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Download button (when done) */}
        {markdown && !loading && (
          <div className="mt-4 flex justify-end">
            <DownloadButton
              markdown={markdown}
              repoName={repoName}
              disabled={streaming}
            />
          </div>
        )}

        {/* Documentation viewer */}
        <DocViewer markdown={markdown} streaming={streaming} />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-8">
        <div className="max-w-5xl mx-auto px-4 py-4 text-center text-xs text-gray-400">
          DocGenerator — AI docs powered by{' '}
          <a
            href="https://docs.github.com/en/github-models"
            target="_blank"
            rel="noopener noreferrer"
            className="text-violet-500 hover:underline"
          >
            GitHub Models
          </a>
          . Your token is never stored.
        </div>
      </footer>
    </div>
  );
}

/** Load file contents in parallel batches */
async function loadFileContents(files, owner, repo, token, batchSize = 10) {
  const results = [];
  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    const settled = await Promise.allSettled(
      batch.map(async (f) => {
        const content = await fetchFileContent(owner, repo, f.sha, token);
        return { path: f.path, content };
      }),
    );
    settled.forEach((r) => {
      if (r.status === 'fulfilled') results.push(r.value);
    });
  }
  return results;
}
