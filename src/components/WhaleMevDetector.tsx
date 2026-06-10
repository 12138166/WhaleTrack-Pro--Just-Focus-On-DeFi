import React, { useState, useMemo, useEffect } from "react";
import { CURATED_WHALES } from "../data";
import { WhaleWallet } from "../types";
import {
  Shield,
  Activity,
  Cpu,
  TrendingUp,
  X,
  Search,
  AlertTriangle,
  Play,
  RotateCcw,
  Zap,
  CheckCircle2,
  Lock,
  Unlock,
  Sliders,
  DollarSign,
  Layers,
  ArrowRight,
  Download
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
  BarChart,
  Bar,
  LineChart,
  Line
} from "recharts";

interface WhaleMevDetectorProps {
  globalTimeHorizon?: { startDate: string; endDate: string };
}

export const WhaleMevDetector: React.FC<WhaleMevDetectorProps> = ({ globalTimeHorizon }) => {
  // Selected network and address
  const [selectedNetwork, setSelectedNetwork] = useState<WhaleWallet["network"] | "All">("All");
  const [selectedWhaleAddress, setSelectedWhaleAddress] = useState<string>("0x28C6c06298d514Db089934071355E5743bf21d60");
  const [customInputAddr, setCustomInputAddr] = useState<string>("");
  const [customSearchError, setCustomSearchError] = useState<string | null>(null);

  // Mitigation toggle settings
  const [hasPrivateRpc, setHasPrivateRpc] = useState<boolean>(false);
  const [hasSlippageCap, setHasSlippageCap] = useState<boolean>(false);
  const [enforceCoW, setEnforceCoW] = useState<boolean>(false);

  // Priority fee simulator settings
  const [arbitrageProfitUsd, setArbitrageProfitUsd] = useState<number>(350);
  const [baseGasGwei, setBaseGasGwei] = useState<number>(45);
  const [aggressionLevel, setAggressionLevel] = useState<number>(2.5);

  // Selected audit transaction details modal state
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);
  const [auditedTx, setAuditedTx] = useState<any | null>(null);

  // Strategy checkboxes filters state
  const [selectedStrategies, setSelectedStrategies] = useState<string[]>([
    "Sandwich Attack",
    "Arbitrage",
    "Frontrunning",
    "Liquidation"
  ]);

  // Analytics Overview state variables
  const [analyticsFilterNetwork, setAnalyticsFilterNetwork] = useState<WhaleWallet["network"] | "All">("All");
  const [analyticsFilterMetric, setAnalyticsFilterMetric] = useState<"totalMev" | "sandwich" | "arbitrage" | "liquidation">("totalMev");

  // Extract relevant whales from CURATED_WHALES
  const filterableWhales = useMemo(() => {
    return CURATED_WHALES.filter(w => {
      if (selectedNetwork === "All") {
        return true;
      }
      return w.network === selectedNetwork;
    });
  }, [selectedNetwork]);

  // Keep chosen whale address synchronised when filtering list changes
  useEffect(() => {
    if (filterableWhales.length > 0) {
      const containsActive = filterableWhales.some(w => w.address === selectedWhaleAddress);
      if (!containsActive) {
        setSelectedWhaleAddress(filterableWhales[0].address);
      }
    }
  }, [filterableWhales, selectedWhaleAddress]);

  // Read active working whale profile
  const activeWhale = useMemo(() => {
    // If user typed custom input, construct mock on-the-fly metadata
    if (customInputAddr.trim() !== "") {
      const looksLikeSol = !customInputAddr.startsWith("0x") && customInputAddr.length > 30;
      return {
        address: customInputAddr,
        blockchainLabel: "Custom Polled Node (Dynamic Audit Target)",
        network: (looksLikeSol ? "Solana" : "Ethereum") as WhaleWallet["network"],
        initialBalance: "Unknown Reserves",
        txCount: 410,
        age: "1.2 years",
        riskRating: "Medium",
        isExchange: false,
        notes: "On-the-fly dynamically calculated heuristic assessment module. Simulated real-time telemetry trace is live.",
        assetBalances: []
      } as Partial<WhaleWallet>;
    }

    const matched = CURATED_WHALES.find(w => w.address === selectedWhaleAddress);
    return matched || filterableWhales[0];
  }, [selectedWhaleAddress, filterableWhales, customInputAddr]);

  // Handle custom wallet search submit
  const handleCustomSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInputAddr.trim()) {
      setCustomSearchError("Please key in a valid hex address or base58 string.");
      return;
    }
    setCustomSearchError(null);
  };

  const handleClearCustom = () => {
    setCustomInputAddr("");
    setCustomSearchError(null);
  };

  // Compute reactive MEV stats based on Selected Whale + Mitigation toggles
  const mevRatings = useMemo(() => {
    if (!activeWhale) return { riskScore: 10, category: "Protected", indicators: [] };

    // Produce deterministic factors using name/address strings
    let base = 25;
    const label = activeWhale.blockchainLabel || "";
    const addr = activeWhale.address || "";
    
    // String matching variables
    const isBotName = label.toLowerCase().includes("bot") || label.toLowerCase().includes("mev") || label.toLowerCase().includes("pool");
    const isDeFiPrivate = label.toLowerCase().includes("private") || label.toLowerCase().includes("justin");
    const isScamHacker = label.toLowerCase().includes("hacker") || label.toLowerCase().includes("looted");
    const isExchange = activeWhale.isExchange === true;

    if (isBotName) base += 60;
    if (isDeFiPrivate) base += 35;
    if (isScamHacker) base += 55;
    if (isExchange) base -= 15;

    // Adjust by volume factors
    const txMultiplier = Math.min(15, (activeWhale.txCount || 0) / 1000);
    base += txMultiplier;

    // Inject mitigations dynamically
    if (hasPrivateRpc) base -= 30;
    if (hasSlippageCap) base -= 15;
    if (enforceCoW) base -= 25;

    // Clamp score
    const finalScore = Math.max(5, Math.min(99, Math.round(base)));

    // Categorization
    let category = "Low Activity";
    let desc = "This whale account mainly processes vanilla interactions directly to exchanges or cold vaults, exhibiting normal execution latency.";
    let badgeColor = "bg-emerald-500/10 text-emerald-450 border-emerald-500/20";

    if (finalScore >= 75) {
      category = "Active MEV Searcher / Bot Node";
      desc = "Highly optimized, lightning latency patterns verified. High-frequency priority gas fee war participant or custom liquidation agent.";
      badgeColor = "bg-rose-500/10 text-rose-450 border-rose-500/20 shadow-[0_0_8px_rgba(244,63,94,0.15)]";
    } else if (finalScore >= 50) {
      category = "High Exposure Victim Profile";
      desc = "Vulnerable client swap routes. Frequently traded inside public AMMs without private relay networks. Susceptible to persistent sandwiche strategies.";
      badgeColor = "bg-amber-500/10 text-amber-450 border-amber-500/20";
    } else if (finalScore >= 20) {
      category = "Mitigated Sovereign Node";
      desc = "Exhibits conscious defense mechanism setups. Uses localized fallback RPCs, solver networks, or operates strictly within private liquidity lanes.";
      badgeColor = "bg-cyan-500/10 text-cyan-455 border-cyan-500/20";
    }

    // Heuristics list
    const indicators = [
      {
        id: "latency",
        name: "Microsecond Latency Backruns",
        status: isBotName || (activeWhale.txCount || 0) > 5000,
        explanation: "Transactions regularly occur within 1-3ms of target block production times."
      },
      {
        id: "private-relay",
        name: "Mempool Bypass Routing Ratio",
        status: !hasPrivateRpc && !isExchange && finalScore > 40,
        explanation: "Over 82% of transactions bypass standard public nodes, hinting at customized RPC routing configurations or flashbots relays."
      },
      {
        id: "slippage-signature",
        name: "Precise Zero-Slippage Swaps",
        status: isBotName || finalScore > 65,
        explanation: "Large swaps execute exactly on core internal valuation boundaries without paying any slippage spreads to public LPs."
      },
      {
        id: "sandwich-victim",
        name: "Historic Sandwich Susceptibility",
        status: !hasSlippageCap && !isExchange && (isDeFiPrivate || finalScore > 45),
        explanation: "Mempool searchers successfully frontran and backran 18 large trade entries in last 30 epochs, causing over $4,500 in friction slippage."
      }
    ];

    return {
      riskScore: finalScore,
      category,
      desc,
      badgeColor,
      indicators
    };
  }, [activeWhale, hasPrivateRpc, hasSlippageCap, enforceCoW]);

  // Priority fee gas auction data generation
  const simulatedAuctionData = useMemo(() => {
    const dataPoints = [];
    const stepCount = 8;
    
    // We compute MEV profit target
    const targetValueUsd = Math.max(20, arbitrageProfitUsd);
    
    for (let i = 0; i <= stepCount; i++) {
      const stepFactor = i / stepCount; // 0 to 1
      
      // Competitor Bot 1 basic bid logic (exponentially escalating as it gets closer to max threshold)
      const bidBot1Gwei = baseGasGwei + (targetValueUsd * 0.45 * aggressionLevel * Math.pow(stepFactor, 2));
      
      // Competitor Bot 2 (Slightly aggressive but capped at profit margins)
      const bidBot2Gwei = baseGasGwei + 5 + (targetValueUsd * 0.52 * Math.pow(stepFactor, 1.6));
      
      // Optimal Private Gas Bid calculated to win and secure immediate block inclusion
      const winningBidGwei = Math.max(bidBot1Gwei, bidBot2Gwei) * (1.05 + 0.05 * aggressionLevel);
      
      // Validator / Builder profit (extracted transaction tips)
      const validatorTipEth = (winningBidGwei * 0.0000001) * 21000; // simplistic Gwei to Eth tip factor
      const validatorProfitUsd = Math.round(validatorTipEth * 3500); 

      dataPoints.push({
        step: `Round ${i + 1}`,
        "Vanguard Bot (Gwei)": Math.round(bidBot1Gwei),
        "Arbitrageur Alpha (Gwei)": Math.round(bidBot2Gwei),
        "Optimal Secure Bid (Gwei)": Math.round(winningBidGwei),
        "Proposer Tip (USD)": Math.round((winningBidGwei - baseGasGwei) * 0.35)
      });
    }

    return dataPoints;
  }, [arbitrageProfitUsd, baseGasGwei, aggressionLevel]);

  // Comparison data for Sandwich vs Arbitrage over the selected date range
  const comparisonChartData = useMemo(() => {
    const startStr = globalTimeHorizon?.startDate || "2026-05-01";
    const endStr = globalTimeHorizon?.endDate || "2026-05-31";

    const start = new Date(startStr);
    const end = new Date(endStr);

    const datesList: string[] = [];
    let current = new Date(start);

    // Safeguard to prevent infinite loops or huge memory footprint
    let safetyLimit = 0;
    while (current <= end && safetyLimit < 120) {
      datesList.push(current.toISOString().split("T")[0]);
      current.setDate(current.getDate() + 1);
      safetyLimit++;
    }

    // Seed depends on active whale address to keep variations
    const addressString = activeWhale?.address || "generic-node";
    const seed = addressString.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);

    return datesList.map((dt, index) => {
      // Deterministic base daily profit (USD)
      let baseSandwich = 14500 + Math.sin(index * 0.4 + seed) * 6000 + ((seed + index) % 40) * 150;
      let baseArbitrage = 15800 + Math.cos(index * 0.35 + seed) * 5500 + ((seed * index + 17) % 50) * 120;

      // Ensure positive values
      baseSandwich = Math.max(1200, baseSandwich);
      baseArbitrage = Math.max(1500, baseArbitrage);

      // Adjust based on network
      const net = activeWhale?.network || "Ethereum";
      if (net === "Solana") {
        baseSandwich *= 1.4;
        baseArbitrage *= 1.25;
      } else if (net === "Bitcoin") {
        baseSandwich = 0; 
        baseArbitrage *= 0.15; // Low arbitrage on BTC
      } else if (net === "Arbitrum" || net === "Base") {
        baseSandwich *= 0.7;
        baseArbitrage *= 1.45;
      }

      // Adjust based on defenses active (mitigations check)
      let sandwichExploitPerformance = baseSandwich;
      let arbitrageExploitPerformance = baseArbitrage;

      if (hasPrivateRpc) {
        sandwichExploitPerformance *= 0.15; // Sandwiches are crushed down since they can't be seen in public mempools
        arbitrageExploitPerformance *= 0.85; // Arbitrage is slightly impacted by slower private propagation
      }
      if (hasSlippageCap) {
        sandwichExploitPerformance *= 0.35; // Sandwiches fail as they move prices past low threshold
      }
      if (enforceCoW) {
        sandwichExploitPerformance *= 0.05; // CoW Swap completely disallows sandwiching (underlying solver model)
        arbitrageExploitPerformance *= 0.65;
      }

      // Round nicely
      const finalSandwich = Math.round(sandwichExploitPerformance);
      const finalArbitrage = Math.round(arbitrageExploitPerformance);

      // Format date label (e.g., "05/12" from "2026-05-12")
      const dateParts = dt.split("-");
      const shortDateLabel = dateParts.length === 3 ? `${dateParts[1]}/${dateParts[2]}` : dt;

      return {
        date: dt,
        label: shortDateLabel,
        "Sandwich Attacks": finalSandwich,
        "Arbitrage": finalArbitrage
      };
    });
  }, [globalTimeHorizon, activeWhale, hasPrivateRpc, hasSlippageCap, enforceCoW]);

  // Simulated MEV transaction logs database
  const simulatedMevTransactions = useMemo(() => {
    return [
      {
        id: "mev-tx-1",
        time: "10:14:22.054",
        network: "Solana",
        type: "Jito Bundle Sandwich",
        targetWhale: "GC2z7dK95j7sL3pE1rT3G3H9aW9dE8fC7gB5aWS1",
        lossUsd: 1450,
        tipSol: 1.25,
        attackSpeedMs: "8.5ms",
        targetDex: "Raydium Constant Product Pool",
        details: {
          frontrunHash: "8shGds...j9s",
          victimHash: "4fh9gd...j8s",
          backrunHash: "9gshgd...l8g",
          slippageSuffered: "1.45%",
          searcherYieldUsd: 1240,
          narrative: "Target route detected in public Solana mempool. Searcher bundle preempted state by bidding a 1.25 SOL priority tips payout to Jito validators, securing exact block entry positioning."
        }
      },
      {
        id: "mev-tx-2",
        time: "10:14:23.210",
        network: "Ethereum",
        type: "Flashbots Arbitrage",
        targetWhale: "0x9812A27d62058309aDfCEe54C1b6EE6BFd55efD7",
        lossUsd: 0,
        tipSol: 120,
        attackSpeedMs: "45ms",
        targetDex: "UniswapV3 to Curve Finance",
        details: {
          frontrunHash: "0x28c6c...bf2",
          victimHash: "N/A (Multi-DEX Loop)",
          backrunHash: "0x4bfe2...34e",
          slippageSuffered: "0.02%",
          searcherYieldUsd: 840,
          narrative: "Whale executed a colossal trade pushing price down on Uniswap V3. MEV arbitrage bot captured the resulting price discrepancy with Curve pool, routing a dynamic swap loop in the same block."
        }
      },
      {
        id: "mev-tx-3",
        time: "10:14:25.845",
        network: "Ethereum",
        type: "Liquidator Strike",
        targetWhale: "0x1231355446546Fff88856F745339FF5123FFaa90",
        lossUsd: 8720,
        tipSol: 450,
        attackSpeedMs: "12ms",
        targetDex: "Aave V3 Reserve Lending Pool",
        details: {
          frontrunHash: "0x891ef...67e",
          victimHash: "0x002bc...df8",
          backrunHash: "0x11ff3...c3a",
          slippageSuffered: "N/A (Liquidation penalty)",
          searcherYieldUsd: 6450,
          narrative: "Whale collateral health ratio briefly crossed the 0.99 liquidation threshold on secondary price Oracle ticks. A Flashbots searcher bot initiated instantaneous liquidation protocol to claim the 8.5% borrow collateral bounty."
        }
      },
      {
        id: "mev-tx-4",
        time: "10:14:27.102",
        network: "Solana",
        type: "Mempool Frontrun (Raydium)",
        targetWhale: "At38dsksfkgTsk2j39W52YvS9re9ZXYf7Z4Z4c93",
        lossUsd: 610,
        tipSol: 0.15,
        attackSpeedMs: "18ms",
        targetDex: "Orca Whirlpool Dex",
        details: {
          frontrunHash: "92Fha...d8x",
          victimHash: "48dsH...y4X",
          backrunHash: "11Ufa...3sk",
          slippageSuffered: "0.80%",
          searcherYieldUsd: 540,
          narrative: "An unshielded token trade was captured. Searcher bot pushed priority tip to validate state changes first, expanding price impact, returning standard backrun swap in sequence."
        }
      },
      {
        id: "mev-tx-5",
        time: "10:14:28.450",
        network: "BNB Chain",
        type: "PancakeSwap Sandwich",
        targetWhale: "0x3912A848deCee8546fFD91295324009aA9821aCf",
        lossUsd: 2890,
        tipSol: 45,
        attackSpeedMs: "25ms",
        targetDex: "PancakeSwap V3 Route Manager",
        details: {
          frontrunHash: "0xb3412...9fa",
          victimHash: "0xa8112...efc",
          backrunHash: "0x741fa...e81",
          slippageSuffered: "2.10%",
          searcherYieldUsd: 2610,
          narrative: "Multi-hop swap routed in public BNB sequence. Algorithmic searcher bot captured pending gas state, submitting 45 Gwei excess priority fees, extracting cross-asset slippage."
        }
      },
      {
        id: "mev-tx-6",
        time: "10:14:29.980",
        network: "Arbitrum",
        type: "Sequencer Frontrun",
        targetWhale: "0xAb8413554F84A657335eefC14DFA85d11A1B2817",
        lossUsd: 4120,
        tipSol: 35,
        attackSpeedMs: "1.8ms",
        targetDex: "GMX Perpetual Router Store",
        details: {
          frontrunHash: "0xec981...11a",
          victimHash: "0x2bc4e...e01",
          backrunHash: "0x15fdf...f8e",
          slippageSuffered: "1.15%",
          searcherYieldUsd: 3840,
          narrative: "Sequencer latency pipeline exploitation. Arbitrum bot paid customized L2 gas surcharge directly to builder nodes to claim premium queue prioritization over GMX pricing updates."
        }
      },
      {
        id: "mev-tx-7",
        time: "10:14:31.115",
        network: "Base",
        type: "Aerodrome Pool Backrun",
        targetWhale: "0x1a84f3D94bC81E335ffA93cf4bD7Aee8fcff01cf",
        lossUsd: 840,
        tipSol: 15,
        attackSpeedMs: "4.5ms",
        targetDex: "Aerodrome Slip-AMM",
        details: {
          frontrunHash: "0x6842f...eed",
          victimHash: "0x67318...c9d",
          backrunHash: "0x1a84f...cf0",
          slippageSuffered: "0.45%",
          searcherYieldUsd: 790,
          narrative: "Aerodrome swap rebalanced virtual pools on Base L2. The immediate structural deviation was backrun by a low-profile solver contract within the same settlement cycle."
        }
      },
      {
        id: "mev-tx-8",
        time: "10:14:32.440",
        network: "Avalanche",
        type: "Benqi Liquidation Strike",
        targetWhale: "0x8E12a849Df7FD735f492b41F74Cd393da018dCc3",
        lossUsd: 12340,
        tipSol: 112,
        attackSpeedMs: "14ms",
        targetDex: "Benqi Lending L1 Reserve",
        details: {
          frontrunHash: "0x8e12a...cc3",
          victimHash: "0x53d2c...aef",
          backrunHash: "0x847de...4fe",
          slippageSuffered: "N/A (Collateral seizing)",
          searcherYieldUsd: 10450,
          narrative: "Price update tick compromised borrowing ratio health levels. Avalanche searcher bot initiated rapid AVAX collateral liquidation payout to secure the foundation safety incentive."
        }
      },
      {
        id: "mev-tx-9",
        time: "10:14:34.050",
        network: "Optimism",
        type: "Velodrome Gas-Tip Skim",
        targetWhale: "0x847de10D832204E9efc9914EfF2B9D0Adee74E4f",
        lossUsd: 1150,
        tipSol: 22,
        attackSpeedMs: "9.2ms",
        targetDex: "Velodrome Solidly Pool v2",
        details: {
          frontrunHash: "0x09df8...3fd",
          victimHash: "0x847de...e4f",
          backrunHash: "0xbfa01...8bc",
          slippageSuffered: "0.95%",
          searcherYieldUsd: 980,
          narrative: "Velodrome router pool execution. MEV bot manipulated the OP transaction order sequence by injecting high-gwei Optimism gas payments, triggering micro-slippage captures."
        }
      },
      {
        id: "mev-tx-10",
        time: "10:14:35.812",
        network: "Bitcoin",
        type: "Fee-Sniping Hash Race",
        targetWhale: "1FzWLv6N861bE43rGDX6eA7L99y4XGDE3c",
        lossUsd: 0,
        tipSol: 85,
        attackSpeedMs: "2.4 minutes",
        targetDex: "F2Pool / Mempool Auction",
        details: {
          frontrunHash: "34xp4vR...8JDY",
          victimHash: "N/A",
          backrunHash: "bc1qgd9...s7h",
          slippageSuffered: "0.00%",
          searcherYieldUsd: 7800,
          narrative: "Large institutional multi-sig consolidation detected in Bitcoin mempool. Mining pool prioritized custom transaction layout to optimize cumulative network fees."
        }
      },
      {
        id: "mev-tx-11",
        time: "10:14:37.042",
        network: "Tron",
        type: "SunSwap Arbitrage",
        targetWhale: "TYss7hdsgjkdGfS1gKsGd7KgSgd9Kd7hgS",
        lossUsd: 0,
        tipSol: 180,
        attackSpeedMs: "38ms",
        targetDex: "SunSwap AMM V2 Core",
        details: {
          frontrunHash: "TYGsa8f...9kd",
          victimHash: "N/A (P2P routing)",
          backrunHash: "TYss7hd...7hgS",
          slippageSuffered: "0.01%",
          searcherYieldUsd: 2150,
          narrative: "TRX price dislocation on decentralized AMMs leveraged by a rapid-transit smart-router node on the Tron network, executing a looping multi-thousand TRX settlement swap."
        }
      },
      {
        id: "mev-tx-12",
        time: "10:14:38.290",
        network: "Arbitrum",
        type: "L2 Interoperability Slip",
        targetWhale: "0x6842fd757de814bA940dCEE85c98fD9446fdf8eD",
        lossUsd: 1980,
        tipSol: 28,
        attackSpeedMs: "3.2ms",
        targetDex: "Uniswap Arbitrum Router Store",
        details: {
          frontrunHash: "0x67318...c9d",
          victimHash: "0x6842f...8eD",
          backrunHash: "0x1a84f...1cf",
          slippageSuffered: "1.05%",
          searcherYieldUsd: 1740,
          narrative: "Latency gap caught between Layer-1 Ethereum and Layer-2 Arbitrum settlement state transitions. Standard AMM routing was squeezed by a specialized bridge arbitrage bot."
        }
      }
    ];
  }, []);

  // Filtered transaction logs based on selected strategies checkboxes
  const filteredMevTransactions = useMemo(() => {
    return simulatedMevTransactions.filter((tx) => {
      const typeLower = tx.type.toLowerCase();
      let matches = false;

      if (selectedStrategies.includes("Sandwich Attack") && typeLower.includes("sandwich")) {
        matches = true;
      }
      if (selectedStrategies.includes("Arbitrage") && (typeLower.includes("arbitrage") || typeLower.includes("slip") || typeLower.includes("loop"))) {
        matches = true;
      }
      if (selectedStrategies.includes("Frontrunning") && (typeLower.includes("frontrun") || typeLower.includes("skim") || typeLower.includes("sniping"))) {
        matches = true;
      }
      if (selectedStrategies.includes("Liquidation") && (typeLower.includes("liquidat") || typeLower.includes("strike"))) {
        matches = true;
      }

      return matches;
    });
  }, [simulatedMevTransactions, selectedStrategies]);

  // Shorthand labels helper for beautiful horizontal bar charts
  const getShortLabel = (label: string) => {
    if (label.includes("PancakeSwap")) return "PancakeSwap Bot";
    if (label.includes("Arbitrum MEV King")) return "Arb MEV King";
    if (label.includes("Trader Joe")) return "Joe Liquidator";
    if (label.includes("Aerodrome AMM")) return "Aerodrome Router";
    if (label.includes("Velodrome V2")) return "Velodrome Router";
    if (label.includes("FTX Recovery")) return "FTX Liquidator";
    if (label.includes("Justin Sun")) return "Justin Sun DeFi";
    if (label.includes("Raydium AMM")) return "Raydium Pool LP";
    if (label.includes("Looted Funds")) return "Ronin Hacker";
    if (label.includes("Binance 14")) return "Binance 14 Hot";
    if (label.includes("Binance 8")) return "Binance 8 BNB";
    if (label.includes("GMX Protocol")) return "GMX Vault Reserve";
    if (label.includes("Base L2")) return "Base Sequencer";
    if (label.includes("Avalanche Foundation")) return "AVAX Treasury";
    if (label.includes("OP Collective")) return "OP Council Multisig";
    if (label.includes("Tether Treasury")) return "Tether Treasury";
    if (label.includes("Huobi/HTX Exchange")) return "HTX Vault";
    if (label.includes("Binance Cold")) return "Binance Cold";
    if (label.includes("MicroStrategy")) return "MicroStrategy Trust";
    if (label.includes("Mt. Gox")) return "Mt. Gox Trustee";
    if (label.includes("Eth2 Beacon")) return "EVM Deposit";
    if (label.includes("Solana Foundation")) return "Solana Treasury";
    return label.length > 15 ? `${label.substring(0, 15)}...` : label;
  };

  // Generate 30 Day captured value dataset based on CURATED_WHALES list
  const analyticsOverviewData = useMemo(() => {
    return CURATED_WHALES.map((whale) => {
      // Determine realistic base MEV based on tx count and label heuristics
      let baseValue = 50000;
      const label = whale.blockchainLabel.toLowerCase();
      
      // Heuristic scaling
      if (label.includes("bot") || label.includes("mev") || label.includes("liquidator")) {
        baseValue = 350000 + (whale.txCount % 150000) * 1.5;
      } else if (label.includes("validator") || label.includes("sequencer") || label.includes("router")) {
        baseValue = 180000 + (whale.txCount % 80000) * 1.2;
      } else if (label.includes("recovery") || label.includes("hacker") || label.includes("private")) {
        baseValue = 420000 + (whale.txCount % 90000) * 0.8;
      } else {
        // General whale accounts
        baseValue = 15000 + (whale.txCount % 10000) * 1.5;
      }

      // Distribute into realistic sub-categories: Sandwich, Arbitrage, Liquidation
      const isLiquidator = label.includes("liquidator") || label.includes("recovery");
      const isSandwich = label.includes("sandwich") || label.includes("bot") || label.includes("hacker");
      
      let sandwichRatio = 0.4;
      let arbitrageRatio = 0.4;
      let liquidationRatio = 0.2;

      if (isLiquidator) {
        sandwichRatio = 0.1;
        arbitrageRatio = 0.2;
        liquidationRatio = 0.7;
      } else if (isSandwich) {
        sandwichRatio = 0.7;
        arbitrageRatio = 0.2;
        liquidationRatio = 0.1;
      }

      const sandwich_usd = Math.round(baseValue * sandwichRatio);
      const arbitrage_usd = Math.round(baseValue * arbitrageRatio);
      const liquidation_usd = Math.round(baseValue * liquidationRatio);
      const total_mev_usd = sandwich_usd + arbitrage_usd + liquidation_usd;

      return {
        address: whale.address,
        label: whale.blockchainLabel,
        shortLabel: getShortLabel(whale.blockchainLabel),
        network: whale.network,
        txCount: whale.txCount,
        sandwich: sandwich_usd,
        arbitrage: arbitrage_usd,
        liquidation: liquidation_usd,
        totalMev: total_mev_usd,
        peakDayUsd: Math.round(total_mev_usd / 20 * (1.1 + (whale.txCount % 5) / 10))
      };
    });
  }, []);

  // Filter analytics overview list dynamically
  const filteredAnalyticsData = useMemo(() => {
    return analyticsOverviewData.filter(item => {
      if (analyticsFilterNetwork === "All") return true;
      return item.network === analyticsFilterNetwork;
    }).sort((a, b) => b[analyticsFilterMetric] - a[analyticsFilterMetric]);
  }, [analyticsOverviewData, analyticsFilterNetwork, analyticsFilterMetric]);

  // Derive global / filtered aggregates
  const analyticsSummary = useMemo(() => {
    let totalValue = 0;
    let totalSandwich = 0;
    let totalArbitrage = 0;
    let totalLiquidation = 0;
    let maxBeneficiary = { label: "N/A", value: 0 };

    filteredAnalyticsData.forEach(item => {
      totalValue += item[analyticsFilterMetric];
      totalSandwich += item.sandwich;
      totalArbitrage += item.arbitrage;
      totalLiquidation += item.liquidation;
      if (item[analyticsFilterMetric] > maxBeneficiary.value) {
        maxBeneficiary = { label: item.shortLabel, value: item[analyticsFilterMetric] };
      }
    });

    return {
      totalMetricValue: totalValue,
      totalSandwich,
      totalArbitrage,
      totalLiquidation,
      maxExtractor: maxBeneficiary.label,
      avgPerAddress: filteredAnalyticsData.length ? Math.round(totalValue / filteredAnalyticsData.length) : 0
    };
  }, [filteredAnalyticsData, analyticsFilterMetric]);

  // Show detailed audit event
  const triggerAuditDetail = (tx: any) => {
    setAuditedTx(tx);
    setIsAuditModalOpen(true);
  };

  // Download CSV Activity for the target Whale
  const handleDownloadCsv = () => {
    if (!activeWhale) return;

    const address = activeWhale.address || "Unknown";
    const label = activeWhale.blockchainLabel || "Custom Node";
    const network = activeWhale.network || "Ethereum";

    // Generate last 30 days of daily logs deterministically based on address string characters
    const csvRows = [
      ["Date", "Target Address", "Label", "Network", "Activity Type", "Captured Volume (USD)", "Gas Used / Tip", "Block Height", "Exploit Status"]
    ];

    const today = new Date();
    // Use address characters to generate repeatable pseudo-random daily distribution
    const seed = address.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);

    for (let i = 29; i >= 0; i--) {
      const activeDate = new Date(today);
      activeDate.setDate(today.getDate() - i);
      const dateString = activeDate.toISOString().split("T")[0];

      // Block number simulation
      const baseBlock = 18450000 + (seed % 100000) + (30 - i) * 120;
      const numEvents = (seed + i) % 3 + 1; 

      for (let j = 0; j < numEvents; j++) {
        const hashSeed = (seed * (i + 1) * (j + 7)) % 10000;
        
        let type = "Sandwich Frontrun";
        let capturedUsd = Math.round(150 + (hashSeed % 1450));
        let gasTip = `${25 + (hashSeed % 90)} Gwei`;

        if (network === "Solana") {
          gasTip = `${(0.01 + (hashSeed % 10) / 100).toFixed(2)} SOL`;
        } else if (network === "Bitcoin") {
          gasTip = `${(0.0005 + (hashSeed % 10) / 10000).toFixed(4)} BTC`;
        }

        const isLiquidator = label.toLowerCase().includes("liquidator") || label.toLowerCase().includes("recovery");
        const isArb = label.toLowerCase().includes("mev") || label.toLowerCase().includes("arbitrage") || label.toLowerCase().includes("validator");

        if (isLiquidator) {
          type = "Liquidation Prime";
          capturedUsd = Math.round(1200 + (hashSeed % 8500));
        } else if (isArb || (hashSeed % 100 > 60)) {
          type = "Arbitrage Loop";
          capturedUsd = Math.round(300 + (hashSeed % 3500));
        }

        // Apply dynamic mitigation simulation
        let status = "Successfully Captured";
        if (hasPrivateRpc && type !== "Liquidation Prime") {
          status = "Mitigated (Private RPC)";
          capturedUsd = 0;
        } else if (hasSlippageCap && type === "Sandwich Frontrun") {
          status = "Mitigated (Strict Slippage Cap)";
          capturedUsd = Math.round(capturedUsd * 0.1);
        } else if (enforceCoW && type === "Arbitrage Loop") {
          status = "Mitigated (CoW Swap solver)";
          capturedUsd = 0;
        }

        csvRows.push([
          dateString,
          address,
          label,
          network,
          type,
          capturedUsd.toString(),
          gasTip,
          (baseBlock + j).toString(),
          status
        ]);
      }
    }

    // Convert CSV array to text string
    const csvContent = "data:text/csv;charset=utf-8," 
      + csvRows.map(row => row.map(val => `"${val.replace(/"/g, '""')}"`).join(",")).join("\n");
      
    // Create actual download anchor click flow
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `mev_activity_${address.substring(0, 10)}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="whale-mev-bot-detection-module" className="space-y-6">
      
      {/* 🚀 MODULE INTRO HERO BANNER */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/5 rounded-full filter blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-60 h-60 bg-cyan-500/5 rounded-full filter blur-[60px] pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="bg-rose-500/10 text-rose-450 border border-rose-500/20 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                <Activity className="h-3 w-3 text-rose-500 animate-pulse" /> Live Tracker Node
              </span>
              <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider">
                PBS Block Audit Engine
              </span>
            </div>
            
            <h2 className="text-xl md:text-2xl font-mono font-bold text-white tracking-tight uppercase">
              On-Chain Whale MEV Bot Tracker & Anti-Exploit Console
            </h2>
            <p className="text-[11px] md:text-xs text-slate-400 leading-relaxed font-sans">
              Proactively identify which crypto whales are using advanced algorithmic MEV (Maximal Extractable Value) searchers to route order books, or whether their massive on-chain liquid swaps are falling victim to automated sandwich attackers, RPC routing skims, and validator gas-tip frontruns.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-900 shrink-0 w-full lg:w-auto">
            <Cpu className="h-9 w-9 text-rose-500 animate-[spin_5s_linear_infinite] hidden sm:block" />
            <div className="font-mono text-left">
              <div className="text-[9px] text-slate-500">NETWORK CAPTURE LATENCY</div>
              <div className="text-sm font-bold text-white">~3.5 milliseconds</div>
              <div className="text-[8px] text-emerald-450 flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                ACTIVE FLASHBOTS + JITO STREAM
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 📊 GRID SYSTEM CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ================= LEFT 5-COLUMNS: WHALE TARGET CHOOSER & INDICATORS ================= */}
        <div className="lg:col-span-5 flex flex-col space-y-6">
          
          {/* Target Profiler Box */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-900/80 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Search className="h-4 w-4 text-rose-450" />
                <h3 className="text-xs font-mono font-bold text-slate-200 uppercase">
                  Select Whale target
                </h3>
              </div>
              <span className="text-[8.5px] font-mono text-slate-500">Heuristics v3.1</span>
            </div>

            {/* Network Pick */}
            <div className="grid grid-cols-2 min-[420px]:grid-cols-3 sm:grid-cols-5 gap-1 bg-slate-900/40 p-1 rounded-lg border border-slate-900">
              {([
                "All",
                "Ethereum",
                "Solana",
                "BNB Chain",
                "Arbitrum",
                "Base",
                "Avalanche",
                "Optimism",
                "Bitcoin",
                "Tron"
              ] as const).map(net => (
                <button
                  key={net}
                  type="button"
                  onClick={() => {
                    setSelectedNetwork(net);
                    // Reset custom input when clicking tab
                    setCustomInputAddr("");
                  }}
                  className={`py-1 text-[8.5px] font-mono font-bold uppercase rounded cursor-pointer transition-all ${
                    (selectedNetwork === net && !customInputAddr)
                      ? "bg-rose-500/15 text-rose-300 border border-rose-500/30 shadow-sm"
                      : "text-slate-450 hover:text-slate-200 hover:bg-slate-900/30"
                  }`}
                >
                  {net}
                </button>
              ))}
            </div>

            {/* Target Dropdown or Options List */}
            <div className="space-y-2">
              <label className="text-[9px] font-mono text-slate-500 uppercase font-bold block">
                Target Selected Address:
              </label>
              
              <select
                id="mev-whale-selector"
                value={selectedWhaleAddress}
                onChange={(e) => {
                  setSelectedWhaleAddress(e.target.value);
                  setCustomInputAddr(""); // Clear search inputs
                }}
                className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-[10.5px] font-mono p-2 rounded-lg focus:outline-none focus:border-rose-500 transition-colors"
              >
                {filterableWhales.map((w) => (
                  <option key={w.address} value={w.address}>
                    [{w.network.toUpperCase()}] {w.blockchainLabel.substring(0, 24)}... (Tx Count: {w.txCount})
                  </option>
                ))}
              </select>

              {/* Download CSV Action Button */}
              <button
                type="button"
                id="download-whale-csv-btn"
                onClick={handleDownloadCsv}
                className="w-full mt-2 py-1.5 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 hover:border-rose-500/40 rounded-lg text-[9.5px] font-mono font-bold uppercase transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 shadow-sm shadow-rose-950/20"
              >
                <Download className="h-3.5 w-3.5" />
                Download CSV Activity (导出30天MEV活动数据)
              </button>
            </div>

            {/* Custom Input Bypass Search */}
            <div className="border-t border-slate-900/80 pt-3.5 space-y-2">
              <span className="text-[9px] font-mono text-slate-500 uppercase font-bold block">
                Or Polling Custom On-Chain Node ID:
              </span>
              <form onSubmit={handleCustomSearch} className="flex gap-2">
                <input
                  type="text"
                  id="custom-mev-address-input"
                  placeholder="Key in ERC-20 / Solana Address..."
                  value={customInputAddr}
                  onChange={(e) => setCustomInputAddr(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-[10px] font-mono text-slate-200 placeholder-slate-650 flex-1 focus:outline-none focus:border-rose-500"
                />
                
                {customInputAddr && (
                  <button
                    type="button"
                    onClick={handleClearCustom}
                    className="p-1 px-2.5 bg-slate-900 hover:bg-slate-850 rounded border border-slate-800 text-slate-400 hover:text-white text-[9px] font-mono"
                  >
                    Clear
                  </button>
                )}
              </form>
              {customSearchError && (
                <span className="text-[8.5px] font-mono text-rose-500 block">{customSearchError}</span>
              )}
            </div>
          </div>

          {/* ================= TARGET STATS & MEV SCORE ================= */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-900/80 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2.5">
              <span className="text-[10px] font-mono text-rose-455 font-bold uppercase select-none">
                ACTIVE METRICS DETECTOR
              </span>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[8px] font-mono border font-extrabold uppercase ${
                  mevRatings.riskScore >= 75 ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                  mevRatings.riskScore >= 45 ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                  "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                }`}>
                  Score: {mevRatings.riskScore}%
                </span>
              </div>
            </div>

            {/* Score Ring UI */}
            <div className="flex items-center gap-4 bg-slate-900/20 p-3 rounded-lg border border-slate-900/60">
              <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="#1e293b"
                    strokeWidth="4"
                    fill="transparent"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke={mevRatings.riskScore >= 75 ? "#f43f5e" : mevRatings.riskScore >= 45 ? "#f59e0b" : "#06b6d4"}
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 28}
                    strokeDashoffset={2 * Math.PI * 28 * (1 - mevRatings.riskScore / 100)}
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <span className="absolute text-xs font-mono font-bold text-white text-center">
                  {mevRatings.riskScore}%
                </span>
              </div>

              <div className="space-y-1">
                <span className={`text-[10px] font-mono font-bold uppercase py-0.5 px-2 rounded border ${mevRatings.badgeColor}`}>
                  {mevRatings.category}
                </span>
                <p className="text-[9.5px] text-slate-550 leading-relaxed font-mono">
                  {activeWhale.blockchainLabel || "Target Account"} is active on <strong className="text-white">{activeWhale.network}</strong> with {activeWhale.txCount || 0} observed operations.
                </p>
              </div>
            </div>

            {/* Verdict analysis text block */}
            <div className="p-3 bg-slate-900/40 rounded-lg border border-slate-900 font-sans text-[11px] text-slate-300 leading-relaxed">
              <p>{mevRatings.desc}</p>
            </div>

            {/* Heuristic Checklist */}
            <div className="space-y-2 border-t border-slate-900 pt-3">
              <span className="text-[9px] font-mono text-slate-500 font-bold uppercase tracking-wider block">
                MEV Signature Heuristic Audits:
              </span>

              <div className="space-y-2 font-mono">
                {mevRatings.indicators.map((ind) => (
                  <div key={ind.id} className="bg-slate-950/90 p-2.5 rounded border border-slate-900/60 hover:border-slate-800 transition-colors flex items-start gap-2.5">
                    {ind.status ? (
                      <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-bold ${ind.status ? "text-rose-400" : "text-emerald-450"}`}>
                          {ind.name}
                        </span>
                        <span className="text-[7.5px] bg-slate-900 px-1 py-0.2 rounded border border-slate-800 text-slate-500 uppercase">
                          {ind.status ? "MATCHED" : "CLEAR"}
                        </span>
                      </div>
                      <p className="text-[8.5px] text-slate-500 leading-normal">
                        {ind.explanation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT 7-COLUMNS: AUCTION GRAPH & GAS BID WAR ================= */}
        <div className="lg:col-span-7 flex flex-col space-y-6">

          {/* ================= PRIORITY FEE WAR SIMULATOR ================= */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-900/80 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-900 pb-3">
              <div className="space-y-0.5">
                <span className="text-[9px] font-mono text-rose-455 font-bold uppercase block tracking-wider">
                  INTERACTIVE MEMPOOL GAS AUCTION SIMULATOR (抢跑气费竞价战)
                </span>
                <h4 className="text-xs font-mono font-bold text-slate-100 uppercase tracking-tight flex items-center gap-1.5">
                  <Sliders className="h-4 w-4 text-rose-450" /> Real-Time Priority Fee Escalation Matrix
                </h4>
              </div>

              <div className="text-[8px] font-mono bg-slate-900 px-2 py-0.5 border border-slate-800 rounded text-slate-400">
                PROFIT RATIO THRESHOLDS
              </div>
            </div>

            {/* Adjustable sliders block */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4.5 bg-slate-900/10 p-3 rounded-xl border border-slate-900">
              {/* Slider 1: Arbitrage Pool Profit Target */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[9px] font-mono">
                  <span className="text-slate-400 uppercase font-bold">MEV Profit Target:</span>
                  <span className="text-emerald-450 font-bold">${arbitrageProfitUsd} USD</span>
                </div>
                <input
                  type="range"
                  id="mev-profit-target-slider"
                  min="50"
                  max="1500"
                  step="50"
                  value={arbitrageProfitUsd}
                  onChange={(e) => setArbitrageProfitUsd(parseInt(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer h-1.5 bg-slate-900 rounded-lg outline-none"
                />
                <span className="text-[8.5px] font-mono text-slate-500 block">
                  Higher incentives command fierce bidding cycles.
                </span>
              </div>

              {/* Slider 2: Base Mempool Gas Target */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[9px] font-mono">
                  <span className="text-slate-400 uppercase font-bold">Base Gas / Jito Tip:</span>
                  <span className="text-cyan-455 font-bold">{baseGasGwei} Gwei / SOL-T</span>
                </div>
                <input
                  type="range"
                  id="base-gas-gwei-slider"
                  min="10"
                  max="250"
                  step="5"
                  value={baseGasGwei}
                  onChange={(e) => setBaseGasGwei(parseInt(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-slate-900 rounded-lg outline-none"
                />
                <span className="text-[8.5px] font-mono text-slate-500 block">
                  Baseline block cost before searcher priority tip inclusion.
                </span>
              </div>

              {/* Slider 3: Competitor Aggression Level */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[9px] font-mono">
                  <span className="text-slate-400 uppercase font-bold">Bot Aggression Factor:</span>
                  <span className="text-rose-455 font-bold">{aggressionLevel}x Mult</span>
                </div>
                <input
                  type="range"
                  id="bot-aggression-factor-slider"
                  min="1.0"
                  max="5.0"
                  step="0.5"
                  value={aggressionLevel}
                  onChange={(e) => setAggressionLevel(parseFloat(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer h-1.5 bg-slate-900 rounded-lg outline-none"
                />
                <span className="text-[8.5px] font-mono text-slate-500 block">
                  Modifies how close competitor bots push bids near break-even bounds.
                </span>
              </div>
            </div>

            {/* Bidding progression Graph */}
            <div className="h-60 w-full bg-slate-950/90 p-2 rounded-xl border border-slate-900 relative">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={simulatedAuctionData} margin={{ top: 12, right: 10, left: -22, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorSecureBid" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.01}/>
                    </linearGradient>
                    <linearGradient id="colorProposerTip" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.01}/>
                    </linearGradient>
                  </defs>

                  <XAxis 
                    dataKey="step" 
                    tick={{ fill: '#475569', fontSize: 7.5, fontFamily: 'monospace' }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fill: '#475569', fontSize: 7.5, fontFamily: 'monospace' }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-slate-950 border border-slate-800 p-2.5 rounded shadow-2xl space-y-1 max-w-[190px] font-mono text-[9px] text-slate-350 select-none">
                            <p className="font-extrabold text-slate-200 border-b border-slate-900 pb-1 uppercase">{label}</p>
                            {payload.map((entry: any) => {
                              let clr = "text-slate-400";
                              if (entry.name === "Optimal Secure Bid (Gwei)") clr = "text-rose-450";
                              else if (entry.name === "Proposer Tip (USD)") clr = "text-cyan-455";
                              
                              const valUnit = entry.name.includes("Gwei") ? "Gwei" : "USD";
                              return (
                                <div key={entry.name} className="flex justify-between gap-4">
                                  <span className={clr}>{entry.name.split(" (")[0]}:</span>
                                  <span className="font-extrabold text-white">{entry.value} {valUnit}</span>
                                </div>
                              );
                            })}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '7.5px', fontFamily: 'monospace', color: '#64748b' }} 
                    iconSize={8}
                  />

                  <Area 
                    type="monotone" 
                    dataKey="Optimal Secure Bid (Gwei)" 
                    stroke="#f43f5e" 
                    strokeWidth={1.5} 
                    fillOpacity={1} 
                    fill="url(#colorSecureBid)" 
                    dot={false}
                    activeDot={{ r: 3, stroke: '#f43f5e', strokeWidth: 1 }}
                  />

                  <Area 
                    type="monotone" 
                    dataKey="Proposer Tip (USD)" 
                    stroke="#22d3ee" 
                    strokeWidth={1.5} 
                    fillOpacity={1} 
                    fill="url(#colorProposerTip)" 
                    dot={false}
                    activeDot={{ r: 3, stroke: '#22d3ee', strokeWidth: 1 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-wrap items-center justify-between text-[8px] font-mono text-slate-500">
              <span>* Gas optimization assumes standard 21,000 EVM execution boundaries equivalent.</span>
              <span>Secure Bid includes Flashbots Geth priority bundles offset coefficients.</span>
            </div>
          </div>

          {/* ================= MEV SHIELD MITIGATION ADVISOR SECTION ================= */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-900/80 space-y-4">
            <div className="space-y-1">
              <span className="text-[9px] font-mono text-cyan-405 font-bold uppercase block tracking-wider">
                MITIGATION PROTOCOL SHIELD (防范MEV攻击沙盒)
              </span>
              <h4 className="text-xs font-mono font-bold text-slate-100 uppercase tracking-tight flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-cyan-455" /> Interactive Protection Hardening Panel
              </h4>
              <p className="text-[10px] text-slate-500 font-sans leading-normal">
                Toggle active security systems to protect target transactions relative to public mempools, minimizing residual slippage loss and avoiding backrunner arbitrage exploitation.
              </p>
            </div>

            {/* Protection switches */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-900/20 p-3 rounded-lg border border-slate-900">
              {/* Option 1: Private RPC */}
              <button
                type="button"
                id="toggle-private-rpc"
                onClick={() => setHasPrivateRpc(!hasPrivateRpc)}
                className={`p-2.5 rounded-lg border text-left flex flex-col justify-between space-y-1.5 transition-all text-xs cursor-pointer ${
                  hasPrivateRpc 
                    ? "bg-cyan-500/10 border-cyan-500/35 text-cyan-400" 
                    : "bg-slate-950 border-slate-900 text-slate-400 hover:text-slate-300"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-mono font-extrabold text-[9.5px] uppercase">
                    1. Private RPC Relay
                  </span>
                  {hasPrivateRpc ? <Lock className="h-3.5 w-3.5 text-cyan-455" /> : <Unlock className="h-3.5 w-3.5 text-slate-550" />}
                </div>
                <p className="text-[8.5px] font-sans leading-normal text-slate-500">
                  Routes bids via private Flashbots / Jito builders directly, preventing frontrunning public mempool bots from observing your transactions entirely.
                </p>
              </button>

              {/* Option 2: Active Slippage Cap */}
              <button
                type="button"
                id="toggle-slippage-cap"
                onClick={() => setHasSlippageCap(!hasSlippageCap)}
                className={`p-2.5 rounded-lg border text-left flex flex-col justify-between space-y-1.5 transition-all text-xs cursor-pointer ${
                  hasSlippageCap 
                    ? "bg-indigo-500/10 border-indigo-500/35 text-indigo-400" 
                    : "bg-slate-950 border-slate-900 text-slate-400 hover:text-slate-300"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-mono font-extrabold text-[9.5px] uppercase">
                    2. Strict Slippage Cap
                  </span>
                  {hasSlippageCap ? <Lock className="h-3.5 w-3.5 text-indigo-400" /> : <Unlock className="h-3.5 w-3.5 text-slate-550" />}
                </div>
                <p className="text-[8.5px] font-sans leading-normal text-slate-500">
                  Caps maximum transaction gas price boundaries and sets execution tolerance strictly to 0.1%. Reduces frontrunner profit margin below execution parameters.
                </p>
              </button>

              {/* Option 3: CoW-Swap / Solver Network */}
              <button
                type="button"
                id="toggle-cow-swap"
                onClick={() => setEnforceCoW(!enforceCoW)}
                className={`p-2.5 rounded-lg border text-left flex flex-col justify-between space-y-1.5 transition-all text-xs cursor-pointer ${
                  enforceCoW 
                    ? "bg-emerald-500/10 border-emerald-500/35 text-emerald-400" 
                    : "bg-slate-950 border-slate-900 text-slate-400 hover:text-slate-300"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-mono font-extrabold text-[9.5px] uppercase">
                    3. Batch CoW Solver
                  </span>
                  {enforceCoW ? <Lock className="h-3.5 w-3.5 text-emerald-455" /> : <Unlock className="h-3.5 w-3.5 text-slate-550" />}
                </div>
                <p className="text-[8.5px] font-sans leading-normal text-slate-500">
                  Leverages Coincidence of Wants (CoW) to match orders peer-to-peer peer-to-peer, completely eliminating direct exposure to AMM slippage attacks.
                </p>
              </button>
            </div>

            {/* Dynamic mitigation impact summary */}
            <div className="p-3.5 bg-slate-900/60 border border-slate-900 rounded-lg flex items-center justify-between gap-4 font-mono text-[9px]">
              <div className="space-y-1">
                <span className="text-slate-500 font-bold uppercase block">COMPUTED EXPLOIT VULNERABILITY INDEX:</span>
                <p className="font-sans text-[11px] text-slate-350 leading-relaxed max-w-md">
                  {hasPrivateRpc && hasSlippageCap && enforceCoW ? (
                    <span className="text-emerald-450 font-bold">Excellent Defence Shield Enabled: Targeted account is extremely secure. Sandwich/frontrunning threat levels have declined by up to 95%. Order-flow is fully routed via private consensus blocks.</span>
                  ) : hasPrivateRpc || enforceCoW ? (
                    <span className="text-cyan-455">Hardened Profile: Private RPC protection routing is currently protecting most liquidity sweeps. Minor exposure risks persist on secondary long-tail AMM segments.</span>
                  ) : (
                    <span className="text-rose-400 font-semibold flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3 inline" /> Warning: Unhardened Node. Highly vulnerable to frontrunning bots, MEV sandwiches, and multi-hop order flow arbitrage sweeps.
                    </span>
                  )}
                </p>
              </div>

              <div className="bg-slate-950 p-2.5 rounded border border-slate-850 text-center shrink-0 min-w-[110px]">
                <div className="text-[8px] text-slate-500 uppercase">THREAT INDEX</div>
                <div className={`text-lg font-extrabold ${
                  (hasPrivateRpc && hasSlippageCap && enforceCoW) ? "text-emerald-455" :
                  (hasPrivateRpc || enforceCoW) ? "text-cyan-455" : "text-rose-455"
                }`}>
                  {(hasPrivateRpc && hasSlippageCap && enforceCoW) ? "5% Secure" :
                   (hasPrivateRpc && enforceCoW) ? "15% Cleared" :
                   hasPrivateRpc ? "35% Protected" : "90% Severe Risk"}
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* 📊 30-DAY TOTAL EXTRACTED VALUE (MEV) ANALYTICS OVERVIEW */}
      <div id="mev-analytics-overview-card" className="bg-slate-950 p-5 rounded-2xl border border-slate-900 shadow-xl space-y-5">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-slate-900 pb-4">
          <div className="space-y-1">
            <span className="text-[9px] font-mono text-rose-500 font-extrabold uppercase tracking-widest block">
              30-Day Captured MEV Value Analytics (30天累计提取MEV价值分析)
            </span>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-rose-950/20 border border-rose-900/40 rounded text-rose-400">
                <TrendingUp className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-tight">
                Historical Capture Matrix & Aggregated Exploits
              </h3>
            </div>
            <p className="text-[10px] text-slate-450 leading-relaxed max-w-2xl font-sans">
              Dynamic aggregate of cumulative frontrunning block rewards, multi-hop decentralized routing price slippage, and flashloan liquidation premiums captured by active addresses across all supported blockchains.
            </p>
          </div>

          {/* Interactive Metric Controls */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Metric Selector buttons */}
            <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-800">
              {([
                { id: "totalMev", label: "Value Extracted" },
                { id: "sandwich", label: "Sandwich" },
                { id: "arbitrage", label: "Arbitrage" },
                { id: "liquidation", label: "Liquidation" }
              ] as const).map(met => (
                <button
                  key={met.id}
                  type="button"
                  onClick={() => setAnalyticsFilterMetric(met.id)}
                  className={`px-2.5 py-1 text-[9px] font-mono font-bold uppercase rounded cursor-pointer transition-all ${
                    analyticsFilterMetric === met.id
                      ? "bg-rose-500/15 text-rose-300 border border-rose-500/25 font-bold"
                      : "text-slate-405 hover:text-slate-200"
                  }`}
                >
                  {met.label}
                </button>
              ))}
            </div>

            {/* Network Quick select dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-mono text-slate-500 uppercase font-black">Chain:</span>
              <select
                id="analytics-chain-selector"
                value={analyticsFilterNetwork}
                onChange={(e) => setAnalyticsFilterNetwork(e.target.value as any)}
                className="bg-slate-900 border border-slate-800 text-slate-300 text-[9.5px] font-mono px-2.5 py-1 rounded focus:outline-none focus:border-rose-500 cursor-pointer"
              >
                {["All", "Ethereum", "Solana", "BNB Chain", "Arbitrum", "Base", "Avalanche", "Optimism", "Bitcoin", "Tron"].map((n) => (
                  <option key={n} value={n}>{n.toUpperCase()}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Analytics KPIs Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/30 p-3 rounded-xl border border-slate-900/60 font-mono space-y-1">
            <span className="text-[8.5px] text-slate-500 uppercase block font-bold">Accumulative 30D Extracted</span>
            <div className="text-lg font-bold text-rose-455">
              ${analyticsSummary.totalMetricValue.toLocaleString()}
            </div>
            <p className="text-[8px] text-slate-550">Dynamic sum for selected filters</p>
          </div>

          <div className="bg-slate-900/30 p-3 rounded-xl border border-slate-900/60 font-mono space-y-1">
            <span className="text-[8.5px] text-slate-500 uppercase block font-bold">Largest Extractor Label</span>
            <div className="text-sm font-bold text-white truncate text-rose-300 uppercase">
              {analyticsSummary.maxExtractor}
            </div>
            <p className="text-[8px] text-slate-550">Leading searcher address source</p>
          </div>

          <div className="bg-slate-900/30 p-3 rounded-xl border border-slate-900/60 font-mono space-y-1">
            <span className="text-[8.5px] text-slate-500 uppercase block font-bold">Average Capture Per Node</span>
            <div className="text-lg font-bold text-cyan-455">
              ${analyticsSummary.avgPerAddress.toLocaleString()}
            </div>
            <p className="text-[8px] text-slate-550">Value distribution mean index</p>
          </div>

          <div className="bg-slate-900/30 p-3 rounded-xl border border-slate-900/60 font-mono space-y-1">
            <span className="text-[8.5px] text-slate-500 uppercase block font-bold">Extracted Distribution (USD)</span>
            <div className="flex items-center gap-1.5 pt-1">
              <span className="h-2 w-2 rounded-full bg-rose-500" title="Sandwich"></span>
              <span className="text-[9.5px] text-slate-350 font-bold">${(analyticsSummary.totalSandwich / 1000).toFixed(0)}k</span>
              <span className="h-2 w-2 rounded-full bg-cyan-455" title="Arbitrage"></span>
              <span className="text-[9.5px] text-slate-350 font-bold">${(analyticsSummary.totalArbitrage / 1000).toFixed(0)}k</span>
              <span className="h-2 w-2 rounded-full bg-amber-450" title="Liquidation"></span>
              <span className="text-[9.5px] text-slate-350 font-bold">${(analyticsSummary.totalLiquidation / 1000).toFixed(0)}k</span>
            </div>
            <p className="text-[8px] text-slate-550">Sandwich · Arbitrage · Liquidation</p>
          </div>
        </div>

        {/* 📊 Parallel Charts: Accumulative 30D Stats VS. Date Horizon Real-Time Strategy Showdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Bar Chart Container */}
          <div className="bg-slate-900/10 p-3 rounded-xl border border-slate-900 relative">
            <div className="absolute top-2 right-4 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping"></span>
              <span className="text-[8px] font-mono text-slate-500 uppercase">30-Day Aggregated Stream Node</span>
            </div>
            
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredAnalyticsData} margin={{ top: 15, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} vertical={false} />
                  <XAxis 
                    dataKey="shortLabel" 
                    tick={{ fill: '#64748b', fontSize: 8, fontFamily: 'monospace' }} 
                    axisLine={{ stroke: '#334155', strokeWidth: 0.5 }}
                    tickLine={false}
                  />
                  <YAxis 
                    tickFormatter={(value) => `$${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`}
                    tick={{ fill: '#64748b', fontSize: 8, fontFamily: 'monospace' }} 
                    axisLine={{ stroke: '#334155', strokeWidth: 0.5 }}
                    tickLine={false}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg shadow-2xl space-y-1 font-mono text-[9px] text-slate-350 min-w-[240px] select-none">
                            <p className="font-extrabold text-slate-200 border-b border-slate-900 pb-1.5 uppercase truncate">{data.label}</p>
                            <div className="flex justify-between gap-4 mt-1 text-slate-400">
                              <span>Blockchain (链):</span>
                              <span className="font-bold text-white uppercase">{data.network}</span>
                            </div>
                            <div className="flex justify-between gap-4 text-rose-450 font-bold">
                              <span>Sandwich Exploits:</span>
                              <span>${data.sandwich.toLocaleString()} USD</span>
                            </div>
                            <div className="flex justify-between gap-4 text-cyan-455 font-bold">
                              <span>Looping Arbitrage:</span>
                              <span>${data.arbitrage.toLocaleString()} USD</span>
                            </div>
                            <div className="flex justify-between gap-4 text-amber-450 font-bold">
                              <span>Liquidation Premiums:</span>
                              <span>${data.liquidation.toLocaleString()} USD</span>
                            </div>
                            <div className="flex justify-between gap-2 border-t border-slate-900 pt-1.5 text-white font-extrabold text-[9.5px]">
                              <span>Total Extracted (30D):</span>
                              <span>${data.totalMev.toLocaleString()} USD</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '8px', fontFamily: 'monospace', color: '#64748b', paddingTop: '10px' }} 
                    iconSize={8}
                  />
                  <Bar 
                    dataKey={analyticsFilterMetric} 
                    fill={
                      analyticsFilterMetric === "totalMev" ? "#e11d48" :
                      analyticsFilterMetric === "sandwich" ? "#f43f5e" :
                      analyticsFilterMetric === "arbitrage" ? "#06b6d4" :
                      "#fbbf24"
                    }
                    radius={[4, 4, 0, 0]} 
                    name={
                      analyticsFilterMetric === "totalMev" ? "Total Captured MEV (USD)" :
                      analyticsFilterMetric === "sandwich" ? "Sandwich Frontrun Profit (USD)" :
                      analyticsFilterMetric === "arbitrage" ? "Loop Arbitrage Yield (USD)" :
                      "Liquidation Premium Captured (USD)"
                    }
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 📈 NEW COMPARISON CHART: STRATEGY SHOWDOWN (Sandwich vs Arbitrage over core Date Horizon) */}
          <div className="bg-slate-900/10 p-3 rounded-xl border border-slate-900 relative flex flex-col justify-between">
            <div className="absolute top-2 right-4 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-455 animate-pulse"></span>
              <span className="text-[8px] font-mono text-slate-500 uppercase">
                {globalTimeHorizon?.startDate || "2026-05-01"} ➔ {globalTimeHorizon?.endDate || "2026-05-31"} HORIZON
              </span>
            </div>

            <div className="space-y-1 mb-2">
              <div className="text-[10px] font-mono font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1">
                ⚖️ Strategy Yield Rivalry: Sandwich vs. Arbitrage Profitability
              </div>
              <p className="text-[9px] text-slate-500 font-sans leading-tight">
                Daily extracted value performance comparing core exploitation strategies on <strong>{activeWhale?.network || "All Chains"}</strong>. Toggling on-chain anti-MEV mitigation protocols immediately hampers Sandwich yield curves.
              </p>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={comparisonChartData} margin={{ top: 15, right: 10, left: -22, bottom: 20 }}>
                  <defs>
                    <linearGradient id="colorSandwich" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="colorArbitrage" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} vertical={false} />
                  <XAxis 
                    dataKey="label" 
                    tick={{ fill: '#64748b', fontSize: 8, fontFamily: 'monospace' }} 
                    axisLine={{ stroke: '#334155', strokeWidth: 0.5 }}
                    tickLine={false}
                  />
                  <YAxis 
                    tickFormatter={(value) => `$${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`}
                    tick={{ fill: '#64748b', fontSize: 8, fontFamily: 'monospace' }} 
                    axisLine={{ stroke: '#334155', strokeWidth: 0.5 }}
                    tickLine={false}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        const sandwichVal = data["Sandwich Attacks"];
                        const arbitrageVal = data["Arbitrage"];
                        const gapVal = Math.abs(sandwichVal - arbitrageVal);
                        const leader = sandwichVal > arbitrageVal ? "Sandwich Attacks" : "Arbitrage";
                        return (
                          <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg shadow-2xl space-y-1.5 font-mono text-[9px] text-slate-350 min-w-[210px] select-none">
                            <p className="font-extrabold text-slate-200 border-b border-slate-900 pb-1.5 uppercase">DATE: {data.date}</p>
                            <div className="flex justify-between gap-4 text-rose-455 font-bold">
                              <span>🥪 Sandwich Exploits:</span>
                              <span>${sandwichVal.toLocaleString()} USD</span>
                            </div>
                            <div className="flex justify-between gap-4 text-cyan-455 font-bold">
                              <span>🤖 Arbitrage Loop:</span>
                              <span>${arbitrageVal.toLocaleString()} USD</span>
                            </div>
                            <div className="flex justify-between gap-4 border-t border-slate-900 pt-1 text-[8.5px] text-slate-400">
                              <span>Yield Premium Gap:</span>
                              <span className="text-white font-extrabold">${gapVal.toLocaleString()} ({leader === "Arbitrage" ? "Arb" : "Sand"} Lead)</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '8px', fontFamily: 'monospace', color: '#64748b', paddingTop: '10px' }} 
                    iconSize={8}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="Sandwich Attacks" 
                    stroke="#f43f5e" 
                    fillOpacity={1} 
                    fill="url(#colorSandwich)" 
                    strokeWidth={1.5}
                    name="Sandwich Attacks (USD)"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="Arbitrage" 
                    stroke="#06b6d4" 
                    fillOpacity={1} 
                    fill="url(#colorArbitrage)" 
                    strokeWidth={1.5}
                    name="Arbitrage Performance (USD)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-2 text-[8px] font-mono text-slate-500 flex items-center justify-between border-t border-slate-900/60 pt-2">
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> 
                Real-time dynamic data synced with global calendar constraints
              </span>
              <span className="text-cyan-455">
                Dominance Ratio ({activeWhale?.network === "Bitcoin" ? "BTC" : "DeFi"}): {
                  comparisonChartData.reduce((acc, curr) => acc + curr["Arbitrage"], 0) > 
                  comparisonChartData.reduce((acc, curr) => acc + curr["Sandwich Attacks"], 0)
                    ? "Arbitrage Core" : "Sandwich Heavy"
                }
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= BOTTOM MODULES: MEMPOOL TRANSACTION STREAMS ================= */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-900/80 space-y-4">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-900 pb-3">
          <div className="space-y-1">
            <span className="text-[9px] font-mono text-rose-455 font-bold uppercase block tracking-wider">
              REAL-TIME MEMPOOL BLOCK INSPECTION FEED
            </span>
            <h4 className="text-xs font-mono font-bold text-slate-100 uppercase tracking-tight flex items-center gap-1.5">
              <Activity className="h-4.5 w-4.5 text-rose-500 animate-pulse" /> Observed Arbitrage & Trade-skimming Events (实时MEV爆破日志流)
            </h4>
          </div>

          <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-[8.5px] font-mono text-slate-400">
            AUTO-POLLED BLX-NODES
          </span>
        </div>

        {/* Interactive Strategy Filter Checkboxes */}
        <div id="mempool-strategy-filters" className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900/30 p-3 rounded-lg border border-slate-900 font-mono text-[10px]">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-rose-500" />
            <span className="text-slate-200 font-bold uppercase tracking-wide">Filter MEV Strategies (过滤策略类型):</span>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            {([
              { id: "Sandwich Attack", label: "Sandwich Attack (夹子)", color: "accent-rose-500" },
              { id: "Arbitrage", label: "Arbitrage Loop (套利)", color: "accent-cyan-500" },
              { id: "Frontrunning", label: "Frontrunning (前跑)", color: "accent-amber-500" },
              { id: "Liquidation", label: "Liquidation (清算)", color: "accent-purple-500" }
            ]).map((strat) => {
              const isChecked = selectedStrategies.includes(strat.id);
              return (
                <label 
                  key={strat.id} 
                  className="flex items-center gap-1.5 cursor-pointer select-none group py-0.5"
                >
                  <input
                    type="checkbox"
                    id={`filter-checkbox-${strat.id.toLowerCase().replace(" ", "-")}`}
                    checked={isChecked}
                    onChange={() => {
                      setSelectedStrategies(prev => 
                        prev.includes(strat.id) 
                          ? prev.filter(s => s !== strat.id) 
                          : [...prev, strat.id]
                      );
                    }}
                    className={`h-3 w-3 bg-slate-950 border border-slate-800 rounded checked:bg-rose-500 checked:border-rose-500 focus:ring-0 cursor-pointer ${strat.color}`}
                  />
                  <span className={`text-[10px] font-semibold transition-colors duration-200 ${
                    isChecked ? "text-slate-100" : "text-slate-450 group-hover:text-slate-300"
                  }`}>
                    {strat.label}
                  </span>
                </label>
              );
            })}

            {/* Quick Helper controls */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <button
                type="button"
                id="btn-filter-all"
                onClick={() => setSelectedStrategies(["Sandwich Attack", "Arbitrage", "Frontrunning", "Liquidation"])}
                className="text-[9px] text-slate-500 hover:text-white underline cursor-pointer"
              >
                All
              </button>
              <button
                type="button"
                id="btn-filter-clear"
                onClick={() => setSelectedStrategies([])}
                className="text-[9px] text-slate-500 hover:text-white underline cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Transaction streams table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-[10px]">
            <thead>
              <tr className="border-b border-slate-900 text-slate-500 text-[8.5px] uppercase">
                <th className="py-2.5 px-2">TimeStamp</th>
                <th className="py-2.5 px-2">Network</th>
                <th className="py-2.5 px-2">Action Type</th>
                <th className="py-2.5 px-2">Target Account</th>
                <th className="py-2.5 px-2">Slippage Loss (USD)</th>
                <th className="py-2.5 px-2">Priority Fee / Jito Tip</th>
                <th className="py-2.5 px-2 text-right">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900/50">
              {filteredMevTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-550">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Sliders className="h-6 w-6 text-slate-750 animate-pulse" />
                      <p>No active MEV strategies matched (未匹配到任何套利交易策略条件)</p>
                      <button
                        type="button"
                        onClick={() => setSelectedStrategies(["Sandwich Attack", "Arbitrage", "Frontrunning", "Liquidation"])}
                        className="text-rose-455 hover:text-rose-300 underline text-[9.5px]"
                      >
                        Reset Strategy Filters (重置策略条件)
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredMevTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-900/30 transition-all">
                    <td className="py-3 px-2 text-slate-400">{tx.time}</td>
                     <td className="py-3 px-2 text-slate-200">
                      <span className={`px-1.5 py-0.5 rounded text-[7.5px] font-bold uppercase border ${
                        tx.network === "Solana" ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" :
                        tx.network === "Ethereum" ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" :
                        tx.network === "BNB Chain" ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" :
                        tx.network === "Arbitrum" ? "bg-blue-500/10 text-blue-400 border-blue-500/40" :
                        tx.network === "Base" ? "bg-sky-500/10 text-sky-450 border-sky-500/30" :
                        tx.network === "Avalanche" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                        tx.network === "Optimism" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                        tx.network === "Bitcoin" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                        "bg-slate-900 text-slate-400 border-slate-800"
                      }`}>
                        {tx.network}
                      </span>
                    </td>
                    <td className="py-3 px-2 font-bold text-rose-400 flex items-center gap-1">
                      <Zap className="h-3 w-3 text-rose-500 shrink-0" />
                      {tx.type}
                    </td>
                    <td className="py-3 px-2 text-slate-450">{tx.targetWhale.substring(0, 15)}...</td>
                    <td className="py-3 px-2">
                      {tx.lossUsd > 0 ? (
                        <span className="text-rose-455 font-bold">${tx.lossUsd}</span>
                      ) : (
                        <span className="text-slate-500">None</span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-slate-300">
                      {tx.network === "Solana" ? `${tx.tipSol} SOL` : tx.network === "Bitcoin" ? `${tx.tipSol / 100} BTC` : `${tx.tipSol} Gwei`}
                    </td>
                    <td className="py-3 px-2 text-right">
                      <button
                        type="button"
                        id={`audit-btn-${tx.id}`}
                        onClick={() => triggerAuditDetail(tx)}
                        className="px-2 py-0.5 bg-slate-900 hover:bg-slate-850 rounded border border-slate-850 hover:border-slate-700 text-[8.5px] text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1 ml-auto"
                      >
                        Audit Trace <ArrowRight className="h-2.5 w-2.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal slide trace out popover */}
        {isAuditModalOpen && auditedTx && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-950 border border-slate-850 rounded-2xl p-5 max-w-lg w-full space-y-4 shadow-2xl relative select-none">
              
              <button
                type="button"
                onClick={() => setIsAuditModalOpen(false)}
                className="absolute top-4 right-4 text-slate-500 hover:text-white cursor-pointer transition-colors"
              >
                <X className="h-4.5 w-4.5" />
              </button>

              <div className="space-y-1">
                <span className="text-[9px] font-mono text-rose-455 font-bold uppercase block tracking-wider">
                  MICROSTRUCTURAL TRANSACTION AUDIT REPORT
                </span>
                <h4 className="text-xs font-mono font-bold text-slate-100 uppercase tracking-tight flex items-center gap-1.5">
                  <Activity className="h-4.5 w-4.5 text-rose-50 animate-pulse" /> Log #{auditedTx.id} - Latency Profile
                </h4>
              </div>

              {/* Layout detail grid */}
              <div className="space-y-3 font-mono text-[9.5px] border-t border-b border-slate-900 py-3">
                <div className="grid grid-cols-2 gap-2 text-slate-400">
                  <div>Captured Epoch:</div> <div className="text-white font-bold">{auditedTx.time}</div>
                  <div>Target Network:</div> <div className="text-white font-bold">{auditedTx.network}</div>
                  <div>Audit Type:</div> <div className="text-rose-400 font-bold">{auditedTx.type}</div>
                  <div>Target Dex/AMM:</div> <div className="text-white">{auditedTx.targetDex}</div>
                  <div>Mempool Attack Latency:</div> <div className="text-cyan-400 font-bold">{auditedTx.attackSpeedMs} (Sub-Block)</div>
                  <div>Searcher Yield:</div> <div className="text-emerald-400 font-bold">${auditedTx.details.searcherYieldUsd} USD</div>
                  <div>Slippage Cap Crossed:</div> <div className="text-rose-400 font-bold">{auditedTx.details.slippageSuffered}</div>
                </div>

                {/* Bundle Transaction trace graph timeline */}
                <div className="space-y-2 border-t border-slate-900/80 pt-3">
                  <span className="text-[8.5px] font-mono text-slate-500 uppercase font-bold block">
                    Observed Block Bundle sequence (交易封包执行顺序):
                  </span>

                  <div className="space-y-1">
                    {/* Frontrun */}
                    <div className="bg-rose-500/5 p-2 rounded border border-rose-500/10 flex items-center justify-between text-[8px]">
                      <span className="font-bold text-rose-450 uppercase">Step 1: Searcher Frontrun (Buy Swap)</span>
                      <span className="text-slate-500">Hash: {auditedTx.details.frontrunHash}</span>
                    </div>
                    {/* Victim */}
                    <div className="bg-slate-905/75 p-2 rounded border border-slate-900 flex items-center justify-between text-[8px]">
                      <span className="font-bold text-slate-400 uppercase">Step 2: Victim Target swap (Large Slippage)</span>
                      <span className="text-slate-500">Hash: {auditedTx.details.victimHash}</span>
                    </div>
                    {/* Backrun */}
                    <div className="bg-emerald-500/5 p-2 rounded border border-emerald-500/10 flex items-center justify-between text-[8px]">
                      <span className="font-bold text-emerald-450 uppercase">Step 3: Searcher Backrun (Sell Swap)</span>
                      <span className="text-slate-500">Hash: {auditedTx.details.backrunHash}</span>
                    </div>
                  </div>
                </div>

                {/* Narrative description */}
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-850 text-slate-300 font-sans leading-relaxed text-[10.5px]">
                  <strong>Execution Post-Mortem Diagnosis:</strong>
                  <p className="mt-1 text-slate-405 leading-relaxed">
                    {auditedTx.details.narrative}
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setIsAuditModalOpen(false)}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-850 rounded border border-slate-800 text-[10px] font-mono text-slate-300 hover:text-white transition-all cursor-pointer"
                >
                  Close Diagnostic
                </button>
              </div>

            </div>
          </div>
        )}

      </div>

    </div>
  );
};
