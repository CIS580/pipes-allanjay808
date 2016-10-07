"use strict";

/* Classes */
const Game = require('./game');
const Pipe = require('./pipe');
const Fluid = require('./fluid');

var place = new Audio();
var explosion = new Audio();
var rotate = new Audio();
var lost = new Audio();

explosion.src = 'assets/place.wav';
place.src = 'assets/explosion.wav';
lost.src = 'assets/lost.wav';
rotate.src = 'assets/rotate.wav';

/* Global variables */
var canvas = document.getElementById('screen');
var game = new Game(canvas, update, render);
var gameOver = false;
var currentIndex, currentX, currentY;
var score = 0;
var level = 0;

// Pipes in Play
var pip = [];
var pipeEnd;
var pipeStart;
var pipesWithFluid = [];

// Track the fluid
var fluidArr = [];
var fluidPos;

// Track the grid's slots
var grid = [];

var image = new Image();
image.src = 'assets/pipes.png';

/**
  * @function The initialize function
  */
function initialize() {
  initializeGrid();

  var positionStart = {x: Math.floor(Math.random() * 3), y: 8};
  fluidArr.push(new Fluid(positionStart));
  fluidPos = 0;

  // Initialize start and end pipes
  // Initialize pipes in play array to unused pipe
  createStartEndPipes(positionStart);
  pip.push(new Pipe({x: -1, y: -1}));
  pipesWithFluid.push(new Pipe({x: -1, y: -1}));
}
initialize();

// Restart game if game is over
window.onkeydown = function(event) {
  // Enter key
  switch (event.keyCode) {
    case 13:
      pip = [];
      fluidArr = [];
      grid = [];
      gameOver = false;
      initialize();
      break;
  }
}


/**
 * @function masterLoop
 * Advances the game in sync with the refresh rate of the screen
 * @param {DOMHighResTimeStamp} timestamp the current time
 */
var masterLoop = function(timestamp) {
  if (!gameOver) {
    setTimeout(function(){game.loop(timestamp)}, 1000/8);
  }
  window.requestAnimationFrame(masterLoop);
}
masterLoop(performance.now());

// Left Click
canvas.onclick = function(event) {
  event.preventDefault();
  if (gameOver) {
    return;
  }
  // Place or rotate pipe tile
  currentX = Math.floor((event.offsetX - 10) / 65);
  currentY = Math.floor((event.offsetY - 10) / 65);
  currentIndex = currentY * 9 + currentX;

  // If start or end pipe or off grid
  if ((currentX == pipeStart.x && currentY == pipeStart.y)
        || (currentX == pipeEnd.x && currentY == pipeEnd.y)) {
     return;
  }
  if (currentX > 8 || currentY > 8) return;

  // If slot is not free
  if (grid[currentIndex].used) {
    for (var i = 0; i < pip.length; i++) {
      if (pip[i].x == currentX && pip[i].y == currentY && !(pip[i].hasFluid)) {
        var newPipe = new Pipe({x: currentX, y: currentY})
        pip[i] = newPipe;
        newPipe.setDirections();
        place.play();
      }
    }
  } else {
    // If slot is free
    grid[currentIndex].used = true;
    var newPipe = new Pipe({x: currentX, y: currentY})
    pip.push(newPipe);
    newPipe.setDirections();
    explosion.play();
  }
}

// Right Click
// Rotate image
canvas.oncontextmenu = function(event) {
  if (gameOver) {
    return;
  }

  event.preventDefault();
  currentX = Math.floor((event.offsetX - 10) / 65);
  currentY = Math.floor((event.offsetY - 10) / 65);

  var ctx = canvas.getContext('2d');

  for (var i = 0; i < pip.length; i++) {
    if (pip[i].x == currentX && pip[i].y == currentY) {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(90*Math.PI/180);
      ctx.restore();
    }
  }
}

/**
 * @function update
 * Updates the game state, moving
 * game objects and handling interactions
 * between them.
 * @param {DOMHighResTimeStamp} elapsedTime indicates
 * the number of milliseconds passed since the last frame.
 */
