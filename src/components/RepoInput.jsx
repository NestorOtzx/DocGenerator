/**
 * Repository URL / short-form input with inline validation feedback.
 */
export default function RepoInput({ value, onChange, onSubmit, disabled, loading }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !disabled && !loading) {
      onSubmit();
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-semibold text-gray-700">
        Public GitHub Repository
      </label>

      <div className="flex gap-2">
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || loading}
          placeholder="https://github.com/owner/repo  or  owner/repo"
          className="flex-1 pl-4 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm
                     focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent
                     disabled:bg-gray-100 disabled:cursor-not-allowed transition"
        />

        <button
          type="button"
          onClick={onSubmit}
          disabled={disabled || loading || !value.trim()}
          className="px-5 py-2.5 rounded-lg bg-violet-600 text-white text-sm font-semibold
                     hover:bg-violet-700 active:scale-95 transition
                     disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <Spinner />
              Generating…
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                <path d="M8 12h8M12 8l4 4-4 4" />
              </svg>
              Generate Docs
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg
      className="w-4 h-4 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx={12} cy={12} r={10}
        stroke="currentColor" strokeWidth={4} />
      <path className="opacity-75" fill="currentColor"
        d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}
