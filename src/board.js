export default class Board {
  constructor(game) {
    this.gameWidth = game.gameWidth;
    this.gameHeight = game.gameHeight;
    this.boardSize = game.boardSize;
    this.cellSize = game.cellSize;
    this.drawGrid = false;
    this.lineWidth = "5";
    this.game = game;
  }

  update(deltaTime) {}

  draw(ctx) {
    ctx.strokeStyle = "white";
    ctx.fillStyle = "black";
    ctx.lineWidth = this.lineWidth;
    ctx.strokeRect(0, 0, this.boardSize, this.boardSize);

    ctx.lineWidth = "0.5";
    if (this.drawGrid) {
      for (let i = 0; i < this.boardSize / this.cellSize; i++) {
        for (let j = 0; j < this.boardSize / this.cellSize; j++) {
          ctx.beginPath();
          ctx.moveTo(i * this.cellSize, j * this.cellSize);
          ctx.lineTo(i * this.cellSize, (j + 1) * this.cellSize);
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.moveTo(0, i * this.cellSize);
        ctx.lineTo(this.boardSize, i * this.cellSize);
        ctx.stroke();
      }
    }
  }
}
