(()=>{
  'use strict';

  const api=window.SEED_ASCENT_PLAYER_ANIMATION;
  const debug=window.__seedAscentDebug;
  const canvas=document.getElementById('game');
  if(!api?.createController||!debug?.snapshot||!canvas)return;

  const controller=api.createController();
  let previous=null;
  let lastTime=performance.now();

  function triggerFromDiff(current){
    if(!previous)return;
    if(current.health<previous.health)controller.trigger('hurt');
    if(current.power!==previous.power){
      if(current.power==='NONE')controller.trigger('revert');
      else if(previous.power==='NONE'||current.power!==previous.power)controller.trigger('transform');
    }
    const attackStarted=(current.attackCooldown||0)>(previous.attackCooldown||0);
    if(attackStarted&&['FIRE','ELECTRIC','ICE'].includes(current.power))controller.trigger('attack',{power:current.power});
  }

  function publish(snapshot){
    canvas.dataset.playerAnimation=snapshot.state;
    canvas.dataset.playerAnimationFrame=String(snapshot.frame);
    canvas.dataset.playerAuthoredFrame=String(snapshot.authoredFrame);
    canvas.dataset.playerAnimationPriority=String(snapshot.priority);
  }

  function tick(now){
    const current=debug.snapshot();
    if(current?.player){
      triggerFromDiff(current);
      const dt=Math.min(.1,Math.max(0,(now-lastTime)/1000));
      const state=controller.update(dt,current.player);
      publish(state);
      previous=current;
    }
    lastTime=now;
    requestAnimationFrame(tick);
  }

  window.__seedAscentAnimation={
    snapshot:()=>controller.snapshot(),
    trigger:(event,payload)=>controller.trigger(event,payload),
    reset:()=>controller.reset(),
  };

  publish(controller.snapshot());
  requestAnimationFrame(tick);
})();
