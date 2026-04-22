// ============================================================
// globals.js — Shared state, constants, and the canvas context
// ============================================================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- Dev mode (toggled via 'devmode' cheat code) ---
let devMode = false;

// --- Game state enum ---
const gameState = {
    MAIN_MENU:        'mainMenu',
    PLAYING:          'playing',
    PAUSED:           'paused',
    STORE_SCREEN:     'storeScreen',
    RESTAURANT_SCREEN:'restaurantScreen',
    ROBBERY_SCREEN:   'robberyScreen',
    ROBBERY_SUCCESS:  'robberySuccess',
    ROBBERY_FAILURE:  'robberyFailure',
    GAME_OVER:        'gameOver',
    CONTROLS:         'controls',
    ENDLESS:          'endless',
    OPTIONS:          'options',
    STORY:            'story',
    LOCATION_TRANSITION: 'locationTransition',
    STORY_COMPLETE:     'storyComplete',
    WEAPON_STORE_SCREEN: 'weaponStoreScreen',
    DIALOG:           'dialog',
    WALKING_IN:       'walkingIn',
};

let currentGameState = 'mainMenu';


// --- Key bindings (remappable via Options > Bindings) ---
// Values are KeyboardEvent.code strings
const keyBindings = {
    up:    'KeyW',
    down:  'KeyS',
    left:  'KeyA',
    right: 'KeyD',
    shoot: 'Space',
    pause: 'Escape',
    exitEstablishment: 'KeyB',
};

// Tracks where the Options screen should return to (main menu or pause menu)
let pauseOptionsReturnState = 'mainMenu';

// --- Level & currency ---
let currentLevel = 1;
let playerCurrency = 0;

// --- Story mode ---
let isStoryMode = false;

const STORY_LOCATIONS = [
    {
        id: 1, name: 'Location 1', subtitle: 'The Beginning', color: '#1a3a2a',
        levels: [1, 2, 3, 4, 5],
        dialog: [
            "So this is where it all starts...",
            "I don't know who these people are or why they're after me.",
            "But I'm not going down without a fight.",
            "Let's see what you've got."
        ]
    },
    {
        id: 2, name: 'Location 2', subtitle: 'The Outskirts', color: '#2a1a1a',
        levels: [6, 7, 8, 9, 10],
        dialog: [
            "The outskirts. Further from the city, closer to the truth.",
            "There are more of them here than I expected.",
            "Someone is coordinating this. Someone with resources.",
            "I need to keep moving."
        ]
    },
    {
        id: 3, name: 'Location 3', subtitle: 'The Docks', color: '#1a1a3a',
        levels: [11, 12, 13, 14, 15],
        dialog: [
            "The docks. I can smell the salt and rust from here.",
            "Shipments coming in at night... contraband, maybe worse.",
            "Whatever they're moving through here, I'm going to stop it.",
            "Stay sharp."
        ]
    },
    {
        id: 4, name: 'Location 4', subtitle: 'The Warehouse', color: '#2a2a1a',
        levels: [16, 17, 18, 19, 20],
        dialog: [
            "A warehouse. Of course.",
            "Dark corners, long shadows — exactly where I don't want to be.",
            "But this is where the trail leads.",
            "No turning back now."
        ]
    },
    {
        id: 5, name: 'Location 5', subtitle: 'The Factory', color: '#2a1a2a',
        levels: [21, 22, 23, 24, 25],
        dialog: [
            "A factory. Still running, by the sound of it.",
            "They're using this place for something. Something big.",
            "The air tastes like metal and bad decisions.",
            "Almost there. I can feel it."
        ]
    },
    {
        id: 6, name: 'Location 6', subtitle: 'The Final Stand', color: '#1a2a2a',
        levels: [26, 27, 28, 29, 30],
        dialog: [
            "This is it. The end of the line.",
            "Everything led here. Every bullet, every close call.",
            "Whoever is behind all this... they're close.",
            "Finish it."
        ]
    },
];

const STORY_TOTAL_LEVELS = 30;
const LEVELS_PER_LOCATION = 5;

function getCurrentLocation() {
    return STORY_LOCATIONS[Math.floor((currentLevel - 1) / LEVELS_PER_LOCATION)];
}

function getLocationForLevel(level) {
    return STORY_LOCATIONS[Math.floor((level - 1) / LEVELS_PER_LOCATION)];
}

function isNewLocation(prevLevel, newLevel) {
    return Math.floor((prevLevel - 1) / LEVELS_PER_LOCATION) !==
           Math.floor((newLevel  - 1) / LEVELS_PER_LOCATION);
}

// --- Input ---
let keys = {};

// --- Gameplay flags ---
let robberyAttempted    = false;
let enemiesCleared      = false;
let progressionChecked  = false;
let selectedEstablishment = null;
let establishmentUsed      = false; // true once the player has entered/completed it
let isMovingToNextLevel = false;

