export const AI_PROVIDERS = [
  {
    id: 'github-copilot',
    name: 'GitHub Copilot',
    description: 'Copilot-style documentation generation using GitHub Models and your GitHub token.',
    models: [
      model('openai/gpt-4.1', 'GPT-4.1', 'Recommended Copilot-compatible default for repository documentation, coding, and long context.'),
      model('openai/gpt-4o', 'GPT-4o', 'Balanced Copilot-compatible model with strong general writing.'),
      model('openai/gpt-4.1-mini', 'GPT-4.1 mini', 'Lower-cost Copilot-compatible option with strong documentation quality.'),
      model('openai/gpt-4o-mini', 'GPT-4o mini', 'Affordable Copilot-compatible model for small or medium repositories.'),
      model('openai/gpt-5', 'GPT-5', 'Reasoning-heavy option when available in GitHub Models.'),
      model('openai/o4-mini', 'o4-mini', 'Fast reasoning model for structured technical writing.'),
    ],
  },
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'Best general-purpose and reasoning models in GitHub Models.',
    models: [
      model('openai/gpt-4.1', 'GPT-4.1', 'Strong default for repository documentation, coding, and long context.'),
      model('openai/gpt-4.1-mini', 'GPT-4.1 mini', 'Lower-cost option with strong coding and documentation quality.'),
      model('openai/gpt-4.1-nano', 'GPT-4.1 nano', 'Fastest GPT-4.1 option for small repositories.'),
      model('openai/gpt-4o', 'GPT-4o', 'Balanced multimodal model with strong general writing.'),
      model('openai/gpt-4o-mini', 'GPT-4o mini', 'Affordable model for small or medium repositories.'),
      model('openai/gpt-5', 'GPT-5', 'Reasoning-heavy option for complex architecture analysis.'),
      model('openai/gpt-5-mini', 'GPT-5 mini', 'Cost-sensitive GPT-5 option.'),
      model('openai/gpt-5-nano', 'GPT-5 nano', 'Low-latency GPT-5 option.'),
      model('openai/gpt-5-chat', 'GPT-5 chat preview', 'Conversational GPT-5 variant when available.'),
      model('openai/o4-mini', 'o4-mini', 'Fast reasoning model for structured technical writing.'),
      model('openai/o3', 'o3', 'Advanced reasoning model for deeper repository analysis.'),
      model('openai/o3-mini', 'o3-mini', 'Smaller reasoning model for documentation tasks.'),
      model('openai/o1', 'o1', 'Older advanced reasoning model.', false),
      model('openai/o1-mini', 'o1-mini', 'Smaller o1 reasoning model.'),
    ],
  },
  {
    id: 'microsoft',
    name: 'Microsoft Phi',
    description: 'Small and efficient Microsoft models available through GitHub Models.',
    models: [
      model('microsoft/phi-4', 'Phi-4', 'Low-latency model for concise documentation.', false),
      model('microsoft/phi-4-reasoning', 'Phi-4 reasoning', 'Reasoning-focused Phi model.'),
      model('microsoft/phi-4-mini-reasoning', 'Phi-4 mini reasoning', 'Lightweight reasoning model.'),
      model('microsoft/phi-4-mini-instruct', 'Phi-4 mini instruct', 'Small instruction model for simple repositories.', false),
      model('microsoft/phi-4-multimodal-instruct', 'Phi-4 multimodal instruct', 'Multimodal Phi variant.'),
      model('microsoft/mai-ds-r1', 'MAI-DS-R1', 'Microsoft-post-trained DeepSeek R1 reasoning model.'),
    ],
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    description: 'Reasoning and coding-oriented DeepSeek models in GitHub Models.',
    models: [
      model('deepseek/deepseek-r1', 'DeepSeek R1', 'Popular reasoning model for architecture analysis.'),
      model('deepseek/deepseek-r1-0528', 'DeepSeek R1 0528', 'Updated DeepSeek R1 reasoning model.'),
      model('deepseek/deepseek-v3-0324', 'DeepSeek V3 0324', 'General-purpose DeepSeek model.'),
    ],
  },
  {
    id: 'meta',
    name: 'Meta Llama',
    description: 'Open-weight Llama models hosted through GitHub Models.',
    models: [
      model('meta/llama-4-maverick-17b-128e-instruct-fp8', 'Llama 4 Maverick', 'Large Llama 4 model for broad documentation tasks.'),
      model('meta/llama-4-scout-17b-16e-instruct', 'Llama 4 Scout', 'Efficient Llama 4 option.'),
      model('meta/llama-3.3-70b-instruct', 'Llama 3.3 70B Instruct', 'Popular open model for text generation.'),
      model('meta/meta-llama-3.1-405b-instruct', 'Llama 3.1 405B Instruct', 'Large Llama 3.1 model when enabled.'),
      model('meta/llama-3.2-90b-vision-instruct', 'Llama 3.2 90B Vision Instruct', 'Vision-capable Llama model.'),
      model('meta/llama-3.2-11b-vision-instruct', 'Llama 3.2 11B Vision Instruct', 'Smaller vision-capable Llama model.'),
      model('meta/meta-llama-3.1-8b-instruct', 'Llama 3.1 8B Instruct', 'Fast small Llama option.'),
    ],
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    description: 'Mistral models, including coding-focused Codestral.',
    models: [
      model('mistral-ai/codestral-2501', 'Codestral 25.01', 'Coding-focused model for codebase documentation.'),
      model('mistral-ai/mistral-medium-2505', 'Mistral Medium 3', 'General-purpose Mistral model.'),
      model('mistral-ai/mistral-small-2503', 'Mistral Small 3.1', 'Efficient Mistral model.'),
      model('mistral-ai/ministral-3b', 'Ministral 3B', 'Small, low-latency model.'),
    ],
  },
  {
    id: 'xai',
    name: 'xAI Grok',
    description: 'Grok models available in GitHub Models.',
    models: [
      model('xai/grok-3', 'Grok 3', 'General-purpose Grok model.', false),
      model('xai/grok-3-mini', 'Grok 3 Mini', 'Lightweight Grok reasoning model.', false),
    ],
  },
  {
    id: 'cohere',
    name: 'Cohere',
    description: 'Command models for structured text generation.',
    models: [
      model('cohere/cohere-command-a', 'Command A', 'Cohere command model for documentation.', false),
      model('cohere/cohere-command-r-plus-08-2024', 'Command R+ 08-2024', 'Stronger Command R model.'),
      model('cohere/cohere-command-r-08-2024', 'Command R 08-2024', 'Efficient Command R model.'),
    ],
  },
  {
    id: 'ai21',
    name: 'AI21 Labs',
    description: 'Large-context AI21 model available in GitHub Models.',
    models: [
      model('ai21-labs/ai21-jamba-1.5-large', 'Jamba 1.5 Large', 'Large-context model for broad repository summaries.'),
    ],
  },
];

export function getProvider(providerId) {
  return AI_PROVIDERS.find((provider) => provider.id === providerId)
    ?? AI_PROVIDERS[0];
}

export function getProviderModels(providerId) {
  return getProvider(providerId).models;
}

export function getDefaultProviderId() {
  return AI_PROVIDERS[0].id;
}

export function getDefaultModelId(providerId) {
  return getProviderModels(providerId)[0]?.id ?? '';
}

export function getModel(providerId, modelId) {
  return getProviderModels(providerId).find((modelItem) => modelItem.id === modelId)
    ?? getProviderModels(providerId)[0];
}

function model(id, name, description, supportsStreaming = true) {
  return { id, name, description, supportsStreaming };
}
