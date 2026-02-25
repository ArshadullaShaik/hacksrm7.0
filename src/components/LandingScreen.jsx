import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CyberpunkBackground from './CyberpunkBackground';

// Animated rotating rings around the title
function NeonRings() {
    return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {/* Ring 1 */}
            <motion.div
                className="absolute rounded-full neon-ring-1"
                style={{ width: 480, height: 480 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
            />
            {/* Ring 2 - reverse */}
            <motion.div
                className="absolute rounded-full neon-ring-2"
                style={{ width: 560, height: 560 }}
                animate={{ rotate: -360 }}
                transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            />
            {/* Ring 3 - dashed */}
            <motion.div
                className="absolute rounded-full neon-ring-3"
                style={{ width: 640, height: 640 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            />
            {/* Inner ring */}
            <motion.div
                className="absolute rounded-full"
                style={{
                    width: 380,
                    height: 380,
                    border: '1px solid rgba(0,245,255,0.3)',
                    boxShadow: '0 0 20px rgba(0,245,255,0.15)',
                }}
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
        </div>
    );
}

// Particle burst on button click
function ParticleBurst({ x, y, active, onDone }) {
    useEffect(() => {
        if (active) {
            const t = setTimeout(onDone, 700);
            return () => clearTimeout(t);
        }
    }, [active, onDone]);

    if (!active) return null;

    return (
        <div className="fixed pointer-events-none" style={{ left: x, top: y, zIndex: 9999 }}>
            {Array.from({ length: 16 }).map((_, i) => {
                const angle = (i / 16) * 360;
                const distance = 60 + Math.random() * 60;
                const rad = (angle * Math.PI) / 180;
                return (
                    <motion.div
                        key={i}
                        className="absolute w-2 h-2 rounded-full"
                        style={{
                            background: i % 2 === 0 ? '#00f5ff' : '#ff00ff',
                            boxShadow: `0 0 6px ${i % 2 === 0 ? '#00f5ff' : '#ff00ff'}`,
                            left: 0, top: 0,
                        }}
                        animate={{
                            x: [0, Math.cos(rad) * distance],
                            y: [0, Math.sin(rad) * distance],
                            opacity: [1, 0],
                            scale: [1, 0.3],
                        }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                );
            })}
            {/* Central burst ring */}
            <motion.div
                className="absolute rounded-full"
                style={{
                    width: 20, height: 20,
                    border: '2px solid #00f5ff',
                    left: -10, top: -10,
                    boxShadow: '0 0 15px #00f5ff',
                }}
                animate={{ scale: [0, 6], opacity: [1, 0] }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
            />
        </div>
    );
}

export default function LandingScreen({ onStart }) {
    const [burst, setBurst] = useState({ active: false, x: 0, y: 0 });
    const btnRef = useRef(null);

    const handleClick = (e) => {
        const rect = btnRef.current?.getBoundingClientRect();
        if (rect) {
            setBurst({ active: true, x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
        }
        setTimeout(onStart, 500);
    };

    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden">
            <CyberpunkBackground intense />

            {/* Neon rings */}
            <NeonRings />

            {/* Main content */}
            <motion.div
                className="relative z-10 flex flex-col items-center gap-10 text-center px-6"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: 'easeOut' }}
            >
                {/* Overline */}
                <motion.div
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="h-px w-12" style={{ background: 'linear-gradient(90deg, transparent, #00f5ff)' }} />
                    <span className="text-xs tracking-[0.5em] uppercase font-mono" style={{ color: '#00f5ff99' }}>
                        AI Interview Proctoring System
                    </span>
                    <div className="h-px w-12" style={{ background: 'linear-gradient(90deg, #00f5ff, transparent)' }} />
                </motion.div>

                {/* Main Title */}
                <motion.div
                    animate={{ filter: ['drop-shadow(0 0 20px rgba(0,245,255,0.7))', 'drop-shadow(0 0 35px rgba(0,245,255,0.9)) drop-shadow(0 0 60px rgba(255,0,255,0.4))', 'drop-shadow(0 0 20px rgba(0,245,255,0.7))'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                    <h1
                        className="font-orbitron font-black neon-text-gradient select-none"
                        style={{ fontSize: 'clamp(2.5rem, 8vw, 6rem)', letterSpacing: '0.08em', lineHeight: 1.1 }}
                    >
                        TALENT<br />GUARD AI
                    </h1>
                </motion.div>

                {/* Subtitle */}
                <motion.p
                    className="font-rajdhani text-lg tracking-widest max-w-md"
                    style={{ color: 'rgba(255,255,255,0.5)' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                >
                    Next-generation AI surveillance for fair, fraud-free assessments
                </motion.p>

                {/* Stats row */}
                <motion.div
                    className="flex items-center gap-8 mt-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                >
                    {[
                        { val: '99.7%', label: 'Accuracy' },
                        { val: '<50ms', label: 'Latency' },
                        { val: '128K', label: 'Interviews' },
                    ].map((s) => (
                        <div key={s.label} className="flex flex-col items-center">
                            <span className="font-orbitron text-xl font-bold" style={{ color: '#00f5ff' }}>{s.val}</span>
                            <span className="font-mono text-xs tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>{s.label}</span>
                        </div>
                    ))}
                </motion.div>

                {/* GET STARTED button */}
                <motion.button
                    ref={btnRef}
                    onClick={handleClick}
                    className="neon-button font-orbitron font-bold text-sm tracking-[0.3em] uppercase px-14 py-5 rounded-2xl cursor-pointer mt-2"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.0 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                >
                    GET STARTED
                </motion.button>

                {/* Disclaimer */}
                <motion.p
                    className="font-mono text-xs"
                    style={{ color: 'rgba(255,255,255,0.25)' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.3 }}
                >
                    Secure · Encrypted · GDPR Compliant
                </motion.p>
            </motion.div>

            {/* Particle burst */}
            <ParticleBurst {...burst} onDone={() => setBurst(b => ({ ...b, active: false }))} />
        </div>
    );
}
