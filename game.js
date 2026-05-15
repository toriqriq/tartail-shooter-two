// Game Configuration
const CONFIG = {
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 600,
  PLAYER_SIZE: 40,
  ENEMY_SIZE: 35,
  PROJECTILE_SIZE: 8,
  PLAYER_SPEED: 7,
  ENEMY_SPEED: 2,
  PROJECTILE_SPEED: 4,
  ENEMY_SPAWN_RATE: 2000,
  MAX_ENEMIES: 4,
  AUTO_SHOOT_INTERVAL: 30, // Frames between shots (reduced fire rate)
  HEAVY_ENEMY_SPAWN_RATE: 5000, // Heavier enemy spawn rate
};

// Game State
const gameState = {
  weapon: "dual",
  armor: "tank",
  energy: "damage",
  playerHP: 100,
  playerDamage: 1,
  playerDefense: 0,
  score: 0,
  isRunning: false,
  mouseX: CONFIG.CANVAS_WIDTH / 2,
  mouseY: CONFIG.CANVAS_HEIGHT - 100,
  isTouch: false,
  pointerActive: false,
  lastPointerX: null,
  lastPointerY: null,
  touchDeltaX: 0,
  touchDeltaY: 0,
};

// Classes
class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = CONFIG.PLAYER_SIZE;
    this.height = CONFIG.PLAYER_SIZE;
    this.vx = 0;
    this.vy = 0;
  }

  update(mouseX, mouseY) {
    if (gameState.isTouch && gameState.pointerActive) {
      this.x += gameState.touchDeltaX;
      this.y += gameState.touchDeltaY;
      gameState.touchDeltaX = 0;
      gameState.touchDeltaY = 0;
    } else {
      // Get target position from mouse
      const targetX = mouseX;
      const targetY = mouseY;

      // Smooth movement towards target
      const dx = targetX - (this.x + this.width / 2);
      const dy = targetY - (this.y + this.height / 2);
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 5) {
        const moveX = (dx / distance) * CONFIG.PLAYER_SPEED;
        const moveY = (dy / distance) * CONFIG.PLAYER_SPEED;

        this.x += moveX;
        this.y += moveY;
      }
    }

    // Boundary check
    this.x = Math.max(0, Math.min(this.x, CONFIG.CANVAS_WIDTH - this.width));
    this.y = Math.max(0, Math.min(this.y, CONFIG.CANVAS_HEIGHT - this.height));
  }

  draw(ctx) {
    // Draw player plane (simple triangle)
    ctx.fillStyle = "#00ff00";
    ctx.beginPath();
    ctx.moveTo(this.x + this.width / 2, this.y); // Top point
    ctx.lineTo(this.x, this.y + this.height); // Bottom left
    ctx.lineTo(this.x + this.width, this.y + this.height); // Bottom right
    ctx.closePath();
    ctx.fill();

    // Draw cockpit
    ctx.fillStyle = "#ffff00";
    ctx.beginPath();
    ctx.arc(
      this.x + this.width / 2,
      this.y + this.height / 3,
      3,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  shoot() {
    const projectiles = [];
    const baseDamage = gameState.playerDamage;

    if (gameState.weapon === "dual") {
      // Dual shot - 2 projectiles
      projectiles.push(
        new Projectile(this.x + 10, this.y, baseDamage),
        new Projectile(this.x + this.width - 10, this.y, baseDamage),
      );
    } else if (gameState.weapon === "heavy") {
      // Heavy shot - 1 projectile with 2x damage
      projectiles.push(
        new Projectile(this.x + this.width / 2, this.y, baseDamage * 2),
      );
    }

    // Apply regen if armor is regen
    if (gameState.armor === "regen" && gameState.playerHP < 100) {
      gameState.playerHP = Math.min(gameState.playerHP + 1, 100);
    }

    return projectiles;
  }
}

class Enemy {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = CONFIG.ENEMY_SIZE;
    this.height = CONFIG.ENEMY_SIZE;
    this.vx = Math.random() - 0.5;
    this.vy = CONFIG.ENEMY_SPEED;
    this.hp = 1;
    this.shootTimer = 0;
    this.shootInterval = Math.random() * 30 + 30;
  }

  update() {
    this.x += this.vx * CONFIG.ENEMY_SPEED;
    this.y += this.vy;

    // Boundary check
    if (this.x < 0 || this.x + this.width > CONFIG.CANVAS_WIDTH) {
      this.vx *= -1;
    }

    this.shootTimer++;
  }

  draw(ctx) {
    // Draw enemy plane (inverted triangle)
    ctx.fillStyle = "#ff0000";
    ctx.beginPath();
    ctx.moveTo(this.x + this.width / 2, this.y + this.height); // Bottom point
    ctx.lineTo(this.x, this.y); // Top left
    ctx.lineTo(this.x + this.width, this.y); // Top right
    ctx.closePath();
    ctx.fill();

    // Draw cockpit
    ctx.fillStyle = "#ffff00";
    ctx.beginPath();
    ctx.arc(
      this.x + this.width / 2,
      this.y + this.height / 3,
      2,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Draw HP bar
    ctx.fillStyle = "#ff0000";
    ctx.fillRect(this.x, this.y - 10, this.width, 3);
  }

  shoot() {
    if (this.shootTimer >= this.shootInterval) {
      this.shootTimer = 0;
      this.shootInterval = Math.random() * 30 + 30;
      return new EnemyProjectile(this.x + this.width / 2, this.y + this.height);
    }
    return null;
  }

  takeDamage(damage) {
    this.hp -= damage;
    return this.hp <= 0;
  }
}

class HeavyEnemy {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = CONFIG.ENEMY_SIZE + 15; // Slightly larger
    this.height = CONFIG.ENEMY_SIZE + 15;
    this.vx = (Math.random() - 0.5) * 0.3; // Much slower movement
    this.vy = CONFIG.ENEMY_SPEED * 0.5; // Slower downward movement
    this.hp = 5; // Requires 5 shots to destroy
    this.shootTimer = 0;
    this.shootInterval = Math.random() * 40 + 60; // Shoots slower too
  }

  update() {
    this.x += this.vx * CONFIG.ENEMY_SPEED;
    this.y += this.vy;

    // Boundary check
    if (this.x < 0 || this.x + this.width > CONFIG.CANVAS_WIDTH) {
      this.vx *= -1;
    }

    this.shootTimer++;
  }

  draw(ctx) {
    // Draw heavy enemy plane (larger inverted triangle with thicker body)
    ctx.fillStyle = "#ff4444";
    ctx.beginPath();
    ctx.moveTo(this.x + this.width / 2, this.y + this.height); // Bottom point
    ctx.lineTo(this.x, this.y); // Top left
    ctx.lineTo(this.x + this.width, this.y); // Top right
    ctx.closePath();
    ctx.fill();

    // Draw outer armor ring
    ctx.strokeStyle = "#ff9900";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(this.x + this.width / 2, this.y + this.height);
    ctx.lineTo(this.x, this.y);
    ctx.lineTo(this.x + this.width, this.y);
    ctx.closePath();
    ctx.stroke();

    // Draw cockpit
    ctx.fillStyle = "#ffff00";
    ctx.beginPath();
    ctx.arc(
      this.x + this.width / 2,
      this.y + this.height / 3,
      4,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Draw HP bar (show 5 segments for HP 5)
    const segmentWidth = this.width / 5;
    for (let i = 0; i < this.hp; i++) {
      ctx.fillStyle = "#00ff00";
      ctx.fillRect(this.x + i * segmentWidth, this.y - 12, segmentWidth - 2, 5);
    }
  }

  shoot() {
    if (this.shootTimer >= this.shootInterval) {
      this.shootTimer = 0;
      this.shootInterval = Math.random() * 40 + 60;
      return new EnemyProjectile(this.x + this.width / 2, this.y + this.height);
    }
    return null;
  }

  takeDamage(damage) {
    this.hp -= damage;
    return this.hp <= 0;
  }
}
class Projectile {
  constructor(x, y, damage) {
    this.x = x;
    this.y = y;
    this.width = CONFIG.PROJECTILE_SIZE;
    this.height = CONFIG.PROJECTILE_SIZE;
    this.damage = damage;
    this.vy = -CONFIG.PROJECTILE_SPEED;
  }

  update() {
    this.y += this.vy;
  }

  draw(ctx) {
    ctx.fillStyle = "#ffff00";
    ctx.fillRect(this.x - this.width / 2, this.y, this.width, this.height);
  }

  isOffScreen() {
    return this.y < 0;
  }
}

class EnemyProjectile {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = CONFIG.PROJECTILE_SIZE;
    this.height = CONFIG.PROJECTILE_SIZE;
    this.damage = 10;
    this.vy = CONFIG.PROJECTILE_SPEED;
  }

  update() {
    this.y += this.vy;
  }

  draw(ctx) {
    ctx.fillStyle = "#ff6600";
    ctx.fillRect(this.x - this.width / 2, this.y, this.width, this.height);
  }

  isOffScreen() {
    return this.y > CONFIG.CANVAS_HEIGHT;
  }
}

