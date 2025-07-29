// Canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game constants
const CELL_SIZE = 30;
const ROWS = 21;
const COLS = 19;

// Game state
let gameRunning = false;
let gamePaused = false;
let score = 0;
let lives = 3;
let animationId = null;
let frameCount = 0;
const GAME_SPEED = 8; // Controls game speed: 1 = very fast, 8 = normal, 12+ = slow

// Directions
const DIRECTIONS = {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 }
};

// Game map (0 = empty, 1 = wall, 2 = pellet, 3 = power pellet)
const gameMap = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
    [1,3,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,3,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,2,1,2,1,1,1,1,1,2,1,2,1,1,2,1],
    [1,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,1],
    [1,1,1,1,2,1,1,1,0,1,0,1,1,1,2,1,1,1,1],
    [0,0,0,1,2,1,0,0,0,0,0,0,0,1,2,1,0,0,0],
    [1,1,1,1,2,1,0,1,1,0,1,1,0,1,2,1,1,1,1],
    [0,0,0,0,2,0,0,1,0,0,0,1,0,0,2,0,0,0,0],
    [1,1,1,1,2,1,0,1,1,1,1,1,0,1,2,1,1,1,1],
    [0,0,0,1,2,1,0,0,0,0,0,0,0,1,2,1,0,0,0],
    [1,1,1,1,2,1,0,1,1,1,1,1,0,1,2,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,2,1],
    [1,3,2,1,2,2,2,2,2,2,2,2,2,2,2,1,2,3,1],
    [1,1,2,1,2,1,2,1,1,1,1,1,2,1,2,1,2,1,1],
    [1,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,1],
    [1,2,1,1,1,1,1,1,2,1,2,1,1,1,1,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

// Pacman object
const pacman = {
    x: 9,
    y: 15,
    direction: DIRECTIONS.RIGHT,
    nextDirection: null,
    mouthOpen: true,
    animationCounter: 0
};

// Ghosts array
const ghosts = [
    { x: 9, y: 9, color: '#FF0000', direction: DIRECTIONS.UP, name: 'Blinky' },
    { x: 8, y: 10, color: '#FFB8FF', direction: DIRECTIONS.LEFT, name: 'Pinky' },
    { x: 10, y: 10, color: '#00FFFF', direction: DIRECTIONS.RIGHT, name: 'Inky' },
    { x: 9, y: 10, color: '#FFB847', direction: DIRECTIONS.DOWN, name: 'Clyde' }
];

// Power pellet state
let powerMode = false;
let powerModeTimer = 0;

// Input handling
document.addEventListener('keydown', (e) => {
    if (!gameRunning || gamePaused) return;
    
    switch(e.key) {
        case 'ArrowUp':
            pacman.nextDirection = DIRECTIONS.UP;
            break;
        case 'ArrowDown':
            pacman.nextDirection = DIRECTIONS.DOWN;
            break;
        case 'ArrowLeft':
            pacman.nextDirection = DIRECTIONS.LEFT;
            break;
        case 'ArrowRight':
            pacman.nextDirection = DIRECTIONS.RIGHT;
            break;
    }
});

// Game functions
function startGame() {
    if (!gameRunning) {
        gameRunning = true;
        gamePaused = false;
        resetGameState();
        gameLoop();
    }
}

function pauseGame() {
    gamePaused = !gamePaused;
    if (!gamePaused && gameRunning) {
        gameLoop();
    }
}

function resetGame() {
    gameRunning = false;
    gamePaused = false;
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    resetGameState();
    drawGame();
}

function resetGameState() {
    score = 0;
    lives = 3;
    powerMode = false;
    powerModeTimer = 0;
    frameCount = 0;
    
    // Reset pacman position
    pacman.x = 9;
    pacman.y = 15;
    pacman.direction = DIRECTIONS.RIGHT;
    pacman.nextDirection = null;
    
    // Reset ghosts
    ghosts[0] = { x: 9, y: 9, color: '#FF0000', direction: DIRECTIONS.UP, name: 'Blinky' };
    ghosts[1] = { x: 8, y: 10, color: '#FFB8FF', direction: DIRECTIONS.LEFT, name: 'Pinky' };
    ghosts[2] = { x: 10, y: 10, color: '#00FFFF', direction: DIRECTIONS.RIGHT, name: 'Inky' };
    ghosts[3] = { x: 9, y: 10, color: '#FFB847', direction: DIRECTIONS.DOWN, name: 'Clyde' };
    
    // Reset pellets
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            if (gameMap[y][x] === 0) {
                // Keep empty spaces empty
            } else if (gameMap[y][x] !== 1) {
                // Reset pellets
                if ((y === 2 && (x === 1 || x === 17)) || 
                    (y === 15 && (x === 1 || x === 17))) {
                    gameMap[y][x] = 3; // Power pellets
                } else {
                    gameMap[y][x] = 2; // Regular pellets
                }
            }
        }
    }
    
    updateScore();
    updateLives();
}

