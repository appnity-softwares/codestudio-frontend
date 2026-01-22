import { configureStore } from '@reduxjs/toolkit';
import snippetsReducer from './slices/snippetsSlice';

export const store = configureStore({
    reducer: {
        snippets: snippetsReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
