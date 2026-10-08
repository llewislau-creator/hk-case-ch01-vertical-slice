import React,{useEffect,useMemo,useRef,useState} from 'react';
import ReactDOM from 'react-dom/client';
import {Canvas,useFrame} from '@react-three/fiber';
import {Sky,Text,useTexture} from '@react-three/drei';
import {Physics,RigidBody,CapsuleCollider,CuboidCollider} from '@react-three/rapier';
import * as THREE from 'three';
import './styles.css';

const EVID=new THREE.Vector3(11.7,.5,4);
const NPCS={
 cleaner:{p:new THREE.Vector3(13.9,0,.7),name:'清潔工',text:'我今朝返工時見到個紙盒放喺行人路邊。最初以為係普通棄置物，但個箱明顯比一般紙箱重。',clue:'cleaner'},
 patrol:{p:new THREE.Vector3(17,0,18),name:'巡警',text:'現場已經封鎖。你可以先由外圍觀察紙盒位置、馬路同附近出入口。',clue:'patrol'},
 news:{p:new THREE.Vector3(9.4,0,-58.8),name:'報販／街坊綜合角色',text:'朝早呢段路通常已經開始多人；如果有人搬大型物件，理論上唔算容易完全冇人留意。',clue:'visibility'}
};
const SAVE='hk-case-ch01-artpass04';

const textureFiles={asphalt:'asphalt.svg',concrete:'concrete.svg',plaster:'plaster.svg',wood:'wood.svg',metal:'metal.svg',sign:'sign.svg',glass:'glass.svg'};
function Mat({color='#ffffff',texture,roughness=.9,metalness=0,transparent=false,opacity=1,emissive,emissiveIntensity}){const map=texture?useTexture('./textures/'+textureFiles[texture]):null;return <meshStandardMaterial map={map} color={color} roughness={roughness} metalness={metalness} transparent={transparent} opacity={opacity} emissive={emissive} emissiveIntensity={emissiveIntensity}/>}

function Shop({z,label,body,accent}){
 const xs=[-2.8,0,2.8];
 return <group position={[57.8,0,z]}>
   <mesh castShadow receiveShadow position={[0,5,0]}><boxGeometry args={[11,10,14]}/><Mat color={body} texture="plaster"/></mesh>
   <mesh castShadow receiveShadow position={[0,1.35,-7.08]}><boxGeometry args={[10.4,2.7,.16]}/><Mat color="#d6cbb8" texture="concrete" roughness={.82}/></mesh>
   <mesh castShadow position={[0,3.0,-7.35]}><boxGeometry args={[10.1,.85,.28]}/><Mat color={accent} texture="sign" roughness={.78}/></mesh>
   <Text position={[0,3.02,-7.52]} fontSize={.46} color="#f4dfad" anchorX="center">{label}</Text>
   {xs.map((x,i)=><group key={i} position={[x,6.15,-7.12]}><mesh><boxGeometry args={[2.05,2.2,.08]}/><Mat color="#625447" texture="wood"/></mesh><mesh position={[0,0,.055]}><boxGeometry args={[1.64,1.82,.03]}/><Mat color="#c5d6de" texture="glass" roughness={.08} metalness={.08} transparent opacity={.48}/></mesh></group>)}
   <mesh castShadow position={[0,3.62,-8.15]} rotation={[.1,0,0]}><boxGeometry args={[10.2,.12,2.3]}/><Mat color="#6e7c89" texture="metal" roughness={.72}/></mesh>
   <mesh position={[0,1.1,-7.22]}><boxGeometry args={[8.2,1.55,.05]}/><Mat color="#e9dcc1" transparent opacity={.18} emissive="#9b6a35" emissiveIntensity={.24}/></mesh>
   <pointLight position={[0,1.9,-6.4]} intensity={.16} distance={10} color="#dfa45e"/>
 </group>
}

