import SpaceObject from "./spaceobject.js";
import Vector2D from "./vector2D.js";

const ASTEROID_JAGGEDNESS = 0.55; // (0 ==> regular polygon, 1 ==> extremely jagged)

export default class Asteroid extends SpaceObject {
  constructor(board, posX, posY, velX, velY, size, num_verts) {
    let vertices = [];

    // add vertices according to a regular polygon with number of vertices
    // prescribed by num_verts and inscribed by circle of radius size
    for (let i = 0; i < num_verts; i++) {
      vertices.push(
        new Vector2D(
          size * Math.cos((2 * Math.PI * i) / num_verts),
          size * Math.sin((2 * Math.PI * i) / num_verts)
        )
      );
    }
    super(board, size, posX, posY, velX, velY, vertices, "white");
    this.offsetVertices();
  }

  // applies some 'jaggedness' to the asteroid
  // inspired by https://www.youtube.com/watch?v=H9CSWMxJx84&t=3734s
  offsetVertices() {
    let offset;
    for (let i = 0; i < this.vertices.length; i++) {
      offset =
        Math.random() * ASTEROID_JAGGEDNESS * 2 + 1 - ASTEROID_JAGGEDNESS;
      this.vertices[i].x *= offset;
      this.vertices[i].y *= offset;
    }
  }

  update(deltaTime) {
    if (
      this.board.game.debug &&
      (isNaN(this.position.x) ||
        isNaN(this.position.y) ||
        isNaN(this.velocity.x) ||
        isNaN(this.velocity.y))
    ) {
      console.log(this);
    }

    this.clampVelocity(deltaTime);
    this.updatePosition(deltaTime);
  }

  draw(ctx) {
    this.drawObjectFrame(ctx);
  }
}
