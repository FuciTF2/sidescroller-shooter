const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const shootingSoundSrc = './Sounds/shoot_sound.mp3';

function preloadSound(src) {
    const sound = new Audio(src);
    sound.load();
    return sound;
}

preloadSound(shootingSoundSrc);

const enemySpriteSheet = new Image();
enemySpriteSheet.src = './graphics/enemy.png';
enemySpriteSheet.onload = () => {
    console.log('Enemy sprite sheet loaded');
    startGame();  // Initialize the game after the image is loaded
};
enemySpriteSheet.onerror = () => {
    console.error('Error loading enemy sprite sheet');
};

const backgroundImage = new Image();
backgroundImage.src = './graphics/bg.png';
backgroundImage.onload = () => {
    console.log('Background image loaded');
};
backgroundImage.onerror = () => {
    console.error('Error loading background image');
};

const restaurantScreenImg = new Image();
restaurantScreenImg.src = './graphics/reastaurant_screen.png';
restaurantScreenImg.onload = () => {
    console.log('Restaurant screen image loaded');
};
restaurantScreenImg.onerror = () => {
    console.error('Error loading restaurant screen image');
};

const robberyScreenImg = new Image();
robberyScreenImg.src = './graphics/robbery_screen.png';
robberyScreenImg.onload = () => {
    console.log('Robbery screen image loaded');
};
robberyScreenImg.onerror = () => {
    console.error('Error loading robbery screen image');
};

const robberySuccessImg = new Image();
robberySuccessImg.src = './graphics/robbery_screen_succes.png';
robberySuccessImg.onload = () => {
    console.log('Robbery success image loaded');
};
robberySuccessImg.onerror = () => {
    console.error('Error loading robbery success image');
};

const robberyFailureImg = new Image();
robberyFailureImg.src = './graphics/robbery_screen_failed.png';
robberyFailureImg.onload = () => {
    console.log('Robbery failure image loaded');
};
robberyFailureImg.onerror = () => {
    console.error('Error loading robbery failure image');
};

const storeImg = new Image();
storeImg.src = './graphics/store_screen.png';
storeImg.onload = () => {
    console.log('Store screen image loaded');
};
storeImg.onerror = () => {
    console.error('Error loading store screen image');
};

const hudImage = new Image();
hudImage.src = './graphics/hud.png';
hudImage.onload = () => {
    console.log('HUD image loaded');
};
hudImage.onerror = () => {
    console.error('Error loading HUD image');
};

const mainMenuImage = new Image();
mainMenuImage.src = './graphics/mainmenu.png';
mainMenuImage.onload = () => {
    console.log('Main menu image loaded');
};
mainMenuImage.onerror = () => {
    console.error('Error loading main menu image');
};

const arrowImage = new Image();
arrowImage.src = './graphics/mark.png';
arrowImage.onload = () => {
    console.log('Arrow image loaded');
};
arrowImage.onerror = () => {
    console.error('Error loading arrow image');
};

const controlsImage = new Image();
controlsImage.src = './graphics/how.png';
controlsImage.onload = () => {
    console.log('Controls image loaded');
};
controlsImage.onerror = () => {
    console.error('Error loading controls image');
};

const playerSprite = new Image();
playerSprite.src = './graphics/player.png';
playerSprite.onload = () => {
    console.log('Player sprite loaded');
};
playerSprite.onerror = () => {
    console.error('Error loading player sprite');
};

let enemies = [];
let currentLevel = 1; // Initialize currentLevel here
let imagesLoaded = 0;
const images = {};
const imageSources = {
    enemy: './graphics/enemy.png',
    background: './graphics/bg.png',
    restaurantImage: './graphics/reastaurant_screen.png',
    robberyScreen: './graphics/robbery_screen.png',
    robberySuccess: './graphics/robbery_screen_succes.png',
    robberyFailure: './graphics/robbery_screen_failed.png',
    store: './graphics/store_screen.png',
    hud: './graphics/hud.png',
    mainMenuImage: './graphics/mainmenu.png',
    arrow: './graphics/mark.png',
    controls: './graphics/how.png',
    player: './graphics/player.png'
};

const totalImages = Object.keys(imageSources).length;
let currentGameState = 'mainMenu';

const enemySpawnMinY = 200;
const enemySpawnMaxY = 440;

// Preload sounds
function preloadSound(src) {
    const sound = new Audio(src);
    sound.load();
    return sound;
}
preloadSound(shootingSoundSrc);

for (const [name, src] of Object.entries(imageSources)) {
    images[name] = new Image();
    images[name].src = src;
    images[name].onload = () => {
        imagesLoaded++;
        console.log(`${name} image loaded`);
    };
    images[name].onerror = () => {
        console.error(`Error loading ${name} image`);
    };
}

function allImagesLoaded() {
    return imagesLoaded === totalImages;
}

function initializeGame() {
    if (!enemySpriteSheet.complete) {
        console.log('Waiting for enemy sprite sheet to load...');
        setTimeout(initializeGame, 100);
        return;
    }
    console.log('All images loaded. Starting game...');
    startGame();
}

initializeGame();

