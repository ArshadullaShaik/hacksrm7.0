import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Shield, Clock, Wifi, XCircle, Volume2, VolumeX } from 'lucide-react';

export default function TopBar({ onEndSession, audioEnabled, onToggleAudio, timeLeft, isListening }) {
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    const timeString = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    const isUrgent = timeLeft <= 300; // <= 5 mins

    return (
        <motion.div
            className="fixed top-0 left-0 right-0 z-50"
            style={{
                background: 'rgba(2,2,7,0.85)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(0,245,255,0.15)',
                boxShadow: '0 1px 0 rgba(0,245,255,0.1), 0 4px 20px rgba(0,0,0,0.5)',
            }}
            initial={{ y: -80 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
        >
            <div className="flex items-center justify-between px-6 py-3 max-w-screen-2xl mx-auto">
                {/* Left: logo */}
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                            className="w-8 h-8 rounded-full flex items-center justify-center"
                            style={{ border: '1.5px solid rgba(0,245,255,0.6)', boxShadow: '0 0 10px rgba(0,245,255,0.4)' }}
                        >
                            <Shield size={14} style={{ color: '#00f5ff' }} />
                        </motion.div>
                    </div>
                    <span className="font-orbitron font-bold text-xs tracking-widest hidden sm:block"
                        style={{ color: '#00f5ff', textShadow: '0 0 8px #00f5ff88' }}>
                        TALENTGUARD<span style={{ color: '#ff00ff' }}> AI</span>
                    </span>
                </div>

                {/* Center: App name */}
                <div className="absolute left-1/2 transform -translate-x-1/2">
                    <h2 className="font-orbitron font-bold text-sm tracking-[0.25em] hidden md:block"
                        style={{
                            background: 'linear-gradient(135deg, #00f5ff, #ff00ff)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            filter: 'drop-shadow(0 0 8px rgba(0,245,255,0.4))',
                        }}>
                        TALENTGUARD AI
                    </h2>
                </div>

                {/* Right: controls */}
                <div className="flex items-center gap-3 sm:gap-4">
                    {/* Audio toggle */}
                    <button
                        onClick={onToggleAudio}
                        className="p-2 rounded-lg transition-all hover:scale-110"
                        style={{
                            background: 'rgba(0,245,255,0.05)',
                            border: '1px solid rgba(0,245,255,0.15)',
                            color: audioEnabled ? '#00f5ff' : 'rgba(255,255,255,0.3)',
                        }}
                        title={audioEnabled ? 'Mute ambient sound' : 'Enable ambient sound'}
                    >
                        {audioEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                    </button>

                    {/* Timer */}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                        style={{
                            background: isUrgent ? 'rgba(255,0,85,0.1)' : 'rgba(0,245,255,0.06)',
                            border: `1px solid ${isUrgent ? 'rgba(255,0,85,0.3)' : 'rgba(0,245,255,0.15)'}`
                        }}>
                        <Clock size={12} style={{ color: isUrgent ? '#ff0055' : '#00f5ff88' }} />
                        <span className="font-mono text-sm tabular-nums"
                            style={{
                                color: isUrgent ? '#ff0055' : '#00f5ff',
                                textShadow: `0 0 6px ${isUrgent ? 'rgba(255,0,85,0.6)' : 'rgba(0,245,255,0.4)'}`
                            }}>
                            {timeString}
                        </span>
                    </div>

                    {/* Mic / Live status */}
                    <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors`}
                        style={{
                            background: isListening ? 'rgba(0,255,136,0.1)' : 'rgba(0,255,136,0.02)',
                            border: `1px solid ${isListening ? 'rgba(0,255,136,0.4)' : 'rgba(0,255,136,0.1)'}`
                        }}>
                        <span
                            className="status-dot w-2 h-2 rounded-full"
                            style={{
                                background: isListening ? '#00ff88' : 'rgba(0,255,136,0.3)',
                                boxShadow: isListening ? '0 0 8px #00ff88' : 'none',
                                animation: isListening ? 'pulse-green 1.5s infinite' : 'none'
                            }}
                        />
                        <span className="font-mono text-xs whitespace-nowrap transition-colors" style={{ color: isListening ? '#00ff88' : 'rgba(0,255,136,0.4)' }}>
                            {isListening ? 'Listening...' : 'Monitoring Active'}
                        </span>
                    </div>

                    {/* Network indicator */}
                    <div className="hidden sm:flex items-center gap-1.5">
                        <Wifi size={14} style={{ color: 'rgba(0,255,136,0.6)' }} />
                    </div>

                    {/* End session */}
                    <button
                        onClick={onEndSession}
                        className="neon-button-red font-orbitron font-bold text-xs tracking-wider px-4 py-2 rounded-xl flex items-center gap-2"
                    >
                        <XCircle size={14} />
                        <span className="hidden sm:inline">END SESSION</span>
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
