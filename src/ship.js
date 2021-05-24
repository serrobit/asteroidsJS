import Missile from "./missile.js";
import SpaceObject from "./spaceobject.js";
import Vector2D from "./vector2D.js";

export default class Ship extends SpaceObject {
  constructor(game) {
    super(
      game.board,
      game.board.cellSize,
      game.board.boardSize / 2,
      game.board.boardSize / 2,
      0,
      0,
      [
        new Vector2D(game.board.cellSize, 0),
        new Vector2D(-game.board.cellSize, game.board.cellSize / 3),
        new Vector2D(-game.board.cellSize, -game.board.cellSize / 3)
      ],
      "white"
    );
    this.game = game;

    // input control properties
    this.accelerate = false;
    this.firing = false;
    this.turnLeft = false;
    this.turnRight = false;
    this.missileSpeed = 0.5;
    this.thrustAcceleration = 0.00025;

    // vertices representing how to draw thrust
    this.thrustVertices = [
      new Vector2D(-this.board.cellSize * 2, 0),
      new Vector2D(-this.size - 6, this.size / 9),
      new Vector2D(-this.size - 6, -this.size / 9)
    ];
  }

  // launches a missile according to the ship's heading and velocity
  fireMissile(deltaTime) {
    if (this.isAlive) {
      let missile = new Missile(
        this.board,
        this.size * Math.cos(this.degToRad(this.heading)) + this.position.x,
        this.size * Math.sin(this.degToRad(this.heading)) + this.position.y,
        this.velocity.x +
          this.missileSpeed * Math.cos(this.degToRad(this.heading)),
        this.velocity.y +
          this.missileSpeed * Math.sin(this.degToRad(this.heading))
      );
      this.game.missiles.push(missile);
      this.firing = false;
    }
  }

  rotateLeft(deltaTime) {
    this.heading -= 60 / deltaTime;
  }

  rotateRight(deltaTime) {
    this.heading += 60 / deltaTime;
  }

  moveForward(deltaTime) {
    if (this.isAlive) {
      let dv = new Vector2D(
        this.thrustAcceleration *
          deltaTime *
          Math.cos(this.degToRad(this.heading)),
        this.thrustAcceleration *
          deltaTime *
          Math.sin(this.degToRad(this.heading))
      );
      this.velocity = this.velocity.plus(dv);
    }
  }

  // draws the ship's exhaust
  drawExhaust(ctx) {
    let vertices = this.thrustVertices.map((vertex) =>
      this.rotateVertexAboutObject(vertex)
    );

    ctx.fillStyle = "orange";
    ctx.strokeStyle = "red";
    ctx.beginPath();
    ctx.moveTo(vertices[0].x, vertices[0].y);
    ctx.lineTo(vertices[1].x, vertices[1].y);
    ctx.lineTo(vertices[2].x, vertices[2].y);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(vertices[0].x, vertices[0].y);
    ctx.lineTo(vertices[1].x, vertices[1].y);
    ctx.lineTo(vertices[2].x, vertices[2].y);
    ctx.closePath();
    ctx.stroke();

    ctx.strokeStyle = "cyan";
    ctx.beginPath();
    ctx.moveTo(vertices[1].x, vertices[1].y);
    ctx.lineTo(vertices[2].x, vertices[2].y);
    ctx.closePath();
    ctx.stroke();
  }

  // draws line from ship to asteroids that are too close to the ship while it is respawning
  drawBoundariesToAsteroids(ctx) {
    ctx.strokeStyle = "rgba(255,0,0,0.25)";
    ctx.lineWidth = "2";
    const asteroids = this.board.game.asteroids;
    for (let i = 0; i < asteroids.length; i++) {
      let distanceBetween = this.position
        .minus(asteroids[i].position)
        .magnitude();
      if (distanceBetween < 2 * asteroids[i].size + this.size) {
        let boundaryVec = asteroids[i].position
          .minus(this.position)
          .unit()
          .scale(asteroids[i].size * 2 + this.size)
          .plus(this.position);
        ctx.beginPath();
        ctx.moveTo(this.position.x, this.position.y);
        ctx.lineTo(boundaryVec.x, boundaryVec.y);
        ctx.stroke();
      }
    }
  }

  // draws lines from ship to asteroids
  drawLinesToAsteroids(ctx) {
    ctx.strokeStyle = "rgba(255,0,0,0.25)";
    ctx.lineWidth = "3";
    const asteroids = this.board.game.asteroids;
    for (let i = 0; i < asteroids.length; i++) {
      ctx.beginPath();
      ctx.moveTo(this.position.x, this.position.y);
      ctx.lineTo(asteroids[i].position.x, asteroids[i].position.y);
      ctx.stroke();
    }
  }

  update(deltaTime) {
    if (this.turnLeft) this.rotateLeft(deltaTime);
    if (this.turnRight) this.rotateRight(deltaTime);
    if (this.accelerate) this.moveForward(deltaTime);
    if (this.firing) this.fireMissile(deltaTime);

    this.clampVelocity(deltaTime);
    this.updatePosition(deltaTime);
  }

  draw(ctx) {
    if (this.isAlive) {
      this.color = "white";
      if (this.accelerate) {
        this.drawExhaust(ctx);
      }
    } else {
      this.color = "rgba(255,255,255,0.25)";
      this.drawBoundariesToAsteroids(ctx);
    }
    this.drawObjectFrame(ctx);
    if (this.game.debug) {
      this.drawBoundariesToAsteroids(ctx);
      this.drawLinesToAsteroids(ctx);
    }
  }
}
