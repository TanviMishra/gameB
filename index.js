// asset variables
let fenceH;
let fenceLT;
let fenceRT;
let fenceV;
let fence;
let grass;
let dogIdleL, dogIdleR;
let dogWalkL, dogWalkR;
let sheepWalk;
let sheepCountImg, clockImg;
let sheepBleatSound;
let dogBarkSound;
// shared variables
let shared;
let ptShareds;
let myShared;
// previous move value, generated on each 10th frame
let prevMoveVal0 = 0;
let prevMoveVal1 = 0;
let prevMoveVal2 = 0;
let prevMoveVal3 = 0;
let prevMoveVal4 = 0;
let prevMoveVal5 = 0;
let prevMoveVal6 = 0;
let prevMoveVal7 = 0;
let prevMoveVal8 = 0;
let prevMoveVal9 = 0;

let hit1 = false;
let hit2 = false;
let hit3 = false;
let fenceTempColor; // the alpha value should always be zero to make it transparent
let dogRadius = 20;
let sheepRadius = 20;
let dogFenceHit = false;
let sheepFenceHit = false;
let fenceWidth = 24;
let fenceHeight = 200;
let fenceStartX;
let fenceStartY;
let lastDirection = "right"

//stage values to change instructions
let pageNum=0;
let instructions=[];
let colA = {r:0, g:0, b:0};
let colB = {r:0, g:0, b:0};

//win check
let playerWin=false;

