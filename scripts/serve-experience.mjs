// No dependencies, no build: serves the exact files in public at / or a subpath.
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve('public');
const port=Number(process.env.PORT||4173);
const prefix=process.env.BASE_PATH||'';
const types={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2'};
http.createServer(async(req,res)=>{
  try{
    const url=new URL(req.url,'http://localhost');
    let pathname=decodeURIComponent(url.pathname);
    if(prefix&&pathname===prefix){res.writeHead(308,{Location:prefix+'/'});res.end();return;}
    if(prefix&&!pathname.startsWith(prefix+'/'))throw new Error('Outside base path');
    pathname=pathname.slice(prefix.length);
    const file=path.resolve(root,'.'+pathname+(pathname.endsWith('/')?'index.html':''));
    if(!file.startsWith(root+path.sep))throw new Error('Outside public root');
    if(!(await stat(file)).isFile())throw new Error('Not a file');
    res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});
    res.end(req.method==='HEAD'?undefined:await readFile(file));
  }catch{res.writeHead(404,{'Content-Type':'text/plain'});res.end('Not found');}
}).listen(port,'127.0.0.1',()=>console.log(`Night walk: http://127.0.0.1:${port}${prefix}/`));
