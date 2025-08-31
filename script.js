// ================== CANVAS SETUP ==================
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth > 480 ? 480 : window.innerWidth - 20;
canvas.height = window.innerHeight > 640 ? 640 : window.innerHeight - 20;

// ================== LOAD IMAGES ==================
let bgImg = new Image();
bgImg.src = "assets/images/background.png";

let groundImg = new Image();
groundImg.src = "assets/images/ground.png";

let parrotImg = new Image();
parrotImg.src = "assets/images/parrot.png";

let pipeImg = new Image();
pipeImg.src = "assets/images/pipe.png";

// ================== LOAD SOUNDS ==================
let flapSound = new Audio("assets/sounds/flap.mp3");
let crashSound = new Audio("assets/sounds/crash.mp3");
let pointSound = new Audio("assets/sounds/point.mp3");

// ================== GAME VARIABLES ==================
let parrot = { x: 50, y: 150, width: 40, height: 40, gravity: 0, jump: -6 };
let pipes = [];
let pipeGap = 150;
let pipeWidth = 60;
let pipeSpeed = 2;
let score = 0;
let bestScore = localStorage.getItem("bestScore") || 0;
let gameOver = false;
let started = false; // 👈 Intro ke liye
let frame = 0;

// ================== INPUT HANDLERS ==================
document.addEventListener("keydown", e => {
  if (e.code === "Space") handleInput();
});
canvas.addEventListener("touchstart", handleInput);

function handleInput() {
  if (!started) {
    started = true; // 👈 Intro se game start
  } else if (!gameOver) {
    parrot.gravity = parrot.jump;
    flapSound.play();
  } else {
    resetGame(); // Restart
  }
}

// ================== DRAW FUNCTIONS ==================
function drawParrot() {
  ctx.drawImage(parrotImg, parrot.x, parrot.y, parrot.width, parrot.height);
}

function drawPipes() {
  pipes.forEach(pipe => {
    ctx.drawImage(pipeImg, pipe.x, pipe.y, pipeWidth, pipe.height);
  });
}

function drawGround() {
  ctx.drawImage(groundImg, 0, canvas.height - 100, canvas.width, 100);
}

function drawScore() {
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, 20, 30);
  ctx.fillText("Best: " + bestScore, 20, 60);
}

// ================== GAME LOGIC ==================
function update() {
  ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height); // background

  if (!started) {
    // 👇 Intro Screen
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText("Flappy Parrot", canvas.width / 2 - 90, canvas.height / 2 - 40);
    ctx.font = "20px Arial";
    ctx.fillText("Tap or Press SPACE to Start", canvas.width / 2 - 120, canvas.height / 2);
    drawParrot();
    requestAnimationFrame(update);
    return;
  }

  if (!gameOver) {
    frame++;

    // Parrot gravity
    parrot.gravity += 0.3;
    parrot.y += parrot.gravity;

    // Add pipes
    if (frame % 100 === 0) {
      let pipeY = Math.random() * (canvas.height - pipeGap - 200) + 50;
      pipes.push({ x: canvas.width, y: 0, height: pipeY }); // Top pipe
      pipes.push({ x: canvas.width, y: pipeY + pipeGap, height: canvas.height }); // Bottom pipe
    }

    // Move pipes
    pipes.forEach(pipe => (pipe.x -= pipeSpeed));

    // Collision detection
    pipes.forEach(pipe => {
      if (
        parrot.x < pipe.x + pipeWidth &&
        parrot.x + parrot.width > pipe.x &&
        parrot.y < pipe.y + pipe.height &&
        parrot.y + parrot.height > pipe.y
      ) {
        crashSound.play();
        gameOver = true;
      }
    });

    // Remove old pipes
    pipes = pipes.filter(pipe => pipe.x + pipeWidth > 0);

    // Score
    if (frame % 100 === 0) {
      score++;
      pointSound.play();
      if (score > bestScore) {
        bestScore = score;
        localStorage.setItem("bestScore", bestScore);
      }
    }

    // Difficulty increase
    if (score % 5 === 0 && pipeSpeed < 6) {
      pipeSpeed += 0.002; // Dheere dheere fast hoga
    }

    // Ground hit
    if (parrot.y + parrot.height >= canvas.height - 100) {
      crashSound.play();
      gameOver = true;
    }

    // Draw game objects
    drawPipes();
    drawGround();
    drawParrot();
    drawScore();
  } else {
    // Game Over screen
    ctx.fillStyle = "red";
    ctx.font = "40px Arial";
    ctx.fillText("Game Over", canvas.width / 2 - 100, canvas.height / 2 - 20);
    ctx.font = "20px Arial";
    ctx.fillText("Tap or Press SPACE to Restart", canvas.width / 2 - 130, canvas.height / 2 + 20);
    drawScore();
  }

  requestAnimationFrame(update);
}

// ================== RESET GAME ==================
function resetGame() {
  parrot.y = 150;
  parrot.gravity = 0;
  pipes = [];
  score = 0;
  pipeSpeed = 2;
  frame = 0;
  gameOver = false;
  started = false; // 👈 Restart pe intro screen
}

// ================== START ==================
update();
