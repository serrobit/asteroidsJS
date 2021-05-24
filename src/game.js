import Asteroid from "./asteroid.js";
import Board from "./board.js";
import InputHandler from "./input.js";
import Ship from "./ship.js";
import Debris from "./debris.js";
import Explosion from "./explosion.js";
import { detectCollision } from "./collisions.js";
import Vector2D from "./vector2D.js";

const ADD_LIFE_AFTER_LEVEL = 3;
const BASE_SCORE_PER_HIT = 50;
const SCORE_MULTIPLIER_PER_LEVEL = 100;
const INITIAL_PLAYER_LIVES = 3;

const START_NUM_ASTEROIDS = 1; // initial number of asteroids
const MAX_ASTEROID_SIZE = 64;
const MIN_ASTEROID_SIZE = 8;
const MIN_ASTEROID_SIDES = 4;
const MAX_ASTEROID_SIDES = 12;
const MIN_ASTEROID_FRAGMENTS = 2;
const MAX_ASTEROID_FRAGMENTS = 8;

const MIN_DEBRIS = 4;
const MAX_DEBRIS = 8;

const BOARD_SIZE = 600;
const CELL_SIZE = 16;
const controls = document.getElementById("gameControls");

const GAMESTATE = {
  PAUSED: 0,
  RUNNING: 1,
  MENU: 2,
  GAMEOVER: 3,
  RESPAWNING: 4
};

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

export default class Game {
  constructor(gameWidth, gameHeight, ctx) {
    this.gameWidth = gameWidth;
    this.gameHeight = gameHeight;
    this.gameState = GAMESTATE.MENU;
    this.boardSize = BOARD_SIZE;
    this.cellSize = CELL_SIZE;
    this.board = new Board(this);
    this.ship = new Ship(this);
    this.gameObjects = [];
    this.asteroids = [];
    this.missiles = [];
    this.debris = [];
    this.explosions = [];
    this.level = 1;
    this.playerScore = 0;
    this.playerLives = INITIAL_PLAYER_LIVES;
    new InputHandler(this.ship, this);

    // flag for drawing debug features
    this.debug = false;
  }

  start() {
    if (
      this.gameState !== GAMESTATE.MENU &&
      this.gameState !== GAMESTATE.NEWLEVEL &&
      this.gameState !== GAMESTATE.GAMEOVER
    ) {
      return;
    }

    if (this.gameState === GAMESTATE.GAMEOVER) {
      this.gameState = GAMESTATE.MENU;
      this.resetGame();
      return;
    }
    if (this.level === 1) this.asteroids = this.createAsteroids();
    this.gameState = GAMESTATE.RUNNING;
  }

  resetGame() {
    this.asteroids = [];
    this.missiles = [];
    this.debris = [];
    this.explosions = [];
    this.resetShip();
    this.playerLives = INITIAL_PLAYER_LIVES;
    this.playerScore = 0;
    this.level = 1;
  }

  toMenu() {
    this.gameState = GAMESTATE.MENU;
  }

  resetShip() {
    this.ship.velocity = new Vector2D(0, 0);
    this.ship.position = new Vector2D(this.boardSize / 2, this.boardSize / 2);
    this.ship.heading = 0;
  }

  togglePause() {
    if (this.gameState === GAMESTATE.MENU) return;
    if (this.gameState === GAMESTATE.PAUSED) {
      if (this.ship.isAlive) this.gameState = GAMESTATE.RUNNING;
      else this.gameState = GAMESTATE.RESPAWNING;
    } else {
      this.gameState = GAMESTATE.PAUSED;
    }
  }

  toggleDebug() {
    this.debug = !this.debug;
    [
      this.ship,
      ...this.missiles,
      ...this.debris,
      ...this.explosions,
      ...this.asteroids
    ].forEach((object) => object.toggleDebug());
  }

