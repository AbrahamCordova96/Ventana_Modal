import { nanoid } from 'nanoid';
import { db } from './database';
import { Link, LinkInput } from '../types/link';
import { clusterByTopic } from '../features/aiCategorization';

export class LinkRepository {
  constructor(private database = db) {}

  async saveLink(linkInput: LinkInput): Promise<Link> {
    // Check if the link already exists
    const existingLink = await this.database.links
      .where('url')
      .equals(linkInput.url)
      .first();
    
    if (existingLink) {
      // Update the existing link
      const updatedLink: Link = {
        ...existingLink,
        title: linkInput.title || existingLink.title,
        description: linkInput.description || existingLink.description,
        imageUrl: linkInput.imageUrl || existingLink.imageUrl,
        categories: linkInput.categories || existingLink.categories,
        updatedAt: new Date()
      };
      
      await this.database.links.update(existingLink.id, updatedLink);
      return updatedLink;
    }
    
    // Create a new link
    const newLink: Link = {
      id: nanoid(),
      url: linkInput.url,
      title: linkInput.title,
      description: linkInput.description || '',
      imageUrl: linkInput.imageUrl,
      categories: linkInput.categories || ['Uncategorized'],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await this.database.links.add(newLink);
    return newLink;
  }

  async getAllLinks(): Promise<Link[]> {
    return this.database.links.toArray();
  }

  async getLinkById(id: string): Promise<Link | undefined> {
    return this.database.links.get(id);
  }

  async deleteLink(id: string): Promise<void> {
    await this.database.links.delete(id);
  }

  async searchLinks(query: string): Promise<Link[]> {
    if (!query) {
      return this.getAllLinks();
    }
    
    const normalizedQuery = query.toLowerCase();
    
    return this.database.links
      .filter(link => 
        link.title.toLowerCase().includes(normalizedQuery) ||
        link.description.toLowerCase().includes(normalizedQuery) ||
        link.url.toLowerCase().includes(normalizedQuery) ||
        link.categories.some(category => 
          category.toLowerCase().includes(normalizedQuery)
        )
      )
      .toArray();
  }

  async getTopicClusters(): Promise<Record<string, Link[]>> {
    const links = await this.getAllLinks();
    return clusterByTopic(links);
  }
}

// Make sure we export both as a named export and as default
export default LinkRepository;