// --- Background scroll ---
let backgroundX = 0;

// --- Establishments ---
const ESTABLISHMENTS = {
    STORE:        'store',
    RESTAURANT:   'restaurant',
    ROBBERY:      'robbery',
    WEAPON_STORE: 'weaponStore'
};

let currentEstablishment     = null;
let lastSelectedEstablishment = null;

// --- Ammo ---
const ammoTypes = {
    standard:    { damage: 15, penetration: false, cost: 0 },
    highDamage:  { damage: 30, penetration: false, cost: 3 },
    penetration: { damage: 15, penetration: 2,     cost: 5 },  // 2 = max enemies it can pierce through
};

let selectedAmmoType = 'standard';

const ammoInventory = {
    standard:    Infinity,
    highDamage:  0,
    penetration: 0,
};

// --- Weapons ---
const WEAPONS = {
    pistol: {
        id:           0,
        name:         'Pistol',
        cooldown:     200,   // ms between shots
        damage:       15,
        bulletSpeed:  600,   // px/sec
        spread:       0,     // vertical spread in px (0 = none)
        bulletsPerShot: 1,
        penetration:  false,
        infinite:     true,
    },
    smg: {
        id:           2,
        name:         'SMG',
        cooldown:     80,
        damage:       8,
        bulletSpeed:  680,
        spread:       18,    // bullets fan vertically by this amount
        bulletsPerShot: 3,
        penetration:  false,
        infinite:     false,
    },
    sniper: {
        id:           3,
        name:         'Sniper',
        cooldown:     900,
        damage:       60,
        bulletSpeed:  1100,
        spread:       0,
        bulletsPerShot: 1,
        penetration:  false,
        infinite:     false,
    },
    devGun: {
        id:           1997,
        name:         'Dev Gun',
        cooldown:     50,
        damage:       99999,
        bulletSpeed:  900,
        spread:       0,
        bulletsPerShot: 1,
        penetration:  2,
        infinite:     true,
    },
};

// Weapon store prices (pistol is free / starter, not sold)
const WEAPON_PRICES = {
    smg:    80,
    sniper: 120,
    devGun: 9999, // placeholder
};

// Weapon store ammo bundle sizes (bought alongside or separately)
const WEAPON_AMMO_BUNDLES = {
    smg:    { amount: 30, price: 20 },
    sniper: { amount: 10, price: 25 },
};

// Map weapon ID → key for cheat code lookup
const WEAPON_BY_ID = {};
for (const [key, w] of Object.entries(WEAPONS)) WEAPON_BY_ID[w.id] = key;

let currentWeapon = 'pistol'; // active weapon key

// Weapon ammo counts (Infinity = unlimited)
const weaponAmmo = {
    pistol:  Infinity,
    smg:     0,
    sniper:  0,
    devGun:  Infinity, // only via cheat
};

// --- Store items ---
const storeItems = {
    highDamageAmmo:  { price: 3, effect: () => { ammoInventory.highDamage  += 5; } },
    penetrationAmmo: { price: 5, effect: () => { ammoInventory.penetration += 5; } },
};

// --- Meals ---
const meals = {
    RED_FISH:      { name: 'Red Fish',      cost: 20, heal: 35 },
    BEEF_SOUP:     { name: 'Beef Soup',     cost: 10, heal: 15 },
    FRIED_PIRANHA: { name: 'Fried Piranha', cost: 70, heal: 'full' }
};

// --- Enemy constants ---
const baseEnemyAttackRange = 100;
const enemyAttackRange     = 100;
const enemyAttackCooldown  = 800;
const MIN_SAFE_DISTANCE    = 100;
const enemyMinY            = 200;
const enemyMaxY            = 440;
const enemyVerticalSpacing = 80;
const enemyScalingFactor   = 0.55;
const enemySpawnMinY       = 200;
const enemySpawnMaxY       = 440;

// --- Boss levels ---
const BOSS_LEVELS = [10, 20, 30];
function isBossLevel(level) { return BOSS_LEVELS.includes(level); }

// Boss bullets (shot by boss at player) — separate from player bullets
const bossBullets = [];
const BOSS_SHOOT_COOLDOWN = 1800; // ms between boss shots
const BOSS_BULLET_SPEED   = 420;  // px/sec

// --- HUD / world positions ---
const MARK_POSITION = { x: 825, y: 60,  width: 40,  height: 50  };
const STORE_POSITION = { x: 750, y: 120, width: 300, height: 160 }; // entry zone — matches HUD building area

let arrowY        = MARK_POSITION.y;
let arrowDirection = 1;
const ARROW_SPEED = 0.75;
const ARROW_RANGE = 10;

// --- Sprite sheet meta (used by enemy animation) ---
const spriteSheet = {
    frameWidth:    180,
    frameHeight:   150,
    frameCount:    14,
    currentFrame:  0,
    animationSpeed: 80,
    lastUpdateTime: 0,
};