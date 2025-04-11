import { nanoid } from 'nanoid';
import { db } from './database';
import { ApiConfig, ApiConfigInput } from '../types/apiConfig';

export async function getAllApiConfigs(): Promise<ApiConfig[]> {
  return await db.apiConfigs.toArray();
}

export async function getApiConfigById(id: string): Promise<ApiConfig | undefined> {
  return await db.apiConfigs.get(id);
}

export async function getDefaultApiConfig(): Promise<ApiConfig | undefined> {
  return await db.apiConfigs.filter(config => config.isDefault).first();
}

export async function addApiConfig(input: ApiConfigInput): Promise<string> {
  const id = nanoid();
  const now = new Date();
  
  // If this is the first config or isDefault is true, make sure it's the only default
  let isDefault = input.isDefault ?? false;
  
  if (isDefault) {
    // Clear any existing defaults
    await db.apiConfigs.filter(config => config.isDefault).modify({ isDefault: false });
  } else {
    // If no configs exist yet, make this the default
    const count = await db.apiConfigs.count();
    if (count === 0) {
      isDefault = true;
    }
  }
  
  const apiConfig: ApiConfig = {
    id,
    providerId: input.providerId,
    name: input.name,
    apiKey: input.apiKey,
    model: input.model,
    endpoint: input.endpoint,
    additionalParams: input.additionalParams,
    isDefault,
    createdAt: now,
    updatedAt: now
  };
  
  await db.apiConfigs.add(apiConfig);
  return id;
}

export async function updateApiConfig(id: string, input: Partial<ApiConfigInput>): Promise<void> {
  const config = await db.apiConfigs.get(id);
  if (!config) {
    throw new Error(`API configuration with ID ${id} not found`);
  }
  
  const updates: Partial<ApiConfig> = {
    ...input,
    updatedAt: new Date()
  };
  
  // If setting this as default, clear other defaults
  if (input.isDefault) {
    await db.apiConfigs.filter(config => config.id !== id && config.isDefault).modify({ isDefault: false });
  }
  
  await db.apiConfigs.update(id, updates);
}

export async function deleteApiConfig(id: string): Promise<void> {
  const config = await db.apiConfigs.get(id);
  if (!config) {
    throw new Error(`API configuration with ID ${id} not found`);
  }
  
  await db.apiConfigs.delete(id);
  
  // If this was the default config, set another one as default if available
  if (config.isDefault) {
    const firstConfig = await db.apiConfigs.first();
    if (firstConfig) {
      await db.apiConfigs.update(firstConfig.id, { isDefault: true });
    }
  }
}

export async function testApiConnection(config: ApiConfigInput): Promise<{ success: boolean; message: string }> {
  try {
    // Implement provider-specific connection tests
    switch (config.providerId) {
      case 'openai':
        return await testOpenAIConnection(config);
      case 'anthropic':
        return await testAnthropicConnection(config);
      case 'google':
        return await testGoogleAIConnection(config);
      case 'cohere':
        return await testCohereConnection(config);
      case 'custom':
        return await testCustomConnection(config);
      default:
        return { success: false, message: 'Unknown provider' };
    }
  } catch (error) {
    console.error('Error testing API connection:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

async function testOpenAIConnection(config: ApiConfigInput): Promise<{ success: boolean; message: string }> {
  const endpoint = config.endpoint || 'https://api.openai.com/v1';
  const url = `${endpoint}/models`;
  
  try {
    const headers: HeadersInit = {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json'
    };
    
    if (config.additionalParams?.organization) {
      headers['OpenAI-Organization'] = config.additionalParams.organization;
    }
    
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      const error = await response.json().catch(() => null);
      return { 
        success: false, 
        message: error?.error?.message || `Error: ${response.status} ${response.statusText}` 
      };
    }
    
    return { success: true, message: 'Connection successful' };
  } catch (error) {
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Network error occurred' 
    };
  }
}

async function testAnthropicConnection(config: ApiConfigInput): Promise<{ success: boolean; message: string }> {
  const url = 'https://api.anthropic.com/v1/messages';
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 1
      })
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => null);
      return { 
        success: false, 
        message: error?.error?.message || `Error: ${response.status} ${response.statusText}` 
      };
    }
    
    return { success: true, message: 'Connection successful' };
  } catch (error) {
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Network error occurred' 
    };
  }
}

async function testGoogleAIConnection(config: ApiConfigInput): Promise<{ success: boolean; message: string }> {
  const url = `https://generativelanguage.googleapis.com/v1/models?key=${config.apiKey}`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      const error = await response.json().catch(() => null);
      return { 
        success: false, 
        message: error?.error?.message || `Error: ${response.status} ${response.statusText}` 
      };
    }
    
    return { success: true, message: 'Connection successful' };
  } catch (error) {
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Network error occurred' 
    };
  }
}

async function testCohereConnection(config: ApiConfigInput): Promise<{ success: boolean; message: string }> {
  const url = 'https://api.cohere.ai/v1/models';
  
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => null);
      return { 
        success: false, 
        message: error?.error?.message || `Error: ${response.status} ${response.statusText}` 
      };
    }
    
    return { success: true, message: 'Connection successful' };
  } catch (error) {
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Network error occurred' 
    };
  }
}

async function testCustomConnection(config: ApiConfigInput): Promise<{ success: boolean; message: string }> {
  if (!config.endpoint) {
    return { success: false, message: 'Endpoint URL is required for custom providers' };
  }
  
  try {
    // For custom providers, we'll just check if the endpoint is reachable
    const response = await fetch(config.endpoint, {
      method: 'HEAD',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`
      }
    });
    
    // Even if we get an error response, if we can reach the server, consider it a partial success
    return { 
      success: response.ok, 
      message: response.ok ? 'Connection successful' : 
        `Server reached but returned: ${response.status} ${response.statusText}` 
    };
  } catch (error) {
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Network error occurred' 
    };
  }
}
