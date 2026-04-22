// ============================================================
// graphics.js — All rendering / draw functions
// Depends on: globals.js, assets.js, player.js, enemy.js, bullets.js
// ============================================================

// --- Scaling helpers ---

function calculateScalingFactor(y) {
    const minScale   = 0.5;
    const maxScale   = 2;
    const screenHeight = canvas.height;
    return minScale + (maxScale - minScale) * (y / screenHeight);
}

// --- Arrow / mark ---

function updateArrowPosition() {
    arrowY += arrowDirection * ARROW_SPEED;
    if (arrowY >= MARK_POSITION.y + ARROW_RANGE || arrowY <= MARK_POSITION.y - ARROW_RANGE) {
        arrowDirection *= -1;
    }
}

function drawMarkPosition() {
    if (devMode) console.log('Drawing store position');
    ctx.drawImage(arrowImage, MARK_POSITION.x, arrowY, MARK_POSITION.width, MARK_POSITION.height);

    if (devMode) {
        // Show the entry zone
        ctx.save();
        ctx.strokeStyle = establishmentUsed ? 'rgba(255,80,80,0.7)' : 'rgba(80,255,120,0.7)';
        ctx.lineWidth   = 2;
        ctx.setLineDash([8, 4]);
        ctx.strokeRect(STORE_POSITION.x, STORE_POSITION.y, STORE_POSITION.width, STORE_POSITION.height);
        ctx.fillStyle = establishmentUsed ? 'rgba(255,80,80,0.08)' : 'rgba(80,255,120,0.08)';
        ctx.fillRect(STORE_POSITION.x, STORE_POSITION.y, STORE_POSITION.width, STORE_POSITION.height);
        ctx.setLineDash([]);
        ctx.font      = 'bold 13px Arial';
        ctx.fillStyle = establishmentUsed ? 'rgba(255,80,80,0.9)' : 'rgba(80,255,120,0.9)';
        ctx.textAlign = 'center';
        ctx.fillText(
            establishmentUsed ? 'used' : (selectedEstablishment || 'none'),
            STORE_POSITION.x + STORE_POSITION.width / 2,
            STORE_POSITION.y - 6
        );
        ctx.textAlign = 'left';
        ctx.restore();
    }
}

// --- Background ---

function drawBackground() {
    const backgroundWidth  = canvas.width;
    const backgroundHeight = canvas.height;

    let x = backgroundX % backgroundWidth;
    if (x > 0) x -= backgroundWidth;

    while (x < canvas.width) {
        ctx.drawImage(backgroundImage, x, 0, backgroundWidth, backgroundHeight);
        x += backgroundWidth;
    }
}

// --- Player ---

function drawPlayer() {
    ctx.save();

    const maxScale  = 2;
    const minScale  = 0.5;
    const scale      = minScale + ((maxScale - minScale) * (player.y / canvas.height));
    const drawWidth  = player.width  * scale;
    const drawHeight = player.height * scale;

    // Write scale back so hitbox, damage, and collision all use the current visual size
    player.scale = scale;

    if (!player.facingRight) {
        ctx.scale(-1, 1);
        ctx.drawImage(
            player.sprite,
            player.frameX * player.frameWidth, 0, player.frameWidth, player.frameHeight,
            -player.x - drawWidth, player.y, drawWidth, drawHeight
        );
    } else {
        ctx.drawImage(
            player.sprite,
            player.frameX * player.frameWidth, 0, player.frameWidth, player.frameHeight,
            player.x, player.y, drawWidth, drawHeight
        );
    }

    ctx.restore();

    if (devMode) {
        ctx.strokeStyle = 'blue';
        ctx.lineWidth   = 2;
        ctx.strokeRect(player.x, player.y, drawWidth, drawHeight);
    }
}

function drawPlayerHealth() {
    ctx.fillStyle = 'black';
    ctx.fillRect(10, 10, 200, 20);

    ctx.fillStyle = 'green';
    const healthWidth = (player.health / player.maxHealth) * 200;
    ctx.fillRect(10, 10, healthWidth, 20);

    ctx.strokeStyle = 'white';
    ctx.strokeRect(10, 10, 200, 20);
}

// --- Enemy ---

