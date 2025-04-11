import { makeElementDraggable } from '../utils/draggable';
import { createApiConfigList } from './apiConfigList';

interface SettingsModalOptions {
  position?: { x: number; y: number };
  size?: { width: number; height: number };
  onClose?: () => void;
}

export function createSettingsModal(options: SettingsModalOptions = {}): HTMLElement {
  const position = options.position || { 
    x: window.innerWidth / 2 - 300, 
    y: window.innerHeight / 2 - 350 
  };
  
  const size = options.size || { width: 600, height: 700 };
  
  // Create the modal container
  const modal = document.createElement('div');
  modal.className = 'modal settings-modal';
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
  title.textContent = 'Settings';
  
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
  content.className = 'modal-content settings-content';
  
  // Create tabs
  const tabs = document.createElement('div');
  tabs.className = 'settings-tabs';
  
  const tabGeneral = document.createElement('div');
  tabGeneral.className = 'settings-tab active';
  tabGeneral.textContent = 'General';
  tabGeneral.dataset.tab = 'general';
  
  const tabApi = document.createElement('div');
  tabApi.className = 'settings-tab';
  tabApi.textContent = 'API Configuration';
  tabApi.dataset.tab = 'api';
  
  const tabAppearance = document.createElement('div');
  tabAppearance.className = 'settings-tab';
  tabAppearance.textContent = 'Appearance';
  tabAppearance.dataset.tab = 'appearance';
  
  const tabAdvanced = document.createElement('div');
  tabAdvanced.className = 'settings-tab';
  tabAdvanced.textContent = 'Advanced';
  tabAdvanced.dataset.tab = 'advanced';
  
  tabs.appendChild(tabGeneral);
  tabs.appendChild(tabApi);
  tabs.appendChild(tabAppearance);
  tabs.appendChild(tabAdvanced);
  
  // Create tab content containers
  const tabContents = document.createElement('div');
  tabContents.className = 'settings-tab-contents';
  
  const generalContent = document.createElement('div');
  generalContent.className = 'tab-content active';
  generalContent.dataset.tab = 'general';
  generalContent.innerHTML = `
    <h3>General Settings</h3>
    <div class="settings-section">
      <div class="form-field checkbox-field">
        <input type="checkbox" id="startup-launch" checked>
        <label for="startup-launch">Launch on system startup</label>
      </div>
      <div class="form-field checkbox-field">
        <input type="checkbox" id="minimize-to-tray" checked>
        <label for="minimize-to-tray">Minimize to system tray when closed</label>
      </div>
      <div class="form-field">
        <label for="default-save-location">Default save location</label>
        <div class="input-with-button">
          <input type="text" id="default-save-location" value="~/Documents/SmartLinks">
          <button class="browse-btn">Browse</button>
        </div>
      </div>
    </div>
  `;
  
  const apiContent = document.createElement('div');
  apiContent.className = 'tab-content';
  apiContent.dataset.tab = 'api';
  
  // We'll populate this with the API config list component
  createApiConfigList().then(configList => {
    apiContent.appendChild(configList);
  });
  
  const appearanceContent = document.createElement('div');
  appearanceContent.className = 'tab-content';
  appearanceContent.dataset.tab = 'appearance';
  appearanceContent.innerHTML = `
    <h3>Appearance Settings</h3>
    <div class="settings-section">
      <div class="form-field">
        <label for="theme-select">Theme</label>
        <select id="theme-select">
          <option value="system">System Default</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>
      <div class="form-field">
        <label for="font-size">Font Size</label>
        <select id="font-size">
          <option value="small">Small</option>
          <option value="medium" selected>Medium</option>
          <option value="large">Large</option>
        </select>
      </div>
      <div class="form-field">
        <label for="accent-color">Accent Color</label>
        <input type="color" id="accent-color" value="#4a90e2">
      </div>
    </div>
  `;
  
  const advancedContent = document.createElement('div');
  advancedContent.className = 'tab-content';
  advancedContent.dataset.tab = 'advanced';
  advancedContent.innerHTML = `
    <h3>Advanced Settings</h3>
    <div class="settings-section">
      <div class="form-field">
        <label for="cache-size">Cache Size</label>
        <select id="cache-size">
          <option value="256">256 MB</option>
          <option value="512" selected>512 MB</option>
          <option value="1024">1 GB</option>
          <option value="2048">2 GB</option>
        </select>
      </div>
      <div class="form-field checkbox-field">
        <input type="checkbox" id="enable-logging">
        <label for="enable-logging">Enable detailed logging</label>
      </div>
      <div class="danger-zone">
        <h4>Danger Zone</h4>
        <button class="danger-btn">Clear All Data</button>
        <button class="danger-btn">Reset to Default Settings</button>
      </div>
    </div>
  `;
  
  tabContents.appendChild(generalContent);
  tabContents.appendChild(apiContent);
  tabContents.appendChild(appearanceContent);
  tabContents.appendChild(advancedContent);
  
  // Add tab switching functionality
  tabs.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('settings-tab')) {
      // Update active tab
      document.querySelectorAll('.settings-tab').forEach(tab => {
        tab.classList.remove('active');
      });
      target.classList.add('active');
      
      // Update active content
      const tabName = target.dataset.tab;
      document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
      });
      document.querySelector(`.tab-content[data-tab="${tabName}"]`)?.classList.add('active');
    }
  });
  
  // Add tabs and content to the modal
  content.appendChild(tabs);
  content.appendChild(tabContents);
  
  // Create the modal footer
  const footer = document.createElement('div');
  footer.className = 'modal-footer';
  
  const saveBtn = document.createElement('button');
  saveBtn.className = 'save-settings-btn';
  saveBtn.textContent = 'Save Changes';
  
  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'cancel-btn';
  cancelBtn.textContent = 'Cancel';
  cancelBtn.addEventListener('click', () => {
    modal.remove();
    if (options.onClose) options.onClose();
  });
  
  footer.appendChild(cancelBtn);
  footer.appendChild(saveBtn);
  
  // Assemble the modal
  modal.appendChild(header);
  modal.appendChild(content);
  modal.appendChild(footer);
  
  // Make the modal draggable by its header
  makeElementDraggable(modal, header);
  
  return modal;
}
