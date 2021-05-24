import SpaceObject from "./spaceobject.js";
import Vector2D from "./vector2D.js";

const BULLET_SIZE = 1;
const BULLET_COLOR = "cyan";

export default class Missile extends SpaceObject {
  constructor(board, posX, posY, velX, velY) {
    let vertices = [
      new Vector2D(BULLET_SIZE, BULLET_SIZE),
      new Vector2D(-BULLET_SIZE, BULLET_SIZE),
      new Vector2D(-BULLET_SIZE, -BULLET_SIZE),
      new Vector2D(BULLET_SIZE, -BULLET_SIZE)
    ];

    super(board, BULLET_SIZE, posX, posY, velX, velY, vertices, BULLET_COLOR);
  }

  update(deltaTime) {
    this.clampVelocity(deltaTime);
    this.updatePosition(deltaTime);
    // set missile to be removed if it goes off of the board
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
