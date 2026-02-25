import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, AlertTriangle, Eye, UserCheck } from 'lucide-react';
import RiskMeter from './RiskMeter';
import AIOrb from './AIOrb';
import AccuracyMeter from './AccuracyMeter';
import QuestionOverlay from './QuestionOverlay';
import useFaceDetection from '../hooks/useFaceDetection';

// ─── Border flash color map ───────────────────────────────────────────────────
function getBorderStyle(answerStatus, base) {
    if (answerStatus === 'correct') return { color: '#00ff88', glow: 'rgba(0,255,136,0.6)' };
    if (answerStatus === 'incorrect') return { color: '#ff0055', glow: 'rgba(255,0,85,0.6)' };
    return { color: base || 'rgba(0,245,255,0.15)', glow: 'rgba(0,245,255,0.05)' };
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function GazeBadge({ direction }) {
    const map = {
        CENTER: { color: '#00ff88', bg: 'rgba(0,255,136,0.1)', border: 'rgba(0,255,136,0.3)', icon: '◎' },
        LEFT: { color: '#ffff00', bg: 'rgba(255,255,0,0.1)', border: 'rgba(255,255,0,0.3)', icon: '◀' },
        RIGHT: { color: '#ffff00', bg: 'rgba(255,255,0,0.1)', border: 'rgba(255,255,0,0.3)', icon: '▶' },
        AWAY: { color: '#ff0055', bg: 'rgba(255,0,85,0.1)', border: 'rgba(255,0,85,0.3)', icon: '✕' },
    };
    const style = map[direction?.toUpperCase()] || map['CENTER'];
    return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg backdrop-blur-sm"
            style={{ background: style.bg, border: `1px solid ${style.border}` }}>
            <span style={{ color: style.color, fontSize: 10 }}>{style.icon}</span>
            <span className="font-mono text-xs" style={{ color: style.color }}>{direction?.toUpperCase() ?? 'CENTER'}</span>
        </div>
    );
}

