const root = document.documentElement;
const mediaMotion = matchMedia('(prefers-reduced-motion: reduce)');
let reduced = mediaMotion.matches;
const hero = document.querySelector('.hero-scroll');
const poster = document.querySelector('.hero-poster');
const drift = document.querySelector('.scene-drift');
const cocoa = document.querySelector('.layer-cocoa');
const cream = document.querySelector('.layer-cream');
const tray = document.querySelector('.layer-tray');
const biscuits = document.querySelector('.layer-biscuits');
const foodLayers = [biscuits, cream, cocoa];
const labels = [...document.querySelectorAll('.ingredient-label')];
const motionToggle = document.querySelector('.motion-toggle');
const menuToggle = document.querySelector('.menu-toggle');
const menuPanel = document.querySelector('.menu-panel');
const menuIcon = menuToggle.querySelector('img');
let mouseX = 0, mouseY = 0, queued = false;
const clamp = (v,min,max) => Math.min(max, Math.max(min,v));
const mix = (from,to,t) => from+(to-from)*t;
function stage(progress,start,end){const t=clamp((progress-start)/(end-start),0,1);return t*t*(3-2*t);}
function setMotion(value) {
  reduced = value; root.classList.toggle('reduce-motion', value); root.classList.toggle('motion-ready', !value);
  motionToggle.textContent = value ? 'Միացնել շարժումը' : 'Նվազեցնել շարժումը'; motionToggle.setAttribute('aria-pressed', String(value));
  if (value) { [...foodLayers,tray,drift].forEach(el=>el.style.transform='');foodLayers.forEach(el=>el.style.filter=''); labels.forEach(el=>el.style.opacity='');document.querySelectorAll('.hero-word').forEach(el=>el.style.transform=''); }
  requestTick();
}
function renderMotion() {
  queued=false;
  const rect=hero.getBoundingClientRect();
  const progress=clamp(-rect.top/Math.max(1,hero.offsetHeight-poster.offsetHeight),0,1);
  document.querySelector('.rail-progress').style.transform=`scaleY(${clamp(scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight),0,1)})`;
  if (!reduced && rect.bottom>0 && rect.top<innerHeight) {
    const amount=progress*progress*(3-2*progress);
    // Land the biscuits first, then cream and cocoa; hold the complete dessert
    // for the final 10% of the sticky scene. All layers share the same camera angle.
    const biscuitLanding=stage(progress,0,.68);
    const creamLanding=stage(progress,.08,.82);
    const cocoaLanding=stage(progress,.16,.9);
    // The extracted biscuit sprite has extra transparent padding: .785 scale and
    // 20.8% Y reproduce its original resting position before independent travel.
    biscuits.style.transform=`translateY(${mix(20.8,36.8,biscuitLanding)}%) scale(.785)`;
    cream.style.transform=`translateY(${mix(6,22,creamLanding)}%) scale(${mix(.82,.76,creamLanding)})`;
    cocoa.style.transform=`translateY(${mix(-17,16,cocoaLanding)}%) scale(${mix(.86,.8,cocoaLanding)})`;
    tray.style.transform='translateY(29%) scale(1)';
    [biscuitLanding,creamLanding,cocoaLanding].forEach((landing,index)=>{
      foodLayers[index].style.filter=`drop-shadow(0 ${mix(22,3,landing)}px ${mix(18,4,landing)}px #0a465529)`;
    });
    drift.style.transform=`translate(-50%, -50%) rotate(${mouseX*1.4-amount*2}deg) translate3d(${mouseX*9}px,${mouseY*7}px,0)`;
    document.querySelector('.word-top').style.transform=innerWidth>700?`translateX(${-amount*2}%)`:'';
    document.querySelector('.word-bottom').style.transform=innerWidth>700?`translateX(${amount*1.5}%)`:'';
    labels.forEach(el=>el.style.opacity=String(clamp(1-amount*2.5,0,1)));
    document.querySelector('.scene-index').textContent=`0${Math.min(3,Math.floor(progress*3)+1)} — 03`;
  }
}
function requestTick(){if(!queued){queued=true;requestAnimationFrame(renderMotion);}}
addEventListener('scroll',requestTick,{passive:true});addEventListener('resize',requestTick,{passive:true});
poster.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse'||reduced)return;const r=poster.getBoundingClientRect();mouseX=(e.clientX-r.left)/r.width-.5;mouseY=(e.clientY-r.top)/r.height-.5;requestTick();});
poster.addEventListener('pointerleave',()=>{mouseX=0;mouseY=0;requestTick();});
motionToggle.addEventListener('click',()=>setMotion(!reduced));mediaMotion.addEventListener('change',e=>setMotion(e.matches));
const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target);}}),{threshold:.05});document.querySelectorAll('.reveal').forEach(e=>observer.observe(e));
const sectionObserver=new IntersectionObserver(entries=>{for(const e of entries){if(e.isIntersecting){document.querySelectorAll('.rail-nav a').forEach(a=>a.classList.toggle('active',a.hash==='#'+e.target.id));}}},{rootMargin:'-20% 0px -60% 0px'});['top','flavors','visit'].forEach(id=>sectionObserver.observe(document.getElementById(id)));
function toggleMenu(open){menuPanel.hidden=!open;root.classList.toggle('menu-open',open);menuToggle.setAttribute('aria-expanded',String(open));menuToggle.setAttribute('aria-label',open?'Փակել ընտրացանկը':'Բացել ընտրացանկը');menuIcon.src=open?'assets/icons/close.svg':'assets/icons/menu.svg';if(open)menuPanel.querySelector('a').focus();}
menuToggle.addEventListener('click',()=>toggleMenu(menuPanel.hidden));menuPanel.querySelector('.menu-close').addEventListener('click',()=>{toggleMenu(false);menuToggle.focus();});menuPanel.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>toggleMenu(false)));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!menuPanel.hidden){toggleMenu(false);menuToggle.focus();}if(e.key==='Tab'&&!menuPanel.hidden){const items=[menuPanel.querySelector('.menu-close'),...menuPanel.querySelectorAll('a')];const first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
// Fit Armenian display text using real rendered metrics after local fonts load.
// Only font size changes: no scaleX, condensed transforms, clipped labels or rasterized text.
function fitTypography(){document.querySelectorAll('.fit-text').forEach(el=>{el.style.fontSize='';if(innerWidth<=700&&el.classList.contains('hero-word'))return;const available=el.clientWidth;const range=document.createRange();range.selectNodeContents(el);const width=range.getBoundingClientRect().width;if(width>available){const px=parseFloat(getComputedStyle(el).fontSize);el.style.fontSize=(px*(available/width)*.985)+'px';}});}
document.fonts.ready.then(()=>{fitTypography();requestTick();});let resizeTimer;addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(fitTypography,100);});
setMotion(reduced);
