// ==========================
// Flappy Parrot - Final Script
// ==========================

// Canvas setup
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Auto resize for mobile/PC
canvas.width = window.innerWidth > 480 ? 480 : window.innerWidth - 20;
canvas.height = window.innerHeight > 640 ? 640 : window.innerHeight - 20;

// ==========================
// Load Assets
// ==========================

// Sounds
let flapSound = new Audio("assets/sounds/flap.mp3");
let crashSound = new Audio("assets/sounds/crash.mp3");
let pointSound = new Audio("assets/sounds/point.mp3");

// Images
let parrotImg = new Image();
parrotImg.src = "assets/images/parrot.png";

let pipeImg = new Image();
pipeImg.src = "assets/images/pipe.png";

let bgImg = new Image();
bgImg.src = "assets/images/background.png";

let groundImg = new Image();
groundImg.src = "assets/images/ground.png";

// ==========================
// Game Variables
// ==========================
let parrot = {
    x: 50,
    y: 150,
    width: 40,
    height: 40,
    gravity: 0.6,
    lift: -10,
    velocity: 0
};

let pipes = [];
let pipeWidth = 60;
let pipeGap = 150;
let frame = 0;
let score = 0;
let bestScore = localStorage.getItem("bestScore") || 0;
let gameOver = false;

let pipeSpeed = 2;

// ==========================
// Event Listeners
// ==========================
document.addEventListener("keydown", function (e) {
    if (e.code === "Space") {
        parrotJump();
    }
});

canvas.addEventListener("touchstart", function () {
    parrotJump();
});

function parrotJump() {
    if (!gameOver) {
        parrot.velocity = parrot.lift;
        flapSound.play();
    } else {
        resetGame();
    }
}

// ==========================
// Draw Functions
// ==========================
function drawParrot() {
    ctx.drawImage(parrotImg, parrot.x, parrot.y, parrot.width, parrot.height);
}

function drawBackground() {
    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
}

function drawGround() {
    ctx.drawImage(groundImg, 0, canvas.height - 50, canvas.width, 50);
}

function drawPipes() {
    for (let i = 0; i < pipes.length; i++) {
        let p = pipes[i];
        ctx.drawImage(pipeImg, p.x, 0, pipeWidth, p.top);
        ctx.drawImage(pipeImg, p.x, canvas.height - p.bottom, pipeWidth, p.bottom);
    }
}

// ==========================
// Update Loop
// ==========================
function update() {
    if (gameOver) {
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#fff";
        ctx.font = "30px Arial";
        ctx.fillText("Game Over!", canvas.width / 2 - 80, canvas.height / 2 - 40);
        ctx.fillText("Score: " + score, canvas.width / 2 - 60, canvas.height / 2);
        ctx.fillText("Best: " + bestScore, canvas.width / 2 - 60, canvas.height / 2 + 40);
        ctx.fillText("Tap / Space to Restart", canvas.width / 2 - 140, canvas.height / 2 + 100);
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    drawBackground();

    // Pipes
    if (frame % 100 === 0) {
        let top = Math.random() * (canvas.height / 2);
        let bottom = canvas.height - top - pipeGap - 50;
        pipes.push({ x: canvas.width, top: top, bottom: bottom });
    }

    for (let i = 0; i < pipes.length; i++) {
        let p = pipes[i];
        p.x -= pipeSpeed;

        // Collision
        if (
            parrot.x < p.x + pipeWidth &&
            parrot.x + parrot.width > p.x &&
            (parrot.y < p.top || parrot.y + parrot.height > canvas.height - p.bottom - 50)
        ) {
            gameOver = true;
            crashSound.play();
        }

        // Score
        if (p.x + pipeWidth === parrot.x) {
            score++;
            pointSound.play();
            if (score > bestScore) {
                bestScore = score;
                localStorage.setItem("bestScore", bestScore);
            }
        }
    }

    // Remove old pipes
    if (pipes.length && pipes[0].x < -pipeWidth) {
        pipes.shift();
    }

    drawPipes();

    // Gravity
    parrot.velocity += parrot.gravity;
    parrot.y += parrot.velocity;

    if (parrot.y + parrot.height >= canvas.height - 50) {
        gameOver = true;
        crashSound.play();
    }

    // Draw parrot + ground
    drawParrot();
    drawGround();

    // Scoreboard
    ctx.fillStyle = "#fff";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 20, 30);
    ctx.fillText("Best: " + bestScore, 20, 60);

    frame++;
    requestAnimationFrame(update);
}

function resetGame() {
    parrot.y = 150;
    parrot.velocity = 0;
    pipes = [];
    score = 0;
    gameOver = false;
    frame = 0;
    update();
}

function startGame() {
  update();
}

