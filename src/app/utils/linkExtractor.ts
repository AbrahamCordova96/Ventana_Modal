import linkify from 'linkify-it';

// Initialize linkify instance
const linkifier = linkify();

export function extractLinks(content: string): string[] {
  // Find all links in the content
  const matches = linkifier.match(content);
  
  if (!matches) {
    return [];
  }
  
  // Extract unique URLs
  const uniqueUrls = new Set<string>();
  
  for (const match of matches) {
    uniqueUrls.add(match.url);
  }
  
  return Array.from(uniqueUrls);
}
