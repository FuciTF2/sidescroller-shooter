// ============================================================
// bullets.js — Bullet state, update, and rendering
// Depends on: globals.js, enemy.js
// ============================================================

const bullets = [];
const bulletSpeed = 600; // px/sec (was 10px/frame * 60fps)

function updateBullets(delta) {
    // Iterate backwards so splicing doesn't skip entries
    for (let bi = bullets.length - 1; bi >= 0; bi--) {
        const bullet = bullets[bi];
        bullet.x += bullet.speed * delta;

        // Remove if off screen
        if (bullet.x < 0 || bullet.x > canvas.width) {
            bullets.splice(bi, 1);
            continue;
        }

        for (let ei = enemies.length - 1; ei >= 0; ei--) {
            const enemy = enemies[ei];

            // Skip enemies this bullet has already hit
            if (bullet.hitEnemies.includes(enemy)) continue;

            // Collision check — use drawnW/drawnH set by drawEnemy each frame
            // so the hitbox always matches the current visual size
            const sw = enemy.drawnW || enemy.width  * enemy.scale;
            const sh = enemy.drawnH || enemy.height * enemy.scale;
            const ex = enemy.x - sw / 2;
            const ey = enemy.y - sh / 2;
            const hit =
                bullet.x             < ex + sw &&
                bullet.x + bullet.width > ex    &&
                bullet.y             < ey + sh  &&
                bullet.y + bullet.height > ey;

            if (!hit) continue;

            // Deal damage
            enemy.health -= bullet.damage;
            enemy.health  = Math.max(enemy.health, 0);
            bullet.hitEnemies.push(enemy);

            if (enemy.health === 0) {
                enemies.splice(ei, 1);
            }

            // Penetration: each hit costs one pierce charge.
            // Standard / highDamage bullets have penetration = false (falsy → treat as 0).
            // Penetration ammo starts at 2, meaning it can hit 2 enemies before dying.
            if (!bullet.penetration) {
                // Non-penetrating: remove immediately on first hit
                bullets.splice(bi, 1);
                break; // bullet is gone, stop checking enemies
            } else {
                bullet.penetration--;
                if (bullet.penetration <= 0) {
                    bullets.splice(bi, 1);
                    break;
                }
                // Still has pierces left — continue to next enemy
            }
        }
    }
}

function drawBullets() {
    bullets.forEach(bullet => {
        // Penetration ammo glows cyan so the player can see the difference
        ctx.fillStyle = bullet.penetration ? '#00e5ff' : 'yellow';
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
}