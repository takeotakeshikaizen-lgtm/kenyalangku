import * as THREE from 'three';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';

const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const ease=(a,b,t)=>{const v=clamp((t-a)/(b-a));return v*v*(3-2*v);};
const lerp=THREE.MathUtils.lerp;
const v3=(a)=>new THREE.Vector3(...a);
const loopPoint=(t)=>new THREE.Vector3(Math.sin(t)*4.75,Math.sin(t*2)*1.65,Math.cos(t)*.14);
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
  // The logo moves as one connected piece; it never breaks apart.
  const logo=new THREE.Group();crest.add(logo);
  const head=new THREE.Group();logo.add(head);
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
    const mesh=new THREE.Mesh(extrusion(shapeOf(c,c.center)),[black,edge]);mesh.position.copy(rest);logo.add(mesh);foregroundCopy(mesh);
    const [lo,hi]=allowedRanges[index];let best=Infinity,t=lo;
    for(let a=lo;a<=hi;a+=.01){const d=loopPoint(a).distanceToSquared(rest);if(d<best){best=d;t=a;}}
    body.push({mesh,rest,t,index});
  }
  // The logo loops like a stroke chasing itself round an infinity sign: the
  // artwork is treated as one ribbon laid along a figure-eight track (two
  // rings joined by crossing diagonals). Every vertex keeps its place across
  // the ribbon while the whole ribbon slides along the track, so the head runs
  // counter-clockwise round its ring, clockwise round the other, and dips
  // behind the tail band each time it reaches the centre crossing.
  const ringCentre=2.6,ringRadius=1.85,diagonal=Math.sqrt(ringCentre**2-ringRadius**2),slope=Math.asin(ringRadius/ringCentre);
  const ringStart=Math.PI-Math.atan(diagonal/ringRadius),ringSweep=2*ringStart,ringArc=ringRadius*ringSweep;
  const trackLength=4*diagonal+2*ringArc,cs=Math.cos(slope),sn=Math.sin(slope);
  function track(s,out){
    s=((s%trackLength)+trackLength)%trackLength;
    if(s<diagonal){out.x=s*cs;out.y=s*sn;out.tx=cs;out.ty=sn;}
    else if((s-=diagonal)<ringArc){const a=ringStart-s/ringRadius;out.x=ringCentre+ringRadius*Math.cos(a);out.y=ringRadius*Math.sin(a);out.tx=Math.sin(a);out.ty=-Math.cos(a);}
    else if((s-=ringArc)<2*diagonal){const d=s-diagonal;out.x=-d*cs;out.y=d*sn;out.tx=-cs;out.ty=sn;}
    else if((s-=2*diagonal)<ringArc){const a=Math.PI-ringStart+s/ringRadius;out.x=-ringCentre+ringRadius*Math.cos(a);out.y=ringRadius*Math.sin(a);out.tx=-Math.sin(a);out.ty=Math.cos(a);}
    else{const d=s-ringArc-diagonal;out.x=d*cs;out.y=d*sn;out.tx=cs;out.ty=sn;}
    return out;
  }
  const sampleStep=.02,samples=[];
  for(let s=0;s<trackLength;s+=sampleStep)samples.push({s,...track(s,{})});
  const nearestOnTrack=(x,y,from,to)=>{
    let best=Infinity,hit=samples[0];
    for(let s=from;s<=to;s+=sampleStep){const k=((Math.round(s/sampleStep)%samples.length)+samples.length)%samples.length,q=samples[k],d=(q.x-x)**2+(q.y-y)**2;if(d<best){best=d;hit=q;}}
    return hit;
  };
  // Each mesh's vertices are recorded as (along, across) coordinates on the track.
  const ribbon=[];
  function layOnTrack(mesh,origin,centreS){
    mesh.frustumCulled=false;
    const position=mesh.geometry.attributes.position,normal=mesh.geometry.attributes.normal,count=position.count;
    const along=new Float32Array(count),tangent=new Float32Array(count),across=new Float32Array(count),depth=new Float32Array(count),angle=new Float32Array(count);
    const restNormal=new Float32Array(normal.array);
    for(let i=0;i<count;i++){
      const x=position.getX(i)+origin.x,y=position.getY(i)+origin.y,q=nearestOnTrack(x,y,centreS-4.5,centreS+4.5);
      along[i]=q.s;tangent[i]=(x-q.x)*q.tx+(y-q.y)*q.ty;across[i]=(x-q.x)*-q.ty+(y-q.y)*q.tx;depth[i]=position.getZ(i);angle[i]=Math.atan2(q.ty,q.tx);
    }
    ribbon.push({mesh,origin,along,tangent,across,depth,angle,restNormal});
  }
  const trackOf=(x,y)=>nearestOnTrack(x,y,0,trackLength).s;
  for(const part of body)layOnTrack(part.mesh,part.rest,part.index===5?0:trackOf(part.rest.x,part.rest.y));
  const headS=trackOf(restHead.x,restHead.y);
  for(const part of headParts)layOnTrack(part.mesh,restHead,headS);
  layOnTrack(eye,restHead,headS);
  const point=track(0,{});let lastShift=null;
  function slideRibbon(shift,lift){
    if(shift===lastShift)return;lastShift=shift;
    for(const r of ribbon){
      const position=r.mesh.geometry.attributes.position,normal=r.mesh.geometry.attributes.normal;
      for(let i=0;i<position.count;i++){
        const s=r.along[i]+shift;track(s,point);
        position.setXYZ(i,point.x+r.tangent[i]*point.tx-r.across[i]*point.ty-r.origin.x,point.y+r.tangent[i]*point.ty+r.across[i]*point.tx-r.origin.y,r.depth[i]-lift*Math.cos(Math.PI*2*s/trackLength));
        const turn=Math.atan2(point.ty,point.tx)-r.angle[i],c=Math.cos(turn),n=Math.sin(turn),nx=r.restNormal[i*3],ny=r.restNormal[i*3+1];
        normal.setXYZ(i,nx*c-ny*n,nx*n+ny*c,r.restNormal[i*3+2]);
      }
      position.needsUpdate=true;normal.needsUpdate=true;
    }
  }
  // Once the journey starts, the logo pieces gather into a low-poly great hornbill
  // from the mascot sheet: black body, yellow neck, curved bill with casque,
  // banded wings with pale tips and a black-and-white tail. Local +x is forward.
  const flat=(color,extra={})=>mat({color,flatShading:true,side:THREE.DoubleSide,metalness:.18,roughness:.55,...extra});
  const birdBlack=flat('#2a3035',{metalness:.3,roughness:.48});
  const birdYellow=flat('#f2b10d',{emissive:'#a86a00',emissiveIntensity:.12});
  const birdBill=flat('#ffc21a',{emissive:'#b57300',emissiveIntensity:.1});
  const birdCasque=flat('#e8700f',{emissive:'#9c3d00',emissiveIntensity:.04,roughness:.7});
  const birdWhite=flat('#eee9d8',{emissive:'#5f5a4a',emissiveIntensity:.12});
  const bird=new THREE.Group();bird.rotation.order='YZX';crest.add(bird);
  const birdMeshes=[];
  // The hornbill always stays behind the page copy, so it has no foreground copy.
  function birdMesh(geometry,material,parent,position=[0,0,0]){
    allGeometries.push(geometry);const mesh=new THREE.Mesh(geometry,material);mesh.position.set(...position);parent.add(mesh);birdMeshes.push(mesh);return mesh;
  }
  function ball(radius,w,h,scale=[1,1,1]){const g=new THREE.SphereGeometry(radius,w,h);g.scale(...scale);return g;}
  // A thin extruded plate in the bird's horizontal plane: shape x is chord, shape y is span (+z).
  function plate(points,depth=.07,lift=0,mirror=false){
    const shape=new THREE.Shape(points.map(([x,y])=>new THREE.Vector2(x,y)));
    const g=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:false});g.rotateX(Math.PI/2);g.translate(0,depth/2+lift,0);if(mirror)g.scale(1,1,-1);return g;
  }
  function feather(x,y,angle,length,width){
    const c=Math.cos(angle),s=Math.sin(angle);
    return [[width,0],[width*.9,length*.8],[0,length],[-width*.9,length*.8],[-width,0]].map(([u,v])=>[x+u*c+v*s,y-u*s+v*c]);
  }
  birdMesh(ball(1,8,6,[1.3,.62,.64]),birdBlack,bird).rotation.z=.08;
  // The sheet's broad yellow neck runs from the throat down into the chest.
  birdMesh(ball(.5,7,5,[1.25,.95,.82]),birdYellow,bird,[1.15,.3,0]).rotation.z=.55;
  birdMesh(ball(.42,7,5,[1.1,.8,.78]),birdYellow,bird,[.75,-.05,0]);
  const birdHead=new THREE.Group();birdHead.position.set(1.72,.68,0);bird.add(birdHead);
  birdMesh(ball(.46,8,6),birdBlack,birdHead);
  birdMesh(ball(.36,7,5,[1.05,.75,1.05]),birdYellow,birdHead,[-.06,-.2,0]);
  for(const side of [1,-1]){
    birdMesh(ball(.1,6,4),ivory,birdHead,[.2,.13,.37*side]);
    birdMesh(ball(.055,5,4),pupil,birdHead,[.25,.14,.43*side]);
  }
  // The bill curves down along its length; the casque rides on top and lifts at the front.
  const bend=(g,amount)=>{const p=g.attributes.position;for(let i=0;i<p.count;i++){const t=Math.max(0,p.getX(i))/1.9;p.setY(i,p.getY(i)-amount*t*t);}g.computeVertexNormals();return g;};
  const billGeometry=new THREE.CylinderGeometry(.11,.27,1.42,6,4);billGeometry.rotateZ(-Math.PI/2);billGeometry.translate(.71,0,0);billGeometry.scale(1,1.05,.62);
  birdMesh(bend(billGeometry,.62),birdBill,birdHead,[.28,-.08,0]);
  const billTip=new THREE.ConeGeometry(.11,.48,6,2);billTip.rotateZ(-Math.PI/2);billTip.translate(1.66,0,0);billTip.scale(1,1.05,.62);
  birdMesh(bend(billTip,.62),birdCasque,birdHead,[.28,-.08,0]);
  const casqueShape=new THREE.Shape([[0,0],[1.1,0],[1.32,.1],[1.3,.3],[1.0,.33],[.3,.38],[-.02,.28]].map(([x,y])=>new THREE.Vector2(x,y)));
  const casqueGeometry=new THREE.ExtrudeGeometry(casqueShape,{depth:.3,bevelEnabled:true,bevelSize:.03,bevelThickness:.03,bevelSegments:1});casqueGeometry.translate(0,0,-.15);
  birdMesh(bend(casqueGeometry,.3),birdCasque,birdHead,[.2,.1,0]);
  const wings=[];
  for(const side of [1,-1]){
    const mirror=side<0;
    const shoulder=new THREE.Group();shoulder.position.set(.22,.3,.48*side);bird.add(shoulder);
    birdMesh(plate([[.45,0],[.55,1.1],[.5,2.1],[-.55,2.1],[-.75,1.1],[-.7,0]],.07,0,mirror),birdBlack,shoulder);
    birdMesh(plate([[.3,.3],[.42,.7],[.18,2.08],[-.2,2.08],[-.04,.75]],.02,.045,mirror),birdYellow,shoulder);
    birdMesh(plate([[-.55,0],[-.55,2.1],[-1.2,2],[-.98,1.76],[-1.2,1.55],[-.98,1.3],[-1.2,1.08],[-.98,.86],[-1.18,.64],[-.95,.42],[-1.1,.2],[-.9,0]],.06,-.012,mirror),birdWhite,shoulder);
    const hand=new THREE.Group();hand.position.set(0,0,2.08*side);shoulder.add(hand);
    birdMesh(plate([[.5,0],[.38,1.05],[.05,1.85],[-.38,1.9],[-.62,1.15],[-.55,0]],.07,0,mirror),birdBlack,hand);
    birdMesh(plate([[.12,0],[.02,.55],[-.32,.5],[-.42,0]],.02,.045,mirror),birdYellow,hand);
    birdMesh(plate([[-.5,0],[-.5,1.25],[-1.02,1.1],[-.84,.86],[-1.08,.62],[-.86,.4],[-1.1,.18],[-.92,0]],.06,-.012,mirror),birdWhite,hand);
    // Five fanned primaries, black with pale tips.
    for(let k=0;k<5;k++){
      const x=.18-k*.15,y=1.55+Math.sin(k*.7)*.12,angle=-k*.2,length=.95-k*.06;
      birdMesh(plate(feather(x,y,angle,length,.12),.05,0,mirror),birdBlack,hand);
      const tip=feather(x+Math.sin(angle)*length*.5,y+Math.cos(angle)*length*.5,angle,length*.5,.11);
      birdMesh(plate(tip,.05,.01,mirror),birdWhite,hand);
    }
    wings.push({shoulder,hand,side});
  }
  // Tail: white base, broad black band, white tip.
  const tail=new THREE.Group();tail.position.set(-1.15,.08,0);bird.add(tail);
  birdMesh(plate([[.1,-.24],[-.95,-.4],[-.95,.4],[.1,.24]],.08),birdWhite,tail);
  birdMesh(plate([[-.93,-.4],[-1.65,-.48],[-1.65,.48],[-.93,.4]],.08,.004),birdBlack,tail);
  birdMesh(plate([[-1.63,-.48],[-2.45,-.44],[-2.62,-.2],[-2.66,0],[-2.62,.2],[-2.45,.44],[-1.63,.48]],.08),birdWhite,tail);
  const birdLeg=mat({color:'#3a3f44',flatShading:true,roughness:.7});
  const hips=[];
  for(const side of [1,-1]){
    const hip=new THREE.Group();hip.position.set(-.2,-.42,.2*side);bird.add(hip);hips.push(hip);
    const leg=new THREE.CylinderGeometry(.06,.08,.62,5);leg.translate(0,-.31,0);birdMesh(leg,birdLeg,hip);
    const toe=new THREE.ConeGeometry(.07,.32,4);toe.rotateZ(-Math.PI/2);toe.translate(.14,0,0);
    birdMesh(toe,birdLeg,hip,[0,-.63,.05]);birdMesh(toe.clone(),birdLeg,hip,[0,-.63,-.05]).rotation.y=Math.PI;
  }
  // Afterlight landing: a big low-poly tree on the right. A tall, broad trunk
  // rises from below the frame, a long branch reaches out to the left with a
  // rounded leaf clump at its tip, and a large canopy crowns the top right.
  const birdBark=mat({color:'#4d3a2a',flatShading:true,roughness:.9});
  const birdLeaf=mat({color:'#2e4a33',flatShading:true,roughness:.8,emissive:'#0d1f12',emissiveIntensity:.3});
  const treeBase=new THREE.Vector3(10.2,-9.5,-1);
  const tree=new THREE.Group();tree.position.copy(treeBase);crest.add(tree);
  // Tree coordinates below are authored, then lowered so the branch sits in the
  // open band beneath the Afterlight copy and the crown rises beside the heading.
  const treeDrop=4.6;
  function bough(from,to,r0,r1){
    const a=v3(from).sub(treeBase),b=v3(to).sub(treeBase);a.y-=treeDrop;b.y-=treeDrop;const length=a.distanceTo(b);
    const g=new THREE.CylinderGeometry(r1,r0,length,7,1);allGeometries.push(g);
    const m=new THREE.Mesh(g,birdBark);m.position.copy(a).add(b).multiplyScalar(.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),b.clone().sub(a).normalize());tree.add(m);
  }
  bough([10.2,-9.5,-1],[9.9,1.2,-1],1.15,.78);
  bough([9.9,1.2,-1],[9.7,4.6,-1.2],.78,.42);
  bough([9.8,1.6,-1],[6.4,2.05,-1],.46,.3);
  bough([6.4,2.05,-1],[3.1,2.3,-1],.3,.14);
  bough([9.8,3.4,-1.1],[12.2,5.2,-1.3],.34,.12);
  bough([9.7,4.0,-1.2],[7.8,5.6,-1.4],.28,.1);
  bough([10.1,-3.5,-1],[11.9,-1.8,-.9],.3,.1);
  for(const [x,y,z,r,sx,sy] of [
    [2.7,2.75,-1.2,.95,1.3,.9],[3.6,3.05,-1.5,.7,1.2,.85],
    [9.6,6.1,-1.8,2.3,1.35,.85],[12.2,5.4,-1.6,1.8,1.25,.85],[7.6,5.8,-1.7,1.7,1.3,.8],[10.6,7.6,-2,1.9,1.3,.8],[8.6,7.3,-2.1,1.5,1.2,.8],
    [12.2,-1.5,-1,.8,1.3,.8]]){
    const g=new THREE.IcosahedronGeometry(r,0);allGeometries.push(g);const leaf=new THREE.Mesh(g,birdLeaf);leaf.position.set(x,y-treeDrop,z).sub(treeBase);leaf.scale.set(sx,sy,1);tree.add(leaf);
  }
  // The bird perches mid-branch, upright and facing left, at half its flying size.
  const perchPoint=new THREE.Vector3(5.6,2.1-treeDrop,-1),perchedScale=.5,perchedPitch=.7;
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
  // Storyboard: the logo holds in Beginning and flows into the hornbill at the
  // left edge; Roots: it flies left to right in profile; Vision: it turns to face
  // the viewer and banks left and down; Worlds: it keeps banking, sweeping left to
  // right above the cards; Afterlight: it banks round and lands on the tree, then
  // folds back into the logo. Keys are scene progress values (Roots starts at 1,
  // Vision at 2, Worlds at 4, Afterlight at 6.7, the footer at 7.5).
  const birdScale=.95,projected=new THREE.Vector3();
  const landed=perchPoint.clone().add(new THREE.Vector3(-.06,1.08*birdScale*perchedScale+.24,0));
  const key=(at,position,yaw,pitch,roll,flap,fold)=>({at,position:v3(position),yaw,pitch,roll,flap,fold});
  const keys=[
    key(.55,[-8.5,.4,0],0,.05,.15,1,0),
    key(1.0,[-6,.7,0],0,.05,.15,1,0),
    key(1.85,[4.4,1,0],0,.05,.15,1,0),
    key(2.45,[-.6,2.5,-1.2],-1.45,-.35,.5,.15,0),
    key(3.3,[-4.6,.6,-.6],-1.3,-.45,.62,.1,0),
    key(4.1,[-6.4,2.3,-1],-.55,-.12,.62,.3,0),
    key(5.4,[.2,-1.4,-1.6],-.05,0,.55,.25,0),
    key(6.6,[6.4,2.2,-1],.4,.05,.5,.35,0),
    key(6.85,[8.6,2.6,-3.2],1.65,.05,.62,.4,0),
    key(7.0,landed.clone().add(new THREE.Vector3(1.4,1.0,.3)).toArray(),2.75,.35,0,1,0),
    key(7.12,landed.toArray(),Math.PI,perchedPitch,0,0,1),
    key(7.85,landed.toArray(),Math.PI,perchedPitch,0,0,1)
  ];
  const pose={position:new THREE.Vector3(),yaw:0,pitch:0,roll:0,flap:0,fold:0};
  function choreography(p){
    let i=0;while(i<keys.length-2&&p>keys[i+1].at)i++;
    const a=keys[i],b=keys[i+1],t=ease(a.at,b.at,p);
    pose.position.lerpVectors(a.position,b.position,t);
    for(const name of ['yaw','pitch','roll','flap','fold'])pose[name]=lerp(a[name],b[name],t);
    return pose;
  }
    function render(progress,time,pointer={x:0,y:0},options={}){
    const staticMode=options.reducedMotion;
    const p=clamp(progress,0,7.85);
    const unfolding=ease(.5,.98,p),closing=ease(7.32,7.5,p),travel=unfolding*(1-closing);
    const showIntro=p<.1;const assembly=staticMode||!showIntro?1:ease(.15,3.45,time);
    const wholeScale=mobile?.64:1.08;
    crest.scale.setScalar(wholeScale);
    crest.position.y=mobile?lerp(.4,-1.9,travel):.28;
    crest.rotation.y=staticMode?0:Math.sin(time*.14)*.14*(1-travel);
    crest.rotation.x=staticMode?0:Math.sin(time*.11)*.065*(1-travel);
    const motion=staticMode?0:1;
    const {position,yaw,pitch,roll,flap,fold}=choreography(p);
    const airborne=motion*(1-fold);
    bird.position.copy(position);bird.position.x*=mobile?.5:1;
    bird.position.y+=Math.sin(time*.5)*.14*airborne;
    bird.rotation.set(roll+Math.cos(time*.23)*.06*airborne,yaw,pitch+Math.sin(time*.5+1.2)*.04*airborne);
    // Flaps come in gentle bursts; on the perch the wings fold flat against the body.
    const flapping=motion*flap*lerp(.35,1,ease(.15,.85,.5+.5*Math.sin(time*.31)));
    const stroke=Math.sin(time*3.1);
    for(const {shoulder,hand,side} of wings){
      shoulder.rotation.set(-side*((.3+flapping*stroke*.42)*(1-fold))+side*fold*1.45,-side*fold*1.5,0);
      shoulder.scale.setScalar(lerp(1,.56,fold));
      hand.rotation.set(-side*(.06+flapping*Math.sin(time*3.1-.7)*.28)*(1-fold),-side*fold*.2,0);
    }
    for(const hip of hips)hip.rotation.z=lerp(-1.75,-pitch,fold);
    birdHead.rotation.set(0,Math.sin(time*.37)*.12*motion,Math.sin(time*.8)*.05*motion-fold*.35);
    tail.rotation.set(Math.sin(time*.45)*.06*motion,0,Math.sin(time*.9)*.05*motion+.16+fold*.3);
    // Phones: raise the tree so its branch clears the footer that follows Afterlight.
    const treeLift=mobile?2.2:0;
    // The tree grows up from below the frame as the bird starts its landing turn.
    const treeReveal=ease(6.6,6.95,p)*(1-closing);
    tree.visible=treeReveal>.001;tree.scale.setScalar(Math.max(.001,treeReveal));tree.position.x=treeBase.x-(mobile?perchPoint.x*.5:0);tree.position.y=treeBase.y+treeLift;
    const birdReveal=ease(.3,.95,travel);
    const settle=ease(6.9,7.12,p);if(mobile)bird.position.y+=treeLift*ease(6.85,7.12,p)-.08*settle;
    bird.scale.setScalar(birdScale*(mobile?.8:1)*lerp(1,perchedScale,settle)*Math.max(.001,birdReveal));bird.visible=birdReveal>.001;
    // The whole logo flows into the hornbill (and back out of it) as one piece.
    const gather=ease(0,.75,travel);
    logo.position.lerpVectors(new THREE.Vector3(),bird.position,gather);
    logo.scale.setScalar(Math.max(.001,1-gather));logo.visible=gather<.995;
    // The ribbon starts from the exact artwork once the opening has assembled,
    // eases into motion and laps the whole figure eight about every 14 seconds.
    const run=staticMode?0:Math.max(0,time-3.6),settled=Math.min(1,run);
    if(logo.visible)slideRibbon(-trackLength/14*(run<1?run*run/2:run-.5),.55*settled);
    body.forEach((part,i)=>{
      const reveal=staticMode||p>.12?1:ease(i*.13,.65+i*.13,time);
      part.mesh.position.copy(part.rest);part.mesh.position.z+=(1-reveal)*1.4;
      part.mesh.scale.setScalar(Math.max(.001,reveal));
    });
    head.position.copy(restHead);
    // Orange follows the body; the simple white eye is the last reveal.
    for(const part of headParts){const delay=part.index===0?.85:part.index===2?2.65:1.95;const reveal=staticMode||p>.1?1:ease(delay,delay+.75,time);part.mesh.scale.setScalar(Math.max(.001,reveal));}
    eye.scale.setScalar(staticMode||p>.1?1:Math.max(.001,ease(2.65,3.35,time)));
    const approach=(1-travel)*(1-ease(1,8,time))*.9;
    const cameraZ=(mobile?23:20)+approach+ease(2.6,3.1,p)*(1-ease(3.2,3.7,p))*1.1;
    camera.position.set(Math.sin(p*.7)*.35+pointer.x*.3,.4+Math.sin(p*.55)*.22+pointer.y*.16,cameraZ);
    camera.lookAt(Math.sin(p*.5)*.25,0,-.6*travel);
    lights.warm.position.x=5+Math.sin(time*.23)*2;frontLights.warm.position.copy(lights.warm.position);
    const atmosphereStrength=ease(.45,1.8,p)*(1-ease(7.25,7.5,p));
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
    return {travel,assembly,frontVisible,segments:bird.visible?birdMeshes.length:body.length,phase:p>7.3?'return':p<.8?'opening':'journey'};
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
