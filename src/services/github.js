/**
 * GitHub REST API helpers.
 * All network calls go directly to api.github.com from the browser.
 */

const GITHUB_API = 'https://api.github.com';

/** Parse "owner/repo" or a full github.com URL into { owner, repo } */
export function parseRepoUrl(input) {
  const trimmed = input.trim().replace(/\/$/, '');
  // Full URL: https://github.com/owner/repo
  const urlMatch = trimmed.match(/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?$/);
  if (urlMatch) return { owner: urlMatch[1], repo: urlMatch[2] };
  // Short form: owner/repo
  const shortMatch = trimmed.match(/^([^/]+)\/([^/]+?)(?:\.git)?$/);
  if (shortMatch) return { owner: shortMatch[1], repo: shortMatch[2] };
  return null;
}

/** Fetch repo metadata */
export async function fetchRepoInfo(owner, repo, token) {
  const res = await ghFetch(`/repos/${owner}/${repo}`, token);
  return res;
}

/**
 * Recursively fetch the full file tree (blobs only) up to maxFiles limit.
 * Returns an array of { path, url } objects.
 */
export async function fetchFileTree(owner, repo, token, maxFiles = 200) {
  // Get default branch
  const repoInfo = await fetchRepoInfo(owner, repo, token);
  const branch = repoInfo.default_branch;

  // Use the Git Trees API with recursive=1
  const data = await ghFetch(
    `/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
    token,
  );

  if (!data.tree) throw new Error('Unable to fetch repository tree.');

  // Filter blobs (files) and skip common noise
  const skipPatterns = [
    /node_modules\//,
    /\.git\//,
    /dist\//,
    /build\//,
    /\.min\.(js|css)$/,
    /package-lock\.json$/,
    /yarn\.lock$/,
    /pnpm-lock\.yaml$/,
  ];

  const files = data.tree
    .filter((item) => item.type === 'blob')
    .filter((item) => !skipPatterns.some((p) => p.test(item.path)))
    .slice(0, maxFiles);

  return files.map((item) => ({ path: item.path, sha: item.sha }));
}

/**
 * Fetch content of a single file by sha.
 * Returns decoded text or null if binary / too large.
 */
export async function fetchFileContent(owner, repo, sha, token) {
  try {
    const data = await ghFetch(
      `/repos/${owner}/${repo}/git/blobs/${sha}`,
      token,
    );
    if (data.encoding === 'base64') {
      const decoded = atob(data.content.replace(/\n/g, ''));
      // Skip very large files (> 500 KB decoded) or apparent binary
      if (decoded.length > 500_000) return null;
      if (isBinary(decoded)) return null;
      return decoded;
    }
  } catch {
    // ignore individual file fetch errors
  }
  return null;
}

/** Heuristic: treat content as binary if it contains many null bytes */
function isBinary(text) {
  const sample = text.slice(0, 8000);
  // Check for null bytes without a control-char regex
  let nullCount = 0;
  for (let i = 0; i < sample.length; i++) {
    if (sample.charCodeAt(i) === 0) nullCount++;
  }
  return nullCount > 10;
}

/** Raw fetch wrapper for GitHub API */
async function ghFetch(path, token) {
  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${GITHUB_API}${path}`, { headers });
  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(`GitHub API error ${res.status}: ${msg}`);
  }
  return res.json();
}
