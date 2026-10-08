import React,{useMemo} from 'react';
import {Text,useTexture} from '@react-three/drei';
import * as THREE from 'three';

const files={plaster:'plaster.svg',concrete:'concrete.svg',wood:'wood.svg',metal:'metal.svg',glass:'glass.svg',sign:'sign.svg',rust:'rust.svg',tile:'tile.svg'};

function Tex({kind,color='#fff',repeat=[1,1],roughness=.9,metalness=0,transparent=false,opacity=1,emissive,emissiveIntensity=0}){
  const base=useTexture('./textures/'+files[kind]);
  const map=useMemo(()=>{const t=base.clone();t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(repeat[0],repeat[1]);t.colorSpace=THREE.SRGBColorSpace;t.needsUpdate=true;return t},[base,repeat[0],repeat[1]]);
  return <meshStandardMaterial map={map} color={color} roughness={roughness} metalness={metalness} transparent={transparent} opacity={opacity} emissive={emissive} emissiveIntensity={emissiveIntensity}/>;
}
function Solid({color,roughness=.9,metalness=0,emissive,emissiveIntensity=0,transparent=false,opacity=1}){return <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} emissive={emissive} emissiveIntensity={emissiveIntensity} transparent={transparent} opacity={opacity}/>}

function AC({x,y,z}){
  return <group position={[x,y,z]}>
    <mesh castShadow><boxGeometry args={[1.05,.55,.42]}/><Tex kind="metal" color="#b8b3a5" repeat={[2,1]} roughness={.72} metalness={.12}/></mesh>
    {[-.28,0,.28].map((dx,i)=><mesh key={i} position={[dx,0,-.225]}><boxGeometry args={[.04,.34,.025]}/><Solid color="#5f615e" roughness={.65} metalness={.35}/></mesh>)}
    <mesh position={[.46,-.18,.18]} rotation={[0,0,.7]}><cylinderGeometry args={[.025,.025,.9,8]}/><Solid color="#6b6258" roughness={.85}/></mesh>
  </group>
}

function WindowBay({x,y,z,lit=false}){
  return <group position={[x,y,z]}>
    <mesh castShadow><boxGeometry args={[2.25,2.2,.16]}/><Tex kind="wood" color="#5d4b3e" repeat={[2,2]} roughness={.86}/></mesh>
    <mesh position={[0,0,.1]}><boxGeometry args={[1.78,1.72,.045]}/><Tex kind="glass" color={lit?'#d8caa8':'#a8bcc4'} roughness={.08} metalness={.08} transparent opacity={.55} emissive={lit?'#8c5d2d':undefined} emissiveIntensity={lit ? .16 : 0}/></mesh>
    <mesh position={[0,0,.14]}><boxGeometry args={[.055,1.72,.03]}/><Solid color="#776756" roughness={.7}/></mesh>
    <mesh position={[0,0,.14]}><boxGeometry args={[1.78,.055,.03]}/><Solid color="#776756" roughness={.7}/></mesh>
  </group>
}

