"use strict;"

/**
  * @exports exports the Fluid class
  */
module.exports = exports = Fluid;

function Fluid(position) {
  this.x = position.x;
  this.y = position.y + 1;

  this.width = 0;
  this.height = 0;

  this.speed = 0.25;
  this.direction = "up";
}

/**
  * @function updateFluid
  * Update the fluid
  */
Fluid.prototype.updateFluid = function(elapsedTime) {
  switch(this.direction) {
    case "up" :
        this.width += this.speed;
        this.height -= this.speed;
      break;
  }

  if (Math.abs(this.width) >= 64) {

    switch (this.direction) {
      case "up" :

        break;
      case "down" :
        break;
      case "left" :
        break;
      case "right" :
        break;
    }
  }
}

/**
  * @function renderFluid
  * Draw the fluid
  */
Fluid.prototype.renderFluid = function(ctx) {
  ctx.fillStyle = "#246BA3";
  ctx.fillRect((this.x * 65) + 10, (this.y * 65) + 10, this.width, this.height);
}

Fluid.prototype.setDirection = function() {

}
