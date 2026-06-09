import React, { useState, useMemo, useEffect } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Clock, 
  ArrowRight, 
  Check, 
  Info, 
  Award, 
  Flame, 
  Tag, 
  BarChart4, 
  Briefcase, 
  History,
  Calculator,
  Eye,
  SlidersHorizontal,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line
} from "recharts";

// 1. Definition of Prediction Event Type
interface PolymarketDeFiEvent {
  id: string;
  question: string;
  questionZh: string;
  category: "DEX" | "Lending" | "Staking" | "Stablecoin" | "Regulation" | "Layer2";
  totalVolume: number;
  yesProbability: number; // 0 to 100
  prev12hProbability: number; // For delta tracking
  probabilityHistory: number[]; // 7 data points for sparkline
  endDate: string;
  tradersCount: number;
  unresolvedShares: number;
  liquidityPool: number;
  keywords: string[];
  descriptionZh: string;
}

// 2. Definition of Live Action Feed item
interface PolymarketWhaleBet {
  id: string;
  time: string;
  txHash: string;
  whaleAddress: string;
  whaleLabel: string;
  eventQuestion: string;
  prediction: "YES" | "NO";
  sharesCount: number;
  totalCostUsd: number;
  probabilityAtBet: number;
}

const CONST_DEFI_EVENTS: PolymarketDeFiEvent[] = [
  {
    id: "poly-01",
    question: "Will Ethereum daily average gas fee drop below 5 Gwei at any point in Q3 2026?",
    questionZh: "以太坊每日平均 Gas 费用在 2026 年第三季度是否会降至 5 Gwei 以下？",
    category: "Layer2",
    totalVolume: 5840250,
    yesProbability: 38,
    prev12hProbability: 42,
    probabilityHistory: [46, 45, 44, 43, 40, 42, 38],
    endDate: "2026-09-30",
    tradersCount: 8420,
    unresolvedShares: 12500000,
    liquidityPool: 1850000,
    keywords: ["ETH", "Gas", "L2", "Blob", "Scalability", "EIP-4844"],
    descriptionZh: "主要观测以太坊主网层面的流量流失与 EIP-4844 引入 Blob 后的吞吐量溢出效应，清算或结算标准为 Etherscan 官方每日中值。"
  },
  {
    id: "poly-02",
    question: "Will Solana DeFi Total Value Locked (TVL) surpass $15 Billion before July 31, 2026?",
    questionZh: "Solana 的 DeFi 锁仓质押总量 (TVL) 是否会在 2026 年 7 月 31 日前突破 150 亿美元？",
    category: "DEX",
    totalVolume: 12450800,
    yesProbability: 67,
    prev12hProbability: 62,
    probabilityHistory: [55, 58, 60, 59, 61, 62, 67],
    endDate: "2026-07-31",
    tradersCount: 19420,
    unresolvedShares: 24800000,
    liquidityPool: 4120000,
    keywords: ["Solana", "TVL", "DeFi", "Raydium", "Jup", "Staking"],
    descriptionZh: "依据 DeFiLlama 统计数据（包含借贷与流动性质押）。当前 Solana DeFi 处于爆发期，大量空投热度和质押率维持高位。"
  },
  {
    id: "poly-03",
    question: "Will Uniswap V4 accumulate over $3 Billion daily volume on Ethereum on its official release week?",
    questionZh: "Uniswap V4 正式上线首周在以太坊链上的每日交易额是否会突破 30 亿美元？",
    category: "DEX",
    totalVolume: 8240500,
    yesProbability: 74,
    prev12hProbability: 75,
    probabilityHistory: [68, 70, 72, 73, 76, 75, 74],
    endDate: "2026-08-31",
    tradersCount: 11250,
    unresolvedShares: 15400000,
    liquidityPool: 2680050,
    keywords: ["Uniswap", "V4", "Hooks", "DEX", "Volume", "Liquidity"],
    descriptionZh: "Hooks 架构上线标志着定制流动性集中管理时代的到来。若能将主流资产成功向 V4 热引导，该目标额度预计胜率极大。"
  },
  {
    id: "poly-04",
    question: "Will PYUSD occupy > 15% Solana Stablecoin market share by August 31, 2026?",
    questionZh: "PayPal 的 PYUSD 在 Solana 链上稳定币市场份额到 2026 年 8 月 31 日是否会占到 15% 以上？",
    category: "Stablecoin",
    totalVolume: 4120700,
    yesProbability: 51,
    prev12hProbability: 49,
    probabilityHistory: [44, 45, 47, 48, 50, 49, 51],
    endDate: "2026-08-31",
    tradersCount: 6140,
    unresolvedShares: 9100000,
    liquidityPool: 1250320,
    keywords: ["PYUSD", "Stablecoin", "PayPal", "Solana", "USDC", "USDT"],
    descriptionZh: "PayPal 近期通过高收益流动性挖矿和免跨链费用积极推进 Solana 整合，主要竞争对手为 USDC。"
  },
  {
    id: "poly-05",
    question: "Will the SEC approve or establish guidelines for a designated DeFi Index ETF in 2026?",
    questionZh: "美国 SEC 是否会在 2026 年批准或出台针对多币种 DeFi 指生指数 ETF 的实施细则？",
    category: "Regulation",
    totalVolume: 15150900,
    yesProbability: 25,
    prev12hProbability: 29,
    probabilityHistory: [35, 33, 31, 28, 29, 29, 25],
    endDate: "2026-12-31",
    tradersCount: 22410,
    unresolvedShares: 31000000,
    liquidityPool: 5900000,
    keywords: ["SEC", "DeFi", "ETF", "Regulation", "Policy", "Compliance"],
    descriptionZh: "强监管摩擦依然存在。涉及去中心化指数治理代币的证券属性认定是主要拦路虎，目前市场偏向悲观清偿状态。"
  },
  {
    id: "poly-06",
    question: "Will Aave V4 deliver its multi-chain deployment on at least 5 major L2 networks simultaneously?",
    questionZh: "Aave V4 升级届时是否会在至少 5 个主要的 L2 二层网络上进行多链同步启动？",
    category: "Lending",
    totalVolume: 6180305,
    yesProbability: 82,
    prev12hProbability: 80,
    probabilityHistory: [75, 77, 78, 80, 81, 80, 82],
    endDate: "2026-10-15",
    tradersCount: 9400,
    unresolvedShares: 11000000,
    liquidityPool: 2100000,
    keywords: ["Aave", "Lending", "V4", "L2", "Base", "Optimism", "Arbitrum"],
    descriptionZh: "针对超薄流动性碎片化的新型统一清算架构研发进展出人意料地顺利，多 L2 初始部署属于其核心卖点。"
  },
  {
    id: "poly-07",
    question: "Will Sky (formerly MakerDAO) fully revert its brand name back to Maker due to community feedback?",
    questionZh: "Sky（原 MakerDAO）是否会因为治理社区投票抗议而将品牌名称完全倒退并改回 Maker？",
    category: "Regulation",
    totalVolume: 3540200,
    yesProbability: 59,
    prev12hProbability: 58,
    probabilityHistory: [50, 52, 54, 56, 57, 58, 59],
    endDate: "2026-08-15",
    tradersCount: 4890,
    unresolvedShares: 7200000,
    liquidityPool: 980000,
    keywords: ["Sky", "Maker", "DAO", "Governance", "MKR", "USDS"],
    descriptionZh: "Sky 品牌升级导致部分核心散户混淆，创始人 Rune Christensen 曾提出可能存在重新恢复 Maker 品牌的折中提案。"
  },
  {
    id: "poly-08",
    question: "Will Liquid Restaking Platforms (EigenLayer/Symbiotic/Karak) exceed 25% of total Ethereum supply in Staking?",
    questionZh: "流动性再质押平台（EigenLayer, Symbiotic, Karak 等）占以太坊质押总量的百分比是否会超过 25%？",
    category: "Staking",
    totalVolume: 9820400,
    yesProbability: 63,
    prev12hProbability: 66,
    probabilityHistory: [70, 69, 68, 65, 67, 66, 63],
    endDate: "2026-11-20",
    tradersCount: 14200,
    unresolvedShares: 18500200,
    liquidityPool: 3100000,
    keywords: ["EigenLayer", "Staking", "Restaking", "Symbiotic", "ETH", "AVS"],
    descriptionZh: "再质押通过引入多重收益大幅挤占了原生 POS 质押的市场份额，尽管安全层摩擦逐渐暴露，但高收益依然吸金。"
  }
];

