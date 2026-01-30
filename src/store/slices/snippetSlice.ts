import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SnippetState {
    copyCounts: Record<string, number>;
    userCopies: Record<string, boolean>;
    viewerReactions: Record<string, 'like' | 'dislike' | null>;
    likesCounts: Record<string, number>;
    dislikesCounts: Record<string, number>;
}

const initialState: SnippetState = {
    copyCounts: {},
    userCopies: {},
    viewerReactions: {},
    likesCounts: {},
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
        setSnippetReaction: (state, action: PayloadAction<{ id: string; reaction: 'like' | 'dislike' | null; likesCount: number; dislikesCount: number }>) => {
            const { id, reaction, likesCount, dislikesCount } = action.payload;
            state.viewerReactions[id] = reaction;
            state.likesCounts[id] = likesCount;
            state.dislikesCounts[id] = dislikesCount;
        },
        // For optimistic updates
        updateReactionOptimistically: (state, action: PayloadAction<{ id: string; reaction: 'like' | 'dislike' }>) => {
            const { id, reaction } = action.payload;
            const current = state.viewerReactions[id] || null;

            if (current === reaction) {
                // Toggle off
                if (reaction === 'like') state.likesCounts[id] = Math.max((state.likesCounts[id] || 0) - 1, 0);
                else state.dislikesCounts[id] = Math.max((state.dislikesCounts[id] || 0) - 1, 0);
                state.viewerReactions[id] = null;
            } else {
                // Switch or add
                if (current === 'like') state.likesCounts[id] = Math.max((state.likesCounts[id] || 0) - 1, 0);
                if (current === 'dislike') state.dislikesCounts[id] = Math.max((state.dislikesCounts[id] || 0) - 1, 0);

                if (reaction === 'like') state.likesCounts[id] = (state.likesCounts[id] || 0) + 1;
                else state.dislikesCounts[id] = (state.dislikesCounts[id] || 0) + 1;

                state.viewerReactions[id] = reaction;
            }
        },
    }
});

export const { setCopyCount, incrementCopyCount, setSnippetReaction, updateReactionOptimistically } = snippetSlice.actions;
export default snippetSlice.reducer;
