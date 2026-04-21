// ============================================================
// dialog.js — Player walk-in + location entry dialog
// Depends on: globals.js, graphics.js (drawLocationTransition, drawPlayer)
// ============================================================

const TYPEWRITER_SPEED  = 28;    // ms per character
const SPEAKER_NAME      = 'Unknown'; // swap when character has a name

// Walk-in constants
const WALKIN_SPEED      = 220;   // px/sec — matches roughly player speed
const WALKIN_STOP_X     = 260;   // x position where the player stops
const WALKIN_STOP_Y     = 380;   // y position (mid-lower area, feels grounded)
const WALKIN_PAUSE_MS   = 500;   // ms to stand still before dialog appears

// --- State ---
let dialogLines      = [];
let dialogLineIndex  = 0;
let dialogCharIndex  = 0;
let dialogTimer      = 0;
let dialogDone       = false;

// Walk-in state
let walkInX         = 0;
let walkInPauseTimer = 0;  // counts down after reaching stop position
let walkInDone      = false;
let walkInFrame     = 0;   // sprite animation frame
let walkInFrameTimer = 0;  // ms accumulator for walk animation

const WALKIN_ANIM_SPEED = 80; // ms per frame during walk-in

// =============================================================
//  ENTRY POINT — called when location transition screen is dismissed
// =============================================================

function startLocationDialog() {
    const loc = getLocationForLevel(currentLevel);
    if (!loc || !loc.dialog || loc.dialog.length === 0) {
        spawnEnemiesAndPlay();
        return;
    }

    dialogLines      = loc.dialog;
    dialogLineIndex  = 0;
    dialogCharIndex  = 0;
    dialogTimer      = 0;
    dialogDone       = false;

    // Start walk-in
    walkInX          = -120;   // off left edge
    walkInPauseTimer = 0;
    walkInDone       = false;
    walkInFrame      = 0;
    walkInFrameTimer = 0;

    currentGameState = gameState.WALKING_IN;
}

// =============================================================
//  WALK-IN UPDATE
// =============================================================

function updateWalkIn(delta) {
    if (walkInDone) return;

    if (walkInX < WALKIN_STOP_X) {
        // Still walking — advance position
        walkInX += WALKIN_SPEED * delta;
        if (walkInX > WALKIN_STOP_X) walkInX = WALKIN_STOP_X;

        // Animate walk cycle
        walkInFrameTimer += delta * 1000;
        if (walkInFrameTimer >= WALKIN_ANIM_SPEED) {
            walkInFrameTimer -= WALKIN_ANIM_SPEED;
            walkInFrame = (walkInFrame + 1) % (player.totalFrames - 1);
        }
    } else {
        // Reached stop — idle frame, count down pause
        walkInFrame      = player.idleFrame;
        walkInPauseTimer += delta * 1000;
        if (walkInPauseTimer >= WALKIN_PAUSE_MS) {
            walkInDone       = true;
            currentGameState = gameState.DIALOG;
        }
    }
}

// =============================================================
//  WALK-IN DRAW
// =============================================================

function drawWalkIn() {
    // Game background — location screen is gone, player walks into the level
    drawBackground();

    drawWalkInPlayer(walkInX, WALKIN_STOP_Y, walkInFrame, true);
}

// Draw the player sprite at an arbitrary position/frame (used for walk-in)
function drawWalkInPlayer(x, y, frameX, facingRight) {
    if (!player.sprite) return;

    const maxScale  = 2;
    const minScale  = 0.5;
    const scale     = minScale + ((maxScale - minScale) * (y / canvas.height));
    const drawWidth  = player.width  * scale;
    const drawHeight = player.height * scale;

    ctx.save();
    if (!facingRight) {
        ctx.scale(-1, 1);
        ctx.drawImage(
            player.sprite,
            frameX * player.frameWidth, 0, player.frameWidth, player.frameHeight,
            -x - drawWidth, y, drawWidth, drawHeight
        );
    } else {
        ctx.drawImage(
            player.sprite,
            frameX * player.frameWidth, 0, player.frameWidth, player.frameHeight,
            x, y, drawWidth, drawHeight
        );
    }
    ctx.restore();
}

// =============================================================
//  DIALOG UPDATE
// =============================================================

function updateDialog(delta) {
    if (dialogDone) return;
    const line = dialogLines[dialogLineIndex] || '';
    if (dialogCharIndex < line.length) {
        dialogTimer += delta * 1000;
        while (dialogTimer >= TYPEWRITER_SPEED && dialogCharIndex < line.length) {
            dialogCharIndex++;
            dialogTimer -= TYPEWRITER_SPEED;
        }
    }
}

