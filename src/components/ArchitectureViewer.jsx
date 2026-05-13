import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ArchitectureViewer({ markdown, streaming }) {
  if (!markdown && !streaming) return null;

  return (
    <div className="mt-6 rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={2} className="w-4 h-4">
            <path d="M3 3h7v7H3z" />
            <path d="M14 3h7v7h-7z" />
            <path d="M3 14h7v7H3z" />
            <path d="M14 14h7v7h-7z" />
            <path d="M10 6h4" />
            <path d="M6 10v4" />
            <path d="M18 10v4" />
            <path d="M10 18h4" />
          </svg>
          Generated Architecture
          {streaming && (
            <span className="ml-2 flex items-center gap-1 text-violet-600 text-xs font-medium">
              <span className="inline-block w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
              Streaming...
            </span>
          )}
        </div>
      </div>

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
