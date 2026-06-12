class Credits extends Phaser.Scene {
    constructor() {
        super("creditsScene");
    }
 
    create() {
        const W = this.cameras.main.width;
        const H = this.cameras.main.height;
 
        // Background
        this.add.rectangle(W / 2, H / 2, W, H, 0x0a0a1a);
 
        // Stars
        for (let i = 0; i < 80; i++) {
            const x = Phaser.Math.Between(0, W);
            const y = Phaser.Math.Between(0, H);
            const r = Phaser.Math.FloatBetween(0.5, 2);
            this.add.circle(x, y, r, 0xffffff, Phaser.Math.FloatBetween(0.3, 1));
        }
 
        // Title
        this.add.text(W / 2, 55, "Credits", {
            fontSize: "38px", fill: "#ffe066",
            stroke: "#000000", strokeThickness: 6
        }).setOrigin(0.5);
 
        // Divider
        this.add.line(W / 2, 90, -200, 0, 200, 0, 0x4444aa, 1);
 
        const lines = [
            { label: "Game Design & Programming", value: "Daniel Tubman" },
            { label: "", value: "" },
            { label: "Game Engine", value: "Phaser" },
            { label: "Tileset", value: "Kenny — 1-Bit Platformer Pack" },
            { label: "Character Sprites", value: "Kenny — Platformer Characters" },
            { label: "Particle Effects", value: "Kenny — Particle Pack" },
            { label: "", value: "" },
            { label: "Music", value: "Mondamusic — Retro Arcade Game Music" },
            { label: "Sound Effects", value: "Brackeys Platformer Bundle" },
            { label: "", value: "" },
            { label: "Level Design Tool", value: "Tiled Map Editor" },
        ];
 
        let y = 130;
        lines.forEach(line => {
            if (!line.label && !line.value) {
                y += 12;
                return;
            }
            this.add.text(W / 2 - 20, y, line.label, {
                fontSize: "14px", fill: "#aaaaaa",
                align: "right"
            }).setOrigin(1, 0);
 
            this.add.text(W / 2 + 20, y, line.value, {
                fontSize: "14px", fill: "#ffffff",
                align: "left"
            }).setOrigin(0, 0);
 
            y += 24;
        });
 
        // Back button
        const backBtn = this.add.text(W / 2, H - 40, "[ Back to Title ]", {
            fontSize: "18px", fill: "#aaaaaa",
            stroke: "#000000", strokeThickness: 3
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
 
        backBtn.on("pointerover", () => backBtn.setStyle({ fill: "#ffffff" }));
        backBtn.on("pointerout",  () => backBtn.setStyle({ fill: "#aaaaaa" }));
        backBtn.on("pointerdown", () => this.scene.start("titleScene"));
    }
}
