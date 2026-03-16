'use client';

import { useEffect, useRef, useState } from 'react';

// Advanced AI-powered animation hook
export const useAIAnimations = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [animationPhase, setAnimationPhase] = useState<'idle' | 'loading' | 'active' | 'complete'>('idle');
    const elementRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    setAnimationPhase('loading');

                    // Simulate AI processing time
                    setTimeout(() => setAnimationPhase('active'), 300);
                    setTimeout(() => setAnimationPhase('complete'), 1000);
                }
            },
            { threshold: 0.1 }
        );

        if (elementRef.current) {
            observer.observe(elementRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return { elementRef, isVisible, animationPhase };
};

// Typing animation hook for AI text
export const useTypingAnimation = (text: string, speed: number = 50) => {
    const [displayText, setDisplayText] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    useEffect(() => {
        setIsTyping(true);
        setDisplayText('');

        let index = 0;
        const timer = setInterval(() => {
            if (index < text.length) {
                setDisplayText(prev => prev + text.charAt(index));
                index++;
            } else {
                setIsTyping(false);
                clearInterval(timer);
            }
        }, speed);

        return () => clearInterval(timer);
    }, [text, speed]);

    return { displayText, isTyping };
};

// Particle system hook
export const useParticleSystem = (count: number = 20) => {
    const [particles, setParticles] = useState<Array<{
        id: number;
        x: number;
        y: number;
        delay: number;
    }>>([]);

    useEffect(() => {
        const newParticles = Array.from({ length: count }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            delay: Math.random() * 3
        }));
        setParticles(newParticles);
    }, [count]);

    return particles;
};

// AI loading states hook
export const useAILoadingStates = () => {
    const [loadingState, setLoadingState] = useState<'idle' | 'analyzing' | 'processing' | 'generating' | 'complete'>('idle');
    const [progress, setProgress] = useState(0);

    const startAIProcess = () => {
        setLoadingState('analyzing');
        setProgress(0);

        // Simulate AI processing phases
        const phases = [
            { state: 'analyzing' as const, duration: 1000, progress: 25 },
            { state: 'processing' as const, duration: 1500, progress: 60 },
            { state: 'generating' as const, duration: 1000, progress: 90 },
            { state: 'complete' as const, duration: 500, progress: 100 }
        ];

        let currentPhase = 0;
        const processPhase = () => {
            if (currentPhase < phases.length) {
                const phase = phases[currentPhase];
                setLoadingState(phase.state);

                // Animate progress
                const startProgress = currentPhase === 0 ? 0 : phases[currentPhase - 1].progress;
                const targetProgress = phase.progress;
                const progressDuration = phase.duration;
                const progressStep = (targetProgress - startProgress) / (progressDuration / 50);

                let currentProgress = startProgress;
                const progressTimer = setInterval(() => {
                    currentProgress += progressStep;
                    if (currentProgress >= targetProgress) {
                        currentProgress = targetProgress;
                        clearInterval(progressTimer);

                        setTimeout(() => {
                            currentPhase++;
                            processPhase();
                        }, 200);
                    }
                    setProgress(Math.min(currentProgress, 100));
                }, 50);
            }
        };

        processPhase();
    };

    const resetAIProcess = () => {
        setLoadingState('idle');
        setProgress(0);
    };

    return { loadingState, progress, startAIProcess, resetAIProcess };
};