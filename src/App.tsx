import React, { useState, useEffect, useRef } from "react";
import { 
  Terminal, 
  Activity, 
  Database, 
  AlertTriangle, 
  Cpu, 
  Zap, 
  Globe, 
  Search, 
  TrendingUp, 
  TrendingDown, 
  Layers, 
  Share2,
  RefreshCw,
  Info,
  Calendar,
  Maximize2,
  Minimize2
} from "lucide-react";
import { ResponsiveContainer, LineChart, Line, YAxis } from "recharts";
import { CURATED_WHALES } from "./data";
import { WhaleWallet, TickerPrice } from "./types";
import { WhaleAlertTicker } from "./components/WhaleAlertTicker";
import { WhaleComparisonMatrix } from "./components/WhaleComparisonMatrix";
import { WalletAnalysisSection } from "./components/WalletAnalysisSection";
import { MarketSimulatorSection } from "./components/MarketSimulatorSection";
import { AddressHoldingsHub } from "./components/AddressHoldingsHub";
import { CryptoPolicySection } from "./components/CryptoPolicySection";
import { InvestorReactionMonitor } from "./components/InvestorReactionMonitor";
import { MarketChartsTracker } from "./components/MarketChartsTracker";

// Generate realistic starting sequence representing fluctuations in preceding 15 minutes of trading activity
const generateInitialMockHistory = (basePrice: number, change24h: number): number[] => {
  const points: number[] = [];
  let current = basePrice * (1 - (change24h / 100) * 0.4);
  
  for (let i = 0; i < 15; i++) {
    const drift = change24h > 0 ? 0.0008 : -0.0008;
    const noise = (Math.random() - 0.5) * 0.0015;
    current = current * (1 + drift + noise);
    points.push(current);
  }
  points[points.length - 1] = basePrice;
  return points;
};

interface MicroSparklineProps {
  data: number[];
  color: string;
}

const MicroSparkline: React.FC<MicroSparklineProps> = ({ data, color }) => {
  if (!data || data.length === 0) return null;
  const chartData = data.map((val, idx) => ({ value: val, index: idx }));
  const minVal = Math.min(...data);
  const maxVal = Math.max(...data);
  const delta = maxVal - minVal;
  const padding = delta === 0 ? 0.01 : delta * 0.05;
  const yDomain = [minVal - padding, maxVal + padding];

  return (
    <div className="w-16 h-5 inline-block select-none opacity-85 hover:opacity-100 transition-opacity">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 1, bottom: 1, left: 1, right: 1 }}>
          <YAxis domain={yDomain} hide={true} />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.3}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Default initial prices to use if WebSocket is connecting or offline
const INITIAL_TICKERS: { [key: string]: TickerPrice } = {
  BTC: { symbol: "BTC", price: 95480, change24h: 1.85, high24h: 96200, low24h: 93800, volume24h: 28450102000 },
  ETH: { symbol: "ETH", price: 3450, change24h: -0.45, high24h: 3580, low24h: 3390, volume24h: 14502800000 },
  SOL: { symbol: "SOL", price: 178.5, change24h: 5.12, high24h: 182.4, low24h: 169.1, volume24h: 4892400000 },
  USDT: { symbol: "USDT", price: 1.0002, change24h: 0.01, high24h: 1.0015, low24h: 0.9985, volume24h: 52401800000 },
  USDC: { symbol: "USDC", price: 0.9998, change24h: -0.02, high24h: 1.0005, low24h: 0.9990, volume24h: 18450200000 },
  PYUSD: { symbol: "PYUSD", price: 1.0001, change24h: 0.00, high24h: 1.0005, low24h: 0.9995, volume24h: 150240000 },
  USD1: { symbol: "USD1", price: 1.0000, change24h: 0.00, high24h: 1.0002, low24h: 0.9998, volume24h: 42800000 },
  USDS: { symbol: "USDS", price: 1.0003, change24h: 0.01, high24h: 1.0009, low24h: 0.9995, volume24h: 958040000 },
  DAI: { symbol: "DAI", price: 0.9999, change24h: -0.01, high24h: 1.0008, low24h: 0.9991, volume24h: 1840250000 },
  USDe: { symbol: "USDe", price: 1.0004, change24h: 0.03, high24h: 1.0019, low24h: 0.9982, volume24h: 2145700000 },
  PAXG: { symbol: "PAXG", price: 2355.50, change24h: 0.15, high24h: 2365.00, low24h: 2345.00, volume24h: 84200000 }
};

