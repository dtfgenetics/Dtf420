(()=>{
  'use strict';

  const api=window.SEED_ASCENT_PLAYER_ANIMATION;
  const authored=window.SEED_ASCENT_AUTHORED_SPRITES;
  const debug=window.__seedAscentDebug;
  const canvas=document.getElementById('game');
  if(!api?.createController||!debug?.snapshot||!canvas)return;

  const controller=api.createController();
  let previous=null;
  let lastTime=performance.now();
  let currentPower='NONE';

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
    const target=authored?.getTarget?.(snapshot.state,currentPower)||null;
    const sheetKey=target?.key||'fallback';
    const authoredReady=target?.status==='ready';
    canvas.dataset.playerAnimation=snapshot.state;
    canvas.dataset.playerAnimationFrame=String(snapshot.frame);
    canvas.dataset.playerAuthoredFrame=String(snapshot.authoredFrame);
    canvas.dataset.playerAnimationPriority=String(snapshot.priority);
    canvas.dataset.playerAnimationSheet=sheetKey;
    canvas.dataset.playerAnimationSheetStatus=target?.status||'fallback';
    canvas.dataset.playerAnimationUsingAuthored=String(authoredReady);
  }

  function tick(now){
    const current=debug.snapshot();
    if(current?.player){
      currentPower=current.power||'NONE';
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
    snapshot:()=>({
      ...controller.snapshot(),
      power:currentPower,
      authored:authored?.getTarget?.(controller.snapshot().state,currentPower)||null,
      authoredAssets:authored?.snapshot?.()||{},
    }),
    trigger:(event,payload)=>controller.trigger(event,payload),
    reset:()=>controller.reset(),
  };

  publish(controller.snapshot());
  requestAnimationFrame(tick);
})();
