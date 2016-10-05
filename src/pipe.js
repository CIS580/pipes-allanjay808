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
