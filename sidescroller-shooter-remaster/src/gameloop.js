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

        // Roll until we get something different from last time
        const allEstablishments = Object.values(ESTABLISHMENTS);
        let picked;
        do {
            picked = allEstablishments[Math.floor(Math.random() * allEstablishments.length)];
        } while (picked === lastSelectedEstablishment && allEstablishments.length > 1);

        selectedEstablishment     = picked;
        lastSelectedEstablishment = picked;

        if (devMode) console.log(`Selected Establishment: ${selectedEstablishment}`);
        progressionChecked = true;
    }

    // Level transition is triggered by updatePlayer() when player reaches the right edge
}

function triggerLevelChange() {
    const prevLevel = currentLevel;
    currentLevel++;
    playerCurrency       += 2;
    enemiesCleared        = false;
    progressionChecked    = false;
    selectedEstablishment = null;
    establishmentUsed     = false;

    if (isStoryMode) {
        // Story complete
        if (currentLevel > STORY_TOTAL_LEVELS) {
            currentGameState = gameState.STORY_COMPLETE;
            return;
        }
        // New location in story — show transition screen + cutscene
        if (isNewLocation(prevLevel, currentLevel)) {
            currentGameState = gameState.LOCATION_TRANSITION;
            return; // enemies will be spawned when player dismisses the transition
        }
    } else {
        // Endless mode — no screens, but log location tier changes
        if (isNewLocation(prevLevel, currentLevel) && devMode) {
            const tier = Math.floor((currentLevel - 1) / LEVELS_PER_LOCATION);
            console.log(`Endless: entering tier ${tier + 1} (level ${currentLevel})`);
        }
    }

    enemies = initializeEnemiesForLevel(currentLevel);
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
    bossBullets.length    = 0;
    currentWeapon         = 'pistol';
    weaponAmmo.smg        = 0;
    weaponAmmo.sniper     = 0;
    weaponAmmo.devGun     = Infinity;
    enemies               = initializeEnemiesForLevel(currentLevel);
    selectedEstablishment = null;
    establishmentUsed     = false;
    robberyAttempted      = false;
    isStoryMode           = false;
    currentGameState      = gameState.PLAYING;
}

function restartGame() {
    player.health    = 100;
    currentGameState = gameState.PLAYING;
}

// --- Main game loop ---

let lastTimestamp = 0;

function gameLoop(timestamp) {
    // Delta time in seconds, capped at 100ms to avoid huge jumps after tab switch
    const delta = Math.min((timestamp - lastTimestamp) / 1000, 0.1);
    lastTimestamp = timestamp;

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
            if (!enemy.isBoss) moveTowardPlayer(enemy, delta);
            drawEnemy(enemy);
            drawEnemyHealthBar(enemy);
        });

        ctx.drawImage(images.hud, 0, 120);

        updatePlayer(delta);
        handlePlayerDamage(player, enemies, timestamp);
        updateBullets(delta);
        drawBullets();
        updateBossBullets(delta);
        drawBossBullets();
        updateEnemyPositions(enemies, player, delta);
        drawPlayer();
        checkGameOver();
        drawPlayerHealth();
        drawLevelInfo();
        handleShooting();
        updateEnemies(delta);
        checkLevelProgression();
        drawAmmoType();
        drawCurrency();
        updateArrowPosition();
        drawLocationIndicator();

        if (enemiesCleared) drawMarkPosition();

    } else if (currentGameState === gameState.PAUSED) {
        drawBackground();
        drawPlayer();
        drawBullets();
        enemies.forEach(enemy => drawEnemy(enemy));
        drawPlayerHealth();
        drawLevelInfo();
        drawPauseMenu();

    } else if (currentGameState === gameState.WEAPON_STORE_SCREEN) {
        drawWeaponStoreScreen();

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
        // Frozen game world as backdrop
        drawBackground();
        enemies.forEach(enemy => { drawEnemy(enemy); drawEnemyHealthBar(enemy); });
        ctx.drawImage(images.hud, 0, 120);
        drawPlayer();
        drawBullets();
        drawBossBullets();
        drawGameOverScreen();

    } else if (currentGameState === gameState.LOCATION_TRANSITION) {
        drawLocationTransition();

    } else if (currentGameState === gameState.WALKING_IN) {
        updateWalkIn(delta);
        drawWalkIn();

    } else if (currentGameState === gameState.DIALOG) {
        updateDialog(delta);
        drawDialog();

    } else if (currentGameState === gameState.STORY_COMPLETE) {
        drawStoryCompleteScreen();
    }

    requestAnimationFrame(gameLoop);
}

// Kick everything off
initializeGame();