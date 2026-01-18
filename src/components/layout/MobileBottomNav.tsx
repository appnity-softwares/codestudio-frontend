'use client';

import { useNavigate, useLocation } from 'react-router-dom';
import Dock from './Dock';
import { navSections } from '@/lib/nav-config';
import { useAuth } from '@/context/AuthContext';

export function MobileBottomNav() {
    const navigate = useNavigate();
    const location = useLocation();
    const pathname = location.pathname;
    const { user, isAuthenticated } = useAuth();

    const allNavItems = navSections.flatMap(section => section.items);

    const dockItems = allNavItems
        .filter(item => {
            if (item.label === 'Admin' && user?.role !== 'ADMIN') {
                return false;
            }
            if ((item.label === 'Profile' || item.label === 'Saved' || item.label === 'Dashboard' || item.label === 'Settings') && !isAuthenticated) {
                return false;
            }
            // Keep only key icons for the dock to avoid clutter
            const importantLabels = ['Feed', 'Explore', 'Blogs', 'Marketplace', 'Saved'];
            return importantLabels.includes(item.label);
        })
        .map(item => {
            const href = item.href.includes('[[username]]')
                ? (user?.username ? item.href.replace('[[username]]', user.username) : '/auth/signin')
                : item.href;

            return {
                icon: <item.icon size={20} />,
                label: item.label,
                onClick: () => navigate(href),
                className: pathname === href ? 'bg-primary text-primary-foreground border-primary scale-110' : ''
            }
        });

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-24 z-50 pointer-events-none">
            <div className="absolute bottom-0 left-0 right-0 pointer-events-auto">
                <Dock items={dockItems} />
            </div>
        </div>
    );
}
