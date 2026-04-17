// ============================================================
// cheats.js — In-game cheat console (open with C key)
// Depends on: globals.js, player.js, enemy.js, establishments.js
// ============================================================

const cheatConsole = document.createElement('input');
cheatConsole.type = 'text';
cheatConsole.style.position  = 'absolute';
cheatConsole.style.bottom    = '10px';
cheatConsole.style.left      = '50%';
cheatConsole.style.transform = 'translateX(-50%)';
cheatConsole.style.width     = '300px';
cheatConsole.style.zIndex    = 10;
cheatConsole.style.display   = 'none';
document.body.appendChild(cheatConsole);

cheatConsole.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const command = cheatConsole.value.trim().toLowerCase();
        processCheatCode(command);
        cheatConsole.value = '';
    }
});

function processCheatCode(command) {
    switch (command.toLowerCase()) {
        case 'god':
            player.health = Infinity;
            if (devMode) console.log('God mode activated!');
            break;
        case 'infiniteammo':
            bullets.length = Infinity;
            if (devMode) console.log('Infinite ammo activated!');
            break;
        case 'nextlevel':
            if (devMode) console.log('Next level cheat code activated!');
            triggerLevelChange();
            break;
        case 'killall':
            enemies = [];
            if (devMode) console.log('All enemies killed!');
            break;
        case 'fastshoot':
            player.shootCooldown = 2;
            if (devMode) console.log('Shoot cooldown set to 2!');
            break;
        case 'ammo':
            activateInfiniteAmmoTypes();
            if (devMode) console.log('Infinite ammo types activated!');
            break;
        case 'money':
            addCurrency(1000);
            if (devMode) console.log('Added 1000 currency!');
            break;
        case 'devmode':
            devMode = !devMode;
            if (devMode) console.log(`Dev mode ${devMode ? 'enabled' : 'disabled'}`);
            break;
        default:
            if (devMode) console.log('Unknown cheat code!');
    }
}

function activateInfiniteAmmoTypes() {
    ammoInventory.highDamage  = Infinity;
    ammoInventory.penetration = Infinity;
    if (devMode) console.log('Infinite ammo activated for high damage and penetration ammo.');
}