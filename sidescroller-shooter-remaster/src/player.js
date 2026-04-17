// ============================================================
// player.js — Player state, movement, shooting, and damage
// Depends on: globals.js, assets.js, bullets.js, sounds.js
// ============================================================

const player = {
    x:               100,
    y:               canvas.height / 2 - 25,
    width:           100,
    height:          100,
    hitboxOffsetX:   50,
    hitboxOffsetY:   50,
    scale:           1.5,
    speed:           4.5,
    dx:              0,
    dy:              0,
    sprite:          null, // Set after images load (see assets.js)
    frameX:          0,
    frameY:          0,
    frameWidth:      231,
    frameHeight:     186,
    facingRight:     true,
    animationTimer:  0,
    animationSpeed:  8,
    totalFrames:     14,
    idleFrame:       13,
    lastShootTime:   0,
    shootCooldown:   200,
    health:          100,
    maxHealth:       100,
    lastDamageTime:  0,
    damageInterval:  1000,
};

// Wire up sprite reference once assets.js has populated `images`
// (safe because assets.js runs before player.js sets this at call-time)
function initPlayerSprite() {
    player.sprite = images.player;
}

function calculatePlayerHeight(y) {
    return 50 + (y / canvas.height) * 20;
}

function calculatePlayerWidth(y) {
    return 50 + (y / canvas.height) * 20;
}

function updatePlayerSprite() {
    player.animationTimer++;
    if (player.animationTimer >= player.animationSpeed) {
        player.animationTimer = 0;
        if (player.dx !== 0 || player.dy !== 0) {
            player.frameX = (player.frameX + 1) % (player.totalFrames - 1);
        } else {
            player.frameX = player.idleFrame;
        }
    }
}

function updatePlayer() {
    const playerWidth = calculatePlayerWidth(player.y);

    player.dx = 0;
    player.dy = 0;

    if (keys['ArrowUp']    || keys['KeyW']) player.dy = -player.speed;
    if (keys['ArrowDown']  || keys['KeyS']) player.dy =  player.speed;
    if (keys['ArrowLeft']  || keys['KeyA']) {
        player.dx = -player.speed;
        player.facingRight = false;
    }
    if (keys['ArrowRight'] || keys['KeyD']) {
        player.dx = player.speed;
        player.facingRight = true;
    }

    player.x += player.dx;
    player.y += player.dy;

    const minY = 200;
    const maxY = 440;
    if (player.x < 0)                            player.x = 0;
    if (player.x + playerWidth > canvas.width)   player.x = canvas.width - playerWidth;
    if (player.y < minY)                         player.y = minY;
    if (player.y > maxY)                         player.y = maxY;

    if (enemiesCleared && player.x + playerWidth >= canvas.width) {
        if (devMode) console.log('Player reached the right edge, proceeding to next level');
        triggerLevelChange();
    }

    updatePlayerSprite();
}

function shootBullet() {
    const currentTime = Date.now();
    if (currentTime - player.lastShootTime >= player.shootCooldown) {
        if (ammoInventory[selectedAmmoType] > 0 || selectedAmmoType === 'standard') {
            const ammo = ammoTypes[selectedAmmoType];

            const scaledWidth  = player.width  * player.scale;
            const scaledHeight = player.height * player.scale;

            const bulletStartX = player.facingRight
                ? player.x + (player.width * 0.8)
                : player.x - (scaledWidth - player.width) / 2;
            const bulletStartY = player.y + scaledHeight / 4.365;

            bullets.push({
                x:          bulletStartX,
                y:          bulletStartY,
                width:      10,
                height:     5,
                speed:      player.facingRight ? 10 : -10,
                damage:     ammo.damage,
                penetration: ammo.penetration,
                hitEnemies: []
            });

            player.lastShootTime = currentTime;

            const shootingSoundInstance = new Audio(shootingSoundSrc);
            shootingSoundInstance.play();

            if (selectedAmmoType !== 'standard') {
                ammoInventory[selectedAmmoType]--;
            }
        }
    }
}

function handleShooting() {
    if (keys['Space']) {
        shootBullet();
    }
}

function handlePlayerDamage(player, enemies, timestamp) {
    const playerHitboxX      = player.x;
    const playerHitboxY      = player.y;
    const playerWidthScaled  = player.width  * player.scale;
    const playerHeightScaled = player.height * player.scale;

    const scaledEnemyAttackRange = baseEnemyAttackRange * player.scale;

    enemies.forEach(enemy => {
        const enemyWidthScaled  = enemy.width  * enemy.scale;
        const enemyHeightScaled = enemy.height * enemy.scale;

        const distance = distanceBetween(
            playerHitboxX + playerWidthScaled  / 2,
            playerHitboxY + playerHeightScaled / 2,
            enemy.x + enemyWidthScaled  / 2,
            enemy.y + enemyHeightScaled / 2
        );

        if (distance <= scaledEnemyAttackRange) {
            if (timestamp - player.lastDamageTime > player.damageInterval) {
                player.health -= 10;
                player.lastDamageTime = timestamp;
                if (devMode) console.log(`Player hit! Health: ${player.health}`);
            }
        }
    });
}

function checkGameOver() {
    if (player.health <= 0) {
        alert('Game Over! Restarting the game...');
        resetGame();
    }
}