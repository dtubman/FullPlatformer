class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
    }

    init() {
        // variables and settings
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
    }

    create() {
        this.map = this.add.tilemap("platformer-level-1", 70, 70, 150, 25);

        // Add a tileset to the map
        // First parameter: name we gave the tileset in Tiled
        // Second parameter: key for the tilesheet (from this.load.image in Load.js)
        this.tileset = this.map.addTilesetImage("Project3Tileset", "tilemap_tiles");
        this.kennyTileset = this.map.addTilesetImage("kenny_tilemap_packed", "kenny_tiles");

        // Create a layer
        this.groundLayer = this.map.createLayer("Tile Layer 1", [this.tileset, this.kennyTileset], 0, 0);

        // Make it collidable
        this.groundLayer.setCollisionByProperty({
            collides: true
        });

        //Coins
        this.coins = this.physics.add.staticGroup();
        this.map.getObjectLayer("Object Layer 1").objects
            .filter(obj => obj.name === "coin")
            .forEach(obj => {
                const coin = this.coins.create(obj.x, obj.y, "tilemap_sheet", 151);
                coin.setOrigin(0.5, 1).setScale(1.5).refreshBody();
            });

        //Easter egg
        this.easterEgg = this.physics.add.staticGroup();
        this.map.getObjectLayer("Object Layer 1").objects
            .filter(obj => obj.name === "EasterEgg")
            .forEach(obj => {
                const egg = this.easterEgg.create(obj.x, obj.y, "tilemap_sheet", 67);
                egg.setOrigin(0.5, 1).setScale(2).refreshBody();
            });
        
        //Flag
        this.flag = this.physics.add.staticGroup();
        this.map.getObjectLayer("Object Layer 1").objects
            .filter(obj => obj.name === "Flag")
            .forEach(obj => {
                const f = this.flag.create(obj.x, obj.y, "tilemap_sheet", 111);
                f.setOrigin(0.5, 1).setScale(3).refreshBody();
            });

        //Enemies
        this.enemies = this.physics.add.group();
        this.map.getObjectLayer("Object Layer 1").objects
            .filter(obj => obj.name === "Enemy")
            .forEach(obj => {
                const enemy = this.enemies.create(
                obj.x, obj.y, "tilemap_sheet", 145
                );
                enemy.setOrigin(0.5, 1).setScale(this.SCALE);
                const props = {};
                (obj.properties || []).forEach(p => props[p.name] = p.value);
                enemy.patrolStart = props.patrolStart ?? (obj.x - 200);
                enemy.patrolEnd   = props.patrolEnd   ?? (obj.x + 200);
                enemy.setVelocityX(80);
                enemy.body.immovable = true;
            });
        
        // set up player avatar
        my.sprite.player = this.physics.add.sprite(500, 1099, "platformer_characters", "tile_0000.png");
        my.sprite.player.setCollideWorldBounds(true);
        my.sprite.player.setScale(this.SCALE);
        my.sprite.player.setMaxVelocity(this.MAX_SPEED);

        // Enable collision handling
        this.physics.add.collider(my.sprite.player, this.groundLayer);
        
        this.physics.add.collider(this.enemies, this.groundLayer);

        this.physics.add.overlap(my.sprite.player, this.coins,     this.collectCoin,     null, this);
        this.physics.add.overlap(my.sprite.player, this.easterEgg, this.collectEasterEgg, null, this);
        this.physics.add.overlap(my.sprite.player, this.flag,      this.reachFlag,        null, this);
        this.physics.add.overlap(my.sprite.player, this.enemies,   this.hitByEnemy,       null, this);

        // set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();

        this.rKey = this.input.keyboard.addKey('R');

        // debug key listener (assigned to D key)
        this.input.keyboard.on('keydown-D', () => {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
            this.physics.world.debugGraphic.clear()
        }, this);

        // movement vfx

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

        //Audio
        this.sound.stopAll();
        this.bgm   = this.sound.add("bgm",  { loop: true, volume: 0.4 });
        this.sfxJump = this.sound.add("jump", { volume: 0.6 });
        this.sfxLand = this.sound.add("land", { volume: 0.5 });
        this.sfxCoin = this.sound.add("coin", { volume: 0.7 });
        this.sfxHit  = this.sound.add("hit",  { volume: 0.8 });
        this.sfxWin  = this.sound.add("win",  { volume: 0.8 });
        this.bgm.play();

        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25); // (target, [,roundPixels][,lerpX][,lerpY])
        this.cameras.main.setDeadzone(50, 50);
        this.cameras.main.setZoom(0.75);
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

        
        //Score text
        this.scoreText = this.add.text(16, 16, "Score: 0", {
            fontSize: "18px",
            fill: "#ffffff",
            stroke: "#000000",
            strokeThickness: 4
        }).setScrollFactor(0).setDepth(10);
    }

    update() {


        const onGround = my.sprite.player.body.blocked.down;

        if (onGround && !this.wasOnGround) this.sfxLand.play();
        this.wasOnGround = onGround;

        if(cursors.left.isDown) {
            my.sprite.player.setAccelerationX(-this.ACCELERATION);
            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);

            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            // Only play smoke effect if touching the ground

            if (my.sprite.player.body.blocked.down) {

                my.vfx.walking.start();

            }

        } else if(cursors.right.isDown) {
            my.sprite.player.setAccelerationX(this.ACCELERATION);
            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);
            
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);

            my.vfx.walking.setParticleSpeed(-this.PARTICLE_VELOCITY, 0);

            // Only play smoke effect if touching the ground

            if (my.sprite.player.body.blocked.down) {

                my.vfx.walking.start();

            }

        } else {
            // Set acceleration to 0 and have DRAG take over
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
            my.vfx.jumping.explode(8,
                my.sprite.player.x,
                my.sprite.player.y + my.sprite.player.displayHeight / 2);
        }
 
        // Enemy patrol
        this.enemies.getChildren().forEach(enemy => {
            if (enemy.x <= enemy.patrolStart) {
                enemy.setVelocityX(80);
                enemy.resetFlip();
            } else if (enemy.x >= enemy.patrolEnd) {
                enemy.setVelocityX(-80);
                enemy.setFlip(true, false);
            }
        });
 
        // Fall death
        if (my.sprite.player.y > this.map.heightInPixels + 100) {
            this.playerDie();
        }
 
        // Mid-game restart
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
    }
 
    collectEasterEgg(player, egg) {
        egg.destroy();
        this.hasEasterEgg = true;
        this.sfxCoin.play();
 
        const hint = this.add.text(player.x, player.y - 60, "✨ Secret found!", {
            fontSize: "14px", fill: "#ffe066",
            stroke: "#000", strokeThickness: 3
        }).setOrigin(0.5).setDepth(10);
 
        this.tweens.add({
            targets: hint, y: hint.y - 40, alpha: 0,
            duration: 1500, onComplete: () => hint.destroy()
        });
    }
 
    hitByEnemy(player, enemy) {
        if (!this.isAlive) return;
        this.sfxHit.play();
        this.playerDie();
    }
 
    reachFlag(player, flag) {
        if (!this.isAlive) return;
        this.isAlive = false;
        this.bgm.stop();
        this.sfxWin.play();
 
        player.setVelocity(0, 0);
        player.setAccelerationX(0);
        my.vfx.walking.stop();
 
        const msg = this.hasEasterEgg
            ? "✨ You found the secret!\nYOU WIN!\nScore: " + this.score
            : "YOU WIN!\nScore: " + this.score;
 
        this.showEndScreen(msg, "#ffffff");
    }
 
    playerDie() {
        if (!this.isAlive) return;
        this.isAlive = false;
        this.bgm.stop();
 
        my.sprite.player.setTint(0xff4444);
        my.sprite.player.setVelocity(0, -200);
        my.vfx.walking.stop();
        my.vfx.jumping.explode(16, my.sprite.player.x, my.sprite.player.y);
 
        this.time.delayedCall(900, () => {
            this.showEndScreen("YOU DIED\nScore: " + this.score, "#ff4444");
        });
    }
 
    showEndScreen(msg, color) {
        // Freeze the player completely
        my.sprite.player.setVelocity(0, 0);
        my.sprite.player.setAccelerationX(0);
        my.sprite.player.body.allowGravity = false;
        this.MAX_SPEED = 0;
 
        // Pin everything to the camera using setScrollFactor(0)
        // so position is in screen space, not world space
        const camW = this.cameras.main.width;
        const camH = this.cameras.main.height;
        const cx = camW / 2;
        const cy = camH / 2;
 
        this.add.rectangle(cx, cy, camW, camH, 0x000000, 0.7)
            .setScrollFactor(0)
            .setDepth(19);
 
        this.add.text(cx, cy, msg, {
            fontSize: "48px", fill: color,
            stroke: "#000000", strokeThickness: 6, align: "center"
        }).setOrigin(0.5).setScrollFactor(0).setDepth(20);
 
        this.add.text(cx, cy + 100, "Press R to play again", {
            fontSize: "28px", fill: "#aaaaaa",
            stroke: "#000", strokeThickness: 4
        }).setOrigin(0.5).setScrollFactor(0).setDepth(20);
 
        this.input.keyboard.once("keydown-R", () => {
            this.MAX_SPEED = 2000;
            this.scene.restart();
        });
    }
}