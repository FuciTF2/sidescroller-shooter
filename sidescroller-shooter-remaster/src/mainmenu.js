// ============================================================
// mainmenu.js — Main menu + Options screen (Audio & Bindings tabs)
// Depends on: globals.js, assets.js
// ============================================================

// --- Shared layout constants ---
const MENU_BTN_W       = 240;
const MENU_BTN_H       = 60;
const MENU_BTN_GAP     = 20;
const MENU_PANEL_W     = 340;

function menuPanelCX() { return MENU_PANEL_W / 2; }
function menuBtnX()    { return menuPanelCX() - MENU_BTN_W / 2; }

// --- Volume ---
let masterVolume = 0.8;

// --- Options tab: 'audio' | 'bindings' ---
let optionsTab = 'audio';

// --- Binding capture state ---
// When non-null, we're waiting for the next keypress to rebind this action
let listeningForBinding = null;

// --- Hover / drag state ---
let menuHoveredElement = null;
let sliderDragging     = false;

// Human-readable labels for each binding action
const BINDING_LABELS = {
    up:    'Move Up',
    down:  'Move Down',
    left:  'Move Left',
    right: 'Move Right',
    shoot: 'Shoot',
    pause:             'Pause',
    exitEstablishment: 'Leave Shop',
};

// Pretty-print a KeyboardEvent.code string  e.g. 'KeyW' → 'W', 'Space' → 'Space'
function prettyKey(code) {
    if (code.startsWith('Key'))   return code.slice(3);
    if (code.startsWith('Digit')) return code.slice(5);
    if (code.startsWith('Arrow')) return code.slice(5);
    return code;
}

// =============================================================
//  LAYOUT HELPERS
// =============================================================

function getMainMenuButtons() {
    const titleH   = 36;
    const titleGap = 32;
    const blockH   = titleH + titleGap + 3 * MENU_BTN_H + 2 * MENU_BTN_GAP;
    const blockTop = canvas.height / 2 - blockH / 2;
    const btnX     = menuBtnX();
    const btnStart = blockTop + titleH + titleGap;
    return {
        _titleY:  blockTop + titleH / 2,
        endless: { label: 'Endless', x: btnX, y: btnStart,                                    w: MENU_BTN_W, h: MENU_BTN_H },
        story:   { label: 'Story',   x: btnX, y: btnStart + (MENU_BTN_H + MENU_BTN_GAP),     w: MENU_BTN_W, h: MENU_BTN_H },
        options: { label: 'Options', x: btnX, y: btnStart + (MENU_BTN_H + MENU_BTN_GAP) * 2, w: MENU_BTN_W, h: MENU_BTN_H },
    };
}

function getOptionsBackButton() {
    return { label: '← Back', x: menuBtnX(), y: canvas.height - 90, w: MENU_BTN_W, h: MENU_BTN_H };
}

// Tab pill positions
function getOptionsTabs() {
    const tabW = 110, tabH = 36, tabGap = 10;
    const totalW = tabW * 2 + tabGap;
    const startX = menuPanelCX() - totalW / 2;
    const y = 110;
    return {
        audio:    { label: 'Audio',    x: startX,           y, w: tabW, h: tabH },
        bindings: { label: 'Bindings', x: startX + tabW + tabGap, y, w: tabW, h: tabH },
    };
}

// Binding rows — one per action, stacked below the tabs
function getBindingRows() {
    const actions = Object.keys(BINDING_LABELS);
    const rowH  = 48;
    const rowGap = 8;
    const startY = 175;
    const rows = {};
    actions.forEach((action, i) => {
        rows[action] = {
            y:      startY + i * (rowH + rowGap),
            h:      rowH,
            // The clickable "key badge" on the right side
            btnX:   MENU_PANEL_W - menuBtnX() - 90,
            btnW:   86,
            btnH:   34,
        };
    });
    return rows;
}

