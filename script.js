let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");

let parrot = { x: 50, y: 150, width: 30, height: 30, gravity: 0.6, lift: -10, velocity: 0 };
let pipes = [];
let score = 0;
let bestScore = localStorage.getItem("bestScore") || 0;

// Parrot jump
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    parrot.velocity = parrot.lift;
  }
});

// Update game
function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Parrot physics
  parrot.velocity += parrot.gravity;
  parrot.y += parrot.velocity;
  ctx.fillStyle = "yellow";
  ctx.fillRect(parrot.x, parrot.y, parrot.width, parrot.height);

  // Add pipes
  if (pipes.length === 0 || pipes[pipes.length - 1].x < 300) {
    let gap = 100;
    let topHeight = Math.floor(Math.random() * (canvas.height - gap));
    pipes.push({ x: canvas.width, top: topHeight, bottom: canvas.height - topHeight - gap });
  }

  // Draw pipes
  ctx.fillStyle = "green";
  for (let i = 0; i < pipes.length; i++) {
    let pipe = pipes[i];
    pipe.x -= 2;

    ctx.fillRect(pipe.x, 0, 40, pipe.top);
    ctx.fillRect(pipe.x, canvas.height - pipe.bottom, 40, pipe.bottom);

    // Collision check
    if (
      parrot.x < pipe.x + 40 &&
      parrot.x + parrot.width > pipe.x &&
      (parrot.y < pipe.top || parrot.y + parrot.height > canvas.height - pipe.bottom)
    ) {
      gameOver();
      return;
    }

    // Score update
    if (pipe.x + 40 === parrot.x) {
      score++;
    }
  }

  // Remove old pipes
  if (pipes[0].x < -40) {
    pipes.shift();
  }

  // Draw score
  ctx.fillStyle = "black";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, 10, 20);
  ctx.fillText("Best: " + bestScore, 10, 40);

  requestAnimationFrame(update);
}

function gameOver() {
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem("bestScore", bestScore);
  }
  alert("Game Over! Your Score: " + score + " | Best Score: " + bestScore);
  document.location.reload();
}

update();
