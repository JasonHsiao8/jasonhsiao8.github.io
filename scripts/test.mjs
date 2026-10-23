import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {render} from './build.mjs';
const en=JSON.parse(readFileSync('content/en.json','utf8'));
test('eight distinct pages preserve language and page navigation',()=>{for(const lang of ['en','zh'])for(const page of ['home','project','publication','experience']){const c=JSON.parse(readFileSync('content/'+lang+'.json','utf8')),html=render(c,lang,page),suffix=page==='home'?'':page+'/';assert.ok(html.includes('href="/zh/'+suffix+'"'));assert.ok(html.includes('href="/'+suffix+'"'));assert.ok(existsSync('dist/'+(lang==='zh'?'zh/':'')+suffix+'index.html'));assert.ok(!html.includes('Open Source'));if(page==='home')assert.ok(!html.includes('class="project"'));if(page==='project')assert.ok(!html.includes('class="portrait"'));}});
test('escapes text and rejects unsafe URLs',()=>{const c=structuredClone(en);c.about='<script>alert(1)</script>';assert.ok(render(c,'en').includes('&lt;script&gt;'));c.github='javascript:alert(1)';assert.throws(()=>render(c,'en'),/HTTPS/);});
test('Chinese CMS fields match content',()=>{const config=JSON.parse(readFileSync('admin/config.yml','utf8'));assert.equal(config.locale,'zh_Hant');for(const f of config.collections[0].files){const c=JSON.parse(readFileSync(f.file,'utf8'));for(const field of f.fields)assert.ok(field.name in c,field.name);}});
