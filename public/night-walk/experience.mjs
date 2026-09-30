const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const sections = $$('.chapter');
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const fine = matchMedia('(hover: hover) and (pointer: fine)');
const names = ['ARRIVAL', 'THE THRESHOLD', 'STILL GARDENS', 'SACRED CRAFT', 'AFTERLIGHT'];
const foreground = $('.foreground');
const menu = $('#menu');
const menuButton = $('.menu-toggle');
const motionButton = $('#motion-toggle');
const tourBar = $('#tour-bar');
const status = $('#scene-status');
let world, active = -1, scrollProgress = 0, smoothProgress = 0;
let paused = reduce.matches, dirty = true, lastTime = 0, worldTime = 0;
let tour = null, frame = 0, lastRender = 0, offsets = [];
const pointer = {x:0,y:0};
document.body.classList.add('enhanced');
$('#year').textContent = new Date().getFullYear();

// Preserve heading semantics and line breaks while animating individual words.
for (const heading of $$('[data-reveal]')) {
  let index = 0;
  for (const node of [...heading.childNodes]) {
    if (node.nodeType !== Node.TEXT_NODE) continue;
    const fragment = document.createDocumentFragment();
    for (const word of node.textContent.split(/(\s+)/)) {
      if (!word.trim()) { fragment.append(document.createTextNode(word)); continue; }
      const span = document.createElement('span'); span.className = 'reveal-word'; span.textContent = word;
      span.style.setProperty('--word-index', index++); fragment.append(span);
    }
    node.replaceWith(fragment);
  }
}
sections.forEach(section => section.querySelectorAll('.reveal-item').forEach((item,i) => item.style.setProperty('--reveal-delay', `${180+i*90}ms`)));
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => { if(entry.isIntersecting)entry.target.classList.add('entered'); });
}, {threshold:0,rootMargin:'0px 0px -15% 0px'});
sections.forEach(s=>observer.observe(s));

function measure() { offsets=sections.map(s=>s.offsetTop); dirty=true; updateScroll(); }
function updateScroll() {
  offsets=sections.map(section=>section.offsetTop);
  const y=scrollY, h=innerHeight;
  let next=0;
  for(let i=0;i<offsets.length;i++)if(y+h*.23>=offsets[i])next=i;
  if(next!==active){
    active=next; document.body.dataset.chapter=active;
    foreground.dataset.active=active;
    $('#chapter-status').textContent=`0${active} / ${names[active]}`;
    for(const link of $$('.chapter-nav a, .chapter-rail a')){
      if(link.hash===`#${sections[active].id}`)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');
    }
    sections[active].classList.add('entered');
  }
  let segment=0;
  for(let i=0;i<offsets.length;i++)if(y>=offsets[i])segment=i;
  const nextOffset=offsets[segment+1]??$('#manifesto').offsetTop;
  const fraction=Math.min(1,Math.max(0,(y-offsets[segment])/(nextOffset-offsets[segment])));
  scrollProgress=segment+fraction;
  const fade=reduce.matches?0:Math.max(0,1-Math.max(0,fraction-.84)/.16);
  foreground.style.opacity=fade;
  foreground.style.filter=`blur(${(1-fade)*9}px)`;
  document.documentElement.style.setProperty('--progress',`${Math.min(100,scrollProgress/5*100)}%`);
  document.body.classList.toggle('manifesto-active',y+h*.55>=$('#manifesto').offsetTop);
  dirty=true;
}
addEventListener('scroll',updateScroll,{passive:true});
addEventListener('resize',()=>{measure();world?.resize();},{passive:true});
document.fonts.ready.then(measure);
measure(); smoothProgress=scrollProgress;

function setMenu(open,returnFocus=true){
  if(open&&tour)endTour(false);
  menu.hidden=!open; document.body.classList.toggle('menu-open',open);
  menuButton.setAttribute('aria-expanded',String(open));menuButton.setAttribute('aria-label',open?'Close navigation':'Open navigation');
  if(open){$('main').inert=true;$('.chapter-rail').inert=true;$('.scene-controls').inert=true;menu.querySelector('a').focus();}
  else{$('main').inert=false;$('.chapter-rail').inert=false;$('.scene-controls').inert=false;if(returnFocus)menuButton.focus();}
}
menuButton.addEventListener('click',()=>setMenu(menu.hidden));
addEventListener('keydown',event=>{
  if(event.key==='Escape'){if(!menu.hidden)setMenu(false);if(tour)endTour();}
  if(event.key==='Tab'&&!menu.hidden){
    const links=[menuButton,...menu.querySelectorAll('a')];
    const current=links.indexOf(document.activeElement);
    event.preventDefault();links[(current+(event.shiftKey?-1:1)+links.length)%links.length].focus();
  }
});
for(const link of $$('a[href^="#"]'))link.addEventListener('click',event=>{
  const target=document.getElementById(link.hash.slice(1));if(!target)return;
  event.preventDefault();if(tour)endTour(false);if(!menu.hidden)setMenu(false,false);
  history.pushState(null,'',link.hash);
  target.scrollIntoView({behavior:reduce.matches?'instant':'smooth',block:'start'});
  target.setAttribute('tabindex','-1');target.focus({preventScroll:true});
});