// Game Manager
class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.player = null;
    this.enemies = [];
    this.heavyEnemies = [];
    this.playerProjectiles = [];
    this.enemyProjectiles = [];
    this.enemySpawnTimer = 0;
    this.heavyEnemySpawnTimer = 0;
    this.shootTimer = 0;
    this.shootInterval = 10;

    this.setupEventListeners();
  }

  setupEventListeners() {
    const canvas = this.canvas;

    // Pointer move works for mouse and touch on the game canvas
    canvas.addEventListener("pointermove", (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;

      if (e.pointerType === "touch" || e.pointerType === "pen") {
        if (gameState.pointerActive && gameState.lastPointerX !== null) {
          gameState.touchDeltaX = x - gameState.lastPointerX;
          gameState.touchDeltaY = y - gameState.lastPointerY;
        }
        gameState.lastPointerX = x;
        gameState.lastPointerY = y;
        gameState.isTouch = true;
      } else {
        gameState.mouseX = x;
        gameState.mouseY = y;
      }
    });

    // Pointer down to start drag or touch swipe
    canvas.addEventListener("pointerdown", (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;

      if (e.pointerType === "touch" || e.pointerType === "pen") {
        gameState.pointerActive = true;
        gameState.lastPointerX = x;
        gameState.lastPointerY = y;
        gameState.touchDeltaX = 0;
        gameState.touchDeltaY = 0;
        gameState.isTouch = true;
      } else {
        gameState.mouseX = x;
        gameState.mouseY = y;
        gameState.isTouch = false;
      }
    });

    canvas.addEventListener("pointerup", () => {
      gameState.pointerActive = false;
      gameState.touchDeltaX = 0;
      gameState.touchDeltaY = 0;
      gameState.lastPointerX = null;
      gameState.lastPointerY = null;
    });

    canvas.addEventListener("pointercancel", () => {
      gameState.pointerActive = false;
      gameState.touchDeltaX = 0;
      gameState.touchDeltaY = 0;
      gameState.lastPointerX = null;
      gameState.lastPointerY = null;
    });
  }

  init(weapon, armor, energy) {
    gameState.weapon = weapon;
    gameState.armor = armor;
    gameState.energy = energy;
    gameState.playerHP = 100;
    gameState.playerDamage = 1;
    gameState.playerDefense = 0;
    gameState.score = 0;
    gameState.isRunning = true;

    // Apply energy boost
    if (energy === "damage") {
      gameState.playerDamage += 1;
    } else if (energy === "defense") {
      gameState.playerDefense += 1;
    }

    this.player = new Player(
      CONFIG.CANVAS_WIDTH / 2 - 20,
      CONFIG.CANVAS_HEIGHT - 80,
    );
    this.enemies = [];
    this.heavyEnemies = [];
    this.playerProjectiles = [];
    this.enemyProjectiles = [];
    this.enemySpawnTimer = 0;
    this.heavyEnemySpawnTimer = 0;
    this.shootTimer = 0;
  }

  playerShoot() {
    const projectiles = this.player.shoot();
    this.playerProjectiles.push(...projectiles);
  }

  spawnEnemy() {
    if (this.enemies.length < CONFIG.MAX_ENEMIES) {
      const x = Math.random() * (CONFIG.CANVAS_WIDTH - CONFIG.ENEMY_SIZE);
      this.enemies.push(new Enemy(x, -CONFIG.ENEMY_SIZE));
    }
  }

  spawnHeavyEnemy() {
    const x = Math.random() * (CONFIG.CANVAS_WIDTH - (CONFIG.ENEMY_SIZE + 15));
    this.heavyEnemies.push(new HeavyEnemy(x, -CONFIG.ENEMY_SIZE - 15));
  }

  update() {
    if (!gameState.isRunning) return;

    // Update player dengan posisi mouse/touch
    this.player.update(gameState.mouseX, gameState.mouseY);

    // Auto-shoot
    this.shootTimer++;
    if (this.shootTimer >= CONFIG.AUTO_SHOOT_INTERVAL) {
      this.playerShoot();
      this.shootTimer = 0;
    }

    // Update player projectiles
    for (let i = this.playerProjectiles.length - 1; i >= 0; i--) {
      this.playerProjectiles[i].update();
      if (this.playerProjectiles[i].isOffScreen()) {
        this.playerProjectiles.splice(i, 1);
      }
    }

    // Spawn enemies
    this.enemySpawnTimer++;
    if (this.enemySpawnTimer >= CONFIG.ENEMY_SPAWN_RATE / 30) {
      this.spawnEnemy();
      this.enemySpawnTimer = 0;
    }

    // Spawn heavy enemies
    this.heavyEnemySpawnTimer++;
    if (this.heavyEnemySpawnTimer >= CONFIG.HEAVY_ENEMY_SPAWN_RATE / 30) {
      this.spawnHeavyEnemy();
      this.heavyEnemySpawnTimer = 0;
    }

    // Update enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      enemy.update();

      // Enemy shoot
      const enemyProjectile = enemy.shoot();
      if (enemyProjectile) {
        this.enemyProjectiles.push(enemyProjectile);
      }

      // Check enemy off screen
      if (enemy.y > CONFIG.CANVAS_HEIGHT) {
        this.enemies.splice(i, 1);
        continue;
      }

      // Check collision with player projectiles
      for (let j = this.playerProjectiles.length - 1; j >= 0; j--) {
        const projectile = this.playerProjectiles[j];
        if (this.checkCollision(projectile, enemy)) {
          if (enemy.takeDamage(projectile.damage)) {
            this.enemies.splice(i, 1);
            gameState.score += 10;
          }
          this.playerProjectiles.splice(j, 1);
          break;
        }
      }
    }

    // Update heavy enemies
    for (let i = this.heavyEnemies.length - 1; i >= 0; i--) {
      const enemy = this.heavyEnemies[i];
      enemy.update();

      // Enemy shoot
      const enemyProjectile = enemy.shoot();
      if (enemyProjectile) {
        this.enemyProjectiles.push(enemyProjectile);
      }

      // Check enemy off screen
      if (enemy.y > CONFIG.CANVAS_HEIGHT) {
        this.heavyEnemies.splice(i, 1);
        continue;
      }

      // Check collision with player projectiles
      for (let j = this.playerProjectiles.length - 1; j >= 0; j--) {
        const projectile = this.playerProjectiles[j];
        if (this.checkCollision(projectile, enemy)) {
          if (enemy.takeDamage(projectile.damage)) {
            this.heavyEnemies.splice(i, 1);
            gameState.score += 50; // Heavy enemy gives more points
          }
          this.playerProjectiles.splice(j, 1);
          break;
        }
      }
    }
    for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
      this.enemyProjectiles[i].update();
      if (this.enemyProjectiles[i].isOffScreen()) {
        this.enemyProjectiles.splice(i, 1);
        continue;
      }

      // Check collision with player
      if (this.checkCollision(this.enemyProjectiles[i], this.player)) {
        let damage = this.enemyProjectiles[i].damage;
        damage -= gameState.playerDefense;
        damage = Math.max(1, damage);

        gameState.playerHP -= damage;
        this.enemyProjectiles.splice(i, 1);

        if (gameState.playerHP <= 0) {
          gameState.isRunning = false;
          this.showGameOver();
        }
      }
    }
  }

  draw() {
    // Clear canvas
    this.ctx.fillStyle = "rgba(26, 26, 46, 0.1)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw starfield effect
    this.ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
    for (let i = 0; i < 5; i++) {
      const x = Math.random() * this.canvas.width;
      const y = Math.random() * this.canvas.height;
      this.ctx.fillRect(x, y, 1, 1);
    }

    // Draw game objects
    this.player.draw(this.ctx);

    this.enemies.forEach((enemy) => enemy.draw(this.ctx));
    this.heavyEnemies.forEach((enemy) => enemy.draw(this.ctx));
    this.playerProjectiles.forEach((projectile) => projectile.draw(this.ctx));
    this.enemyProjectiles.forEach((projectile) => projectile.draw(this.ctx));
  }

  checkCollision(obj1, obj2) {
    return (
      obj1.x < obj2.x + obj2.width &&
      obj1.x + obj1.width > obj2.x &&
      obj1.y < obj2.y + obj2.height &&
      obj1.y + obj1.height > obj2.y
    );
  }

  showGameOver() {
    document.getElementById("gameScreen").classList.remove("active");
    document.getElementById("gameOverScreen").classList.add("active");
    document.getElementById("finalScore").textContent = gameState.score;
  }

  gameLoop() {
    this.update();
    this.draw();
    requestAnimationFrame(() => this.gameLoop());
  }
}

