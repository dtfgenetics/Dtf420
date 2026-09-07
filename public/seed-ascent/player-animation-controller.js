(()=>{
  'use strict';

  const manifest=window.SEED_ASCENT_ANIMATIONS;
  if(!manifest)return;

  const PRIORITY={idle:0,run:0,jump:1,fall:1,land:2,transform:3,revert:3,fireAttack:4,electricAttack:4,iceAttack:4,hurt:5};
  const NON_LOOPING=new Set(['land','hurt','fireAttack','electricAttack','iceAttack','transform','revert']);

  function createController(){
    let state='idle';
    let elapsed=0;
    let forcedUntil=0;
    let previousMovement='idle';

    function config(name=state){return manifest.states?.[name]||manifest.states.idle}
    function duration(name=state){
      const c=config(name);return Math.max(1,(c.authoredFrames||c.frames?.length||1)/Math.max(1,c.fps||1));
    }
    function setState(next,{force=false}={}){
      if(!manifest.states?.[next])return state;
      const activePriority=PRIORITY[state]||0,nextPriority=PRIORITY[next]||0;
      if(!force&&forcedUntil>0&&nextPriority<activePriority)return state;
      if(next!==state){state=next;elapsed=0;forcedUntil=NON_LOOPING.has(next)?duration(next):0}
      return state;
    }
    function trigger(event,payload={}){
      if(event==='hurt')return setState('hurt',{force:true});
      if(event==='land')return setState('land');
      if(event==='transform')return setState('transform',{force:true});
      if(event==='revert')return setState('revert',{force:true});
      if(event==='attack'){
        const attack=manifest.resolveAttack(payload.power);if(attack)return setState(attack,{force:true});
      }
      return state;
    }
    function update(dt,player){
      const seconds=Math.max(0,Number(dt)||0);elapsed+=seconds;if(forcedUntil>0)forcedUntil=Math.max(0,forcedUntil-seconds);
      const movement=manifest.resolveMovement(player);
      if(previousMovement!=='idle'&&movement==='idle'&&player?.grounded&&Math.abs(player?.vy||0)<.25)trigger('land');
      previousMovement=movement;
      if(forcedUntil<=0)setState(movement,{force:true});
      return snapshot();
    }
    function frame(){
      const c=config();const frames=c.frames||[0];const fps=Math.max(1,c.fps||1);
      const index=Math.floor(elapsed*fps);
      if(c.loop)return frames[index%frames.length];
      return frames[Math.min(frames.length-1,index)];
    }
    function authoredFrame(){
      const c=config();const count=Math.max(1,c.authoredFrames||c.frames?.length||1),fps=Math.max(1,c.fps||1);
      const index=Math.floor(elapsed*fps);return c.loop?index%count:Math.min(count-1,index);
    }
    function snapshot(){return {state,elapsed,forcedUntil,frame:frame(),authoredFrame:authoredFrame(),priority:PRIORITY[state]||0}}
    function reset(){state='idle';elapsed=0;forcedUntil=0;previousMovement='idle';return snapshot()}
    return {update,trigger,setState,frame,authoredFrame,snapshot,reset};
  }

  window.SEED_ASCENT_PLAYER_ANIMATION={createController,priority:{...PRIORITY}};
})();
