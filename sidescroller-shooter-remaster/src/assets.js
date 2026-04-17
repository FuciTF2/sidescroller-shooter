// ============================================================
// assets.js — Image preloading
// Depends on: globals.js
// ============================================================

const imageSources = {
    enemy:           './graphics/enemy.png',
    background:      './graphics/bg.png',
    restaurantImage: './graphics/reastaurant_screen.png',
    robberyScreen:   './graphics/robbery_screen.png',
    robberySuccess:  './graphics/robbery_screen_succes.png',
    robberyFailure:  './graphics/robbery_screen_failed.png',
    store:           './graphics/store_screen.png',
    hud:             './graphics/hud.png',
    mainMenuImage:   './graphics/mainmenu.png',
    arrow:           './graphics/mark.png',
    controls:        './graphics/how.png',
    player:          './graphics/player.png'
};

const images = {};
const totalImages = Object.keys(imageSources).length;
let imagesLoaded = 0;

for (const [name, src] of Object.entries(imageSources)) {
    images[name] = new Image();
    images[name].src = src;
    images[name].onload = () => {
        imagesLoaded++;
        if (devMode) console.log(`${name} image loaded`);
    };
    images[name].onerror = () => {
        if (devMode) console.error(`Error loading ${name} image`);
    };
}

function allImagesLoaded() {
    return imagesLoaded === totalImages;
}

// Convenience named references used by graphics.js
const enemySpriteSheet  = images.enemy;
const backgroundImage   = images.background;
const restaurantScreenImg = images.restaurantImage;
const robberyScreenImg  = images.robberyScreen;
const robberySuccessImg = images.robberySuccess;
const robberyFailureImg = images.robberyFailure;
const storeImg          = images.store;
const hudImage          = images.hud;
const mainMenuImage     = images.mainMenuImage;
const arrowImage        = images.arrow;
const controlsImage     = images.controls;