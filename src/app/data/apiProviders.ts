import { ApiProvider } from '../types/apiConfig';

export const apiProviders: ApiProvider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4d/OpenAI_Logo.svg',
    supportsCustomEndpoint: true,
    defaultEndpoint: 'https://api.openai.com/v1',
    models: [
      'gpt-4',
      'gpt-4-turbo',
      'gpt-3.5-turbo',
      'gpt-3.5-turbo-16k',
      'text-embedding-ada-002'
    ],
    additionalParams: [
      {
        name: 'Organization ID',
        key: 'organization',
        type: 'text',
        required: false,
        description: 'OpenAI organization ID (if applicable)'
      }
    ]
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/28/Anthropic_logo.svg',
    supportsCustomEndpoint: false,
    defaultEndpoint: 'https://api.anthropic.com',
    models: [
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307',
      'claude-2.1',
      'claude-2.0',
      'claude-instant-1.2'
    ]
  },
  {
    id: 'google',
    name: 'Google AI',
    logoUrl: 'https://www.gstatic.com/lamda/images/gemini_logo_color_48dp.svg',
    supportsCustomEndpoint: false,
    defaultEndpoint: 'https://generativelanguage.googleapis.com',
    models: [
      'gemini-pro',
      'gemini-pro-vision',
      'gemini-ultra',
      'text-embedding-gecko'
    ]
  },
  {
    id: 'cohere',
    name: 'Cohere',
    logoUrl: 'https://cohere.com/favicon.ico',
    supportsCustomEndpoint: false,
    defaultEndpoint: 'https://api.cohere.ai/v1',
    models: [
      'command',
      'command-light',
      'command-nightly',
      'embed-english-v3.0',
      'embed-multilingual-v3.0'
    ]
  },
  {
    id: 'custom',
    name: 'Custom Provider',
    supportsCustomEndpoint: true,
    models: ['custom'],
    additionalParams: [
      {
        name: 'Request Headers',
        key: 'headers',
        type: 'text',
        required: false,
        description: 'Additional headers in JSON format'
      },
      {
        name: 'Request Format',
        key: 'requestFormat',
        type: 'select',
        required: true,
        default: 'openai',
        options: [
          { value: 'openai', label: 'OpenAI-compatible' },
          { value: 'anthropic', label: 'Anthropic-compatible' },
          { value: 'custom', label: 'Custom (requires implementation)' }
        ],
        description: 'Format of API requests'
      }
    ]
  }
];

export function getProviderById(id: string): ApiProvider | undefined {
  return apiProviders.find(provider => provider.id === id);
}
