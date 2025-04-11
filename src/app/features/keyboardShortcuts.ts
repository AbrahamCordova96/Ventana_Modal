import { showNotification } from './notifications';

interface Shortcut {
  key: string;
  description: string;
  action: () => void;
}

export function setupKeyboardShortcuts() {
  const shortcuts: Shortcut[] = [
    {
      key: '?',
      description: 'Show keyboard shortcuts',
      action: showShortcutsHelp
    },
    {
      key: 'n',
      description: 'New link (paste from clipboard)',
      action: () => {
        navigator.clipboard.readText()
          .then(text => {
            const event = new ClipboardEvent('paste', {
              clipboardData: new DataTransfer()
            });
            // @ts-ignore - We're creating a synthetic event
            event.clipboardData.setData('text/plain', text);
            document.dispatchEvent(event);
          })
          .catch(err => {
            showNotification('Error', 'Could not access clipboard', { type: 'error' });
          });
      }
    },
    {
      key: 'f',
      description: 'Focus search',
      action: () => {
        const searchInput = document.querySelector('.search-input') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }
    },
    {
      key: 'Escape',
      description: 'Clear search or close modal',
      action: () => {
        const searchInput = document.querySelector('.search-input') as HTMLInputElement;
        if (searchInput && document.activeElement === searchInput) {
          searchInput.value = '';
          searchInput.blur();
        } else {
          const modal = document.querySelector('.modal') as HTMLElement;
          if (modal) {
            modal.style.display = 'none';
          }
        }
      }
    },
    {
      key: 'h',
      description: 'Toggle visibility',
      action: () => {
        const modal = document.querySelector('.modal') as HTMLElement;
        if (modal) {
          modal.style.display = modal.style.display === 'none' ? 'flex' : 'none';
        }
      }
    }
  ];
  
  // Add event listener for keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Ignore shortcuts when typing in input fields
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }
    
    for (const shortcut of shortcuts) {
      if (e.key === shortcut.key) {
        e.preventDefault();
        shortcut.action();
        break;
      }
    }
  });
}

function showShortcutsHelp() {
  // Create a modal to display keyboard shortcuts
  const helpModal = document.createElement('div');
  helpModal.style.position = 'fixed';
  helpModal.style.top = '50%';
  helpModal.style.left = '50%';
  helpModal.style.transform = 'translate(-50%, -50%)';
  helpModal.style.backgroundColor = 'var(--card-background)';
  helpModal.style.padding = '20px';
  helpModal.style.borderRadius = '8px';
  helpModal.style.boxShadow = '0 4px 20px var(--shadow-color)';
  helpModal.style.zIndex = '10001';
  helpModal.style.maxWidth = '400px';
  helpModal.style.width = '100%';
  
  const title = document.createElement('h2');
  title.textContent = 'Keyboard Shortcuts';
  title.style.marginBottom = '16px';
  title.style.fontSize = '18px';
  
  const shortcutsList = document.createElement('div');
  shortcutsList.style.display = 'grid';
  shortcutsList.style.gridTemplateColumns = 'auto 1fr';
  shortcutsList.style.gap = '8px 16px';
  
  const shortcuts = [
    { key: '?', description: 'Show keyboard shortcuts' },
    { key: 'n', description: 'New link (paste from clipboard)' },
    { key: 'f', description: 'Focus search' },
    { key: 'Esc', description: 'Clear search or close modal' },
    { key: 'h', description: 'Toggle visibility' }
  ];
  
  shortcuts.forEach(shortcut => {
    const keyElement = document.createElement('kbd');
    keyElement.textContent = shortcut.key;
    keyElement.style.backgroundColor = 'var(--border-color)';
    keyElement.style.padding = '2px 6px';
    keyElement.style.borderRadius = '4px';
    keyElement.style.fontFamily = 'monospace';
    
    const descElement = document.createElement('div');
    descElement.textContent = shortcut.description;
    
    shortcutsList.appendChild(keyElement);
    shortcutsList.appendChild(descElement);
  });
  
  const closeButton = document.createElement('button');
  closeButton.textContent = 'Close';
  closeButton.style.marginTop = '20px';
  closeButton.style.padding = '8px 16px';
  closeButton.style.backgroundColor = 'var(--primary-color)';
  closeButton.style.color = 'white';
  closeButton.style.border = 'none';
  closeButton.style.borderRadius = '4px';
  closeButton.style.cursor = 'pointer';
  closeButton.onclick = () => helpModal.remove();
  
  // Add a click outside to close
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  overlay.style.zIndex = '10000';
  overlay.onclick = () => {
    overlay.remove();
    helpModal.remove();
  };
  
  // Assemble the modal
  helpModal.appendChild(title);
  helpModal.appendChild(shortcutsList);
  helpModal.appendChild(closeButton);
  
  // Add to DOM
  document.body.appendChild(overlay);
  document.body.appendChild(helpModal);
}
