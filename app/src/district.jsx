import React,{useEffect,useRef,useState,useMemo} from 'react';
import ReactDOM from 'react-dom/client';
import {Canvas,useFrame} from '@react-three/fiber';
import {Physics,RigidBody,CapsuleCollider,CuboidCollider} from '@react-three/rapier';
import * as THREE from 'three';
import {BOUNDS,SHOPS,ROOFS,ALLEYS,BRIDGES,STAIRS,SPAWN,EVIDENCE,NPC_ROUTES,
 canStep,nearby,cameraBoom,makeStairPath,pathSample} from './district-nav.mjs';
import './district.css';

// ENGINE INTEGRATION: React Three Fiber + Rapier, separate from the original CASE 001.
const BLOCK='#9aa7aa',ACCENT='#ccad7b';
function Cube({at,size,color=BLOCK,block=false,wireframe=false}){
 const mesh=<mesh castShadow receiveShadow userData={{cameraOccluder:block}}>
   <boxGeometry args={size}/>
   <meshStandardMaterial color={color} wireframe={wireframe} roughness={1}/>
 </mesh>;
 return <group position={at}>{block?<RigidBody type="fixed" colliders={false}><CuboidCollider args={size.map(v=>v/2)}/>{mesh}</RigidBody>:mesh}</group>;
}
function Sign({at,color='#b27e5f'}){return <Cube at={at} size={[3,.36,.27]} color={color}/>}
function Shop({s,i}){
 const y=3.4,z=s.z,w=s.w;
 const left=s.door-.9-s.x,right=s.x+w-(s.door+.9);
 return <group>
  <Cube at={[s.x+w/2,.03,z+s.d/2]} size={[w,.1,s.d]} color="#e1d9c6"/>
  <Cube at={[s.x+.14,y/2,z+s.d/2]} size={[.28,y,s.d]} color="#a4aeb2" block/>
  <Cube at={[s.x+w-.14,y/2,z+s.d/2]} size={[.28,y,s.d]} color="#a4aeb2" block/>
  <Cube at={[s.x+w/2,y/2,z+s.d-.14]} size={[w,y,.28]} color="#87939b" block/>
  {left>.2&&<Cube at={[s.x+left/2,y/2,z+.11]} size={[left,y,.22]} color="#c2a989" block/>}
  {right>.2&&<Cube at={[s.door+.9+right/2,y/2,z+.11]} size={[right,y,.22]} color="#c2a989" block/>}
  <Cube at={[s.door,3.16,z+.11]} size={[1.8,.48,.3]} color="#c2a989" block/>
  <Cube at={[s.x+w/2,8.0,z+s.d/2]} size={[w,9.1,s.d]} color={i%2?'#8d9aa3':'#a8b1ae'} />
  <Cube at={[s.x+w/2,12.85,z+s.d/2]} size={[w,.5,s.d]} color="#5c6770"/>
  {Array.from({length:Math.min(7,Math.floor(w/4.2))},(_,j)=>
   <Cube key={j} at={[s.x+2.6+j*4.3,7.6,z-.18]} size={[2.1,1.6,.2]} color="#435967"/>)}
  <Sign at={[s.door,3.7,z-.27]} color={i%2?'#798d84':'#b37b60'}/>
  {Array.from({length:3},(_,k)=><Cube key={k} at={[s.x+2.1+k*4, .45,z+7+k*3]} size={[1.15,.9,1.5]} color="#b49f81"/>)}
  {i===3&&<><Cube at={[118,1,75]} size={[3,1.8,1.6]} color="#7c8c95"/><Cube at={[123,1,74]} size={[2,2,1]} color="#65747e"/></>}
 </group>;
}
function Roof({r,i}){
 const cx=r.x+r.w/2,cz=r.z+r.d/2;
 const ringZ=[r.z+.12,r.z+r.d-.12];
 const segment=(side)=>{
  const edge=side===0?r.x+.12:r.x+r.w-.12;
  const open=(i===0&&side===1)||(i===1)||(i===2&&side===0);
  if(!open)return <Cube key={'side'+side} at={[edge,16.66,cz]} size={[.25,1.32,r.d]} color="#57737d" block/>;
  return <React.Fragment key={'side'+side}>
   <Cube at={[edge,16.66,(r.z+109.15)/2]} size={[.25,1.32,109.15-r.z]} color="#57737d" block/>
   <Cube at={[edge,16.66,(111.05+r.z+r.d)/2]} size={[.25,1.32,r.z+r.d-111.05]} color="#57737d" block/>
  </React.Fragment>;
 };
 return <group>
  <Cube at={[cx,15.88,cz]} size={[r.w,.25,r.d]} color="#c5d3d2" block/>
  {Array.from({length:5},(_,f)=>f===0?null:<Cube key={f} at={[cx,f*3.2,cz]} size={[r.w,.13,r.d]} color="#73868e"/>)}
  {Array.from({length:5},(_,f)=><React.Fragment key={f}>
   <Cube at={[r.x+.1,f*3.2+1.55,cz]} size={[.2,3.0,r.d]} color="#9eb0b6" block/>
   <Cube at={[r.x+r.w-.1,f*3.2+1.55,cz]} size={[.2,3.0,r.d]} color="#9eb0b6" block/>
   <Cube at={[cx,f*3.2+1.55,r.z+r.d-.1]} size={[r.w,3.0,.2]} color="#879da5" block/>
  </React.Fragment>)}
  {ringZ.map((z,k)=><Cube key={k} at={[cx,16.66,z]} size={[r.w,1.32,.25]} color="#57737d" block/>)}
  {segment(0)}{segment(1)}
  {Array.from({length:5},(_,j)=><Cube key={'prop'+j} at={[r.x+3+j*3.8,16.35,r.z+14+(j%2)*6]} size={[1.2,.7,1.5]} color={j%2?'#b6a582':'#82979e'}/>)}
  {i===2&&<Cube at={[168,17,121]} size={[4,2.0,4]} color="#a88b65" block/>}
 </group>;
}
function StairVisual({s}){
 const points=makeStairPath(s);
 return <group>
  <Cube at={[s.x,8,s.z+3]} size={[.2,16,7]} color="#697b88"/>
  <Cube at={[s.x-3,8,s.z+3]} size={[.2,16,7]} color="#697b88"/>
  <Cube at={[s.x+3,8,s.z+3]} size={[.2,16,7]} color="#697b88"/>
  {Array.from({length:5},(_,f)=>Array.from({length:20},(_,j)=><Cube key={f+'-'+j} at={[
    s.x+(j<10?-1.5:1.5),
    f*3.2+(j+1)*.16-.07,
    s.z+2+(j<10?j:19-j)*.31
   ]} size={[1.4,.14,.31]} color="#c6ae88" />))}
  {points.filter((p,i)=>i%5===0).map((p,i)=><Cube key={i} at={p} size={[.2,.22,.2]} color="#f2c782"/>)}
 </group>;
}
function Street(){
 return <group>
  <Cube at={[90,-.38,70]} size={[180,.7,140]} color="#83918e" block/>
  <Cube at={[90,-.08,44]} size={[180,.16,24]} color="#5c6873" block/>
  <Cube at={[90,.01,29]} size={[180,.1,6]} color="#c7bda8" block/>
  <Cube at={[90,.01,59]} size={[180,.1,6]} color="#c7bda8" block/>
  <Cube at={[90,.01,90.5]} size={[180,.1,9]} color="#c7bda8" block/>
  {[40.7,44.4].map(z=><Cube key={z} at={[90,.09,z]} size={[179,.1,.15]} color="#b8c0bb"/>)}
  {Array.from({length:13},(_,i)=><Cube key={'post'+i} at={[10+i*13,1.05,56.4]} size={[.14,2.1,.14]} color="#60727d"/>)}
  {Array.from({length:6},(_,i)=><Cube key={'road'+i} at={[49,.018,33+i*4]} size={[3,.03,1]} color="#ddd7bf"/>)}
  <Cube at={[EVIDENCE.x,.53,EVIDENCE.z]} size={[1.4,1.06,1]} color="#cf9273"/>
  {SHOPS.map((s,i)=><Shop key={s.id} s={s} i={i}/>)}
  {ALLEYS.map((a,i)=><React.Fragment key={a.id}>
   <Cube at={[a.x+a.w/2,.045,a.z+a.d/2]} size={[a.w,.09,a.d]} color="#d1c4ae" block/>
   <Cube at={[a.x+.65,.68,a.z+12]} size={[1.2,1.3,1.1]} color="#8c9595"/>
   <Cube at={[a.x+a.w-.5,.8,a.z+22]} size={[1,1.6,1]} color="#7b898c"/>
  </React.Fragment>)}
  {ROOFS.map((r,i)=><Roof key={r.id} r={r} i={i}/>)}
  {BRIDGES.map(b=><React.Fragment key={b.id}>
   <Cube at={[b.x+b.w/2,15.94,b.z+b.d/2]} size={[b.w,.22,b.d]} color="#e8d4a4" block/>
   {[0,1].map(i=><Cube key={i} at={[b.x+b.w/2,16.55,b.z+(i?b.d-.08:.08)]} size={[b.w,1.1,.16]} color="#63867e" block/>)}
  </React.Fragment>)}
  {STAIRS.map(s=><StairVisual key={s.id} s={s}/>)}
 </group>;
}
function NPC({route,index}){
 const group=useRef(),points=route.points;
 useFrame(({clock})=>{
  if(!group.current)return;
  const t=clock.elapsedTime*(route.id==='FB'?.11:.18)+index;
  const a=points[Math.floor(t)%points.length],b=points[(Math.floor(t)+1)%points.length],f=t%1;
  group.current.position.set(a[0]+(b[0]-a[0])*f,a[2]+(b[2]-a[2])*f,a[1]+(b[1]-a[1])*f);
 });
 return <group ref={group}><Cube at={[0,.83,0]} size={[.52,1.14,.39]} color={index%2?'#c09d72':'#83a0a2'}/>
  <mesh position={[0,1.55,0]}><sphereGeometry args={[.23,8,8]}/><meshStandardMaterial color="#e4c6a2"/></mesh></group>;
}
function Avatar({stateRef}){
 const group=useRef();
 useFrame(()=>{if(group.current){const p=stateRef.current;group.current.position.set(p.x,p.y,p.z);group.current.rotation.y=p.yaw;}});
 return <group ref={group}>
  <Cube at={[0,.92,0]} size={[.68,1.03,.42]} color="#d4bea2"/>
  <Cube at={[-.2,.30,0]} size={[.22,.59,.26]} color="#4d6477"/>
  <Cube at={[.2,.30,0]} size={[.22,.59,.26]} color="#4d6477"/>
  <mesh position={[0,1.7,0]}><sphereGeometry args={[.24,10,8]}/><meshStandardMaterial color="#e2c5a2"/></mesh>
  <Cube at={[.36,1.1,-.05]} size={[.25,.4,.24]} color="#8c836f"/>
 </group>;
}
function Player({stateRef,keysRef,onState,enabled,barrier,interactRef}){
 const body=useRef(),frameTime=useRef(0),heading=useRef(0),pitch=useRef(.15),lastBlockerCache=useRef(null);
 const camTarget=useMemo(()=>new THREE.Vector3(),[]),camGoal=useMemo(()=>new THREE.Vector3(),[]),
       ray=useMemo(()=>new THREE.Raycaster(),[]);
 useEffect(()=>{
  const down=e=>{if(['KeyW','KeyA','KeyS','KeyD','ShiftLeft','KeyE','KeyR','KeyM'].includes(e.code))e.preventDefault();
   keysRef.current[e.code]=true;
   if(e.repeat)return;
   if(e.code==='KeyE')interactRef.current?.();
   if(e.code==='KeyR'){Object.assign(stateRef.current,{...SPAWN,mode:'ground',stair:null,t:0});}
   if(e.code==='KeyM')onState({minimapToggle:true});
  };
  const up=e=>{keysRef.current[e.code]=false;};
  const move=e=>{if(document.pointerLockElement){heading.current-=e.movementX*.0026;
    pitch.current=THREE.MathUtils.clamp(pitch.current-e.movementY*.002,-.45,.7);}};
  const blur=()=>{keysRef.current={}};
  window.addEventListener('keydown',down);window.addEventListener('keyup',up);
  window.addEventListener('mousemove',move);window.addEventListener('blur',blur);
  return()=>{window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);
   window.removeEventListener('mousemove',move);window.removeEventListener('blur',blur);};
 },[keysRef,interactRef,stateRef,onState]);
 useFrame(({camera,scene,clock},delta)=>{
  const p=stateRef.current,dt=Math.min(.04,delta);
  const k=keysRef.current;
  if(enabled){
   heading.current+=(Number(!!k.TurnRight)-Number(!!k.TurnLeft))*dt*1.75;
   const forward=Number(!!k.KeyW)-Number(!!k.KeyS);
   if(p.mode==='stair'&&p.stair){
    p.t=Math.max(0,Math.min(1,p.t+forward*dt*(k.ShiftLeft?.105:.066)));
    const st=STAIRS.find(s=>s.id===p.stair);Object.assign(p,pathSample(makeStairPath(st),p.t));
    if(p.t>=1){Object.assign(p,{x:st.roofX,z:st.roofZ,y:16,mode:'roof',stair:null,t:0});}
    else if(p.t<=0&&forward<0){Object.assign(p,{x:st.x,z:st.z,y:0,mode:'ground',stair:null,t:0});}
   }else{
    const sideways=Number(!!k.KeyD)-Number(!!k.KeyA),speed=(k.ShiftLeft?6.5:3.8)*dt,
      n=Math.hypot(forward,sideways)||1;
    const dx=(Math.sin(heading.current)*forward+Math.cos(heading.current)*sideways)/n*speed,
      dz=(Math.cos(heading.current)*forward-Math.sin(heading.current)*sideways)/n*speed;
    if(forward||sideways)Object.assign(p,canStep(p,dx,dz,p.mode,barrier));
    p.y=p.mode==='roof'?16:0;
   }
  }
  p.yaw=heading.current;
  body.current?.setNextKinematicTranslation({x:p.x,y:p.y+.92,z:p.z});
  const boom=cameraBoom(p,p.mode);
  camTarget.set(p.x,p.y+1.38,p.z);
  camGoal.set(p.x-Math.sin(heading.current)*boom,p.y+1.65+boom*(.28+pitch.current*.27),p.z-Math.cos(heading.current)*boom);
  if(lastBlockerCache.current===null){const mesh=[];scene.traverse(o=>{if(o.isMesh&&o.userData?.cameraOccluder)mesh.push(o);});lastBlockerCache.current=mesh;}
  const dir=camGoal.clone().sub(camTarget),len=dir.length();ray.set(camTarget,dir.normalize());ray.far=len;
  const hits=ray.intersectObjects(lastBlockerCache.current,false);if(hits.length&&hits[0].distance<len)camGoal.copy(camTarget).addScaledVector(dir,Math.max(.5,hits[0].distance-.28));
  camera.position.lerp(camGoal,Math.min(1,dt*10));camera.lookAt(camTarget);
  frameTime.current+=dt;if(frameTime.current>.16){onState({position:{...p},nearby:nearby(p,p.mode),fps:delta>0?Math.round(1/delta):0});frameTime.current=0;}
 });
 return <><RigidBody ref={body} type="kinematicPosition" colliders={false} enabledRotations={[false,false,false]}
  position={[SPAWN.x,SPAWN.y+.92,SPAWN.z]}>
  <CapsuleCollider args={[.56,.33]}/>
 </RigidBody><Avatar stateRef={stateRef}/></>;
}
function MiniMap({position,barrier}){
 const scaleX=x=>x/180*300,scaleY=z=>220-z/140*215;
 return <svg viewBox="0 0 300 220" className="mini" aria-label="街區地圖">
  <rect width="300" height="220" fill="#263741"/>
  <rect x="0" y={scaleY(56)} width="300" height={24/140*215} fill="#54646d"/>
  <rect x="0" y={scaleY(62)} width="300" height={6/140*215} fill="#b5afa0"/>
  <rect x="0" y={scaleY(95)} width="300" height={9/140*215} fill="#a2a69b"/>
  {SHOPS.map(s=><rect key={s.id} x={scaleX(s.x)} y={scaleY(s.z+s.d)} width={scaleX(s.w)} height={s.d/140*215} fill="#b7a184"/>)}
  {ROOFS.map(r=><rect key={r.id} x={scaleX(r.x)} y={scaleY(r.z+r.d)} width={scaleX(r.w)} height={r.d/140*215} fill="#7fa6af"/>)}
  {ALLEYS.map(a=><rect key={a.id} x={scaleX(a.x)} y={scaleY(a.z+a.d)} width={scaleX(a.w)} height={a.d/140*215} fill="#e6cfa0"/>)}
  {BRIDGES.map(b=><rect key={b.id} x={scaleX(b.x)} y={scaleY(b.z+b.d)} width={scaleX(b.w)} height={b.d/140*215} fill="#ded9a2"/>)}
  {barrier&&<rect x={scaleX(63)} y={scaleY(62)} width={scaleX(12)} height={5/140*215} fill="#dd6b61"/>}
  <circle cx={scaleX(position.x)} cy={scaleY(position.z)} r="5" fill="#80ead5" stroke="#162a2d" strokeWidth="2"/>
  <text x="273" y="17" fill="#e6e5db" fontSize="12" fontWeight="bold">N ↑</text>
 </svg>;
}
function UI(){
 const p=useRef({...SPAWN,mode:'ground',yaw:0,stair:null,t:0}),
 keys=useRef({}),interactRef=useRef(null);
 const [started,setStarted]=useState(false),[book,setBook]=useState(false),[barrier,setBarrier]=useState(false),
 [debug,setDebug]=useState(false),[mapOn,setMapOn]=useState(true),
 [info,setInfo]=useState({position:{...SPAWN},nearby:null,fps:0}),
 [visited,setVisited]=useState([]),[toast,setToast]=useState(''),[bookNote,setBookNote]=useState('');
 const timer=useRef(null);
 function notify(t){setToast(t);clearTimeout(timer.current);timer.current=setTimeout(()=>setToast(''),3500);}
 const onState=React.useCallback(o=>{
   if(o.minimapToggle){setMapOn(v=>!v);return;}
   setInfo(v=>({...v,...o}));
 },[]);
 function interact(){
  const q=nearby(p.current,p.current.mode);
  if(!q){notify('附近沒有可互動物件');return;}
  if(q.kind==='stair'){
    const st=q.id.replace('-RF','');p.current.mode='stair';p.current.stair=st;p.current.t=q.id.includes('-RF')?1:0;
    notify('樓梯導引模式：按 W 上樓，S 下樓');return;
  }
  setVisited(v=>v.includes(q.id)?v:[...v,q.id]);
  if(q.kind==='evidence')setBookNote('觀察紙盒位置及包裝，不能單憑外觀指認任何人物。');
  notify('已紀錄 '+q.name+' · '+q.id);
 }
 interactRef.current=interact;
 const blocks=debug;
 const shown=info.position;
 return <main className="district-shell">
  <Canvas shadows dpr={[1,1.5]} gl={{antialias:true,powerPreference:'high-performance'}}
    camera={{position:[50,4,52],fov:62,near:.12,far:270}}
    onPointerDown={e=>{if(started&&!book&&e.pointerType!=='touch')e.target?.requestPointerLock?.();}}>
   <color attach="background" args={['#a7c2cd']}/><fog attach="fog" args={['#a7c2cd',80,220]}/>
   <hemisphereLight args={['#f8f0d4','#748789',1.1]}/>
   <directionalLight castShadow position={[60,78,24]} intensity={2.1} shadow-mapSize-width={1024} shadow-mapSize-height={1024}/>
   <Physics gravity={[0,-9.81,0]}><Street/>
    {NPC_ROUTES.map((r,i)=><NPC key={r.id} route={r} index={i}/>)}
    {barrier&&<Cube at={[69,.5,57.2]} size={[12,1,.22]} color="#d36c57" block/>}
    <Player stateRef={p} keysRef={keys} onState={onState} enabled={started&&!book} barrier={barrier} interactRef={interactRef}/>
   </Physics>
  </Canvas>
  {!started&&<div className="d-modal d-welcome"><div className="d-card">
   <small>HONG KONG CRIME FILES — ENGINE TEST 02</small><h1>箱中無聲</h1><h2>1974 · 灰模城市探索</h2>
   <p>這是與既有案件試玩版並存的技術測試入口。建築物、NPC及樓梯都是白模；沒有預設唯一真相。</p>
   <button onClick={()=>setStarted(true)}>開始街區探索</button>
   <a href="./">返回原本案件試玩版</a>
  </div></div>}
  <div className="d-hud"><small>ENVIRONMENT PRODUCTION · PASS 02</small><strong>第一可玩街區</strong>
   <span>{shown.mode==='roof'?'RF +16m':shown.mode==='stair'?'STAIR '+shown.y.toFixed(1)+'m':'GROUND +0m'} | X{shown.x.toFixed(1)} Z{shown.z.toFixed(1)}</span>
   <span>{info.fps} FPS (instantaneous estimate)</span></div>
  <div className="d-tools"><button onClick={()=>setBook(true)}>探索紀錄 {visited.length}</button>
   <button onClick={()=>setBarrier(v=>!v)}>{barrier?'解除封鎖':'案件封鎖測試'}</button>
   <button onClick={()=>setDebug(v=>!v)}>{debug?'隱藏指南':'顯示指南'}</button>
   <a href="./">舊案件入口</a></div>
  {mapOn&&<aside className="d-map"><MiniMap position={shown} barrier={barrier}/><span>青色：玩家　米色：店舖　藍色：天台</span></aside>}
  {info.nearby&&started&&!book&&<button className="d-prompt" onClick={interact}>[ E ] {info.nearby.name}</button>}
  {toast&&<div className="d-toast" role="status">{toast}</div>}
  <div className="d-help">{shown.mode==='stair'?'W 上樓／S 下樓 · 導引樓梯': 'WASD 移動 · Shift 快走 · 滑鼠視角 · E 互動 · R 返回'}<br/>M 地圖 · 兩條後巷 → 雙樓梯 → 3天台 → 兩橋</div>
  {debug&&<div className="d-debug">目標：P0 (50,60) → A01 (96,90) → ST-W (107,94) → R01 / R02 / R03 → ST-E (168,105) → A02 (152,90)。<br/>通道目前以導引式梯間加矩形阻擋驗證，非NavMesh。</div>}
  <div className="d-touch"><button onPointerDown={()=>keys.current.KeyW=true} onPointerUp={()=>keys.current.KeyW=false}>↑</button>
   <button onPointerDown={()=>keys.current.KeyA=true} onPointerUp={()=>keys.current.KeyA=false}>←</button>
   <button onPointerDown={()=>keys.current.KeyS=true} onPointerUp={()=>keys.current.KeyS=false}>↓</button>
   <button onPointerDown={()=>keys.current.KeyD=true} onPointerUp={()=>keys.current.KeyD=false}>→</button>
   <button onPointerDown={()=>keys.current.TurnLeft=true} onPointerUp={()=>keys.current.TurnLeft=false}>↺</button>
   <button onPointerDown={()=>keys.current.TurnRight=true} onPointerUp={()=>keys.current.TurnRight=false}>↻</button>
   <button onClick={interact}>E</button></div>
  {book&&<div className="d-modal"><div className="d-card"><small>探索紀錄</small><h2>已發現區域與互動點</h2>
   <p>{visited.length?visited.join(' · '):'尚未紀錄互動點。'}</p><p>{bookNote||'記錄現場，不預設真兇與唯一答案。'}</p>
   <button onClick={()=>setBook(false)}>繼續探索</button></div></div>}
 </main>;
}
ReactDOM.createRoot(document.getElementById('root')).render(<UI/>);
