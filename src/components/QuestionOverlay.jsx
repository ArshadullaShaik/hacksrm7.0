import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu } from 'lucide-react';

// Typewriter hook: animates text character by character
function useTypewriter(text, isActive, speed = 28) {
    const [displayed, setDisplayed] = useState('');
    const [done, setDone] = useState(false);
    const timerRef = useRef(null);

    useEffect(() => {
        if (!isActive || !text) {
            setDisplayed('');
            setDone(false);
            return;
        }
        setDisplayed('');
        setDone(false);
        let i = 0;
        timerRef.current = setInterval(() => {
            i++;
            setDisplayed(text.slice(0, i));
            if (i >= text.length) {
                clearInterval(timerRef.current);
                setDone(true);
            }
        }, speed);
        return () => clearInterval(timerRef.current);
    }, [text, isActive, speed]);

    return { displayed, done };
}

// ─── TTS: speak question aloud via Web Speech API ────────────────────────────
function useSpeakQuestion(question, isAsking) {
    useEffect(() => {
        if (!isAsking || !question || !window.speechSynthesis) return;

        // Cancel any currently speaking utterance
        window.speechSynthesis.cancel();

        const utter = new SpeechSynthesisUtterance(question);

        // Pick a voice — prefer a deep/neutral English voice for AI feel
        const pickVoice = () => {
            const voices = window.speechSynthesis.getVoices();
            // Prefer: Google UK English Male, Microsoft David, or any en-US male
            return (
                voices.find(v => v.name.includes('Google UK English Male')) ||
                voices.find(v => v.name.toLowerCase().includes('male') && v.lang.startsWith('en')) ||
                voices.find(v => v.name.includes('David')) ||
                voices.find(v => v.lang.startsWith('en')) ||
                voices[0]
            );
        };

        // Voices may not be loaded yet — load them first
        if (window.speechSynthesis.getVoices().length === 0) {
            window.speechSynthesis.addEventListener('voiceschanged', () => {
                utter.voice = pickVoice();
            }, { once: true });
        } else {
            utter.voice = pickVoice();
        }

        // Tuning for an AI-like voice
        utter.rate = 0.88;   // slightly slower → deliberate
        utter.pitch = 0.82;   // slightly lower  → authoritative
        utter.volume = 1.0;

        // Small delay so the overlay animation is visible first
        const t = setTimeout(() => window.speechSynthesis.speak(utter), 400);

        return () => {
            clearTimeout(t);
            window.speechSynthesis.cancel();
        };
    }, [question, isAsking]);
}

export default function QuestionOverlay({ currentQuestion = '', isAsking = false }) {
    const { displayed, done } = useTypewriter(currentQuestion, isAsking, 26);

    // Speak the question aloud
    useSpeakQuestion(currentQuestion, isAsking);

    return (
        <AnimatePresence>
            {isAsking && currentQuestion && (
                <motion.div
                    key={currentQuestion}
                    className="absolute left-3 right-3 pointer-events-none"
                    style={{ bottom: '12%' }}
                    initial={{ opacity: 0, y: 12, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                >
                    {/* Glass panel */}
                    <div
                        className="rounded-xl overflow-hidden"
                        style={{
                            background: 'rgba(2, 4, 18, 0.78)',
                            backdropFilter: 'blur(14px)',
                            WebkitBackdropFilter: 'blur(14px)',
                            border: '1px solid rgba(0,245,255,0.35)',
                            boxShadow: '0 0 20px rgba(0,245,255,0.12), inset 0 0 20px rgba(0,245,255,0.03)',
                        }}
                    >
                        {/* Header strip */}
                        <div className="flex items-center gap-2 px-3 py-1.5 border-b" style={{ borderColor: 'rgba(0,245,255,0.15)', background: 'rgba(0,245,255,0.04)' }}>
                            <Cpu size={10} style={{ color: '#00f5ff', filter: 'drop-shadow(0 0 3px #00f5ff)' }} />
                            <span className="font-mono text-xs tracking-widest" style={{ color: 'rgba(0,245,255,0.7)', fontSize: 9 }}>
                                AI INTERVIEWER · CURRENT QUESTION
                            </span>
                            {/* Animated pulse dot */}
                            <motion.div
                                className="ml-auto w-1.5 h-1.5 rounded-full"
                                style={{ background: '#00f5ff', flexShrink: 0 }}
                                animate={{ opacity: [1, 0.3, 1], scale: [1, 1.4, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                            />
                        </div>

                        {/* Question text */}
                        <div className="px-3 py-2.5">
                            <p
                                className="font-rajdhani font-semibold leading-snug"
                                style={{
                                    fontSize: 13,
                                    color: 'rgba(255,255,255,0.88)',
                                    textShadow: '0 0 12px rgba(0,245,255,0.25)',
                                    minHeight: 36,
                                }}
                            >
                                {displayed}
                                {/* Blinking cursor */}
                                {!done && (
                                    <motion.span
                                        animate={{ opacity: [1, 0, 1] }}
                                        transition={{ duration: 0.6, repeat: Infinity }}
                                        style={{ color: '#00f5ff', marginLeft: 1 }}
                                    >
                                        ▍
                                    </motion.span>
                                )}
                            </p>
                        </div>

                        {/* Bottom neon accent line */}
                        <motion.div
                            className="h-px w-full"
                            animate={{ opacity: [0.4, 0.9, 0.4], scaleX: [0.8, 1, 0.8] }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                            style={{ background: 'linear-gradient(90deg, transparent, #00f5ff, #ff00ff, transparent)' }}
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