let backgroundX = 0;

const gameState = {
    MAIN_MENU: 'mainMenu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    STORE_SCREEN: 'storeScreen',
    RESTAURANT_SCREEN: 'restaurantScreen',
    ROBBERY_SCREEN: 'robberyScreen',
    ROBBERY_SUCCESS: 'robberySuccess',
    ROBBERY_FAILURE: 'robberyFailure',
    GAME_OVER: 'gameOver',
    CONTROLS: 'controls'
};

const meals = {
    RED_FISH: { name: 'Red Fish', cost: 20, heal: 35 },
    BEEF_SOUP: { name: 'Beef Soup', cost: 10, heal: 15 },
    FRIED_PIRANHA: { name: 'Fried Piranha', cost: 70, heal: 'full' }
};

let keys = {};
let robberyAttempted = false;
let playerCurrency = 0; 
let enemiesCleared = false;
let progressionChecked = false;
let selectedEstablishment = null;

const player = {
    x: 100,
    y: canvas.height / 2 - 25,
    width: 100,
    height: 100,
    hitboxOffsetX: 50, // Offset to the right by half of the current width
    hitboxOffsetY: 50, // Offset down by half of the current height
    scale: 1.5,
    speed: 4.5,
    dx: 0,
    dy: 0,
    sprite: images.player,
    frameX: 0,
    frameY: 0,
    frameWidth: 231,
    frameHeight: 186,
    facingRight: true,
    animationTimer: 0,
    animationSpeed: 8,
    totalFrames: 14, 
    idleFrame: 13,  
    lastShootTime: 0,
    shootCooldown: 200,
    health: 100,
    maxHealth: 100,
    lastDamageTime: 0,
    damageInterval: 1000,
};

const enemy = {
    x: 300,
    y: canvas.height / 2 - 25,
    width: 100,
    height: 100,
    scale: 1.0, // Initial scale
    speed: 2.5,
    dx: 0,
    dy: 0,
    image: images.enemy,
    frameX: 0,
    frameY: 0,
    frameWidth: 100,
    frameHeight: 100,
    facingLeft: true,
    health: 100,
    maxHealth: 100,
};

const enemyMinY = 200;
const enemyMaxY = 440;

const enemyVerticalSpacing = 80; // Adjust the spacing as needed

const enemyScalingFactor = 0.8; // Scale enemy to 80% of the player's scale

function startGame() {
    enemies = initializeEnemiesForLevel(currentLevel);
    requestAnimationFrame(gameLoop);
}

function resetRobbery() {
    robberyAttempted = false;
    currentGameState = gameState.PLAYING;
}


const bullets = [];
const bulletSpeed = 10;

const ESTABLISHMENTS = {
    STORE: 'store',
    RESTAURANT: 'restaurant',
    ROBBERY: 'robbery'
};

let currentEstablishment = null; 
let lastSelectedEstablishment = null;

const ammoTypes = {
    standard: { damage: 15, penetration: false, cost: 0 },
    highDamage: { damage: 30, penetration: false, cost: 3 },
    penetration: { damage: 15, penetration: true, cost: 5 },
};

let selectedAmmoType = 'standard';
const ammoInventory = {
    standard: Infinity, 
    highDamage: 0,
    penetration: 0,
};

const storeItems = {
    highDamageAmmo: { price: 3, effect: () => { ammoInventory.highDamage += 5; } },
    penetrationAmmo: { price: 5, effect: () => { ammoInventory.penetration += 5; } },
};

const baseEnemyAttackRange = 100; // Base attack range before scaling
const enemyAttackRange = 100;
const enemyAttackCooldown = 800;

const MIN_SAFE_DISTANCE = 100;

let isMovingToNextLevel = false;

const spriteSheet = {
    frameWidth: 180,
    frameHeight: 150,
    frameCount: 14,
    currentFrame: 0,
    animationSpeed: 80,
    lastUpdateTime: 0,  
};

const MARK_POSITION = {
    x: 825, 
    y: 60, 
    width: 40,
    height: 50
};

const STORE_POSITION = {
    x: 835, 
    y: 134, 
    width: 90,
    height: 100
};

let arrowY = MARK_POSITION.y;
let arrowDirection = 1;
const ARROW_SPEED = 0.75;
const ARROW_RANGE = 10;

function updateArrowPosition() {
    arrowY += arrowDirection * ARROW_SPEED;
    if (arrowY >= MARK_POSITION.y + ARROW_RANGE || arrowY <= MARK_POSITION.y - ARROW_RANGE) {
        arrowDirection *= -1;
    }
}

function selectRandomEstablishment() {
    const establishments = Object.values(ESTABLISHMENTS);
    let selected;

    do {
        selected = establishments[Math.floor(Math.random() * establishments.length)];
    } while (selected === lastSelectedEstablishment);

    lastSelectedEstablishment = selected;
    return selected;
}