function HeroStreet({evening}){
 const shops=[
  [70,'永生茶室','#b59b82','#7e4334'],[42,'德昌雜貨','#b3aa95','#5c6e5d'],[14,'南華布行','#a99a85','#3d5f6e'],
  [-14,'大同理髮','#b7a68d','#784d53'],[-42,'環球藥房','#b0a18d','#6d5b38'],[-70,'幸福冰室','#a99e89','#54677e'],[-98,'光明照相','#b4a791','#56446b']
 ];
 const crowd=[[13.1,0,8.2],[14.6,0,7.6],[12.1,0,6.5],[15.3,0,5.9],[17,0,8.8],[18,0,7],[19,0,5.6],[16.2,0,4.9]];
 return <group>
   <mesh receiveShadow position={[0,-.2,0]}><boxGeometry args={[250,.4,300]}/><Mat color="#847d70"/></mesh>
   <mesh receiveShadow position={[25,.02,0]}><boxGeometry args={[24,.12,230]}/><Mat color="#a6a29c" texture="asphalt" roughness={.96}/></mesh>
   <mesh receiveShadow position={[10.5,.08,0]}><boxGeometry args={[10,.06,230]}/><Mat color="#d0c5b4" texture="concrete"/></mesh>
   <mesh receiveShadow position={[42,.08,0]}><boxGeometry args={[10,.06,230]}/><Mat color="#d0c5b4" texture="concrete"/></mesh>
   <mesh receiveShadow position={[-57,.01,5]}><boxGeometry args={[95,.12,210]}/><Mat color="#5c744f"/></mesh>
   {[20.6,29.6].map(x=><mesh key={x} position={[x,.045,-4]}><boxGeometry args={[.08,.025,188]}/><Mat color="#b3b3b3" texture="metal" roughness={.45} metalness={.6}/></mesh>)}
   {Array.from({length:31},(_,i)=>-94+i*6).map(z=><mesh key={z} position={[25.1,.022,z]}><boxGeometry args={[9.4,.035,.16]}/><Mat color="#8c735c" texture="wood"/></mesh>)}
   {Array.from({length:15},(_,i)=>-100+i*14).map(z=><mesh key={z} position={[22.2,.05,z]}><boxGeometry args={[.16,.012,6.6]}/><Mat color="#d4c49e"/></mesh>)}
   <mesh position={[15.15,.17,0]}><boxGeometry args={[.24,.26,228]}/><Mat color="#968f80"/></mesh>
   <mesh position={[39.75,.17,0]}><boxGeometry args={[.24,.26,228]}/><Mat color="#a8a293"/></mesh>

   {shops.map((s,i)=><Shop key={i} z={s[0]} label={s[1]} body={s[2]} accent={s[3]}/>)}

   {[-86,-54,-22,10,42,74].map(z=><group key={z} position={[15.7,0,z]}><mesh castShadow position={[0,3.9,0]}><cylinderGeometry args={[.08,.1,7.8,10]}/><Mat color="#695f55"/></mesh><mesh position={[8.9,6.85,0]}><boxGeometry args={[16.8,.03,.03]}/><Mat color="#666" metalness={.25} roughness={.7}/></mesh></group>)}
   {[24.6,26.4].map((x,i)=><mesh key={i} position={[x,6.8,-2]}><boxGeometry args={[.035,.035,208]}/><Mat color="#666" metalness={.3} roughness={.7}/></mesh>)}

   {Array.from({length:26},(_,i)=>-100+i*8).map(z=><mesh key={z} castShadow position={[-8,1.2,z]}><boxGeometry args={[.18,2.4,.18]}/><Mat color="#5c4939"/></mesh>)}
   {[.55,1].map(y=><mesh key={y} position={[-8,y,0]}><boxGeometry args={[.1,.08,208]}/><Mat color="#7d6d5e"/></mesh>)}

   {[52,12,-28,-68,-104].map(z=><group key={z} position={[38,0,z]}><mesh castShadow position={[0,2.15,0]}><cylinderGeometry args={[.09,.13,4.3,10]}/><Mat color="#5e554a"/></mesh><mesh castShadow position={[.44,4.1,0]}><boxGeometry args={[.9,.08,.08]}/><Mat color="#5e554a"/></mesh><mesh position={[.9,3.95,0]}><boxGeometry args={[.34,.42,.34]}/><Mat color="#cbbf9f" emissive="#8d6a3b" emissiveIntensity={evening?.7:.34}/></mesh><pointLight position={[.9,3.9,0]} intensity={evening?.95:.28} distance={17} color="#dca55c"/></group>)}

   <group position={[44.5,0,-58.5]}><mesh castShadow position={[0,.9,0]}><boxGeometry args={[2.8,1.8,1.5]}/><Mat color="#907860"/></mesh><mesh position={[0,2,-.82]}><boxGeometry args={[2.5,.5,.1]}/><Mat color="#724438"/></mesh><Text position={[0,2,-.9]} fontSize={.24} color="#f2dfad" anchorX="center">報紙雜誌</Text></group>
   <group position={[39.6,0,24]}><mesh castShadow position={[0,.08,0]}><boxGeometry args={[3.4,.12,1.5]}/><Mat color="#9a927f"/></mesh>{[-1.35,1.35].map(x=><mesh key={x} castShadow position={[x,1.15,-.55]}><boxGeometry args={[.12,2.3,.12]}/><Mat color="#675d52"/></mesh>)}<mesh castShadow position={[0,2.35,-.55]}><boxGeometry args={[3.5,.12,1.5]}/><Mat color="#6f7d8b"/></mesh><Text position={[0,2.45,-1.28]} fontSize={.18} color="#efe0b3" anchorX="center">電車站</Text></group>

   {crowd.map((p,i)=><group key={i} position={p}><mesh castShadow position={[0,.7,0]}><capsuleGeometry args={[.18,.72,4,8]}/><Mat color={i%3===0?'#6b7a86':i%3===1?'#6c6255':'#826b56'}/></mesh><mesh castShadow position={[0,1.35,0]}><sphereGeometry args={[.16,10,10]}/><Mat color="#bc9d7b"/></mesh></group>)}
   {[ [15.8,0,11.5],[18.4,0,10.9] ].map((p,i)=><group key={'p'+i} position={p}><mesh castShadow position={[0,.7,0]}><capsuleGeometry args={[.18,.72,4,8]}/><Mat color="#46576a"/></mesh><mesh castShadow position={[0,1.35,0]}><sphereGeometry args={[.16,10,10]}/><Mat color="#bc9d7b"/></mesh></group>)}
   <mesh castShadow position={[11.7,.48,4]}><boxGeometry args={[1.4,.96,.95]}/><Mat color="#8b6a46"/></mesh>
   <mesh position={[16.1,.96,3.8]}><boxGeometry args={[6.8,.05,.07]}/><Mat color="#e6d27c" emissive="#705020" emissiveIntensity={.08}/></mesh>

   {[ [24,.055,16,3.2,1.2],[23.1,.055,-26,2.4,1.1],[39.8,.085,-60,2.1,.9] ].map((p,i)=><mesh key={'wet'+i} position={[p[0],p[1],p[2]]}><boxGeometry args={[p[3],.01,p[4]]}/><Mat color="#7f8a92" metalness={.35} roughness={.18} transparent opacity={.14}/></mesh>)}
   {[34,-6,-44,-82].map((z,i)=><mesh key={'h'+i} position={[29,3.4,z]} rotation={[0,Math.PI/2,0]}><planeGeometry args={[i===1?24:18,6.5]}/><meshBasicMaterial color={evening?'#b67d58':'#d8c9b2'} transparent opacity={evening?.085:.04} depthWrite={false}/></mesh>)}
 </group>
}

