import { Link } from '../types/link';

// Simple function to cluster links by topic
// In a real implementation, this would use more sophisticated NLP techniques
export function clusterByTopic(links: Link[]): Record<string, Link[]> {
  const clusters: Record<string, Link[]> = {};
  
  // First, group by existing categories
  links.forEach(link => {
    link.categories.forEach(category => {
      if (!clusters[category]) {
        clusters[category] = [];
      }
      
      // Only add the link if it's not already in this category cluster
      if (!clusters[category].some(l => l.id === link.id)) {
        clusters[category].push(link);
      }
    });
  });
  
  // For links without categories or in "Uncategorized", try to infer categories
  const uncategorizedLinks = links.filter(link => 
    link.categories.length === 0 || 
    (link.categories.length === 1 && link.categories[0] === 'Uncategorized')
  );
  
  uncategorizedLinks.forEach(link => {
    const inferredCategories = inferCategories(link);
    
    inferredCategories.forEach(category => {
      if (!clusters[category]) {
        clusters[category] = [];
      }
      
      // Only add the link if it's not already in this category cluster
      if (!clusters[category].some(l => l.id === link.id)) {
        clusters[category].push(link);
      }
    });
  });
  
  return clusters;
}

// Simple keyword-based category inference
// In a real implementation, this would use more sophisticated NLP or ML techniques
function inferCategories(link: Link): string[] {
  const categories: string[] = [];
  const text = `${link.title} ${link.description} ${link.url}`.toLowerCase();
  
  // Define some simple keyword-based rules
  const categoryRules: Record<string, RegExp[]> = {
    'Technology': [/tech/i, /programming/i, /code/i, /software/i, /hardware/i, /computer/i],
    'News': [/news/i, /article/i, /blog/i, /post/i],
    'Social Media': [/facebook/i, /twitter/i, /instagram/i, /linkedin/i, /social/i],
    'Shopping': [/shop/i, /store/i, /buy/i, /amazon/i, /ebay/i, /product/i],
    'Video': [/youtube/i, /vimeo/i, /video/i, /watch/i, /stream/i],
    'Education': [/learn/i, /course/i, /education/i, /tutorial/i, /university/i, /school/i],
    'Entertainment': [/entertainment/i, /movie/i, /music/i, /game/i, /play/i],
    'Travel': [/travel/i, /vacation/i, /hotel/i, /flight/i, /booking/i],
    'Food': [/food/i, /recipe/i, /restaurant/i, /cook/i, /meal/i],
    'Health': [/health/i, /fitness/i, /exercise/i, /medical/i, /doctor/i],
  };
  
  // Check each category's rules against the text
  Object.entries(categoryRules).forEach(([category, patterns]) => {
    if (patterns.some(pattern => pattern.test(text))) {
      categories.push(category);
    }
  });
  
  // If no categories were inferred, keep it as "Uncategorized"
  if (categories.length === 0) {
    categories.push('Uncategorized');
  }
  
  return categories;
}

export async function categorizeLink(link: Link): Promise<string[]> {
  // In a real implementation, this might call an AI service
  // For now, we'll use our simple inference function
  return inferCategories(link);
}
