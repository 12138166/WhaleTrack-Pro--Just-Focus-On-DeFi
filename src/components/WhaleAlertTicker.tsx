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
  SlidersHorizontal,
  Wifi,
  Activity,
  Cpu,
  Server,
  RefreshCw,
  Terminal,
  Zap,
  Play,
  Pause,
  AlertTriangle,
  Flame,
  CheckCircle,
  TrendingUp,
  Award
} from "lucide-react";
import { RealTimeAlert, TickerPrice } from "../types";
import { STATIC_ALERT_TEMPLATES } from "../data";

interface LogLine {
  id: string;
  time: string;
  level: "INFO" | "SUCCESS" | "WARN" | "DEBUG";
  message: string;
}

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

  // New Telemetry & Logs States:
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [ingestionVelocity, setIngestionVelocity] = useState<number>(1.2); // seconds per raw ws-event log
  const [termPaused, setTermPaused] = useState<boolean>(false);
  const [totalInflowVolume, setTotalInflowVolume] = useState<number>(341200000);
  const [totalOutflowVolume, setTotalOutflowVolume] = useState<number>(289450000);
  const [reconnectingNodes, setReconnectingNodes] = useState<boolean>(false);
  
  const [rpcNodes, setRpcNodes] = useState<{
    [chain: string]: { block: number; latency: number; peers: number; gas: string; tps: number; status: "synced" | "syncing" | "offline" }
  }>({
    Ethereum: { block: 20154942, latency: 45, peers: 64, gas: "14 Gwei", tps: 18, status: "synced" },
    Bitcoin: { block: 849201, latency: 120, peers: 28, gas: "42 vB", tps: 7, status: "synced" },
    Solana: { block: 275891040, latency: 18, peers: 128, gas: "0.0003$", tps: 2450, status: "synced" },
    Base: { block: 15410903, latency: 25, peers: 42, gas: "1.2 Gwei", tps: 45, status: "synced" },
    Tron: { block: 61921405, latency: 68, peers: 35, gas: "1.5 TRX", tps: 40, status: "synced" }
  });

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const terminalContainerRef = useRef<HTMLDivElement>(null);

  // Generate initial alerts
  useEffect(() => {
    const initialAlerts: RealTimeAlert[] = [];
    const now = new Date();
    
    for (let i = 0; i < 15; i++) {
      const timeOffset = (i * 3.5) + Math.random() * 2;
      const timestamp = new Date(now.getTime() - timeOffset * 60000);
      initialAlerts.push(generateAlert(timestamp));
    }
    setAlerts(initialAlerts.sort((a, b) => b.timestamp.localeCompare(a.timestamp)));
  }, []);

  // Sync Node Block Simulator & Gas updates
  useEffect(() => {
    if (reconnectingNodes) return;
    const blockTimer = setInterval(() => {
      setRpcNodes(prev => {
        const next = { ...prev };
        
        // Ethereum Block
        if (Math.random() < 0.12) {
          next.Ethereum.block += 1;
          next.Ethereum.latency = Math.floor(38 + Math.random() * 12);
          next.Ethereum.gas = Math.floor(10 + Math.random() * 9) + " Gwei";
          next.Ethereum.tps = Math.floor(14 + Math.random() * 10);
        }
        
        // Solana blocks (very fast!)
        next.Solana.block += Math.floor(1 + Math.random() * 3);
        next.Solana.latency = Math.floor(14 + Math.random() * 8);
        next.Solana.tps = Math.floor(2100 + Math.random() * 800);
        
        // Base Blocks
        if (Math.random() < 0.45) {
          next.Base.block += 1;
          next.Base.latency = Math.floor(18 + Math.random() * 12);
          next.Base.gas = (0.5 + Math.random() * 0.9).toFixed(2) + " Gwei";
          next.Base.tps = Math.floor(30 + Math.random() * 30);
        }

        // Tron
        if (Math.random() < 0.35) {
          next.Tron.block += 1;
          next.Tron.latency = Math.floor(50 + Math.random() * 25);
          next.Tron.tps = Math.floor(32 + Math.random() * 20);
        }

        // Bitcoin
        if (Math.random() < 0.02) {
          next.Bitcoin.block += 1;
          next.Bitcoin.latency = Math.floor(95 + Math.random() * 40);
          next.Bitcoin.gas = Math.floor(25 + Math.random() * 25) + " vB";
        }
        
        return next;
      });
    }, 1000);

    return () => clearInterval(blockTimer);
  }, [reconnectingNodes]);

  // Simulated rapid raw mempool websocket stream logging
  useEffect(() => {
    const startingLogs: LogLine[] = [];
    const activeChains = ["Ethereum", "Solana", "Bitcoin", "Base", "Tron"];
    const levels = ["INFO", "DEBUG", "SUCCESS", "WARN"];
    const messages = [
      "Broadcasting peer handshakes on ws-secure channel...",
      "RPC Ingestion Tunnel established securely (TLS 1.3)",
      "Sync validation for high-register Whale Filter parameters complete",
      "Gas indices refreshed on global aggregator",
      "Memory stack clean. Heap allocation: 8.54 MB max",
      "WebSocket connection established at dev-node-ap.llama.fi",
      "Calculated TVL threshold triggers calibrated to $100K and above"
    ];
    
    for (let i = 0; i < 20; i++) {
      const timeOffset = new Date(Date.now() - (20 - i) * 2500);
      const timeStr = timeOffset.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      startingLogs.push({
        id: "start-" + i,
        time: timeStr,
        level: i === 5 ? "WARN" : (levels[i % levels.length] as any),
        message: i < messages.length ? messages[i] : `[RPC-${activeChains[i%5].toUpperCase()}] Ingested transaction segment packet index ${1500+i}`
      });
    }
    setLogs(startingLogs);
  }, []);

  useEffect(() => {
    if (termPaused || reconnectingNodes) return;

    const logTemplates = [
      { level: "INFO", msg: (node: string) => `[PEER-${node}] Received ping request: OK` },
      { level: "DEBUG", msg: (node: string) => `[MEMPOOL] Collected tx_swap_0x${Math.random().toString(16).substring(2,6)}...${Math.random().toString(16).substring(6,10)} size normal` },
      { level: "SUCCESS", msg: (node: string) => `[METRICS] Verified gas index matched standard payload constraints` },
      { level: "INFO", msg: (node: string) => `[PEER-ROUTE] Propagated consensus signatures across regional network nodes` },
      { level: "WARN", msg: (node: string) => `[MEM-MONITOR] High frequency packet intake observed on channel stream` },
      { level: "DEBUG", msg: (node: string) => `[RPC-WS] Heartbeat OK. Sync checkpoints reconciled successfully` },
      { level: "INFO", msg: (node: string) => `[STATE] Garbage collection sweep completed. Stack latency minimized` }
    ];

    const streamInterval = setInterval(() => {
      const activeChains = ["Ethereum", "Solana", "Bitcoin", "Base", "Tron"];
      const randChain = activeChains[Math.floor(Math.random() * activeChains.length)];
      const randTemplate = logTemplates[Math.floor(Math.random() * logTemplates.length)];
      const now = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

      setLogs(prev => {
        const line: LogLine = {
          id: Math.random().toString(36).substring(2, 7),
          time: now,
          level: randTemplate.level as any,
          message: randTemplate.msg(randChain.substring(0,3).toUpperCase() + "-" + Math.floor(10 + Math.random()*90))
        };
        const next = [...prev, line];
        return next.slice(-40);
      });

      // Periodic scrolling alignment within the container itself to avoid page scrolling jump issues
      if (terminalContainerRef.current) {
        terminalContainerRef.current.scrollTop = terminalContainerRef.current.scrollHeight;
      }
    }, ingestionVelocity * 1000);

    return () => clearInterval(streamInterval);
  }, [ingestionVelocity, termPaused, reconnectingNodes]);

  // Streaming generator loop for Whale Alerts
  useEffect(() => {
    if (paused || reconnectingNodes) return;

    const interval = setInterval(() => {
      const alert = generateAlert(new Date());
      setAlerts(prev => {
        const next = [alert, ...prev];
        return next.slice(0, 40);
      });

      // Accumulate stats
      if (alert.flowType === "Exchange Inflow") {
        setTotalInflowVolume(v => v + alert.amountUsd);
      } else if (alert.flowType === "Exchange Outflow") {
        setTotalOutflowVolume(v => v + alert.amountUsd);
      } else {
        setTotalInflowVolume(v => v + alert.amountUsd * 0.4);
        setTotalOutflowVolume(v => v + alert.amountUsd * 0.4);
      }

      // Live terminal log of whale detection
      const now = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLogs(prev => [
        ...prev,
        {
          id: "log-" + Math.random(),
          time: now,
          level: "SUCCESS",
          message: `🚨 [INGESTION-ENGINE] WHALE IDENTIFIED: Moved ${alert.amount.toLocaleString()} ${alert.asset} (~$${(alert.amountUsd / 1e6).toFixed(2)}M) via ${alert.network}`
        }
      ].slice(-40));

      if (soundEnabledRef.current && alert.amountUsd >= soundThresholdRef.current) {
        playWhaleAlertPing();
      }

      setNewAlertFlash(alert.id);
      setTimeout(() => setNewAlertFlash(null), 1500);
    }, 6000 + Math.random() * 3000);

    return () => clearInterval(interval);
  }, [paused, reconnectingNodes]);

  // Manual Force Node Reconnection Trigger
  const handleReconnectNodes = () => {
    if (reconnectingNodes) return;
    setReconnectingNodes(true);
    const now = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [
      ...prev,
      { id: "recon-1", time: now, level: "WARN", message: "⚠️ [RPC-HEALTH] INTERRUPT COMMAND: Dropping peer connections..." },
      { id: "recon-2", time: now, level: "INFO", message: "⏳ [NETWORK-DIAG] Initializing fresh SSL/TLS endpoints for 5 nodes..." }
    ].slice(-40));

    setRpcNodes(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(chain => {
        next[chain].status = "syncing";
        next[chain].latency = 999;
      });
      return next;
    });

    setTimeout(() => {
      setRpcNodes(prev => {
        const next = { ...prev };
        Object.keys(next).forEach((chain, idx) => {
          next[chain].status = "synced";
          next[chain].latency = Math.floor(12 + idx * 18);
        });
        return next;
      });
      setReconnectingNodes(false);

      const restoreTime = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLogs(prev => [
        ...prev,
        { id: "recon-3", time: restoreTime, level: "SUCCESS", message: "🚀 [INGEST-OK] Node matrix re-established! Websocket listener syncing at block bounds." }
      ].slice(-40));

      playWhaleAlertPing("subtle-ping", 0.35);
    }, 2000);
  };

  // Stress-Test Injector Manual Trigger
  const handleStressInjectManual = (type: "INFLOW" | "OUTFLOW" | "RANDOM") => {
    if (reconnectingNodes) return;

    const assets = ["BTC", "ETH", "SOL", "USDT", "USDC"];
    const randAsset = assets[Math.floor(Math.random() * assets.length)];
    const price = currentPricesRef.current[randAsset] || (randAsset === "BTC" ? 95000 : randAsset === "ETH" ? 3400 : randAsset === "SOL" ? 175 : 1.0);
    
    // Mega Size transaction
    const targetSizeUsd = 12000000 + Math.random() * 28000000;
    const amount = Math.floor(targetSizeUsd / price);
    const amountUsd = amount * price;

    const flowType = type === "INFLOW" ? "Exchange Inflow" : type === "OUTFLOW" ? "Exchange Outflow" : Math.random() > 0.5 ? "Exchange Inflow" : "Exchange Outflow";

    const stressAlert: RealTimeAlert = {
      id: "stress-" + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      txHash: "0xSTRESS" + Array.from({length: 12}, () => Math.floor(Math.random()*16).toString(16)).join("").toUpperCase(),
      network: randAsset === "SOL" ? "Solana" : randAsset === "BTC" ? "Bitcoin" : "Ethereum",
      asset: randAsset,
      amount,
      amountUsd,
      fromAddress: "0xSTRESS_SOURCE" + Math.random().toString(16).substring(2, 6).toUpperCase(),
      fromLabel: flowType === "Exchange Inflow" ? "🚨 Active Liquid Whale Agent" : "Binance Cold Storage Hub",
      toAddress: "0xSTRESS_TARGET" + Math.random().toString(16).substring(2, 6).toUpperCase(),
      toLabel: flowType === "Exchange Inflow" ? "Binance Deposit Ingress" : "🐳 Immutable Private Multi-Sig Vault",
      flowType,
      gasFeeUsd: randAsset === "BTC" ? 18.52 : 3.42 + Math.random()*20,
      assetTickerSnapshot: tickersRef.current ? tickersRef.current[randAsset] : undefined
    };

    setAlerts(prev => [stressAlert, ...prev].slice(0, 40));

    if (flowType === "Exchange Inflow") {
      setTotalInflowVolume(v => v + amountUsd);
    } else {
      setTotalOutflowVolume(v => v + amountUsd);
    }

    const now = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [
      ...prev,
      {
        id: "stress-log-" + Math.random(),
        time: now,
        level: "WARN",
        message: `🚨 [STRESS_ALARM] MANUALLY INJECTED MEGA TRACE: Ingested ${amount.toLocaleString()} ${randAsset} ($${(amountUsd / 1e6).toFixed(2)}M)`
      }
    ].slice(-40));

    playWhaleAlertPing("digital-radar", 0.6);

    setNewAlertFlash(stressAlert.id);
    setTimeout(() => setNewAlertFlash(null), 1800);
  };

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

  // Calculate ratio
  const inflowRatio = (totalInflowVolume / (totalInflowVolume + totalOutflowVolume)) * 100 || 50;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6" id="whale-alert-feed">
      
      {/* ==================== COLUMN 1: TELEMETRY DIAGNOSTIC DESK (xl:col-span-5) ==================== */}
      <div className="xl:col-span-5 flex flex-col gap-5 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
        
        {/* Block 1.1: Live Synchronizers Status */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-[11px] font-mono font-bold text-slate-300 uppercase flex items-center gap-1.5">
              <Server className="h-3.5 w-3.5 text-emerald-400" /> RPC Node Concentric Matrix
            </span>
            <span className="text-[10px] font-mono text-slate-500 uppercase flex items-center gap-1">
              <Wifi className="h-3 w-3 text-emerald-500 animate-pulse" /> matrix live
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-[10.5px]">
              <thead>
                <tr className="text-slate-500 text-[9px] uppercase border-b border-slate-800/60 pb-1 text-slate-400">
                  <th className="pb-1.5">Chain</th>
                  <th className="pb-1.5 text-center">Height</th>
                  <th className="pb-1.5 text-center">Ping</th>
                  <th className="pb-1.5 text-right">Gas/Cost</th>
                  <th className="pb-1.5 text-right">TPS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {Object.keys(rpcNodes).map(chain => {
                  const node = rpcNodes[chain];
                  const isSyncing = node.status === "syncing" || reconnectingNodes;
                  return (
                    <tr key={chain} className="hover:bg-slate-955/40 transition">
                      <td className="py-2 flex items-center gap-1.5">
                        <span className={`inline-block w-1.5 h-1.5 rounded-full ${isSyncing ? "bg-amber-400 animate-pulse" : "bg-emerald-400"}`}></span>
                        <span className="font-semibold text-slate-200">{chain}</span>
                      </td>
                      <td className="py-2 text-center text-slate-300 font-mono">
                        {isSyncing ? (
                          <span className="text-amber-400 text-[10px]">SYNCING...</span>
                        ) : (
                          node.block.toLocaleString()
                        )}
                      </td>
                      <td className="py-2 text-center text-slate-400">
                        {isSyncing ? "999ms" : `${node.latency}ms`}
                      </td>
                      <td className="py-2 text-right text-cyan-400 font-bold">
                        {node.gas}
                      </td>
                      <td className="py-2 text-right text-slate-300">
                        {isSyncing ? "0" : node.tps.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Block 1.2: Cumulative Flow Balance */}
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-400">
            <span className="flex items-center gap-1">
              <Activity className="h-3 w-3 text-cyan-400" /> Web-Socket Ingress Volume Balance (Cumulative)
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center py-1">
            <div className="bg-slate-900/50 p-2 rounded border border-slate-800/60 font-mono">
              <div className="text-[8.5px] text-slate-500 uppercase font-black">Net Inflow (Deposits)</div>
              <div className="text-xs font-mono font-black text-rose-400">${(totalInflowVolume / 1e6).toFixed(1)}M</div>
            </div>
            <div className="bg-slate-900/50 p-2 rounded border border-slate-800/60 font-mono">
              <div className="text-[8.5px] text-slate-500 uppercase font-black">Net Outflow (Custody)</div>
              <div className="text-xs font-mono font-black text-emerald-400">${(totalOutflowVolume / 1e6).toFixed(1)}M</div>
            </div>
          </div>

          {/* Ratio bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[9px] font-mono text-slate-500">
              <span className="text-rose-400 font-bold">INFLOWS: {inflowRatio.toFixed(1)}%</span>
              <span className="text-emerald-400 font-bold">OUTFLOWS: {(100 - inflowRatio).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-slate-850 h-2 rounded overflow-hidden flex">
              <div className="bg-rose-500 transition-all duration-500" style={{ width: `${inflowRatio}%` }}></div>
              <div className="bg-emerald-500 transition-all duration-500 flex-1"></div>
            </div>
          </div>
        </div>

        {/* Block 1.3: Real-time Ingestion Web-socket Terminal Logs */}
        <div className="space-y-1 bg-slate-955 rounded-lg border border-slate-800 p-2.5 flex-1 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-850 pb-1.5 mb-1.5 font-mono">
            <span className="text-[10px] font-black text-cyan-400 flex items-center gap-1">
              <Terminal className="h-3.5 w-3.5 animate-pulse" /> Live WS Ingestion Console
            </span>
            <div className="flex items-center gap-1 text-[8.5px]">
              <button 
                onClick={() => setTermPaused(!termPaused)}
                className={`px-1.5 py-0.5 rounded border ${termPaused ? 'text-amber-400 border-amber-800 bg-amber-950/20' : 'text-slate-400 border-slate-800 hover:text-white'}`}
                title={termPaused ? "Resume Terminal log scroll" : "Pause Terminal log scroll"}
              >
                {termPaused ? <Play className="h-1.5 w-1.5 inline mr-0.5" /> : <Pause className="h-1.5 w-1.5 inline mr-0.5" />}
                {termPaused ? "HOLD" : "STREAM"}
              </button>
              <button 
                onClick={() => setLogs([])}
                className="px-1.5 py-0.5 rounded border border-slate-800 text-slate-400 hover:text-white"
                title="Flush console log lines"
              >
                CLEAR
              </button>
            </div>
          </div>

          {/* Running Terminal Window */}
          <div 
            ref={terminalContainerRef}
            className="bg-slate-955 text-[10px] font-mono text-slate-400 overflow-y-auto h-[210px] space-y-1 p-1 rounded border border-slate-900/60 leading-tight"
          >
            {logs.length === 0 ? (
              <div className="text-slate-600 text-center py-10">
                [CON_REST_FLAG] Waiting for incoming stream socket activity...
              </div>
            ) : (
              logs.map((log) => {
                let badgeColor = "text-slate-500";
                if (log.level === "SUCCESS") badgeColor = "text-emerald-400 font-bold";
                else if (log.level === "WARN") badgeColor = "text-amber-400 font-bold animate-pulse";
                else if (log.level === "DEBUG") badgeColor = "text-indigo-400";
                else if (log.level === "INFO") badgeColor = "text-cyan-400";

                return (
                  <div key={log.id} className="flex gap-2 hover:bg-slate-900/40 p-0.5 rounded transition-all">
                    <span className="text-slate-600 shrink-0 text-[9px]">{log.time}</span>
                    <span className={`${badgeColor} shrink-0 uppercase text-[8.5px]`}>[{log.level}]</span>
                    <span className="text-slate-300 break-all select-all font-mono text-[9.5px]">{log.message}</span>
                  </div>
                );
              })
            )}
            <div ref={terminalEndRef}></div>
          </div>
        </div>

        {/* Block 1.4: Node Speed & Stress-Test Manual Controls */}
        <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-850 space-y-3 font-mono">
          <div className="flex items-center justify-between text-[9px] font-bold text-slate-500 uppercase">
            <span>Terminal Core Controls & Stress Deck</span>
          </div>

          {/* Ingestion speed slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-[9px]">
              <span className="text-slate-400 font-bold">INGESTION INTERVAL VELOCITY</span>
              <span className="text-cyan-400 font-bold">
                {ingestionVelocity <= 0.5 ? "⚡ FLOOD (0.3s)" :
                 ingestionVelocity <= 1.0 ? "🔥 AGGRESSIVE (0.8s)" : "💤 STANDARD (1.5s)"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[8.5px] text-slate-600">FASTER</span>
              <input 
                type="range"
                min="0.3"
                max="2.5"
                step="0.3"
                value={ingestionVelocity}
                onChange={(e) => setIngestionVelocity(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-900 rounded appearance-none cursor-pointer accent-cyan-500"
              />
              <span className="text-[8.5px] text-slate-600">SLOWER</span>
            </div>
          </div>

          {/* Stress Injection controls / manual re-sync buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
            <button
              onClick={handleReconnectNodes}
              disabled={reconnectingNodes}
              className="py-1.5 px-2 bg-slate-900 hover:bg-slate-850 disabled:opacity-50 border border-slate-800 hover:border-slate-600 text-slate-300 rounded font-black flex items-center justify-center gap-1 transition cursor-pointer"
            >
              <RefreshCw className={`h-3 w-3 text-cyan-400 ${reconnectingNodes ? "animate-spin" : ""}`} />
              RE-SYNC NODE SYSTEM
            </button>
            <button
              onClick={() => handleStressInjectManual("INFLOW")}
              disabled={reconnectingNodes}
              className="py-1.5 px-2 bg-red-950/15 hover:bg-red-950/30 border border-red-950/40 hover:border-red-800 text-rose-300 rounded font-black flex items-center justify-center gap-1 transition cursor-pointer"
            >
              <Flame className="h-3 w-3 text-rose-500 animate-pulse" />
              INJECT STRESS INFLOW
            </button>
          </div>
        </div>

      </div>

      {/* ===================== COLUMN 2: LARGE FLOW LIVE ALERTS LIST (xl:col-span-7) ===================== */}
      <div className="xl:col-span-7 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col h-full">
        
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
              className={`px-2.5 py-1 rounded border transition-colors cursor-pointer text-[10px] font-bold ${paused ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 hover:bg-amber-500/20' : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20'}`}
            >
              {paused ? "PAUSED // RESUME" : "LIVE FEED ACTIVE"}
            </button>

            <button 
              onClick={() => {
                const nextVal = !soundEnabled;
                setSoundEnabled(nextVal);
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
            <span className="hidden lg:inline text-[10px] text-slate-500 font-mono">Binance, Coinbase, Geth-Indexers Ready</span>
          </div>
        </div>

        {/* AUDIO SETTINGS BAR (collapsible) */}
        {showSoundConfig && (
          <div id="whale-audio-config-panel" className="px-5 py-4 bg-slate-950/85 border-b border-slate-800/80 grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in text-xs font-mono">
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 uppercase font-bold block">Chime Preset</label>
              <div className="grid grid-cols-2 gap-1 bg-slate-900/50 p-1 rounded border border-slate-800">
                {(["subtle-ping", "double-chime", "digital-radar", "soft-ambient"] as const).map((style) => (
                  <button
                    key={style}
                    onClick={() => {
                      setSoundToneStyle(style);
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

            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase font-black">
                <span>Alert Volume</span>
                <span className="text-cyan-400">{Math.round(soundVolume * 100)}%</span>
              </div>
              <div className="flex items-center gap-2 pt-1 h-8">
                <span className="text-[10px] text-slate-600 font-black">MIN</span>
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
                  className="w-full h-1 bg-slate-850 rounded appearance-none cursor-pointer accent-cyan-500"
                />
                <span className="text-[10px] text-slate-600 font-black">MAX</span>
              </div>
            </div>

            <div className="flex flex-col justify-end space-y-1">
              <button
                onClick={() => playWhaleAlertPing()}
                disabled={!soundEnabled}
                className="w-full bg-slate-900 hover:bg-slate-850 active:bg-slate-900 border border-slate-850 hover:border-slate-700 text-slate-300 py-1.5 rounded uppercase font-bold text-[10px] tracking-wide flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Volume2 className="h-3.5 w-3.5 text-cyan-400" />
                Test Sound Chimes
              </button>
              <div className="text-[9px] text-slate-500 text-center uppercase leading-tight font-sans">
                Dynamic Web-Audio Synthesized Signal
              </div>
            </div>
          </div>
        )}

        {/* QUICK FILTERS ASSET TABS */}
        <div className="px-5 py-2.5 bg-slate-950/40 border-b border-slate-800/80 flex flex-wrap items-center gap-2 animate-fade-in">
          <span className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase mr-1">Quick Selection:</span>
          {[
            { label: "ALL", color: "border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50", activeColor: "bg-slate-800 border-slate-500 text-white font-bold" },
            { label: "BTC", color: "border-amber-500/20 text-amber-500 hover:bg-amber-500/10", activeColor: "bg-amber-500/15 border-amber-500 text-amber-400 font-black" },
            { label: "ETH", color: "border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/10", activeColor: "bg-indigo-500/15 border-indigo-400 text-indigo-300 font-black" },
            { label: "SOL", color: "border-purple-500/20 text-purple-400 hover:bg-purple-500/10", activeColor: "bg-purple-500/15 border-purple-400 text-purple-300 font-black" },
            { label: "USDT", color: "border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10", activeColor: "bg-emerald-500/15 border-emerald-400 text-emerald-300 font-black" },
            { label: "USDC", color: "border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/10", activeColor: "bg-cyan-500/15 border-cyan-400 text-cyan-300 font-bold" },
            { label: "DAI", color: "border-yellow-500/20 text-yellow-500 hover:bg-yellow-500/10", activeColor: "bg-yellow-500/15 border-yellow-500 text-yellow-400 font-bold" },
            { label: "USDe", color: "border-pink-500/20 text-pink-400 hover:bg-pink-500/10", activeColor: "bg-pink-505 border-pink-400 text-pink-300 font-bold" }
          ].map((item) => {
            const isActive = assetFilter === item.label;
            return (
              <button
                key={item.label}
                onClick={() => setAssetFilter(item.label)}
                className={`px-2.5 py-0.5 rounded text-[10px] font-mono border transition-all uppercase cursor-pointer ${
                  isActive ? item.activeColor : item.color
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* SELECT FILTERS PANEL */}
        <div className="p-3 bg-slate-900/60 border-b border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex items-center bg-slate-950 rounded px-2 py-1.5 border border-slate-800/80">
            <span className="text-[10px] font-mono font-bold tracking-tight text-slate-500 mr-2 uppercase">Asset</span>
            <select 
              value={assetFilter} 
              onChange={(e) => setAssetFilter(e.target.value)}
              className="bg-transparent text-slate-200 text-xs font-mono w-full focus:outline-none cursor-pointer"
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

          <div className="flex items-center bg-slate-955 rounded px-2 py-1.5 border border-slate-800/80">
            <span className="text-[10px] font-mono font-bold tracking-tight text-slate-500 mr-2 uppercase">Flow</span>
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

          <div className="flex items-center bg-slate-950 rounded px-2 py-1.5 border border-slate-800/80">
            <span className="text-[10px] font-mono font-bold tracking-tight text-slate-500 mr-2 uppercase">Limit</span>
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

        {/* ALERTS TICKER VIEWPORTS */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5 h-[535px]" style={{ scrollbarWidth: 'thin' }}>
          {filteredAlerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-slate-500 font-mono text-xs">
              <Layers className="h-6 w-6 text-slate-700 mb-2 stroke-1" />
              No real-time blocks passed filter constraints.
              <span className="text-slate-600 mt-1">Listening for transactions...</span>
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
                  {alert.amountUsd >= 5000000 && (
                    <div className="absolute top-0 bottom-0 left-0 w-1 bg-red-500 rounded-l"></div>
                  )}

                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 p-2 rounded-lg shrink-0 ${
                      alert.flowType === "Exchange Inflow" ? "bg-red-500/10 text-red-400" :
                      alert.flowType === "Exchange Outflow" ? "bg-emerald-500/10 text-emerald-400" :
                      "bg-blue-500/10 text-blue-400"
                    }`}>
                      {alert.flowType === "Exchange Inflow" ? <ArrowDownLeft className="h-4 w-4" /> :
                       alert.flowType === "Exchange Outflow" ? <ArrowUpRight className="h-4 w-4" /> :
                       <Database className="h-4 w-4" />}
                    </div>

                    <div className="flex flex-col">
                      <div className="flex items-center flex-wrap gap-1.5">
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

                  <div className="flex items-center justify-between md:justify-end gap-3 border-t md:border-t-0 border-slate-800/80 pt-2 md:pt-0">
                    <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[10px]">
                      <Clock className="h-3.5 w-3.5" />
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
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-[10px] font-mono flex items-center gap-1 transition-colors pointer"
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

      </div>

      {/* Explorer Modal Drawer */}
      {selectedAlert && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-slate-750 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-cyan-400" />
                <h3 className="font-mono text-sm uppercase text-slate-100">
                  BLOCK EXPLORER: Transaction Receipt
                </h3>
              </div>
              <button 
                onClick={() => setSelectedAlert(null)}
                className="text-slate-400 hover:text-slate-100 font-mono text-xs px-2.5 py-1 bg-slate-800 rounded pointer"
              >
                [CLOSE]
              </button>
            </div>

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

              <div className="p-4 bg-slate-955 border border-slate-800 rounded space-y-2">
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
                  className="text-cyan-400 hover:underline font-bold pointer"
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