function drawEnemyFrame(ctx, spriteSheet, enemy, frameX, frameY) {
    const scaleFactor = calculateScalingFactor(enemy.y);
    const scaledWidth = enemy.frameWidth * scaleFactor;
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

function getNumberOfEnemies(level) {
    if (level >= 1 && level <= 4) {
        return 0;
    } else if (level >= 5 && level <= 8) {
        return 0;
    } else if (level >= 9 && level <= 12) {
        return 1;
    } else {
        return 2;
    }
}

function updateEnemyAnimation(timestamp) {
    enemies.forEach(enemy => {
        if (timestamp - enemy.animationTimer > enemy.animationSpeed) {
            enemy.frameX = (enemy.frameX + 1) % enemy.totalFrames;
            enemy.animationTimer = timestamp;
        }
    });
}

function updateEnemyPositions(enemies, player) {
    enemies.forEach(enemy => {
        moveTowardPlayer(enemy);

        if (isNaN(enemy.x) || isNaN(enemy.y)) {
            console.error('Invalid position values:', enemy.x, enemy.y);
        }
    });
}

function checkLevelProgression() {
    if (enemies.length === 0 && enemiesCleared && !progressionChecked) {
        playerCurrency += 100; 
        console.log(`Level cleared! Player currency: ${playerCurrency}`);

        const randomNumber = Math.floor(Math.random() * 100) + 1;
        console.log(`Generated Random Number: ${randomNumber}`);

        if (randomNumber >= 1 && randomNumber <= 33) {
            selectedEstablishment = ESTABLISHMENTS.STORE;
        } else if (randomNumber >= 34 && randomNumber <= 66) {
            selectedEstablishment = ESTABLISHMENTS.RESTAURANT;
        } else if (randomNumber >= 67 && randomNumber <= 100) {
            selectedEstablishment = ESTABLISHMENTS.ROBBERY;
        }
        console.log(`Selected Establishment: ${selectedEstablishment}`);

        progressionChecked = true;
    }

    if (player.x > canvas.width - player.width && enemiesCleared) {
        currentLevel++;
        playerCurrency += 2;
        triggerLevelChange(currentLevel);
        player.x = 0;
        enemiesCleared = false;
        progressionChecked = false; 
        selectedEstablishment = null; 
    }
}

function enterEstablishment() {
    selectedEstablishment = selectRandomEstablishment();
    console.log(`Entering establishment: ${selectedEstablishment}`);
    if (selectedEstablishment === ESTABLISHMENTS.STORE) {
        currentGameState = gameState.STORE_SCREEN;
        console.log("Entering store screen");
    } else if (selectedEstablishment === ESTABLISHMENTS.RESTAURANT) {
        currentGameState = gameState.RESTAURANT_SCREEN;
        console.log("Entering restaurant screen");
    } else if (selectedEstablishment === ESTABLISHMENTS.ROBBERY) {
        currentGameState = gameState.ROBBERY_SCREEN;
        console.log("Entering robbery screen");
    } else {
        console.log("Error: Invalid establishment selected.");
    }
}

window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    console.log(`Key pressed: ${e.code}, Current game state: ${currentGameState}`);

    if (currentGameState === gameState.MAIN_MENU) {
        if (e.code === 'Enter') {
            console.log("Enter key pressed in main menu");
            currentGameState = gameState.PLAYING;
            enemies = initializeEnemiesForLevel(currentLevel);
            console.log("Game started, enemies initialized:", enemies);
        } else if (e.code === 'KeyQ') {
            console.log("Q key pressed in main menu");
            currentGameState = gameState.CONTROLS;
        }
    } else if (currentGameState === gameState.CONTROLS) {
        if (e.code === 'Escape') {
            console.log("Escape key pressed in controls menu");
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
                console.log("No establishment selected.");
            }
        }
        if (e.code === 'Escape') {
            togglePause();
        }
        if (e.code === 'Digit1') {
            selectedAmmoType = 'standard';
            console.log('Switched to standard ammo.');
        } else if (e.code === 'Digit2') {
            selectedAmmoType = 'highDamage';
            console.log('Switched to high damage ammo.');
        } else if (e.code === 'Digit3') {
            selectedAmmoType = 'penetration';
            console.log('Switched to penetration ammo.');
        }
    } else if (currentGameState === gameState.STORE_SCREEN || currentGameState === gameState.ROBBERY_SCREEN) {
        if (e.code === 'KeyB') {
            currentGameState = gameState.PLAYING;
        } else {
            handleEstablishmentInput(e.code);
        }
    } else if (currentGameState === gameState.RESTAURANT_SCREEN) {
        console.log(`Handling restaurant input for key: ${e.code}`);
        if (e.code === 'Digit1') {
            purchaseMeal(meals.RED_FISH);
        } else if (e.code === 'Digit2') {
            purchaseMeal(meals.BEEF_SOUP);
        } else if (e.code === 'Digit3') {
            purchaseMeal(meals.FRIED_PIRANHA);
        } else if (e.code === 'KeyB') {
            currentGameState = gameState.PLAYING;
        }
    } else if (currentGameState === gameState.PAUSED) {
        if (e.code === 'Escape') {
            togglePause();
        } else if (e.code === 'KeyR') {
            resetGame();
            currentGameState = gameState.PLAYING;
            console.log("Restarting the game");
        } else if (e.code === 'KeyM') {
            resetGame();
            currentGameState = gameState.MAIN_MENU;
            console.log("Returning to main menu");
        }
    } else if (currentGameState === gameState.ROBBERY_SUCCESS || currentGameState === gameState.ROBBERY_FAILURE) {
        if (e.code === 'Enter') {
            currentGameState = gameState.PLAYING;
        }
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
    console.log(`Key released: ${e.code}, Current game state: ${currentGameState}`);
});

