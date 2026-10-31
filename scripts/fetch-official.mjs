import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
const root = process.cwd();
const checkedOn = new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Bangkok',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
let mapImageSha256;
const pageUrl = 'https://khaokheow.zoothailand.or.th/map';
const base = 'https://api.zoothailand.or.th';
const headers = {Origin:'https://khaokheow.zoothailand.or.th',Referer:pageUrl};
async function request(url) { const r=await fetch(url,{headers,signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error(`${r.status} ${url}`);return r; }
const [maps,categories,positions] = await Promise.all(['map','mapCategory','mapPosition'].map(async endpoint=>(await request(`${base}/api/portal/${endpoint}?lang=th`)).json()));
await mkdir(path.join(root,'src/assets/official'),{recursive:true});
await mkdir(path.join(root,'src/data'),{recursive:true});
const downloaded=[];
async function download(asset,file,subject) {
 if(!asset?.path)throw Error('No image for '+subject);
 const sourceUrl=base+asset.path;const response=await request(sourceUrl);
 if(!response.headers.get('content-type')?.startsWith('image/'))throw Error('Not image: '+sourceUrl);
 const buffer=Buffer.from(await response.arrayBuffer());
 if(file==='zoo-map.webp')mapImageSha256=createHash('sha256').update(buffer).digest('hex');
 await writeFile(path.join(root,'src/assets/official',file),buffer);
 downloaded.push({file:'src/assets/official/'+file,sourceUrl,sourcePage:pageUrl,subject,originalName:asset.name,bytes:buffer.length,permission:'user_confirmed_zoo_permission_for_prototype',checkedOn});
 console.log(subject+': '+file+' ('+buffer.length+' bytes)');
}
await download(maps[0].image,'zoo-map.webp','แผนที่ปัจจุบันที่หน้าเว็บทางการเรียกใช้');
for(const [id,slug] of [[38,'giraffe'],[54,'elephant'],[41,'hippo'],[59,'penguin'],[60,'aviary'],[45,'capybara'],[10,'pygmy-hippo']]) {
 const point=positions.find(p=>p.id===id);if(!point)throw Error('Missing point '+id);
 await download(point.image,slug+path.extname(point.image.path),point.name);
}
await writeFile(path.join(root,'src/data/official-snapshot.json'),JSON.stringify({checkedOn,mapImageSha256,sourceUrl:pageUrl,mapApiUrl:base+'/api/portal/map?lang=th',positionApiUrl:base+'/api/portal/mapPosition?lang=th',categoryApiUrl:base+'/api/portal/mapCategory?lang=th',map:maps[0],categories,positions:positions.map(p=>({id:p.id,name:p.name,mapCategoryId:p.mapCategory_id,x:p.x,y:p.y,lat:p.lat,lng:p.lng})),assets:downloaded},null,2)+'\n');
console.log(`Saved ${positions.length} point records and ${categories.length} categories. No operational status imported.`);
