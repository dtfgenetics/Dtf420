(()=>{
  'use strict';

  const authored=window.SEED_ASCENT_AUTHORED_SPRITES;
  const canvas=document.getElementById('game');
  const proto=window.CanvasRenderingContext2D?.prototype;
  if(!authored?.getTarget||!canvas||!proto)return;

  const PATCH=Symbol.for('dtf.seedAscent.authoredSpriteRenderer');
  if(proto[PATCH])return;

  const original=proto.drawImage;
  const fallbackSuffix='/seed-ascent/assets/seed-man-sprites.webp';

  function isSeedManFallback(image){
    const src=String(image?.currentSrc||image?.src||'');
    return src.endsWith(fallbackSuffix)||src.includes(`${fallbackSuffix}?`);
  }

  function authoredDraw(context,args){
    if(context.canvas!==canvas||args.length!==9)return false;
    const [fallbackImage,,,,,dx,dy,dw,dh]=args;
    if(!isSeedManFallback(fallbackImage))return false;

    const state=canvas.dataset.playerAnimation||'idle';
    const power=canvas.dataset.playerAnimationPower||canvas.dataset.playerForm||'NONE';
    const frame=Math.max(0,Number.parseInt(canvas.dataset.playerAuthoredFrame||'0',10)||0);
    const selected=authored.getTarget(state,power);
    const target=selected?.target;
    const image=selected?.image;
    if(selected?.status!=='ready'||!target||!image?.complete||!image.naturalWidth)return false;

    const row=target.states?.indexOf(state)??-1;
    if(row<0)return false;
    const columns=Math.max(1,target.columns||8);
    const frameWidth=Math.max(1,target.frameWidth||222);
    const frameHeight=Math.max(1,target.frameHeight||222);
    const sx=(frame%columns)*frameWidth;
    const sy=row*frameHeight;
    const previousFilter=context.filter;
    context.filter='none';
    original.call(context,image,sx,sy,frameWidth,frameHeight,dx,dy,dw,dh);
    context.filter=previousFilter;
    canvas.dataset.playerRenderedSheet=selected.key;
    canvas.dataset.playerRenderedAuthored='true';
    return true;
  }

  proto.drawImage=function(...args){
    if(!authoredDraw(this,args)){
      if(this.canvas===canvas&&isSeedManFallback(args[0])){
        canvas.dataset.playerRenderedSheet='fallback';
        canvas.dataset.playerRenderedAuthored='false';
      }
      return original.apply(this,args);
    }
  };

  Object.defineProperty(proto,PATCH,{value:true,configurable:false,enumerable:false,writable:false});
  window.__seedAscentAuthoredRenderer={
    active:true,
    snapshot:()=>({
      requestedSheet:canvas.dataset.playerAnimationSheet||'base',
      renderedSheet:canvas.dataset.playerRenderedSheet||'fallback',
      usingAuthored:canvas.dataset.playerRenderedAuthored==='true',
      state:canvas.dataset.playerAnimation||'idle',
      frame:Number.parseInt(canvas.dataset.playerAuthoredFrame||'0',10)||0,
    }),
  };
})();
