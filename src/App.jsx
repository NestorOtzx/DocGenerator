import { useCallback, useState } from 'react';
import AiSelector from './components/AiSelector';
import ArchitectureViewer from './components/ArchitectureViewer';
import DocViewer from './components/DocViewer';
import DownloadButton from './components/DownloadButton';
import LanguageSelector from './components/LanguageSelector';
import ModelSelector from './components/ModelSelector';
import ProgressBar from './components/ProgressBar';
import RepoInput from './components/RepoInput';
import TokenInput from './components/TokenInput';
import { parseRepoUrl, fetchRepoInfo, fetchFileTree, fetchFileContent } from './services/github';
import {
  generateRepositoryDocuments,
  parseGeneratedDocuments,
} from './services/ai';
import {
  getDefaultModelId,
  getDefaultProviderId,
  getModel,
  getProvider,
} from './services/aiProviders';
import { getDefaultLanguageCode } from './services/languages';

const STEPS = [
  'Fetching repository info',
  'Loading file tree',
  'Reading source files',
  'Generating README and architecture with AI',
];

export default function App() {
  const defaultProviderId = getDefaultProviderId();
  const [providerId, setProviderId] = useState(defaultProviderId);
  const [modelId, setModelId] = useState(() => getDefaultModelId(defaultProviderId));
  const [languageCode, setLanguageCode] = useState(getDefaultLanguageCode());
  const [token, setToken] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [error, setError] = useState(null);
  const [markdown, setMarkdown] = useState('');
  const [architectureMarkdown, setArchitectureMarkdown] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [repoName, setRepoName] = useState('');

  const handleProviderChange = useCallback((nextProviderId) => {
    setProviderId(nextProviderId);
    setModelId(getDefaultModelId(nextProviderId));
  }, []);

  const provider = getProvider(providerId);
  const selectedModel = getModel(providerId, modelId);

  const handleGenerate = useCallback(async () => {
    setError(null);
    setMarkdown('');
    setArchitectureMarkdown('');
    setStreaming(false);

    if (!token.trim()) {
      setError('Please enter your access token.');
      return;
    }

    const parsed = parseRepoUrl(repoUrl);
    if (!parsed) {
      setError(
        'Invalid repository URL. Use https://github.com/owner/repo or owner/repo format.',
      );
      return;
    }

    if (!modelId) {
      setError('Please select an AI model.');
      return;
    }

    const { owner, repo } = parsed;
    setLoading(true);
    setCurrentStep(0);

    try {
      const repoInfo = await fetchRepoInfo(owner, repo, token);
      setRepoName(repoInfo.full_name);

      setCurrentStep(1);
      const files = await fetchFileTree(owner, repo, token);

      setCurrentStep(2);
      const filesWithContent = await loadFileContents(files, owner, repo, token);

      setCurrentStep(3);
      setStreaming(true);

      const rawMarkdown = await generateRepositoryDocuments(
        repoInfo,
        filesWithContent,
        token,
        {
          providerId,
          modelId,
          languageCode,
          supportsStreaming: selectedModel.supportsStreaming,
        },
        (fullText) => {
          const documents = parseGeneratedDocuments(fullText);
          setMarkdown(documents.readme);
          setArchitectureMarkdown(documents.architecture);
        },
      );

      const documents = parseGeneratedDocuments(rawMarkdown);
      setMarkdown(documents.readme);
      setArchitectureMarkdown(documents.architecture);
      setCurrentStep(STEPS.length);
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
      setStreaming(false);
    }
  }, [languageCode, modelId, providerId, repoUrl, selectedModel.supportsStreaming, token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-violet-50 flex flex-col">
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
              Powered by {provider.name}
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            Generate Documentation for Any Public GitHub Repo
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Enter your GitHub token and a public repository URL. DocGenerator will analyze
            the source code and produce README.md plus ARQUITECTURA.md using the selected AI model.
          </p>

          <div className="flex flex-col gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <AiSelector
                value={providerId}
                onChange={handleProviderChange}
                disabled={loading}
              />
              <ModelSelector
                providerId={providerId}
                value={modelId}
                onChange={setModelId}
                disabled={loading}
              />
            </div>
            <LanguageSelector
              value={languageCode}
              onChange={setLanguageCode}
              disabled={loading}
            />
            <TokenInput
              value={token}
              onChange={setToken}
              providerName={provider.name}
              modelName={selectedModel.name}
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

          <details className="mt-4 text-sm text-gray-500">
            <summary className="cursor-pointer font-medium text-gray-600 hover:text-violet-600">
              How to create a token for {provider.name} / {selectedModel.name}?
            </summary>
            <ol className="mt-2 ml-4 list-decimal space-y-1 text-gray-500">
              <li>
                Open the{' '}
                <a
                  href="https://github.com/marketplace/models"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-600 underline"
                >
                  GitHub Models catalog
                </a>
                {' '}and confirm that <strong>{selectedModel.name}</strong> is visible and enabled for your account or organization.
              </li>
              <li>
                Go to{' '}
                <a
                  href="https://github.com/settings/tokens/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-600 underline"
                >
                  GitHub - Settings - Developer settings - Personal access tokens - Fine-grained tokens
                </a>
              </li>
              <li>Click <strong>Generate new token</strong>.</li>
              <li>
                Under <em>Permissions - Models</em> select <strong>Read-only</strong> access
                (required for every IA/model in this selector because all calls go through GitHub Models).
              </li>
              <li>
                Optionally add <strong>Contents: Read-only</strong> if you want private repo support.
              </li>
              <li>
                Copy the token and paste it above. The same token works for OpenAI, Microsoft Phi, DeepSeek, Meta Llama, Mistral, xAI, Cohere, and AI21 models when they are available in your GitHub Models catalog.
              </li>
            </ol>
          </details>
        </div>

        {loading && (
          <ProgressBar steps={STEPS} currentStep={currentStep} />
        )}

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

        {(markdown || architectureMarkdown) && !loading && (
          <div className="mt-4 flex flex-wrap justify-end gap-3">
            <DownloadButton
              markdown={markdown}
              repoName={repoName}
              filenameSuffix="README"
              label="Download README.md"
              disabled={streaming || !markdown}
            />
            <DownloadButton
              markdown={architectureMarkdown}
              repoName={repoName}
              filenameSuffix="ARQUITECTURA"
              label="Download ARQUITECTURA.md"
              disabled={streaming || !architectureMarkdown}
            />
          </div>
        )}

        <DocViewer markdown={markdown} streaming={streaming} />
        <ArchitectureViewer markdown={architectureMarkdown} streaming={streaming} />
      </main>

      <footer className="border-t border-gray-200 bg-white mt-8">
        <div className="max-w-5xl mx-auto px-4 py-4 text-center text-xs text-gray-400">
          DocGenerator - AI docs powered by{' '}
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

async function loadFileContents(files, owner, repo, token, batchSize = 10) {
  const results = [];
  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    const settled = await Promise.allSettled(
      batch.map(async (file) => {
        const content = await fetchFileContent(owner, repo, file.sha, token);
        return { path: file.path, content };
      }),
    );
    settled.forEach((result) => {
      if (result.status === 'fulfilled') results.push(result.value);
    });
  }
  return results;
}
