import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
    sidebarCollapsed: boolean;
    activeModal: string | null;
}

// Load initial state from local storage for persistence
const initialSidebarState = localStorage.getItem("sidebar-collapsed") === "true";

const initialState: UIState = {
    sidebarCollapsed: initialSidebarState,
    activeModal: null,
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        toggleSidebar: (state) => {
            state.sidebarCollapsed = !state.sidebarCollapsed;
            localStorage.setItem("sidebar-collapsed", JSON.stringify(state.sidebarCollapsed));
        },
        setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
            state.sidebarCollapsed = action.payload;
            localStorage.setItem("sidebar-collapsed", JSON.stringify(action.payload));
        },
        openModal: (state, action: PayloadAction<string>) => {
            state.activeModal = action.payload;
        },
        closeModal: (state) => {
            state.activeModal = null;
        }
    }
});

export const { toggleSidebar, setSidebarCollapsed, openModal, closeModal } = uiSlice.actions;
export default uiSlice.reducer;