function canMove(x, y, direction) {
    const newX = x + direction.x;
    const newY = y + direction.y;
    
    // Check boundaries
    if (newX < 0 || newX >= COLS || newY < 0 || newY >= ROWS) {
        return false;
    }
    
    // Check walls
    return gameMap[newY][newX] !== 1;
}

function movePacman() {
    // Try to change direction if requested
    if (pacman.nextDirection && canMove(pacman.x, pacman.y, pacman.nextDirection)) {
        pacman.direction = pacman.nextDirection;
        pacman.nextDirection = null;
    }
    
    // Move in current direction if possible
    if (canMove(pacman.x, pacman.y, pacman.direction)) {
        pacman.x += pacman.direction.x;
        pacman.y += pacman.direction.y;
        
        // Handle tunnel
        if (pacman.x < 0) pacman.x = COLS - 1;
        if (pacman.x >= COLS) pacman.x = 0;
        
        // Eat pellets
        const cell = gameMap[pacman.y][pacman.x];
        if (cell === 2) {
            gameMap[pacman.y][pacman.x] = 0;
            score += 10;
            updateScore();
        } else if (cell === 3) {
            gameMap[pacman.y][pacman.x] = 0;
            score += 50;
            powerMode = true;
            powerModeTimer = Math.floor(300 / GAME_SPEED); // Adjust for game speed
            updateScore();
        }
    }
    
    // Animate mouth
    pacman.animationCounter++;
    if (pacman.animationCounter % 4 === 0) {  // Adjusted for slower game speed
        pacman.mouthOpen = !pacman.mouthOpen;
    }
}

function moveGhosts() {
    ghosts.forEach(ghost => {
        // Simple AI: Random movement with preference to move towards Pacman
        const possibleDirections = [];
        
        for (let dir of Object.values(DIRECTIONS)) {
            if (canMove(ghost.x, ghost.y, dir)) {
                // Don't reverse direction immediately
                if (!(dir.x === -ghost.direction.x && dir.y === -ghost.direction.y)) {
                    possibleDirections.push(dir);
                }
            }
        }
        
        if (possibleDirections.length === 0) {
            // If no other option, reverse
            ghost.direction = { 
                x: -ghost.direction.x, 
                y: -ghost.direction.y 
            };
        } else {
            // Choose direction (simple AI - random with slight bias towards Pacman)
            if (Math.random() < 0.7 && !powerMode) {
                // Try to move towards Pacman
                let bestDir = possibleDirections[0];
                let minDist = Infinity;
                
                possibleDirections.forEach(dir => {
                    const newX = ghost.x + dir.x;
                    const newY = ghost.y + dir.y;
                    const dist = Math.abs(newX - pacman.x) + Math.abs(newY - pacman.y);
                    if (dist < minDist) {
                        minDist = dist;
                        bestDir = dir;
                    }
                });
                
                ghost.direction = bestDir;
            } else {
                // Random movement or flee from Pacman in power mode
                if (powerMode) {
                    // Try to move away from Pacman
                    let bestDir = possibleDirections[0];
                    let maxDist = 0;
                    
                    possibleDirections.forEach(dir => {
                        const newX = ghost.x + dir.x;
                        const newY = ghost.y + dir.y;
                        const dist = Math.abs(newX - pacman.x) + Math.abs(newY - pacman.y);
                        if (dist > maxDist) {
                            maxDist = dist;
                            bestDir = dir;
                        }
                    });
                    
                    ghost.direction = bestDir;
                } else {
                    ghost.direction = possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
                }
            }
        }
        
        // Move ghost
        ghost.x += ghost.direction.x;
        ghost.y += ghost.direction.y;
        
        // Handle tunnel
        if (ghost.x < 0) ghost.x = COLS - 1;
        if (ghost.x >= COLS) ghost.x = 0;
    });
}

