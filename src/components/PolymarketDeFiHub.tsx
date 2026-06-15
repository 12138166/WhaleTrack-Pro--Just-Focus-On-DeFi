import React, { useState, useMemo, useEffect, useRef } from "react";
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
  Sparkles,
  Percent,
  ListFilter,
  BarChart2,
  Search,
  BookOpen,
  PieChart as PieIcon,
  CircleAlert,
  AlertTriangle,
  Download,
  Zap,
  Activity,
  X,
  Bell
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
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
  Line,
  AreaChart,
  Area
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
  status: "Active" | "Ending Soon" | "Resolved";
  resolvedOutcome?: "YES" | "NO";
  transientSurge?: number; // scale multiplier for recent participation (e.g. 1.0 to 1.8)
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

// 3. User Simulation Holding
interface UserPosition {
  id: string;
  eventId: string;
  question: string;
  questionZh: string;
  side: "YES" | "NO";
  entryProbability: number; // Price when bought (e.g., 67¢)
  shares: number;
  totalCost: number;
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
    descriptionZh: "主要观测以太坊主网层面的流量流失与 EIP-4844 引入 Blob 后的吞吐量溢出效应，清算或结算标准为 Etherscan 官方每日中值。",
    status: "Active"
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
    descriptionZh: "依据 DeFiLlama 统计数据（包含借贷与流动性质押）。当前 Solana DeFi 处于爆发期，大量空投热度和质押率维持高位。",
    status: "Ending Soon"
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
    descriptionZh: "Hooks 架构上线标志着定制流动性集中管理时代的到来。若能将主流资产成功向 V4 热引导，该目标额度预计胜率极大。",
    status: "Active"
  },
  {
    id: "poly-04",
    question: "Will PYUSD occupy > 15% Solana Stablecoin market share by August 31, 2026?",
    questionZh: "PayPal 的 PYUSD 在 Solana 链上稳定币 market 份额到 2026 年 8 月 31 日是否会占到 15% 以上？",
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
    descriptionZh: "PayPal 近期通过高收益流动性挖矿和免跨链费用积极推进 Solana 整合，主要竞争对手为 USDC。",
    status: "Active"
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
    descriptionZh: "强监管摩擦依然存在。涉及去中心化指数治理代币的证券属性认定是主要拦路虎，目前市场偏向悲观清偿状态。",
    status: "Active"
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
    descriptionZh: "针对超薄流动性碎片化的新型统一清算架构研发进展出人意料地顺利，多 L2 初始部署属于其核心卖点。",
    status: "Active"
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
    descriptionZh: "Sky 品牌升级导致部分核心散户混淆，创始人 Rune Christensen 曾提出可能存在重新恢复 Maker 品牌的折中提案。",
    status: "Ending Soon"
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
    descriptionZh: "再质押通过引入多重收益大幅挤占了原生 POS 质押的市场份额，尽管安全层摩擦逐渐暴露，但高收益依然吸金。",
    status: "Active"
  },
  {
    id: "poly-09",
    question: "Will Lido's market share of total Ethereum liquid staking drop below 29% before May 31, 2026?",
    questionZh: "Lido 在以太坊流动性锁仓总量中的占有率是否会在 2026 年 5 月 31 日之前降至 29% 以下？",
    category: "Staking",
    totalVolume: 4201000,
    yesProbability: 0,
    prev12hProbability: 0,
    probabilityHistory: [0, 0, 0, 0, 0, 0, 0],
    endDate: "2026-05-31",
    tradersCount: 6840,
    unresolvedShares: 0,
    liquidityPool: 0,
    keywords: ["Lido", "Staking", "ETH", "Liquid Staking", "Decentralization"],
    descriptionZh: "截至 2026 年 5 月 31 日到期，根据 Dune Analytics 跟踪的 Lido 常规市场占比，该项目在此期限前最终保持在 31.2% 的水平，因此该事件最终结算为「NO」。",
    status: "Resolved",
    resolvedOutcome: "NO"
  },
  {
    id: "poly-10",
    question: "Will Uniswap DAO approve a fee-tier fee switch revenue distribution model before April 30, 2026?",
    questionZh: "Uniswap 去中心化自治组织 (DAO) 是否会在 2026 年 4 月 30 日之前批准费率分层的「费用开关」分红分配方案？",
    category: "DEX",
    totalVolume: 11520000,
    yesProbability: 100,
    prev12hProbability: 100,
    probabilityHistory: [100, 100, 100, 100, 100, 100, 100],
    endDate: "2026-04-30",
    tradersCount: 15300,
    unresolvedShares: 0,
    liquidityPool: 0,
    keywords: ["Uniswap", "DAO", "Fee Switch", "UNI", "Governance", "Revenue"],
    descriptionZh: "该提议已于治理层投票中高票通过，UNI 质押持有者按照智能合约规范将获得累计交易摩擦费分配。该事件于 2026 年 4 月 30 日前正式成功通过并执行结算，最终结果为「YES」。",
    status: "Resolved",
    resolvedOutcome: "YES"
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
    probabilityAtBet: 75
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
    probabilityAtBet: 37
  }
];

// Helper to generate consistent organic-looking hourly participation trend over the last 24 hours
const get24hParticipationForEvent = (ev: PolymarketDeFiEvent) => {
  const seed = ev.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const baseCount = ev.tradersCount / 24; // standard hourly baseline
  const data = [];
  for (let h = 0; h < 24; h++) {
    // organic peak hour factor (late afternoon & evening peak)
    const peakFactor = Math.sin((h / 24) * Math.PI * 2 - Math.PI / 2) * 0.35 + 1.1; 
    const wave = Math.sin(h * 0.45 + seed) * 0.12 + Math.cos(h * 0.25 + seed) * 0.08;
    let count = Math.max(2, Math.round(baseCount * peakFactor * (1 + wave)));

    // Apply transient surge of retail/whale participation if active
    if (h === 0 && ev.transientSurge) {
      count = Math.round(count * ev.transientSurge);
    }
    
    // Calculate simulated timestamp/date back from current time
    const dateObj = new Date();
    dateObj.setHours(dateObj.getHours() - h);
    const dateStr = dateObj.toLocaleString("en-US", { 
      month: "short", 
      day: "numeric", 
      hour: "2-digit", 
      minute: "2-digit",
      hour12: false
    });

    // Interpolate simulated price (odds) over the 24 hours based on yesProbability and prev12hProbability
    let basePrice = ev.yesProbability;
    if (h <= 12) {
      const t = h / 12;
      basePrice = ev.yesProbability * (1 - t) + ev.prev12hProbability * t;
    } else {
      const t = (h - 12) / 12;
      const trend = ev.yesProbability - ev.prev12hProbability;
      basePrice = ev.prev12hProbability - trend * t;
    }
    const priceWave = Math.sin(h * 0.5 + seed) * 1.5 + Math.cos(h * 0.3 + seed) * 1.0;
    const price = Math.max(1, Math.min(99, Math.round((basePrice + priceWave) * 10) / 10));

    data.unshift({
      hour: h === 0 ? "Now" : `${h}h ago`,
      hoursAgo: h,
      date: dateStr,
      count,
      probability: price
    });
  }
  return data;
};

// Helper to evaluate detailed growth spike stats for a prediction contract
const computeEventGrowthSpike = (ev: PolymarketDeFiEvent, threshold: number) => {
  const series = get24hParticipationForEvent(ev);
  let maxPercentSurge = 0;
  let maxAbsSurge = 0;
  let peakHourStr = "Now";
  
  for (let i = 1; i < series.length; i++) {
    const prev = series[i - 1].count || 1;
    const curr = series[i].count;
    const diff = curr - prev;
    if (diff > 0) {
      const pct = (diff / prev) * 100;
      if (pct > maxPercentSurge) {
        maxPercentSurge = pct;
        maxAbsSurge = diff;
        peakHourStr = series[i].hour;
      }
    }
  }
  
  return {
    maxPercentSurge: Math.round(maxPercentSurge * 10) / 10,
    maxAbsSurge,
    peakHourStr,
    isTriggered: maxPercentSurge >= threshold
  };
};

