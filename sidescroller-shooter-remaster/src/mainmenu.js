// ============================================================
// mainmenu.js — Main menu + Options screen
// Depends on: globals.js, assets.js
// ============================================================

// --- Shared layout constants ---
const MENU_BTN_W       = 240;
const MENU_BTN_H       = 60;
const MENU_BTN_GAP     = 20;
const MENU_PANEL_W     = 340;  // full width of the left panel

// Derived: horizontal centre of the panel
function menuPanelCX() { return MENU_PANEL_W / 2; }
// Derived: left x so buttons are centred in the panel
function menuBtnX()    { return menuPanelCX() - MENU_BTN_W / 2; }

// --- Volume (0.0 – 1.0) ---
let masterVolume = 0.8;

// --- Hover / drag state ---
let menuHoveredElement = null;
let sliderDragging     = false;

// =============================================================
//  LAYOUT HELPERS
// =============================================================

function getMainMenuButtons() {
    // Total block = title (36px) + gap (28px) + 3 buttons + 2 gaps between them
    const titleH   = 36;
    const titleGap = 32;
    const blockH   = titleH + titleGap + 3 * MENU_BTN_H + 2 * MENU_BTN_GAP;
    const blockTop = canvas.height / 2 - blockH / 2;
    const btnX     = menuBtnX();
    const btnStart = blockTop + titleH + titleGap;
    return {
        _titleY:  blockTop + titleH / 2,   // vertical midpoint of title text
        endless: { label: 'Endless', x: btnX, y: btnStart,                                    w: MENU_BTN_W, h: MENU_BTN_H },
        story:   { label: 'Story',   x: btnX, y: btnStart + (MENU_BTN_H + MENU_BTN_GAP),     w: MENU_BTN_W, h: MENU_BTN_H },
        options: { label: 'Options', x: btnX, y: btnStart + (MENU_BTN_H + MENU_BTN_GAP) * 2, w: MENU_BTN_W, h: MENU_BTN_H },
    };
}

function getOptionsButtons() {
    return {
        back: { label: '← Back', x: menuBtnX(), y: canvas.height / 2 + 90, w: MENU_BTN_W, h: MENU_BTN_H },
    };
}

function getSliderTrack() {
    const trackW = MENU_BTN_W;
    return { x: menuBtnX(), y: canvas.height / 2 - 10, w: trackW, h: 10 };
}

// =============================================================
//  DRAW — MAIN MENU
// =============================================================

function drawMainMenu() {
    if (devMode) console.log('Drawing main menu');

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (mainMenuImage && mainMenuImage.complete && mainMenuImage.naturalWidth > 0) {
        ctx.drawImage(mainMenuImage, 0, 0, canvas.width, canvas.height);
    } else {
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Left-side panel — full height, flush to left & top/bottom edges
    ctx.fillStyle = 'rgba(0, 0, 0, 0.60)';
    drawRoundRectLeft(0, 0, MENU_PANEL_W, canvas.height);
    ctx.fill();

    const buttons = getMainMenuButtons();

    // Title — horizontally centred in panel, vertically part of the block
    ctx.save();
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.font         = 'bold 36px Arial';
    ctx.fillStyle    = '#fff';
    ctx.shadowColor  = 'rgba(0,0,0,0.9)';
    ctx.shadowBlur   = 14;
    ctx.fillText('Bullet & Spite', menuPanelCX(), buttons._titleY);
    ctx.shadowBlur   = 0;
    ctx.restore();

    for (const [key, btn] of Object.entries(buttons)) {
        if (key.startsWith('_')) continue;
        drawMenuButton(btn, menuHoveredElement === key);
    }

    resetCtxText();
}

// =============================================================
//  DRAW — OPTIONS SCREEN
// =============================================================

function drawOptionsScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (mainMenuImage && mainMenuImage.complete && mainMenuImage.naturalWidth > 0) {
        ctx.drawImage(mainMenuImage, 0, 0, canvas.width, canvas.height);
    } else {
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Left-side panel — full height, flush to left & top/bottom edges
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    drawRoundRectLeft(0, 0, MENU_PANEL_W, canvas.height);
    ctx.fill();

    // Title — centred in panel, near top of content block
    ctx.save();
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.font         = 'bold 32px Arial';
    ctx.fillStyle    = '#fff';
    ctx.shadowColor  = 'rgba(0,0,0,0.9)';
    ctx.shadowBlur   = 10;
    ctx.fillText('Options', menuPanelCX(), canvas.height / 2 - 130);
    ctx.shadowBlur   = 0;
    ctx.restore();

    drawVolumeSlider();

    const buttons = getOptionsButtons();
    drawMenuButton(buttons.back, menuHoveredElement === 'back');

    resetCtxText();
}

function drawVolumeSlider() {
    const track  = getSliderTrack();
    const labelY = track.y - 40;
    const fillW  = track.w * masterVolume;
    const hovered = menuHoveredElement === 'slider' || sliderDragging;

    // Label row
    ctx.save();
    ctx.textAlign    = 'left';
    ctx.textBaseline = 'middle';
    ctx.font         = '20px Arial';
    ctx.fillStyle    = '#ccc';
    ctx.fillText('Master Volume', menuBtnX(), labelY);
    ctx.textAlign    = 'right';
    ctx.fillStyle    = '#e8c84a';
    ctx.font         = 'bold 20px Arial';
    ctx.fillText(`${Math.round(masterVolume * 100)}%`, menuBtnX() + track.w, labelY);
    ctx.restore();

    // Track BG
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    drawRoundRect(track.x, track.y, track.w, track.h, 5);
    ctx.fill();

    // Track fill
    if (fillW > 0) {
        ctx.fillStyle = hovered ? '#f5d76e' : '#e8c84a';
        drawRoundRect(track.x, track.y, fillW, track.h, 5);
        ctx.fill();
    }

    // Thumb
    const thumbX = track.x + fillW;
    const thumbR = sliderDragging ? 11 : (hovered ? 10 : 8);
    ctx.beginPath();
    ctx.arc(thumbX, track.y + track.h / 2, thumbR, 0, Math.PI * 2);
    ctx.fillStyle   = '#fff';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur  = 8;
    ctx.fill();
    ctx.shadowBlur  = 0;

    // Tick marks
    ctx.fillStyle = 'rgba(255,255,255,0.30)';
    [0, 0.25, 0.5, 0.75, 1].forEach(t => {
        const tx = track.x + track.w * t;
        ctx.fillRect(tx - 1, track.y + track.h + 6, 2, 7);
    });
}

// =============================================================
//  SHARED HELPERS
// =============================================================

function drawMenuButton(btn, hovered) {
    ctx.shadowColor   = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur    = hovered ? 18 : 8;
    ctx.shadowOffsetY = hovered ? 4 : 2;
    ctx.fillStyle     = hovered ? '#e8c84a' : 'rgba(30,30,30,0.85)';
    drawRoundRect(btn.x, btn.y, btn.w, btn.h, 10);
    ctx.fill();

    ctx.shadowBlur    = 0;
    ctx.shadowOffsetY = 0;
    ctx.strokeStyle   = hovered ? '#f5d76e' : 'rgba(255,255,255,0.18)';
    ctx.lineWidth     = hovered ? 2.5 : 1.5;
    drawRoundRect(btn.x, btn.y, btn.w, btn.h, 10);
    ctx.stroke();

    ctx.font         = hovered ? 'bold 22px Arial' : '22px Arial';
    ctx.fillStyle    = hovered ? '#1a1a1a' : '#f0f0f0';
    ctx.textAlign    = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(btn.label, btn.x + 20, btn.y + btn.h / 2);
}

// Panel flush to left edge — only rounds the right-side corners
function drawRoundRectLeft(x, y, w, h) {
    const r = 16;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x, y + h);
    ctx.closePath();
}

function drawRoundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

function resetCtxText() {
    ctx.textAlign     = 'left';
    ctx.textBaseline  = 'alphabetic';
    ctx.shadowBlur    = 0;
    ctx.shadowOffsetY = 0;
}

// =============================================================
//  HIT TESTING
// =============================================================

function getMenuElementAtPoint(x, y) {
    if (currentGameState === gameState.MAIN_MENU) {
        for (const [key, btn] of Object.entries(getMainMenuButtons())) {
            if (key.startsWith('_')) continue;
            if (x >= btn.x && x <= btn.x + btn.w && y >= btn.y && y <= btn.y + btn.h) return key;
        }
    } else if (currentGameState === gameState.OPTIONS) {
        const track = getSliderTrack();
        const pad   = 16;
        if (x >= track.x - pad && x <= track.x + track.w + pad &&
            y >= track.y - pad && y <= track.y + track.h + pad) return 'slider';

        for (const [key, btn] of Object.entries(getOptionsButtons())) {
            if (x >= btn.x && x <= btn.x + btn.w && y >= btn.y && y <= btn.y + btn.h) return key;
        }
    }
    return null;
}

function xToVolume(mouseX) {
    const track = getSliderTrack();
    return Math.max(0, Math.min(1, (mouseX - track.x) / track.w));
}

// =============================================================
//  CLICK HANDLER
// =============================================================

function handleMenuButtonClick(key) {
    if (devMode) console.log(`Menu element clicked: ${key}`);
    switch (key) {
        case 'endless':
            currentGameState = gameState.PLAYING;
            enemies = initializeEnemiesForLevel(currentLevel);
            break;
        case 'story':
            if (devMode) console.log('Story mode — not yet implemented');
            break;
        case 'options':
            pauseOptionsReturnState = gameState.MAIN_MENU;
            currentGameState = gameState.OPTIONS;
            break;
        case 'back':
            currentGameState = pauseOptionsReturnState || gameState.MAIN_MENU;
            menuHoveredElement = null;
            break;
    }
}

// =============================================================
//  CANVAS EVENT LISTENERS
// =============================================================

function isMenuActive() {
    return currentGameState === gameState.MAIN_MENU || currentGameState === gameState.OPTIONS;
}

function canvasCoords(e) {
    const rect   = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
}

canvas.addEventListener('mousemove', (e) => {
    if (!isMenuActive()) return;
    const { x, y } = canvasCoords(e);
    if (sliderDragging) {
        masterVolume = xToVolume(x);
        if (devMode) console.log(`Volume: ${Math.round(masterVolume * 100)}%`);
        return;
    }
    menuHoveredElement  = getMenuElementAtPoint(x, y);
    canvas.style.cursor = menuHoveredElement ? 'pointer' : 'default';
});

canvas.addEventListener('mousedown', (e) => {
    if (currentGameState !== gameState.OPTIONS) return;
    const { x, y } = canvasCoords(e);
    if (getMenuElementAtPoint(x, y) === 'slider') {
        sliderDragging = true;
        masterVolume   = xToVolume(x);
    }
});

window.addEventListener('mouseup', () => {
    sliderDragging = false;
});

canvas.addEventListener('click', (e) => {
    if (!isMenuActive() || sliderDragging) return;
    const { x, y } = canvasCoords(e);
    const hit = getMenuElementAtPoint(x, y);
    if (hit && hit !== 'slider') handleMenuButtonClick(hit);
});