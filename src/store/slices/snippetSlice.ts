import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SnippetState {
    copyCounts: Record<string, number>;
    userCopies: Record<string, boolean>;
}

const initialState: SnippetState = {
    copyCounts: {},
    userCopies: {},
};

const snippetSlice = createSlice({
    name: 'snippets',
    initialState,
    reducers: {
        setCopyCount: (state, action: PayloadAction<{ id: string; count: number }>) => {
            state.copyCounts[action.payload.id] = action.payload.count;
        },
        incrementCopyCount: (state, action: PayloadAction<string>) => {
            const id = action.payload;
            state.copyCounts[id] = (state.copyCounts[id] || 0) + 1;
            state.userCopies[id] = true;
        },
    }
});

export const { setCopyCount, incrementCopyCount } = snippetSlice.actions;
export default snippetSlice.reducer;
