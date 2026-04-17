// ============================================================
// input.js — Keyboard input event listeners
// Depends on: globals.js, player.js, cheats.js, establishments.js
// ============================================================

window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (devMode) console.log(`Key pressed: ${e.code}, Current game state: ${currentGameState}`);

    // --- Cheat console toggle (C key) ---
    if (e.key === 'c' || e.key === 'C') {
        // Don't intercept 'c' when typing in the cheat console itself
        if (document.activeElement !== cheatConsole) {
            const isConsoleVisible = cheatConsole.style.display === 'block';
            cheatConsole.style.display = isConsoleVisible ? 'none' : 'block';
            if (!isConsoleVisible) cheatConsole.focus();
            return;
        }
    }

    // --- Restart (R key, global) ---
    if (e.key === 'r' || e.key === 'R') {
        restartGame();
    }

    if (currentGameState === gameState.MAIN_MENU) {
        // Main menu is mouse-driven — see mainmenu.js click/mousemove handlers

    } else if (currentGameState === gameState.CONTROLS) {
        if (e.code === 'Escape') {
            if (devMode) console.log('Escape key pressed in controls menu');
            currentGameState = gameState.MAIN_MENU;
        }

    } else if (currentGameState === gameState.PLAYING) {
        if (e.code === 'Space') {
            shootBullet();
        }
        if (e.code === 'Enter' && enemiesCleared && isPlayerAtStorePosition()) {
            if (selectedEstablishment) {
                enterEstablishment();
            } else {
                if (devMode) console.log('No establishment selected.');
            }
        }
        if (e.code === 'Escape') {
            togglePause();
        }
        if (e.code === 'Digit1')      { selectedAmmoType = 'standard';    if (devMode) console.log('Switched to standard ammo.'); }
        else if (e.code === 'Digit2') { selectedAmmoType = 'highDamage';  if (devMode) console.log('Switched to high damage ammo.'); }
        else if (e.code === 'Digit3') { selectedAmmoType = 'penetration'; if (devMode) console.log('Switched to penetration ammo.'); }

    } else if (currentGameState === gameState.STORE_SCREEN ||
               currentGameState === gameState.ROBBERY_SCREEN) {
        if (e.code === 'KeyB') {
            currentGameState = gameState.PLAYING;
        } else {
            handleEstablishmentInput(e.code);
        }

    } else if (currentGameState === gameState.RESTAURANT_SCREEN) {
        if (devMode) console.log(`Handling restaurant input for key: ${e.code}`);
        if (e.code === 'Digit1')      purchaseMeal(meals.RED_FISH);
        else if (e.code === 'Digit2') purchaseMeal(meals.BEEF_SOUP);
        else if (e.code === 'Digit3') purchaseMeal(meals.FRIED_PIRANHA);
        else if (e.code === 'KeyB')   currentGameState = gameState.PLAYING;

    } else if (currentGameState === gameState.PAUSED) {
        if (e.code === 'Escape') {
            togglePause();
        } else if (e.code === 'KeyR') {
            resetGame();
            currentGameState = gameState.PLAYING;
            if (devMode) console.log('Restarting the game');
        } else if (e.code === 'KeyM') {
            resetGame();
            currentGameState = gameState.MAIN_MENU;
            if (devMode) console.log('Returning to main menu');
        }

    } else if (currentGameState === gameState.ROBBERY_SUCCESS ||
               currentGameState === gameState.ROBBERY_FAILURE) {
        if (e.code === 'Enter') {
            currentGameState = gameState.PLAYING;
        }
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
    if (devMode) console.log(`Key released: ${e.code}, Current game state: ${currentGameState}`);
});