function Tram(){
 const r=useRef();
 useFrame(({clock})=>{if(r.current)r.current.position.z=((clock.elapsedTime*2.6)%118)-59});
 return <group ref={r} position={[25.1,0,0]}>
  <mesh castShadow position={[0,1.3,0]}><boxGeometry args={[2.15,2.6,8.8]}/><Mat color="#315a3d" roughness={.72} metalness={.08}/></mesh>
  <mesh castShadow position={[0,3,0]}><boxGeometry args={[1.96,1.55,8]}/><Mat color="#315a3d" roughness={.72}/></mesh>
  <mesh position={[0,1.3,0]}><boxGeometry args={[2.19,.26,8.85]}/><Mat color="#e7dcc3" roughness={.7}/></mesh>
  <Text position={[0,.42,4.45]} fontSize={.2} color="#24402d" anchorX="center">跑馬地</Text>
  {[1.1,2.85].flatMap(y=>[-2.7,-1.35,0,1.35,2.7].map(z=>[y,z])).map((v,i)=><mesh key={i} position={[1.08,v[0],v[1]]}><boxGeometry args={[.05,.65,.9]}/><Mat color="#8aa7b5" transparent opacity={.7} roughness={.14}/></mesh>)}
 </group>
}
function Traffic(){return <group><Tram/><group position={[33.2,0,56]}><mesh castShadow position={[0,1.15,0]}><boxGeometry args={[2.2,2.3,6.3]}/><Mat color="#8f4b35" roughness={.78}/></mesh><mesh castShadow position={[0,2.65,0]}><boxGeometry args={[2,1.2,6]}/><Mat color="#d6cfba" roughness={.75}/></mesh></group>{[[34.8,0,-52,'#667f90'],[33.1,0,-18,'#7d6a4d'],[34.5,0,26,'#85725f']].map((p,i)=><group key={i} position={p.slice(0,3)}><mesh castShadow position={[0,.55,0]}><boxGeometry args={[1.7,1,3.3]}/><Mat color={p[3]}/></mesh><mesh castShadow position={[0,1.15,-.1]}><boxGeometry args={[1.2,.7,1.6]}/><Mat color={p[3]}/></mesh></group>)}</group>}