// Initialize game
const canvas = document.getElementById("gameCanvas");
const game = new Game(canvas);

// Menu handlers
document.getElementById("startBtn").addEventListener("click", () => {
  const weapon = document.querySelector('input[name="weapon"]:checked').value;
  const armor = document.querySelector('input[name="armor"]:checked').value;
  const energy = document.querySelector('input[name="energy"]:checked').value;

  game.init(weapon, armor, energy);

  document.getElementById("menuScreen").classList.remove("active");
  document.getElementById("gameScreen").classList.add("active");
  document.getElementById("gameOverScreen").classList.remove("active");

  updateGameInfo();
  game.gameLoop();
});

document.getElementById("menuBtn").addEventListener("click", () => {
  gameState.isRunning = false;
  document.getElementById("gameScreen").classList.remove("active");
  document.getElementById("gameOverScreen").classList.remove("active");
  document.getElementById("menuScreen").classList.add("active");
});

document.getElementById("restartBtn").addEventListener("click", () => {
  document.getElementById("gameOverScreen").classList.remove("active");
  document.getElementById("menuScreen").classList.add("active");
});

// Update game info display
function updateGameInfo() {
  document.getElementById("playerHP").textContent = gameState.playerHP;
  document.getElementById("damageDisplay").textContent = gameState.playerDamage;
  document.getElementById("defenseDisplay").textContent =
    gameState.playerDefense;
  document.getElementById("weaponDisplay").textContent =
    gameState.weapon === "dual" ? "Dual Shot" : "Heavy Shot";
  document.getElementById("score").textContent = gameState.score;
}

// Update display every frame
setInterval(() => {
  if (gameState.isRunning) {
    document.getElementById("playerHP").textContent = gameState.playerHP;
    document.getElementById("score").textContent = gameState.score;
  }
}, 50);
