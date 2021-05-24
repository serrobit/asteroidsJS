import Vector2D from "./vector2D.js";

const MAX_SPEED = 1;

export default class SpaceObject {
  constructor(board, size, posX, posY, velX, velY, vertices, strokeColor) {
    this.board = board;
    this.size = size;
    this.vertices = vertices;
    this.position = new Vector2D(posX, posY);
    this.velocity = new Vector2D(velX, velY);
    this.heading = 0;
    this.isAlive = true;
    this.color = strokeColor;
    this.opacity = 1.0;
    this.maxSpeed = MAX_SPEED;

    // debug properties
    this.drawHeading = board.game.debug;
    this.drawVelocity = board.game.debug;
    this.drawBoundingCircle = board.game.debug;
  }

  toggleDebug() {
    // debug properties
    this.drawHeading = this.board.game.debug;
    this.drawVelocity = this.board.game.debug;
    this.drawBoundingCircle = this.board.game.debug;
  }

  // restricts a SpaceObjects speed to maxSpeed
  clampVelocity(deltaTime) {
    if (this.velocity.magnitude() > this.maxSpeed) {
      this.velocity.x -= (1 / deltaTime) * this.velocity.x;
      this.velocity.y -= (1 / deltaTime) * this.velocity.x;
    }
  }

  // wraps an objects coordinates around the edges of the game board
  getToroidalCoordinates(vertex) {
    let wrappedVertex = vertex;

    if (wrappedVertex.x - this.size >= this.board.boardSize) {
      wrappedVertex.x = -this.size;
    } else if (wrappedVertex.x + this.size <= 0) {
      wrappedVertex.x = this.board.boardSize + this.size;
    }

    if (wrappedVertex.y - this.size >= this.board.boardSize) {
      wrappedVertex.y = -this.size;
    } else if (wrappedVertex.y + this.size <= 0) {
      wrappedVertex.y = this.board.boardSize + this.size;
    }
    return wrappedVertex;
  }

  // converts an angle in degrees to radians
  degToRad(angle) {
    return (Math.PI / 180) * angle;
  }

  // rotates and translates this SpaceObject's vertices from it's drawing about the origin to about it's current position
  rotateVertexAboutObject(vertex) {
    return vertex.rotate(this.degToRad(this.heading)).plus(this.position);
  }

  drawObjectFrame(ctx) {
    ctx.strokeStyle = this.color;
    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.opacity;
    ctx.lineWidth = "1";

    // draw the object
    let transformedVertices = this.vertices.map((vertex) =>
      this.rotateVertexAboutObject(vertex)
    );
    if (transformedVertices.length > 0) {
      ctx.beginPath();
      ctx.moveTo(transformedVertices[0].x, transformedVertices[0].y);
      for (let i = 1; i < transformedVertices.length; i++) {
        ctx.lineTo(transformedVertices[i].x, transformedVertices[i].y);
      }
      ctx.closePath();
      ctx.stroke();
    }

    // draw debug features if needed
    if (this.drawHeading) {
      ctx.strokeStyle = "magenta";
      let headingVertex = this.rotateVertexAboutObject(
        new Vector2D(2 * this.size, 0)
      );
      ctx.beginPath();
      ctx.moveTo(this.position.x, this.position.y);
      ctx.lineTo(headingVertex.x, headingVertex.y);
      ctx.stroke();
    }

    if (this.drawVelocity) {
      ctx.strokeStyle = "orange";
      let velocityDirection = this.velocity
        .unit()
        .scale(100 * this.velocity.magnitude())
        .plus(this.position);

      ctx.beginPath();
      ctx.moveTo(this.position.x, this.position.y);
      ctx.lineTo(velocityDirection.x, velocityDirection.y);
      ctx.stroke();
    }

    if (this.drawBoundingCircle) {
      ctx.strokeStyle = "green";
      ctx.beginPath();
      ctx.arc(this.position.x, this.position.y, this.size, 0, 2 * Math.PI);
      ctx.stroke();
    }
    if (this.opacity !== 1.0) this.opacity += 0.01;
    ctx.globalAlpha = 1.0;
  }
  updatePosition(deltaTime) {
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
    this.position = this.getToroidalCoordinates(this.position);
  }

  draw(ctx) {
    if (this.isAlive) this.drawObjectFrame(ctx);
  }

  update(deltaTime) {
    // this.heading += 1;
    this.updatePosition(deltaTime);
  }
}