function Colliders(){return <RigidBody type="fixed" colliders={false}><CuboidCollider args={[125,.15,150]} position={[0,-.15,0]}/><CuboidCollider args={[.8,.8,107.5]} position={[-7,.7,5]}/>{[70,40,10,-20,-50,-80].map(z=><CuboidCollider key={z} args={[14,12,12]} position={[64,12,z]}/>)}</RigidBody>}

function Player({enabled,cameraEnabled,onPos,initial}){
 const body=useRef(),keys=useRef({}),yaw=useRef(0),pitch=useRef(0);
 useEffect(()=>{const d=e=>keys.current[e.code]=true,u=e=>keys.current[e.code]=false,m=e=>{if(document.pointerLockElement&&enabled){yaw.current-=e.movementX*.0022;pitch.current=THREE.MathUtils.clamp(pitch.current-e.movementY*.0019,-1.25,1.25)}};addEventListener('keydown',d);addEventListener('keyup',u);addEventListener('mousemove',m);return()=>{removeEventListener('keydown',d);removeEventListener('keyup',u);removeEventListener('mousemove',m)}},[enabled]);
 useFrame(({camera})=>{if(!body.current)return;const p=body.current.translation(),k=keys.current;const f=enabled?+!!k.KeyW-+!!k.KeyS:0,s=enabled?+!!k.KeyD-+!!k.KeyA:0;const v=new THREE.Vector3(s,0,-f);const sp=k.ShiftLeft||k.ShiftRight?8:5.2;if(v.lengthSq()){v.normalize().applyAxisAngle(new THREE.Vector3(0,1,0),yaw.current);const l=body.current.linvel();body.current.setLinvel({x:v.x*sp,y:l.y,z:v.z*sp},true)}else{const l=body.current.linvel();body.current.setLinvel({x:0,y:l.y,z:0},true)}if(cameraEnabled){camera.position.set(p.x,p.y+1.48,p.z);camera.rotation.set(pitch.current,yaw.current,0,'YXZ');if(camera.fov!==62){camera.fov=62;camera.updateProjectionMatrix()}}onPos([p.x,p.y,p.z])});
 return <RigidBody ref={body} colliders={false} enabledRotations={[false,false,false]} position={initial} linearDamping={8} friction={.8}><CapsuleCollider args={[.55,.34]} position={[0,.85,0]}/></RigidBody>
}

function Cinematic({active}){
 const a=useMemo(()=>new THREE.Vector3(31,4.2,-104),[]),b=useMemo(()=>new THREE.Vector3(27,3.2,-58),[]),c=useMemo(()=>new THREE.Vector3(20,2.7,-10),[]);
 const la=useMemo(()=>new THREE.Vector3(24,2,-48),[]),lb=useMemo(()=>new THREE.Vector3(15,1.3,6),[]);
 const start=useRef(null);
 useFrame(({camera,clock})=>{if(!active)return;if(start.current===null)start.current=clock.getElapsedTime();const t=Math.min(1,(clock.getElapsedTime()-start.current)/7.2);const p=new THREE.Vector3();if(t<.55){const u=t/.55;p.copy(a).lerp(b,u);camera.position.lerp(p,.09);camera.lookAt(la)}else{const u=(t-.55)/.45;p.copy(b).lerp(c,u);camera.position.lerp(p,.09);camera.lookAt(la.clone().lerp(lb,u))}camera.fov=54;camera.updateProjectionMatrix()});
 return null
}