const INITIAL_WHALE_BETS: PolymarketWhaleBet[] = [
  {
    id: "bet-01",
    time: "2 Mins Ago",
    txHash: "0x3af8...92b4",
    whaleAddress: "0x3b85...4d23",
    whaleLabel: "Wintermute Market Maker",
    eventQuestion: "Solana DeFi TVL surpass $15 Billion before July 31, 2026?",
    prediction: "YES",
    sharesCount: 154000,
    totalCostUsd: 103180,
    probabilityAtBet: 67
  },
  {
    id: "bet-02",
    time: "10 Mins Ago",
    txHash: "0x89ee...41ff",
    whaleAddress: "0xd8da...60cf",
    whaleLabel: "Vitalik.eth Address Mirror",
    eventQuestion: "Sky (MakerDAO) revert its brand name back to Maker?",
    prediction: "YES",
    sharesCount: 88000,
    totalCostUsd: 51920,
    probabilityAtBet: 59
  },
  {
    id: "bet-03",
    time: "24 Mins Ago",
    txHash: "0x51fe...2cb4",
    whaleAddress: "0xc883...c00d",
    whaleLabel: "Arrington Capital Node",
    eventQuestion: "SEC approve DeFi Index ETF in 2026?",
    prediction: "NO",
    sharesCount: 210000,
    totalCostUsd: 157500,
    probabilityAtBet: 75 // Buying NO (prob yes is 25, so prob NO is 75)
  },
  {
    id: "bet-04",
    time: "48 Mins Ago",
    txHash: "0xde43...aa10",
    whaleAddress: "0x6335...bf8a",
    whaleLabel: "DEX Arbitrage Bot [Jup-MEV]",
    eventQuestion: "PYUSD occupy > 15% Solana Stablecoin market share?",
    prediction: "YES",
    sharesCount: 65000,
    totalCostUsd: 33150,
    probabilityAtBet: 51
  },
  {
    id: "bet-05",
    time: "1.2 Hours Ago",
    txHash: "0x7c73...975b",
    whaleAddress: "0x2e8f...92da",
    whaleLabel: "Ambria Restaking Accumulator",
    eventQuestion: "Liquid Restaking exceed 25% of total Ethereum supply in Staking?",
    prediction: "NO",
    sharesCount: 120000,
    totalCostUsd: 44400,
    probabilityAtBet: 37 // Buying NO (prob yes is 63, so NO is 37)
  }
];

