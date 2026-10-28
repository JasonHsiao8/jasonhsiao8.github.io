import {spawn} from 'node:child_process';
import {openSync,readFileSync,mkdirSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),url='http://127.0.0.1:5190/';
async function ready(){try{const r=await fetch(url,{signal:AbortSignal.timeout(1000)});return r.ok&&(await r.text()).includes('name="editor-token"');}catch{return false;}}
if(!await ready()){
 mkdirSync(resolve(root,'.local'),{recursive:true});
 const log=openSync(resolve(root,'.local/server.log'),'a');
 const child=spawn(process.execPath,['editor/server.mjs'],{cwd:root,detached:true,windowsHide:true,stdio:['ignore',log,log]});child.unref();
 let ok=false;for(let i=0;i<40;i++){await new Promise(r=>setTimeout(r,250));if(await ready()){ok=true;break;}}
 if(!ok){console.error('Editor failed to start. See .local/server.log');process.exit(1);}
}
console.log('Editor ready: '+url);
if(!process.argv.includes('--no-browser')){
 const p=spawn('powershell.exe',['-NoProfile','-Command',"Start-Process 'http://127.0.0.1:5190/'"],{windowsHide:true,stdio:'ignore'});p.on('error',()=>console.log('Open '+url+' in your browser.'));
}
