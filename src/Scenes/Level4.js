class Level4 extends Phaser.Scene {
    constructor() {
        super("platformerScene4");
    }
 
    init() {
        this.ACCELERATION = 500;
        this.DRAG = 1600;
        this.physics.world.gravity.y = 500;
        this.JUMP_VELOCITY = -500;
        this.MAX_SPEED = 2000;
        this.PARTICLE_VELOCITY = 100;
        this.SCALE = 2.5;
        this.score = 0;
        this.hasEasterEgg = false;
        this.isAlive = true;
        this.wasOnGround = false;
        this.LEVEL_NUM = 4;
    }
 
    create() {
        this.map = this.add.tilemap("Project4Level4", 70, 70, 150, 25);
 
        this.tileset = this.map.addTilesetImage("Project3Tileset", "tilemap_tiles");
        this.kennyTileset = this.map.addTilesetImage("kenny_tilemap_packed", "kenny_tiles");
 
        this.groundLayer = this.map.createLayer("Tile Layer 1", [this.tileset, this.kennyTileset], 0, 0);
        this.groundLayer.setCollisionByProperty({ collides: true });
 
        // Coins
        this.coins = this.physics.add.staticGroup();
        this.map.getObjectLayer("Object Layer 1").objects
            .filter(obj => obj.name === "coin")
            .forEach(obj => {
                const coin = this.coins.create(obj.x, obj.y, "tilemap_sheet", 151);
                coin.setOrigin(0.5, 1).setScale(1.5).refreshBody();
            });
 
        // NPC
        this.npcs = this.physics.add.staticGroup();
        this.map.getObjectLayer("Object Layer 1").objects
            .filter(obj => obj.name === "NPC")
            .forEach(obj => {
                const npc = this.npcs.create(obj.x, obj.y, "tilemap_sheet", 120);
                npc.setOrigin(0.5, 1).setScale(this.SCALE).refreshBody();
            });
 
        this.eKey = this.input.keyboard.addKey('E');
        this.dialogueOpen = false;
        this.dialogueBox = null;
 
        // Easter egg
        this.easterEgg = this.physics.add.staticGroup();
        this.map.getObjectLayer("Object Layer 1").objects
            .filter(obj => obj.name === "EasterEgg")
            .forEach(obj => {
                const egg = this.easterEgg.create(obj.x, obj.y, "tilemap_sheet", 67);
                egg.setOrigin(0.5, 1).setScale(2).refreshBody();
            });
 
        // Flag
        this.flag = this.physics.add.staticGroup();
        this.map.getObjectLayer("Object Layer 1").objects
            .filter(obj => obj.name === "Flag")
            .forEach(obj => {
                const f = this.flag.create(obj.x, obj.y, "tilemap_sheet", 111);
                f.setOrigin(0.5, 1).setScale(3).refreshBody();
            });
 
        // Secret Flag
        this.secretFlag = this.physics.add.staticGroup();
        this.map.getObjectLayer("Object Layer 1").objects
            .filter(obj => obj.name === "SecretFlag")
            .forEach(obj => {
                const sf = this.secretFlag.create(obj.x, obj.y, "tilemap_sheet", 111);
                sf.setOrigin(0.5, 1).setScale(3).refreshBody();
            });
 
        // Patrol enemies
        this.enemies = this.physics.add.group();
        this.map.getObjectLayer("Object Layer 1").objects
            .filter(obj => obj.name === "Enemy")
            .forEach(obj => {
                const enemy = this.enemies.create(obj.x, obj.y, "tilemap_sheet", 145);
                enemy.setOrigin(0.5, 1).setScale(this.SCALE);
                const props = {};
                (obj.properties || []).forEach(p => props[p.name] = p.value);
                enemy.patrolStart = props.patrolStart ?? (obj.x - 200);
                enemy.patrolEnd   = props.patrolEnd   ?? (obj.x + 200);
                enemy.setVelocityX(80);
                enemy.body.immovable = true;
                enemy.enemyType = "patrol";
            });
 
        // Rusher enemies
        this.rushers = this.physics.add.group();
        this.map.getObjectLayer("Object Layer 1").objects
            .filter(obj => obj.name === "Enemy2")
            .forEach(obj => {
                const enemy = this.rushers.create(obj.x, obj.y, "tilemap_sheet", 147);
                enemy.setOrigin(0.5, 1).setScale(this.SCALE);
                const props = {};
                (obj.properties || []).forEach(p => props[p.name] = p.value);
                enemy.patrolStart = props.patrolStart ?? (obj.x - 150);
                enemy.patrolEnd   = props.patrolEnd   ?? (obj.x + 150);
                enemy.spawnX      = obj.x;
                enemy.spawnY      = obj.y;
                enemy.isCharging  = false;
                enemy.setVelocityX(40);
                enemy.body.immovable = true;
                enemy.enemyType = "rusher";
            });
 
        // Shooter enemies
        this.shooters = this.physics.add.group();
        this.projectiles = this.physics.add.group();
 
        this.map.getObjectLayer("Object Layer 1").objects
            .filter(obj => obj.name === "Enemy3")
            .forEach(obj => {
                const enemy = this.shooters.create(obj.x, obj.y, "tilemap_sheet", 149);
                enemy.setOrigin(0.5, 1).setScale(this.SCALE);
                enemy.body.immovable = true;
                enemy.body.allowGravity = false;
                enemy.enemyType = "shooter";
 
                this.time.addEvent({
                    delay: 2200,
                    loop: true,
                    callbackScope: this,
                    callback: () => {
                        if (!this.isAlive) return;
                        this.fireProjectile(enemy);
                    }
                });
            });
 
        // Colliders
        this.physics.add.collider(this.enemies,     this.groundLayer);
        this.physics.add.collider(this.rushers,     this.groundLayer);
        this.physics.add.collider(this.shooters,    this.groundLayer);
        this.physics.add.collider(this.projectiles, this.groundLayer, (proj) => proj.destroy());
 
        // set up player avatar
        my.sprite.player = this.physics.add.sprite(500, 1099, "platformer_characters", "tile_0000.png");
        my.sprite.player.setCollideWorldBounds(true);
        my.sprite.player.setScale(this.SCALE);
        my.sprite.player.setMaxVelocity(this.MAX_SPEED);
 
        // Player colliders & overlaps
        this.physics.add.collider(my.sprite.player, this.groundLayer);
 
        this.physics.add.overlap(my.sprite.player, this.coins,       this.collectCoin,       null, this);
        this.physics.add.overlap(my.sprite.player, this.easterEgg,   this.collectEasterEgg,  null, this);
        this.physics.add.overlap(my.sprite.player, this.flag,        this.reachFlag,          null, this);
        this.physics.add.overlap(my.sprite.player, this.secretFlag,  this.reachSecretFlag,    null, this);
        this.physics.add.overlap(my.sprite.player, this.enemies,     this.hitByEnemy,         null, this);
        this.physics.add.overlap(my.sprite.player, this.rushers,     this.hitByEnemy,         null, this);
        this.physics.add.overlap(my.sprite.player, this.shooters,    this.hitByEnemy,         null, this);
        this.physics.add.overlap(my.sprite.player, this.projectiles, this.hitByProjectile,    null, this);
 
        cursors = this.input.keyboard.createCursorKeys();
        this.rKey = this.input.keyboard.addKey('R');
 
        this.input.keyboard.on('keydown-D', () => {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true;
            this.physics.world.debugGraphic.clear();
        }, this);
 
        // VFX
        my.vfx.walking = this.add.particles(0, 0, "kenny-particles", {
            frame: ['smoke_03.png', 'smoke_09.png'],
            scale: {start: 0.03, end: 0.1},
            lifespan: 350,
            alpha: {start: 1, end: 0.1},
        });
        my.vfx.walking.stop();
 
        my.vfx.jumping = this.add.particles(0, 0, "kenny-particles", {
            frame: ["star_04.png", "star_05.png"],
            scale:    { start: 0.06, end: 0 },
            alpha:    { start: 1, end: 0 },
            lifespan: 400,
            speedX:   { min: -80, max: 80 },
            speedY:   { min: -100, max: -20 },
            quantity: 8,
            emitting: false,
        });
 
        // Audio
        this.sound.stopAll();
        this.bgm     = this.sound.add("bgm",  { loop: true, volume: 0.4 });
        this.sfxJump = this.sound.add("jump", { volume: 0.6 });
        this.sfxLand = this.sound.add("land", { volume: 0.5 });
        this.sfxCoin = this.sound.add("coin", { volume: 0.7 });
        this.sfxHit  = this.sound.add("hit",  { volume: 0.8 });
        this.sfxWin  = this.sound.add("win",  { volume: 0.8 });
        this.bgm.play();
 
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25);
        this.cameras.main.setDeadzone(50, 50);
        this.cameras.main.setZoom(0.75);
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
 
        this.scoreText = this.add.text(16, 16, "Score: 0", {
            fontSize: "18px", fill: "#ffffff",
            stroke: "#000000", strokeThickness: 4
        }).setScrollFactor(0).setDepth(10);
    }
 
    update() {
        const onGround = my.sprite.player.body.blocked.down;
 
        if (onGround && !this.wasOnGround) this.sfxLand.play();
        this.wasOnGround = onGround;
 
        if (cursors.left.isDown) {
            my.sprite.player.setAccelerationX(-this.ACCELERATION);
            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);
            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
            if (my.sprite.player.body.blocked.down) my.vfx.walking.start();
 
        } else if (cursors.right.isDown) {
            my.sprite.player.setAccelerationX(this.ACCELERATION);
            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);
            my.vfx.walking.setParticleSpeed(-this.PARTICLE_VELOCITY, 0);
            if (my.sprite.player.body.blocked.down) my.vfx.walking.start();
 
        } else {
            my.sprite.player.setAccelerationX(0);
            my.sprite.player.setDragX(this.DRAG);
            my.sprite.player.anims.play('idle');
            my.vfx.walking.stop();
        }
 
        if (!onGround) {
            my.sprite.player.anims.play("jump");
            my.vfx.walking.stop();
        }
 
        // Jump
        if (onGround && Phaser.Input.Keyboard.JustDown(cursors.up)) {
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
            this.sfxJump.play();
            my.vfx.jumping.explode(8, my.sprite.player.x, my.sprite.player.y + my.sprite.player.displayHeight / 2);
        }
 
        // NPC interaction
        if (Phaser.Input.Keyboard.JustDown(this.eKey) && !this.dialogueOpen) {
            this.npcs.getChildren().forEach(npc => {
                const dist = Phaser.Math.Distance.Between(my.sprite.player.x, my.sprite.player.y, npc.x, npc.y);
                if (dist < 120) this.showDialogue();
            });
        } else if (Phaser.Input.Keyboard.JustDown(this.eKey) && this.dialogueOpen) {
            this.closeDialogue();
        }
 
        // Enemy AI
        const RUSHER_DETECT_RANGE = 300;
        const RUSHER_CHARGE_SPEED = 320;
        const RUSHER_CHARGE_TIME  = 1200;
 
        this.enemies.getChildren().forEach(enemy => {
            if (enemy.x <= enemy.patrolStart) { enemy.setVelocityX(80);  enemy.resetFlip(); }
            else if (enemy.x >= enemy.patrolEnd) { enemy.setVelocityX(-80); enemy.setFlip(true, false); }
        });
 
        this.rushers.getChildren().forEach(enemy => {
            if (enemy.isCharging) return;
            const dist = Phaser.Math.Distance.Between(my.sprite.player.x, my.sprite.player.y, enemy.x, enemy.y);
            if (dist < RUSHER_DETECT_RANGE) {
                enemy.isCharging = true;
                const dir = my.sprite.player.x < enemy.x ? -1 : 1;
                enemy.setVelocityX(dir * RUSHER_CHARGE_SPEED);
                enemy.setFlip(dir > 0, false);
                this.time.delayedCall(RUSHER_CHARGE_TIME, () => {
                    if (!enemy.active) return;
                    enemy.setPosition(enemy.spawnX, enemy.spawnY);
                    enemy.setVelocityX(40);
                    enemy.resetFlip();
                    enemy.isCharging = false;
                });
            } else {
                if (enemy.x <= enemy.patrolStart) { enemy.setVelocityX(40);  enemy.resetFlip(); }
                else if (enemy.x >= enemy.patrolEnd) { enemy.setVelocityX(-40); enemy.setFlip(true, false); }
            }
        });
 
        this.projectiles.getChildren().forEach(p => {
            if (p.x < 0 || p.x > this.map.widthInPixels) p.destroy();
        });
 
        // Fall death
        if (my.sprite.player.y > this.map.heightInPixels + 100) this.playerDie();
 
        // Restart
        if (Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.bgm.stop();
            this.scene.restart();
        }
    }
 
    collectCoin(player, coin) {
        coin.destroy();
        this.score += 100;
        this.scoreText.setText("Score: " + this.score);
        this.sfxCoin.play();
        if (this.hasEasterEgg && this.score >= 2500) this.reachCheeseEnding();
    }
 
    collectEasterEgg(player, egg) {
        egg.destroy();
        this.hasEasterEgg = true;
        this.sfxCoin.play();
        const hint = this.add.text(player.x, player.y - 60, "✨ Secret found!", {
            fontSize: "14px", fill: "#ffe066", stroke: "#000", strokeThickness: 3
        }).setOrigin(0.5).setDepth(10);
        this.tweens.add({ targets: hint, y: hint.y - 40, alpha: 0, duration: 1500, onComplete: () => hint.destroy() });
    }
 
    hitByEnemy(player, enemy) {
        if (!this.isAlive) return;
        this.sfxHit.play();
        this.playerDie();
    }
 
    hitByProjectile(player, projectile) {
        projectile.destroy();
        if (!this.isAlive) return;
        this.sfxHit.play();
        this.playerDie();
    }
 
    reachFlag(player, flag) {
        if (!this.isAlive) return;
        this.isAlive = false;
        this.bgm.stop();
        this.sfxWin.play();
        GameState.unlock(this.LEVEL_NUM, "normalWin");
        player.setVelocity(0, 0);
        player.setAccelerationX(0);
        my.vfx.walking.stop();
        const msg = this.hasEasterEgg ? "✨ You found the secret!\nYOU WIN!\nScore: " + this.score : "YOU WIN!\nScore: " + this.score;
        this.showEndScreen(msg, "#ffffff");
    }
 
    reachSecretFlag(player, flag) {
        if (!this.isAlive) return;
        this.isAlive = false;
        this.bgm.stop();
        this.sfxWin.play();
        GameState.unlock(this.LEVEL_NUM, "wentHome");
        player.setVelocity(0, 0);
        player.setAccelerationX(0);
        my.vfx.walking.stop();
        const msg = this.hasEasterEgg ? "✨ You found the secret!\nYou went home!\nScore: " + this.score : "You went home!\nScore: " + this.score;
        this.showEndScreen(msg, "#aaddff");
    }
 
    reachCheeseEnding() {
        if (!this.isAlive) return;
        this.isAlive = false;
        this.bgm.stop();
        this.sfxWin.play();
        GameState.unlock(this.LEVEL_NUM, "treasureHunter");
        my.sprite.player.setVelocity(0, 0);
        my.sprite.player.setAccelerationX(0);
        my.vfx.walking.stop();
        this.showEndScreen("✨ A true treasure hunter!\nYou found the diamond\nand all the cheese bits!\nScore: " + this.score, "#ffe066");
    }
 
    playerDie() {
        if (!this.isAlive) return;
        this.isAlive = false;
        this.bgm.stop();
        my.sprite.player.setTint(0xff4444);
        my.sprite.player.setVelocity(0, -200);
        my.vfx.walking.stop();
        my.vfx.jumping.explode(16, my.sprite.player.x, my.sprite.player.y);
        this.time.delayedCall(900, () => { this.showEndScreen("YOU DIED\nScore: " + this.score, "#ff4444"); });
    }
 
    showDialogue() {
        this.dialogueOpen = true;
        const npcText = "You're almost at the core!\nThe cheese is so close...\nYou can do it!";
        const camW = this.cameras.main.width;
        const camH = this.cameras.main.height;
        this.dialogueBox = this.add.container(0, 0).setScrollFactor(0).setDepth(30);
        const bg = this.add.rectangle(camW / 2, camH - 100, camW - 40, 130, 0x000000, 0.85).setStrokeStyle(2, 0xffffff);
        const text = this.add.text(camW / 2, camH - 100, npcText, {
            fontSize: "16px", fill: "#ffffff", stroke: "#000000", strokeThickness: 3, align: "center"
        }).setOrigin(0.5);
        const prompt = this.add.text(camW / 2, camH - 45, "[E] Close", { fontSize: "12px", fill: "#aaaaaa" }).setOrigin(0.5);
        this.dialogueBox.add([bg, text, prompt]);
    }
 
    closeDialogue() {
        this.dialogueOpen = false;
        if (this.dialogueBox) { this.dialogueBox.destroy(); this.dialogueBox = null; }
    }
 
    showEndScreen(msg, color) {
        my.sprite.player.setVelocity(0, 0);
        my.sprite.player.setAccelerationX(0);
        my.sprite.player.body.allowGravity = false;
        this.MAX_SPEED = 0;
        const camW = this.cameras.main.width;
        const camH = this.cameras.main.height;
        const cx = camW / 2;
        const cy = camH / 2;
        this.add.rectangle(cx, cy, camW, camH, 0x000000, 0.7).setScrollFactor(0).setDepth(19);
        this.add.text(cx, cy, msg, {
            fontSize: "48px", fill: color, stroke: "#000000", strokeThickness: 6, align: "center"
        }).setOrigin(0.5).setScrollFactor(0).setDepth(20);
        this.add.text(cx, cy + 100, "Press R to return to title", {
            fontSize: "28px", fill: "#aaaaaa", stroke: "#000", strokeThickness: 4
        }).setOrigin(0.5).setScrollFactor(0).setDepth(20);
        this.input.keyboard.once("keydown-R", () => {
            this.MAX_SPEED = 2000;
            this.scene.start("titleScene");
        });
    }
 
    fireProjectile(shooter) {
        const dir = my.sprite.player.x < shooter.x ? -1 : 1;
        const proj = this.projectiles.create(
            shooter.x + dir * 20,
            shooter.y - shooter.displayHeight * 0.55,
            "tilemap_sheet", 133
        );
        proj.setScale(1.5);
        proj.setVelocityX(dir * 260);
        proj.body.allowGravity = false;
        proj.body.immovable = true;
    }
}