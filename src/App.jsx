import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import LoginScreen from './components/LoginScreen';
import LandingScreen from './components/LandingScreen';
import UploadScreen from './components/UploadScreen';
import Dashboard from './components/Dashboard';
import FinalReport from './components/FinalReport';

// ─── Demo AI question bank (Simulating backend response) ───────────────────
const AI_QUESTIONS = [
  "Can you elaborate on your experience with scalable microservices?",
  "Describe a challenging bug you debugged and how you resolved it.",
  "What's your experience with cloud platforms like AWS or GCP?",
  "Walk me through your most impactful project at your last company.",
  "How do you ensure code quality and maintainability in your team?",
  "Explain the difference between supervised and unsupervised learning.",
  "How would you optimize a slow database query in production?",
  "Describe your experience with Agile and sprint-based development.",
];

function formatTimeLog(timeLeft) {
  const elapsed = 900 - timeLeft;
  const m = Math.floor(elapsed / 60), s = elapsed % 60;
  return `[${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}]`;
}

const PAGE_VARIANTS = {
  initial: { opacity: 0, scale: 0.97 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 1.02 },
};

export default function App() {
  const [screen, setScreen] = useState('login'); // login -> landing -> upload -> dashboard -> finalreport

  // ─── Real Proctoring state (driven by MediaPipe via onDetectionUpdate) ───
  const [gazeDir, setGazeDir] = useState('CENTER');
  const [headSt, setHeadSt] = useState('NORMAL');
  const [faces, setFaces] = useState(0);
  const [events, setEvents] = useState([]);
  const [gazeDeviation, setGazeDev] = useState(0);
  const [headTurns, setHeadTurns] = useState(0);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [riskScore, setRiskScore] = useState(5);

  // Counters for accurate tracking
  const gazeAwayCountRef = useRef(0);
  const totalGazeChecksRef = useRef(0);
  const prevHeadRef = useRef('NORMAL');       // Track transitions, not every frame
  const lastEventTimeRef = useRef({});        // Throttle: {eventType: timestamp}

  // ─── Timer state ───────────────────────────────────────────────────────
  const [timeLeft, setTimeLeft] = useState(900); // 15 mins = 900s
  const timerRef = useRef(null);

  // ─── AI Interview + STT/TTS state ──────────────────────────────────────
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [accuracyScore, setAccuracyScore] = useState(0);
  const [answerStatus, setAnswerStatus] = useState('neutral');
  const [questionIdx, setQuestionIdx] = useState(0);
  const [questionsSummary, setQuestionsSummary] = useState([]);

  const sttRef = useRef(null);

  // ─── Tab visibility detection (REAL) ──────────────────────────────────
  useEffect(() => {
    if (screen !== 'dashboard') return;

    const handleVisibility = () => {
      if (document.hidden) {
        setTabSwitches(c => c + 1);
        setTimeLeft(prev => {
          const t = formatTimeLog(prev);
          setEvents(es => [...es.slice(-49), `${t} - ⚡ Tab switch detected`]);
          return prev;
        });
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [screen]);

  // ─── MediaPipe detection callback (from WebcamFeed → Dashboard → App) ──
  // Throttle helper: only allow one event per type per N seconds
  const canLogEvent = useCallback((type, cooldownMs = 3000) => {
    const now = Date.now();
    const last = lastEventTimeRef.current[type] || 0;
    if (now - last < cooldownMs) return false;
    lastEventTimeRef.current[type] = now;
    return true;
  }, []);

  const handleDetectionUpdate = useCallback(({ gazeDirection, headStatus, facesDetected }) => {
    if (screen !== 'dashboard') return;

    setGazeDir(gazeDirection);
    setHeadSt(headStatus);
    setFaces(facesDetected);

    // ── Gaze deviation % (running average over all checks) ──
    totalGazeChecksRef.current += 1;
    if (gazeDirection !== 'CENTER') {
      gazeAwayCountRef.current += 1;
    }
    const devPercent = totalGazeChecksRef.current > 0
      ? Math.round((gazeAwayCountRef.current / totalGazeChecksRef.current) * 100)
      : 0;
    setGazeDev(devPercent);

    // ── Head turns: only count TRANSITIONS (NORMAL → TURNED) ──
    const prevHead = prevHeadRef.current;
    if (headStatus === 'TURNED' && prevHead !== 'TURNED') {
      setHeadTurns(c => c + 1);
    }
    prevHeadRef.current = headStatus;

    // ── Risk score: weighted formula from real data ──
    setHeadTurns(currentHeadTurns => {
      setTabSwitches(currentTabSwitches => {
        const headRisk = Math.min(100, (currentHeadTurns / 15) * 100);
        const tabRisk = Math.min(100, (currentTabSwitches / 5) * 100);
        const faceRisk = facesDetected > 1 ? 80 : facesDetected === 0 ? 60 : 0;
        const risk = Math.round(
          (devPercent * 0.4) + (headRisk * 0.25) + (tabRisk * 0.25) + (faceRisk * 0.1)
        );
        setRiskScore(Math.max(2, Math.min(95, risk)));
        return currentTabSwitches;
      });
      return currentHeadTurns;
    });

    // ── Log significant events (throttled: 1 per type per 3s) ──
    setTimeLeft(prev => {
      const t = formatTimeLog(prev);

      if (gazeDirection === 'AWAY' && canLogEvent('gaze_away')) {
        setEvents(es => [...es.slice(-29), `${t} - 👁 Gaze: AWAY from screen`]);
      }
      if (gazeDirection === 'LEFT' && canLogEvent('gaze_left', 5000)) {
        setEvents(es => [...es.slice(-29), `${t} - 👁 Gaze: LEFT`]);
      }
      if (gazeDirection === 'RIGHT' && canLogEvent('gaze_right', 5000)) {
        setEvents(es => [...es.slice(-29), `${t} - 👁 Gaze: RIGHT`]);
      }
      if (facesDetected > 1 && canLogEvent('multi_face')) {
        setEvents(es => [...es.slice(-29), `${t} - ⚠ Multiple faces detected (${facesDetected})`]);
      }
      if (facesDetected === 0 && canLogEvent('no_face')) {
        setEvents(es => [...es.slice(-29), `${t} - ❌ No face detected in frame`]);
      }
      if (headStatus === 'TURNED' && prevHead !== 'TURNED' && canLogEvent('head_turn')) {
        setEvents(es => [...es.slice(-29), `${t} - 🔄 Head turned away`]);
      }

      return prev;
    });
  }, [screen, canLogEvent]);

  // Setup Speech Recognition
  useEffect(() => {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRec) {
      const recognition = new SpeechRec();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log("Candidate said:", transcript);
        handleAnswerReceived(transcript);
      };
      recognition.onerror = (e) => {
        console.warn("Speech recognition error:", e.error);
        setIsListening(false);
        handleAnswerReceived("(Simulation: Answer recorded without STT API)");
      };
      recognition.onend = () => {
        setIsListening(false);
      };
      sttRef.current = recognition;
    }
  }, []);

  // ─── Session Timer (15 Minutes) ──────────────────────────────────────────
  useEffect(() => {
    if (screen !== 'dashboard') return;

    // Initial logs
    setEvents([
      `${formatTimeLog(900)} - Session initialized (15 Min Timer Started)`,
      `${formatTimeLog(898)} - MediaPipe Vision loading...`
    ]);

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleAutoEndSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [screen]);

  // ─── AI Question Cycle Flow ────────────────────────────────────────────────
  useEffect(() => {
    if (screen !== 'dashboard') {
      window.speechSynthesis.cancel();
      return;
    }
    const firstDelay = setTimeout(() => startQuestion(0), 3000);
    return () => clearTimeout(firstDelay);
  }, [screen]);

  const startQuestion = (idx) => {
    if (screen !== 'dashboard') return;

    const q = AI_QUESTIONS[idx % AI_QUESTIONS.length];
    setCurrentQuestion(q);
    setIsAsking(true);
    setAnswerStatus('neutral');

    // Text to Speech
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(q);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onend = () => {
        setIsAsking(false);
        setIsListening(true);
        if (sttRef.current) {
          try { sttRef.current.start(); } catch (e) { }
        } else {
          setTimeout(() => handleAnswerReceived("(Simulated voice)"), 6000 + Math.random() * 4000);
        }
      };
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => {
        setIsAsking(false); setIsListening(true);
        setTimeout(() => handleAnswerReceived("(Simulated text)"), 6000);
      }, 4000);
    }
  };

  const handleAnswerReceived = (transcript) => {
    setIsListening(false);

    const simScore = 40 + Math.floor(Math.random() * 60);
    const status = simScore >= 65 ? 'correct' : 'incorrect';

    setAccuracyScore((prev) => {
      const count = questionIdx;
      return count === 0 ? simScore : Math.round((prev * count + simScore) / (count + 1));
    });
    setAnswerStatus(status);

    setQuestionsSummary(prev => [...prev, {
      question: AI_QUESTIONS[questionIdx % AI_QUESTIONS.length],
      transcript,
      score: simScore
    }]);

    setTimeout(() => {
      if (screen !== 'dashboard') return;
      setAnswerStatus('neutral');
      const next = questionIdx + 1;
      setQuestionIdx(next);
      startQuestion(next);
    }, 4000);
  };

  // ─── Handlers ────────────────────────────────────────────────────────────
  const handleAutoEndSession = useCallback(() => {
    clearInterval(timerRef.current);
    window.speechSynthesis.cancel();
    if (sttRef.current) { try { sttRef.current.stop(); } catch (e) { } }

    setEvents(es => [...es, `${formatTimeLog(0)} - Session auto-completed (15 min elapsed)`]);

    setTimeout(() => setScreen('finalreport'), 1500);
  }, [screen]);

  const handleEndSessionManual = useCallback(() => {
    clearInterval(timerRef.current);
    window.speechSynthesis.cancel();
    if (sttRef.current) { try { sttRef.current.stop(); } catch (e) { } }

    setScreen('finalreport');
  }, []);

  const handleRestart = useCallback(() => {
    setScreen('landing');
    setRiskScore(5); setGazeDir('CENTER'); setHeadSt('NORMAL'); setFaces(0);
    setEvents([]); setGazeDev(0); setHeadTurns(0); setTabSwitches(0);
    setTimeLeft(900);
    setCurrentQuestion(''); setIsAsking(false); setIsListening(false);
    setAccuracyScore(0); setAnswerStatus('neutral'); setQuestionIdx(0);
    setQuestionsSummary([]);
    gazeAwayCountRef.current = 0;
    totalGazeChecksRef.current = 0;
    prevHeadRef.current = 'NORMAL';
    lastEventTimeRef.current = {};
  }, []);

  const sessionData = {
    riskScore: Math.round(riskScore),
    gazeDeviation: Math.round(gazeDeviation),
    headTurnCount: headTurns,
    tabSwitchCount: tabSwitches,
    facesDetected: faces,
    accuracyScore: Math.round(accuracyScore),
    questionsAsked: questionIdx,
    questionsSummary
  };

  return (
    <div className="w-full min-h-screen" style={{ background: '#020207' }}>
      <AnimatePresence mode="wait">

        {screen === 'login' && (
          <motion.div key="login" {...PAGE_VARIANTS} transition={{ duration: 0.5 }}>
            <LoginScreen onLogin={() => setScreen('landing')} />
          </motion.div>
        )}

        {screen === 'landing' && (
          <motion.div key="landing" {...PAGE_VARIANTS} transition={{ duration: 0.5 }}>
            <LandingScreen onStart={() => setScreen('upload')} />
          </motion.div>
        )}

        {screen === 'upload' && (
          <motion.div key="upload" {...PAGE_VARIANTS} transition={{ duration: 0.5 }}>
            <UploadScreen onComplete={(resumeFile) => setScreen('dashboard')} />
          </motion.div>
        )}

        {screen === 'dashboard' && (
          <motion.div key="dashboard" {...PAGE_VARIANTS} transition={{ duration: 0.5 }}>
            <Dashboard
              riskScore={Math.round(riskScore)}
              gazeDeviation={Math.round(gazeDeviation)}
              headTurnCount={headTurns}
              tabSwitchCount={tabSwitches}
              facesDetected={faces}
              events={events}
              onEndSession={handleEndSessionManual}
              onDetectionUpdate={handleDetectionUpdate}
              // AI props
              currentQuestion={currentQuestion}
              isAsking={isAsking}
              isListening={isListening}
              accuracyScore={accuracyScore}
              answerStatus={answerStatus}
              timeLeft={timeLeft}
            />
          </motion.div>
        )}

        {screen === 'finalreport' && (
          <motion.div key="finalreport" {...PAGE_VARIANTS} transition={{ duration: 0.5 }}>
            <FinalReport sessionData={sessionData} onRestart={handleRestart} />
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
