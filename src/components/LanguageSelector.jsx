import { DOCUMENTATION_LANGUAGES } from '../services/languages';

export default function LanguageSelector({ value, onChange, disabled }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-semibold text-gray-700">
        Documentation Language
      </label>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm
                   focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent
                   disabled:bg-gray-100 disabled:cursor-not-allowed transition"
      >
        {DOCUMENTATION_LANGUAGES.map((language) => (
          <option key={language.code} value={language.code}>
            {language.name}
          </option>
        ))}
      </select>

      <p className="text-xs text-gray-400">
        English is the default language for generated README.md and ARQUITECTURA.md.
      </p>
    </div>
  );
}
