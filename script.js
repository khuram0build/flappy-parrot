// ====================
// Flappy Parrot (Shapes Version)
// ====================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Auto resize
function resizeCanvas() {
  canvas.width = window.innerWidth > 480 ? 480 : window.innerWidth - 20;
  canvas.height = window.innerHeight > 640 ? 640 : window.innerHeight - 20;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// Sounds
const flapSound = document.getElementById("flapSound");
const crashSound = document.getElementById("crashSound");
const pointSound = document.getElementById("pointSound");

// Variables
let parrotX = 50;
let parrotY = 150;
let parrotSize = 30;
let gravity = 1.2;
let lift = -18;
let velocity = 0;

let pipes = [];
let pipeWidth = 60;
let pipeGap = 150;
let frame = 0;
let score = 0;
let bestScore = localStorage.getItem("bestScore") || 0;
let gameOver = false;

let pipeSpeed = 2;

// Clouds + Trees
let clouds = [{x: 100, y: 50}, {x: 300, y: 100}];
let trees = [{x: 200, y: canvas.height - 120}, {x: 400, y: canvas.height - 130}];

// Draw Background (sky + clouds + trees + ground)
function drawBackground() {
  // Sky
  ctx.fillStyle = "#87ceeb";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Clouds
  ctx.fillStyle = "white";
  clouds.forEach(cloud => {
    ctx.beginPath();
    ctx.arc(cloud.x, cloud.y, 20, 0, Math.PI * 2);
    ctx.arc(cloud.x + 25, cloud.y + 10, 25, 0, Math.PI * 2);
    ctx.arc(cloud.x + 55, cloud.y, 20, 0, Math.PI * 2);
    ctx.fill();
    cloud.x -= 0.5;
    if (cloud.x < -60) cloud.x = canvas.width + 50;
  });

  // Trees
  trees.forEach(tree => {
    ctx.fillStyle = "sienna"; // trunk
    ctx.fillRect(tree.x, tree.y, 20, 40);
    ctx.fillStyle = "green"; // leaves
    ctx.beginPath();
    ctx.arc(tree.x + 10, tree.y, 30, 0, Math.PI * 2);
    ctx.fill();

    tree.x -= 1;
    if (tree.x < -50) tree.x = canvas.width + 50;
  });

  // Ground
  ctx.fillStyle = "green";
  ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
}

// Draw Parrot (circle + beak + wing)
function drawParrot() {
  // Body
  ctx.fillStyle = "yellow";
  ctx.beginPath();
  ctx.arc(parrotX, parrotY, parrotSize/2, 0, Math.PI * 2);
  ctx.fill();

  // Beak
  ctx.fillStyle = "orange";
  ctx.beginPath();
  ctx.moveTo(parrotX + parrotSize/2, parrotY);
  ctx.lineTo(parrotX + parrotSize, parrotY - 5);
  ctx.lineTo(parrotX + parrotSize, parrotY + 5);
  ctx.closePath();
  ctx.fill();

  // Wing
  ctx.fillStyle = "red";
  ctx.beginPath();
  ctx.arc(parrotX - 5, parrotY, parrotSize/3, 0, Math.PI * 2);
  ctx.fill();

  // Eye
  ctx.fillStyle = "black";
  ctx.beginPath();
  ctx.arc(parrotX + 5, parrotY - 5, 3, 0, Math.PI * 2);
  ctx.fill();
}

// Draw Pipes
function drawPipes() {
  pipes.forEach(pipe => {
    ctx.fillStyle = "red";
    // Top pipe
    ctx.fillRect(pipe.x, 0, pipeWidth, pipe.top);
    // Bottom pipe
    ctx.fillRect(pipe.x, canvas.height - pipe.bottom - 40, pipeWidth, pipe.bottom);
  });
}

// Draw Score
function drawScore() {
  ctx.fillStyle = "black";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, 20, 30);
  ctx.fillText("Best: " + bestScore, 20, 60);
}

// Update Game
function update() {
  if (gameOver) {
    ctx.fillStyle = "red";
    ctx.font = "40px Arial";
    ctx.fillText("Game Over", canvas.width/2 - 100, canvas.height/2);
    ctx.font = "20px Arial";
    ctx.fillText("Your Score: " + score, canvas.width/2 - 60, canvas.height/2 + 40);
    ctx.fillText("Best Score: " + bestScore, canvas.width/2 - 70, canvas.height/2 + 70);
    ctx.fillText("Tap or Press Space to Restart", canvas.width/2 - 120, canvas.height/2 + 110);
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBackground();

  velocity += gravity;
  parrotY += velocity;

  if (parrotY + parrotSize/2 > canvas.height - 40) {
    parrotY = canvas.height - 40 - parrotSize/2;
    crashSound.play();
    gameOver = true;
  }

  drawParrot();

  if (frame % 90 === 0) {
    let top = Math.random() * (canvas.height/2);
    let bottom = canvas.height - top - pipeGap;
    pipes.push({ x: canvas.width, top: top, bottom: bottom });
  }

  pipes.forEach(pipe => {
    pipe.x -= pipeSpeed;

    // Collision
    if (parrotX + parrotSize/2 > pipe.x && parrotX - parrotSize/2 < pipe.x + pipeWidth) {
      if (parrotY - parrotSize/2 < pipe.top || parrotY + parrotSize/2 > canvas.height - pipe.bottom - 40) {
        crashSound.play();
        gameOver = true;
      }
    }

    if (pipe.x + pipeWidth === parrotX) {
      score++;
      pointSound.play();
      if (score > bestScore) {
        bestScore = score;
        localStorage.setItem("bestScore", bestScore);
      }

      // Difficulty increase
      if (score % 5 === 0) {
        pipeSpeed += 0.5;
        pipeGap -= 5;
      }
    }
  });

  drawPipes();
  drawScore();

  frame++;
  requestAnimationFrame(update);
}

// Controls
function jump() {
  if (gameOver) {
    pipes = [];
    score = 0;
    parrotY = 150;
    velocity = 0;
    pipeSpeed = 2;
    pipeGap = 150;
    gameOver = false;
    frame = 0;
    update();
  } else {
    velocity = lift;
    flapSound.play();
  }
}
document.addEventListener("keydown", e => { if (e.code === "Space") jump(); });
canvas.addEventListener("touchstart", jump);

// Start
update();
