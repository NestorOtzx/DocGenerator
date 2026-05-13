import { useState } from 'react';

export default function TokenInput({ value, onChange, providerName, modelName, disabled }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-semibold text-gray-700">
        Access Token
        <span className="ml-1 text-xs font-normal text-gray-500">
          ({providerName} / {modelName} via GitHub Models needs <code className="bg-gray-100 px-1 rounded text-xs">models:read</code>; optionally <code className="bg-gray-100 px-1 rounded text-xs">repo</code> for private repos)
        </span>
      </label>

      <div className="relative flex items-center">
        <input
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
          autoComplete="off"
          spellCheck={false}
          className="w-full pr-12 pl-4 py-2.5 rounded-lg border border-gray-300 text-sm font-mono
                     focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent
                     disabled:bg-gray-100 disabled:cursor-not-allowed transition"
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          disabled={disabled}
          aria-label={visible ? 'Hide token' : 'Show token'}
          className="absolute right-3 text-gray-400 hover:text-gray-600 transition"
        >
          {visible ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <path d="M17.94 17.94A10.93 10.93 0 0 1 12 19c-7 0-11-7-11-7a21.1 21.1 0 0 1 5.06-6.06M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 7 11 7a21.13 21.13 0 0 1-1.64 2.35M1 1l22 22" />
              <path d="M10.73 10.73A3 3 0 0 0 14.83 14.83" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <path d="M1 12S5 5 12 5s11 7 11 7-4 7-11 7S1 12 1 12z" />
              <circle cx={12} cy={12} r={3} />
            </svg>
          )}
        </button>
      </div>

      <p className="text-xs text-gray-400">
        Your token is used only in-browser and never sent to any server other than GitHub APIs.
      </p>
    </div>
  );
}
