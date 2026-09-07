(()=>{
  'use strict';

  const fallbackSheet='/seed-ascent/assets/seed-man-sprites.webp';

  const states={
    idle:{frames:[0],fps:4,loop:true,anchor:[0.5,0.86],targetFrames:6},
    run:{frames:[1,2,3,2],fps:10,loop:true,anchor:[0.5,0.86],targetFrames:8},
    jump:{frames:[4],fps:8,loop:false,anchor:[0.5,0.86],targetFrames:4},
    fall:{frames:[5],fps:8,loop:true,anchor:[0.5,0.86],targetFrames:4},
    land:{frames:[5,0],fps:12,loop:false,anchor:[0.5,0.86],targetFrames:4},
    hurt:{frames:[5,0,5],fps:12,loop:false,anchor:[0.5,0.86],targetFrames:4},
    fireAttack:{frames:[0,1,0],fps:14,loop:false,anchor:[0.5,0.86],power:'FIRE',targetFrames:8},
    electricAttack:{frames:[0,2,0],fps:14,loop:false,anchor:[0.5,0.86],power:'ELECTRIC',targetFrames:8},
    iceAttack:{frames:[0,3,0],fps:14,loop:false,anchor:[0.5,0.86],power:'ICE',targetFrames:8},
    transform:{frames:[0,1,2,3,0],fps:12,loop:false,anchor:[0.5,0.86],targetFrames:6},
    revert:{frames:[3,2,1,0],fps:12,loop:false,anchor:[0.5,0.86],targetFrames:5},
  };

  const authoredTargets={
    base:{src:'/seed-ascent/assets/seed-man-base-animations.webp',frameWidth:222,frameHeight:222,columns:8,rows:6,states:['idle','run','jump','fall','land','hurt']},
    fire:{src:'/seed-ascent/assets/seed-man-fire-animations.webp',frameWidth:222,frameHeight:222,columns:8,rows:3,states:['fireAttack','transform','revert']},
    electric:{src:'/seed-ascent/assets/seed-man-electric-animations.webp',frameWidth:222,frameHeight:222,columns:8,rows:3,states:['electricAttack','transform','revert']},
    ice:{src:'/seed-ascent/assets/seed-man-ice-animations.webp',frameWidth:222,frameHeight:222,columns:8,rows:3,states:['iceAttack','transform','revert']},
  };

  const worldMotion={
    '1-1':['pollen','leafDrift'],
    '1-2':['leafDrift','canopySway'],
    '2-1':['tunnelDust','rootPulse'],
    '2-2':['petals','flowerSway'],
    '3-1':['trichomeSparkle','crystalGlint'],
    '3-2':['embers','harvestDust'],
    '4-1':['heatShimmer','dryLeafDrift'],
    '4-2':['rootSpores','ruinDust'],
    '5-1':['resinDroplets','mist'],
    '5-2':['mist','coldSparkle'],
    '6-1':['stormStreaks','electricPulse'],
    '6-2':['trichomeSparkle','finalePulse'],
  };

  window.SEED_ASCENT_ANIMATIONS={
    version:1,
    fallback:{src:fallbackSheet,frameWidth:222,frameHeight:222,columns:4,rows:2},
    states,
    authoredTargets,
    worldMotion,
    resolveMovement(player){
      if(!player?.grounded)return player?.vy<0?'jump':'fall';
      return Math.abs(player?.vx||0)>1?'run':'idle';
    },
    resolveAttack(power){
      return power==='FIRE'?'fireAttack':power==='ELECTRIC'?'electricAttack':power==='ICE'?'iceAttack':null;
    },
  };
})();
