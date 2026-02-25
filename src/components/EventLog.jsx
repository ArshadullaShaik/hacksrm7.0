import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Activity, Eye, RotateCcw, Monitor, UserCheck, AlertTriangle, CheckCircle } from 'lucide-react';

// ─── Summarize raw events into categories ──────────────────────────────────
function summarizeEvents(events) {
    const summary = {
        gazeAway: 0,
        gazeLeft: 0,
        gazeRight: 0,
        headTurns: 0,
        tabSwitches: 0,
        multiFace: 0,
        noFace: 0,
        total: events.length,
    };

    for (const ev of events) {
        const lower = ev.toLowerCase();
        if (lower.includes('gaze: away') || lower.includes('looked away')) summary.gazeAway++;
        else if (lower.includes('gaze: left')) summary.gazeLeft++;
        else if (lower.includes('gaze: right')) summary.gazeRight++;
        if (lower.includes('head turned')) summary.headTurns++;
        if (lower.includes('tab switch')) summary.tabSwitches++;
        if (lower.includes('multiple faces') || lower.includes('multi-face')) summary.multiFace++;
        if (lower.includes('no face')) summary.noFace++;
    }

    return summary;
}

function DataCard({ icon: Icon, label, value, color, detail, warning }) {
    const borderColor = warning ? '#ff005540' : `${color}30`;
    const bgColor = warning ? 'rgba(255,0,85,0.05)' : `${color}08`;

    return (
        <motion.div
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
            style={{ background: bgColor, border: `1px solid ${borderColor}` }}
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                <Icon size={14} style={{ color }} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</div>
                <div className="font-orbitron text-sm font-bold" style={{ color, textShadow: `0 0 8px ${color}55` }}>
                    {value}
                </div>
            </div>
            {detail && (
                <span className="font-mono text-xs flex-shrink-0" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    {detail}
                </span>
            )}
        </motion.div>
    );
}

function RecentEvent({ event, index }) {
    const isWarning = event.includes('⚠') || event.includes('❌') || event.includes('Tab switch');
    const color = isWarning ? '#ff0055' : '#00f5ff';
    // Parse out the timestamp
    const match = event.match(/^\[?(\d+:\d+)\]?\s*[-–]\s*(.+)$/);
    const timestamp = match ? match[1] : '';
    const text = match ? match[2] : event;

    return (
        <motion.div
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg"
            style={{ background: `${color}06`, borderLeft: `2px solid ${color}40` }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.2 }}
        >
            {timestamp && (
                <span className="font-mono text-xs flex-shrink-0" style={{ color: 'rgba(255,255,255,0.25)' }}>
                    {timestamp}
                </span>
            )}
            <span className="font-mono text-xs truncate" style={{ color: 'rgba(255,255,255,0.55)' }}>
                {text}
            </span>
        </motion.div>
    );
}

export default function EventLog({ events = [], riskScore = 0, gazeDeviation = 0, headTurnCount = 0, tabSwitchCount = 0, facesDetected = 1 }) {
    const summary = useMemo(() => summarizeEvents(events), [events]);
    const recentEvents = events.slice(-5).reverse(); // Last 5, newest first

    const gazeDeviations = summary.gazeAway + summary.gazeLeft + summary.gazeRight;
    const gazeColor = gazeDeviation > 30 ? '#ff0055' : gazeDeviation > 15 ? '#ffff00' : '#00ff88';
    const headColor = headTurnCount > 5 ? '#ff0055' : headTurnCount > 2 ? '#ffff00' : '#00ff88';
    const tabColor = tabSwitchCount > 0 ? '#ff0055' : '#00ff88';
    const faceColor = facesDetected !== 1 ? '#ff0055' : '#00ff88';

    return (
        <motion.div
            className="glass-card holographic rounded-2xl p-5 flex flex-col gap-3"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
        >
            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2">
                    <Activity size={15} style={{ color: '#ff00ff', filter: 'drop-shadow(0 0 4px #ff00ff)' }} />
                    <span className="font-orbitron text-sm font-bold tracking-wider" style={{ color: '#ff00ff' }}>
                        DETECTION SUMMARY
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <motion.div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: '#ff00ff', boxShadow: '0 0 6px #ff00ff' }}
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                    />
                    <span className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        {events.length} events
                    </span>
                </div>
            </div>

            <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, rgba(255,0,255,0.4), transparent)' }} />

            {/* ─── Summary Data Cards ─────────────────────────────────── */}
            <div className="flex flex-col gap-2">
                <DataCard
                    icon={Eye}
                    label="GAZE DEVIATION"
                    value={`${gazeDeviation}%`}
                    color={gazeColor}
                    detail={gazeDeviations > 0 ? `${gazeDeviations} events` : 'stable'}
                    warning={gazeDeviation > 30}
                />
                <DataCard
                    icon={RotateCcw}
                    label="HEAD TURNS"
                    value={headTurnCount}
                    color={headColor}
                    detail="detected"
                    warning={headTurnCount > 5}
                />
                <DataCard
                    icon={Monitor}
                    label="TAB SWITCHES"
                    value={tabSwitchCount}
                    color={tabColor}
                    detail={tabSwitchCount === 0 ? 'clean' : 'flagged'}
                    warning={tabSwitchCount > 0}
                />
                <DataCard
                    icon={facesDetected === 1 ? UserCheck : AlertTriangle}
                    label="FACE STATUS"
                    value={facesDetected === 1 ? 'Single Face' : facesDetected === 0 ? 'No Face' : `${facesDetected} Faces`}
                    color={faceColor}
                    detail={facesDetected === 1 ? 'OK' : '⚠'}
                    warning={facesDetected !== 1}
                />
            </div>

            {/* ─── Recent Activity (last 5 events) ────────────────────── */}
            {recentEvents.length > 0 && (
                <>
                    <div className="h-px w-full mt-1" style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.06), transparent)' }} />
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>
                            RECENT ACTIVITY
                        </span>
                    </div>
                    <div className="flex flex-col gap-1" style={{ maxHeight: 130, overflowY: 'auto' }}>
                        {recentEvents.map((ev, i) => (
                            <RecentEvent key={`${events.length}-${i}`} event={ev} index={i} />
                        ))}
                    </div>
                </>
            )}

            {/* Footer */}
            <div className="flex items-center gap-2 pt-1 border-t" style={{ borderColor: 'rgba(255,0,255,0.1)' }}>
                <motion.div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: '#00ff88', boxShadow: '0 0 6px #00ff88' }}
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                />
                <span className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
                    MediaPipe Vision · Real-time analysis
                </span>
            </div>
        </motion.div>
    );
}
