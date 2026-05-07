/**
 * GitHub Models / Copilot AI service.
 *
 * Uses the GitHub Models inference endpoint which accepts a GitHub PAT
 * with models:read scope (same token used for the GitHub API).
 *
 * Endpoint: https://models.inference.ai.azure.com/chat/completions
 * Docs: https://docs.github.com/en/github-models
 */

const MODELS_ENDPOINT =
  'https://models.inference.ai.azure.com/chat/completions';

const MODEL = 'gpt-4o';

/**
 * Generate full repository documentation using GitHub Copilot / GitHub Models.
 *
 * @param {object} repoInfo   - repo metadata from GitHub API
 * @param {Array}  files      - [{ path, content }] array of source files
 * @param {string} token      - GitHub PAT (models:read scope)
 * @param {function} onChunk  - called with each streamed text chunk
 * @returns {Promise<string>} - complete markdown documentation
 */
export async function generateDocumentation(repoInfo, files, token, onChunk) {
  const repoContext = buildRepoContext(repoInfo, files);

  const messages = [
    {
      role: 'system',
      content:
        'You are an expert technical writer. Generate comprehensive, well-structured Markdown documentation for the provided GitHub repository. ' +
        'Cover: project overview, architecture, key components, setup/installation, usage examples, API reference (if applicable), and contribution guidelines. ' +
        'Use proper Markdown headings, code blocks with language hints, tables, and bullet lists. ' +
        'Be thorough and developer-friendly. Do NOT include a preamble—start directly with the # title.',
    },
    {
      role: 'user',
      content: repoContext,
    },
  ];

  const res = await fetch(MODELS_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      stream: true,
      // 16 000 tokens ≈ ~12 000 words of output — sufficient for full-repo docs
      // while staying within GPT-4o's 16 384 output token limit.
      max_tokens: 16000,
      temperature: 0.3,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => res.statusText);
    throw new Error(`AI API error ${res.status}: ${errorText}`);
  }

  return readSSEStream(res, onChunk);
}

/** Read a Server-Sent Events stream from the Models API */
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
    buffer = lines.pop(); // keep incomplete line

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const payload = line.slice(6).trim();
      if (payload === '[DONE]') continue;
      try {
        const parsed = JSON.parse(payload);
        const delta = parsed.choices?.[0]?.delta?.content;
        if (delta) {
          fullText += delta;
          onChunk?.(delta);
        }
      } catch {
        // skip malformed SSE line
      }
    }
  }

  return fullText;
}

/** Build the prompt context from repo info and file contents */
function buildRepoContext(repoInfo, files) {
  const lines = [];

  lines.push(`Repository: ${repoInfo.full_name}`);
  if (repoInfo.description) lines.push(`Description: ${repoInfo.description}`);
  if (repoInfo.language) lines.push(`Primary language: ${repoInfo.language}`);
  if (repoInfo.topics?.length)
    lines.push(`Topics: ${repoInfo.topics.join(', ')}`);
  lines.push(`Stars: ${repoInfo.stargazers_count}`);
  lines.push('');
  lines.push('=== File tree ===');
  files.forEach((f) => lines.push(f.path));
  lines.push('');
  lines.push('=== File contents ===');

  for (const file of files) {
    if (!file.content) continue;
    const ext = file.path.split('.').pop() || '';
    lines.push(`\n--- ${file.path} ---`);
    lines.push('```' + ext);
    // Truncate very large individual files in the prompt
    lines.push(file.content.slice(0, 8000));
    if (file.content.length > 8000) lines.push('[...truncated...]');
    lines.push('```');
  }

  return lines.join('\n');
}
