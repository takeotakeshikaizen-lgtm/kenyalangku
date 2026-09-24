// Convert the supplied logo's existing boundaries into 3D-ready vector contours.
// This is deterministic tracing, not a redesigned or generated bird.
import sharp from 'sharp';
import {writeFile} from 'node:fs/promises';
const source='public/night-walk/assets/kenyalangku-loop-reference.png';
const {data,info}=await sharp(source).resize({width:627}).removeAlpha().raw().toBuffer({resolveWithObject:true});
const {width:w,height:h,channels}=info;
function simplify(points,epsilon=1.4){
  if(points.length<4)return points;
  const distance=(p,a,b)=>{const dx=b[0]-a[0],dy=b[1]-a[1],den=dx*dx+dy*dy;const t=den?Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/den)):0;return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy);};
  function rdp(p){let max=0,split=0;for(let i=1;i<p.length-1;i++){const d=distance(p[i],p[0],p.at(-1));if(d>max){max=d;split=i;}}return max>epsilon?[...rdp(p.slice(0,split+1)).slice(0,-1),...rdp(p.slice(split))]:[p[0],p.at(-1)];}
  const mid=Math.floor(points.length/2);return [...rdp(points.slice(0,mid+1)).slice(0,-1),...rdp([...points.slice(mid),points[0]]).slice(0,-1)];
}
const area=p=>p.reduce((a,v,i)=>{const n=p[(i+1)%p.length];return a+v[0]*n[1]-n[0]*v[1];},0)/2;
function trace(type){
  const mask=new Uint8Array(w*h),seen=new Uint8Array(w*h);
  for(let i=0;i<mask.length;i++){const k=i*channels,r=data[k],g=data[k+1],b=data[k+2];mask[i]=type==='black'?Math.max(r,g,b)<125?1:0:(r>160&&g>65&&g<224&&b<105)?1:0;}
  const components=[];
  for(let start=0;start<mask.length;start++){
    if(!mask[start]||seen[start])continue;
    const pixels=[start];seen[start]=1;let cursor=0;
    while(cursor<pixels.length){const i=pixels[cursor++],x=i%w,y=Math.floor(i/w);for(const [xx,yy] of [[x-1,y],[x+1,y],[x,y-1],[x,y+1]]){if(xx<0||yy<0||xx>=w||yy>=h)continue;const n=yy*w+xx;if(mask[n]&&!seen[n]){seen[n]=1;pixels.push(n);}}}
    if(pixels.length<100)continue;
    const edges=new Map();
    const add=(a,b)=>{if(!edges.has(a))edges.set(a,[]);edges.get(a).push(b);};
    const key=(x,y)=>y*(w+1)+x;
    for(const i of pixels){const x=i%w,y=Math.floor(i/w);if(y===0||!mask[i-w])add(key(x,y),key(x+1,y));if(x===w-1||!mask[i+1])add(key(x+1,y),key(x+1,y+1));if(y===h-1||!mask[i+w])add(key(x+1,y+1),key(x,y+1));if(x===0||!mask[i-1])add(key(x,y+1),key(x,y));}
    const contours=[];
    while(edges.size){const begin=edges.keys().next().value;let current=begin;const points=[];let guard=0;
      do{points.push([current%(w+1),Math.floor(current/(w+1))]);const next=edges.get(current);if(!next)break;const target=next.pop();if(!next.length)edges.delete(current);current=target;}while(current!==begin&&guard++<w*h);
      if(points.length>15)contours.push(simplify(points));
    }
    contours.sort((a,b)=>Math.abs(area(b))-Math.abs(area(a)));
    if(!contours.length)continue;
    const xs=pixels.map(i=>i%w),ys=pixels.map(i=>Math.floor(i/w));
    const bounds=[Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)];
    components.push({type,area:pixels.length,center:[xs.reduce((a,b)=>a+b,0)/xs.length,ys.reduce((a,b)=>a+b,0)/ys.length],bounds,outline:contours[0],holes:contours.slice(1)});
  }
  return components;
}
const components=[...trace('black'),...trace('orange')];
const result={source:'kenyalangku-loop-reference.png',width:w,height:h,components};
await writeFile('public/night-walk/assets/kenyalang-contours.json',JSON.stringify(result));
const paths=components.map((c,i)=>`<g><path fill="${c.type==='orange'?'#ffa400':'#242526'}" fill-rule="evenodd" d="${[c.outline,...c.holes].map(p=>'M'+p.map(v=>v.join(',')).join('L')+'Z').join('')}"/><text x="${c.center[0]}" y="${c.center[1]}" fill="red" font-size="12">${i}</text></g>`).join('');
await writeFile('.cache/review/logo-trace.svg',`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="100%" height="100%" fill="#deded8"/>${paths}</svg>`);
await sharp('.cache/review/logo-trace.svg').png().toFile('.cache/review/logo-trace.png');
console.log(components.map((c,i)=>({i,type:c.type,area:c.area,center:c.center.map(Math.round),bounds:c.bounds,holes:c.holes.length,vertices:c.outline.length})));
