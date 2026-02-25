import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

function getAccuracyColor(score) {
    if (score <= 40) return { stroke: '#ff0055', glow: 'rgba(255,0,85,', label: '#ff0055' };
    if (score <= 70) return { stroke: '#ffff00', glow: 'rgba(255,255,0,', label: '#ffff00' };
    return { stroke: '#00ff88', glow: 'rgba(0,255,136,', label: '#00ff88' };
}

// Polar-coordinate helper for SVG arc paths (same pattern as RiskMeter)
function polarXY(cx, cy, r, deg) {
    const rad = (deg - 90) * (Math.PI / 180);
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}
function arcPath(cx, cy, r, startDeg, endDeg) {
    const s = polarXY(cx, cy, r, startDeg);
    const e = polarXY(cx, cy, r, endDeg);
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
}

export default function AccuracyMeter({ accuracyScore = 0 }) {
    const clamped = Math.max(0, Math.min(100, accuracyScore));
    const col = getAccuracyColor(clamped);

    const startAngle = -135;
    const sweepAngle = 270;
    const endAngle = startAngle + (clamped / 100) * sweepAngle;

    const SZ = 70;
    const cx = SZ / 2, cy = SZ / 2, r = SZ * 0.37;

    return (
        <div className="flex flex-col items-center gap-0.5">

            <div className="relative" style={{ width: SZ, height: SZ }}>
                <svg viewBox={`0 0 ${SZ} ${SZ}`} width={SZ} height={SZ}>
                    <defs>
                        <filter id="acc-glow">
                            <feGaussianBlur stdDeviation="2" result="blur" />
                            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                        </filter>
                    </defs>

                    {/* Track */}
                    <path
                        d={arcPath(cx, cy, r, startAngle, startAngle + sweepAngle)}
                        fill="none"
                        stroke="rgba(255,255,255,0.08)"
                        strokeWidth="6"
                        strokeLinecap="round"
                    />

                    {/* Filled arc */}
                    {clamped > 0 && (
                        <motion.path
                            d={arcPath(cx, cy, r, startAngle, Math.min(endAngle, startAngle + sweepAngle - 0.01))}
                            fill="none"
                            stroke={col.stroke}
                            strokeWidth="6"
                            strokeLinecap="round"
                            filter="url(#acc-glow)"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: clamped / 100, stroke: col.stroke }}
                            transition={{ duration: 0.9, ease: 'easeOut' }}
                            style={{
                                filter: `drop-shadow(0 0 4px ${col.glow}0.8)) drop-shadow(0 0 8px ${col.glow}0.3))`,
                            }}
                        />
                    )}

                    {/* Center bg circle */}
                    <circle cx={cx} cy={cy} r={r - 5} fill="rgba(2,2,7,0.75)" />

                    {/* Score text */}
                    <text x={cx} y={cy - 4} textAnchor="middle"
                        fill={col.label} fontSize="13" fontFamily="Orbitron, monospace" fontWeight="bold">
                        {Math.round(clamped)}%
                    </text>
                    <text x={cx} y={cy + 7} textAnchor="middle"
                        fill="rgba(255,255,255,0.3)" fontSize="5" fontFamily="Orbitron, monospace">
                        ACCURACY
                    </text>
                </svg>

                {/* Glow halo */}
                <motion.div
                    className="absolute inset-0 rounded-full pointer-events-none"
                    animate={{ boxShadow: `0 0 ${6 + (clamped / 100) * 10}px ${col.glow}0.35)` }}
                    transition={{ duration: 0.8 }}
                    style={{ borderRadius: '50%' }}
                />
            </div>
        </div>
    );
}