export default function App() {
  const [prices, setPrices] = useState<{ [key: string]: number }>({
    BTC: INITIAL_TICKERS.BTC.price,
    ETH: INITIAL_TICKERS.ETH.price,
    SOL: INITIAL_TICKERS.SOL.price,
    USDT: INITIAL_TICKERS.USDT.price,
    USDC: INITIAL_TICKERS.USDC.price,
    PYUSD: INITIAL_TICKERS.PYUSD.price,
    USD1: INITIAL_TICKERS.USD1.price,
    USDS: INITIAL_TICKERS.USDS.price,
    DAI: INITIAL_TICKERS.DAI.price,
    USDe: INITIAL_TICKERS.USDe.price,
    PAXG: INITIAL_TICKERS.PAXG.price
  });

  const [tickers, setTickers] = useState<{ [key: string]: TickerPrice }>(INITIAL_TICKERS);
  const [wsStatus, setWsStatus] = useState<"connecting" | "online" | "fallback">("connecting");
  const [selectedWallet, setSelectedWallet] = useState<WhaleWallet>(CURATED_WHALES[0]);
  const [lastTickAsset, setLastTickAsset] = useState<{ symbol: string; direction: "up" | "down" } | null>(null);

  // Maintain sliding price histories for 15-minute momentum sparkline visualizer
  const [tickerHistories, setTickerHistories] = useState<{ [key: string]: number[] }>(() => {
    const initial: { [key: string]: number[] } = {};
    Object.keys(INITIAL_TICKERS).forEach(key => {
      initial[key] = generateInitialMockHistory(INITIAL_TICKERS[key].price, INITIAL_TICKERS[key].change24h);
    });
    return initial;
  });

  // Keep both tickerHistories and active ticker prices synchronized when prices change (WebSocket/Fallback updates)
  useEffect(() => {
    setTickerHistories(prev => {
      const updated = { ...prev };
      let changed = false;
      Object.keys(prices).forEach((key) => {
        const currentPrice = prices[key];
        const historyList = updated[key] || [];
        const lastInHistory = historyList[historyList.length - 1];
        if (currentPrice !== lastInHistory) {
          const newHistory = [...historyList, currentPrice];
          // Keep a maximum of 30 frames representing high-vibe momentum signals
          updated[key] = newHistory.length > 30 ? newHistory.slice(newHistory.length - 30) : newHistory;
          changed = true;
        }
      });
      return changed ? updated : prev;
    });

    setTickers(prev => {
      const updated = { ...prev };
      let changed = false;
      Object.keys(prices).forEach((key) => {
        if (updated[key] && updated[key].price !== prices[key]) {
          const baseChange = INITIAL_TICKERS[key]?.change24h || 0;
          const currentPrice = prices[key];
          const initialPrice = INITIAL_TICKERS[key]?.price || currentPrice;
          const percentageOffset = ((currentPrice - initialPrice) / initialPrice) * 100;
          
          updated[key] = {
            ...updated[key],
            price: currentPrice,
            change24h: baseChange + percentageOffset
          };
          changed = true;
        }
      });
      return changed ? updated : prev;
    });
  }, [prices]);

  // Simulator preset parameters (driven by shortcuts on components)
  const [simPresetAsset, setSimPresetAsset] = useState<string>("ETH");
  const [simPresetAmount, setSimPresetAmount] = useState<number>(25000);

  // Active volume indicators
  const [aggregate24hVol, setAggregate24hVol] = useState<number>(118697302000);
  const [totalAlertsObserved, setTotalAlertsObserved] = useState<number>(1284);

  // Global Time Horizon state configuration (ranges around simulated core May 2026 dataset)
  const [globalTimeHorizon, setGlobalTimeHorizon] = useState<{ startDate: string; endDate: string }>({
    startDate: "2026-05-01",
    endDate: "2026-05-31"
  });

  // Global View Mode state - 'all' renders full cohesive workspace grid, while specific IDs render singular focus mode
  const [activeSection, setActiveSection] = useState<string>("all");

  // Reference hooks
  const wsRef = useRef<WebSocket | null>(null);

  // Global sound / visual notifications stats
  useEffect(() => {
    // Increment total alerts counters periodically to show activity
    const timer = setInterval(() => {
      setTotalAlertsObserved(prev => prev + 1);
    }, 11000);
    return () => clearInterval(timer);
  }, []);

  // Set up Binance Live WebSocket feeds for prices
  useEffect(() => {
    setWsStatus("connecting");
    const wsUrl = "wss://stream.binance.com:9443/ws/btcusdt@ticker/ethusdt@ticker/solusdt@ticker/bnbusdt@ticker";
    
    let isMounted = true;
    const connectWs = () => {
      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          if (isMounted) setWsStatus("online");
          console.log("Connected to Binance Exchange WebSocket Stream.");
        };

        ws.onmessage = (event) => {
          if (!isMounted) return;
          try {
            const data = JSON.parse(event.data);
            const rawSymbol = data.s; // e.g. BTCUSDT, ETHUSDT
            let cleanSymbol = "";

            if (rawSymbol === "BTCUSDT") cleanSymbol = "BTC";
            else if (rawSymbol === "ETHUSDT") cleanSymbol = "ETH";
            else if (rawSymbol === "SOLUSDT") cleanSymbol = "SOL";
            else if (rawSymbol === "BNBUSDT") cleanSymbol = "BNB";

            if (cleanSymbol) {
              const prevPrice = prices[cleanSymbol] || 0;
              const nextPrice = parseFloat(data.c);
              const changePerc = parseFloat(data.P);

              setPrices(prev => ({
                ...prev,
                [cleanSymbol]: nextPrice
              }));

              setTickers(prev => ({
                ...prev,
                [cleanSymbol]: {
                  symbol: cleanSymbol,
                  price: nextPrice,
                  change24h: changePerc,
                  high24h: parseFloat(data.h),
                  low24h: parseFloat(data.l),
                  volume24h: parseFloat(data.q) // Quote asset volume (USDT)
                }
              }));

              // Spark visualization indicator
              if (prevPrice > 0 && nextPrice !== prevPrice) {
                setLastTickAsset({
                  symbol: cleanSymbol,
                  direction: nextPrice > prevPrice ? "up" : "down"
                });
              }
            }
          } catch (err) {
            console.error("Error parsing Websocket message", err);
          }
        };

        ws.onerror = () => {
          if (isMounted) {
            setWsStatus("fallback");
            startFallbackPoller();
          }
        };

        ws.onclose = () => {
          if (isMounted && wsStatus === "online") {
            setWsStatus("connecting");
            setTimeout(connectWs, 5000); // retry connect
          }
        };
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setWsStatus("fallback");
          startFallbackPoller();
        }
      }
    };

    connectWs();

    // Fallback Mock ticking process if WS fails/blocked
    let fallbackInterval: NodeJS.Timeout | null = null;
    const startFallbackPoller = () => {
      fallbackInterval = setInterval(() => {
        if (!isMounted) return;
        setPrices(prev => {
          const updated = { ...prev };
          const keys = ["BTC", "ETH", "SOL"];
          const selected = keys[Math.floor(Math.random() * keys.length)];
          const delta = (Math.random() - 0.495) * (selected === "BTC" ? 65 : selected === "ETH" ? 4 : 0.4);
          updated[selected] = Math.max(1, prev[selected] + delta);
          
          setLastTickAsset({
            symbol: selected,
            direction: delta > 0 ? "up" : "down"
          });

          // Infrequently generate minor movements in other stable assets so micro-sparklines render dynamic variations
          Object.keys(updated).forEach(k => {
            if (k !== "BTC" && k !== "ETH" && k !== "SOL") {
              if (Math.random() < 0.25) {
                const step = k === "PAXG" ? (Math.random() - 0.5) * 1.5 : (Math.random() - 0.5) * 0.00015;
                updated[k] = Math.max(0.001, updated[k] + step);
              }
            }
          });

          return updated;
        });
      }, 3505);
    };

    return () => {
      isMounted = false;
      if (wsRef.current) wsRef.current.close();
      if (fallbackInterval) clearInterval(fallbackInterval);
    };
  }, []);

  // Scroll function to navigate UI smoothly
  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Launch address selection from tickers/alerts
  const handleSelectAddress = (addressOrLabel: string) => {
    // Try to find if address matches a curated whale
    const foundByAddress = CURATED_WHALES.find(w => w.address === addressOrLabel);
    const foundByLabel = CURATED_WHALES.find(w => w.blockchainLabel.toLowerCase().includes(addressOrLabel.toLowerCase()));
    
    if (foundByAddress) {
      setSelectedWallet(foundByAddress);
      scrollToId("wallet-diagnostics-section");
    } else if (foundByLabel) {
      setSelectedWallet(foundByLabel);
      scrollToId("wallet-diagnostics-section");
    } else {
      // Create a temporary ad-hoc wallet to analyze!
      const adHocWallet: WhaleWallet = {
        address: addressOrLabel,
        blockchainLabel: "Interlinked Peer (Inferred Entity)",
        network: "Ethereum",
        initialBalance: "3,810 ETH",
        txCount: 421,
        age: "1.5 years",
        riskRating: "Medium",
        isExchange: false,
        notes: "Identified via trans-onchain router maps. Dynamic routing address.",
        assetBalances: [
          { symbol: "ETH", amount: 3810, valueUsd: 3810 * (prices.ETH || 3400) },
          { symbol: "USDT", amount: 450000, valueUsd: 450000 }
        ]
      };
      setSelectedWallet(adHocWallet);
      scrollToId("wallet-diagnostics-section");
    }
  };

  const handleShortcutSimulate = (assetSymbol: string, amountToDump: number) => {
    setSimPresetAsset(assetSymbol);
    setSimPresetAmount(amountToDump);
    scrollToId("liquidity-simulator-section");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      
      {/* 1. Global Streaming Exchange Ticker Strip */}
      <div className="bg-slate-950 border-b border-slate-900 px-4 py-2 text-xs font-mono flex items-center justify-between gap-4 overflow-hidden">
        <div className="flex items-center gap-2 flex-shrink-0">
          <Activity className="h-4 w-4 text-cyan-400 animate-pulse" />
          <span className="text-slate-400 uppercase tracking-widest text-[10px] font-bold">LIVE STREAMS:</span>
        </div>

        <div className="flex-1 flex gap-6 overflow-x-auto select-none no-scrollbar py-0.5" style={{ scrollbarWidth: 'none' }}>
          {(Object.values(tickers) as TickerPrice[]).map((t) => {
            const isTargetTick = lastTickAsset?.symbol === t.symbol;
            const flashColor = lastTickAsset?.direction === "up" ? "text-emerald-400" : "text-red-400";
            const history = tickerHistories[t.symbol] || [t.price];
            const isUpTrend = history.length > 1 ? history[history.length - 1] >= history[0] : t.change24h >= 0;
            const trendColor = isUpTrend ? "#10b981" : "#f43f5e"; // bright emerald or radiant pink-red

            return (
              <div 
                key={t.symbol} 
                className={`flex items-center gap-2.5 transition-all duration-300 px-2 py-1 rounded-md border border-transparent ${
                  isTargetTick ? "bg-slate-900 border-slate-800 scale-[1.03] shadow-md shadow-cyan-950/20" : "hover:bg-slate-900/40"
                }`}
              >
                <span className="text-slate-400 font-bold text-[10.5px]">{t.symbol}/USD</span>
                <span className={`font-mono font-bold text-[11px] ${isTargetTick ? flashColor : "text-slate-100"}`}>
                  ${t.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                </span>
                
                {/* Micro-sparkline visualizing high-fidelity momentum & price pressure over preceding 15 minutes */}
                <div className="flex items-center gap-1.5 pl-2 border-l border-slate-900/80">
                  <span className="text-[8px] text-slate-500 uppercase tracking-widest font-extrabold select-none">15M MOM:</span>
                  <MicroSparkline data={history} color={trendColor} />
                  <span className={`text-[9.5px] font-mono font-bold ${t.change24h >= 0 ? "text-emerald-400" : "text-rose-400"} flex items-center gap-0.5`}>
                    {t.change24h >= 0 ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                    {t.change24h >= 0 ? "+" : ""}{t.change24h.toFixed(2)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sync Status Badge */}
        <div className="hidden md:flex items-center gap-2 flex-shrink-0">
          <Globe className={`h-3 w-3 ${wsStatus === "online" ? "text-emerald-400 animate-spin" : "text-amber-500 animate-pulse"}`} />
          <span className="text-[10px] tracking-wider uppercase text-slate-400">
            {wsStatus === "online" ? "BINANCE WS STREAM ONLINE" : "REST TICKING SYNC"}
          </span>
        </div>
      </div>

      {/* 2. Primary Navigation / Terminal Header */}
      <header className="bg-slate-950 p-5 border-b border-slate-900 shadow-xl" id="cyber-header">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-cyan-600 to-indigo-600 rounded-lg text-slate-950 shadow-lg shadow-cyan-500/10">
              <Terminal className="h-6 w-6 text-slate-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[9px] font-mono tracking-widest text-emerald-400 font-bold uppercase">QUANT TELEMETRY v3.25</span>
              </div>
              <h1 className="text-xl font-mono font-black tracking-tighter text-slate-100 flex items-center gap-1.5">
                WHALETRACK <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">PRO</span>
              </h1>
            </div>
          </div>

          {/* Quick Metrics stats block */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-900 w-full md:w-auto">
            <div className="px-3 py-1 font-mono">
              <span className="text-[9px] text-slate-500 block uppercase">24h Monitored vol</span>
              <span className="text-xs text-slate-300 font-bold">${(aggregate24hVol / 1000000000).toFixed(1)}B USD</span>
            </div>
            <div className="px-3 py-1 font-mono">
              <span className="text-[9px] text-slate-500 block uppercase font-medium">Observative Scope</span>
              <span className="text-xs text-slate-300 font-bold">{totalAlertsObserved} Whale alerts</span>
            </div>
            <div className="px-3 py-1 font-mono">
              <span className="text-[9px] text-slate-500 block uppercase">Net Reserve Index</span>
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-0.5">
                +1.8% Accum.
              </span>
            </div>
            <div className="px-3 py-1 font-mono">
              <span className="text-[9px] text-slate-500 block uppercase">Engine Stability</span>
              <span className="text-xs text-cyan-400 font-bold uppercase">100% SECURE</span>
            </div>
          </div>

        </div>
      </header>

      {/* 3. Primary Grid Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 space-y-6">
        
        {/* Intro banner */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-inner">
          <div className="flex items-start gap-2.5">
            <Info className="h-4.5 w-4.5 text-cyan-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              Welcome to the elite crypto whale behavioral diagnostics desk. Toggle networks, analyze concentration indexes of stablecoins vs major high-cap assets, scan wallet transactions with <strong>Gemini AI Intelligence</strong>, and stress-test slippage impacts under thin-liquidity order books.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={() => scrollToId("onchain-accumulation-hub")} 
              className="text-xs font-mono text-cyan-405 hover:text-cyan-300 hover:underline flex-shrink-0 font-bold cursor-pointer"
            >
              SCAN TOP 200 NODES 📊
            </button>
            <span className="text-slate-800 text-xs hidden sm:inline">•</span>
            <button 
              onClick={() => scrollToId("whale-alert-feed")} 
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 hover:underline flex-shrink-0 font-bold cursor-pointer"
            >
              LAUNCH INGESTION feed 🔮
            </button>
            <span className="text-slate-800 text-xs hidden sm:inline">•</span>
            <button 
              onClick={() => scrollToId("crypto-us-policy-analysis")} 
              className="text-xs font-mono text-amber-505 hover:text-amber-405 hover:underline flex-shrink-0 font-bold cursor-pointer"
            >
              POLICY ANALYSIS 🏛️
            </button>
            <span className="text-slate-800 text-xs hidden sm:inline">•</span>
            <button 
              onClick={() => scrollToId("market-volume-charts-section")} 
              className="text-xs font-mono text-violet-400 hover:text-violet-300 hover:underline flex-shrink-0 font-bold cursor-pointer"
            >
              VOLUME & PEGS 📈
            </button>
            <span className="text-slate-800 text-xs hidden sm:inline">•</span>
            <button 
              onClick={() => scrollToId("investor-reaction-monitor-section")} 
              className="text-xs font-mono text-rose-450 hover:text-rose-400 hover:underline flex-shrink-0 font-bold cursor-pointer"
            >
              INVESTOR SENTIMENT 👥
            </button>
          </div>
        </div>

        {/* GLOBAL TIME HORIZON DATE CONTROLLER */}
        <div id="global-time-horizon-picker" className="bg-slate-900 border border-slate-800/80 rounded-xl p-4 lg:p-5 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-cyan-950/40 border border-cyan-500/20 rounded-md text-cyan-400">
                <Calendar className="h-4.5 w-4.5" />
              </div>
              <div>
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                  Global Time Horizon Date Ingestion Filter
                </h2>
                <p className="text-[10px] text-slate-500 font-mono">
                  Bridges synchronous data pipelines across Market Charts, Investor Reaction, and Discussion panels
                </p>
              </div>
            </div>
            
            {/* Live Pipeline status feedback badge */}
            <div className="flex items-center gap-2 text-[10px] bg-slate-950/60 p-2 rounded-lg border border-slate-850 font-mono">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-slate-400">FILTER STATUS:</span>
              <strong className="text-cyan-400 font-bold uppercase">
                {Math.round((new Date(globalTimeHorizon.endDate).getTime() - new Date(globalTimeHorizon.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1}D Spectrum Active
              </strong>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            
            {/* Core Datetime Pickers */}
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                <span className="text-[10px] font-mono text-slate-500 uppercase px-1.5 font-bold">Start Date:</span>
                <input 
                  type="date" 
                  value={globalTimeHorizon.startDate}
                  min="2026-02-15"
                  max="2026-05-31"
                  onChange={(e) => setGlobalTimeHorizon(prev => ({ ...prev, startDate: e.target.value }))}
                  className="bg-transparent border-0 text-xs font-mono text-slate-200 focus:ring-0 focus:outline-none p-0 cursor-pointer"
                />
              </div>

              <div className="text-slate-700 hidden sm:inline">⟶</div>

              <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                <span className="text-[10px] font-mono text-slate-500 uppercase px-1.5 font-bold">End Date:</span>
                <input 
                  type="date" 
                  value={globalTimeHorizon.endDate}
                  min="2026-02-15"
                  max="2026-05-31"
                  onChange={(e) => setGlobalTimeHorizon(prev => ({ ...prev, endDate: e.target.value }))}
                  className="bg-transparent border-0 text-xs font-mono text-slate-200 focus:ring-0 focus:outline-none p-0 cursor-pointer"
                />
              </div>

              {/* Reset to Default full May */}
              {(globalTimeHorizon.startDate !== "2026-05-01" || globalTimeHorizon.endDate !== "2026-05-31") && (
                <button
                  type="button"
                  onClick={() => setGlobalTimeHorizon({ startDate: "2026-05-01", endDate: "2026-05-31" })}
                  className="text-[10px] font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-2 py-1 rounded cursor-pointer transition"
                >
                  Reset Full May ↺
                </button>
              )}
            </div>

            {/* Tactile presets */}
            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-start lg:justify-end">
              <span className="text-[10px] font-mono text-slate-500 font-medium whitespace-nowrap">Presets:</span>
              
              <button
                type="button"
                onClick={() => setGlobalTimeHorizon({ startDate: "2026-05-24", endDate: "2026-05-31" })}
                className={`text-[10px] font-mono p-1 px-2.5 rounded border cursor-pointer transition ${
                  globalTimeHorizon.startDate === "2026-05-24" && globalTimeHorizon.endDate === "2026-05-31"
                    ? "border-cyan-500 bg-cyan-500/10 text-cyan-400 font-bold"
                    : "border-slate-800 hover:border-slate-705 bg-slate-950 text-slate-400 hover:text-slate-200"
                }`}
              >
                Last 7 Days
              </button>

              <button
                type="button"
                onClick={() => setGlobalTimeHorizon({ startDate: "2026-05-15", endDate: "2026-05-31" })}
                className={`text-[10px] font-mono p-1 px-2.5 rounded border cursor-pointer transition ${
                  globalTimeHorizon.startDate === "2026-05-15" && globalTimeHorizon.endDate === "2026-05-31"
                    ? "border-cyan-500 bg-cyan-500/10 text-cyan-400 font-bold"
                    : "border-slate-800 hover:border-slate-705 bg-slate-950 text-slate-400 hover:text-slate-200"
                }`}
              >
                Mid-Late May
              </button>

              <button
                type="button"
                onClick={() => setGlobalTimeHorizon({ startDate: "2026-05-01", endDate: "2026-05-31" })}
                className={`text-[10px] font-mono p-1 px-2.5 rounded border cursor-pointer transition ${
                  globalTimeHorizon.startDate === "2026-05-01" && globalTimeHorizon.endDate === "2026-05-31"
                    ? "border-cyan-500 bg-cyan-500/10 text-cyan-400 font-bold"
                    : "border-slate-800 hover:border-slate-705 bg-slate-950 text-slate-400 hover:text-slate-200"
                }`}
              >
                Full May Range
              </button>

              <button
                type="button"
                onClick={() => setGlobalTimeHorizon({ startDate: "2026-03-01", endDate: "2026-05-31" })}
                className={`text-[10px] font-mono p-1 px-2.5 rounded border cursor-pointer transition ${
                  globalTimeHorizon.startDate === "2026-03-01" && globalTimeHorizon.endDate === "2026-05-31"
                    ? "border-cyan-500 bg-cyan-500/10 text-cyan-400 font-bold"
                    : "border-slate-800 hover:border-slate-705 bg-slate-950 text-slate-400 hover:text-slate-200"
                }`}
              >
                90-Day Deep
              </button>
            </div>

          </div>
        </div>

        {/* 🎛️ CORES OPERATIONS SWITCHBOARD CONTROL PANEL */}
        <div id="system-switchboard-control-deck" className="bg-slate-900 border border-slate-800 rounded-xl p-4 lg:p-5 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="h-4.5 w-4.5 text-cyan-400 animate-pulse" />
              <div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                  Adaptive System Switchboard Control Deck
                </h3>
                <p className="text-[10px] text-slate-500 font-mono">
                  Isolate singular focus panes or toggle full multi-variable ledger workspace matrix with zero lag
                </p>
              </div>
            </div>
            <div className="text-[9px] font-mono bg-slate-950 px-2.5 py-1 rounded border border-slate-850 text-slate-400">
              CURRENT INTERFACE MODE: <span className="text-cyan-400 font-bold uppercase">{activeSection === "all" ? "UNIFIED CORE GRID" : `FOCUS ENGINE [${activeSection.toUpperCase()}]`}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {[
              { id: "all", name: "All Operations", icon: Layers, accent: "border-cyan-500/80 bg-cyan-950/20 text-cyan-400 font-black" },
              { id: "streams", name: "Inflow Streams", icon: Activity, accent: "border-emerald-500/50 bg-emerald-950/25 text-emerald-300 font-bold" },
              { id: "matrix", name: "Whale Matrix", icon: Database, accent: "border-cyan-500/50 bg-cyan-950/25 text-cyan-300 font-bold" },
              { id: "explorer", name: "Entity Explorer", icon: Search, accent: "border-indigo-500/50 bg-indigo-950/25 text-indigo-300 font-bold" },
              { id: "hub", name: "Holdings Hub", icon: Globe, accent: "border-purple-500/50 bg-purple-950/25 text-purple-300 font-bold" },
              { id: "charts", name: "Volume & Pegs", icon: TrendingUp, accent: "border-rose-500/50 bg-rose-950/25 text-rose-300 font-bold" },
              { id: "policy", name: "Policy Desk", icon: Cpu, accent: "border-amber-500/50 bg-amber-950/25 text-amber-300 font-bold" },
              { id: "sentiment", name: "Investor Sentiment", icon: Zap, accent: "border-violet-500/50 bg-violet-950/25 text-violet-300 font-bold" },
              { id: "simulator", name: "Slippage Simulator", icon: AlertTriangle, accent: "border-sky-500/50 bg-sky-950/25 text-sky-300 font-bold" }
            ].map((tab) => {
              const TabIcon = tab.icon;
              const isSelected = activeSection === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveSection(tab.id);
                    scrollToId("global-time-horizon-picker");
                  }}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-[11px] font-mono transition-all uppercase cursor-pointer ${
                    isSelected 
                      ? tab.accent + " scale-[1.02] shadow-lg shadow-black/40" 
                      : "bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                  }`}
                >
                  <TabIcon className="h-3.5 w-3.5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 🔮 MULTI-PERSPECTIVE WORKSPACE ROUTER */}
        <div id="workspace-dynamic-viewport" className="space-y-6">

          {/* 1. SECTOR INDEX: Live Inflow Streams Ledger */}
          {(activeSection === "all" || activeSection === "streams") && (
            <div id="streams-view-card" className="space-y-1">
              <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-t-xl px-4 py-2 border-b-0 font-mono text-[10px] text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="font-bold tracking-wider uppercase text-slate-350">
                    SECTOR INDEX 01: Blockchain Inflow & Ingestion Logs
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {activeSection === "streams" ? (
                    <button
                      onClick={() => setActiveSection("all")}
                      className="flex items-center gap-1 px-2.5 py-1 rounded border border-slate-700 hover:border-slate-500 bg-slate-950 hover:text-white font-mono text-[10px] cursor-pointer text-slate-400"
                    >
                      <Minimize2 className="h-3 w-3 text-amber-400" />
                      <span>EXIT FOCUS MODE (SHOW ALL)</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setActiveSection("streams");
                        scrollToId("global-time-horizon-picker");
                      }}
                      className="flex items-center gap-1 px-2 py-0.5 rounded border border-slate-850 hover:border-slate-700 bg-slate-950 hover:text-cyan-400 font-mono text-[9px] cursor-pointer text-slate-500"
                      title="Enter exclusive focus view"
                    >
                      <Maximize2 className="h-2.5 w-2.5" />
                      <span>FOCUS VIEW ⛶</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Optimised Adaptive Grid Spanning: Gives STREAMS 8 columns (wider) and MATRIX 4 columns under standard view */}
              {activeSection === "all" ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  <div className="lg:col-span-8 h-full">
                    <WhaleAlertTicker 
                      onSelectAddress={handleSelectAddress}
                      currentPrices={prices}
                      tickers={tickers}
                    />
                  </div>
                  <div className="lg:col-span-4 h-full">
                    {/* Compact embedded preview header inside sub-column */}
                    <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-t-xl px-3 py-1.5 border-b-0 font-mono text-[9px] text-slate-500">
                      <span>ON-CHAIN COHORT MATRIX</span>
                      <button
                        onClick={() => setActiveSection("matrix")}
                        className="text-[8px] uppercase underline text-cyan-400 hover:text-cyan-300"
                      >
                        FOCUS
                      </button>
                    </div>
                    <WhaleComparisonMatrix 
                      onAnalyzeWallet={(wallet) => {
                        setSelectedWallet(wallet);
                        scrollToId("wallet-diagnostics-section");
                      }}
                      onSimulateImpact={handleShortcutSimulate}
                      tickers={tickers}
                    />
                  </div>
                </div>
              ) : (
                <div className="w-full">
                  <WhaleAlertTicker 
                    onSelectAddress={handleSelectAddress}
                    currentPrices={prices}
                    tickers={tickers}
                  />
                </div>
              )}
            </div>
          )}

          {/* 2. SECTOR INDEX: On-Chain Concentration Matrix */}
          {activeSection === "matrix" && (
            <div id="matrix-focus-card" className="space-y-1">
              <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-t-xl px-4 py-2 border-b-0 font-mono text-[10px] text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400"></span>
                  <span className="font-bold tracking-wider uppercase text-slate-350">
                    SECTOR INDEX 02: On-Chain Concentration Matrix (Focus Module)
                  </span>
                </div>
                <button
                  onClick={() => setActiveSection("all")}
                  className="flex items-center gap-1 px-2.5 py-1 rounded border border-slate-700 hover:border-slate-500 bg-slate-950 hover:text-white font-mono text-[10px] cursor-pointer text-slate-400"
                >
                  <Minimize2 className="h-3 w-3 text-amber-400" />
                  <span>EXIT FOCUS MODE (SHOW ALL)</span>
                </button>
              </div>
              <WhaleComparisonMatrix 
                onAnalyzeWallet={(wallet) => {
                  setSelectedWallet(wallet);
                  scrollToId("wallet-diagnostics-section");
                }}
                onSimulateImpact={handleShortcutSimulate}
                tickers={tickers}
              />
            </div>
          )}

          {/* 3. SECTOR INDEX: Detailed Wallet Analysis Explorer */}
          {(activeSection === "all" || activeSection === "explorer") && (
            <div id="explorer-view-card" className="space-y-1">
              <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-t-xl px-4 py-2 border-b-0 font-mono text-[10px] text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-400"></span>
                  <span className="font-bold tracking-wider uppercase text-slate-350">
                    SECTOR INDEX 03: Entity Portfolio Diagnostics & Explorer
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {activeSection === "explorer" ? (
                    <button
                      onClick={() => setActiveSection("all")}
                      className="flex items-center gap-1 px-2.5 py-1 rounded border border-slate-700 hover:border-slate-500 bg-slate-950 hover:text-white font-mono text-[10px] cursor-pointer text-slate-400"
                    >
                      <Minimize2 className="h-3 w-3 text-amber-400" />
                      <span>EXIT FOCUS MODE (SHOW ALL)</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setActiveSection("explorer");
                        scrollToId("global-time-horizon-picker");
                      }}
                      className="flex items-center gap-1 px-2 py-0.5 rounded border border-slate-850 hover:border-slate-700 bg-slate-950 hover:text-cyan-400 font-mono text-[9px] cursor-pointer text-slate-500"
                    >
                      <Maximize2 className="h-2.5 w-2.5" />
                      <span>FOCUS VIEW ⛶</span>
                    </button>
                  )}
                </div>
              </div>
              <WalletAnalysisSection 
                selectedWallet={selectedWallet}
              />
            </div>
          )}

          {/* 4. SECTOR INDEX: Address Holdings and Volume Metrics Hub */}
          {(activeSection === "all" || activeSection === "hub") && (
            <div id="hub-view-card" className="space-y-1">
              <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-t-xl px-4 py-2 border-b-0 font-mono text-[10px] text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-purple-400"></span>
                  <span className="font-bold tracking-wider uppercase text-slate-350">
                    SECTOR INDEX 04: Dynamic Blockchain Peer Cluster Holdings Hub
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {activeSection === "hub" ? (
                    <button
                      onClick={() => setActiveSection("all")}
                      className="flex items-center gap-1 px-2.5 py-1 rounded border border-slate-700 hover:border-slate-500 bg-slate-950 hover:text-white font-mono text-[10px] cursor-pointer text-slate-400"
                    >
                      <Minimize2 className="h-3 w-3 text-amber-400" />
                      <span>EXIT FOCUS MODE (SHOW ALL)</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setActiveSection("hub");
                        scrollToId("global-time-horizon-picker");
                      }}
                      className="flex items-center gap-1 px-2 py-0.5 rounded border border-slate-850 hover:border-slate-700 bg-slate-950 hover:text-cyan-400 font-mono text-[9px] cursor-pointer text-slate-500"
                    >
                      <Maximize2 className="h-2.5 w-2.5" />
                      <span>FOCUS VIEW ⛶</span>
                    </button>
                  )}
                </div>
              </div>
              <AddressHoldingsHub 
                currentPrices={prices}
                onSelectAddress={handleSelectAddress}
              />
            </div>
          )}

          {/* 5. SECTOR INDEX: On-Chain Volume & Stablecoin Peg Deviation Analytics */}
          {(activeSection === "all" || activeSection === "charts") && (
            <div id="charts-view-card" className="space-y-1">
              <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-t-xl px-4 py-2 border-b-0 font-mono text-[10px] text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-400"></span>
                  <span className="font-bold tracking-wider uppercase text-slate-350">
                    SECTOR INDEX 05: Aggregate Volumetrical Flow & De-Peg Tracker
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {activeSection === "charts" ? (
                    <button
                      onClick={() => setActiveSection("all")}
                      className="flex items-center gap-1 px-2.5 py-1 rounded border border-slate-700 hover:border-slate-500 bg-slate-950 hover:text-white font-mono text-[10px] cursor-pointer text-slate-400"
                    >
                      <Minimize2 className="h-3 w-3 text-amber-400" />
                      <span>EXIT FOCUS MODE (SHOW ALL)</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setActiveSection("charts");
                        scrollToId("global-time-horizon-picker");
                      }}
                      className="flex items-center gap-1 px-2 py-0.5 rounded border border-slate-850 hover:border-slate-700 bg-slate-950 hover:text-cyan-400 font-mono text-[9px] cursor-pointer text-slate-500"
                    >
                      <Maximize2 className="h-2.5 w-2.5" />
                      <span>FOCUS VIEW ⛶</span>
                    </button>
                  )}
                </div>
              </div>
              <MarketChartsTracker currentPrices={prices} globalTimeHorizon={globalTimeHorizon} />
            </div>
          )}

          {/* 6. SECTOR INDEX: US Crypto Policy & Legislative Analytics Desk */}
          {(activeSection === "all" || activeSection === "policy") && (
            <div id="policy-view-card" className="space-y-1">
              <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-t-xl px-4 py-2 border-b-0 font-mono text-[10px] text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400"></span>
                  <span className="font-bold tracking-wider uppercase text-slate-350">
                    SECTOR INDEX 06: Federal Crypto Legislative Analytics & Policy Outlook
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {activeSection === "policy" ? (
                    <button
                      onClick={() => setActiveSection("all")}
                      className="flex items-center gap-1 px-2.5 py-1 rounded border border-slate-700 hover:border-slate-500 bg-slate-950 hover:text-white font-mono text-[10px] cursor-pointer text-slate-400"
                    >
                      <Minimize2 className="h-3 w-3 text-amber-400" />
                      <span>EXIT FOCUS MODE (SHOW ALL)</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setActiveSection("policy");
                        scrollToId("global-time-horizon-picker");
                      }}
                      className="flex items-center gap-1 px-2 py-0.5 rounded border border-slate-850 hover:border-slate-700 bg-slate-950 hover:text-cyan-400 font-mono text-[9px] cursor-pointer text-slate-500"
                    >
                      <Maximize2 className="h-2.5 w-2.5" />
                      <span>FOCUS VIEW ⛶</span>
                    </button>
                  )}
                </div>
              </div>
              <CryptoPolicySection />
            </div>
          )}

          {/* 7. SECTOR INDEX: Multi-Perspective Area Reaction Analytics (Investor Sentiment) */}
          {(activeSection === "all" || activeSection === "sentiment") && (
            <div id="sentiment-view-card" className="space-y-1">
              <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-t-xl px-4 py-2 border-b-0 font-mono text-[10px] text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-400"></span>
                  <span className="font-bold tracking-wider uppercase text-slate-350">
                    SECTOR INDEX 07: Market Cohorts Sentiment Matrix & Export
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {activeSection === "sentiment" ? (
                    <button
                      onClick={() => setActiveSection("all")}
                      className="flex items-center gap-1 px-2.5 py-1 rounded border border-slate-700 hover:border-slate-500 bg-slate-950 hover:text-white font-mono text-[10px] cursor-pointer text-slate-400"
                    >
                      <Minimize2 className="h-3 w-3 text-amber-400" />
                      <span>EXIT FOCUS MODE (SHOW ALL)</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setActiveSection("sentiment");
                        scrollToId("global-time-horizon-picker");
                      }}
                      className="flex items-center gap-1 px-2 py-0.5 rounded border border-slate-850 hover:border-slate-700 bg-slate-950 hover:text-cyan-400 font-mono text-[9px] cursor-pointer text-slate-500"
                    >
                      <Maximize2 className="h-2.5 w-2.5" />
                      <span>FOCUS VIEW ⛶</span>
                    </button>
                  )}
                </div>
              </div>
              <InvestorReactionMonitor currentPrices={prices} globalTimeHorizon={globalTimeHorizon} />
            </div>
          )}

          {/* 8. SECTOR INDEX: AI Order Book Slippage Shock Simulator */}
          {(activeSection === "all" || activeSection === "simulator") && (
            <div id="simulator-view-card" className="space-y-1">
              <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-t-xl px-4 py-2 border-b-0 font-mono text-[10px] text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-400"></span>
                  <span className="font-bold tracking-wider uppercase text-slate-350">
                    SECTOR INDEX 08: Liquidity Shock & Dump Stress Simulator
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {activeSection === "simulator" ? (
                    <button
                      onClick={() => setActiveSection("all")}
                      className="flex items-center gap-1 px-2.5 py-1 rounded border border-slate-700 hover:border-slate-500 bg-slate-950 hover:text-white font-mono text-[10px] cursor-pointer text-slate-400"
                    >
                      <Minimize2 className="h-3 w-3 text-amber-400" />
                      <span>EXIT FOCUS MODE (SHOW ALL)</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setActiveSection("simulator");
                        scrollToId("global-time-horizon-picker");
                      }}
                      className="flex items-center gap-1 px-2 py-0.5 rounded border border-slate-850 hover:border-slate-700 bg-slate-950 hover:text-cyan-400 font-mono text-[9px] cursor-pointer text-slate-500"
                    >
                      <Maximize2 className="h-2.5 w-2.5" />
                      <span>FOCUS VIEW ⛶</span>
                    </button>
                  )}
                </div>
              </div>
              <MarketSimulatorSection 
                currentPrices={prices}
                defaultAsset={simPresetAsset}
                defaultAmount={simPresetAmount}
              />
            </div>
          )}

        </div>

      </main>

      {/* 4. Terminal Footnotes */}
      <footer className="bg-slate-950 border-t border-slate-900 p-6 text-center font-mono text-xs text-slate-500 mt-12 space-y-2">
        <p>© 2026 WHALETRACK PRO Network. Cybernetic intelligence telemetry. All interfaces mock/simulated with exact websocket feeds.</p>
        <p className="text-[10px] text-slate-650">
          Powered by Gemini 3.5 Flash | Real-time exchange WebSocket streams powered by Binance Public API.
        </p>
      </footer>

    </div>
  );
}
