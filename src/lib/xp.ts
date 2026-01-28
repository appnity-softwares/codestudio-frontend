export interface LevelInfo {
    level: number;
    currentXP: number;
    nextLevelXP: number;
    progress: number;
    totalXPForCurrentLevel: number;
    totalXPForNextLevel: number;
}

/**
 * Level formula: XP(L) = 50 * (L^2 - L)
 * Level 1: 0 XP
 * Level 2: 100 XP
 * Level 3: 300 XP
 * Level 4: 600 XP
 * Level 5: 1000 XP
 */
export function calculateLevel(xp: number): LevelInfo {
    const level = Math.floor((1 + Math.sqrt(1 + xp / 12.5)) / 2);

    // XP(L) = 50 * (L^2 - L)
    const totalXPForCurrentLevel = 50 * (Math.pow(level, 2) - level);
    const totalXPForNextLevel = 50 * (Math.pow(level + 1, 2) - (level + 1));

    const currentXP = xp - totalXPForCurrentLevel;
    const nextLevelXP = totalXPForNextLevel - totalXPForCurrentLevel;
    const progress = (currentXP / nextLevelXP) * 100;

    return {
        level,
        currentXP,
        nextLevelXP,
        progress: Math.min(100, Math.max(0, progress)),
        totalXPForCurrentLevel,
        totalXPForNextLevel
    };
}

export const XP_PER_ACTION = {
    CREATE_SNIPPET: 50,
    GET_FORK: 25,
    GET_VIEW: 1,
    GET_COPY: 10,
    COMPLETE_CONTEST: 100,
    WIN_CONTEST: 500,
};
