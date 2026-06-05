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

function changeDirection(event) {
    const key = event.key;

    if (key === "ArrowLeft" && direction !== "right") direction = "left";
    if (key === "ArrowUp" && direction !== "down") direction = "up";
    if (key === "ArrowRight" && direction !== "left") direction = "right";
    if (key === "ArrowDown" && direction !== "up") direction = "down";
}

document.addEventListener("keydown", changeDirection);

function spawnCat() {
    cat = createRandomPosition();
    catTimer = 0;
}

function drawApple() {
    ctx.fillStyle = "#d62f2f";
    ctx.beginPath();
    ctx.arc(apple.x + box / 2, apple.y + box / 2, box * 0.38, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#7bbf45";
    ctx.fillRect(apple.x + box * 0.52, apple.y + box * 0.02, 3, 8);
    ctx.fillStyle = "#b10000";
    ctx.beginPath();
    ctx.arc(apple.x + box * 0.34, apple.y + box * 0.42, 2, 0, Math.PI * 2);
    ctx.fill();
}

function drawCat() {
    ctx.fillStyle = "#e08a3e";
    ctx.fillRect(cat.x + 2, cat.y + 4, box - 4, box - 6);
    ctx.fillRect(cat.x + 2, cat.y + 2, 6, 6);
    ctx.fillRect(cat.x + box - 8, cat.y + 2, 6, 6);
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(cat.x + 7, cat.y + 14, 2, 0, Math.PI * 2);
    ctx.arc(cat.x + box - 7, cat.y + 14, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffeb99";
    ctx.fillRect(cat.x + 8, cat.y + 18, 4, 4);
}

function drawSnake() {
    for (let i = 0; i < snake.length; i++) {
        const segment = snake[i];
        if (i === 0) {
            ctx.fillStyle = "#71d53e";
            ctx.fillRect(segment.x, segment.y, box, box);
            ctx.fillStyle = "black";
            ctx.beginPath();
            ctx.arc(segment.x + 7, segment.y + 8, 2, 0, Math.PI * 2);
            ctx.arc(segment.x + 13, segment.y + 8, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#2f6f16";
            ctx.beginPath();
            ctx.moveTo(segment.x + 8, segment.y + 14);
            ctx.lineTo(segment.x + 12, segment.y + 14);
            ctx.stroke();
        } else {
            ctx.fillStyle = i % 2 === 0 ? "#4c9c24" : "#6ccf3d";
            ctx.fillRect(segment.x, segment.y, box, box);
            ctx.strokeStyle = "#2f6f16";
            ctx.strokeRect(segment.x + 1, segment.y + 1, box - 2, box - 2);
        }
    }
}

function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#182b0f";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawApple();

    if (cat) {
        drawCat();
    }

    drawSnake();

    let headX = snake[0].x;
    let headY = snake[0].y;

    if (direction === "left") headX -= box;
    if (direction === "up") headY -= box;
    if (direction === "right") headX += box;
    if (direction === "down") headY += box;

    if (
        headX < 0 || headX >= canvas.width ||
        headY < 0 || headY >= canvas.height ||
        snake.some(part => part.x === headX && part.y === headY)
    ) {
        clearInterval(game);
        alert("Игра окончена! Счёт: " + score);
        location.reload();
        return;
    }

    let newHead = { x: headX, y: headY };
    snake.unshift(newHead);

    if (headX === apple.x && headY === apple.y) {
        score++;
        scoreText.textContent = score;
        apple = createRandomPosition();
    } else if (cat && headX === cat.x && headY === cat.y) {
        score += catReward;
        scoreText.textContent = score;
        cat = null;
        apple = createRandomPosition();
    } else {
        snake.pop();
    }

    catTimer++;
    if (!cat && catTimer >= catSpawnInterval) {
        spawnCat();
    }
}

let game = setInterval(drawGame, 120);