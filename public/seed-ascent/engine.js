(()=>{
  'use strict';

  const LEVELS = window.SEED_ASCENT_LEVELS || [];
  const canvas = document.getElementById('game');
  const ctx = canvas?.getContext('2d');
  if (!canvas || !ctx || !LEVELS.length) return;

  const W = canvas.width;
  const H = canvas.height;
  const T = 48;
  const FLOOR_Y = 456;
  const MAX_SAFE_PIT = 176;
  const LANDING_SLOP = 8;
  const EDGE_GRACE = 3;

  ctx.imageSmoothingEnabled = false;

  const ui = {
    level: document.getElementById('levelLabel'),
    score: document.getElementById('scoreLabel'),
    tri: document.getElementById('trichomeLabel'),
    health: document.getElementById('healthLabel'),
    power: document.getElementById('powerLabel'),
  };

  const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));
  const overlap = (a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
  const horizontalOverlap = (a,b,grace=0)=>a.x+a.w-grace>b.x&&a.x+grace<b.x+b.w;
  const rand = (a,b)=>a+Math.random()*(b-a);

  const unlocked = clamp(parseInt(localStorage.getItem('seedAscentUnlocked')||'1',10)||1,1,LEVELS.length||1);
  const game = {
    mode:'title', levelIndex:0, selectedLevel:0, unlocked,
    score:0, trichomes:0, health:3, maxHealth:3,
    cameraX:0, shake:0, level:null, checkpoint:null,
    power:'NONE', powerTimer:0, shield:false,
    best:parseInt(localStorage.getItem('seedAscentRetroBest')||'0',10)||0,
  };
  const input = {left:false,right:false,jumpHeld:false,jumpPressed:false,jumpReleased:false,run:false};
  const player = {
    x:96,y:300,w:34,h:42,vx:0,vy:0,prevX:0,prevY:0,
    grounded:false,coyote:0,jumpBuffer:0,doubleUsed:false,
    facing:1,invuln:0,anim:0,surface:null,riding:null,
  };

  let solids=[],blocks=[],coins=[],powerups=[],enemies=[],hazards=[],checkpoints=[],particles=[],movingPlatforms=[],bossShots=[],pitRanges=[];
  let exitGate=null,boss=null,audioCtx=null;

  function audio(){
    if(!audioCtx){try{audioCtx=new(window.AudioContext||window.webkitAudioContext)()}catch{}}
    if(audioCtx&&audioCtx.state==='suspended')audioCtx.resume().catch(()=>{});
    return audioCtx;
  }
  function beep(f=440,d=.08,type='square',vol=.035){
    const a=audio(); if(!a)return;
    try{
      const o=a.createOscillator(),g=a.createGain();
      o.type=type;o.frequency.value=f;g.gain.value=vol;o.connect(g);g.connect(a.destination);o.start();
      g.gain.exponentialRampToValueAtTime(.001,a.currentTime+d);o.stop(a.currentTime+d);
    }catch{}
  }
  const sounds={
    jump(){beep(330,.06);setTimeout(()=>beep(470,.05),55)},
    coin(){beep(820,.05);setTimeout(()=>beep(1120,.04),45)},
    power(){[440,660,880].forEach((f,i)=>setTimeout(()=>beep(f,.07),i*70))},
    stomp(){beep(160,.08)}, hit(){beep(110,.14,'sawtooth',.05)},
    goal(){[523,659,784,1046].forEach((f,i)=>setTimeout(()=>beep(f,.1),i*90))},
  };

  function sync(){
    if(ui.level) ui.level.textContent=game.level?game.level.world:LEVELS[game.selectedLevel]?.world||'1-1';
    if(ui.score) ui.score.textContent=String(game.score).padStart(6,'0');
    if(ui.tri) ui.tri.textContent=game.trichomes;
    if(ui.health) ui.health.textContent=game.health;
    if(ui.power) ui.power.textContent=game.shield?'SHIELD':game.power;
  }
  function score(n){
    game.score+=n;
    if(game.score>game.best){game.best=game.score;localStorage.setItem('seedAscentRetroBest',String(game.best))}
    sync();
  }
  function particle(x,y,color,n=8){
    for(let i=0;i<n;i++)particles.push({x,y,vx:rand(-3,3),vy:rand(-4,-1),life:rand(22,48),color,s:rand(2,5)});
  }
  function clearWorld(){
    solids=[];blocks=[];coins=[];powerups=[];enemies=[];hazards=[];checkpoints=[];particles=[];movingPlatforms=[];bossShots=[];pitRanges=[];
    exitGate=null;boss=null;
  }

  function buildGrounds(grounds){
    const segments=grounds.map(([x,w,y=FLOOR_Y])=>({x,y,w,h:H-y+80,type:'ground'})).sort((a,b)=>a.x-b.x);
    for(let i=0;i<segments.length-1;i++){
      const current=segments[i];
      const next=segments[i+1];
      const gap=next.x-(current.x+current.w);
      if(gap>MAX_SAFE_PIT) current.w+=gap-MAX_SAFE_PIT;
    }
    pitRanges=[];
    for(let i=0;i<segments.length-1;i++){
      const start=segments[i].x+segments[i].w;
      const end=segments[i+1].x;
      if(end>start)pitRanges.push({x:start,w:end-start,y:segments[i].y});
    }
    return segments;
  }

  function buildLevel(data){
    clearWorld();
    solids.push(...buildGrounds(data.grounds));
    for(const [x,y,w,type='platform'] of data.platforms)solids.push({x,y,w,h:24,type});
    for(const [x,y,payload] of data.blocks)blocks.push({x,y,w:T,h:T,payload,used:false,broken:false,bump:0});
    for(const [x,y,count,spacing=34] of data.coinLines)for(let i=0;i<count;i++)coins.push({x:x+i*spacing,y,w:20,h:20,bob:Math.random()*6.28});
    for(const [x,y,type,range] of data.enemies)addEnemy(x,y,type,range);
    for(const [x,y,w,axis,range,speed] of data.moving)movingPlatforms.push({x,y,w,h:18,type:'moving',startX:x,startY:y,axis,range,speed,phase:0,dx:0,dy:0});
    for(const [x,y,w,h,type] of data.hazards||[])hazards.push({x,y,w,h,type,phase:Math.random()*6.28});
    for(const [x,y] of data.checkpoints)checkpoints.push({x,y,w:30,h:74,active:false});
    exitGate={x:data.exit[0],y:data.exit[1],w:data.exit[2],h:data.exit[3]};
    if(data.boss){
      const [x,y,min,max]=data.boss;
      boss={x,y,w:78,h:58,min,max,dir:-1,vx:1.4,vy:0,hp:8,maxHp:8,invuln:0,phase:0,dead:false,summons:0};
    }
  }

  function addEnemy(x,y,type='APHID',range=150){
    const c={APHID:[34,28,1.1,1],MITE:[28,22,1.8,1],CATERPILLAR:[48,30,.7,2],GNAT:[30,24,1.3,1]}[type];
    enemies.push({x,y,w:c[0],h:c[1],type,s:c[2],hp:c[3],maxHp:c[3],dir:-1,startX:x,range,phase:Math.random()*6.28,vy:0,dead:false});
  }

  function colliders(){return solids.concat(movingPlatforms,blocks.filter(b=>!b.broken))}
  function findGroundTopAt(x){
    let top=Infinity;
    for(const s of solids){
      if(s.type!=='ground')continue;
      if(x>=s.x&&x<=s.x+s.w)top=Math.min(top,s.y);
    }
    return Number.isFinite(top)?top:null;
  }
  function snapPlayerToFloor(x,fallbackY=320){
    player.x=clamp(x,0,game.level.width-player.w);
    const top=findGroundTopAt(player.x+player.w/2);
    player.y=top===null?fallbackY:top-player.h;
    player.prevX=player.x;player.prevY=player.y;player.vx=0;player.vy=0;
    player.grounded=top!==null;player.coyote=player.grounded?8:0;player.doubleUsed=false;player.riding=null;
  }

  function loadLevel(i){
    game.levelIndex=clamp(i,0,LEVELS.length-1);game.selectedLevel=game.levelIndex;game.level=LEVELS[game.levelIndex];buildLevel(game.level);
    game.cameraX=0;game.power='NONE';game.powerTimer=0;game.shield=false;game.health=game.maxHealth;game.checkpoint=null;
    Object.assign(player,{invuln:0,surface:null,riding:null});
    snapPlayerToFloor(96,340);sync();
  }
  function startSelected(){
    audio();if(game.mode==='title'||game.mode==='gameOver'){game.score=0;game.trichomes=0}
    loadLevel(game.selectedLevel);game.mode='playing';canvas.focus();
  }
  function respawn(){
    game.power='NONE';game.powerTimer=0;game.shield=false;
    const cp=game.checkpoint;
    snapPlayerToFloor(cp?cp.x+30:96,cp?cp.y:320);
    player.invuln=100;
    game.cameraX=clamp(player.x-W*.35,0,game.level.width-W);sync();
  }
  function gameOver(){game.mode='gameOver';game.power='NONE';game.powerTimer=0;game.shield=false;sounds.hit();sync()}
  function fallDeath(){if(game.mode!=='playing')return;game.health--;sounds.hit();game.shake=18;if(game.health<=0)gameOver();else respawn()}
  function hurt(){
    if(player.invuln>0||game.power==='RUSH'||game.mode!=='playing')return;
    if(game.shield){game.shield=false;player.invuln=100;game.shake=12;sounds.hit();sync();return}
    game.health--;player.invuln=120;player.vy=-8;player.vx=-player.facing*5;game.shake=14;sounds.hit();sync();
    if(game.health<=0)gameOver();
  }
  function collectPower(type){
    if(type==='SHIELD'){game.shield=true;game.power='NONE';game.powerTimer=0}
    else{game.power=type;game.powerTimer=type==='RUSH'?600:900}
    score(500);sounds.power();
  }
  function hitBlock(b){
    if(b.used||b.broken)return;
    if(b.payload==='BREAK'){b.broken=true;score(75);sounds.stomp();particle(b.x+b.w/2,b.y+b.h/2,'#b99a68',14);return}
    b.used=true;b.bump=10;sounds.coin();
    if(b.payload==='TRI'){game.trichomes+=5;score(250);particle(b.x+24,b.y,'#ffd45b',10)}
    else powerups.push({x:b.x+10,y:b.y-36,w:28,h:28,type:b.payload,vy:0,vx:b.payload==='LIGHT'?1.2:0});
    sync();
  }

  function updateMoving(){
    for(const p of movingPlatforms){
      const ox=p.x,oy=p.y;p.phase+=p.speed*.022;const d=Math.sin(p.phase)*p.range;
      p.axis==='x'?p.x=p.startX+d:p.y=p.startY+d;p.dx=p.x-ox;p.dy=p.y-oy;
    }
  }

  function resolvePlayerX(dx){
    if(!dx)return;
    player.x=clamp(player.x+dx,0,game.level.width-player.w);
    for(const s of colliders()){
      if(!overlap(player,s))continue;
      if(dx>0)player.x=s.x-player.w;
      else player.x=s.x+s.w;
      player.vx=0;
    }
  }

  function resolvePlayerY(dy){
    player.grounded=false;player.surface=null;player.riding=null;
    const startY=player.y;
    const prevTop=startY,prevBottom=startY+player.h;
    const nextTop=startY+dy,nextBottom=nextTop+player.h;
    player.y=nextTop;
    const candidates=colliders();

    if(dy>=0){
      let landing=null;
      for(const s of candidates){
        if(!horizontalOverlap(player,s,EDGE_GRACE))continue;
        if(prevBottom<=s.y+LANDING_SLOP&&nextBottom>=s.y){
          if(!landing||s.y<landing.y)landing=s;
        }
      }
      if(landing){
        player.y=landing.y-player.h;player.vy=0;player.grounded=true;player.surface=landing.type||'block';player.doubleUsed=false;
        if(movingPlatforms.includes(landing))player.riding=landing;
      }
    }else{
      let ceiling=null;
      for(const s of candidates){
        if(!horizontalOverlap(player,s,EDGE_GRACE))continue;
        const bottom=s.y+s.h;
        if(prevTop>=bottom-LANDING_SLOP&&nextTop<=bottom){
          if(!ceiling||bottom>ceiling.y+ceiling.h)ceiling=s;
        }
      }
      if(ceiling){
        player.y=ceiling.y+ceiling.h;player.vy=0;
        if(blocks.includes(ceiling))hitBlock(ceiling);
      }
    }
  }

  function updatePlayer(){
    player.prevX=player.x;player.prevY=player.y;
    if(player.riding){player.x+=player.riding.dx;player.y+=player.riding.dy}
    player.anim+=Math.abs(player.vx)*.08;

    const boost=game.power==='LIGHT';
    const slick=player.grounded&&player.surface==='ice';
    const max=input.run?(boost?8.5:7.4):(boost?6.5:5.4);
    const accel=slick?(input.run?.48:.36):(input.run?.74:.6);
    if(input.left){player.vx-=accel;player.facing=-1}
    else if(input.right){player.vx+=accel;player.facing=1}
    else player.vx*=player.grounded?(slick?.95:.78):.93;
    player.vx=clamp(player.vx,-max,max);

    player.jumpBuffer=Math.max(0,player.jumpBuffer-1);
    player.coyote=player.grounded?8:Math.max(0,player.coyote-1);
    if(input.jumpPressed)player.jumpBuffer=9;
    if(player.jumpBuffer>0){
      if(player.coyote>0){
        player.vy=boost?-15:-14;player.coyote=0;player.jumpBuffer=0;player.doubleUsed=false;sounds.jump();particle(player.x+17,player.y+42,'#8be88f',5);
      }else if(!player.doubleUsed&&player.vy>-9.5){
        player.vy=boost?-13.5:-12.2;player.doubleUsed=true;player.jumpBuffer=0;sounds.jump();particle(player.x+17,player.y+42,'#ffd45b',10);
      }
    }
    if(input.jumpReleased&&player.vy<-4)player.vy*=.55;
    player.vy=Math.min(player.vy+.64,15);

    resolvePlayerX(player.vx);
    resolvePlayerY(player.vy);

    if(player.invuln>0)player.invuln--;
    if(player.y>H+180)fallDeath();
    input.jumpPressed=input.jumpReleased=false;
  }

  function objectLand(obj,dy){
    const startY=obj.y,prevBottom=startY+obj.h,nextBottom=startY+dy+obj.h;
    obj.y+=dy;
    let landing=null;
    for(const s of colliders()){
      if(!horizontalOverlap(obj,s,1))continue;
      if(prevBottom<=s.y+4&&nextBottom>=s.y){if(!landing||s.y<landing.y)landing=s}
    }
    if(landing){obj.y=landing.y-obj.h;obj.vy=0;return landing}
    return null;
  }

  function updateCoins(){
    coins=coins.filter(c=>{c.bob+=.08;if(overlap(player,{x:c.x-4,y:c.y-4,w:28,h:28})){game.trichomes++;score(100);sounds.coin();particle(c.x+10,c.y+10,'#f5f7ff',6);return false}return true});
  }
  function updatePowerups(){
    powerups=powerups.filter(p=>{
      p.vy=Math.min(p.vy+.45,8);p.x+=p.vx;objectLand(p,p.vy);
      if(overlap(player,p)){collectPower(p.type);return false}
      return p.y<H+160;
    });
  }
  function updateHazards(){
    for(const h of hazards){h.phase+=.06;const box={x:h.x,y:h.y,w:h.w,h:h.h};if(!overlap(player,box))continue;if(h.type==='resin'){player.vx*=.72;player.vy=Math.min(player.vy,5)}else hurt()}
  }

  function supportAhead(e){
    const probeX=e.dir>0?e.x+e.w+5:e.x-5;
    const footY=e.y+e.h+12;
    return colliders().some(s=>probeX>=s.x&&probeX<=s.x+s.w&&s.y>=e.y+e.h-2&&s.y<=footY);
  }
  function landEnemy(e,dy){
    const startY=e.y,prevBottom=startY+e.h,nextBottom=startY+dy+e.h;
    e.y+=dy;
    let landing=null;
    for(const s of colliders()){
      if(!horizontalOverlap(e,s,1))continue;
      if(prevBottom<=s.y+4&&nextBottom>=s.y){if(!landing||s.y<landing.y)landing=s}
    }
    if(landing){e.y=landing.y-e.h;e.vy=0;return true}
    return false;
  }
  function updateEnemies(){
    for(const e of enemies){
      if(e.type==='GNAT'){
        e.phase+=.04;e.x+=e.s*e.dir;e.y+=Math.sin(e.phase)*.7;if(Math.abs(e.x-e.startX)>e.range)e.dir*=-1;
      }else{
        if(e.vy===0&&!supportAhead(e))e.dir*=-1;
        e.x+=e.s*e.dir;
        if(Math.abs(e.x-e.startX)>e.range)e.dir*=-1;
        e.vy=Math.min(e.vy+.55,10);landEnemy(e,e.vy);
      }
      if(overlap(player,e)){
        const stomp=player.vy>1&&player.prevY+player.h<=e.y+12;
        if(stomp){e.hp--;player.vy=-9.8;sounds.stomp();particle(e.x+e.w/2,e.y,'#ef765a',10);if(e.hp<=0){e.dead=true;score(e.type==='CATERPILLAR'?350:200)}else e.dir*=-1}
        else if(game.power==='RUSH'){e.dead=true;score(250);particle(e.x,e.y,'#ffd45b',14)}
        else hurt();
      }
    }
    enemies=enemies.filter(e=>!e.dead&&e.y<H+180);
  }

  function updateCheckpoints(){
    for(const cp of checkpoints)if(!cp.active&&overlap(player,cp)){checkpoints.forEach(c=>c.active=false);cp.active=true;game.checkpoint={x:cp.x,y:cp.y-player.h};score(250);sounds.power()}
  }
  function updateBoss(){
    if(!boss||boss.dead){bossShots=[];return}
    boss.phase++;if(boss.invuln>0)boss.invuln--;
    const rage=1+(1-boss.hp/boss.maxHp)*.8;
    boss.x+=boss.vx*boss.dir*rage;
    if(boss.x<boss.min||boss.x+boss.w>boss.max){boss.x=clamp(boss.x,boss.min,boss.max-boss.w);boss.dir*=-1}
    if(boss.phase%150===0&&boss.vy===0)boss.vy=-9;
    if(boss.phase%110===0){
      const dx=player.x-(boss.x+boss.w/2),dy=player.y-(boss.y+boss.h/2),len=Math.max(1,Math.hypot(dx,dy)),speed=boss.hp<=4?5.2:4.2;
      bossShots.push({x:boss.x+boss.w/2,y:boss.y+25,w:14,h:14,vx:dx/len*speed,vy:dy/len*speed,life:240});
      if(boss.hp<=4)bossShots.push({x:boss.x+boss.w/2,y:boss.y+25,w:14,h:14,vx:dx/len*speed,vy:dy/len*speed-1.2,life:240});
    }
    if(boss.hp<=6&&boss.summons<1){boss.summons=1;addEnemy(boss.min+120,424,'MITE',180)}
    if(boss.hp<=3&&boss.summons<2){boss.summons=2;addEnemy(boss.max-180,424,'CATERPILLAR',150)}
    boss.vy=Math.min(boss.vy+.55,12);boss.y+=boss.vy;
    for(const s of solids){if(overlap(boss,s)&&boss.vy>=0){boss.y=s.y-boss.h;boss.vy=0;break}}
    for(const shot of bossShots){shot.x+=shot.vx;shot.y+=shot.vy;shot.life--;if(overlap(player,shot)){shot.dead=true;hurt()}}
    bossShots=bossShots.filter(s=>!s.dead&&s.life>0&&s.y<H+120);
    if(overlap(player,boss)){
      const stomp=player.vy>1&&player.prevY+player.h<=boss.y+16;
      if(stomp&&boss.invuln<=0){boss.hp--;boss.invuln=35;player.vy=-11;sounds.stomp();game.shake=16;particle(boss.x+boss.w/2,boss.y,'#e96b78',24);score(750);if(boss.hp<=0){boss.dead=true;bossShots=[];score(5000);sounds.goal();particle(boss.x+boss.w/2,boss.y+20,'#ffd45b',50)}}
      else if(game.power==='RUSH'&&boss.invuln<=0){boss.hp--;boss.invuln=45;game.shake=12;particle(boss.x,boss.y,'#ffd45b',18);if(boss.hp<=0){boss.dead=true;bossShots=[];score(5000);sounds.goal()}}
      else if(boss.invuln<=0)hurt();
    }
  }
  function updateExit(){
    if(boss&&!boss.dead)return;
    if(exitGate&&overlap(player,exitGate)){
      game.mode='levelComplete';score(2000+game.health*250);sounds.goal();
      const next=game.levelIndex+2;if(next>game.unlocked&&next<=LEVELS.length){game.unlocked=next;localStorage.setItem('seedAscentUnlocked',String(next))}
    }
  }

  function step(){
    if(game.mode!=='playing')return;
    updateMoving();updatePlayer();
    if(game.mode!=='playing')return;
    updateCoins();updatePowerups();updateHazards();updateEnemies();updateCheckpoints();updateBoss();updateExit();
    if(game.powerTimer>0&&--game.powerTimer<=0){game.power='NONE';sync()}
    for(const p of particles){p.x+=p.vx;p.y+=p.vy;p.vy+=.18;p.life--}
    particles=particles.filter(p=>p.life>0);
    const target=clamp(player.x-W*.38,0,game.level.width-W);game.cameraX+=(target-game.cameraX)*.11;
    if(game.shake>0)game.shake*=.82;sync();
  }

  function px(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.floor(x),Math.floor(y),Math.ceil(w),Math.ceil(h))}
  function background(){
    const t=game.level||LEVELS[game.selectedLevel],g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,t.sky[0]);g.addColorStop(1,t.sky[1]);ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    const cam=game.cameraX||0;ctx.globalAlpha=.22;ctx.fillStyle='#143525';
    for(let i=-1;i<9;i++){const x=i*260-(cam*.16%260);ctx.beginPath();ctx.moveTo(x,H);ctx.lineTo(x+130,250+(i%2)*40);ctx.lineTo(x+260,H);ctx.fill()}
    ctx.globalAlpha=.13;ctx.fillStyle='#0b2b17';
    for(let i=-1;i<18;i++){const x=i*120-(cam*.32%120);ctx.fillRect(x+55,330,10,130);ctx.beginPath();ctx.ellipse(x+45,345,25,11,-.4,0,Math.PI*2);ctx.ellipse(x+76,348,25,11,.4,0,Math.PI*2);ctx.fill()}
    ctx.globalAlpha=1;
  }
  function drawPlayer(){
    if(player.invuln>0&&Math.floor(player.invuln/5)%2===0)return;
    ctx.save();ctx.translate(player.x+17,player.y+21+(player.grounded&&Math.abs(player.vx)>1?Math.sin(player.anim)*2:0));if(player.facing<0)ctx.scale(-1,1);
    ctx.fillStyle=game.power==='RUSH'?'#db8fff':game.power==='LIGHT'?'#d9db75':'#79985e';ctx.beginPath();ctx.ellipse(0,3,16,19,-.15,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#e6ffd455';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,3,7,15,-.15,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#fff';ctx.fillRect(5,-5,4,4);ctx.fillStyle='#172016';ctx.fillRect(7,-4,2,2);
    ctx.strokeStyle='#6fd17d';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,-14);ctx.quadraticCurveTo(-3,-23,2,-30);ctx.stroke();ctx.fillStyle='#69c875';ctx.beginPath();ctx.ellipse(-4,-30,9,4,-.4,0,Math.PI*2);ctx.ellipse(6,-28,9,4,.4,0,Math.PI*2);ctx.fill();
    if(game.shield){ctx.strokeStyle='#8ce2ff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,27,0,Math.PI*2);ctx.stroke()}ctx.restore();
  }
  function world(){
    const ox=-game.cameraX+(game.shake?rand(-game.shake,game.shake):0),t=game.level;ctx.save();ctx.translate(ox,0);
    for(const pit of pitRanges){px(pit.x,pit.y,pit.w,H-pit.y,'#050709');ctx.fillStyle='#301625';for(let x=pit.x+8;x<pit.x+pit.w;x+=18){ctx.beginPath();ctx.moveTo(x,pit.y+8);ctx.lineTo(x+6,pit.y+30);ctx.lineTo(x+12,pit.y+8);ctx.fill()}}
    for(const s of solids){let c=t.ground;if(s.type==='stone')c='#5a6067';if(s.type==='brick')c='#74513f';if(s.type==='ice')c='#8ec6d7';px(s.x,s.y,s.w,s.h,c);px(s.x,s.y,s.w,5,t.accent)}
    for(const m of movingPlatforms){px(m.x,m.y,m.w,m.h,'#557c5a');px(m.x,m.y,m.w,4,'#a4e9a8')}
    for(const b of blocks){if(b.broken)continue;const y=b.y-(b.bump>0?Math.sin(b.bump/10*Math.PI)*8:0);if(b.bump>0)b.bump--;px(b.x,y,b.w,b.h,b.used?'#6a604b':'#b48a3b');px(b.x+4,y+4,b.w-8,b.h-8,b.used?'#514a3e':'#d0a94f');ctx.fillStyle=b.used?'#887e69':'#fff2ad';ctx.font='bold 24px monospace';ctx.fillText(b.used?'·':'?',b.x+16,y+32)}
    for(const c of coins){const y=c.y+Math.sin(c.bob)*5;ctx.fillStyle='#f4f7ff';ctx.beginPath();ctx.arc(c.x+10,y+10,9,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#bde9ff';ctx.lineWidth=3;ctx.stroke()}
    for(const p of powerups){ctx.fillStyle={LIGHT:'#ffe36d',SHIELD:'#8ce2ff',RUSH:'#e79cff'}[p.type];ctx.beginPath();ctx.arc(p.x+14,p.y+14,14,0,Math.PI*2);ctx.fill();ctx.fillStyle='#142016';ctx.font='bold 15px monospace';ctx.fillText(p.type==='LIGHT'?'☀':p.type==='SHIELD'?'M':'R',p.x+7,p.y+20)}
    for(const cp of checkpoints){px(cp.x+12,cp.y,6,cp.h,cp.active?'#ffe36d':'#d5ded6');ctx.fillStyle=cp.active?'#ffe36d':'#79b781';ctx.beginPath();ctx.moveTo(cp.x+18,cp.y+5);ctx.lineTo(cp.x+55,cp.y+18);ctx.lineTo(cp.x+18,cp.y+32);ctx.fill()}
    for(const h of hazards){const pulse=.65+Math.sin(h.phase)*.18;ctx.globalAlpha=pulse;ctx.fillStyle=h.type==='spill'?'#85c94c':h.type==='mold'?'#7b6aa8':h.type==='crystal'?'#a7ecff':h.type==='heat'?'#ff704f':h.type==='resin'?'#d3a8ff':'#b35c47';if(h.type==='roots'){for(let x=h.x;x<h.x+h.w;x+=18){ctx.beginPath();ctx.moveTo(x,h.y+h.h);ctx.lineTo(x+9,h.y);ctx.lineTo(x+18,h.y+h.h);ctx.fill()}}else ctx.fillRect(h.x,h.y,h.w,h.h);ctx.globalAlpha=1}
    if(exitGate){const locked=boss&&!boss.dead;px(exitGate.x+10,exitGate.y,8,exitGate.h,locked?'#75666a':'#d9e1d9');px(exitGate.x+18,exitGate.y+18,52,60,locked?'#552735':'#2b7137');px(exitGate.x+24,exitGate.y+24,40,48,locked?'#8c4558':'#82c987');ctx.fillStyle='#efffe8';ctx.font='bold 18px monospace';ctx.fillText(locked?'LOCK':'DTF',exitGate.x+21,exitGate.y+55)}
    if(boss&&!boss.dead){const flash=boss.invuln>0&&Math.floor(boss.invuln/4)%2===0;ctx.fillStyle=flash?'#fff':'#9b3248';ctx.beginPath();ctx.ellipse(boss.x+boss.w/2,boss.y+boss.h/2,boss.w/2,boss.h/2,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#d95f72';for(const sx of [10,30,50,68])ctx.fillRect(boss.x+sx,boss.y-8,6,18);ctx.fillStyle='#fff';ctx.fillRect(boss.x+20,boss.y+18,10,8);ctx.fillRect(boss.x+48,boss.y+18,10,8);px(boss.x,boss.y-16,boss.w,7,'#35151d');px(boss.x,boss.y-16,boss.w*(boss.hp/boss.maxHp),7,'#ff7c8f')}
    for(const shot of bossShots){ctx.fillStyle='#c97cff';ctx.beginPath();ctx.arc(shot.x+7,shot.y+7,7,0,Math.PI*2);ctx.fill()}
    for(const e of enemies){const c=e.type==='MITE'?'#e95858':e.type==='CATERPILLAR'?'#7c61b9':e.type==='GNAT'?'#6ab5dc':'#c46b42';ctx.fillStyle=c;if(e.type==='GNAT'){ctx.beginPath();ctx.ellipse(e.x+e.w/2,e.y+e.h/2,e.w/2,e.h/2,0,0,Math.PI*2);ctx.fill()}else px(e.x,e.y,e.w,e.h,c);ctx.fillStyle='#fff';ctx.fillRect(e.x+7,e.y+8,5,5);ctx.fillRect(e.x+e.w-12,e.y+8,5,5);if(e.maxHp>1){px(e.x,e.y-8,e.w,4,'#391c25');px(e.x,e.y-8,e.w*(e.hp/e.maxHp),4,'#9cff83')}}
    for(const p of particles){ctx.globalAlpha=clamp(p.life/35,0,1);px(p.x,p.y,p.s,p.s,p.color)}ctx.globalAlpha=1;drawPlayer();ctx.restore();
  }
  function overlay(title,sub,lines=[]){ctx.fillStyle='#000b';ctx.fillRect(0,0,W,H);ctx.textAlign='center';ctx.fillStyle='#8cf29a';ctx.font='900 48px monospace';ctx.fillText(title,W/2,190);ctx.fillStyle='#f0fff2';ctx.font='bold 20px monospace';ctx.fillText(sub,W/2,236);ctx.fillStyle='#a9c6ad';ctx.font='15px monospace';lines.forEach((l,i)=>ctx.fillText(l,W/2,285+i*28));ctx.textAlign='left'}
  function draw(){
    background();if(game.level)world();
    if(game.mode==='title'){const l=LEVELS[game.selectedLevel];overlay('SEED ASCENT','Retro side-scrolling platform adventure',[`${l.world} · ${l.name}`,`Unlocked worlds: ${game.unlocked}/${LEVELS.length}`,'Run, stomp pests, find power-ups, hit checkpoints, reach the grow gate.','Press START or Space'])}
    else if(game.mode==='paused')overlay('PAUSED',`${game.level.world} · ${game.level.name}`,['Press P or PAUSE to resume']);
    else if(game.mode==='levelComplete'){const last=game.levelIndex===LEVELS.length-1;overlay(last?'HARVEST COMPLETE!':'LEVEL CLEAR!',`${game.level.world} · ${game.level.name}`,last?['You cleared all 12 stages across six grow worlds.','More secrets, bosses and worlds can build on this engine.','Press START to replay.']:[`Next: ${LEVELS[game.levelIndex+1].world} · ${LEVELS[game.levelIndex+1].name}`,'Press START to continue.'])}
    else if(game.mode==='gameOver')overlay('GAME OVER','The pests won this run.',[`Score ${String(game.score).padStart(6,'0')}`,`Best ${String(game.best).padStart(6,'0')}`,'Press START to begin a new run.']);
  }
  function loop(){step();draw();requestAnimationFrame(loop)}

  function jumpPress(){input.jumpPressed=true}
  function jumpRelease(){input.jumpReleased=true;input.jumpHeld=false}
  function togglePause(){if(game.mode==='playing')game.mode='paused';else if(game.mode==='paused')game.mode='playing'}
  function advance(){if(game.levelIndex<LEVELS.length-1){game.selectedLevel=game.levelIndex+1;loadLevel(game.selectedLevel);game.mode='playing'}else{game.mode='title';game.selectedLevel=0;game.level=null}}
  function keyDown(e){
    const k=e.key,lower=k.toLowerCase();if(['ArrowLeft','ArrowRight','ArrowUp',' ','Shift','a','d','w','A','D','W','p','P'].includes(k))e.preventDefault();
    if(k==='ArrowLeft'||lower==='a')input.left=true;if(k==='ArrowRight'||lower==='d')input.right=true;if(k==='Shift')input.run=true;
    if(k===' '||k==='ArrowUp'||lower==='w'){if(!input.jumpHeld){input.jumpHeld=true;jumpPress()}if(game.mode==='title'||game.mode==='gameOver')startSelected();else if(game.mode==='levelComplete')advance()}
    if(lower==='p')togglePause();
  }
  function keyUp(e){const k=e.key,lower=k.toLowerCase();if(k==='ArrowLeft'||lower==='a')input.left=false;if(k==='ArrowRight'||lower==='d')input.right=false;if(k==='Shift')input.run=false;if(k===' '||k==='ArrowUp'||lower==='w')jumpRelease()}
  function hold(id,on,off){const b=document.getElementById(id);if(!b)return;b.addEventListener('pointerdown',e=>{e.preventDefault();audio();try{b.setPointerCapture(e.pointerId)}catch{}on()});['pointerup','pointercancel','lostpointercapture'].forEach(t=>b.addEventListener(t,e=>{e.preventDefault();off()}))}
  hold('leftBtn',()=>input.left=true,()=>input.left=false);hold('rightBtn',()=>input.right=true,()=>input.right=false);hold('runBtn',()=>input.run=true,()=>input.run=false);hold('jumpBtn',()=>{if(!input.jumpHeld){input.jumpHeld=true;jumpPress()}},jumpRelease);
  document.getElementById('startBtn')?.addEventListener('click',()=>{audio();game.mode==='levelComplete'?advance():startSelected()});
  document.getElementById('pauseBtn')?.addEventListener('click',togglePause);
  document.getElementById('restartBtn')?.addEventListener('click',()=>{if(game.level){loadLevel(game.levelIndex);game.mode='playing'}else startSelected()});
  document.getElementById('prevBtn')?.addEventListener('click',()=>{if(game.mode==='playing')return;game.selectedLevel=(game.selectedLevel-1+game.unlocked)%game.unlocked;game.level=null;sync()});
  document.getElementById('nextBtn')?.addEventListener('click',()=>{if(game.mode==='playing')return;game.selectedLevel=(game.selectedLevel+1)%game.unlocked;game.level=null;sync()});
  canvas.addEventListener('pointerdown',()=>{audio();canvas.focus()});
  window.addEventListener('keydown',keyDown,{passive:false});window.addEventListener('keyup',keyUp,{passive:false});
  window.addEventListener('blur',()=>{input.left=input.right=input.run=input.jumpHeld=input.jumpPressed=input.jumpReleased=false});

  window.__seedAscentDebug={
    snapshot(){return {mode:game.mode,levelIndex:game.levelIndex,player:{x:player.x,y:player.y,vx:player.vx,vy:player.vy,grounded:player.grounded},maxSafePit:MAX_SAFE_PIT,pits:pitRanges.map(p=>p.w),enemyCount:enemies.length,powerupCount:powerups.length}},
    start(){startSelected()},
  };

  sync();loop();
})();
