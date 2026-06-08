import React, { useState, useEffect } from "react";
import { 
  CheckCircle,
  HelpCircle,
  Activity,
  Cpu,
  TrendingDown,
  AlertTriangle,
  Zap,
  Info,
  Sliders,
  DollarSign,
  Trash2,
  History,
  Sparkles,
  Check,
  ArrowUpRight,
  ArrowRight,
  Download
} from "lucide-react";
import { MarketSimulationResponse } from "../types";
import { SlippageScatterPlot } from "./SlippageScatterPlot";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

interface SavedScenario {
  id: string;
  timestamp: string;
  asset: string;
  amount: number;
  strategy: string;
  marketCondition: string;
  activePrice: number;
  totalValueUsd: number;
  engine: "Gemini AI" | "Local Quant";
  result: MarketSimulationResponse;
  notes?: string;
}

interface NotesEditorProps {
  initialNotes: string;
  onSave: (notes: string) => void;
}

const NotesEditor: React.FC<NotesEditorProps> = ({ initialNotes, onSave }) => {
  const [val, setVal] = useState(initialNotes || "");

  useEffect(() => {
    setVal(initialNotes || "");
  }, [initialNotes]);

  return (
    <textarea
      value={val}
      onChange={(e) => setVal(e.target.value)}
      onBlur={() => onSave(val)}
      onClick={(e) => e.stopPropagation()}
      placeholder="Add scenario custom notes, stress factors, or deployment constraints..."
      rows={1}
      className="w-full text-[10px] bg-slate-950/70 hover:bg-slate-950/90 focus:bg-slate-950 text-slate-300 border border-slate-900 focus:border-rose-500/50 rounded py-1 px-2 font-mono placeholder:text-slate-600 focus:outline-none resize-none transition-all focus:ring-1 focus:ring-rose-500/20"
    />
  );
};

interface MarketSimulatorSectionProps {
  currentPrices: { [key: string]: number };
  defaultAsset?: string;
  defaultAmount?: number;
}