function drawEnemy(enemy) {
    const scaleFactor  = calculateScalingFactor(enemy.y) * enemyScalingFactor;
    const scaledWidth  = enemy.frameWidth  * scaleFactor;
    const scaledHeight = enemy.frameHeight * scaleFactor;

    // Store actual drawn dimensions so collision/hitbox code always matches the sprite
    enemy.scale   = scaleFactor;
    enemy.drawnW  = scaledWidth;
    enemy.drawnH  = scaledHeight;

    if (enemy.facingLeft) {
        ctx.save();
        ctx.scale(-1, 1);
        ctx.drawImage(
            enemy.image,
            enemy.frameX * enemy.frameWidth, 0, enemy.frameWidth, enemy.frameHeight,
            -enemy.x - scaledWidth / 2, enemy.y - scaledHeight / 2, scaledWidth, scaledHeight
        );
        ctx.restore();
    } else {
        ctx.drawImage(
            enemy.image,
            enemy.frameX * enemy.frameWidth, 0, enemy.frameWidth, enemy.frameHeight,
            enemy.x - scaledWidth / 2, enemy.y - scaledHeight / 2, scaledWidth, scaledHeight
        );
    }

    if (devMode) {
        const hw = scaledWidth  / 2;
        const hh = scaledHeight / 2;
        ctx.strokeStyle = 'red';
        ctx.lineWidth   = 2;
        ctx.strokeRect(enemy.x - hw, enemy.y - hh, scaledWidth, scaledHeight);
    }
}

function drawEnemies() {
    enemies.forEach(enemy => drawEnemy(enemy));
}

function drawEnemyHealthBar(enemy) {
    const scaleFactor  = calculateScalingFactor(enemy.y);
    const scaledHeight = enemy.frameHeight * scaleFactor;

    const barWidth  = enemy.isBoss ? 160 : 50;
    const barHeight = enemy.isBoss ? 10  : 5;
    const barX      = enemy.x - barWidth / 2;
    const barY      = enemy.y - scaledHeight / 2 - barHeight - 10;

    // Background
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4);

    ctx.fillStyle = '#333';
    ctx.fillRect(barX, barY, barWidth, barHeight);

    const healthFrac  = enemy.health / enemy.maxHealth;
    ctx.fillStyle     = enemy.isBoss
        ? `rgb(${Math.round(255 * (1 - healthFrac))}, ${Math.round(180 * healthFrac)}, 0)`
        : 'green';
    ctx.fillRect(barX, barY, healthFrac * barWidth, barHeight);

    ctx.strokeStyle = enemy.isBoss ? '#e8c84a' : 'black';
    ctx.lineWidth   = enemy.isBoss ? 1.5 : 1;
    ctx.strokeRect(barX, barY, barWidth, barHeight);

    if (enemy.isBoss) {
        const label = enemy.isFakeOut ? 'BOSS ?' : 'BOSS';
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'bottom';
        ctx.font         = 'bold 13px Arial';
        ctx.fillStyle    = '#e8c84a';
        ctx.fillText(label, enemy.x, barY - 4);
        ctx.textAlign    = 'left';
        ctx.textBaseline = 'alphabetic';
    }
}

function drawEnemyFrame(ctx, spriteSheet, enemy, frameX, frameY) {
    const scaleFactor  = calculateScalingFactor(enemy.y);
    const scaledWidth  = enemy.frameWidth  * scaleFactor;
    const scaledHeight = enemy.frameHeight * scaleFactor;

    if (enemy.facingLeft) {
        ctx.save();
        ctx.scale(-1, 1);
        ctx.drawImage(
            spriteSheet,
            frameX * enemy.frameWidth, frameY * enemy.frameHeight, enemy.frameWidth, enemy.frameHeight,
            -enemy.x - scaledWidth, enemy.y, scaledWidth, scaledHeight
        );
        ctx.restore();
    } else {
        ctx.drawImage(
            spriteSheet,
            frameX * enemy.frameWidth, frameY * enemy.frameHeight, enemy.frameWidth, enemy.frameHeight,
            enemy.x, enemy.y, scaledWidth, scaledHeight
        );
    }
}

function drawScaledEnemy(enemy) {
    if (!enemy.image || !enemy.image.complete) {
        if (devMode) console.error('Enemy image is not loaded');
        return;
    }

    const scaleFactor  = calculateScalingFactor(enemy.y);
    const scaledWidth  = enemy.width  * scaleFactor;
    const scaledHeight = enemy.height * scaleFactor;

    ctx.drawImage(
        enemy.image,
        enemy.x - scaledWidth  / 2,
        enemy.y - scaledHeight / 2,
        scaledWidth,
        scaledHeight
    );
}

// --- HUD ---

function drawLevelInfo() {
    ctx.fillStyle = 'white';
    ctx.font      = '20px Arial';
    ctx.fillText(`Level: ${currentLevel}`, canvas.width - 100, 30);
}

function drawAmmoType() {
    const weapon = WEAPONS[currentWeapon];
    if (!weapon) return;

    ctx.font      = '20px Arial';
    ctx.fillStyle = 'white';

    // Weapon name
    ctx.fillText(`Weapon: ${weapon.name}`, 480, 665);

    // Ammo count
    const ammo = weaponAmmo[currentWeapon];
    const ammoStr = (ammo === Infinity || weapon.infinite) ? '∞' : ammo;
    ctx.fillText(`Ammo: ${ammoStr}`, 480, 695);

    // Pistol fallback hint when current weapon is out
    if (!weapon.infinite && weaponAmmo[currentWeapon] <= 0) {
        ctx.fillStyle = '#ff8888';
        ctx.font      = '16px Arial';
        ctx.fillText('Out of ammo!', 480, 718);
    }
}

