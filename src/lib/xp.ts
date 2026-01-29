export interface LevelInfo {
    level: number;
    currentXP: number;
    nextLevelXP: number;
    progress: number;
    totalXPForCurrentLevel: number;
    totalXPForNextLevel: number;
}

/**
 * Level formula:
 * Levels 1-5: Linear scaling (Easy) -> 100 XP per level approx
 * Levels 5+: Exponential scaling (Hard)
 */
export function calculateLevel(xp: number): LevelInfo {
    let level = 1;
    let currentLevelXP = 0;
    let xpForNextLevel = 100; // Base requirement for Lvl 1->2

    // Iterative calculation to handle the custom curve
    // This is safe because max level isn't infinitely high in practice, usually < 100
    while (true) {
        let xpNeeded = 0;
        if (level < 5) {
            // Easy Mode: 100 * level (100, 200, 300, 400)
            xpNeeded = 100 * level;
        } else {
            // Hard Mode: Previous * 1.5 multiplier (Exponential)
            // Lvl 5->6: 600
            // Lvl 6->7: 900
            // Lvl 7->8: 1350
            xpNeeded = Math.floor(500 * Math.pow(1.5, level - 5));
        }

        if (xp < currentLevelXP + xpNeeded) {
            xpForNextLevel = xpNeeded;
            break;
        }

        currentLevelXP += xpNeeded;
        level++;
    }

    const currentXP = xp - currentLevelXP;
    const progress = (currentXP / xpForNextLevel) * 100;

    return {
        level,
        currentXP,
        nextLevelXP: xpForNextLevel,
        progress: Math.min(100, Math.max(0, progress)),
        totalXPForCurrentLevel: currentLevelXP,
        totalXPForNextLevel: currentLevelXP + xpForNextLevel
    };
}

export const XP_PER_ACTION = {
    CREATE_SNIPPET: 50,
    GET_VIEW: 1,
    GET_COPY: 50,
    COMPLETE_CONTEST: 100,
    WIN_CONTEST: 500,
};
