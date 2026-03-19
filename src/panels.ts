import type { NodeContent } from './types.js';

let isOpen = false;
let typewriterInterval: ReturnType<typeof setInterval> | null = null;
let onCloseCallback: (() => void) | null = null;

const panel = document.getElementById('content-panel') as HTMLElement;
const titleEl = document.getElementById('panel-title') as HTMLElement;
const subtitleEl = document.getElementById('panel-subtitle') as HTMLElement;
const bodyEl = document.getElementById('panel-body') as HTMLElement;
const closeBtn = document.getElementById('panel-close') as HTMLElement;

export function openPanel(content: NodeContent, onClose?: () => void): void {
  if (isOpen) return;
  isOpen = true;
  onCloseCallback = onClose ?? null;

  titleEl.textContent = content.title;
  subtitleEl.textContent = content.subtitle;
  bodyEl.textContent = '';
  panel.classList.remove('hidden');

  // Typewriter effect
  const fullText = content.lines.join('\n');
  let charIndex = 0;

  typewriterInterval = setInterval(() => {
    if (charIndex >= fullText.length) {
      clearInterval(typewriterInterval!);
      typewriterInterval = null;
      return;
    }
    bodyEl.textContent += fullText[charIndex];
    charIndex++;
  }, 12);
}

export function closePanel(): void {
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

export function isPanelOpen(): boolean {
  return isOpen;
}

// Close on button click
closeBtn.addEventListener('click', closePanel);

// Close on ESC
document.addEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key === 'Escape' && isOpen) {
    closePanel();
  }
});
