// shared variables
let shared;
let ptShareds;
let myShared;

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
  shared.sheepXY.forEach((sheep) => {
    // draw the sheeps
    circle(sheep.x, sheep.y, 20);

    // calculate heading
    const heading = createVector(
      sheep.x - myShared.dogX,
      sheep.y - myShared.dogY
    ).heading();

    if (dist(myShared.dogX, myShared.dogY, sheep.x, sheep.y) < 50) {
      // in stronger effect range
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
    } else if (
      dist(myShared.dogX, myShared.dogY, sheep.x, sheep.y) < 100 &&
      sheep.x > 30 &&
      sheep.x < width - 30 &&
      sheep.y > 30 &&
      sheep.y < height - 30
    ) {
      // in weaker effect range
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
    }
  });
}