// Advance on Enter/Space/click
function advanceDialog() {
    const line = dialogLines[dialogLineIndex] || '';

    if (dialogCharIndex < line.length) {
        dialogCharIndex = line.length; // snap to end
        return;
    }

    dialogLineIndex++;
    dialogCharIndex  = 0;
    dialogTimer      = 0;

    if (dialogLineIndex >= dialogLines.length) {
        dialogDone = true;
        spawnEnemiesAndPlay();
    }
}

function spawnEnemiesAndPlay() {
    enemies = initializeEnemiesForLevel(currentLevel);
    currentGameState = gameState.PLAYING;
}

// =============================================================
//  DIALOG DRAW
// =============================================================

function drawDialog() {
    const loc = getLocationForLevel(currentLevel);
    if (!loc) return;

    // Background + standing player — use the same bg.png as gameplay
    drawBackground();
    drawWalkInPlayer(WALKIN_STOP_X, WALKIN_STOP_Y, player.idleFrame, true);

    const line       = dialogLines[dialogLineIndex] || '';
    const revealed   = line.slice(0, dialogCharIndex);
    const isLastLine = dialogLineIndex >= dialogLines.length - 1;
    const isFullyRead = dialogCharIndex >= line.length;

    // Dialog box
    const boxH = 160;
    const boxX = 60;
    const boxY = canvas.height - boxH - 40;
    const boxW = canvas.width - 120;

    ctx.fillStyle = 'rgba(8, 8, 12, 0.92)';
    drawDialogRoundRect(boxX, boxY, boxW, boxH, 12);
    ctx.fill();

    ctx.strokeStyle = 'rgba(232, 200, 74, 0.55)';
    ctx.lineWidth   = 2;
    drawDialogRoundRect(boxX, boxY, boxW, boxH, 12);
    ctx.stroke();

    // Speaker badge
    const badgeW = 160, badgeH = 32;
    const badgeX = boxX + 20;
    const badgeY = boxY - badgeH / 2 - 2;

    ctx.fillStyle = '#e8c84a';
    drawDialogRoundRect(badgeX, badgeY, badgeW, badgeH, 6);
    ctx.fill();

    ctx.textAlign    = 'left';
    ctx.textBaseline = 'middle';
    ctx.font         = 'bold 15px Arial';
    ctx.fillStyle    = '#1a1a1a';
    ctx.fillText(SPEAKER_NAME, badgeX + 14, badgeY + badgeH / 2);

    // Dialog text
    ctx.font         = '22px Arial';
    ctx.fillStyle    = '#f0f0f0';
    ctx.textBaseline = 'top';
    wrapDialogText(revealed, boxX + 28, boxY + 28, boxW - 56, 32);

    // Blinking prompt
    if (isFullyRead) {
        const promptText = isLastLine ? 'Press ENTER to play' : 'Press ENTER to continue';
        const pulse      = Math.sin(Date.now() / 350) > 0;
        ctx.textAlign    = 'right';
        ctx.textBaseline = 'middle';
        ctx.font         = 'bold 15px Arial';
        ctx.fillStyle    = pulse ? '#e8c84a' : 'rgba(232,200,74,0.4)';
        ctx.fillText(promptText, boxX + boxW - 20, boxY + boxH - 22);
    }

    // Line counter
    ctx.textAlign    = 'right';
    ctx.textBaseline = 'middle';
    ctx.font         = '13px Arial';
    ctx.fillStyle    = 'rgba(255,255,255,0.3)';
    ctx.fillText(`${dialogLineIndex + 1} / ${dialogLines.length}`, boxX + boxW - 20, boxY + 18);

    ctx.textAlign    = 'left';
    ctx.textBaseline = 'alphabetic';
}

// =============================================================
//  HELPERS
// =============================================================

function wrapDialogText(text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '', curY = y;
    for (const word of words) {
        const test = line ? line + ' ' + word : word;
        if (ctx.measureText(test).width > maxWidth && line) {
            ctx.fillText(line, x, curY);
            line = word;
            curY += lineHeight;
        } else {
            line = test;
        }
    }
    if (line) ctx.fillText(line, x, curY);
}

function drawDialogRoundRect(x, y, w, h, r) {
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

// Click also advances dialog
canvas.addEventListener('click', (e) => {
    if (currentGameState === gameState.DIALOG) advanceDialog();
});