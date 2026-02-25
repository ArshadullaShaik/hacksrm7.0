import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Mail, ArrowRight } from 'lucide-react';
import CyberpunkBackground from './CyberpunkBackground';

export default function LoginScreen({ onLogin }) {
    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden">
            <CyberpunkBackground />

            <motion.div
                className="relative z-10 w-full max-w-md mx-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
            >
                {/* Logo Area */}
                <div className="flex flex-col items-center mb-8">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                        className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                        style={{
                            border: '2px solid rgba(0,245,255,0.6)',
                            boxShadow: '0 0 20px rgba(0,245,255,0.4), inset 0 0 20px rgba(0,245,255,0.2)',
                            background: 'rgba(0,0,0,0.5)'
                        }}
                    >
                        <Shield size={28} style={{ color: '#00f5ff' }} />
                    </motion.div>
                    <h1 className="font-orbitron font-bold text-3xl tracking-widest text-center"
                        style={{ color: '#fff', textShadow: '0 0 10px rgba(255,255,255,0.5)' }}>
                        TALENTGUARD<span style={{ color: '#00f5ff' }}> AI</span>
                    </h1>
                    <p className="font-mono text-xs mt-2" style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '2px' }}>
                        SECURE INTERVIEW PORTAL
                    </p>
                </div>

                {/* Login Card */}
                <div className="glass-card holographic rounded-2xl p-8 flex flex-col gap-6">
                    <div className="text-center">
                        <h2 className="font-rajdhani font-semibold text-xl text-white mb-1">
                            Welcome Candidate
                        </h2>
                        <p className="font-mono text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                            Please verify your identity to begin
                        </p>
                    </div>

                    <div className="flex flex-col gap-4 mt-2">
                        {/* Google Login Button */}
                        <motion.button
                            onClick={onLogin}
                            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl font-rajdhani font-semibold text-lg transition-all"
                            style={{
                                background: 'white',
                                color: '#000',
                                border: 'none',
                                boxShadow: '0 4px 15px rgba(255,255,255,0.2)'
                            }}
                            whileHover={{ scale: 1.02, boxShadow: '0 4px 20px rgba(255,255,255,0.4)' }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Continue with Google
                        </motion.button>

                        <div className="relative flex items-center py-2">
                            <div className="flex-grow border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}></div>
                            <span className="flex-shrink-0 mx-4 font-mono text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>OR</span>
                            <div className="flex-grow border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}></div>
                        </div>

                        {/* Standard Magic Link styling for realism */}
                        <motion.button
                            onClick={onLogin}
                            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl font-rajdhani font-semibold text-lg transition-all"
                            style={{
                                background: 'rgba(0,245,255,0.05)',
                                color: '#00f5ff',
                                border: '1px solid rgba(0,245,255,0.2)',
                            }}
                            whileHover={{ background: 'rgba(0,245,255,0.1)', borderColor: 'rgba(0,245,255,0.4)', scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Mail size={18} />
                            Send Magic Link
                        </motion.button>
                    </div>

                    <p className="font-mono text-xs text-center mt-2" style={{ color: 'rgba(255,255,255,0.3)', lineHeight: '1.5' }}>
                        By continuing, you agree to our <span className="underline cursor-pointer hover:text-white">Terms of Service</span> and <span className="underline cursor-pointer hover:text-white">Privacy Policy</span>. Data is captured for proctoring purposes.
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