function Scene({evening,cinematic,pos,setPos,controls,setNear}){
 return <Canvas shadows dpr={[1,1.5]} gl={{antialias:true,powerPreference:'high-performance'}} camera={{position:[32,2.6,-112],fov:62}} onCreated={({gl})=>{gl.outputColorSpace=THREE.SRGBColorSpace;gl.toneMapping=THREE.ACESFilmicToneMapping;gl.toneMappingExposure=evening?.9:1.03}} onPointerDown={e=>controls&&e.gl.domElement.requestPointerLock?.()}>
  <color attach="background" args={[evening?'#7b6a61':'#d0c5b5']}/><fog attach="fog" args={[evening?'#7b6a61':'#d0c5b5',evening?24:42,evening?122:162]}/>
  <ambientLight intensity={evening?.38:.82}/><hemisphereLight intensity={evening?.4:.56} color={evening?'#f0d3a5':'#d9e5f2'} groundColor={evening?'#4d4338':'#5e6757'}/>
  <directionalLight castShadow position={evening?[-25,18,-40]:[45,70,-30]} intensity={evening?1.34:2.28} color={evening?'#d49b71':'#fff7e6'} shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-bias={-.0002}/>
  <directionalLight position={evening?[28,10,22]:[-12,18,55]} intensity={evening?.3:.34} color={evening?'#9d6f52':'#97aeca'}/>
  {evening&&<><pointLight position={[55,2.8,12]} intensity={.55} distance={18} color="#d99251"/><pointLight position={[55.2,2.8,-43]} intensity={.5} distance={16} color="#d99251"/></>}
  <Sky distance={450000} sunPosition={evening?[-.8,.12,-.5]:[.2,.45,.15]} turbidity={evening?13:9} rayleigh={evening?4.6:2.8} mieCoefficient={evening?.013:.009} mieDirectionalG={.82}/>
  <Cinematic active={cinematic}/>
  <Physics gravity={[0,-9.81,0]}><HeroStreet evening={evening}/><Traffic/><Colliders/><Player enabled={controls} cameraEnabled={!cinematic} initial={pos} onPos={p=>{setPos(p);const pp=new THREE.Vector3(...p);const n=Object.entries(NPCS).map(([id,o])=>[id,pp.distanceTo(o.p)]).sort((x,y)=>x[1]-y[1])[0];setNear(n&&n[1]<3.2?n[0]:null)}}/></Physics>
 </Canvas>
}

