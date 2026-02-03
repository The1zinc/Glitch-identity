"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import sdk from '@farcaster/miniapp-sdk';
import { applyGlitchEffect } from './lib/glitchEngine';
import { Download, RefreshCw, Upload, Terminal } from 'lucide-react';
import { useDebounce } from './hooks/useDebounce';

export default function Home() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [username, setUsername] = useState('ANONYMOUS');
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [useContextInfo, setUseContextInfo] = useState(false);
    const [sessionId, setSessionId] = useState('');

    // Signal to the host app that the mini app is ready
    useEffect(() => {
        sdk.actions.ready();
    }, []);

    useEffect(() => {
        setSessionId(Math.random().toString(36).substring(7).toUpperCase());
    }, []);

    // Mock Base SDK Context Check
    useEffect(() => {
        // In a real app, we would check for window.base or similar SDK entry point
        // For now, we simulate finding context if URL params exist or just default to manual
        const params = new URLSearchParams(window.location.search);
        const userParam = params.get('username') || params.get('u');
        const pfpParam = params.get('pfp');

        if (userParam) {
            setUsername(userParam);
            setUseContextInfo(true);
        }
        if (pfpParam) {
            setImageSrc(pfpParam);
        }
    }, []);

    const debouncedUsername = useDebounce(username, 800);

    const handleGenerate = useCallback(async (nameOverride: string) => {
        if (!canvasRef.current) return;
        setIsGenerating(true);

        // Small delay to allow UI to update (blink effect logic)
        await new Promise(r => requestAnimationFrame(r));

        await applyGlitchEffect(canvasRef.current, imageSrc, nameOverride);

        setIsGenerating(false);
    }, [imageSrc]);

    // Generate on initial load or image/name change (debounced)
    // We listen to debouncedUsername for auto-updates, but ensure we don't double-fire
    useEffect(() => {
        if (debouncedUsername && canvasRef.current) {
            handleGenerate(debouncedUsername);
        }
    }, [debouncedUsername, handleGenerate]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const result = ev.target?.result as string;
                setImageSrc(result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDownload = () => {
        if (!canvasRef.current) return;
        const link = document.createElement('a');
        link.download = `identity_glitch_${username.replace(/\W/g, '')}.png`;
        link.href = canvasRef.current.toDataURL('image/png');
        link.click();
    };

    return (
        <main className="w-full max-w-md mx-auto flex flex-col gap-6">
            {/* Header */}
            <header className="border-b border-terminal/30 pb-4 text-center relative">
                <h1 className="text-2xl font-bold tracking-widest text-shadow-glitch">
                    GLITCH_ID <span className="text-xs align-top opacity-70">v1.0</span>
                </h1>
                <div className="absolute top-0 right-0 animate-blink w-2 h-2 bg-terminal rounded-full"></div>
            </header>

            {/* Input Section */}
            <section className="space-y-4">
                <div className="flex flex-col gap-2">
                    <label className="text-xs uppercase tracking-widest opacity-70 flex items-center gap-2">
                        <Terminal size={14} />
                        Identity Protocol
                    </label>
                    {useContextInfo ? (
                        <div className="bg-terminal/10 border border-terminal/50 p-2 font-mono text-sm">
                            CONNECTED AS: @{username}
                        </div>
                    ) : (
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value.toUpperCase())}
                            placeholder="ENTER CODENAME"
                            maxLength={16}
                            className="mt-1 block w-full bg-black border border-terminal/50 p-2 text-terminal placeholder-terminal/30 focus:border-terminal focus:ring-1 focus:ring-terminal focus:outline-none font-mono uppercase"
                        />
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-xs uppercase tracking-widest opacity-70 flex items-center gap-2">
                        <Upload size={14} />
                        Source Data
                    </label>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full border border-dashed border-terminal/40 p-4 text-sm text-terminal/60 hover:text-terminal hover:border-terminal hover:bg-terminal/5 transition-all text-center uppercase"
                    >
                        {imageSrc ? "Replace Source Image" : "Upload Subject Image"}
                    </button>
                </div>
            </section>

            {/* Canvas Preview */}
            <section className="relative group w-full aspect-square border-2 border-terminal bg-black overflow-hidden shadow-[0_0_20px_rgba(0,255,0,0.1)]">
                <canvas
                    ref={canvasRef}
                    className="w-full h-full object-contain"
                />
                {/* CRT Scanline Overlay (CSS) */}
                <div className="pointer-events-none absolute inset-0 bg-scanlines bg-[length:100%_4px] opacity-10"></div>
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-terminal/5 to-transparent animate-pulse opacity-5"></div>
            </section>

            {/* Controls */}
            <section className="grid grid-cols-2 gap-4">
                <button
                    onClick={() => handleGenerate(username)}
                    disabled={isGenerating}
                    className="flex items-center justify-center gap-2 bg-black border border-terminal text-terminal p-3 hover:bg-terminal hover:text-black transition-colors disabled:opacity-50"
                >
                    <RefreshCw size={18} className={isGenerating ? "animate-spin" : ""} />
                    {isGenerating ? "PROCESSING..." : "GENERATE"}
                </button>
                <button
                    onClick={handleDownload}
                    className="flex items-center justify-center gap-2 bg-terminal text-black font-bold p-3 hover:bg-terminal/90 shadow-[0_0_10px_rgba(0,255,0,0.5)] transition-all"
                >
                    <Download size={18} />
                    DOWNLOAD
                </button>
            </section>

            {/* Footer */}
            <footer className="text-center text-[10px] opacity-40 font-mono mt-8">
                SESSION_ID: {sessionId} <br />
                NO SERVER CONNECTION
            </footer>
        </main>
    );
}
