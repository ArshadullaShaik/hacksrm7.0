import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, FileText, Download, CheckCircle, AlertTriangle, XCircle, Award, Eye, Monitor, UserCheck, Activity, Code, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import CyberpunkBackground from './CyberpunkBackground';

function StatRow({ icon, label, value, highlight, warning }) {
    return (
        <div className="flex items-center justify-between py-3 border-b border-white/5">
            <div className="flex items-center gap-3">
                {icon}
                <span className="font-mono text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>{label}</span>
            </div>
            <span className="font-orbitron font-bold text-sm" style={{ color: highlight ? '#00ff88' : warning ? '#ff0055' : '#00f5ff' }}>
                {value}
            </span>
        </div>
    );
}

function QuestionRow({ index, question, transcript, score }) {
    const color = score >= 75 ? '#00ff88' : score >= 50 ? '#ffff00' : '#ff0055';
    const label = score >= 75 ? 'STRONG' : score >= 50 ? 'FAIR' : 'WEAK';
    return (
        <div className="px-3 py-2.5 rounded-lg" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.04)' }}>
            <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Q{index + 1}</span>
                <span className="font-orbitron text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: `${color}12`, border: `1px solid ${color}35`, color }}>
                    {score}% {label}
                </span>
            </div>
            <p className="font-mono text-xs mb-1" style={{ color: 'rgba(255,255,255,0.55)', lineHeight: '1.5' }}>{question}</p>
            <p className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.3)', lineHeight: '1.5' }}>
                → {transcript || '(No response)'}
            </p>
        </div>
    );
}

