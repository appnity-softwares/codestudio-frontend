import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SystemState {
    settings: Record<string, string>;
    lastFetched: number;
}

const initialState: SystemState = {
    settings: {},
    lastFetched: 0,
};

const systemSlice = createSlice({
    name: 'system',
    initialState,
    reducers: {
        setSystemSettings: (state, action: PayloadAction<Record<string, string>>) => {
            state.settings = action.payload;
            state.lastFetched = Date.now();
        },
        updateSetting: (state, action: PayloadAction<{ key: string; value: string }>) => {
            state.settings[action.payload.key] = action.payload.value;
        }
    }
});

export const { setSystemSettings, updateSetting } = systemSlice.actions;

// Selector to easily check feature flags
export const selectFeatureEnabled = (state: { system: SystemState }, key: string, defaultVal = true) => {
    const val = state.system.settings[key];
    if (val === undefined) return defaultVal;
    return val === 'true';
};

export const selectSystemSetting = (state: { system: SystemState }, key: string) => {
    return state.system.settings[key];
};

export default systemSlice.reducer;
