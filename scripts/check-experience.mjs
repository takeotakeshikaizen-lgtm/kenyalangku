import {readFile,stat,readdir} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import vm from 'node:vm';
import path from 'node:path';
const root=path.resolve('public');
const html=await readFile(path.join(root,'index.html'),'utf8');
const importMap=JSON.parse(html.match(/<script type="importmap">([\s\S]*?)<\/script>/)[1]).imports;
let checks=0, inline=0;
for(const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)){
  if(/\bsrc=/.test(match[1]))continue;
  if(match[1].includes('importmap'))JSON.parse(match[2]);else new vm.Script(match[2]);
  inline++;
}
async function exists(relative,from){
  if(/^(#|https?:|mailto:|data:)/.test(relative))return;
  const file=path.resolve(path.dirname(from),relative.split(/[?#]/)[0]);
  if(!file.startsWith(root+path.sep))throw new Error(`Non-portable reference: ${relative}`);
  if(!(await stat(file)).isFile())throw new Error(`Missing file: ${file}`);checks++;
}
async function audit(file){
  const source=await readFile(file,'utf8');const extension=path.extname(file);
  if(extension==='.mjs'||extension==='.js'){
    const result=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});
    if(result.status!==0)throw new Error(result.stderr);
    for(const m of source.matchAll(/new URL\(\s*['"]([^'"]+)['"]\s*,\s*import\.meta\.url/g))await exists(m[1],file);
    for(const m of source.matchAll(/(?:from\s*|import\s*\(?\s*)['"]([^'"]+)['"]/g)){
      if(m[1]==='three')await exists(importMap.three,path.join(root,'index.html'));
      else if(m[1].startsWith('three/addons/'))await exists(importMap['three/addons/']+m[1].slice(13),path.join(root,'index.html'));
      else if(m[1].startsWith('.'))await exists(m[1],file);
    }
  }else if(extension==='.css'){
    for(const m of source.matchAll(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^)]*))\s*\)/g))await exists(m[1]||m[2]||m[3],file);
  }
}
async function walk(directory){for(const e of await readdir(directory,{withFileTypes:true})){const f=path.join(directory,e.name);if(e.isDirectory())await walk(f);else if(/\.(mjs|js|css)$/.test(f))await audit(f);}}
for(const m of html.matchAll(/(?:src|href)="([^"]+)"/g))await exists(m[1],path.join(root,'index.html'));
const ids=new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]));
for(const m of html.matchAll(/href="#([^"]+)"/g))if(!ids.has(m[1]))throw new Error(`Broken anchor: ${m[1]}`);
await walk(path.join(root,'night-walk'));
const bytes=(await Promise.all(['palace','garden','foreground'].map(n=>stat(path.join(root,'night-walk/assets',n+'.webp'))))).reduce((sum,f)=>sum+f.size,0);
console.log(`PASS: ${inline} inline script parsed; all local modules parse; ${checks} local asset/import references and all anchors resolve; cinematic WebP assets ${(bytes/1024/1024).toFixed(2)} MB.`);
