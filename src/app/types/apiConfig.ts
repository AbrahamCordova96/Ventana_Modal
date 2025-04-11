export interface ApiProvider {
  id: string;
  name: string;
  logoUrl?: string;
  supportsCustomEndpoint: boolean;
  defaultEndpoint?: string;
  models: string[];
  additionalParams?: ApiProviderParam[];
}

export interface ApiProviderParam {
  name: string;
  key: string;
  type: 'text' | 'number' | 'boolean' | 'select';
  required: boolean;
  default?: string | number | boolean;
  options?: { value: string; label: string }[];
  description?: string;
}

export interface ApiConfig {
  id: string;
  providerId: string;
  name: string;
  apiKey: string;
  model: string;
  endpoint?: string;
  additionalParams?: Record<string, any>;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiConfigInput {
  providerId: string;
  name: string;
  apiKey: string;
  model: string;
  endpoint?: string;
  additionalParams?: Record<string, any>;
  isDefault?: boolean;
}
