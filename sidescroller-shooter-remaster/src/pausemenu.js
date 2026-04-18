// ============================================================
// pausemenu.js — Pause menu overlay
// Depends on: globals.js, mainmenu.js (drawRoundRect, drawMenuButton helpers)
// ============================================================

// --- Layout ---
const PAUSE_BTN_W   = 260;
const PAUSE_BTN_H   = 60;
const PAUSE_BTN_GAP = 18;
const PAUSE_PANEL_W = 340;
const PAUSE_PANEL_H = 320;

let pauseHoveredButton = null;

// =============================================================
//  LAYOUT HELPER
// =============================================================

function getPauseMenuLayout() {
    const panelX = canvas.width  / 2 - PAUSE_PANEL_W / 2;
    const panelY = canvas.height / 2 - PAUSE_PANEL_H / 2;
    const btnX   = canvas.width  / 2 - PAUSE_BTN_W  / 2;

    // Title sits 44px from the top of the panel, buttons fill the rest
    const titleY  = panelY + 54;
    const btnStartY = panelY + 108;

    return {
        panelX, panelY,
        titleY,
        resume:   { label: 'Resume',    x: btnX, y: btnStartY,                                      w: PAUSE_BTN_W, h: PAUSE_BTN_H },
        options:  { label: 'Options',   x: btnX, y: btnStartY + (PAUSE_BTN_H + PAUSE_BTN_GAP),     w: PAUSE_BTN_W, h: PAUSE_BTN_H },
        mainMenu: { label: 'Main Menu', x: btnX, y: btnStartY + (PAUSE_BTN_H + PAUSE_BTN_GAP) * 2, w: PAUSE_BTN_W, h: PAUSE_BTN_H },
    };
}

// =============================================================
//  DRAW
// =============================================================

function drawPauseMenu() {
    const layout = getPauseMenuLayout();

    // Dim overlay over the frozen game
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Panel
    ctx.fillStyle = 'rgba(15, 15, 15, 0.92)';
    drawRoundRect(layout.panelX, layout.panelY, PAUSE_PANEL_W, PAUSE_PANEL_H, 16);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.10)';
    ctx.lineWidth   = 1.5;
    drawRoundRect(layout.panelX, layout.panelY, PAUSE_PANEL_W, PAUSE_PANEL_H, 16);
    ctx.stroke();

    // Title
    ctx.save();
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.font         = 'bold 32px Arial';
    ctx.fillStyle    = '#ffffff';
    ctx.shadowColor  = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur   = 10;
    ctx.fillText('Paused', canvas.width / 2, layout.titleY);
    ctx.shadowBlur   = 0;
    ctx.restore();

    // Buttons
    for (const [key, btn] of Object.entries(layout)) {
        if (typeof btn !== 'object' || !btn.label) continue;
        drawPauseButton(btn, pauseHoveredButton === key);
    }

    resetCtxText();
}

// Pause menu uses the same visual style as the main menu buttons
// but centred text instead of left-aligned
function drawPauseButton(btn, hovered) {
    ctx.shadowColor   = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur    = hovered ? 18 : 8;
    ctx.shadowOffsetY = hovered ? 4 : 2;
    ctx.fillStyle     = hovered ? '#e8c84a' : 'rgba(40, 40, 40, 0.90)';
    drawRoundRect(btn.x, btn.y, btn.w, btn.h, 10);
    ctx.fill();

    ctx.shadowBlur    = 0;
    ctx.shadowOffsetY = 0;
    ctx.strokeStyle   = hovered ? '#f5d76e' : 'rgba(255,255,255,0.12)';
    ctx.lineWidth     = hovered ? 2.5 : 1.5;
    drawRoundRect(btn.x, btn.y, btn.w, btn.h, 10);
    ctx.stroke();

    ctx.font         = hovered ? 'bold 22px Arial' : '22px Arial';
    ctx.fillStyle    = hovered ? '#1a1a1a' : '#f0f0f0';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(btn.label, btn.x + btn.w / 2, btn.y + btn.h / 2);
}

// =============================================================
//  HIT TESTING
// =============================================================

function getPauseButtonAtPoint(x, y) {
    const layout = getPauseMenuLayout();
    for (const [key, btn] of Object.entries(layout)) {
        if (typeof btn !== 'object' || !btn.label) continue;
        if (x >= btn.x && x <= btn.x + btn.w &&
            y >= btn.y && y <= btn.y + btn.h) return key;
    }
    return null;
}

function canvasCoordsFromEvent(e) {
    const rect   = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
}

// =============================================================
//  CLICK HANDLER
// =============================================================

function handlePauseButtonClick(key) {
    if (devMode) console.log(`Pause menu clicked: ${key}`);
    switch (key) {
        case 'resume':
            togglePause();
            break;
        case 'options':
            // Remember we came from pause so the back button returns here
            pauseOptionsReturnState = gameState.PAUSED;
            currentGameState = gameState.OPTIONS;
            break;
        case 'mainMenu':
            resetGame();
            currentGameState = gameState.MAIN_MENU;
            break;
    }
}

// =============================================================
//  CANVAS EVENT LISTENERS
// =============================================================

canvas.addEventListener('mousemove', (e) => {
    if (currentGameState !== gameState.PAUSED) return;
    const { x, y } = canvasCoordsFromEvent(e);
    pauseHoveredButton  = getPauseButtonAtPoint(x, y);
    canvas.style.cursor = pauseHoveredButton ? 'pointer' : 'default';
});

canvas.addEventListener('click', (e) => {
    if (currentGameState !== gameState.PAUSED) return;
    const { x, y } = canvasCoordsFromEvent(e);
    const hit = getPauseButtonAtPoint(x, y);
    if (hit) handlePauseButtonClick(hit);
});