// ============================================================
// bullets.js — Bullet state, update, and rendering
// Depends on: globals.js, assets.js, enemy.js
// ============================================================

const bullets = [];
const bulletSpeed = 10;

function updateBullets() {
    bullets.forEach((bullet, bulletIndex) => {
        bullet.x += bullet.speed;

        if (bullet.x < 0 || bullet.x > canvas.width) {
            bullets.splice(bulletIndex, 1);
            return;
        }

        enemies.forEach((enemy, enemyIndex) => {
            if (!bullet.hitEnemies.includes(enemy) && detectCollision(bullet, enemy)) {
                enemy.health -= bullet.damage;
                bullet.hitEnemies.push(enemy);

                if (enemy.health <= 0) {
                    enemies.splice(enemyIndex, 1);
                }

                if (bullet.penetration > 0) {
                    bullet.penetration--;
                } else {
                    bullets.splice(bulletIndex, 1);
                }
            }
        });
    });
}

function drawBullets() {
    ctx.fillStyle = 'yellow';
    bullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
}

function checkBulletCollisions() {
    bullets.forEach((bullet, bulletIndex) => {
        enemies.forEach((enemy, enemyIndex) => {
            const extendedHitboxHeight = enemy.height * 2.25;

            if (
                bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + extendedHitboxHeight &&
                bullet.y + bullet.height > enemy.y
            ) {
                enemy.health -= bullet.damage;
                enemy.health = Math.max(enemy.health, 0);

                bullet.hitEnemies.push(enemyIndex);

                if (bullet.penetration <= 0) {
                    bullets.splice(bulletIndex, 1);
                }

                if (enemy.health === 0) {
                    enemies.splice(enemyIndex, 1);
                }
            }
        });
    });
}