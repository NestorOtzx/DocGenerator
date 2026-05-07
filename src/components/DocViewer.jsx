import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * Renders the generated Markdown documentation.
 * Shows a live-streaming view while generation is in progress.
 */
export default function DocViewer({ markdown, streaming }) {
  if (!markdown && !streaming) return null;

  return (
    <div className="mt-6 rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={2} className="w-4 h-4">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1={16} y1={13} x2={8} y2={13} />
            <line x1={16} y1={17} x2={8} y2={17} />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          Generated Documentation
          {streaming && (
            <span className="ml-2 flex items-center gap-1 text-violet-600 text-xs font-medium">
              <span className="inline-block w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
              Streaming…
            </span>
          )}
        </div>
      </div>

      {/* Markdown content */}
      <div className="p-6 text-left overflow-x-auto">
        <div className="prose max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {markdown}
          </ReactMarkdown>
          {streaming && (
            <span className="inline-block w-2 h-4 bg-violet-500 animate-pulse ml-0.5 align-text-bottom" />
          )}
        </div>
      </div>
    </div>
  );
}