export const MarketSimulatorSection: React.FC<MarketSimulatorSectionProps> = ({
  currentPrices,
  defaultAsset = "ETH",
  defaultAmount = 25000
}) => {
  const [asset, setAsset] = useState<string>(defaultAsset);
  const [amount, setAmount] = useState<number>(defaultAmount);
  const [strategy, setStrategy] = useState<string>("Immediate Market Dump [DEX/CEX]");
  const [marketCondition, setMarketCondition] = useState<string>("Bullish Depth [High order book buffers]");
  const [loading, setLoading] = useState<boolean>(false);
  const [simulationResult, setSimulationResult] = useState<MarketSimulationResponse | null>(null);
  const [progressMsg, setProgressMsg] = useState<string>("Initial state...");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Engine selection: Default to 'local' for out-of-the-box reliability, with 'gemini' as an option.
  const [simulationEngine, setSimulationEngine] = useState<"gemini" | "local">("local");
  
  // Local storage scenario list
  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>([]);
  const [selectedScenarioIds, setSelectedScenarioIds] = useState<string[]>([]);
  const [showSaveAlert, setShowSaveAlert] = useState<boolean>(false);

  // Sync state if props change (e.g. user clicked slippage dump shortcut inside wallet lists)
  useEffect(() => {
    if (defaultAsset) setAsset(defaultAsset);
    if (defaultAmount) setAmount(defaultAmount);
  }, [defaultAsset, defaultAmount]);

  // Load scenarios from LocalStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("whaletrack_scenarios");
      if (stored) {
        setSavedScenarios(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load scenarios from localStorage", e);
    }
  }, []);

  const saveScenarioList = (list: SavedScenario[]) => {
    setSavedScenarios(list);
    try {
      localStorage.setItem("whaletrack_scenarios", JSON.stringify(list));
    } catch (e) {
      console.error("Failed to save scenarios to localStorage", e);
    }
  };

  const isStableAsset = (sym: string) => ["USDT", "USDC", "PYUSD", "USD1", "USDS", "DAI", "USDe"].includes(sym);
  const getAssetDefaultPrice = (sym: string) => {
    if (isStableAsset(sym)) return 1.0;
    if (sym === "PAXG") return 2350.0;
    if (sym === "BTC") return 65000.0;
    if (sym === "ETH") return 3400.0;
    if (sym === "SOL") return 150.0;
    return 150.0;
  };

  const activePrice = currentPrices[asset] || getAssetDefaultPrice(asset);
  const totalValueUsd = amount * activePrice;

  // Local stress calculation mechanics for instant responses
  const generateLocalSimulation = (
    targetAsset: string,
    targetAmount: number,
    targetStrategy: string,
    targetMarketCondition: string
  ): MarketSimulationResponse => {
    const price = currentPrices[targetAsset] || getAssetDefaultPrice(targetAsset);
    const valueUsd = targetAmount * price;

    // Base slippage factors (representing asset depth)
    let baseSlippage = 0.0006; 
    if (targetAsset === "BTC") {
      baseSlippage = 0.0001; 
    } else if (targetAsset === "ETH") {
      baseSlippage = 0.0003; 
    } else if (targetAsset === "SOL") {
      baseSlippage = 0.0016;  
    } else if (["USDT", "USDC", "USDS", "DAI"].includes(targetAsset)) {
      baseSlippage = 0.00003; 
    } else if (["PYUSD", "USD1", "USDe"].includes(targetAsset)) {
      baseSlippage = 0.00008; 
    } else if (targetAsset === "PAXG") {
      baseSlippage = 0.00015; 
    }

    // Condition depth scalar
    let conditionMult = 1.0;
    if (targetMarketCondition.includes("Bullish")) {
      conditionMult = 0.45;
    } else if (targetMarketCondition.includes("Panic")) {
      conditionMult = 2.7;
    } else if (targetMarketCondition.includes("Calm")) {
      conditionMult = 1.0;
    } else if (targetMarketCondition.includes("Holiday") || targetMarketCondition.includes("Low")) {
      conditionMult = 1.9;
    }

    // Strategy impact multiplier
    let strategyMult = 1.0;
    if (targetStrategy.includes("Dump")) {
      strategyMult = 2.4;
    } else if (targetStrategy.includes("TWAP")) {
      strategyMult = 0.5;
    } else if (targetStrategy.includes("OTC")) {
      strategyMult = 0.04;
    } else if (targetStrategy.includes("Sniper") || targetStrategy.includes("Iceberg")) {
      strategyMult = 0.65;
    }

    // Calculation scaled out for high-fidelity values
    const scaleFactor = 15_000_000;
    let calcPercent = (valueUsd / scaleFactor) * baseSlippage * 100 * conditionMult * strategyMult;

    // Apply minor pseudorandom deterministic fluctuation based on inputs
    const hashSeed = Array.from(targetAsset + targetStrategy + targetMarketCondition).reduce(
      (acc, char) => acc + char.charCodeAt(0),
      0
    );
    const randomizedVariance = 0.85 + ((hashSeed % 35) / 100); // 0.85 to 1.2
    calcPercent = calcPercent * randomizedVariance;

    // Safe boundaries bounds
    if (targetAsset === "USDT" || targetAsset === "USDC") {
      if (valueUsd < 15_000_000) {
        calcPercent = Math.max(0.01, Math.min(0.08, calcPercent));
      } else {
        calcPercent = Math.max(0.12, calcPercent);
      }
    } else {
      calcPercent = Math.max(0.01, calcPercent);
    }

    // Limit maximum realistic spot slippage to 65% for non-pegs
    if (targetAsset !== "USDT" && targetAsset !== "USDC") {
      calcPercent = Math.min(65.0, calcPercent);
    } else {
      calcPercent = Math.min(18.0, calcPercent); // stable peg extreme depeg limit
    }

    // Map shock indices
    let shockIndex: "Negligible" | "Moderate" | "Severe" | "Extreme" = "Negligible";
    if (calcPercent > 7.5) {
      shockIndex = "Extreme";
    } else if (calcPercent > 2.8) {
      shockIndex = "Severe";
    } else if (calcPercent > 0.55) {
      shockIndex = "Moderate";
    }

    // Map rebalancing recovery indexes
    let recoveryTime = "30 seconds";
    if (shockIndex === "Extreme") {
      recoveryTime = targetMarketCondition.includes("Panic") ? "24 to 48 hours" : "12 hours";
    } else if (shockIndex === "Severe") {
      recoveryTime = "3 to 5 hours";
    } else if (shockIndex === "Moderate") {
      recoveryTime = "35 to 60 minutes";
    } else {
      recoveryTime = "12 seconds";
    }

    // Compile dynamic sector mappings
    const contagionSectorsMap: Record<string, string[]> = {
      BTC: ["Wrapped Assets (wBTC)", "Layer-1 Spot Base Pools", "Inter-Chain Reserve Pegs"],
      ETH: ["LSD Validator Sinks (stETH)", "L2 Gas Auto-Bridges", "Leveraged Margin Indexes"],
      SOL: ["Concentrated AMM Spreads", "Dynamic Borrow Markets", "LST Wrapping Vaults"],
      USDT: ["Arbitrage Swaps Pools", "Multi-Peg Stability Modules", "Cross-Chain Escrow Assets"],
      USDC: ["Tokenized Treasury Reservoirs", "Base Dex Stability Vaults", "Core Peg lending Pools"]
    };
    const secondaryContagionSectors = contagionSectorsMap[targetAsset] || ["Isolated Collateral Sinks", "AMM Spreads"];

    const advice = `We advise structuring the simulated $${valueUsd.toLocaleString(undefined, {
      maximumFractionDigits: 0
    })} USD order blocks into ${
      targetStrategy.includes("OTC")
        ? "coordinated custodian allocations to minimize general retail spot alarm"
        : "staggered Algorithmic Sniper Icebergs over 12 customized liquidity pools"
    }. Routine on-chain slippage registers a ${shockIndex.toLowerCase()} influence rating.`;

    const cascadeRisk =
      shockIndex === "Extreme" || shockIndex === "Severe"
        ? `Elevated Risk Cascade: Cumulative selloff will likely trigger cascading liquidations in isolated margin vaults. Estimated collateral thresholds of $${(
            valueUsd * 0.32
          ).toLocaleString(undefined, {
            maximumFractionDigits: 0
          })} USD are within immediate threshold ranges, exposing smart contracts to rapid liquidator sweepstakes.`
        : `Normal Risk Factor: Under standard orders of magnitude, spot order book queues should absorb outflows without triggering margin calls or collateral liquidations.`;

    const hedgingCounterstrategies = [
      `Structure standard premium hedge buffers via down-market puts on exchanges`,
      `Neutralize execute-pressure with equivalent token shorting on perpetual registries`,
      `Redeploy capital to high-depth liquidity buckets during peak exchange volume`
    ];

    return {
      estimatedPriceSlippage: `${calcPercent.toFixed(2)}%`,
      orderBookShockIndex: shockIndex,
      cascadeLiquidationRisk: cascadeRisk,
      secondaryContagionSectors,
      estimatedRecoveryTime: recoveryTime,
      optimalExecutionAdvice: advice,
      hedgingCounterstrategies
    };
  };

  const handleSimulate = async () => {
    setLoading(true);
    setErrorMsg(null);
    setProgressMsg("Polling depth of order books...");

    const steps = [
      "Polling depth of order books...",
      "Querying liquidity density variables...",
      "Calculating secondary liquidation threshold points...",
      "Synthesizing threat vectors across protocol blocks..."
    ];

    let currentStep = 0;
    const stepInterval = setInterval(() => {
      currentStep++;
      if (currentStep < steps.length) {
        setProgressMsg(steps[currentStep]);
      }
    }, 700);

    try {
      if (simulationEngine === "local") {
        // Fast offline implementation
        await new Promise((resolve) => setTimeout(resolve, 1400));
        clearInterval(stepInterval);

        const result = generateLocalSimulation(asset, amount, strategy, marketCondition);
        setSimulationResult(result);
        
        // Auto save to history
        const autoName: SavedScenario = {
          id: Math.random().toString(36).substring(2, 9),
          timestamp: new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
          asset,
          amount,
          strategy,
          marketCondition: marketCondition.split(" [")[0], // cleaner label
          activePrice,
          totalValueUsd,
          engine: "Local Quant",
          notes: "",
          result
        };
        saveScenarioList([autoName, ...savedScenarios].slice(0, 15));
        
        setShowSaveAlert(true);
        setTimeout(() => setShowSaveAlert(false), 3000);
      } else {
        // Live Gemini API simulation
        const response = await fetch("/api/gemini/simulate-market-impact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            asset,
            amount,
            strategy,
            marketCondition
          })
        });

        clearInterval(stepInterval);

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || errData.error || "Simulations sub-system failure.");
        }

        const result: MarketSimulationResponse = await response.json();
        setSimulationResult(result);

        // Auto save to history
        const autoName: SavedScenario = {
          id: Math.random().toString(36).substring(2, 9),
          timestamp: new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
          asset,
          amount,
          strategy,
          marketCondition: marketCondition.split(" [")[0],
          activePrice,
          totalValueUsd,
          engine: "Gemini AI",
          notes: "",
          result
        };
        saveScenarioList([autoName, ...savedScenarios].slice(0, 15));
        
        setShowSaveAlert(true);
        setTimeout(() => setShowSaveAlert(false), 3000);
      }
    } catch (err: any) {
      clearInterval(stepInterval);
      console.error(err);
      setErrorMsg(err.message || "Failed to trigger liquidity simulator. Check your connection or swap to Local Engine.");
      
      // Elegant failover trigger UI
      setSimulationEngine("local");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadScenario = (scenario: SavedScenario) => {
    setAsset(scenario.asset);
    setAmount(scenario.amount);
    setStrategy(scenario.strategy);
    // find nearest list matches
    setSimulationResult(scenario.result);
  };

  const handleDeleteScenario = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedScenarios.filter(item => item.id !== id);
    saveScenarioList(updated);
    setSelectedScenarioIds(prev => prev.filter(item => item !== id));
  };

  const handleToggleCompare = (id: string) => {
    setSelectedScenarioIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      }
      if (prev.length >= 2) {
        // limit comparison to 2 key scenarios for intuitive view
        return [prev[1], id];
      }
      return [...prev, id];
    });
  };

  const handleClearHistory = () => {
    saveScenarioList([]);
    setSelectedScenarioIds([]);
  };

  const handleUpdateNotes = (id: string, notes: string) => {
    const updated = savedScenarios.map(item => {
      if (item.id === id) {
        return { ...item, notes };
      }
      return item;
    });
    saveScenarioList(updated);
  };

  const handleExportSelected = () => {
    if (comparisonItems.length === 0) return;
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(comparisonItems, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
      downloadAnchor.setAttribute("download", `whaletrack_selected_scenarios_${timestamp}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (e) {
      console.error("Failed to export selected scenarios", e);
    }
  };

  // Find the selected scenarios to display side-by-side comparison
  const comparisonItems = savedScenarios.filter(item => selectedScenarioIds.includes(item.id));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl p-5 space-y-6" id="liquidity-simulator-section">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="p-1 px-2 border border-rose-500/20 bg-rose-500/10 rounded text-rose-400 font-mono text-[10px] tracking-widest font-semibold uppercase">
              RISK STRESS-TEST
            </span>
            {showSaveAlert && (
              <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono animate-fade-in flex items-center gap-1">
                <Check className="h-3 w-3" /> SCENARIO AUTO-SAVED TO COMPARISON LOGS
              </span>
            )}
          </div>
          <h2 className="text-base font-mono font-bold text-slate-100 flex items-center gap-2">
            AI ORDER BOOK &amp; SLIPPAGE SIMULATOR
          </h2>
        </div>

        <div className="flex items-center gap-3 self-start lg:self-auto flex-wrap">
          {/* Simulation Engine Toggle Selector */}
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-[10px] font-mono">
            <button
              type="button"
              onClick={() => setSimulationEngine("local")}
              className={`px-3 py-1.5 rounded font-bold transition-all cursor-pointer ${
                simulationEngine === "local" 
                  ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" 
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              Local Engine
            </button>
            <button
              type="button"
              onClick={() => setSimulationEngine("gemini")}
              className={`px-3 py-1.5 rounded font-bold transition-all cursor-pointer ${
                simulationEngine === "gemini" 
                  ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" 
                  : "text-slate-500 hover:text-slate-300"
              }`}
              title="Requires GEMINI_API_KEY"
            >
              Gemini Live AI
            </button>
          </div>

          <button
            onClick={handleSimulate}
            disabled={loading || amount <= 0}
            className={`px-4 py-2 bg-rose-600 hover:bg-rose-500 text-slate-950 font-bold font-mono text-xs rounded-lg flex items-center justify-center gap-2 shadow-lg hover:shadow-rose-500/10 transition-all cursor-pointer ${
              loading ? "animate-pulse cursor-not-allowed" : ""
            }`}
          >
            <Activity className="h-4 w-4" />
            {loading ? "CALCULATING SHOCK..." : "EXECUTE SLIPPAGE SIMULATION"}
          </button>
        </div>
      </div>

      {/* Input Configuration Sliders/Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 p-4 bg-slate-950 rounded-xl border border-slate-850">
        {/* Asset Selection */}
        <div className="space-y-1.5 font-mono text-xs">
          <label className="text-slate-500 text-[10px] font-bold block uppercase">TARGET ASSET</label>
          <select
            value={asset}
            onChange={(e) => setAsset(e.target.value)}
            className="w-full bg-slate-900 text-slate-200 border border-slate-800 rounded p-2 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 cursor-pointer"
          >
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

        {/* Quantities input box */}
        <div className="space-y-1.5 font-mono text-xs">
          <label className="text-slate-500 text-[10px] font-bold block uppercase flex justify-between">
            <span>DUMP QTY</span>
            <span className="text-slate-400 font-normal">Price: ${activePrice.toLocaleString()}</span>
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
            className="w-full bg-slate-900 text-slate-200 border border-slate-800 rounded p-1.5 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 text-xs font-mono"
            placeholder="Quantity to sell..."
          />
        </div>

        {/* Execution Strategy */}
        <div className="space-y-1.5 font-mono text-xs">
          <label className="text-slate-500 text-[10px] font-bold block uppercase">EXECUTION METHOD</label>
          <select
            value={strategy}
            onChange={(e) => setStrategy(e.target.value)}
            className="w-full bg-slate-900 text-slate-200 border border-slate-800 rounded p-2 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 cursor-pointer"
          >
            <option value="Immediate Market Dump [DEX/CEX]">Immediate Market Dump [DEX/CEX]</option>
            <option value="24-Hour TWAP Block Execution">24-Hour TWAP Block Execution</option>
            <option value="OTC Desk Deal [Off-market matching]">OTC Desk Deal [Off-market matching]</option>
            <option value="Algorithmic Sniper Iceberg">Algorithmic Sniper Iceberg</option>
          </select>
        </div>

        {/* Market condition */}
        <div className="space-y-1.5 font-mono text-xs">
          <label className="text-slate-500 text-[10px] font-bold block uppercase">MARKET SENTIMENT DEPTH</label>
          <select
            value={marketCondition}
            onChange={(e) => setMarketCondition(e.target.value)}
            className="w-full bg-slate-900 text-slate-200 border border-slate-800 rounded p-2 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 cursor-pointer"
          >
            <option value="Bullish Depth [High order book buffers]">Bullish Depth [High buffer]</option>
            <option value="High Volatility Panic [Thin bid ask spreads]">High Volatility Panic [Thin bids]</option>
            <option value="Calm Standard Liquidity [Balanced market]">Calm Standard Liquidity [Balanced]</option>
            <option value="Dull Market Holiday [Abysmal volume]">Dull Market Holiday [Low depth]</option>
          </select>
        </div>
      </div>

      {/* Dynamic calculation banner */}
      <div className="p-3 bg-slate-950 rounded-lg border border-slate-900/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2">
          <Sliders className="h-4 w-4 text-rose-500" />
          <span className="text-slate-400">Total Simulated Liquidity Exposure:</span>
          <span className="text-rose-400 font-bold">${totalValueUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })} USD</span>
        </div>
        <span className="text-slate-500 hidden sm:inline">|</span>
        <span className="text-slate-500 text-right">
          Mode: <span className="text-slate-300 font-bold">{simulationEngine === "local" ? "Offline local algorithm" : "Gemini live AI LLM model"}</span>
        </span>
      </div>

      {/* AI Simulation running wrapper */}
      {loading && (
        <div className="p-8 bg-slate-950 border border-rose-900/30 rounded-xl space-y-4 flex flex-col items-center justify-center text-center">
          <Cpu className="h-8 w-8 text-rose-500 animate-spin" />
          <div className="space-y-1">
            <p className="text-xs font-mono font-semibold tracking-wider text-rose-400 uppercase">
              {progressMsg}
            </p>
            <p className="text-[10px] text-slate-400 font-mono">
              Running stress scenario parameters index. Simulating cross-collateral depegs.
            </p>
          </div>
          <div className="w-48 bg-slate-900 h-1 rounded-full overflow-hidden">
            <div className="h-full bg-rose-500 animate-[pulse_1.5s_infinite] w-3/4"></div>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 font-mono text-xs rounded-xl flex items-start gap-2.5">
          <AlertTriangle className="h-4 w-4 mt-0.5 text-rose-400 flex-shrink-0" />
          <div>
            <span className="font-bold block uppercase mb-0.5">Simulation Sub-system Error</span>
            <span>{errorMsg}</span>
            <span className="block text-slate-500 mt-2 text-[10px]">
              Tip: Swap Simulation Engine to &ldquo;Local Engine&rdquo; on the top right for instantaneous offline response results.
            </span>
          </div>
        </div>
      )}

      {simulationResult && !loading && (
        <div className="p-5 bg-gradient-to-b from-rose-950/20 to-slate-950/40 border border-rose-900/40 rounded-xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Slippage statistics */}
            <div className="p-4 bg-slate-950 rounded-lg border border-slate-900 text-center space-y-1">
              <span className="text-[9px] font-mono font-bold text-slate-500 block uppercase">ESTIMATED PRICE SLIPPAGE</span>
              <span className="text-2xl font-mono font-extrabold text-rose-400">{simulationResult.estimatedPriceSlippage}</span>
              <p className="text-[10px] text-slate-400 font-mono font-light leading-snug">Average execution deviation</p>
            </div>

            {/* Shock level */}
            <div className="p-4 bg-slate-950 rounded-lg border border-slate-900 text-center space-y-1">
              <span className="text-[9px] font-mono font-bold text-slate-500 block uppercase">ORDERBOOK SHOCK INDEX</span>
              <span className={`text-2xl font-mono font-extrabold uppercase ${
                simulationResult.orderBookShockIndex === "Extreme" || simulationResult.orderBookShockIndex === "Severe" ? "text-red-500 animate-pulse" :
                simulationResult.orderBookShockIndex === "Moderate" ? "text-yellow-400" :
                "text-emerald-500"
              }`}>
                {simulationResult.orderBookShockIndex}
              </span>
              <p className="text-[10px] text-slate-400 font-mono font-light leading-snug">Immediate depth reduction metric</p>
            </div>

            {/* Recovery timeline */}
            <div className="p-4 bg-slate-950 rounded-lg border border-slate-900 text-center space-y-1">
              <span className="text-[9px] font-mono font-bold text-slate-500 block uppercase">DEPTH RECOVERY TIMELINE</span>
              <span className="text-2xl font-mono font-extrabold text-cyan-400">{simulationResult.estimatedRecoveryTime}</span>
              <p className="text-[10px] text-slate-400 font-mono font-light leading-snug">Estimated liquidity re-balancing</p>
            </div>
          </div>

          {/* Secondary impacts cascade */}
          <div className="p-4 bg-slate-950 border border-slate-900 rounded-lg space-y-2">
            <span className="text-[9px] font-mono font-bold text-slate-500 block uppercase">DEFI DEBT &amp; DERIVATIVE LIQUIDATION CASCADE RISK</span>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              {simulationResult.cascadeLiquidationRisk}
            </p>
          </div>

          {/* Sectors and advice */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="text-xs font-mono font-bold text-slate-400 tracking-wider flex items-center gap-1 uppercase">
                <AlertTriangle className="h-3.5 w-3.5 text-red-500" /> CONTAMINATED SECOPS SECTORS
              </h4>
              <div className="p-3.5 bg-slate-950 border border-slate-900 rounded-lg flex flex-wrap gap-1.5">
                {simulationResult.secondaryContagionSectors.map((sector, idx) => (
                  <span key={idx} className="px-2 py-0.5 font-mono text-[10px] bg-red-950/20 text-red-400 rounded border border-red-900/30">
                    {sector}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-mono font-bold text-cyan-400 tracking-wider flex items-center gap-1 uppercase">
                <Zap className="h-3.5 w-3.5" /> SECURE HEDGING STRATEGIES
              </h4>
              <div className="p-3.5 bg-slate-950 border border-slate-900 rounded-lg">
                <ul className="space-y-1 list-disc pl-4 text-xs text-slate-300 font-sans leading-relaxed">
                  {simulationResult.hedgingCounterstrategies.map((hedge, idx) => (
                    <li key={idx}>{hedge}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Execution advice */}
          <div className="p-4 bg-slate-950 border-t border-rose-900/40 rounded-lg space-y-2">
            <h4 className="text-xs font-mono font-bold text-rose-400 tracking-wider uppercase">
              OTC OR ORDERBOOK LIQUIDATION ADVICE
            </h4>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              {simulationResult.optimalExecutionAdvice}
            </p>
          </div>
        </div>
      )}

      {/* D3-based Interactive Slippage Scatter Plot */}
      <SlippageScatterPlot 
        userSavedScenarios={savedScenarios}
        onSelectDataPoint={(point) => {
          setAsset(point.asset);
          setAmount(point.amount);
          setStrategy(point.strategy);
          setMarketCondition(point.marketCondition);
          
          // Smooth scroll to the top of simulator config for intuitive feedback
          const sectionHeader = document.getElementById("liquidity-simulator-section");
          if (sectionHeader) {
            sectionHeader.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }}
      />

      {/* HISTORICAL COMPARE AND LOG BOARD */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-6 pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-900 pb-4">
          <div className="space-y-0.5">
            <h3 className="text-xs font-mono font-bold text-slate-300 tracking-widest uppercase flex items-center gap-2">
              <History className="h-4 w-4 text-rose-500" />
              STRESS-TEST SCENARIOS COMPARISON CENTER
            </h3>
            <p className="text-[10px] text-slate-500 font-mono">
              Saves past simulated market impact indices to compare slippage, liquidity recovery timelines, and cascading liquidators.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {comparisonItems.length > 0 && (
              <button
                onClick={handleExportSelected}
                className="text-[10px] font-mono font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 bg-cyan-950/20 hover:bg-cyan-950/40 px-2 py-1 rounded border border-cyan-500/30 transition-all cursor-pointer shadow-sm"
                title="Export selected scenarios to JSON file"
              >
                <Download className="h-3 w-3" />
                EXPORT SELECTED ({comparisonItems.length})
              </button>
            )}

            {savedScenarios.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="text-[10px] font-mono font-bold text-slate-400 hover:text-red-400 flex items-center gap-1 bg-slate-900/60 hover:bg-red-950/20 px-2 py-1 rounded border border-slate-800 transition-all cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                CLEAR HISTORY ({savedScenarios.length})
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Warning Helper */}
        {savedScenarios.length > 0 && selectedScenarioIds.length < 2 && (
          <div className="p-3 bg-rose-500/5 border border-rose-500/10 text-rose-400 font-mono text-[10px] rounded flex items-center gap-2">
            <Info className="h-4 w-4 text-cyan-400 flex-shrink-0" />
            <span>Select/Check exactly **two (2) scenarios** from the log list below to compile a high-fidelity side-by-side delta comparison dashboard!</span>
          </div>
        )}

        {/* SIDE-BY-SIDE COMPARE DASHBOARD */}
        {comparisonItems.length === 2 && (
          <div className="bg-gradient-to-b from-slate-950 to-slate-900 border border-rose-950/70 rounded-xl overflow-hidden shadow-2xl animate-fade-in">
            <div className="p-3.5 bg-rose-950/10 border-b border-rose-900/40 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-rose-400 animate-pulse" />
                <span className="text-[11px] font-mono font-extrabold uppercase text-rose-300 tracking-wider">
                  ACTIVE CRITICAL DELTA COMPARISON REPORTS
                </span>
              </div>
              <button
                onClick={() => setSelectedScenarioIds([])}
                className="text-[9px] font-mono text-slate-400 hover:text-slate-200 uppercase bg-slate-900 px-2 py-0.5 rounded border border-slate-800 cursor-pointer"
              >
                Reset Comparison Selection
              </button>
            </div>

            {/* Visual Analytics Chart Block */}
            {(() => {
              const shockValues: Record<string, number> = {
                "Extreme": 4,
                "Severe": 3,
                "Moderate": 2,
                "Negligible": 1
              };

              const chartData = comparisonItems.map((item, index) => {
                const slippageValue = parseFloat(item.result.estimatedPriceSlippage) || 0;
                const shockValue = shockValues[item.result.orderBookShockIndex] || 1;
                return {
                  name: `Scenario ${index === 0 ? "Alpha" : "Beta"}`,
                  fullName: `Scenario ${index === 0 ? "Alpha" : "Beta"}: ${item.amount.toLocaleString()} ${item.asset}`,
                  slippage: slippageValue,
                  shock: shockValue,
                  rawShockIndex: item.result.orderBookShockIndex,
                  asset: item.asset,
                  strategy: item.strategy.split(" [")[0]
                };
              });

              const CustomCompareTooltip = ({ active, payload }: any) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-slate-950/95 border border-slate-800 p-3 rounded-lg shadow-2xl font-mono text-xs text-slate-200 max-w-[280px]">
                      <p className="font-bold text-slate-100 uppercase border-b border-slate-900 pb-1.5 mb-1.5 text-[10px] tracking-wide">
                        {payload[0].payload.fullName}
                      </p>
                      <div className="space-y-1.5 text-[11px]">
                        <p className="flex justify-between gap-4">
                          <span className="text-slate-400">Asset:</span>
                          <span className="text-slate-200 font-bold">{payload[0].payload.asset}</span>
                        </p>
                        <p className="flex justify-between gap-4">
                          <span className="text-slate-400">Methodology:</span>
                          <span className="text-slate-300 truncate max-w-[150px]" title={payload[0].payload.strategy}>
                            {payload[0].payload.strategy}
                          </span>
                        </p>
                        <hr className="border-slate-800/60 my-1" />
                        <p className="flex justify-between gap-4">
                          <span className="text-rose-400 font-bold font-mono">Price Slippage:</span>
                          <span className="text-rose-400 font-bold font-mono">{payload[0].payload.slippage.toFixed(2)}%</span>
                        </p>
                        <p className="flex justify-between gap-4">
                          <span className="text-sky-400 font-bold font-mono">Shock Index:</span>
                          <span className="text-sky-400 font-bold font-mono">{payload[0].payload.rawShockIndex} ({payload[0].payload.shock}/4)</span>
                        </p>
                      </div>
                    </div>
                  );
                }
                return null;
              };

              return (
                <div className="border-b border-slate-900 p-5 bg-slate-950/30 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <h4 className="text-[10px] font-mono font-bold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                        SCENARIO COMPARATIVE VECTORS (SLIPPAGE VS SHOCK LEVEL)
                      </h4>
                      <p className="text-[10px] text-slate-500 font-sans">
                        Slippage Percentage (rose bars, left axis) vs Order Book Shock index (sky bars, right axis).
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-[9px] font-mono">
                      <div className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-sm bg-rose-500"></span>
                        <span className="text-slate-400">SLIPPAGE (%)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-sm bg-sky-400"></span>
                        <span className="text-slate-400">SHOCK INDEX</span>
                      </div>
                    </div>
                  </div>

                  <div className="w-full h-[180px] pt-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.4} />
                        <XAxis 
                          dataKey="name" 
                          stroke="#64748b" 
                          fontSize={10} 
                          fontFamily="monospace"
                          tickLine={false}
                        />
                        <YAxis 
                          yAxisId="left"
                          orientation="left"
                          stroke="#ef4444"
                          fontSize={9} 
                          fontFamily="monospace"
                          tickFormatter={(val) => `${val}%`}
                          tickLine={false}
                        />
                        <YAxis 
                          yAxisId="right"
                          orientation="right"
                          stroke="#38bdf8"
                          fontSize={9} 
                          fontFamily="monospace"
                          tickLine={false}
                          domain={[0, 4]}
                          ticks={[1, 2, 3, 4]}
                          tickFormatter={(val) => {
                            if (val === 4) return "Extreme";
                            if (val === 3) return "Severe";
                            if (val === 2) return "Moderate";
                            if (val === 1) return "Negligible";
                            return "";
                          }}
                        />
                        <Tooltip content={<CustomCompareTooltip />} cursor={{ fill: '#0f172a', opacity: 0.4 }} />
                        <Bar yAxisId="left" dataKey="slippage" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={30} />
                        <Bar yAxisId="right" dataKey="shock" fill="#38bdf8" radius={[4, 4, 0, 0]} maxBarSize={30} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              );
            })()}

            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800 text-xs font-mono">
              {comparisonItems.map((item, index) => {
                const slippageNum = parseFloat(item.result.estimatedPriceSlippage);
                // Compare with other item
                const other = comparisonItems[index === 0 ? 1 : 0];
                const otherSlippageNum = parseFloat(other.result.estimatedPriceSlippage);
                const slippageDiff = otherSlippageNum - slippageNum;
                const isOptimal = slippageNum < otherSlippageNum;

                return (
                  <div key={item.id} className={`p-5 space-y-4 ${isOptimal ? "bg-emerald-950/5" : ""}`}>
                    {/* Header */}
                    <div className="flex justify-between items-start gap-2 border-b border-slate-900 pb-3">
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase block font-bold leading-none">Scenario {index === 0 ? "Alpha" : "Beta"}</span>
                        <h4 className="text-sm font-extrabold text-slate-100 flex items-center gap-1.5 mt-0.5">
                          <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                          {item.amount.toLocaleString()} {item.asset} Liquid Shock
                        </h4>
                        <span className="text-[9px] text-slate-500 mt-1 block">Executed at {item.timestamp} ({item.engine})</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-slate-500 uppercase block font-bold">TOTAL DEPTH VALUE</span>
                        <span className="text-xs font-bold text-slate-200 font-mono">${item.totalValueUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })} USD</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 bg-slate-950/60 p-3 rounded-lg border border-slate-900/80">
                      <div>
                        <span className="text-[9px] text-slate-500 block uppercase">Estimated Slippage:</span>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-lg font-bold text-rose-400">{item.result.estimatedPriceSlippage}</span>
                          {slippageDiff !== 0 && (
                            <span className={`text-[10px] font-bold ${isOptimal ? "text-emerald-400" : "text-rose-500"}`}>
                              {isOptimal ? `-${Math.abs(slippageDiff).toFixed(2)}% Optimal` : `+${Math.abs(slippageDiff).toFixed(2)}% Risk`}
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 block uppercase">Shock Level:</span>
                        <span className={`text-sm font-bold uppercase block mt-1 ${
                          item.result.orderBookShockIndex === "Extreme" || item.result.orderBookShockIndex === "Severe" ? "text-red-500" :
                          item.result.orderBookShockIndex === "Moderate" ? "text-amber-500" : "text-emerald-500"
                        }`}>
                          {item.result.orderBookShockIndex}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 pt-1">
                      <div>
                        <span className="text-[9px] text-slate-500 block uppercase">Parameters:</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-[9px] text-slate-300 rounded">
                            Strategy: {item.strategy.split(" [")[0]}
                          </span>
                          <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-[9px] text-slate-300 rounded">
                            State: {item.marketCondition}
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[9px] text-slate-500 block uppercase">Slippage Recovery Period:</span>
                        <span className="text-slate-300 text-[11px] block font-mono font-medium">{item.result.estimatedRecoveryTime}</span>
                      </div>

                      <div>
                        <span className="text-[9px] text-slate-500 block uppercase">Liquidator Cascade Severity:</span>
                        <p className="text-slate-400 text-[10px] sm:text-[11px] font-sans leading-relaxed mt-0.5">
                          {item.result.cascadeLiquidationRisk}
                        </p>
                      </div>

                      <div>
                        <span className="text-[9px] text-slate-500 block uppercase">Contaminated Sector Indices:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.result.secondaryContagionSectors.map((sec, i) => (
                            <span key={i} className="px-1.5 py-0.5 bg-red-950/10 text-red-400 font-mono text-[9px] border border-red-950/30 rounded">
                              {sec}
                            </span>
                          ))}
                        </div>
                      </div>

                      {item.notes && (
                        <div className="bg-slate-950/40 p-2.5 border border-slate-900 rounded font-mono text-[10px]">
                          <span className="text-[9px] text-slate-500 block uppercase font-bold mb-1">USER ANNOTATION NOTES:</span>
                          <p className="text-slate-300 font-sans italic leading-relaxed whitespace-pre-wrap">{item.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Strategic Synthesis Advice */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-2 text-xs text-slate-400 font-sans leading-normal">
                <Zap className="h-4 w-4 text-rose-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-[9px] font-mono font-bold text-slate-500 uppercase block">QUANT COMPARATIVE INSIGHT REPORT</span>
                  <p className="mt-0.5">
                    Scenario <span className="text-slate-200 font-bold">{parseFloat(comparisonItems[0].result.estimatedPriceSlippage) <= parseFloat(comparisonItems[1].result.estimatedPriceSlippage) ? "Alpha" : "Beta"}</span> provides structurally optimized liquidity matching. Executing via the selected strategy results in significantly safer average order book buffers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SCENARIOS HISTORY LOG QUEUE */}
        <div className="space-y-2">
          {savedScenarios.length === 0 ? (
            <div className="p-8 text-center bg-slate-950 border border-slate-900 rounded-xl space-y-2.5">
              <History className="h-8 w-8 text-slate-700 mx-auto" />
              <div className="space-y-1">
                <h4 className="text-xs font-mono font-bold text-slate-400 uppercase">NO HISTORY SCENARIOS RECORDED</h4>
                <p className="text-[11px] text-slate-500 font-sans max-w-sm mx-auto">
                  Execute custom asset stress scenarios in the calculator above. The simulated output will be automatically tracked in this history list.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <span className="text-[9px] font-mono text-slate-500 block uppercase font-bold px-1">
                HISTORICAL CHRONICLE QUEUE ({savedScenarios.length} / 15 SAVED - CLICK LOG TO AUTO-LOAD FORM)
              </span>
              <div className="divide-y divide-slate-900/60 transition-all border border-slate-900 rounded-xl overflow-hidden bg-slate-950/40">
                {savedScenarios.map((scenario, index) => {
                  const isSelected = selectedScenarioIds.includes(scenario.id);
                  const isSlippageHigh = parseFloat(scenario.result.estimatedPriceSlippage) > 3.0;

                  const currentSlippage = parseFloat(scenario.result.estimatedPriceSlippage) || 0;
                  const previousScenario = savedScenarios[index + 1];
                  const previousSlippage = previousScenario ? (parseFloat(previousScenario.result.estimatedPriceSlippage) || 0) : null;
                  const slippageDiff = previousSlippage !== null ? currentSlippage - previousSlippage : null;

                  return (
                    <div
                      key={scenario.id}
                      onClick={() => handleLoadScenario(scenario)}
                      className="group p-3 hover:bg-slate-900/80 flex flex-col gap-2.5 text-xs font-mono cursor-pointer transition-all border-b border-slate-900 last:border-0"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
                        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                          {/* Selector checkbox */}
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleCompare(scenario.id);
                            }}
                            className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${
                              isSelected 
                                ? "bg-rose-500 border-rose-500 text-slate-950" 
                                : "border-slate-750 bg-slate-950 hover:border-slate-500"
                            }`}
                            title="Select to compare scenario"
                          >
                            {isSelected && <Check className="h-2.5 w-2.5 stroke-[4px]" />}
                          </div>

                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-extrabold text-slate-200">
                                {scenario.amount.toLocaleString()} {scenario.asset}
                              </span>
                              <span className="text-[10px] text-slate-500">at ${scenario.activePrice.toLocaleString()} USD</span>
                              {scenario.engine === "Gemini AI" && (
                                <span className="text-[8px] bg-cyan-950/20 text-cyan-400 border border-cyan-900/20 px-1 rounded">
                                  AI
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                              <span className="truncate max-w-[150px] sm:max-w-none">{scenario.strategy.split(" [")[0]}</span>
                              <span>•</span>
                              <span>{scenario.marketCondition}</span>
                              <span>•</span>
                              <span className="text-slate-600">{scenario.timestamp}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 self-end sm:self-auto">
                          <div className="text-right flex flex-col items-end">
                            <span className="text-[10px] text-slate-500 block text-xs leading-none mb-0.5">SLIPPAGE</span>
                            <div className="flex items-center gap-1.5">
                              <span className={`font-bold ${isSlippageHigh ? "text-rose-400" : "text-emerald-400"}`}>
                                {scenario.result.estimatedPriceSlippage}
                              </span>
                              {slippageDiff !== null && (
                                <span 
                                  className={`text-[9px] font-bold px-1 py-0.5 rounded font-mono flex items-center gap-0.5 ${
                                    slippageDiff > 0 
                                      ? "bg-rose-950/40 text-rose-400 border border-rose-900/40" 
                                      : slippageDiff < 0 
                                        ? "bg-emerald-950/45 text-emerald-400 border border-emerald-900/40" 
                                        : "bg-slate-900 text-slate-400 border border-slate-800"
                                  }`}
                                  title={`Compared to previous: ${slippageDiff > 0 ? "+" : ""}${slippageDiff.toFixed(2)}%`}
                                >
                                  {slippageDiff > 0 ? "▲" : slippageDiff < 0 ? "▼" : "▬"}
                                  <span className="font-semibold text-[8px]">
                                    {Math.abs(slippageDiff).toFixed(2)}%
                                  </span>
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] text-slate-500 block text-xs leading-none">SHOCK</span>
                            <span className={`font-bold ${
                              scenario.result.orderBookShockIndex === "Extreme" || scenario.result.orderBookShockIndex === "Severe" ? "text-red-500" :
                              scenario.result.orderBookShockIndex === "Moderate" ? "text-amber-500" : "text-emerald-500"
                            }`}>
                              {scenario.result.orderBookShockIndex}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 pl-1">
                            <button
                              onClick={(e) => handleDeleteScenario(scenario.id, e)}
                              className="p-1 text-slate-500 hover:text-red-400 hover:bg-slate-900 rounded opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all cursor-pointer"
                              title="Delete scenario"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="w-full mt-0.5">
                        <NotesEditor 
                          initialNotes={scenario.notes || ""} 
                          onSave={(updatedNotes) => handleUpdateNotes(scenario.id, updatedNotes)} 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
