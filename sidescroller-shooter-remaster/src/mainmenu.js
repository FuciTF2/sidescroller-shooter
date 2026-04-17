// ============================================================
// mainmenu.js — Interactive main menu
// Depends on: globals.js, assets.js
// ============================================================

// Button layout — defined once, used by both draw and hit-test
const MENU_BUTTONS = {
    endless: { label: 'Endless',  x: 0, y: 0, w: 260, h: 64 },
    story:   { label: 'Story',    x: 0, y: 0, w: 260, h: 64 },
    options: { label: 'Options',  x: 0, y: 0, w: 260, h: 64 },
};

// Which button the mouse is currently hovering over (null = none)
let menuHoveredButton = null;

// Re-compute button positions based on current canvas size
function layoutMenuButtons() {
    const cx     = canvas.width  / 2;
    const startY = canvas.height / 2 - 20;
    const gap    = 84;

    MENU_BUTTONS.endless.x = cx - MENU_BUTTONS.endless.w / 2;
    MENU_BUTTONS.endless.y = startY;

    MENU_BUTTONS.story.x = cx - MENU_BUTTONS.story.w / 2;
    MENU_BUTTONS.story.y = startY + gap;

    MENU_BUTTONS.options.x = cx - MENU_BUTTONS.options.w / 2;
    MENU_BUTTONS.options.y = startY + gap * 2;
}

// Draw the full main menu screen
function drawMainMenu() {
    if (devMode) console.log('Drawing main menu');

    layoutMenuButtons();

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background — use the mainmenu image if loaded, else solid dark fill
    if (mainMenuImage && mainMenuImage.complete && mainMenuImage.naturalWidth > 0) {
        ctx.drawImage(mainMenuImage, 0, 0, canvas.width, canvas.height);
    } else {
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Semi-transparent dark panel behind buttons so they're always readable
    const panelW = 320;
    const panelH = 290;
    const panelX = canvas.width  / 2 - panelW / 2;
    const panelY = canvas.height / 2 - 40;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    roundRect(ctx, panelX, panelY, panelW, panelH, 16);
    ctx.fill();

    // Title
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.font         = 'bold 52px Arial';
    ctx.fillStyle    = '#fff';
    ctx.shadowColor  = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur   = 12;
    ctx.fillText('Bullet & Spite', canvas.width / 2, canvas.height / 2 - 110);
    ctx.shadowBlur   = 0;

    // Buttons
    for (const [key, btn] of Object.entries(MENU_BUTTONS)) {
        drawMenuButton(btn, menuHoveredButton === key);
    }

    ctx.textAlign    = 'left';
    ctx.textBaseline = 'alphabetic';
}

// Draw a single menu button
function drawMenuButton(btn, hovered) {
    const radius = 10;

    // Shadow
    ctx.shadowColor  = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur   = hovered ? 18 : 8;
    ctx.shadowOffsetY = hovered ? 4 : 2;

    // Fill
    if (hovered) {
        ctx.fillStyle = '#e8c84a';      // gold highlight on hover
    } else {
        ctx.fillStyle = 'rgba(30, 30, 30, 0.85)';
    }
    roundRect(ctx, btn.x, btn.y, btn.w, btn.h, radius);
    ctx.fill();

    // Border
    ctx.shadowBlur    = 0;
    ctx.shadowOffsetY = 0;
    ctx.strokeStyle   = hovered ? '#f5d76e' : 'rgba(255,255,255,0.18)';
    ctx.lineWidth     = hovered ? 2.5 : 1.5;
    roundRect(ctx, btn.x, btn.y, btn.w, btn.h, radius);
    ctx.stroke();

    // Label
    ctx.font         = hovered ? 'bold 26px Arial' : '24px Arial';
    ctx.fillStyle    = hovered ? '#1a1a1a' : '#f0f0f0';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(btn.label, btn.x + btn.w / 2, btn.y + btn.h / 2);
}

// Canvas roundRect helper (ctx.roundRect not available in all browsers)
function roundRect(ctx, x, y, w, h, r) {
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

// Returns which button key the point (x, y) is inside, or null
function getMenuButtonAtPoint(x, y) {
    for (const [key, btn] of Object.entries(MENU_BUTTONS)) {
        if (x >= btn.x && x <= btn.x + btn.w &&
            y >= btn.y && y <= btn.y + btn.h) {
            return key;
        }
    }
    return null;
}

// Handle a confirmed click on a button key
function handleMenuButtonClick(key) {
    if (devMode) console.log(`Menu button clicked: ${key}`);
    switch (key) {
        case 'endless':
            if (devMode) console.log('Starting Endless mode');
            currentGameState = gameState.PLAYING;
            enemies = initializeEnemiesForLevel(currentLevel);
            break;
        case 'story':
            if (devMode) console.log('Story mode clicked — not yet implemented');
            break;
        case 'options':
            if (devMode) console.log('Options clicked — not yet implemented');
            break;
    }
}

// Mouse move — update hover state (only active on main menu)
canvas.addEventListener('mousemove', (e) => {
    if (currentGameState !== gameState.MAIN_MENU) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top)  * scaleY;
    menuHoveredButton = getMenuButtonAtPoint(x, y);
    canvas.style.cursor = menuHoveredButton ? 'pointer' : 'default';
});

// Mouse click — fire button action (only active on main menu)
canvas.addEventListener('click', (e) => {
    if (currentGameState !== gameState.MAIN_MENU) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top)  * scaleY;
    const hit = getMenuButtonAtPoint(x, y);
    if (hit) handleMenuButtonClick(hit);
});