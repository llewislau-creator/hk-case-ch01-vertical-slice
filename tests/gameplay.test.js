import test from 'node:test';
import assert from 'node:assert/strict';
import {closestNpc,distance3,isEvidenceNearby,validPosition} from '../app/src/gameplay.js';
const npc={a:{p:{x:0,y:1,z:0}},b:{p:{x:3,y:1,z:0}}};
test('nearest NPC chosen deterministically',()=>{assert.equal(closestNpc(2.9,1,0,npc,3.2),'b');assert.equal(closestNpc(100,1,0,npc,3.2),null)});
test('evidence radius is strict',()=>{const e={x:0,y:0,z:0};assert.equal(isEvidenceNearby(3,0,0,e,3.1),true);assert.equal(isEvidenceNearby(3.1,0,0,e,3.1),false)});
test('three-dimensional distance is used',()=>{assert.equal(distance3(0,3,4,{x:0,y:0,z:0}),5)});
test('reject invalid saved positions',()=>{assert.equal(validPosition([1,2,3]),true);assert.equal(validPosition([1,2]),false);assert.equal(validPosition([1,Infinity,3]),false)});
