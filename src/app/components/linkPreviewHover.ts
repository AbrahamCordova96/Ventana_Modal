import { Link } from '../types/link';

export class LinkPreviewHover {
  private previewElement: HTMLElement;
  private previewTimeout: number | null = null;
  private currentLink: string | null = null;
  private previewDelay = 300; // ms
  private previewDuration = 3000; // ms for video previews

  constructor() {
    this.previewElement = this.createPreviewElement();
    document.body.appendChild(this.previewElement);
    this.setupEventListeners();
  }

  private createPreviewElement(): HTMLElement {
    const element = document.createElement('div');
    element.className = 'link-preview-hover';
    element.style.cssText = `
      position: absolute;
      z-index: 1000;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      overflow: hidden;
      opacity: 0;
      transform: translateY(10px);
      transition: opacity 0.2s ease, transform 0.2s ease;
      pointer-events: none;
      max-width: 320px;
      max-height: 240px;
    `;
    return element;
  }

  private setupEventListeners(): void {
    // Global event delegation for link hover
    document.addEventListener('mouseover', this.handleMouseOver.bind(this));
    document.addEventListener('mouseout', this.handleMouseOut.bind(this));
    document.addEventListener('mousemove', this.handleMouseMove.bind(this));
  }

  private handleMouseOver(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const linkElement = target.closest('.link-button') as HTMLElement;
    
    if (!linkElement) return;
    
    const url = linkElement.dataset.url;
    if (!url || url === this.currentLink) return;
    
    this.currentLink = url;
    
    // Clear any existing timeout
    if (this.previewTimeout !== null) {
      window.clearTimeout(this.previewTimeout);
    }
    
    // Set timeout for preview to appear
    this.previewTimeout = window.setTimeout(() => {
      this.showPreview(url, event);
    }, this.previewDelay);
  }

  private handleMouseOut(): void {
    if (this.previewTimeout !== null) {
      window.clearTimeout(this.previewTimeout);
      this.previewTimeout = null;
    }
    this.hidePreview();
    this.currentLink = null;
  }

  private handleMouseMove(event: MouseEvent): void {
    if (this.previewElement.style.opacity !== '0') {
      this.positionPreview(event);
    }
  }

  private positionPreview(event: MouseEvent): void {
    const padding = 15;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const previewWidth = this.previewElement.offsetWidth;
    const previewHeight = this.previewElement.offsetHeight;
    
    // Default position is below and to the right of cursor
    let left = event.clientX + padding;
    let top = event.clientY + padding;
    
    // Adjust if preview would go off screen
    if (left + previewWidth > viewportWidth - padding) {
      left = event.clientX - previewWidth - padding;
    }
    
    if (top + previewHeight > viewportHeight - padding) {
      top = event.clientY - previewHeight - padding;
    }
    
    this.previewElement.style.left = `${left}px`;
    this.previewElement.style.top = `${top}px`;
  }

  private async showPreview(url: string, event: MouseEvent): Promise<void> {
    try {
      this.previewElement.innerHTML = '<div class="loading">Loading preview...</div>';
      this.previewElement.style.opacity = '1';
      this.previewElement.style.transform = 'translateY(0)';
      this.positionPreview(event);
      
      if (this.isVideoUrl(url)) {
        await this.loadVideoPreview(url);
      } else {
        await this.loadWebpagePreview(url);
      }
    } catch (error) {
      console.error('Error showing preview:', error);
      this.previewElement.innerHTML = '<div class="error">Preview unavailable</div>';
    }
  }

