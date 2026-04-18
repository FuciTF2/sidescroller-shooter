// ============================================================
// mainmenu.js — Main menu + Options screen
// Depends on: globals.js, assets.js
// ============================================================

// --- Shared layout constants ---
const MENU_LEFT_MARGIN = 80;
const MENU_BTN_W       = 240;
const MENU_BTN_H       = 60;
const MENU_BTN_GAP     = 20;

// --- Volume (0.0 – 1.0) ---
let masterVolume = 0.8;

// --- Hover / drag state ---
let menuHoveredElement = null;
let sliderDragging     = false;

// =============================================================
//  LAYOUT HELPERS
// =============================================================

function getMainMenuButtons() {
    const startY = canvas.height / 2 - (3 * MENU_BTN_H + 2 * MENU_BTN_GAP) / 2;
    return {
        endless: { label: 'Endless', x: MENU_LEFT_MARGIN, y: startY,                                    w: MENU_BTN_W, h: MENU_BTN_H },
        story:   { label: 'Story',   x: MENU_LEFT_MARGIN, y: startY + (MENU_BTN_H + MENU_BTN_GAP),     w: MENU_BTN_W, h: MENU_BTN_H },
        options: { label: 'Options', x: MENU_LEFT_MARGIN, y: startY + (MENU_BTN_H + MENU_BTN_GAP) * 2, w: MENU_BTN_W, h: MENU_BTN_H },
    };
}

function getOptionsButtons() {
    return {
        back: { label: '← Back', x: MENU_LEFT_MARGIN, y: canvas.height / 2 + 80, w: MENU_BTN_W, h: MENU_BTN_H },
    };
}

function getSliderTrack() {
    return { x: MENU_LEFT_MARGIN, y: canvas.height / 2 - 10, w: 280, h: 10 };
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

    // Left-side panel
    const panelX = MENU_LEFT_MARGIN - 30;
    const panelY = canvas.height / 2 - 200;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.60)';
    drawRoundRect(panelX, panelY, MENU_BTN_W + 60, 400, 16);
    ctx.fill();

    // Title
    ctx.save();
    ctx.textAlign    = 'left';
    ctx.textBaseline = 'middle';
    ctx.font         = 'bold 36px Arial';
    ctx.fillStyle    = '#fff';
    ctx.shadowColor  = 'rgba(0,0,0,0.9)';
    ctx.shadowBlur   = 14;
    ctx.fillText('Bullet & Spite', MENU_LEFT_MARGIN, panelY + 58);
    ctx.shadowBlur   = 0;
    ctx.restore();

    const buttons = getMainMenuButtons();
    for (const [key, btn] of Object.entries(buttons)) {
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

    // Panel
    const panelX = MENU_LEFT_MARGIN - 30;
    const panelY = canvas.height / 2 - 220;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    drawRoundRect(panelX, panelY, 360, 460, 16);
    ctx.fill();

    // Title
    ctx.save();
    ctx.textAlign    = 'left';
    ctx.textBaseline = 'middle';
    ctx.font         = 'bold 32px Arial';
    ctx.fillStyle    = '#fff';
    ctx.shadowColor  = 'rgba(0,0,0,0.9)';
    ctx.shadowBlur   = 10;
    ctx.fillText('Options', MENU_LEFT_MARGIN, panelY + 55);
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
    ctx.fillText('Master Volume', MENU_LEFT_MARGIN, labelY);
    ctx.textAlign    = 'right';
    ctx.fillStyle    = '#e8c84a';
    ctx.font         = 'bold 20px Arial';
    ctx.fillText(`${Math.round(masterVolume * 100)}%`, MENU_LEFT_MARGIN + track.w, labelY);
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
            currentGameState = gameState.OPTIONS;
            break;
        case 'back':
            currentGameState = gameState.MAIN_MENU;
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