function drawCurrency() {
    ctx.font      = '20px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText(`Wallet : ${playerCurrency} $`, 480, 630);
}

// --- Screens ---

// drawMainMenu() lives in mainmenu.js

function drawControlsScreen() {
    if (devMode) console.log('Drawing controls screen');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(controlsImage, 0, 0, canvas.width, canvas.height);
}

// drawPauseMenu() lives in pausemenu.js

function drawStoreScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(storeImg, 0, 0, canvas.width, canvas.height);
    ctx.font = '20px Arial';
}

function drawRestaurantScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(restaurantScreenImg, 0, 0, canvas.width, canvas.height);
    ctx.font      = '20px Arial';
    ctx.fillStyle = 'black';
    ctx.fillText(`Wallet: ${playerCurrency}$`, 40, 550);
}

function drawRobberyScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(robberyScreenImg, 0, 0, canvas.width, canvas.height);
}

function drawRobberySuccessScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(robberySuccessImg, 0, 0, canvas.width, canvas.height);
    setTimeout(() => { currentGameState = gameState.PLAYING; }, 2000);
}

function drawRobberyFailureScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(robberyFailureImg, 0, 0, canvas.width, canvas.height);
    setTimeout(() => { currentGameState = gameState.PLAYING; }, 2000);
}

function drawLocationTransition() {
    const loc = getLocationForLevel(currentLevel);
    if (!loc) return;

    // Background — use location colour as a tint over black
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = loc.color;
    ctx.globalAlpha = 0.6;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;

    // Decorative horizontal lines
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1;
    for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    // Location number badge
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.font         = 'bold 18px Arial';
    ctx.fillStyle    = 'rgba(255,255,255,0.5)';
    ctx.fillText(`LOCATION ${loc.id} OF ${STORY_LOCATIONS.length}`, canvas.width / 2, canvas.height / 2 - 110);

    // Big location name
    ctx.font      = 'bold 72px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur  = 20;
    ctx.fillText(loc.name, canvas.width / 2, canvas.height / 2 - 30);
    ctx.shadowBlur  = 0;

    // Subtitle
    ctx.font      = '32px Arial';
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.fillText(loc.subtitle, canvas.width / 2, canvas.height / 2 + 50);

    // Level range
    ctx.font      = '20px Arial';
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    const firstLevel = loc.levels[0];
    const lastLevel  = loc.levels[loc.levels.length - 1];
    ctx.fillText(`Levels ${firstLevel} – ${lastLevel}`, canvas.width / 2, canvas.height / 2 + 100);

    // Prompt
    ctx.font      = 'bold 20px Arial';
    ctx.fillStyle = '#e8c84a';
    ctx.fillText('Press ENTER to continue', canvas.width / 2, canvas.height / 2 + 170);

    ctx.textAlign    = 'left';
    ctx.textBaseline = 'alphabetic';
}

function drawStoryCompleteScreen() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Gold glow
    ctx.fillStyle = 'rgba(232,200,74,0.08)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';

    ctx.font         = 'bold 80px Arial';
    ctx.fillStyle    = '#e8c84a';
    ctx.shadowColor  = 'rgba(232,200,74,0.6)';
    ctx.shadowBlur   = 30;
    ctx.fillText('You Win!', canvas.width / 2, canvas.height / 2 - 60);
    ctx.shadowBlur   = 0;

    ctx.font      = '30px Arial';
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.fillText('All 30 levels complete.', canvas.width / 2, canvas.height / 2 + 20);

    ctx.font      = 'bold 22px Arial';
    ctx.fillStyle = '#e8c84a';
    ctx.fillText('Press ENTER to return to the main menu', canvas.width / 2, canvas.height / 2 + 100);

    ctx.textAlign    = 'left';
    ctx.textBaseline = 'alphabetic';
}

function drawLocationIndicator() {
    ctx.save();
    ctx.textAlign    = 'right';
    ctx.textBaseline = 'middle';
    ctx.font         = 'bold 16px Arial';
    ctx.fillStyle    = 'rgba(255,255,255,0.7)';

    if (isStoryMode) {
        const loc = getCurrentLocation();
        if (loc) ctx.fillText(`${loc.name}  •  Level ${currentLevel}`, canvas.width - 20, 55);
    } else {
        // Endless mode — show tier
        const tier = Math.floor((currentLevel - 1) / LEVELS_PER_LOCATION) + 1;
        ctx.fillText(`Zone ${tier}  •  Level ${currentLevel}`, canvas.width - 20, 55);
    }

    ctx.restore();
}

function drawGameOverScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle  = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle  = 'white';
    ctx.font       = '48px sans-serif';
    ctx.textAlign  = 'center';
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 50);
    ctx.font = '24px sans-serif';
    ctx.fillText('Press R to Restart', canvas.width / 2, canvas.height / 2);
}