function getSliderTrack() {
    return { x: menuBtnX(), y: canvas.height / 2 - 10, w: MENU_BTN_W, h: 10 };
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

    ctx.fillStyle = 'rgba(0, 0, 0, 0.60)';
    drawRoundRectLeft(0, 0, MENU_PANEL_W, canvas.height);
    ctx.fill();

    const buttons = getMainMenuButtons();

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
    if (pauseOptionsReturnState === gameState.PAUSED) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (mainMenuImage && mainMenuImage.complete && mainMenuImage.naturalWidth > 0) {
            ctx.drawImage(mainMenuImage, 0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = '#111';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }

    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    drawRoundRectLeft(0, 0, MENU_PANEL_W, canvas.height);
    ctx.fill();

    // Title
    ctx.save();
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.font         = 'bold 30px Arial';
    ctx.fillStyle    = '#fff';
    ctx.shadowColor  = 'rgba(0,0,0,0.9)';
    ctx.shadowBlur   = 10;
    ctx.fillText('Options', menuPanelCX(), 68);
    ctx.shadowBlur   = 0;
    ctx.restore();

    // Tabs
    drawOptionsTabs();

    // Tab content
    if (optionsTab === 'audio') {
        drawVolumeSlider();
    } else {
        drawBindingsTab();
    }

    // Back button (always at the bottom)
    drawMenuButton(getOptionsBackButton(), menuHoveredElement === 'back');

    resetCtxText();
}

function drawOptionsTabs() {
    const tabs = getOptionsTabs();
    for (const [key, tab] of Object.entries(tabs)) {
        const isActive  = optionsTab === key;
        const isHovered = menuHoveredElement === `tab_${key}`;

        ctx.fillStyle = isActive
            ? '#e8c84a'
            : isHovered ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.07)';
        drawRoundRect(tab.x, tab.y, tab.w, tab.h, 8);
        ctx.fill();

        ctx.strokeStyle = isActive ? '#f5d76e' : 'rgba(255,255,255,0.18)';
        ctx.lineWidth   = 1.5;
        drawRoundRect(tab.x, tab.y, tab.w, tab.h, 8);
        ctx.stroke();

        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';
        ctx.font         = isActive ? 'bold 16px Arial' : '16px Arial';
        ctx.fillStyle    = isActive ? '#1a1a1a' : '#e0e0e0';
        ctx.fillText(tab.label, tab.x + tab.w / 2, tab.y + tab.h / 2);
    }
}

// =============================================================
//  DRAW — AUDIO TAB
// =============================================================

function drawVolumeSlider() {
    const track   = getSliderTrack();
    const labelY  = track.y - 40;
    const fillW   = track.w * masterVolume;
    const hovered = menuHoveredElement === 'slider' || sliderDragging;

    ctx.save();
    ctx.textAlign    = 'left';
    ctx.textBaseline = 'middle';
    ctx.font         = '18px Arial';
    ctx.fillStyle    = '#ccc';
    ctx.fillText('Master Volume', menuBtnX(), labelY);
    ctx.textAlign    = 'right';
    ctx.fillStyle    = '#e8c84a';
    ctx.font         = 'bold 18px Arial';
    ctx.fillText(`${Math.round(masterVolume * 100)}%`, menuBtnX() + track.w, labelY);
    ctx.restore();

    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    drawRoundRect(track.x, track.y, track.w, track.h, 5);
    ctx.fill();

    if (fillW > 0) {
        ctx.fillStyle = hovered ? '#f5d76e' : '#e8c84a';
        drawRoundRect(track.x, track.y, fillW, track.h, 5);
        ctx.fill();
    }

    const thumbX = track.x + fillW;
    const thumbR = sliderDragging ? 11 : (hovered ? 10 : 8);
    ctx.beginPath();
    ctx.arc(thumbX, track.y + track.h / 2, thumbR, 0, Math.PI * 2);
    ctx.fillStyle   = '#fff';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur  = 8;
    ctx.fill();
    ctx.shadowBlur  = 0;

    ctx.fillStyle = 'rgba(255,255,255,0.30)';
    [0, 0.25, 0.5, 0.75, 1].forEach(t => {
        const tx = track.x + track.w * t;
        ctx.fillRect(tx - 1, track.y + track.h + 6, 2, 7);
    });
}

// =============================================================
//  DRAW — BINDINGS TAB
// =============================================================

