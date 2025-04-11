import { getAllLinks, searchLinks, deleteLink } from '../data/linkRepository';
import { showNotification } from '../features/notifications';
import Sortable from 'sortablejs';

export async function renderLinks(searchQuery?: string) {
  const linksContainer = document.getElementById('links-container');
  if (!linksContainer) return;
  
  // Clear the container
  linksContainer.innerHTML = '';
  
  // Get links based on search query
  const links = searchQuery 
    ? await searchLinks(searchQuery)
    : await getAllLinks();
  
  if (links.length === 0) {
    const emptyState = document.createElement('div');
    emptyState.style.textAlign = 'center';
    emptyState.style.padding = '20px';
    emptyState.style.color = 'var(--text-secondary)';
    
    if (searchQuery) {
      emptyState.textContent = `No links found for "${searchQuery}"`;
    } else {
      emptyState.textContent = 'No links saved yet. Drag and drop links to get started!';
    }
    
    linksContainer.appendChild(emptyState);
    return;
  }
  
  // Sort links by creation date (newest first)
  links.sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  
  // Create a link card for each link
  for (const link of links) {
    const linkCard = createLinkCard(link);
    linksContainer.appendChild(linkCard);
  }
  
  // Make the links container sortable
  Sortable.create(linksContainer, {
    animation: 150,
    ghostClass: 'sortable-ghost',
    chosenClass: 'sortable-chosen',
    dragClass: 'sortable-drag',
    onEnd: function(evt) {
      showNotification('Order updated', 'Link order has been updated.');
    }
  });
}

function createLinkCard(link: any): HTMLElement {
  const card = document.createElement('div');
  card.className = 'link-card';
  card.dataset.id = link.id;
  
  const title = document.createElement('div');
  title.className = 'link-title';
  title.textContent = link.title;
  
  const url = document.createElement('div');
  url.className = 'link-url';
  url.textContent = link.url;
  
  const preview = document.createElement('div');
  preview.className = 'link-preview';
  
  if (link.imageUrl) {
    const img = document.createElement('img');
    img.src = link.imageUrl;
    img.alt = link.title;
    img.onerror = () => {
      img.remove();
      preview.textContent = 'Preview not available';
    };
    preview.appendChild(img);
  } else {
    preview.textContent = 'Preview not available';
  }
  
  const tags = document.createElement('div');
  tags.className = 'link-tags';
  
  for (const category of link.categories) {
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = category;
    tags.appendChild(tag);
  }
  
  // Add delete button
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-btn';
  deleteBtn.innerHTML = '&times;';
  deleteBtn.style.position = 'absolute';
  deleteBtn.style.top = '8px';
  deleteBtn.style.right = '8px';
  deleteBtn.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  deleteBtn.style.color = 'white';
  deleteBtn.style.border = 'none';
  deleteBtn.style.borderRadius = '50%';
  deleteBtn.style.width = '24px';
  deleteBtn.style.height = '24px';
  deleteBtn.style.display = 'flex';
  deleteBtn.style.alignItems = 'center';
  deleteBtn.style.justifyContent = 'center';
  deleteBtn.style.cursor = 'pointer';
  deleteBtn.style.opacity = '0';
  deleteBtn.style.transition = 'opacity 0.2s';
  
  card.addEventListener('mouseenter', () => {
    deleteBtn.style.opacity = '1';
  });
  
  card.addEventListener('mouseleave', () => {
    deleteBtn.style.opacity = '0';
  });
  
  deleteBtn.addEventListener('click', async (e) => {
    e.stopPropagation();
    
    try {
      await deleteLink(link.id);
      card.remove();
      showNotification('Link deleted', `"${link.title}" has been removed.`);
    } catch (error) {
      console.error('Error deleting link:', error);
      showNotification('Error', 'Failed to delete link.', { type: 'error' });
    }
  });
  
  // Make the card clickable to open the link
  card.addEventListener('click', () => {
    window.open(link.url, '_blank');
  });
  
  // Assemble the card
  card.appendChild(title);
  card.appendChild(url);
  card.appendChild(preview);
  card.appendChild(tags);
  card.appendChild(deleteBtn);
  
  return card;
}

// Initialize the links display when the module is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Set up search functionality
  const searchInput = document.querySelector('.search-input') as HTMLInputElement;
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = (e.target as HTMLInputElement).value;
      renderLinks(query);
    });
  }
  
  // Initial render
  renderLinks();
});
