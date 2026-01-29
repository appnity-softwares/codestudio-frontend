import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SnippetState {
    copyCounts: Record<string, number>;
    userCopies: Record<string, boolean>;
    likeStates: Record<string, boolean>;
    likesCounts: Record<string, number>;
}

const initialState: SnippetState = {
    copyCounts: {},
    userCopies: {},
    likeStates: {},
    likesCounts: {},
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
        setLikeState: (state, action: PayloadAction<{ id: string; isLiked: boolean; count: number }>) => {
            state.likeStates[action.payload.id] = action.payload.isLiked;
            state.likesCounts[action.payload.id] = action.payload.count;
        },
        toggleLike: (state, action: PayloadAction<string>) => {
            const id = action.payload;
            const currentlyLiked = !!state.likeStates[id];
            state.likeStates[id] = !currentlyLiked;
            state.likesCounts[id] = (state.likesCounts[id] || 0) + (currentlyLiked ? -1 : 1);
        }
    }
});

export const { setCopyCount, incrementCopyCount, setLikeState, toggleLike } = snippetSlice.actions;
export default snippetSlice.reducer;
