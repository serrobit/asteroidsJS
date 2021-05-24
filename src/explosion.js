import SpaceObject from "./spaceobject.js";

const EXPLOSION_COLOR1 = "red";
const EXPLOSION_COLOR2 = "orange";

const MAX_EXPLOSIONS_SIZE = 128;

export default class Explosion extends SpaceObject {
  constructor(board, posX, posY) {
    super(board, 1, posX, posY, 0, 0, [], EXPLOSION_COLOR1);
    this.explosiveFactor = 12; // controls how impactful an explosion is
    this.drawRadius = 1;
    this.framesToLive = 30;
    this.opacity = 0.5;
    // this.drawVelocity = true;
  }

  update(deltaTime) {
    if (this.drawRadius < MAX_EXPLOSIONS_SIZE) {
      this.drawRadius += this.size / 4 / deltaTime;
    }

    if (this.size < MAX_EXPLOSIONS_SIZE) {
      this.size += MAX_EXPLOSIONS_SIZE / deltaTime;
    }

    this.framesToLive--;
    if (this.framesToLive <= 10) this.opacity -= 0.1;
    if (this.framesToLive <= 0) this.isAlive = false;
  }

  draw(ctx) {
    this.drawObjectFrame(ctx);

    ctx.strokeStyle = EXPLOSION_COLOR1;
    ctx.fillStyle = EXPLOSION_COLOR2;
    ctx.globalAlpha = this.opacity;
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.drawRadius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.arc(this.position.x, this.position.y, this.drawRadius, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.globalAlpha = 1.0;
  }
}
