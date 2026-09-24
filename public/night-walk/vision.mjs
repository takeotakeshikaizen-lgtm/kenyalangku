// The scroll animation is local to chapter 02. Every statement remains in HTML.
const vision = document.querySelector('#vision');
const stages = [...vision.querySelectorAll('.vision-step')];
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const thresholds = [0, .28, .58];
let queued = false;

function updateVision() {
  queued = false;
  const distance = Math.max(1, vision.offsetHeight - innerHeight);
  const progress = Math.min(1, Math.max(0, (scrollY - vision.offsetTop) / distance));
  const lineProgress = Math.min(100, progress / thresholds[2] * 100);
  vision.style.setProperty('--vision-line-progress', `${lineProgress}%`);
  stages.forEach((stage, index) => stage.classList.toggle('is-visible', reduced.matches || progress >= thresholds[index]));
}
function queueVision() {
  if (queued) return;
  queued = true;
  requestAnimationFrame(updateVision);
}

vision.classList.add('vision-enhanced');
updateVision();
addEventListener('scroll', queueVision, {passive: true});
addEventListener('resize', queueVision, {passive: true});
reduced.addEventListener('change', queueVision);
