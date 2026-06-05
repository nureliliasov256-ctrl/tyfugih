const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreText = document.getElementById("score");

const box = 20;
const gridSize = 20;

let snake = [{ x: 200, y: 200 }];
let direction = "right";
let score = 0;

let apple;
let cat = null;
let catTimer = 0;
const catSpawnInterval = 70;
const catReward = 3;

let canChangeDirection = true;

// 📍 позиция
function createRandomPosition() {
    let position;

    do {
        position = {
            x: Math.floor(Math.random() * gridSize) * box,
            y: Math.floor(Math.random() * gridSize) * box
        };
    } while (
        snake.some(part => part.x === position.x && part.y === position.y) ||
        (apple && position.x === apple.x && position.y === apple.y) ||
        (cat && position.x === cat.x && position.y === cat.y)
    );

    return position;
}

apple = createRandomPosition();

// 🎮 клавиатура
document.addEventListener("keydown", changeDirection);

function changeDirection(event) {
    if (!canChangeDirection) return;

    const key = event.key;

    if (key === "ArrowLeft" && direction !== "right") direction = "left";
    if (key === "ArrowUp" && direction !== "down") direction = "up";
    if (key === "ArrowRight" && direction !== "left") direction = "right";
    if (key === "ArrowDown" && direction !== "up") direction = "down";

    canChangeDirection = false;
    setTimeout(() => canChangeDirection = true, 80);
}

// 🐱 кошка
function spawnCat() {
    cat = createRandomPosition();
    catTimer = 0;
}

// 🍎 яблоко
function drawApple() {
    ctx.fillStyle = "#d62f2f";
    ctx.beginPath();
    ctx.arc(apple.x + box / 2, apple.y + box / 2, box * 0.38, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#7bbf45";
    ctx.fillRect(apple.x + box * 0.52, apple.y + box * 0.02, 3, 8);
}

// 🐱 кошка
function drawCat() {
    ctx.fillStyle = "#e08a3e";
    ctx.fillRect(cat.x + 2, cat.y + 4, box - 4, box - 6);

    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(cat.x + 7, cat.y + 14, 2, 0, Math.PI * 2);
    ctx.arc(cat.x + box - 7, cat.y + 14, 2, 0, Math.PI * 2);
    ctx.fill();
}

// 🐍 змейка
function drawSnake() {
    for (let i = 0; i < snake.length; i++) {
        const s = snake[i];

        let gradient = ctx.createLinearGradient(s.x, s.y, s.x + box, s.y + box);
        gradient.addColorStop(0, "#7CFF4E");
        gradient.addColorStop(1, "#1f7a1f");

        if (i === 0) {
            ctx.fillStyle = "#9CFF6A";
            roundRect(s.x, s.y, box, box, 6);
            ctx.fill();

            ctx.fillStyle = "black";
            ctx.beginPath();
            ctx.arc(s.x + 6, s.y + 7, 2, 0, Math.PI * 2);
            ctx.arc(s.x + 14, s.y + 7, 2, 0, Math.PI * 2);
            ctx.fill();

        } else {
            ctx.fillStyle = gradient;
            roundRect(s.x + 1, s.y + 1, box - 2, box - 2, 5);
            ctx.fill();
        }
    }
}

// 🎮 игра
function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#182b0f";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawApple();
    if (cat) drawCat();
    drawSnake();

    const nextX =
        snake[0].x +
        (direction === "left" ? -box : direction === "right" ? box : 0);

    const nextY =
        snake[0].y +
        (direction === "up" ? -box : direction === "down" ? box : 0);

    // 💀 СМЕРТЬ (ИСПРАВЛЕНО)
    if (
        nextX < 0 ||
        nextY < 0 ||
        nextX >= canvas.width ||
        nextY >= canvas.height ||
        snake.some(part => part.x === nextX && part.y === nextY)
    ) {
        clearInterval(game);

        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "red";
        ctx.font = "60px Arial";
        ctx.fillText("❌", snake[0].x + 5, snake[0].y + 45);

        ctx.fillStyle = "white";
        ctx.font = "20px Arial";
        ctx.fillText("Игра окончена! Счёт: " + score, 120, 200);

        setTimeout(() => {
            restartGame();
        }, 1200);

        return;
    }

    let newHead = { x: nextX, y: nextY };
    snake.unshift(newHead);

    // 🍎 яблоко
    if (nextX === apple.x && nextY === apple.y) {
        score++;
        scoreText.textContent = score;
        apple = createRandomPosition();
    }

    // 🐱 кошка
    else if (cat && nextX === cat.x && nextY === cat.y) {
        score += catReward;
        scoreText.textContent = score;
        cat = null;
        apple = createRandomPosition();
    }

    else {
        snake.pop();
    }

    catTimer++;
    if (!cat && catTimer >= catSpawnInterval) {
        spawnCat();
    }
}

// ⏱ старт игры
let game = setInterval(drawGame, 200);

// 📱 swipe управление
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

canvas.addEventListener("touchmove", (e) => {
    e.preventDefault();

    if (!canChangeDirection) return;

    let dx = e.touches[0].clientX - touchStartX;
    let dy = e.touches[0].clientY - touchStartY;

    if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0 && direction !== "left") direction = "right";
        if (dx < 0 && direction !== "right") direction = "left";
    } else {
        if (dy > 0 && direction !== "up") direction = "down";
        if (dy < 0 && direction !== "down") direction = "up";
    }

    canChangeDirection = false;
    setTimeout(() => canChangeDirection = true, 80);
}, { passive: false });

// 📦 круглый квадрат
function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.closePath();
}

// 🔄 рестарт
function restartGame() {
    snake = [{ x: 200, y: 200 }];
    direction = "right";
    score = 0;
    scoreText.textContent = 0;

    apple = createRandomPosition();
    cat = null;
    catTimer = 0;

    game = setInterval(drawGame, 170);
}