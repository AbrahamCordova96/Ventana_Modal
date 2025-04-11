import { createModal } from './components/modal';
import { setupDragAndDrop } from './features/dragAndDrop';
import { setupKeyboardShortcuts } from './features/keyboardShortcuts';
import { initializeDatabase } from './data/database';
import { setupNotifications } from './features/notifications';

export function initializeApp() {
  // Initialize the database
  initializeDatabase();
  
  // Create the modal component
  const modal = createModal({
    title: 'Smart Link Organizer',
    position: { x: window.innerWidth / 2 - 200, y: window.innerHeight / 2 - 300 },
    size: { width: 400, height: 600 },
    alwaysOnTop: true
  });
  
  // Add the modal to the DOM
  document.getElementById('app')?.appendChild(modal);
  
  // Setup drag and drop functionality
  setupDragAndDrop();
  
  // Setup keyboard shortcuts
  setupKeyboardShortcuts();
  
  // Setup notifications system
  setupNotifications();
}