export default function HeroBuilding({position=[57.8,0,14],evening=false}){
  return <group position={position}>
    <mesh castShadow receiveShadow position={[0,5,0]}><boxGeometry args={[12.8,10,15.2]}/><Tex kind="plaster" color="#b6a28a" repeat={[3,3]} roughness={.96}/></mesh>
    <mesh castShadow position={[0,10.35,0]}><boxGeometry args={[13.2,.45,15.6]}/><Tex kind="concrete" color="#776b5e" repeat={[4,4]} roughness={.98}/></mesh>

    <mesh castShadow receiveShadow position={[0,1.55,-7.72]}><boxGeometry args={[12.2,3.1,.28]}/><Tex kind="tile" color="#b9ad97" repeat={[7,2]} roughness={.9}/></mesh>
    <mesh castShadow position={[0,3.38,-7.94]}><boxGeometry args={[10.8,1.02,.34]}/><Tex kind="sign" color="#5f4939" repeat={[4,1]} roughness={.78}/></mesh>
    <Text position={[0,3.4,-8.14]} fontSize={.52} color="#f2ddb0" anchorX="center" anchorY="middle">南華布行</Text>
    <Text position={[0,2.9,-8.14]} fontSize={.14} color="#d8c79e" anchorX="center">NAM WAH CLOTH MERCHANT</Text>

    <mesh castShadow position={[0,3.95,-8.65]} rotation={[.12,0,0]}><boxGeometry args={[11.8,.16,2.6]}/><Tex kind="metal" color="#6a7780" repeat={[5,1]} roughness={.68} metalness={.18}/></mesh>
    {[[-4.15,-7.9],[-1.35,-7.9],[1.45,-7.9],[4.2,-7.9]].map((p,i)=><mesh key={i} castShadow position={[p[0],1.25,p[1]]}><boxGeometry args={[2.25,2.25,.18]}/><Tex kind={i===0?'wood':'glass'} color={i===0?'#69513e':'#c9d5d8'} repeat={[2,2]} roughness={i===0?.86:.08} metalness={i===0?0:.08} transparent={i!==0} opacity={i===0?1:.56}/></mesh>)}

    <mesh castShadow position={[-4.15,1.25,-8.03]}><boxGeometry args={[1.45,2.02,.08]}/><Tex kind="metal" color="#555551" repeat={[5,4]} roughness={.72} metalness={.28}/></mesh>
    {[-4.62,-4.38,-4.14,-3.9,-3.66].map((x,i)=><mesh key={i} position={[x,1.25,-8.09]}><boxGeometry args={[.045,1.95,.04]}/><Tex kind="rust" color="#6d5848" repeat={[1,5]} roughness={.82} metalness={.18}/></mesh>)}

    {[-3.4,0,3.4].map((x,i)=><WindowBay key={'w1'+i} x={x} y={6.15} z={-7.68} lit={evening&&i===1}/>)}
    {[-3.4,0,3.4].map((x,i)=><WindowBay key={'w2'+i} x={x} y={8.65} z={-7.68} lit={evening&&i===2}/>)}
    <AC x={4.7} y={6.1} z={-7.92}/><AC x={-4.75} y={8.6} z={-7.92}/>

    <mesh castShadow position={[6.48,6.2,-5.2]}><cylinderGeometry args={[.08,.1,7.4,10]}/><Tex kind="rust" color="#6e5b4b" repeat={[1,10]} roughness={.88} metalness={.16}/></mesh>
    <mesh castShadow position={[6.48,9.0,-5.2]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.08,.08,2.2,10]}/><Tex kind="rust" color="#6e5b4b" repeat={[1,5]} roughness={.88} metalness={.16}/></mesh>

    <group position={[4.85,11.15,1.8]}><mesh castShadow><cylinderGeometry args={[.55,.62,1.2,18]}/><Tex kind="metal" color="#635950" repeat={[2,2]} roughness={.82} metalness={.1}/></mesh><mesh castShadow position={[0,-.76,0]}><boxGeometry args={[1.15,.18,1.15]}/><Tex kind="rust" color="#66564a" repeat={[2,1]} roughness={.9} metalness={.12}/></mesh></group>
    <group position={[-3.9,10.95,-2.2]}><mesh castShadow position={[0,.35,0]}><boxGeometry args={[1.5,.7,1.1]}/><Tex kind="metal" color="#81786e" repeat={[3,2]} roughness={.82} metalness={.12}/></mesh><mesh castShadow position={[0,1.02,0]}><boxGeometry args={[.18,.9,.18]}/><Tex kind="rust" color="#5e5145" repeat={[1,3]} roughness={.86} metalness={.16}/></mesh></group>

    <mesh castShadow position={[-6.65,5.6,-5.7]}><boxGeometry args={[.22,3.5,1.25]}/><Tex kind="sign" color="#35566a" repeat={[1,3]} roughness={.72}/></mesh>
    <Text position={[-6.78,5.6,-5.7]} rotation={[0,-Math.PI/2,0]} fontSize={.24} color="#f1ddb0" anchorX="center">布行</Text>

    <mesh position={[1.4,.85,-8.0]}><boxGeometry args={[4.9,1.55,.04]}/><Tex kind="glass" color="#d6ddd8" roughness={.07} metalness={.05} transparent opacity={.42} emissive={evening?'#8e5a2d':undefined} emissiveIntensity={evening ? .23 : 0}/></mesh>
    {evening&&<pointLight position={[1.4,1.8,-6.6]} intensity={.55} distance={11} color="#d99b57"/>}
  </group>
}
