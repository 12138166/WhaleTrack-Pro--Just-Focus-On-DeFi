import React, { useState } from "react";
import { 
  Users, 
  Copy, 
  HelpCircle, 
  TrendingUp, 
  Activity, 
  AlertTriangle, 
  ShieldCheck, 
  ArrowRight,
  TrendingDown,
  Coins
} from "lucide-react";
import { WhaleWallet, WalletAICognition, TickerPrice } from "../types";
import { CURATED_WHALES } from "../data";
import { PredictiveLiquidityHeatmap } from "./PredictiveLiquidityHeatmap";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

const WHALE_AI_COGNITION: Record<string, WalletAICognition> = {
  "34xp4vRoCGJ7M3Ym623EERC1vhbk3v8JDY": {
    behavioralPersona: "Institutional Liquidity Reservoir",
    classificationTags: ["Accumulation", "Cold Custody", "Passive Storing"],
    riskScore: 12,
    riskJustification: "Primary Binance centralized reserve. Extremely secure multisig controls with zero outbound volatile behaviors.",
    tradingPatternAnalysis: "Exclusively displays passive accumulation of spot fee sweeps and internal exchange cold storage balancing. Complete absence of panic distribution during macro corrections.",
    liquidityInfluenceRating: "Systemic",
    influenceDescription: "Controls 248k BTC. Safe-haven status dictates macro trust index across the chain.",
    strategicRecommendations: ["Monitor for cold-to-hot conversion alerts", "Treat inflows as non-selling rebalances"]
  },
  "1FzWLv6N861bE43rGDX6eA7L99y4XGDE3c": {
    behavioralPersona: "Sovereign Corporate Accumulator",
    classificationTags: ["Accumulation", "Diamond Hands", "Institutional Lockup"],
    riskScore: 8,
    riskJustification: "Board-governed corporate trust with strict compliance framework. Zero historical track of secondary spot selling.",
    tradingPatternAnalysis: "Strategic, bulk localized TWAP purchase actions on major support zones with zero high-frequency or day-trading setups. Maximum retention rate.",
    liquidityInfluenceRating: "Severe",
    influenceDescription: "Consistently dries up spot exchange market supplies, intensifying supply crunch metrics.",
    strategicRecommendations: ["Accumulate parallel blocks when active buying alerts trigger", "Ignore daily volatility noise"]
  },
  "bc1qgd984fh9gdsjlgjfl89gshgdsjg8s7h": {
    behavioralPersona: "Distressed Asset Trustee",
    classificationTags: ["Distribution", "Bankruptcy Settlement", "Slippage Catalyst"],
    riskScore: 85,
    riskJustification: "State-managed bankruptcy payouts. Mandatory periodic disposals create heavy downstream over-the-counter and spot friction.",
    tradingPatternAnalysis: "Sudden, bulky transfers into major institutional platforms to trigger OTC block trades, usually spaced during high-depth trading hours to optimize execution slip.",
    liquidityInfluenceRating: "Systemic",
    influenceDescription: "Active movements act as immediate bearish catalysts, dropping spot indices by up to 5% due to protective shorts and retail panic.",
    strategicRecommendations: ["Hedge using spot shorts as soon as trustee wallets execute outbound transfers", "Wait for settlement end tags"]
  },
  "0x28C6c06298d514Db089934071355E5743bf21d60": {
    behavioralPersona: "Hyper-Active Liquidity Router",
    classificationTags: ["Arbitrage", "Gas Burner", "High-Frequency Sweep"],
    riskScore: 28,
    riskJustification: "Central hot router for deposit sweeps. Fast, automated, multiple endpoints with continuous transaction exposure.",
    tradingPatternAnalysis: "Millions of micro-deposits paired with programmatic bulk gas sweep-ups. Employs cross-CEX liquidity balancing loops to stabilize deposit ratios.",
    liquidityInfluenceRating: "Severe",
    influenceDescription: "Dictates network congestion levels and base gas price trends across Ethereum mainnet.",
    strategicRecommendations: ["Set automated gas checkers for arbitrage entry points", "Disregard routing flows"]
  },
  "0x00000000219ab540356cBB839Cbe05303d7705Fa": {
    behavioralPersona: "Protocol Consensus Validator Sink",
    classificationTags: ["Locked Staking", "Staking Validator", "Monolithic Inflow"],
    riskScore: 5,
    riskJustification: "Native Beacon Chain deposit ledger. Bound by strict protocol exit queues and state validators.",
    tradingPatternAnalysis: "Unbroken, passive compounding accumulation. Free of macro speculation, short-selling, or high-frequency arbitrage activities.",
    liquidityInfluenceRating: "Systemic",
    influenceDescription: "Permanently locks 38M+ ETH, establishing the base consensus trust floor of Ethereum security.",
    strategicRecommendations: ["Model long-term ETH deflation based on Beacon volume delta", "Utilize liquid staking wrappers to route yield"]
  },
  "0x9812A27d62058309aDfCEe54C1b6EE6BFd55efD7": {
    behavioralPersona: "DeFi Yield Optimization Farmer",
    classificationTags: ["Arbitrage", "Recursive Leverage", "DeFi Maximizer"],
    riskScore: 72,
    riskJustification: "Multi-million dollar debt positions across MakerDAO and Lido. Exposed to margin calls or liquidation risks during flash crash phases.",
    tradingPatternAnalysis: "Dynamic, recursive borrow/mint cycles, yield farming maximization, and cross-platform arbitrage to defend collateral health indices.",
    liquidityInfluenceRating: "Severe",
    influenceDescription: "Maintains significant liquidity size. Sudden withdrawals double slippage spreads across top Curve and Uniswap pools.",
    strategicRecommendations: ["Set active alert triggers for collateral safety ratios", "Maintain hedges when debt approaches 140% health"]
  },
  "0x1231355446546Fff88856F745339FF5123FFaa90": {
    behavioralPersona: "Sanctioned Illicit Actor",
    classificationTags: ["Privacy Mixer", "Covert Laundering", "Chaotic Outflow"],
    riskScore: 98,
    riskJustification: "Sovereign-sanctioned wallet containing exploited bridge capital. High probability of blacklists and asset freezes.",
    tradingPatternAnalysis: "Highly obfuscated peer-to-peer routing and batch distributions into privacy mixers (e.g. Tornado Cash) to hide tracks.",
    liquidityInfluenceRating: "Moderate",
    influenceDescription: "Negligible spot price pressure but extreme compliance, regulatory, and protocol integration friction.",
    strategicRecommendations: ["Explicitly restrict or flag all interlinked addresses", "Deploy contract barriers to intercept incoming loops"]
  },
  "9W52YvS9re9ZXYf7Z4Z4c93dsksfkgTsk2j3": {
    behavioralPersona: "Ecosystem Grant Distributor",
    classificationTags: ["Passive Treasury", "Ecosystem Staker", "Dev Grants"],
    riskScore: 15,
    riskJustification: "Solana Foundation official reserves. Multi-sig managed and strictly restricted to development grants with long vesting periods.",
    tradingPatternAnalysis: "Extremely low-frequency transactions mostly composed of quarterly dev vesting or node delegation actions. Safe from reactive spec-trading.",
    liquidityInfluenceRating: "Moderate",
    influenceDescription: "Predictable periodic grant transfers create minor sell-side pressures easily offset by OTC desk pools.",
    strategicRecommendations: ["Track delegation schedules to analyze validator health shift", "Disregard macro-grant allocations"]
  },
  "At38dsksfkgTsk2j39W52YvS9re9ZXYf7Z4Z4c93": {
    behavioralPersona: "Bankruptcy Liquidation Custodian",
    classificationTags: ["Distribution", "Overhead Resistance", "Restructuring Asset"],
    riskScore: 65,
    riskJustification: "Court-directed recovery liquidator. Assets are systematically packaged and auctioned off to reimburse creditors.",
    tradingPatternAnalysis: "Scheduled chunk conversions paired with institutional OTC deals. Minimizes public exchange orderbook order slips, though can trigger derivative shorts.",
    liquidityInfluenceRating: "Severe",
    influenceDescription: "Underlying unlock schedules induce short-term funding rate shocks and spot price ceilings.",
    strategicRecommendations: ["DCA during lockup unlock days", "Short derivatives to lock in premium during liquidation notices"]
  },
  "GC2z7dK95j7sL3pE1rT3G3H9aW9dE8fC7gB5aWS1": {
    behavioralPersona: "AMM Pool Liquidity Provider",
    classificationTags: ["Passive Market Making", "Constant Rebalancing", "Arbitrage Sink"],
    riskScore: 10,
    riskJustification: "Decentralized automated market maker pools running on immutable smart contracts. Transparent and rules-driven.",
    tradingPatternAnalysis: "Instantaneous, passive asset rebalancing driven entirely by inbound swap orders and arbitrage bots. Active 24/7/365 to preserve ratios.",
    liquidityInfluenceRating: "Systemic",
    influenceDescription: "The focal point of Solana DEX trading. Net liquidity movements redefine swapping slippage constraints across Solana.",
    strategicRecommendations: ["Observe pool ratio disparities to execute cross-DEX arbitrage swaps", "Add liquidity inside low volatility bands"]
  },
  "TYGsa8f9shfdgkd7gksghskjgf7shdg9kd": {
    behavioralPersona: "Fiat-Backed Stablecoin Issuer",
    classificationTags: ["Peg Guardian", "Fiat Minting", "Reserve Controller"],
    riskScore: 20,
    riskJustification: "Core Tether treasury management address. Subject to reserve audibility and centralized freeze orders, but structurally robust.",
    tradingPatternAnalysis: "Lump-sum mint/burn transactions triggered by direct institutional wire arrivals, followed by immediate hot swap distributions to exchange hubs.",
    liquidityInfluenceRating: "Systemic",
    influenceDescription: "Net mint actions represent true fresh traditional capital inflow, often leading bullish expansion periods.",
    strategicRecommendations: ["Buy macro asset dips when active treasury mint counts spike", "Monitor on-chain peg premium metrics"]
  },
  "TYss7hdsgjkdGfS1gKsGd7KgSgd9Kd7hgS": {
    behavioralPersona: "Exchange Reserve Cold Depot",
    classificationTags: ["Exchange Custody", "Reserve Validator", "Multi-Chain Sweep"],
    riskScore: 45,
    riskJustification: "High-volume CEX reserve vault. Prone to dynamic asset allocation requests and platform peg stabilization maneuvers.",
    tradingPatternAnalysis: "Intermittent huge multi-million stablecoin batches shuffled between exchange gas gateways and Cold structures to protect and verify proof-of-reserves.",
    liquidityInfluenceRating: "Severe",
    influenceDescription: "Determines instant spot and stablecoin liquidity profiles on HTX. Outflow spikes cause systemic trust stress indexes to jump.",
    strategicRecommendations: ["Cross-verify proof-of-reserve hashes daily", "Withdraw excess spot balances during high structural stress events"]
  }
};

