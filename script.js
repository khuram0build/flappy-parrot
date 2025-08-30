const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Auto resize canvas
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

// Load parrot image
let parrotImg = new Image();
parrotImg.src = "parrot.png"; // repo me yahi naam hona chahiye

// Parrot object
let parrot = {
  x: 50,
  y: canvas.height / 2,
  width: 50,
  height: 50,
  gravity: 0.4,
  lift: -8,
  velocity: 0
};

// Pipes
let pipes = [];
let pipeWidth = 70;
let pipeGap = 160;
let frame = 0;
let score = 0;
let bestScore = localStorage.getItem("bestScore") || 0;
let gameOver = false;

// Difficulty speed
let pipeSpeed = 2;

// Background scroll
let bgX = 0;
let groundX = 0;

// Sounds (placeholder)
let flapSound = new Audio("flap.mp3");
let crashSound = new Audio("crash.mp3");
let pointSound = new Audio("point.mp3");

// Draw parrot
function drawParrot() {
  ctx.drawImage(parrotImg, parrot.x, parrot.y, parrot.width, parrot.height);
}

// Draw pipes
function drawPipes() {
  ctx.fillStyle = "red"; // red pipes
  pipes.forEach(pipe => {
    ctx.fillRect(pipe.x, 0, pipeWidth, pipe.top);
    ctx.fillRect(pipe.x, pipe.top + pipeGap, pipeWidth, canvas.height);
  });
}

// Background sky & ground
function drawBackground() {
  ctx.fillStyle = "#70c5ce"; // sky blue
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Moving clouds
  ctx.fillStyle = "white";
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.arc((i * 300 + bgX) % canvas.width, 100, 40, 0, Math.PI * 2);
    ctx.fill();
  }

  // Moving ground
  ctx.fillStyle = "#8B4513";
  ctx.fillRect(groundX, canvas.height - 50, canvas.width, 50);
  ctx.fillRect(groundX + canvas.width, canvas.height - 50, canvas.width, 50);

  bgX -= 0.5;
  groundX -= 2;

  if (groundX <= -canvas.width) groundX = 0;
}

// Handle pipes
function updatePipes() {
  if (frame % 100 === 0) {
    let top = Math.random() * (canvas.height - pipeGap - 100) + 20;
    pipes.push({ x: canvas.width, top: top });
  }

  pipes.forEach((pipe, index) => {
    pipe.x -= pipeSpeed;

    // Collision detection
    if (
      parrot.x < pipe.x + pipeWidth &&
      parrot.x + parrot.width > pipe.x &&
      (parrot.y < pipe.top || parrot.y + parrot.height > pipe.top + pipeGap)
    ) {
      gameOver = true;
      crashSound.play();
    }

    // Score
    if (pipe.x + pipeWidth === parrot.x) {
      score++;
      pointSound.play();
      if (score % 5 === 0) {
        pipeSpeed += 0.5; // speed increase
        pipeGap -= 5; // harder gap
      }
    }

    // Remove off-screen pipes
    if (pipe.x + pipeWidth < 0) {
      pipes.splice(index, 1);
    }
  });
}

// Show score
function drawScore() {
  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.fillText("Score: " + score, 20, 40);
  ctx.fillText("Best: " + bestScore, 20, 80);
}

// Main update loop
function update() {
  if (gameOver) {
    ctx.fillStyle = "black";
    ctx.font = "40px Arial";
    ctx.fillText("Game Over", canvas.width / 2 - 100, canvas.height / 2);
    ctx.fillText("Score: " + score, canvas.width / 2 - 80, canvas.height / 2 + 50);
    ctx.fillText("Best: " + bestScore, canvas.width / 2 - 80, canvas.height / 2 + 100);

    if (score > bestScore) {
      bestScore = score;
      localStorage.setItem("bestScore", bestScore);
    }
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBackground();
  updatePipes();
  drawPipes();

  parrot.velocity += parrot.gravity;
  parrot.y += parrot.velocity;

  drawParrot();
  drawScore();

  // Ground hit
  if (parrot.y + parrot.height > canvas.height - 50) {
    gameOver = true;
    crashSound.play();
  }

  frame++;
  requestAnimationFrame(update);
}

// Controls
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    parrot.velocity = parrot.lift;
    flapSound.play();
  }
});

// Mobile tap control
canvas.addEventListener("touchstart", () => {
  parrot.velocity = parrot.lift;
  flapSound.play();
});

// Start game
update();
