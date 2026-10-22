/* Cuántas. Y cómo. Deterministic motion film · 1920 × 1080 · 60 seconds.
   All animation is a function of the supplied timestamp, for clean seeking
   and frame-accurate offline export. No network dependencies. */
(() => {
  'use strict';
  const canvas = document.getElementById('film');
  const c = canvas.getContext('2d', { alpha: false });
  const W = 1920, H = 1080;
  const C = { bg:'#070b0e', white:'#edf5ef', dim:'#82958f', grid:'#20332e', green:'#89ffcc', cover:'#cce4dc', cyan:'#74dce6', red:'#ff5d4d', amber:'#ffa679' };
  const SANS='"Helvetica Neue", Arial, sans-serif', MONO='Menlo, Consolas, monospace';
  const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
  const mix=(a,b,t)=>a+(b-a)*t;
  const smooth=t=>{t=clamp(t);return t*t*(3-2*t);};
  const out=t=>1-Math.pow(1-clamp(t),3);
  const back=t=>{t=clamp(t)-1;return 1+2.70158*t*t*t+1.70158*t*t;};
  const enter=(t,d=0,dur=.7)=>out((t-d)/dur);
  const frac=n=>n-Math.floor(n);
  const random=n=>frac(Math.sin(n*127.1+311.7)*43758.5453123);
  const num=n=>Math.round(n).toLocaleString('es-ES');
  const rgba=(hex,a)=>{const h=hex.slice(1);return `rgba(${parseInt(h.slice(0,2),16)},${parseInt(h.slice(2,4),16)},${parseInt(h.slice(4,6),16)},${a})`;};
  const shade=(hex,p)=>{const h=hex.slice(1);return '#'+[0,2,4].map((k,i)=>Math.round(mix([7,11,14][i],parseInt(h.slice(k,k+2),16),p)).toString(16).padStart(2,'0')).join('');};
  let clock=0;

  function text(s,x,y,size=32,color=C.white,weight=500,opt={}) {
    c.save();c.fillStyle=color;c.font=`${weight} ${size}px ${opt.mono?MONO:SANS}`;c.textAlign=opt.align||'left';c.textBaseline='top';
    if(opt.alpha!==undefined)c.globalAlpha*=opt.alpha;
    if(opt.glow){c.shadowColor=color;c.shadowBlur=opt.glow;}
    if(opt.tracking)c.letterSpacing=`${opt.tracking}px`;
    c.fillText(s,x,y,opt.max||2000);c.restore();
  }
  function reveal(s,x,y,size,t,color=C.white,weight=500,opt={}) {
    const e=enter(t,0,.68);if(e<=0)return;
    c.save();c.beginPath();c.rect(x-10,y-8,opt.width||1800,size*1.35+14);c.clip();text(s,x,y+(1-e)*size*1.3,size,color,weight,opt);c.restore();
  }
  function label(s,x,y,color=C.dim,opt={}) {text(s,x,y,20,color,500,{mono:true,tracking:1.2,...opt});}
  function line(x1,y1,x2,y2,color=C.grid,width=2,glow=0) {
    c.save();c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';if(glow){c.shadowColor=color;c.shadowBlur=glow;}c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();c.restore();
  }
  function path(points,color=C.green,width=3,glow=0,closed=false,fill=null) {
    if(!points.length)return;c.save();c.beginPath();c.moveTo(...points[0]);points.slice(1).forEach(p=>c.lineTo(...p));if(closed)c.closePath();if(fill){c.fillStyle=fill;c.fill();}c.strokeStyle=color;c.lineWidth=width;c.lineJoin='round';c.lineCap='round';if(glow){c.shadowColor=color;c.shadowBlur=glow;}c.stroke();c.restore();
  }
  function rect(x,y,w,h,color,fill=null,r=0,width=2,glow=0) {
    c.save();c.beginPath();c.roundRect(x,y,w,h,r);if(fill){c.fillStyle=fill;c.fill();}if(color){c.strokeStyle=color;c.lineWidth=width;c.shadowColor=color;c.shadowBlur=glow;c.stroke();}c.restore();
  }
  function circle(x,y,r,color,fill=null,width=2,glow=0) {
    c.save();c.beginPath();c.arc(x,y,r,0,Math.PI*2);if(fill){c.fillStyle=fill;c.fill();}if(color){c.strokeStyle=color;c.lineWidth=width;c.shadowColor=color;c.shadowBlur=glow;c.stroke();}c.restore();
  }
  function dot(x,y,color=C.green,r=5){circle(x,y,r,null,color);circle(x,y,r+3,rgba(color,.3),null,1,15);}
  function house(x,y,s,color=C.green,fill=false,a=1) {
    c.save();c.globalAlpha*=a;
    path([[x-s*.5,y-s*.12],[x,y-s*.55],[x+s*.5,y-s*.12],[x+s*.5,y+s*.48],[x+s*.12,y+s*.48],[x+s*.12,y+s*.08],[x-s*.12,y+s*.08],[x-s*.12,y+s*.48],[x-s*.5,y+s*.48]],color,Math.max(1.5,s*.025),fill?12:0,true,fill?rgba(color,.12):C.bg);
    c.restore();
  }
  function arrow(x,y,s,color=C.green){path([[x-s,y-s],[x,y],[x-s,y+s]],color,3,8);}
  function burst(x,y,t,color=C.green) {
    if(t<0||t>1.2)return;const p=out(t/1.2);
    c.save();c.globalAlpha*=1-p;
    circle(x,y,10+p*130,color,null,2,15);
    for(let i=0;i<12;i++){let a=i*Math.PI/6;line(x+Math.cos(a)*p*60,y+Math.sin(a)*p*60,x+Math.cos(a)*(p*140+10),y+Math.sin(a)*(p*140+10),color,2);}
    c.restore();
  }
  function atmosphere(t,red=0) {
    c.fillStyle=C.bg;c.fillRect(0,0,W,H);
    let g=c.createRadialGradient(1400+80*Math.sin(t*.2),610,10,1300,600,1050);g.addColorStop(0,`rgba(26,74,56,${.18*(1-red)})`);g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(0,0,W,H);
    if(red){g=c.createRadialGradient(1430,560,10,1430,560,800);g.addColorStop(0,`rgba(116,34,25,${.19*red})`);g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(0,0,W,H);}
    c.save();c.globalAlpha=.14;
    for(let x=120;x<W;x+=120)for(let y=142;y<980;y+=120){c.fillStyle=C.cover;c.fillRect(x,y,1.3,1.3);}
    c.restore();
  }
  function footer(s,second='') {text(s,120,963,21,C.dim,400);if(second)text(second,120,992,19,C.dim,400);}
  function topbar(act,t) {
    label('TRES MILLONES DE VIVIENDAS',120,59,C.cover,{tracking:2});
    label(act,1800,59,C.dim,{align:'right',tracking:1.5});
    line(120,105,1800,105,rgba(C.cover,.15),1);
    line(120,105,120+1680*clamp(t/60),105,C.green,2,10);
  }

  // A small isometric engine. Geometry carries the story from empty sites
  // to dense blocks, public housing and prefabricated assembly.
  function project(x,z,h,cx,cy,s,angle=0) {
    const X=x*Math.cos(angle)-z*Math.sin(angle),Z=x*Math.sin(angle)+z*Math.cos(angle);
    return[cx+(X-Z)*s*.866,cy+(X+Z)*s*.43-h];
  }
  function cube(cx,cy,s,x,z,height,color=C.green,opt={}) {
    const w=opt.width||.78, a=opt.angle||0, lift=opt.lift||0;
    const p=(xx,zz,h)=>project(xx,zz,h+lift,cx,cy,s,a);
    const A=p(x,z,0),B=p(x+w,z,0),D=p(x,z+w,0),F=p(x+w,z+w,0);
    const AT=p(x,z,height),BT=p(x+w,z,height),DT=p(x,z+w,height),FT=p(x+w,z+w,height);
    const alpha=opt.alpha===undefined?1:opt.alpha;
    c.save();c.globalAlpha*=alpha;
    path([D,F,FT,DT],rgba(color,.62),1.8,0,true,opt.wire?rgba(color,.025):shade(color,.075));
    path([B,F,FT,BT],rgba(color,.82),1.8,0,true,opt.wire?rgba(color,.045):shade(color,.14));
    path([AT,BT,FT,DT],color,1.8,opt.glow||0,true,opt.wire?rgba(color,.07):shade(color,.25));
    if(opt.windows&&height>40){
      const levels=Math.floor(height/28);
      for(let j=1;j<=levels;j++){
        const h=j*25;
        for(let k=0;k<2;k++){
          const q=p(x+w,z+.12+k*.34,h);const r=p(x+w,z+.25+k*.34,h+10);
          path([q,p(x+w,z+.25+k*.34,h),r,p(x+w,z+.12+k*.34,h+10)],rgba(color,.55),1,0,true,rgba(color,.3));
        }
      }
    }
    c.restore();return{top:FT,base:F};
  }
  function ground(cx,cy,s,n=5,alpha=.6,angle=0) {
    c.save();c.globalAlpha*=alpha;
    for(let k=0;k<=n;k++){
      path([project(k,0,0,cx,cy,s,angle),project(k,n,0,cx,cy,s,angle)],C.grid,1.5);
      path([project(0,k,0,cx,cy,s,angle),project(n,k,0,cx,cy,s,angle)],C.grid,1.5);
    }c.restore();
  }
  function city(cx,cy,s,t,opt={}) {
    const n=opt.n||5,angle=opt.angle||0;
    ground(cx,cy,s,n,.85,angle);
    const cells=[];for(let x=0;x<n;x++)for(let z=0;z<n;z++)cells.push({x,z,d:x+z});cells.sort((a,b)=>a.d-b.d);
    for(const {x,z}of cells){
      const seed=x*13+z*23,delay=(x+z)*.095+random(seed)*.2;
      const e=enter(t,delay,1.35);
      const h=(55+random(seed)*185)*(opt.height||1)*e;
      const selected=opt.zone?x>0&&x<4&&z>0&&z<4:true;
      const color=opt.red?C.red:selected?C.green:C.cover;
      cube(cx,cy,s,x,z,selected?h:12,color,{angle,alpha:selected?1:.15,windows:opt.windows!==false,glow:selected?5:0});
    }
  }

  function intro(t) {
    // Luminous housing units accelerate inward, resolving into the title.
    const ready=enter(t,.1,1.45);
    for(let i=0;i<30;i++){
      const x=120+(i%10)*175,y=740+Math.floor(i/10)*76;
      const delay=(i%10)*.038+Math.floor(i/10)*.1;
      const e=enter(t,delay,.85);
      house(x+(1-e)*(x-960)*2,y+(1-e)*340,32,C.green,false,e*.45);
    }
    label('LA ESCALA DEL RETO',124,216,C.cover,{alpha:enter(t,.15)});
    const value=t<1.65?3000000*out((t-.1)/1.5):3000000;
    reveal(num(value),105,294,237,t-.1,C.cover,600,{tracking:-11,width:1750});
    reveal('CUÁNTAS.',120,573,83,t-.95,C.white,500,{tracking:-3});
    reveal('Y CÓMO.',642,573,83,t-1.5,C.green,500,{tracking:-3});
    label('DE LA ESCASEZ A LA ABUNDANCIA',125,919,C.dim,{alpha:enter(t,1.7)});
    const bx=mix(1820,1690,ready);house(bx,622,120,C.green,true,ready);
    line(124,694,124+1666*enter(t,.8,1.2),694,C.green,2,12);
  }
  function deficit(t) {
    reveal('PARTIMOS CON',120,208,68,t,C.white,500,{tracking:-2});
    reveal('UN DÉFICIT.',120,288,68,t-.12,C.white,500,{tracking:-2});
    reveal(num(739000*enter(t,.15,1.4)),112,442,192,t-.18,C.red,600,{tracking:-9,width:1100});
    label('VIVIENDAS QUE FALTAN',125,663,C.red,{alpha:enter(t,.6)});
    for(let z=0;z<4;z++)for(let x=0;x<4;x++){
      const e=enter(t,.05*(x+z),1),xx=1390,yy=413;
      cube(xx,yy,93,x,z,(80+random(x*4+z)*170)*e,C.red,{alpha:.25+random(x+z*6)*.45,glow:5,windows:false,wire:true});
    }
    const a=enter(t,.65);
    c.save();c.globalAlpha=a;line(1170,819,1670,819,C.red,2,10);line(1170,808,1170,830,C.red,2);line(1670,808,1670,830,C.red,2);label('EL HUECO ACUMULADO',1420,850,C.red,{align:'center'});c.restore();
    footer('Déficit básico acumulado al cierre de 2025.','Fuente: sección 3 de la web · brief EsadeEcPol, abril de 2026.');
  }
  function flows(t) {
    reveal('La distancia sigue creciendo.',120,199,76,t,C.white,500,{tracking:-3});
    const e=enter(t,.2,1.6),x=657,wide=1118,rows=[{y:432,n:250000,len:wide,color:C.red,title:'NUEVOS HOGARES / AÑO'},{y:675,n:95000,len:wide*95/250,color:C.green,title:'VIVIENDAS / AÑO'}];
    rows.forEach((r,j)=>{
      reveal(num(r.n*e),115,r.y-95,137,t-.12-j*.1,r.color,500,{tracking:-7,width:550});
      label(r.title,124,r.y+73,r.color,{alpha:enter(t,.3)});
      rect(x,r.y-23,wide,46,rgba(C.cover,.13),rgba(C.cover,.02),2,1);
      const len=r.len*e;const g=c.createLinearGradient(x,r.y,x+len,r.y);g.addColorStop(0,rgba(r.color,.10));g.addColorStop(1,rgba(r.color,.62));rect(x,r.y-23,len,46,null,g,1);
      line(x,r.y-24,x+len,r.y-24,r.color,2,14);line(x+len,r.y-30,x+len,r.y+30,r.color,3,13);
      c.save();c.beginPath();c.rect(x,r.y-23,len,46);c.clip();for(let i=0;i<23;i++){const px=x+frac(t*.33+i/23)*r.len;line(px-25,r.y,px,r.y,r.color,3,12);}c.restore();
    });
    const f=enter(t,2.35,.75);c.save();c.globalAlpha=f;
    const from=x+wide*95/250,to=x+wide;
    path([[from,747],[from,772],[to,772],[to,747]],C.red,2);
    text('≈ 155.000',mix(from,to,.5),794,52,C.red,500,{align:'center',tracking:-1});
    text('de diferencia al año, al inicio',mix(from,to,.5),858,25,C.dim,400,{align:'center'});c.restore();
    footer('Punto de partida del simulador: 2026.','La creación de hogares se reduce en las décadas siguientes dentro del modelo.');
  }
  function need(t){return 739000+250000*Math.min(t,26)-(250000/52)*Math.min(t,26)**2;}
  function closing(X){const b=250000/52,t=(250000-X+Math.sqrt((250000-X)**2+4*b*739000))/(2*b);return t<=26?t:3989000/X;}
  function graph(t) {
    reveal('Acelerar cambia el horizonte.',120,195,76,t,C.white,500,{tracking:-3});
    const morph=smooth((t-1.45)/3.1),rate=mix(95000,333000,morph),draw=enter(t,.12,1.4);
    const x0=153,y0=841,gw=1007,gh=464,xx=y=>x0+y/44*gw,yy=v=>y0-v/5000000*gh;
    for(let n=0;n<=5;n++){const y=yy(n*1000000);line(x0,y,x0+gw,y,rgba(C.cover,.1),1);label(n===0?'0':n+' M',x0-20,y-9,C.dim,{align:'right',tracking:0});}
    [2026,2035,2045,2055,2070].forEach(y=>label(String(y),xx(y-2026),y0+27,C.dim,{align:'center',tracking:0}));
    c.save();c.setLineDash([7,9]);line(x0,yy(3000000),x0+gw,yy(3000000),rgba(C.cover,.6),1);c.restore();
    label('OBJETIVO: 3 MILLONES',x0+gw-8,yy(3000000)-31,C.cover,{align:'right',tracking:.6});
    const pts=[];for(let j=0;j<=140*draw;j++){const a=j/140*44;pts.push([xx(a),yy(need(a))]);}
    if(pts.length>1){const area=[[x0,y0],...pts,[pts[pts.length-1][0],y0]];path(area,'transparent',0,0,true,rgba(C.red,.045));path(pts,C.red,3.5,10);}
    const cap=Math.min(44,5000000/rate)*draw;
    path([[xx(0),yy(0)],[xx(cap),yy(cap*rate)]],C.green,4,16);
    const tc=closing(rate),crossX=xx(tc),crossY=yy(need(tc));
    if(draw>.98){c.save();c.setLineDash([3,8]);line(crossX,crossY,crossX,y0,rgba(C.green,.6),1.5);c.restore();dot(crossX,crossY,C.green,6);label(String(2026+Math.round(tc)),crossX,crossY-34,C.green,{align:'center'});}
    const lx=1283;
    label('RITMO DE CONSTRUCCIÓN',lx,330,C.cover);
    text(num(rate),lx-6,375,111,C.green,500,{tracking:-6,max:540});label('VIVIENDAS / AÑO',lx,510,C.green);
    const ty=3000000/rate;
    text('≈ '+Math.round(ty),lx-4,598,88,C.white,500,{tracking:-3});text('años',lx+204,645,30,C.cover,400);
    text('para construir 3 millones',lx,705,27,C.cover,400);
    line(lx,759,1800,759,rgba(C.cover,.17),1);
    text('≈ '+closing(rate).toFixed(1).replace('.',',')+' años',lx,793,43,C.green,500,{tracking:-1});
    text('para cerrar la brecha del modelo',lx,850,25,C.dim,400);
    line(156,307,181,307,C.red,3);text('Necesidad acumulada',195,294,23,C.dim,400);
    line(513,307,540,307,C.green,3);text('Viviendas construidas',554,294,23,C.dim,400);
    footer('Escenario ilustrativo del simulador. No es una predicción.','Déficit inicial: 739.000 · demanda inicial: 250.000 hogares/año, descendente hasta cero en 26 años.');
  }
  function hinge(t) {
    reveal('EL RITMO',120,231,119,t,C.white,500,{tracking:-5});
    reveal('SE DESBLOQUEA.',120,371,119,t-.13,C.green,500,{tracking:-5});
    label('SIETE PALANCAS QUE SE SUMAN',128,575,C.cover,{alpha:enter(t,.45)});
    line(150,782,1770,782,rgba(C.cover,.2),2);
    for(let i=0;i<7;i++){
      const x=195+i*247,p=enter(t,.45+i*.16,.6);
      rect(x-33,749,66,66,p>.3?C.green:C.red,rgba(p>.3?C.green:C.red,.10),6,2,10);
      path([[x-12,781],[x-2,792],[x+17,770]],rgba(C.green,p),3,10);
      label(String(i+1).padStart(2,'0'),x,855,C.dim,{align:'center'});
      if(i<6)line(x+35,782,x+35+177*p,782,C.green,3,14);
    }
  }
  function leverTitle(n,lines,sub,t) {
    label('DESBLOQUEAR  /  '+String(n).padStart(2,'0')+' DE 07',124,203,C.green,{alpha:enter(t,0,.4)});
    lines.forEach((s,i)=>reveal(s,119,289+i*86,76,t-i*.1,C.white,500,{tracking:-3,width:850}));
    const by=319+lines.length*86;sub.forEach((s,i)=>reveal(s,125,by+i*42,29,t-.3-i*.08,C.cover,400,{width:830}));
    // The seven-position strip is structural, and progresses with the film.
    for(let i=0;i<7;i++){const x=125+i*90;line(x,886,x+64,886,i<n?C.green:C.grid,i===n-1?5:2,i===n-1?12:0);}
    text(String(n).padStart(2,'0'),124,660,145,rgba(C.cover,.13),500,{tracking:-8});
  }
  function drawDocument(x,y,s,color=C.cover,a=1) {
    c.save();c.globalAlpha*=a;rect(x-s*.37,y-s*.5,s*.74,s,color,rgba(C.bg,.9),3,2,5);
    for(let j=0;j<4;j++)line(x-s*.21,y-s*.25+j*s*.15,x+s*(j===3?.06:.2),y-s*.25+j*s*.15,rgba(color,.6),2);c.restore();
  }
  function silence(t) {
    leverTitle(1,['Silencio','positivo.'],['En suelo urbano consolidado.','Que la falta de respuesta no bloquee.'],t);
    const cx=1338,cy=514,open=smooth((t-.85)/1.2);
    const col=open>.5?C.green:C.red;
    line(940,657,1790,657,rgba(C.cover,.2),2);
    circle(cx,430,107,col,rgba(col,.025),2,8);
    for(let i=0;i<12;i++){let a=i*Math.PI/6;line(cx+Math.cos(a)*91,430+Math.sin(a)*91,cx+Math.cos(a)*98,430+Math.sin(a)*98,rgba(col,.65),2);}
    const a=t*5-1.57;path([[cx+Math.cos(a)*70,430+Math.sin(a)*70],[cx,430],[cx+Math.cos(a*.13)*40,430+Math.sin(a*.13)*40]],col,4,13);
    dot(cx,430,col,4);
    const gate=1478;
    rect(gate-12,550-open*145,24,107,C.red,rgba(C.red,.12),2,2,8);
    rect(gate-12,657+open*145,24,107,C.red,rgba(C.red,.12),2,2,8);
    const px=mix(1060,1730,smooth((t-.9)/1.65));
    line(960,657,Math.max(960,px-55),657,C.green,3,12);
    drawDocument(px,657,116,open>.4?C.green:C.cover);
    c.save();c.globalAlpha=open;path([[1616,487],[1636,508],[1680,462]],C.green,6,17);c.restore();
    label('SOLICITUD',1035,802,C.dim,{align:'center'});label('CONTINUAR',1702,802,C.green,{align:'center',alpha:open});
  }
  function deadlines(t) {
    leverTitle(2,['Plazos que','se cumplen.'],['Eliminar informes duplicados.','Hacer cumplir los tiempos.'],t);
    const p=smooth((t-.6)/1.65),baseX=1045;
    for(let i=0;i<6;i++){
      const y=mix(319+i*79,420+(i%3)*140,p),x=mix(baseX+i*35,1090+(i%3)*260,p);
      const disappear=i>=3?1-p:1;
      drawDocument(x,y,105,i>=3?C.red:C.green,disappear);
      if(i<3&&p>.2){const yy=420+i*140;line(x+56,y,1780,yy,rgba(C.green,p*.5),2,7);dot(mix(x+56,1780,frac(t*.6+i*.3)),mix(y,yy,frac(t*.6+i*.3)),C.green,4);}
    }
    c.save();c.globalAlpha=p;
    ['TRÁMITE','PLAZO','RESOLUCIÓN'].forEach((s,i)=>label(s,1087+i*260,800,C.cover,{align:'center'}));
    path([[1750,375],[1775,397],[1815,347]],C.green,4,12);c.restore();
  }
  function override(t) {
    leverTitle(3,['Superar el','bloqueo local.'],['Iniciativa autonómica.','Activar proyectos de interés general.'],t);
    const p=enter(t,.45,1.45),x=961,y=680,w=820;
    line(x,y,x+w,y,rgba(C.cover,.18),3);
    for(let i=0;i<3;i++){const xx=1255+i*70;line(xx,y-92,xx,y+91,C.red,4,14);}
    label('BLOQUEO LOCAL',1324,830,C.red,{align:'center'});
    const route=[[x,y],[1120,y],[1120,393],[1640,393],[1640,y],[x+w,y]];
    const total=route.slice(1).reduce((acc,p,i)=>acc+Math.hypot(p[0]-route[i][0],p[1]-route[i][1]),0);
    let remain=p*total,pts=[route[0]];
    for(let i=1;i<route.length;i++){const a=route[i-1],b=route[i],len=Math.hypot(b[0]-a[0],b[1]-a[1]);if(remain>=len){pts.push(b);remain-=len;}else{pts.push([mix(a[0],b[0],remain/len),mix(a[1],b[1],remain/len)]);break;}}
    path(pts,C.green,4,19);dot(...pts[pts.length-1],C.green,7);
    label('INICIATIVA AUTONÓMICA',1380,326,C.green,{align:'center',alpha:enter(t,.6)});
    house(1779,680,99,C.green,true,enter(t,1.8));
  }
  function zones(t) {
    leverTitle(4,['Zonas','estratégicas.'],['Suelo + gestión compartida.','Con reserva de vivienda protegida.'],t);
    const a=-.18+.08*t,cx=1412,cy=455,s=91;
    city(cx,cy,s,t-.4,{zone:true,height:.65,angle:a});
    const p=enter(t,.1,.8);
    const corners=[[1,1],[4,1],[4,4],[1,4],[1,1]].map(([x,z])=>project(x,z,6,cx,cy,s,a));
    c.save();c.globalAlpha=p;path(corners,C.green,4,18);c.restore();
    const tip=project(4,4,0,cx,cy,s,a);
    line(tip[0],tip[1]+24,tip[0],tip[1]+64,C.green,2);
    label('ACTIVAR SUELO',tip[0],tip[1]+83,C.green,{align:'center',alpha:p});
  }
  function density(t) {
    leverTitle(5,['Más altura.','Más ciudad.'],['Densidad, transporte y usos mixtos.','Allí donde hay demanda y servicios.'],t);
    const cx=1420,cy=491,s=83,a=.10+.08*t;
    city(cx,cy,s,2.2,{height:.65+.65*smooth((t-.3)/1.65),angle:a,windows:true});
    const p1=project(-.6,5.9,0,cx,cy,s,a),p2=project(6,5.9,0,cx,cy,s,a);
    line(...p1,...p2,C.cyan,4,15);
    for(let i=0;i<5;i++){const p=project(i*1.35,5.9,0,cx,cy,s,a);circle(...p,7,C.cyan,C.bg,2,7);}
    const train=project(mix(-.3,5.6,frac(t*.3)),5.9,0,cx,cy,s,a);rect(train[0]-16,train[1]-7,32,14,C.cyan,C.cyan,3,1,20);
    label('CONECTAR Y DENSIFICAR',1460,917,C.cyan,{align:'center'});
  }
  function publicHousing(t) {
    leverTitle(6,['Alquiler','público.'],['Una de cada diez viviendas nuevas.','Integradas en la ciudad.'],t);
    // Exactly ten buildings, exactly one selected: this is a proposed share.
    const e=enter(t,.12,1.1);
    for(let i=0;i<10;i++){
      const x=995+(i%5)*168,y=460+Math.floor(i/5)*230;
      const selected=i===6,delay=(i%5)*.08+Math.floor(i/5)*.13;
      house(x,y+80*(1-enter(t,delay,.7)),104,selected?C.green:rgba(C.cover,.42),selected,e);
      if(selected){circle(x,y,84,rgba(C.green,.55),null,1,15);burst(x,y,t-1.1);const angle=t*1.5;dot(x+Math.cos(angle)*84,y+Math.sin(angle)*84,C.green,3);}
    }
    c.save();c.globalAlpha=enter(t,.7);
    text('1',1142,203,120,C.green,500,{tracking:-5});text('DE CADA',1250,263,26,C.cover,400);text('10',1437,203,120,C.cover,500,{tracking:-5});
    label('300.000 NUEVAS VIVIENDAS PÚBLICAS',1400,871,C.green,{align:'center',tracking:.3});c.restore();
  }
  function factory(t) {
    leverTitle(7,['Industrializar.'],['Fabricar componentes.','Ensamblar en obra.','Formar a quienes construyen.'],t);
    const cx=1451,cy=789,s=119;
    ground(cx,cy,s,3,.7);
    line(1030,284,1790,284,C.cover,3);line(1080,284,1080,805,rgba(C.cover,.24),2);
    const cells=[];for(let y=0;y<7;y++)for(let x=0;x<2;x++)for(let z=0;z<2;z++)cells.push({x,z,y});
    cells.sort((a,b)=>(a.x+a.z)-(b.x+b.z)||a.y-b.y);
    for(const {x,z,y} of cells){
      const start=.16+y*.31+(x+z)*.1,e=enter(t,start,.78),lift=(1-e)*(440+y*30);
      if(t<start)continue;
      cube(cx,cy,s,x,z,51,C.green,{lift:y*54+lift,alpha:e,windows:true,glow:4});
      if(e>.1&&e<.95){const p=project(x+.4,z+.4,y*54+lift+51,cx,cy,s);line(p[0],290,p[0],p[1]-12,rgba(C.cyan,.45*(1-e)),1.5);}
    }
    const u=frac(t*.4);rect(1120+u*610,277,55,16,C.green,rgba(C.green,.2),2,1,12);
    const labels=['FABRICAR','ENSAMBLAR','HABITAR'];labels.forEach((s,i)=>{label(s,1080+i*270,916,t>.55+i*.65?C.green:C.dim,{align:'center'});if(i<2)arrow(1230+i*270,926,7,C.dim);});
  }
  function parallel(t) {
    reveal('TODO A LA VEZ.',120,203,111,t,C.white,500,{tracking:-4});
    reveal('Las palancas se suman.',125,347,38,t-.2,C.green,400);
    const start=552;
    ['SUELO','PLAN','EDIFICIO','SECTOR'].forEach((s,i)=>{
      const y=start+i*98;label(s,128,y-13,C.cover,{tracking:2});
      const pts=[[334,y],[800,y],[1010,660],[1170,660]];
      path(pts,rgba(C.green,.17),2);const e=enter(t,i*.09,.85);c.save();c.globalAlpha=e;path(pts,C.green,2,9);c.restore();
      for(let k=0;k<4;k++){
        const f=frac(t*.43+k*.25+i*.14),x=334+f*836;
        const yy=x<800?y:x<1010?mix(y,660,(x-800)/210):660;
        dot(x,yy,C.green,4);
      }
    });
    city(1466,478,67,t+.5,{height:1.2,angle:-.02+t*.025});
    footer('Suelo, plan, edificio y sector: actuar en paralelo.');
  }
  function finale(t) {
    // The finished city stays alive beneath the final, held title.
    c.save();c.globalAlpha=.33;city(1370,733,68,3,{height:1.25,angle:.08+t*.018});c.restore();
    reveal('3.000.000',110,197,224,t,C.cover,600,{tracking:-11});
    reveal('DE VIVIENDAS.',122,466,81,t-.2,C.white,500,{tracking:-3});
    reveal('DE LA ESCASEZ',122,636,66,t-.48,C.white,400,{tracking:-2});
    reveal('A LA ABUNDANCIA.',122,716,66,t-.68,C.green,500,{tracking:-2});
    line(125,857,125+1040*enter(t,.8,1),857,C.green,2,16);
    label('JORGE GALINDO',125,919,C.cover,{alpha:enter(t,1)});
    text('tresmillonesdeviviendas.es',125,961,25,C.dim,400,{alpha:enter(t,1.2)});
  }

  const scenes=[
    {start:0,end:4,paint:intro,act:'01 / CUÁNTAS',red:0},
    {start:4,end:8,paint:deficit,act:'01 / CUÁNTAS',red:1},
    {start:8,end:14,paint:flows,act:'01 / CUÁNTAS',red:.45},
    {start:14,end:23,paint:graph,act:'01 / CUÁNTAS',red:.25},
    {start:23,end:26,paint:hinge,act:'02 / CÓMO',red:0},
    {start:26,end:29.5,paint:silence,act:'02 / CÓMO',red:.15},
    {start:29.5,end:33,paint:deadlines,act:'02 / CÓMO',red:0},
    {start:33,end:36.5,paint:override,act:'02 / CÓMO',red:.15},
    {start:36.5,end:40,paint:zones,act:'02 / CÓMO',red:0},
    {start:40,end:43.5,paint:density,act:'02 / CÓMO',red:0},
    {start:43.5,end:47.5,paint:publicHousing,act:'02 / CÓMO',red:0},
    {start:47.5,end:51.5,paint:factory,act:'02 / CÓMO',red:0},
    {start:51.5,end:55.5,paint:parallel,act:'02 / CÓMO',red:0},
    {start:55.5,end:60,paint:finale,act:'CUÁNTAS. Y CÓMO.',red:0}
  ];
  function renderFrame(time) {
    clock=clamp(time,0,60);const idx=scenes.findIndex(s=>clock>=s.start&&clock<s.end),s=scenes[idx<0?scenes.length-1:idx],local=clock-s.start;
    c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.shadowBlur=0;
    atmosphere(clock,s.red);
    // Brief directional cut, with the drawings themselves moving continuously.
    c.save();const arrival=s.start?out(local/.28):1;c.translate((1-arrival)*55,0);c.globalAlpha=arrival;s.paint(local);c.restore();
    topbar(s.act,clock);
    // Restrained luminance texture; static to preserve compression and clean type.
    c.save();c.globalAlpha=.018;c.fillStyle='#ffffff';for(let y=0;y<1080;y+=4)c.fillRect(0,y,1920,1);c.restore();
  }
  window.renderFrame=renderFrame;
  window.film={duration:60,width:W,height:H,scenes:scenes.map(({start,end,act})=>({start,end,act})),need,closing};
  renderFrame(0);
})();
