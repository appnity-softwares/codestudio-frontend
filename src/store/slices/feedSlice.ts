import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FeedState {
    viewBucket: 'trending' | 'new' | 'editor' | 'personal';
    searchQuery: string;
    filters: {
        type: string;
        difficulty: string;
        language: string;
    };
}

const initialState: FeedState = {
    viewBucket: 'trending',
    searchQuery: '',
    filters: {
        type: 'all',
        difficulty: 'all',
        language: 'all',
    }
};

const feedSlice = createSlice({
    name: 'feed',
    initialState,
    reducers: {
        setFeedBucket: (state, action: PayloadAction<'trending' | 'new' | 'editor' | 'personal'>) => {
            state.viewBucket = action.payload;
        },
        setSearchQuery: (state, action: PayloadAction<string>) => {
            state.searchQuery = action.payload;
        },
        setFeedFilter: (state, action: PayloadAction<{ key: keyof FeedState['filters']; value: string }>) => {
            state.filters[action.payload.key] = action.payload.value;
        },
        resetFilters: (state) => {
            state.searchQuery = '';
            state.filters = { type: 'all', difficulty: 'all', language: 'all' };
        }
    }
});

export const { setFeedBucket, setSearchQuery, setFeedFilter, resetFilters } = feedSlice.actions;
export default feedSlice.reducer;