  createAsteroids() {
    let asteroids = [];
    let startingPosition = new Vector2D();
    for (let i = 0; i < this.level * START_NUM_ASTEROIDS; i++) {
      do {
        startingPosition.x = getRndInteger(0, this.board.boardSize);
        startingPosition.y = getRndInteger(0, this.board.boardSize);
      } while (
        startingPosition.minus(this.ship.position).magnitude() <
        2 * MAX_ASTEROID_SIZE + this.ship.size
      );

      let newAsteroid = new Asteroid(
        this.board,
        startingPosition.x,
        startingPosition.y,
        getRndInteger(-10, 10) * (this.level / 1000),
        getRndInteger(-10, 10) * (this.level / 1000),
        MAX_ASTEROID_SIZE,
        getRndInteger(MIN_ASTEROID_SIDES, MAX_ASTEROID_SIDES)
      );
      newAsteroid.opacity = 0.0;
      asteroids.push(newAsteroid);
    }
    return asteroids;
  }

  createAsteroidFragments(asteroid, momentumObject) {
    let momentum = momentumObject ? momentumObject : new Vector2D(0, 0);
    momentum = momentum.scale(1.0 / asteroid.size);
    let fragments = getRndInteger(
      MIN_ASTEROID_FRAGMENTS,
      MAX_ASTEROID_FRAGMENTS
    );
    if (asteroid.size >= MIN_ASTEROID_SIZE * fragments) {
      for (let i = 0; i < fragments; i++) {
        let newAsteroid = new Asteroid(
          this.board,
          (asteroid.size / fragments) *
            Math.cos((2 * Math.PI * i) / fragments) +
            asteroid.position.x,
          (asteroid.size / fragments) *
            Math.sin((2 * Math.PI * i) / fragments) +
            asteroid.position.y,
          asteroid.velocity.x +
            momentum.x +
            0.01 * Math.cos((2 * Math.PI * i) / fragments),
          asteroid.velocity.y +
            momentum.y +
            0.01 * Math.sin((2 * Math.PI * i) / fragments),
          asteroid.size / fragments,
          getRndInteger(MIN_ASTEROID_SIDES, MAX_ASTEROID_SIDES)
        );
        if (this.debug) {
          console.log(newAsteroid.position, newAsteroid.velocity);
        }
        newAsteroid.opacity = 0.25;
        this.asteroids.push(newAsteroid);
      }
    }
  }

  createDebris(spaceObject) {
    let num_debris = getRndInteger(MIN_DEBRIS, MAX_DEBRIS);
    let speed = spaceObject.velocity.magnitude();
    for (let i = 0; i < num_debris; i++) {
      this.debris.push(
        new Debris(
          this.board,
          spaceObject.position.x +
            20 * Math.cos((2 * Math.PI * i) / num_debris),
          spaceObject.position.y +
            20 * Math.sin((2 * Math.PI * i) / num_debris),
          speed * Math.cos((2 * Math.PI * i) / num_debris),
          speed * Math.sin((2 * Math.PI * i) / num_debris)
        )
      );
    }
  }

  createExplosion(spaceObject) {
    this.explosions.push(
      new Explosion(this.board, spaceObject.position.x, spaceObject.position.y)
    );
  }

  resolveExplosion(explosion, spaceObject) {
    let explosionVector = spaceObject.position.minus(explosion.position);
    if (explosionVector.magnitude() === 0) return;
    let explosionMagnitude =
      explosion.explosiveFactor /
      (spaceObject.size * explosionVector.magnitude() ** 2);
    explosionVector = explosionVector.unit().scale(explosionMagnitude);
    spaceObject.velocity = spaceObject.velocity.plus(explosionVector);
  }

  resolveMissileCollision(missile, asteroid) {
    let momentumObject = new Vector2D(
      missile.velocity.x * missile.size,
      missile.velocity.y * missile.size
    );
    missile.isAlive = false;
    asteroid.isAlive = false;
    this.createAsteroidFragments(asteroid, momentumObject);
    this.createExplosion(missile);
    this.createDebris(missile);
    this.playerScore += Math.ceil(
      (BASE_SCORE_PER_HIT * this.level) / asteroid.size
    );
  }

  resolveShipCollision(asteroid) {
    this.ship.isAlive = false;
    asteroid.isAlive = false;
    this.createDebris(this.ship);
    this.createAsteroidFragments(asteroid);
    this.playerLives -= 1;
  }

