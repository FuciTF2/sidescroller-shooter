// ============================================================
// establishments.js — Store, restaurant, and robbery logic
// Depends on: globals.js, player.js
// ============================================================

function selectRandomEstablishment() {
    const establishments = Object.values(ESTABLISHMENTS);
    let selected;
    do {
        selected = establishments[Math.floor(Math.random() * establishments.length)];
    } while (selected === lastSelectedEstablishment);
    lastSelectedEstablishment = selected;
    return selected;
}

function enterEstablishment() {
    // Use the establishment pre-rolled by checkLevelProgression — no reroll on re-entry
    if (!selectedEstablishment || establishmentUsed) return;
    if (devMode) console.log(`Entering establishment: ${selectedEstablishment}`);

    if (selectedEstablishment === ESTABLISHMENTS.STORE) {
        currentGameState = gameState.STORE_SCREEN;
        if (devMode) console.log('Entering store screen');
    } else if (selectedEstablishment === ESTABLISHMENTS.RESTAURANT) {
        currentGameState = gameState.RESTAURANT_SCREEN;
        if (devMode) console.log('Entering restaurant screen');
    } else if (selectedEstablishment === ESTABLISHMENTS.ROBBERY) {
        currentGameState = gameState.ROBBERY_SCREEN;
        if (devMode) console.log('Entering robbery screen');
    } else if (selectedEstablishment === ESTABLISHMENTS.WEAPON_STORE) {
        currentGameState = gameState.WEAPON_STORE_SCREEN;
        if (devMode) console.log('Entering weapon store');
    } else {
        if (devMode) console.log('Error: Invalid establishment selected.');
    }
}

function handleEstablishmentInput(keyCode) {
    if (currentGameState === gameState.STORE_SCREEN) {
        if (keyCode === 'Digit1')      buyStoreAmmo();
        else if (keyCode === 'Digit2') buySoda();
        else if (keyCode === keyBindings.exitEstablishment) currentGameState = gameState.PLAYING;
    } else if (currentGameState === gameState.RESTAURANT_SCREEN) {
        if (keyCode === 'Digit1')      purchaseMeal(meals.RED_FISH);
        else if (keyCode === 'Digit2') purchaseMeal(meals.BEEF_SOUP);
        else if (keyCode === 'Digit3') purchaseMeal(meals.FRIED_PIRANHA);
        else if (keyCode === keyBindings.exitEstablishment)   currentGameState = gameState.PLAYING;
    } else if (currentGameState === gameState.ROBBERY_SCREEN) {
        if (keyCode === 'Digit1')    robEstablishment();
        else if (keyCode === keyBindings.exitEstablishment) currentGameState = gameState.PLAYING;
    } else if (currentGameState === gameState.WEAPON_STORE_SCREEN) {
        if      (keyCode === 'Digit1') purchaseWeapon('pistol');
        else if (keyCode === 'Digit2') purchaseWeapon('smg');
        else if (keyCode === 'Digit3') purchaseWeapon('sniper');
        else if (keyCode === 'Digit4') purchaseWeapon('devGun');
        else if (keyCode === keyBindings.exitEstablishment) currentGameState = gameState.PLAYING;
    }
}

function buyStoreAmmo() {
    const restock = STORE_AMMO_RESTOCK[currentWeapon];
    if (!restock || restock.amount === 0) {
        if (devMode) console.log(`No ammo to sell for ${currentWeapon}`);
        return;
    }
    if (playerCurrency < restock.price) {
        if (devMode) console.log(`Not enough currency for ammo — need ${restock.price}, have ${playerCurrency}`);
        return;
    }
    playerCurrency        -= restock.price;
    weaponAmmo[currentWeapon] = (weaponAmmo[currentWeapon] === Infinity)
        ? Infinity
        : weaponAmmo[currentWeapon] + restock.amount;
    if (devMode) console.log(`Bought ${restock.amount} ${currentWeapon} ammo. Total: ${weaponAmmo[currentWeapon]}`);
}

function buySoda() {
    if (player.health >= player.maxHealth) {
        if (devMode) console.log('Already at full health');
        return;
    }
    if (playerCurrency < SODA.price) {
        if (devMode) console.log(`Not enough currency for soda — need ${SODA.price}, have ${playerCurrency}`);
        return;
    }
    playerCurrency  -= SODA.price;
    player.health    = Math.min(player.health + SODA.heal, player.maxHealth);
    if (devMode) console.log(`Drank soda. Health: ${player.health}. Currency: ${playerCurrency}`);
}

function purchaseMeal(meal) {
    if (!meal) {
        if (devMode) console.error('Meal is undefined');
        return;
    }
    if (playerCurrency >= meal.cost) {
        playerCurrency -= meal.cost;
        if (meal.heal === 'full') {
            player.health = player.maxHealth;
        } else {
            player.health = Math.min(player.health + meal.heal, player.maxHealth);
        }
        if (devMode) console.log(`Purchased ${meal.name}. Health: ${player.health}, Currency: ${playerCurrency}`);
    } else {
        if (devMode) console.log(`Not enough currency to purchase ${meal.name}.`);
    }
}

function addCurrency(amount) {
    playerCurrency += amount;
    if (devMode) console.log(`Added ${amount} currency. Current currency: ${playerCurrency}`);
}

function robEstablishment() {
    if (robberyAttempted) return;
    robberyAttempted = true;

    const successChance = Math.random();
    if (successChance > 0.5) {
        playerCurrency += 10;
        currentGameState = gameState.ROBBERY_SUCCESS;
    } else {
        player.health -= 20;
        currentGameState = gameState.ROBBERY_FAILURE;
    }

    setTimeout(resetRobbery, 2000);
}

function resetRobbery() {
    robberyAttempted   = false;
    establishmentUsed  = true;  // robbery is done — player cannot re-enter
    currentGameState   = gameState.PLAYING;
}

function purchaseWeapon(key) {
    const w = WEAPONS[key];
    if (!w) return;

    // Pistol is free / always owned
    if (key === 'pistol') {
        currentWeapon = 'pistol';
        if (devMode) console.log('Switched to Pistol (free)');
        return;
    }

    // Already owns infinite ammo for this weapon
    if (weaponAmmo[key] === Infinity) {
        currentWeapon = key;
        if (devMode) console.log(`Switched to ${w.name} (already owned)`);
        return;
    }

    const price = WEAPON_PRICES[key];
    if (price === undefined) {
        if (devMode) console.log(`${w.name} is not for sale`);
        return;
    }

    if (playerCurrency < price) {
        if (devMode) console.log(`Not enough currency for ${w.name} — need ${price}, have ${playerCurrency}`);
        return;
    }

    playerCurrency -= price;
    weaponAmmo[key] = w.infinite ? Infinity : (WEAPON_AMMO_BUNDLES[key]?.amount ?? 20);
    currentWeapon   = key;
    if (devMode) console.log(`Purchased ${w.name} for ${price}$. Ammo: ${weaponAmmo[key]}`);
}

function isPlayerAtStorePosition() {
    const pw = player.width  * player.scale;
    const ph = player.height * player.scale;
    return player.x          < STORE_POSITION.x + STORE_POSITION.width  &&
           player.x + pw     > STORE_POSITION.x                         &&
           player.y          < STORE_POSITION.y + STORE_POSITION.height &&
           player.y + ph     > STORE_POSITION.y;
}