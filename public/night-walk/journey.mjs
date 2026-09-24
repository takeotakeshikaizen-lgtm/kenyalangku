const $=selector=>document.querySelector(selector);
const $$=selector=>[...document.querySelectorAll(selector)];
const sections=$$('.chapter');
const names=['THE BEGINNING','OUR ROOTS','OUR VISION','OUR WORLDS','AFTERLIGHT'];
// The scene retains its original key poses. Compress the removed chapters into
// the transitions between the five chapters that remain on the page.
const sceneMoments=[0,1,2,4,6.7,7.5];
function sceneProgress(progress){
  const chapter=Math.max(0,Math.min(sceneMoments.length-2,Math.floor(progress)));
  const fraction=Math.max(0,Math.min(1,progress-chapter));
  return sceneMoments[chapter]+(sceneMoments[chapter+1]-sceneMoments[chapter])*fraction;
}
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
const fine=matchMedia('(hover: hover) and (pointer: fine)');
const menu=$('#menu'),menuButton=$('.kk-header__toggle'),motionButton=$('#motion-toggle'),foreground=$('.foreground'),status=$('#scene-status');
let world,active=-1,scrollProgress=0,smoothProgress=0,paused=reduce.matches,dirty=true,lastTime=0,worldTime=0,lastRender=0,frame=0,contextLost=false;
let previousMask='';
const pointer={x:0,y:0};
document.body.classList.add('enhanced');$('#year').textContent=new Date().getFullYear();
for(const heading of $$('[data-reveal]')){
  let index=0;
  for(const node of [...heading.childNodes]){
    if(node.nodeType!==Node.TEXT_NODE)continue;
    const fragment=document.createDocumentFragment();
    for(const word of node.textContent.split(/(\s+)/)){
      if(!word.trim()){fragment.append(document.createTextNode(word));continue;}
      const span=document.createElement('span');span.className='reveal-word';span.textContent=word;span.style.setProperty('--word-index',index++);fragment.append(span);
    }
    node.replaceWith(fragment);
  }
}
sections.forEach(s=>s.querySelectorAll('.reveal-item').forEach((item,i)=>item.style.setProperty('--reveal-delay',`${180+i*100}ms`)));
const collaborationTrack=$('.collaboration-band__track');
if(collaborationTrack){
  const firstSet=collaborationTrack.querySelector('.collaboration-band__set');
  for(let i=0;i<3;i++){
    const repeatedSet=firstSet.cloneNode(true);
    repeatedSet.setAttribute('aria-hidden','true');
    repeatedSet.querySelectorAll('a').forEach(link=>link.tabIndex=-1);
    collaborationTrack.append(repeatedSet);
  }
  collaborationTrack.closest('.collaboration-band').classList.add('is-looping');
}
function protectCopy(){
  // Keep foreground geometry clear of all headings, body copy, and links.
  // These mask rectangles follow actual HTML positions, including responsive
  // layouts and sticky sections. The same bird remains visible behind the copy.
  const rectangles=$$('.chapter-divider,.collaboration-band,.contact-panel,h1,h2,.eyebrow,.brand-jawi,.chapter-coordinate,.lede,.body-copy,.vision-step h3,.vision-step p,.vision-next,.text-link,.project-panel,.founder-line,.closing-contact').map(element=>element.getBoundingClientRect()).filter(r=>r.bottom>0&&r.top<innerHeight);
  const holes=rectangles.map(r=>`<rect x="${Math.round(r.left-7)}" y="${Math.round(r.top-5)}" width="${Math.round(r.width+14)}" height="${Math.round(r.height+10)}" fill="black"/>`).join('');
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${innerWidth}" height="${innerHeight}"><rect width="100%" height="100%" fill="white"/>${holes}</svg>`;
  if(svg!==previousMask){$('#front-world').style.maskImage=`url("data:image/svg+xml,${encodeURIComponent(svg)}")`;$('#front-world').style.maskMode='luminance';previousMask=svg;}
}
function updateScroll(){
  const offsets=sections.map(s=>s.offsetTop);const y=scrollY,h=innerHeight;
  let next=0;for(let i=0;i<offsets.length;i++)if(y+h*.22>=offsets[i])next=i;
  if(active!==next){
    active=next;document.body.dataset.chapter=active;$('#chapter-status').textContent=`0${active} / ${names[active]}`;
    for(const link of $$('.chapter-rail a')){if(link.hash===`#${sections[active].id}`)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');}
  }
  let segment=0;for(let i=0;i<offsets.length;i++)if(y>=offsets[i])segment=i;
  const end=offsets[segment+1]??$('#manifesto').offsetTop;
  const fraction=Math.min(1,Math.max(0,(y-offsets[segment])/(end-offsets[segment])));
  scrollProgress=segment+fraction;
  const fade=Math.max(0,1-Math.max(0,fraction-.82)/.18);
  foreground.style.opacity=reduce.matches||active===0||active===4?'0':String(fade*.55);
  foreground.style.filter=`blur(${(1-fade)*6}px)`;
  document.documentElement.style.setProperty('--progress',`${Math.min(100,scrollProgress/(sections.length-.15)*100)}%`);
  const footerVisible=y+h*.92>=$('#manifesto').offsetTop;
  document.body.classList.toggle('manifesto-active',footerVisible);
  if(menu.hidden){$('.chapter-rail').inert=footerVisible||Boolean(window.kenyalangIntro?.active);$('.scene-controls').inert=footerVisible||Boolean(window.kenyalangIntro?.active);}
  protectCopy();dirty=true;if(reduce.matches||paused)sections[active].classList.add('entered');
}
updateScroll();smoothProgress=scrollProgress;
addEventListener('scroll',updateScroll,{passive:true});addEventListener('resize',()=>{updateScroll();world?.resize();},{passive:true});
document.fonts.ready.then(updateScroll);const layoutObserver=new ResizeObserver(updateScroll);layoutObserver.observe($('#main'));
function setMenu(open,restoreFocus=true){
  menu.hidden=!open;document.body.classList.toggle('menu-open',open);menuButton.setAttribute('aria-expanded',String(open));menuButton.setAttribute('aria-label',open?'Close navigation':'Open navigation');
  $('main').inert=open;$('#manifesto').inert=open;$('.chapter-rail').inert=open;$('.scene-controls').inert=open;if(open)menu.querySelector('a').focus();else if(restoreFocus)menuButton.focus();
}
menuButton.addEventListener('click',()=>setMenu(menu.hidden));
matchMedia('(min-width: 1051px)').addEventListener('change',event=>{if(event.matches&&!menu.hidden)setMenu(false,false);});
addEventListener('keydown',event=>{
  if(event.key==='Escape'&&!menu.hidden)setMenu(false);
  if(event.key==='Tab'&&!menu.hidden){const links=[menuButton,...menu.querySelectorAll('a')];const i=links.indexOf(document.activeElement);event.preventDefault();links[(i+(event.shiftKey?-1:1)+links.length)%links.length].focus();}
});
const standaloneTargets={about:'#roots',projects:'#worlds',journal:'#studio-notes',collaboration:'#connections',contact:'#afterlight','projects/pusaka':'#worlds','projects/myth-tanah':'#worlds'};
for(const link of $$('[data-company-route]')){link.href=standaloneTargets[link.dataset.companyRoute];link.addEventListener('click',()=>{if(!menu.hidden)setMenu(false,false);if(link.dataset.companyRoute==='journal')$('#studio-notes').open=true;});}
for(const link of $$('a[href^="#"]'))link.addEventListener('click',event=>{
  const target=document.getElementById(link.hash.slice(1));if(!target)return;event.preventDefault();if(!menu.hidden)setMenu(false,false);history.pushState(null,'',link.hash);
  target.scrollIntoView({behavior:reduce.matches?'instant':'smooth',block:'start'});target.setAttribute('tabindex','-1');target.focus({preventScroll:true});
});
fetch(location.href.split('#')[0],{method:'HEAD',cache:'no-store'}).then(r=>{if(r.headers.get('X-KenyalangKu-Company')==='enabled')for(const a of $$('[data-company-route]'))a.href=`./${a.dataset.companyRoute}`;}).catch(()=>{});
function reflectMotion(){motionButton.setAttribute('aria-pressed',String(paused));motionButton.innerHTML=paused?'RESUME MOTION <span>▷</span>':'PAUSE MOTION <span>Ⅱ</span>';dirty=true;}
motionButton.addEventListener('click',()=>{paused=!paused;reflectMotion();});
reduce.addEventListener('change',()=>{paused=reduce.matches;pointer.x=pointer.y=0;document.body.classList.remove('cursor-ready');reflectMotion();requestAnimationFrame(updateScroll);});reflectMotion();
addEventListener('pointermove',event=>{
  if(!fine.matches||reduce.matches)return;document.body.classList.add('cursor-ready');$('#cursor').style.transform=`translate(${event.clientX}px,${event.clientY}px)`;
  document.body.classList.toggle('cursor-hover',Boolean(event.target.closest('a,button,summary')));pointer.x=event.clientX/innerWidth-.5;pointer.y=.5-event.clientY/innerHeight;dirty=true;
},{passive:true});
document.addEventListener('pointerleave',()=>document.body.classList.remove('cursor-ready'));fine.addEventListener('change',()=>{if(!fine.matches)document.body.classList.remove('cursor-ready');});
function tick(now){
  frame=requestAnimationFrame(tick);if(document.hidden)return;const dt=Math.min((now-lastTime)/1000,.05);lastTime=now;
  if(window.kenyalangIntro?.active)return;
  if(!paused&&!reduce.matches)worldTime+=dt;
  const delta=scrollProgress-smoothProgress;smoothProgress=reduce.matches||paused?scrollProgress:smoothProgress+delta*(1-Math.exp(-dt*4.6));if(Math.abs(delta)>.0001)dirty=true;
  // Copy joins the same eased timeline as the creature.
  const revealChapter=Math.max(0,Math.min(sections.length-1,Math.floor(smoothProgress+.22)));sections[revealChapter].classList.add('entered');
  if(!world||contextLost||((paused||reduce.matches||document.body.classList.contains('manifesto-active'))&&!dirty)||now-lastRender<1000/(innerWidth<761?30:45))return;
  const result=world.render(reduce.matches?(active===4?7.5:sceneProgress(active)):sceneProgress(smoothProgress),reduce.matches?8:worldTime,reduce.matches?{x:0,y:0}:pointer,{reducedMotion:reduce.matches});
  document.body.dataset.kenyalangPhase=result.phase;document.body.dataset.bodySegments=result.segments;document.body.dataset.frontSegments=result.frontVisible;dirty=false;lastRender=now;
}
requestAnimationFrame(tick);
async function start(){
  try{
    const {createKenyalang}=await import('./kenyalang.mjs');world=await createKenyalang($('#world'),$('#front-world'));
    world.render(sceneProgress(scrollProgress),reduce.matches?8:worldTime,pointer,{reducedMotion:reduce.matches});document.body.classList.add('scene-ready');document.body.classList.remove('scene-fallback');contextLost=false;status.textContent='The Kenyalang is ready. Scroll through five chapters.';
  }catch(error){
    console.warn('The 3D journey is unavailable. The logo and complete written story remain available.',error);document.body.classList.add('scene-fallback');motionButton.hidden=true;sections.forEach(s=>s.classList.add('entered'));status.textContent='Illustrated mode. All five chapters remain available.';
  }finally{
    window.kenyalangIntro?.sceneReady();
    await window.kenyalangIntro?.ready;
    worldTime=0;lastTime=performance.now();dirty=true;updateScroll();
  }
}
$('#world').addEventListener('webglcontextlost',event=>{event.preventDefault();contextLost=true;document.body.classList.remove('scene-ready');document.body.classList.add('scene-fallback');status.textContent='Illustrated mode. The full story remains available while the scene reconnects.';});
$('#world').addEventListener('webglcontextrestored',()=>{world?.dispose();world=undefined;start();});
addEventListener('pagehide',()=>{cancelAnimationFrame(frame);world?.dispose();layoutObserver.disconnect();});addEventListener('pageshow',event=>{if(event.persisted)location.reload();});start();
