import { LinkRepository } from '../data/linkRepository';
import { Link } from '../types/link';

export class LinkPreview {
  private linkRepository: LinkRepository;
  private containerSelector: string;
  private container: HTMLElement | null = null;

  constructor(containerSelector: string, linkRepository: LinkRepository) {
    this.containerSelector = containerSelector;
    this.linkRepository = linkRepository;
    this.initialize();
  }

  private initialize(): void {
    this.container = document.getElementById(this.containerSelector);
    if (!this.container) {
      console.error(`Container with selector ${this.containerSelector} not found`);
      return;
    }

    this.loadLinks();
    this.setupEventListeners();
  }

  private async loadLinks(): Promise<void> {
    try {
      const links = await this.linkRepository.getAllLinks();
      this.renderLinks(links);
    } catch (error) {
      console.error('Error loading links:', error);
    }
  }

  private renderLinks(links: Link[]): void {
    if (!this.container) return;

    this.container.innerHTML = '';

    if (links.length === 0) {
      const emptyMessage = document.createElement('div');
      emptyMessage.className = 'empty-links-message';
      emptyMessage.textContent = 'No links saved yet. Drag and drop links to add them.';
      this.container.appendChild(emptyMessage);
      return;
    }

    links.forEach(link => {
      const linkElement = this.createLinkElement(link);
      this.container.appendChild(linkElement);
    });
  }

  private createLinkElement(link: Link): HTMLElement {
    const linkElement = document.createElement('div');
    linkElement.className = 'link-card';
    linkElement.dataset.id = link.id;

    // Create link preview card
    linkElement.innerHTML = `
      <div class="link-card-header">
        ${link.imageUrl ? `<img src="${link.imageUrl}" alt="${link.title}" class="link-image">` : ''}
        <h3 class="link-title">${link.title}</h3>
      </div>
      <div class="link-card-body">
        <p class="link-description">${link.description || 'No description available'}</p>
        <div class="link-url">${link.url}</div>
      </div>
      <div class="link-card-footer">
        <div class="link-categories">
          ${link.categories.map(category => `<span class="link-category">${category}</span>`).join('')}
        </div>
        <div class="link-actions">
          <button class="link-action-open" data-id="${link.id}">Open</button>
          <button class="link-action-delete" data-id="${link.id}">Delete</button>
        </div>
      </div>
    `;

    return linkElement;
  }

  private setupEventListeners(): void {
    if (!this.container) return;

    // Event delegation for link actions
    this.container.addEventListener('click', async (event) => {
      const target = event.target as HTMLElement;
      
      if (target.classList.contains('link-action-open')) {
        const linkId = target.dataset.id;
        if (linkId) {
          const link = await this.linkRepository.getLinkById(linkId);
          if (link) {
            window.open(link.url, '_blank');
          }
        }
      }
      
      if (target.classList.contains('link-action-delete')) {
        const linkId = target.dataset.id;
        if (linkId) {
          await this.linkRepository.deleteLink(linkId);
          this.loadLinks();
        }
      }
    });
  }
}

export default LinkPreview;