function preload() {
  // load assets
  fenceH = loadImage("assets/fenceH.jpg");
  fenceLT = loadImage("assets/fenceLT.jpg");
  fenceRT = loadImage("assets/fenceRT.jpg");
  fenceV = loadImage("assets/fenceV.jpg");
  fence = loadImage("assets/fence.jpg");
  grass = loadImage("assets/grass.jpg");
  dogIdleL = loadImage("assets/dogidleL.gif");
  dogWalkL = loadImage("assets/dogwalkL.gif");
  dogIdleR = loadImage("assets/dogidleR.gif");
  dogWalkR = loadImage("assets/dogwalkR.gif");
  sheepWalk = loadImage("assets/sheepwalk.gif");
  sheepCountImg = loadImage("assets/sheepcount.png");
  clockImg = loadImage("assets/clock.png");
  sheepBleatSound = loadSound("assets/sheep-bleating.wav");
  dogBarkSound = loadSound("assets/dog-bark.wav");
  for (let i = 1; i < 6; i++){
    instructions[i] = loadImage('assets/instruct/' + i + '.png');
  }
  winScreen=loadImage('assets/won.png');
  loseScreen=loadImage('assets/lost.png')
  // connect & init shared variables
  partyConnect(
    "wss://deepstream-server-1.herokuapp.com",
    "sheep_movement_tm",
    "main"
  );
  shared = partyLoadShared("shared");
  ptShareds = partyLoadParticipantShareds();
  myShared = partyLoadMyShared();
}
function setup() {
  partyToggleInfo(false); //hide p5party toggle info
  createCanvas(700, 700);
  fenceTempColor = color(28, 91, 194, 0);
  // set fence to center of canvas
  fenceStartX = width / 2 - fenceHeight / 2;
  fenceStartY = height / 2 - fenceHeight / 2;
  // first client init
  if (partyIsHost()) {
    shared.sheepXY = [];
    shared.gameStartTime = moment(); // https://momentjs.com/
  }
  // keeps record of which sheeps are in range of this dog
  myShared.sheepsInRange = [];
  // init dog & sheep positions
  // 1st dog at top-left, 2nd at top-right...
  if (ptShareds.length % 4 === 1) {
    myShared.dogX = 30;
    myShared.dogY = 30;
  } else if (ptShareds.length % 4 === 2) {
    myShared.dogX = width - 30;
    myShared.dogY = 30;
  } else if (ptShareds.length % 4 === 3) {
    myShared.dogX = 30;
    myShared.dogY = height - 30;
  } else {
    myShared.dogX = width - 30;
    myShared.dogY = height - 30;
  }
  myShared.dogRunning = false;
  // 10 sheeps for each user at random positions
  if (shared.sheepXY.length < ptShareds.length * 10) {
    for (let i = 0; i < 10; i++) {
      shared.sheepXY.push({
        id: random(),
        x: (width - 60) * random() + 30,
        y: (height - 60) * random() + 30,
      });
    }
  }
  // change angle mode to degrees
  angleMode(DEGREES);
  // change image mode to center
  imageMode(CENTER);
  // subscribe to play dog bark events
  partySubscribe("playDogBark", onPlayDogBark);
  partySubscribe("stopPlayDogBark", onStopPlayDogBark);
  // subscribe to play sheep bleat events
  partySubscribe("playSheepBleat", onPlaySheepBleat);
  partySubscribe("stopPlaySheepBleat", onStopPlaySheepBleat);
}
function draw() {
  switch(pageNum){
    case 0:
      background(220);
      instructPage(pageNum+1);
      break;
    case 1:
      background(220);
      instructPage(pageNum+1);
      break;
    case 2:
      background(220);
      instructPage(pageNum+1);
      break;
    case 3:
      background(220);
      instructPage(pageNum+1);
      break;
    case 4:
      background(220);
      instructPage(pageNum+1);
      break;
    case 5:
      background(220);
      playGame();
      break;
  }
}
function instructPage(num){
  // draw assets
  textSize(35);
  image(instructions[num],350,350,width,height)
  fill(colB.r, colB.g, colB.b);
  // rect(58,655,100,50)
  text("NEXT",565,685);
  fill(colA.r, colA.g, colA.b);
  if(num>1){
    text("BACK",58,685);
  }
  else{
    text("SKIP",58,685);
  }
  if(mouseX>565 && mouseX<665 && mouseY>655 && mouseY<705){
    colB = {r:200, g:200, b:200};
  }else{
    colB = {r:0, g:0, b:0};
  }
  if(mouseX>58 && mouseX<158 && mouseY>655 && mouseY<705){
    colA = {r:200, g:200, b:200};
  }else{
    colA = {r:0, g:0, b:0};
  }
}
function playGame(){
  // draw assets
  drawAssets();

 
  let noDogRunning = true;
  ptShareds.forEach((partcpt, idx) => {
    noStroke();
    fill(color(138, 48, 0));
    if (partcpt.dogRunning) {
      // a dog is running
      noDogRunning = false;
      // if(keyIsPressed){
      //   if(keyIsDown(LEFT_ARROW)){
      //     image(dogWalkL, partcpt.dogX, partcpt.dogY, 56, 56);
      //     lastDirection = "left";
      //   }else if(keyIsDown(RIGHT_ARROW)){
      //     image(dogWalkR, partcpt.dogX, partcpt.dogY, 56, 56);
      //     lastDirection = "right"
      //   }else{
      //     if(lastDirection === "left"){
      //       image(dogWalkL, partcpt.dogX, partcpt.dogY, 56, 56);
      //     }else if(lastDirection === "right"){
      //       image(dogIdleR, partcpt.dogX, partcpt.dogY, 56, 56);
      //     }
      //   }
      // }
      image(dogIdleR, partcpt.dogX, partcpt.dogY, 56, 56);
      
      partyEmit("playDogBark");
    } else {
      // if(lastDirection === "left"){
      //   image(dogIdleL, partcpt.dogX, partcpt.dogY, 56, 56);
      // }else if(lastDirection === "right"){
      //   image(dogIdleR, partcpt.dogX, partcpt.dogY, 56, 56);
      // }
      image(dogIdleR, partcpt.dogX, partcpt.dogY, 56, 56);
    }
    // circle(partcpt.dogX, partcpt.dogY, dogRadius);
    // // stronger effect range
    // fill(color(138, 48, 0, 100));
    // circle(partcpt.dogX, partcpt.dogY, 100);
    // // weaker effect range
    // fill(color(138, 48, 0, 50));
    // circle(partcpt.dogX, partcpt.dogY, 200);
  });
  // no dog is running
  if (noDogRunning) partyEmit("stopPlayDogBark");
  // check if dog is hitting the fence
  dogFenceHit = checkFenceHit(myShared.dogX, myShared.dogY, dogRadius);
  // detect key presses
  if (keyIsPressed) {
    myShared.dogRunning = true;
    if (dogFenceHit) {
      myShared.dogX = prevDogX;
      myShared.dogY = prevDogY; //fence hit so send dog back to previous position
    } else {
      prevDogX = myShared.dogX;
      prevDogY = myShared.dogY; //update previous position
      if (keyIsDown(LEFT_ARROW)) {
        if (myShared.dogX > 5) myShared.dogX -= 5;
        if (keyIsDown(DOWN_ARROW)) {
          if (myShared.dogY < height - 5) myShared.dogY += 5;
        } else if (keyIsDown(UP_ARROW)) {
          if (myShared.dogY > 5) myShared.dogY -= 5;
        }
      } else if (keyIsDown(RIGHT_ARROW)) {
        if (myShared.dogX < width - 5) myShared.dogX += 5;
        if (keyIsDown(DOWN_ARROW)) {
          if (myShared.dogY < height - 5) myShared.dogY += 5;
        } else if (keyIsDown(UP_ARROW)) {
          if (myShared.dogY > 5) myShared.dogY -= 5;
        }
      } else if (keyIsDown(UP_ARROW)) {
        if (myShared.dogY > 5) myShared.dogY -= 5;
        if (keyIsDown(LEFT_ARROW)) {
          if (myShared.dogX > 5) myShared.dogX -= 5;
        } else if (keyIsDown(RIGHT_ARROW)) {
          if (myShared.dogX < width - 5) myShared.dogX += 5;
        }
      } else if (keyIsDown(DOWN_ARROW)) {
        if (myShared.dogY < height - 5) myShared.dogY += 5;
        if (keyIsDown(LEFT_ARROW)) {
          if (myShared.dogX > 5) myShared.dogX -= 5;
        } else if (keyIsDown(RIGHT_ARROW)) {
          if (myShared.dogX < width - 5) myShared.dogX += 5;
        }
      }
    }
  } else {
    myShared.dogRunning = false;
  }
  fill(color(255, 255, 255));
  // sheep in fence count
  let sheepInFence = 0;
  // check if no sheep in range
  let noSheepInRange = true;
  shared.sheepXY.forEach((sheep, idx) => {
    // count sheeps in fence
    if (
      sheep.x >= width / 2 - fenceHeight / 2 + fenceWidth &&
      sheep.x <= width / 2 + fenceHeight / 2 - fenceWidth &&
      sheep.y >= height / 2 - fenceHeight / 2 + fenceWidth &&
      sheep.y <= height / 2 + fenceHeight / 2
    ) {
      sheepInFence++;
    }

    // check if sheep is hitting the fence
    sheepFenceHit = checkFenceHit(sheep.x, sheep.y, sheepRadius + 30);

    if (sheepFenceHit) {
      // sheep hit the fence
      let speed = 1;
      // console.log("hit");
      let speedX;
      let speedY;
      // calculate sheep heading with the fence
      let heading;
      if (sheepFenceHit === "hit1") {
        heading = createVector(
          sheep.x - fenceStartX,
          sheep.y - (fenceStartY + fenceHeight / 2)
        ).heading();
      } else if (sheepFenceHit === "hit2") {
        heading = createVector(
          sheep.x - (fenceStartX + fenceHeight / 2),
          sheep.y - (fenceStartY + fenceWidth / 2)
        ).heading();
      } else {
        heading = createVector(
          sheep.x -
            (fenceStartX + fenceHeight - fenceWidth / 2 + fenceWidth / 2),
          sheep.y - (fenceStartY + fenceHeight / 2)
        ).heading();
      }
      if (heading >= 0 && heading < 90) {
        speedX = sin(heading) * speed;
        speedY = cos(heading) * speed;
      } else if (heading >= 90) {
        speedX = -sin(180 - heading) * speed;
        speedY = cos(180 - heading) * speed;
      } else if (heading < 0 && heading >= -90) {
        speedX = sin(-heading) * speed;
        speedY = -cos(-heading) * speed;
      } else {
        speedX = -sin(180 + heading) * speed;
        speedY = -cos(180 + heading) * speed;
      }
      // add speed x and y to sheep while preventing them from going out of canvas
      if (
        (sheep.x < width - 30 && sheep.x > 30) ||
        (sheep.x < 30 && myShared.dogX < sheep.x) ||
        (sheep.x > width - 30 && myShared.dogX > sheep.x)
      ) {
        sheep.x += speedX;
      }
      if (
        (sheep.y < height - 30 && sheep.y > 30) ||
        (sheep.y < 30 && myShared.dogY < sheep.y) ||
        (sheep.y > width - 30 && myShared.dogY > sheep.y)
      ) {
        sheep.y += speedY;
      }
    } else if (dist(myShared.dogX, myShared.dogY, sheep.x, sheep.y) < 50) {
      // in stronger effect range
      noSheepInRange = false;
      partyEmit("playSheepBleat");
      if (myShared.sheepsInRange.findIndex((id) => id === sheep.id) < 0) {
        myShared.sheepsInRange.push(sheep.id);
      }
      let speed = 2;
      // calculate speed x and y based on heading
      let speedX;
      let speedY;
      // calculate sheep heading with this dog
      const heading = createVector(
        sheep.x - myShared.dogX,
        sheep.y - myShared.dogY
      ).heading();
      if (heading >= 0 && heading < 90) {
        speedX = sin(heading) * speed;
        speedY = cos(heading) * speed;
      } else if (heading >= 90) {
        speedX = -sin(180 - heading) * speed;
        speedY = cos(180 - heading) * speed;
      } else if (heading < 0 && heading >= -90) {
        speedX = sin(-heading) * speed;
        speedY = -cos(-heading) * speed;
      } else {
        speedX = -sin(180 + heading) * speed;
        speedY = -cos(180 + heading) * speed;
      }
      // add speed x and y to sheep while preventing them from going out of canvas
      if (
        (sheep.x < width - 30 && sheep.x > 30) ||
        (sheep.x < 30 && myShared.dogX < sheep.x) ||
        (sheep.x > width - 30 && myShared.dogX > sheep.x)
      ) {
        sheep.x += speedX;
      }
      if (
        (sheep.y < height - 30 && sheep.y > 30) ||
        (sheep.y < 30 && myShared.dogY < sheep.y) ||
        (sheep.y > width - 30 && myShared.dogY > sheep.y)
      ) {
        sheep.y += speedY;
      }
    } else if (dist(myShared.dogX, myShared.dogY, sheep.x, sheep.y) < 100) {
      // in weaker effect range
      noSheepInRange = false;
      partyEmit("playSheepBleat");
      if (myShared.sheepsInRange.findIndex((id) => id === sheep.id) < 0) {
        myShared.sheepsInRange.push(sheep.id);
      }
      let speed = 1;
      let speedX = speed;
      let speedY = speed;
      // calculate sheep heading with this dog
      const heading = createVector(
        sheep.x - myShared.dogX,
        sheep.y - myShared.dogY
      ).heading();
      if (heading >= 0 && heading < 90) {
        speedX = sin(heading) * speed;
        speedY = cos(heading) * speed;
      } else if (heading >= 90) {
        speedX = -sin(180 - heading) * speed;
        speedY = cos(180 - heading) * speed;
      } else if (heading < 0 && heading >= -90) {
        speedX = sin(-heading) * speed;
        speedY = -cos(-heading) * speed;
      } else {
        speedX = -sin(180 + heading) * speed;
        speedY = -cos(180 + heading) * speed;
      }
      if (
        (sheep.x < width - 30 && sheep.x > 30) ||
        (sheep.x < 30 && myShared.dogX < sheep.x) ||
        (sheep.x > width - 30 && myShared.dogX > sheep.x)
      ) {
        sheep.x += speedX;
      }
      if (
        (sheep.y < height - 30 && sheep.y > 30) ||
        (sheep.y < 30 && myShared.dogY < sheep.y) ||
        (sheep.y > width - 30 && myShared.dogY > sheep.y)
      ) {
        sheep.y += speedY;
      }
    } else {
      const foundIndex = myShared.sheepsInRange.findIndex(
        (id) => id === sheep.id
      );
      if (foundIndex >= 0) {
        myShared.sheepsInRange.splice(foundIndex, 1);
      }
      let inOtherDogsRange = false;
      ptShareds.forEach((dog) => {
        if (
          dog.sheepsInRange &&
          dog.sheepsInRange.findIndex((id) => id === sheep.id) >= 0
        ) {
          inOtherDogsRange = true;
        }
      });
      // not in effect range, move randomly
      if (partyIsHost() && !inOtherDogsRange && ptShareds.length < 2) {
        if (frameCount % 50 === 0) {
          prevMoveVal0 = Math.random() * (Math.round(Math.random()) ? 1 : -1);
          prevMoveVal1 = Math.random() * (Math.round(Math.random()) ? 1 : -1);
          prevMoveVal2 = Math.random() * (Math.round(Math.random()) ? 1 : -1);
          prevMoveVal3 = Math.random() * (Math.round(Math.random()) ? 1 : -1);
          prevMoveVal4 = Math.random() * (Math.round(Math.random()) ? 1 : -1);
          prevMoveVal5 = Math.random() * (Math.round(Math.random()) ? 1 : -1);
          prevMoveVal6 = Math.random() * (Math.round(Math.random()) ? 1 : -1);
          prevMoveVal7 = Math.random() * (Math.round(Math.random()) ? 1 : -1);
          prevMoveVal8 = Math.random() * (Math.round(Math.random()) ? 1 : -1);
          prevMoveVal9 = Math.random() * (Math.round(Math.random()) ? 1 : -1);
        }
        if (sheep.x < width - 30 && sheep.x > 30 && frameCount % 50 < 50) {
          if (idx % 10 === 0) {
            sheep.x += prevMoveVal0;
          } else if (idx % 10 === 1) {
            sheep.x += prevMoveVal1;
          } else if (idx % 10 === 2) {
            sheep.x += prevMoveVal2;
          } else if (idx % 10 === 3) {
            sheep.x += prevMoveVal3;
          } else if (idx % 10 === 4) {
            sheep.x += prevMoveVal4;
          } else if (idx % 10 === 5) {
            sheep.x += prevMoveVal5;
          } else if (idx % 10 === 6) {
            sheep.x += prevMoveVal6;
          } else if (idx % 10 === 7) {
            sheep.x += prevMoveVal7;
          } else if (idx % 10 === 8) {
            sheep.x += prevMoveVal8;
          } else if (idx % 10 === 9) {
            sheep.x += prevMoveVal9;
          }
        } else if (sheep.x < 30) {
          sheep.x += Math.random();
        } else {
          sheep.x -= Math.random();
        }
        if (sheep.y < height - 30 && sheep.y > 30 && frameCount % 50 < 50) {
          if (idx % 10 === 0) {
            sheep.y += prevMoveVal0 * (Math.round(Math.random()) ? 1 : -1);
          } else if (idx % 10 === 1) {
            sheep.y += prevMoveVal1 * (Math.round(Math.random()) ? 1 : -1);
          } else if (idx % 10 === 2) {
            sheep.y += prevMoveVal2 * (Math.round(Math.random()) ? 1 : -1);
          } else if (idx % 10 === 3) {
            sheep.y += prevMoveVal3 * (Math.round(Math.random()) ? 1 : -1);
          } else if (idx % 10 === 4) {
            sheep.y += prevMoveVal4 * (Math.round(Math.random()) ? 1 : -1);
          } else if (idx % 10 === 5) {
            sheep.y += prevMoveVal5 * (Math.round(Math.random()) ? 1 : -1);
          } else if (idx % 10 === 6) {
            sheep.y += prevMoveVal6 * (Math.round(Math.random()) ? 1 : -1);
          } else if (idx % 10 === 7) {
            sheep.y += prevMoveVal7 * (Math.round(Math.random()) ? 1 : -1);
          } else if (idx % 10 === 8) {
            sheep.y += prevMoveVal8 * (Math.round(Math.random()) ? 1 : -1);
          } else if (idx % 10 === 9) {
            sheep.y += prevMoveVal9 * (Math.round(Math.random()) ? 1 : -1);
          }
        } else if (sheep.y < 30) {
          sheep.y += Math.random();
        } else {
          sheep.y -= Math.random();
        }
      }
    }
    // draw the sheep
    image(sheepWalk, sheep.x, sheep.y, 56, 56);
    // circle(sheep.x, sheep.y, sheepRadius);
  });

  // if no sheep in range, stop playing
  if (noSheepInRange) partyEmit("stopPlaySheepBleat");

  // draw sheep in fence count
  textSize(32);
  text(sheepInFence, width - 80, 80);
  image(sheepCountImg, width-110, 70);

  // calculate countdown, 1200000 means 1200000 milliseconds, for reference check https://momentjs.com/
  const countdownString = moment(
    moment(120000).diff(moment().diff(shared.gameStartTime))
  ).format("mm:ss");
  if (parseInt(countdownString.slice(0, 2)) <= 2) {
    // draw countdown string
    text(countdownString, 80, 80);
    image(clockImg, 60, 70);
  } else {
    // TODO: countdown expired, display lose state
    text("YOU LOST", 80, 80);
    image(loseScreen,350,350,width,height)
  }

  // draw fence colliders
  drawFence();

  //check win condition
  checkGameWin(sheepInFence,countdownString);
}
function drawFence() {
  fill(fenceTempColor);
  rect(fenceStartX - fenceWidth / 2, fenceStartY, fenceWidth, fenceHeight);
  rect(fenceStartX, fenceStartY, fenceHeight, fenceWidth);
  rect(
    fenceStartX + fenceHeight - fenceWidth / 2,
    fenceStartY,
    fenceWidth,
    fenceHeight
  );
}
function checkFenceHit(objX, objY, r) {
  hit1 = collideRectCircle(
    fenceStartX - fenceWidth / 2,
    fenceStartY,
    fenceWidth,
    fenceHeight,
    objX,
    objY,
    r
  );
  hit2 = collideRectCircle(
    fenceStartX,
    fenceStartY,
    fenceHeight,
    fenceWidth,
    objX,
    objY,
    r
  );
  hit3 = collideRectCircle(
    fenceStartX + fenceHeight - fenceWidth / 2,
    fenceStartY,
    fenceWidth,
    fenceHeight,
    objX,
    objY,
    r
  );
  if (hit1) {
    return "hit1";
  } else if (hit2) {
    return "hit2";
  } else if (hit3) {
    return "hit3";
  } else {
    return null;
  }
  // if (hit1 || hit2 || hit3) {
  //   return true;
  // } else {
  //   return false;
  // }
}
function drawAssets() {
  // draw all the grass first
  for (let i = 0; i < 17; i++) {
    for (let j = 0; j < 17; j++) {
      image(grass, j * 50, i * 50, 50, 50);
    }
  }
  // draw fences on top
  image(
    fenceH,
    fenceStartX + fenceHeight / 2,
    fenceStartY + fenceWidth / 2,
    50,
    50
  );
  image(
    fenceH,
    fenceStartX + fenceHeight / 2 - 50,
    fenceStartY + fenceWidth / 2,
    50,
    50
  );
  image(
    fenceH,
    fenceStartX + fenceHeight / 2 + 50,
    fenceStartY + fenceWidth / 2,
    50,
    50
  );
  image(fenceLT, fenceStartX, fenceStartY + fenceWidth / 2, 50, 50);
  image(
    fenceRT,
    fenceStartX + fenceHeight,
    fenceStartY + fenceWidth / 2,
    50,
    50
  );
  image(
    fenceV,
    fenceStartX,
    fenceStartY + fenceWidth / 2 + fenceHeight / 2,
    50,
    50
  );
  image(
    fenceV,
    fenceStartX,
    fenceStartY + fenceWidth / 2 + fenceHeight / 2 - 50,
    50,
    50
  );
  image(
    fenceV,
    fenceStartX,
    fenceStartY + fenceWidth / 2 + fenceHeight / 2 + 50,
    50,
    50
  );
  image(
    fenceV,
    fenceStartX + fenceHeight,
    fenceStartY + fenceWidth / 2 + fenceHeight / 2,
    50,
    50
  );
  image(
    fenceV,
    fenceStartX + fenceHeight,
    fenceStartY + fenceWidth / 2 + fenceHeight / 2 - 50,
    50,
    50
  );
  image(
    fenceV,
    fenceStartX + fenceHeight,
    fenceStartY + fenceWidth / 2 + fenceHeight / 2 + 50,
    50,
    50
  );
  image(fence, fenceStartX, fenceStartY + fenceWidth / 2 + fenceHeight, 50, 50);
  image(
    fence,
    fenceStartX + fenceHeight,
    fenceStartY + fenceWidth / 2 + fenceHeight,
    50,
    50
  );
}
function onPlaySheepBleat() {
  // play sheep bleat sound
  // console.log("++++++++++++++");
  if (!sheepBleatSound.isPlaying()) sheepBleatSound.play();
}
function onStopPlaySheepBleat() {
  sheepBleatSound.stop();
}
function onPlayDogBark() {
  // play dog bark sound
  if (!dogBarkSound.isPlaying()) dogBarkSound.play();
}
function onStopPlayDogBark() {
  dogBarkSound.stop();
}
function mouseClicked(){
  // console.log(pageNum);
  if(mouseY>655 && mouseY<705){
    if(mouseX>565 && mouseX<665){ //next
      // if(pageNum==5){
      //   playGame()
      // }
      // else
        pageNum++;
    }else if(mouseX>58 && mouseX<158){ //back
      if(pageNum>0){
        pageNum--;
      }
      else
      pageNum=5;
    }
  } 
  // console.log(pageNum);
}
function checkGameWin(sheepIn, timer){
  //console.log(10*(ptShareds.length))
  if(sheepIn>=10*(ptShareds.length) && playerWin==false){
    playerWin==true;
    console.log("won");
    image(winScreen,350,350,width,height)
  }
}