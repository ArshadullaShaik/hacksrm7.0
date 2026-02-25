import React, { useState } from 'react';
import { motion } from 'framer-motion';
import TopBar from './TopBar';
import WebcamFeed from './WebcamFeed';
import EventLog from './EventLog';
import SessionSummary from './SessionSummary';
import CyberpunkBackground from './CyberpunkBackground';

export default function Dashboard({
    riskScore = 0,
    gazeDeviation = 0,
    headTurnCount = 0,
    tabSwitchCount = 0,
    facesDetected = 1,
    events = [],
    onEndSession,
    onDetectionUpdate,
    // AI interview props
    currentQuestion = '',
    isAsking = false,
    isListening = false,
    accuracyScore = 0,
    answerStatus = 'neutral',
    timeLeft = 900,
}) {
    const [audioEnabled, setAudioEnabled] = useState(false);

    return (
        <div className="min-h-screen w-full relative">
            <CyberpunkBackground />

            <TopBar
                onEndSession={onEndSession}
                audioEnabled={audioEnabled}
                onToggleAudio={() => setAudioEnabled(a => !a)}
                timeLeft={timeLeft}
                isListening={isListening}
            />

            {/* Main content */}
            <motion.div
                className="relative z-10 pt-20 pb-6 px-4 sm:px-6 lg:px-8 min-h-screen"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                {/* Session header strip */}
                <div className="flex items-center justify-between mb-5 max-w-screen-2xl mx-auto">
                    <div className="flex items-center gap-3">
                        <div className="h-px w-8" style={{ background: 'linear-gradient(90deg, transparent, #00f5ff)' }} />
                        <span className="font-mono text-xs tracking-widest uppercase" style={{ color: 'rgba(0,245,255,0.5)' }}>
                            Live Proctoring Session · MediaPipe Vision
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
                            Session ID: TG-{Math.random().toString(36).slice(2, 8).toUpperCase()}
                        </span>
                    </div>
                </div>

                {/* Main grid */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 max-w-screen-2xl mx-auto">
                    {/* LEFT: webcam - 3/5 width on desktop */}
                    <div className="lg:col-span-3">
                        <WebcamFeed
                            riskScore={riskScore}
                            currentQuestion={currentQuestion}
                            isAsking={isAsking}
                            accuracyScore={accuracyScore}
                            answerStatus={answerStatus}
                            onDetectionUpdate={onDetectionUpdate}
                        />
                    </div>

                    {/* RIGHT: event log + summary - 2/5 width on desktop */}
                    <div className="lg:col-span-2 flex flex-col gap-5">
                        <EventLog
                            events={events}
                            riskScore={riskScore}
                            gazeDeviation={gazeDeviation}
                            headTurnCount={headTurnCount}
                            tabSwitchCount={tabSwitchCount}
                            facesDetected={facesDetected}
                        />
                        <SessionSummary
                            riskScore={riskScore}
                            gazeDeviation={gazeDeviation}
                            headTurnCount={headTurnCount}
                            tabSwitchCount={tabSwitchCount}
                        />
                    </div>
                </div>

                {/* Bottom info bar */}
                <div className="max-w-screen-2xl mx-auto mt-5 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-4 flex-wrap">
                        {[
                            { label: 'AI Model', value: 'MediaPipe Vision' },
                            { label: 'Detection', value: 'Face Mesh + Iris' },
                            { label: 'Rate', value: '~10 FPS' },
                        ].map((item) => (
                            <div key={item.label} className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <span className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{item.label}:</span>
                                <span className="font-mono text-xs" style={{ color: '#00f5ff88' }}>{item.value}</span>
                            </div>
                        ))}
                    </div>
                    <div className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.15)' }}>
                        All data encrypted end-to-end · GDPR compliant
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