function checkCollisions() {
    ghosts.forEach((ghost, index) => {
        if (ghost.x === pacman.x && ghost.y === pacman.y) {
            if (powerMode) {
                // Eat ghost
                score += 200;
                updateScore();
                // Reset ghost position
                ghost.x = 9;
                ghost.y = 10;
            } else {
                // Pacman dies
                lives--;
                updateLives();
                if (lives > 0) {
                    // Reset positions
                    pacman.x = 9;
                    pacman.y = 15;
                    pacman.direction = DIRECTIONS.RIGHT;
                    ghosts[0] = { x: 9, y: 9, color: '#FF0000', direction: DIRECTIONS.UP, name: 'Blinky' };
                    ghosts[1] = { x: 8, y: 10, color: '#FFB8FF', direction: DIRECTIONS.LEFT, name: 'Pinky' };
                    ghosts[2] = { x: 10, y: 10, color: '#00FFFF', direction: DIRECTIONS.RIGHT, name: 'Inky' };
                    ghosts[3] = { x: 9, y: 10, color: '#FFB847', direction: DIRECTIONS.DOWN, name: 'Clyde' };
                } else {
                    // Game over
                    gameRunning = false;
                    alert('Game Over! Score: ' + score);
                }
            }
        }
    });
}

function checkWin() {
    // Check if all pellets are eaten
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            if (gameMap[y][x] === 2 || gameMap[y][x] === 3) {
                return false;
            }
        }
    }
    return true;
}