  private hidePreview(): void {
    this.previewElement.style.opacity = '0';
    this.previewElement.style.transform = 'translateY(10px)';
    
    // Clear content after transition
    setTimeout(() => {
      if (this.previewElement.style.opacity === '0') {
        this.previewElement.innerHTML = '';
      }
    }, 200);
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

  private async loadWebpagePreview(url: string): Promise<void> {
    // In a real implementation, you would use a server-side API to fetch metadata
    // For this example, we'll create a simulated preview
    
    const previewHtml = `
      <div class="webpage-preview">
        <div class="preview-header">
          <img src="https://www.google.com/s2/favicons?domain=${encodeURIComponent(url)}" alt="favicon" class="favicon">
          <div class="preview-title">${this.getDomainFromUrl(url)}</div>
        </div>
        <div class="preview-thumbnail" style="background-image: url('https://via.placeholder.com/320x180?text=Preview+for+${encodeURIComponent(this.getDomainFromUrl(url))}')"></div>
        <div class="preview-description">
          Preview for ${url.substring(0, 50)}${url.length > 50 ? '...' : ''}
        </div>
      </div>
    `;
    
    this.previewElement.innerHTML = previewHtml;
    this.applyPreviewStyles();
  }

  private async loadVideoPreview(url: string): Promise<void> {
    // For YouTube links, we can use the thumbnail API
    let thumbnailUrl = 'https://via.placeholder.com/320x180?text=Video+Preview';
    let videoTitle = 'Video Preview';
    
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = this.extractYoutubeVideoId(url);
      if (videoId) {
        thumbnailUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
        videoTitle = `YouTube Video (${videoId})`;
      }
    }
    
    const previewHtml = `
      <div class="video-preview">
        <div class="preview-thumbnail" style="background-image: url('${thumbnailUrl}')">
          <div class="play-button"></div>
        </div>
        <div class="preview-title">${videoTitle}</div>
      </div>
    `;
    
    this.previewElement.innerHTML = previewHtml;
    this.applyPreviewStyles();
  }

  private extractYoutubeVideoId(url: string): string | null {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  }

  private getDomainFromUrl(url: string): string {
    try {
      const domain = new URL(url).hostname;
      return domain.replace(/^www\./, '');
    } catch {
      return url;
    }
  }

  private applyPreviewStyles(): void {
    const style = document.createElement('style');
    style.textContent = `
      .link-preview-hover .loading,
      .link-preview-hover .error {
        padding: 15px;
        text-align: center;
        color: #666;
        font-style: italic;
      }
      
      .link-preview-hover .webpage-preview,
      .link-preview-hover .video-preview {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
      }
      
      .link-preview-hover .preview-header {
        display: flex;
        align-items: center;
        padding: 8px 12px;
        border-bottom: 1px solid #eee;
      }
      
      .link-preview-hover .favicon {
        width: 16px;
        height: 16px;
        margin-right: 8px;
      }
      
      .link-preview-hover .preview-title {
        font-weight: bold;
        font-size: 14px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .link-preview-hover .preview-thumbnail {
        height: 180px;
        background-size: cover;
        background-position: center;
        position: relative;
      }
      
      .link-preview-hover .preview-description {
        padding: 8px 12px;
        font-size: 12px;
        color: #666;
        max-height: 60px;
        overflow: hidden;
      }
      
      .link-preview-hover .play-button {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 0;
        height: 0;
        border-top: 15px solid transparent;
        border-bottom: 15px solid transparent;
        border-left: 25px solid rgba(255, 255, 255, 0.8);
        filter: drop-shadow(0 0 5px rgba(0, 0, 0, 0.5));
      }
      
      .link-preview-hover .play-button:before {
        content: '';
        position: absolute;
        top: -20px;
        left: -35px;
        width: 50px;
        height: 50px;
        background: rgba(0, 0, 0, 0.5);
        border-radius: 50%;
        z-index: -1;
      }
    `;
    
    // Remove any existing style element
    const existingStyle = this.previewElement.querySelector('style');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    this.previewElement.appendChild(style);
  }

  // Public method to apply to new link elements
  public applyToLinkElement(element: HTMLElement, link: Link): void {
    element.classList.add('link-button');
    element.dataset.url = link.url;
  }
}

export default LinkPreviewHover;
