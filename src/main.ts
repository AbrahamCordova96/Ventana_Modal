import './style.css';
import { App } from './app/app';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="container">
    <h1>Smart Link Organizer</h1>
    <p>Drag and drop links to organize them intelligently</p>
    <div id="link-container"></div>
  </div>
`;

const app = new App();
app.init().catch(error => {
  console.error('Failed to initialize application:', error);
});