// Static delivery uses local story anchors. Next adds this response header to
// enable its existing company pages without imposing a framework on this file.
const standaloneTargets={about:'#afterlight',projects:'#craft',collaboration:'#connections',contact:'#contact','projects/pusaka':'#craft','projects/myth-tanah':'#craft'};
for(const link of $$('[data-company-links] a, [data-company-route]')){
  const route=link.dataset.companyRoute||link.getAttribute('href').replace(/^\.\//,'');
  link.dataset.companyRoute=route;link.href=standaloneTargets[route]||'#manifesto';
  link.addEventListener('click',()=>{if(!menu.hidden)setMenu(false,false);});
}
fetch(location.href.split('#')[0],{method:'HEAD',cache:'no-store'}).then(response=>{
  if(response.headers.get('X-KenyalangKu-Company')==='enabled')for(const link of $$('[data-company-route]'))link.href=`./${link.dataset.companyRoute}`;
}).catch(()=>{});

function reflectMotion(){
  motionButton.setAttribute('aria-pressed',String(paused));motionButton.innerHTML=paused?'RESUME MOTION <span>▷</span>':'PAUSE MOTION <span>Ⅱ</span>';
  document.body.classList.toggle('motion-paused',paused);dirty=true;
  for(const button of $$('.scene-play'))button.setAttribute('aria-label',`${reduce.matches?'View a still of':'Play'} the ${Number(button.dataset.tour)===1?'threshold':'garden'} camera study`);
}
motionButton.addEventListener('click',()=>{paused=!paused;if(paused&&tour)endTour();reflectMotion();});
reduce.addEventListener('change',()=>{paused=reduce.matches;pointer.x=pointer.y=0;document.body.classList.remove('cursor-ready');if(tour)endTour();reflectMotion();requestAnimationFrame(measure);});
reflectMotion();
function endTour(returnFocus=true){
  const trigger=tour?.trigger;tour=null;tourBar.hidden=true;document.body.classList.remove('touring');
  $('main').inert=!menu.hidden;
  if(returnFocus)trigger?.focus({preventScroll:true});dirty=true;
}
for(const trigger of $$('.scene-play'))trigger.addEventListener('click',()=>{
  if(!world)return;
  if(reduce.matches){status.textContent='Camera study: a still view of this chapter. Reduced motion is enabled.';return;}
  tour={started:performance.now(),chapter:Number(trigger.dataset.tour),trigger};
  $('main').inert=true;
  tourBar.hidden=false;document.body.classList.add('touring');$('#stop-tour').focus({preventScroll:true});
  status.textContent=`Playing a twelve-second ${names[tour.chapter].toLowerCase()} camera study.`;
});
$('#stop-tour').addEventListener('click',()=>endTour());
addEventListener('wheel',()=>{if(tour)endTour(false);},{passive:true});
addEventListener('touchstart',event=>{if(tour&&!tourBar.contains(event.target))endTour(false);},{passive:true});
addEventListener('pointermove',event=>{
  if(!fine.matches||reduce.matches)return;
  document.body.classList.add('cursor-ready');$('#cursor').style.transform=`translate(${event.clientX}px,${event.clientY}px)`;
  document.body.classList.toggle('cursor-hover',Boolean(event.target.closest('a,button')));
  pointer.x=event.clientX/innerWidth-.5;pointer.y=.5-event.clientY/innerHeight;dirty=true;
},{passive:true});
document.addEventListener('pointerleave',()=>document.body.classList.remove('cursor-ready'));
fine.addEventListener('change',()=>{if(!fine.matches)document.body.classList.remove('cursor-ready');});

function tick(now){
  frame=requestAnimationFrame(tick);
  if(document.hidden)return;
  const dt=Math.min((now-lastTime)/1000,.05);lastTime=now;
  if(!paused&&!reduce.matches)worldTime+=dt;
  const delta=scrollProgress-smoothProgress;
  smoothProgress=reduce.matches||paused?scrollProgress:smoothProgress+delta*(1-Math.exp(-dt*5));
  if(Math.abs(delta)>.0001)dirty=true;
  if(!world||((paused||reduce.matches||document.body.classList.contains('manifesto-active'))&&!dirty&&!tour)||now-lastRender<1000/40)return;
  let tourAngle=0,progress=smoothProgress;
  if(tour){const duration=(now-tour.started)/12000;if(duration>=1)endTour();else{progress=tour.chapter+.1;tourAngle=Math.sin(duration*Math.PI)*.8;$('#tour-progress').textContent=` / ${Math.ceil(12-duration*12)}s`;}}
  world.render(progress,worldTime,reduce.matches?{x:0,y:0}:pointer,tourAngle);
  dirty=false;lastRender=now;
}
requestAnimationFrame(tick);
async function start(){
  try {
    const {createPalace}=await import('./scene.mjs');world=createPalace($('#world'));world.render(scrollProgress,0);document.body.classList.add('scene-ready');
    status.textContent='The palace is ready. Scroll to walk through five chapters.';
  } catch(error) {
    console.warn('The live palace is unavailable; the complete illustrated story remains available.',error);
    document.body.classList.add('scene-fallback');
    motionButton.hidden=true;for(const button of $$('.scene-play')){button.disabled=true;button.querySelector('.play-icon').hidden=true;button.setAttribute('aria-label','Cinematic environment study');}
    status.textContent='Showing the illustrated story. WebGL is unavailable on this device.';
  }
}
$('#world').addEventListener('webglcontextlost',event=>{event.preventDefault();document.body.classList.remove('scene-ready');status.textContent='The illustrated story remains available while the 3D scene reconnects.';});
$('#world').addEventListener('webglcontextrestored',()=>{world?.dispose();world=undefined;start();});
addEventListener('pagehide',()=>{cancelAnimationFrame(frame);world?.dispose();observer.disconnect();});
addEventListener('pageshow',event=>{if(event.persisted)location.reload();});
const layoutObserver=new ResizeObserver(measure);
layoutObserver.observe($('#main'));
addEventListener('pagehide',()=>layoutObserver.disconnect());
start();