function drawBindingsTab() {
    const rows = getBindingRows();

    for (const [action, row] of Object.entries(rows)) {
        const isListening = listeningForBinding === action;
        const isHovered   = menuHoveredElement === `bind_${action}`;
        const keyLabel    = prettyKey(keyBindings[action]);

        // Action label
        ctx.textAlign    = 'left';
        ctx.textBaseline = 'middle';
        ctx.font         = '17px Arial';
        ctx.fillStyle    = '#ccc';
        ctx.fillText(BINDING_LABELS[action], menuBtnX(), row.y + row.h / 2);

        // Key badge
        const bx = row.btnX;
        const by = row.y + (row.h - row.btnH) / 2;

        if (isListening) {
            // Pulsing "press a key" state
            ctx.fillStyle = 'rgba(232, 200, 74, 0.25)';
            drawRoundRect(bx, by, row.btnW, row.btnH, 6);
            ctx.fill();
            ctx.strokeStyle = '#e8c84a';
            ctx.lineWidth   = 2;
            drawRoundRect(bx, by, row.btnW, row.btnH, 6);
            ctx.stroke();
            ctx.textAlign    = 'center';
            ctx.textBaseline = 'middle';
            ctx.font         = 'bold 13px Arial';
            ctx.fillStyle    = '#e8c84a';
            ctx.fillText('...', bx + row.btnW / 2, by + row.btnH / 2);
        } else {
            ctx.fillStyle = isHovered ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.08)';
            drawRoundRect(bx, by, row.btnW, row.btnH, 6);
            ctx.fill();
            ctx.strokeStyle = isHovered ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)';
            ctx.lineWidth   = 1.5;
            drawRoundRect(bx, by, row.btnW, row.btnH, 6);
            ctx.stroke();
            ctx.textAlign    = 'center';
            ctx.textBaseline = 'middle';
            ctx.font         = 'bold 15px Arial';
            ctx.fillStyle    = isHovered ? '#fff' : '#e0e0e0';
            ctx.fillText(keyLabel, bx + row.btnW / 2, by + row.btnH / 2);
        }

        // Subtle divider between rows
        ctx.strokeStyle = 'rgba(255,255,255,0.07)';
        ctx.lineWidth   = 1;
        ctx.beginPath();
        ctx.moveTo(menuBtnX(), row.y + row.h + 4);
        ctx.lineTo(MENU_PANEL_W - menuBtnX(), row.y + row.h + 4);
        ctx.stroke();
    }

    // Hint text at bottom of list
    if (listeningForBinding) {
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';
        ctx.font         = '13px Arial';
        ctx.fillStyle    = 'rgba(255,255,255,0.45)';
        ctx.fillText('Press any key to rebind  •  Esc to cancel', menuPanelCX(), getBindingRows()[Object.keys(BINDING_LABELS).at(-1)].y + 60);
    }
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
        return null;
    }

    if (currentGameState === gameState.OPTIONS) {
        // Back button
        const back = getOptionsBackButton();
        if (x >= back.x && x <= back.x + back.w && y >= back.y && y <= back.y + back.h) return 'back';

        // Tab pills
        for (const [key, tab] of Object.entries(getOptionsTabs())) {
            if (x >= tab.x && x <= tab.x + tab.w && y >= tab.y && y <= tab.y + tab.h) return `tab_${key}`;
        }

        if (optionsTab === 'audio') {
            const track = getSliderTrack();
            const pad   = 16;
            if (x >= track.x - pad && x <= track.x + track.w + pad &&
                y >= track.y - pad && y <= track.y + track.h + pad) return 'slider';
        }

        if (optionsTab === 'bindings') {
            const rows = getBindingRows();
            for (const [action, row] of Object.entries(rows)) {
                const bx = row.btnX;
                const by = row.y + (row.h - row.btnH) / 2;
                if (x >= bx && x <= bx + row.btnW && y >= by && y <= by + row.btnH) return `bind_${action}`;
            }
        }
    }

    return null;
}

function xToVolume(mouseX) {
    const track = getSliderTrack();
    return Math.max(0, Math.min(1, (mouseX - track.x) / track.w));
}

// =============================================================
//  CLICK / INPUT HANDLERS
// =============================================================

function handleMenuButtonClick(key) {
    if (devMode) console.log(`Menu element clicked: ${key}`);

    // Tab switches
    if (key === 'tab_audio')    { optionsTab = 'audio';    listeningForBinding = null; return; }
    if (key === 'tab_bindings') { optionsTab = 'bindings'; listeningForBinding = null; return; }

    // Binding badge click — enter listen mode
    if (key.startsWith('bind_')) {
        listeningForBinding = key.slice(5); // strip 'bind_'
        return;
    }

    switch (key) {
        case 'endless':
            currentGameState = gameState.PLAYING;
            enemies = initializeEnemiesForLevel(currentLevel);
            break;
        case 'story':
            isStoryMode  = true;
            currentLevel = 1;
            enemies      = initializeEnemiesForLevel(currentLevel);
            // Show the first location transition screen before playing
            currentGameState = gameState.LOCATION_TRANSITION;
            break;
        case 'options':
            pauseOptionsReturnState = gameState.MAIN_MENU;
            currentGameState = gameState.OPTIONS;
            break;
        case 'back':
            listeningForBinding = null;
            currentGameState = pauseOptionsReturnState || gameState.MAIN_MENU;
            menuHoveredElement = null;
            break;
    }
}

// Called from the global keydown handler in input.js when OPTIONS is active
function handleBindingKeypress(code) {
    if (!listeningForBinding) return false;
    if (code === 'Escape') {
        listeningForBinding = null;
        return true;
    }
    // Don't allow binding to a key already used by another action
    const alreadyUsed = Object.entries(keyBindings).find(
        ([action, bound]) => bound === code && action !== listeningForBinding
    );
    if (alreadyUsed) {
        if (devMode) console.log(`${code} already bound to ${alreadyUsed[0]}, ignoring`);
        return true;
    }
    keyBindings[listeningForBinding] = code;
    if (devMode) console.log(`Rebound ${listeningForBinding} → ${code}`);
    listeningForBinding = null;
    return true;
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
    if (currentGameState !== gameState.OPTIONS || optionsTab !== 'audio') return;
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