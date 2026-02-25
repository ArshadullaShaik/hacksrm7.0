import { useRef, useState, useEffect, useCallback } from 'react';
import { FaceLandmarker, FaceDetector, FilesetResolver } from '@mediapipe/tasks-vision';

// ─── Landmark indices ───────────────────────────────────────────────────────
const LEFT_IRIS_CENTER = 468;
const RIGHT_IRIS_CENTER = 473;
const LEFT_EYE_INNER = 133;
const LEFT_EYE_OUTER = 33;
const RIGHT_EYE_INNER = 362;
const RIGHT_EYE_OUTER = 263;

// Vertical eye landmarks for EAR (Eye Aspect Ratio) – blink detection
const LEFT_EYE_TOP = 159;
const LEFT_EYE_BOTTOM = 145;
const RIGHT_EYE_TOP = 386;
const RIGHT_EYE_BOTTOM = 374;

// Head pose landmarks
const NOSE_TIP = 1;
const FOREHEAD = 10;
const CHIN = 152;
const LEFT_CHEEK = 234;
const RIGHT_CHEEK = 454;

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

// ─── Smoothing buffer ───────────────────────────────────────────────────────
class SmoothBuffer {
    constructor(size) {
        this.size = size;
        this.buf = [];
    }
    push(val) {
        this.buf.push(val);
        if (this.buf.length > this.size) this.buf.shift();
    }
    avg() {
        if (!this.buf.length) return 0;
        return this.buf.reduce((a, b) => a + b, 0) / this.buf.length;
    }
    mode() {
        if (!this.buf.length) return null;
        const freq = {};
        this.buf.forEach(v => { freq[v] = (freq[v] || 0) + 1; });
        return Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0];
    }
}

/**
 * Eye Aspect Ratio: low = eye closed (blink), normal = ~0.2-0.3
 */
function getEAR(landmarks, topIdx, bottomIdx, innerIdx, outerIdx) {
    const top = landmarks[topIdx];
    const bottom = landmarks[bottomIdx];
    const inner = landmarks[innerIdx];
    const outer = landmarks[outerIdx];
    const vertical = Math.abs(top.y - bottom.y);
    const horizontal = Math.abs(inner.x - outer.x);
    return horizontal > 0.001 ? vertical / horizontal : 0.3;
}

/**
 * Horizontal iris position within the eye: 0=outer, 1=inner
 */
function getIrisRatio(landmarks, irisCenter, innerIdx, outerIdx) {
    const iris = landmarks[irisCenter];
    const inner = landmarks[innerIdx];
    const outer = landmarks[outerIdx];
    const eyeWidth = Math.abs(inner.x - outer.x);
    if (eyeWidth < 0.001) return 0.5;
    return clamp((iris.x - Math.min(inner.x, outer.x)) / eyeWidth, 0, 1);
}

