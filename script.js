const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// --- game state ---
let pipes = [];
let frame = 0;
let score = 0;
let isGameOver = false;

const parrot = {
  x: 60,
  y: 200,
  w: 30,
  h: 30,
  gravity: 0.6,
  lift: -10,
  vel: 0,
  draw() {
    // simple parrot (circle + beak)
    ctx.fillStyle = "#19a974";
    ctx.beginPath();
    ctx.arc(this.x + this.w / 2, this.y + this.h / 2, this.w / 2, 0, Math.PI * 2);
    ctx.fill();
    // beak
    ctx.fillStyle = "#ffb700";
    ctx.beginPath();
    ctx.moveTo(this.x + this.w, this.y + this.h / 2);
    ctx.lineTo(this.x + this.w + 10, this.y + this.h / 2 - 5);
    ctx.lineTo(this.x + this.w, this.y + this.h / 2 + 5);
    ctx.closePath();
    ctx.fill();
  },
  update() {
    this.vel += this.gravity;
    this.y += this.vel;

    // ceiling
    if (this.y < 0) {
      this.y = 0;
      this.vel = 0;
    }
    // ground
    if (this.y + this.h >= canvas.height) {
      this.y = canvas.height - this.h;
      gameOver();
    }
  },
  flap() {
    this.vel = this.lift;
  }
};

function spawnPipe() {
  const gap = 120;
  const minTop = 40;
  const maxTop = canvas.height - gap - 60;
  const top = Math.floor(Math.random() * (maxTop - minTop + 1)) + minTop;
  const bottom = canvas.height - top - gap;
  pipes.push({ x: canvas.width, w: 50, top, bottom, passed: false });
}

function updatePipes() {
  if (frame % 95 === 0) spawnPipe();

  pipes.forEach(p => {
    p.x -= 2.2;

    // collision
    const withinX = parrot.x + parrot.w > p.x && parrot.x < p.x + p.w;
    const hitsTop = parrot.y < p.top;
    const hitsBottom = parrot.y + parrot.h > canvas.height - p.bottom;
    if (withinX && (hitsTop || hitsBottom)) {
      gameOver();
    }

    // score once when parrot passes pipe
    if (!p.passed && p.x + p.w < parrot.x) {
      p.passed = true;
      score++;
    }
  });

  // remove off-screen
  pipes = pipes.filter(p => p.x + p.w > 0);
}

function drawPipes() {
  pipes.forEach(p => {
    ctx.fillStyle = "darkgreen";
    // top pipe
    ctx.fillRect(p.x, 0, p.w, p.top);
    // bottom pipe
    ctx.fillRect(p.x, canvas.height - p.bottom, p.w, p.bottom);
  });
}

function drawScore() {
  ctx.fillStyle = "#000";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, 10, 28);
}

function gameOver() {
  if (isGameOver) return;
  isGameOver = true;
  setTimeout(() => {
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.font = "36px Arial";
    ctx.fillText("Game Over", 115, canvas.height / 2 - 10);
    ctx.font = "20px Arial";
    ctx.fillText("Final Score: " + score, 140, canvas.height / 2 + 20);
    ctx.fillText("Press Enter to Restart", 105, canvas.height / 2 + 50);
  }, 10);
}

function reset() {
  pipes = [];
  frame = 0;
  score = 0;
  isGameOver = false;
  parrot.y = 200;
  parrot.vel = 0;
  loop();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  parrot.draw();
  drawPipes();
  drawScore();
}

function update() {
  parrot.update();
  updatePipes();
}

function loop() {
  if (isGameOver) return;
  draw();
  update();
  frame++;
  requestAnimationFrame(loop);
}

// controls: keyboard + touch
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") parrot.flap();
  if (e.code === "Enter" && isGameOver) reset();
});
canvas.addEventListener("pointerdown", () => {
  if (isGameOver) reset();
  else parrot.flap();
});

// start
loop();
