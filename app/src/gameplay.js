export const distance3=(x,y,z,p)=>Math.hypot(x-p.x,y-p.y,z-p.z);
export const closestNpc=(x,y,z,npcs,radius)=>{
 let candidate=null,best=radius;
 for(const [id,npc] of Object.entries(npcs)){
  const distance=distance3(x,y,z,npc.p);
  if(distance<best){best=distance;candidate=id;}
 }
 return candidate;
};
export const isEvidenceNearby=(x,y,z,evidence,radius)=>distance3(x,y,z,evidence)<radius;
export const validPosition=(position)=>Array.isArray(position)&&position.length===3&&position.every(Number.isFinite);
