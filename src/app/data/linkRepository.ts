import { nanoid } from 'nanoid';
import { db } from './database';
import { Link, LinkInput } from '../types/link';
import { clusterByTopic } from '../features/aiCategorization';

export async function saveLink(linkInput: LinkInput): Promise<Link> {
  // Check if the link already exists
  const existingLink = await db.links
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
    
    await db.links.update(existingLink.id, updatedLink);
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
  
  await db.links.add(newLink);
  return newLink;
}

export async function getAllLinks(): Promise<Link[]> {
  return db.links.toArray();
}

export async function getLinkById(id: string): Promise<Link | undefined> {
  return db.links.get(id);
}

export async function deleteLink(id: string): Promise<void> {
  await db.links.delete(id);
}

export async function searchLinks(query: string): Promise<Link[]> {
  if (!query) {
    return getAllLinks();
  }
  
  const normalizedQuery = query.toLowerCase();
  
  return db.links
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

export async function getTopicClusters(): Promise<Record<string, Link[]>> {
  const links = await getAllLinks();
  return clusterByTopic(links);
}
