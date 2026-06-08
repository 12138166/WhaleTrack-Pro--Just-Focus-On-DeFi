import React, { useState, useMemo } from "react";
import {
  Layers,
  ShieldCheck,
  Cpu,
  Coins,
  ChevronDown,
  ChevronUp,
  Sliders,
  HelpCircle,
  Activity,
  Flame,
  Zap,
  TrendingUp,
  Compass,
  FileText,
  Boxes,
  RefreshCw,
  Scale
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Types
export type ProofType = "PoW" | "PoS" | "PoA" | "PoST" | "PoRep";
export type LayerType = "L1" | "L2-Optimistic" | "L2-ZK" | "Sidechain";

export interface ProtocolConsensusMeta {
  id: string;
  name: string;
  symbol: string;
  proofType: ProofType;
  layerType: LayerType;
  throughputTps: number;
  gasSavingFactor: string;
  challengeWindow: string;
  nativeStakingYield: number;
  securityRating: string; // A+, A, B, C etc.
  description: string;
}

// Mock-up Database representing standard protocols and networks
const SYSTEM_PROTOCOLS: ProtocolConsensusMeta[] = [
  {
    id: "ethereum",
    name: "Ethereum",
    symbol: "ETH",
    proofType: "PoS",
    layerType: "L1",
    throughputTps: 15,
    gasSavingFactor: "Baseline (1x)",
    challengeWindow: "None (PoS Finality)",
    nativeStakingYield: 3.4,
    securityRating: "AAA",
    description: "The baseline smart contract platform. Highly decentralized, secured by massive PoS validator set."
  },
  {
    id: "solana",
    name: "Solana",
    symbol: "SOL",
    proofType: "PoS",
    layerType: "L1",
    throughputTps: 3500,
    gasSavingFactor: "700x cheaper",
    challengeWindow: "None (L1 Finality)",
    nativeStakingYield: 6.8,
    securityRating: "A+",
    description: "High-performance monolithic L1 with proof-of-history paired with proof-of-stake for immediate execution."
  },
  {
    id: "arbitrum",
    name: "Arbitrum One",
    symbol: "ARB",
    proofType: "PoS",
    layerType: "L2-Optimistic",
    throughputTps: 200,
    gasSavingFactor: "30x - 60x cheaper",
    challengeWindow: "7 Days (Fraud Proof)",
    nativeStakingYield: 0, // Governed via token, no native staking validation yield
    securityRating: "AA",
    description: "Leading Optimistic Rollup on Ethereum. Features active fraud-proof cycles to guarantee L1 settlement safety."
  },
  {
    id: "optimism",
    name: "OP Mainnet",
    symbol: "OP",
    proofType: "PoS",
    layerType: "L2-Optimistic",
    throughputTps: 150,
    gasSavingFactor: "25x - 50x cheaper",
    challengeWindow: "7 Days (Fraud Proof)",
    nativeStakingYield: 0,
    securityRating: "AA-",
    description: "Optimistic Rollup leveraging the generic OP Stack framework with shared sequencer architectures."
  },
  {
    id: "zksync",
    name: "ZKsync Era",
    symbol: "ZK",
    proofType: "PoS",
    layerType: "L2-ZK",
    throughputTps: 300,
    gasSavingFactor: "40x - 80x cheaper",
    challengeWindow: "Instant (Math Validity Proof)",
    nativeStakingYield: 0,
    securityRating: "AA",
    description: "High-throughput ZC-Rollup using zk-SNARK cryptographic integrity parameters to derive instant mathematical safety."
  },
  {
    id: "starknet",
    name: "Starknet",
    symbol: "STRK",
    proofType: "PoS",
    layerType: "L2-ZK",
    throughputTps: 250,
    gasSavingFactor: "40x - 90x cheaper",
    challengeWindow: "Instant (ZK-STARK Validity)",
    nativeStakingYield: 0,
    securityRating: "AA",
    description: "ZK-Rollup employing STARK cryptographics to process massive off-chain batch state computation."
  },
  {
    id: "polygon",
    name: "Polygon PoS",
    symbol: "POL",
    proofType: "PoS",
    layerType: "Sidechain",
    throughputTps: 1200,
    gasSavingFactor: "100x cheaper",
    challengeWindow: "15-30 Mins (Checkpoint)",
    nativeStakingYield: 5.1,
    securityRating: "A",
    description: "Fast sidechain with check-pointing processes linked to the main Ethereum staking ledger."
  },
  {
    id: "kaspa",
    name: "Kaspa",
    symbol: "KAS",
    proofType: "PoW",
    layerType: "L1",
    throughputTps: 300,
    gasSavingFactor: "N/A",
    challengeWindow: "Probabilistic",
    nativeStakingYield: 0,
    securityRating: "A-",
    description: "PoW-based blockDAG featuring instant ledger settlement cycles without compromising core security protocols."
  },
  {
    id: "filecoin",
    name: "Filecoin",
    symbol: "FIL",
    proofType: "PoST", // Also utilizes PoRep
    layerType: "L1",
    throughputTps: 30,
    gasSavingFactor: "N/A",
    challengeWindow: "Interactive Epoch",
    nativeStakingYield: 8.5,
    securityRating: "A",
    description: "Decentralized storage layer backed by physical harddrive space. Miners must continuously submit PoST & PoRep."
  },
  {
    id: "bsc",
    name: "BNB Smart Chain",
    symbol: "BNB",
    proofType: "PoA", // Proof of Staked Authority
    layerType: "L1",
    throughputTps: 1500,
    gasSavingFactor: "50x cheaper",
    challengeWindow: "Instant (PoA Block)",
    nativeStakingYield: 2.9,
    securityRating: "A+",
    description: "EVM-compatible L1 using delegated Proof of Staked Authority with selected trusted validation nodes."
  }
];

export const ChainConsensusEducationalDeck: React.FC = () => {
  // Accordion Expand/Collapse States for standard web3 concepts
  const [openAccordion, setOpenAccordion] = useState<{ [key: string]: boolean }>({
    "staking": true,
    "proof": false,
    "rollups": false,
    "burn": false,
    "gas": false,
    "finality": false,
    "lsd": false,
    "mev": false,
    "impermanent": false,
    "bridges": false
  });

  const toggleAccordion = (id: string) => {
    setOpenAccordion((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Staking Credibility Booster simulator states for small-mid protocols
  const [smallProtoName, setSmallProtoName] = useState<string>("AlphaYield DAO");
  const [nativeWeight, setNativeWeight] = useState<number>(75); // Native token weight
  const [bluechipWeight, setBluechipWeight] = useState<number>(15); // ETH/SOL weight
  const [stableWeight, setStableWeight] = useState<number>(10); // USDC/USDT weight

  // Standardize values to sum up to 100% on slide changes
  const handleNativeChange = (val: number) => {
    setNativeWeight(val);
    const remainder = 100 - val;
    // Distribute remainder between blue-chip and stablecoins proportionally
    const currentSum = (bluechipWeight || 1) + (stableWeight || 1);
    const bRatio = bluechipWeight / currentSum;
    const sRatio = stableWeight / currentSum;
    setBluechipWeight(Math.round(remainder * bRatio));
    setStableWeight(Math.max(0, 100 - val - Math.round(remainder * bRatio)));
  };

  const handleBluechipChange = (val: number) => {
    setBluechipWeight(val);
    const remainder = 100 - val;
    const currentSum = (nativeWeight || 1) + (stableWeight || 1);
    const nRatio = nativeWeight / currentSum;
    const sRatio = stableWeight / currentSum;
    setNativeWeight(Math.round(remainder * nRatio));
    setStableWeight(Math.max(0, 100 - val - Math.round(remainder * nRatio)));
  };

  const handleStableChange = (val: number) => {
    setStableWeight(val);
    const remainder = 100 - val;
    const currentSum = (nativeWeight || 1) + (bluechipWeight || 1);
    const nRatio = nativeWeight / currentSum;
    const bRatio = bluechipWeight / currentSum;
    setNativeWeight(Math.round(remainder * nRatio));
    setBluechipWeight(Math.max(0, 100 - val - Math.round(remainder * nRatio)));
  };

  // Calculator Outputs
  const boosterMetrics = useMemo(() => {
    // Staking high tier blue-chip / stables dramatically raises trust. Highly native protocols suffer high volatile risk.
    const trustFactor = Math.min(100, Math.round(
      (bluechipWeight * 1.1) + 
      (stableWeight * 1.3) + 
      (nativeWeight * 0.3)
    ));

    const projectedTvlUsd = Math.round((trustFactor * 3.5) * 100000); // 0 to $35M max
    
    let rating = "D-";
    let colorClass = "text-rose-500 bg-rose-950/20";
    let riskLabel = "Extreme Spiral Risk";

    if (trustFactor >= 85) {
      rating = "AA+";
      colorClass = "text-emerald-400 bg-emerald-950/40 border-emerald-900";
      riskLabel = "High Grade / Low Volatility";
    } else if (trustFactor >= 70) {
      rating = "A";
      colorClass = "text-emerald-500 bg-emerald-950/20 border-emerald-950";
      riskLabel = "Secure Backing";
    } else if (trustFactor >= 55) {
      rating = "BBB+";
      colorClass = "text-cyan-400 bg-cyan-950/20 border-cyan-900";
      riskLabel = "Moderate Exposure";
    } else if (trustFactor >= 40) {
      rating = "BB";
      colorClass = "text-amber-500 bg-amber-950/20 border-amber-950";
      riskLabel = "Significant Speculative";
    } else {
      rating = "C-";
      colorClass = "text-rose-400 bg-rose-950/40 border-rose-900";
      riskLabel = "Vulnerable Spiral Hazard";
    }

    let summaryText = "";
    if (nativeWeight > 70) {
      summaryText = `⚠️ High Death-Spiral Risk! 70%+ of backup backing relies on the protocol's own highly volatile native token. If price cascades, validators will dump staking positions, dissolving total trust. Config blue-chip ETH/SOL backings immediately to preserve your credibility score.`;
    } else if (stableWeight > 40) {
      summaryText = `🛡️ Heavy Defensive Staking Layer: Strong stablecoin exposure locks absolute stability, though limits direct price appreciation. Excellent for long-term safe lending backdrops!`;
    } else if (bluechipWeight > 45) {
      summaryText = `⚡ Staking Powerhouse: Large blue-chip L1 reserves (ETH/SOL) provide immediate consensus protection and capital security, guaranteeing high liquidity for external funds. Outstanding setup.`;
    } else {
      summaryText = `⚖️ Balanced Reserve Ledger: This configuration combines growth exposure and defensive staking variables. Highly attractive to strategic DeFi-yield seekers because it hedges volatile losses.`;
    }

    return { trustFactor, projectedTvlUsd, rating, colorClass, riskLabel, summaryText };
  }, [nativeWeight, bluechipWeight, stableWeight]);

  // Consensus Filter Selection States
  const [selectedProofFilter, setSelectedProofFilter] = useState<ProofType | "ALL">("ALL");
  const [selectedLayerFilter, setSelectedLayerFilter] = useState<LayerType | "ALL">("ALL");

  // Filtered Protocols List
  const filteredProtocols = useMemo(() => {
    return SYSTEM_PROTOCOLS.filter((p) => {
      const matchProof = selectedProofFilter === "ALL" || p.proofType === selectedProofFilter;
      const matchLayer = selectedLayerFilter === "ALL" || p.layerType === selectedLayerFilter;
      return matchProof && matchLayer;
    });
  }, [selectedProofFilter, selectedLayerFilter]);

  // Comparison Sandbox Selector states
  const [leftCompareId, setLeftCompareId] = useState<string>("ethereum");
  const [rightCompareId, setRightCompareId] = useState<string>("zksync");

  const leftCompareProto = useMemo(() => {
    return SYSTEM_PROTOCOLS.find((p) => p.id === leftCompareId) || SYSTEM_PROTOCOLS[0];
  }, [leftCompareId]);

  const rightCompareProto = useMemo(() => {
    return SYSTEM_PROTOCOLS.find((p) => p.id === rightCompareId) || SYSTEM_PROTOCOLS[2];
  }, [rightCompareId]);

  // General Proof Details Lookup
  const proofInfo = {
    PoW: {
      title: "Proof of Work (工作量证明)",
      energy: "Extreme (Tera-watt scale calculation loops)",
      speed: "Slow (Requires block confirmation intervals to solidify probability)",
      vectors: "51% Hashrate hijack, ASIC optimization cartels",
      factors: "Pure decentralization via physical thermal energy constraints"
    },
    PoS: {
      title: "Proof of Stake (权益证明)",
      energy: "Eco-Friendly (Near zero emission, server-driven)",
      speed: "Fast (1 to 12 secs typical finality window)",
      vectors: "Validator stake cartels, slashing loop errors",
      factors: "Capital efficiency, protocol native yield integration"
    },
    PoA: {
      title: "Proof of Authority (权威证明)",
      energy: "Negligible",
      speed: "Ultra-Fast (Millisecond finality)",
      vectors: "Consortium node collusions, single-point legal/regulatory targets",
      factors: "High throughput performance suited for enterprise and subnet rails"
    },
    PoST: {
      title: "Proof of Spacetime (时空证明 / 存储验证)",
      energy: "Low (Depends on hard drive disk spinning cycles)",
      speed: "Periodic (Calculated via epochs)",
      vectors: "Simulated hardware claims, storage data retention omissions",
      factors: "Direct correlation with global physical utility (file storage storage capacity)"
    },
    PoRep: {
      title: "Proof of Replication (复制证明)",
      energy: "Low",
      speed: "Verification-based",
      vectors: "Sybil storage identities",
      factors: "Verifies distinct physical copies exist across global nodes"
    }
  };

  // Operational deep dives states
  const [activeOperationalTab, setActiveOperationalTab] = useState<"staking" | "hashrate" | "lending">("staking");

  return (
    <div className="space-y-6" id="consensus-educational-suite">
      
      {/* SECTION 1: Interlocking Title Banner */}
      <div className="bg-slate-900 border border-slate-850 rounded-xl p-6 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-[90px] pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Boxes className="h-5 w-5 text-cyan-400" />
              <h2 className="text-base font-bold font-mono tracking-tight text-slate-100 uppercase">
                Consensus Proof & Staking Architecture Hub
              </h2>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Explore Layer classifications, Proof Types, and interactive configurations. Understand how small protocols deploy high-liquidity staking assets as security mechanisms to attract global investors.
            </p>
          </div>
          <div className="flex-shrink-0 flex items-center gap-1.5 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[10px] font-mono font-bold text-slate-300">SYSTEMS ANALYTICS ACTIVE</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

        {/* LEFT COLUMN: Main classification, filter controls, comparison sandbox */}
        <div className="xl:col-span-8 space-y-6">

          {/* TAB 1: Small Protocol Staking Trust-Building Booster */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4 relative overflow-hidden" id="small-protocol-staking-booster">
            <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-[60px] pointer-events-none"></div>
            
            <div className="flex items-center justify-between border-b border-slate-850 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-cyan-400" />
                <h3 className="text-sm font-bold font-mono text-slate-100 uppercase tracking-tight">
                  Staking Confidence & Reserve Optimizer (质押及储备增信模拟)
                </h3>
              </div>
              <span className="text-[8.5px] bg-cyan-950/80 text-cyan-400 border border-cyan-800/40 px-2 py-0.5 rounded font-mono font-bold">
                VOLATILITY SHIELD SYSTEM
              </span>
            </div>

            <p className="text-[11.5px] text-slate-400 leading-relaxed">
              <strong>Smaller Protocols</strong> often struggle with investor trust due to highly volatile self-issued native tokens. By configuring pools with high-grade external assets (like staked L1 native currencies or blue-chip stablecoins), they drastically raise reserve strength, mitigate cascading deaths, and secure high baseline credit ratings.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-2">
              
              {/* Sliders Form Control */}
              <div className="md:col-span-7 bg-slate-950 p-4 rounded-lg border border-slate-850 space-y-4">
                <div className="space-y-1">
                  <label className="text-[9.5px] font-bold font-mono text-slate-400 block uppercase">
                    Protocol Custom Name
                  </label>
                  <input
                    type="text"
                    value={smallProtoName}
                    onChange={(e) => setSmallProtoName(e.target.value.slice(0, 24))}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500 text-left"
                    placeholder="Enter project name..."
                  />
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-rose-400 font-bold">Native Token Weight (自家代币占比):</span>
                    <span className="font-extrabold text-rose-300">{nativeWeight}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="90"
                    value={nativeWeight}
                    onChange={(e) => handleNativeChange(parseInt(e.target.value))}
                    className="w-full accent-rose-500 cursor-pointer bg-slate-850 h-1.5 rounded-lg appearance-none"
                  />
                  <div className="text-[9px] text-slate-500 italic">
                    High native weights maximize internal levers but invite extreme cascading flight risk.
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-cyan-400 font-bold">Blue-Chip Staked Native (SOL / ETH) Weight:</span>
                    <span className="font-extrabold text-cyan-300">{bluechipWeight}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="80"
                    value={bluechipWeight}
                    onChange={(e) => handleBluechipChange(parseInt(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer bg-slate-850 h-1.5 rounded-lg appearance-none"
                  />
                  <div className="text-[9px] text-slate-500 italic">
                    Acquiring blue-chip staking reserves leverages absolute settlement trust from L1.
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-emerald-400 font-bold">Premium Stablecoin Reserves Weight:</span>
                    <span className="font-extrabold text-emerald-300">{stableWeight}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={stableWeight}
                    onChange={(e) => handleStableChange(parseInt(e.target.value))}
                    className="w-full accent-emerald-400 cursor-pointer bg-slate-850 h-1.5 rounded-lg appearance-none"
                  />
                  <div className="text-[9px] text-slate-500 italic">
                    Stablecoin deposits build a hard liquidity floor that dampens price drawdown stress.
                  </div>
                </div>
              </div>

              {/* Dynamic Credibility Diagnostics Scorecard */}
              <div className="md:col-span-5 bg-slate-950 p-4 rounded-lg border border-slate-850 flex flex-col justify-between">
                <div className="space-y-3">
                  <span className="text-[9.5px] font-mono text-slate-500 font-bold uppercase tracking-wider block">
                    SYNTHESIZED DIAGNOSTICS FOR: <span className="text-slate-350">{smallProtoName || "UNNAMED"}</span>
                  </span>
                  
                  <div className="flex items-center gap-2 justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono font-bold block">Assigned Credit Grade</span>
                      <span className={`text-2xl font-black font-mono px-2 py-0.5 rounded block text-center mt-1 border ${boosterMetrics.colorClass}`}>
                        {boosterMetrics.rating}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-mono font-bold block">Inflow Attraction Level</span>
                      <span className="text-xl font-bold font-mono text-cyan-400 block mt-1">
                        {boosterMetrics.trustFactor}%
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-slate-900 pt-2.5 space-y-1.5">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-slate-500">Volatilty Hazard Risk:</span>
                      <span className={`font-bold ${nativeWeight > 65 ? "text-rose-400" : "text-emerald-400"}`}>
                        {boosterMetrics.riskLabel}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-slate-500">Max Projected TVL Peak:</span>
                      <span className="text-slate-200 font-semibold">
                        ${boosterMetrics.projectedTvlUsd.toLocaleString()} USD
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-slate-900 rounded border border-slate-850">
                  <span className="text-[9px] text-amber-400 font-mono font-bold block mb-1">STAKING ADVISORY FEEDBACK:</span>
                  <p className="text-[10px] text-slate-300 font-sans leading-relaxed">
                    {boosterMetrics.summaryText}
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* TAB 2: Proof Type and Layer Group Filter & Directory */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4" id="proof-layer-matrix-directory">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-850 pb-3">
              <div className="flex items-center gap-2">
                <Compass className="h-4 w-4 text-cyan-400" />
                <h3 className="text-sm font-bold font-mono text-slate-100 uppercase tracking-tight">
                  Proof Types & Layer Group Interactive Explorer
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-500 font-bold">
                MATCHED ASSETS: {filteredProtocols.length} / {SYSTEM_PROTOCOLS.length}
              </span>
            </div>

            {/* Selection Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Proof Type Pills Selection */}
              <div className="space-y-2">
                <label className="text-[9.5px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Cpu className="h-3 w-3 text-cyan-500" /> Consensus Proof Filtering:
                </label>
                <div className="flex flex-wrap gap-1">
                  {(["ALL", "PoW", "PoS", "PoA", "PoST"] as const).map((proof) => (
                    <button
                      key={proof}
                      onClick={() => setSelectedProofFilter(proof)}
                      className={`text-[10px] font-mono font-bold px-2 py-1 rounded cursor-pointer border transition-all ${
                        selectedProofFilter === proof
                          ? "bg-cyan-500/10 text-cyan-400 border-cyan-500"
                          : "bg-slate-950 text-slate-400 border-slate-850 hover:border-slate-800"
                      }`}
                    >
                      {proof}
                    </button>
                  ))}
                </div>
              </div>

              {/* Layer Type Selection */}
              <div className="space-y-2">
                <label className="text-[9.5px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Layers className="h-3 w-3 text-cyan-500" /> Scaling Layer Filtering:
                </label>
                <div className="flex flex-wrap gap-1">
                  {(["ALL", "L1", "L2-Optimistic", "L2-ZK", "Sidechain"] as const).map((layer) => (
                    <button
                      key={layer}
                      onClick={() => setSelectedLayerFilter(layer)}
                      className={`text-[10px] font-mono font-bold px-2 py-1 rounded cursor-pointer border transition-all ${
                        selectedLayerFilter === layer
                          ? "bg-cyan-500/10 text-cyan-400 border-cyan-500"
                          : "bg-slate-950 text-slate-400 border-slate-850 hover:border-slate-800"
                      }`}
                    >
                      {layer}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Filtered Results Table Listing */}
            <div className="bg-slate-950 rounded-lg border border-slate-850 overflow-visible">
              <div className="overflow-x-auto overflow-y-visible">
                <table className="w-full text-left border-collapse text-xs font-mono">
                  <thead>
                    <tr className="bg-slate-900 border-b border-slate-850 text-[10px] text-slate-500 font-bold uppercase tracking-wider select-none">
                      <th className="py-2.5 px-3">Protocol / Code</th>
                      
                      {/* Proof Type Column Header with Tooltip */}
                      <th className="py-2.5 px-3 relative group cursor-help">
                        <span className="flex items-center gap-1 hover:text-cyan-400">
                          Proof Type <HelpCircle className="h-3 w-3 text-slate-600 group-hover:text-cyan-400" />
                        </span>
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-slate-950/98 backdrop-blur border border-slate-800 text-[10.5px] text-slate-300 rounded shadow-2xl z-50 text-left normal-case tracking-normal leading-relaxed whitespace-normal font-sans font-normal border-t-cyan-500 border-t-2">
                          <div className="text-cyan-400 font-bold font-mono border-b border-slate-900 pb-1 mb-1.5 uppercase">Consensus Proof Types</div>
                          The specific algorithm used to secure the transaction ledger and validate state transitions. This directly dictates finality speed, power consumption, and network decentralization.
                        </div>
                      </th>

                      {/* Layer Group Column Header with Tooltip */}
                      <th className="py-2.5 px-3 relative group cursor-help">
                        <span className="flex items-center gap-1 hover:text-cyan-400">
                          Layer Group <HelpCircle className="h-3 w-3 text-slate-600 group-hover:text-cyan-400" />
                        </span>
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-slate-950/98 backdrop-blur border border-slate-800 text-[10.5px] text-slate-300 rounded shadow-2xl z-50 text-left normal-case tracking-normal leading-relaxed whitespace-normal font-sans font-normal border-t-cyan-500 border-t-2">
                          <div className="text-cyan-400 font-bold font-mono border-b border-slate-900 pb-1 mb-1.5 uppercase">Layer Classifications</div>
                          Arranges blockchains by their architectural scale layer. **L1** covers complete native consensus bases, while **L2** covers off-chain scaling rollups that anchor security to their host L1.
                        </div>
                      </th>

                      <th className="py-2.5 px-3 text-right">Thro-TPS</th>
                      <th className="py-2.5 px-3 text-right">Gas-Save Factor</th>
                      <th className="py-2.5 px-3">Yield Staking</th>

                      {/* Status Index Column Header with Tooltip */}
                      <th className="py-2.5 px-3 text-center relative group cursor-help">
                        <span className="flex items-center justify-center gap-1 hover:text-cyan-400">
                          Status Index <HelpCircle className="h-3 w-3 text-slate-600 group-hover:text-cyan-400" />
                        </span>
                        <div className="absolute right-3 bottom-full mb-2 hidden group-hover:block w-72 p-3 bg-slate-950/98 backdrop-blur border border-slate-800 text-[10.5px] text-slate-300 rounded shadow-2xl z-50 text-left normal-case tracking-normal leading-relaxed whitespace-normal font-sans font-normal border-t-cyan-500 border-t-2">
                          <div className="text-cyan-400 font-bold font-mono border-b border-slate-900 pb-1 mb-1.5 uppercase">Security Status Rating Index</div>
                          An audit index tracking aggregate ledger security, decentralization safety coefficients, validator density, and historical exploit resilience:
                          <div className="mt-2 space-y-1 text-slate-400 font-mono text-[9px] leading-normal border-l border-slate-800 pl-2">
                            • <b className="text-cyan-400">AAA</b>: High-grade battle-tested decentralized security.<br />
                            • <b className="text-cyan-400">AA / AA-</b>: High trust levels with minor central sequencers.<br />
                            • <b className="text-cyan-400">A / A+ / A-</b>: standard enterprise-grade validators.
                          </div>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900">
                    {filteredProtocols.length > 0 ? (
                      filteredProtocols.map((p) => {
                        let layerLabel = "Layer 1 Core";
                        let layerColor = "text-slate-200 border-slate-800 bg-slate-900";
                        let layerTooltipDetail = "The primary foundational consensus chain (such as Bitcoin, Ethereum, or Solana) governing native security parameters.";
                        
                        if (p.layerType === "L2-Optimistic") {
                          layerLabel = "L2 Optimistic Rollup";
                          layerColor = "text-amber-400 border-amber-950 bg-amber-950/20";
                          layerTooltipDetail = "An L2 rollup processing transactions off-chain, assuming optimistic validation unless disputed via fraud proofs within a 7-day scale window.";
                        } else if (p.layerType === "L2-ZK") {
                          layerLabel = "L2 ZK Rollup (Math)";
                          layerColor = "text-cyan-400 border-cyan-950 bg-cyan-950/20";
                          layerTooltipDetail = "An L2 scaling engine leveraging advanced zero-knowledge math proofs (Validity proofs) to write compressed state transactions immediately on Ethereum.";
                        } else if (p.layerType === "Sidechain") {
                          layerLabel = "Sidechain Ledger";
                          layerColor = "text-purple-400 border-purple-950 bg-purple-950/20";
                          layerTooltipDetail = "An independent sovereign network with its own validator set that periodically aggregates state checkpoint updates back to the primary chain.";
                        }

                        // Determine proper Proof Type details
                        let proofFullName = "";
                        let proofDetailText = "";
                        if (p.proofType === "PoS") {
                          proofFullName = "Proof of Stake (权益证明)";
                          proofDetailText = "Validators deposit capital (native tokens) to buy proposal eligibility. Eco-friendly with immediate slots processing and protocol yield curves.";
                        } else if (p.proofType === "PoW") {
                          proofFullName = "Proof of Work (工作量证明)";
                          proofDetailText = "Hardware miners exhaust high electrical and GPU hash energy to solve dynamic cryptographic puzzles to earn block signature rights.";
                        } else if (p.proofType === "PoA") {
                          proofFullName = "Proof of Authority (权威证明 / Staked Authority)";
                          proofDetailText = "Leverages private pre-vetted nodes owned by authorized entities. Ultra fast throughput and cheap fees but relies on legal/governance trusts.";
                        } else if (p.proofType === "PoST") {
                          proofFullName = "Proof of Spacetime (时空与存储证明)";
                          proofDetailText = "Cryptographic mechanism proving that designated hardware has physically maintained a duplicate set of unique data files continuously.";
                        }

                        return (
                           <tr key={p.id} className="hover:bg-slate-900/60 transition-colors">
                            <td className="py-2.5 px-3">
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-100">{p.name}</span>
                                <span className="text-[9.5px] text-slate-500 font-bold text-left">{p.symbol} Token</span>
                              </div>
                            </td>
                            
                            {/* Interactive cell: Proof Type Tooltip */}
                            <td className="py-2.5 px-3 relative group">
                              <span className="bg-slate-900 hover:bg-slate-850 px-2.5 py-1 rounded text-[10px] font-mono font-bold border border-slate-800 text-slate-350 hover:border-cyan-500/50 hover:text-cyan-400 transition-all cursor-help select-none">
                                {p.proofType}
                              </span>
                              <div className="absolute left-1/4 bottom-full mb-1.5 hidden group-hover:block w-56 p-2.5 bg-slate-950 border border-slate-850 text-[10px] text-slate-300 rounded shadow-xl z-50 text-left whitespace-normal normal-case leading-relaxed font-sans font-normal">
                                <strong className="text-cyan-400 block font-mono text-[10px] mb-0.5">{proofFullName}</strong>
                                {proofDetailText}
                              </div>
                            </td>

                            {/* Interactive cell: Layer Group Tooltip */}
                            <td className="py-2.5 px-3 relative group">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold border inline-block ${layerColor} hover:border-cyan-500/50 transition-all cursor-help select-none`}>
                                {layerLabel}
                              </span>
                              <div className="absolute left-1/4 bottom-full mb-1.5 hidden group-hover:block w-56 p-2.5 bg-slate-950 border border-slate-850 text-[10px] text-slate-300 rounded shadow-xl z-50 text-left whitespace-normal normal-case leading-relaxed font-sans font-normal">
                                <strong className="text-cyan-400 block font-mono text-[10px] mb-0.5">{p.layerType} Classification</strong>
                                {layerTooltipDetail}
                              </div>
                            </td>

                            <td className="py-2.5 px-3 text-right font-black text-slate-200">
                              {p.throughputTps.toLocaleString()} TPS
                            </td>
                            <td className="py-2.5 px-3 text-right text-slate-400">
                              {p.gasSavingFactor}
                            </td>
                            <td className="py-2.5 px-3 text-emerald-400 font-bold">
                              {p.nativeStakingYield > 0 ? `${p.nativeStakingYield}% APR` : "No APY"}
                            </td>

                            {/* Interactive cell: Status Index Rating Tooltip */}
                            <td className="py-2.5 px-3 text-center relative group">
                              <span className="font-mono font-bold text-cyan-450 bg-cyan-950/20 px-2 py-0.5 rounded border border-cyan-800/40 text-[9.5px] hover:border-cyan-400 hover:text-cyan-300 transition-all cursor-help select-none">
                                {p.securityRating}
                              </span>
                              <div className="absolute right-1/4 bottom-full mb-1.5 hidden group-hover:block w-64 p-2.5 bg-slate-950 border border-slate-850 text-[10px] text-slate-300 rounded shadow-xl z-50 text-left whitespace-normal normal-case leading-relaxed font-sans font-normal">
                                <strong className="text-cyan-400 block font-mono text-[10px] mb-0.5">Rating Score: {p.securityRating}</strong>
                                Assigned based on active validator decentralization metrics, mathematical proofs correctness, continuous uptime logs, and secure TVL.
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} className="text-center py-6 text-slate-500 font-mono uppercase italic text-[11px]">
                          No protocols matching these specific constraints. Reset filter parameters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Static Explainer matching filter parameter */}
            {selectedProofFilter !== "ALL" && (
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 space-y-1.5 font-mono text-[10px]">
                <div className="text-cyan-400 font-bold uppercase tracking-wide flex items-center gap-1 text-[11px]">
                  <Activity className="h-3 w-3" /> Core Mechanism Study: {proofInfo[selectedProofFilter].title}
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10.5px] pt-1 border-t border-slate-900/60">
                  <div>
                    <span className="text-slate-500 block font-bold">THERMAL / CPU ENERGY EXPENDITURE:</span>
                    <span className="text-slate-300 block">{proofInfo[selectedProofFilter].energy}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-bold">DETERMINISTIC FINALITY TIME:</span>
                    <span className="text-slate-300 block">{proofInfo[selectedProofFilter].speed}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500 block font-bold">PRIMARY EXPOSURE VECTORS:</span>
                    <span className="text-rose-400 block">{proofInfo[selectedProofFilter].vectors}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* TAB 3: Cross-Comparison Sandbox Slider Matrix */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4" id="cross-compare-matrix-suite">
            <div className="flex items-center justify-between border-b border-slate-850 pb-3">
              <div className="flex items-center gap-2">
                <Scale className="h-4 w-4 text-cyan-400" />
                <h3 className="text-sm font-bold font-mono text-slate-100 uppercase tracking-tight">
                  Multi-Dimensional Proof & Layer Comparison Sandbox
                </h3>
              </div>
              <span className="text-[9px] bg-emerald-950 text-emerald-400 font-bold border border-emerald-900 px-2 py-0.5 rounded font-mono">
                CROSS PARAMETERS ANALYSIS
              </span>
            </div>

            <p className="text-[11.5px] text-slate-400 leading-relaxed">
              Dynamically select any two protocols to run side-by-side contrast metrics. Identical traits are spotlighted in <span className="text-emerald-400 font-bold">Green Matches</span>, and distinct differences are flagged in <span className="text-amber-400 font-bold">Contrast orange</span>.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 font-mono">
                <span className="text-[10px] text-slate-500 block uppercase font-bold">SYSTEM LEAF (PROTOCOL A)</span>
                <select
                  value={leftCompareId}
                  onChange={(e) => setLeftCompareId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  {SYSTEM_PROTOCOLS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.symbol})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5 font-mono">
                <span className="text-[10px] text-slate-500 block uppercase font-bold">SYSTEM RIG (PROTOCOL B)</span>
                <select
                  value={rightCompareId}
                  onChange={(e) => setRightCompareId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  {SYSTEM_PROTOCOLS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.symbol})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sandbox Contrast Table Grid */}
            <div className="bg-slate-950 rounded-lg border border-slate-850 overflow-hidden font-mono text-xs">
              <div className="grid grid-cols-3 bg-slate-900 border-b border-slate-850 p-2.5 font-bold text-[10.5px] text-slate-400 text-center uppercase tracking-wider">
                <div className="text-left select-none">Consensus Spec</div>
                <div className="text-cyan-400 font-black">{leftCompareProto.name}</div>
                <div className="text-amber-400 font-black">{rightCompareProto.name}</div>
              </div>

              <div className="divide-y divide-slate-900/60 leading-relaxed">
                
                {/* Metric 1: Layer */}
                <div className="grid grid-cols-3 p-3 items-center text-center">
                  <div className="text-slate-500 text-left font-bold uppercase text-[10.5px]">Chain Layer Layer</div>
                  <div className={leftCompareProto.layerType === rightCompareProto.layerType ? "text-emerald-400 font-bold" : "text-amber-300"}>
                    {leftCompareProto.layerType}
                  </div>
                  <div className={leftCompareProto.layerType === rightCompareProto.layerType ? "text-emerald-400 font-bold" : "text-amber-300"}>
                    {rightCompareProto.layerType}
                  </div>
                </div>

                {/* Metric 2: Proof Type */}
                <div className="grid grid-cols-3 p-3 items-center text-center">
                  <div className="text-slate-500 text-left font-bold uppercase text-[10.5px]">Consensus Proof</div>
                  <div className={leftCompareProto.proofType === rightCompareProto.proofType ? "text-emerald-400 font-bold" : "text-slate-200"}>
                    {leftCompareProto.proofType}
                  </div>
                  <div className={leftCompareProto.proofType === rightCompareProto.proofType ? "text-emerald-400 font-bold" : "text-slate-200"}>
                    {rightCompareProto.proofType}
                  </div>
                </div>

                {/* Metric 3: Target TPS */}
                <div className="grid grid-cols-3 p-3 items-center text-center">
                  <div className="text-slate-500 text-left font-bold uppercase text-[10.5px]">Throughput Max</div>
                  <div className={leftCompareProto.throughputTps > rightCompareProto.throughputTps ? "text-cyan-400 font-extrabold" : "text-slate-350"}>
                    {leftCompareProto.throughputTps} TPS
                  </div>
                  <div className={rightCompareProto.throughputTps > leftCompareProto.throughputTps ? "text-cyan-400 font-extrabold" : "text-slate-350"}>
                    {rightCompareProto.throughputTps} TPS
                  </div>
                </div>

                {/* Metric 4: Challenge Period */}
                <div className="grid grid-cols-3 p-3 items-center text-center">
                  <div className="text-slate-500 text-left font-bold uppercase text-[10.5px]">Challenge Window</div>
                  <div className={leftCompareProto.challengeWindow === rightCompareProto.challengeWindow ? "text-emerald-400 font-bold" : "text-slate-200"}>
                    {leftCompareProto.challengeWindow}
                  </div>
                  <div className={leftCompareProto.challengeWindow === rightCompareProto.challengeWindow ? "text-emerald-400 font-bold" : "text-slate-200"}>
                    {rightCompareProto.challengeWindow}
                  </div>
                </div>

                {/* Metric 5: APY Staking Yield */}
                <div className="grid grid-cols-3 p-3 items-center text-center">
                  <div className="text-slate-500 text-left font-bold uppercase text-[10.5px]">Securing Staking APY</div>
                  <div className="text-emerald-400 font-bold">
                    {leftCompareProto.nativeStakingYield > 0 ? `${leftCompareProto.nativeStakingYield}%` : "0% (Gov Only)"}
                  </div>
                  <div className="text-emerald-400 font-bold">
                    {rightCompareProto.nativeStakingYield > 0 ? `${rightCompareProto.nativeStakingYield}%` : "0% (Gov Only)"}
                  </div>
                </div>

                {/* Metric 6: Security Index */}
                <div className="grid grid-cols-3 p-3 items-center text-center">
                  <div className="text-slate-500 text-left font-bold uppercase text-[10.5px]">Security Rating</div>
                  <div className="text-cyan-400 font-black bg-cyan-950/20 px-1 py-0.5 rounded inline-block max-w-[80px] mx-auto border border-cyan-800/40">
                    {leftCompareProto.securityRating}
                  </div>
                  <div className="text-cyan-400 font-black bg-cyan-950/20 px-1 py-0.5 rounded inline-block max-w-[80px] mx-auto border border-cyan-800/40">
                    {rightCompareProto.securityRating}
                  </div>
                </div>

              </div>
            </div>

            {/* Sandbox Assessment Footnote */}
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 font-mono text-[10px] leading-relaxed space-y-1">
              <span className="text-slate-500 font-bold block uppercase">COMPARATIVE EVALUATION:</span>
              <p className="text-slate-300">
                {leftCompareProto_rightCompareProto_evaluate(leftCompareProto, rightCompareProto)}
              </p>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Interactive fold-down educational Accordion Drawer and Deep dives */}
        <div className="xl:col-span-4 space-y-6">

          {/* TAB 4: Educational Accordions Drawer (科普折页) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4" id="educational-accordions-drawer">
            <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
              <HelpCircle className="h-4 w-4 text-cyan-400" />
              <h3 className="text-sm font-bold font-mono text-slate-100 uppercase" title="Click drawer headers to expand / collapse details">
                DeFi Tech Glossary Accordions (科普折页)
              </h3>
            </div>

            <p className="text-[11.5px] text-slate-400 leading-relaxed font-sans">
              Decentralized infrastructure relies on several native technical engines. Expand any of the index cards below to lookup high-fidelity educational tutorials.
            </p>

            <div className="space-y-2">

              {/* Accordion 1: Staking */}
              <div className="border border-slate-850 rounded-lg overflow-hidden bg-slate-950">
                <button
                  onClick={() => toggleAccordion("staking")}
                  className="w-full flex items-center justify-between p-3 font-mono text-left font-bold text-[11px] text-slate-200 hover:bg-slate-900 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2 text-cyan-400 uppercase">
                    <Coins className="h-3.5 w-3.5" /> 1. What is Staking? (质押加密机制)
                  </span>
                  {openAccordion["staking"] ? <ChevronUp className="h-3.5 w-3.5 text-slate-500" /> : <ChevronDown className="h-3.5 w-3.5 text-slate-505" />}
                </button>
                {openAccordion["staking"] && (
                  <div className="p-3 pt-0 border-t border-slate-900/60 font-sans text-[10.5px] text-slate-400 leading-relaxed space-y-2">
                    <p>
                      <strong>Staking</strong> is the process of locking up crypto assets (e.g., L1 native tokens like ETH, SOL, or DOT) to support a Proof-of-Stake consensus ledger. Stakers trust their funds to validators who process transactions and sign blocks.
                    </p>
                    <p className="border-l-2 border-cyan-500/40 pl-2 bg-cyan-950/5 p-1.5 font-mono text-[9.5px]">
                      • <strong>Validators</strong> secure rewards in exchange for server operations.<br />
                      • <strong>Slashing</strong> acts as a physical penalty, burning staked value if validators commit double-sign faults.
                    </p>
                  </div>
                )}
              </div>

              {/* Accordion 2: Burn Mechanisms */}
              <div className="border border-slate-850 rounded-lg overflow-hidden bg-slate-950">
                <button
                  onClick={() => toggleAccordion("burn")}
                  className="w-full flex items-center justify-between p-3 font-mono text-left font-bold text-[11px] text-slate-200 hover:bg-slate-900 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2 text-rose-400 uppercase">
                    <Flame className="h-3.5 w-3.5" /> 2. Burn Mechanics (区块链代币销毁)
                  </span>
                  {openAccordion["burn"] ? <ChevronUp className="h-3.5 w-3.5 text-slate-505" /> : <ChevronDown className="h-3.5 w-3.5 text-slate-505" />}
                </button>
                {openAccordion["burn"] && (
                  <div className="p-3 pt-0 border-t border-slate-900/60 font-sans text-[10.5px] text-slate-400 leading-relaxed space-y-2">
                    <p>
                      The <strong>Burn Mechanism</strong> entails removing assets permanently from circulation by sending them to an irreversible, un-spendable "burn address" (e.g., <code>0x000...000</code>).
                    </p>
                    <p>
                      On Ethereum (EIP-1559), a portion of every transaction's gas fee (the "Base Fee") is automatically burnt. When transaction volumes spike, the burning rate exceeds validator block rewards inflation, rendering the native token effectively <strong>deflationary</strong>.
                    </p>
                  </div>
                )}
              </div>

              {/* Accordion 3: Gas Fees & Gas Pricing */}
              <div className="border border-slate-850 rounded-lg overflow-hidden bg-slate-950">
                <button
                  onClick={() => toggleAccordion("gas")}
                  className="w-full flex items-center justify-between p-3 font-mono text-left font-bold text-[11px] text-slate-200 hover:bg-slate-900 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2 text-amber-400 uppercase">
                    <Zap className="h-3.5 w-3.5" /> 3. Understanding Gas & Priority Markets
                  </span>
                  {openAccordion["gas"] ? <ChevronUp className="h-3.5 w-3.5 text-slate-505" /> : <ChevronDown className="h-3.5 w-3.5 text-slate-505" />}
                </button>
                {openAccordion["gas"] && (
                  <div className="p-3 pt-0 border-t border-slate-900/60 font-sans text-[10.5px] text-slate-400 leading-relaxed space-y-1.5">
                    <p>
                      <strong>Gas</strong> is the unit measuring computational work inside EVM platforms:
                    </p>
                    <div className="bg-slate-900 p-2 rounded border border-slate-850 font-mono text-[9.5px] text-slate-300 space-y-1 leading-normal">
                      <div>• <strong>Gas Limit:</strong> Absolute maximum computing steps allowed for your transaction.</div>
                      <div>• <strong>Base Fee:</strong> Required baseline charge. Melted/burned during execution.</div>
                      <div>• <strong>Priority Tip:</strong> Free incentive tip paid to blocks builder to bypass queue priority.</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Accordion 4: Proof Typologies */}
              <div className="border border-slate-850 rounded-lg overflow-hidden bg-slate-950">
                <button
                  onClick={() => toggleAccordion("proof")}
                  className="w-full flex items-center justify-between p-3 font-mono text-left font-bold text-[11px] text-slate-200 hover:bg-slate-900 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2 text-purple-400 uppercase">
                    <ShieldCheck className="h-3.5 w-3.5" /> 4. Proof of Work/Stake/Authority/ST
                  </span>
                  {openAccordion["proof"] ? <ChevronUp className="h-3.5 w-3.5 text-slate-505" /> : <ChevronDown className="h-3.5 w-3.5 text-slate-505" />}
                </button>
                {openAccordion["proof"] && (
                  <div className="p-3 pt-0 border-t border-slate-900/60 font-sans text-[10.5px] text-slate-400 leading-relaxed space-y-2">
                    <p>
                      Consensus keeps distributed ledgers in sync:
                    </p>
                    <ul className="list-disc pl-4 space-y-1 text-slate-400">
                      <li><strong>PoW:</strong> Mines blocks via physical electricity/GPU (Bitcoin). Decent, high footprint.</li>
                      <li><strong>PoS:</strong> Validates blocks via staked funds (Ethereum, SOL). Safe and green.</li>
                      <li><strong>PoA:</strong> Validators are selected trusted parties. Highly performant but centralized.</li>
                      <li><strong>PoST / PoRep:</strong> Proves distinct data storage files are maintained across physical drives sequentially.</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Accordion 5: Rollups & L2 Scaling */}
              <div className="border border-slate-850 rounded-lg overflow-hidden bg-slate-950">
                <button
                  onClick={() => toggleAccordion("rollups")}
                  className="w-full flex items-center justify-between p-3 font-mono text-left font-bold text-[11px] text-slate-200 hover:bg-slate-900 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2 text-indigo-400 uppercase">
                    <Layers className="h-3.5 w-3.5" /> 5. Optimistic vs Zero-Knowledge Rollups
                  </span>
                  {openAccordion["rollups"] ? <ChevronUp className="h-3.5 w-3.5 text-slate-505" /> : <ChevronDown className="h-3.5 w-3.5 text-slate-505" />}
                </button>
                {openAccordion["rollups"] && (
                  <div className="p-3 pt-0 border-t border-slate-900/60 font-sans text-[10.5px] text-slate-400 leading-relaxed space-y-2">
                    <p>
                      <strong>Rollups</strong> run transactions off-chain, compressing thousands of records into one metadata batch to write back on Ethereum L1.
                    </p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li><strong>Optimistic Rollup:</strong> Pre-assumes all txs are valid. Provides a 7-day fraud-challenger window where anyone can submit fraud proofs if sequences are malicious.</li>
                      <li><strong>ZK-Rollup:</strong> Uses mathematical cryptography (zk-SNARK/STARK validity proofs) to instantly guarantee all computed data batches matches L1 state immediately. No security delay.</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Accordion 6: Finality */}
              <div className="border border-slate-850 rounded-lg overflow-hidden bg-slate-950">
                <button
                  onClick={() => toggleAccordion("finality")}
                  className="w-full flex items-center justify-between p-3 font-mono text-left font-bold text-[11px] text-slate-200 hover:bg-slate-900 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2 text-emerald-400 uppercase">
                    <Activity className="h-3.5 w-3.5" /> 6. Block Ledger settlement Finality
                  </span>
                  {openAccordion["finality"] ? <ChevronUp className="h-3.5 w-3.5 text-slate-500" /> : <ChevronDown className="h-3.5 w-3.5 text-slate-500" />}
                </button>
                {openAccordion["finality"] && (
                  <div className="p-3 pt-0 border-t border-slate-900/60 font-sans text-[10.5px] text-slate-400 leading-relaxed space-y-2">
                    <p>
                      <strong>Transaction Finality</strong> is the moment block history cannot be altered or reverted under any physical circumstances.
                    </p>
                    <p>
                      • <strong>Probabilistic:</strong> Bitcoin/Kaspa/PoW blocks gain security exponentially as more blocks build on top, but physical rollbacks are mathematically possible in single digit blocks.<br />
                      • <strong>Instant (Single Slot):</strong> Advanced PoS systems finalize states absolute in seconds.
                    </p>
                  </div>
                )}
              </div>

              {/* Accordion 7: Liquid Staking & Restaking (流动性质押与再质押) */}
              <div className="border border-slate-850 rounded-lg overflow-hidden bg-slate-950">
                <button
                  onClick={() => toggleAccordion("lsd")}
                  className="w-full flex items-center justify-between p-3 font-mono text-left font-bold text-[11px] text-slate-200 hover:bg-slate-900 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2 text-cyan-400 uppercase">
                    <RefreshCw className="h-3.5 w-3.5" /> 7. Liquid Staking & Restaking (流动性质押与再质押)
                  </span>
                  {openAccordion["lsd"] ? <ChevronUp className="h-3.5 w-3.5 text-slate-500" /> : <ChevronDown className="h-3.5 w-3.5 text-slate-500" />}
                </button>
                {openAccordion["lsd"] && (
                  <div className="p-3 pt-0 border-t border-slate-900/60 font-sans text-[10.5px] text-slate-400 leading-relaxed space-y-2">
                    <p>
                      <strong>Liquid Staking (LSD)</strong> releases locked capital by issuing derivative tokens (e.g., stETH, mSOL) representing your staked underlying asset. You obtain the baseline network staking yield while keeping the capability to trade, borrow, or provision liquidity across other DeFi dApps.
                    </p>
                    <p>
                      <strong>Restaking (e.g., EigenLayer, Symbiotic)</strong> allows validators and stakers to reuse their staked assets or liquid staking tokens (LSTs) to secure external modules (like Oracles, bridges, sidechains, or data availability services - called <strong>AVS (Active Validated Services)</strong>) in exchange for compounding yield streams, raising capital execution efficiency at the risk of multi-layer <strong>slashing penalties</strong>.
                    </p>
                  </div>
                )}
              </div>

              {/* Accordion 8: MEV & PBS (最大可提取价值与区块构建) */}
              <div className="border border-slate-850 rounded-lg overflow-hidden bg-slate-950">
                <button
                  onClick={() => toggleAccordion("mev")}
                  className="w-full flex items-center justify-between p-3 font-mono text-left font-bold text-[11px] text-slate-200 hover:bg-slate-900 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2 text-rose-400 uppercase">
                    <Cpu className="h-3.5 w-3.5" /> 8. MEV & Block Building Mechanics (最大可提取价值)
                  </span>
                  {openAccordion["mev"] ? <ChevronUp className="h-3.5 w-3.5 text-slate-500" /> : <ChevronDown className="h-3.5 w-3.5 text-slate-500" />}
                </button>
                {openAccordion["mev"] && (
                  <div className="p-3 pt-0 border-t border-slate-900/60 font-sans text-[10.5px] text-slate-400 leading-relaxed space-y-2">
                    <p>
                      <strong>Maximal Extractable Value (MEV)</strong> is the maximum value that block producers (validators or miners) can extract by reordering, introducing, or canceling user transactions within block templates (e.g., frontrunning, arbitrage, sandwich attacks, and liquidations).
                    </p>
                    <p>
                      Modern blockchains mitigate centralizing MEV capture via <strong>PBS (Proposer-Builder Separation / 提议者与构建者分离)</strong>:
                    </p>
                    <p className="border-l-2 border-rose-500/40 pl-2 bg-rose-950/5 p-1.5 font-mono text-[9.5px]">
                      • <strong>Builders:</strong> Highly optimized operators who compile/order lucrative blocks.<br />
                      • <strong>Proposers:</strong> Standard validators who select and sign the highest-bidding header bundle blindly, spreading block rewards democratic-style to all stakers.
                    </p>
                  </div>
                )}
              </div>

              {/* Accordion 9: AMM & Impermanent Loss (无常损失与自动做市商) */}
              <div className="border border-slate-850 rounded-lg overflow-hidden bg-slate-950">
                <button
                  onClick={() => toggleAccordion("impermanent")}
                  className="w-full flex items-center justify-between p-3 font-mono text-left font-bold text-[11px] text-slate-200 hover:bg-slate-900 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2 text-amber-400 uppercase">
                    <Scale className="h-3.5 w-3.5" /> 9. Impermanent Loss & AMM Formulas (无常损失机制)
                  </span>
                  {openAccordion["impermanent"] ? <ChevronUp className="h-3.5 w-3.5 text-slate-500" /> : <ChevronDown className="h-3.5 w-3.5 text-slate-500" />}
                </button>
                {openAccordion["impermanent"] && (
                  <div className="p-3 pt-0 border-t border-slate-900/60 font-sans text-[10.5px] text-slate-400 leading-relaxed space-y-2">
                    <p>
                      In Constant Product AMMs (like Uniswap v2, formulated as <code>x × y = k</code>), liquidity providers (LPs) supply equivalent dual assets. <strong>Impermanent Loss (IL)</strong> represents the temporary value difference between holding these assets individually in a wallet versus supplying them to a pool during volatile market swings.
                    </p>
                    <p>
                      When external spot prices move, arbitrageurs drain the pool of the outperforming asset to capture pricing discrepancies, leaving LPs with more of the cheaper/depreciating asset. 
                    </p>
                    <p className="border-l-2 border-amber-500/40 pl-2 bg-amber-950/5 p-1.5 font-mono text-[9.5px]">
                      💡 <strong>Note:</strong> The loss remains "unrealized" (impermanent) until the assets are harvested. High transaction fee earnings can outpace IL, leading to net profitable strategies under sideways trading conditions.
                    </p>
                  </div>
                )}
              </div>

              {/* Accordion 10: Cross-Chain Bridges & message Passing (跨链桥安全与状态验证) */}
              <div className="border border-slate-850 rounded-lg overflow-hidden bg-slate-950">
                <button
                  onClick={() => toggleAccordion("bridges")}
                  className="w-full flex items-center justify-between p-3 font-mono text-left font-bold text-[11px] text-slate-200 hover:bg-slate-900 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2 text-indigo-400 uppercase">
                    <Compass className="h-3.5 w-3.5" /> 10. Cross-Chain Security Models (跨链安全架构)
                  </span>
                  {openAccordion["bridges"] ? <ChevronUp className="h-3.5 w-3.5 text-slate-500" /> : <ChevronDown className="h-3.5 w-3.5 text-slate-500" />}
                </button>
                {openAccordion["bridges"] && (
                  <div className="p-3 pt-0 border-t border-slate-900/60 font-sans text-[10.5px] text-slate-400 leading-relaxed space-y-2">
                    <p>
                      Cross-chain communication allows value and smart contracts state calls to execute across isolated consensus ledgers. They use three major design philosophies:
                    </p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li><strong>Lock-and-Mint (Bridges):</strong> Assets are locked on Chain A, triggering the minting of matching wrapped assets (e.g., wETH on Solana) on Chain B. High concentration targets make this mechanism the most common vector for mega-exploits.</li>
                      <li><strong>Liquidity Networks:</strong> Relies on local balances populated on both chains, allowing direct peer-to-peer pools-swapping of native assets. No synthetic assets are minted.</li>
                      <li><strong>Canonical L2 Gateways:</strong> Rollup-native bridges that use mathematical proofs (fraud proofs or ZK validity proofs) tied directly to Ethereum L1 consensus, offering maximum decentralization and security.</li>
                    </ul>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* TAB 5: Deep Operational Breakdown (Staking / Hasrate / Lending Tracks) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4" id="deep-op-breakdowns">
            <div className="border-b border-slate-850 pb-3 flex flex-col gap-1.5">
              <span className="text-[10px] text-cyan-400 font-mono tracking-wider font-extrabold uppercase">DEEP OPERATIONAL ROADMAPS</span>
              <h3 className="text-sm font-bold font-mono text-slate-100 uppercase tracking-tight">
                Consensus & Financial Pipelines Decoded
              </h3>
            </div>

            {/* Toggle buttons */}
            <div className="grid grid-cols-3 bg-slate-950 p-1 rounded-lg border border-slate-850 text-center font-mono text-[10px] font-bold">
              <button
                onClick={() => setActiveOperationalTab("staking")}
                className={`py-1 rounded font-bold cursor-pointer transition-colors ${
                  activeOperationalTab === "staking" ? "bg-cyan-500/10 text-cyan-400" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                STAKING
              </button>
              <button
                onClick={() => setActiveOperationalTab("hashrate")}
                className={`py-1 rounded font-bold cursor-pointer transition-colors ${
                  activeOperationalTab === "hashrate" ? "bg-amber-500/10 text-amber-400" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                HASHRATE
              </button>
              <button
                onClick={() => setActiveOperationalTab("lending")}
                className={`py-1 rounded font-bold cursor-pointer transition-colors ${
                  activeOperationalTab === "lending" ? "bg-emerald-500/10 text-emerald-400" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                LENDING
              </button>
            </div>

            {/* Tab contents */}
            <AnimatePresence mode="wait">
              {activeOperationalTab === "staking" && (
                <motion.div
                  key="opt-staking"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-3 font-mono text-xs"
                >
                  <div className="bg-slate-950 p-3 rounded border border-slate-850 space-y-2">
                    <span className="text-[10.5px] text-cyan-400 font-bold block border-b border-slate-900 pb-1">
                      🛡️ Delegated PoS Mechanics & Validator Slashes
                    </span>
                    <p className="text-[10.5px] text-slate-400 leading-relaxed font-sans">
                      DPoS allows token holders to delegate staking weights to active validator nodes instead of operating complex server hardware themselves. Validators secure block production, passing yields back to delegators after taking a node operating fee.
                    </p>
                    <div className="border-l border-cyan-800/40 pl-2 text-[10px] space-y-1 text-slate-350">
                      <div>• <strong>Incentive Loop:</strong> APR comes from token inflation + collected transaction priority fees.</div>
                      <div>• <strong>Risk Exposure:</strong> If a validator goes offline (Inactivity Leak) or double-signs blocks, delegate funds are partially burned.</div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeOperationalTab === "hashrate" && (
                <motion.div
                  key="opt-hashrate"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-3 font-mono text-xs"
                >
                  <div className="bg-slate-950 p-3 rounded border border-slate-850 space-y-2">
                    <span className="text-[10.5px] text-amber-400 font-bold block border-b border-slate-900 pb-1">
                      ⛏️ Hashrate Pools, Halvings & Hard Space Proofs
                    </span>
                    <p className="text-[10.5px] text-slate-400 leading-relaxed font-sans">
                      Physical miners form massive mining pools to consolidate computing power and smooth out payouts. In storage consensus models (PoST), miners dedicate physical hard drive gigabytes, continuously hashing sector challenges to verify mathematical replication (PoRep).
                    </p>
                    <div className="border-l border-amber-800/40 pl-2 text-[10px] space-y-1 text-slate-350">
                      <div>• <strong>Difficulty Targets:</strong> Adjust automatically to retain block intervals relative to computational forces.</div>
                      <div>• <strong>Halving Timelines:</strong> Absolute schedule controls inflation, reducing miner rewards by 50% periodically.</div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeOperationalTab === "lending" && (
                <motion.div
                  key="opt-lending"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-3 font-mono text-xs"
                >
                  <div className="bg-slate-950 p-3 rounded border border-slate-850 space-y-2">
                    <span className="text-[10.5px] text-emerald-400 font-bold block border-b border-slate-900 pb-1">
                      🏦 Over-Collateralization, CDPs & Liquidators
                    </span>
                    <p className="text-[10.5px] text-slate-400 leading-relaxed font-sans">
                      Lenders yield income by supplying assets to decentralized credit pools. Borrowers lock up more collateral (Col. Factor &gt; 120%) than the value they borrow, keeping the overall pool solvent under extreme market price conditions.
                    </p>
                    <div className="border-l border-emerald-800/40 pl-2 text-[10px] space-y-1 text-slate-350">
                      <div>• <strong>Health Factor Index:</strong> If this index falls below 1.0, third-party liquidators buy out position debts for a discount bonus.</div>
                      <div>• <strong>Risk Factors:</strong> Block storage lag can delay liquidation orders, leaving protocol pools with bad debt.</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>

    </div>
  );
};

// Evaluator helper
function leftCompareProto_rightCompareProto_evaluate(pA: ProtocolConsensusMeta, pB: ProtocolConsensusMeta): string {
  if (pA.id === pB.id) {
    return `Comparison matches the exact same protocol system (${pA.name}). Select another system to inspect network contrast metrics or consensus proof adjustments.`;
  }

  const layersMatch = pA.layerType === pB.layerType;
  const proofsMatch = pA.proofType === pB.proofType;

  let txt = `Analytical Report: Comparing the structural topology of ${pA.name} and ${pB.name}. `;
  
  if (layersMatch && proofsMatch) {
    txt += `Both ledger chains operate identically as ${pA.layerType} networks governed directly under ${pA.proofType} consensus mechanisms. Their primary distinction lies in native block speed indexes and local transaction costs parameters.`;
  } else if (layersMatch && !proofsMatch) {
    txt += `Both operate on the same hierarchy layer (${pA.layerType}), but differ sharply in validation proofs: ${pA.name} utilizes ${pA.proofType} while ${pB.name} relies on ${pB.proofType}. This causes direct variation in power footprints and finality.`;
  } else if (!layersMatch && proofsMatch) {
    txt += `Both share the ${pA.proofType} consensus method, but exist on different layers. ${pA.name} is a base ${pA.layerType} chain, whereas ${pB.name} scaling derives its final state on top via ${pB.layerType}.`;
  } else {
    txt += `These architectures are entirely distinct. ${pA.name} is a ${pA.proofType} system on ${pA.layerType}, while ${pB.name} runs as a ${pB.proofType} system on ${pB.layerType}. They represent contrasting schools of decentralized design: monolithic base-layer optimization vs. modular scalability rollups.`;
  }

  return txt;
}
