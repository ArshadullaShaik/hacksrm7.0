import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

function polarToRect(cx, cy, r, angleDeg) {
    const rad = (angleDeg - 90) * (Math.PI / 180);
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx, cy, r, startAngle, endAngle) {
    const start = polarToRect(cx, cy, r, startAngle);
    const end = polarToRect(cx, cy, r, endAngle);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

function getRiskColor(score) {
    if (score <= 30) return { stroke: '#00ff88', glow: 'rgba(0,255,136,', class: 'risk-low', label: 'LOW', badge: 'bg-green-900/40 text-green-400 border-green-400/40' };
    if (score <= 60) return { stroke: '#ffff00', glow: 'rgba(255,255,0,', class: 'risk-medium', label: 'MEDIUM', badge: 'bg-yellow-900/40 text-yellow-400 border-yellow-400/40' };
    return { stroke: '#ff0055', glow: 'rgba(255,0,85,', class: 'risk-high', label: 'HIGH', badge: 'bg-red-900/40 text-red-400 border-red-400/40' };
}

export default function RiskMeter({ score = 0, animate: doAnimate = true }) {
    const clampedScore = Math.max(0, Math.min(100, score));
    const risk = getRiskColor(clampedScore);

    const maxAngle = 270; // arc spans 270 degrees (from -135° to +135°)
    const startAngle = -135;
    const endAngle = startAngle + (clampedScore / 100) * maxAngle;

    const cx = 80, cy = 80, r = 60;
    const trackPath = describeArc(cx, cy, r, startAngle, startAngle + maxAngle);
    const fillPath = clampedScore > 0 ? describeArc(cx, cy, r, startAngle, Math.min(endAngle, startAngle + maxAngle - 0.01)) : '';

    const glowIntensity = 0.3 + (clampedScore / 100) * 0.5;

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative" style={{ width: 160, height: 160 }}>
                <svg viewBox="0 0 160 160" width="160" height="160">
                    {/* Glow filter */}
                    <defs>
                        <filter id="neon-glow">
                            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Track */}
                    <path
                        d={trackPath}
                        fill="none"
                        stroke="rgba(255,255,255,0.08)"
                        strokeWidth="10"
                        strokeLinecap="round"
                    />

                    {/* Tick marks */}
                    {Array.from({ length: 11 }).map((_, i) => {
                        const angle = startAngle + (i / 10) * maxAngle;
                        const outer = polarToRect(cx, cy, 72, angle);
                        const inner = polarToRect(cx, cy, 66, angle);
                        return (
                            <line
                                key={i}
                                x1={outer.x} y1={outer.y}
                                x2={inner.x} y2={inner.y}
                                stroke="rgba(255,255,255,0.2)"
                                strokeWidth="1"
                            />
                        );
                    })}

                    {/* Fill arc */}
                    {clampedScore > 0 && (
                        <motion.path
                            d={fillPath}
                            fill="none"
                            stroke={risk.stroke}
                            strokeWidth="10"
                            strokeLinecap="round"
                            filter="url(#neon-glow)"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: clampedScore / 100, stroke: risk.stroke }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            style={{
                                filter: `drop-shadow(0 0 6px ${risk.glow}${glowIntensity})) drop-shadow(0 0 12px ${risk.glow}${glowIntensity * 0.5}))`,
                            }}
                        />
                    )}

                    {/* Center circle */}
                    <circle cx={cx} cy={cy} r="40" fill="rgba(5,5,20,0.8)" />
                    <circle cx={cx} cy={cy} r="40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />

                    {/* Center text */}
                    <text x={cx} y={cy - 8} textAnchor="middle" fill={risk.stroke} fontSize="22" fontFamily="Orbitron, monospace" fontWeight="bold">
                        {Math.round(clampedScore)}
                    </text>
                    <text x={cx} y={cy + 10} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="8" fontFamily="Orbitron, monospace">
                        RISK SCORE
                    </text>
                </svg>

                {/* Min/Max labels */}
                <div className="absolute bottom-5 left-3 font-mono text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>0</div>
                <div className="absolute bottom-5 right-3 font-mono text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>100</div>
            </div>

            {/* Risk badge */}
            <motion.div
                animate={{ borderColor: risk.stroke, color: risk.stroke, boxShadow: `0 0 10px ${risk.glow}0.4)` }}
                transition={{ duration: 0.5 }}
                className={`font-orbitron text-xs font-bold px-4 py-1 rounded-full border tracking-widest ${risk.badge}`}
            >
                {risk.label} RISK
            </motion.div>
        </div>
    );
}
