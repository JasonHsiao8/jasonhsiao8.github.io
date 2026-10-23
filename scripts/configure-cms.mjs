import {readFileSync,writeFileSync} from 'node:fs';
const [id,url]=process.argv.slice(2);
if(!id||!url)throw Error('Usage: node scripts/configure-cms.mjs <Turbo site ID> <https://username.github.io>');
const origin=new URL(url);if(origin.protocol!=='https:')throw Error('HTTPS required');
const config=JSON.parse(readFileSync('admin/config.yml','utf8'));config.backend.turbo_site_id=id;config.site_url=origin.href;config.display_url=origin.href;writeFileSync('admin/config.yml',JSON.stringify(config,null,2)+'\n');
console.log('CMS site connection configured. No credentials are stored in this config.');


