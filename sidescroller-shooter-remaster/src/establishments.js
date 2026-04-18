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
    } else {
        if (devMode) console.log('Error: Invalid establishment selected.');
    }
}

function handleEstablishmentInput(keyCode) {
    if (currentGameState === gameState.STORE_SCREEN) {
        if (keyCode === 'Digit1')      purchaseItem('highDamageAmmo');
        else if (keyCode === 'Digit2') purchaseItem('penetrationAmmo');
        else if (keyCode === 'KeyB')   currentGameState = gameState.PLAYING;
    } else if (currentGameState === gameState.RESTAURANT_SCREEN) {
        if (keyCode === 'Digit1')      purchaseMeal(meals.RED_FISH);
        else if (keyCode === 'Digit2') purchaseMeal(meals.BEEF_SOUP);
        else if (keyCode === 'Digit3') purchaseMeal(meals.FRIED_PIRANHA);
        else if (keyCode === 'KeyB')   currentGameState = gameState.PLAYING;
    } else if (currentGameState === gameState.ROBBERY_SCREEN) {
        if (keyCode === 'Digit1')    robEstablishment();
        else if (keyCode === 'KeyB') currentGameState = gameState.PLAYING;
    }
}

function purchaseItem(itemKey) {
    const item = storeItems[itemKey];
    if (playerCurrency >= item.price) {
        playerCurrency -= item.price;
        item.effect();
        if (devMode) console.log(`Purchased ${itemKey}. Current currency: ${playerCurrency}`);
    } else {
        if (devMode) console.log(`Not enough currency to buy ${itemKey}. Current currency: ${playerCurrency}`);
    }
}

function purchaseAmmo(type, amount) {
    const ammo     = ammoTypes[type];
    const totalCost = ammo.cost * amount;
    if (playerCurrency >= totalCost) {
        playerCurrency -= totalCost;
        ammoInventory[type] += amount;
        if (devMode) console.log(`Purchased ${amount} ${type} ammo for ${totalCost} currency.`);
    } else {
        if (devMode) console.log('Not enough currency to purchase ammo.');
    }
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

function isPlayerAtStorePosition() {
    return player.x < STORE_POSITION.x + STORE_POSITION.width &&
           player.x + player.width > STORE_POSITION.x &&
           player.y < STORE_POSITION.y + STORE_POSITION.height &&
           player.y + player.height > STORE_POSITION.y;
}