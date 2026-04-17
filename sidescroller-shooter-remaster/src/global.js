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
};

let currentGameState = 'mainMenu';

// --- Level & currency ---
let currentLevel = 1;
let playerCurrency = 0;

// --- Input ---
let keys = {};

// --- Gameplay flags ---
let robberyAttempted    = false;
let enemiesCleared      = false;
let progressionChecked  = false;
let selectedEstablishment = null;
let isMovingToNextLevel = false;

// --- Background scroll ---
let backgroundX = 0;

// --- Establishments ---
const ESTABLISHMENTS = {
    STORE:      'store',
    RESTAURANT: 'restaurant',
    ROBBERY:    'robbery'
};

let currentEstablishment     = null;
let lastSelectedEstablishment = null;

// --- Ammo ---
const ammoTypes = {
    standard:    { damage: 15, penetration: false, cost: 0 },
    highDamage:  { damage: 30, penetration: false, cost: 3 },
    penetration: { damage: 15, penetration: true,  cost: 5 },
};

let selectedAmmoType = 'standard';

const ammoInventory = {
    standard:    Infinity,
    highDamage:  0,
    penetration: 0,
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
const enemyScalingFactor   = 0.8;
const enemySpawnMinY       = 200;
const enemySpawnMaxY       = 440;

// --- HUD / world positions ---
const MARK_POSITION = { x: 825, y: 60,  width: 40,  height: 50  };
const STORE_POSITION = { x: 835, y: 134, width: 90, height: 100 };

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