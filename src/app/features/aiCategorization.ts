// Simple implementation without relying on Natural.js
// since it has Node.js dependencies that don't work in the browser

// Predefined categories for classification
const predefinedCategories = [
  'Technology', 'Science', 'Health', 'Business', 'Entertainment',
  'Sports', 'Politics', 'Education', 'Travel', 'Food',
  'Art', 'Fashion', 'Environment', 'Finance', 'Gaming'
];

// Keywords associated with each category
const categoryKeywords: Record<string, string[]> = {
  'Technology': ['tech', 'software', 'hardware', 'programming', 'code', 'developer', 'app', 'digital', 'computer', 'internet', 'web', 'mobile', 'ai', 'artificial intelligence', 'machine learning'],
  'Science': ['science', 'research', 'study', 'experiment', 'discovery', 'physics', 'chemistry', 'biology', 'astronomy', 'space', 'laboratory', 'scientist'],
  'Health': ['health', 'medical', 'medicine', 'doctor', 'hospital', 'wellness', 'fitness', 'diet', 'exercise', 'nutrition', 'disease', 'treatment', 'therapy'],
  'Business': ['business', 'company', 'corporate', 'startup', 'entrepreneur', 'market', 'industry', 'economy', 'finance', 'investment', 'stock', 'trade', 'commerce'],
  'Entertainment': ['entertainment', 'movie', 'film', 'tv', 'television', 'show', 'celebrity', 'actor', 'actress', 'music', 'concert', 'festival', 'performance'],
  'Sports': ['sports', 'game', 'player', 'team', 'coach', 'athlete', 'championship', 'tournament', 'match', 'competition', 'football', 'basketball', 'soccer', 'baseball', 'tennis'],
  'Politics': ['politics', 'government', 'policy', 'election', 'president', 'minister', 'parliament', 'congress', 'senate', 'democrat', 'republican', 'law', 'legislation'],
  'Education': ['education', 'school', 'university', 'college', 'student', 'teacher', 'professor', 'academic', 'learning', 'course', 'degree', 'study', 'classroom'],
  'Travel': ['travel', 'tourism', 'vacation', 'holiday', 'destination', 'hotel', 'resort', 'flight', 'airline', 'tour', 'trip', 'adventure', 'explore', 'journey'],
  'Food': ['food', 'recipe', 'cooking', 'chef', 'restaurant', 'cuisine', 'meal', 'dish', 'ingredient', 'baking', 'dessert', 'drink', 'beverage', 'taste', 'flavor'],
  'Art': ['art', 'artist', 'painting', 'sculpture', 'gallery', 'museum', 'exhibition', 'creative', 'design', 'drawing', 'photography', 'illustration', 'visual'],
  'Fashion': ['fashion', 'style', 'clothing', 'dress', 'outfit', 'designer', 'model', 'trend', 'collection', 'runway', 'brand', 'accessory', 'textile', 'wear'],
  'Environment': ['environment', 'climate', 'green', 'sustainable', 'eco', 'nature', 'conservation', 'renewable', 'pollution', 'recycle', 'biodiversity', 'earth', 'planet'],
  'Finance': ['finance', 'money', 'banking', 'investment', 'stock', 'market', 'fund', 'asset', 'wealth', 'budget', 'tax', 'loan', 'credit', 'debt', 'currency'],
  'Gaming': ['gaming', 'game', 'player', 'console', 'pc', 'video game', 'esports', 'multiplayer', 'strategy', 'rpg', 'fps', 'mmorpg', 'developer', 'studio']
};

// Simple tokenization function
function tokenize(text: string): string[] {
  return text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 0);
}

export async function categorizeContent(url: string, title: string, description: string): Promise<string[]> {
  try {
    // Combine title and description for analysis
    const content = `${title} ${description}`;
    
    // Calculate scores for each category
    const categoryScores: Record<string, number> = {};
    
    for (const category of predefinedCategories) {
      const keywords = categoryKeywords[category];
      let score = 0;
      
      // Tokenize the content
      const tokens = tokenize(content);
      
      for (const keyword of keywords) {
        // Check for multi-word keywords
        if (keyword.includes(' ')) {
          if (content.toLowerCase().includes(keyword.toLowerCase())) {
            score += 2; // Higher score for multi-word matches
          }
        } else {
          // Check for single word keywords
          if (tokens.includes(keyword.toLowerCase())) {
            score += 1;
          }
        }
      }
      
      // Check if the URL contains category-related terms
      for (const keyword of keywords) {
        if (url.toLowerCase().includes(keyword.toLowerCase())) {
          score += 0.5;
        }
      }
      
      categoryScores[category] = score;
    }
    
    // Sort categories by score
    const sortedCategories = Object.entries(categoryScores)
      .sort((a, b) => b[1] - a[1])
      .filter(([_, score]) => score > 0)
      .map(([category]) => category);
    
    // Return top 3 categories, or fewer if not enough matches
    return sortedCategories.slice(0, 3).length > 0 
      ? sortedCategories.slice(0, 3) 
      : ['Uncategorized'];
  } catch (error) {
    console.error('Error categorizing content:', error);
    return ['Uncategorized'];
  }
}

export function clusterByTopic(links: any[]): Record<string, any[]> {
  // Group links by their categories
  const clusters: Record<string, any[]> = {};
  
  for (const link of links) {
    const categories = link.categories || ['Uncategorized'];
    
    for (const category of categories) {
      if (!clusters[category]) {
        clusters[category] = [];
      }
      
      clusters[category].push(link);
    }
  }
  
  return clusters;
}