function App(){
 const saved=useMemo(()=>{try{return JSON.parse(localStorage.getItem(SAVE)||'{}')}catch{return{}}},[]);
 const [load,setLoad]=useState(true),[entered,setEntered]=useState(false),[cinematic,setCinematic]=useState(false),[pos,setPos]=useState(saved.pos||[32,1.1,-112]),[clues,setClues]=useState(saved.clues||[]),[near,setNear]=useState(null),[talk,setTalk]=useState(null),[book,setBook]=useState(false),[evening,setEvening]=useState(!!saved.evening),[complete,setComplete]=useState(false);
 useEffect(()=>{const t=setTimeout(()=>setLoad(false),1000);return()=>clearTimeout(t)},[]);
 useEffect(()=>{if(!cinematic)return;const t=setTimeout(()=>setCinematic(false),7600);return()=>clearTimeout(t)},[cinematic]);
 useEffect(()=>{localStorage.setItem(SAVE,JSON.stringify({pos,clues,evening}))},[pos,clues,evening]);
 const add=x=>setClues(c=>c.includes(x)?c:[...c,x]);const has=x=>clues.includes(x);
 const first=has('cleaner')&&has('visibility')&&has('box');const second=has('identity')&&has('contact')&&has('tram')&&has('gap')&&evening;
 const controls=entered&&!cinematic&&!book&&!talk&&!complete;const nearEvidence=new THREE.Vector3(...pos).distanceTo(EVID)<7;
 return <main className="game">
  {(load||!entered)&&<div className="loading"><div className="panel"><div className="eyebrow">HONG KONG CASE ARCHIVE</div><h1>CASE 001</h1><p>跑馬地／1974 · Environment Production Pass 04</p><div className="bar"><i/></div><button disabled={load} onClick={()=>{setEntered(true);setCinematic(true)}}>{load?'重建中…':'進入案件'}</button></div></div>}
  {complete&&<div className="complete"><div className="panel"><div className="eyebrow">CHAPTER 01 COMPLETE</div><h1>調查仍未結束</h1><p>你已確認紙盒曾被搬運，並把總站之後的確切路線保留為 Unknown。</p><button onClick={()=>setComplete(false)}>返回街道</button></div></div>}
  <Scene evening={evening} cinematic={cinematic} pos={pos} setPos={setPos} controls={controls} setNear={setNear}/>
  <section className="hud"><div className="eyebrow">HONG KONG CASE ARCHIVE</div><b>CASE 001 / 跑馬地 / 1974</b><p>{evening?'12/16 傍晚重建：確認最後可信位置':'12/17 現場：沿黃泥涌道調查紙盒現場'}</p><div className="progress"><i style={{width:Math.min(100,(clues.length/7)*100)+'%'}}/></div></section>
  <div className="tools"><button onClick={()=>{document.exitPointerLock?.();setBook(true)}}>案件簿</button>{first&&!evening&&<button onClick={()=>setEvening(true)}>傍晚重建</button>}</div>
  <div className="help">WASD 移動 · Shift 快走 · 滑鼠視角 · E 與附近人物對話</div><div className="cross"/>
  {cinematic&&<><div className="cinematic"><span/><span/></div><div className="cinematic-caption"><div className="eyebrow">HAPPY VALLEY / 1974</div><strong>黃泥涌道重建層</strong><button onClick={()=>setCinematic(false)}>略過鏡頭</button></div></>}
  {near&&!talk&&!cinematic&&<button className="talk" onClick={()=>{document.exitPointerLock?.();setTalk(near)}}>與 {NPCS[near].name} 對話</button>}
  {nearEvidence&&!evening&&!cinematic&&<button className="prompt" onClick={()=>add('box')}>{has('box')?'✓ 已記錄紙盒':'檢查紙盒'}</button>}
  {talk&&<div className="dialog"><div className="eyebrow">{NPCS[talk].name}</div><p>{NPCS[talk].text}</p><button onClick={()=>{add(NPCS[talk].clue);setTalk(null)}}>記錄口供</button></div>}
  {evening&&<div className="recon"><b>RECONSTRUCTION / 1974-12-16</b><button onClick={()=>add('tram')}>{has('tram')?'✓ 電車總站節點':'確認電車總站節點'}</button><button onClick={()=>add('gap')}>{has('gap')?'✓ Unknown 路段':'標示總站後 Unknown'}</button></div>}
  {book&&<div className="modal"><div className="panel case"><header><div><div className="eyebrow">CASEBOOK</div><h2>跑馬地檔案：紙盒</h2></div><button onClick={()=>setBook(false)}>關閉</button></header><div className="row"><button className={has('identity')?'ok':''} onClick={()=>add('identity')}>D01 身份／失蹤紀錄</button><button className={has('contact')?'ok':''} onClick={()=>add('contact')}>D02 最後聯絡</button></div><h3>已記錄線索</h3><ul>{clues.map(x=><li key={x}>{x}</li>)}</ul><h3>第一推理</h3><p>紙盒曾被搬運，而棄置時間／方式仍需調查。</p><button className={first?'ok':''} disabled={!first}>工作假說 {first?'已成立':'未解鎖'}</button><h3>第二推理</h3><p>電車總站附近可作最後可信空間節點；之後應保留為 Unknown。</p><button className={second?'ok':''} disabled={!second} onClick={()=>{setBook(false);setComplete(true)}}>提交第二推理</button></div></div>}
 </main>
}
ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
