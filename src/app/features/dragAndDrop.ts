import { extractLinks } from '../utils/linkExtractor';
import { saveLink } from '../data/linkRepository';
import { generatePreview } from './linkPreview';
import { categorizeContent } from './aiCategorization';
import { showNotification } from './notifications';
import { renderLinks } from '../components/linkRenderer';

export function setupDragAndDrop() {
  const dropZone = document.getElementById('drop-zone');
  
  if (!dropZone) return;
  
  // Prevent default behavior to allow drop
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
    document.body.addEventListener(eventName, preventDefaults, false);
  });
  
  // Highlight drop zone when item is dragged over it
  ['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, highlight, false);
  });
  
  ['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, unhighlight, false);
  });
  
  // Handle drop event
  dropZone.addEventListener('drop', handleDrop, false);
  
  // Handle paste event
  document.addEventListener('paste', handlePaste, false);
}

function preventDefaults(e: Event) {
  e.preventDefault();
  e.stopPropagation();
}

function highlight() {
  const dropZone = document.getElementById('drop-zone');
  dropZone?.classList.add('active');
}

function unhighlight() {
  const dropZone = document.getElementById('drop-zone');
  dropZone?.classList.remove('active');
}

async function handleDrop(e: DragEvent) {
  const dt = e.dataTransfer;
  if (!dt) return;
  
  const statusText = document.querySelector('.status-text');
  if (statusText) {
    statusText.textContent = 'Processing dropped content...';
  }
  
  // Handle dropped files
  if (dt.files.length > 0) {
    handleFiles(dt.files);
  } 
  // Handle dropped text/html content
  else if (dt.types.includes('text/html') || dt.types.includes('text/plain')) {
    const html = dt.getData('text/html');
    const text = dt.getData('text/plain');
    
    const content = html || text;
    await processContent(content);
  }
  
  if (statusText) {
    statusText.textContent = 'Ready';
  }
}

async function handlePaste(e: ClipboardEvent) {
  const clipboardData = e.clipboardData;
  if (!clipboardData) return;
  
  const statusText = document.querySelector('.status-text');
  if (statusText) {
    statusText.textContent = 'Processing pasted content...';
  }
  
  // Handle pasted text/html content
  if (clipboardData.types.includes('text/html') || clipboardData.types.includes('text/plain')) {
    const html = clipboardData.getData('text/html');
    const text = clipboardData.getData('text/plain');
    
    const content = html || text;
    await processContent(content);
  }
  
  if (statusText) {
    statusText.textContent = 'Ready';
  }
}

async function handleFiles(files: FileList) {
  // Process each file
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    // Only process text files
    if (file.type.startsWith('text/')) {
      const text = await file.text();
      await processContent(text);
    }
  }
}

async function processContent(content: string) {
  // Extract links from the content
  const links = extractLinks(content);
  
  if (links.length === 0) {
    showNotification('No links found', 'The dropped content does not contain any valid links.');
    return;
  }
  
  // Process each link
  for (const link of links) {
    try {
      // Generate preview for the link
      const preview = await generatePreview(link);
      
      // Categorize the content using AI
      const categories = await categorizeContent(link, preview.title, preview.description);
      
      // Save the link to the database
      await saveLink({
        url: link,
        title: preview.title || 'Untitled',
        description: preview.description || '',
        imageUrl: preview.imageUrl,
        categories,
        createdAt: new Date()
      });
      
      // Show notification
      showNotification('Link saved', `"${preview.title}" has been added to your collection.`);
      
      // Refresh the links display
      await renderLinks();
      
    } catch (error) {
      console.error('Error processing link:', error);
      showNotification('Error', `Failed to process link: ${link}`);
    }
  }
}
