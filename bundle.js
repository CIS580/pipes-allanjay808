(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"./game":2,"./grid":3,"./pipe":4}],2:[function(require,module,exports){
"use strict";

/**
 * @module exports the Game class
 */
module.exports = exports = Game;

/**
 * @constructor Game
 * Creates a new game object
 * @param {canvasDOMElement} screen canvas object to draw into
 * @param {function} updateFunction function to update the game
 * @param {function} renderFunction function to render the game
 */
function Game(screen, updateFunction, renderFunction) {
  this.update = updateFunction;
  this.render = renderFunction;

  // Set up buffers
  this.frontBuffer = screen;
  this.frontCtx = screen.getContext('2d');
  this.backBuffer = document.createElement('canvas');
  this.backBuffer.width = screen.width;
  this.backBuffer.height = screen.height;
  this.backCtx = this.backBuffer.getContext('2d');

  // Start the game loop
  this.oldTime = performance.now();
  this.paused = false;
}

/**
 * @function pause
 * Pause or unpause the game
 * @param {bool} pause true to pause, false to start
 */
Game.prototype.pause = function(flag) {
  this.paused = (flag == true);
}

/**
 * @function loop
 * The main game loop.
 * @param{time} the current time as a DOMHighResTimeStamp
 */
Game.prototype.loop = function(newTime) {
  var game = this;
  var elapsedTime = newTime - this.oldTime;
  this.oldTime = newTime;

  if(!this.paused) this.update(elapsedTime);
  this.render(elapsedTime, this.frontCtx);

  // Flip the back buffer
  this.frontCtx.drawImage(this.backBuffer, 0, 0);
}

},{}],3:[function(require,module,exports){
"use strict;"

/**
  * @module exports the Grid Class
  */
module.exports = exports = Grid;

function Grid(width, height, cellSize) {
  this.cellSize = cellSize;
  this.widthInCells = Math.ceil(width / cellSize);
  this.heightInCells = Math.ceil(height / cellSize);
  this.cells = [];
  this.numberOfCells = this.widthInCells * this.heightInCells;
  for(var i = 0; i < this.numberOfCells; i++) {
    this.cells[i] = [];
  }
  this.cells[-1] = [];
}

Grid.prototype.renderCells = function(ctx) {
  for(var x = 0; x < this.widthInCells; x++) {
    for(var y = 0; y < this.heightInCells; y++) {
      ctx.strokeStyle = '#FFFFFF';
      ctx.strokeRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
    }
  }
}

},{}],4:[function(require,module,exports){
"use strict;"

/**
  * @module exports the Pipe Class
  */
module.exports = exports = Pipe;

function Pipe(position) {
  this.x = position.x;
  this.y = position.y;
  this.width = 31.75;
  this.height = 32;
  this.spritesheet = new Image();
  this.spritesheet.src = encodeURI("assets/pipes.png");

  var genX;
  var genY;
  do {
    genX = Math.floor(Math.random() * 3);
    genY = Math.floor(Math.random() * 4);
  } while ((genX == 3 && genY == 3) || (genX == 0 && genY == 4) ||
            (genX == 3 && genY == 4));
  this.imageX = genX;
  this.imageY = genY;

  this.hasFluid = false;

}

Pipe.prototype.renderPipe = function(ctx) {

  ctx.drawImage(
    // image
    this.spritesheet,
    // source rectangle
    this.imageX * 31.75, this.imageY * 32, this.width, this.height,
    // destination rectangle
    (this.x * 65) + 10, (this.y * 65) + 10, 64, 64
  );
}

},{}]},{},[1]);
