// ============================================================
// enemy.js — Enemy state, initialization, AI, and collision
// Depends on: globals.js, assets.js
// ============================================================

let enemies = [];

function initializeEnemiesForLevel(level) {
    // Bosses only appear in story mode
    if (isStoryMode && isBossLevel(level)) {
        return [createBoss(level)];
    }

    // Scale difficulty by location tier (every 5 levels = one tier)
    const tier           = Math.floor((level - 1) / LEVELS_PER_LOCATION); // 0, 1, 2, ...
    const maxEnemies     = Math.min(2 + tier, 8);         // 2 at tier 0, grows to 8
    const numberOfEnemies = Math.min(level, maxEnemies);
    const enemyHealth    = 50 + tier * 15;                // 50, 65, 80, 95, 110, 125...
    const enemySpeedBase = 168 + tier * 12;               // gets slightly faster each tier

    const result = [];
    const enemyScale             = 1.5;
    const enemyMinYLocal         = 200;
    const enemyMaxYLocal         = 440;
    const enemyHorizontalSpacing = 120;

    for (let i = 0; i < numberOfEnemies; i++) {
        const enemyX = canvas.width + 50 + (i * enemyHorizontalSpacing);
        const enemyY = Math.random() * (enemyMaxYLocal - enemyMinYLocal) + enemyMinYLocal;
        const enemyWidth  = 64 * enemyScale;
        const enemyHeight = 64 * enemyScale;

        result.push({
            x:              enemyX,
            y:              enemyY,
            dx:             -enemySpeedBase,
            dy:             0,
            animationTimer: 0,
            animationSpeed: 25,
            frameX:         0,
            frameWidth:     180,
            frameHeight:    150,
            totalFrames:    10,
            idleFrame:      0,
            speed:          enemySpeedBase,
            facingLeft:     true,
            width:          enemyWidth,
            height:         enemyHeight,
            health:         enemyHealth,
            maxHealth:      enemyHealth,
            image:          images.enemy,
            scale:          enemyScale,
            lastAttackTime: 0,
            isBoss:         false,
        });
    }

    return result;
}

function createBoss(level) {
    // Level 10: fake-out — dies in one hit
    // Levels 20, 30: double health, vertical movement, shoots at player
    const isFakeOut  = level === 10;
    const bossHealth = isFakeOut ? 1 : 100;
    const bossScale  = 2.2;
    const bossWidth  = 64 * bossScale;
    const bossHeight = 64 * bossScale;

    // Spawn to the right, vertically centred
    const startX = canvas.width - bossWidth - 60;
    const startY = (enemyMinY + enemyMaxY) / 2;

    // Clear any leftover boss bullets from the previous boss fight
    bossBullets.length = 0;

    return {
        x:              startX,
        y:              startY,
        dx:             0,
        dy:             isFakeOut ? 0 : 120, // px/sec vertical speed
        animationTimer: 0,
        animationSpeed: 25,
        frameX:         0,
        frameWidth:     180,
        frameHeight:    150,
        totalFrames:    10,
        idleFrame:      0,
        speed:          0,   // bosses don't use horizontal speed
        facingLeft:     true,
        width:          bossWidth,
        height:         bossHeight,
        health:         bossHealth,
        maxHealth:      bossHealth,
        image:          images.enemy,
        scale:          bossScale,
        lastAttackTime: 0,
        isBoss:         true,
        isFakeOut:      isFakeOut,
        verticalDir:    1, // 1 = moving down, -1 = moving up
        lastShootTime:  0,
    };
}

function updateEnemyAnimation(timestamp) {
    enemies.forEach(enemy => {
        if (timestamp - enemy.animationTimer > enemy.animationSpeed) {
            enemy.frameX = (enemy.frameX + 1) % enemy.totalFrames;
            enemy.animationTimer = timestamp;
        }
    });
}

function updateEnemyPositions(enemies, player, delta) {
    enemies.forEach(enemy => {
        if (enemy.isBoss) return; // boss handles its own movement
        moveTowardPlayer(enemy, delta);

        if (isNaN(enemy.x) || isNaN(enemy.y)) {
            if (devMode) console.error('Invalid position values:', enemy.x, enemy.y);
        }
    });
}

