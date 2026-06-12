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
        this.add.text(W / 2, 45, "There's Cheese Up Here!", {
            fontSize: "36px", fill: "#ffe066",
            stroke: "#000000", strokeThickness: 6,
            align: "center"
        }).setOrigin(0.5);
 
        this.add.text(W / 2, 88, "Select a Level", {
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
 
        const cardW = 190;
        const cardH = 220;
        const totalW = cardW * 4 + 20 * 3;
        const startX = W / 2 - totalW / 2 + cardW / 2;
        const cardY = 290;
 
        for (let i = 0; i < 4; i++) {
            const levelNum = i + 1;
            const cx = startX + i * (cardW + 20);
            this.createLevelCard(cx, cardY, cardW, cardH, levelNum, levelNames[i]);
        }
 
        // Controls panel
        this.createControlsPanel(W, H);
 
        // Credits button
        const creditsBtn = this.add.text(W / 2, H - 30, "[ Credits ]", {
            fontSize: "16px", fill: "#aaaaaa",
            stroke: "#000000", strokeThickness: 3
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
 
        creditsBtn.on("pointerover", () => creditsBtn.setStyle({ fill: "#ffffff" }));
        creditsBtn.on("pointerout",  () => creditsBtn.setStyle({ fill: "#aaaaaa" }));
        creditsBtn.on("pointerdown", () => this.scene.start("creditsScene"));
    }
 
    createControlsPanel(W, H) {
        const panelW = 420;
        const panelH = 110;
        const cx = W / 2;
        const cy = H - 145;
 
        this.add.rectangle(cx, cy, panelW, panelH, 0x111130, 0.92)
            .setStrokeStyle(1, 0x4444aa);
 
        this.add.text(cx, cy - panelH / 2 + 14, "Controls", {
            fontSize: "13px", fill: "#ffe066",
            stroke: "#000000", strokeThickness: 3
        }).setOrigin(0.5);
 
        // Divider
        this.add.rectangle(cx, cy - panelH / 2 + 26, panelW - 28, 1, 0x4444aa);
 
        const controls = [
            ["← →",      "Move"],
            ["↑",         "Jump"],
            ["E",         "Talk to NPC"],
            ["R",         "Restart level"],
            ["D",         "Toggle debug"],
        ];
 
        // Two columns, each centered on its half of the panel
        const leftCX  = cx - panelW / 4 - 35;
        const rightCX = cx + panelW / 4 - 35;
        const gap = 8; // space between key label and description
 
        controls.forEach((pair, idx) => {
            const isRight = idx >= 3;
            const col     = isRight ? rightCX : leftCX;
            const row     = isRight ? idx - 3 : idx;
            const y       = cy - 18 + row * 22;
 
            // Key label — right-aligned to column center
            this.add.text(col - gap, y, pair[0], {
                fontSize: "13px", fill: "#ffe066"
            }).setOrigin(1, 0.5);
 
            // Description — left-aligned from column center
            this.add.text(col + gap, y, pair[1], {
                fontSize: "13px", fill: "#cccccc"
            }).setOrigin(0, 0.5);
        });
    }
 
    createLevelCard(cx, cy, cardW, cardH, levelNum, levelName) {
        const endings = GameState.get(levelNum);
 
        // Ending hints per level
        const hints = {
            1: [
                "Reach the flag at the end",
                "Find the path that leads back home",
                "Grab the diamond, then collect all cheese",
            ],
            2: [
                "Reach the flag at the end",
                "Find the path that leads back home",
                "Grab the diamond, then collect all cheese",
            ],
            3: [
                "Reach the flag at the end",
                "Find the path that leads back home",
                "Grab the diamond, then collect all cheese",
            ],
            4: [
                "Reach the flag at the end",
                "Find the path that leads back home",
                "Grab the diamond, then collect all cheese",
            ],
        };
 
        // Card background
        const bg = this.add.rectangle(cx, cy, cardW, cardH, 0x1a1a3a)
            .setStrokeStyle(2, 0x4444aa)
            .setInteractive({ useHandCursor: true });
 
        // Level name
        this.add.text(cx, cy - cardH / 2 + 16, levelName, {
            fontSize: "13px", fill: "#ffe066",
            stroke: "#000000", strokeThickness: 3,
            align: "center", wordWrap: { width: cardW - 10 }
        }).setOrigin(0.5);
 
        // Divider under title — positioned at card top + title height
        const dividerY = cy - cardH / 2 + 30;
        this.add.rectangle(cx, dividerY, cardW - 20, 1, 0x4444aa);
 
        // Ending checkboxes with hints
        const endingData = [
            { key: "normalWin",      label: "Normal Win" },
            { key: "wentHome",       label: "Went Home"  },
            { key: "treasureHunter", label: "Treasure Hunter" },
        ];
 
        const startY = cy - cardH / 2 + 44;
        const rowH   = 48;
 
        endingData.forEach((e, idx) => {
            const ey    = startY + idx * rowH;
            const found = endings[e.key];
            const icon  = found ? "✓" : "✗";
            const color = found ? "#66ff88" : "#ff6666";
 
            // Check icon
            this.add.text(cx - cardW / 2 + 10, ey, icon, {
                fontSize: "13px", fill: color,
                stroke: "#000000", strokeThickness: 2
            }).setOrigin(0, 0);
 
            // Ending label
            this.add.text(cx - cardW / 2 + 24, ey, e.label, {
                fontSize: "12px", fill: found ? "#ccffcc" : "#dddddd",
                fontStyle: found ? "normal" : "normal"
            }).setOrigin(0, 0);
 
            // Hint text
            this.add.text(cx - cardW / 2 + 24, ey + 16, hints[levelNum][idx], {
                fontSize: "10px", fill: "#888888",
                wordWrap: { width: cardW - 36 }
            }).setOrigin(0, 0);
        });
 
        // Hover highlight
        bg.on("pointerover", () => bg.setFillStyle(0x2a2a5a));
        bg.on("pointerout",  () => bg.setFillStyle(0x1a1a3a));
 
        // Click to start level
        bg.on("pointerdown", () => {
            const sceneKeys = {
                1: "platformerScene1",
                2: "platformerScene2",
                3: "platformerScene3",
                4: "platformerScene4",
            };
            this.scene.start(sceneKeys[levelNum]);
        });
    }
}