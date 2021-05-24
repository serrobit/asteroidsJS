import Game from "./game.js";

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;

let canvas = document.getElementById("gameScreen");
let ctx = canvas.getContext("2d");

canvas.width = GAME_WIDTH;
canvas.height = GAME_HEIGHT;

let game = new Game(GAME_WIDTH, GAME_HEIGHT);

let lastTime = 0;

function gameLoop(timestamp) {
  let deltaTime = timestamp - lastTime;
  lastTime = timestamp;

  game.update(deltaTime); // update the game

  ctx.fillStyle = "black";
  ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT); // clear last draw
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT); // draw the game background

  ctx.fillStyle = "black";
  game.draw(ctx); // draw all game components

  ctx.fillStyle = "black";
  ctx.fillRect(game.boardSize, 0, GAME_WIDTH, GAME_HEIGHT); // draw the score card

  ctx.textAlign = "left";
  ctx.fillStyle = "white";
  ctx.font = "18px Arial";

  ctx.fillText("Score: " + game.playerScore, game.boardSize + 5, 20);
  ctx.fillText("Lives: " + game.playerLives, game.boardSize + 5, 60);
  ctx.fillText("Level: " + game.level, game.boardSize + 5, 100);
  ctx.font = "10px Arial";
  ctx.fillText(1000 / deltaTime, game.boardSize + 5, GAME_HEIGHT - 5);
  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
