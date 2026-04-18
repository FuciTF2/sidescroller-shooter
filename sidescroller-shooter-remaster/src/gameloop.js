// ============================================================
// gameloop.js — Game loop, level management, and game state control
// Depends on: all other files
// ============================================================

function startGame() {
    initPlayerSprite(); // Wire player.sprite = images.player after assets loaded
    enemies = initializeEnemiesForLevel(currentLevel);
    requestAnimationFrame(gameLoop);
}

function initializeGame() {
    if (!images.enemy || !images.enemy.complete) {
        if (devMode) console.log('Waiting for enemy sprite sheet to load...');
        setTimeout(initializeGame, 100);
        return;
    }
    if (devMode) console.log('All images loaded. Starting game...');
    startGame();
}

function checkLevelProgression() {
    if (enemies.length === 0 && enemiesCleared && !progressionChecked) {
        playerCurrency += 100;
        if (devMode) console.log(`Level cleared! Player currency: ${playerCurrency}`);

        const randomNumber = Math.floor(Math.random() * 100) + 1;
        if (devMode) console.log(`Generated Random Number: ${randomNumber}`);

        if      (randomNumber >= 1  && randomNumber <= 33) selectedEstablishment = ESTABLISHMENTS.STORE;
        else if (randomNumber >= 34 && randomNumber <= 66) selectedEstablishment = ESTABLISHMENTS.RESTAURANT;
        else if (randomNumber >= 67 && randomNumber <= 100) selectedEstablishment = ESTABLISHMENTS.ROBBERY;

        if (devMode) console.log(`Selected Establishment: ${selectedEstablishment}`);
        progressionChecked = true;
    }

    if (player.x > canvas.width - player.width && enemiesCleared) {
        currentLevel++;
        playerCurrency += 2;
        triggerLevelChange(currentLevel);
        player.x = 0;
        enemiesCleared        = false;
        progressionChecked    = false;
        selectedEstablishment = null;
        establishmentUsed     = false;
    }
}

function triggerLevelChange(level) {
    enemiesCleared        = false;
    progressionChecked    = false;
    establishmentUsed     = false;
    enemies = initializeEnemiesForLevel(level);
}

function togglePause() {
    if (currentGameState === gameState.PLAYING) {
        currentGameState = gameState.PAUSED;
        if (devMode) console.log('Game paused');
    } else if (currentGameState === gameState.PAUSED) {
        currentGameState = gameState.PLAYING;
        if (devMode) console.log('Game resumed');
    }
}

function resetGame() {
    player.x      = 100;
    player.y      = canvas.height / 2 - 25;
    player.health = player.maxHealth;
    playerCurrency        = 0;
    currentLevel          = 1;
    enemiesCleared        = false;
    bullets.length        = 0;
    enemies               = initializeEnemiesForLevel(currentLevel);
    selectedEstablishment = null;
    establishmentUsed     = false;
    robberyAttempted      = false;
    currentGameState      = gameState.PLAYING;
}

function restartGame() {
    player.health    = 100;
    currentGameState = gameState.PLAYING;
}

// --- Main game loop ---

function gameLoop(timestamp) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (currentGameState === gameState.MAIN_MENU) {
        drawMainMenu();

    } else if (currentGameState === gameState.OPTIONS) {
        // If options was opened from the pause menu, render the frozen game
        // world first so the panel overlays it instead of a blank/menu screen
        if (pauseOptionsReturnState === gameState.PAUSED) {
            drawBackground();
            enemies.forEach(enemy => { drawEnemy(enemy); drawEnemyHealthBar(enemy); });
            ctx.drawImage(images.hud, 0, 120);
            drawPlayer();
            drawBullets();
            drawPlayerHealth();
            drawLevelInfo();
            drawAmmoType();
            drawCurrency();
        }
        drawOptionsScreen();

    } else if (currentGameState === gameState.CONTROLS) {
        drawControlsScreen();

    } else if (currentGameState === gameState.PLAYING) {
        drawBackground();

        updateEnemyAnimation(timestamp);
        enemies.forEach(enemy => {
            moveTowardPlayer(enemy);
            drawEnemy(enemy);
            drawEnemyHealthBar(enemy);
        });

        ctx.drawImage(images.hud, 0, 120);

        updatePlayer();
        handlePlayerDamage(player, enemies, timestamp);
        updateBullets();
        drawBullets();
        updateEnemyPositions(enemies, player);
        drawPlayer();
        checkGameOver();
        drawPlayerHealth();
        drawLevelInfo();
        handleShooting();
        updateEnemies();
        checkLevelProgression();
        drawAmmoType();
        drawCurrency();
        updateArrowPosition();

        if (enemiesCleared) drawMarkPosition();

    } else if (currentGameState === gameState.PAUSED) {
        drawBackground();
        drawPlayer();
        drawBullets();
        enemies.forEach(enemy => drawEnemy(enemy));
        drawPlayerHealth();
        drawLevelInfo();
        drawPauseMenu();

    } else if (currentGameState === gameState.STORE_SCREEN) {
        drawStoreScreen();
        ctx.drawImage(images.hud, 0, 120);
        drawCurrency();
        drawPlayerHealth();
        drawAmmoType();

    } else if (currentGameState === gameState.RESTAURANT_SCREEN) {
        drawRestaurantScreen();
        ctx.drawImage(images.hud, 0, 120);
        drawCurrency();
        drawPlayerHealth();
        drawAmmoType();

    } else if (currentGameState === gameState.ROBBERY_SCREEN) {
        drawRobberyScreen();
        ctx.drawImage(images.hud, 0, 120);
        drawCurrency();
        drawPlayerHealth();
        drawAmmoType();

    } else if (currentGameState === gameState.ROBBERY_SUCCESS) {
        drawRobberySuccessScreen();
        ctx.drawImage(images.hud, 0, 120);
        drawCurrency();
        drawPlayerHealth();
        drawAmmoType();

    } else if (currentGameState === gameState.ROBBERY_FAILURE) {
        drawRobberyFailureScreen();
        ctx.drawImage(images.hud, 0, 120);
        drawCurrency();
        drawPlayerHealth();
        drawAmmoType();

    } else if (currentGameState === gameState.GAME_OVER) {
        drawGameOverScreen();
    }

    requestAnimationFrame(gameLoop);
}

// Kick everything off
initializeGame();