import * as T from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {earthURL,cloudURL} from './textures.js';
export async function createStage(canvas){
 const renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.04;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
 const scene=new T.Scene();scene.matrixAutoUpdate=false;scene.updateMatrix();scene.background=new T.Color(0x020509);const camera=new T.PerspectiveCamera(40,1,.035,150000);camera.position.set(45,30,57);const controls=new OrbitControls(camera,canvas);controls.target.set(0,0,3);controls.enableDamping=true;controls.dampingFactor=.07;controls.minDistance=1;controls.maxDistance=190;controls.maxPolarAngle=Math.PI*.97;
 const pmrem=new T.PMREMGenerator(renderer);const room=new RoomEnvironment();scene.environment=pmrem.fromScene(room,.04).texture;scene.environmentIntensity=.23;room.dispose();pmrem.dispose();
 const sun=new T.DirectionalLight(0xfff5e8,3.1);sun.position.set(35,58,32);sun.castShadow=true;sun.shadow.autoUpdate=false;sun.shadow.needsUpdate=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-45,right:45,top:42,bottom:-42,near:1,far:160});sun.shadow.bias=-.00012;sun.shadow.normalBias=.012;scene.add(sun);
 // A small Earth fill preserves directional sunlight across the blankets.
 const bounce=new T.HemisphereLight(0x8da8c6,0x22354d,.38);scene.add(bounce);
 const interiorLights=[];for(let pos of[[0,.78,2.8],[0,.78,5.1],[0,.95,8.8],[0,.95,11.5],[-5,.95,0],[-8,.95,0],[-10.8,.95,0],[5,.95,0],[8,.95,0],[10.8,.95,0]]){const light=new T.PointLight(0xf0f4ee,13,7,2);light.position.set(...pos);scene.add(light);interiorLights.push(light);}
 // One local shadow source follows the occupied cabin; the other lamps fill.
 const cabinShadow=new T.PointLight(0xf0f4ee,7,7,2);cabinShadow.castShadow=true;cabinShadow.shadow.autoUpdate=false;cabinShadow.shadow.needsUpdate=true;cabinShadow.shadow.mapSize.set(512,512);cabinShadow.shadow.camera.near=.15;cabinShadow.shadow.camera.far=8;cabinShadow.shadow.bias=-.0003;cabinShadow.shadow.normalBias=.003;scene.add(cabinShadow);
 const loader=new T.TextureLoader();const [earthMap,clouds]=await Promise.all([loader.loadAsync(earthURL),loader.loadAsync(cloudURL)]);earthMap.colorSpace=T.SRGBColorSpace;earthMap.anisotropy=8;clouds.anisotropy=4;
 const planet=new T.Group();planet.position.set(0,-6771,-1100);planet.rotation.set(1.25,.7,.23);scene.add(planet);
 const earth=new T.Mesh(new T.SphereGeometry(6371,128,80),new T.MeshStandardMaterial({map:earthMap,roughness:1,metalness:0,emissive:0x071323,emissiveIntensity:.17}));earth.castShadow=false;earth.receiveShadow=false;planet.add(earth);
 const cloud=new T.Mesh(new T.SphereGeometry(6383,112,64),new T.MeshStandardMaterial({alphaMap:clouds,color:0xeef3f5,transparent:true,opacity:.9,depthWrite:false,roughness:1}));planet.add(cloud);
 const atmosphere=new T.Mesh(new T.SphereGeometry(6441,112,64),new T.ShaderMaterial({transparent:true,side:T.BackSide,depthWrite:false,blending:T.AdditiveBlending,vertexShader:'varying vec3 vN;varying vec3 vV;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}',fragmentShader:'varying vec3 vN;varying vec3 vV;void main(){float d=max(0.,1.-abs(dot(normalize(vN),normalize(vV))));float a=pow(d,9.0)*.38;gl_FragColor=vec4(vec3(.13,.40,.85),a);}'}));planet.add(atmosphere);
 // Real orbital radius; very sparse stars because exposure is set for sunlit hardware.
 let ps=[],s=24681357;for(let i=0;i<470;i++){s=(1664525*s+1013904223)>>>0;let a=s/2**32*Math.PI*2;s=(1664525*s+1013904223)>>>0;let v=s/2**32*2-1;let r=Math.sqrt(1-v*v);ps.push(30000*r*Math.cos(a),30000*v,30000*r*Math.sin(a));}const sg=new T.BufferGeometry();sg.setAttribute('position',new T.Float32BufferAttribute(ps,3));const stars=new T.Points(sg,new T.PointsMaterial({color:0x9ca9bb,size:1,sizeAttenuation:false,transparent:true,opacity:.35}));scene.add(stars);
 const grid=new T.GridHelper(110,55,0x5a8190,0x273d4b);grid.position.y=-5;grid.visible=false;scene.add(grid);
 function size(){const b=canvas.parentElement.getBoundingClientRect();renderer.setSize(b.width,b.height,false);camera.aspect=b.width/b.height;camera.updateProjectionMatrix();}size();
 function lightMode(studio){planet.visible=!studio;stars.visible=!studio;grid.visible=studio;scene.background.set(studio?0x14222c:0x020509);}
 let shadowRevision=-1,cabinRevision=-1,occupiedLamp=null;
 function update(t,state,revision){const o=t*.00013;planet.rotation.y=.7+o;cloud.rotation.y=.9+o*.6;interiorLights.forEach(l=>{l.visible=state.cut||state.xray>.1||state.interior;l.intensity=state.interior?10:17;});scene.environmentIntensity=state.interior?.22:state.studio?.52:.13;bounce.intensity=state.interior?.24:state.studio?1.8:.38;sun.intensity=state.interior?.12:3.1;stars.visible=!state.studio;cabinShadow.visible=state.interior;
  // Omitting the revision keeps direct diagnostic callers conservative.
  if(revision===undefined||shadowRevision!==revision){sun.shadow.needsUpdate=true;shadowRevision=revision;}
  if(state.interior){let nearest=null,distance=Infinity;for(const lamp of interiorLights){if(Math.abs(camera.position.x)<2?Math.abs(lamp.position.x)>=1:camera.position.x*lamp.position.x<=0)continue;const d=lamp.position.distanceToSquared(camera.position);if(d<distance){distance=d;nearest=lamp;}}
   if(nearest&&(occupiedLamp!==nearest||cabinRevision!==revision||revision===undefined)){cabinShadow.position.copy(nearest.position);cabinShadow.shadow.needsUpdate=true;occupiedLamp=nearest;cabinRevision=revision;}
  }
 }
 return {scene,camera,controls,renderer,planet,sun,size,update,lightMode,performanceInfo:()=>({shadowRevision,cabinRevision,occupiedLamp:occupiedLamp?.position.toArray(),pixelRatio:renderer.getPixelRatio(),shadowMapSize:sun.shadow.mapSize.x})};
}
