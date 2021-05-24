import SpaceObject from "./spaceobject.js";
import Vector2D from "./vector2D.js";

const DEBRIS_COLOR = "orange";

export default class Debris extends SpaceObject {
  constructor(board, posX, posY, velX, velY) {
    let vertices = [new Vector2D(0, 0), new Vector2D(1, 0)];
    super(board, 1, posX, posY, velX, velY, vertices, DEBRIS_COLOR);
    this.framesToLive = 10;
    this.drawVelocity = true; // explcitly setting this to true for artistic affect
  }

  update(deltaTime) {
    this.updatePosition(deltaTime);
    // set this debris to be removed after 10 frames, or if this debris goes off the board
    this.framesToLive -= 1;
    if (this.framesToLive === 0) this.isAlive = false;
    if (
      this.position.x - this.size >= this.board.boardSize ||
      this.position.x + this.size <= 0
    ) {
      this.isAlive = false;
    }
    if (
      this.position.y - this.size >= this.board.boardSize ||
      this.position.y + this.size <= 0
    ) {
      this.isAlive = false;
    }
  }
}