function update(elapsedTime) {
  // Advance the fluid
  if (gameOver) {
    return;
  }

  if (fluidArr[fluidPos].x == pipeEnd.x && (fluidArr[fluidPos].y - 1) == pipeEnd.y
    && Math.abs(fluidArr[fluidPos].width) == 64) {
    advanceLevel();
  }

  // Track the fluid size
  if (Math.abs(fluidArr[fluidPos].width) == 64) {


    if (pip.length == 1 && (fluidArr[fluidPos].x != pipeEnd.x &&
        (fluidArr[fluidPos].y - 1) != pipeEnd.y)) {
      gameIsOver();
      return;
    }
    for (var i = 1; i < pip.length; i++) {
      console.log("Pipes size: ", pip.length);
      var direction = fluidArr[fluidPos].direction;

      var checkY;
      var checkX;

      switch(direction) {
        case "up" :
          checkY = fluidArr[fluidPos].y - 2;
          checkX = fluidArr[fluidPos].x;

          console.log("up, " + pip[i].directions.up);
          console.log("down, " + pip[i].directions.down);
          console.log("left, " + pip[i].directions.left);
          console.log("right, " + pip[i].directions.right);


          if (pip[i].x == checkX && pip[i].y == checkY && canConnect(pip[i], direction)) {
            // Increase fluid size if able to flow through
            var newFluidX = pip[i].x;
            var newFluidY = checkY;
            var newFluid = new Fluid({x: newFluidX, y: newFluidY});
            fluidArr.push(newFluid);
            fluidPos++;

            pip[i].hasFluid = true;
            var pipe = pip.splice(i, 1);

            pipesWithFluid.push(pipe[0]);

          }
          break;
        case "down" :
          checkY = fluidArr[fluidPos].y + 2;
          checkX = fluidArr[fluidPos].x;
          break;
        case "left" :
          checkY = fluidArr[fluidPos].y;
          checkX = fluidArr[fluidPos].x - 2;
          break;
        case "right" :
          checkY = fluidArr[fluidPos].y;
          checkX = fluidArr[fluidPos].x + 2;
          break;
      }
    }
  } else if (fluidArr[fluidPos].width < 64) {
    fluidArr[fluidPos].updateFluid(elapsedTime);
  } else {
    gameOver = true;
    console.log("WHERE AM I");
  }

}

/**
  * @function render
  * Renders the current game state into a back buffer.
  * @param {DOMHighResTimeStamp} elapsedTime indicates
  * the number of milliseconds passed since the last frame.
  * @param {CanvasRenderingContext2D} ctx the context to render to
  */
function render(elapsedTime, ctx) {

  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (var i = 0; i < fluidArr.length; i++) {
    fluidArr[i].renderFluid(ctx);
  }

  // Render the board
  for (var y = 0; y < 9; y++) {
    for (var x = 0; x < 9; x++) {
      var slot = grid[y * 9 + x];
      if (!slot.used && !(x == pipeStart.x && y == pipeStart.y)
                     && !(x == pipeEnd.x && y == pipeEnd.y)) {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(x * 65 + 10, y * 65 + 10, 64, 64);
      }
    }
  }

  // Draw Pipes
  pipeStart.renderPipe(ctx);
  pipeEnd.renderPipe(ctx);
  for (var i = 1; i < pip.length; i++) {
    pip[i].renderPipe(ctx);
  }

  for (var i = 1; i < pipesWithFluid.length; i++) {
    pipesWithFluid[i].renderPipe(ctx);
  }


  trackLevel(ctx);
  trackScore(ctx);
  if (gameOver) {
    gameLost(ctx);
  }
}

/**
  * @function canConnect
  * Check if fluid can connect to pipe
  */
function canConnect(pipe, fluidDir) {
  switch (fluidDir) {
    case "up":
        if (pipe.directions.down == true) {
          console.log("Can connect");
          return true;
        }
      break;
    default:
  }
}

/**
  * @function advanceLevel
  */
function advanceLevel() {
  pip = [];
  fluidArr = [];
  grid = [];
  initialize();

  level++;
  fluidArr[fluidPos].speed += 0.1;
  score += 100;
  rotate.play();
}

/**
  * @function gameIsOver
  */
function gameIsOver() {
  console.log("GAME OVER");
  gameOver = true;
  lost.play();
}

/**
  * @function trackLevel()
  * Tracks current level
  */
function trackLevel(ctx) {
  ctx.font = "bold 16px Arial";
  ctx.fillStyle = "white";
  var levelText = "Level: " + (level + 1);
  ctx.fillText(levelText, 660, 20);
}

/**
  * @function trackScore
  * Track current score
  */
function trackScore(ctx) {
  ctx.font = "bold 16px Arial";
  ctx.fillStyle = "white";
  var scoreText = "Score: " + score;
  ctx.fillText(scoreText, 660, 40);
}

/**
  * @function gameLost
  * Display game over details
  */
function gameLost(ctx) {
  ctx.font = "bold 48px Arial";
  ctx.fillStyle = "red";
  var gameOverText = "Game Over!";
  var scoreText = "Score: " + score;
  var gameOverHelp = "Press 'Enter' to restart";
  ctx.fillText(gameOverText, 260, 300);
  ctx.fillText(scoreText, 280, 350);
  ctx.font = "bold 32px Arial";
  ctx.fillText(gameOverHelp, 220, 390);

}

/**
  * @function intialize the slots within the grid
  */
function initializeGrid() {
  for (var x = 0; x < 9; x++) {
    for (var y = 0; y < 9; y++) {
      grid.push({x: x, y: y, used: false});
    }
  }
}

/**
  * @function create the start and end pipes
  */
function createStartEndPipes(positionStart) {
  pipeEnd = new Pipe({x: Math.floor(Math.random() * 3), y: 0});
  pipeStart = new Pipe(positionStart);
  pipeStart.imageX = 0;
  pipeStart.imageY = 3;
  pipeEnd.imageX = 0;
  pipeEnd.imageY = 1;
  pipeStart.setDirections();
  pipeEnd.setDirections();
}
