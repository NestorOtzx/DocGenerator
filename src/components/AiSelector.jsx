import { AI_PROVIDERS } from '../services/aiProviders';

export default function AiSelector({ value, onChange, disabled }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-semibold text-gray-700">
        AI Provider
      </label>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm
                   focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent
                   disabled:bg-gray-100 disabled:cursor-not-allowed transition"
      >
        {AI_PROVIDERS.map((provider) => (
          <option key={provider.id} value={provider.id}>
            {provider.name}
          </option>
        ))}
      </select>
    </div>
  );
}
