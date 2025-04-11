export function makeElementDraggable(element: HTMLElement, handle: HTMLElement) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  
  handle.onmousedown = dragMouseDown;
  
  function dragMouseDown(e: MouseEvent) {
    e.preventDefault();
    // Get the mouse cursor position at startup
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // Call a function whenever the cursor moves
    document.onmousemove = elementDrag;
    
    // Bring the element to the front
    element.style.zIndex = '10000';
  }
  
  function elementDrag(e: MouseEvent) {
    e.preventDefault();
    // Calculate the new cursor position
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    
    // Set the element's new position
    const newTop = element.offsetTop - pos2;
    const newLeft = element.offsetLeft - pos1;
    
    // Ensure the element stays within the viewport
    const maxX = window.innerWidth - element.offsetWidth;
    const maxY = window.innerHeight - element.offsetHeight;
    
    element.style.top = `${Math.max(0, Math.min(newTop, maxY))}px`;
    element.style.left = `${Math.max(0, Math.min(newLeft, maxX))}px`;
  }
  
  function closeDragElement() {
    // Stop moving when mouse button is released
    document.onmouseup = null;
    document.onmousemove = null;
    
    // Reset z-index to original value
    setTimeout(() => {
      element.style.zIndex = '9999';
    }, 100);
  }
}