function moveTowardPlayer(enemy, delta) {
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
            // Proximity slow: full speed beyond SLOW_RADIUS, tapers to MIN_SPEED_FACTOR at contact
            const SLOW_RADIUS       = 200;
            const MIN_SPEED_FACTOR  = 0.35;
            const proximityFactor   = magnitude >= SLOW_RADIUS
                ? 1
                : MIN_SPEED_FACTOR + (1 - MIN_SPEED_FACTOR) * (magnitude / SLOW_RADIUS);

            const effectiveSpeed = enemy.speed * proximityFactor;
            enemy.dx = (directionX / magnitude) * effectiveSpeed;
            enemy.dy = (directionY / magnitude) * effectiveSpeed;
        } else {
            enemy.dx = 0;
            enemy.dy = 0;
        }
    }

    enemy.x += enemy.dx * delta;
    enemy.y += enemy.dy * delta;

    if (enemy.dx > 0)      enemy.facingLeft = false;
    else if (enemy.dx < 0) enemy.facingLeft = true;

    if (enemy.y < enemyMinY) enemy.y = enemyMinY;
    if (enemy.y > enemyMaxY) enemy.y = enemyMaxY;
}

function updateEnemies(delta) {
    enemies.forEach((enemy, index) => {
        // enemy.x/y is the sprite centre; player.x/y is top-left so offset to centre
        const distance = distanceBetween(
            player.x + player.width  / 2,
            player.y + player.height / 2,
            enemy.x,
            enemy.y
        );

        if (distance > enemyAttackRange) {
            moveTowardPlayer(enemy, delta);
        }

        if (distance <= enemyAttackRange) {
            const currentTime = Date.now();
            if (currentTime - enemy.lastAttackTime >= enemyAttackCooldown) {
                player.health--;
                enemy.lastAttackTime = currentTime;

                if (player.health <= 0) {
                    triggerGameOver();
                }
            }
        }

        // Boss-specific behaviour
        if (enemy.isBoss && !enemy.isFakeOut) {
            updateBossMovement(enemy, delta);
            updateBossShooting(enemy);
        }

        // Bullet-enemy collisions are handled entirely in updateBullets() in bullets.js

        // Player passes through enemies freely — no physical collision resolution
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

// =============================================================
//  BOSS MOVEMENT & SHOOTING
// =============================================================

function updateBossMovement(boss, delta) {
    // Vertical-only bounce between enemyMinY and enemyMaxY
    boss.y += boss.dy * boss.verticalDir * delta;

    if (boss.y >= enemyMaxY) {
        boss.y         = enemyMaxY;
        boss.verticalDir = -1;
    } else if (boss.y <= enemyMinY) {
        boss.y         = enemyMinY;
        boss.verticalDir = 1;
    }
}

function updateBossShooting(boss) {
    const now = Date.now();
    if (now - boss.lastShootTime < BOSS_SHOOT_COOLDOWN) return;
    boss.lastShootTime = now;

    // Aim directly at the player centre
    const playerCX = player.x + (player.width  * player.scale) / 2;
    const playerCY = player.y + (player.height * player.scale) / 2;
    const dirX     = playerCX - boss.x;
    const dirY     = playerCY - boss.y;
    const mag      = Math.sqrt(dirX * dirX + dirY * dirY);
    if (mag === 0) return;

    bossBullets.push({
        x:      boss.x,
        y:      boss.y,
        width:  12,
        height: 8,
        vx:     (dirX / mag) * BOSS_BULLET_SPEED,
        vy:     (dirY / mag) * BOSS_BULLET_SPEED,
        damage: 15,
    });

    if (devMode) console.log('Boss fired a bullet');
}

function updateBossBullets(delta) {
    for (let i = bossBullets.length - 1; i >= 0; i--) {
        const b = bossBullets[i];
        b.x += b.vx * delta;
        b.y += b.vy * delta;

        // Remove if off screen
        if (b.x < -20 || b.x > canvas.width + 20 ||
            b.y < -20 || b.y > canvas.height + 20) {
            bossBullets.splice(i, 1);
            continue;
        }

        // Hit player
        const pw = player.width  * player.scale;
        const ph = player.height * player.scale;
        if (b.x < player.x + pw  && b.x + b.width  > player.x &&
            b.y < player.y + ph  && b.y + b.height > player.y) {
            player.health -= b.damage;
            player.health  = Math.max(player.health, 0);
            bossBullets.splice(i, 1);
            if (devMode) console.log(`Boss bullet hit player! Health: ${player.health}`);
        }
    }
}

function drawBossBullets() {
    ctx.fillStyle = '#ff4444';
    bossBullets.forEach(b => {
        ctx.beginPath();
        ctx.arc(b.x + b.width / 2, b.y + b.height / 2, 6, 0, Math.PI * 2);
        ctx.fill();
    });
}