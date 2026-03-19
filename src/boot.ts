import { BOOT_LINES } from './data.js';

export function runBootSequence(): Promise<void> {
  return new Promise((resolve) => {
    const terminal = document.getElementById('boot-terminal') as HTMLElement;
    const screen = document.getElementById('boot-screen') as HTMLElement;
    const glitch = document.getElementById('boot-glitch-overlay') as HTMLElement;

    let maxTime = 0;
    BOOT_LINES.forEach((line) => {
      const t = line.time + (line.appendDelay ?? 0);
      if (t > maxTime) maxTime = t;
    });

    BOOT_LINES.forEach((line) => {
      setTimeout(() => {
        const el = document.createElement('div');
        el.className = 'boot-line';
        el.style.color = line.color ?? '#00ff88';
        el.textContent = line.text;
        terminal.appendChild(el);

        if (line.append) {
          setTimeout(() => {
            el.textContent += line.append;
          }, line.appendDelay ?? 200);
        }
      }, line.time);
    });

    // After all lines, trigger glitch transition
    setTimeout(() => {
      glitch.classList.add('active');
      setTimeout(() => {
        screen.classList.add('hidden');
        resolve();
      }, 500);
    }, maxTime + 600);
  });
}
