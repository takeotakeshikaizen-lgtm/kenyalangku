import * as THREE from 'three';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';

const TAU=Math.PI*2;
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const ease=(a,b,t)=>{const v=clamp((t-a)/(b-a));return v*v*(3-2*v);};
const lerp=THREE.MathUtils.lerp;
const v3=(a)=>new THREE.Vector3(...a);
const loopPoint=(t)=>new THREE.Vector3(Math.sin(t)*4.75,Math.sin(t*2)*1.65,Math.cos(t)*.14);
const loopAngle=(t)=>Math.atan2(3.3*Math.cos(t*2),4.75*Math.cos(t));

export async function createKenyalang(canvas,frontCanvas){
  const response=await fetch(new URL('./assets/kenyalang-contours.json',import.meta.url));
  if(!response.ok)throw new Error(`Logo geometry: ${response.status}`);
  const trace=await response.json();
  let mobile=innerWidth<761;
  const scene=new THREE.Scene();
  scene.background=new THREE.Color('#080c10');scene.fog=new THREE.FogExp2('#101d24',.025);
  const camera=new THREE.PerspectiveCamera(39,innerWidth/innerHeight,.1,150);
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?1.25:1.65));renderer.setSize(innerWidth,innerHeight);
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;
  const composer=new EffectComposer(renderer);composer.addPass(new RenderPass(scene,camera));
  composer.renderTarget1.samples=mobile?2:4;composer.renderTarget2.samples=mobile?2:4;
  const bloom=new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),.15,.45,1.8);bloom.enabled=!mobile;composer.addPass(bloom);
  composer.addPass(new OutputPass());
  // A transparent second pass lets selected near-camera pieces cross HTML.
  // Both passes share the same geometry and camera; controls remain above them.
  const frontScene=new THREE.Scene();
  const frontRenderer=new THREE.WebGLRenderer({canvas:frontCanvas,alpha:true,antialias:true,powerPreference:'low-power'});
  frontRenderer.setPixelRatio(Math.min(devicePixelRatio,mobile?1:1.4));frontRenderer.setSize(innerWidth,innerHeight);
  frontRenderer.setClearColor(0,0);frontRenderer.toneMapping=renderer.toneMapping;frontRenderer.toneMappingExposure=renderer.toneMappingExposure;
  const allMaterials=[],allGeometries=[],textures=[];
  const mat=(options)=>{const m=new THREE.MeshStandardMaterial(options);allMaterials.push(m);return m;};
  const black=mat({color:'#33383b',metalness:.38,roughness:.36});
  const edge=mat({color:'#090e12',metalness:.7,roughness:.25});
  const orange=mat({color:'#ffab00',metalness:.24,roughness:.3,emissive:'#c16905',emissiveIntensity:.055});
  const orangeEdge=mat({color:'#995313',metalness:.7,roughness:.24});
  const ivory=mat({color:'#f7f4dc',metalness:.15,roughness:.35,emissive:'#8a846c',emissiveIntensity:.1});
  const pupil=mat({color:'#0b1013',roughness:.35,metalness:.25});
  const crest=new THREE.Group();scene.add(crest);
  const frontCopies=[];
  function foregroundCopy(mesh){const copy=new THREE.Mesh(mesh.geometry,mesh.material);copy.matrixAutoUpdate=false;copy.visible=false;frontScene.add(copy);frontCopies.push({mesh,copy});}
  function shapeOf(component,origin,scale=1/55){
    const shape=new THREE.Shape();
    function draw(path,points){
      const p=points.map(([x,y])=>new THREE.Vector2((x-origin[0])*scale,(origin[1]-y)*scale));
      const first=p[0].clone().add(p.at(-1)).multiplyScalar(.5);path.moveTo(first.x,first.y);
      for(let i=0;i<p.length;i++){
        const current=p[i],next=p[(i+1)%p.length],previous=p[(i+p.length-1)%p.length];
        const end=current.clone().add(next).multiplyScalar(.5);
        const incoming=current.clone().sub(previous).normalize(),outgoing=next.clone().sub(current).normalize();
        if(incoming.dot(outgoing)<.55){path.lineTo(current.x,current.y);path.lineTo(end.x,end.y);}
        else path.quadraticCurveTo(current.x,current.y,end.x,end.y);
      }
      path.closePath();
    }
    draw(shape,component.outline);
    for(const hole of component.holes){const path=new THREE.Path();draw(path,hole);shape.holes.push(path);}
    return shape;
  }
  function extrusion(shape,depth=.38,bevel=.035){const g=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelSize:bevel,bevelThickness:bevel*.75,bevelSegments:2,steps:1,curveSegments:8});g.translate(0,0,-depth/2);allGeometries.push(g);return g;}
  const headOrigin=trace.components[0].center;
  const restHead=new THREE.Vector3((headOrigin[0]-315)/55,(303-headOrigin[1])/55,0);
  const head=new THREE.Group();crest.add(head);
  const headParts=[];
  for(const index of [0,11,12,2]){
    const c=trace.components[index],isOrange=c.type==='orange';
    const mesh=new THREE.Mesh(extrusion(shapeOf(c,headOrigin),isOrange?.47:index===2?.49:.4),isOrange?[orange,orangeEdge]:index===2?pupil:[black,edge]);
    head.add(mesh);foregroundCopy(mesh);headParts.push({mesh,index});
  }
  // The white ring and black pupil are traced from the supplied eye, on both faces.
  const eyeShape=shapeOf({outline:trace.components[0].holes[0],holes:[]},headOrigin);
  const eye=new THREE.Mesh(extrusion(eyeShape,.46,.01),ivory);head.add(eye);foregroundCopy(eye);
  const body=[];
  const indices=[6,10,8,3,1,4,7,9,5];
  const allowedRanges={6:[1.5,2.5],10:[2.0,2.9],8:[2.7,3.25],3:[3.15,3.65],1:[3.5,4.1],4:[4.0,4.7],7:[4.65,5.4],9:[5.3,6.0],5:[6.0,6.6]};
  for(const index of indices){
    const c=trace.components[index];const rest=new THREE.Vector3((c.center[0]-315)/55,(303-c.center[1])/55,0);
    const mesh=new THREE.Mesh(extrusion(shapeOf(c,c.center)),[black,edge]);crest.add(mesh);foregroundCopy(mesh);
    const [lo,hi]=allowedRanges[index];let best=Infinity,t=lo;
    for(let a=lo;a<=hi;a+=.01){const d=loopPoint(a).distanceToSquared(rest);if(d<best){best=d;t=a;}}
    body.push({mesh,rest,t,u:clamp((t-.87)/TAU,.05,.98),index});
  }
  // The traveling ribbon uses a normalized original aperture blade, never scales,
  // claws, wings or a substitute animal. Extra blades appear only as it unfolds.
  const bladeSource=trace.components[5];
  const bladeGeometry=extrusion(shapeOf(bladeSource,bladeSource.center,1/160),.24,.035);
  bladeGeometry.rotateZ(-.52);
  const ribbon=[];const bladeCount=34;
  for(let i=0;i<bladeCount;i++){
    const blade=new THREE.Mesh(bladeGeometry,[black,edge]);crest.add(blade);foregroundCopy(blade);ribbon.push(blade);
  }
  function addLights(target){
    target.add(new THREE.HemisphereLight('#c5dbec','#3c3025',1.9));
    const key=new THREE.DirectionalLight('#d3e1df',3.9);key.position.set(-5,8,9);target.add(key);
    const rim=new THREE.DirectionalLight('#789bb5',4.2);rim.position.set(6,2,-7);target.add(rim);
    const warm=new THREE.PointLight('#ffc36b',85,26,2);warm.position.set(6,4,6);target.add(warm);
    return {key,rim,warm};
  }
  const lights=addLights(scene),frontLights=addLights(frontScene);
  let seed=731;const random=()=>{seed=seed*16807%2147483647;return(seed-1)/2147483646;};
  // Supporting world: Borneo-like ridgelines, dark reflective water, faint batik
  // line work and floating seeds. No central architecture competes with the bird.
  const atmosphere=new THREE.Group();scene.add(atmosphere);
  const mountainMat=mat({color:'#16242a',roughness:1,transparent:true,opacity:.75});
  const ridges=[];
  for(let layer=0;layer<4;layer++){
    const points=[];for(let i=0;i<32;i++){const x=-45+i*3;const peak=Math.pow(Math.sin(i*.47+layer)*.5+.5,3)*(4+layer*1.2);points.push(new THREE.Vector2(x,-5+peak));}
    const shape=new THREE.Shape();shape.moveTo(-45,-15);for(const p of points)shape.lineTo(p.x,p.y);shape.lineTo(48,-15);shape.closePath();
    const geo=new THREE.ShapeGeometry(shape);allGeometries.push(geo);const material=mountainMat.clone();allMaterials.push(material);material.color.set(['#0e1a20','#17252b','#203039','#263944'][layer]);
    const mountain=new THREE.Mesh(geo,material);mountain.position.set(0,-1-layer*.3,-22-layer*7);atmosphere.add(mountain);ridges.push(mountain);
  }
  const waterMaterial=mat({color:'#101c20',metalness:.82,roughness:.24,transparent:true,opacity:.45});
  const waterGeometry=new THREE.PlaneGeometry(110,110);allGeometries.push(waterGeometry);const water=new THREE.Mesh(waterGeometry,waterMaterial);water.rotation.x=-Math.PI/2;water.position.set(0,-5,-20);atmosphere.add(water);
  const mistCanvas=document.createElement('canvas');mistCanvas.width=256;mistCanvas.height=128;const context=mistCanvas.getContext('2d');const g=context.createRadialGradient(128,64,2,128,64,128);g.addColorStop(0,'rgba(131,165,184,.38)');g.addColorStop(1,'rgba(131,165,184,0)');context.fillStyle=g;context.fillRect(0,0,256,128);
  const mistTexture=new THREE.CanvasTexture(mistCanvas);textures.push(mistTexture);const mists=[];
  for(let i=0;i<5;i++){const material=new THREE.SpriteMaterial({map:mistTexture,color:'#789bab',transparent:true,opacity:.2,depthWrite:false});allMaterials.push(material);const sprite=new THREE.Sprite(material);sprite.position.set((random()-.5)*22,-4+random()*3,-10-i*6);sprite.scale.set(25,5,1);atmosphere.add(sprite);mists.push({sprite,x:sprite.position.x,phase:random()*6});}
  const particleCount=300;const particles=new Float32Array(particleCount*3),particleOrigins=[];
  for(let i=0;i<particleCount;i++){const p=[(random()-.5)*48,(random()-.5)*25,(random()-.5)*34];particleOrigins.push(p);particles.set(p,i*3);}
  const particleGeometry=new THREE.BufferGeometry();particleGeometry.setAttribute('position',new THREE.BufferAttribute(particles,3));particleGeometry.setDrawRange(0,mobile?100:300);allGeometries.push(particleGeometry);
  const particleMaterial=new THREE.PointsMaterial({color:'#b9c2b0',size:.025,transparent:true,opacity:.4,depthWrite:false});allMaterials.push(particleMaterial);scene.add(new THREE.Points(particleGeometry,particleMaterial));
  const rainCount=280;const rainData=new Float32Array(rainCount*6);const rainOrigins=Array.from({length:rainCount},()=>[(random()-.5)*45,random()*22,(random()-.5)*24]);const rainGeometry=new THREE.BufferGeometry();rainGeometry.setAttribute('position',new THREE.BufferAttribute(rainData,3));rainGeometry.setDrawRange(0,(mobile?100:280)*2);allGeometries.push(rainGeometry);const rainMaterial=new THREE.LineBasicMaterial({color:'#7793a4',transparent:true,opacity:0,depthWrite:false});allMaterials.push(rainMaterial);scene.add(new THREE.LineSegments(rainGeometry,rainMaterial));
  const motifGeometry=new THREE.BufferGeometry();const motif=[];
  for(let i=0;i<12;i++){const x=i*1.7-10,y=-4.6;for(const size of [.3,.55]){const p=[[x,y+size,-8],[x+size,y,-8],[x,y-size,-8],[x-size,y,-8],[x,y+size,-8]];for(let k=0;k<4;k++)motif.push(...p[k],...p[k+1]);}}
  motifGeometry.setAttribute('position',new THREE.Float32BufferAttribute(motif,3));allGeometries.push(motifGeometry);const motifMaterial=new THREE.LineBasicMaterial({color:'#997643',transparent:true,opacity:0});allMaterials.push(motifMaterial);atmosphere.add(new THREE.LineSegments(motifGeometry,motifMaterial));
  // Head-first spline control points, composed around readable HTML regions.
  const shots=[
    [[4,1,0],[2,0,0],[0,-1,0],[-2,0,0],[-4,1,0],[-5,-1,0]],
    [[4.9,.4,1],[2.5,-1.7,.2],[-.2,-2.9,-.4],[-3,-2,-1],[-6,-.5,-2],[-8,-1.8,-3]],
    [[-3.8,.3,-5],[-6,-1,-7],[-4,-3,-9],[-.5,-2,-10],[2.5,-.7,-11],[5,-2,-13]],
    [[5.4,1.1,4.5],[2.9,-.6,2.6],[.4,-3.4,1],[-4,-3.4,-1],[-6.8,.2,-2],[-3.5,2.6,-4]],
    [[5.1,.1,.9],[3,-1.7,0],[-.5,-2.9,-1],[-4,-1.7,-1.8],[-5.8,1,-2.6],[-2.5,2.9,-3.8]],
    [[-3.9,-1,-2],[-6,-2,-3],[-7,.8,-5],[-3,2.7,-7],[1,1.5,-9],[4,-1,-11]],
    [[5.3,.8,1],[2.9,-1.5,0],[-.7,-2.6,-1],[-4,-1.4,-3],[-5.2,1.7,-5],[-2.6,3,-6]],
    [[4,1,0],[2,0,0],[0,-1,0],[-2,0,0],[-4,1,0],[-5,-1,0]]
  ];
  const spline=new THREE.CatmullRomCurve3(shots[1].map(v3),false,'catmullrom',.45);
  const point=new THREE.Vector3(),tangent=new THREE.Vector3(),normal=new THREE.Vector3(),binormal=new THREE.Vector3();
  const basis=new THREE.Matrix4(),quaternion=new THREE.Quaternion(),projected=new THREE.Vector3();
  function curvePose(u,time,progress,scale=1){
    spline.getPoint(clamp(u,0,.999),point);spline.getTangent(clamp(u,0,.999),tangent).normalize().negate();
    point.y+=Math.sin(time*.45-u*5+progress*.4)*.075*scale;
    normal.set(-tangent.y,tangent.x,0).normalize();binormal.crossVectors(tangent,normal).normalize();normal.crossVectors(binormal,tangent).normalize();basis.makeBasis(tangent,normal,binormal);quaternion.setFromRotationMatrix(basis);
  }
  let previousProgress=0,closeTime=0,openTime=3.7;
  function render(progress,time,pointer={x:0,y:0},options={}){
    const staticMode=options.reducedMotion;
    const p=clamp(progress,0,7.85);
    if(previousProgress<6.75&&p>=6.75)closeTime=time;
    if(previousProgress>.12&&p<=.12)openTime=time;
    previousProgress=p;
    const unfolding=ease(.12,.94,p),closing=ease(6.7,7.16,p),travel=unfolding*(1-closing);
    const showIntro=p<.1;const assembly=staticMode||!showIntro?1:ease(.15,3.45,time);
    const idleTime=p>6.7?Math.max(0,time-closeTime):Math.max(0,time-openTime);
    const circulation=staticMode?0:idleTime*.032;
    const wholeScale=mobile?.64:1.08;
    crest.scale.setScalar(wholeScale);
    crest.position.y=mobile?lerp(.4,-1.9,travel):.28;
    crest.rotation.y=staticMode?0:Math.sin(time*.14)*.14*(1-travel);
    crest.rotation.x=staticMode?0:Math.sin(time*.11)*.065*(1-travel);
    // Quiet holds around each composition, continuous eased transitions between.
    const chapter=Math.min(6,Math.floor(p)),local=p-chapter;
    const blend=ease(.18,.95,local);
    for(let i=0;i<spline.points.length;i++){
      const a=shots[chapter][i],b=shots[chapter+1][i];const px=lerp(a[0],b[0],blend),py=lerp(a[1],b[1],blend),pz=lerp(a[2],b[2],blend);
      spline.points[i].set(px*(mobile?.5:1),py,pz);
    }
    // Original pieces are exact at assembly. They orbit their own infinity path
    // during idle, then converge into the same traveling ribbon as extra blades.
    body.forEach((part,i)=>{
      const base=loopPoint(part.t),moving=loopPoint(part.t+circulation);
      const rest=part.rest.clone().add(moving.sub(base));
      curvePose(part.u,time,p);
      const target=point.clone();
      part.mesh.position.copy(rest).lerp(target,travel);
      const restQuaternion=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1),loopAngle(part.t+circulation)-loopAngle(part.t));
      part.mesh.quaternion.copy(restQuaternion).slerp(quaternion,travel);
      const reveal=staticMode||p>.12?1:ease(i*.13,.65+i*.13,time);
      const scale=lerp(1,.035,travel)*Math.max(.001,reveal);
      part.mesh.scale.setScalar(scale);part.mesh.position.z+=(1-reveal)*1.4;
    });
    ribbon.forEach((blade,i)=>{
      const activeBladeCount=mobile?20:34;
      if(i>=activeBladeCount){blade.visible=false;return;}
      const u=.06+i/(activeBladeCount-1)*.91;
      curvePose(u,time,p);blade.position.copy(point);blade.quaternion.copy(quaternion);
      // A tiny alternating bank exposes bevels and the spaces between blades.
      blade.rotateX(Math.sin(time*.3-i*.3)*.035);
      const taper=lerp(1,.23,Math.pow(u,2.8));const reveal=ease(.14,.65,travel);
      blade.scale.set(.85*reveal*taper,1.7*reveal*taper,1*reveal*taper);blade.visible=reveal>.001;
    });
    curvePose(0,time,p);
    head.position.copy(restHead).lerp(point,travel);
    head.scale.setScalar(lerp(1,mobile?.7:.74,travel));
    head.rotation.set(0,Math.PI*travel,lerp(0,clamp(Math.atan2(tangent.y,tangent.x),-.25,.25),travel));
    head.rotation.y+=travel*(Math.sin(p*1.1)*.14+Math.sin(time*.2)*.025);
    // Orange follows the body; the simple white eye is the last reveal.
    for(const part of headParts){const delay=part.index===0?.85:part.index===2?2.65:1.95;const reveal=staticMode||p>.1?1:ease(delay,delay+.75,time);part.mesh.scale.setScalar(Math.max(.001,reveal));}
    eye.scale.setScalar(staticMode||p>.1?1:Math.max(.001,ease(2.65,3.35,time)));
    const approach=(1-travel)*(1-ease(1,8,time))*.9;
    const cameraZ=(mobile?23:20)+approach+ease(2.6,3.1,p)*(1-ease(3.2,3.7,p))*1.1;
    camera.position.set(Math.sin(p*.7)*.35+pointer.x*.3,.4+Math.sin(p*.55)*.22+pointer.y*.16,cameraZ);
    camera.lookAt(Math.sin(p*.5)*.25,0,-.6*travel);
    lights.warm.position.x=5+Math.sin(time*.23)*2;frontLights.warm.position.copy(lights.warm.position);
    const atmosphereStrength=ease(.45,1.8,p)*(1-ease(6.5,7.3,p));
    ridges.forEach((ridge,i)=>{ridge.material.opacity=atmosphereStrength*(.38+i*.08);ridge.position.x=Math.sin(p*.5+i)*1.1;});
    waterMaterial.opacity=atmosphereStrength*.45;motifMaterial.opacity=atmosphereStrength*(.06+Math.pow(Math.sin(p*.8),2)*.12);
    for(const mist of mists){mist.sprite.material.opacity=(.05+atmosphereStrength*.16);mist.sprite.position.x=mist.x+Math.sin(time*.035+mist.phase)*1.5;}
    rainMaterial.opacity=staticMode?0:Math.max(0,1-Math.abs(p-2.2)/1.3)*.1;
    for(let i=0;i<rainCount;i++){const [x,y,z]=rainOrigins[i];const yy=((y-time*3)%22+22)%22-10;rainData.set([x,yy,z,x-.06,yy-.45,z],i*6);}rainGeometry.attributes.position.needsUpdate=true;
    for(let i=0;i<particleCount;i++){const [x,y,z]=particleOrigins[i];particles[i*3]=x+Math.sin(time*.06+i)*.25;particles[i*3+1]=y+Math.sin(time*.07+i*.3)*.4;particles[i*3+2]=z;}particleGeometry.attributes.position.needsUpdate=true;
    particleMaterial.opacity=.15+assembly*.15;
    scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);
    let frontVisible=0;
    for(const {mesh,copy} of frontCopies){
      projected.setFromMatrixPosition(mesh.matrixWorld).project(camera);
      const forward=travel>.8&&p>2.7&&p<4.6;
      copy.visible=forward&&mesh.visible&&(projected.x>.3||projected.y<-.37)&&mesh.scale.x>.01;
      if(copy.visible){copy.matrix.copy(mesh.matrixWorld);frontVisible++;}
    }
    composer.render();frontRenderer.render(frontScene,camera);
    return {travel,assembly,frontVisible,segments:body.length+ribbon.filter(b=>b.visible).length,phase:p>6.8?'return':p<.8?'opening':'journey'};
  }
  function resize(){
    mobile=innerWidth<761;camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?1.25:1.65));frontRenderer.setPixelRatio(Math.min(devicePixelRatio,mobile?1:1.4));
    composer.setPixelRatio(renderer.getPixelRatio());composer.renderTarget1.samples=mobile?2:4;composer.renderTarget2.samples=mobile?2:4;bloom.enabled=!mobile;
    particleGeometry.setDrawRange(0,mobile?100:300);rainGeometry.setDrawRange(0,(mobile?100:280)*2);
    renderer.setSize(innerWidth,innerHeight);composer.setSize(innerWidth,innerHeight);frontRenderer.setSize(innerWidth,innerHeight);
  }
  function dispose(){for(const g of allGeometries)g.dispose();for(const m of allMaterials)m.dispose();for(const t of textures)t.dispose();composer.dispose();renderer.dispose();frontRenderer.dispose();}
  return {render,resize,dispose};
}
