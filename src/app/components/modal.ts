import { makeElementDraggable } from '../utils/draggable';
import { createSettingsModal } from './settingsModal';

interface ModalOptions {
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  alwaysOnTop: boolean;
}

export function createModal(options: ModalOptions): HTMLElement {
  // Create the modal container
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.style.left = `${options.position.x}px`;
  modal.style.top = `${options.position.y}px`;
  modal.style.width = `${options.size.width}px`;
  modal.style.height = `${options.size.height}px`;
  
  if (options.alwaysOnTop) {
    modal.style.zIndex = '9999';
  }
  
  // Create the modal header
  const header = document.createElement('div');
  header.className = 'modal-header';
  
  const title = document.createElement('div');
  title.className = 'modal-title';
  title.textContent = options.title;
  
  const controls = document.createElement('div');
  controls.className = 'modal-controls';
  
  const settingsBtn = document.createElement('button');
  settingsBtn.className = 'modal-btn settings-btn';
  settingsBtn.innerHTML = '⚙️';
  settingsBtn.title = 'Settings';
  settingsBtn.addEventListener('click', () => {
    const settingsModal = createSettingsModal();
    document.body.appendChild(settingsModal);
  });
  
  const minimizeBtn = document.createElement('button');
  minimizeBtn.className = 'modal-btn';
  minimizeBtn.innerHTML = '&#8211;';
  minimizeBtn.title = 'Minimize';
  minimizeBtn.addEventListener('click', () => {
    if (modal.style.height === '40px') {
      modal.style.height = `${options.size.height}px`;
    } else {
      modal.style.height = '40px';
    }
  });
  
  const closeBtn = document.createElement('button');
  closeBtn.className = 'modal-btn';
  closeBtn.innerHTML = '&times;';
  closeBtn.title = 'Close';
  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });
  
  controls.appendChild(settingsBtn);
  controls.appendChild(minimizeBtn);
  controls.appendChild(closeBtn);
  
  header.appendChild(title);
  header.appendChild(controls);
  
  // Create the modal content
  const content = document.createElement('div');
  content.className = 'modal-content';
  
  // Create drop zone
  const dropZone = document.createElement('div');
  dropZone.className = 'drop-zone';
  dropZone.id = 'drop-zone';
  
  const dropZoneText = document.createElement('div');
  dropZoneText.className = 'drop-zone-text';
  dropZoneText.textContent = 'Drag and drop links, images, or text here';
  
  dropZone.appendChild(dropZoneText);
  
  // Create search bar
  const searchBar = document.createElement('div');
  searchBar.className = 'search-bar';
  
  const searchInput = document.createElement('input');
  searchInput.className = 'search-input';
  searchInput.type = 'text';
  searchInput.placeholder = 'Search links...';
  
  const filterBtn = document.createElement('button');
  filterBtn.className = 'filter-btn';
  filterBtn.textContent = 'Filter';
  
  searchBar.appendChild(searchInput);
  searchBar.appendChild(filterBtn);
  
  // Create links container
  const linksContainer = document.createElement('div');
  linksContainer.className = 'links-container';
  linksContainer.id = 'links-container';
  
  // Add elements to content
  content.appendChild(dropZone);
  content.appendChild(searchBar);
  content.appendChild(linksContainer);
  
  // Create the modal footer
  const footer = document.createElement('div');
  footer.className = 'modal-footer';
  
  const statusText = document.createElement('div');
  statusText.className = 'status-text';
  statusText.textContent = 'Ready';
  
  const keyboardShortcuts = document.createElement('div');
  keyboardShortcuts.className = 'keyboard-shortcuts';
  keyboardShortcuts.textContent = 'Press ? for shortcuts';
  
  footer.appendChild(statusText);
  footer.appendChild(keyboardShortcuts);
  
  // Assemble the modal
  modal.appendChild(header);
  modal.appendChild(content);
  modal.appendChild(footer);
  
  // Make the modal draggable by its header
  makeElementDraggable(modal, header);
  
  return modal;
}
