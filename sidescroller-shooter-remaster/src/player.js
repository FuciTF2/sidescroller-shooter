// ============================================================
// player.js — Player state, movement, shooting, and damage
// Depends on: globals.js, assets.js, bullets.js, sounds.js
// ============================================================

const player = {
    x:               100,
    y:               335, // canvas.height (720) / 2 - 25; set literally to avoid parse-time canvas dependency
    width:           100,
    height:          100,
    hitboxOffsetX:   50,
    hitboxOffsetY:   50,
    scale:           1.5,
    speed:           390, // px/sec (was 4.5px/frame * 60fps)
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

function updatePlayer(delta) {
    const playerWidth = calculatePlayerWidth(player.y);

    player.dx = 0;
    player.dy = 0;

    if (keys[keyBindings.up])    player.dy = -player.speed;
    if (keys[keyBindings.down])  player.dy =  player.speed;
    if (keys[keyBindings.left])  player.dx = -player.speed;
    if (keys[keyBindings.right]) player.dx =  player.speed;

    // Enemies present: always face the nearest one
    // No enemies: face the direction the player is moving (if any)
    if (enemies.length > 0) {
        let nearest = enemies[0];
        let nearestDist = Math.abs(enemies[0].x - player.x);
        for (let i = 1; i < enemies.length; i++) {
            const d = Math.abs(enemies[i].x - player.x);
            if (d < nearestDist) { nearestDist = d; nearest = enemies[i]; }
        }
        player.facingRight = nearest.x > player.x;
    } else if (player.dx !== 0) {
        player.facingRight = player.dx > 0;
    } else {
        player.facingRight = true; // default face right when no enemies and standing still
    }

    player.x += player.dx * delta;
    player.y += player.dy * delta;

    const minY = 200;
    const maxY = 440;
    // Check right-edge level trigger BEFORE clamping so it can actually be reached
    // Only trigger if establishment has been used (or there isn't one) — 
    // don't advance the level while the establishment is still available
    if (enemiesCleared && player.x + playerWidth >= canvas.width) {
        if (devMode) console.log('Player reached the right edge, proceeding to next level');
        triggerLevelChange();
        player.x = 0;
    }

    if (player.x < 0)                            player.x = 0;
    if (player.x + playerWidth > canvas.width)   player.x = canvas.width - playerWidth;
    if (player.y < minY)                         player.y = minY;
    if (player.y > maxY)                         player.y = maxY;

    updatePlayerSprite();
}

function shootBullet() {
    const currentTime = Date.now();
    const weapon = WEAPONS[currentWeapon];
    if (!weapon) return;

    // Use weapon cooldown
    if (currentTime - player.lastShootTime < weapon.cooldown) return;

    // Check ammo
    if (!weapon.infinite && weaponAmmo[currentWeapon] <= 0) {
        // Fall back to pistol if out of ammo
        currentWeapon = 'pistol';
        return;
    }

    const scaledWidth  = player.width  * player.scale;
    const scaledHeight = player.height * player.scale;

    const bulletStartX = player.facingRight
        ? player.x + (player.width * 0.8)
        : player.x - (scaledWidth - player.width) / 2;
    const bulletStartY = player.y + scaledHeight / 4.365;

    const dir = player.facingRight ? 1 : -1;

    // Fire bulletsPerShot bullets, spread vertically
    const half = Math.floor(weapon.bulletsPerShot / 2);
    for (let i = 0; i < weapon.bulletsPerShot; i++) {
        const spreadOffset = weapon.spread > 0
            ? (i - half) * (weapon.spread / Math.max(weapon.bulletsPerShot - 1, 1))
            : 0;

        // SMG gets a small random horizontal jitter too
        const jitterX = weapon.spread > 0 ? (Math.random() - 0.5) * 40 : 0;

        bullets.push({
            x:           bulletStartX,
            y:           bulletStartY + spreadOffset,
            width:       weapon.id === 3 ? 16 : 10,  // sniper bullet is longer
            height:      weapon.id === 3 ? 4  : 5,
            speed:       (weapon.bulletSpeed + jitterX) * dir,
            damage:      weapon.damage,
            penetration: weapon.penetration,
            hitEnemies:  [],
            weaponId:    weapon.id,
        });
    }

    player.lastShootTime = currentTime;
    player.shootCooldown = weapon.cooldown; // keep in sync for animation

    const shootingSoundInstance = new Audio(shootingSoundSrc);
    shootingSoundInstance.volume = typeof masterVolume !== 'undefined' ? masterVolume : 1;
    shootingSoundInstance.play();

    if (!weapon.infinite) {
        weaponAmmo[currentWeapon] = Math.max(0, weaponAmmo[currentWeapon] - 1);
    }
}

function handleShooting() {
    if (keys['Space']) {
        shootBullet();
    }
}

function handlePlayerDamage(player, enemies, timestamp) {
    // player.scale is updated every frame by drawPlayer, so these reflect visual size
    const playerCX = player.x + (player.width  * player.scale) / 2;
    const playerCY = player.y + (player.height * player.scale) / 2;

    const scaledEnemyAttackRange = baseEnemyAttackRange * player.scale;

    enemies.forEach(enemy => {
        const ew = enemy.drawnW || enemy.width  * enemy.scale;
        const eh = enemy.drawnH || enemy.height * enemy.scale;

        // Horizontal: enemy must be within attack range on the X axis
        const hDist = Math.abs(enemy.x - playerCX);
        const hRange = ew / 2 + scaledEnemyAttackRange;

        // Vertical: enemy must be roughly at the same Y level (within one sprite height)
        const vDist  = Math.abs(enemy.y - playerCY);
        const vRange = Math.max(eh, player.height * player.scale);

        if (hDist <= hRange && vDist <= vRange) {
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
        triggerGameOver();
    }
}

function triggerGameOver() {
    // Snapshot stats before resetting anything
    gameOverStats.level    = currentLevel;
    gameOverStats.currency = playerCurrency;
    currentGameState       = gameState.GAME_OVER;
}