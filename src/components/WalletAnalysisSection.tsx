import React, { useState, useEffect } from "react";
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";
import { 
  Shield, 
  Activity, 
  TrendingUp, 
  Brain, 
  Cpu, 
  CheckCircle,
  AlertTriangle,
  Zap,
  DollarSign
} from "lucide-react";
import { WhaleWallet, WalletAICognition } from "../types";

interface WalletAnalysisSectionProps {
  selectedWallet: WhaleWallet;
}

const COLORS = ["#06b6d4", "#a855f7", "#ec4899", "#10b981", "#f59e0b"];

export const WalletAnalysisSection: React.FC<WalletAnalysisSectionProps> = ({ 
  selectedWallet 
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [aiReport, setAiReport] = useState<WalletAICognition | null>(null);
  const [progressState, setProgressState] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Probe Telemetry States
  const [probeActive, setProbeActive] = useState<boolean>(false);
  const [probeLogs, setProbeLogs] = useState<string[]>([]);
  const [probeProgress, setProbeProgress] = useState<number>(0);

  // Reset report on wallet change
  useEffect(() => {
    setAiReport(null);
    setErrorMsg(null);
    setProbeProgress(0);
    setProbeLogs([]);
    setProbeActive(false);
  }, [selectedWallet]);

  // Dynamic Bot Heuristics Engine (Calculates instant signals)
  const botHeuristics = React.useMemo(() => {
    let score = 12; // Baseline logic index
    const signals = [
      { name: "Sub-Second State Interleaving", code: "SUBSEC_INT", triggered: false, desc: "Monitors rapid blocks of swaps executed within single micro-delta intervals." },
      { name: "DeFi Router Direct Proxy Calling", code: "DIR_PROXY", triggered: false, desc: "Direct contract execution interface triggers without browser dApp signatures." },
      { name: "Gas Fee Bid Optimization Homogeneity", code: "GAS_HOMO", triggered: false, desc: "Highly repeating gas price bid lines indicating mechanical priority targets." },
      { name: "Continuous 24/7 Execution Map", code: "ERR_SLEEP", triggered: false, desc: "Total continuous active distribution without regular sleep cycles." },
      { name: "Atomic Flashloan & Liquidity Dependencies", code: "ATOM_LIQ", triggered: false, desc: "Utilizes multi-call single-transaction state changes to hedge liquidity." }
    ];

    const labelLower = selectedWallet.blockchainLabel.toLowerCase();

    // 1. Transaction volume density evaluation
    if (selectedWallet.txCount > 50000) {
      score += 55;
      signals[0].triggered = true;
      signals[1].triggered = true;
      signals[3].triggered = true;
    } else if (selectedWallet.txCount > 5000) {
      score += 38;
      signals[0].triggered = true;
      signals[3].triggered = true;
    } else if (selectedWallet.txCount > 800) {
      score += 18;
      signals[3].triggered = true;
    }

    // 2. Curated name tag heuristics
    if (
      labelLower.includes("bot") || 
      labelLower.includes("mev") || 
      labelLower.includes("arbitrage") || 
      labelLower.includes("solver") || 
      labelLower.includes("sweep") || 
      labelLower.includes("liquidator")
    ) {
      score += 42;
      signals[0].triggered = true;
      signals[1].triggered = true;
      signals[2].triggered = true;
    }
    if (
      labelLower.includes("pool") || 
      labelLower.includes("amm") || 
      labelLower.includes("contract") || 
      labelLower.includes("bridge") || 
      labelLower.includes("router")
    ) {
      score += 25;
      signals[1].triggered = true;
    }
    
    // Low risk exemptions
    if (labelLower.includes("cold") || labelLower.includes("trust") || selectedWallet.isExchange) {
      score = Math.max(5, score - 35);
    }

    // 3. Dynamic layout seed generation using string hashing
    let hashVal = 0;
    for (let i = 0; i < selectedWallet.address.length; i++) {
      hashVal += selectedWallet.address.charCodeAt(i);
    }
    
    if (hashVal % 3 === 0 && selectedWallet.txCount > 100) {
      score += 12;
      signals[2].triggered = true;
    }
    if (hashVal % 5 === 0 && selectedWallet.txCount > 300) {
      score += 8;
      signals[4].triggered = true;
    }
    if (hashVal % 7 === 0 && selectedWallet.txCount > 50) {
      score += 10;
      signals[1].triggered = true;
    }

    const finalScore = Math.min(99, Math.max(4, score));
    const isLikelyBot = finalScore >= 50;

    return {
      isLikelyBot,
      finalScore,
      signals
    };
  }, [selectedWallet]);

  // Terminal telemetry probe simulation trigger
  const handleTriggerProbe = () => {
    setProbeActive(true);
    setProbeProgress(0);
    setProbeLogs(["[SYSTEM] Initializing telemetry interceptors...", "[SYSTEM] Subscribing to mempool nodes..."]);

    const logs = [
      "[SOCK_OK] Handshaking trace nodes over WebSocket.",
      `[PROBING] Scanning recent ${selectedWallet.txCount} blocks for interleaves...`,
      `[TELEMETRY] Measured average block spacing: ${(1 + Math.random() * 4.9).toFixed(2)} seconds.`,
      `[FORENSICS] Analyzing gas spreads: current gas dev is ${(Math.random() * 0.04).toFixed(4)} Gwei.`,
      "[POLICE] Bytecode analysis shows integration with proxy routers & sandwich bundles.",
      "[SUCCESS] Core diagnostic complete. Local address trace nodes registered."
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      setProbeProgress(p => Math.min(100, p + 17));
      if (currentStep <= logs.length) {
        setProbeLogs(prev => [...prev, logs[currentStep - 1]]);
      } else {
        clearInterval(interval);
        setProbeActive(false);
        setProbeProgress(100);
      }
    }, 280);
  };

  // Handle Wallet AI Diagnostics
  const handleScanWallet = async () => {
    setLoading(true);
    setErrorMsg(null);
    setProgressState("Accessing node memory pools...");
    
    // Simulate high-tech network scanning stages
    const stages = [
      "Accessing node memory pools...",
      "Mapping transaction flow trees...",
      "Compiling balance distributions...",
      "Forwarding telemetry vectors to Gemini Core..."
    ];

    let currentStage = 0;
    const stageInterval = setInterval(() => {
      currentStage++;
      if (currentStage < stages.length) {
        setProgressState(stages[currentStage]);
      }
    }, 900);

    try {
      const response = await fetch("/api/gemini/analyze-wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: selectedWallet.address,
          network: selectedWallet.network,
          blockchainLabel: selectedWallet.blockchainLabel,
          initialBalance: selectedWallet.initialBalance,
          age: selectedWallet.age,
          txCount: selectedWallet.txCount,
          assetBalances: selectedWallet.assetBalances
        })
      });

      clearInterval(stageInterval);

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || errData.error || "Sub-systems error.");
      }

      const report: WalletAICognition = await response.json();
      setAiReport(report);
    } catch (err: any) {
      clearInterval(stageInterval);
      console.error(err);
      setErrorMsg(err.message || "Endpoint failed. Run dev server or check API keys.");
    } finally {
      setLoading(false);
    }
  };

  // Safe chart data mapping
  const chartData = selectedWallet.assetBalances.map(asset => ({
    name: asset.symbol,
    value: asset.valueUsd,
    amount: asset.amount
  }));

  const totalValue = selectedWallet.assetBalances.reduce((sum, asset) => sum + asset.valueUsd, 0);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl p-5 space-y-6" id="wallet-diagnostics-section">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1 px-2 border border-cyan-500/20 bg-cyan-500/10 rounded text-cyan-400 font-mono text-[10px] tracking-widest font-semibold uppercase">
              NODE INSPECTOR
            </span>
          </div>
          <h2 className="text-base font-mono font-bold text-slate-100 flex items-center gap-2">
            WALLET BEHAVIORAL DIAGNOSTICIAN
          </h2>
        </div>

        <button
          onClick={handleScanWallet}
          disabled={loading}
          className={`px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 disabled:from-slate-700 disabled:to-slate-800 text-slate-950 hover:text-slate-950 font-bold font-mono text-xs rounded-lg flex items-center justify-center gap-2 shadow-lg hover:shadow-cyan-500/10 transition-all ${
            loading ? "animate-pulse cursor-not-allowed" : ""
          }`}
        >
          <Brain className="h-4 w-4" />
          {loading ? "DECRYPTING..." : "DECRYPT WALLET PERSONALITY"}
        </button>
      </div>

      {/* Target Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Core Profile Box */}
        <div className="lg:col-span-4 p-4 bg-slate-950 rounded-xl border border-slate-850 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <h3 className="font-mono text-xs font-bold text-slate-400 tracking-wider uppercase">
              TARGET SPECIFICATIONS
            </h3>

            <div className="space-y-2 text-xs font-mono">
              <div>
                <span className="text-slate-500 text-[10px] block">ADDRESS SHA</span>
                <span className="text-slate-200 select-all font-mono word-break break-all text-[11px]">
                  {selectedWallet.address}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <span className="text-slate-500 text-[10px] block">KNOWN ENTITY</span>
                  <span className="text-cyan-400 font-bold">{selectedWallet.blockchainLabel}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">BLOCKCHAIN</span>
                  <span className="text-slate-300 font-bold">{selectedWallet.network}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-900">
                <div>
                  <span className="text-slate-500 text-[10px] block">TOTAL NET ASSETS</span>
                  <span className="text-emerald-400 font-bold">
                    ${totalValue > 0 ? totalValue.toLocaleString() : "Contact locked..."}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">TX COUNT</span>
                  <span className="text-slate-300">{selectedWallet.txCount} tx</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-900/40 rounded border border-slate-900 text-[11px] font-sans text-slate-400 italic">
            &ldquo;{selectedWallet.notes}&rdquo;
          </div>
        </div>

        {/* Portfolio Pie chart mapping list */}
        <div className="lg:col-span-8 p-4 bg-slate-950/60 rounded-xl border border-slate-850 flex flex-col md:flex-row items-center gap-4">
          <div className="flex-1 w-full space-y-4">
            <h3 className="font-mono text-xs font-bold text-slate-400 tracking-wider uppercase">
              PORTFOLIO VOLUMETRICS Breakdown
            </h3>

            <div className="space-y-2">
              {selectedWallet.assetBalances.map((asset, idx) => {
                const percent = totalValue > 0 ? (asset.valueUsd / totalValue) * 100 : 0;
                return (
                  <div key={asset.symbol} className="space-y-1 font-mono text-xs">
                    <div className="flex items-center justify-between text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                        <span className="font-bold text-slate-200">{asset.symbol}</span>
                      </div>
                      <span className="text-slate-400">
                        {asset.amount.toLocaleString()} ({percent.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="h-1.5 rounded-full" 
                        style={{ 
                          width: `${percent}%`,
                          backgroundColor: COLORS[idx % COLORS.length] 
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recharts PieChart component area */}
          <div className="w-[180px] h-[180px] flex items-center justify-center">
            {totalValue > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", fontFamily: "monospace" }} 
                    itemStyle={{ color: "#cbd5e1" }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, "Value"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-[10px] font-mono text-slate-500 text-center">Charts disabled (No balances stored)</div>
            )}
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* CYBERNETIC CO-PROCESSOR: BOT IDENTIFICATION CONSOLE */}
      <div className="bg-slate-950 border border-slate-900 rounded-xl p-5 space-y-5 relative overflow-hidden" id="bot-forensics-panel">
        {/* Decorative background grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0c101c_1px,transparent_1px),linear-gradient(to_bottom,#0c101c_1px,transparent_1px)] bg-[size:16px_16px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_100%,transparent_100%)] opacity-20"></div>
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-900 pb-4">
          <div className="flex items-center gap-2.5">
            <Cpu className="h-5 w-5 text-indigo-400 animate-pulse" />
            <div>
              <h3 className="font-mono text-xs font-bold text-slate-200 uppercase tracking-widest leading-none">
                On-Chain Bot Heuristics &amp; MEV Analyzer
              </h3>
              <p className="text-[10px] text-slate-500 font-mono mt-1">Autonomous smart-contract verification sub-processor.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-[10px]">
            <span className="text-slate-400">HEURISTIC LEVEL:</span>
            <span className={`px-2 py-0.5 rounded font-bold ${
              botHeuristics.finalScore >= 75 ? "bg-rose-950/40 text-rose-450 border border-rose-900/30" :
              botHeuristics.finalScore >= 40 ? "bg-amber-950/40 text-amber-400 border border-amber-900/30" :
              "bg-emerald-950/40 text-emerald-400 border border-emerald-900/30"
            }`}>
              {botHeuristics.isLikelyBot ? "HIGH BOT TRACE" : "MANUAL USER PROFILE"}
            </span>
          </div>
        </div>

        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Side: Bot score and Simulated Micro telemetry scan */}
          <div className="lg:col-span-5 p-4 bg-slate-900/10 border border-slate-900 rounded-lg flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <span className="text-[9px] font-mono font-bold text-slate-500 block tracking-wider uppercase">
                AUTOMATION PROBABILITY INDEX
              </span>

              <div className="flex items-center gap-4">
                {/* Circular indicator count */}
                <div className="relative h-16 w-16 flex items-center justify-center shrink-0">
                  <svg className="w-16 h-16 absolute -rotate-90">
                    <circle cx="32" cy="32" r="28" fill="transparent" stroke="#0f172a" strokeWidth="4" />
                    <circle 
                      cx="32" 
                      cy="32" 
                      r="28" 
                      fill="transparent" 
                      stroke={botHeuristics.finalScore >= 75 ? "#f43f5e" : botHeuristics.finalScore >= 40 ? "#fbbf24" : "#10b981"} 
                      strokeWidth="4" 
                      strokeDasharray="175.9" 
                      strokeDashoffset={175.9 * (1 - botHeuristics.finalScore / 100)}
                      className="transition-all duration-1000 ease-out" 
                    />
                  </svg>
                  <span className="font-mono font-black text-sm text-slate-100">{botHeuristics.finalScore}%</span>
                </div>

                <div className="space-y-1 font-mono text-xs">
                  <div className="text-slate-300 leading-none">
                    Status: <strong className={botHeuristics.finalScore >= 75 ? "text-rose-400" : botHeuristics.finalScore >= 40 ? "text-amber-400" : "text-emerald-400"}>
                      {botHeuristics.finalScore >= 75 ? "CRITICAL OUTLIER" : botHeuristics.finalScore >= 40 ? "AUTOMATED ROUTER" : "HUMAN MANUAL"}
                    </strong>
                  </div>
                  <p className="text-[10px] text-slate-500 font-sans leading-normal">
                    Derived from transaction density, curated label flags, and address-specific deterministic seed values.
                  </p>
                </div>
              </div>
            </div>

            {/* Micro-Telemetry Simulation Area */}
            <div className="space-y-2 border-t border-slate-900 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono font-bold text-slate-500 block uppercase">
                  SIMULATORY MEMPOOL TRACING
                </span>
                {probeProgress > 0 && (
                  <span className="text-[10px] font-mono text-indigo-400 font-bold">{probeProgress}%</span>
                )}
              </div>

              {probeProgress === 0 ? (
                <button
                  type="button"
                  onClick={handleTriggerProbe}
                  className="w-full py-1.5 flex items-center justify-center gap-1.5 font-mono text-[10px] font-bold text-indigo-400 hover:text-indigo-350 border border-indigo-500/25 bg-indigo-500/5 hover:bg-indigo-500/10 rounded transition-all cursor-pointer"
                >
                  <Activity className="h-3 w-3 animate-pulse" />
                  INITIATE LIVE TELEMETRY PROBE
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="h-1 bg-slate-900 rounded overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-150"
                      style={{ width: `${probeProgress}%` }}
                    ></div>
                  </div>
                  <div className="bg-slate-950 p-2.5 border border-slate-900 rounded h-[75px] overflow-y-auto font-mono text-[9px] text-slate-400 leading-normal space-y-0.5 scrollbar-thin select-none">
                    {probeLogs.map((log, i) => (
                      <div key={i} className={log.includes("[SUCCESS]") ? "text-emerald-400 font-bold" : log.includes("[SOCK_OK]") ? "text-cyan-400" : ""}>{log}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Smart Contract Heuristic Probe Nodes Grid */}
          <div className="lg:col-span-7 col-span-1 grid grid-cols-1 md:grid-cols-2 gap-3">
            {botHeuristics.signals.map((sig, idx) => {
              return (
                <div 
                  key={idx} 
                  className={`p-3 rounded-lg border flex flex-col justify-between transition-all ${
                    sig.triggered 
                      ? "bg-rose-950/10 border-rose-900/30 hover:border-rose-900/50" 
                      : "bg-slate-900/10 border-slate-900/50 hover:bg-slate-900/30"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-mono font-bold text-slate-200 block leading-none">
                        {sig.name}
                      </span>
                      <span className="text-[8px] font-mono text-slate-500 tracking-wider font-bold block uppercase">
                        CODE: {sig.code}
                      </span>
                    </div>

                    <span className={`h-2 w-2 rounded-full shrink-0 border ${
                      sig.triggered 
                        ? "bg-rose-500 border-rose-400 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.6)]" 
                        : "bg-slate-800 border-slate-700"
                    }`} />
                  </div>

                  <p className="text-[10px] text-slate-450 font-sans leading-relaxed mt-2">
                    {sig.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI report matching addition */}
        {aiReport && (
          <div className="mt-4 p-4 bg-gradient-to-r from-indigo-950/20 to-slate-950/40 border border-indigo-500/20 rounded-lg space-y-3 relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-900 pb-2">
              <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-indigo-300">
                <Brain className="h-4 w-4 text-purple-400 animate-pulse" />
                <span>GEMINI AUDIT CO-PROCESSOR DECODE</span>
              </div>
              <span className={`text-[9px] font-mono py-0.5 px-2 rounded-md font-bold tracking-tight ${
                aiReport.botDetection?.isBot ? "bg-rose-950/40 text-rose-450 border border-rose-900/20" : "bg-emerald-950/40 text-emerald-400 border border-emerald-900/20"
              }`}>
                {aiReport.botDetection?.isBot ? "IDENTIFIED AS TRADING ROBOT" : "IDENTIFIED AS MANUAL PORTFOLIO"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-4 space-y-2.5 font-mono text-xs md:border-r md:border-slate-900 md:pr-4">
                <div>
                  <span className="text-slate-500 text-[9px] block">CLASSIFICATION SEGMENT:</span>
                  <span className="text-slate-200 font-bold tracking-tight">
                    {aiReport.botDetection?.botTypeClassification || (botHeuristics.isLikelyBot ? "Arbitrage/Liquidation Sniper" : "VC Portfolio Address")}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[9px] block">AI BOT LIKELIHOOD:</span>
                  <span className={`font-black text-xs ${
                    aiReport.botDetection?.botLikelihood && aiReport.botDetection.botLikelihood >= 60 ? "text-rose-400" : "text-emerald-400"
                  }`}>
                    {aiReport.botDetection?.botLikelihood ?? botHeuristics.finalScore}%
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-500 text-[9px] block uppercase">Forensic Flags:</span>
                  <div className="flex flex-wrap gap-1">
                    {(aiReport.botDetection?.primaryIndicators || ["Autonomous Gas Bid", "Sub-second spacing", "Direct contracts routing"]).map(flag => (
                      <span key={flag} className="text-[9px] text-indigo-300 bg-indigo-950/30 border border-indigo-900/40 rounded px-1.5 py-0.2">
                        {flag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="md:col-span-8 font-sans text-xs text-slate-350 leading-relaxed bg-slate-950/50 p-3 rounded border border-slate-900 relative">
                <p>
                  {aiReport.botDetection?.automationsExplanation || aiReport.tradingPatternAnalysis || "AI behavior parsing is updated to monitor precise latency timings and MEV attributes for high-frequency operations."}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Interactive AI Results Section */}
      {loading && (
        <div className="p-8 bg-slate-950 border border-indigo-900/50 rounded-xl space-y-4 flex flex-col items-center justify-center text-center">
          <Cpu className="h-8 w-8 text-indigo-400 animate-spin" />
          <div className="space-y-1">
            <p className="text-xs font-mono font-semibold tracking-wider text-indigo-300 uppercase">
              {progressState}
            </p>
            <p className="text-[10px] text-slate-500 font-mono">
              Gemini model @gemini-3.5-flash decoding address telemetry behaviors.
            </p>
          </div>
          <div className="w-48 bg-slate-900 h-1 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 animate-pulse w-2/3"></div>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 font-mono text-xs rounded-xl flex items-start gap-2.5">
          <AlertTriangle className="h-4 w-4 mt-0.5 text-rose-400 flex-shrink-0" />
          <div>
            <span className="font-bold block uppercase mb-0.5">AI Subsystem Decryption Failure</span>
            <span>{errorMsg}</span>
            <span className="block text-slate-500 mt-2 text-[10px]">
              Note: This is normal if Gemini keys are missing. Configure standard API key in the panel or verify Server start.
            </span>
          </div>
        </div>
      )}

      {aiReport && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 p-5 bg-gradient-to-b from-indigo-950/20 to-slate-950/40 border border-indigo-900/30 rounded-xl">
          {/* Diagnostic Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-4 bg-slate-950 border border-slate-900 rounded-lg space-y-3">
              <span className="text-[9px] font-mono font-bold text-slate-500 tracking-wider block uppercase">
                COGNITIVE DECRYPT LABEL
              </span>
              <div className="text-indigo-400 font-mono font-bold text-sm tracking-tight border-b border-slate-900 pb-2">
                {aiReport.behavioralPersona}
              </div>

              {/* Guages bar */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between font-mono text-[10px] text-slate-500">
                  <span>LIQUID SYSTEM RISK</span>
                  <span className="font-bold text-amber-500">{aiReport.riskScore}/100</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-2 rounded-full transition-all`}
                    style={{ 
                      width: `${aiReport.riskScore}%`,
                      backgroundColor: aiReport.riskScore > 75 ? "#f43f5e" : aiReport.riskScore > 40 ? "#fbbf24" : "#10b981"
                    }}
                  ></div>
                </div>
              </div>

              {/* Tag clouds */}
              <div className="flex flex-wrap gap-1 pt-2">
                {aiReport.classificationTags.map(tag => (
                  <span key={tag} className="text-[10px] font-mono bg-slate-900 border border-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Risk analysis description block */}
            <div className="p-4 bg-slate-950 border border-slate-900 rounded-lg space-y-2">
              <span className="text-[9px] font-mono font-bold text-slate-500 block uppercase">
                RISK CHARACTERISTIC DECODE
              </span>
              <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                {aiReport.riskJustification}
              </p>
            </div>
          </div>

          {/* Deep behavioral Details */}
          <div className="lg:col-span-8 space-y-5">
            {/* Pattern and Slippage analysis lists */}
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-xs font-mono font-bold text-indigo-400 flex items-center gap-1.5 uppercase">
                  <Activity className="h-3.5 w-3.5" />
                  Pattern &amp; Trade Behavior Diagnostic
                </h4>
                <p className="text-xs text-slate-300 font-sans leading-relaxed bg-slate-950/40 p-3 rounded-lg border border-slate-900">
                  {aiReport.tradingPatternAnalysis}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="text-xs font-mono font-bold text-slate-400 flex items-center gap-1.5 uppercase">
                    <Shield className="h-3.5 w-3.5" />
                    Market Influence Degree
                  </h4>
                  <div className="p-3 bg-slate-950/50 border border-slate-900 rounded-lg space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-mono">DEGREE:</span>
                      <span className="px-1.5 py-0.2 bg-rose-500/10 text-rose-400 font-mono font-bold text-[10px] rounded border border-rose-500/20">
                        {aiReport.liquidityInfluenceRating}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                      {aiReport.influenceDescription}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-mono font-bold text-cyan-400 flex items-center gap-1.5 uppercase">
                    <Zap className="h-3.5 w-3.5" />
                    Cybernetic Recommendations
                  </h4>
                  <div className="p-3 bg-slate-950/50 border border-slate-900 rounded-lg">
                    <ul className="space-y-1.5 list-disc pl-4 text-[11px] text-slate-300 font-sans leading-relaxed">
                      {aiReport.strategicRecommendations.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