function FaceBoundingBox({ facesDetected }) {
    if (facesDetected === 0) return null;
    const color = facesDetected === 1 ? '#00ff88' : '#ff0055';
    return (
        <motion.div
            className="absolute pointer-events-none rounded-lg"
            style={{
                top: '15%', left: '25%', width: '50%', height: '65%',
                border: `2px solid ${color}`, boxShadow: `0 0 15px ${color}60, inset 0 0 15px ${color}10`
            }}
            animate={{ opacity: [0.7, 1, 0.7], boxShadow: [`0 0 10px ${color}50`, `0 0 20px ${color}90`, `0 0 10px ${color}50`] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
            {[
                { top: -2, left: -2, borderTop: `2px solid ${color}`, borderLeft: `2px solid ${color}` },
                { top: -2, right: -2, borderTop: `2px solid ${color}`, borderRight: `2px solid ${color}` },
                { bottom: -2, left: -2, borderBottom: `2px solid ${color}`, borderLeft: `2px solid ${color}` },
                { bottom: -2, right: -2, borderBottom: `2px solid ${color}`, borderRight: `2px solid ${color}` },
            ].map((s, i) => <div key={i} className="absolute w-4 h-4 rounded-sm" style={s} />)}
            <div className="absolute -top-6 left-0 font-mono text-xs px-2 py-0.5 rounded"
                style={{ background: `${color}20`, border: `1px solid ${color}50`, color }}>
                FACE-{String(facesDetected).padStart(2, '0')} {facesDetected > 1 ? '⚠' : '✓'}
            </div>
        </motion.div>
    );
}

function StatPill({ label, value, highlight }) {
    return (
        <div className="flex flex-col gap-0.5 px-3 py-2 rounded-xl"
            style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <span className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</span>
            <span className="font-orbitron text-sm font-bold"
                style={{ color: highlight || '#00f5ff', textShadow: `0 0 8px ${highlight || '#00f5ff'}88` }}>
                {value}
            </span>
        </div>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function WebcamFeed({
    riskScore,
    // ── NEW AI assistant props ──
    currentQuestion = '',
    isAsking = false,
    accuracyScore = 0,
    answerStatus = 'neutral',
    // ── Callback to report detection data to parent ──
    onDetectionUpdate,
}) {
    const videoRef = useRef(null);
    const [camActive, setCamActive] = useState(false);
    const [camError, setCamError] = useState(false);

    // ── MediaPipe hook — runs real face detection on the video stream ──
    const { gazeDirection, headStatus, facesDetected, isLoaded } = useFaceDetection(videoRef, camActive);

    // Report detection data upstream to App.jsx
    useEffect(() => {
        if (onDetectionUpdate) {
            onDetectionUpdate({ gazeDirection, headStatus, facesDetected });
        }
    }, [gazeDirection, headStatus, facesDetected, onDetectionUpdate]);

    // Track previous answerStatus to detect changes & trigger flash
    const [flashStatus, setFlashStatus] = useState('neutral');
    const flashTimerRef = useRef(null);
    useEffect(() => {
        if (answerStatus === 'neutral') return;
        setFlashStatus(answerStatus);
        clearTimeout(flashTimerRef.current);
        flashTimerRef.current = setTimeout(() => setFlashStatus('neutral'), 1600);
        return () => clearTimeout(flashTimerRef.current);
    }, [answerStatus]);

    // Camera
    useEffect(() => {
        navigator.mediaDevices?.getUserMedia({ video: { width: 640, height: 480 } })
            .then(stream => {
                if (videoRef.current) { videoRef.current.srcObject = stream; setCamActive(true); }
            })
            .catch(() => setCamError(true));
        return () => {
            if (videoRef.current?.srcObject)
                videoRef.current.srcObject.getTracks().forEach(t => t.stop());
        };
    }, []);

    const headColor = headStatus?.toUpperCase() === 'NORMAL' ? '#00ff88' : '#ff0055';
    const border = getBorderStyle(flashStatus, 'rgba(0,245,255,0.18)');

    return (
        <motion.div
            className="glass-card holographic rounded-2xl p-5 flex flex-col gap-4 h-full"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
        >
            {/* Card header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Camera size={16} style={{ color: '#00f5ff', filter: 'drop-shadow(0 0 4px #00f5ff)' }} />
                    <span className="font-orbitron text-sm font-bold tracking-wider" style={{ color: '#00f5ff' }}>
                        LIVE MONITOR
                    </span>
                    <motion.div className="w-2 h-2 rounded-full"
                        style={{ background: '#ff0055', boxShadow: '0 0 8px #ff0055' }}
                        animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1, repeat: Infinity }} />
                    {/* MediaPipe status */}
                    {isLoaded && (
                        <span className="font-mono text-xs px-2 py-0.5 rounded-full"
                            style={{ background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.3)', color: '#00ff88' }}>
                            MediaPipe Active
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {isAsking && (
                        <motion.div
                            className="font-mono text-xs px-2 py-0.5 rounded-lg tracking-widest"
                            style={{ background: 'rgba(0,245,255,0.08)', border: '1px solid rgba(0,245,255,0.3)', color: '#00f5ff' }}
                            animate={{ opacity: [0.6, 1, 0.6] }}
                            transition={{ duration: 1.2, repeat: Infinity }}
                        >
                            ◈ AI ASKING
                        </motion.div>
                    )}
                    <span className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        {new Date().toLocaleTimeString()}
                    </span>
                </div>
            </div>

            {/* ─── Video container ──────────────────────────────────────── */}
            <motion.div
                className="relative rounded-xl overflow-hidden flex-1"
                animate={{
                    borderColor: border.color,
                    boxShadow: flashStatus !== 'neutral'
                        ? `0 0 0 2px ${border.color}, 0 0 24px ${border.glow}, 0 0 50px ${border.glow.replace('0.6', '0.2')}`
                        : `0 0 0 1px rgba(0,245,255,0.18), 0 0 15px rgba(0,245,255,0.05)`,
                }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                style={{
                    minHeight: 280,
                    background: '#000',
                    borderRadius: 12,
                    border: `1px solid ${border.color}`,
                    boxShadow: `0 0 0 1px rgba(0,245,255,0.18)`,
                    overflow: 'hidden',
                    position: 'relative',
                }}
            >

                {/* Live video */}
                <video ref={videoRef} autoPlay muted playsInline
                    className="w-full h-full object-cover absolute inset-0"
                    style={{ opacity: camActive ? 1 : 0 }} />

                {/* Cinematic dark overlay */}
                <div className="absolute inset-0 pointer-events-none"
                    style={{ background: 'rgba(0,0,0,0.22)', zIndex: 1 }} />

                {/* Camera placeholder */}
                {!camActive && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-0"
                        style={{ background: 'radial-gradient(circle at center, #0a0a2a, #020207)' }}>
                        {camError ? (
                            <>
                                <AlertTriangle size={40} style={{ color: '#ff0055', filter: 'drop-shadow(0 0 10px #ff0055)' }} />
                                <p className="font-mono text-xs text-center" style={{ color: 'rgba(255,255,255,0.4)' }}>
                                    Camera access denied<br />(running demo mode)
                                </p>
                            </>
                        ) : (
                            <>
                                <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }}>
                                    <Camera size={48} style={{ color: '#00f5ff44' }} />
                                </motion.div>
                                <p className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>Connecting camera...</p>
                            </>
                        )}
                        {/* Demo face SVG */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-15">
                            <svg viewBox="0 0 200 200" width="160">
                                <circle cx="100" cy="75" r="45" fill="none" stroke="#00f5ff" strokeWidth="1" />
                                <circle cx="85" cy="70" r="6" fill="#00f5ff" opacity="0.6" />
                                <circle cx="115" cy="70" r="6" fill="#00f5ff" opacity="0.6" />
                                <path d="M 80 95 Q 100 110 120 95" fill="none" stroke="#00f5ff" strokeWidth="2" opacity="0.6" />
                            </svg>
                        </div>
                    </div>
                )}

                {/* ─── Overlays (z > cinematic overlay) ──────────────────── */}

                {/* Face bounding box */}
                <div className="absolute inset-0" style={{ zIndex: 2 }}>
                    <FaceBoundingBox facesDetected={facesDetected} />
                </div>

                {/* Scanning line */}
                <motion.div
                    className="absolute left-0 right-0 h-0.5 pointer-events-none"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(0,245,255,0.35), transparent)', zIndex: 3 }}
                    animate={{ y: [0, 280, 0] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: 'linear', repeatDelay: 1.5 }}
                />

                {/* Inner border glow */}
                <div className="absolute inset-0 pointer-events-none rounded-xl"
                    style={{ border: '1px solid rgba(0,245,255,0.12)', boxShadow: 'inset 0 0 25px rgba(0,245,255,0.04)', zIndex: 2 }} />

                {/* ─── TOP HUD row ───────────────────────────────────────── */}
                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-start justify-between pointer-events-none" style={{ zIndex: 4 }}>
                    <GazeBadge direction={gazeDirection} />
                    <div className="flex flex-col items-center" style={{ paddingBottom: 8 }}>
                        <AIOrb isAsking={isAsking} size={80} />
                    </div>
                </div>

                {/* ─── ACCURACY METER — bottom-left ─────────────────────── */}
                <div className="absolute pointer-events-none" style={{ bottom: 44, left: 10, zIndex: 4 }}>
                    <AccuracyMeter accuracyScore={accuracyScore} />
                </div>

                {/* ─── Face count — top-right area below orb ────────────── */}
                <div className="absolute pointer-events-none" style={{ top: 98, right: 10, zIndex: 4 }}>
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg backdrop-blur-sm"
                        style={{
                            background: facesDetected !== 1 ? 'rgba(255,0,85,0.15)' : 'rgba(0,255,136,0.1)',
                            border: `1px solid ${facesDetected !== 1 ? 'rgba(255,0,85,0.4)' : 'rgba(0,255,136,0.3)'}`,
                        }}>
                        <UserCheck size={10} style={{ color: facesDetected !== 1 ? '#ff0055' : '#00ff88' }} />
                        <span className="font-mono text-xs" style={{ color: facesDetected !== 1 ? '#ff0055' : '#00ff88' }}>
                            {facesDetected} {facesDetected === 1 ? 'FACE' : 'FACES'}
                        </span>
                    </div>
                </div>

                {/* ─── QUESTION OVERLAY — bottom center ─────────────────── */}
                <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 5 }}>
                    <QuestionOverlay currentQuestion={currentQuestion} isAsking={isAsking} />
                </div>

                {/* ─── BOTTOM HUD strip ─────────────────────────────────── */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none" style={{ zIndex: 4 }}>
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg backdrop-blur-sm"
                        style={{ background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <span className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>HEAD:</span>
                        <span className="font-mono text-xs font-bold" style={{ color: headColor, textShadow: `0 0 6px ${headColor}` }}>
                            {headStatus?.toUpperCase() ?? 'NORMAL'}
                        </span>
                    </div>
                    <div className="px-2 py-1 rounded-lg backdrop-blur-sm"
                        style={{ background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <span className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>MediaPipe · AI Proctored</span>
                    </div>
                </div>

                {/* Answer flash indicator badge */}
                <AnimatePresence>
                    {flashStatus !== 'neutral' && (
                        <motion.div
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none font-orbitron font-bold text-xs tracking-widest px-4 py-2 rounded-full"
                            style={{
                                background: flashStatus === 'correct' ? 'rgba(0,255,136,0.15)' : 'rgba(255,0,85,0.15)',
                                border: `1px solid ${flashStatus === 'correct' ? '#00ff88' : '#ff0055'}`,
                                color: flashStatus === 'correct' ? '#00ff88' : '#ff0055',
                                boxShadow: `0 0 20px ${flashStatus === 'correct' ? 'rgba(0,255,136,0.5)' : 'rgba(255,0,85,0.5)'}`,
                                zIndex: 6,
                            }}
                            initial={{ opacity: 0, scale: 0.7 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1 }}
                            transition={{ duration: 0.25 }}
                        >
                            {flashStatus === 'correct' ? '✓ GOOD ANSWER' : '✕ LOW CONFIDENCE'}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* ─── Bottom stats row ─────────────────────────────────────── */}
            <div className="flex gap-3 justify-between flex-wrap">
                <StatPill label="GAZE" value={gazeDirection?.toUpperCase() || 'CENTER'} highlight={gazeDirection?.toUpperCase() === 'CENTER' ? '#00ff88' : '#ffff00'} />
                <StatPill label="HEAD POSE" value={headStatus?.toUpperCase() || 'NORMAL'} highlight={headStatus?.toUpperCase() === 'NORMAL' ? '#00ff88' : '#ff0055'} />
                <StatPill label="FACES" value={facesDetected} highlight={facesDetected === 1 ? '#00ff88' : '#ff0055'} />
            </div>

            {/* ─── Risk meter ───────────────────────────────────────────── */}
            <div className="flex justify-center pt-2 border-t" style={{ borderColor: 'rgba(0,245,255,0.1)' }}>
                <div className="flex flex-col items-center gap-1">
                    <span className="font-mono text-xs tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>INTEGRITY RISK METER</span>
                    <RiskMeter score={riskScore} />
                </div>
            </div>
        </motion.div>
    );
}
