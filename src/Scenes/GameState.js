// GameState.js
// Tracks which endings have been found per level, in memory only.
 
const GameState = {
    // Each level tracks the three endings independently
    levels: {
        1: { normalWin: false, wentHome: false, treasureHunter: false },
        2: { normalWin: false, wentHome: false, treasureHunter: false },
        3: { normalWin: false, wentHome: false, treasureHunter: false },
        4: { normalWin: false, wentHome: false, treasureHunter: false },
    },
 
    unlock(levelNum, ending) {
        if (this.levels[levelNum]) {
            this.levels[levelNum][ending] = true;
        }
    },
 
    get(levelNum) {
        return this.levels[levelNum] || { normalWin: false, wentHome: false, treasureHunter: false };
    }
};