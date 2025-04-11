interface NotificationOptions {
  duration?: number;
  type?: 'info' | 'success' | 'warning' | 'error';
}

export function setupNotifications() {
  // This function is called when the app initializes
  // It doesn't need to do anything specific for now
}

export function showNotification(title: string, message: string, options: NotificationOptions = {}) {
  const { duration = 3000, type = 'info' } = options;
  
  // Create notification element
  const notification = document.createElement('div');
  notification.className = 'notification';
  
  // Add type-specific styling
  switch (type) {
    case 'success':
      notification.style.borderLeftColor = 'var(--success-color)';
      break;
    case 'warning':
      notification.style.borderLeftColor = 'var(--warning-color)';
      break;
    case 'error':
      notification.style.borderLeftColor = 'var(--error-color)';
      break;
    default:
      notification.style.borderLeftColor = 'var(--accent-color)';
  }
  
  // Create notification content
  const notificationTitle = document.createElement('div');
  notificationTitle.className = 'notification-title';
  notificationTitle.textContent = title;
  
  const notificationMessage = document.createElement('div');
  notificationMessage.className = 'notification-message';
  notificationMessage.textContent = message;
  
  // Assemble notification
  notification.appendChild(notificationTitle);
  notification.appendChild(notificationMessage);
  
  // Add to DOM
  document.body.appendChild(notification);
  
  // Remove after duration
  setTimeout(() => {
    notification.addEventListener('animationend', () => {
      notification.remove();
    });
  }, duration);
}
