import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// One world, one camera. All architecture, foliage and weather are procedural.
export function createPalace(canvas) {
  const mobile = matchMedia('(max-width: 760px)').matches;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.2 : 1.5));
  renderer.setSize(innerWidth, innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.35;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#0b151b');
  scene.fog = new THREE.FogExp2('#15232b', .011);
  const camera = new THREE.PerspectiveCamera(mobile ? 61 : 46, innerWidth / innerHeight, .1, 230);
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), .28, .6, 1.1);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());
  let seed = 82179;
  const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const range = (a,b) => a + random() * (b-a);
  const groups = new Map();
  const materials = [];
  const material = (color, roughness = .8, extra = {}) => {
    const mat = new THREE.MeshStandardMaterial({ color, roughness, ...extra });
    materials.push(mat); return mat;
  };
  const timberCanvas = document.createElement('canvas');
  timberCanvas.width = 128; timberCanvas.height = 512;
  const timberContext = timberCanvas.getContext('2d');
  timberContext.fillStyle = '#7b6149'; timberContext.fillRect(0,0,128,512);
  for(let i=0;i<850;i++) { timberContext.strokeStyle = `rgba(${random()>.5?'20,14,9':'194,158,112'},${range(.03,.21)})`; timberContext.beginPath(); const x=range(0,128);timberContext.moveTo(x,0);timberContext.bezierCurveTo(x+range(-7,7),140,x+range(-6,6),320,x,512);timberContext.stroke(); }
  const timberTexture = new THREE.CanvasTexture(timberCanvas);
  timberTexture.wrapS = timberTexture.wrapT = THREE.RepeatWrapping;
  timberTexture.colorSpace = THREE.SRGBColorSpace;
  const wood = material('#4c3628', .76, { map: timberTexture });
  const trim = material('#6c4b30', .67, { map: timberTexture });
  const roofMat = material('#17242a', .72, { metalness:.12, side:THREE.DoubleSide });
  const roofRib = material('#2c393a', .7);
  const stone = material('#3e4946', .96);
  const darkStone = material('#263a36', .9);
  const leafMat = material('#182d29', .94, {side:THREE.DoubleSide});
  const redLeaf = material('#672c27', .86, {side:THREE.DoubleSide});
  const lightMat = material('#d4984a', .6, {emissive:'#f7a64c',emissiveIntensity:2.2});
  const subtleLight = material('#a77e40', .7, {emissive:'#d08c3f',emissiveIntensity:.8});
  const earth = material('#152822', 1);
  const dummy = new THREE.Object3D();
  function put(geometry,mat,x,y,z,sx=1,sy=1,sz=1,rx=0,ry=0,rz=0) {
    dummy.position.set(x,y,z);dummy.rotation.set(rx,ry,rz);dummy.scale.set(sx,sy,sz);dummy.updateMatrix();
    const clone=geometry.clone(); if(clone.index) { const non=clone.toNonIndexed();clone.dispose();geometry=non; } else geometry=clone;
    geometry.applyMatrix4(dummy.matrix);
    // Keep merge attributes uniform, including bespoke roof and grass shapes.
    if(!geometry.getAttribute('uv'))geometry.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(geometry.getAttribute('position').count*2),2));
    if(!groups.has(mat))groups.set(mat,[]);groups.get(mat).push(geometry);
  }
  const cube = new THREE.BoxGeometry(1,1,1);
  const cone = new THREE.ConeGeometry(1,1,7);
  const sphere = new THREE.IcosahedronGeometry(1,1);
  const box=(x,y,z,w,h,d,mat=wood,ry=0)=>put(cube,mat,x,y,z,w,h,d,0,ry);
  function beam(a,b,r,mat=trim) {
    const va=new THREE.Vector3(...a), vb=new THREE.Vector3(...b), mid=va.clone().add(vb).multiplyScalar(.5);
    const g=new THREE.CylinderGeometry(r,r,va.distanceTo(vb),6);
    const q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),vb.sub(va).normalize());
    g.applyQuaternion(q);put(g,mat,mid.x,mid.y,mid.z);g.dispose();
  }
  function roof(x,y,z,w,d,h) {
    // Steep Malay bumbung panjang: a long ridge with a gentle lower pitch.
    for(const side of [-1,1]) {
      const rows=9;
      for(let r=0;r<rows;r++) {
        const t=r/rows, t1=(r+1)/rows;
        const yy=h*Math.pow(1-t,1.35), yy1=h*Math.pow(1-t1,1.35);
        const xa=w/2;
        const vertices=new Float32Array([-xa,yy,side*t*d/2,xa,yy,side*t*d/2,xa,yy1,side*t1*d/2,-xa,yy,side*t*d/2,xa,yy1,side*t1*d/2,-xa,yy1,side*t1*d/2]);
        const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(vertices,3));g.computeVertexNormals();
        put(g,roofMat,x,y,z);g.dispose();
        box(x,y+yy,z+side*t*d/2,w,.045,.055,roofRib);
      }
      for(let xx=-w/2;xx<=w/2+.01;xx+=.5){
        beam([x+xx,y+h,z],[x+xx,y+h*.39,z+side*d*.25],.026,roofRib);
        beam([x+xx,y+h*.39,z+side*d*.25],[x+xx,y,z+side*d*.5],.026,roofRib);
      }
      box(x,y,z+side*d/2,w+.25,.15,.18,trim);
      for(let xx=-w/2;xx<w/2;xx+=.32)put(cone,trim,x+xx,y-.24,z+side*d/2,.085,.4,.085,0,0,Math.PI);
    }
    box(x,y+h,z,w+.5,.19,.21,trim);
    for(const side of [-1,1]){
      const end=x+side*w/2;
      beam([end,y,z-d/2],[end,y+h,z],.095,trim);beam([end,y+h,z],[end,y,z+d/2],.095,trim);
      beam([end,y+h-.1,z],[end+side*.3,y+h+.8,z],.09,trim);
      put(cone,trim,end+side*.35,y+h+1,z,.14,.65,.14,0,0,-side*.25);
      for(let i=0;i<7;i++){const zz=(i-3)*d/9; const hh=h*(1-Math.abs(zz)/(d/2));box(end,y+hh/2,z+zz,.1,hh,.085,trim);}
    }
  }
  function screen(x,y,z,w,h) {
    box(x,y,z,w,h,.065,subtleLight);
    for(let xx=-w/2;xx<=w/2;xx+=.19)box(x+xx,y,z+.07,.038,h,.075,wood);
    for(let yy=-h/2;yy<=h/2;yy+=.28)box(x,y+yy,z+.095,w,.04,.09,trim);
    for(let xx=-w/2+.18;xx<w/2;xx+=.38)for(let yy=-h/2+.16;yy<h/2;yy+=.42)box(x+xx,y+yy,z+.1,.17,.17,.08,wood,0);
    box(x-w/2-.08,y,z,.14,h+.3,.2,trim);box(x+w/2+.08,y,z,.14,h+.3,.2,trim);
    box(x,y+h/2+.1,z,w+.3,.17,.2,trim);box(x,y-h/2-.1,z,w+.3,.17,.2,trim);
  }
  function lantern(x,y,z,s=1,lit=true) {
    box(x,y,z,.45*s,.8*s,.45*s,lightMat);
    for(const xx of [-1,1])for(const zz of [-1,1])box(x+xx*.26*s,y,z+zz*.26*s,.06*s,1*s,.06*s,wood);
    for(let i=-2;i<3;i++)box(x,y+i*.17*s,z+.27*s,.54*s,.035*s,.04*s,trim);
    box(x,y-.48*s,z,.7*s,.12*s,.7*s,wood);
    put(cone,wood,x,y+.6*s,z,.65*s,.38*s,.65*s,0,Math.PI/4);
    if(lit){const light=new THREE.PointLight('#ffad57',11*s,7*s,2);light.position.set(x,y,z);scene.add(light);}
  }
  function palace(x,z) {
    box(x,1.2,z,25,1.8,13,darkStone);
    box(x,2.3,z,26,.4,14,stone);
    for(let xx=-11;xx<=11;xx+=2.75)for(const zz of [-5.2,5.2]) {
      box(x+xx,4.9,z+zz,.35,5.2,.35,wood);box(x+xx,2.5,z+zz,.56,.25,.56,trim);
      beam([x+xx,6.4,z+zz],[x+xx+.8,7.3,z+zz],.09);
    }
    box(x,4.75,z,21,4.4,8,wood);
    for(let xx=-9;xx<=9;xx+=3) screen(x+xx,5.2,z+4.08,1.45,2.8);
    box(x,3.1,z+4.2,2.1,2.9,.2,wood);
    screen(x,5,z+4.25,1.8,3.6);
    roof(x,7.5,z,28,15,4.1);
    box(x,10.7,z,13,3.1,6.5,wood);
    for(let xx=-5;xx<=5;xx+=2.5)screen(x+xx,10.8,z+3.3,1.2,1.8);
    roof(x,12.2,z,18,10,3.3);
    box(x,14.7,z,7,1.8,3.6,wood);
    for(let xx=-2;xx<=2;xx+=2)screen(x+xx,14.7,z+1.85,.8,1.3);
    roof(x,15.8,z,11,6.5,2.8);
    // Broad central approach; each tread rises toward the same foundation.
    for(let i=0;i<15;i++)box(x,.08+i*.155,z+15-i*.49,6.4,.18+i*.31, .52,stone);
    for(const side of [-1,1]){
      beam([x+side*3.5,.8,z+15],[x+side*3.5,3.2,z+7.8],.11,stone);
      for(let i=0;i<8;i++){box(x+side*3.5,.35+i*.32,z+15-i*.95,.15,.7,.15,stone);}
      lantern(x+side*4,3,z+7.5,1.15);
    }
    for(let xx=-11;xx<=11;xx+=.48){if(Math.abs(xx)<3.5)continue;box(x+xx,3.25,z+6.6,.065,1.6,.09,trim);}
    for(const side of [-1,1])box(x+side*7.5,4.05,z+6.6,8.5,.13,.15,trim);
  }
  palace(3,-20);
  // Kelantan-inspired timber gateway with carved, pitched canopy.
  for(const x of [-4.7,4.7]){box(x,3,8,.65,6,.65,wood);box(x,.4,8,1.1,.8,1.1,stone);lantern(x,4.3,8.6,.8);}
  box(0,5.55,8,10,.85,.52,trim);roof(0,6.1,8,12,3.8,2.5);
  for(let x=-4.3;x<=4.3;x+=.28){put(cone,trim,x,4.9,8,.11,.65,.11,0,0,Math.PI);}
  for(let x=-4;x<=4;x+=.6){const arc=new THREE.TorusGeometry(.22,.035,4,10,Math.PI*1.7);put(arc,wood,x,5.6,8.31);arc.dispose();}
  // Timber wakaf, off the principal axis and sharing the garden's ground plane.
  const gx=-17,gz=-3;
  box(gx,.7,gz,7,1.1,7,darkStone);box(gx,1.4,gz,7.5,.3,7.5,wood);
  for(const xx of [-3,3])for(const zz of [-3,3])box(gx+xx,3.5,gz+zz,.25,4.6,.25,trim);
  roof(gx,5.8,gz,9,9,2.9);roof(gx,8.6,gz,4,4,1.7);
  for(let x=-3;x<=3;x+=.35)for(const zz of [-3,3])box(gx+x,2.1,gz+zz,.06,1.1,.07,trim);
  box(gx,2.7,gz-3,6,.1,.12,trim);box(gx,2.7,gz+3,6,.1,.12,trim);
  lantern(gx-2.5,4.8,gz+2.5,.85);lantern(gx+2.5,4.8,gz+2.5,.85);
  for(let i=0;i<5;i++)box(gx,.14+i*.25,gz+5.2-i*.45,3,.28+i*.5,.5,stone);
  // Undulating terrain and the wet court.
  const terrain=new THREE.PlaneGeometry(190,190,70,70);terrain.rotateX(-Math.PI/2);
  const tp=terrain.attributes.position;
  for(let i=0;i<tp.count;i++){const x=tp.getX(i),z=tp.getZ(i);const edge=Math.min(1,Math.max(0,(Math.abs(x)-24)/30));tp.setY(i,-.4+edge*(Math.sin(x*.12)*Math.cos(z*.12)*3+2));}
  terrain.computeVertexNormals();put(terrain,earth,0,0,0);terrain.dispose();
  for(let i=0;i<29;i++)for(let j=0;j<5;j++)box((j-2)*1.1+.1*Math.sin(i),.03,23-i*1.02,1.01,.09,.93,stone,range(-.025,.025));
  for(let i=0;i<10;i++)box(-5-i*1.12,.025,3-Math.sin(i*.25)*3,1,.11,.7,stone,range(-.4,.4));
  const pondGeo=new THREE.CircleGeometry(8.5,70);pondGeo.rotateX(-Math.PI/2);
  const pondMat=new THREE.MeshStandardMaterial({color:'#091d21',roughness:.16,metalness:.75,transparent:true,opacity:.95});
  const pond=new THREE.Mesh(pondGeo,pondMat);pond.position.set(-16,.09,10);pond.scale.set(1.25,1,.72);scene.add(pond);
  for(let i=0;i<45;i++){const a=i/45*Math.PI*2;put(sphere,darkStone,-16+Math.cos(a)*10.5,.18,10+Math.sin(a)*6.3,range(.35,.7),range(.2,.6),range(.4,.8),0,range(0,6));}
  // Pond rings catch only a little of the moonlight.
  const rings=[];
  for(let i=0;i<6;i++){const ring=new THREE.Mesh(new THREE.RingGeometry(.9,1,64),new THREE.MeshBasicMaterial({color:'#7d9483',transparent:true,opacity:.045,side:THREE.DoubleSide,depthWrite:false}));ring.rotation.x=-Math.PI/2;ring.position.set(-16,.11+i*.001,10);scene.add(ring);rings.push(ring);}
  for(let i=0;i<12;i++){const side=i%2?1:-1;const z=22-Math.floor(i/2)*6;box(side*4.2,.8,z,.13,1.6,.13,wood);lantern(side*4.2,1.9,z,.6,i<6);}
  for(let i=0;i<45;i++){const x=range(-55,55),z=range(-55,32);if(Math.abs(x)<18&&z<10)continue;put(sphere,stone,x,.2,z,range(.8,2),range(.4,1.2),range(.7,1.5),range(0,2),range(0,6));}
  // Broadleaf trees with forked trunks and many individually shaped leaves.
  const leafShape=new THREE.Shape();leafShape.moveTo(0,0);leafShape.quadraticCurveTo(.35,.4,0,1);leafShape.quadraticCurveTo(-.35,.4,0,0);
  const leafGeo=new THREE.ShapeGeometry(leafShape);
  function tree(x,z,height) {
    const y=-.1;beam([x,y,z],[x+.3,y+height*.6,z],.28,wood);
    for(let b=0;b<5;b++){
      const a=b/5*Math.PI*2+random(),reach=height*range(.25,.4);const bx=x+Math.cos(a)*reach,bz=z+Math.sin(a)*reach,by=height*range(.7,1);
      beam([x+.2,height*.4,z],[bx,by,bz],.11,wood);
      for(let l=0;l<(mobile?34:58);l++){put(leafGeo,random()>.94?redLeaf:leafMat,bx+range(-2.4,2.4),by+range(-1.3,1.3),bz+range(-2.2,2.2),range(.5,1.2),range(.6,1.6),1,range(-2,2),range(0,6),range(0,6));}
    }
  }
  for(let i=0;i<42;i++){const x=range(-64,64),z=range(-65,26);if(Math.abs(x)<21&&z>-38)continue;tree(x,z,range(8,17));}
  tree(-26,4,13);tree(21,7,14);tree(19,-33,17);
  // A few palms for the tropical silhouette.
  for(const [x,z,h] of [[-31,-15,17],[28,-18,20],[23,-43,21],[-38,-37,18]]){
    beam([x,0,z],[x+1,h,z],.2,wood);
    for(let f=0;f<9;f++){const a=f/9*Math.PI*2;const end=[x+1+Math.cos(a)*5,h-.7,z+Math.sin(a)*5];beam([x+1,h,z],end,.045,leafMat);
      for(let j=0;j<12;j++){const t=j/12;for(const side of [-1,1])put(leafGeo,leafMat,x+1+Math.cos(a)*5*t+Math.sin(a)*side*.5,h+Math.sin(t*Math.PI)-t,z+Math.sin(a)*5*t-Math.cos(a)*side*.5,.5,2*(1-t)+.3,1,Math.PI/2+.3,a,side*.6);}
    }
  }
  // Fine foreground grasses, merged by material rather than thousands of draws.
  const grass=new THREE.BufferGeometry();grass.setAttribute('position',new THREE.Float32BufferAttribute([-.035,0,0,.035,0,0,.17,1,0],3));grass.computeVertexNormals();
  for(let i=0;i<(mobile?1600:3300);i++){const x=range(-35,35),z=range(-33,33);if(Math.abs(x)<3.5||((x+16)**2/115+(z-10)**2/42<1.2))continue;put(grass,leafMat,x,.05,z,1,range(.22,.9),1,0,range(0,6));}
  // Moon surface from deterministic craters, no external texture request.
  const moonCanvas=document.createElement('canvas');moonCanvas.width=moonCanvas.height=512;const mc=moonCanvas.getContext('2d');mc.fillStyle='#b85547';mc.fillRect(0,0,512,512);
  for(let i=0;i<2800;i++){const radius=range(1,30);mc.beginPath();mc.arc(range(0,512),range(0,512),radius,0,Math.PI*2);mc.fillStyle=`rgba(${random()>.7?'215,124,87':'56,35,36'},${range(.02,.13)})`;mc.fill();}
  const moonTexture=new THREE.CanvasTexture(moonCanvas);moonTexture.colorSpace=THREE.SRGBColorSpace;
  const moon=new THREE.Mesh(new THREE.SphereGeometry(13,48,32),new THREE.MeshBasicMaterial({map:moonTexture,color:'#ca7566',fog:false}));moon.position.set(13,29,-74);scene.add(moon);
  // Mist sheets fade toward their edges; they sit inside the world and gain parallax.
  const mistCanvas=document.createElement('canvas');mistCanvas.width=128;mistCanvas.height=64;const ctx=mistCanvas.getContext('2d');const gradient=ctx.createRadialGradient(64,32,0,64,32,64);gradient.addColorStop(0,'rgba(150,180,190,.4)');gradient.addColorStop(1,'rgba(150,180,190,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,128,64);
  const mistTexture=new THREE.CanvasTexture(mistCanvas);const mists=[];
  for(let i=0;i<9;i++){const mist=new THREE.Sprite(new THREE.SpriteMaterial({map:mistTexture,transparent:true,opacity:.14,depthWrite:false,color:'#79959e'}));mist.position.set(range(-25,25),range(.6,3),range(-37,17));mist.scale.set(range(25,48),range(3,7),1);scene.add(mist);mists.push({object:mist,x:mist.position.x,phase:random()*6});}
  const rainCount=mobile?420:900;const rainPositions=new Float32Array(rainCount*6);const rainSeeds=[];
  for(let i=0;i<rainCount;i++)rainSeeds.push([range(-40,40),range(0,33),range(-35,35),range(.5,1)]);
  const rainGeometry=new THREE.BufferGeometry();rainGeometry.setAttribute('position',new THREE.BufferAttribute(rainPositions,3));
  const rain=new THREE.LineSegments(rainGeometry,new THREE.LineBasicMaterial({color:'#94b3ba',transparent:true,opacity:.15,depthWrite:false}));scene.add(rain);
  const drifting=[];
  for(let i=0;i<(mobile?15:30);i++){const leaf=new THREE.Mesh(leafGeo,redLeaf);leaf.scale.setScalar(range(.14,.32));scene.add(leaf);drifting.push({object:leaf,x:range(-18,18),y:range(0,18),z:range(-15,20),speed:range(.18,.6),phase:range(0,6)});}
  // Resolve static geometry into a dozen material batches.
  for(const [mat,geos] of groups){const merged=mergeGeometries(geos);const mesh=new THREE.Mesh(merged,mat);scene.add(mesh);for(const g of geos)g.dispose();}
  scene.add(new THREE.HemisphereLight('#8cabb8','#1d211b',2.1));
  const moonLight=new THREE.DirectionalLight('#9cbbd4',2.8);moonLight.position.set(12,32,-35);scene.add(moonLight);
  const frontLight=new THREE.DirectionalLight('#a6c1c2',.75);frontLight.position.set(15,20,30);scene.add(frontLight);
  const palaceLight=new THREE.PointLight('#f6ae65',65,32,2);palaceLight.position.set(3,7,-12);scene.add(palaceLight);
  const positions=[[23,12.5,43],[11,7.5,25],[-26,7,18],[10,8.3,-1],[22,11,24],[25,14,36]].map(p=>new THREE.Vector3(...p));
  const targets=[[-6,6,-15],[-3,6,-16],[-12,4,-7],[0,8,-20],[-3,7,-22],[-2,7,-18]].map(p=>new THREE.Vector3(...p));
  const path=new THREE.CatmullRomCurve3(positions,false,'catmullrom',.3);
  const aim=new THREE.CatmullRomCurve3(targets,false,'catmullrom',.3);
  const position=new THREE.Vector3(),target=new THREE.Vector3();
  function render(progress,time,pointer={x:0,y:0},tour=0) {
    const t=Math.min(.9999,Math.max(0,progress/5));path.getPoint(t,position);aim.getPoint(t,target);
    if(mobile){position.z+=7;target.x+=2;}
    position.x+=pointer.x*.5+Math.sin(tour)*1.7;position.y+=pointer.y*.25;
    camera.position.copy(position);camera.lookAt(target);
    for(let i=0;i<rainCount;i++){const [x,y,z,speed]=rainSeeds[i];const yy=((y-time*speed*8)%33+33)%33;const off=i*6;rainPositions[off]=x;rainPositions[off+1]=yy;rainPositions[off+2]=z;rainPositions[off+3]=x-.07;rainPositions[off+4]=yy-.65;rainPositions[off+5]=z;}
    rainGeometry.attributes.position.needsUpdate=true;
    for(const item of drifting){const o=item.object;o.position.set(item.x+Math.sin(time*.2+item.phase)*2,((item.y-time*item.speed)%18+18)%18,item.z);o.rotation.set(time*.25+item.phase,time*.35,time*.1);}
    for(const item of mists)item.object.position.x=item.x+Math.sin(time*.045+item.phase)*3;
    rings.forEach((ring,i)=>{const phase=(time*.06+i/6)%1;ring.scale.setScalar(phase*6+.1);ring.material.opacity=(1-phase)*.055;});
    composer.render();
    return {calls:renderer.info.render.calls,triangles:renderer.info.render.triangles};
  }
  function resize(){camera.aspect=innerWidth/innerHeight;camera.fov=innerWidth<761?61:46;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);composer.setSize(innerWidth,innerHeight);}
  function dispose(){scene.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){for(const mat of Array.isArray(o.material)?o.material:[o.material])mat.dispose();}});timberTexture.dispose();moonTexture.dispose();mistTexture.dispose();composer.dispose();renderer.dispose();}
  return {render,resize,dispose};
}
