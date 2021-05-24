export default class InputHandler {
  constructor(ship, game) {
    // set reset button to call resetGame and toMenu
    let reset = document.getElementById("reset");
    let debug = document.getElementById("debug");

    reset.addEventListener("click", (event) => {
      game.resetGame();
      game.toMenu();
    });
    debug.addEventListener("click", (event) => {
      game.toggleDebug();
      if (game.debug) {
        console.log(game.asteroids);
        debug.innerHTML = "Debug Mode ON";
      } else debug.innerHTML = "Debug Mode OFF";
    });

    // prevent page-scrolling for arrow keys and spacebar
    window.addEventListener(
      "keydown",
      function (e) {
        if (
          ["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(
            e.code
          ) > -1
        ) {
          e.preventDefault();
        }
      },
      false
    );

    // handle keyboard inputs for ship control
    document.addEventListener("keydown", (event) => {
      switch (event.code) {
        case "ArrowLeft":
          ship.turnLeft = true;
          break;
        case "ArrowUp":
          ship.accelerate = true;
          break;
        case "ArrowRight":
          ship.turnRight = true;
          break;
        case "Space":
          if (!event.repeat) {
            ship.firing = true;
          }
          break;
        case "Escape":
          game.togglePause();
          break;
        case "Enter":
          game.start();
          break;
        default:
          break;
      }
    });

    document.addEventListener("keyup", (event) => {
      switch (event.code) {
        case "ArrowLeft":
          ship.turnLeft = false;
          break;
        case "ArrowUp":
          ship.accelerate = false;
          break;
        case "ArrowRight":
          ship.turnRight = false;
          break;
        case "Space":
          ship.firing = false;
          break;
        default:
          break;
      }
    });
  }
}