  // resolves collision between two asteroids
  // according to conservation of momentum
  // mass is equivalent to object size here
  resolveAsteroidCollision(asteroid1, asteroid2) {
    // resolve position
    const positionDiff = asteroid1.position.minus(asteroid2.position);
    const positionDiffMag = positionDiff.magnitude();
    const positionDiffUnit = positionDiff.unit();
    const overlap = asteroid1.size + asteroid2.size - positionDiffMag;
    if (positionDiffMag === 0) return;
    asteroid2.position = asteroid2.position.minus(
      positionDiffUnit.scale(overlap)
    );

    //  resolve velocities
    const velocityDiff = asteroid1.velocity.minus(asteroid2.velocity);
    const inertiaFactor1 =
      (2 * asteroid2.size) / (asteroid1.size + asteroid2.size);
    const inertiaFactor2 =
      (2 * asteroid1.size) / (asteroid1.size + asteroid2.size);
    const inertiaFactor3 =
      velocityDiff.dot(positionDiff) / positionDiffMag ** 2;

    const vf1 = asteroid1.velocity.minus(
      positionDiff.scale(inertiaFactor1 * inertiaFactor3)
    );
    const vf2 = asteroid2.velocity.minus(
      positionDiff.scale(-inertiaFactor2 * inertiaFactor3)
    );

    asteroid1.velocity = vf1;
    asteroid2.velocity = vf2;
  }

  handleExplosions() {
    for (let i = 0; i < this.explosions.length; i++) {
      for (let j = 0; j < this.asteroids.length; j++) {
        if (this.asteroids[j].isAlive) {
          if (detectCollision(this.explosions[i], this.asteroids[j])) {
            this.resolveExplosion(this.explosions[i], this.asteroids[j]);
          }
        }
      }

      // for (let j = 0; j < this.missiles.length; j++) {
      //   if (this.missiles[j].isAlive) {
      //     if (detectCollision(this.explosions[i], this.missiles[j])) {
      //       this.resolveExplosion(this.explosions[i], this.missiles[j]);
      //     }
      //   }
      // }
    }
  }

  handleMissileAsteroidCollisions() {
    if (this.missiles.length > 0) {
      for (let j = 0; j < this.asteroids.length; j++) {
        if (this.asteroids[j].isAlive) {
          for (let i = 0; i < this.missiles.length; i++) {
            if (
              this.missiles[i].isAlive &&
              detectCollision(this.missiles[i], this.asteroids[j])
            ) {
              this.resolveMissileCollision(this.missiles[i], this.asteroids[j]);
              break;
            }
          }
        }
      }
    }
  }

  handleShipAsteroidCollisions() {
    if (this.ship.isAlive) {
      for (let i = 0; i < this.asteroids.length; i++) {
        if (
          this.asteroids[i].isAlive &&
          detectCollision(this.ship, this.asteroids[i])
        ) {
          this.resolveShipCollision(this.asteroids[i]);
          break;
        }
      }
    }
  }

  handleAsteroidAsteroidCollisions() {
    for (let i = 0; i < this.asteroids.length; i++) {
      for (let j = i + 1; j < this.asteroids.length; j++) {
        if (
          this.asteroids[i].isAlive &&
          this.asteroids[j].isAlive &&
          detectCollision(this.asteroids[i], this.asteroids[j])
        ) {
          this.resolveAsteroidCollision(this.asteroids[i], this.asteroids[j]);
        }
      }
    }
  }

