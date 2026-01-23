import { configureStore } from '@reduxjs/toolkit';
import uiReducer from './slices/uiSlice';
import feedReducer from './slices/feedSlice';
import systemReducer from './slices/systemSlice';
import snippetReducer from './slices/snippetSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
    reducer: {
        ui: uiReducer,
        feed: feedReducer,
        system: systemReducer,
        snippets: snippetReducer,
        user: userReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
