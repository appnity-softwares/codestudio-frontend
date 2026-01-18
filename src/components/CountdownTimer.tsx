import { useState, useEffect } from "react";

interface CountdownTimerProps {
    targetDate: Date;
    className?: string;
}

export function CountdownTimer({ targetDate, className = "" }: CountdownTimerProps) {
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    function calculateTimeLeft() {
        const difference = targetDate.getTime() - new Date().getTime();

        if (difference <= 0) {
            return { days: 0, hours: 0, minutes: 0, seconds: 0, isEnded: true };
        }

        return {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60),
            isEnded: false
        };
    }

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    if (timeLeft.isEnded) {
        return (
            <div className={`flex items-center gap-1 text-xs font-mono ${className}`}>
                <span className="animate-pulse text-red-400">Starting now...</span>
            </div>
        );
    }

    return (
        <div className={`flex items-center gap-1 ${className}`}>
            {timeLeft.days > 0 && (
                <TimeBlock value={timeLeft.days} label="d" />
            )}
            <TimeBlock value={timeLeft.hours} label="h" />
            <TimeBlock value={timeLeft.minutes} label="m" />
            <TimeBlock value={timeLeft.seconds} label="s" highlight />
        </div>
    );
}

function TimeBlock({ value, label, highlight = false }: { value: number; label: string; highlight?: boolean }) {
    return (
        <div className={`flex items-center gap-0.5 px-2 py-1 rounded-md ${highlight ? 'bg-primary/20 text-primary' : 'bg-muted/50'}`}>
            <span className="text-sm font-bold font-mono tabular-nums">
                {value.toString().padStart(2, '0')}
            </span>
            <span className="text-[10px] text-muted-foreground uppercase">{label}</span>
        </div>
    );
}
