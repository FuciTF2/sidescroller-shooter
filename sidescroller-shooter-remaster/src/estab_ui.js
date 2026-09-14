// ============================================================
// estab_ui.js — Shared button UI for all establishment screens
// Draws over the existing bg images. Handles mouse hover/click.
// Depends on: globals.js, establishments.js, graphics.js
// ============================================================

// --- Button state ---
let estabHoveredBtn = null; // key of currently hovered button

// --- Button definitions per screen ---
// Each button: { label, sublabel?, action, color? }
// Positions are calculated dynamically — see layoutEstabButtons()

function getEstabButtons() {
    switch (currentGameState) {

        case gameState.STORE_SCREEN: {
            const restock    = STORE_AMMO_RESTOCK[currentWeapon];
            const weapon     = WEAPONS[currentWeapon];
            const hasAmmo    = restock && restock.amount > 0;
            const ammoLabel  = hasAmmo ? `${weapon.name} Ammo  +${restock.amount}` : 'No ammo available';
            const ammoSub    = hasAmmo ? `${restock.price} $` : '';
            const sodaSub    = `${SODA.price} $`;
            return [
                { key: 'ammo',  label: ammoLabel,          sublabel: ammoSub, action: () => buyStoreAmmo(),   disabled: !hasAmmo },
                { key: 'soda',  label: `Soda  +${SODA.heal} HP`, sublabel: sodaSub, action: () => buySoda() },
                { key: 'leave', label: 'Leave',             sublabel: '',      action: () => exitEstablishment(), secondary: true },
            ];
        }

        case gameState.RESTAURANT_SCREEN:
            return [
                { key: 'm1',    label: meals.RED_FISH.name,      sublabel: `${meals.RED_FISH.cost} $  +${meals.RED_FISH.heal} HP`,   action: () => purchaseMeal(meals.RED_FISH) },
                { key: 'm2',    label: meals.BEEF_SOUP.name,     sublabel: `${meals.BEEF_SOUP.cost} $  +${meals.BEEF_SOUP.heal} HP`,  action: () => purchaseMeal(meals.BEEF_SOUP) },
                { key: 'm3',    label: meals.FRIED_PIRANHA.name, sublabel: `${meals.FRIED_PIRANHA.cost} $  Full heal`,               action: () => purchaseMeal(meals.FRIED_PIRANHA) },
                { key: 'leave', label: 'Leave',                  sublabel: '',                                                        action: () => exitEstablishment(), secondary: true },
            ];

        case gameState.ROBBERY_SCREEN:
            return [
                { key: 'rob',   label: 'Rob',  sublabel: '50/50 chance — +10 $', action: () => robEstablishment(), danger: true },
                { key: 'leave', label: 'Leave', sublabel: 'Walk away',            action: () => exitEstablishment(), secondary: true },
            ];

        case gameState.WEAPON_STORE_SCREEN:
            return [
                { key: 'pistol', label: 'Pistol',  sublabel: 'Free — Starter',                      action: () => purchaseWeapon('pistol') },
                { key: 'smg',    label: 'SMG',      sublabel: `${WEAPON_PRICES.smg} $  x${WEAPON_AMMO_BUNDLES.smg.amount} ammo`,    action: () => purchaseWeapon('smg') },
                { key: 'sniper', label: 'Sniper',   sublabel: `${WEAPON_PRICES.sniper} $  x${WEAPON_AMMO_BUNDLES.sniper.amount} ammo`, action: () => purchaseWeapon('sniper') },
                { key: 'devGun', label: 'Dev Gun',  sublabel: `${WEAPON_PRICES.devGun} $`,           action: () => purchaseWeapon('devGun') },
                { key: 'leave',  label: 'Leave',    sublabel: '',                                    action: () => exitEstablishment(), secondary: true },
            ];

        default:
            return [];
    }
}

// --- Layout ---
// Buttons stack vertically in a panel on the left side
const ESTAB_PANEL_X  = 40;
const ESTAB_PANEL_Y  = 160;
const ESTAB_BTN_W    = 300;
const ESTAB_BTN_H    = 58;
const ESTAB_BTN_GAP  = 14;

