import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
    xp: number;
    level: number;
    streak: number;
    inventory: string[];
    equippedAura: string | null;
    equippedTheme: string | null;
    unlockedThemes: string[];
    influence: number;
    profileImage: string | null;
    quests: { id: string; label: string; progress: number; total: number; reward: number; claimed: boolean }[];
}

const initialState: UserState = {
    xp: 0,
    level: 1,
    streak: 0,
    inventory: [],
    equippedAura: null,
    equippedTheme: null,
    unlockedThemes: ['default'],
    influence: 15, // Starting trust score
    profileImage: null,
    quests: [
        { id: 'q1', label: 'Solve 1 Medium Problem', progress: 0, total: 1, reward: 50, claimed: false },
        { id: 'q2', label: 'Copy 2 Snippets', progress: 0, total: 2, reward: 30, claimed: false },
        { id: 'q3', label: 'Give Feedback', progress: 0, total: 1, reward: 15, claimed: false },
    ],
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUserData: (state, action: PayloadAction<{ xp: number; level: number; streak: number; inventory?: string[]; equippedAura?: string | null; equippedTheme?: string | null; unlockedThemes?: string[]; influence?: number; profileImage?: string | null }>) => {
            state.xp = action.payload.xp;
            state.level = action.payload.level;
            state.streak = action.payload.streak;
            if (action.payload.inventory) state.inventory = action.payload.inventory;
            if (action.payload.equippedAura !== undefined) state.equippedAura = action.payload.equippedAura;
            if (action.payload.equippedTheme !== undefined) state.equippedTheme = action.payload.equippedTheme;
            if (action.payload.unlockedThemes) state.unlockedThemes = action.payload.unlockedThemes;
            if (action.payload.influence) state.influence = action.payload.influence;
            if (action.payload.profileImage !== undefined) state.profileImage = action.payload.profileImage;
        },
        addXP: (state, action: PayloadAction<number>) => {
            state.xp += action.payload;
            // Level = sqrt(XP / 100) -> Non-linear: 100xp=Lv2, 400xp=Lv3, 900xp=Lv4
            // Floor+1 makes 0-99 xp = Lv1
            const newLevel = Math.floor(Math.sqrt(state.xp / 100)) + 1;
            if (newLevel > state.level) {
                state.level = newLevel;
            }
        },
        updateStreak: (state, action: PayloadAction<number>) => {
            state.streak = action.payload;
        },
        spendXP: (state, action: PayloadAction<{ amount: number; itemId: string; type: 'AURA' | 'THEME' | 'BOOST' }>) => {
            if (state.xp >= action.payload.amount) {
                state.xp -= action.payload.amount;
                state.inventory.push(action.payload.itemId);

                if (action.payload.type === 'THEME') {
                    state.unlockedThemes.push(action.payload.itemId);
                }
            }
        },
        equipAura: (state, action: PayloadAction<string | null>) => {
            state.equippedAura = action.payload;
        },
        equipTheme: (state, action: PayloadAction<string | null>) => {
            state.equippedTheme = action.payload;
        },
        updateQuestProgress: (state, action: PayloadAction<{ id: string; amount: number }>) => {
            const quest = state.quests.find(q => q.id === action.payload.id);
            if (quest && !quest.claimed) {
                quest.progress = Math.min(quest.total, quest.progress + action.payload.amount);
            }
        },
        claimQuestReward: (state, action: PayloadAction<string>) => {
            const quest = state.quests.find(q => q.id === action.payload);
            if (quest && quest.progress >= quest.total && !quest.claimed) {
                quest.claimed = true;
                state.xp += quest.reward;
            }
        },
        addInfluence: (state, action: PayloadAction<number>) => {
            state.influence += action.payload;
        }
    },
});

export const { setUserData, addXP, updateStreak, spendXP, equipAura, equipTheme, updateQuestProgress, claimQuestReward, addInfluence } = userSlice.actions;
export default userSlice.reducer;
