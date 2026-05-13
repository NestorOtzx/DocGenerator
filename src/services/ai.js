/**
 * AI documentation service.
 *
 * All supported providers are routed through the GitHub Models inference
 * endpoint so the browser never sends tokens outside the approved GitHub APIs.
 */

import { getProvider } from './aiProviders';
import { getLanguage } from './languages';

const MODELS_ENDPOINT =
  'https://models.github.ai/inference/chat/completions';

const DOCUMENT_MARKERS = {
  readme: '<!-- DOCGEN:README -->',
  architecture: '<!-- DOCGEN:ARCHITECTURE -->',
};

export async function generateRepositoryDocuments(
  repoInfo,
  files,
  token,
  options,
  onChunk,
) {
  const provider = getProvider(options.providerId);
  const language = getLanguage(options.languageCode);
  const repoContext = buildRepoContext(repoInfo, files);
  const stream = options.supportsStreaming !== false;

  const messages = [
    {
      role: 'system',
      content:
        'You are an expert software architect and technical writer. ' +
        `Generate two Markdown documents in ${language.name} for the provided repository: README.md and ARQUITECTURA.md. ` +
        `Start README.md exactly with ${DOCUMENT_MARKERS.readme} followed by a # heading. ` +
        `After README.md, start ARQUITECTURA.md exactly with ${DOCUMENT_MARKERS.architecture} followed by a # heading. ` +
        'README.md must cover project overview, setup, usage, main workflows, security notes, and limitations. ' +
        'ARQUITECTURA.md must cover the architecture diagram, layers, services, data flow, error handling, security, and extension rules. ' +
        'Use proper Markdown headings, fenced code blocks with language hints, tables, and concise lists. ' +
        'Do not include any preamble before the README marker.',
    },
    {
      role: 'user',
      content: repoContext,
    },
  ];

  const res = await fetch(MODELS_ENDPOINT, {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      model: options.modelId,
      messages,
      stream,
      max_tokens: 16000,
      temperature: 0.3,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => res.statusText);
    throw new Error(
      `${provider.name} model error ${res.status}: ${errorText}`,
    );
  }

  if (stream) return readSSEStream(res, onChunk);

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content ?? '';
  onChunk?.(text);
  return text;
}

export function parseGeneratedDocuments(rawMarkdown) {
  const readmeStart = rawMarkdown.indexOf(DOCUMENT_MARKERS.readme);
  const architectureStart = rawMarkdown.indexOf(DOCUMENT_MARKERS.architecture);

  if (readmeStart === -1 && architectureStart === -1) {
    return {
      readme: rawMarkdown,
      architecture: '',
    };
  }

  const readme = extractSection(
    rawMarkdown,
    DOCUMENT_MARKERS.readme,
    DOCUMENT_MARKERS.architecture,
  );
  const architecture = extractSection(
    rawMarkdown,
    DOCUMENT_MARKERS.architecture,
  );

  return { readme, architecture };
}

async function readSSEStream(res, onChunk) {
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let fullText = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop();

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const payload = line.slice(6).trim();
      if (payload === '[DONE]') continue;
      try {
        const parsed = JSON.parse(payload);
        const delta = parsed.choices?.[0]?.delta?.content;
        if (delta) {
          fullText += delta;
          onChunk?.(fullText);
        }
      } catch {
        // Ignore malformed stream lines and keep reading the response.
      }
    }
  }

  return fullText;
}

function extractSection(rawMarkdown, marker, nextMarker) {
  const start = rawMarkdown.indexOf(marker);
  if (start === -1) return '';

  const contentStart = start + marker.length;
  const end = nextMarker
    ? rawMarkdown.indexOf(nextMarker, contentStart)
    : rawMarkdown.length;

  return rawMarkdown
    .slice(contentStart, end === -1 ? rawMarkdown.length : end)
    .trimStart();
}

function buildRepoContext(repoInfo, files) {
  const lines = [];

  lines.push(`Repository: ${repoInfo.full_name}`);
  if (repoInfo.description) lines.push(`Description: ${repoInfo.description}`);
  if (repoInfo.language) lines.push(`Primary language: ${repoInfo.language}`);
  if (repoInfo.topics?.length) {
    lines.push(`Topics: ${repoInfo.topics.join(', ')}`);
  }
  lines.push(`Stars: ${repoInfo.stargazers_count}`);
  lines.push('');
  lines.push('=== File tree ===');
  files.forEach((file) => lines.push(file.path));
  lines.push('');
  lines.push('=== File contents ===');

  for (const file of files) {
    if (!file.content) continue;
    const ext = file.path.split('.').pop() || '';
    lines.push(`\n--- ${file.path} ---`);
    lines.push('```' + ext);
    lines.push(file.content.slice(0, 8000));
    if (file.content.length > 8000) lines.push('[...truncated...]');
    lines.push('```');
  }

  return lines.join('\n');
}
