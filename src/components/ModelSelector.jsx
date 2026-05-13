import { getModel, getProvider, getProviderModels } from '../services/aiProviders';

export default function ModelSelector({ providerId, value, onChange, disabled }) {
  const provider = getProvider(providerId);
  const models = getProviderModels(providerId);
  const selectedModel = getModel(providerId, value);

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-semibold text-gray-700">
        Model
      </label>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm
                   focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent
                   disabled:bg-gray-100 disabled:cursor-not-allowed transition"
      >
        {models.map((model) => (
          <option key={model.id} value={model.id}>
            {model.name}
          </option>
        ))}
      </select>

      <p className="text-xs text-gray-400">
        {provider.description} Selected model id: <code>{selectedModel.id}</code>.
      </p>
      <p className="text-xs text-gray-400">
        {selectedModel.description}
      </p>
    </div>
  );
}
