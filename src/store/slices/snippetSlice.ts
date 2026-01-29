import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SnippetState {
    copyCounts: Record<string, number>;
    userCopies: Record<string, boolean>;
    likeStates: Record<string, boolean>;
    likesCounts: Record<string, number>;
    dislikeStates: Record<string, boolean>;
    dislikesCounts: Record<string, number>;
}

const initialState: SnippetState = {
    copyCounts: {},
    userCopies: {},
    likeStates: {},
    likesCounts: {},
    dislikeStates: {},
    dislikesCounts: {},
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
        setDislikeState: (state, action: PayloadAction<{ id: string; isDisliked: boolean; count: number }>) => {
            state.dislikeStates[action.payload.id] = action.payload.isDisliked;
            state.dislikesCounts[action.payload.id] = action.payload.count;
        },
        toggleLike: (state, action: PayloadAction<string>) => {
            const id = action.payload;
            const currentlyLiked = !!state.likeStates[id];

            // If liking (and not unliking), remove dislike if exists
            if (!currentlyLiked && state.dislikeStates[id]) {
                state.dislikeStates[id] = false;
                state.dislikesCounts[id] = Math.max((state.dislikesCounts[id] || 0) - 1, 0);
            }

            state.likeStates[id] = !currentlyLiked;
            state.likesCounts[id] = (state.likesCounts[id] || 0) + (currentlyLiked ? -1 : 1);
        },
        toggleDislike: (state, action: PayloadAction<string>) => {
            const id = action.payload;
            const currentlyDisliked = !!state.dislikeStates[id];

            // If disliking (and not undisliking), remove like if exists
            if (!currentlyDisliked && state.likeStates[id]) {
                state.likeStates[id] = false;
                state.likesCounts[id] = Math.max((state.likesCounts[id] || 0) - 1, 0);
            }

            state.dislikeStates[id] = !currentlyDisliked;
            state.dislikesCounts[id] = (state.dislikesCounts[id] || 0) + (currentlyDisliked ? -1 : 1);
        }
    }
});

export const { setCopyCount, incrementCopyCount, setLikeState, setDislikeState, toggleLike, toggleDislike } = snippetSlice.actions;
export default snippetSlice.reducer;
