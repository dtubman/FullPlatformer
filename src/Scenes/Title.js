class Title extends Phaser.Scene {
    constructor() {
        super("titleScene");
    }
 
    create() {
        const W = this.cameras.main.width;
        const H = this.cameras.main.height;
 
        // Background
        this.add.rectangle(W / 2, H / 2, W, H, 0x0a0a1a);
 
        // Stars background decoration
        for (let i = 0; i < 80; i++) {
            const x = Phaser.Math.Between(0, W);
            const y = Phaser.Math.Between(0, H);
            const r = Phaser.Math.FloatBetween(0.5, 2);
            this.add.circle(x, y, r, 0xffffff, Phaser.Math.FloatBetween(0.3, 1));
        }
 
        // Title
        this.add.text(W / 2, 60, "There's Cheese Up Here!", {
            fontSize: "36px", fill: "#ffe066",
            stroke: "#000000", strokeThickness: 6,
            align: "center"
        }).setOrigin(0.5);
 
        this.add.text(W / 2, 105, "Select a Level", {
            fontSize: "18px", fill: "#aaaaaa",
            stroke: "#000000", strokeThickness: 3
        }).setOrigin(0.5);
 
        // Level cards
        const levelNames = [
            "Level 1: The Surface",
            "Level 2: The Caves",
            "Level 3: The Deep",
            "Level 4: The Core",
        ];
 
        const cardW = 180;
        const cardH = 140;
        const startX = W / 2 - (cardW * 2 + 30) + cardW / 2 - 15;
        const cardY = 240;
 
        for (let i = 0; i < 4; i++) {
            const levelNum = i + 1;
            const cx = startX + i * (cardW + 20);
            this.createLevelCard(cx, cardY, cardW, cardH, levelNum, levelNames[i]);
        }
 
        // Credits button
        const creditsBtn = this.add.text(W / 2, H - 40, "[ Credits ]", {
            fontSize: "18px", fill: "#aaaaaa",
            stroke: "#000000", strokeThickness: 3
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
 
        creditsBtn.on("pointerover", () => creditsBtn.setStyle({ fill: "#ffffff" }));
        creditsBtn.on("pointerout",  () => creditsBtn.setStyle({ fill: "#aaaaaa" }));
        creditsBtn.on("pointerdown", () => this.scene.start("creditsScene"));
    }
 
    createLevelCard(cx, cy, cardW, cardH, levelNum, levelName) {
        const endings = GameState.get(levelNum);
 
        // Card background
        const bg = this.add.rectangle(cx, cy, cardW, cardH, 0x1a1a3a)
            .setStrokeStyle(2, 0x4444aa)
            .setInteractive({ useHandCursor: true });
 
        // Level name
        this.add.text(cx, cy - cardH / 2 + 18, levelName, {
            fontSize: "13px", fill: "#ffe066",
            stroke: "#000000", strokeThickness: 3,
            align: "center", wordWrap: { width: cardW - 10 }
        }).setOrigin(0.5);
 
        // Divider
        this.add.line(cx, cy - cardH / 2 + 32, -cardW / 2 + 10, 0, cardW / 2 - 10, 0, 0x4444aa);
 
        // Ending checkboxes
        const endingData = [
            { key: "normalWin",      label: "Normal Win" },
            { key: "wentHome",       label: "Went Home"  },
            { key: "treasureHunter", label: "Treasure Hunter" },
        ];
 
        endingData.forEach((e, idx) => {
            const ey = cy - 10 + idx * 26;
            const found = endings[e.key];
            const icon  = found ? "✓" : "✗";
            const color = found ? "#66ff88" : "#ff6666";
 
            this.add.text(cx - cardW / 2 + 14, ey, icon, {
                fontSize: "13px", fill: color,
                stroke: "#000000", strokeThickness: 2
            }).setOrigin(0, 0.5);
 
            this.add.text(cx - cardW / 2 + 30, ey, e.label, {
                fontSize: "12px", fill: found ? "#ccffcc" : "#888888"
            }).setOrigin(0, 0.5);
        });
 
        // Hover highlight
        bg.on("pointerover", () => bg.setFillColor(0x2a2a5a));
        bg.on("pointerout",  () => bg.setFillColor(0x1a1a3a));
 
        // Click to start level
        bg.on("pointerdown", () => {
            // Each level uses its own scene key — update these to match yours
            const sceneKeys = {
                1: "platformerScene",   // Level1.js
                2: "platformerScene2",  // Level2.js  ← rename your scene keys (see note)
                3: "platformerScene3",  // Level3.js
                4: "platformerScene4",  // Level4.js
            };
            this.scene.start(sceneKeys[levelNum]);
        });
    }
}