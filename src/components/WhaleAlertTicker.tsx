import React, { useState, useEffect, useRef } from "react";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Layers, 
  Filter, 
  Database, 
  ExternalLink, 
  ShieldAlert, 
  Clock,
  Sparkles,
  Info,
  Volume2,
  VolumeX,
  Sliders,
  SlidersHorizontal
} from "lucide-react";
import { RealTimeAlert, TickerPrice } from "../types";
import { STATIC_ALERT_TEMPLATES } from "../data";

interface WhaleAlertTickerProps {
  onSelectAddress: (address: string) => void;
  currentPrices: { [key: string]: number };
  tickers?: { [key: string]: TickerPrice };
}

export const WhaleAlertTicker: React.FC<WhaleAlertTickerProps> = ({ 
  onSelectAddress, 
  currentPrices,
  tickers
}) => {
  const [alerts, setAlerts] = useState<RealTimeAlert[]>([]);
  const [assetFilter, setAssetFilter] = useState<string>("ALL");
  const [flowFilter, setFlowFilter] = useState<string>("ALL");
  const [minSizeUsd, setMinSizeUsd] = useState<number>(100000); // 100k
  const [paused, setPaused] = useState<boolean>(false);
  const [newAlertFlash, setNewAlertFlash] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [soundThresholdUsd, setSoundThresholdUsd] = useState<number>(1000000); // Default $1.0M USD
  const [soundToneStyle, setSoundToneStyle] = useState<"subtle-ping" | "double-chime" | "digital-radar" | "soft-ambient">("subtle-ping");
  const [soundVolume, setSoundVolume] = useState<number>(0.3); // 30% volume
  const [showSoundConfig, setShowSoundConfig] = useState<boolean>(false);

  // Use refs to avoid re-triggering the live stream interval when sound settings change
  const soundEnabledRef = useRef(soundEnabled);
  const soundThresholdRef = useRef(soundThresholdUsd);
  const soundToneStyleRef = useRef(soundToneStyle);
  const soundVolumeRef = useRef(soundVolume);

  useEffect(() => { soundEnabledRef.current = soundEnabled; }, [soundEnabled]);
  useEffect(() => { soundThresholdRef.current = soundThresholdUsd; }, [soundThresholdUsd]);
  useEffect(() => { soundToneStyleRef.current = soundToneStyle; }, [soundToneStyle]);
  useEffect(() => { soundVolumeRef.current = soundVolume; }, [soundVolume]);

  const currentPricesRef = useRef(currentPrices);
  const tickersRef = useRef(tickers);

  useEffect(() => {
    currentPricesRef.current = currentPrices;
  }, [currentPrices]);

  useEffect(() => {
    tickersRef.current = tickers;
  }, [tickers]);

  // Play a highly polished, clean synthesizer tone dynamically via Web Audio API
  const playWhaleAlertPing = (styleOverride?: typeof soundToneStyle, volOverride?: number) => {
    const isEnabled = styleOverride ? true : soundEnabledRef.current;
    if (!isEnabled) return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      
      const ctx = new AudioContextClass();
      const style = styleOverride || soundToneStyleRef.current;
      const vol = volOverride !== undefined ? volOverride : soundVolumeRef.current;
      const now = ctx.currentTime;

      // Master volume gain node
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0, now);
      masterGain.gain.linearRampToValueAtTime(vol, now + 0.01);
      masterGain.connect(ctx.destination);

      const playOsc = (freq: number, startTime: number, duration: number, type: OscillatorType, innerVol: number, slideFreq?: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(freq, startTime);
        if (slideFreq) {
          osc.frequency.exponentialRampToValueAtTime(slideFreq, startTime + duration);
        }
        
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(innerVol, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
        
        osc.connect(gain);
        gain.connect(masterGain);
        
        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      if (style === "subtle-ping") {
        // High-frequency crystal glass chime
        playOsc(987.77, now, 0.4, "sine", 0.8); // B5 sine clean
        playOsc(1318.51, now + 0.02, 0.2, "sine", 0.4); // E6 high harmonic
      } else if (style === "double-chime") {
        // High-register sleek double-chime with high-pass clarity
        playOsc(659.25, now, 0.35, "sine", 0.7); // E5
        playOsc(987.77, now + 0.08, 0.45, "sine", 0.6); // B5
      } else if (style === "digital-radar") {
        // Futuristic short electronic digital beep sweep
        playOsc(1200, now, 0.08, "triangle", 0.7, 800); // Frequency sweep tap
        playOsc(2000, now + 0.04, 0.06, "sine", 0.3); // High tap tick
      } else if (style === "soft-ambient") {
        // Warm mellow low-frequency ambient bell
        playOsc(329.63, now, 0.7, "sine", 0.9); // E4 warm sine
        playOsc(440.00, now + 0.05, 0.5, "sine", 0.5); // A4 warm harmonic
      }
    } catch (e) {
      console.warn("Autoplay or audio feedback blocked by host policy restraints:", e);
    }
  };
  
  // Selected alert for Explorer Modal
  const [selectedAlert, setSelectedAlert] = useState<RealTimeAlert | null>(null);

  // Generate initial alerts
  useEffect(() => {
    const initialAlerts: RealTimeAlert[] = [];
    const now = new Date();
    
    for (let i = 0; i < 12; i++) {
      const timeOffset = (i * 4.5) + Math.random() * 2; // minutes ago
      const timestamp = new Date(now.getTime() - timeOffset * 60000);
      initialAlerts.push(generateAlert(timestamp));
    }
    setAlerts(initialAlerts.sort((a, b) => b.timestamp.localeCompare(a.timestamp)));
  }, []);

  // Streaming generator loop
  useEffect(() => {
    if (paused) return;

    const interval = setInterval(() => {
      const alert = generateAlert(new Date());
      setAlerts(prev => {
        const next = [alert, ...prev];
        return next.slice(0, 40); // keep max 40 in scrolling history
      });

      // Play audio indicator sound design for custom-defined High-Value transactions
      if (soundEnabledRef.current && alert.amountUsd >= soundThresholdRef.current) {
        playWhaleAlertPing();
      }

      // Visual flash indicator
      setNewAlertFlash(alert.id);
      setTimeout(() => setNewAlertFlash(null), 1500);
    }, 7000 + Math.random() * 4000);

    return () => clearInterval(interval);
  }, [paused]);

  function generateAlert(date: Date): RealTimeAlert {
    const template = STATIC_ALERT_TEMPLATES[Math.floor(Math.random() * STATIC_ALERT_TEMPLATES.length)];
    const isStableAsset = (sym: string) => ["USDT", "USDC", "PYUSD", "USD1", "USDS", "DAI", "USDe"].includes(sym);
    const getAssetDefaultPrice = (sym: string) => {
      if (isStableAsset(sym)) return 1.0;
      if (sym === "PAXG") return 2355.0;
      if (sym === "BTC") return 95480.0;
      if (sym === "ETH") return 3450.0;
      if (sym === "SOL") return 178.5;
      return 1.0;
    };
    const price = currentPricesRef.current[template.asset] || getAssetDefaultPrice(template.asset);
    
    // Create random variance for quantity
    const variance = 0.5 + Math.random() * 1.5;
    const amount = Math.floor(template.baseAmount * variance);
    const amountUsd = amount * price;

    const fromHash = "0x" + Math.random().toString(16).substring(2, 10) + "..." + Math.random().toString(16).substring(2, 6);
    const toHash = "0x" + Math.random().toString(16).substring(2, 10) + "..." + Math.random().toString(16).substring(2, 6);
    const txHash = "0x" + Array.from({length: 4}, () => Math.random().toString(16).substring(2, 10)).join("");

    const snapshot = tickersRef.current ? tickersRef.current[template.asset] : undefined;

    return {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: date.toISOString(),
      txHash,
      network: template.network as RealTimeAlert["network"],
      asset: template.asset,
      amount,
      amountUsd,
      fromAddress: fromHash,
      fromLabel: template.fromLabel,
      toAddress: toHash,
      toLabel: template.toLabel,
      flowType: template.flowType as RealTimeAlert["flowType"],
      gasFeeUsd: template.network === "Bitcoin" ? 8.5 + Math.random() * 12 : 2.5 + Math.random() * 25,
      assetTickerSnapshot: snapshot
    };
  }

  // Filter alerts
  const filteredAlerts = alerts.filter(alert => {
    if (assetFilter !== "ALL" && alert.asset !== assetFilter) return false;
    if (flowFilter !== "ALL" && alert.flowType !== flowFilter) return false;
    if (alert.amountUsd < minSizeUsd) return false;
    return true;
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col h-full" id="whale-alert-feed">
      {/* Feed Panel Header */}
      <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="relative flex h-3 w-3">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${paused ? 'bg-amber-400' : 'bg-emerald-400'} opacity-75`}></span>
            <span className={`relative inline-flex rounded-full h-3 w-3 ${paused ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
          </div>
          <h2 className="text-sm font-mono font-medium tracking-wider text-slate-100 uppercase flex items-center gap-2">
            STREAMS: Blockchain Ingestion Node
          </h2>
        </div>

        <div className="flex items-center gap-2.5 text-xs font-mono text-slate-400">
          <button 
            onClick={() => setPaused(!paused)}
            className={`px-2.5 py-1 rounded border transition-colors cursor-pointer ${paused ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 hover:bg-amber-500/20' : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20'}`}
          >
            {paused ? "PAUSED // RESUME" : "LIVE FEED ACTIVE"}
          </button>

          <button 
            onClick={() => {
              const nextVal = !soundEnabled;
              setSoundEnabled(nextVal);
              // Provide immediate auditory tap feedback on toggle if setting is switched to active
              if (nextVal) {
                setTimeout(() => playWhaleAlertPing(), 50);
              }
            }}
            id="mega-flow-sound-toggle-btn"
            className={`flex items-center justify-center p-1 rounded border transition-colors cursor-pointer ${soundEnabled ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20' : 'bg-slate-800 border-slate-700 text-slate-500 hover:bg-slate-700'}`}
            title={soundEnabled ? "Mute alert audio feedback" : "Unmute alert audio feedback"}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4 text-cyan-400 animate-pulse" /> : <VolumeX className="h-4 w-4 text-slate-500" />}
          </button>

          <button 
            onClick={() => setShowSoundConfig(!showSoundConfig)}
            id="whale-sound-config-toggle-btn"
            className={`flex items-center justify-center p-1.5 rounded border transition-colors cursor-pointer ${showSoundConfig ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20' : 'bg-slate-800 border-slate-700 text-slate-500 hover:bg-slate-700'}`}
            title="Configure High-Value audio alert triggers"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
          </button>

          <span className="hidden sm:inline text-slate-500">|</span>
          <span className="hidden sm:inline">Active: Binance, Coinbase, Uniswap, Geth-Indexers</span>
        </div>
      </div>

      {/* 🔮 AUDIO NOTIFICATION SYSTEM CONFIGURATION BAR */}
      {showSoundConfig && (
        <div id="whale-audio-config-panel" className="px-5 py-4 bg-slate-950/80 border-b border-slate-800/80 grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in text-xs font-mono">
          {/* Tone selector */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-500 uppercase font-bold block">Chime Preset</label>
            <div className="grid grid-cols-2 gap-1 bg-slate-900/50 p-1 rounded border border-slate-800">
              {(["subtle-ping", "double-chime", "digital-radar", "soft-ambient"] as const).map((style) => (
                <button
                  key={style}
                  onClick={() => {
                    setSoundToneStyle(style);
                    // play test immediately
                    setTimeout(() => playWhaleAlertPing(style), 50);
                  }}
                  className={`px-1.5 py-1 rounded text-[9px] uppercase font-bold text-center transition-all cursor-pointer ${
                    soundToneStyle === style 
                      ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-black" 
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {style.replace("-", " ")}
                </button>
              ))}
            </div>
          </div>

          {/* Trigger Threshold selector */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-500 uppercase font-bold block">USD Alert Threshold</label>
            <select
              value={soundThresholdUsd}
              onChange={(e) => setSoundThresholdUsd(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value={100000}>&gt; $100K (All Whales)</option>
              <option value={1000000}>&gt; $1.0M (High-Value)</option>
              <option value={5000000}>&gt; $5.0M (Mega Flows Only)</option>
              <option value={10000000}>&gt; $10.0M (DeFi Overlords)</option>
            </select>
          </div>

          {/* Volume slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase">
              <span>Alert Volume</span>
              <span className="text-cyan-400">{Math.round(soundVolume * 100)}%</span>
            </div>
            <div className="flex items-center gap-2 pt-1 h-8">
              <span className="text-[10px] text-slate-600">MIN</span>
              <input 
                type="range"
                min="0.05"
                max="1"
                step="0.05"
                value={soundVolume}
                onChange={(e) => {
                  const newVal = parseFloat(e.target.value);
                  setSoundVolume(newVal);
                }}
                className="w-full h-1 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <span className="text-[10px] text-slate-600">MAX</span>
            </div>
          </div>

          {/* Actions panel */}
          <div className="flex flex-col justify-end space-y-1">
            <button
              onClick={() => playWhaleAlertPing()}
              disabled={!soundEnabled}
              className="w-full bg-slate-900 hover:bg-slate-850 active:bg-slate-900 border border-slate-850 hover:border-slate-700 text-slate-300 py-1.5 rounded uppercase font-bold text-[10px] tracking-wide flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Volume2 className="h-3.5 w-3.5 text-cyan-400" />
              Test Audio Sound
            </button>
            <div className="text-[9px] text-slate-500 text-center uppercase leading-tight font-sans">
              Dynamic Web-Audio Synth (Low resource lag)
            </div>
          </div>
        </div>
      )}

      {/* Quick Asset Quick-Filter Tabs */}
      <div className="px-5 py-2.5 bg-slate-950/40 border-b border-slate-800/80 flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase mr-1">Quick Select:</span>
        {[
          { label: "ALL", color: "border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50", activeColor: "bg-slate-800 border-slate-500 text-white" },
          { label: "BTC", color: "border-amber-500/20 text-amber-500/90 hover:bg-amber-500/10", activeColor: "bg-amber-500/15 border-amber-500 text-amber-400 font-bold" },
          { label: "ETH", color: "border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/10", activeColor: "bg-indigo-500/15 border-indigo-400 text-indigo-300 font-bold" },
          { label: "SOL", color: "border-purple-500/20 text-purple-400 hover:bg-purple-500/10", activeColor: "bg-purple-500/15 border-purple-400 text-purple-300 font-bold" },
          { label: "USDT", color: "border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10", activeColor: "bg-emerald-500/15 border-emerald-400 text-emerald-300 font-bold" },
          { label: "USDC", color: "border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/10", activeColor: "bg-cyan-500/15 border-cyan-400 text-cyan-300 font-bold" },
          { label: "DAI", color: "border-yellow-500/20 text-yellow-500/90 hover:bg-yellow-500/10", activeColor: "bg-yellow-500/15 border-yellow-500 text-yellow-400 font-bold" },
          { label: "USDe", color: "border-pink-500/20 text-pink-400 hover:bg-pink-500/10", activeColor: "bg-pink-500/15 border-pink-400 text-pink-300 font-bold" }
        ].map((item) => {
          const isActive = assetFilter === item.label;
          return (
            <button
              key={item.label}
              onClick={() => setAssetFilter(item.label)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-all uppercase cursor-pointer ${
                isActive ? item.activeColor : item.color
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Real-time Filters */}
      <div className="p-3 bg-slate-900/60 border-b border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Asset filter */}
        <div className="flex items-center bg-slate-950 rounded px-2 py-1.5 border border-slate-800/80">
          <span className="text-[10px] font-mono font-bold tracking-tight text-slate-500 mr-2 uppercase">Asset</span>
          <select 
            value={assetFilter} 
            onChange={(e) => setAssetFilter(e.target.value)}
            className="bg-transparent text-slate-200 text-xs font-mono w-full focus:outline-none cursor-pointer text-slate-200"
          >
            <option value="ALL">ALL ASSETS</option>
            <option value="BTC">BTC (Bitcoin)</option>
            <option value="ETH">ETH (Ethereum)</option>
            <option value="SOL">SOL (Solana)</option>
            <option value="USDT">USDT (Tether USD)</option>
            <option value="USDC">USDC (USD Coin)</option>
            <option value="PYUSD">PYUSD (PayPal USD)</option>
            <option value="USD1">USD1 (USD1 Stable)</option>
            <option value="USDS">USDS (Sky Dollar)</option>
            <option value="DAI">DAI (Dai Stablecoin)</option>
            <option value="USDe">USDe (Ethena USDe)</option>
            <option value="PAXG">PAXG (Pax Gold)</option>
          </select>
        </div>

        {/* Direction filter */}
        <div className="flex items-center bg-slate-950 rounded px-2 py-1.5 border border-slate-800/80">
          <span className="text-[10px] font-mono font-bold tracking-tight text-slate-500 mr-2 uppercase">Type</span>
          <select 
            value={flowFilter} 
            onChange={(e) => setFlowFilter(e.target.value)}
            className="bg-transparent text-slate-200 text-xs font-mono w-full focus:outline-none cursor-pointer"
          >
            <option value="ALL">ALL FLOWS</option>
            <option value="Exchange Inflow">Exchange Inflow 📥</option>
            <option value="Exchange Outflow">Exchange Outflow 📤</option>
            <option value="Wallet to Wallet">Wallet to Wallet ⛓️</option>
          </select>
        </div>

        {/* Min Size filter */}
        <div className="flex items-center bg-slate-950 rounded px-2 py-1.5 border border-slate-800/80">
          <span className="text-[10px] font-mono font-bold tracking-tight text-slate-500 mr-2 uppercase">Size</span>
          <select 
            value={minSizeUsd} 
            onChange={(e) => setMinSizeUsd(Number(e.target.value))}
            className="bg-transparent text-slate-200 text-xs font-mono w-full focus:outline-none cursor-pointer"
          >
            <option value={100000}>&gt; $100K USD</option>
            <option value={1000000}>&gt; $1M USD</option>
            <option value={5000000}>&gt; $5M USD</option>
            <option value={20000000}>&gt; $20M USD</option>
          </select>
        </div>
      </div>

      {/* Alerts Feed Container */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2 h-[420px]" style={{ scrollbarWidth: 'thin' }}>
        {filteredAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-slate-500 font-mono text-xs">
            <Layers className="h-6 w-6 text-slate-700 mb-2 stroke-1" />
            No real-time blocks passed filter constraints.
            <span className="text-slate-600 mt-1">Listening for larger transfers...</span>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isFlash = newAlertFlash === alert.id;
            const sizeSeverity = alert.amountUsd >= 5000000 ? "border-rose-500/30 bg-rose-950/10" : "border-slate-800 bg-slate-900/30";

            return (
              <div 
                key={alert.id}
                className={`relative px-4 py-3 border rounded-lg transition-all duration-700 flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                  isFlash ? "bg-cyan-950/40 border-cyan-400/80 scale-[1.01]" : sizeSeverity
                }`}
              >
                {/* Visual Indicator of alert priority */}
                {alert.amountUsd >= 5000000 && (
                  <div className="absolute top-0 bottom-0 left-0 w-1 bg-red-500 rounded-l"></div>
                )}

                {/* Left block (Time & Direction type) */}
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 p-2 rounded-lg ${
                    alert.flowType === "Exchange Inflow" ? "bg-red-500/10 text-red-400" :
                    alert.flowType === "Exchange Outflow" ? "bg-emerald-500/10 text-emerald-400" :
                    "bg-blue-500/10 text-blue-400"
                  }`}>
                    {alert.flowType === "Exchange Inflow" ? <ArrowDownLeft className="h-4 w-4" /> :
                     alert.flowType === "Exchange Outflow" ? <ArrowUpRight className="h-4 w-4" /> :
                     <Database className="h-4 w-4" />}
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-300">
                        {alert.amount.toLocaleString()} {alert.asset}
                      </span>
                      <span className="text-slate-500 font-mono text-[11px]">~${alert.amountUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                      <span className="px-1.5 py-0.5 bg-slate-800 text-slate-400 text-[9px] rounded font-mono uppercase">
                        {alert.network}
                      </span>
                      {alert.assetTickerSnapshot && (
                        <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-950/60 text-slate-400 text-[9px] rounded font-mono border border-slate-800/80">
                          <span className={`h-1.5 w-1.5 rounded-full ${alert.assetTickerSnapshot.change24h >= 0 ? "bg-emerald-400" : "bg-red-400"}`}></span>
                          {alert.assetTickerSnapshot.change24h >= 0 ? "+" : ""}{alert.assetTickerSnapshot.change24h.toFixed(2)}%
                        </span>
                      )}
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-x-2 text-[11px] font-mono text-slate-400">
                      <span className="text-slate-500">From</span> 
                      <button 
                        onClick={() => onSelectAddress(alert.fromAddress)} 
                        className="text-cyan-400 font-bold hover:underline max-w-[120px] truncate"
                        title={alert.fromAddress}
                      >
                        {alert.fromLabel}
                      </button>
                      <span className="text-slate-500">➜ To</span> 
                      <button 
                        onClick={() => onSelectAddress(alert.toAddress)} 
                        className="text-cyan-400 font-bold hover:underline max-w-[120px] truncate"
                        title={alert.toAddress}
                      >
                        {alert.toLabel}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Block (Value & Block-Explorer Launcher) */}
                <div className="flex items-center justify-between md:justify-end gap-3 border-t md:border-t-0 border-slate-800/80 pt-2 md:pt-0">
                  <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[10px]">
                    <Clock className="h-3 w-3" />
                    {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </div>

                  <div className="flex gap-2">
                    {alert.amountUsd >= 5000000 && (
                      <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded text-[9px] font-mono font-bold flex items-center gap-1">
                        <ShieldAlert className="h-3 w-3 text-rose-400 animate-pulse" />
                        MEGA FLOW
                      </span>
                    )}

                    <button 
                      onClick={() => setSelectedAlert(alert)}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-[10px] font-mono flex items-center gap-1 transition-colors"
                    >
                      EXPLORE <ExternalLink className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Explorer Drawer / Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-cyan-400" />
                <h3 className="font-mono text-sm uppercase text-slate-100">
                  BLOCK EXPLORER: Transaction Receipt
                </h3>
              </div>
              <button 
                onClick={() => setSelectedAlert(null)}
                className="text-slate-400 hover:text-slate-100 font-mono text-xs px-2 py-1 bg-slate-800/60 rounded"
              >
                [CLOSE]
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4 font-mono text-xs text-slate-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-slate-950 rounded border border-slate-800">
                  <span className="text-slate-500 block mb-1">TRANSACTION HASH</span>
                  <span className="text-cyan-400 word-break break-all select-all">{selectedAlert.txHash}</span>
                </div>
                <div className="p-3 bg-slate-950 rounded border border-slate-800">
                  <span className="text-slate-500 block mb-1">BLOCK PROCESSING NODE</span>
                  <span className="text-slate-300">Geth v1.13-Optimistic (Synced)</span>
                </div>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded space-y-2">
                <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                  <span className="text-slate-500">NETWORK DOMAIN</span>
                  <span className="text-slate-200 uppercase font-semibold">{selectedAlert.network} Protocol</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                  <span className="text-slate-500">TRANSFER SIZE</span>
                  <span className="text-emerald-400 font-bold">
                    {selectedAlert.amount.toLocaleString()} {selectedAlert.asset} (~${selectedAlert.amountUsd.toLocaleString()})
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                  <span className="text-slate-500">SENDER KEY (FROM)</span>
                  <div className="flex flex-col items-end">
                    <span className="text-slate-200">{selectedAlert.fromLabel}</span>
                    <span className="text-slate-500 text-[10px]">{selectedAlert.fromAddress}</span>
                  </div>
                </div>
                <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                  <span className="text-slate-500">MUTUAL TARGET (TO)</span>
                  <div className="flex flex-col items-end">
                    <span className="text-slate-200">{selectedAlert.toLabel}</span>
                    <span className="text-slate-500 text-[10px]">{selectedAlert.toAddress}</span>
                  </div>
                </div>
                <div className="flex justify-between pb-0.5">
                  <span className="text-slate-500">FLOW CLASSIFICATION</span>
                  <span className={`font-bold px-1.5 rounded text-[10px] uppercase ${
                    selectedAlert.flowType === "Exchange Inflow" ? "bg-red-500/10 text-red-400" :
                    selectedAlert.flowType === "Exchange Outflow" ? "bg-emerald-500/10 text-emerald-400" :
                    "bg-blue-500/10 text-blue-400"
                  }`}>
                    {selectedAlert.flowType}
                  </span>
                </div>
              </div>

              {/* Asset Ticker Snapshot Details */}
              {selectedAlert.assetTickerSnapshot && (
                <div className="p-4 bg-slate-950 border border-slate-800 rounded space-y-2.5">
                  <div className="flex items-center gap-1.5 border-b border-slate-900 pb-2">
                    <Sparkles className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-300">Snapshotted Asset Exchange Market State</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-[10px] pt-1">
                    <div>
                      <span className="text-slate-500 block uppercase font-bold mb-0.5">LAST DEALT PRICE</span>
                      <span className="text-cyan-400 font-bold font-mono">
                        ${selectedAlert.assetTickerSnapshot.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block uppercase font-bold mb-0.5">24h TREND INDEX</span>
                      <span className={`font-bold font-mono ${selectedAlert.assetTickerSnapshot.change24h >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {selectedAlert.assetTickerSnapshot.change24h >= 0 ? "+" : ""}{selectedAlert.assetTickerSnapshot.change24h.toFixed(2)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block uppercase font-bold mb-0.5">24h EXCH VOL</span>
                      <span className="text-slate-200 font-bold font-mono">
                        ${(selectedAlert.assetTickerSnapshot.volume24h / 1e9).toFixed(3)}B
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block uppercase font-bold mb-0.5">24h HIGH / LOW</span>
                      <span className="text-slate-300 font-mono">
                        ${selectedAlert.assetTickerSnapshot.high24h.toLocaleString()} / ${selectedAlert.assetTickerSnapshot.low24h.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-slate-950/60 border border-slate-800 rounded">
                  <span className="text-slate-500 block mb-1">CONVERGED PROTOCOL FEE</span>
                  <span className="text-amber-400">${selectedAlert.gasFeeUsd.toFixed(4)} USD</span>
                </div>
                <div className="p-3 bg-slate-950/60 border border-slate-800 rounded">
                  <span className="text-slate-500 block mb-1">MARKET ACTION</span>
                  <span className="text-slate-300">
                    {selectedAlert.flowType === "Exchange Inflow" ? "Potential Liquid dumping / selling pressure on Orderbook." :
                     selectedAlert.flowType === "Exchange Outflow" ? "Cold custody accumulation, decreasing active liquidity pool." :
                     "Off-market OTC rebalancing or private multi-sig transition."}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-between gap-3 text-slate-400 text-[10px]">
                <span className="flex items-center gap-1"><Info className="h-3.5 w-3.5" /> Telemetry data parsed instantly via AI Stream-Gateways</span>
                <button 
                  onClick={() => {
                    onSelectAddress(selectedAlert.fromLabel);
                    setSelectedAlert(null);
                  }}
                  className="text-cyan-400 hover:underline font-bold"
                >
                  LOAD WALLET IN DIAGNOSTICIAN ➜
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
