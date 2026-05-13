export default function DownloadButton({
  markdown,
  repoName,
  filenameSuffix = 'documentation',
  label = 'Download .md',
  disabled,
}) {
  const handleDownload = () => {
    const filename = repoName
      ? `${repoName.replace(/[^a-zA-Z0-9_-]/g, '_')}_${filenameSuffix}.md`
      : `${filenameSuffix}.md`;

    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();

    URL.revokeObjectURL(url);
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={disabled || !markdown}
      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg
                 bg-emerald-600 text-white text-sm font-semibold
                 hover:bg-emerald-700 active:scale-95 transition
                 disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth={2} className="w-4 h-4">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1={12} y1={15} x2={12} y2={3} />
      </svg>
      {label}
    </button>
  );
}
