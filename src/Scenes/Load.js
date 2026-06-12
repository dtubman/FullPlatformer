class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }
 
    preload() {
        this.load.setPath("./assets/");
 
        // Load characters spritesheet
        this.load.atlas("platformer_characters", "tilemap-characters-packed.png", "tilemap-characters-packed.json");
 
        // Load tilemap information
        this.load.image("kenny_tiles", "tilemap_packed.png");
        this.load.image("tilemap_tiles",        "sheet.png");
        this.load.image("tilemap_tiles_snow",   "sheet_snow.png");
        this.load.image("tilemap_tiles_purple", "sheet_purple.png");
        this.load.image("tilemap_tiles_cake",   "sheet_cake.png");

 
        // Load each level's map
        this.load.tilemapTiledJSON("Project4Level1", "Project4Level1.tmj");
        this.load.tilemapTiledJSON("Project4Level2", "Project4Level2.tmj");
        this.load.tilemapTiledJSON("Project4Level3", "Project4Level3.tmj");
        this.load.tilemapTiledJSON("Project4Level4", "Project4Level4.tmj");
        
 
        // Particles
        this.load.multiatlas("kenny-particles", "kenny-particles.json");
 
        // Tilemap spritesheet (coins, enemies, flags etc.)
        this.load.spritesheet("tilemap_sheet", "tilemap_packed.png", {
            frameWidth: 18,
            frameHeight: 18
        });
 
        // Audio
        this.load.audio("jump", ["jump.wav"]);
        this.load.audio("coin", ["coin.wav"]);
        this.load.audio("hit",  ["hurt.wav"]);
        this.load.audio("win",  ["power_up.wav"]);
        this.load.audio("land", ["tap.wav"]);
        this.load.audio("bgm",  ["mondamusic-retro-arcade-game-music-512837.mp3"]);
    }
 
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
 
        // Go to title screen once everything is loaded
        this.scene.start("titleScene");
    }
 
    update() {}
}