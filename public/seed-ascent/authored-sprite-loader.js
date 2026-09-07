(()=>{
  'use strict';

  const manifest=window.SEED_ASCENT_ANIMATIONS;
  if(!manifest)return;

  const images=new Map();
  const status=new Map();

  function register(key,target){
    if(!target?.src)return;
    const image=new Image();
    images.set(key,image);
    status.set(key,'loading');
    image.addEventListener('load',()=>status.set(key,'ready'),{once:true});
    image.addEventListener('error',()=>status.set(key,'missing'),{once:true});
    image.src=target.src;
  }

  register('base',manifest.authoredTargets?.base);
  register('fire',manifest.authoredTargets?.fire);
  register('electric',manifest.authoredTargets?.electric);
  register('ice',manifest.authoredTargets?.ice);

  function keyForState(state,power){
    if(state==='fireAttack'||(power==='FIRE'&&(state==='transform'||state==='revert')))return 'fire';
    if(state==='electricAttack'||(power==='ELECTRIC'&&(state==='transform'||state==='revert')))return 'electric';
    if(state==='iceAttack'||(power==='ICE'&&(state==='transform'||state==='revert')))return 'ice';
    return 'base';
  }

  function getTarget(state,power){
    const key=keyForState(state,power);
    return {key,target:manifest.authoredTargets?.[key]||null,image:images.get(key)||null,status:status.get(key)||'unregistered'};
  }

  function isReady(state,power){
    return getTarget(state,power).status==='ready';
  }

  function snapshot(){
    return Object.fromEntries([...status.entries()].map(([key,value])=>[key,{status:value,src:manifest.authoredTargets?.[key]?.src||null}]));
  }

  window.SEED_ASCENT_AUTHORED_SPRITES={getTarget,isReady,snapshot,keyForState};
})();
