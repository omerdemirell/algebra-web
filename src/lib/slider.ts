const slider = document.querySelector<HTMLElement>('[data-slider]');
if (slider) {
  const slides = Array.from(slider.querySelectorAll<HTMLElement>('[data-slide]'));
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  let index = 0,
    visible = true,
    keyboardFocus = false,
    transition = 0,
    timer: ReturnType<typeof setTimeout> | undefined,
    preloadTimer: ReturnType<typeof setTimeout> | undefined;
  const announce = slider.querySelector<HTMLElement>('.slide-announcement')!;
  function prepareSlide(next: number) {
    const image =
      slides[(next + slides.length) % slides.length]!.querySelector<HTMLImageElement>('img')!;
    if (!image.dataset.src) return;
    image.loading = 'eager';
    image.srcset = image.dataset.srcset || '';
    image.src = image.dataset.src;
    delete image.dataset.src;
  }
  function schedule() {
    clearTimeout(timer);
    clearTimeout(preloadTimer);
    const playing = !media.matches && visible && !document.hidden && !keyboardFocus;
    slider!.classList.toggle('is-paused', !playing);
    announce.setAttribute('aria-live', keyboardFocus ? 'polite' : 'off');
    if (playing) {
      timer = setTimeout(() => void show(index + 1), 7500);
      // Prepare only the upcoming image, keeping full-size PNGs out of the first load.
      preloadTimer = setTimeout(() => prepareSlide(index + 1), 1500);
    }
  }
  async function show(next: number, animate = true) {
    const version = ++transition;
    index = (next + slides.length) % slides.length;
    const activeIndex = index;
    prepareSlide(index);
    slides.forEach((slide, i) => {
      if (slide.classList.contains('is-active') && i !== index) {
        slide.classList.add('is-leaving');
        setTimeout(() => slide.classList.remove('is-leaving'), 1000);
      }
      slide.classList.toggle('is-active', i === index);
      slide.setAttribute('aria-hidden', String(i !== index));
      slide.toggleAttribute('inert', i !== index);
    });
    announce.textContent =
      slides[activeIndex]!.querySelector('h1, h2')?.textContent?.replace(/\s+/g, ' ').trim() || '';
    schedule();
    if (animate && !media.matches) {
      const { gsap } = await import('gsap');
      if (version !== transition || media.matches) return;
      gsap.fromTo(
        slides[activeIndex]!.querySelectorAll('.hero-content > *'),
        { y: 18, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.65, stagger: 0.08, clearProps: 'all', overwrite: true },
      );
    }
  }
  slider.querySelector('[data-prev]')?.addEventListener('click', () => show(index - 1));
  slider.querySelector('[data-next]')?.addEventListener('click', () => show(index + 1));
  window.addEventListener('keydown', (e) => {
    if (
      !visible ||
      document.hidden ||
      document.body.classList.contains('menu-open') ||
      (document.activeElement instanceof HTMLElement &&
        document.activeElement.closest('input, textarea, select, [contenteditable="true"]'))
    )
      return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      void show(index + (e.key === 'ArrowRight' ? 1 : -1));
    }
  });
  function updateFocus() {
    keyboardFocus = Boolean(
      slider!.contains(document.activeElement) && document.activeElement?.matches(':focus-visible'),
    );
    schedule();
  }
  // Keyboard users can read and navigate a stable slide. Mouse, touch and hover
  // interactions never leave the automatic sequence permanently stopped.
  slider.addEventListener('focusin', updateFocus);
  slider.addEventListener('focusout', () => queueMicrotask(updateFocus));
  slider.addEventListener('pointerdown', () => {
    keyboardFocus = false;
    schedule();
  });
  let touchStart = 0;
  slider.addEventListener(
    'touchstart',
    (e) => {
      touchStart = e.changedTouches[0]?.clientX || 0;
    },
    { passive: true },
  );
  slider.addEventListener(
    'touchend',
    (e) => {
      const dx = (e.changedTouches[0]?.clientX || 0) - touchStart;
      if (Math.abs(dx) > 60) show(index + (dx < 0 ? 1 : -1));
    },
    { passive: true },
  );
  document.addEventListener('visibilitychange', schedule);
  media.addEventListener('change', schedule);
  const observer = new IntersectionObserver(
    ([entry]) => {
      visible = entry?.isIntersecting ?? false;
      schedule();
    },
    { threshold: 0.15 },
  );
  observer.observe(slider);
  addEventListener('pagehide', () => {
    clearTimeout(timer);
    clearTimeout(preloadTimer);
    observer.disconnect();
  });
  addEventListener('pageshow', (event) => {
    if (event.persisted) {
      keyboardFocus = false;
      observer.observe(slider!);
      void show(0, false);
    }
  });
  // No saved slide state: each document load begins with the first slide.
  void show(0, false);
}
