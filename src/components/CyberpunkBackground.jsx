import React, { useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';

const SHAPES = [
    { type: 'triangle', x: 10, y: 15, size: 60, color: '#00f5ff', speed: 0.3, opacity: 0.12 },
    { type: 'triangle', x: 85, y: 25, size: 40, color: '#ff00ff', speed: 0.4, opacity: 0.1 },
    { type: 'triangle', x: 60, y: 70, size: 80, color: '#8b00ff', speed: 0.2, opacity: 0.08 },
    { type: 'hexagon', x: 30, y: 60, size: 50, color: '#00f5ff', speed: 0.25, opacity: 0.1 },
    { type: 'hexagon', x: 75, y: 50, size: 35, color: '#ff007f', speed: 0.35, opacity: 0.09 },
    { type: 'diamond', x: 20, y: 85, size: 30, color: '#0080ff', speed: 0.45, opacity: 0.12 },
    { type: 'diamond', x: 90, y: 10, size: 45, color: '#8b00ff', speed: 0.3, opacity: 0.09 },
    { type: 'circle', x: 50, y: 40, size: 20, color: '#00f5ff', speed: 0.5, opacity: 0.15 },
    { type: 'triangle', x: 40, y: 20, size: 55, color: '#ff00ff', speed: 0.25, opacity: 0.07 },
    { type: 'hexagon', x: 10, y: 50, size: 25, color: '#00ff88', speed: 0.4, opacity: 0.1 },
];

function FloatingShape({ shape, index }) {
    const duration = 6 + index * 1.3;
    const delay = index * 0.7;

    return (
        <motion.div
            className="absolute pointer-events-none"
            style={{ left: `${shape.x}%`, top: `${shape.y}%` }}
            animate={{
                y: [-15, 15, -15],
                x: [-8, 8, -8],
                rotate: [0, 360],
            }}
            transition={{
                duration,
                delay,
                repeat: Infinity,
                ease: 'linear',
            }}
        >
            {shape.type === 'triangle' && (
                <svg width={shape.size} height={shape.size} viewBox="0 0 100 100">
                    <polygon
                        points="50,5 95,90 5,90"
                        fill="none"
                        stroke={shape.color}
                        strokeWidth="1.5"
                        opacity={shape.opacity * 1.5}
                    />
                </svg>
            )}
            {shape.type === 'hexagon' && (
                <svg width={shape.size} height={shape.size} viewBox="0 0 100 100">
                    <polygon
                        points="50,3 93,25 93,75 50,97 7,75 7,25"
                        fill="none"
                        stroke={shape.color}
                        strokeWidth="1.5"
                        opacity={shape.opacity * 1.5}
                    />
                </svg>
            )}
            {shape.type === 'diamond' && (
                <svg width={shape.size} height={shape.size} viewBox="0 0 100 100">
                    <polygon
                        points="50,5 95,50 50,95 5,50"
                        fill="none"
                        stroke={shape.color}
                        strokeWidth="1.5"
                        opacity={shape.opacity * 1.5}
                    />
                </svg>
            )}
            {shape.type === 'circle' && (
                <svg width={shape.size} height={shape.size} viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke={shape.color} strokeWidth="1.5" opacity={shape.opacity * 1.5} />
                </svg>
            )}
        </motion.div>
    );
}

function GridLines() {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                        <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#00f5ff" strokeWidth="0.3" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
        </div>
    );
}

export default function CyberpunkBackground({ intense = false }) {
    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
            {/* Base gradient */}
            <div className="absolute inset-0 gradient-mesh" style={{ background: 'linear-gradient(135deg, #020207 0%, #05051a 40%, #0a0520 60%, #020207 100%)' }} />

            {/* Animated gradient mesh */}
            <div className="absolute inset-0 gradient-mesh opacity-70" />

            {/* Grid lines */}
            <GridLines />

            {/* Floating shapes */}
            {SHAPES.map((shape, i) => (
                <FloatingShape key={i} shape={shape} index={i} />
            ))}

            {/* Moving scanline */}
            <motion.div
                className="absolute left-0 right-0 h-0.5 pointer-events-none"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(0,245,255,0.12), transparent)' }}
                animate={{ y: ['-5vh', '105vh'] }}
                transition={{ duration: 10, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
            />

            {/* Scanline texture overlay */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px)',
                }}
            />

            {/* Corner accent glows */}
            <div className="absolute top-0 left-0 w-64 h-64 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(0,245,255,0.06) 0%, transparent 70%)', transform: 'translate(-50%, -50%)' }} />
            <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(255,0,255,0.06) 0%, transparent 70%)', transform: 'translate(50%, 50%)' }} />
            <div className="absolute top-1/2 left-1/2 w-[800px] h-[800px] rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(139,0,255,0.04) 0%, transparent 70%)', transform: 'translate(-50%, -50%)' }} />

            {/* Noise overlay */}
            {intense && (
                <div className="absolute inset-0 pointer-events-none opacity-5"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`, backgroundSize: '128px' }} />
            )}
        </div>
    );
}
