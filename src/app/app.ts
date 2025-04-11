import { initializeDatabase } from './data/database';
import { LinkPreview } from './features/linkPreview';
import { LinkRepository } from './data/linkRepository';

export class App {
  private linkRepository: LinkRepository;
  private linkPreview: LinkPreview | null = null;

  constructor() {
    this.linkRepository = new LinkRepository();
  }

  public async init(): Promise<void> {
    try {
      // Initialize the database
      await initializeDatabase();
      
      // Initialize the link container if it doesn't exist
      this.ensureLinkContainer();
      
      // Initialize the link preview feature
      this.linkPreview = new LinkPreview('link-container', this.linkRepository);
      
      console.log('Smart Link Organizer initialized successfully');
    } catch (error) {
      console.error('Failed to initialize app:', error);
    }
  }

  private ensureLinkContainer(): void {
    let container = document.getElementById('link-container');
    
    if (!container) {
      container = document.createElement('div');
      container.id = 'link-container';
      container.style.cssText = `
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 10px;
        margin: 20px 0;
        padding: 10px;
        border-radius: 8px;
        background-color: rgba(0, 0, 0, 0.05);
      `;
      
      const appContainer = document.getElementById('app');
      if (appContainer) {
        appContainer.appendChild(container);
      } else {
        document.body.appendChild(container);
      }
    }
  }
}

export default App;
