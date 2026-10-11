import test from 'node:test';import assert from 'node:assert/strict';
import {SPAWN,STAIRS,roofAllowed,groundAllowed,canStep,pathSample,makeStairPath,nearby,cameraBoom} from '../src/district-nav.mjs';
function walk(p,route,mode='ground',caseBarrier=false){let from={...p};for(const [x,z] of route){const dx=x-from.x,dz=z-from.z,n=Math.ceil(Math.hypot(dx,dz)/.045);for(let i=0;i<n;i++){const step=canStep(from,dx/n,dz/n,mode,caseBarrier);assert.ok(Math.hypot(step.x-(from.x+dx/n),step.z-(from.z+dz/n))<.09,'blocked at '+JSON.stringify(from));from={...from,...step};}}return from;}
test('P0 to West rear alley and stair door',()=>{const p=walk(SPAWN,[[96,60],[96,92],[107,92],[107,94]]);assert.ok(p.z>93.8)});
test('P0 enters South China fabric shop through its door',()=>{const p=walk(SPAWN,[[31,60],[31,62],[31,76]]);assert.ok(p.z>75.8)});
test('electrical appliance store usable interior',()=>{const p=walk({x:117,z:60},[[117,68],[117,75]]);assert.ok(p.z>74.8)});
test('East alley reaches East stair',()=>{const p=walk({x:107,z:60},[[152,60],[152,92],[168,92],[168,94]]);assert.ok(p.x>167.8)});
test('roof R01 => bridge 1 => R02 => bridge 2 => R03',()=>{const p=walk({x:107,y:16,z:105.3},[[107,110.1],[125.5,110.1],[128.5,110.1],[150.5,110.1],[153.5,110.1],[168,110.1],[168,105.3]],'roof');assert.ok(p.x>167.8)});
test('non-door shop facades block',()=>assert.equal(groundAllowed(25,62.3,{x:25,z:62.1}),false));
test('road crossing only at painted crossings',()=>{assert.equal(groundAllowed(65,50,{x:65,z:56.2}),false);assert.equal(groundAllowed(49,50,{x:49,z:56.2}),true)});
test('outside roof edges block',()=>assert.equal(roofAllowed(179,122),false));
test('case perimeter can be activated',()=>assert.equal(groundAllowed(68,59,{x:68,z:58.9},true),false));
test('stairs connect y=0 to y=16 without teleporting',()=>{for(const s of STAIRS){const path=makeStairPath(s);const a=pathSample(path,0),b=pathSample(path,1);assert.equal(a.y,0);assert.equal(b.y,16);for(let i=1;i<=100;i++){const p=pathSample(path,i/100);assert.ok(p.y>=-1e-8&&p.y<=16.00001)}}});
test('stair interaction uses correct level',()=>{assert.equal(nearby({x:107,y:0,z:94},'ground')?.id,'ST-W');assert.equal(nearby({x:168,y:16,z:105},'roof')?.id,'ST-E-RF')});
test('camera clamped inside smaller spaces',()=>{assert.ok(cameraBoom({x:117,z:75},'ground')<cameraBoom(SPAWN,'ground'));assert.ok(cameraBoom(SPAWN,'stair')<2)});
