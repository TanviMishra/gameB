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

function preload() {
  // connect & init shared variables
  partyConnect(
    "wss://deepstream-server-1.herokuapp.com",
    "sheep_movement",
    "main"
  );
  shared = partyLoadShared("shared");
  ptShareds = partyLoadParticipantShareds();
  myShared = partyLoadMyShared();
}

function setup() {
  createCanvas(800, 800);
  if (partyIsHost()) {
    shared.sheepXY = [];
  }
  // keeps record of which sheeps are in range of this dog
  myShared.sheepsInRange = [];
  // init dog & sheep positions
  // 1st dog at top-left, 2nd at top-right...
  if (ptShareds.length % 4 === 1) {
    myShared.dogX = 5;
    myShared.dogY = 5;
  } else if (ptShareds.length % 4 === 2) {
    myShared.dogX = width - 5;
    myShared.dogY = 5;
  } else if (ptShareds.length % 4 === 3) {
    myShared.dogX = 5;
    myShared.dogY = height - 5;
  } else {
    myShared.dogX = width - 5;
    myShared.dogY = height - 5;
  }
  // 10 sheeps for each user at random positions
  for (let i = 0; i < 10; i++) {
    shared.sheepXY.push({
      id: random(),
      x: (width - 60) * random() + 30,
      y: (height - 60) * random() + 30,
    });
  }
  // change angle mode to degrees
  angleMode(DEGREES);
}

function draw() {
  background(220);

  // draw dogs
  ptShareds.forEach((partcpt, idx) => {
    noStroke();
    fill(color(138, 48, 0));
    circle(partcpt.dogX, partcpt.dogY, 20);
    // stronger effect range
    fill(color(138, 48, 0, 100));
    circle(partcpt.dogX, partcpt.dogY, 100);
    // weaker effect range
    fill(color(138, 48, 0, 50));
    circle(partcpt.dogX, partcpt.dogY, 200);
  });

  // detect key presses
  if (keyIsPressed) {
    switch (key) {
      case "ArrowLeft":
        if (myShared.dogX > 5) myShared.dogX -= 5;
        break;
      case "ArrowRight":
        if (myShared.dogX < width - 5) myShared.dogX += 5;
        break;
      case "ArrowUp":
        if (myShared.dogY > 5) myShared.dogY -= 5;
        break;
      case "ArrowDown":
        if (myShared.dogY < height - 5) myShared.dogY += 5;
    }
  }

  fill(color(255, 255, 255));
  shared.sheepXY.forEach((sheep, idx) => {
    // draw the sheeps
    circle(sheep.x, sheep.y, 20);

    // calculate heading
    const heading = createVector(
      sheep.x - myShared.dogX,
      sheep.y - myShared.dogY
    ).heading();

    if (dist(myShared.dogX, myShared.dogY, sheep.x, sheep.y) < 50) {
      // in stronger effect range
      if (myShared.sheepsInRange.findIndex((id) => id === sheep.id) < 0) {
        myShared.sheepsInRange.push(sheep.id);
      }
      const speed = 2;
      // calculate speed x and y based on heading
      let speedX;
      let speedY;
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
      if (myShared.sheepsInRange.findIndex((id) => id === sheep.id) < 0) {
        myShared.sheepsInRange.push(sheep.id);
      }
      const speed = 1;
      let speedX;
      let speedY;
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
        if (dog.sheepsInRange.findIndex((id) => id === sheep.id) >= 0) {
          inOtherDogsRange = true;
        }
      });
      // not in effect range, move randomly
      if (partyIsHost() && !inOtherDogsRange) {
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
  });
}