export const PolymarketDeFiHub: React.FC = () => {
  // --- States ---
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedEventId, setSelectedEventId] = useState<string>("poly-01");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  
  // Betting Slip State
  const [betSide, setBetSide] = useState<"YES" | "NO">("YES");
  const [betAmountText, setBetAmountText] = useState<string>("1000");
  const [betFeedbackMsg, setBetFeedbackMsg] = useState<{ status: "idle" | "success" | "error"; text: string }>({ status: "idle", text: "" });

  const [events, setEvents] = useState<PolymarketDeFiEvent[]>(CONST_DEFI_EVENTS);
  const [liveBets, setLiveBets] = useState<PolymarketWhaleBet[]>(INITIAL_WHALE_BETS);

  // --- Dynamic Poller to Simulate Active Order Book ---
  useEffect(() => {
    const timer = setInterval(() => {
      // 1. Gently slide Yes Probability of random event
      setEvents(prev => {
        return prev.map(ev => {
          if (Math.random() > 0.6) {
            const driftChance = Math.random();
            let delta = 0;
            if (driftChance > 0.6) delta = 1;
            else if (driftChance < 0.4) delta = -1;

            const nextProb = Math.min(95, Math.max(5, ev.yesProbability + delta));
            
            // Record in history
            const hist = [...ev.probabilityHistory];
            hist.shift();
            hist.push(nextProb);

            return {
              ...ev,
              yesProbability: nextProb,
              probabilityHistory: hist,
              totalVolume: ev.totalVolume + Math.round(Math.random() * 8500),
              liquidityPool: ev.liquidityPool + Math.round(Math.random() * 2100)
            };
          }
          return ev;
        });
      });

      // 2. Pop standard random whale predictions to simulate live stream
      if (Math.random() > 0.75) {
        const randEvent = events[Math.floor(Math.random() * events.length)];
        const randPrice = Math.random() > 0.5 ? "YES" : "NO";
        const costSeed = Math.round(8000 + Math.random() * 92000);
        const buyProb = randPrice === "YES" ? randEvent.yesProbability : (100 - randEvent.yesProbability);
        const shares = Math.round(costSeed / (buyProb / 100));

        const newWhaleBet: PolymarketWhaleBet = {
          id: `bet-${Date.now()}`,
          time: "Just Now",
          txHash: `0x${Math.random().toString(16).substring(2, 6)}...${Math.random().toString(16).substring(2, 6)}`,
          whaleAddress: `0x${Math.random().toString(16).substring(2, 6)}...${Math.random().toString(16).substring(2, 6)}`,
          whaleLabel: ["Amber Group", "GSR Markets", "Arbitrage Bot V1", "Multicoin Mirror", "Solana Whale #12"][Math.floor(Math.random() * 5)],
          eventQuestion: randEvent.question.substring(0, 50) + "...",
          prediction: randPrice,
          sharesCount: shares,
          totalCostUsd: costSeed,
          probabilityAtBet: randEvent.yesProbability
        };

        setLiveBets(prev => [newWhaleBet, ...prev.slice(0, 4)]);
      }
    }, 6000);

    return () => clearInterval(timer);
  }, [events]);

  // --- Aggregate Keywords (Word Cloud System) ---
  const keywordAggregations = useMemo(() => {
    const rawMap: { [key: string]: { count: number; volume: number; category: string } } = {};
    events.forEach(ev => {
      ev.keywords.forEach(kw => {
        if (!rawMap[kw]) {
          rawMap[kw] = { count: 0, volume: 0, category: ev.category };
        }
        rawMap[kw].count += 1;
        rawMap[kw].volume += ev.totalVolume;
      });
    });

    const parsed = Object.keys(rawMap).map(word => ({
      text: word,
      value: rawMap[word].count,
      cumulativeVolume: rawMap[word].volume,
      sector: rawMap[word].category
    }));

    // Sort by cumulative voting volume to render highest-stakes words first
    return parsed.sort((a, b) => b.cumulativeVolume - a.cumulativeVolume);
  }, [events]);

  // Find the selected event object safely
  const activeEvent = useMemo(() => {
    return events.find(e => e.id === selectedEventId) || events[0];
  }, [events, selectedEventId]);

  // --- Search and Category and Tag Filtering Matrix ---
  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      const matchCategory = selectedCategory === "All" || e.category === selectedCategory;
      const queryLower = searchQuery.toLowerCase();
      const matchSearch = searchQuery === "" || 
        e.question.toLowerCase().includes(queryLower) || 
        e.questionZh.toLowerCase().includes(queryLower) ||
        e.keywords.some(k => k.toLowerCase().includes(queryLower));
      
      const matchTag = !selectedTag || e.keywords.includes(selectedTag);

      return matchCategory && matchSearch && matchTag;
    });
  }, [events, selectedCategory, searchQuery, selectedTag]);

  // --- Category Volume Breakdown Data for Donut Chart ---
  const categoryChartData = useMemo(() => {
    const catMap: { [key: string]: number } = {};
    events.forEach(e => {
      catMap[e.category] = (catMap[e.category] || 0) + e.totalVolume;
    });
    return Object.keys(catMap).map(cat => ({
      name: cat.toUpperCase(),
      value: catMap[cat]
    }));
  }, [events]);

  const CATEGORY_COLORS: { [key: string]: string } = {
    DEX: "#06b6d4",       // cyan
    Lending: "#a855f7",   // purple
    Staking: "#3b82f6",   // blue
    Stablecoin: "#10b981", // emerald
    Regulation: "#fbbf24", // amber
    Layer2: "#f43f5e"     // rose
  };

  // --- Calculate simulated bet results ---
  const handleBuySharesSimulation = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(betAmountText);
    if (isNaN(parsedAmount) || parsedAmount <= 1) {
      setBetFeedbackMsg({ status: "error", text: "Please key in a valid amount greater than $1 (请输入大于1的额数值)" });
      return;
    }

    const priceShare = betSide === "YES" ? activeEvent.yesProbability : (100 - activeEvent.yesProbability);
    const costPerShare = priceShare / 100;
    const purchasedShares = parsedAmount / costPerShare;
    const potentialProfit = purchasedShares - parsedAmount;

    setBetFeedbackMsg({
      status: "success",
      text: `Successfully bought ${purchasedShares.toLocaleString(undefined, { maximumFractionDigits: 1 })} shares. Potential payout of $${purchasedShares.toLocaleString(undefined, { maximumFractionDigits: 1 })} on resolution (+${((potentialProfit / parsedAmount) * 100).toFixed(0)}% ROI)!`
    });

    // Injects this simulated bet right into the top of our ledger history!
    const myMockWhaleBet: PolymarketWhaleBet = {
      id: `mybet-${Date.now()}`,
      time: "Just Now",
      txHash: "0x78a5...local",
      whaleAddress: "0xUser...F5E2",
      whaleLabel: "🎯 Local Trader Simulation (YOU)",
      eventQuestion: activeEvent.question.substring(0, 50) + "...",
      prediction: betSide,
      sharesCount: Math.round(purchasedShares),
      totalCostUsd: parsedAmount,
      probabilityAtBet: activeEvent.yesProbability
    };

    setLiveBets(prev => [myMockWhaleBet, ...prev]);
  };

  return (
    <div id="polymarket-defi-panel" className="space-y-6">
      
      {/* 🚀 HUB SYSTEM DESCRIPTION */}
      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-900 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="space-y-1">
            <span className="text-[9px] font-mono text-cyan-400 font-black uppercase tracking-widest block animate-pulse">
              POLYMARKET DEFI INFORMATION GATEWAY (聚界预测市场DeFi监测站)
            </span>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-br from-indigo-950/40 to-cyan-950/40 border border-cyan-800/30 text-cyan-300 rounded">
                <Sparkles className="h-4.5 w-4.5 animate-spin" />
              </div>
              <h2 className="text-sm font-mono font-bold text-white uppercase tracking-tight">
                Predictive Analytics, Sentiment Crowdsourcing & Topic Modeling
              </h2>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed max-w-4xl font-sans">
              Polymarket is the world's largest decentralized prediction market. This module extracts, programmatically processes, and synthesizes major multi-chain list events, modeling word frequency density maps, dynamic Yes/No odds histories, and high-vibe investor consensus markers to observe market behavior.
            </p>
          </div>
        </div>
      </div>

      {/* 📊 CORE GRID: WORD HEAT CLOUD & CUMULATIVE VOL CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: INTERACTIVE WORD CLOUD (HEAT TAGS) */}
        <div id="polymarket-wordcloud-box" className="lg:col-span-6 bg-slate-950 p-5 rounded-2xl border border-slate-900 flex flex-col justify-between">
          <div className="space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-rose-500" />
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Event Keyword Word Cloud (预测事件词频图)
                </h3>
              </div>
              <span className="text-[8.5px] font-mono text-slate-500 uppercase">Interactive Tag Vector Map</span>
            </div>

            <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
              Programmatic aggregation of primary terms found in target DeFi betting rules. Font scale indicates volume density. <strong>Click any tag to filter</strong> active prediction widgets!
            </p>

            {/* Simulated Word Cloud Container */}
            <div className="bg-slate-900/30 p-5 rounded-xl border border-slate-900/80 min-h-[180px] flex flex-wrap items-center justify-center gap-x-4 gap-y-3 relative overflow-hidden select-none">
              <div className="absolute top-1 right-2 text-[8px] font-mono text-slate-650 uppercase">Weighted by Traded Vol</div>
              
              {keywordAggregations.map((kw) => {
                // Determine size based on cumulative volume rank
                const isSelected = selectedTag === kw.text;
                const volM = kw.cumulativeVolume / 1000000;
                let fontSize = "text-xs";
                let fontColor = "text-slate-400 hover:text-slate-200";

                if (volM > 15) {
                  fontSize = "text-2xl font-black";
                  fontColor = isSelected ? "text-rose-455" : "text-rose-400 hover:text-rose-300";
                } else if (volM > 8) {
                  fontSize = "text-lg font-extrabold";
                  fontColor = isSelected ? "text-cyan-455" : "text-cyan-400 hover:text-cyan-200";
                } else if (volM > 5) {
                  fontSize = "text-sm font-bold";
                  fontColor = isSelected ? "text-purple-400" : "text-purple-300 hover:text-purple-100";
                } else {
                  fontSize = "text-xs font-medium";
                  fontColor = isSelected ? "text-amber-400" : "text-slate-400 hover:text-slate-250";
                }

                return (
                  <button
                    key={kw.text}
                    type="button"
                    title={`Keyword: ${kw.text} | Cumulative Event Vol: $${(kw.cumulativeVolume / 1000000).toFixed(1)}M | Heat Index: ${kw.value}`}
                    onClick={() => {
                      if (selectedTag === kw.text) {
                        setSelectedTag(null); // Deselect
                      } else {
                        setSelectedTag(kw.text);
                        // Also expand the Search slightly or scroll
                      }
                    }}
                    className={`transition-all duration-200 cursor-pointer p-1.5 rounded-md hover:scale-105 inline-block ${fontSize} ${fontColor} ${
                      isSelected 
                        ? "bg-slate-900 border border-slate-700 shadow-xl shadow-cyan-950/40 ring-1 ring-cyan-500/30" 
                        : "hover:bg-slate-900/40"
                    }`}
                  >
                    {kw.text}
                    <span className="text-[8px] opacity-60 font-mono align-super ml-0.5">
                      ({kw.value})
                    </span>
                  </button>
                );
              })}

              {selectedTag && (
                <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
                  <span className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[8.5px] font-mono font-bold px-2 py-0.5 rounded-lg flex items-center gap-1">
                    Active Filter: {selectedTag}
                    <button type="button" onClick={() => setSelectedTag(null)} className="hover:text-red-400 ml-1 font-bold">×</button>
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 flex flex-col xs:flex-row xs:items-center justify-between text-[10px] font-mono text-slate-500 border-t border-slate-900">
            <span>Heat Level Index: 12.4M Max</span>
            <button
               type="button"
               disabled={!selectedTag}
               onClick={() => setSelectedTag(null)}
               className={`text-[9.5px] font-bold cursor-pointer transition ${
                  selectedTag ? "text-rose-455 hover:underline" : "text-slate-650"
               }`}
            >
              Clear Keyword Filters (清空词频过滤)
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: RECHARTS CUMULATIVE VOLUME INDEX */}
        <div id="polymarket-volumechart-box" className="lg:col-span-6 bg-slate-950 p-5 rounded-2xl border border-slate-900 flex flex-col justify-between">
          <div className="space-y-3.5 w-full">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <div className="flex items-center gap-2">
                <BarChart4 className="h-4 w-4 text-cyan-400" />
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Volume Traded by Keywords (关键词累计交易量排行)
                </h3>
              </div>
              <span className="text-[8.5px] font-mono text-slate-500 uppercase">Observer Metrics</span>
            </div>

            <p className="text-[10px] text-slate-440 font-sans leading-relaxed">
              Dynamically computed sum of traded volumes on all prediction contracts containing the respective tag identifiers (USD).
            </p>

            {/* Recharts Column Plot */}
            <div className="h-[180px] w-full bg-slate-900/10 rounded-xl relative pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={keywordAggregations.slice(0, 8)} 
                  layout="vertical"
                  margin={{ top: 5, right: 15, left: -10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} opacity={0.3} />
                  <XAxis 
                    type="number" 
                    tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`}
                    tick={{ fill: '#64748b', fontSize: 8, fontFamily: 'monospace' }}
                    axisLine={{ stroke: '#1e293b' }}
                    tickLine={false}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="text" 
                    tick={{ fill: '#e2e8f0', fontSize: 9, fontFamily: 'monospace', fontWeight: 'bold' }}
                    axisLine={{ stroke: '#1e293b' }}
                    tickLine={false}
                    width={70}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const dat = payload[0].payload;
                        return (
                          <div className="bg-slate-950 border border-slate-850 p-2.5 rounded-lg font-mono text-[9px] text-slate-300">
                            <p className="text-white font-bold uppercase">{dat.text} (Tag)</p>
                            <p className="text-cyan-400 font-extrabold mt-1">Total Bet Weight: ${dat.cumulativeVolume.toLocaleString()} USD</p>
                            <p className="text-[8px] text-slate-500">Includes native {dat.value} linked prediction events</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar 
                    dataKey="cumulativeVolume" 
                    fill="#3b82f6" 
                    radius={[0, 4, 4, 0]}
                  >
                    {keywordAggregations.slice(0, 8).map((entry, index) => {
                      const color = CATEGORY_COLORS[entry.sector] || "#10b981";
                      return <Cell key={`cell-${index}`} fill={color} opacity={0.8} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-3 flex items-center justify-between font-mono text-[8.5px] text-slate-550 border-t border-slate-900 border-dashed">
            <span>Color code: DEX·Lending·Stablecoin·Regulation·L2</span>
            <span>Refreshes dynamically with state poller</span>
          </div>
        </div>

      </div>

      {/* 🔮 INTERACTIVE PREDICTOR FEED & CHANGER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COMPONENT: THE HOT CONTESTED PREDICTION LOGS (DASHBOARD GRID) */}
        <div className="lg:col-span-8 bg-slate-950 p-5 rounded-2xl border border-slate-900 space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-900 pb-3">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500 animate-pulse" />
              <div>
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Contested Predictives Matrix (聚界预测最火热投票列表)
                </h3>
              </div>
            </div>
            
            {/* Category selection */}
            <div className="flex flex-wrap items-center gap-1">
              {["All", "DEX", "Lending", "Staking", "Stablecoin", "Regulation", "Layer2"].map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold cursor-pointer transition ${
                    selectedCategory === cat
                      ? "bg-cyan-500/10 border border-cyan-500/25 text-cyan-300"
                      : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-transparent"
                  }`}
                >
                  {cat.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search polymarket DeFi questions, protocols or tags (输入关键词过滤预测投票事件)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/40 border border-slate-800 focus:border-rose-500 focus:ring-0 text-xs font-mono text-slate-100 placeholder-slate-500 rounded-lg px-3 py-2"
            />
            {selectedTag && (
              <span className="absolute right-3 top-2 bg-slate-950 border border-slate-850 px-2 py-0.5 rounded text-[8.5px] font-mono text-cyan-400">
                Tag Filtered: {selectedTag}
              </span>
            )}
          </div>

          {/* Grid display of prediction cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredEvents.length === 0 ? (
              <div className="col-span-2 bg-slate-900/20 py-12 rounded-xl text-center text-slate-500 font-mono text-xs border border-dashed border-slate-850">
                No contested events matched the filter. Try clearing queries.
              </div>
            ) : (
              filteredEvents.map((ev) => {
                const isSelected = selectedEventId === ev.id;
                const probDelta = ev.yesProbability - ev.prev12hProbability;
                const isDeltaPositive = probDelta >= 0;
                
                return (
                  <div
                    key={ev.id}
                    onClick={() => setSelectedEventId(ev.id)}
                    className={`bg-slate-900/30 p-4 rounded-xl border transition-all cursor-pointer select-none space-y-3.5 flex flex-col justify-between ${
                      isSelected
                        ? "border-rose-500/40 bg-slate-900/50 shadow-inner ring-1 ring-rose-500/10"
                        : "border-slate-900 hover:border-slate-800"
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span 
                          className="px-2 py-0.5 text-[7px] font-extrabold uppercase border rounded font-mono"
                          style={{ 
                            color: CATEGORY_COLORS[ev.category], 
                            borderColor: `${CATEGORY_COLORS[ev.category]}25`,
                            backgroundColor: `${CATEGORY_COLORS[ev.category]}10`
                          }}
                        >
                          {ev.category}
                        </span>
                        
                        <div className="flex items-center gap-1.5 font-mono text-[9px] text-slate-450">
                          <Users className="h-2.5 w-2.5" />
                          <span>{ev.tradersCount.toLocaleString()} Traded</span>
                        </div>
                      </div>

                      {/* Question English/Chinese */}
                      <div>
                        <h4 className="text-xs font-semibold text-slate-200 leading-snug group-hover:text-white line-clamp-2">
                          {ev.question}
                        </h4>
                        <p className="text-[10.5px] text-slate-450 font-sans leading-relaxed mt-1 line-clamp-2">
                          {ev.questionZh}
                        </p>
                      </div>
                    </div>

                    {/* Percentage Probability Display Container */}
                    <div className="space-y-2 border-t border-slate-900/50 pt-2.5">
                      <div className="flex items-end justify-between">
                        <div className="space-y-0.5">
                          <span className="text-[8px] text-slate-500 uppercase font-bold block">YES Odds Index</span>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-base font-black font-mono text-cyan-400">
                              {ev.yesProbability}%
                            </span>
                            <span className={`text-[9px] font-bold ${isDeltaPositive ? "text-emerald-400" : "text-rose-400"} flex items-center`}>
                              {isDeltaPositive ? "+" : ""}{probDelta}%
                            </span>
                          </div>
                        </div>

                        {/* Sparkline for Probability */}
                        <div className="w-20 h-5" title="7-Day Probability Flow">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={ev.probabilityHistory.map((v, i) => ({ val: v, idx: i }))}>
                              <YAxis domain={[0, 100]} hide />
                              <Line 
                                type="monotone" 
                                dataKey="val" 
                                stroke={ev.yesProbability > 50 ? "#06b6d4" : "#f43f5e"} 
                                strokeWidth={1.5} 
                                dot={false} 
                                isAnimationActive={false}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Micro Progress Bar */}
                      <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-cyan-400 rounded-full transition-all duration-300"
                          style={{ width: `${ev.yesProbability}%` }}
                        ></div>
                      </div>

                      {/* Info lines */}
                      <div className="flex justify-between items-center text-[9px] font-mono text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" />
                          Exp: {ev.endDate}
                        </span>
                        <span>Vol: ${(ev.totalVolume / 1000000).toFixed(2)}M Traded</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COMPONENT: CONTEST ORDER BOOK & SIMULATION DECK */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* INTERACTIVE BETTING SLIP SIMULATOR (必要观测变量其一：实时下注模拟器) */}
          <div id="polymarket-prediction-slip" className="bg-slate-950 p-5 rounded-2xl border border-slate-900 space-y-4">
            
            <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
              <Calculator className="h-4.5 w-4.5 text-cyan-400" />
              <div>
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Bet Slip Simulator (虚拟下注结算器)
                </h3>
                <span className="text-[8px] text-slate-500 uppercase block">Instant return calculation engine</span>
              </div>
            </div>

            <div className="space-y-1 bg-slate-900/30 p-2.5 rounded-lg border border-slate-900 text-[10px]">
              <span className="text-[8px] text-slate-500 block uppercase">Target Focus Event:</span>
              <p className="text-slate-200 font-bold truncate tracking-tight">
                {activeEvent.question}
              </p>
              <div className="flex justify-between mt-1 text-slate-400 font-mono text-[9px]">
                <span>Category: {activeEvent.category}</span>
                <span className="text-cyan-400 font-bold">YES Price: ${ (activeEvent.yesProbability/100).toFixed(2) }</span>
              </div>
            </div>

            <form onSubmit={handleBuySharesSimulation} className="space-y-4">
              
              {/* YES vs NO Selector */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setBetSide("YES")}
                  className={`py-2 px-3 rounded-xl border text-xs font-mono font-bold transition-all uppercase cursor-pointer text-center ${
                    betSide === "YES"
                      ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400 shadow-inner"
                      : "bg-slate-900 border-slate-900 text-slate-500 hover:text-slate-350"
                  }`}
                >
                  Buy YES ({activeEvent.yesProbability}¢)
                </button>
                <button
                  type="button"
                  onClick={() => setBetSide("NO")}
                  className={`py-2 px-3 rounded-xl border text-xs font-mono font-bold transition-all uppercase cursor-pointer text-center ${
                    betSide === "NO"
                      ? "bg-rose-500/10 border-rose-500/40 text-rose-455 shadow-inner"
                      : "bg-slate-900 border-slate-900 text-slate-500 hover:text-slate-350"
                  }`}
                >
                  Buy NO ({100 - activeEvent.yesProbability}¢)
                </button>
              </div>

              {/* Amount input */}
              <div className="space-y-1.5 font-mono">
                <div className="flex justify-between text-[8px] text-slate-500 font-bold uppercase">
                  <span>Investment (投入美金):</span>
                  <span>Balance: $100,000 Free Play</span>
                </div>
                <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-2">
                  <span className="text-slate-500 text-xs font-bold mr-1.5">$</span>
                  <input
                    type="number"
                    min="1"
                    max="100000"
                    value={betAmountText}
                    onChange={(e) => {
                      setBetAmountText(e.target.value);
                      setBetFeedbackMsg({ status: "idle", text: "" });
                    }}
                    className="bg-transparent border-0 flex-1 p-0 text-xs text-white focus:ring-0 focus:outline-none"
                  />
                  <span className="text-slate-500 text-[9px] font-bold">USD</span>
                </div>
              </div>

              {/* Immediate Mathematics Panel */}
              {parseFloat(betAmountText) > 0 && (
                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-900 text-[10px] space-y-1.5 font-mono">
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Average price per share:</span>
                    <span>${(betSide === "YES" ? activeEvent.yesProbability / 100 : (100 - activeEvent.yesProbability) / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Estimated purchased shares:</span>
                    <span className="text-white font-bold">
                      {Math.round((parseFloat(betAmountText) || 0) / ((betSide === "YES" ? activeEvent.yesProbability : (100 - activeEvent.yesProbability)) / 100)).toLocaleString()} Shares
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-350 border-t border-slate-900/80 pt-1.5">
                    <span>Potential payout if resolved:</span>
                    <span className="text-emerald-400 font-extrabold text-[12px] animate-pulse">
                      ${Math.round((parseFloat(betAmountText) || 0) / ((betSide === "YES" ? activeEvent.yesProbability : (100 - activeEvent.yesProbability)) / 100)).toLocaleString()}.00 USD
                    </span>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button
                type="submit"
                id="submit-prediction-btn"
                className="w-full py-2 bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-mono text-xs font-bold uppercase rounded-lg shadow-lg shadow-indigo-950/20 active:scale-[0.98] transition cursor-pointer"
              >
                Execute Mock Share Acquisition
              </button>
            </form>

            {/* Simulated execution callback notifications */}
            {betFeedbackMsg.status !== "idle" && (
              <div className={`p-2.5 rounded-lg border text-[10px] font-mono leading-relaxed flex items-start gap-1.5 ${
                betFeedbackMsg.status === "success"
                  ? "bg-emerald-950/25 border-emerald-900/50 text-emerald-300"
                  : "bg-rose-955/25 border-rose-900/50 text-rose-300"
              }`}>
                <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-cyan-400" />
                <p>{betFeedbackMsg.text}</p>
              </div>
            )}
          </div>

          {/* DYNAMIC WHALE LOGS (必要观测变量其二：聚界大户动态滚动追踪链) */}
          <div id="polymarket-whale-ledger" className="bg-slate-950 p-5 rounded-2xl border border-slate-900 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-cyan-400" />
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Live Prediction Inflow Ledger (大户下注实时流水)
                </h3>
              </div>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>

            <p className="text-[10px] text-slate-500 font-sans leading-snug">
              Capturing transaction logs on Polygon of known high-vibe whales acquiring prediction shares sizes &gt; $10,000 USD.
            </p>

            <div className="space-y-2 max-h-[240px] overflow-y-auto no-scrollbar">
              {liveBets.map((bet) => {
                const isUserType = bet.whaleLabel.includes("YOU");
                return (
                  <div 
                    key={bet.id} 
                    className={`p-2.5 rounded-lg border text-[10px] font-mono transition-all duration-300 relative ${
                      isUserType
                        ? "bg-cyan-950/20 border-cyan-800/40"
                        : "bg-slate-900/45 border-slate-900/80 hover:bg-slate-900"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300 font-bold block truncate max-w-[120px] uppercase">
                        {bet.whaleLabel}
                      </span>
                      <span className="text-slate-650 text-[8.5px]">{bet.time}</span>
                    </div>

                    <p className="text-slate-450 mt-1 line-clamp-1 italic text-[9.5px]" title={bet.eventQuestion}>
                      "{bet.eventQuestion}"
                    </p>

                    <div className="flex items-center justify-between mt-1.5 border-t border-slate-900/30 pt-1.5 text-[9px]">
                      <span className="text-slate-500">
                        Bought: <span className={`font-black font-mono border-b border-dotted ${
                          bet.prediction === "YES" ? "text-cyan-400 border-cyan-400/20" : "text-rose-455 border-rose-455/20"
                        }`}>
                          {bet.sharesCount.toLocaleString()} {bet.prediction} Shares
                        </span>
                      </span>
                      <span className="text-white font-bold">
                        Cost: ${bet.totalCostUsd.toLocaleString()} USD
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
