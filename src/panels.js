let isOpen = false;
let typewriterInterval = null;
let onCloseCallback = null;

const panel = document.getElementById('content-panel');
const titleEl = document.getElementById('panel-title');
const subtitleEl = document.getElementById('panel-subtitle');
const bodyEl = document.getElementById('panel-body');
const closeBtn = document.getElementById('panel-close');

export function openPanel(content, onClose) {
  if (isOpen) return;
  isOpen = true;
  onCloseCallback = onClose || null;

  titleEl.textContent = content.title;
  subtitleEl.textContent = content.subtitle;
  bodyEl.textContent = '';
  panel.classList.remove('hidden');

  // Typewriter effect
  const fullText = content.lines.join('\n');
  let charIndex = 0;

  typewriterInterval = setInterval(() => {
    if (charIndex >= fullText.length) {
      clearInterval(typewriterInterval);
      typewriterInterval = null;
      return;
    }
    bodyEl.textContent += fullText[charIndex];
    charIndex++;
  }, 12);
}

export function closePanel() {
  if (!isOpen) return;
  isOpen = false;

  if (typewriterInterval) {
    clearInterval(typewriterInterval);
    typewriterInterval = null;
  }

  panel.classList.add('hidden');
  if (onCloseCallback) {
    onCloseCallback();
    onCloseCallback = null;
  }
}

export function isPanelOpen() {
  return isOpen;
}

// Close on button click
closeBtn.addEventListener('click', closePanel);

// Close on ESC
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && isOpen) {
    closePanel();
  }
});