function handleEstablishmentInput(keyCode) {
    if (currentGameState === gameState.STORE_SCREEN) {
        if (keyCode === 'Digit1') {
            purchaseItem('highDamageAmmo');
        } else if (keyCode === 'Digit2') {
            purchaseItem('penetrationAmmo');
        } else if (keyCode === 'KeyB') {
            currentGameState = gameState.PLAYING;
        }
    } else if (currentGameState === gameState.RESTAURANT_SCREEN) {
        if (keyCode === 'Digit1') {
            purchaseMeal();
        } else if (keyCode === 'KeyB') {
            currentGameState = gameState.PLAYING;
        }
    } else if (currentGameState === gameState.ROBBERY_SCREEN) {
        if (keyCode === 'Digit1') {
            robEstablishment();
        } else if (keyCode === 'KeyB') {
            currentGameState = gameState.PLAYING;
        }
    }
}

const cheatConsole = document.createElement('input');
cheatConsole.type = 'text';
cheatConsole.style.position = 'absolute';
cheatConsole.style.bottom = '10px';
cheatConsole.style.left = '50%';
cheatConsole.style.transform = 'translateX(-50%)';
cheatConsole.style.width = '300px';
cheatConsole.style.zIndex = 10;
cheatConsole.style.display = 'none'; // Initially hidden
document.body.appendChild(cheatConsole);

cheatConsole.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const command = cheatConsole.value.trim().toLowerCase();
        processCheatCode(command);
        cheatConsole.value = ''; 
    }
});

function processCheatCode(command) {
    switch (command.toLowerCase()) {
        case 'god':
            player.health = Infinity;
            console.log('God mode activated!');
            break;
        case 'infiniteammo':
            bullets.length = Infinity;
            console.log('Infinite ammo activated!');
            break;
        case 'nextlevel':
            console.log('Next level cheat code activated!');
            triggerLevelChange();
            break;
        case 'killall':
            enemies = [];
            console.log('All enemies killed!');
            break;
        case 'fastshoot':
            player.shootCooldown = 2; // Ensure this is set on the player object
            console.log('Shoot cooldown set to 2!');
            break;
        case 'ammo':
            activateInfiniteAmmoTypes(); // Ensure this function is defined elsewhere in your code
            console.log('Infinite ammo types activated!');
            break;
        case 'money':
            addCurrency(1000); // Ensure this function is defined elsewhere in your code
            console.log('Added 1000 currency!');
            break;
        case 'devmode':
            devMode = !devMode;
            console.log(`Dev mode ${devMode ? 'enabled' : 'disabled'}`);
            break;
        default:
            console.log('Unknown cheat code!');
    }
}

let devMode = false;

document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && document.activeElement === cheatConsole) {
        const cheatCode = cheatConsole.value.toLowerCase();
        processCheatCode(cheatCode);
        cheatConsole.value = ''; // Clear the input
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'c') {
        const isConsoleVisible = cheatConsole.style.display === 'block';
        cheatConsole.style.display = isConsoleVisible ? 'none' : 'block';
        if (!isConsoleVisible) {
            cheatConsole.focus(); // Focus the console when shown
        }
    }
});

function activateInfiniteAmmoTypes() {
    ammoInventory.highDamage = Infinity;
    ammoInventory.penetration = Infinity;
    console.log('Infinite ammo activated for high damage and penetration ammo.');
}

function addCurrency(amount) {
    playerCurrency += amount;
    console.log(`Added ${amount} currency. Current currency: ${playerCurrency}`);
}

function togglePause() {
    if (currentGameState === gameState.PLAYING) {
        currentGameState = gameState.PAUSED;
        console.log("Game paused");
    } else if (currentGameState === gameState.PAUSED) {
        currentGameState = gameState.PLAYING;
        console.log("Game resumed");
    }
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
    const playerHeight = calculatePlayerHeight(player.y);
    const playerWidth = calculatePlayerWidth(player.y);

    player.dx = 0;
    player.dy = 0;

    if (keys['ArrowUp'] || keys['w']) player.dy = -player.speed;
    if (keys['ArrowDown'] || keys['s']) player.dy = player.speed;
    if (keys['ArrowLeft'] || keys['a']) {
        player.dx = -player.speed;
        player.facingRight = false;
    }
    if (keys['ArrowRight'] || keys['d']) {
        player.dx = player.speed;
        player.facingRight = true;
    }

    // Update player position
    player.x += player.dx;
    player.y += player.dy;

    // Keep the player within the bounds of the canvas
    const minY = 200;
    const maxY = 440;
    if (player.x < 0) player.x = 0;
    if (player.x + playerWidth > canvas.width) player.x = canvas.width - playerWidth;
    if (player.y < minY) player.y = minY;
    if (player.y > maxY) player.y = maxY;

    // Check if player reached the right edge and proceed to the next level
    if (enemiesCleared && player.x + playerWidth >= canvas.width) {
        console.log("Player reached the right edge, proceeding to next level");
        triggerLevelChange();
    }

    // Update the player sprite animation
    updatePlayerSprite();
}

