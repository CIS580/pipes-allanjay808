"use strict;"

/**
  * @module exports the Pipe Class
  */
module.exports = exports = Pipe;

/**
  * @constructor constructor for the Pipe class
  */
function Pipe(position) {
  this.x = position.x;
  this.y = position.y;
  this.width = 31.75;
  this.height = 32;
  this.spritesheet = new Image();
  this.spritesheet.src = encodeURI("assets/pipes2.png");

  var genX;
  var genY;
  do {
    genX = Math.floor(Math.random() * 3);
    genY = Math.floor(Math.random() * 4);
  } while ((genX == 3 && genY == 3) || (genX == 0 && genY == 4) ||
           (genX == 3 && genY == 4) || (genX == 0 && genY == 0) ||
           (genX == 1 && genY == 3) || (genX == 2 && genY == 3) ||
           (genX == 1 && genY == 4) || (genX == 2 && genY == 4));
  this.imageX = genX;
  this.imageY = genY;

  this.hasFluid = false;

  this.directions = {};
}

/**
  * @function renderPipe
  * Draw the pipe
  */
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

/**
  * @function setDirections
  * Set directions of pipe based on clipping
  */
Pipe.prototype.setDirections = function() {
  if ((this.imageX == 1 && this.imageY == 0) || (this.imageX == 2 && this.imageY == 0) ||
    (this.imageX == 3 && this.imageY == 0) || (this.imageX == 3 && this.imageY == 1)) {
      this.directions = { up : false, down : false, left : true, right : true }
  } else if ((this.imageX == 0 && this.imageY == 1) || (this.imageX == 0 && this.imageY == 2) ||
    (this.imageX == 0 && this.imageY == 3) || (this.imageX == 3 && this.imageY == 2)) {
      this.directions = { up: true, down: true, left: false, right: false }
  } else if (this.imageX == 1 && this.imageY == 1) {
    this.directions = { up : false, down : true, left : false, right : true }
  } else if (this.imageX == 2 && this.imageY == 1) {
    this.directions = { up : false, down : true, left : true, right : false }
  } else if (this.imageX == 1 && this.imageY == 2) {
    this.directions = { up : true, down : false, left : false, right : true }
  } else if (this.imageX == 2 && this.imageY == 2) {
    this.directions = { up : true, down : false, left : true, right : false }
  }
}
