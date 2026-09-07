(()=>{
  'use strict';

  const gameCanvas=document.getElementById('game');
  const stage=gameCanvas?.parentElement;
  const levelLabel=document.getElementById('levelLabel');
  if(!gameCanvas||!stage||!levelLabel)return;

  const fx=document.createElement('canvas');
  fx.width=gameCanvas.width;
  fx.height=gameCanvas.height;
  fx.setAttribute('aria-hidden','true');
  fx.dataset.seedAscentWorldFx='true';
  Object.assign(fx.style,{position:'absolute',inset:'0',width:'100%',height:'100%',pointerEvents:'none',background:'transparent',zIndex:'2'});
  stage.appendChild(fx);

  const ctx=fx.getContext('2d');
  if(!ctx)return;

  const TAU=Math.PI*2;
  const particles=[];
  const worldProfiles={
    '1-1':{kind:'pollen',count:28,wind:.16,alpha:.38},
    '1-2':{kind:'leaf',count:22,wind:.22,alpha:.34},
    '2-1':{kind:'dust',count:26,wind:.10,alpha:.28},
    '2-2':{kind:'petal',count:26,wind:.18,alpha:.36},
    '3-1':{kind:'crystal',count:30,wind:.12,alpha:.42},
    '3-2':{kind:'ember',count:24,wind:.08,alpha:.34},
    '4-1':{kind:'heat',count:18,wind:.20,alpha:.26},
    '4-2':{kind:'spore',count:28,wind:.08,alpha:.32},
    '5-1':{kind:'resin',count:24,wind:.14,alpha:.40},
    '5-2':{kind:'mist',count:18,wind:.10,alpha:.25},
    '6-1':{kind:'storm',count:24,wind:.34,alpha:.34},
    '6-2':{kind:'trichome',count:34,wind:.12,alpha:.46},
  };

  let activeWorld='';
  let profile=worldProfiles['1-1'];
  let last=performance.now();
  let flash=0;

  function randomParticle(kind){
    return {kind,x:Math.random()*fx.width,y:Math.random()*fx.height,size:1.5+Math.random()*4,speed:.25+Math.random()*.75,phase:Math.random()*TAU,spin:(Math.random()-.5)*.06};
  }

  function resetWorld(world){
    activeWorld=world;
    profile=worldProfiles[world]||worldProfiles['1-1'];
    particles.length=0;
    for(let i=0;i<profile.count;i++)particles.push(randomParticle(profile.kind));
    fx.dataset.world=world;
    fx.dataset.effect=profile.kind;
  }

  function leaf(p,color){
    ctx.save();ctx.translate(p.x,p.y);ctx.rotate(Math.sin(p.phase)*.8);ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(0,0,p.size*1.8,p.size*.75,.35,0,TAU);ctx.fill();ctx.restore();
  }

  function crystal(p){
    ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.phase);ctx.fillStyle='#d8fbff';ctx.beginPath();ctx.moveTo(0,-p.size*1.8);ctx.lineTo(p.size,0);ctx.lineTo(0,p.size*1.8);ctx.lineTo(-p.size,0);ctx.closePath();ctx.fill();ctx.restore();
  }

  function mote(p,color){
    ctx.fillStyle=color;ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,TAU);ctx.fill();
  }

  function streak(p,color){
    ctx.strokeStyle=color;ctx.lineWidth=Math.max(1,p.size*.5);ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x-8-p.size*2,p.y+3);ctx.stroke();
  }

  function drawParticle(p){
    switch(p.kind){
      case 'leaf': leaf(p,'#9be57d'); break;
      case 'petal': leaf(p,'#f2a6d7'); break;
      case 'crystal': crystal(p); break;
      case 'ember': mote(p,'#ffb35d'); break;
      case 'heat': streak(p,'#ffd39b'); break;
      case 'spore': mote(p,'#c3a7dc'); break;
      case 'resin': mote(p,'#e7c9ff'); break;
      case 'mist': streak(p,'#d8ffff'); break;
      case 'storm': streak(p,'#d9f5ff'); break;
      case 'trichome': crystal(p); break;
      case 'dust': mote(p,'#cbb58d'); break;
      default: mote(p,'#eaffb8');
    }
  }

  function drawWorldAccent(now){
    if(activeWorld==='3-1'||activeWorld==='6-2'){
      ctx.save();ctx.globalAlpha=.18+.08*Math.sin(now*.002);ctx.strokeStyle='#d8fbff';ctx.lineWidth=2;
      for(let x=70;x<fx.width;x+=180){ctx.beginPath();ctx.arc(x,80+(x%120),12,0,TAU);ctx.stroke();}
      ctx.restore();
    }
    if(activeWorld==='4-1'){
      ctx.save();ctx.globalAlpha=.10;ctx.strokeStyle='#ffd39b';ctx.lineWidth=3;
      for(let x=0;x<fx.width;x+=90){const y=300+Math.sin(now*.002+x)*18;ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+25,y-12,x+50,y);ctx.stroke();}
      ctx.restore();
    }
    if(activeWorld==='6-1'&&Math.random()<.004)flash=1;
    if(flash>0){ctx.fillStyle=`rgba(235,249,255,${flash*.18})`;ctx.fillRect(0,0,fx.width,fx.height);flash*=.82;if(flash<.02)flash=0;}
  }

  function tick(now){
    const world=levelLabel.textContent?.trim()||'1-1';
    if(world!==activeWorld)resetWorld(world);
    const dt=Math.min(2.5,(now-last)/16.667||1);last=now;
    ctx.clearRect(0,0,fx.width,fx.height);
    ctx.save();ctx.globalAlpha=profile.alpha;
    for(const p of particles){
      p.phase+=p.spin*dt;
      p.x+=profile.wind*p.speed*dt*5;
      p.y+=(p.kind==='ember'?-1:p.kind==='mist'?.15:.28)*p.speed*dt;
      if(p.x>fx.width+20)p.x=-20;
      if(p.y>fx.height+20)p.y=-20;
      if(p.y<-20)p.y=fx.height+20;
      drawParticle(p);
    }
    ctx.restore();
    drawWorldAccent(now);
    requestAnimationFrame(tick);
  }

  resetWorld(levelLabel.textContent?.trim()||'1-1');
  requestAnimationFrame(tick);
})();
