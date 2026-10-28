import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
process.env.EDITOR_TEST='1';process.env.EDITOR_PORT='5191';
const {validate,server}=await import('./server.mjs');
const data=()=>Object.fromEntries(['en','zh'].map(l=>[l,JSON.parse(readFileSync('content/'+l+'.json','utf8'))]));
test('rejects incomplete and unsafe imported content',()=>{assert.doesNotThrow(()=>validate(data()));assert.throws(()=>validate({en:{}}));const c=data();c.zh.projects[0].url='javascript:alert(1)';assert.throws(()=>validate(c));});
test('local editor rejects foreign origins and unauthenticated writes',async()=>{await new Promise(r=>server.listen(5191,'127.0.0.1',r));try{let r=await fetch('http://127.0.0.1:5191/api/save',{method:'POST',body:'{}'});assert.equal(r.status,403);r=await fetch('http://127.0.0.1:5191/',{headers:{Origin:'https://example.com'}});assert.equal(r.status,403);r=await fetch('http://127.0.0.1:5191/');assert.equal(r.status,200);assert.ok((await r.text()).includes('我的履歷工作室'));}finally{await new Promise(r=>server.close(r));}});

