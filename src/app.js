"use strict";

/* Classes */
const Game = require('./game');
const Grid = require('./grid');
const Pipe = require('./pipe')

/* Global variables */
var canvas = document.getElementById('screen');
var game = new Game(canvas, update, render);
var currentIndex, currentX, currentY;

// Pipes in Play
var pip = [];
var pipeStart = new Pipe({x: Math.floor(Math.random() * 3), y: 8});
var pipeEnd = new Pipe({x: Math.floor(Math.random() * 3), y: 0});

var grid = [];
for (var x = 0; x < 9; x++) {
  for (var y = 0; y < 9; y++) {
    grid.push({x: x, y: y, used: false});
  }
}

var image = new Image();
image.src = 'assets/pipes.png';

// Left Click
canvas.onclick = function(event) {
  event.preventDefault();
  // TODO: Place or rotate pipe tile
  currentX = Math.floor((event.offsetX - 10) / 65);
  currentY = Math.floor((event.offsetY - 10) / 65);
  currentIndex = currentY * 9 + currentX;

  if (currentX > 8 || currentY > 8) return;
  if (grid[currentIndex].used) {
    for (var i = 0; i < pip.length; i++) {
      if (pip[i].x == currentX && pip[i].y == currentY) {
        pip[i] = new Pipe({x: currentX, y: currentY})
      }
    }
  } else {
    grid[currentIndex].used = true;
    pip.push(new Pipe({x: currentX, y: currentY}));
  }
}

// Right Click
// TODO: Figure out rotation
canvas.oncontextmenu = function(event) {
  event.preventDefault();
  currentX = Math.floor((event.offsetX - 10) / 65);
  currentY = Math.floor((event.offsetY - 10) / 65);

  var ctx = canvas.getContext('2d');

  for (var i = 0; i < pip.length; i++) {
    if (pip[i].x == currentX && pip[i].y == currentY) {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      ctx.save();
      ctx.translate(canvas.width, canvas.height);
      ctx.rotate(90*Math.PI/180);
      pip[i].width = (pip[i].width * -1);
      pip[i].height = (pip[i].height * -1);
      pip[i].renderPipe(ctx);
      ctx.restore();

    }
  }
}

/**
 * @function masterLoop
 * Advances the game in sync with the refresh rate of the screen
 * @param {DOMHighResTimeStamp} timestamp the current time
 */
var masterLoop = function(timestamp) {
  game.loop(timestamp);
  window.requestAnimationFrame(masterLoop);
}
masterLoop(performance.now());


/**
 * @function update
 * Updates the game state, moving
 * game objects and handling interactions
 * between them.
 * @param {DOMHighResTimeStamp} elapsedTime indicates
 * the number of milliseconds passed since the last frame.
 */
function update(elapsedTime) {
  // TODO: Advance the fluid
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
  // Render the board
  for (var y = 0; y < 9; y++) {
    for (var x = 0; x < 9; x++) {
      var slot = grid[y * 9 + x];
      if (!slot.used) {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(x * 65 + 10, y * 65 + 10, 64, 64);
      } else {
        // ctx.fillStyle = "#8E44AD";
        // ctx.fillRect(x * 65 + 10, y * 65 + 10, 64, 64);
      }
    }
  }

  // Draw Pipes
  pipeStart.renderPipe(ctx);
  pipeEnd.renderPipe(ctx);
  for (var i = 0; i < pip.length; i++) {
    pip[i].renderPipe(ctx);
  }


}
