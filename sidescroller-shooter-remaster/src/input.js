// ============================================================
// input.js — Keyboard input event listeners
// Depends on: globals.js, player.js, cheats.js, establishments.js
// ============================================================

window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (devMode) console.log(`Key pressed: ${e.code}, Current game state: ${currentGameState}`);

    // --- Binding capture (intercept key before anything else when listening) ---
    if (currentGameState === gameState.OPTIONS && handleBindingKeypress(e.code)) return;

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
        if (e.code === keyBindings.shoot) {
            shootBullet();
        }
        if (e.code === 'Enter') {
            if (devMode) console.log(`Enter pressed — enemiesCleared:${enemiesCleared} atStore:${isPlayerAtStorePosition()} selected:${selectedEstablishment} used:${establishmentUsed}`);
            if (enemiesCleared && isPlayerAtStorePosition()) {
                if (selectedEstablishment && !establishmentUsed) {
                    enterEstablishment();
                } else {
                    if (devMode) console.log(establishmentUsed ? 'Establishment already used.' : 'No establishment selected.');
                }
            }
        }
        if (e.code === keyBindings.pause) {
            togglePause();
        }
        // Digit keys switch weapons
        if (e.code === 'Digit1') {
            currentWeapon = 'pistol';
            if (devMode) console.log('Switched to Pistol');
        } else if (e.code === 'Digit2') {
            if (weaponAmmo.smg > 0) { currentWeapon = 'smg'; if (devMode) console.log('Switched to SMG'); }
            else if (devMode) console.log('No SMG ammo');
        } else if (e.code === 'Digit3') {
            if (weaponAmmo.sniper > 0) { currentWeapon = 'sniper'; if (devMode) console.log('Switched to Sniper'); }
            else if (devMode) console.log('No Sniper ammo');
        }

    } else if (currentGameState === gameState.STORE_SCREEN ||
               currentGameState === gameState.ROBBERY_SCREEN) {
        if (e.code === keyBindings.exitEstablishment) {
            currentGameState = gameState.PLAYING;
        } else {
            handleEstablishmentInput(e.code);
        }

    } else if (currentGameState === gameState.RESTAURANT_SCREEN) {
        if (devMode) console.log(`Handling restaurant input for key: ${e.code}`);
        if (e.code === 'Digit1')      purchaseMeal(meals.RED_FISH);
        else if (e.code === 'Digit2') purchaseMeal(meals.BEEF_SOUP);
        else if (e.code === 'Digit3') purchaseMeal(meals.FRIED_PIRANHA);
        else if (e.code === keyBindings.exitEstablishment) currentGameState = gameState.PLAYING;

    } else if (currentGameState === gameState.PAUSED) {
        if (e.code === keyBindings.pause) {
            togglePause(); // pause key still resumes as a shortcut
        }

    } else if (currentGameState === gameState.ROBBERY_SUCCESS ||
               currentGameState === gameState.ROBBERY_FAILURE) {
        if (e.code === 'Enter') {
            currentGameState = gameState.PLAYING;
        }

    } else if (currentGameState === gameState.LOCATION_TRANSITION) {
        if (e.code === 'Enter') {
            startLocationDialog();
        }

    } else if (currentGameState === gameState.WALKING_IN) {
        // Walk-in is not skippable — ignore all input

    } else if (currentGameState === gameState.DIALOG) {
        if (e.code === 'Enter' || e.code === 'Space') {
            advanceDialog();
        }

    } else if (currentGameState === gameState.STORY_COMPLETE) {
        if (e.code === 'Enter') {
            resetGame();
            currentGameState = gameState.MAIN_MENU;
        }
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
    if (devMode) console.log(`Key released: ${e.code}, Current game state: ${currentGameState}`);
});