// ─── Main Hook ──────────────────────────────────────────────────────────────
export default function useFaceDetection(videoRef, isActive) {
    const [gazeDirection, setGazeDirection] = useState('CENTER');
    const [headStatus, setHeadStatus] = useState('NORMAL');
    const [facesDetected, setFacesDetected] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);

    // Raw numeric data for app-level stats
    const [gazeRatioH, setGazeRatioH] = useState(0.5);  // 0-1 horizontal
    const [headYaw, setHeadYaw] = useState(0);            // -1 to 1
    const [headPitch, setHeadPitch] = useState(0.5);      // 0-1

    const landmarkerRef = useRef(null);
    const detectorRef = useRef(null);
    const rafRef = useRef(null);
    const lastTimeRef = useRef(-1);

    // Smoothing buffers (5 frames ≈ 500ms at 10fps)
    const gazeHBuf = useRef(new SmoothBuffer(5));
    const gazeVBuf = useRef(new SmoothBuffer(5));
    const headYawBuf = useRef(new SmoothBuffer(5));
    const headPitchBuf = useRef(new SmoothBuffer(5));
    const gazeLabelBuf = useRef(new SmoothBuffer(7)); // mode over 7 frames for label stability
    const headLabelBuf = useRef(new SmoothBuffer(7));

    // ─── Init models ────────────────────────────────────────────────────────
    useEffect(() => {
        if (!isActive) return;
        let cancelled = false;

        async function init() {
            try {
                const vision = await FilesetResolver.forVisionTasks(
                    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
                );
                const landmarker = await FaceLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
                        delegate: 'GPU',
                    },
                    runningMode: 'VIDEO',
                    numFaces: 3,
                    outputFaceBlendshapes: false,
                    outputFacialTransformationMatrixes: false,
                });
                const detector = await FaceDetector.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite',
                        delegate: 'GPU',
                    },
                    runningMode: 'VIDEO',
                    minDetectionConfidence: 0.5,
                });

                if (!cancelled) {
                    landmarkerRef.current = landmarker;
                    detectorRef.current = detector;
                    setIsLoaded(true);
                    console.log('✅ MediaPipe Face Mesh + Detector loaded');
                }
            } catch (err) {
                console.error('❌ MediaPipe init failed:', err);
                // Fallback: try CPU delegate
                try {
                    const vision = await FilesetResolver.forVisionTasks(
                        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
                    );
                    const landmarker = await FaceLandmarker.createFromOptions(vision, {
                        baseOptions: {
                            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
                            delegate: 'CPU',
                        },
                        runningMode: 'VIDEO',
                        numFaces: 3,
                    });
                    const detector = await FaceDetector.createFromOptions(vision, {
                        baseOptions: {
                            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite',
                            delegate: 'CPU',
                        },
                        runningMode: 'VIDEO',
                    });
                    if (!cancelled) {
                        landmarkerRef.current = landmarker;
                        detectorRef.current = detector;
                        setIsLoaded(true);
                        console.log('✅ MediaPipe loaded (CPU fallback)');
                    }
                } catch (err2) {
                    console.error('❌ MediaPipe CPU fallback also failed:', err2);
                }
            }
        }

        init();
        return () => {
            cancelled = true;
            landmarkerRef.current?.close();
            detectorRef.current?.close();
            landmarkerRef.current = null;
            detectorRef.current = null;
            setIsLoaded(false);
        };
    }, [isActive]);

    // ─── Detection loop ─────────────────────────────────────────────────────
    const detect = useCallback(() => {
        const video = videoRef.current;
        const landmarker = landmarkerRef.current;
        const detector = detectorRef.current;

        if (!video || !landmarker || !detector || video.readyState < 2) {
            rafRef.current = requestAnimationFrame(detect);
            return;
        }

        const now = performance.now();
        // ~10 FPS
        if (now - lastTimeRef.current < 100) {
            rafRef.current = requestAnimationFrame(detect);
            return;
        }
        lastTimeRef.current = now;

        try {
            const landmarkResult = landmarker.detectForVideo(video, now);
            const meshFaceCount = landmarkResult.faceLandmarks?.length || 0;

            if (meshFaceCount > 0) {
                const lm = landmarkResult.faceLandmarks[0];

                // ── Blink filter: skip gaze when eyes are closed ──
                const leftEAR = getEAR(lm, LEFT_EYE_TOP, LEFT_EYE_BOTTOM, LEFT_EYE_INNER, LEFT_EYE_OUTER);
                const rightEAR = getEAR(lm, RIGHT_EYE_TOP, RIGHT_EYE_BOTTOM, RIGHT_EYE_INNER, RIGHT_EYE_OUTER);
                const avgEAR = (leftEAR + rightEAR) / 2;
                const isBlinking = avgEAR < 0.16;

                if (!isBlinking) {
                    // ── Horizontal gaze ──
                    const leftRatio = getIrisRatio(lm, LEFT_IRIS_CENTER, LEFT_EYE_INNER, LEFT_EYE_OUTER);
                    const rightRatio = getIrisRatio(lm, RIGHT_IRIS_CENTER, RIGHT_EYE_INNER, RIGHT_EYE_OUTER);
                    const avgH = (leftRatio + rightRatio) / 2;
                    gazeHBuf.current.push(avgH);
                    const smoothH = gazeHBuf.current.avg();
                    setGazeRatioH(smoothH);

                    // ── Vertical gaze offset ──
                    const irisY = (lm[LEFT_IRIS_CENTER].y + lm[RIGHT_IRIS_CENTER].y) / 2;
                    const eyeCenterY = (lm[LEFT_EYE_TOP].y + lm[LEFT_EYE_BOTTOM].y + lm[RIGHT_EYE_TOP].y + lm[RIGHT_EYE_BOTTOM].y) / 4;
                    const vOffset = irisY - eyeCenterY;
                    gazeVBuf.current.push(vOffset);
                    const smoothV = gazeVBuf.current.avg();

                    // ── Classify gaze (with smoothed values) ──
                    let rawGaze = 'CENTER';
                    if (smoothH < 0.36) rawGaze = 'RIGHT';       // mirrored
                    else if (smoothH > 0.64) rawGaze = 'LEFT';   // mirrored
                    else if (Math.abs(smoothV) > 0.025) rawGaze = 'AWAY';

                    gazeLabelBuf.current.push(rawGaze);
                    const stableGaze = gazeLabelBuf.current.mode();
                    setGazeDirection(stableGaze);
                }

                // ── Head pose ──
                const nose = lm[NOSE_TIP];
                const leftCheek = lm[LEFT_CHEEK];
                const rightCheek = lm[RIGHT_CHEEK];
                const forehead = lm[FOREHEAD];
                const chin = lm[CHIN];

                const faceW = Math.abs(rightCheek.x - leftCheek.x);
                const yaw = faceW > 0.001 ? (nose.x - (leftCheek.x + rightCheek.x) / 2) / faceW : 0;
                headYawBuf.current.push(yaw);
                const smoothYaw = headYawBuf.current.avg();
                setHeadYaw(smoothYaw);

                const faceH = Math.abs(forehead.y - chin.y);
                const pitch = faceH > 0.001 ? (nose.y - forehead.y) / faceH : 0.5;
                headPitchBuf.current.push(pitch);
                const smoothPitch = headPitchBuf.current.avg();
                setHeadPitch(smoothPitch);

                let rawHead = 'NORMAL';
                if (Math.abs(smoothYaw) > 0.12) rawHead = 'TURNED';
                else if (smoothPitch < 0.32 || smoothPitch > 0.68) rawHead = 'TURNED';

                headLabelBuf.current.push(rawHead);
                const stableHead = headLabelBuf.current.mode();
                setHeadStatus(stableHead);

            } else {
                gazeLabelBuf.current.push('AWAY');
                setGazeDirection(gazeLabelBuf.current.mode());
                setHeadStatus('NORMAL');
            }

            // ── Face count (use both models, take max) ──
            const detResult = detector.detectForVideo(video, now);
            const detCount = detResult.detections?.length || 0;
            setFacesDetected(Math.max(meshFaceCount, detCount));

        } catch (err) {
            // Frame errors (tab switch, resize) – ignore
        }

        rafRef.current = requestAnimationFrame(detect);
    }, [videoRef]);

    useEffect(() => {
        if (isLoaded && isActive) {
            rafRef.current = requestAnimationFrame(detect);
        }
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [isLoaded, isActive, detect]);

    return {
        gazeDirection,
        headStatus,
        facesDetected,
        isLoaded,
        // Raw numeric data for detailed analysis
        gazeRatioH,
        headYaw,
        headPitch,
    };
}
