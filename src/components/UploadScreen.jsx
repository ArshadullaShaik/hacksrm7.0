import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, CheckCircle, Clock } from 'lucide-react';
import CyberpunkBackground from './CyberpunkBackground';

const STEPS = [
    { text: 'Analyzing Resume...', duration: 1800 },
    { text: 'Fetching Job Details...', duration: 1600 },
    { text: 'Matching Profile...', duration: 1400 },
    { text: 'Generating Interview Questions...', duration: 1200 },
];

const MATRIX_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*アイウエオカキクケコ'.split('');

function MatrixRain() {
    const [cols] = useState(() =>
        Array.from({ length: 18 }, (_, i) => ({
            id: i,
            x: (i / 18) * 100,
            chars: Array.from({ length: 10 }, () => MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)]),
            speed: 0.8 + Math.random() * 1.5,
            delay: Math.random() * 2,
        }))
    );
    const [tick, setTick] = useState(0);
    useEffect(() => {
        const id = setInterval(() => setTick(t => t + 1), 100);
        return () => clearInterval(id);
    }, []);

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none font-mono text-xs opacity-25">
            {cols.map((col) => (
                <motion.div
                    key={col.id}
                    className="absolute top-0 flex flex-col gap-1"
                    style={{ left: `${col.x}%` }}
                    animate={{ y: ['-100%', '120%'] }}
                    transition={{ duration: col.speed * 4, delay: col.delay, repeat: Infinity, ease: 'linear' }}
                >
                    {col.chars.map((_, ci) => {
                        const char = MATRIX_CHARS[Math.floor((tick + ci * 3 + col.id * 7) % MATRIX_CHARS.length)];
                        return (
                            <span key={ci} className="matrix-char leading-4" style={{ opacity: ci === 0 ? 1 : (10 - ci) / 10 }}>
                                {char}
                            </span>
                        );
                    })}
                </motion.div>
            ))}
        </div>
    );
}

