class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }
 
    preload() {
        this.load.setPath("./assets/");
 
        // Load characters spritesheet
        this.load.atlas("platformer_characters", "tilemap-characters-packed.png", "tilemap-characters-packed.json");
 
        // Load tilemap information
        this.load.image("tilemap_tiles", "sheet.png");
        this.load.image("kenny_tiles", "tilemap_packed.png");
        this.load.tilemapTiledJSON("platformer-level-1", "Project3Map.tmj");
 
        // Particles
        this.load.multiatlas("kenny-particles", "kenny-particles.json");
 
        // Coin sprite (from kenny tilemap_packed)
        this.load.spritesheet("tilemap_sheet", "tilemap_packed.png", {
            frameWidth: 18,
            frameHeight: 18
        });
 
        // Audio (Brackeys Platformer Bundle)
        this.load.audio("jump", ["jump.wav"]);
        this.load.audio("coin", ["coin.wav"]);
        this.load.audio("hit",  ["hurt.wav"]);
        this.load.audio("win",  ["power_up.wav"]);
        this.load.audio("land", ["tap.wav"]);
        this.load.audio("bgm", ["mondamusic-retro-arcade-game-music-512837.mp3"]);    }
 
    create() {
        // Player animations
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNames('platformer_characters', {
                prefix: "tile_",
                start: 0,
                end: 1,
                suffix: ".png",
                zeroPad: 4
            }),
            frameRate: 15,
            repeat: -1
        });
 
        this.anims.create({
            key: 'idle',
            defaultTextureKey: "platformer_characters",
            frames: [{ frame: "tile_0000.png" }],
            repeat: -1
        });
 
        this.anims.create({
            key: 'jump',
            defaultTextureKey: "platformer_characters",
            frames: [{ frame: "tile_0001.png" }],
        });
 
        // Enemy animation
        this.anims.create({
            key: 'enemy_walk',
            frames: this.anims.generateFrameNames('platformer_characters', {
                prefix: "tile_",
                start: 10,
                end: 11,
                suffix: ".png",
                zeroPad: 4
            }),
            frameRate: 8,
            repeat: -1
        });
 
        this.scene.start("platformerScene");
    }
 
    update() {}
}