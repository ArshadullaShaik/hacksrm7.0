import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Eye, RotateCcw, MonitorX, Shield } from 'lucide-react';

function getRiskData(score) {
    if (score <= 30) return { label: 'LOW', color: '#00ff88', bg: 'rgba(0,255,136,0.1)', border: 'rgba(0,255,136,0.3)' };
    if (score <= 60) return { label: 'MEDIUM', color: '#ffff00', bg: 'rgba(255,255,0,0.08)', border: 'rgba(255,255,0,0.3)' };
    return { label: 'HIGH', color: '#ff0055', bg: 'rgba(255,0,85,0.1)', border: 'rgba(255,0,85,0.3)' };
}

function StatRow({ icon: Icon, label, value, subValue, color = '#00f5ff', warningThreshold, progress }) {
    const isWarning = warningThreshold !== undefined && Number(value) >= warningThreshold;
    const displayColor = isWarning ? '#ff0055' : color;
    return (
        <div className="flex items-center gap-3 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `${displayColor}15`, border: `1px solid ${displayColor}30` }}>
                <Icon size={14} style={{ color: displayColor }} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>{label}</span>
                    <div className="flex items-center gap-2">
                        {subValue && (
                            <span className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>{subValue}</span>
                        )}
                        <span className="font-orbitron text-sm font-bold" style={{ color: displayColor, textShadow: `0 0 6px ${displayColor}66` }}>
                            {value}
                        </span>
                    </div>
                </div>
                {progress !== undefined && (
                    <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <motion.div
                            className="h-full rounded-full"
                            style={{ background: `linear-gradient(90deg, ${displayColor}, ${displayColor}aa)`, boxShadow: `0 0 4px ${displayColor}` }}
                            animate={{ width: `${Math.min(100, progress)}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

export default function SessionSummary({ riskScore = 0, gazeDeviation = 0, headTurnCount = 0, tabSwitchCount = 0 }) {
    const risk = getRiskData(riskScore);
    const integrityScore = Math.max(0, 100 - riskScore);

    return (
        <motion.div
            className="glass-card holographic rounded-2xl p-5 flex flex-col gap-4"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <BarChart3 size={15} style={{ color: '#8b00ff', filter: 'drop-shadow(0 0 4px #8b00ff)' }} />
                    <span className="font-orbitron text-sm font-bold tracking-wider" style={{ color: '#8b00ff' }}>
                        SESSION SUMMARY
                    </span>
                </div>
                {/* Risk level badge */}
                <motion.div
                    className="font-orbitron text-xs font-bold px-3 py-1 rounded-full tracking-widest"
                    animate={{
                        background: risk.bg,
                        border: `1px solid ${risk.border}`,
                        color: risk.color,
                        boxShadow: `0 0 10px ${risk.color}40`,
                    }}
                    transition={{ duration: 0.5 }}
                >
                    {risk.label}
                </motion.div>
            </div>

            <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, rgba(139,0,255,0.4), transparent)' }} />

            {/* Stats */}
            <div className="flex flex-col">
                <StatRow
                    icon={Eye}
                    label="EYE DEVIATION"
                    value={`${gazeDeviation}%`}
                    progress={gazeDeviation}
                    warningThreshold={40}
                    color="#00f5ff"
                />
                <StatRow
                    icon={RotateCcw}
                    label="HEAD TURNS"
                    value={headTurnCount}
                    subValue="events"
                    progress={(headTurnCount / 20) * 100}
                    warningThreshold={10}
                    color="#8b00ff"
                />
                <StatRow
                    icon={MonitorX}
                    label="TAB SWITCHES"
                    value={tabSwitchCount}
                    subValue="events"
                    progress={(tabSwitchCount / 10) * 100}
                    warningThreshold={3}
                    color="#ff007f"
                />
            </div>

            {/* Integrity score */}
            <div className="mt-1 p-4 rounded-xl" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Shield size={14} style={{ color: '#00f5ff' }} />
                        <span className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>INTEGRITY SCORE</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <motion.span
                            className="font-orbitron font-black text-3xl"
                            animate={{ color: risk.color, textShadow: `0 0 20px ${risk.color}` }}
                            transition={{ duration: 0.5 }}
                        >
                            {integrityScore}
                        </motion.span>
                        <span className="font-mono text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>/100</span>
                    </div>
                </div>
                {/* Segmented progress bar */}
                <div className="flex gap-1">
                    {Array.from({ length: 20 }).map((_, i) => {
                        const filled = i < Math.round(integrityScore / 5);
                        const segColor = integrityScore > 60 ? '#00ff88' : integrityScore > 30 ? '#ffff00' : '#ff0055';
                        return (
                            <motion.div
                                key={i}
                                className="flex-1 h-2 rounded-sm"
                                animate={{
                                    background: filled ? segColor : 'rgba(255,255,255,0.06)',
                                    boxShadow: filled ? `0 0 4px ${segColor}60` : 'none',
                                }}
                                transition={{ duration: 0.05 * i }}
                            />
                        );
                    })}
                </div>
                {/* Description */}
                <p className="font-mono text-xs mt-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    {integrityScore >= 70
                        ? '✓ Candidate shows strong integrity indicators'
                        : integrityScore >= 40
                            ? '⚠ Moderate violations detected — review recommended'
                            : '✕ High violation rate — manual review required'}
                </p>
            </div>

            {/* Time chip */}
            <div className="flex items-center gap-2">
                <TrendingUp size={12} style={{ color: 'rgba(255,255,255,0.25)' }} />
                <span className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
                    Metrics update in real-time
                </span>
            </div>
        </motion.div>
    );
}