function getEstabBtnRect(index) {
    return {
        x: ESTAB_PANEL_X,
        y: ESTAB_PANEL_Y + index * (ESTAB_BTN_H + ESTAB_BTN_GAP),
        w: ESTAB_BTN_W,
        h: ESTAB_BTN_H,
    };
}

// --- Draw ---
function drawEstabUI() {
    const buttons = getEstabButtons();
    if (!buttons.length) return;

    // Panel background behind the button stack
    const panelH = buttons.length * (ESTAB_BTN_H + ESTAB_BTN_GAP) - ESTAB_BTN_GAP + 40;
    ctx.fillStyle = 'rgba(0,0,0,0.62)';
    drawEstabRR(ESTAB_PANEL_X - 20, ESTAB_PANEL_Y - 20, ESTAB_BTN_W + 40, panelH, 14);
    ctx.fill();

    // Screen title / flavour text
    drawEstabFlavour();

    // Wallet
    ctx.textAlign    = 'left';
    ctx.textBaseline = 'middle';
    ctx.font         = 'bold 16px Arial';
    ctx.fillStyle    = '#e8c84a';
    ctx.fillText(`Wallet: ${playerCurrency} $`, ESTAB_PANEL_X, ESTAB_PANEL_Y - 32);

    buttons.forEach((btn, i) => {
        const r       = getEstabBtnRect(i);
        const hovered = estabHoveredBtn === btn.key;
        const owned   = btn.key !== 'leave' && currentGameState === gameState.WEAPON_STORE_SCREEN
                        && weaponAmmo[btn.key] === Infinity;

        // Fill
        if (btn.secondary) {
            ctx.fillStyle = hovered ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.06)';
        } else if (btn.danger) {
            ctx.fillStyle = hovered ? 'rgba(220,60,60,0.55)' : 'rgba(180,40,40,0.35)';
        } else if (owned) {
            ctx.fillStyle = 'rgba(80,200,100,0.18)';
        } else {
            ctx.fillStyle = hovered ? 'rgba(232,200,74,0.25)' : 'rgba(255,255,255,0.10)';
        }
        drawEstabRR(r.x, r.y, r.w, r.h, 10);
        ctx.fill();

        // Border
        if (btn.danger) {
            ctx.strokeStyle = hovered ? '#ff6666' : 'rgba(200,60,60,0.6)';
        } else if (btn.secondary) {
            ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        } else if (owned) {
            ctx.strokeStyle = 'rgba(80,200,100,0.6)';
        } else {
            ctx.strokeStyle = hovered ? '#e8c84a' : 'rgba(255,255,255,0.2)';
        }
        ctx.lineWidth = hovered ? 2 : 1.5;
        drawEstabRR(r.x, r.y, r.w, r.h, 10);
        ctx.stroke();

        // Label
        ctx.textAlign    = 'left';
        ctx.textBaseline = 'middle';
        ctx.font         = `bold 18px Arial`;
        ctx.fillStyle    = btn.secondary ? 'rgba(255,255,255,0.55)'
                         : btn.danger    ? (hovered ? '#ffffff' : '#ffaaaa')
                         : owned         ? '#80c864'
                         :                 (hovered ? '#e8c84a' : '#ffffff');

        const label = owned ? `✓ ${btn.label}` : btn.label;
        ctx.fillText(label, r.x + 18, r.y + (btn.sublabel ? r.h / 2 - 9 : r.h / 2));

        // Sublabel
        if (btn.sublabel) {
            ctx.font      = '14px Arial';
            ctx.fillStyle = btn.secondary ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.5)';
            ctx.fillText(btn.sublabel, r.x + 18, r.y + r.h / 2 + 11);
        }
    });

    ctx.textAlign    = 'left';
    ctx.textBaseline = 'alphabetic';
}