export const PolymarketDeFiHub: React.FC<{ globalTimeHorizon?: { startDate: string; endDate: string } }> = ({ globalTimeHorizon }) => {
  // --- States ---
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedEventId, setSelectedEventId] = useState<string>("poly-02");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagFilterMode, setTagFilterMode] = useState<"AND" | "OR">("OR");
  const [sortBy, setSortBy] = useState<"vol" | "unresolved" | "contested" | "probability">("vol");
  const [showDonutSector, setShowDonutSector] = useState<boolean>(true);
  
  // Growth Spike & Whale Alert Threshold States
  const [growthThresholdPercent, setGrowthThresholdPercent] = useState<number>(25);
  const [onlyShowSpikes, setOnlyShowSpikes] = useState<boolean>(false);
  
  // Lifecycle Status Filter State
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Ending Soon" | "Resolved">("All");
  
  // Betting Slip State
  const [betSide, setBetSide] = useState<"YES" | "NO">("YES");
  const [betAmountText, setBetAmountText] = useState<string>("1000");
  const [betFeedbackMsg, setBetFeedbackMsg] = useState<{ status: "idle" | "success" | "error"; text: string }>({ status: "idle", text: "" });

  const [events, setEvents] = useState<PolymarketDeFiEvent[]>(CONST_DEFI_EVENTS);
  const [liveBets, setLiveBets] = useState<PolymarketWhaleBet[]>(INITIAL_WHALE_BETS);

  // Simulated Session Holdings state!
  const [userPositions, setUserPositions] = useState<UserPosition[]>( [
    {
      id: "init-hold-01",
      eventId: "poly-02",
      question: "Will Solana DeFi Total Value Locked (TVL) surpass $15 Billion before July 31, 2026?",
      questionZh: "Solana 的 DeFi 锁仓质押总量 (TVL) 是否会在 2026 年 7 月 31 日前突破 150 亿美元？",
      side: "YES",
      entryProbability: 60,
      shares: 5000,
      totalCost: 3000
    }
  ]);

  // --- Real-time Visual Toast Notification State & Handlers ---
  interface Toast {
    id: string;
    title: string;
    message: string;
    type: "spike" | "whale" | "system";
    eventId?: string;
    timestamp: Date;
  }

  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastedEventsRef = useRef<Record<string, number>>({});

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const addToast = (toast: Omit<Toast, "id" | "timestamp">) => {
    const id = `toast-${Math.random().toString(36).substring(2, 9)}`;
    const newToast: Toast = {
      ...toast,
      id,
      timestamp: new Date()
    };
    setToasts(prev => [newToast, ...prev].slice(0, 4)); // Maximum 4 active stackable toasts
    setTimeout(() => {
      removeToast(id);
    }, 6500);
  };

  // Listen to live events and trigger notifications for extreme participant levels (differential surges >= 40%)
  useEffect(() => {
    events.forEach(ev => {
      if (ev.status === "Resolved") return;
      const spikeInfo = computeEventGrowthSpike(ev, 40); // Standard 'extreme' threshold is 40%
      if (spikeInfo.isTriggered) {
        const prevSpike = toastedEventsRef.current[ev.id];
        // Only trigger toast if the event hasn't been toasted, OR if there's an escalating acceleration surge (+4%+ change)
        if (prevSpike === undefined || (spikeInfo.maxPercentSurge > prevSpike && spikeInfo.maxPercentSurge - prevSpike >= 4)) {
          toastedEventsRef.current[ev.id] = spikeInfo.maxPercentSurge;
          addToast({
            title: ev.category === "Layer2" ? "⛽ ETHER TRANSIT GAS CLOG WARNING" : `⚡ ${ev.category} CONTRACT METRIC SPIKE`,
            message: `Contract "${ev.id}" triggered an extreme participant surge of +${spikeInfo.maxPercentSurge}% (+${spikeInfo.maxAbsSurge} traders) in peak hour. Massive liquidity velocity shifting!`,
            type: "spike",
            eventId: ev.id
          });
        }
      } else {
        // Reset toaster lock once the event's peak hour spike falls back down below 32% (cooled down)
        if (toastedEventsRef.current[ev.id] !== undefined && spikeInfo.maxPercentSurge < 32) {
          delete toastedEventsRef.current[ev.id];
        }
      }
    });
  }, [events]);

  // --- Dynamic Poller to Simulate Active Order Book ---
  useEffect(() => {
    const timer = setInterval(() => {
      // 1. Gently slide Yes Probability of random event and simulate dynamic participation surges
      setEvents(prev => {
        // 18% chance of triggering an extreme social/retail influx on a random active event
        const shouldTriggerInflux = Math.random() > 0.82;
        const activeIds = prev.filter(e => e.status !== "Resolved").map(e => e.id);
        const targetSpikeId = shouldTriggerInflux && activeIds.length > 0 
          ? activeIds[Math.floor(Math.random() * activeIds.length)] 
          : null;

        return prev.map(ev => {
          if (ev.status === "Resolved") return ev;

          let finalSurge = ev.transientSurge;
          let finalTraders = ev.tradersCount;

          if (ev.id === targetSpikeId) {
            // Extreme surge: 1.45x - 1.70x standard volume, trigger growth spike > 40%
            finalSurge = 1.46 + Math.random() * 0.22;
            finalTraders = ev.tradersCount + Math.round(180 + Math.random() * 320); 
          } else if (finalSurge && finalSurge > 1) {
            // Gradual social cooling of interest decay
            finalSurge = Math.max(1, finalSurge - 0.08);
            if (finalSurge <= 1) finalSurge = undefined;
          }

          if (Math.random() > 0.65) {
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
              liquidityPool: ev.liquidityPool + Math.round(Math.random() * 2100),
              tradersCount: finalTraders,
              transientSurge: finalSurge
            };
          }

          // If no probability drift but we have dynamic trader spikes, return updated trackers
          if (finalTraders !== ev.tradersCount || ev.transientSurge !== finalSurge) {
            return {
              ...ev,
              tradersCount: finalTraders,
              transientSurge: finalSurge
            };
          }

          return ev;
        });
      });

      // 2. Pop standard random whale predictions to simulate live stream
      if (Math.random() > 0.7) {
        const activeEvents = events.filter(e => e.status !== "Resolved");
        if (activeEvents.length > 0) {
          const randEvent = activeEvents[Math.floor(Math.random() * activeEvents.length)];
          const randPrice = Math.random() > 0.55 ? "YES" : "NO";
          const costSeed = Math.round(5000 + Math.random() * 45000);
          const buyProb = randPrice === "YES" ? randEvent.yesProbability : (100 - randEvent.yesProbability);
          // Zero divide protection just in case
          const finalBuyProb = buyProb === 0 ? 1 : buyProb;
          const shares = Math.round(costSeed / (finalBuyProb / 100));

          const newWhaleBet: PolymarketWhaleBet = {
            id: `bet-${Date.now()}`,
            time: "Just Now",
            txHash: `0x${Math.random().toString(16).substring(2, 6)}...${Math.random().toString(16).substring(2, 6)}`,
            whaleAddress: `0x${Math.random().toString(16).substring(2, 6)}...${Math.random().toString(16).substring(2, 6)}`,
            whaleLabel: ["Amber Group", "GSR Markets", "Arbitrage Bot V1", "Multicoin Mirror", "DWF Labs Node", "Wintermute Proxy"][Math.floor(Math.random() * 6)],
            eventQuestion: randEvent.question,
            prediction: randPrice,
            sharesCount: shares,
            totalCostUsd: costSeed,
            probabilityAtBet: randEvent.yesProbability
          };

          setLiveBets(prev => [newWhaleBet, ...prev.slice(0, 5)]);
        }
      }
    }, 5000);

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

  // Dynamic daily odds series of activeEvent over the selected dates spectrum
  const activeEventHistoricalOdds = useMemo(() => {
    const startStr = globalTimeHorizon?.startDate || "2026-05-01";
    const endStr = globalTimeHorizon?.endDate || "2026-05-31";

    const start = new Date(startStr);
    const end = new Date(endStr);

    const datesList: string[] = [];
    let current = new Date(start);

    let safetyLimit = 0;
    while (current <= end && safetyLimit < 120) {
      datesList.push(current.toISOString().split("T")[0]);
      current.setDate(current.getDate() + 1);
      safetyLimit++;
    }

    // Generate deterministic daily odds for standard deviation based on activeEvent.yesProbability
    const baseProb = activeEvent.yesProbability;
    const seed = (activeEvent.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)) + 
                 (activeEvent.category.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) * 2.5);

    return datesList.map((dt, idx) => {
      // Create a waving wave representation mimicking high intensity shifting odds
      const wave = Math.sin(idx * 0.4 + seed) * 11 + Math.cos(idx * 0.2 + seed) * 7;
      const noise = (dt.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 5) - 2.5;

      let prob = baseProb + wave + noise;
      prob = Math.max(5, Math.min(95, Math.round(prob)));

      // Model user requested progressive/dynamic participant count trend for each event and timepoint
      const baseTraders = activeEvent.tradersCount;
      const dayFactor = Math.sin(idx * 0.25 - 1.2) * 0.15 + 0.9;
      const volumeSpike = Math.abs(wave) > 10 ? 1.25 : 1.0;
      const dailyParticipants = Math.max(15, Math.floor(baseTraders * dayFactor * volumeSpike));

      return {
        date: dt,
        probability: prob,
        participants: dailyParticipants
      };
    });
  }, [globalTimeHorizon, activeEvent]);

  // Calculates standard deviation and checks if a sudden/rapid shift is happening
  const volatilityMetrics = useMemo(() => {
    const odds = activeEventHistoricalOdds.map(d => d.probability);
    if (odds.length < 2) {
      return { stdDev: 0, warning: false, warningLevel: "LOW" as const, maxSingleDayShift: 0 };
    }

    const mean = odds.reduce((sum, val) => sum + val, 0) / odds.length;
    const variance = odds.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / odds.length;
    const stdDev = Math.sqrt(variance);

    // Calculate maximum simulated single-day shift / delta
    let maxShift = 0;
    for (let i = 1; i < odds.length; i++) {
      const shift = Math.abs(odds[i] - odds[i - 1]);
      if (shift > maxShift) maxShift = shift;
    }

    const isRapid = stdDev > 6.2 || maxShift > 8.0;
    let warningLevel: "LOW" | "MEDIUM" | "HIGH" = "LOW";
    if (stdDev > 8.0 || maxShift > 10.0) {
      warningLevel = "HIGH";
    } else if (stdDev > 4.5 || maxShift > 5.0) {
      warningLevel = "MEDIUM";
    }

    return {
      stdDev: Math.round(stdDev * 100) / 100,
      mean: Math.round(mean * 10) / 10,
      warning: isRapid,
      warningLevel,
      maxSingleDayShift: Math.round(maxShift * 10) / 10,
      minOdds: Math.min(...odds),
      maxOdds: Math.max(...odds)
    };
  }, [activeEventHistoricalOdds]);

  // --- Calculate other critical variables requested ---
  const globalMetrics = useMemo(() => {
    const totalVol = events.reduce((acc, current) => acc + current.totalVolume, 0);
    const totalLiq = events.reduce((acc, current) => acc + current.liquidityPool, 0);
    
    // Divergence rate: Closer YES probe is to 50%, the more "contested", closer to 100/0 is unified consensus.
    // Let's compute average distance from 50 (normalized out of 50 to render a score between 0 and 100).
    const sumDivergences = events.reduce((acc, cur) => acc + Math.abs(cur.yesProbability - 50), 0);
    const avgDivergenceNormalized = Math.round((sumDivergences / events.length) * 2); // 0 (mass debate) up to 100 (high consensus)
    
    // Capital turnover velocity (Vol to Liquidity utilization ratio)
    const capVelocity = totalVol / (totalLiq || 1);

    return {
      totalVol,
      totalLiq,
      avgConsensusScore: avgDivergenceNormalized, // 0 = total puzzle, 100 = unified direction
      capVelocity
    };
  }, [events]);

  // Dynamic Event Status Counts for Segmented Tabs
  const statusCounts = useMemo(() => {
    return {
      All: events.length,
      Active: events.filter(e => e.status === "Active").length,
      "Ending Soon": events.filter(e => e.status === "Ending Soon").length,
      Resolved: events.filter(e => e.status === "Resolved").length,
    };
  }, [events]);

  // --- Search and Category and Tag Filtering Matrix with Sorting ---
  const filteredEvents = useMemo(() => {
    const matched = events.filter(e => {
      const matchCategory = selectedCategory === "All" || e.category === selectedCategory;
      const queryLower = searchQuery.toLowerCase();
      const matchSearch = searchQuery === "" || 
        e.question.toLowerCase().includes(queryLower) || 
        e.questionZh.toLowerCase().includes(queryLower) ||
        e.keywords.some(k => k.toLowerCase().includes(queryLower));
      
      const matchTag = selectedTags.length === 0 || (
        tagFilterMode === "AND" 
          ? selectedTags.every(t => e.keywords.includes(t))
          : selectedTags.some(t => e.keywords.includes(t))
      );

      const matchSpike = !onlyShowSpikes || computeEventGrowthSpike(e, growthThresholdPercent).isTriggered;
      const matchStatus = statusFilter === "All" || e.status === statusFilter;

      return matchCategory && matchSearch && matchTag && matchSpike && matchStatus;
    });

    // Sorting block
    if (sortBy === "vol") {
      return matched.sort((a, b) => b.totalVolume - a.totalVolume);
    }
    if (sortBy === "unresolved") {
      return matched.sort((a, b) => b.unresolvedShares - a.unresolvedShares);
    }
    if (sortBy === "contested") {
      // Closeness to 50% probability represents maximum contest/disagreement
      return matched.sort((a, b) => Math.abs(a.yesProbability - 50) - Math.abs(b.yesProbability - 50));
    }
    if (sortBy === "probability") {
      return matched.sort((a, b) => b.yesProbability - a.yesProbability);
    }

    return matched;
  }, [events, selectedCategory, searchQuery, selectedTags, tagFilterMode, sortBy, onlyShowSpikes, growthThresholdPercent, statusFilter]);

  // --- Category Volume Breakdown Data for Donut Chart ---
  const categoryChartData = useMemo(() => {
    const catMap: { [key: string]: number } = {};
    events.forEach(e => {
      catMap[e.category] = (catMap[e.category] || 0) + e.totalVolume;
    });
    return Object.keys(catMap).map(cat => ({
      name: cat,
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

  // --- Calculate personal positions with live market values ---
  const userPortfolioEvaluations = useMemo(() => {
    let currentAssetValue = 0;
    let totalInvested = 0;

    const evaluated = userPositions.map(pos => {
      // Find corresponding shifting event to evaluate mark price
      const matchedEv = events.find(e => e.id === pos.eventId);
      const currentProb = matchedEv ? matchedEv.yesProbability : pos.entryProbability;
      
      // Share value is probabilistic price (e.g., if YES is 67%, YES shares are worth $0.67, NO shares worth $0.33)
      const currentSharePrice = pos.side === "YES" ? currentProb / 100 : (100 - currentProb) / 100;
      const currentValue = pos.shares * currentSharePrice;
      const profitLoss = currentValue - pos.totalCost;
      const profitLossPercent = (profitLoss / (pos.totalCost || 1)) * 100;

      currentAssetValue += currentValue;
      totalInvested += pos.totalCost;

      return {
        ...pos,
        currentProbability: currentProb,
        currentValue,
        profitLoss,
        profitLossPercent
      };
    });

    return {
      evaluated,
      currentAssetValue,
      totalInvested,
      aggregateProfitLoss: currentAssetValue - totalInvested,
      roi: totalInvested > 0 ? ((currentAssetValue - totalInvested) / totalInvested) * 100 : 0
    };
  }, [userPositions, events]);

  // --- Calculate simulated bet results and add to portfolio list ---
  const handleBuySharesSimulation = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeEvent.status === "Resolved") {
      setBetFeedbackMsg({ status: "error", text: "该合约已经解决结算（Resolved），无法继续买入新的测试持仓。" });
      return;
    }
    const parsedAmount = parseFloat(betAmountText);
    if (isNaN(parsedAmount) || parsedAmount <= 1) {
      setBetFeedbackMsg({ status: "error", text: "输入金额需大于 $1。" });
      return;
    }

    const priceShare = betSide === "YES" ? activeEvent.yesProbability : (100 - activeEvent.yesProbability);
    const costPerShare = priceShare / 100;
    const purchasedShares = Math.round(parsedAmount / costPerShare);
    const potentialProfit = purchasedShares - parsedAmount;

    // 1. Add to positions list so they can track performance live
    setUserPositions(prev => {
      const existingIdx = prev.findIndex(p => p.eventId === activeEvent.id && p.side === betSide);
      if (existingIdx !== -1) {
        // Average up
        const copy = [...prev];
        const existing = copy[existingIdx];
        const newTotalCost = existing.totalCost + parsedAmount;
        const newShares = existing.shares + purchasedShares;
        const newAvgProbability = Math.round((newTotalCost / newShares) * 100);

        copy[existingIdx] = {
          ...existing,
          shares: newShares,
          totalCost: newTotalCost,
          entryProbability: newAvgProbability
        };
        return copy;
      } else {
        return [
          ...prev,
          {
            id: `usr-hold-${Date.now()}`,
            eventId: activeEvent.id,
            question: activeEvent.question,
            questionZh: activeEvent.questionZh,
            side: betSide,
            entryProbability: priceShare,
            shares: purchasedShares,
            totalCost: parsedAmount
          }
        ];
      }
    });

    // 2. Alert success feedback
    setBetFeedbackMsg({
      status: "success",
      text: `模拟买入成功！获得 ${purchasedShares.toLocaleString()} 份 ${betSide} 头寸（平均价格 ${priceShare}¢）。若预测成功结清，最高可获 $${purchasedShares.toLocaleString()}.00 额度 (+${((potentialProfit / parsedAmount) * 100).toFixed(0)}% 潜在ROI)！`
    });

    // 3. Spawns transaction on list feed
    const myMockWhaleBet: PolymarketWhaleBet = {
      id: `mybet-${Date.now()}`,
      time: "Just Now",
      txHash: `0x${Math.random().toString(16).substring(2, 6)}...local`,
      whaleAddress: "0xUser...F5E2",
      whaleLabel: "🎯 Local Trader Asset (YOU)",
      eventQuestion: activeEvent.question,
      prediction: betSide,
      sharesCount: purchasedShares,
      totalCostUsd: parsedAmount,
      probabilityAtBet: activeEvent.yesProbability
    };

    setLiveBets(prev => [myMockWhaleBet, ...prev]);
  };

  // --- Data Export Utilities ---
  
  // Reusable CSV Download helper
  const downloadCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const content = [
      headers.join(","),
      ...rows.map(row => 
        row.map(val => {
          if (val === undefined || val === null) return '""';
          const str = String(val).replace(/"/g, '""');
          return `"${str}"`;
        }).join(",")
      )
    ].join("\n");
    
    // UTF-8 BOM to support Chinese characters in Excel
    const blob = new Blob(["\ufeff" + content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 1. Export Word Cloud (Keyword frequency and accumulated volumes)
  const exportWordCloudData = () => {
    const headers = ["Keyword (关键词)", "Mention Frequency (出现频次)", "Cumulative Betting Volume (累计交易量-USD)", "Sector (二级板块/分类)"];
    const rows = keywordAggregations.map(kw => [
      kw.text,
      kw.value,
      kw.cumulativeVolume,
      kw.sector
    ]);
    downloadCSV("Polymarket_DeFi_WordCloud_Keywords.csv", headers, rows);
  };

  // 2. Export Discussion Heat & Gamble Rank
  const exportHeatRankData = () => {
    const headers = ["Rank (排名)", "Keyword (关键词)", "Separated Contracts (涉及独立合同数)", "Cumulative Volume (累计投注金额-USD)"];
    const rows = keywordAggregations.map((kw, idx) => [
      idx + 1,
      kw.text,
      kw.value,
      kw.cumulativeVolume
    ]);
    downloadCSV("Polymarket_DeFi_Gamble_Heat_Ranking.csv", headers, rows);
  };

  // 3. Export Sector stakes / Key word Tag Volume
  const exportSectorStakesData = () => {
    if (showDonutSector) {
      // Calculate sector volume allocations
      const sectorAllocations: { [key: string]: number } = {};
      events.forEach(ev => {
        sectorAllocations[ev.category] = (sectorAllocations[ev.category] || 0) + ev.totalVolume;
      });
      const headers = ["Sector (板块分类)", "Total Stakes Volume (锁定投注总额-USD)", "Percentage (占比)"];
      const totalVolSum = Object.values(sectorAllocations).reduce((a, b) => a + b, 0) || 1;
      const rows = Object.entries(sectorAllocations).map(([sector, vol]) => [
        sector,
        vol,
        `${((vol / totalVolSum) * 100).toFixed(1)}%`
      ]);
      downloadCSV("Polymarket_DeFi_Sector_Stakes_Allocation.csv", headers, rows);
    } else {
      // Top Keyword volumes
      const headers = ["Keyword Tag (关联大类标签)", "Total Bet Weight (总对赌权重金额-USD)"];
      const rows = keywordAggregations.slice(0, 7).map(item => [
        item.text,
        item.cumulativeVolume
      ]);
      downloadCSV("Polymarket_DeFi_Tag_Volume_Weights.csv", headers, rows);
    }
  };

  // 4. Export Filtered Events Matrix
  const exportFilteredEventsData = () => {
    const headers = [
      "Event ID (事件ID)",
      "Question EN (英文问题描述)",
      "Question ZH (中文问题描述)",
      "Category (二级板块)",
      "YES Probability/Odds % (当前YES胜率)",
      "Prev 12h Probability (前12h胜率)",
      "Change Delta % (对赌情绪偏移动态)",
      "Total Active Volume USD (下注池金额)",
      "Liquidity Pool Depth (流动性池金库)",
      "Traders/Gamblers (累计对赌用户)",
      "Unresolved Shares (待结算份额)",
      "Keywords (索引标签)"
    ];
    const rows = filteredEvents.map(ev => {
      const delta = ev.yesProbability - ev.prev12hProbability;
      const keywordsStr = ev.keywords.join(", ");
      return [
        ev.id,
        ev.question,
        ev.questionZh,
        ev.category,
        ev.yesProbability,
        ev.prev12hProbability,
        `${delta >= 0 ? "+" : ""}${delta}%`,
        ev.totalVolume,
        ev.liquidityPool,
        ev.tradersCount,
        ev.unresolvedShares,
        keywordsStr
      ];
    });
    downloadCSV("Polymarket_DeFi_Filtered_Predictives_Matrix.csv", headers, rows);
  };

  // 5. Export Active Event Spectrum (Historical over selected date range and 24h trend details)
  const exportCurrentEventFullDetails = () => {
    const headers = [
      "Target Date (每日时空断点)",
      "YES Probability % (YES 胜率赔率走势)",
      "Simulated Daily Participants (日活跃博弈账户数)",
      "Current Active Event ID",
      "Current Active Event EN",
      "Current Active Event ZH"
    ];
    const rows = activeEventHistoricalOdds.map(point => [
      point.date,
      point.probability,
      point.participants,
      activeEvent.id,
      activeEvent.question,
      activeEvent.questionZh
    ]);
    downloadCSV(`Polymarket_Event_${activeEvent.id}_Historical_Details.csv`, headers, rows);
  };

  // 6. Export Simulated Portfolio Holdings
  const exportSimulatedHoldingsData = () => {
    const headers = [
      "Position ID (持仓编号)",
      "Event ID (事件编号)",
      "Betting Question (下注预测描述)",
      "Subscribed Side (对赌方向)",
      "Bought Price (买入持仓单价 ¢)",
      "Purchased Shares (买入合约份额)",
      "Total Entry Cost USD (投入结算本金)",
      "Current Odds/Price % (当前市场单价 ¢)",
      "Floating Profit/Loss (当前持仓浮动盈亏)",
      "Return on Investment (投资回报率 ROI)"
    ];
    const rows = userPortfolioEvaluations.evaluated.map(pos => [
      pos.id,
      pos.eventId,
      pos.question,
      pos.side,
      `${pos.entryProbability}¢`,
      pos.shares,
      pos.totalCost,
      `${pos.currentProbability}¢`,
      `$${pos.profitLoss.toFixed(2)}`,
      `${pos.profitLossPercent.toFixed(1)}%`
    ]);
    downloadCSV("Polymarket_DeFi_Simulated_Session_Holdings.csv", headers, rows);
  };

  // 7. Export Live Action Bets / Whale Alerts feed
  const exportLiveBetsData = () => {
    const headers = [
      "Bet ID (订单流水号)",
      "Time (模拟检测时间)",
      "TX Hash (智能合约交易哈希)",
      "Trader Address (交易者账户地址)",
      "Institution/Whale Label (主力/巨鲸标签)",
      "Prediction Side (对赌方向)",
      "Filled Shares (买入合约份额)",
      "Capital Used USD (对赌金额-USD)",
      "Market Price At Fill (成交赔率)",
      "Prediction Question (对赌合同项目)"
    ];
    const rows = liveBets.map(bet => [
      bet.id,
      bet.time,
      bet.txHash,
      bet.whaleAddress,
      bet.whaleLabel,
      bet.prediction,
      bet.sharesCount,
      bet.totalCostUsd,
      `${bet.probabilityAtBet}%`,
      bet.eventQuestion
    ]);
    downloadCSV("Polymarket_DeFi_Whale_Action_Prediction_Feed.csv", headers, rows);
  };

  return (
    <div id="polymarket-defi-panel" className="space-y-6">
      
      {/* 🚀 HUB SYSTEM HEADER WITH QUICK SUMMARY STATS CARD */}
      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-900 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-32 bg-cyan-500/5 rounded-full blur-[90px] pointer-events-none"></div>
        <div className="absolute -bottom-6 -left-6 w-56 h-28 bg-rose-500/5 rounded-full blur-[80px] pointer-events-none"></div>
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 relative z-10">
          <div className="space-y-1.5">
            <span className="bg-cyan-550/10 border border-cyan-500/20 text-cyan-400 text-[9px] font-mono font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full inline-block animate-pulse">
              Decentralized Prediction Market Sentinel (聚界DeFi预测市场观测仪)
            </span>
            <div className="flex items-center gap-2">
              <div className="p-1 px-2.5 bg-gradient-to-br from-indigo-950 to-slate-950 border border-cyan-800/45 text-cyan-300 rounded text-xs font-mono font-bold">
                Polymarket DeFi Engine V2
              </div>
              <h2 className="text-base font-mono font-bold text-white uppercase tracking-tight">
                Crowdsourced Insights, High-Vibe Topic Frequency & Consensuses
              </h2>
            </div>
            <p className="text-[11.5px] text-slate-400 leading-relaxed max-w-4xl font-sans">
              本模块主要监测 Polymarket 去中心化预测协议上针对主要 DeFi 基础设施及多链治理提案的核心预测信息。结合<strong>词频演化图</strong>、<strong>宏观分歧度指数</strong>和<strong>模拟持仓盈亏追踪</strong>，辅助分析全网投资人的宏观反向、情绪定价及链上信息差（Alpha）。
            </p>
          </div>
        </div>

        {/* COMPREHENSIVE BI-LANG VARIABLES TO OBSERVE (必要观察变量网格) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-5 border-t border-slate-900/80">
          
          <div className="bg-slate-900/40 p-3.5 rounded-xl border border-slate-900 hover:border-slate-800 transition-all">
            <span className="text-[8.5px] text-slate-500 uppercase font-mono tracking-wider block">1. TOtal Active Pool Volume</span>
            <span className="text-[10px] text-cyan-400 font-bold block mt-0.5">DeFi 预测标的交易总额</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-black text-slate-200 font-mono">
                ${(globalMetrics.totalVol / 1000000).toFixed(2)}M
              </span>
              <span className="text-[9px] text-slate-500">USD</span>
            </div>
          </div>

          <div className="bg-slate-900/40 p-3.5 rounded-xl border border-slate-900 hover:border-slate-800 transition-all">
            <span className="text-[8.5px] text-slate-500 uppercase font-mono tracking-wider block">2. Total Liquidity Pools</span>
            <span className="text-[10px] text-purple-400 font-bold block mt-0.5">多签流动性底池总量</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-black text-slate-200 font-mono">
                ${(globalMetrics.totalLiq / 1000000).toFixed(2)}M
              </span>
              <span className="text-[9px] text-slate-500">USD</span>
            </div>
          </div>

          <div className="bg-slate-900/40 p-3.5 rounded-xl border border-slate-900 hover:border-slate-800 transition-all relative group">
            <div className="absolute top-2 right-2 text-slate-600 hover:text-slate-400 cursor-help" title="共识分歧度系数: 计算各个合同偏离50%生死线的加权距离。分数越高，表明投资界的方向越趋同、越形成强烈一边倒共识；分数越低，代表各执己见、双方势均力敌。">
              <Info className="h-3 w-3" />
            </div>
            <span className="text-[8.5px] text-slate-500 uppercase font-mono tracking-wider block">3. Consensus Divergence Coeff.</span>
            <span className="text-[10px] text-emerald-400 font-bold block mt-0.5">市场共识离散度系数</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-lg font-black text-slate-200 font-mono">
                {globalMetrics.avgConsensusScore}%
              </span>
              <span className="text-[9px] bg-slate-950 text-emerald-400 font-mono px-1 py-0.5 rounded border border-emerald-950">
                {globalMetrics.avgConsensusScore > 40 ? "Unified/共识强烈" : "Divided/博弈白热"}
              </span>
            </div>
          </div>

          <div className="bg-slate-900/40 p-3.5 rounded-xl border border-slate-900 hover:border-slate-800 transition-all relative">
            <div className="absolute top-2 right-2 text-slate-600 hover:text-slate-400 cursor-help" title="资本周转效率: 交易量/当前底池比值。该比值极高代表有高额投机冲动和快速翻转的情绪，可能隐藏着即将爆仓或未被定价的消息。">
              <Info className="h-3 w-3" />
            </div>
            <span className="text-[8.5px] text-slate-500 uppercase font-mono tracking-wider block">4. Capital Turnover Velocity</span>
            <span className="text-[10px] text-amber-500 font-bold block mt-0.5">资本杠杆投机周转效率</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-black text-slate-200 font-mono">
                {globalMetrics.capVelocity.toFixed(2)}x
              </span>
              <span className="text-[9px] text-slate-500">Volume/Liquidity</span>
            </div>
          </div>

        </div>
      </div>

      {/* 📊 CORE VISIBILITY PANEL: INTERACTIVE KEYWORD MAP, HEAT CHART & SECTOR BREAKDOWN DONUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COMPONENT: WORD FREQUENCY MAP CLOUD (1/3 Width) */}
        <div id="polymarket-wordcloud-box" className="lg:col-span-4 bg-slate-950 p-5 rounded-2xl border border-slate-900 flex flex-col justify-between min-h-[340px]">
          <div className="space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-rose-500" />
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Interactive Word Cloud (预测词频关联网图)
                </h3>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  title="Export Word Cloud Data (导出词频数据)"
                  onClick={exportWordCloudData}
                  className="p-1 text-slate-400 hover:text-cyan-400 border border-slate-800 hover:border-cyan-900/50 hover:bg-cyan-950/20 rounded cursor-pointer transition-all flex items-center gap-1"
                >
                  <Download className="h-3 w-3" />
                  <span className="text-[7.5px] font-mono font-bold">CSV</span>
                </button>
                <span className="text-[8px] font-mono text-cyan-400 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-900/50 uppercase">Multi-Select</span>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
              根据系统过滤出的 DeFi 标的详情汇总的词频，大小代表投注量权重。<strong>支持多词多选过滤</strong>：
            </p>

            {/* Visual Word Cloud Grid */}
            <div className="bg-slate-900/20 p-4 rounded-xl border border-slate-900/80 min-h-[190px] flex flex-wrap items-center justify-center gap-x-3 gap-y-2 relative overflow-hidden select-none pb-12">
              <div className="absolute top-1.5 right-2 text-[7px] font-mono text-slate-600 uppercase">Weighted by Vol</div>
              
              {keywordAggregations.map((kw) => {
                const isSelected = selectedTags.includes(kw.text);
                const volM = kw.cumulativeVolume / 1000000;
                let fontSize = "text-[10px]";
                let fontColor = "text-slate-400 hover:text-slate-200";

                if (volM > 12) {
                  fontSize = "text-lg font-black sm:text-xl";
                  fontColor = isSelected ? "text-rose-450 font-black ring-1 ring-rose-500/50 bg-rose-950/40" : "text-rose-400 hover:text-rose-300 font-bold";
                } else if (volM > 7) {
                  fontSize = "text-sm font-bold sm:text-base";
                  fontColor = isSelected ? "text-cyan-400 font-black ring-1 ring-cyan-500/50 bg-cyan-950/40" : "text-cyan-400 hover:text-cyan-200 font-semibold";
                } else if (volM > 4) {
                  fontSize = "text-[11.5px] font-semibold sm:text-xs";
                  fontColor = isSelected ? "text-purple-400 ring-1 ring-purple-500/50 bg-purple-950/40" : "text-purple-300 hover:text-purple-100";
                } else {
                  fontSize = "text-[9.5px] font-medium";
                  fontColor = isSelected ? "text-amber-400 ring-1 ring-amber-500/50 bg-amber-950/40" : "text-slate-450 hover:text-slate-200";
                }

                return (
                  <button
                    key={kw.text}
                    type="button"
                    title={`Keyword: ${kw.text} | Cumulative Event Vol: $${(kw.cumulativeVolume / 1000000).toFixed(1)}M | Heat Index: ${kw.value}`}
                    onClick={() => {
                      if (selectedTags.includes(kw.text)) {
                        setSelectedTags(prev => prev.filter(t => t !== kw.text));
                      } else {
                        setSelectedTags(prev => [...prev, kw.text]);
                      }
                    }}
                    className={`transition-all duration-200 cursor-pointer px-1.5 py-0.5 rounded-md hover:scale-105 inline-block ${fontSize} ${fontColor} ${
                      isSelected 
                        ? "shadow-md shadow-cyan-950/50 font-mono border border-cyan-500/30" 
                        : "hover:bg-slate-900/40"
                    }`}
                  >
                    {kw.text}
                    <span className="text-[7.5px] opacity-50 font-mono align-super ml-0.5">
                      ({kw.value})
                    </span>
                  </button>
                );
              })}

              {selectedTags.length > 0 && (
                <div className="absolute bottom-2 left-2 flex flex-wrap gap-1 items-center max-w-[90%] pb-1 overflow-x-auto">
                  <span className="text-[8px] font-mono text-slate-500">已选:</span>
                  {selectedTags.map(tag => (
                    <span key={tag} className="bg-cyan-950/90 border border-cyan-500/40 text-cyan-400 text-[8px] font-mono font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 shrink-0">
                      {tag}
                      <button 
                        type="button" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTags(prev => prev.filter(t => t !== tag));
                        }} 
                        className="hover:text-red-400 ml-0.5 font-bold cursor-pointer text-[8.5px]"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 flex flex-col xs:flex-row xs:items-center justify-between text-[9.5px] font-mono text-slate-500 border-t border-slate-900/60 gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-[8.5px] text-slate-500">匹配模式:</span>
              <div className="flex bg-slate-900 border border-slate-800 p-0.5 rounded text-[8px]">
                <button
                  type="button"
                  onClick={() => setTagFilterMode("OR")}
                  className={`px-1 py-0.5 rounded cursor-pointer transition ${
                    tagFilterMode === "OR" 
                      ? "bg-cyan-950 text-cyan-400 font-bold border border-cyan-900/60" 
                      : "text-slate-500 hover:text-slate-350"
                  }`}
                  title="或匹配：包含任意所选关键词的事件"
                >
                  ANY (或)
                </button>
                <button
                  type="button"
                  onClick={() => setTagFilterMode("AND")}
                  className={`px-1 py-0.5 rounded cursor-pointer transition ${
                    tagFilterMode === "AND" 
                      ? "bg-cyan-950 text-cyan-400 font-bold border border-cyan-900/60" 
                      : "text-slate-500 hover:text-slate-350"
                  }`}
                  title="且匹配：必须包含全部所选关键词的事件"
                >
                  ALL (且)
                </button>
              </div>
            </div>
            <button
               type="button"
               disabled={selectedTags.length === 0}
               onClick={() => setSelectedTags([])}
               className={`text-[9px] font-bold cursor-pointer transition ${
                  selectedTags.length > 0 ? "text-rose-400 hover:underline" : "text-slate-600 cursor-not-allowed"
               }`}
            >
              Reset ({selectedTags.length}) / 重置
            </button>
          </div>
        </div>

        {/* MIDDLE COMPONENT: NEW WORD FREQUENCY AND VOLUME RANKING LIST (2/3 Width item) */}
        <div id="polymarket-rankinglist-box" className="lg:col-span-4 bg-slate-950 p-5 rounded-2xl border border-slate-900 flex flex-col justify-between min-h-[340px]">
          <div className="space-y-3.5 w-full">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <div className="flex items-center gap-2">
                <Award className="h-4.5 w-4.5 text-amber-500 animate-pulse" />
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Discussion Heat & Gamble Rank (博弈池词频与投注榜)
                </h3>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  title="Export Heat Rank Data (导出热度榜数据)"
                  onClick={exportHeatRankData}
                  className="p-1 text-slate-400 hover:text-amber-450 border border-slate-800 hover:border-amber-900/50 hover:bg-amber-950/20 rounded cursor-pointer transition-all flex items-center gap-1"
                >
                  <Download className="h-3 w-3" />
                  <span className="text-[7.5px] font-mono font-bold">CSV</span>
                </button>
                <span className="text-[8px] font-mono text-amber-400 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-900/50 uppercase">By Traded Vol</span>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
              反映各关键词所链接的所有预测合同在 DeFil 中的<strong>累计讨论与博弈量</strong>排行，点击指标即可同步高亮或多选过滤：
            </p>

            <div className="space-y-1.5 max-h-[190px] overflow-y-auto pr-1 select-none scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
              {keywordAggregations.map((kw, idx) => {
                const isSelected = selectedTags.includes(kw.text);
                const maxVol = Math.max(...keywordAggregations.map(k => k.cumulativeVolume)) || 1;
                const percentage = (kw.cumulativeVolume / maxVol) * 100;
                
                // Color badges for Top 3
                let rankBadge = "";
                if (idx === 0) rankBadge = "bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black";
                else if (idx === 1) rankBadge = "bg-slate-300 text-slate-900 font-black";
                else if (idx === 2) rankBadge = "bg-amber-700 text-white font-black";
                else rankBadge = "bg-slate-900 text-slate-400 border border-slate-850";

                return (
                  <div 
                    key={kw.text}
                    onClick={() => {
                      if (selectedTags.includes(kw.text)) {
                        setSelectedTags(prev => prev.filter(t => t !== kw.text));
                      } else {
                        setSelectedTags(prev => [...prev, kw.text]);
                      }
                    }}
                    className={`group/row p-1.5 px-2.5 rounded-lg border transition-all duration-150 cursor-pointer flex flex-col justify-between ${
                      isSelected 
                        ? "bg-slate-900/80 border-cyan-500/50 shadow-md shadow-cyan-950/20" 
                        : "bg-slate-900/30 border-slate-900/60 hover:bg-slate-900 hover:border-slate-850"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-1.5">
                        {/* Rank Badge */}
                        <span className={`w-3.5 h-3.5 rounded text-[8px] flex items-center justify-center font-mono shrink-0 ${rankBadge}`}>
                          {idx + 1}
                        </span>
                        
                        {/* Keyword Label */}
                        <span className={`text-[10px] font-mono tracking-tight transition ${
                          isSelected ? "text-cyan-400 font-extrabold" : "text-slate-200 group-hover/row:text-white"
                        }`}>
                          {kw.text}
                        </span>

                        {/* Frequency Indicator */}
                        <span className="text-[8px] text-slate-500 font-mono" title={`Mentioned in ${kw.value} separate events`}>
                          x{kw.value}
                        </span>
                      </div>

                      {/* Cumulative Vol */}
                      <div className="flex items-center gap-1 font-mono text-[9px]">
                        <span className="text-slate-300 font-semibold">
                          ${(kw.cumulativeVolume / 1000000).toFixed(2)}M
                        </span>
                        <span className="text-[7.5px] text-slate-550 uppercase">usd</span>
                        {isSelected && (
                          <span className="h-1 w-1 rounded-full bg-cyan-400 inline-block ring-1 ring-cyan-950 animate-pulse"></span>
                        )}
                      </div>
                    </div>

                    {/* Progress Fill Bar */}
                    <div className="w-full bg-slate-950 h-0.5 rounded overflow-hidden mt-1 relative">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          isSelected 
                            ? "bg-gradient-to-r from-cyan-500 to-teal-400" 
                            : idx === 0 
                              ? "bg-gradient-to-r from-rose-500 to-red-400"
                              : idx === 1
                                ? "bg-gradient-to-r from-cyan-500 to-sky-400"
                                : "bg-gradient-to-r from-slate-600 to-slate-500"
                        }`}
                        style={{ width: `${Math.max(3, percentage)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-900/60 flex items-center justify-between text-[8px] font-mono text-slate-500">
            <span>discussion frequency reflects actual debate hotspots</span>
            <span className="text-amber-500 font-bold uppercase flex items-center gap-0.5">
              <Flame className="h-2.5 w-2.5" /> HEAT INDEX SYNCHRONIZED
            </span>
          </div>
        </div>

        {/* RIGHT COMPONENT: FLEXIBLE DUAL-VIEW (PORTFOLIO VOLUME OR SECTOR BREAKDOWN) (3/3 Width) */}
        <div id="polymarket-volumechart-box" className="lg:col-span-4 bg-slate-950 p-5 rounded-2xl border border-slate-900 flex flex-col justify-between min-h-[340px]">
          <div className="space-y-3.5 w-full">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <div className="flex items-center gap-2">
                <BarChart4 className="h-4 w-4 text-cyan-400" />
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  {showDonutSector ? "DeFi Sector Cumulative Stakes (板块占比)" : "Value Traded by Keyword Tag (高频标签投注)"}
                </h3>
              </div>
              
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  title="Export Sector stakes / Keyword Tag Volume (导出资金配比数据)"
                  onClick={exportSectorStakesData}
                  className="p-1 text-slate-400 hover:text-cyan-400 border border-slate-800 hover:border-cyan-900/50 hover:bg-cyan-950/20 rounded cursor-pointer transition-all flex items-center gap-1"
                >
                  <Download className="h-3 w-3" />
                  <span className="text-[7.5px] font-mono font-bold">CSV</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowDonutSector(!showDonutSector)}
                  className="text-[8px] font-mono text-cyan-400 border border-cyan-800/60 bg-cyan-950/20 hover:bg-cyan-950/60 px-1.5 py-0.5 rounded cursor-pointer transition-all shrink-0"
                >
                  {showDonutSector ? "标签排行" : "板块资金分布"}
                </button>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
              {showDonutSector 
                ? "反映了在诸如 DEX、借贷、稳定币等二级板块由于猜测聚集聚集而锁定的资金配比："
                : "将各合同定价中的关键词所链接的所有赌注累加而出的全局柱状图排名。"}
            </p>

            {/* DUAL RENDER LOGIC */}
            <div className="h-[180px] w-full bg-slate-900/10 rounded-xl relative pt-2">
              {showDonutSector ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      cx="50%"
                      cy="48%"
                      innerRadius={42}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || "#10b981"} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const val = payload[0].value as number;
                          const name = payload[0].name as string;
                          return (
                            <div className="bg-slate-950 border border-slate-850 p-2 rounded-lg font-mono text-[9px] text-slate-300">
                              <span className="text-white font-bold block uppercase">{name} Sector</span>
                              <span className="text-cyan-400 font-bold block mt-0.5">
                                Agg Volume: ${val.toLocaleString()} USD
                              </span>
                              <span className="text-slate-500 text-[8px]">
                                Share of DeFi bets: {((val / globalMetrics.totalVol) * 100).toFixed(1)}%
                              </span>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={keywordAggregations.slice(0, 7)} 
                    layout="vertical"
                    margin={{ top: 5, right: 15, left: -20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} opacity={0.3} />
                    <XAxis 
                      type="number" 
                      tickFormatter={(v) => `$${(v / 1000000).toFixed(0)}M`}
                      tick={{ fill: '#64748b', fontSize: 8, fontFamily: 'monospace' }}
                      axisLine={{ stroke: '#1e293b' }}
                      tickLine={false}
                    />
                    <YAxis 
                      type="category" 
                      dataKey="text" 
                      tick={{ fill: '#e2e8f0', fontSize: 8, fontFamily: 'monospace', fontWeight: 'bold' }}
                      axisLine={{ stroke: '#1e293b' }}
                      tickLine={false}
                      width={55}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const dat = payload[0].payload;
                          return (
                            <div className="bg-slate-950 border border-slate-850 p-2 rounded-lg font-mono text-[9px] text-slate-300">
                              <p className="text-white font-bold uppercase">{dat.text} (Tag)</p>
                              <p className="text-cyan-400 font-extrabold mt-1">Total Bet Weight: ${dat.cumulativeVolume.toLocaleString()} USD</p>
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
                      {keywordAggregations.slice(0, 7).map((entry, index) => {
                        const color = CATEGORY_COLORS[entry.sector] || "#10b981";
                        return <Cell key={`cell-${index}`} fill={color} opacity={0.8} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}

              {/* Pie center legend */}
              {showDonutSector && (
                <div className="absolute top-[48%] left-[50%] -translate-x-[50%] -translate-y-[50%] text-center pointer-events-none">
                  <span className="text-[7px] uppercase text-slate-500 font-mono block">STAKES TOTAL</span>
                  <span className="text-[10px] font-black font-mono text-slate-100">
                    ${(globalMetrics.totalVol / 1000000).toFixed(1)}M
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 flex items-center justify-between font-mono text-[8px] text-slate-500 border-t border-slate-950">
            <span>
              {showDonutSector 
                ? "STAKING · DEX · 稳定币 · 监管 · 借贷 · L2"
                : "Aggregated cumulative sum index from 8 current contracts"}
            </span>
            <span>Real-time calculation</span>
          </div>
        </div>

      </div>

      {/* 🔮 MAIN SECTION: FEED OF VOTING RULES & HOTTEST FOCUS DETAILED PERSPECTIVE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN (GRID COLS 8): THE EVENT STREAM & MULTI-SORT CONTROLS */}
        <div className="lg:col-span-8 bg-slate-950 p-5 rounded-2xl border border-slate-900 space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-900/80 pb-3">
            <div className="flex items-center gap-2">
              <Flame className="h-4.5 w-4.5 text-orange-500 animate-pulse" />
              <div>
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Contested Predictives Matrix (预测事件白热化列表面板)
                </h3>
                <span className="text-[8px] text-slate-550 block">Click cards to focus primary buy sliders and detailed indicators</span>
              </div>
            </div>
            
            {/* Sort selection for optimal metrics analysis */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                title="Export Filtered Events Matrix (导出事件矩阵)"
                onClick={exportFilteredEventsData}
                className="p-1 px-1.5 text-slate-400 hover:text-orange-400 border border-slate-800 hover:border-orange-900/50 hover:bg-orange-950/20 rounded-md cursor-pointer transition-all flex items-center gap-1"
              >
                <Download className="h-3 w-3 text-orange-500" />
                <span className="text-[8px] font-mono font-bold">Export CSV</span>
              </button>
              
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono text-slate-500">排序:</span>
                <div className="flex bg-slate-900 border border-slate-800 p-0.5 rounded-lg">
                  {[
                    { id: "vol", name: "Stakes Vol" },
                    { id: "contested", name: "Dispute胶着度" },
                    { id: "unresolved", name: "Shares" },
                    { id: "probability", name: "YES Odds" }
                  ].map(s => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSortBy(s.id as any)}
                      className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold cursor-pointer transition ${
                        sortBy === s.id
                          ? "bg-slate-950 text-cyan-400 border border-slate-800"
                          : "text-slate-500 hover:text-slate-300 border border-transparent"
                      }`}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Lifecycle Stage Filter Segmented Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-905 border border-slate-900 rounded-xl p-2.5">
            <div className="flex items-center gap-2">
              <ListFilter className="h-3.5 w-3.5 text-cyan-400" />
              <div className="space-y-0.5">
                <span className="text-[9px] font-mono font-bold text-slate-350 block uppercase tracking-wider">
                  Event Stage Filters (生命周期矩阵筛选)
                </span>
                <span className="text-[7.5px] text-slate-500 font-sans block">
                  Organize target predictions by their operational phase
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 shrink-0">
              {[
                { id: "All", name: "All / 全部", count: statusCounts.All, color: "from-blue-600/15 to-indigo-600/15 border-blue-900/60 text-blue-400 bg-blue-950/10 shadow-blue-900/10 hover:border-blue-700/50" },
                { id: "Active", name: "Active / 进行中", count: statusCounts.Active, color: "from-emerald-600/15 to-teal-600/15 border-emerald-900/60 text-emerald-400 bg-emerald-950/10 shadow-emerald-900/10 hover:border-emerald-700/50" },
                { id: "Ending Soon", name: "Ending Soon / 临近到期", count: statusCounts["Ending Soon"], color: "from-amber-600/15 to-orange-600/15 border-amber-900/60 text-amber-400 bg-amber-950/10 shadow-amber-950/10 hover:border-amber-700/50" },
                { id: "Resolved", name: "Resolved / 已结算", count: statusCounts.Resolved, color: "from-purple-600/15 to-fuchsia-600/15 border-purple-900/60 text-purple-400 bg-purple-950/10 shadow-purple-950/10 hover:border-purple-700/50" }
              ].map(t => {
                const isActive = statusFilter === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setStatusFilter(t.id as any)}
                    className={`px-3 py-1 bg-slate-900/40 rounded-lg border text-[9px] font-mono font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                      isActive
                        ? `bg-gradient-to-r ${t.color} font-black shadow-lg ring-1 ring-white/10`
                        : "bg-slate-900/30 border-slate-850 text-slate-500 hover:text-slate-350 hover:border-slate-800 border-transparent"
                    }`}
                  >
                    <span>{t.name}</span>
                    <span className={`px-1.5 py-0.2 rounded-full font-sans text-[8px] font-extrabold ${isActive ? "bg-slate-950 text-white" : "bg-slate-950 text-slate-600"}`}>
                      {t.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Expanded filters widget */}
          <div className="flex flex-col md:flex-row gap-2">
            
            {/* Quick Search */}
            <div className="relative flex-1">
              <span className="absolute left-2.5 top-2.5 text-slate-500">
                <Search className="h-3.5 w-3.5" />
              </span>
              <input
                type="text"
                placeholder="按协议、说明或标签查找预测事件 (e.g., Uniswap v4, Solana, Gas)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/40 border border-slate-850 focus:border-cyan-500 focus:ring-0 text-xs font-mono text-slate-100 placeholder-slate-600 rounded-lg pl-8 pr-3 py-2"
              />
            </div>

            {/* Category selection */}
            <div className="flex flex-wrap items-center gap-1">
              {["All", "DEX", "Lending", "Staking", "Stablecoin", "Regulation", "Layer2"].map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2 py-1.5 rounded-lg text-[9px] font-mono font-bold cursor-pointer transition ${
                    selectedCategory === cat
                      ? "bg-cyan-950 border border-cyan-800/60 text-cyan-400"
                      : "bg-slate-900/50 text-slate-500 hover:text-slate-350 border border-transparent"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* ⚡ INTEGRATED SPECTRUM: DYNAMIC GROWTH SPIKE & WHALE ACTIVITY ALERTER */}
          <div className="bg-slate-900/30 border border-slate-900 rounded-xl p-3.5 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-950/45 rounded-lg border border-emerald-900/55 text-emerald-400 shrink-0">
                <Activity className="h-4 w-4 text-emerald-400 animate-pulse animate-duration-1000" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono font-extrabold text-slate-150 uppercase tracking-wider">Growth Spike Engine (博弈增速引擎)</span>
                  <span className="text-[7.5px] font-mono text-emerald-400 bg-emerald-950/40 leading-none px-1.5 py-0.5 rounded border border-emerald-900/30 font-bold uppercase tracking-widest">Active</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-normal">
                  Identifies contracts with sudden participant growth. Highlights potential whale activity & concentrated liquidity impact.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto text-[10px] font-mono shrink-0">
              {/* Presets */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 text-[8.5px] uppercase font-bold">Alert:</span>
                <div className="flex bg-slate-950 border border-slate-850 p-0.5 rounded-lg">
                  {[
                    { name: "Normal (15%+)", pct: 15 },
                    { name: "Whale (25%+)", pct: 25 },
                    { name: "Extreme (40%+)", pct: 40 }
                  ].map(preset => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => setGrowthThresholdPercent(preset.pct)}
                      className={`px-1.5 py-0.5 rounded text-[8px] font-black cursor-pointer transition ${
                        growthThresholdPercent === preset.pct
                          ? "bg-slate-900 text-emerald-400 border border-slate-800"
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Slider for custom threshold */}
              <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-lg border border-slate-850">
                <span className="text-[8.5px] text-slate-500 uppercase">Trigger:</span>
                <span className="text-[9.5px] font-bold font-mono text-emerald-400 w-9 text-right">
                  {growthThresholdPercent}%
                </span>
                <input
                  type="range"
                  min="10"
                  max="60"
                  step="5"
                  value={growthThresholdPercent}
                  onChange={(e) => setGrowthThresholdPercent(Number(e.target.value))}
                  className="w-14 h-1 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-emerald-400 transition"
                />
              </div>

              {/* Filter toggle */}
              <button
                type="button"
                onClick={() => setOnlyShowSpikes(!onlyShowSpikes)}
                className={`px-2 py-1.5 rounded-lg border text-[9px] font-mono font-bold cursor-pointer transition flex items-center gap-1 ${
                  onlyShowSpikes
                    ? "bg-emerald-950/60 border-emerald-500/30 text-emerald-400"
                    : "bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-100"
                }`}
              >
                <Zap className={`h-3 w-3 ${onlyShowSpikes ? "text-emerald-400 animate-bounce" : "text-slate-500"}`} />
                <span>Alert Filter ({events.filter(e => computeEventGrowthSpike(e, growthThresholdPercent).isTriggered).length})</span>
              </button>
            </div>
          </div>

          {/* Grid display of prediction cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredEvents.length === 0 ? (
              <div className="col-span-2 bg-slate-900/10 py-12 rounded-xl text-center text-slate-500 font-mono text-xs border border-dashed border-slate-900/80">
                抱歉，没有找到匹配相应过滤条件的预测事件。请重置关键词或输入。
              </div>
            ) : (
              filteredEvents.map((ev) => {
                const isSelected = selectedEventId === ev.id;
                const probDelta = ev.yesProbability - ev.prev12hProbability;
                const isDeltaPositive = probDelta >= 0;

                // Compute detailed growth spike stats
                const spike = computeEventGrowthSpike(ev, growthThresholdPercent);

                // Necessary Variable: Tension index indicating uncertainty level of this debate.
                // 50% is peak tension (absolute disagreement), while 10% or 90% are relaxed values.
                const disagreementLevel = 100 - (Math.abs(ev.yesProbability - 50) * 2);

                return (
                  <div
                    key={ev.id}
                    onClick={() => {
                      setSelectedEventId(ev.id);
                      setBetFeedbackMsg({ status: "idle", text: "" });
                    }}
                    className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer select-none space-y-4 flex flex-col justify-between hover:scale-[1.01] ${
                      isSelected
                        ? "border-cyan-500/40 bg-slate-900/45 shadow-lg shadow-cyan-950/10 ring-1 ring-cyan-500/10"
                        : spike.isTriggered
                          ? "border-emerald-800 bg-emerald-950/10 shadow-lg shadow-emerald-950/15 hover:border-emerald-600 hover:bg-emerald-950/20"
                          : "border-slate-900 hover:border-slate-800 hover:bg-slate-900/20 bg-slate-900/20"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span 
                            className="px-2 py-0.5 text-[7px] font-extrabold uppercase border rounded font-mono shrink-0"
                            style={{ 
                              color: CATEGORY_COLORS[ev.category], 
                              borderColor: `${CATEGORY_COLORS[ev.category]}25`,
                              backgroundColor: `${CATEGORY_COLORS[ev.category]}10`
                            }}
                          >
                            {ev.category}
                          </span>
                          {spike.isTriggered && (
                            <span className="flex items-center gap-0.5 px-1.5 py-0.5 text-[7px] font-black uppercase text-emerald-450 bg-emerald-950/40 rounded border border-emerald-900/50 animate-pulse shrink-0">
                              <Zap className="h-2 w-2 text-emerald-400 shrink-0 fill-emerald-400/20" />
                              SURGE +{spike.maxPercentSurge}%
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 font-mono text-[8.5px] text-slate-500">
                          <div className="flex items-center gap-1">
                            <Users className="h-2.5 w-2.5" />
                            <span>{ev.tradersCount.toLocaleString()} x 24h:</span>
                          </div>
                          
                          {/* Tiny 24hr sparkline chart */}
                          <div className="w-16 h-5 relative" title="24-hour hourly dual-stake participation trend">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={get24hParticipationForEvent(ev)} margin={{ top: 1, right: 1, left: 1, bottom: 1 }}>
                                <Tooltip
                                  allowEscapeViewBox={{ x: true, y: true }}
                                  cursor={{ stroke: '#475569', strokeWidth: 1 }}
                                  content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                      const data = payload[0].payload;
                                      return (
                                        <div className="bg-slate-950/95 border border-slate-850 p-1.5 rounded shadow-2xl font-mono text-[8px] text-slate-300 space-y-0.5 pointer-events-none z-50 min-w-[125px]">
                                          <p className="text-white font-bold border-b border-slate-800 pb-0.5 mb-1">{data.date}</p>
                                          <p className="text-indigo-400 font-semibold flex items-center justify-between gap-2">
                                            <span>Traders:</span>
                                            <span>{data.count.toLocaleString()}</span>
                                          </p>
                                          <p className="text-cyan-400 font-semibold flex items-center justify-between gap-2">
                                            <span>Odds:</span>
                                            <span>{data.probability}% ({data.probability}¢)</span>
                                          </p>
                                        </div>
                                      );
                                    }
                                    return null;
                                  }}
                                />
                                <Area 
                                  type="monotone" 
                                  dataKey="count" 
                                  stroke="#6366f1" 
                                  fill="#6366f1" 
                                  fillOpacity={0.12} 
                                  strokeWidth={1} 
                                  dot={false}
                                  isAnimationActive={false}
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>

                      {/* Question English/Chinese */}
                      <div>
                        <h4 className="text-[11.5px] font-semibold text-slate-100 leading-snug">
                          {ev.question}
                        </h4>
                        <p className="text-[10.5px] text-slate-400 font-sans leading-normal mt-1 italic">
                          {ev.questionZh}
                        </p>
                      </div>
                    </div>

                    {/* Percentage Probability Display Container */}
                    <div className="space-y-2.5 border-t border-slate-900 pt-3">
                      
                      <div className="flex items-end justify-between">
                        <div className="space-y-0.5">
                          <span className="text-[8px] text-slate-500 uppercase font-black tracking-wider block">YES Winning Odds (胜出概率)</span>
                          {ev.status === "Resolved" ? (
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[9px] bg-purple-950 text-purple-400 px-1.5 py-0.5 rounded border border-purple-900/40 font-black tracking-widest uppercase font-mono">
                                RESOLVED
                              </span>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded border font-black uppercase font-mono ${
                                ev.resolvedOutcome === "YES" 
                                  ? "bg-cyan-950 border-cyan-800/40 text-cyan-400" 
                                  : "bg-rose-950 border-rose-800/40 text-rose-400"
                              }`}>
                                OUTCOME: {ev.resolvedOutcome}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-xl font-black font-mono text-cyan-400">
                                {ev.yesProbability}%
                              </span>
                              <span className={`text-[9.5px] font-bold ${isDeltaPositive ? "text-emerald-400" : "text-rose-400"} flex items-center`}>
                                {isDeltaPositive ? "▲" : "▼"}{Math.abs(probDelta)}% (12h)
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Sparkline for Probability */}
                        <div className="w-16 h-5" title="7-day dynamic path of sentiment">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={ev.probabilityHistory.map((v, i) => ({ val: v, idx: i }))}>
                              <YAxis domain={[0, 100]} hide />
                              <Line 
                                type="monotone" 
                                dataKey="val" 
                                stroke={ev.status === "Resolved" ? "#a855f7" : ev.yesProbability > 50 ? "#06b6d4" : "#f43f5e"} 
                                strokeWidth={1.5} 
                                dot={false} 
                                isAnimationActive={false}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Micro Progress Bar & Tension Coefficient indicator */}
                      <div className="space-y-1">
                        <div className="h-1 bg-slate-950 rounded-full overflow-hidden flex">
                          <div 
                            className={`${ev.status === "Resolved" ? (ev.resolvedOutcome === "YES" ? "bg-cyan-500 w-full" : "bg-slate-800 w-0") : "bg-cyan-400 transition-all duration-300"}`}
                            style={ev.status === "Resolved" ? {} : { width: `${ev.yesProbability}%` }}
                          ></div>
                          <div 
                            className={`${ev.status === "Resolved" ? (ev.resolvedOutcome === "NO" ? "bg-rose-500 w-full" : "bg-slate-800 w-0") : "bg-rose-500 transition-all duration-300 flex-1"}`}
                          ></div>
                        </div>
                        <div className="flex justify-between items-center text-[7.5px] font-mono text-slate-650">
                          {ev.status === "Resolved" ? (
                            <span>Settled Date: {ev.endDate}</span>
                          ) : (
                            <span>Buy YES cost: {ev.yesProbability}¢</span>
                          )}
                          <span>分歧激烈度 Index: <span className="text-rose-400 font-bold">{ev.status === "Resolved" ? "0%" : `${disagreementLevel}%`}</span></span>
                        </div>
                      </div>

                      {/* Growth Surge Tracker subtext */}
                      {spike.isTriggered && (
                        <div className="bg-emerald-950/20 border border-emerald-900/15 rounded-lg p-2 flex items-center justify-between text-[8px] font-mono leading-tight">
                          <span className="text-emerald-500 font-bold flex items-center gap-1 uppercase tracking-tight">
                            <Activity className="h-2.5 w-2.5 text-emerald-400 animate-pulse" />
                            Hourly Peak Surge:
                          </span>
                          <span className="text-emerald-400 font-extrabold">
                            +{spike.maxPercentSurge}% (+{spike.maxAbsSurge} Traders)
                          </span>
                        </div>
                      )}

                      {/* Info lines undercard */}
                      <div className="flex justify-between items-center text-[8.5px] font-mono text-slate-500 pt-1 border-t border-slate-900/40">
                        <span className="flex items-center gap-1 text-slate-500">
                          <Clock className="h-2.5 w-2.5" />
                          截止: {ev.endDate}
                        </span>
                        <span>累计博弈重金: ${(ev.totalVolume / 1000000).toFixed(2)}M</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN (GRID COLS 4): THE ACTIVE EVENT PERSPECTIVE & SLIP & USER ASSET WALLET */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* HOT FOCUS PERSPECTIVE WINDOW (必要观测变量其三：当前事件的多维博弈指针解剖) */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-900 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="h-4.5 w-4.5 text-cyan-400" />
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Detailed Focal Deep Dive (单标的高级博弈解密)
                </h3>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  title="Export Active Event Historical Spectrum & Details (导出本案历史时间走势)"
                  onClick={exportCurrentEventFullDetails}
                  className="p-1 text-slate-400 hover:text-cyan-400 border border-slate-800 hover:border-cyan-900/50 hover:bg-cyan-950/20 rounded cursor-pointer transition-all flex items-center gap-1"
                >
                  <Download className="h-3 w-3" />
                  <span className="text-[7.5px] font-mono font-bold">CSV</span>
                </button>
                <span className="text-[8px] bg-cyan-950 text-cyan-400 px-1 py-0.5 rounded font-mono font-bold">Focal Analytics</span>
              </div>
            </div>

            <div className="space-y-2 bg-slate-900/30 p-3 rounded-lg border border-slate-900/80">
              <div className="flex items-center justify-between text-[8px] text-slate-500 uppercase font-mono font-bold">
                <span>Active Target Focus (选中事件)</span>
                <span className="text-cyan-400 text-[9px] font-mono font-bold">ID: {activeEvent.id}</span>
              </div>
              <p className="text-slate-100 font-bold text-[11px] leading-relaxed">
                {activeEvent.question}
              </p>
              <p className="text-slate-400 text-[10px] leading-relaxed italic border-t border-slate-950 pt-2 font-sans">
                {activeEvent.questionZh}
              </p>
            </div>

            {/* Other Critical Observational Variables (特有观测高级变量) */}
            <div className="space-y-2.5 text-[10px] font-mono">
              <span className="text-[8px] text-slate-500 uppercase font-bold block">Speculative Efficiency Variables (必要监测变量)</span>
              
              <div className="grid grid-cols-3 gap-1.5">
                
                <div className="bg-slate-900 p-2 rounded-lg border border-slate-900/80">
                  <span className="text-[6.5px] text-slate-500 uppercase block truncate">Liquidity Depth</span>
                  <span className="text-slate-400 font-bold block text-[8px] truncate">池流动性金库</span>
                  <p className="text-slate-200 font-black mt-1 text-[10px] sm:text-[11px] truncate" title={`$${activeEvent.liquidityPool.toLocaleString()}`}>
                    ${activeEvent.liquidityPool.toLocaleString()}
                  </p>
                </div>

                <div className="bg-slate-900 p-2 rounded-lg border border-slate-900/80">
                  <span className="text-[6.5px] text-slate-500 uppercase block truncate">Value Ratio</span>
                  <span className="text-slate-400 font-bold block text-[8px] truncate">博弈溢出率</span>
                  <p className="text-slate-200 font-black mt-1 text-[10px] sm:text-[11px]">
                    {(activeEvent.totalVolume / (activeEvent.liquidityPool || 1)).toFixed(1)}x
                  </p>
                </div>

                <div className="bg-indigo-950/20 p-2 rounded-lg border border-indigo-900/40">
                  <span className="text-[6.5px] text-indigo-400 uppercase block truncate">Active Gamblers</span>
                  <span className="text-indigo-300 font-bold block text-[8px] truncate">累计对赌用户</span>
                  <p className="text-indigo-200 font-black mt-1 text-[10px] sm:text-[11px] flex items-center gap-0.5">
                    <Users className="h-2.5 w-2.5 text-indigo-400 shrink-0" />
                    {activeEvent.tradersCount.toLocaleString()}
                  </p>
                </div>

              </div>

              {/* Time-point Daily Participants Trend Chart (对每个时间点参与人数统计) */}
              <div className="bg-slate-900/40 p-2.5 rounded-xl border border-slate-900 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-900 pb-1">
                  <span className="text-[8px] text-slate-500 uppercase font-black tracking-wider flex items-center gap-1">
                    <Users className="h-2.5 w-2.5 text-indigo-400" />
                    Timepoints Gamble Participants (时空博弈人数走势)
                  </span>
                  <span className="text-[7.5px] font-mono text-indigo-400">
                    Spectrum View
                  </span>
                </div>
                
                <div className="h-20 w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={activeEventHistoricalOdds} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorParticipants" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" hide />
                      <YAxis tick={{ fill: '#475569', fontSize: 7, fontFamily: 'monospace' }} width={25} />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-slate-950 border border-slate-800 p-2 rounded shadow-xl font-mono text-[8.5px] text-slate-300 space-y-0.5">
                                <p className="text-white font-bold">{data.date}</p>
                                <p className="text-indigo-400 font-extrabold flex items-center gap-1">
                                  <Users className="h-2 w-2" />
                                  Traders: {data.participants.toLocaleString()} Accounts
                                </p>
                                <p className="text-cyan-400 font-semibold">📈 YES Odds: {data.probability}%</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="participants" 
                        stroke="#6366f1" 
                        fillOpacity={1} 
                        fill="url(#colorParticipants)" 
                        strokeWidth={1}
                        name="Active Participants"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 24-Hour Hour-by-Hour Sparkline block */}
              <div className="bg-indigo-950/10 p-2.5 rounded-xl border border-indigo-900/20 space-y-2">
                <div className="flex items-center justify-between border-b border-indigo-900/30 pb-1">
                  <span className="text-[8px] text-indigo-300 uppercase font-black tracking-wider flex items-center gap-1">
                    <History className="h-2.5 w-2.5 text-indigo-400" />
                    Last 24h Participation Sparkline (24小时每小时对赌人数)
                  </span>
                  <span className="text-[7.5px] text-slate-500 font-mono">
                    24h Live Spark
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-7">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={get24hParticipationForEvent(activeEvent)} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                        <defs>
                          <linearGradient id="colorTraders24h" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#818cf8" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <Tooltip
                          allowEscapeViewBox={{ x: true, y: true }}
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-slate-950 border border-slate-900 p-2 rounded shadow-xl font-mono text-[8.5px] text-slate-300 space-y-0.5">
                                  <p className="text-white font-bold border-b border-slate-800 pb-0.5 mb-1">{data.date}</p>
                                  <p className="text-indigo-400 font-extrabold flex items-center justify-between gap-3">
                                    <span>Traders/h:</span>
                                    <span>{data.count.toLocaleString()} Accounts</span>
                                  </p>
                                  <p className="text-cyan-400 font-semibold flex items-center justify-between gap-3">
                                    <span>YES Price:</span>
                                    <span>{data.probability}% ({data.probability}¢)</span>
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="count" 
                          stroke="#818cf8" 
                          fill="url(#colorTraders24h)" 
                          strokeWidth={1} 
                          dot={false}
                          isAnimationActive={false}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-right shrink-0 border-l border-slate-900 pl-3">
                    <span className="text-[7px] text-slate-500 block uppercase font-mono leading-none">Hourly Avg</span>
                    <span className="text-[10px] font-black text-indigo-300 font-mono mt-0.5 block">
                      {Math.round(activeEvent.tradersCount / 24)} / hr
                    </span>
                  </div>
                </div>
              </div>

              {/* Live Growth Spike Analytics */}
              {(() => {
                const activeSpike = computeEventGrowthSpike(activeEvent, growthThresholdPercent);
                return (
                  <div className={`p-3 rounded-xl border ${
                    activeSpike.isTriggered 
                      ? "bg-emerald-950/15 border-emerald-500/30 shadow-md shadow-emerald-950/10" 
                      : "bg-slate-900/60 border-slate-900"
                  } space-y-2`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-[8px] font-black uppercase tracking-wider flex items-center gap-1 ${
                        activeSpike.isTriggered ? "text-emerald-400" : "text-slate-500"
                      }`}>
                        <Activity className={`h-2.5 w-2.5 ${activeSpike.isTriggered ? "text-emerald-400 animate-pulse" : "text-slate-500"}`} />
                        Live Growth Spike Analytics
                      </span>
                      
                      {activeSpike.isTriggered ? (
                        <span className="text-[7px] font-black font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-900/30 animate-pulse">
                          🐳 DETECTED SPIKE
                        </span>
                      ) : (
                        <span className="text-[7px] font-bold font-mono text-slate-500">
                          Consolidated Growth
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-[9px] font-mono leading-relaxed">
                      <div className="bg-slate-950/60 p-1.5 rounded border border-slate-900/80">
                        <span className="text-[7px] text-slate-500 uppercase block">Max Surge (24h)</span>
                        <span className={`text-[10.5px] font-black ${
                          activeSpike.isTriggered ? "text-emerald-400" : "text-slate-350"
                        }`}>
                          +{activeSpike.maxPercentSurge}%
                        </span>
                      </div>
                      
                      <div className="bg-slate-950/60 p-1.5 rounded border border-slate-900/80">
                        <span className="text-[7px] text-slate-500 uppercase block">Spike Peak Hour</span>
                        <span className="text-[9.5px] font-bold text-slate-300 block truncate" title={`${activeSpike.peakHourStr}`}>
                          {activeSpike.peakHourStr}
                        </span>
                      </div>
                    </div>

                    {activeSpike.isTriggered && (
                      <p className="text-[8.5px] text-emerald-300 leading-normal font-sans bg-emerald-950/10 p-1.5 rounded border border-emerald-900/20 flex gap-1.5 items-start">
                        <Zap className="h-3 w-3 text-emerald-400 shrink-0 mt-0.5" />
                        <span>
                          Detected <strong>+{activeSpike.maxAbsSurge}</strong> new accounts entering within a single hour frame. Signifies severe liquidity impact or high whale participant activity on {activeEvent.id}.
                        </span>
                      </p>
                    )}
                  </div>
                );
              })()}
              
              {/* Dynamic Market Resolution Score & Sentiment Index */}
              <div className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-900 space-y-2">
                <div className="flex justify-between items-center text-[8.5px]">
                  <span className="text-slate-450 font-bold header">对冲套利概率差值:</span>
                  <span className="text-rose-400 font-bold font-mono">
                    {Math.abs(activeEvent.yesProbability - 50) > 25 ? "⚠️ 胜率偏移过大 (低风险套利)" : "均衡博弈区间 (高变数)"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[8px] text-slate-500">
                  <span>注: 当胜率过度偏离(如&gt;80%或&lt;20%)，流动性池赔率将不规则倾斜，形成二级对冲套利空子。</span>
                </div>
              </div>
            </div>

            {/* ⚡ VOLATILITY FORECAST GAUGE */}
            <div className="border-t border-slate-900/60 pt-4 space-y-3">
              <span className="text-[8px] text-cyan-400 uppercase font-bold block tracking-wider">⚡ Volatility Forecast Gauge (赔率波动率预测)</span>
              
              <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-900 flex items-center justify-between gap-4">
                
                {/* SVG Gauge Section */}
                <div className="flex flex-col items-center justify-center shrink-0 w-[110px]">
                  <div className="relative w-[110px] h-[55px] flex items-center justify-center overflow-hidden">
                    {/* Semicircular gauge background */}
                    <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 100 50">
                      {/* Grey path */}
                      <path 
                        d="M 10 50 A 40 40 0 0 1 90 50" 
                        fill="none" 
                        stroke="#1e293b" 
                        strokeWidth="8" 
                        strokeLinecap="round"
                      />
                      {/* Gradient path based on volatility */}
                      <path 
                        d="M 10 50 A 40 40 0 0 1 90 50" 
                        fill="none" 
                        stroke="url(#gaugeGradient)" 
                        strokeWidth="8" 
                        strokeLinecap="round"
                        strokeDasharray={125}
                        strokeDashoffset={125 - (Math.min(volatilityMetrics.stdDev, 15) / 15) * 125}
                      />
                      {/* Definitions for Gradients */}
                      <defs>
                        <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="60%" stopColor="#f59e0b" />
                          <stop offset="100%" stopColor="#f43f5e" />
                        </linearGradient>
                      </defs>
                      {/* Needle */}
                      {(() => {
                        const maxVal = 15;
                        const ratio = Math.min(volatilityMetrics.stdDev, maxVal) / maxVal; // 0 to 1
                        const angleDeg = 180 + (ratio * 180); // 180 is left, 360/0 is right
                        const angleRad = (angleDeg * Math.PI) / 180;
                        const needleLength = 32;
                        const xOffset = Math.cos(angleRad) * needleLength;
                        const yOffset = Math.sin(angleRad) * needleLength;
                        return (
                          <>
                            <line 
                              x1="50" 
                              y1="50" 
                              x2={50 + xOffset} 
                              y2={50 + yOffset} 
                              stroke="#f1f5f9" 
                              strokeWidth="2.5" 
                              strokeLinecap="round" 
                            />
                            <circle cx="50" cy="50" r="4.5" fill="#f1f5f9" />
                            <circle cx="50" cy="50" r="2.5" fill="#0f172a" />
                          </>
                        );
                      })()}
                    </svg>
                  </div>
                  <div className="text-[7.5px] text-slate-500 font-mono flex justify-between w-full px-1 mt-1">
                    <span>STABLE (0%)</span>
                    <span>HIGH (15%)</span>
                  </div>
                </div>

                {/* Metrics Breakdown */}
                <div className="flex-1 space-y-1 font-mono">
                  <div className="text-[7.5px] text-slate-500 uppercase">Volatility Dev (方差偏差)</div>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-sm font-black tracking-tight ${
                      volatilityMetrics.warningLevel === "HIGH" ? "text-rose-500 animate-pulse text-base" :
                      volatilityMetrics.warningLevel === "MEDIUM" ? "text-amber-500 font-extrabold" :
                      "text-emerald-400"
                    }`}>
                      {volatilityMetrics.stdDev}%
                    </span>
                    <span className="text-[7.5px] text-slate-500">σ-Odds</span>
                  </div>
                  
                  <div className="flex flex-col gap-0.5 text-[8px] border-t border-slate-950 pt-1 mt-1">
                    <div className="flex justify-between text-slate-400">
                      <span>Mean / 均值:</span>
                      <span className="text-slate-300 font-bold">{volatilityMetrics.mean}¢</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Range / 溢出:</span>
                      <span className="text-slate-300">{volatilityMetrics.minOdds}%-{volatilityMetrics.maxOdds}%</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* WARNING BOX FOR RAPID ODDS SHIFTS */}
              <div className={`p-2.5 rounded-xl border transition-all ${
                volatilityMetrics.warning 
                  ? "bg-rose-950/20 border-rose-500/30 text-rose-350 animate-pulse" 
                  : "bg-slate-900/10 border-slate-900 text-slate-450"
              }`}>
                <div className="flex items-start gap-2">
                  <div className={`p-1 rounded shrink-0 ${
                    volatilityMetrics.warning ? "bg-rose-950 text-rose-455" : "bg-slate-950 text-slate-605"
                  }`}>
                    {volatilityMetrics.warning ? (
                      <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
                    ) : (
                      <CircleAlert className="h-3.5 w-3.5 text-slate-500" />
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <div className={`text-[8px] font-mono font-bold uppercase tracking-wider ${
                      volatilityMetrics.warning ? "text-rose-400" : "text-slate-400"
                    }`}>
                      {volatilityMetrics.warning 
                        ? "⚠️ SHIFT ALERT / 赔率异动警告" 
                        : "Odds Fluctuation Index / 赔率发现指数"
                      }
                    </div>
                    <p className="text-[8.5px] leading-snug text-slate-400 font-sans">
                      {volatilityMetrics.warning 
                        ? `该协议最新预测赔率于短期内发生了剧烈波动（单日最大变调达 ${volatilityMetrics.maxSingleDayShift}%），代表有强力链上大户消息差突发，或高度相关的 DeFi 升级处于落地博弈。` 
                        : `该合约最新赔率波动率处于健康区间（单日最大波幅在 ${volatilityMetrics.maxSingleDayShift}% ¢以内），无爆发性多签或巨鲸操盘迹象，博弈状态有机稳定。`
                      }
                    </p>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* INTERACTIVE BETTING SLIP SIMULATOR */}
          <div id="polymarket-prediction-slip" className="bg-slate-950 p-5 rounded-2xl border border-slate-900 space-y-4">
            
            <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
              <Calculator className="h-4.5 w-4.5 text-cyan-400" />
              <div>
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Real-time Prediction Trade Slip (交易滑点模拟演算器)
                </h3>
                <span className="text-[8px] text-slate-500 uppercase block">Calculate simulated payouts based on live crowdsourced odds</span>
              </div>
            </div>

            {activeEvent.status === "Resolved" ? (
              <div className="bg-purple-950/20 border border-purple-900/40 p-4 rounded-xl text-center space-y-3 font-mono">
                <Check className="h-7 w-7 text-purple-400 mx-auto bg-purple-950 p-1.5 rounded-full border border-purple-800/60" />
                <div>
                  <span className="block text-[10px] font-black text-purple-400 uppercase tracking-widest leading-none mb-1">
                    Settled Prediction Contract (标的已结算)
                  </span>
                  <span className="text-[7.5px] text-slate-550 block">SIMULATION ENVIRONMENT LOG CLOSED</span>
                </div>
                
                <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-900 text-left text-[9px] leading-relaxed space-y-2 text-slate-400">
                  <div className="flex justify-between items-center border-b border-slate-850 pb-1.5 text-slate-500">
                    <span>Resolution Date (结算日期):</span>
                    <span className="text-slate-300 font-bold">{activeEvent.endDate}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-850 pb-1.5">
                    <span>Ultimate Market Verdict (终审结算结果):</span>
                    <span className={`px-2 py-0.5 rounded font-black text-[10px] ${
                      activeEvent.resolvedOutcome === "YES" 
                        ? "bg-cyan-950/80 text-cyan-400 border border-cyan-900/40" 
                        : "bg-rose-950/80 text-rose-400 border border-rose-900/40"
                    }`}>
                      {activeEvent.resolvedOutcome}
                    </span>
                  </div>
                  <p className="font-sans text-[8.5px] leading-normal text-slate-400">
                    {activeEvent.descriptionZh}
                  </p>
                </div>
                <div className="text-[8.5px] text-slate-500 font-sans">
                  Further prediction positions can not be acquired for resolved contracts. Please choose an active contract to play.
                </div>
              </div>
            ) : (
              <form onSubmit={handleBuySharesSimulation} className="space-y-4">
                
                {/* YES vs NO Selector */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setBetSide("YES")}
                    className={`py-2 px-3 rounded-xl border text-xs font-mono font-bold transition-all uppercase cursor-pointer text-center ${
                      betSide === "YES"
                        ? "bg-cyan-500/10 border-cyan-500/50 text-cyan-400 shadow-lg shadow-cyan-950/20"
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
                        ? "bg-rose-500/10 border-rose-500/50 text-rose-400 shadow-lg shadow-rose-950/20"
                        : "bg-slate-900 border-slate-900 text-slate-500 hover:text-slate-350"
                    }`}
                  >
                    Buy NO ({100 - activeEvent.yesProbability}¢)
                  </button>
                </div>

                {/* Amount input */}
                <div className="space-y-1.5 font-mono">
                  <div className="flex justify-between text-[8px] text-slate-500 font-bold uppercase">
                    <span>Investment Size (投入结算本金):</span>
                    <span>Free play quota: $100,000 USD</span>
                  </div>
                  <div className="flex items-center bg-slate-900 border border-slate-900 rounded-lg p-2.5">
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
                    <span className="text-slate-400 text-[9px] font-bold">USD</span>
                  </div>
                </div>

                {/* Immediate Mathematics Panel */}
                {parseFloat(betAmountText) > 0 && (
                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-900 text-[10px] space-y-1.5 font-mono">
                    <div className="flex justify-between items-center text-slate-500">
                      <span>Average price per share (每份单价):</span>
                      <span>${(betSide === "YES" ? activeEvent.yesProbability / 100 : (100 - activeEvent.yesProbability) / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Estimated purchased shares (预核发份额):</span>
                      <span className="text-white font-bold">
                        {Math.round((parseFloat(betAmountText) || 0) / ((betSide === "YES" ? activeEvent.yesProbability : (100 - activeEvent.yesProbability)) / 100)).toLocaleString()} Shares
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-slate-450 border-t border-slate-905 pt-2">
                      <span>Potential resolution payout (全对估结金):</span>
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
                  className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-mono text-xs font-bold uppercase rounded-lg shadow-xl shadow-cyan-950/20 active:scale-[0.98] transition-all cursor-pointer"
                >
                  Execute Mock Share Acquisition (虚拟下注买入)
                </button>
              </form>
            )}

            {/* Simulated execution callback notifications */}
            {betFeedbackMsg.status !== "idle" && (
              <div className={`p-3 rounded-lg border text-[10.5px] font-sans leading-relaxed flex items-start gap-1.5 ${
                betFeedbackMsg.status === "success"
                  ? "bg-emerald-950/30 border-emerald-900/50 text-emerald-300"
                  : "bg-rose-950/30 border-rose-900/50 text-rose-305"
              }`}>
                <Info className="h-4 w-4 shrink-0 mt-0.5 text-cyan-400" />
                <p>{betFeedbackMsg.text}</p>
              </div>
            )}
          </div>

          {/* 🎯 USER'S SIMULATED ACTIVE PORTFOLIO TRACKER (我的个人模拟仓位 - 必要观察变量四) */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-900 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4.5 w-4.5 text-cyan-400" />
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  My Active Session Holdings (我的模拟预测持仓)
                </h3>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  title="Export Simulated Holdings Portfolio (导出模拟持仓对账单)"
                  onClick={exportSimulatedHoldingsData}
                  disabled={userPortfolioEvaluations.evaluated.length === 0}
                  className={`p-1 flex items-center gap-1 border rounded transition-all cursor-pointer ${
                    userPortfolioEvaluations.evaluated.length > 0 
                      ? "text-slate-400 hover:text-emerald-400 border-slate-800 hover:border-emerald-950/20" 
                      : "text-slate-700 border-transparent cursor-not-allowed"
                  }`}
                >
                  <Download className="h-3 w-3" />
                  <span className="text-[7.5px] font-mono font-bold">CSV</span>
                </button>
                <span className="text-[8.5px] font-mono text-emerald-400 bg-emerald-950/40 px-1 py-0.5 rounded border border-emerald-900">
                  P/L Connected
                </span>
              </div>
            </div>

            <p className="text-[10px] text-slate-550 leading-relaxed font-sans">
              您的持仓浮动盈亏（P/L）将随着上方系统对赌盘口赔率波动的每一次漂移，实现<strong>实时资产核算</strong>。
            </p>

            {userPortfolioEvaluations.evaluated.length === 0 ? (
              <p className="text-slate-600 text-[10px] font-mono italic text-center py-4">无活跃预测持仓，请先在滑点演算器进行模拟下注。</p>
            ) : (
              <div className="space-y-3">
                
                {/* Positions list */}
                <div className="space-y-2 max-h-[180px] overflow-y-auto no-scrollbar">
                  {userPortfolioEvaluations.evaluated.map((pos) => {
                    const isProfit = pos.profitLoss >= 0;
                    return (
                      <div key={pos.id} className="bg-slate-900/40 border border-slate-900 p-2.5 rounded-lg font-mono text-[9.5px]">
                        <div className="flex justify-between items-start gap-1">
                          <span className="text-slate-205 font-bold truncate max-w-[170px]" title={pos.question}>{pos.question}</span>
                          <span className={`px-1.5 py-0.5 text-[8px] font-black rounded ${pos.side === "YES" ? "bg-cyan-500/10 text-cyan-400" : "bg-rose-500/10 text-rose-400"}`}>
                            {pos.side}
                          </span>
                        </div>

                        <div className="flex justify-between mt-2 text-[8.5px] text-slate-500">
                          <span>Holding: {pos.shares.toLocaleString()} shares</span>
                          <span>Cost: ${pos.totalCost.toFixed(0)}</span>
                        </div>

                        <div className="flex justify-between mt-1 items-center pt-1 border-t border-slate-950/40">
                          <span className="text-[8.5px] text-slate-500">Current Price: {pos.currentProbability}¢ (Avg entry: {pos.entryProbability}¢)</span>
                          <span className={`font-mono font-black ${isProfit ? "text-emerald-400" : "text-rose-455"}`}>
                            {isProfit ? "+" : ""}${pos.profitLoss.toFixed(2)} ({isProfit ? "+" : ""}{pos.profitLossPercent.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Aggregate Wealth Summary */}
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg flex items-center justify-between text-[11px] font-mono">
                  <div>
                    <span className="text-[8px] text-slate-505 block uppercase">Aggregate value of contract ledger</span>
                    <span className="text-slate-200 font-bold">Total Assets: ${userPortfolioEvaluations.currentAssetValue.toLocaleString(undefined, { maximumFractionDigits: 1 })} USD</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] text-slate-505 block uppercase">Session P/L</span>
                    <span className={`font-black ${userPortfolioEvaluations.aggregateProfitLoss >= 0 ? "text-emerald-450" : "text-rose-455"}`}>
                      {userPortfolioEvaluations.aggregateProfitLoss >= 0 ? "+" : ""}${userPortfolioEvaluations.aggregateProfitLoss.toLocaleString(undefined, { maximumFractionDigits: 1 })} ({userPortfolioEvaluations.roi.toFixed(1)}%)
                    </span>
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* DYNAMIC WHALE LOGS */}
          <div id="polymarket-whale-ledger" className="bg-slate-950 p-5 rounded-2xl border border-slate-900 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <div className="flex items-center gap-2">
                <History className="h-4.5 w-4.5 text-cyan-400" />
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Live Action Prediction Feed (大户重仓下注流水)
                </h3>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  title="Export Live Whale bets feed (导出大户下注流水明细)"
                  onClick={exportLiveBetsData}
                  className="p-1 text-slate-400 hover:text-cyan-400 border border-slate-800 hover:border-cyan-900/50 hover:bg-cyan-950/20 rounded cursor-pointer transition-all flex items-center gap-1"
                >
                  <Download className="h-3 w-3" />
                  <span className="text-[7.5px] font-mono font-bold">CSV</span>
                </button>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
              </div>
            </div>

            <p className="text-[10px] text-slate-500 font-sans leading-snug">
              监控 Polygon 智能合约上被标记为 DeFi Whale / 流动性大户的大额持平对冲流水（金额大于 $5,000 USD）：
            </p>

            <div className="space-y-2 max-h-[220px] overflow-y-auto no-scrollbar">
              {liveBets.map((bet) => {
                const isUserType = bet.whaleLabel.includes("YOU");
                return (
                  <div 
                    key={bet.id} 
                    className={`p-2.5 rounded-lg border text-[10px] font-mono transition-all duration-300 relative ${
                      isUserType
                        ? "bg-cyan-950/20 border-cyan-800/40 shadow-inner"
                        : "bg-slate-900/40 border-slate-900 hover:bg-slate-900/60"
                    }`}
                  >
                    <div className="flex justify-between items-center text-[9px]">
                      <span className="text-slate-300 font-bold block truncate max-w-[130px] uppercase">
                        {bet.whaleLabel}
                      </span>
                      <span className="text-slate-500 text-[8px]">{bet.time}</span>
                    </div>

                    <p className="text-slate-450 mt-1 line-clamp-1 italic text-[9.5px]" title={bet.eventQuestion}>
                      "{bet.eventQuestion}"
                    </p>

                    <div className="flex items-center justify-between mt-2 border-t border-slate-900/40 pt-1.5 text-[9px]">
                      <span className="text-slate-500">
                         Bought (买向): <span className={`font-black font-mono px-1 py-0.2 rounded ${
                          bet.prediction === "YES" ? "text-cyan-400 bg-cyan-950/40" : "text-rose-400 bg-rose-955/40"
                        }`}>
                          {bet.prediction}
                        </span>
                      </span>
                      <span className="text-white font-bold">
                        Cost (本金): ${bet.totalCostUsd.toLocaleString()} USD
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* 🔔 FLOATING REAL-TIME TOAST NOTIFICATION CONTAINER (Extreme Particle Influx Alerts) */}
      <div id="polymarket-spike-toasts" className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
              onClick={() => {
                if (toast.eventId) {
                  setSelectedEventId(toast.eventId);
                  const element = document.getElementById("polymarket-prediction-slip");
                  if (element) {
                    element.scrollIntoView({ behavior: "smooth", block: "center" });
                  }
                }
              }}
              className="pointer-events-auto bg-slate-950/95 border border-emerald-500/30 shadow-2xl shadow-emerald-950/40 p-4 rounded-xl flex items-start gap-3 backdrop-blur-md cursor-pointer hover:border-emerald-500/60 transition-all group relative overflow-hidden"
            >
              {/* Subtle green ambient lighting in the card corner */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl pointer-events-none"></div>
              
              <div className="p-2 bg-emerald-950/60 rounded-lg border border-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform shrink-0">
                <Zap className="h-4 w-4 fill-emerald-400/10 text-emerald-400 animate-pulse" />
              </div>
              
              <div className="flex-1 min-w-0 pr-4 space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[7.5px] font-black tracking-widest font-mono text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/20 uppercase">
                    SPIKE ALERT
                  </span>
                  <span className="text-[7.5px] text-slate-500 font-mono">
                    {toast.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
                <h4 className="text-[10px] font-bold font-mono text-slate-200 mt-0.5 uppercase tracking-tight">
                  {toast.title}
                </h4>
                <p className="text-[9px] text-slate-400 leading-normal font-sans">
                  {toast.message}
                </p>
                <span className="text-[7.5px] font-mono text-emerald-400 font-black flex items-center gap-1 group-hover:translate-x-1 transition-transform mt-1">
                  Click to view details / 详情查看 <ArrowRight className="h-2 w-2" />
                </span>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation(); // prevent selecting the event
                  removeToast(toast.id);
                }}
                className="absolute top-3 right-3 text-slate-505 hover:text-slate-300 p-0.5 hover:bg-slate-900 rounded-full transition-colors cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
};
