// 《箱中無聲》Pass 02 — measurable navigation rules, metres, X east / Z north.
// These are game-playable design boundaries, not historical surveying.
export const BOUNDS={width:180,depth:140,roofY:16};
export const SHOPS=[
{id:'B01',name:'南華布行',x:18,z:62,w:26,d:24,door:31},
{id:'B02',name:'昌記士多',x:46,z:62,w:18,d:24,door:55},
{id:'B03',name:'永興茶餐廳',x:66,z:62,w:25,d:24,door:80},
{id:'B04',name:'和昌電器',x:101,z:62,w:33,d:24,door:117},
{id:'B05',name:'唐樓入口',x:157,z:62,w:21,d:24,door:166}
];
export const ROOFS=[
{id:'R01',x:102,z:95,w:24,d:33,name:'西樓天台'},
{id:'R02',x:128,z:95,w:23,d:33,name:'中樓天台'},
{id:'R03',x:153,z:95,w:25,d:33,name:'福伯鴿舍'}
];
export const ALLEYS=[{id:'A01',x:93,z:62,w:6,d:33},{id:'A02',x:149,z:62,w:6,d:33}];
export const BRIDGES=[{id:'BR01',x:126,z:109.15,w:2,d:1.9},{id:'BR02',x:151,z:109.15,w:2,d:1.9}];
export const STAIRS=[{id:'ST-W',x:107,z:94,roofX:107,roofZ:105},{id:'ST-E',x:168,z:94,roofX:168,roofZ:105}];
export const SPAWN={x:50,y:0,z:60};
export const EVIDENCE={x:68,y:0,z:59.5,id:'E01'};
export const NPC_ROUTES=[
{id:'FJ',name:'芳姐',points:[[31,73,0],[31,63,0],[38,65,0]]},
{id:'CB',name:'昌伯',points:[[54,73,0],[54,64,0],[61,66,0]]},
{id:'ZY',name:'珍姨',points:[[27,59,0],[48,59,0],[71,59,0],[89,59,0]]},
{id:'AL',name:'阿良',points:[[55,61,0],[80,60,0],[96,78,0],[96,89,0]]},
{id:'LP',name:'蓮婆',points:[[107,99,6.4],[111,105,6.4]]},
{id:'FB',name:'福伯',points:[[166,118,16],[171,121,16],[163,114,16]]},
{id:'ALE',name:'阿樂',points:[[115,112,16],[125,110,16],[136,110,16],[150,110,16],[168,110,16]]}
];
const inRect=(x,z,r,pad=0)=>x>=r.x+pad&&x<=r.x+r.w-pad&&z>=r.z+pad&&z<=r.z+r.d-pad;
const between=(v,a,b)=>v>=a&&v<=b;
function onShopGate(x,z,prev,shop){
 const gate=0.91;
 if(prev && (prev.z<=62.15 && z>62.15 || prev.z>=62.15 && z<62.15))
   return Math.abs(x-shop.door)<=gate;
 if(prev && (prev.z<=85.85 && z>85.85 || prev.z>=85.85 && z<85.85))
   return Math.abs(x-(shop.x+shop.w/2))<=1.0;
 return true;
}
export function groundAllowed(x,z,prev=null,caseBarrier=false){
 if(!between(x,.4,179.6)||!between(z,25.9,95.2))return false;
 if(caseBarrier && between(x,63,75)&&between(z,56.9,62))return false;
 // Vehicle corridor: cross only via marked crossing points.
 if(z<56.1){
  if(z>=31.9 && (between(x,47,51)||between(x,135,139)))return true;
  return between(z,26,32);
 }
 if(between(z,56,62.14))return true;
 for(const a of ALLEYS)if(inRect(x,z,a,.20))return true;
 // Interior volumes have genuinely gated public and rear entrances.
 for(const s of SHOPS)if(inRect(x,z,s,.18)&&onShopGate(x,z,prev,s))return true;
 // Rear service lane. Wall crossing into it only from an alley or a shop rear door.
 if(between(z,85.86,95)&&between(x,18,178)){
  if(prev && prev.z<85.86){
   const shop=SHOPS.find(s=>between(prev.x,s.x+.18,s.x+s.w-.18)&&between(prev.z,62,86));
   if(shop && Math.abs(x-(shop.x+shop.w/2))>1.0)return false;
  }
  return true;
 }
 return false;
}
export function roofAllowed(x,z){
 for(const br of BRIDGES)if(x>=br.x-.35&&x<=br.x+br.w+.35&&z>=br.z-.15&&z<=br.z+br.d+.15)return true;
 for(const r of ROOFS){
  const bridgeMouth=between(z,109.30,110.95);
  if(inRect(x,z,r,bridgeMouth?.05:1.15))return true;
 }
 return false;
}
export const SQ=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
export function canStep(pos,dx,dz,mode='ground',barrier=false){
 const permitted=(x,z,prev)=>mode==='roof'?roofAllowed(x,z):groundAllowed(x,z,prev,barrier);
 // Substep prevents tunnelling through narrow gates at low frame-rates.
 const n=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.18));
 let x=pos.x,z=pos.z;
 for(let i=0;i<n;i++){
  const nx=x+dx/n,nz=z+dz/n;
  if(permitted(nx,z,{x,z}))x=nx;
  if(permitted(x,nz,{x,z}))z=nz;
 }
 return {x,z};
}
export function makeStairPath(stair){
 const pts=[[stair.x,0,stair.z]];
 for(let floor=0;floor<5;floor++){
  const y=floor*3.2;
  pts.push([stair.x-1.5,y,stair.z+3],[stair.x-1.5,y+1.6,stair.z+6],
  [stair.x+1.5,y+1.6,stair.z+6],[stair.x+1.5,y+3.2,stair.z+3],
  [stair.x,y+3.2,stair.z+3]);
 }
 pts.push([stair.roofX,16,stair.roofZ]);return pts;
}
export function pathSample(points,t){
 const lens=[];let total=0;
 for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],d=Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2]);lens.push(d);total+=d;}
 let remaining=Math.min(1,Math.max(0,t))*total;
 for(let i=0;i<lens.length;i++){if(remaining<=lens[i]||i===lens.length-1){const a=points[i],b=points[i+1],f=lens[i]?remaining/lens[i]:0;return{x:a[0]+(b[0]-a[0])*f,y:a[1]+(b[1]-a[1])*f,z:a[2]+(b[2]-a[2])*f};}remaining-=lens[i];}
 return{x:points.at(-1)[0],y:points.at(-1)[1],z:points.at(-1)[2]};
}
export function nearby(pos,mode){
 const opts=mode==='roof'
  ?STAIRS.map(st=>({id:st.id+'-RF',name:st.id==='ST-W'?'西梯下樓':'東梯下樓',x:st.roofX,y:16,z:st.roofZ,kind:'stair'}))
  :STAIRS.map(st=>({id:st.id,name:st.id==='ST-W'?'西梯上樓':'東梯上樓',x:st.x,y:0,z:st.z,kind:'stair'}));
 if(mode==='ground')opts.push({...EVID,kind:'evidence',name:'紙盒發現位置'});
 if(mode==='roof')opts.push({id:'I07',kind:'npc',name:'福伯鴿舍',x:169,y:16,z:119});
 const found=opts.map(o=>({...o,d:SQ(pos,o)})).sort((a,b)=>a.d-b.d)[0];
 return found&&found.d<3.5?found:null;
}
export function cameraBoom(pos,mode){
 if(mode==='stair')return 1.65;
 if(mode==='roof')return 4.9;
 if(ALLEYS.some(a=>inRect(pos.x,pos.z,a)))return 2.0;
 if(SHOPS.some(a=>inRect(pos.x,pos.z,a)))return 2.15;
 return 4.15;
}
