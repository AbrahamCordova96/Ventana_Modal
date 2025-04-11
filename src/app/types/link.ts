export interface Link {
  id: string;
  url: string;
  title: string;
  description: string;
  imageUrl?: string;
  categories: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface LinkInput {
  url: string;
  title: string;
  description?: string;
  imageUrl?: string;
  categories?: string[];
  createdAt: Date;
}
