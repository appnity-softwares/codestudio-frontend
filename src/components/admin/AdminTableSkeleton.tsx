
import { TableCell, TableRow } from "@/components/ui/table";

interface AdminTableSkeletonProps {
    columns: number;
    rows?: number;
}

export function AdminTableSkeleton({ columns, rows = 5 }: AdminTableSkeletonProps) {
    return (
        <>
            {Array.from({ length: rows }).map((_, i) => (
                <TableRow key={i} className="animate-pulse">
                    {Array.from({ length: columns }).map((_, j) => (
                        <TableCell key={j}>
                            <div className="h-4 bg-muted rounded w-3/4" />
                        </TableCell>
                    ))}
                </TableRow>
            ))}
        </>
    );
}
