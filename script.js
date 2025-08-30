// 🎮 Flappy Parrot Game

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// 🔹 Canvas auto resize
canvas.width = window.innerWidth > 480 ? 480 : window.innerWidth;
canvas.height = window.innerHeight > 640 ? 640 : window.innerHeight;

// 📂 Load Images
const backgroundImg = new Image();
backgroundImg.src = "assets/images/background.png";

const groundImg = new Image();
groundImg.src = "assets/images/ground.png";

const parrotImg = new Image();
parrotImg.src = "assets/images/parrot.png";

const pipeImg = new Image();
pipeImg.src = "assets/images/pipe.png";

// 📂 Load Sounds
const flapSound = new Audio("assets/sounds/flap.mp3");
const crashSound = new Audio("assets/sounds/crash.mp3");
const pointSound = new Audio("assets/sounds/point.mp3");

// 🐦 Parrot
let parrot = {
    x: 50,
    y: 150,
    width: 40,
    height: 40,
    gravity: 0.6,
    lift: -10,
    velocity: 0
};

// 🌲 Pipes
let pipes = [];
let pipeWidth = 60;
let pipeGap = 150;
let frame = 0;
let score = 0;
let bestScore = localStorage.getItem("bestScore") || 0;
let gameOver = false;

// ⚡ Pipe speed (dynamic)
let pipeSpeed = 2;

// 🌍 Background scrolling
let bgX = 0;
let groundX = 0;

// 🎨 Draw Parrot
function drawParrot() {
    ctx.drawImage(parrotImg, parrot.x, parrot.y, parrot.width, parrot.height);
}

// 🎨 Draw Pipes
function drawPipes() {
    pipes.forEach(pipe => {
        ctx.drawImage(pipeImg, pipe.x, 0, pipeWidth, pipe.top);
        ctx.drawImage(pipeImg, pipe.x, canvas.height - pipe.bottom, pipeWidth, pipe.bottom);
    });
}

// 🎨 Draw Background
function drawBackground() {
    ctx.drawImage(backgroundImg, bgX, 0, canvas.width, canvas.height);
    ctx.drawImage(backgroundImg, bgX + canvas.width, 0, canvas.width, canvas.height);

    bgX -= 1;
    if (bgX <= -canvas.width) bgX = 0;
}

// 🎨 Draw Ground
function drawGround() {
    ctx.drawImage(groundImg, groundX, canvas.height - 100, canvas.width, 100);
    ctx.drawImage(groundImg, groundX + canvas.width, canvas.height - 100, canvas.width, 100);

    groundX -= 2;
    if (groundX <= -canvas.width) groundX = 0;
}

// 🏆 Score
function drawScore() {
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 20, 30);
    ctx.fillText("Best: " + bestScore, 20, 60);
}

// 🚀 Update Game
function update() {
    if (gameOver) {
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "yellow";
        ctx.font = "30px Arial";
        ctx.fillText("Game Over!", canvas.width / 2 - 80, canvas.height / 2 - 40);
        ctx.fillText("Your Score: " + score, canvas.width / 2 - 100, canvas.height / 2);
        ctx.fillText("Best Score: " + bestScore, canvas.width / 2 - 100, canvas.height / 2 + 40);
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background + Ground
    drawBackground();
    drawGround();

    // Parrot physics
    parrot.velocity += parrot.gravity;
    parrot.y += parrot.velocity;

    if (parrot.y + parrot.height > canvas.height - 100) {
        gameOver = true;
        crashSound.play();
    }

    drawParrot();

    // Pipes
    if (frame % 90 === 0) {
        let topHeight = Math.random() * (canvas.height / 2);
        let bottomHeight = canvas.height - topHeight - pipeGap - 100;
        pipes.push({ x: canvas.width, top: topHeight, bottom: bottomHeight });
    }

    pipes.forEach((pipe, i) => {
        pipe.x -= pipeSpeed;

        // Collision
        if (
            parrot.x < pipe.x + pipeWidth &&
            parrot.x + parrot.width > pipe.x &&
            (parrot.y < pipe.top || parrot.y + parrot.height > canvas.height - pipe.bottom)
        ) {
            gameOver = true;
            crashSound.play();
        }

        // Score
        if (pipe.x + pipeWidth === parrot.x) {
            score++;
            pointSound.play();
            if (score > bestScore) {
                bestScore = score;
                localStorage.setItem("bestScore", bestScore);
            }
        }
    });

    drawPipes();
    drawScore();

    // 🎚️ Dynamic difficulty
    pipeSpeed = 2 + Math.floor(score / 5);
    pipeGap = 150 - Math.min(score * 2, 70);

    frame++;
    requestAnimationFrame(update);
}

// 🎮 Controls
document.addEventListener("keydown", function (e) {
    if (e.code === "Space") {
        parrot.velocity = parrot.lift;
        flapSound.play();
    }
});

canvas.addEventListener("touchstart", function () {
    parrot.velocity = parrot.lift;
    flapSound.play();
});

// ▶️ Start
update();
