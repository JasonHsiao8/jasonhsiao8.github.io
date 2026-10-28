import {readFileSync,writeFileSync} from 'node:fs';
for(const lang of ['en','zh']){let p='content/'+lang+'.json',c=JSON.parse(readFileSync(p,'utf8'));delete c.heroEyebrow;delete c.heroTitle;c.photo='https://github.com/JasonHsiao8.png';writeFileSync(p,JSON.stringify(c,null,2)+'\n');}
let p='admin/config.yml',c=JSON.parse(readFileSync(p,'utf8'));for(const f of c.collections[0].files){f.fields=f.fields.filter(v=>!['heroEyebrow','heroTitle','interests'].includes(v.name));f.fields.splice(1,0,{name:'photo',label:'個人照片',widget:'image',required:true});}writeFileSync(p,JSON.stringify(c,null,2)+'\n');