function drawTrimbleLogo(centerX, centerY, size) {
    ctx.save();
    
    // Scale factor for the logo
    const scale = size / 20;
    
    // Trimble blue color
    const trimbleBlue = '#4B7BA7';
    
    ctx.translate(centerX, centerY);
    ctx.scale(scale, scale);
    
    // Draw three triangular shapes arranged in a circle
    ctx.fillStyle = trimbleBlue;
    
    // First triangle (top)
    ctx.save();
    ctx.rotate(0);
    ctx.beginPath();
    ctx.moveTo(0, -8);
    ctx.lineTo(-6, 4);
    ctx.lineTo(0, 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    
    // Second triangle (bottom right)
    ctx.save();
    ctx.rotate(2 * Math.PI / 3);
    ctx.beginPath();
    ctx.moveTo(0, -8);
    ctx.lineTo(-6, 4);
    ctx.lineTo(0, 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    
    // Third triangle (bottom left)
    ctx.save();
    ctx.rotate(4 * Math.PI / 3);
    ctx.beginPath();
    ctx.moveTo(0, -8);
    ctx.lineTo(-6, 4);
    ctx.lineTo(0, 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    
    // Draw center circle
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.strokeStyle = trimbleBlue;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.restore();
}

function drawGame() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw maze and pellets
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            const cell = gameMap[y][x];
            const pixelX = x * CELL_SIZE;
            const pixelY = y * CELL_SIZE;
            
            if (cell === 1) {
                // Draw wall
                ctx.fillStyle = '#0000FF';
                ctx.fillRect(pixelX, pixelY, CELL_SIZE, CELL_SIZE);
                
                // Add inner border for 3D effect
                ctx.strokeStyle = '#4040FF';
                ctx.lineWidth = 2;
                ctx.strokeRect(pixelX + 2, pixelY + 2, CELL_SIZE - 4, CELL_SIZE - 4);
            } else if (cell === 2) {
                // Draw Trimble logo (small version)
                drawTrimbleLogo(pixelX + CELL_SIZE/2, pixelY + CELL_SIZE/2, 8);
            } else if (cell === 3) {
                // Draw power Trimble logo (larger version)
                drawTrimbleLogo(pixelX + CELL_SIZE/2, pixelY + CELL_SIZE/2, 12);
            }
        }
    }
    
    // Draw Pacman
    const pacmanX = pacman.x * CELL_SIZE + CELL_SIZE/2;
    const pacmanY = pacman.y * CELL_SIZE + CELL_SIZE/2;
    
    ctx.fillStyle = '#FFFF00';
    ctx.beginPath();
    
    if (pacman.mouthOpen) {
        // Draw Pacman with mouth open
        let startAngle, endAngle;
        if (pacman.direction === DIRECTIONS.RIGHT) {
            startAngle = 0.2 * Math.PI;
            endAngle = 1.8 * Math.PI;
        } else if (pacman.direction === DIRECTIONS.LEFT) {
            startAngle = 1.2 * Math.PI;
            endAngle = 0.8 * Math.PI;
        } else if (pacman.direction === DIRECTIONS.UP) {
            startAngle = 1.7 * Math.PI;
            endAngle = 1.3 * Math.PI;
        } else {
            startAngle = 0.7 * Math.PI;
            endAngle = 0.3 * Math.PI;
        }
        ctx.arc(pacmanX, pacmanY, CELL_SIZE/2 - 2, startAngle, endAngle);
        ctx.lineTo(pacmanX, pacmanY);
    } else {
        // Draw full circle
        ctx.arc(pacmanX, pacmanY, CELL_SIZE/2 - 2, 0, Math.PI * 2);
    }
    ctx.fill();
    
    // Draw ghosts
    ghosts.forEach(ghost => {
        const ghostX = ghost.x * CELL_SIZE + CELL_SIZE/2;
        const ghostY = ghost.y * CELL_SIZE + CELL_SIZE/2;
        
        ctx.fillStyle = powerMode ? '#0000FF' : ghost.color;
        
        // Ghost body
        ctx.beginPath();
        ctx.arc(ghostX, ghostY - 3, CELL_SIZE/2 - 2, Math.PI, 0);
        ctx.lineTo(ghostX + CELL_SIZE/2 - 2, ghostY + CELL_SIZE/2 - 5);
        
        // Wavy bottom
        for (let i = 0; i < 3; i++) {
            ctx.lineTo(ghostX + CELL_SIZE/2 - 2 - (i+1) * 6, 
                      ghostY + CELL_SIZE/2 - 5 - (i % 2) * 3);
        }
        ctx.lineTo(ghostX - CELL_SIZE/2 + 2, ghostY + CELL_SIZE/2 - 5);
        ctx.closePath();
        ctx.fill();
        
        // Ghost eyes
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(ghostX - 5, ghostY - 3, 3, 0, Math.PI * 2);
        ctx.arc(ghostX + 5, ghostY - 3, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Ghost pupils
        ctx.fillStyle = powerMode ? '#FFFFFF' : '#000000';
        ctx.beginPath();
        ctx.arc(ghostX - 5, ghostY - 3, 1.5, 0, Math.PI * 2);
        ctx.arc(ghostX + 5, ghostY - 3, 1.5, 0, Math.PI * 2);
        ctx.fill();
    });
}

function updateScore() {
    document.getElementById('score').textContent = score;
}

function updateLives() {
    document.getElementById('lives').textContent = lives;
}

function gameLoop() {
    if (!gameRunning || gamePaused) return;
    
    frameCount++;
    
    // Only update game logic every GAME_SPEED frames
    if (frameCount % GAME_SPEED === 0) {
        // Update power mode timer
        if (powerMode) {
            powerModeTimer--;
            if (powerModeTimer <= 0) {
                powerMode = false;
            }
        }
        
        // Move entities
        movePacman();
        moveGhosts();
        
        // Check collisions
        checkCollisions();
        
        // Check win condition
        if (checkWin()) {
            gameRunning = false;
            alert('You Win! Score: ' + score);
            return;
        }
    }
    
    // Always draw for smooth visuals
    drawGame();
    
    // Continue game loop
    animationId = requestAnimationFrame(gameLoop);
}

// Initial draw
drawGame(); 