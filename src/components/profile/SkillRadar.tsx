
import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface SkillRadarProps {
    data: { coding: number; ui: number; quiz: number } | null | undefined;
}

const SkillRadar: React.FC<SkillRadarProps> = ({ data }) => {
    // Extract skill values with sensible defaults
    const coding = data?.coding || 0;
    const ui = data?.ui || 0;
    const quiz = data?.quiz || 0;

    // Derive metrics from the core skills
    const speed = Math.min(100, Math.round(coding * 0.8));
    const consistency = Math.min(100, Math.round((coding + ui + quiz) / 3)); // Average of all skills

    // Transform JSON data to Recharts format
    const chartData = [
        { subject: 'Algorithms', A: coding || 10, fullMark: 100 },
        { subject: 'UI/UX', A: ui || 10, fullMark: 100 },
        { subject: 'Theory', A: quiz || 10, fullMark: 100 },
        { subject: 'Speed', A: speed || 10, fullMark: 100 },
        { subject: 'Consistency', A: consistency || 10, fullMark: 100 },
    ];

    return (
        <div className="w-full h-64 bg-surface rounded-xl border border-border p-4 relative overflow-hidden">
            <h3 className="text-xs font-bold text-muted-foreground mb-4 font-mono uppercase tracking-widest">Skill Signature</h3>
            <ResponsiveContainer width="100%" height={200}>
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                    <PolarGrid stroke="oklch(var(--border))" strokeOpacity={0.5} />
                    <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: 'oklch(var(--muted-foreground))', fontSize: 10, fontFamily: 'var(--font-mono)' }}
                    />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                        name="Skills"
                        dataKey="A"
                        stroke="oklch(var(--primary))"
                        strokeWidth={2}
                        fill="oklch(var(--primary))"
                        fillOpacity={0.2}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'oklch(var(--surface))',
                            borderColor: 'oklch(var(--border))',
                            borderRadius: '8px',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '12px'
                        }}
                        itemStyle={{ color: 'oklch(var(--primary))' }}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default SkillRadar;