  update(deltaTime) {
    if (this.playerLives === 0) {
      this.gameState = GAMESTATE.GAMEOVER;
    }
    if (this.gameState === GAMESTATE.PAUSED) {
      controls.style.display = "block";
    }
    if (
      this.gameState === GAMESTATE.PAUSED ||
      this.gameState === GAMESTATE.MENU
    ) {
      return;
    }

    if (
      this.gameState === GAMESTATE.RUNNING ||
      this.gameState === GAMESTATE.RESPAWNING
    ) {
      controls.style.display = "none";

      // remove any game objects that are no longer alive
      this.asteroids = this.asteroids.filter((a) => a.isAlive);
      this.debris = this.debris.filter((d) => d.isAlive);
      this.explosions = this.explosions.filter((e) => e.isAlive);
      this.missiles = this.missiles.filter((m) => m.isAlive);

      // resolve collisions
      this.handleMissileAsteroidCollisions();
      this.handleExplosions();
      this.handleShipAsteroidCollisions();
      this.handleAsteroidAsteroidCollisions();

      // call update for every game component
      [
        this.ship,
        this.board,
        ...this.missiles,
        ...this.debris,
        ...this.explosions,
        ...this.asteroids
      ].forEach((object) => object.update(deltaTime));

      // check to see if more asteroids need to be generated
      // add them if necessary
      if (this.asteroids.length < this.level) {
        this.level += 1;
        if (this.level % ADD_LIFE_AFTER_LEVEL === 0) this.playerLives += 1;
        if (this.level > 1) {
          this.playerScore += this.level * SCORE_MULTIPLIER_PER_LEVEL;
          this.asteroids = [...this.asteroids, ...this.createAsteroids()];
        }
      }

      // find a suitable moment to spawn the ship if needed
      if (this.gameState === GAMESTATE.RESPAWNING) {
        let placement_check = true;
        for (let i = 0; i < this.asteroids.length; i++) {
          let distanceBetween = this.ship.position
            .minus(this.asteroids[i].position)
            .magnitude();
          if (distanceBetween < 2 * this.asteroids[i].size + CELL_SIZE)
            placement_check = false;
        }
        if (placement_check) {
          this.gameState = GAMESTATE.RUNNING;
          this.ship.isAlive = true;
        }
        this.start();
      }

      // if the ship has been hit by an asteroid,
      // set gameState to RESPAWNING and reset the ship
      if (!this.ship.isAlive) {
        this.gameState = GAMESTATE.RESPAWNING;
        if (this.playerLives > 0) this.resetShip();
      }
    }
  }

  draw(ctx) {
    if (this.gameState === GAMESTATE.RESPAWNING) {
      ctx.beginPath();
      ctx.arc(this.ship.position.x, this.ship.position.y, 20, 0, 2 * Math.PI);
      ctx.fillStyle = "rgba(255,255,255,0.25)";
      ctx.fill();

      ctx.font = "0.5rem Arial";
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.fillText(
        "Respawning...",
        this.ship.position.x,
        this.ship.position.y + 20
      );
    }

    if (this.gameState === GAMESTATE.MENU) {
      ctx.rect(0, 0, this.boardSize, this.boardSize);
      ctx.fillStyle = "black";
      ctx.fill();

      ctx.font = "2rem Arial";
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.fillText(
        "Press ENTER to Start",
        this.boardSize / 2,
        this.boardSize / 2 - 30
      );
      return;
    }

    if (this.gameState === GAMESTATE.PAUSED) {
      ctx.rect(0, 0, this.boardSize, this.boardSize);
      ctx.fillStyle = "black";
      ctx.fill();

      ctx.font = "4rem Arial";
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.fillText("Paused", this.boardSize / 2, this.boardSize / 2 - 30);
    }

    if (this.gameState === GAMESTATE.GAMEOVER) {
      ctx.rect(0, 0, this.gameWidth, this.gameHeight);
      ctx.fillStyle = "rgba(0,0,0,1)";
      ctx.fill();

      ctx.font = "2rem Arial";
      ctx.fillStyle = "red";
      ctx.textAlign = "center";
      ctx.fillText("GAME OVER", this.boardSize / 2, this.boardSize / 2 - 30);

      ctx.font = "1rem Arial";
      ctx.fillStyle = "white";
      ctx.fillText(
        "Score: " + this.playerScore,
        this.boardSize / 2,
        this.boardSize / 2 + 20
      );
    }

    if (this.debug) {
      ctx.textAlign = "left";
      ctx.fillStyle = "white";
      ctx.font = "18px Arial";
      ctx.fillText("Asteroids: " + this.asteroids.length, 5, 20);
    }

    ctx.fillStyle = "black";
    [
      this.ship,
      this.board,
      ...this.missiles,
      ...this.debris,
      ...this.explosions,
      ...this.asteroids
    ].forEach((object) => object.draw(ctx));
  }
}
