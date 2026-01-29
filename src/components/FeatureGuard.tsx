import { Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { systemAPI } from "@/lib/api";
import { PageLoader } from "@/components/ui/PageLoader";

interface FeatureGuardProps {
    children: React.ReactNode;
    featureKey: string;
    redirect?: string;
}

export function FeatureGuard({ children, featureKey, redirect = "/" }: FeatureGuardProps) {
    const { data: systemData, isLoading } = useQuery({
        queryKey: ['system-status', 'guard'],
        queryFn: () => systemAPI.getPublicStatus(),
        staleTime: 60000 * 5, // 5 minutes
    });

    if (isLoading) {
        return <PageLoader />;
    }

    const settings = systemData?.settings || {};
    const isEnabled = settings[featureKey] === "true";

    if (!isEnabled) {
        return <Navigate to={redirect} replace />;
    }

    return <>{children}</>;
}
