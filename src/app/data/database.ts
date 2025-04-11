import Dexie, { Table } from 'dexie';
import { Link } from '../types/link';
import { ApiConfig } from '../types/apiConfig';

export class Database extends Dexie {
  links!: Table<Link, string>;
  apiConfigs!: Table<ApiConfig, string>;

  constructor() {
    super('SmartLinkOrganizerDB');
    
    this.version(1).stores({
      links: 'id, url, createdAt, updatedAt, *categories'
    });
    
    // Add apiConfigs table in version 2
    this.version(2).stores({
      links: 'id, url, createdAt, updatedAt, *categories',
      apiConfigs: 'id, providerId, name, isDefault, createdAt, updatedAt'
    });
  }
}

export const db = new Database();

export async function initializeDatabase() {
  try {
    await db.open();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}
