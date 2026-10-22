import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawn } from 'node:child_process';
import { once } from 'node:events';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const out=resolve(root,'exports');
await mkdir(out,{recursive:true});
const option=name=>{const i=process.argv.indexOf(name);return i<0?undefined:process.argv[i+1];};
const modulePath=option('--playwright')||process.env.PLAYWRIGHT_MODULE||'playwright';
const chromePath=option('--chrome')||process.env.CHROME_PATH;
const {chromium}=await import(modulePath);
const browser=await chromium.launch({headless:true,...(chromePath?{executablePath:chromePath}:{}),args:['--allow-file-access-from-files']});
const page=await browser.newPage({viewport:{width:1920,height:1200},deviceScaleFactor:1});
const errors=[];
page.on('pageerror',e=>{errors.push(String(e));console.error('Browser:',String(e));});
await page.goto(pathToFileURL(resolve(root,'index.html')).href+'?render=1');
await page.evaluate(()=>document.fonts.ready);
if(errors.length){await browser.close();throw new Error(errors.join('\n'));}
await page.waitForFunction(()=>typeof window.renderFrame==='function');
const render=async(t,type='jpeg')=>Buffer.from(await page.evaluate(({t,type})=>{
  window.renderFrame(t);
  return document.getElementById('film').toDataURL('image/'+type,.97).split(',')[1];
},{t,type}),'base64');

try{
  if(process.argv.includes('--stills')){
    const moments=[2.7,6.5,11.6,20,24.9,28.5,32,35.5,39,42.5,46.2,50,54.3,58.6];
    for(const t of moments){await writeFile(resolve(out,`frame-${String(t).replace('.','_')}.png`),await render(t,'png'));}
    console.log(JSON.stringify({stills:moments.length,errors,model:await page.evaluate(()=>({gapAt333:film.closing(333000),gapAt95:film.closing(95000)}))}));
    if(errors.length)process.exitCode=1;
  }else{
    const fps=Number(process.env.FPS||60),total=60*fps;
    const dest=resolve(out,'cuantas-y-como.mp4');
    const enc=spawn('ffmpeg',['-hide_banner','-loglevel','warning','-y','-f','image2pipe','-vcodec','mjpeg','-framerate',String(fps),'-i','pipe:0','-i',resolve(out,'banda-sonora.m4a'),'-map','0:v:0','-map','1:a:0','-c:v','libx264','-preset','medium','-crf','18','-pix_fmt','yuv420p','-c:a','copy','-t','60','-movflags','+faststart','-metadata','title=Cuántas. Y cómo. — Tres millones de viviendas','-metadata','comment=Animación y música originales. Datos: sección 3 de tresmillonesdeviviendas.es. Escenario ilustrativo del simulador.',dest],{stdio:['pipe','inherit','inherit']});
    const encoderDone=once(enc,'close');
    let pipeError;enc.stdin.on('error',e=>pipeError=e);
    for(let i=0;i<total;i++){
      if(pipeError)throw pipeError;
      const buf=await render(i/fps);
      if(!enc.stdin.write(buf))await once(enc.stdin,'drain');
      if(i%(fps*5)===0)console.log(`Rendered ${i/fps} / 60 seconds`);
    }
    enc.stdin.end();
    const [code]=await encoderDone;
    if(code!==0)throw new Error(`ffmpeg exited ${code}`);
    if(errors.length)throw new Error(errors.join('\n'));
    console.log('Completed:',dest);
  }
}finally{await browser.close();}
