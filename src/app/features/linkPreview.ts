interface LinkPreview {
  title: string;
  description: string;
  imageUrl?: string;
}

export async function generatePreview(url: string): Promise<LinkPreview> {
  try {
    // In a real application, you would use a server-side API to fetch the preview
    // For this demo, we'll simulate the preview generation
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Extract domain from URL
    const domain = new URL(url).hostname;
    
    // Generate a placeholder preview based on the domain
    return {
      title: `Content from ${domain}`,
      description: `This is a preview of the content from ${url}. In a real application, this would be extracted from the actual page.`,
      imageUrl: `https://logo.clearbit.com/${domain}`
    };
  } catch (error) {
    console.error('Error generating preview:', error);
    
    // Return a fallback preview
    return {
      title: 'Unknown Content',
      description: 'Unable to generate preview for this link.',
    };
  }
}
