// CI browser smoke: built multi-page Vite game + original archive.
import {createServer} from 'node:http';
import {createReadStream,existsSync,mkdirSync} from 'node:fs';
import {resolve,extname,join,sep} from 'node:path';
import {chromium} from 'playwright-core';
const root=resolve('dist'),port=4179,host='127.0.0.1';
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.wasm':'application/wasm','.json':'application/json'};
const server=createServer((req,res)=>{
 const pathname=decodeURIComponent((req.url||'/').split('?')[0]);
 const full=resolve(root,'.'+pathname.replace(/\/$/,'/index.html'));
 if(!full.startsWith(root+sep)||!existsSync(full)){res.writeHead(404);res.end('not found');return;}
 res.setHeader('Content-Type',mime[extname(full)]||'application/octet-stream');createReadStream(full).pipe(res);
});
await new Promise(done=>server.listen(port,host,done));
let browser;
try{
 const exe=['/usr/bin/google-chrome','/usr/bin/chromium','/usr/bin/chromium-browser'].find(existsSync);
 if(!exe)throw Error('Chromium/Chrome binary not found in CI runner');
 browser=await chromium.launch({executablePath:exe,headless:true,args:[
  '--no-sandbox','--enable-webgl','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader',
  '--disable-dev-shm-usage'
 ]});
 const page=await browser.newPage({viewport:{width:1280,height:720},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url())});
 const url='http://'+host+':'+port;
 await page.goto(url+'/district.html',{waitUntil:'networkidle',timeout:30000});
 await page.waitForSelector('.d-welcome button',{timeout:15000});
 await page.locator('.d-welcome button').click();
 await page.waitForTimeout(2200);
 const before=await page.locator('.d-hud span').first().innerText();
 const gl=await page.evaluate(()=>{const c=document.querySelector('canvas');return !!c&&!!(c.getContext('webgl2')||c.getContext('webgl'))});
 if(!gl)throw Error('District WebGL context unavailable');
 await page.keyboard.down('w');await page.waitForTimeout(900);await page.keyboard.up('w');
 await page.waitForTimeout(400);
 const after=await page.locator('.d-hud span').first().innerText();
 if(before===after)throw Error('WASD movement did not update district HUD: '+before);
 mkdirSync('qa-screenshots',{recursive:true});
 await page.screenshot({path:'qa-screenshots/district.png'});
 const districtErrors=[...errors];if(districtErrors.length)throw Error('District browser errors: '+districtErrors.join(' | '));
 await page.goto(url+'/index.html',{waitUntil:'domcontentloaded',timeout:30000});
 await page.waitForSelector('canvas',{timeout:20000});
 await page.waitForTimeout(2000);
 if(errors.length>districtErrors.length)throw Error('Legacy app page errors: '+errors.slice(districtErrors.length).join(' | '));
 await page.screenshot({path:'qa-screenshots/legacy.png'});
 console.log(JSON.stringify({browser:'Chrome',districtWebGL:gl,movementBefore:before,movementAfter:after,
   originalCaseCanvas:true,screenshots:['district.png','legacy.png'],errors},null,2));
}finally{await browser?.close();await new Promise(done=>server.close(done));}