function AnalyzingAnimation({ progress, stepIndex }) {
    return (
        <div className="flex flex-col items-center gap-6 w-full">
            <div className="relative flex items-center justify-center" style={{ width: 130, height: 130 }}>
                <motion.div className="absolute rounded-full neon-ring-1" style={{ width: 120, height: 120 }}
                    animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} />
                <motion.div className="absolute rounded-full neon-ring-2" style={{ width: 90, height: 90 }}
                    animate={{ rotate: -360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }} />
                <motion.div className="absolute rounded-full"
                    style={{ width: 60, height: 60, border: '1px solid rgba(0,255,136,0.5)', boxShadow: '0 0 15px rgba(0,255,136,0.3)' }}
                    animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }} />
                <div className="font-orbitron font-bold text-xl" style={{ color: '#00f5ff', textShadow: '0 0 15px #00f5ff' }}>
                    {Math.round(progress)}%
                </div>
            </div>
            <AnimatePresence mode="wait">
                <motion.div key={stepIndex}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="font-mono text-sm tracking-wider text-center"
                    style={{ color: '#00f5ff', textShadow: '0 0 8px #00f5ff' }}>
                    {STEPS[Math.min(stepIndex, STEPS.length - 1)]?.text}
                </motion.div>
            </AnimatePresence>
            <div className="flex flex-col gap-2 w-full max-w-xs">
                {STEPS.map((step, i) => {
                    const stepProgress = i < stepIndex ? 100 : i === stepIndex ? (progress % (100 / STEPS.length)) * STEPS.length : 0;
                    return (
                        <div key={i} className="flex items-center gap-3">
                            <span className="font-mono text-xs w-4 text-right" style={{ color: i <= stepIndex ? '#00f5ff' : 'rgba(255,255,255,0.2)' }}>
                                {i < stepIndex ? '✓' : i === stepIndex ? '▶' : '○'}
                            </span>
                            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,245,255,0.1)' }}>
                                <motion.div className="h-full rounded-full"
                                    style={{ background: 'linear-gradient(90deg, #00f5ff, #ff00ff)', boxShadow: '0 0 6px #00f5ff' }}
                                    animate={{ width: `${i < stepIndex ? 100 : i === stepIndex ? Math.max(5, stepProgress) : 0}%` }}
                                    transition={{ ease: 'easeOut' }} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default function UploadScreen({ onComplete }) {
    const [phase, setPhase] = useState('upload'); // upload | analyzing | done
    const [fileName, setFileName] = useState('');
    const [progress, setProgress] = useState(0);
    const [stepIndex, setStepIndex] = useState(0);
    const [dragOver, setDragOver] = useState(false);

    const startAnalysis = useCallback((name, file) => {
        setFileName(name);
        setPhase('analyzing');
        let prog = 0;
        let step = 0;
        const interval = setInterval(() => {
            prog += 1.1;
            setProgress(prog);
            const newStep = Math.floor((prog / 100) * STEPS.length);
            if (newStep !== step && newStep < STEPS.length) { step = newStep; setStepIndex(step); }
            if (prog >= 100) {
                clearInterval(interval);
                setProgress(100);
                setTimeout(() => {
                    setPhase('done');
                    setTimeout(() => onComplete(file), 800);
                }, 400);
            }
        }, 70);
    }, [onComplete]);

    const handleFile = (file) => {
        if (file) {
            startAnalysis(file.name, file);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault(); setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    };

    const handleChange = (e) => {
        const file = e.target.files[0];
        if (file) handleFile(file);
    };

    const handleDemoUpload = () => {
        startAnalysis('resume_candidate.pdf', 'demo');
    };

    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden">
            <CyberpunkBackground />
            {phase === 'analyzing' && <MatrixRain />}

            <motion.div className="relative z-10 w-full max-w-lg mx-6"
                initial={{ opacity: 0, scale: 0.85, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}>

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-2 mb-3">
                        <div className="h-px flex-1 max-w-16" style={{ background: 'linear-gradient(90deg, transparent, #00f5ff)' }} />
                        <span className="font-orbitron text-xs tracking-widest" style={{ color: '#00f5ff88' }}>
                            {phase === 'upload' ? 'STEP 01' : 'PROCESSING'}
                        </span>
                        <div className="h-px flex-1 max-w-16" style={{ background: 'linear-gradient(90deg, #00f5ff, transparent)' }} />
                    </div>
                    <h2 className="font-orbitron font-bold text-3xl neon-text-gradient mb-2">
                        {phase === 'upload' ? 'Upload Your Resume' : phase === 'done' ? 'Profile Ready' : 'Analyzing Profile'}
                    </h2>
                    <p className="font-rajdhani text-sm tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        {phase === 'upload' ? 'PDF or DOCX · Max 10MB' : phase === 'analyzing' ? 'Fetching backend job data and generating questions...' : 'Launching interview suite...'}
                    </p>
                </div>

                {/* 15-min session info badge */}
                {(phase === 'upload') && (
                    <motion.div
                        className="flex items-center justify-center gap-4 mb-5 flex-wrap"
                        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                        {[
                            { icon: <Clock size={12} />, text: '15 Min Session' },
                            { icon: <span style={{ fontSize: 10 }}>🎙️</span>, text: 'Voice + Text' },
                            { icon: <span style={{ fontSize: 10 }}>🔍</span>, text: 'AI Proctored' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-xs"
                                style={{ background: 'rgba(0,245,255,0.06)', border: '1px solid rgba(0,245,255,0.2)', color: '#00f5ff88' }}>
                                {item.icon} {item.text}
                            </div>
                        ))}
                    </motion.div>
                )}

                {/* Card */}
                <div className="glass-card holographic rounded-2xl p-8">
                    <AnimatePresence mode="wait">

                        {/* PHASE: Upload resume */}
                        {phase === 'upload' && (
                            <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="flex flex-col items-center gap-5">
                                <div
                                    className={`relative w-full border-2 border-dashed rounded-xl p-10 flex flex-col items-center gap-4 cursor-pointer transition-all duration-300 ${dragOver ? 'scale-105' : ''}`}
                                    style={{
                                        borderColor: dragOver ? '#00f5ff' : 'rgba(0,245,255,0.3)',
                                        background: dragOver ? 'rgba(0,245,255,0.06)' : 'rgba(0,245,255,0.02)',
                                        boxShadow: dragOver ? '0 0 30px rgba(0,245,255,0.2), inset 0 0 30px rgba(0,245,255,0.05)' : 'none',
                                    }}
                                    onDrop={handleDrop}
                                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                    onDragLeave={() => setDragOver(false)}
                                    onClick={handleDemoUpload}>
                                    <motion.div animate={{ y: [-4, 4, -4] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}>
                                        <Upload size={48} style={{ color: '#00f5ff', filter: 'drop-shadow(0 0 10px #00f5ff)' }} />
                                    </motion.div>
                                    <div className="text-center">
                                        <p className="font-rajdhani font-semibold text-lg" style={{ color: 'rgba(255,255,255,0.7)' }}>Drop your resume here</p>
                                        <p className="font-mono text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>or click to browse</p>
                                    </div>
                                    <input type="file" accept=".pdf,.doc,.docx" className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={handleChange} onClick={(e) => e.stopPropagation()} />
                                </div>
                                <div className="flex gap-3">
                                    {['PDF', 'DOCX', 'DOC'].map((fmt) => (
                                        <span key={fmt} className="font-mono text-xs px-3 py-1 rounded-lg"
                                            style={{ background: 'rgba(0,245,255,0.08)', border: '1px solid rgba(0,245,255,0.2)', color: '#00f5ff88' }}>
                                            {fmt}
                                        </span>
                                    ))}
                                </div>
                                <p className="font-mono text-xs text-center" style={{ color: 'rgba(255,255,255,0.2)' }}>
                                    ✦ Click the upload area to start a demo session
                                </p>
                            </motion.div>
                        )}

                        {/* PHASE: Analyzing */}
                        {phase === 'analyzing' && (
                            <motion.div key="analyzing" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                                <AnalyzingAnimation progress={progress} stepIndex={stepIndex} />
                            </motion.div>
                        )}

                        {/* PHASE: Done */}
                        {phase === 'done' && (
                            <motion.div key="done" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center gap-4 py-6">
                                <motion.div animate={{ scale: [0, 1.2, 1] }} transition={{ duration: 0.5 }}>
                                    <CheckCircle size={72} style={{ color: '#00ff88', filter: 'drop-shadow(0 0 20px #00ff88)' }} />
                                </motion.div>
                                <p className="font-orbitron font-bold text-xl" style={{ color: '#00ff88', textShadow: '0 0 15px #00ff88' }}>
                                    Questions Ready
                                </p>
                                <p className="font-mono text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Launching interview suite...</p>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
