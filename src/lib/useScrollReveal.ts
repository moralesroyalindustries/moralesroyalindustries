import { useEffect } from 'react';

const REVEAL_STYLES = `
[data-reveal] {
  opacity: 0;
  transform: translateY(40px) scale(0.96);
  transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1),
              transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
  transition-delay: var(--reveal-delay, 0ms);
  will-change: opacity, transform;
}
[data-reveal][data-reveal-slide="left"] {
  transform: translateX(-60px) scale(0.96);
}
[data-reveal][data-reveal-slide="right"] {
  transform: translateX(60px) scale(0.96);
}
[data-reveal][data-reveal-zoom] {
  transform: scale(0.85);
  transform-origin: center;
}
[data-reveal].is-revealed {
  opacity: 1;
  transform: translate(0, 0) scale(1);
}
@media (prefers-reduced-motion: reduce) {
  [data-reveal] {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }
}
`;

let styleInjected = false;

export function useScrollReveal() {
  useEffect(() => {
    if (!styleInjected) {
      const style = document.createElement('style');
      style.setAttribute('data-scroll-reveal', '');
      style.textContent = REVEAL_STYLES;
      document.head.appendChild(style);
      styleInjected = true;
    }

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-revealed'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const delay = el.dataset.revealDelay;
            if (delay) {
              el.style.setProperty('--reveal-delay', `${delay}ms`);
            }
            el.classList.add('is-revealed');
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );

    const elements = document.querySelectorAll('[data-reveal]:not(.is-revealed)');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);
}
