// (window.controller = new Leap.Controller)
window.gestures = [];
const c = document.getElementById("drawingCanvas");
c.width = window.innerWidth;
c.height = window.innerHeight;
let motions = [];
let spellFoundTime = 0;

  window.controller = Leap.loop({enableGestures:true}, function(frame){
    let appX = window.innerWidth;
    let appY = window.innerHeight;
    const timeSinceLastSpell = Date.now() - spellFoundTime ;

    if (timeSinceLastSpell < 2000 && timeSinceLastSpell > 1700 ) {
        $('.marker').removeClass('active');
      //clears the canvas and updates its size
      c.width = window.innerWidth;
      c.height = window.innerHeight;
      const ctx = c.getContext("2d");
      ctx.clearRect(0, 0,c.width, c.height);

    }

    if(frame.hands.length) {
      let handPos = handPosition(frame.hands[0], appX, appY);

      if(frame.gestures.length) {
        if (isRightSwipe(frame.gestures)) {
          motions.push({direction: 'right', time: Date.now()});
          console.log('right');
          $('.marker').removeClass('active');
          $('.marker.right').addClass('active');
        }

        else if (isLeftSwipe(frame.gestures)) {
          motions.push({direction: 'left', time: Date.now()});
          console.log('left');
          $('.marker').removeClass('active');
          $('.marker.left').addClass('active');
        }

        else if(isDownSwipe(frame.gestures)) {
          motions.push({direction: 'down', time: Date.now()});
          console.log('down');
          $('.marker').removeClass('active');
          $('.marker.down').addClass('active');
        }
        else if(isUpSwipe(frame.gestures)) {
          motions.push({direction: 'up', time: Date.now()});
          console.log('up');
          $('.marker').removeClass('active');
          $('.marker.up').addClass('active');
        }
        else {
        }
        
        window.gestures.push({gs :frame.gestures, time: Date.now()});
      }

      if(timeSinceLastSpell > 2000) {
        drawPoint(handPos);
        
        if(isWingardiumLeviosa(motions)) {
          console.log('wingardium leviosa!', motions);
          spellFoundTime = Date.now();
          doLevitate();
        }

        else if(isSilencio(motions)) {
          console.log('Silencio!', motions);
          spellFoundTime = Date.now();
          stopMusic();
        }

        else if(isFiniteIncantatem(motions)) {
          console.log('finite incantatem', motions);
          spellFoundTime = Date.now();
          endSpells();
        }

        else if (isLumos(motions)) {
          console.log('lumos', motions);
          spellFoundTime = Date.now();
          doIlluminate();
        }

        else if (isNox(motions)) {
          console.log('nox', motions);
          spellFoundTime = Date.now();
          doDarken();
        }
      } else {
        motions = [];
      }
    }
  });

let isFiniteIncantatem = (motions) => {
  const sequence = ['right', 'left', 'right'];
  return containsSequence(motions, sequence, 3);
  
};

let isWingardiumLeviosa = (motions) => {
  //look for a right followed by a down within 3 seconds from the current time
  const sequence = ['right', 'up', 'down'];
  return containsSequence(motions, sequence, 3);
  
};

let hasHorizontalMotion = (motions) => {
  const sequence = ['right'];
  return containsSequence(motions, ['right'], 3) || containsSequence(motions, ['left'], 3);
};

let isSilencio = (motions) => {
  const sequence = ['left', 'down'];
  return containsSequence(motions, sequence, 2);
  
};

let isLumos = (motions) => {
  const sequence = ['up', 'up', 'up', 'up'];
  return !hasHorizontalMotion(motions) && containsSequence(motions, sequence, 1);
};

let isNox = (motions) => {
  const sequence = ['down', 'down', 'down', 'down', 'down', 'down'];
  return !hasHorizontalMotion(motions) && containsSequence(motions, sequence, .1);
};

let findNextDirectionIndex = (list, direction) => {
  return list.findIndex((item) => item.direction === direction);
};

let containsSequence = (list, sequence, seconds) => {
  
  rest = list.filter((event) => {
    return Date.now() - event.time < (seconds * 1000);
  }); //trim off the end of the list

  let containsSequence = true;
  sequence.forEach((direction) => {
    let firstItemIndex = findNextDirectionIndex(rest, direction);
    if(firstItemIndex == -1) {
      containsSequence = false;
    }
    rest = rest.slice(firstItemIndex );
  });

  return containsSequence;
};



let isRightSwipe = (gestures) => {
  return gestures.every(isRightMotion);
};

let isRightMotion = (gesture) => {
  const direction = gesture.direction;
  return direction && direction[0] > 0 && xIsBigger(direction);
};

let isLeftSwipe = (gestures) => {
  return gestures.every(isLeftMotion);
};

let isLeftMotion = (gesture) => {
  const direction = gesture.direction;
  return direction && direction[0] < 0 && xIsBigger(direction);
};

let isDownSwipe = (gestures) => {
  return gestures.every(isDownMotion);
};

let isDownMotion = (gesture) => {
  const direction = gesture.direction;
  return direction && direction[1] < 0 && !xIsBigger(direction);
};

let isUpSwipe = (gestures) => {
  return gestures.every(isUpMotion);
};

let isUpMotion = (gesture) => {
  const direction = gesture.direction;
  return direction && direction[1] > 0 && !xIsBigger(direction);
};

let xIsBigger = (direction) => {
  return Math.abs(direction[0]) > Math.abs(direction[1]);
};

let handPosition = (hand, appX, appY) => {
  var palmPoint = hand.palmPosition;
  var iBox = hand.frame.interactionBox;
  var normalizedPoint = iBox.normalizePoint(palmPoint, true);
  let x = normalizedPoint[0] * appX;
  let y = (1 - normalizedPoint[1]) * appY;

  return [x ,y];
  
};

const drawPoint = (point) => {
  const c = document.getElementById("drawingCanvas");

  const ctx = c.getContext("2d");
  ctx.moveTo(0,0);
  ctx.lineTo(200,100);
  ctx.fillStyle = 'rebeccapurple';
  ctx.fillRect(point[0] - 5,point[1] - 5,10,10);
};


const doLevitate = () => {
  $('.feather.clone.feather--dead').remove();
  let yPosition = Math.random() * (window.innerWidth - 200);
  let clone = $('.feather').first().clone().addClass('clone');
  clone.css('left', `${yPosition}px`);
  $('body').append(clone);

  requestAnimationFrame(() => {
    $('.feather.clone').addClass('feather--floating');
  });
};

const doIlluminate = () => {
  $('canvas').removeClass('dark');
  $('canvas').addClass('light');
};

const doDarken = () => {
  $('canvas').removeClass('light');
  $('canvas').addClass('dark');
};

const stopMusic = () => {
  $('audio')[0].pause();
};

const endSpells = () => {
  $('canvas').removeClass('dark');
  $('canvas').removeClass('light');
  $('audio')[0].play();
  $('.feather.clone').removeClass('feather--floating');
  $('.feather.clone').addClass('feather--dead');

};

window.doLevitate = doLevitate;
window.endSpells = endSpells;
