import React, { useRef, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';

// ─── Buckminster Fullerene geometry helpers ───────────────────────────────────
const PHI = (1 + Math.sqrt(5)) / 2;

// 12 vertices of an icosahedron normalised to unit sphere
function icosahedronVertices() {
    const raw = [
        [-1, PHI, 0], [1, PHI, 0], [-1, -PHI, 0], [1, -PHI, 0],
        [0, -1, PHI], [0, 1, PHI], [0, -1, -PHI], [0, 1, -PHI],
        [PHI, 0, -1], [PHI, 0, 1], [-PHI, 0, -1], [-PHI, 0, 1],
    ];
    return raw.map(([x, y, z]) => {
        const len = Math.sqrt(x * x + y * y + z * z);
        return [x / len, y / len, z / len];
    });
}

// 30 edges of an icosahedron
const ICO_EDGES = [
    [0, 1], [0, 5], [0, 7], [0, 10], [0, 11], [1, 5], [1, 7], [1, 8], [1, 9],
    [2, 3], [2, 4], [2, 6], [2, 10], [2, 11], [3, 4], [3, 6], [3, 8], [3, 9],
    [4, 5], [4, 9], [4, 11], [5, 9], [5, 11], [6, 7], [6, 8], [6, 10], [7, 8], [7, 10], [8, 9], [10, 11],
];

// Subdivide each icosahedron edge: insert a midpoint to get a fuller geodesic feel
function buildGeodesicEdges(vertices, edges) {
    const midpoints = {};
    const allVerts = [...vertices];
    const geoEdges = [];

    function midIdx(a, b) {
        const key = a < b ? `${a}_${b}` : `${b}_${a}`;
        if (midpoints[key] !== undefined) return midpoints[key];
        const [ax, ay, az] = allVerts[a];
        const [bx, by, bz] = allVerts[b];
        let mx = (ax + bx) / 2, my = (ay + by) / 2, mz = (az + bz) / 2;
        const len = Math.sqrt(mx * mx + my * my + mz * mz);
        mx /= len; my /= len; mz /= len;
        const idx = allVerts.length;
        allVerts.push([mx, my, mz]);
        midpoints[key] = idx;
        return idx;
    }

    edges.forEach(([a, b]) => {
        const m = midIdx(a, b);
        geoEdges.push([a, m], [m, b]);
    });

    return { verts: allVerts, edges: geoEdges };
}

// Rotate a point [x,y,z] around Y then X axis
function rotatePoint([x, y, z], rotY, rotX) {
    // Y rotation
    const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
    let nx = cosY * x + sinY * z;
    let nz = -sinY * x + cosY * z;
    x = nx; z = nz;
    // X rotation
    const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
    let ny = cosX * y - sinX * z;
    nz = sinX * y + cosX * z;
    y = ny; z = nz;
    return [x, y, z];
}

// Project 3D → 2D (orthographic within a box)
function project([x, y, z], cx, cy, r) {
    return [cx + x * r, cy - y * r, z];
}

// ─── Canvas Orb ──────────────────────────────────────────────────────────────
export default function AIOrb({ isAsking = false, size = 88 }) {
    const canvasRef = useRef(null);
    const animRef = useRef(null);
    const timeRef = useRef(0);

    // Build static geodesic geometry once
    const geo = useMemo(() => {
        const ico = icosahedronVertices();
        return buildGeodesicEdges(ico, ICO_EDGES);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        canvas.width = size * dpr;
        canvas.height = size * dpr;
        ctx.scale(dpr, dpr);
        const cx = size / 2, cy = size / 2;
        const r = size * 0.34;

        let frame = 0;

        function draw(ts) {
            timeRef.current = ts * 0.001;
            frame++;
            ctx.clearRect(0, 0, size, size);

            const t = timeRef.current;
            const rotY = t * 0.25;
            const rotX = Math.sin(t * 0.15) * 0.35;

            // Pulse multiplier: faster, bigger when asking
            const pulse = isAsking ? 1 + 0.35 * Math.sin(t * 4) : 1 + 0.12 * Math.sin(t * 1.5);
            const scaledR = r * pulse;

            // ── ripple rings ──────────────────────────────────────────
            const rippleCount = isAsking ? 4 : 2;
            const rippleSpeed = isAsking ? 1.4 : 0.7;
            for (let i = 0; i < rippleCount; i++) {
                const phase = (t * rippleSpeed + i / rippleCount) % 1;
                const ripR = scaledR * (1.05 + phase * (isAsking ? 1.2 : 0.7));
                const alpha = (1 - phase) * (isAsking ? 0.55 : 0.25);
                const grad = ctx.createRadialGradient(cx, cy, ripR * 0.6, cx, cy, ripR);
                grad.addColorStop(0, `rgba(0,245,255,0)`);
                grad.addColorStop(1, `rgba(0,245,255,${alpha * 0.3})`);
                ctx.beginPath();
                ctx.arc(cx, cy, ripR, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(0,245,255,${alpha})`;
                ctx.lineWidth = isAsking ? 1.2 : 0.7;
                ctx.stroke();
                // second magenta ripple offset
                const ripR2 = scaledR * (1.08 + phase * (isAsking ? 1.1 : 0.5));
                const alpha2 = (1 - phase) * (isAsking ? 0.35 : 0.12);
                ctx.beginPath();
                ctx.arc(cx, cy, ripR2, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(255,0,255,${alpha2})`;
                ctx.lineWidth = 0.6;
                ctx.stroke();
            }

            // ── ambient particle flickers ────────────────────────────
            const particleCount = isAsking ? 8 : 4;
            for (let i = 0; i < particleCount; i++) {
                const angle = (i / particleCount) * Math.PI * 2 + t * 0.8;
                const dist = scaledR * (1.15 + 0.2 * Math.sin(t * 3 + i));
                const px = cx + Math.cos(angle) * dist;
                const py = cy + Math.sin(angle) * dist;
                const palpha = 0.3 + 0.7 * Math.abs(Math.sin(t * 2.5 + i));
                ctx.beginPath();
                ctx.arc(px, py, 1.2, 0, Math.PI * 2);
                ctx.fillStyle = i % 2 === 0
                    ? `rgba(0,245,255,${palpha})`
                    : `rgba(255,0,255,${palpha * 0.7})`;
                ctx.fill();
            }

            // ── core glow (center) ────────────────────────────────────
            const glowR = scaledR * (isAsking ? 1.05 : 0.85);
            const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
            coreGrad.addColorStop(0, isAsking ? 'rgba(0,245,255,0.18)' : 'rgba(0,245,255,0.07)');
            coreGrad.addColorStop(0.6, isAsking ? 'rgba(139,0,255,0.10)' : 'rgba(139,0,255,0.03)');
            coreGrad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.beginPath();
            ctx.arc(cx, cy, glowR, 0, Math.PI * 2);
            ctx.fillStyle = coreGrad;
            ctx.fill();

            // ── geodesic wireframe ────────────────────────────────────
            const { verts, edges } = geo;
            const projected = verts.map(v => project(rotatePoint(v, rotY, rotX), cx, cy, scaledR));

            const glowIntensity = isAsking ? 0.9 : 0.55;

            edges.forEach(([a, b]) => {
                const [ax, ay, az] = projected[a];
                const [bx, by, bz] = projected[b];
                // depth fade: edges facing viewer are brighter
                const depth = (az + 1) / 2; // 0..1
                const alpha = (0.2 + depth * 0.5) * glowIntensity;

                // Gradient edge: cyan → magenta based on position
                const grad = ctx.createLinearGradient(ax, ay, bx, by);
                grad.addColorStop(0, `rgba(0,245,255,${alpha})`);
                grad.addColorStop(1, `rgba(255,0,255,${alpha * 0.7})`);

                ctx.beginPath();
                ctx.moveTo(ax, ay);
                ctx.lineTo(bx, by);
                ctx.strokeStyle = grad;
                ctx.lineWidth = isAsking ? 0.9 : 0.65;
                ctx.stroke();
            });

            // ── bright vertex dots on front-facing verts ──────────────
            projected.forEach(([px, py, pz]) => {
                if (pz < 0.2) return;
                const dotAlpha = ((pz + 1) / 2) * glowIntensity;
                ctx.beginPath();
                ctx.arc(px, py, isAsking ? 1.2 : 0.9, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(0,245,255,${dotAlpha})`;
                ctx.fill();
            });

            animRef.current = requestAnimationFrame(draw);
        }

        animRef.current = requestAnimationFrame(draw);
        return () => cancelAnimationFrame(animRef.current);
    }, [isAsking, size, geo]);

    return (
        <motion.div
            className="relative flex items-center justify-center"
            style={{ width: size, height: size }}
            animate={{ scale: isAsking ? [1, 1.08, 1] : 1 }}
            transition={{ duration: isAsking ? 1.5 : 0.4, repeat: isAsking ? Infinity : 0, ease: 'easeInOut' }}
        >
            {/* Outer halo */}
            <motion.div
                className="absolute inset-0 rounded-full pointer-events-none"
                animate={{
                    boxShadow: isAsking
                        ? ['0 0 16px rgba(0,245,255,0.6), 0 0 32px rgba(255,0,255,0.3)', '0 0 28px rgba(0,245,255,0.9), 0 0 50px rgba(255,0,255,0.5)', '0 0 16px rgba(0,245,255,0.6), 0 0 32px rgba(255,0,255,0.3)']
                        : ['0 0 8px rgba(0,245,255,0.3)', '0 0 14px rgba(0,245,255,0.5)', '0 0 8px rgba(0,245,255,0.3)'],
                }}
                transition={{ duration: isAsking ? 1.2 : 2.5, repeat: Infinity, ease: 'easeInOut' }}
                style={{ borderRadius: '50%' }}
            />
            <canvas
                ref={canvasRef}
                style={{ width: size, height: size, display: 'block' }}
            />
            {/* AI label tag */}
            <div
                className="absolute -bottom-5 left-1/2 -translate-x-1/2 font-mono whitespace-nowrap"
                style={{ fontSize: 8, color: isAsking ? '#00f5ff' : 'rgba(0,245,255,0.5)', letterSpacing: '0.12em', textShadow: isAsking ? '0 0 6px #00f5ff' : 'none' }}
            >
                {isAsking ? '◈ SPEAKING' : '◇ IDLE'}
            </div>
        </motion.div>
    );
}
