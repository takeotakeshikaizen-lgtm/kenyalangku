// Small independent bootstrap: the page is never held behind a failed WebGL
// import. Without JavaScript, this screen is hidden and the story stays readable.
(() => {
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const started = performance.now();
  const minimum = reduced.matches ? 0 : 2300;
  const tasks = new Map();
  const locked = new Map();
  let mounted = false, leaving = false, finished = false, finishTimer;
  let resolveReady;
  const ready = new Promise(resolve => { resolveReady = resolve; });
  root.classList.add('is-loading');

  function update() {
    if (!mounted || finished) return;
    const progress = [...tasks.values()].reduce((sum, value) => sum + value, 0);
    document.querySelector('.intro-track').style.setProperty('--intro-progress', progress / 100);
    document.querySelector('.intro-track').setAttribute('aria-valuenow', progress);
    document.querySelector('#intro-percent').textContent = `${progress}%`;
    if (progress === 100 && !leaving && !finishTimer) {
      finishTimer = setTimeout(finish, Math.max(0, minimum - (performance.now() - started)));
    }
  }
  function mark(name, weight) { tasks.set(name, weight); update(); }
  function release() {
    if (finished) return;
    finished = true;
    clearTimeout(watchdog);
    root.classList.remove('is-loading', 'is-revealing');
    document.querySelector('#intro-loader')?.setAttribute('hidden', '');
    for (const [element, wasInert] of locked) element.inert = wasInert;
    document.querySelector('main')?.removeAttribute('aria-busy');
    resolveReady();
  }
  function finish() {
    if (leaving || finished) return;
    if (!mounted) { release(); return; }
    leaving = true;
    clearTimeout(finishTimer);
    const complete = tasks.has('scene');
    document.querySelector('#intro-message').textContent = complete ? 'THE JOURNEY BEGINS' : 'ENTERING THE JOURNEY';
    root.classList.replace('is-loading', 'is-revealing');
    setTimeout(release, reduced.matches ? 0 : 720);
  }
  // Eight seconds is an upper bound even if an asset or script never responds.
  const watchdog = setTimeout(finish, 8000);
  window.kenyalangIntro = { ready, sceneReady: () => mark('scene', 50), get active() { return !finished; } };
  document.addEventListener('DOMContentLoaded', () => {
    if (finished) return;
    mounted = true;
    for (const element of document.querySelectorAll('.skip,.masthead,#menu,.chapter-rail,main,footer,.scene-controls')) {
      locked.set(element, element.inert); element.inert = true;
    }
    document.querySelector('main').setAttribute('aria-busy', 'true');
    const imageReady = image => image.complete ? Promise.resolve() : new Promise(resolve => {
      image.addEventListener('load', resolve, {once:true});
      image.addEventListener('error', resolve, {once:true});
    });
    Promise.all([...document.images].filter(image => image.loading !== 'lazy').map(imageReady)).then(() => mark('images', 25));
    Promise.allSettled([
      document.fonts.load('400 26px "Kenyalang Jawi"', 'کڽالڠکو'),
      document.fonts.load('400 12px Manrope')
    ]).then(() => mark('fonts', 25));
    update();
  }, {once:true});
})();
