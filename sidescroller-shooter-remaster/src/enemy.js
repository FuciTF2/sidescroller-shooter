// ============================================================
// enemy.js — Enemy state, initialization, AI, and collision
// Depends on: globals.js, assets.js
// ============================================================

let enemies = [];

function initializeEnemiesForLevel(level) {
    const maxEnemies = 5;
    const numberOfEnemies = Math.min(level, maxEnemies);
    const result = [];

    const enemyScale            = 1.5;
    const enemyMinYLocal        = 200;
    const enemyMaxYLocal        = 440;
    const enemyHorizontalSpacing = 120;

    for (let i = 0; i < numberOfEnemies; i++) {
        const enemyX = canvas.width + 50 + (i * enemyHorizontalSpacing);
        const enemyY = Math.random() * (enemyMaxYLocal - enemyMinYLocal) + enemyMinYLocal;

        const enemyWidth  = 64 * enemyScale;
        const enemyHeight = 64 * enemyScale;

        result.push({
            x:              enemyX,
            y:              enemyY,
            dx:             -1.5,
            dy:             0,
            animationTimer: 0,
            animationSpeed: 25,
            frameX:         0,
            frameWidth:     180,
            frameHeight:    150,
            totalFrames:    10,
            idleFrame:      0,
            speed:          1.5,
            facingLeft:     true,
            width:          enemyWidth,
            height:         enemyHeight,
            health:         50,
            maxHealth:      50,
            image:          images.enemy,
            scale:          enemyScale,
            lastAttackTime: 0,
        });
    }

    return result;
}

function updateEnemyAnimation(timestamp) {
    enemies.forEach(enemy => {
        if (timestamp - enemy.animationTimer > enemy.animationSpeed) {
            enemy.frameX = (enemy.frameX + 1) % enemy.totalFrames;
            enemy.animationTimer = timestamp;
        }
    });
}

function updateEnemyPositions(enemies, player) {
    enemies.forEach(enemy => {
        moveTowardPlayer(enemy);

        if (isNaN(enemy.x) || isNaN(enemy.y)) {
            if (devMode) console.error('Invalid position values:', enemy.x, enemy.y);
        }
    });
}

function moveTowardPlayer(enemy) {
    if (enemy.x > canvas.width) {
        enemy.dx = -enemy.speed;
        enemy.dy = 0;
    } else {
        const playerCenterX = player.x + (player.width * player.scale) / 2;
        const playerCenterY = player.y + (player.height * player.scale) / 2;
        const directionX    = playerCenterX - enemy.x;
        const directionY    = playerCenterY - enemy.y;
        const magnitude     = Math.sqrt(directionX * directionX + directionY * directionY);

        const scaledEnemyAttackRange = baseEnemyAttackRange * player.scale;

        if (magnitude > scaledEnemyAttackRange) {
            enemy.dx = (directionX / magnitude) * enemy.speed;
            enemy.dy = (directionY / magnitude) * enemy.speed;
        } else {
            enemy.dx = 0;
            enemy.dy = 0;
        }
    }

    enemy.x += enemy.dx;
    enemy.y += enemy.dy;

    if (enemy.dx > 0)      enemy.facingLeft = false;
    else if (enemy.dx < 0) enemy.facingLeft = true;

    if (enemy.y < enemyMinY) enemy.y = enemyMinY;
    if (enemy.y > enemyMaxY) enemy.y = enemyMaxY;
}

function updateEnemies() {
    enemies.forEach((enemy, index) => {
        const distance = distanceBetween(
            player.x + player.width / 2,
            player.y + player.height / 2,
            enemy.x + enemy.width / 2,
            enemy.y + enemy.height / 2
        );

        if (distance > enemyAttackRange) {
            moveTowardPlayer(enemy);
        }

        if (distance <= enemyAttackRange) {
            const currentTime = Date.now();
            if (currentTime - enemy.lastAttackTime >= enemyAttackCooldown) {
                player.health--;
                enemy.lastAttackTime = currentTime;

                if (player.health <= 0) {
                    alert('Game Over!');
                    resetGame();
                }
            }
        }

        bullets.forEach((bullet, bulletIndex) => {
            if (
                bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y
            ) {
                enemy.health -= bullet.damage;
                bullets.splice(bulletIndex, 1);
                if (enemy.health <= 0) {
                    enemies.splice(index, 1);
                }
            }
        });

        if (detectPlayerEnemyCollision(player, enemy)) {
            resolvePlayerEnemyCollision(player, enemy);
        }
    });

    for (let i = 0; i < enemies.length; i++) {
        for (let j = i + 1; j < enemies.length; j++) {
            if (detectCollision(enemies[i], enemies[j])) {
                resolveCollision(enemies[i], enemies[j]);
            }
        }
    }

    if (enemies.length === 0 && !enemiesCleared) {
        enemiesCleared = true;
        checkLevelProgression();
    }
}

// --- Collision helpers ---

function distanceBetween(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

function detectCollision(rect1, rect2) {
    return rect1.x - rect1.width / 2 < rect2.x + rect2.width / 2 &&
           rect1.x + rect1.width / 2 > rect2.x - rect2.width / 2 &&
           rect1.y - rect1.height / 2 < rect2.y + rect2.height / 2 &&
           rect1.y + rect1.height / 2 > rect2.y - rect2.height / 2;
}

function detectPlayerEnemyCollision(player, enemy) {
    return detectCollision(player, enemy);
}

function resolvePlayerEnemyCollision(player, enemy) {
    const overlapX = (player.width + enemy.width) / 2 - Math.abs(player.x + player.width / 2 - (enemy.x + enemy.width / 2));
    const overlapY = (player.height + enemy.height) / 2 - Math.abs(player.y + player.height / 2 - (enemy.y + enemy.height / 2));

    if (overlapX > overlapY) {
        if (player.y < enemy.y) enemy.y += overlapY;
        else                    enemy.y -= overlapY;
    } else {
        if (player.x < enemy.x) enemy.x += overlapX;
        else                    enemy.x -= overlapX;
    }
}

function resolveCollision(enemy1, enemy2) {
    const overlapX = (enemy1.width + enemy2.width) / 2 - Math.abs(enemy1.x - enemy2.x);
    const overlapY = (enemy1.height + enemy2.height) / 2 - Math.abs(enemy1.y - enemy2.y);

    if (overlapX > overlapY) {
        if (enemy1.y < enemy2.y) { enemy1.y -= overlapY / 2; enemy2.y += overlapY / 2; }
        else                     { enemy1.y += overlapY / 2; enemy2.y -= overlapY / 2; }
    } else {
        if (enemy1.x < enemy2.x) { enemy1.x -= overlapX / 2; enemy2.x += overlapX / 2; }
        else                     { enemy1.x += overlapX / 2; enemy2.x -= overlapX / 2; }
    }
}

function getNumberOfEnemies(level) {
    if (level >= 1  && level <= 4)  return 0;
    if (level >= 5  && level <= 8)  return 0;
    if (level >= 9  && level <= 12) return 1;
    return 2;
}