function calculatePlayerHeight(y) {
    return 50 + (y / canvas.height) * 20; 
}

function calculatePlayerWidth(y) {
    return 50 + (y / canvas.height) * 20; 
}

function shootBullet() {
    const currentTime = Date.now();
    if (currentTime - player.lastShootTime >= player.shootCooldown) {
        if (ammoInventory[selectedAmmoType] > 0 || selectedAmmoType === 'standard') {
            const ammo = ammoTypes[selectedAmmoType];

            const scaledWidth = player.width * player.scale;
            const scaledHeight = player.height * player.scale;

            const bulletStartX = player.facingRight ? player.x + (player.width * 0.8) : player.x - (scaledWidth - player.width) / 2;
            const bulletStartY = player.y + scaledHeight / 4.365;

            bullets.push({
                x: bulletStartX,
                y: bulletStartY,
                width: 10,
                height: 5,
                speed: player.facingRight ? 10 : -10, 
                damage: ammo.damage,
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

function purchaseAmmo(type, amount) {
    const ammo = ammoTypes[type];
    const totalCost = ammo.cost * amount;
    if (playerCurrency >= totalCost) {
        playerCurrency -= totalCost;
        ammoInventory[type] += amount;
        console.log(`Purchased ${amount} ${type} ammo for ${totalCost} currency.`);
    } else {
        console.log('Not enough currency to purchase ammo.');
    }
}

function purchaseItem(itemKey) {
    const item = storeItems[itemKey];
    if (playerCurrency >= item.price) {
        playerCurrency -= item.price;
        item.effect();
        console.log(`Purchased ${itemKey}. Current currency: ${playerCurrency}`);
    } else {
        console.log(`Not enough currency to buy ${itemKey}. Current currency: ${playerCurrency}`);
    }
}

function handleShooting() {
    if (keys['Space']) { 
        shootBullet();
    }
}

function detectPlayerEnemyCollision(player, enemy) {
    const playerHitboxX = player.x + player.hitboxOffsetX - player.width / 2;
    const playerHitboxY = player.y + player.hitboxOffsetY - player.height / 2;

    return playerHitboxX < enemy.x + enemy.width &&
           playerHitboxX + player.width > enemy.x &&
           playerHitboxY < enemy.y + enemy.height &&
           playerHitboxY + player.height > enemy.y;
}

function resolvePlayerEnemyCollision(player, enemy) {
    const overlapX = (player.width + enemy.width) / 2 - Math.abs(player.x + player.width / 2 - (enemy.x + enemy.width / 2));
    const overlapY = (player.height + enemy.height) / 2 - Math.abs(player.y + player.height / 2 - (enemy.y + enemy.height / 2));

    if (overlapX > overlapY) {
        if (player.y < enemy.y) {
            enemy.y += overlapY;
        } else {
            enemy.y -= overlapY;
        }
    } else {
        if (player.x < enemy.x) {
            enemy.x += overlapX;
        } else {
            enemy.x -= overlapX;
        }
    }
}

function detectCollision(rect1, rect2) {
    return rect1.x - rect1.width / 2 < rect2.x + rect2.width / 2 &&
           rect1.x + rect1.width / 2 > rect2.x - rect2.width / 2 &&
           rect1.y - rect1.height / 2 < rect2.y + rect2.height / 2 &&
           rect1.y + rect1.height / 2 > rect2.y - rect2.height / 2;
}

function detectPlayerEnemyCollision(player, enemy) {
    return detectCollision(player, enemy);
}

function resolveCollision(enemy1, enemy2) {
    const overlapX = (enemy1.width + enemy2.width) / 2 - Math.abs(enemy1.x - enemy2.x);
    const overlapY = (enemy1.height + enemy2.height) / 2 - Math.abs(enemy1.y - enemy2.y);

    if (overlapX > overlapY) {
        if (enemy1.y < enemy2.y) {
            enemy1.y -= overlapY / 2;
            enemy2.y += overlapY / 2;
        } else {
            enemy1.y += overlapY / 2;
            enemy2.y -= overlapY / 2;
        }
    } else {
        if (enemy1.x < enemy2.x) {
            enemy1.x -= overlapX / 2;
            enemy2.x += overlapX / 2;
        } else {
            enemy1.x += overlapX / 2;
            enemy2.x -= overlapX / 2;
        }
    }
}

function checkBulletCollisions() {
    bullets.forEach((bullet, bulletIndex) => {
        enemies.forEach((enemy, enemyIndex) => {
            const extendedHitboxHeight = enemy.height * 2.25;

            if (
                bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + extendedHitboxHeight &&
                bullet.y + bullet.height > enemy.y
            ) {
                enemy.health -= bullet.damage;
                enemy.health = Math.max(enemy.health, 0); 

                bullet.hitEnemies.push(enemyIndex);

                if (bullet.penetration <= 0) {
                    bullets.splice(bulletIndex, 1);
                }

                if (enemy.health === 0) {
                    enemies.splice(enemyIndex, 1);
                }
            }
        });
    });
}

function handlePlayerDamage(player, enemies, timestamp) {
    const playerHitboxX = player.x;
    const playerHitboxY = player.y;
    const playerWidthScaled = player.width * player.scale;
    const playerHeightScaled = player.height * player.scale;

    const scaledEnemyAttackRange = baseEnemyAttackRange * player.scale;

    enemies.forEach(enemy => {
        const enemyWidthScaled = enemy.width * enemy.scale;
        const enemyHeightScaled = enemy.height * enemy.scale;

        const distance = distanceBetween(
            playerHitboxX + playerWidthScaled / 2,
            playerHitboxY + playerHeightScaled / 2,
            enemy.x + enemyWidthScaled / 2,
            enemy.y + enemyHeightScaled / 2
        );

        if (distance <= scaledEnemyAttackRange) {
            if (timestamp - player.lastDamageTime > player.damageInterval) {
                player.health -= 10;
                player.lastDamageTime = timestamp;
                console.log(`Player hit! Health: ${player.health}`);
            }
        }
    });
}

function checkGameOver() {
    if (player.health <= 0) {
        alert("Game Over! Restarting the game...");
        resetGame();
    }
}

function updateBullets() {
    bullets.forEach((bullet, bulletIndex) => {
        bullet.x += bullet.speed; 

        if (bullet.x < 0 || bullet.x > canvas.width) {
            bullets.splice(bulletIndex, 1);
            return;
        }

        enemies.forEach((enemy, enemyIndex) => {
            if (!bullet.hitEnemies.includes(enemy) && detectCollision(bullet, enemy)) {
                enemy.health -= bullet.damage; 
                bullet.hitEnemies.push(enemy);

                if (enemy.health <= 0) {
                    enemies.splice(enemyIndex, 1);
                }

                if (bullet.penetration > 0) {
                    bullet.penetration--;
                } else {
                    bullets.splice(bulletIndex, 1);
                }
            }
        });
    });
}

function calculateScalingFactor(y) {
    const minScale = 0.5;
    const maxScale = 2; 
    const screenHeight = canvas.height;
    
    const scaleFactor = minScale + (maxScale - minScale) * (y / screenHeight);
    return scaleFactor;
}

function updateEnemies() {
    enemies.forEach((enemy, index) => {
        const distance = distanceBetween(
            player.x + player.width / 2,
            player.y + player.height / 2,
            enemy.x + enemy.width / 2,
            enemy.y + enemy.height / 2
        );

        if (distance > enemyAttackRange) {
            moveTowardPlayer(enemy);
        }

        if (distance <= enemyAttackRange) {
            const currentTime = Date.now();
            if (currentTime - enemy.lastAttackTime >= enemyAttackCooldown) {
                player.health--; 
                enemy.lastAttackTime = currentTime;

                if (player.health <= 0) {
                    alert("Game Over!");
                    resetGame();
                }
            }
        }

        bullets.forEach((bullet, bulletIndex) => {
            if (
                bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y
            ) {
                enemy.health -= bullet.damage;
                bullets.splice(bulletIndex, 1);
                if (enemy.health <= 0) {
                    enemies.splice(index, 1); 
                }
            }
        });

        if (detectPlayerEnemyCollision(player, enemy)) {
            resolvePlayerEnemyCollision(player, enemy);
        }
    });

    for (let i = 0; i < enemies.length; i++) {
        for (let j = i + 1; j < enemies.length; j++) {
            if (detectCollision(enemies[i], enemies[j])) {
                resolveCollision(enemies[i], enemies[j]);
            }
        }
    }

    if (enemies.length === 0 && !enemiesCleared) {
        enemiesCleared = true;
        checkLevelProgression(); 
    }
}

function moveTowardPlayer(enemy) {
    if (enemy.x > canvas.width) {
        // Enemy is off-screen, move left towards the screen
        enemy.dx = -enemy.speed;
        enemy.dy = 0;
    } else {
        // Enemy is on-screen, move towards the player
        const playerCenterX = player.x + (player.width * player.scale) / 2;
        const playerCenterY = player.y + (player.height * player.scale) / 2;
        const directionX = playerCenterX - enemy.x;
        const directionY = playerCenterY - enemy.y;
        const magnitude = Math.sqrt(directionX * directionX + directionY * directionY);

        const scaledEnemyAttackRange = baseEnemyAttackRange * player.scale;

        if (magnitude > scaledEnemyAttackRange) {
            enemy.dx = (directionX / magnitude) * enemy.speed;
            enemy.dy = (directionY / magnitude) * enemy.speed;
        } else {
            enemy.dx = 0;
            enemy.dy = 0;
        }
    }

    enemy.x += enemy.dx;
    enemy.y += enemy.dy;

    if (enemy.dx > 0) {
        enemy.facingLeft = false;
    } else if (enemy.dx < 0) {
        enemy.facingLeft = true;
    }

    // Ensure enemy stays within vertical bounds
    if (enemy.y < enemyMinY) enemy.y = enemyMinY;
    if (enemy.y > enemyMaxY) enemy.y = enemyMaxY;
}

function distanceBetween(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

function resetGame() {
    player.x = 100;
    player.y = canvas.height / 2 - 25;
    player.health = player.maxHealth;
    playerCurrency = 0; 
    currentLevel = 1;
    enemiesCleared = false;
    bullets.length = 0;
    enemies = initializeEnemiesForLevel(currentLevel);
    selectedEstablishment = null;
    robberyAttempted = false;
    currentGameState = gameState.PLAYING;
}

function isPlayerAtStorePosition() {
    return player.x < STORE_POSITION.x + STORE_POSITION.width &&
           player.x + player.width > STORE_POSITION.x &&
           player.y < STORE_POSITION.y + STORE_POSITION.height &&
           player.y + player.height > STORE_POSITION.y;
}

function triggerLevelChange(level) {
    enemiesCleared = false; 
    progressionChecked = false; 
    enemies = initializeEnemiesForLevel(level); 
}

function purchaseMeal(meal) {
    if (!meal) {
        console.error('Meal is undefined');
        return;
    }
    if (playerCurrency >= meal.cost) {
        playerCurrency -= meal.cost;
        if (meal.heal === 'full') {
            player.health = player.maxHealth;
        } else {
            player.health = Math.min(player.health + meal.heal, player.maxHealth);
        }
        console.log(`Purchased ${meal.name}. Health: ${player.health}, Currency: ${playerCurrency}`);
    } else {
        console.log(`Not enough currency to purchase ${meal.name}.`);
    }
}

function resetRobbery() {
    robberyAttempted = false;
    currentGameState = gameState.PLAYING;
}

function robEstablishment() {
    if (robberyAttempted) {
        return; 
    }
    
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

function initializeGame() {
    enemies = initializeEnemiesForLevel(currentLevel);
    requestAnimationFrame(gameLoop);
}

// Function to initialize enemies for a level
function initializeEnemiesForLevel(level) {
    const maxEnemies = 5;
    const numberOfEnemies = Math.min(level, maxEnemies);
    const enemies = [];

    const enemyScale = 1.5;
    const enemyMinY = 200;
    const enemyMaxY = 440;
    const enemyHorizontalSpacing = 120; // Horizontal spacing between enemies

    for (let i = 0; i < numberOfEnemies; i++) {
        const enemyX = canvas.width + 50 + (i * enemyHorizontalSpacing); // Staggered horizontal positions
        const enemyY = Math.random() * (enemyMaxY - enemyMinY) + enemyMinY;

        const enemyWidth = 64 * enemyScale; // Width of a single frame scaled
        const enemyHeight = 64 * enemyScale; // Height of a single frame scaled

        enemies.push({
            x: enemyX,
            y: enemyY,
            dx: -1.5, // Move left towards the screen
            dy: 0,
            animationTimer: 0,
            animationSpeed: 25,
            frameX: 0,
            totalFrames: 10,
            idleFrame: 0,
            speed: 1.5,
            facingLeft: true,
            width: enemyWidth,
            height: enemyHeight,
            health: 50,
            maxHealth: 50,
            image: images.enemy,
            scale: enemyScale,
            frameWidth: 180, // Width of a single frame
            frameHeight: 150 // Height of a single frame
        });
    }

    return enemies;
}

function isPlayerInStoreEntryZone() {
    return (
        player.x + player.width / 2 >= storeEntryZone.x &&
        player.x + player.width / 2 <= storeEntryZone.x + storeEntryZone.width &&
        player.y <= storeEntryZone.y + storeEntryZone.height
    );
}

function updateSprite(sprite) {
    sprite.animationTimer++;
    if (sprite.animationTimer >= sprite.animationSpeed) {
        sprite.animationTimer = 0;
        if (sprite.dx !== 0 || sprite.dy !== 0) {
            sprite.frameX = (sprite.frameX + 1) % sprite.totalFrames; 
        } else {
            sprite.frameX = sprite.idleFrame; 
        }
    }
}

function restartGame() {
    player.health = 100; 
    currentGameState = gameState.PLAYING;
}

function drawBullets() {
    ctx.fillStyle = 'yellow';
    bullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
}

function drawBackground() {
    let backgroundWidth = canvas.width;
    let backgroundHeight = canvas.height;

    let x = backgroundX % backgroundWidth;
    if (x > 0) x -= backgroundWidth; 

    while (x < canvas.width) {
        ctx.drawImage(backgroundImage, x, 0, backgroundWidth, backgroundHeight);
        x += backgroundWidth;
    }
}

function drawPlayer() {
    ctx.save();

    const maxScale = 2;     
    const minScale = 0.5;  
    const scale = minScale + ((maxScale - minScale) * (player.y / canvas.height));
    const drawWidth = player.width * scale;
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
        // Draw the hitbox for the player (for visualization purposes)
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 2;
        ctx.strokeRect(
            player.x, 
            player.y, 
            player.width * player.scale, 
            player.height * player.scale
        );
    }
}

function drawEnemies() {
    enemies.forEach(enemy => {
        drawEnemy(enemy);
    });
}

function drawEnemy(enemy) {
    const scaleFactor = calculateScalingFactor(enemy.y) * enemyScalingFactor;
    const scaledWidth = enemy.frameWidth * scaleFactor;
    const scaledHeight = enemy.frameHeight * scaleFactor;

    enemy.scale = scaleFactor; // Update the enemy's scale

    // Draw the enemy sprite
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
        // Draw the hitbox for the enemy (for visualization purposes)
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.strokeRect(
            enemy.x, 
            enemy.y, 
            enemy.width * enemy.scale, 
            enemy.height * enemy.scale
        );
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

function drawLevelInfo() {
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Level: ${currentLevel}`, canvas.width - 100, 30);
}

function drawMainMenu() {
    console.log("Drawing main menu");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(mainMenuImage, 0, 0, canvas.width, canvas.height);
}

function drawPauseMenu() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Paused', canvas.width / 2, canvas.height / 2 - 50);
    ctx.fillStyle = 'yellow';
    ctx.font = '30px Arial';
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
    ctx.font = '20px Arial';
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
    setTimeout(() => {
        currentGameState = gameState.PLAYING;
    }, 2000);
}

function drawRobberyFailureScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(robberyFailureImg, 0, 0, canvas.width, canvas.height);
    setTimeout(() => {
        currentGameState = gameState.PLAYING;
    }, 2000); 
}

function drawMarkPosition() {
    console.log('Drawing store position');
    ctx.drawImage(arrowImage, MARK_POSITION.x, arrowY, MARK_POSITION.width, MARK_POSITION.height);
}

function drawAmmoType() {
    ctx.font = '20px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText(`Ammo Type: ${selectedAmmoType}`, 480, 665);

    ctx.fillText(`Standard Ammo: ${ammoInventory.standard === Infinity ? '∞' : ammoInventory.standard}`, 480, 700);
    ctx.fillText(`${ammoInventory.highDamage}`, 430, 630);
    ctx.fillText(`${ammoInventory.penetration}`, 430, 700);
}

function drawCurrency() {
    ctx.font = '20px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText(`Wallet : ${playerCurrency} $`, 480, 630);
}

function drawGameOverScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '48px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 50);

    ctx.font = '24px sans-serif';
    ctx.fillText('Press R to Restart', canvas.width / 2, canvas.height / 2);
}

function drawControlsScreen() {
    console.log("Drawing controls screen");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(controlsImage, 0, 0, canvas.width, canvas.height);
}

function drawEnemyHealthBar(enemy) {
    const scaleFactor = calculateScalingFactor(enemy.y);
    const scaledWidth = enemy.frameWidth * scaleFactor;
    const scaledHeight = enemy.frameHeight * scaleFactor;
    
    // Calculate the position of the health bar
    const barWidth = 50; // Width of the health bar
    const barHeight = 5; // Height of the health bar
    const barX = enemy.x - barWidth / 2; // Center the bar horizontally above the enemy
    const barY = enemy.y - scaledHeight / 2 - barHeight - 5; // Position the bar above the enemy sprite
    
    // Draw the background of the health bar
    ctx.fillStyle = 'gray';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    
    // Draw the health portion of the health bar
    const healthWidth = (enemy.health / enemy.maxHealth) * barWidth;
    ctx.fillStyle = 'green';
    ctx.fillRect(barX, barY, healthWidth, barHeight);
    
    // Draw the border of the health bar
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barWidth, barHeight);
}

document.addEventListener('keydown', function (event) {
    if (event.key === 'r' || event.key === 'R') {
        restartGame();
    }
});

function calculateScalingFactor(y) {
    const minScale = 0.5;
    const maxScale = 1.5;
    const screenHeight = canvas.height;
    
    return minScale + (maxScale - minScale) * (y / screenHeight);
}

function drawScaledEnemy(enemy) {
    if (!enemy.image || !enemy.image.complete) {
        console.error('Enemy image is not loaded');
        return;
    }

    const scaleFactor = calculateScalingFactor(enemy.y);
    const scaledWidth = enemy.width * scaleFactor;
    const scaledHeight = enemy.height * scaleFactor;

    ctx.drawImage(
        enemy.image,  
        enemy.x - scaledWidth / 2,  
        enemy.y - scaledHeight / 2, 
        scaledWidth,
        scaledHeight
    );
}

function gameLoop(timestamp) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (currentGameState === gameState.MAIN_MENU) {
        drawMainMenu();
    } else if (currentGameState === gameState.CONTROLS) {
        drawControlsScreen();
    } else if (currentGameState === gameState.PLAYING) {
        drawBackground();

        updateEnemyAnimation(timestamp);
        enemies.forEach(enemy => {
            moveTowardPlayer(enemy); // Ensure enemies move towards the player
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

        checkBulletCollisions();

        updateArrowPosition();

        if (enemiesCleared) {
            drawMarkPosition();
        }
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