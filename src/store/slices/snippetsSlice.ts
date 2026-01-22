import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SnippetsState {
    copyCounts: Record<string, number>;
    userCopies: Record<string, boolean>; // Tracks if user copied in current session to prevent spam
}

const initialState: SnippetsState = {
    copyCounts: {},
    userCopies: {},
};

const snippetsSlice = createSlice({
    name: 'snippets',
    initialState,
    reducers: {
        setCopyCount: (state, action: PayloadAction<{ id: string; count: number }>) => {
            state.copyCounts[action.payload.id] = action.payload.count;
        },
        incrementCopyCount: (state, action: PayloadAction<string>) => {
            const id = action.payload;
            if (!state.userCopies[id]) {
                state.copyCounts[id] = (state.copyCounts[id] || 0) + 1;
                state.userCopies[id] = true;
            }
        },
        // Useful if we want to sync many at once
        syncCopyCounts: (state, action: PayloadAction<Record<string, number>>) => {
            state.copyCounts = { ...state.copyCounts, ...action.payload };
        }
    },
});

export const { setCopyCount, incrementCopyCount, syncCopyCounts } = snippetsSlice.actions;
export default snippetsSlice.reducer;
