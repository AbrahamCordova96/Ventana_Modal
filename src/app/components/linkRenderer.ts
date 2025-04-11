import { Link } from '../types/link';
import LinkPreviewHover from './linkPreviewHover';

export class LinkRenderer {
  private container: HTMLElement;
  private previewHover: LinkPreviewHover;

  constructor(containerId: string) {
    const containerElement = document.getElementById(containerId);
    if (!containerElement) {
      throw new Error(`Container element with id "${containerId}" not found`);
    }
    this.container = containerElement;
    this.previewHover = new LinkPreviewHover();
  }

  public renderLinks(links: Link[]): void {
    this.container.innerHTML = '';
    
    links.forEach(link => {
      const linkElement = this.createLinkElement(link);
      this.container.appendChild(linkElement);
    });
  }

  private createLinkElement(link: Link): HTMLElement {
    const linkElement = document.createElement('div');
    linkElement.className = 'link-button';
    linkElement.dataset.url = link.url;
    linkElement.dataset.id = link.id;
    
    // Apply styling to make it look like a button
    linkElement.style.cssText = `
      display: inline-block;
      margin: 8px;
      padding: 10px 16px;
      background-color: #f5f5f5;
      border-radius: 6px;
      border: 1px solid #ddd;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    `;
    
    // Add hover effect
    linkElement.addEventListener('mouseenter', () => {
      linkElement.style.backgroundColor = '#e9e9e9';
      linkElement.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
    });
    
    linkElement.addEventListener('mouseleave', () => {
      linkElement.style.backgroundColor = '#f5f5f5';
      linkElement.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
    });
    
    // Create icon based on link type
    const icon = document.createElement('span');
    icon.className = 'link-icon';
    icon.style.marginRight = '8px';
    
    if (this.isVideoUrl(link.url)) {
      icon.innerHTML = '🎬'; // Video icon
    } else if (this.isImageUrl(link.url)) {
      icon.innerHTML = '🖼️'; // Image icon
    } else if (this.isDocumentUrl(link.url)) {
      icon.innerHTML = '📄'; // Document icon
    } else {
      icon.innerHTML = '🔗'; // Generic link icon
    }
    
    // Create title element
    const title = document.createElement('span');
    title.className = 'link-title';
    title.textContent = link.title || this.generateTitleFromUrl(link.url);
    
    // Assemble the link element
    linkElement.appendChild(icon);
    linkElement.appendChild(title);
    
    // Add click handler to open the link
    linkElement.addEventListener('click', (e) => {
      e.preventDefault();
      window.open(link.url, '_blank');
    });
    
    // Apply hover preview
    this.previewHover.applyToLinkElement(linkElement, link);
    
    return linkElement;
  }

  private isVideoUrl(url: string): boolean {
    const videoPatterns = [
      /youtube\.com\/watch/i,
      /youtu\.be\//i,
      /vimeo\.com\//i,
      /dailymotion\.com\/video/i,
      /\.(mp4|webm|ogg)$/i
    ];
    
    return videoPatterns.some(pattern => pattern.test(url));
  }

  private isImageUrl(url: string): boolean {
    return /\.(jpe?g|png|gif|svg|webp)$/i.test(url);
  }

  private isDocumentUrl(url: string): boolean {
    return /\.(pdf|docx?|xlsx?|pptx?|txt|csv)$/i.test(url);
  }

  private generateTitleFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      let title = urlObj.hostname.replace(/^www\./, '');
      
      // Add path if it's not just the root
      if (urlObj.pathname && urlObj.pathname !== '/') {
        // Clean up the path and limit length
        const path = urlObj.pathname
          .replace(/\/$/, '')
          .split('/')
          .pop() || '';
          
        if (path) {
          title += ` - ${decodeURIComponent(path)}`;
        }
      }
      
      return title;
    } catch (e) {
      // If URL parsing fails, return a portion of the URL
      return url.substring(0, 50) + (url.length > 50 ? '...' : '');
    }
  }
}

export default LinkRenderer;
