import {createServer} from 'node:http';
import {readFileSync,writeFileSync,mkdirSync,existsSync,cpSync,readdirSync,statSync} from 'node:fs';
import {resolve,dirname,join,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {randomBytes} from 'node:crypto';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
const run=promisify(execFile),root=resolve(dirname(fileURLToPath(import.meta.url)),'..');process.chdir(root);
const port=Number(process.env.EDITOR_PORT||5190),origin='http://127.0.0.1:'+port,token=randomBytes(32).toString('hex');
const repo='https://github.com/JasonHsiao8/jasonhsiao8.github.io.git',work=join(root,'.local'),checkout=join(work,'publish');
mkdirSync(work,{recursive:true});
const read=()=>Object.fromEntries(['en','zh'].map(l=>[l,JSON.parse(readFileSync('content/'+l+'.json','utf8'))]));
const baseline=join(work,'baseline.json');if(!existsSync(baseline))writeFileSync(baseline,JSON.stringify(read()));
let busy=false,job={state:'idle',message:'尚未發布'};
export function validate(data){for(const lang of ['en','zh']){const c=data?.[lang];if(c){c.graduateCourses??=[];c.undergraduateCourses??=[];c.copyrightName??='Chia-Hung Hsiao';}if(!c||typeof c!=='object')throw Error('請提供完整中英文資料');for(const k of ['name','role','location','email','about','photo','github','linkedin'])if(typeof c[k]!=='string'||c[k].length>30000)throw Error('欄位格式不正確：'+k);if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email))throw Error('Email 格式不正確');for(const k of ['photo','github','linkedin'])if(c[k]&&!/^https:\/\//.test(c[k])&&!(k==='photo'&&/^\/assets\/uploads\/[a-zA-Z0-9_.-]+$/.test(c[k])))throw Error('請使用 https 網址');for(const k of ['education','experience','projects','publications','awards','skills','leadership','graduateCourses','undergraduateCourses']){if(!Array.isArray(c[k])||c[k].length>200)throw Error('清單格式不正確');for(const item of c[k]){for(const key of ['title','subtitle','date','description','url'])if(typeof item[key]!=='string'||item[key].length>30000)throw Error('內容欄位格式不正確');if(item.url&&!/^https:\/\//.test(item.url))throw Error('連結必須以 https:// 開頭');}}}return data;}
async function build(){await run(process.execPath,['scripts/build.mjs'],{cwd:root});}
function backup(){writeFileSync(join(work,'backup-'+Date.now()+'.json'),JSON.stringify(read(),null,2));}
async function save(data){validate(data);backup();for(const l of ['en','zh'])writeFileSync('content/'+l+'.json',JSON.stringify(data[l],null,2)+'\n');await build();}
const git=(args,cwd=checkout)=>run('git',args,{cwd,windowsHide:true,timeout:180000,maxBuffer:2e6});
async function prepare(){if(!existsSync(join(checkout,'.git')))await git(['clone','--branch','main','--single-branch',repo,checkout],root);await git(['fetch','origin','main']);await git(['reset','--hard','origin/main']);}
async function remoteData(){return Object.fromEntries(await Promise.all(['en','zh'].map(async l=>[l,JSON.parse((await git(['show','origin/main:content/'+l+'.json'])).stdout)])));}
async function publish(){busy=true;job={state:'running',message:'正在檢查 GitHub 最新版本…'};try{await build();await prepare();const current=read(),remote=await remoteData(),base=JSON.parse(readFileSync(baseline));for(const l of ['en','zh'])if(JSON.stringify(remote[l])!==JSON.stringify(base[l])&&JSON.stringify(remote[l])!==JSON.stringify(current[l]))throw Error('GitHub 上的內容已被其他電腦更新。請先匯出本機備份，再按「載入 GitHub 最新資料」後整合修改。');
for(const p of ['content','assets','scripts','editor','admin','.github','package.json','.gitignore','README.md','啟動編輯器.cmd'])cpSync(join(root,p),join(checkout,p),{recursive:true});
await git(['add','--','content','assets','scripts','editor','admin','.github','package.json','.gitignore','README.md','啟動編輯器.cmd']);
const changed=(await git(['diff','--cached','--name-only'])).stdout.trim();if(!changed){job={state:'done',message:'內容與 GitHub 相同，無須重複發布。'};return;}
job={state:'running',message:'正在上傳。若出現 GitHub 登入視窗，請在該視窗完成登入。'};
await git(['-c','user.name=JasonHsiao8','-c','user.email=jasonhsiao2019@gmail.com','commit','-m','Update portfolio from local resume editor']);await git(['push','origin','HEAD:main']);writeFileSync(baseline,JSON.stringify(current));job={state:'done',message:'已上傳 GitHub，網站正在自動部署。可點「部署進度」確認完成。'};
}catch(e){job={state:'error',message:e.message.includes('GitHub 上')?e.message:'發布未完成；本機資料已保留。請確認網路、GitHub 登入及儲存庫寫入權限後重試。',detail:String(e.stderr||e.message).slice(0,1500).replace(/https:\/\/[^\s@]+@/g,'https://[hidden]@')};}finally{busy=false;}}
function send(res,status,data,type='application/json'){res.writeHead(status,{'Content-Type':type,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"frame-ancestors 'self'"});res.end(type==='application/json'?JSON.stringify(data):data);}
async function body(req){let text='';for await(const part of req){text+=part;if(text.length>4e6)throw Error('資料過大');}return JSON.parse(text);}
const server=createServer(async(req,res)=>{try{if(req.headers.host!=='127.0.0.1:'+port)return send(res,403,{error:'Host rejected'});if(req.headers.origin&&req.headers.origin!==origin)return send(res,403,{error:'Origin rejected'});if(req.headers['sec-fetch-site']==='cross-site')return send(res,403,{error:'Cross-site request rejected'});
const url=new URL(req.url,origin),path=url.pathname;
if(path.startsWith('/api/')){if(req.headers['x-editor-token']!==token)return send(res,403,{error:'請重新開啟編輯器'});
if(req.method==='GET'&&path==='/api/state')return send(res,200,{data:read(),job});
if(req.method!=='POST')return send(res,405,{error:'Method not allowed'});if(busy)return send(res,409,{error:'發布中，請稍候'});
if(path==='/api/save'){await save(await body(req));return send(res,200,{message:'草稿已儲存在此電腦，預覽已更新'});}
if(path==='/api/publish'){await save(await body(req));void publish();return send(res,202,{message:'開始發布'});}
if(path==='/api/sync'){busy=true;try{await prepare();const data=await remoteData();await save(data);writeFileSync(baseline,JSON.stringify(data));return send(res,200,{data});}finally{busy=false;}}
return send(res,404,{error:'Not found'});}
if(req.method!=='GET')return send(res,405,{});
if(path==='/'||path==='/editor/'){return send(res,200,readFileSync('editor/index.html','utf8').replace('__TOKEN__',token),'text/html; charset=utf-8');}
let base,relative;if(path.startsWith('/editor/')){base=join(root,'editor');relative=path.slice(8);}else if(path.startsWith('/preview/')){base=join(root,'dist');relative=decodeURIComponent(path.slice(9));}else return send(res,404,{});
let file=resolve(base,relative||'index.html');if(!file.startsWith(base+requireSeparator())&&file!==base)return send(res,403,{});if(existsSync(file)&&statSync(file).isDirectory())file=join(file,'index.html');if(!existsSync(file))return send(res,404,{});let content=readFileSync(file);const ext=extname(file);if(ext==='.html')content=content.toString().replace(/(href|src)="\/(?!\/)/g,'$1="/preview/');send(res,200,content,({'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp'})[ext]||'application/octet-stream');
}catch(e){send(res,400,{error:e.message});}});
function requireSeparator(){return process.platform==='win32'?'\\':'/';}
if(process.env.EDITOR_TEST!=='1'){await build();server.listen(port,'127.0.0.1',()=>console.log('中文履歷編輯器：'+origin));}
export {server};
