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
    const scale     = minScale + ((maxScale - minScale) * (player.y / canvas.height));
    const drawWidth  = player.width  * scale;
    const drawHeight = player.height * scale;

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
        ctx.strokeRect(player.x, player.y, player.width * player.scale, player.height * player.scale);
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

    enemy.scale = scaleFactor;

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
        ctx.strokeStyle = 'red';
        ctx.lineWidth   = 2;
        ctx.strokeRect(enemy.x, enemy.y, enemy.width * enemy.scale, enemy.height * enemy.scale);
    }
}

function drawEnemies() {
    enemies.forEach(enemy => drawEnemy(enemy));
}

function drawEnemyHealthBar(enemy) {
    const scaleFactor  = calculateScalingFactor(enemy.y);
    const scaledHeight = enemy.frameHeight * scaleFactor;

    const barWidth  = 50;
    const barHeight = 5;
    const barX      = enemy.x - barWidth / 2;
    const barY      = enemy.y - scaledHeight / 2 - barHeight - 5;

    ctx.fillStyle = 'gray';
    ctx.fillRect(barX, barY, barWidth, barHeight);

    const healthWidth = (enemy.health / enemy.maxHealth) * barWidth;
    ctx.fillStyle = 'green';
    ctx.fillRect(barX, barY, healthWidth, barHeight);

    ctx.strokeStyle = 'black';
    ctx.lineWidth   = 1;
    ctx.strokeRect(barX, barY, barWidth, barHeight);
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
    ctx.font      = '20px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText(`Ammo Type: ${selectedAmmoType}`,                                     480, 665);
    ctx.fillText(`Standard Ammo: ${ammoInventory.standard === Infinity ? '∞' : ammoInventory.standard}`, 480, 700);
    ctx.fillText(`${ammoInventory.highDamage}`,  430, 630);
    ctx.fillText(`${ammoInventory.penetration}`, 430, 700);
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

function drawPauseMenu() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle  = 'white';
    ctx.font       = '40px Arial';
    ctx.textAlign  = 'center';
    ctx.fillText('Game Paused', canvas.width / 2, canvas.height / 2 - 50);
    ctx.fillStyle  = 'yellow';
    ctx.font       = '30px Arial';
    ctx.fillText('Press Escape to Resume', canvas.width / 2, canvas.height / 2 + 50);
}

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