// Flavour text / heading per screen
function drawEstabFlavour() {
    let lines = [];
    switch (currentGameState) {
        case gameState.STORE_SCREEN:
            lines = ['General Store'];
            break;
        case gameState.RESTAURANT_SCREEN:
            lines = ['Restaurant'];
            break;
        case gameState.ROBBERY_SCREEN:
            lines = ['The clerk seems like', 'a pushover.', 'Rob him?'];
            break;
        case gameState.WEAPON_STORE_SCREEN:
            lines = ['Weapon Shop'];
            break;
    }

    ctx.textAlign    = 'left';
    ctx.textBaseline = 'middle';
    const isRobbery  = currentGameState === gameState.ROBBERY_SCREEN;
    ctx.font         = isRobbery ? 'italic 22px Arial' : 'bold 28px Arial';
    ctx.fillStyle    = isRobbery ? 'rgba(255,220,100,0.9)' : '#ffffff';
    ctx.shadowColor  = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur   = 8;
    lines.forEach((line, i) => {
        ctx.fillText(line, ESTAB_PANEL_X, ESTAB_PANEL_Y - 80 + i * 28);
    });
    ctx.shadowBlur = 0;
}

function drawEstabRR(x, y, w, h, r) {
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

// --- Hit testing ---
function getEstabBtnAtPoint(x, y) {
    const buttons = getEstabButtons();
    for (let i = 0; i < buttons.length; i++) {
        const r = getEstabBtnRect(i);
        if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return buttons[i];
    }
    return null;
}

function isEstabScreen() {
    return [
        gameState.STORE_SCREEN,
        gameState.RESTAURANT_SCREEN,
        gameState.ROBBERY_SCREEN,
        gameState.WEAPON_STORE_SCREEN,
    ].includes(currentGameState);
}

function canvasEstabCoords(e) {
    const rect   = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
}

// --- Mouse events ---
canvas.addEventListener('mousemove', (e) => {
    if (!isEstabScreen()) return;
    const { x, y } = canvasEstabCoords(e);
    const hit = getEstabBtnAtPoint(x, y);
    estabHoveredBtn     = hit ? hit.key : null;
    canvas.style.cursor = hit ? 'pointer' : 'default';
});

canvas.addEventListener('click', (e) => {
    if (!isEstabScreen()) return;
    const { x, y } = canvasEstabCoords(e);
    const hit = getEstabBtnAtPoint(x, y);
    if (hit && !hit.disabled) hit.action();
});

// =============================================================
//  DEV MODE — establishment shortcut button mouse handling
// =============================================================

let devHoveredBtn = null; // key of hovered dev button (read by drawDevModeOverlay)

function getDevBtnAtPoint(x, y) {
    if (!devMode) return null;
    if (currentGameState !== gameState.PLAYING) return null;
    for (let i = 0; i < DEV_ESTAB_BTNS.length; i++) {
        const bx = getDevBtnX(i);
        if (x >= bx && x <= bx + DEV_BTN_W &&
            y >= DEV_BTN_Y && y <= DEV_BTN_Y + DEV_BTN_H) {
            return DEV_ESTAB_BTNS[i];
        }
    }
    return null;
}

canvas.addEventListener('mousemove', (e) => {
    if (currentGameState !== gameState.PLAYING || !devMode) {
        devHoveredBtn = null;
        return;
    }
    const rect   = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top)  * scaleY;
    const hit = getDevBtnAtPoint(x, y);
    devHoveredBtn       = hit ? hit.key : null;
    if (hit) canvas.style.cursor = 'pointer';
});

canvas.addEventListener('click', (e) => {
    if (currentGameState !== gameState.PLAYING || !devMode) return;
    const rect   = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top)  * scaleY;
    const hit = getDevBtnAtPoint(x, y);
    if (!hit) return;
    // Force the chosen establishment open
    selectedEstablishment = ESTABLISHMENTS[hit.estab.toUpperCase()] || hit.estab;
    establishmentUsed     = false;
    enemiesCleared        = true;
    enterEstablishment();
    if (devMode) console.log(`Dev shortcut: opened ${hit.estab}`);
});