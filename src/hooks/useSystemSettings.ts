import { useQuery } from "@tanstack/react-query";
import { API_URL } from "@/lib/api";

export function useSystemSettings() {
    const { data: settingsData, isLoading } = useQuery({
        queryKey: ['system-status'],
        queryFn: async () => {
            const resp = await fetch(`${API_URL}/system/status`);
            if (!resp.ok) throw new Error("Failed to fetch system status");
            return resp.json();
        },
        staleTime: 5 * 60 * 1000, // 5 mins
    });

    const isFeatureEnabled = (key: string): boolean => {
        if (!settingsData?.settings) return false;
        return settingsData.settings[key] === "true";
    };

    return {
        settings: settingsData?.settings || {},
        isLoading,
        isFeatureEnabled
    };
}