interface WhaleComparisonMatrixProps {
  onAnalyzeWallet: (wallet: WhaleWallet) => void;
  onSimulateImpact: (asset: string, defaultAmount: number) => void;
  tickers?: { [key: string]: TickerPrice };
}

export const WhaleComparisonMatrix: React.FC<WhaleComparisonMatrixProps> = ({
  onAnalyzeWallet,
  onSimulateImpact,
  tickers
}) => {
  const [selectedNetwork, setSelectedNetwork] = useState<string>("ALL");
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [expandedAIAddress, setExpandedAIAddress] = useState<string | null>(null);

  const handleCopy = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const filteredWhales = selectedNetwork === "ALL" 
    ? CURATED_WHALES 
    : CURATED_WHALES.filter(w => w.network === selectedNetwork);

  // Network stats comparing concentration and features
  const networkCharacteristics = [
    { asset: "BTC", type: "High-cap", supplyConcentration: "11.2%", avgHoldDuration: "4.2 Years", liquidityDepth: "$8.5B", pattern: "Absolute cold storage, OTC swaps, low staking activity" },
    { asset: "ETH", type: "High-cap", supplyConcentration: "38.5%", avgHoldDuration: "1.8 Years", liquidityDepth: "$4.2B", pattern: "Staking validator contracts, multi-sig bridges, DAO locks" },
    { asset: "SOL", type: "High-cap", supplyConcentration: "48.2%", avgHoldDuration: "8.2 Months", liquidityDepth: "$1.2B", pattern: "High DEX trade speeds, active validator delegation, MEV bot feeds" },
    { asset: "USDT", type: "Fiat-Backed Stablecoin", supplyConcentration: "55.4%", avgHoldDuration: "2.4 Months", liquidityDepth: "$15.0B", pattern: "Cross-chain cross-DEX arb, fast arbitrage mint-burn peg loops" },
    { asset: "USDC", type: "Fiat-Backed Stablecoin", supplyConcentration: "62.1%", avgHoldDuration: "1.1 Months", liquidityDepth: "$12.0B", pattern: "Centralized institutional treasury reserves, major exchange sweepers" },
    { asset: "PYUSD", type: "Fiat-Backed Stablecoin", supplyConcentration: "34.5%", avgHoldDuration: "5.6 Months", liquidityDepth: "$0.32B", pattern: "PayPal integrated payment settlement networks, regulated banking reserves" },
    { asset: "USD1", type: "Fiat-Backed Stablecoin", supplyConcentration: "28.4%", avgHoldDuration: "2.1 Months", liquidityDepth: "$0.09B", pattern: "High compliance settlement transfers, primarily CEX liquidity gateways" },
    { asset: "USDS", type: "Crypto-Backed Stablecoin", supplyConcentration: "45.8%", avgHoldDuration: "3.4 Months", liquidityDepth: "$1.52B", pattern: "Sky (formerly Maker) decentralized staking, Tokenized RWA yield pools" },
    { asset: "DAI", type: "Crypto-Backed Stablecoin", supplyConcentration: "51.2%", avgHoldDuration: "4.2 Months", liquidityDepth: "$2.15B", pattern: "Over-collateralized loans, algorithmic peg stability modules (PSM)" },
    { asset: "USDe", type: "Synthetic Stablecoin", supplyConcentration: "68.3%", avgHoldDuration: "1.5 Months", liquidityDepth: "$2.84B", pattern: "Delta-neutral spot-futures shorting hedges, high elastic funding arbitrage" },
    { asset: "PAXG", type: "Commodity Stablecoin", supplyConcentration: "15.4%", avgHoldDuration: "1.5 Years", liquidityDepth: "$0.18B", pattern: "Gold bullion backed tokenization, gold price tracking inflation hedges" }
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl p-5 space-y-6" id="whale-matrix-section">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <h2 className="text-lg font-mono font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <Coins className="h-5 w-5 text-amber-500" />
            WHALE DIRECTORY & COMPARISON PANEL
          </h2>
          <p className="text-xs text-slate-400">
            Compare macro-wallet supply distributions, holdings metrics, and risk signatures between stablecoins and high-caps.
          </p>
        </div>

        {/* Network filters */}
        <div className="flex flex-wrap gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
          {["ALL", "Bitcoin", "Ethereum", "Solana", "Tron"].map((net) => (
            <button
              key={net}
              onClick={() => setSelectedNetwork(net)}
              className={`px-3 py-1 text-xs font-mono rounded transition-all ${
                selectedNetwork === net 
                  ? "bg-amber-500 text-slate-950 font-bold" 
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              {net.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {filteredWhales.map((whale) => (
          <div 
            key={whale.address}
            className="bg-slate-950/60 border border-slate-800 hover:border-slate-700/80 rounded-xl p-4 transition-all hover:translate-y-[-2px] hover:shadow-lg flex flex-col justify-between space-y-3"
          >
            {/* Header Block inside individual whale card */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold uppercase ${
                    whale.network === "Bitcoin" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                    whale.network === "Ethereum" ? "bg-blue-500/10 text-indigo-400 border border-blue-500/20" :
                    whale.network === "Solana" ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" :
                    "bg-red-500/10 text-rose-400 border border-red-500/20"
                  }`}>
                    {whale.network}
                  </span>
                  {whale.isExchange && (
                    <span className="text-[9px] px-1.5 py-0.2 bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20 rounded">
                      EXCHANGE COLD
                    </span>
                  )}
                </div>
                <h3 className="font-mono text-xs font-bold text-slate-200 mt-2 flex items-center gap-1">
                  {whale.blockchainLabel}
                </h3>
              </div>
              
              {/* Risk Sign */}
              <div className="text-right">
                <span className="text-[10px] text-slate-500 font-mono block">RISK CLASS</span>
                <span className={`text-xs font-mono font-bold uppercase ${
                  whale.riskRating === "Critical" ? "text-rose-500" :
                  whale.riskRating === "High" ? "text-orange-400" :
                  whale.riskRating === "Medium" ? "text-yellow-400" :
                  "text-emerald-500"
                }`}>
                  {whale.riskRating}
                </span>
              </div>
            </div>

            {/* Address bar */}
            <div className="bg-slate-950 p-2 rounded border border-slate-900 flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-400 truncate max-w-[280px]">{whale.address}</span>
              <button 
                onClick={() => handleCopy(whale.address)}
                className="text-slate-500 hover:text-slate-300 transition-colors ml-2"
                title="Copy Address"
              >
                {copiedAddress === whale.address ? (
                  <span className="text-[10px] text-emerald-400">COPIED</span>
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>

            {/* Core facts */}
            <div className="grid grid-cols-3 gap-2 py-1 text-center font-mono">
              <div className="bg-slate-900/40 p-2 rounded border border-slate-900/50">
                <span className="text-[9px] text-slate-500 block uppercase">Balance Sum</span>
                <span className="text-xs text-slate-100 font-bold">{whale.initialBalance.split(" ")[0]}</span>
              </div>
              <div className="bg-slate-900/40 p-2 rounded border border-slate-900/50">
                <span className="text-[9px] text-slate-500 block uppercase">Wallet Age</span>
                <span className="text-xs text-slate-200 font-bold">{whale.age}</span>
              </div>
              <div className="bg-slate-900/40 p-2 rounded border border-slate-900/50">
                <span className="text-[9px] text-slate-500 block uppercase">Transactions</span>
                <span className="text-xs text-slate-200 font-bold">{whale.txCount.toLocaleString()}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 font-mono line-clamp-2 italic bg-slate-900/20 px-2 py-1 rounded min-h-[36px]">
              &ldquo;{whale.notes}&rdquo;
            </p>

            {/* AI Trade Pattern Block */}
            {(() => {
              const aiData = WHALE_AI_COGNITION[whale.address];
              if (!aiData) return null;
              
              const isExpanded = expandedAIAddress === whale.address;
              
              const containsAccum = aiData.classificationTags.some(t => t.toLowerCase().includes("accum"));
              const containsDist = aiData.classificationTags.some(t => t.toLowerCase().includes("dist"));
              const containsArb = aiData.classificationTags.some(t => t.toLowerCase().includes("arb"));
              
              let traitBadge = "Arbitrage & Volatility";
              let traitColor = "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
              
              if (containsAccum) {
                traitBadge = "Core Accumulation";
                traitColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
              } else if (containsDist) {
                traitBadge = "Strategic Distribution";
                traitColor = "bg-rose-500/10 text-rose-400 border-rose-500/20";
              }

              return (
                <div className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 flex items-center gap-1.5 font-bold">
                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                      AI Behavioral profile
                    </span>
                    <button
                      type="button"
                      onClick={() => setExpandedAIAddress(isExpanded ? null : whale.address)}
                      className="text-[10px] font-mono font-bold text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
                    >
                      {isExpanded ? "COLLAPSE DECODE ▲" : "VIEW COGNITIVE DECODE 🔮"}
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <span className="text-[9px] font-mono text-slate-300 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                      Persona: {aiData.behavioralPersona}
                    </span>
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${traitColor}`}>
                      {traitBadge}
                    </span>
                  </div>

                  {isExpanded && (
                    <div className="mt-2 text-left font-mono text-[11px] space-y-2 border-t border-slate-800/60 pt-2 transition-all">
                      <div>
                        <span className="text-[9px] text-slate-500 block uppercase font-bold">Trading Pattern Analysis:</span>
                        <p className="text-slate-300 leading-relaxed mt-0.5 bg-slate-950/70 p-1.5 rounded border border-slate-900">
                          {aiData.tradingPatternAnalysis}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[9px] text-slate-400 block uppercase font-bold">Influence ({aiData.liquidityInfluenceRating}):</span>
                          <span className="text-slate-300 text-[10px] line-clamp-2 leading-tight">{aiData.influenceDescription}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 block uppercase font-bold">Risk Score & Justification:</span>
                          <span className="text-[10px] font-bold text-amber-500 block">Score: {aiData.riskScore}%</span>
                          <span className="text-slate-400 text-[9px] block leading-tight truncate" title={aiData.riskJustification}>
                            {aiData.riskJustification}
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[9px] text-slate-500 block uppercase font-bold">Autonomous Strategies:</span>
                        <div className="flex flex-col gap-1 mt-1">
                          {aiData.strategicRecommendations.map((rec, idx) => (
                            <div key={idx} className="flex items-start gap-1 bg-slate-950/40 p-1 rounded text-[9px] text-emerald-400 border border-emerald-950/50">
                              <span className="text-emerald-550 mr-0.5 font-bold">✔</span>
                              <span>{rec}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Actions Footer */}
            <div className="pt-2 flex gap-2 border-t border-slate-900">
              <button 
                onClick={() => onAnalyzeWallet(whale)}
                className="flex-1 px-2.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded text-xs font-mono flex items-center justify-center gap-1 transition-colors"
              >
                DIAGNOSE WALLET 🔎
              </button>
              <button 
                onClick={() => {
                  const symbolStr = whale.assetBalances[0]?.symbol || "BTC";
                  const amtVal = Math.floor(whale.assetBalances[0]?.amount * 0.1) || 500;
                  onSimulateImpact(symbolStr, amtVal);
                }}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-300 rounded text-xs font-mono flex items-center justify-center gap-1 transition-colors"
                title="Simulate Liquidity Dump"
              >
                SLIPPAGE IMPACT 💥
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 🔮 D3-based predictive flow heatmap component */}
      <PredictiveLiquidityHeatmap />

      {/* 24-Hour Trading Volume Bar Chart Section */}
      {(() => {
        const volumeChartData = [
          { asset: "BTC", volume: tickers?.BTC?.volume24h ?? 28450102000, color: "#f59e0b" },
          { asset: "ETH", volume: tickers?.ETH?.volume24h ?? 14502800000, color: "#6366f1" },
          { asset: "SOL", volume: tickers?.SOL?.volume24h ?? 4892400000, color: "#a855f7" },
          { asset: "USDT", volume: tickers?.USDT?.volume24h ?? 52401800000, color: "#10b981" },
          { asset: "USDC", volume: tickers?.USDC?.volume24h ?? 18450200000, color: "#06b6d4" },
          { asset: "PYUSD", volume: tickers?.PYUSD?.volume24h ?? 150240000, color: "#3b82f6" },
          { asset: "USD1", volume: tickers?.USD1?.volume24h ?? 42800000, color: "#38bdf8" },
          { asset: "USDS", volume: tickers?.USDS?.volume24h ?? 958040000, color: "#22d3ee" },
          { asset: "DAI", volume: tickers?.DAI?.volume24h ?? 1840250000, color: "#eab308" },
          { asset: "USDe", volume: tickers?.USDe?.volume24h ?? 2145700000, color: "#ec4899" },
          { asset: "PAXG", volume: tickers?.PAXG?.volume24h ?? 84200000, color: "#d97706" }
        ];

        const CustomVolumeTooltip = ({ active, payload }: any) => {
          if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
              <div className="bg-slate-950/95 border border-slate-800 p-3 rounded-lg shadow-xl font-mono text-xs text-slate-200">
                <p className="font-bold text-slate-100 uppercase">{data.asset} / USD</p>
                <div className="mt-1.5 space-y-1">
                  <p className="text-slate-400">
                    24h Trading Vol: <span className="text-cyan-405 font-bold">${data.volume.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Approx. <span className="text-slate-300 font-semibold">${(data.volume / 1e9).toFixed(3)} Billion USD</span>
                  </p>
                </div>
              </div>
            );
          }
          return null;
        };

        return (
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-900 pb-3">
              <div className="space-y-0.5">
                <h3 className="text-xs font-mono font-bold text-cyan-400 tracking-widest uppercase flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span>
                  24h Volume Liquidity Depth Visualizer
                </h3>
                <p className="text-[10px] text-slate-500 font-mono">
                  Live trade volume metrics across prime benchmark assets. Hover over elements for exact quote depth.
                </p>
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded self-start">
                UNIT: BILLION USD
              </span>
            </div>

            <div className="w-full h-[240px] pt-2">
              <ResponsiveContainer width="100%" height="105%">
                <BarChart
                  data={volumeChartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                  <XAxis 
                    dataKey="asset" 
                    stroke="#64748b" 
                    fontSize={10} 
                    fontFamily="Fira Code, JetBrains Mono, monospace"
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="#64748b" 
                    fontSize={10} 
                    fontFamily="Fira Code, JetBrains Mono, monospace"
                    tickFormatter={(val) => `$${(val / 1e9).toFixed(0)}B`}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomVolumeTooltip />} cursor={{ fill: '#0f172a', opacity: 0.4 }} />
                  <Bar 
                    dataKey="volume" 
                    radius={[4, 4, 0, 0]}
                    maxBarSize={50}
                  >
                    {volumeChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      })()}

      {/* Stablecon vs High-Cap Behavioral Matrix */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4">
        <h3 className="text-xs font-mono font-bold text-amber-500 tracking-widest uppercase flex items-center gap-1.5">
          <Activity className="h-4 w-4" />
          SYSTEMICS: CONCENTRATION & SLIPPAGE THRESHOLDS COMPARE
        </h3>

        <div className="overflow-x-auto" style={{ scrollbarWidth: 'thin' }}>
          <table className="w-full text-left font-mono text-xs text-slate-300">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] text-slate-500 tracking-wider">
                <th className="py-2.5">ASSET CLASS</th>
                <th className="py-2.5">TOP 100 GINI WEIGHT</th>
                <th className="py-2.5">AVG COLD HOLD TIME</th>
                <th className="py-2.5">2% DEPTH DENSITY</th>
                <th className="py-2.5">PRIMARY WHALE BEHAVIOR METRICS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              {networkCharacteristics.map((char) => (
                <tr key={char.asset} className="hover:bg-slate-900/40">
                  <td className="py-3 font-bold text-slate-200">
                    {char.asset} <span className="text-[10px] font-normal text-slate-500">({char.type})</span>
                  </td>
                  <td className="py-3 text-red-400 font-bold">{char.supplyConcentration}</td>
                  <td className="py-3 text-slate-300">{char.avgHoldDuration}</td>
                  <td className="py-3 text-amber-400">{char.liquidityDepth}</td>
                  <td className="py-3 text-[11px] text-slate-400 italic font-sans">{char.pattern}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
