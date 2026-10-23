import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {render} from './build.mjs';
const en=JSON.parse(readFileSync('content/en.json','utf8'));
const zh=JSON.parse(readFileSync('content/zh.json','utf8'));
test('both languages expose experience navigation and language alternatives',()=>{for(const [lang,c] of [['en',en],['zh',zh]]){const html=render(c,lang);assert.match(html,/href="#experience"/);assert.match(html,/href=".\/index.html" lang="en"/);assert.match(html,/href=".\/zh.html" lang="zh-Hant"/);assert.match(html,/id="experience"/);assert.ok(!html.includes('Open Source'));}assert.match(render(zh,'zh'),/<html lang="zh-Hant">/);assert.match(render(en,'en'),/>Experience<\/a>/);});
test('content is escaped and executable URLs are rejected',()=>{const c=structuredClone(en);c.about='<script>alert(1)</script>';const html=render(c,'en');assert.ok(html.includes('&lt;script&gt;'));assert.ok(!html.includes('<script>alert'));c.github='javascript:alert(1)';assert.throws(()=>render(c,'en'),/HTTPS/);});
test('CMS exposes matching Chinese-labeled fields for both independent documents',()=>{const config=JSON.parse(readFileSync('admin/config.yml','utf8'));assert.equal(config.locale,'zh_Hant');assert.equal(config.backend.name,'turbo-github');assert.equal(config.collections[0].files.length,2);for(const f of config.collections[0].files){const data=JSON.parse(readFileSync(f.file,'utf8'));for(const field of f.fields)assert.ok(field.name in data,field.name);}});
test('site contains no ChatGPT login dependency',()=>{for(const [lang,c] of [['en',en],['zh',zh]])assert.ok(!render(c,lang).includes('signin-with-chatgpt'));});