export default function FinalReport({ sessionData, onRestart }) {
    const [showJson, setShowJson] = useState(false);
    const [copied, setCopied] = useState(false);

    // ─── Calculate scores ───────────────────────────────────────────────────
    const integrityScore = Math.max(0, 100 - sessionData.riskScore);
    const interviewScore = sessionData.accuracyScore;
    const compositeScore = Math.round((interviewScore * 0.6) + (integrityScore * 0.4));

    let verdict = 'REVIEW';
    let verdictColor = '#ffff00';
    let VerdictIcon = AlertTriangle;

    if (compositeScore >= 75 && sessionData.riskScore < 30) {
        verdict = 'HIRE RECOMMENDED';
        verdictColor = '#00ff88';
        VerdictIcon = CheckCircle;
    } else if (sessionData.riskScore >= 70) {
        verdict = 'FLAGGED FOR REVIEW';
        verdictColor = '#ff0055';
        VerdictIcon = XCircle;
    }

    // ─── Build comprehensive JSON report ─────────────────────────────────────
    const jsonReport = useMemo(() => ({
        proctoring: {
            risk_score: sessionData.riskScore,
            gaze_deviation_percent: sessionData.gazeDeviation,
            head_turn_count: sessionData.headTurnCount,
            tab_switch_count: sessionData.tabSwitchCount,
            faces_detected: sessionData.facesDetected,
            flags: {
                excessive_gaze_deviation: sessionData.gazeDeviation > 30,
                excessive_head_turns: sessionData.headTurnCount > 5,
                tab_switching_detected: sessionData.tabSwitchCount > 0,
                multiple_faces_detected: sessionData.facesDetected > 1,
                no_face_detected: sessionData.facesDetected === 0
            },
            detection_engine: "MediaPipe Face Mesh + BlazeFace",
            detection_config: {
                gaze_tracking: "Iris landmark (468/473) + EAR blink filter",
                head_pose: "Nose-cheek yaw + forehead-chin pitch",
                smoothing: "5-frame moving average + 7-frame mode voting",
                fps: "~10 FPS"
            }
        }
    }), [sessionData]);

    const jsonString = JSON.stringify(jsonReport, null, 2);

    const handleCopy = () => {
        navigator.clipboard.writeText(jsonString);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `talentguard_report_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen w-full relative pb-20">
            <CyberpunkBackground />

            <motion.div
                className="relative z-10 max-w-5xl mx-auto pt-10 px-4 sm:px-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                        <Shield size={28} style={{ color: '#00f5ff' }} />
                        <div>
                            <h1 className="font-orbitron font-bold text-xl sm:text-2xl neon-text-gradient">SESSION REPORT</h1>
                            <p className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                                TalentGuard AI Vision · {(sessionData.questionsSummary || []).length} Questions Evaluated
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleDownload}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all hover:scale-105"
                            style={{ background: 'rgba(0,245,255,0.1)', border: '1px solid rgba(0,245,255,0.3)', color: '#00f5ff' }}
                        >
                            <Download size={14} />
                            <span className="font-orbitron text-xs font-bold tracking-widest">JSON</span>
                        </button>
                        <button
                            onClick={() => window.print()}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all hover:scale-105"
                            style={{ background: 'rgba(255,0,255,0.08)', border: '1px solid rgba(255,0,255,0.3)', color: '#ff00ff' }}
                        >
                            <FileText size={14} />
                            <span className="font-orbitron text-xs font-bold tracking-widest">PRINT</span>
                        </button>
                    </div>
                </div>

                {/* ─── Score Cards ─────────────────────────────────────── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {[
                        { label: 'INTEGRITY', value: `${integrityScore}%`, color: '#00f5ff', Icon: Shield },
                        { label: 'INTERVIEW', value: `${interviewScore}%`, color: '#ff00ff', Icon: Award },
                        { label: 'COMPOSITE', value: `${compositeScore}%`, color: '#8b00ff', Icon: Activity },
                        { label: 'VERDICT', value: verdict, color: verdictColor, Icon: VerdictIcon, small: true },
                    ].map(c => (
                        <div key={c.label} className="glass-card holographic rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                            <c.Icon size={18} style={{ color: c.color, marginBottom: 6 }} />
                            <span className="font-mono text-xs tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>{c.label}</span>
                            <div className={`font-orbitron font-bold mt-1 ${c.small ? 'text-sm' : 'text-2xl'}`}
                                style={{ color: c.color, textShadow: `0 0 12px ${c.color}66` }}>
                                {c.value}
                            </div>
                        </div>
                    ))}
                </div>

                {/* ─── Two Column: Proctoring + Q&A Breakdown ──────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Vision Model Metrics */}
                    <div className="glass-card rounded-2xl p-5">
                        <h3 className="font-orbitron font-bold text-sm tracking-widest mb-3 flex items-center gap-2" style={{ color: '#00f5ff' }}>
                            <Monitor size={15} /> PROCTORING METRICS
                        </h3>
                        <StatRow icon={<Eye size={14} style={{ color: 'rgba(255,255,255,0.4)' }} />}
                            label="Gaze Deviation" value={`${sessionData.gazeDeviation}%`}
                            warning={sessionData.gazeDeviation > 30} highlight={sessionData.gazeDeviation <= 10} />
                        <StatRow icon={<Activity size={14} style={{ color: 'rgba(255,255,255,0.4)' }} />}
                            label="Head Turns" value={`${sessionData.headTurnCount} events`}
                            warning={sessionData.headTurnCount > 5} highlight={sessionData.headTurnCount <= 2} />
                        <StatRow icon={<Monitor size={14} style={{ color: 'rgba(255,255,255,0.4)' }} />}
                            label="Tab Switches" value={`${sessionData.tabSwitchCount} events`}
                            warning={sessionData.tabSwitchCount > 0} highlight={sessionData.tabSwitchCount === 0} />
                        <StatRow icon={<UserCheck size={14} style={{ color: 'rgba(255,255,255,0.4)' }} />}
                            label="Face Status" value={sessionData.facesDetected === 1 ? 'Clear' : sessionData.facesDetected > 1 ? 'Multi-Face' : 'No Face'}
                            warning={sessionData.facesDetected !== 1} highlight={sessionData.facesDetected === 1} />
                    </div>

                    {/* Interview Q&A Breakdown */}
                    <div className="glass-card rounded-2xl p-5 flex flex-col">
                        <h3 className="font-orbitron font-bold text-sm tracking-widest mb-3 flex items-center gap-2" style={{ color: '#ff00ff' }}>
                            <FileText size={15} /> INTERVIEW Q&A ({(sessionData.questionsSummary || []).length})
                        </h3>
                        {(sessionData.questionsSummary || []).length === 0 ? (
                            <div className="flex-1 flex items-center justify-center">
                                <p className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>No questions answered.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2 flex-1 overflow-y-auto pr-1" style={{ maxHeight: 320, scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}>
                                {(sessionData.questionsSummary || []).map((q, i) => (
                                    <QuestionRow key={i} index={i} question={q.question} transcript={q.transcript} score={q.score} />
                                ))}
                            </div>
                        )}
                        {(sessionData.questionsSummary || []).length > 0 && (
                            <div className="mt-3 pt-3 border-t flex items-center justify-between" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                                <div className="flex gap-3">
                                    {['strong', 'fair', 'weak'].map(tier => {
                                        const qs = sessionData.questionsSummary || [];
                                        const count = tier === 'strong' ? qs.filter(q => q.score >= 75).length
                                            : tier === 'fair' ? qs.filter(q => q.score >= 50 && q.score < 75).length
                                                : qs.filter(q => q.score < 50).length;
                                        const col = tier === 'strong' ? '#00ff88' : tier === 'fair' ? '#ffff00' : '#ff0055';
                                        return (
                                            <span key={tier} className="font-mono text-xs" style={{ color: col }}>
                                                {count} {tier.toUpperCase()}
                                            </span>
                                        );
                                    })}
                                </div>
                                <span className="font-orbitron font-bold text-sm" style={{ color: '#ff00ff' }}>
                                    AVG {interviewScore}%
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* ─── JSON Data Toggle ────────────────────────────────── */}
                <div className="glass-card rounded-2xl overflow-hidden mb-8">
                    <button
                        onClick={() => setShowJson(s => !s)}
                        className="w-full flex items-center justify-between px-5 py-3 transition-colors hover:bg-white/[0.02]"
                    >
                        <div className="flex items-center gap-2">
                            <Code size={15} style={{ color: '#00f5ff' }} />
                            <span className="font-orbitron font-bold text-sm tracking-widest" style={{ color: '#00f5ff' }}>
                                RAW JSON DATA
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            {showJson && (
                                <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                                    <button onClick={handleCopy}
                                        className="font-mono text-xs px-3 py-1 rounded-lg transition-all hover:scale-105"
                                        style={{ background: 'rgba(0,245,255,0.08)', border: '1px solid rgba(0,245,255,0.25)', color: '#00f5ff' }}>
                                        {copied ? <><Check size={10} className="inline mr-1" />Copied</> : <><Copy size={10} className="inline mr-1" />Copy</>}
                                    </button>
                                    <button onClick={handleDownload}
                                        className="font-mono text-xs px-3 py-1 rounded-lg transition-all hover:scale-105"
                                        style={{ background: 'rgba(255,0,255,0.08)', border: '1px solid rgba(255,0,255,0.25)', color: '#ff00ff' }}>
                                        <Download size={10} className="inline mr-1" />Download
                                    </button>
                                </div>
                            )}
                            {showJson ? <ChevronUp size={16} style={{ color: 'rgba(255,255,255,0.3)' }} /> : <ChevronDown size={16} style={{ color: 'rgba(255,255,255,0.3)' }} />}
                        </div>
                    </button>

                    <AnimatePresence>
                        {showJson && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                                    <pre className="p-5 overflow-x-auto text-xs font-mono leading-relaxed"
                                        style={{ color: 'rgba(255,255,255,0.65)', maxHeight: 500, overflowY: 'auto', scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}>
                                        <code>{jsonString}</code>
                                    </pre>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Actions */}
                <div className="flex justify-center gap-4">
                    <button onClick={onRestart}
                        className="px-8 py-3 rounded-xl font-orbitron font-bold text-sm tracking-widest transition-all hover:scale-105"
                        style={{ background: 'rgba(0,245,255,0.06)', border: '1px solid rgba(0,245,255,0.3)', color: '#00f5ff' }}>
                        NEW SESSION
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
