'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ShieldAlert, MessageSquare, FileSearch, FileBarChart, ArrowRight, ShieldCheck } from 'lucide-react';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

interface WelcomeScreenProps {
  onStart: () => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const heroRef = useRef<HTMLDivElement | null>(null);

  // 3D Tilt & Parallax state
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, translateX: 0, translateY: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || !heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const mouseX = (e.clientX - centerX) / (rect.width / 2); // -1 to 1
    const mouseY = (e.clientY - centerY) / (rect.height / 2); // -1 to 1

    // Subtle 1 to 2.5 degree tilt
    const maxDegrees = 2.5;
    const maxShift = 10;

    setTilt({
      rotateY: mouseX * maxDegrees,
      rotateX: -mouseY * maxDegrees,
      translateX: mouseX * maxShift,
      translateY: mouseY * maxShift,
    });
  }, [prefersReducedMotion]);

  const handleMouseEnter = () => setIsHovered(true);

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ rotateX: 0, rotateY: 0, translateX: 0, translateY: 0 });
  };

  return (
    <div className="min-h-screen w-full bg-[#07111F] dark:bg-[#07111F] text-slate-100 flex flex-col justify-between p-4 sm:p-8 lg:p-10 overflow-y-auto selection:bg-cyan-500/20 selection:text-cyan-200 relative">
      {/* Background Radial Light & Grid Texture */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_70%_40%,rgba(14,165,233,0.12),rgba(15,23,42,0))] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] pointer-events-none opacity-40" />

      {/* Top Header Bar */}
      <header className="relative z-10 flex items-center justify-between max-w-7xl w-full mx-auto pb-4 shrink-0 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <img
            src="/sentinelforge-icon.png"
            alt="SentinelForge Shield Icon"
            className="h-8 w-8 object-contain rounded-lg shrink-0 shadow-xs"
          />
          <span className="font-extrabold text-white text-sm sm:text-base tracking-tight font-mono">
            SentinelForge
          </span>

        </div>

        <ThemeToggle />
      </header>

      {/* Main Two-Column Hero Experience */}
      <main className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center max-w-7xl w-full mx-auto my-auto py-6 sm:py-10">
        
        {/* Left Column (~42% width) */}
        <div className="lg:col-span-5 flex flex-col items-start gap-5 sm:gap-6 text-left">
          {/* Small Product Label */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-[11px] font-mono font-bold tracking-widest uppercase shadow-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>SENTINELFORGE</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
            Welcome to <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-cyan-300">
              SentinelForge
            </span>
          </h1>

          {/* Supporting Text */}
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-lg font-normal">
            Your AI-powered cybersecurity workspace for analyzing code, investigating logs, detecting vulnerabilities, and understanding security risks.
          </p>

          {/* Primary CTA Button & Secondary Motto */}
          <div className="flex flex-col items-start gap-2.5 mt-2">
            <button
              onClick={onStart}
              aria-label="Start Here to open SentinelForge cybersecurity workspace"
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm sm:text-base transition-all duration-200 shadow-lg shadow-cyan-950/50 hover:-translate-y-[2px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 group"
            >
              <span>Start Here</span>
              <ArrowRight size={18} className="transition-transform duration-200 group-hover:translate-x-1" />
            </button>

            <span className="text-xs text-slate-400 font-mono tracking-wide pl-1">
              Secure. Analyze. Understand.
            </span>
          </div>
        </div>

        {/* Right Column (~58% width) - Interactive 3D Parallax Visual */}
        <div className="lg:col-span-7 flex justify-center items-center w-full relative">
          <div
            ref={heroRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="relative w-full max-w-2xl p-4 sm:p-6 cursor-pointer select-none perspective-[1000px]"
          >
            {/* 3D Wrapper Container */}
            <div
              style={{
                transform: prefersReducedMotion
                  ? 'none'
                  : `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) translate3d(${tilt.translateX}px, ${tilt.translateY}px, 0px)`,
                transition: isHovered ? 'transform 0.1s cubic-bezier(0.2, 0, 0.2, 1)' : 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                transformStyle: 'preserve-3d',
              }}
              className="relative w-full rounded-2xl border border-slate-700/60 bg-slate-900/60 p-2 shadow-2xl backdrop-blur-xs transition-shadow duration-300 hover:border-cyan-500/40 hover:shadow-cyan-950/40"
            >
              {/* Primary Cybersecurity 3D Hero Image */}
              <img
                src="/sentinelforge-hero.png"
                alt="SentinelForge AI-powered cybersecurity workspace"
                className="w-full h-auto max-h-[420px] object-contain rounded-xl block relative z-10"
              />

              {/* Floating Capability 1 (Top-Left) */}
              <div
                style={{
                  transform: prefersReducedMotion
                    ? 'none'
                    : `translate3d(${-tilt.translateX * 1.4}px, ${-tilt.translateY * 1.4}px, 30px)`,
                  transition: isHovered ? 'transform 0.1s cubic-bezier(0.2, 0, 0.2, 1)' : 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                className="absolute -top-3 -left-3 sm:-top-5 sm:-left-5 z-20 flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-700 bg-slate-900/90 shadow-xl backdrop-blur-md transition-all hover:scale-105 hover:border-red-500/40"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/15 text-red-400 border border-red-500/30 shrink-0">
                  <ShieldAlert size={15} />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-100">Vulnerability Analysis</span>
                  <span className="text-[10px] text-slate-400">Detect security weaknesses</span>
                </div>
              </div>

              {/* Floating Capability 2 (Top-Right) */}
              <div
                style={{
                  transform: prefersReducedMotion
                    ? 'none'
                    : `translate3d(${tilt.translateX * 1.4}px, ${-tilt.translateY * 1.4}px, 30px)`,
                  transition: isHovered ? 'transform 0.1s cubic-bezier(0.2, 0, 0.2, 1)' : 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                className="absolute -top-3 -right-3 sm:-top-5 sm:-right-5 z-20 flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-700 bg-slate-900/90 shadow-xl backdrop-blur-md transition-all hover:scale-105 hover:border-cyan-500/40"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shrink-0">
                  <MessageSquare size={15} />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-100">AI Security Chat</span>
                  <span className="text-[10px] text-slate-400">Ask cybersecurity questions</span>
                </div>
              </div>

              {/* Floating Capability 3 (Bottom-Left) */}
              <div
                style={{
                  transform: prefersReducedMotion
                    ? 'none'
                    : `translate3d(${-tilt.translateX * 1.4}px, ${tilt.translateY * 1.4}px, 30px)`,
                  transition: isHovered ? 'transform 0.1s cubic-bezier(0.2, 0, 0.2, 1)' : 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                className="absolute -bottom-3 -left-3 sm:-bottom-5 sm:-left-5 z-20 flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-700 bg-slate-900/90 shadow-xl backdrop-blur-md transition-all hover:scale-105 hover:border-blue-500/40"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/15 text-blue-400 border border-blue-500/30 shrink-0">
                  <FileSearch size={15} />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-100">File Analysis</span>
                  <span className="text-[10px] text-slate-400">Analyze source code & logs</span>
                </div>
              </div>

              {/* Floating Capability 4 (Bottom-Right) */}
              <div
                style={{
                  transform: prefersReducedMotion
                    ? 'none'
                    : `translate3d(${tilt.translateX * 1.4}px, ${tilt.translateY * 1.4}px, 30px)`,
                  transition: isHovered ? 'transform 0.1s cubic-bezier(0.2, 0, 0.2, 1)' : 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                className="absolute -bottom-3 -right-3 sm:-bottom-5 sm:-right-5 z-20 flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-700 bg-slate-900/90 shadow-xl backdrop-blur-md transition-all hover:scale-105 hover:border-emerald-500/40"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
                  <FileBarChart size={15} />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-100">Security Reports</span>
                  <span className="text-[10px] text-slate-400">Review security findings</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer / Status Indicator */}
      <footer className="relative z-10 max-w-7xl w-full mx-auto pt-4 shrink-0 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <ShieldCheck size={14} className="text-cyan-400" />
          <span>Enterprise AI Security Audit Platform</span>
        </div>
        <span className="font-mono text-[11px] text-slate-400">v1.0.0</span>
      </footer>
    </div>
  );
}
