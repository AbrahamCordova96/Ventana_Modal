import { ApiConfig } from '../types/apiConfig';
import { getProviderById } from '../data/apiProviders';
import { 
  getAllApiConfigs, 
  updateApiConfig, 
  deleteApiConfig 
} from '../data/apiConfigRepository';
import { createApiConfigModal } from './apiConfigModal';

export async function createApiConfigList(): Promise<HTMLElement> {
  // Create the container
  const container = document.createElement('div');
  container.className = 'api-config-list';
  
  // Create the header
  const header = document.createElement('div');
  header.className = 'api-config-list-header';
  
  const title = document.createElement('h3');
  title.textContent = 'API Configurations';
  
  const addButton = document.createElement('button');
  addButton.className = 'add-config-btn';
  addButton.textContent = 'Add New';
  addButton.addEventListener('click', () => {
    const modal = createApiConfigModal({
      onClose: () => refreshList(),
      onSave: () => refreshList()
    });
    document.body.appendChild(modal);
  });
  
  header.appendChild(title);
  header.appendChild(addButton);
  
  // Create the list container
  const listContainer = document.createElement('div');
  listContainer.className = 'config-items-container';
  
  // Add header and list to container
  container.appendChild(header);
  container.appendChild(listContainer);
  
  // Initial load
  await refreshList();
  
  // Function to refresh the list
  async function refreshList() {
    try {
      const configs = await getAllApiConfigs();
      renderConfigList(configs);
    } catch (error) {
      console.error('Error loading API configurations:', error);
      listContainer.innerHTML = '<div class="error-message">Error loading configurations</div>';
    }
  }
  
  // Function to render the config list
  function renderConfigList(configs: ApiConfig[]) {
    listContainer.innerHTML = '';
    
    if (configs.length === 0) {
      const emptyMessage = document.createElement('div');
      emptyMessage.className = 'empty-message';
      emptyMessage.textContent = 'No API configurations found. Click "Add New" to create one.';
      listContainer.appendChild(emptyMessage);
      return;
    }
    
    for (const config of configs) {
      const configItem = createConfigItem(config);
      listContainer.appendChild(configItem);
    }
  }
  
  // Function to create a config item
  function createConfigItem(config: ApiConfig): HTMLElement {
    const provider = getProviderById(config.providerId);
    
    const item = document.createElement('div');
    item.className = 'config-item';
    if (config.isDefault) {
      item.classList.add('default');
    }
    
    // Provider icon/logo
    const providerIcon = document.createElement('div');
    providerIcon.className = 'provider-icon';
    
    if (provider?.logoUrl) {
      const img = document.createElement('img');
      img.src = provider.logoUrl;
      img.alt = provider.name;
      providerIcon.appendChild(img);
    } else {
      providerIcon.textContent = provider?.name.charAt(0) || 'A';
    }
    
    // Config info
    const configInfo = document.createElement('div');
    configInfo.className = 'config-info';
    
    const configName = document.createElement('div');
    configName.className = 'config-name';
    configName.textContent = config.name;
    
    const configDetails = document.createElement('div');
    configDetails.className = 'config-details';
    configDetails.textContent = `${provider?.name || 'Custom'} • ${config.model}`;
    
    if (config.isDefault) {
      const defaultBadge = document.createElement('span');
      defaultBadge.className = 'default-badge';
      defaultBadge.textContent = 'Default';
      configName.appendChild(defaultBadge);
    }
    
    configInfo.appendChild(configName);
    configInfo.appendChild(configDetails);
    
    // Actions
    const actions = document.createElement('div');
    actions.className = 'config-actions';
    
    const editButton = document.createElement('button');
    editButton.className = 'edit-btn';
    editButton.textContent = 'Edit';
    editButton.addEventListener('click', () => {
      const modal = createApiConfigModal({
        existingConfig: config,
        onClose: () => refreshList(),
        onSave: () => refreshList()
      });
      document.body.appendChild(modal);
    });
    
    const setDefaultButton = document.createElement('button');
    setDefaultButton.className = 'set-default-btn';
    setDefaultButton.textContent = config.isDefault ? 'Default' : 'Set Default';
    setDefaultButton.disabled = config.isDefault;
    
    if (!config.isDefault) {
      setDefaultButton.addEventListener('click', async () => {
        try {
          await updateApiConfig(config.id, { isDefault: true });
          await refreshList();
        } catch (error) {
          console.error('Error setting default config:', error);
        }
      });
    }
    
    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-btn';
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', async () => {
      if (confirm(`Are you sure you want to delete "${config.name}"?`)) {
        try {
          await deleteApiConfig(config.id);
          await refreshList();
        } catch (error) {
          console.error('Error deleting config:', error);
        }
      }
    });
    
    actions.appendChild(editButton);
    actions.appendChild(setDefaultButton);
    actions.appendChild(deleteButton);
    
    // Assemble the item
    item.appendChild(providerIcon);
    item.appendChild(configInfo);
    item.appendChild(actions);
    
    return item;
  }
  
  return container;
}
