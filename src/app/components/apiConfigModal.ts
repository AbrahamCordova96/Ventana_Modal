import { makeElementDraggable } from '../utils/draggable';
import { ApiConfig, ApiConfigInput, ApiProvider } from '../types/apiConfig';
import { apiProviders, getProviderById } from '../data/apiProviders';
import { 
  addApiConfig, 
  updateApiConfig, 
  deleteApiConfig, 
  testApiConnection 
} from '../data/apiConfigRepository';

interface ApiConfigModalOptions {
  position?: { x: number; y: number };
  size?: { width: number; height: number };
  onClose?: () => void;
  onSave?: (config: ApiConfig) => void;
  existingConfig?: ApiConfig;
}

export function createApiConfigModal(options: ApiConfigModalOptions = {}): HTMLElement {
  const position = options.position || { 
    x: window.innerWidth / 2 - 250, 
    y: window.innerHeight / 2 - 300 
  };
  
  const size = options.size || { width: 500, height: 600 };
  const existingConfig = options.existingConfig;
  const isEditMode = !!existingConfig;
  
  // Create the modal container
  const modal = document.createElement('div');
  modal.className = 'modal api-config-modal';
  modal.style.left = `${position.x}px`;
  modal.style.top = `${position.y}px`;
  modal.style.width = `${size.width}px`;
  modal.style.height = `${size.height}px`;
  modal.style.zIndex = '10000'; // Higher than the main modal
  
  // Create the modal header
  const header = document.createElement('div');
  header.className = 'modal-header';
  
  const title = document.createElement('div');
  title.className = 'modal-title';
  title.textContent = isEditMode ? 'Edit API Configuration' : 'Add API Configuration';
  
  const closeBtn = document.createElement('button');
  closeBtn.className = 'modal-btn';
  closeBtn.innerHTML = '&times;';
  closeBtn.title = 'Close';
  closeBtn.addEventListener('click', () => {
    modal.remove();
    if (options.onClose) options.onClose();
  });
  
  header.appendChild(title);
  header.appendChild(closeBtn);
  
  // Create the modal content
  const content = document.createElement('div');
  content.className = 'modal-content';
  
  // Create the form
  const form = document.createElement('form');
  form.className = 'api-config-form';
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleFormSubmit();
  });
  
  // Create form fields
  const formFields = document.createElement('div');
  formFields.className = 'form-fields';
  
  // Configuration name field
  const nameField = createFormField({
    label: 'Configuration Name',
    type: 'text',
    id: 'config-name',
    required: true,
    value: existingConfig?.name || '',
    placeholder: 'My API Configuration'
  });
  
  // Provider selection field
  const providerField = createProviderSelectField(existingConfig?.providerId);
  
  // API Key field
  const apiKeyField = createFormField({
    label: 'API Key',
    type: 'password',
    id: 'api-key',
    required: true,
    value: existingConfig?.apiKey || '',
    placeholder: 'Enter your API key'
  });
  
  // Add show/hide toggle for API key
  const apiKeyInput = apiKeyField.querySelector('input') as HTMLInputElement;
  const toggleBtn = document.createElement('button');
  toggleBtn.type = 'button';
  toggleBtn.className = 'toggle-password-btn';
  toggleBtn.textContent = 'Show';
  toggleBtn.addEventListener('click', () => {
    if (apiKeyInput.type === 'password') {
      apiKeyInput.type = 'text';
      toggleBtn.textContent = 'Hide';
    } else {
      apiKeyInput.type = 'password';
      toggleBtn.textContent = 'Show';
    }
  });
  apiKeyField.querySelector('.input-wrapper')?.appendChild(toggleBtn);
  
  // Dynamic fields container
  const dynamicFields = document.createElement('div');
  dynamicFields.className = 'dynamic-fields';
  
  // Initial dynamic fields based on selected provider
  updateDynamicFields(
    existingConfig?.providerId || apiProviders[0].id, 
    dynamicFields, 
    existingConfig
  );
  
  // Add fields to form
  formFields.appendChild(nameField);
  formFields.appendChild(providerField);
  formFields.appendChild(apiKeyField);
  formFields.appendChild(dynamicFields);
  
  // Test connection button
  const testConnectionBtn = document.createElement('button');
  testConnectionBtn.type = 'button';
  testConnectionBtn.className = 'test-connection-btn';
  testConnectionBtn.textContent = 'Test Connection';
  testConnectionBtn.addEventListener('click', async () => {
    await testConnection();
  });
  
  // Status message container
  const statusMessage = document.createElement('div');
  statusMessage.className = 'status-message';
  
  // Form actions
  const formActions = document.createElement('div');
  formActions.className = 'form-actions';
  
  const cancelBtn = document.createElement('button');
  cancelBtn.type = 'button';
  cancelBtn.className = 'cancel-btn';
  cancelBtn.textContent = 'Cancel';
  cancelBtn.addEventListener('click', () => {
    modal.remove();
    if (options.onClose) options.onClose();
  });
  
  const saveBtn = document.createElement('button');
  saveBtn.type = 'submit';
  saveBtn.className = 'save-btn';
  saveBtn.textContent = isEditMode ? 'Update' : 'Save';
  
  // Delete button (only for edit mode)
  if (isEditMode) {
    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', async () => {
      if (confirm('Are you sure you want to delete this configuration?')) {
        try {
          await deleteApiConfig(existingConfig.id);
          modal.remove();
          if (options.onClose) options.onClose();
        } catch (error) {
          showStatus('error', `Error deleting configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    });
    formActions.appendChild(deleteBtn);
  }
  
  formActions.appendChild(cancelBtn);
  formActions.appendChild(saveBtn);
  
  // Add everything to the form
  form.appendChild(formFields);
  form.appendChild(testConnectionBtn);
  form.appendChild(statusMessage);
  form.appendChild(formActions);
  
  // Add form to content
  content.appendChild(form);
  
  // Assemble the modal
  modal.appendChild(header);
  modal.appendChild(content);
  
  // Make the modal draggable by its header
  makeElementDraggable(modal, header);
  
  // Function to update dynamic fields based on selected provider
  function updateDynamicFields(
    providerId: string, 
    container: HTMLElement, 
    config?: ApiConfig
  ) {
    // Clear existing fields
    container.innerHTML = '';
    
    const provider = getProviderById(providerId);
    if (!provider) return;
    
    // Add model selection field
    const modelField = createSelectField({
      label: 'Model',
      id: 'model',
      required: true,
      options: provider.models.map(model => ({ value: model, label: model })),
      value: config?.model || provider.models[0]
    });
    container.appendChild(modelField);
    
    // Add endpoint field if provider supports custom endpoints
    if (provider.supportsCustomEndpoint) {
      const endpointField = createFormField({
        label: 'API Endpoint',
        type: 'url',
        id: 'endpoint',
        required: false,
        value: config?.endpoint || provider.defaultEndpoint || '',
        placeholder: 'https://api.example.com'
      });
      container.appendChild(endpointField);
    }
    
    // Add additional provider-specific parameters
    if (provider.additionalParams) {
      for (const param of provider.additionalParams) {
        let field;
        
        if (param.type === 'select' && param.options) {
          field = createSelectField({
            label: param.name,
            id: `param-${param.key}`,
            required: param.required,
            options: param.options,
            value: config?.additionalParams?.[param.key] || param.default || '',
            description: param.description
          });
        } else {
          field = createFormField({
            label: param.name,
            type: param.type === 'number' ? 'number' : 'text',
            id: `param-${param.key}`,
            required: param.required,
            value: config?.additionalParams?.[param.key] || param.default || '',
            placeholder: `Enter ${param.name.toLowerCase()}`,
            description: param.description
          });
        }
        
        container.appendChild(field);
      }
    }
    
    // Add "Set as Default" checkbox
    const defaultCheckboxWrapper = document.createElement('div');
    defaultCheckboxWrapper.className = 'form-field checkbox-field';
    
    const defaultCheckbox = document.createElement('input');
    defaultCheckbox.type = 'checkbox';
    defaultCheckbox.id = 'is-default';
    defaultCheckbox.checked = config?.isDefault || false;
    
    const defaultCheckboxLabel = document.createElement('label');
    defaultCheckboxLabel.htmlFor = 'is-default';
    defaultCheckboxLabel.textContent = 'Set as default configuration';
    
    defaultCheckboxWrapper.appendChild(defaultCheckbox);
    defaultCheckboxWrapper.appendChild(defaultCheckboxLabel);
    
    container.appendChild(defaultCheckboxWrapper);
  }
  
  // Function to create a provider select field
  function createProviderSelectField(selectedProviderId?: string): HTMLElement {
    const fieldWrapper = document.createElement('div');
    fieldWrapper.className = 'form-field';
    
    const label = document.createElement('label');
    label.htmlFor = 'provider';
    label.textContent = 'Provider';
    
    const select = document.createElement('select');
    select.id = 'provider';
    select.name = 'provider';
    select.required = true;
    
    // Add options for each provider
    for (const provider of apiProviders) {
      const option = document.createElement('option');
      option.value = provider.id;
      option.textContent = provider.name;
      
      if (provider.id === (selectedProviderId || apiProviders[0].id)) {
        option.selected = true;
      }
      
      select.appendChild(option);
    }
    
    // Update dynamic fields when provider changes
    select.addEventListener('change', () => {
      updateDynamicFields(select.value, dynamicFields);
    });
    
    fieldWrapper.appendChild(label);
    fieldWrapper.appendChild(select);
    
    return fieldWrapper;
  }
  
  // Function to create a form field
  function createFormField({
    label,
    type,
    id,
    required,
    value = '',
    placeholder = '',
    description = ''
  }: {
    label: string;
    type: string;
    id: string;
    required: boolean;
    value?: string;
    placeholder?: string;
    description?: string;
  }): HTMLElement {
    const fieldWrapper = document.createElement('div');
    fieldWrapper.className = 'form-field';
    
    const labelElement = document.createElement('label');
    labelElement.htmlFor = id;
    labelElement.textContent = label;
    
    if (required) {
      const requiredMark = document.createElement('span');
      requiredMark.className = 'required-mark';
      requiredMark.textContent = ' *';
      labelElement.appendChild(requiredMark);
    }
    
    const inputWrapper = document.createElement('div');
    inputWrapper.className = 'input-wrapper';
    
    const input = document.createElement('input');
    input.type = type;
    input.id = id;
    input.name = id;
    input.value = value;
    input.placeholder = placeholder;
    input.required = required;
    
    inputWrapper.appendChild(input);
    
    fieldWrapper.appendChild(labelElement);
    fieldWrapper.appendChild(inputWrapper);
    
    if (description) {
      const descriptionElement = document.createElement('div');
      descriptionElement.className = 'field-description';
      descriptionElement.textContent = description;
      fieldWrapper.appendChild(descriptionElement);
    }
    
    return fieldWrapper;
  }
  
  // Function to create a select field
  function createSelectField({
    label,
    id,
    required,
    options,
    value = '',
    description = ''
  }: {
    label: string;
    id: string;
    required: boolean;
    options: { value: string; label: string }[];
    value?: string;
    description?: string;
  }): HTMLElement {
    const fieldWrapper = document.createElement('div');
    fieldWrapper.className = 'form-field';
    
    const labelElement = document.createElement('label');
    labelElement.htmlFor = id;
    labelElement.textContent = label;
    
    if (required) {
      const requiredMark = document.createElement('span');
      requiredMark.className = 'required-mark';
      requiredMark.textContent = ' *';
      labelElement.appendChild(requiredMark);
    }
    
    const select = document.createElement('select');
    select.id = id;
    select.name = id;
    select.required = required;
    
    for (const option of options) {
      const optionElement = document.createElement('option');
      optionElement.value = option.value;
      optionElement.textContent = option.label;
      
      if (option.value === value) {
        optionElement.selected = true;
      }
      
      select.appendChild(optionElement);
    }
    
    fieldWrapper.appendChild(labelElement);
    fieldWrapper.appendChild(select);
    
    if (description) {
      const descriptionElement = document.createElement('div');
      descriptionElement.className = 'field-description';
      descriptionElement.textContent = description;
      fieldWrapper.appendChild(descriptionElement);
    }
    
    return fieldWrapper;
  }
  
  // Function to show status messages
  function showStatus(type: 'success' | 'error' | 'info', message: string) {
    statusMessage.className = `status-message ${type}`;
    statusMessage.textContent = message;
    
    // Clear the message after 5 seconds if it's a success message
    if (type === 'success') {
      setTimeout(() => {
        statusMessage.className = 'status-message';
        statusMessage.textContent = '';
      }, 5000);
    }
  }
  
  // Function to collect form data
  function collectFormData(): ApiConfigInput {
    const formData = new FormData(form);
    const providerId = formData.get('provider') as string;
    const provider = getProviderById(providerId);
    
    if (!provider) {
      throw new Error('Invalid provider selected');
    }
    
    const configInput: ApiConfigInput = {
      providerId,
      name: formData.get('config-name') as string,
      apiKey: formData.get('api-key') as string,
      model: formData.get('model') as string,
      isDefault: formData.get('is-default') === 'on'
    };
    
    // Add endpoint if provider supports it
    if (provider.supportsCustomEndpoint) {
      const endpoint = formData.get('endpoint') as string;
      if (endpoint) {
        configInput.endpoint = endpoint;
      }
    }
    
    // Add additional parameters
    if (provider.additionalParams) {
      configInput.additionalParams = {};
      
      for (const param of provider.additionalParams) {
        const value = formData.get(`param-${param.key}`);
        if (value) {
          configInput.additionalParams[param.key] = value;
        }
      }
    }
    
    return configInput;
  }
  
  // Function to test the API connection
  async function testConnection() {
    try {
      showStatus('info', 'Testing connection...');
      
      const configInput = collectFormData();
      const result = await testApiConnection(configInput);
      
      if (result.success) {
        showStatus('success', result.message);
      } else {
        showStatus('error', result.message);
      }
    } catch (error) {
      showStatus('error', `Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  // Function to handle form submission
  async function handleFormSubmit() {
    try {
      const configInput = collectFormData();
      
      if (isEditMode && existingConfig) {
        await updateApiConfig(existingConfig.id, configInput);
        showStatus('success', 'Configuration updated successfully');
        
        // Get the updated config
        const updatedConfig = {
          ...existingConfig,
          ...configInput,
          updatedAt: new Date()
        };
        
        if (options.onSave) {
          options.onSave(updatedConfig);
        }
      } else {
        const id = await addApiConfig(configInput);
        showStatus('success', 'Configuration added successfully');
        
        // Get the new config with generated ID
        const newConfig: ApiConfig = {
          id,
          ...configInput,
          isDefault: configInput.isDefault || false,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        if (options.onSave) {
          options.onSave(newConfig);
        }
        
        // Clear the form for adding another config
        form.reset();
      }
    } catch (error) {
      showStatus('error', `Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  return modal;
}
