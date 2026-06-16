import React, { useState, useMemo, useEffect, useRef } from "react";
import { 
  Twitter, 
  Users, 
  TrendingUp, 
  Sparkles, 
  Flame, 
  MessageSquare, 
  Send, 
  RefreshCw, 
  Heart, 
  Share2, 
  UserPlus, 
  Search, 
  Cpu, 
  Globe, 
  Database,
  ArrowRight,
  TrendingDown,
  Info,
  DollarSign,
  Briefcase,
  Layers,
  Zap,
  CheckCircle,
  Clock,
  Shield,
  Activity
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, AreaChart, Area } from "recharts";

// --- Types & Interfaces ---
interface MuskTweet {
  id: string;
  time: string;
  text: string;
  textZh: string;
  likes: number;
  retweets: number;
  replies: number;
  marketImpact: "Extreme Bullish" | "Bullish" | "Neutral" | "Highly Volatile";
  targetAsset: "DOGE" | "MASK" | "TESLA" | "ALEX" | "Grok" | "All" | "SPACEX";
  probabilityShift: number; // e.g. +12% shift
  comments: { user: string; handle: string; text: string; time: string; verified: boolean }[];
}

interface OrbitPerson {
  id: string;
  name: string;
  nameZh: string;
  handle: string;
  avatar: string;
  avatarColor: string;
  role: string;
  relationType: "Co-collaborator" | "D.O.G.E Partner" | "Technical Crossover" | "Media Orbit" | "Technical Critic";
  stance: string;
  mutualSynergy: number; // Out of 100
  latestQuote: string;
  latestQuoteZh: string;
}

interface MuskTopic {
  id: string;
  name: string;
  symbol?: string;
  hypeScore: number; // 0 to 100
  marketCap: string;
  dailyVolume: string;
  statusText: string;
  statusTextZh: string;
  description: string;
  descriptionZh: string;
  chartData: { h: string; mentions: number; volume: number }[];
  associatedTraders: number;
}

export const MaskMuskHub: React.FC<{
  globalStartDate: string;
  globalEndDate: string;
}> = ({ globalStartDate, globalEndDate }) => {
  
  // --- State Variables ---
  const [selectedTopicId, setSelectedTopicId] = useState<string>("doge-topic");
  const [selectedOrbitPersonId, setSelectedOrbitPersonId] = useState<string>("trump");
  const [tweetInput, setTweetInput] = useState<string>("");
  const [grokLoading, setGrokLoading] = useState<boolean>(false);
  const [grokResponse, setGrokResponse] = useState<string | null>(null);
  
  // High-vibe simulated prices that shift directly based on Musk's dynamic tweets
  const [muskTickerPrices, setMuskTickerPrices] = useState({
    DOGE: 0.4285,
    DOGEChange: 6.82,
    MASK: 4.882,
    MASKChange: 14.25,
    TESLA: 268.45,
    TESLAChange: -1.15,
    GROK: 0.0815,
    GROKChange: 8.94,
    SPACEX: 325.80,
    SPACEXChange: 18.42
  });

  // SpaceX live updating chart data simulating real-time high-velocity Nasdaq/CEX index feeds since listing
  const [spacexLiveChartData, setSpacexLiveChartData] = useState<{ time: string; price: number; volume: number }[]>(() => {
    const data = [];
    let price = 308.20;
    const now = new Date();
    for (let i = 24; i >= 1; i--) {
      const t = new Date(now.getTime() - i * 60000);
      price = price + (Math.random() - 0.46) * 2.4; // slightly bullish walk
      data.push({
        time: t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        price: Number(price.toFixed(2)),
        volume: Math.round(15000 + Math.random() * 28000)
      });
    }
    return data;
  });

  const [spacexActiveTab, setSpacexActiveTab] = useState<"chart" | "advantage" | "starlink" | "ipo">("chart");
  const [spacexLaunchSimState, setSpacexLaunchSimState] = useState<"idle" | "launching" | "maxq" | "booster_catch" | "success" | "anomaly">("idle");
  const [spacexLiveTerminalsCount, setSpacexLiveTerminalsCount] = useState<number>(15482910); // starting terminals

  // Keep track of total simulations run block
  const [totalSimulatedTweetsCount, setTotalSimulatedTweetsCount] = useState<number>(0);

  // --- 𝕏 Algorithm & Ad Metric Sandbox States ---
  const [xAlgBlueBadgeBoost, setXAlgBlueBadgeBoost] = useState<number>(3.0); // 1.0 to 10.0
  const [xAlgOutboundLinkPenalty, setXAlgOutboundLinkPenalty] = useState<boolean>(true); // true = penalty active (0.15x)
  const [xAlgMediaAttachmentBoost, setXAlgMediaAttachmentBoost] = useState<number>(2.2); // 1.0 to 5.0
  const [xAlgMuskCirclePriorityBoost, setXAlgMuskCirclePriorityBoost] = useState<boolean>(true); // true = 25x boost on Musk-related keywords
  const [xAlgEngagementBoost, setXAlgEngagementBoost] = useState<number>(1.8); // 1.0 to 4.0
  const [xAlgMockContentCategory, setXAlgMockContentCategory] = useState<"politics" | "academic" | "crypto" | "lifestyle" | "journalism">("crypto");
  const [xAdSelectedYear, setXAdSelectedYear] = useState<"2022" | "2023" | "2024" | "2025" | "2026">("2026");
  const [xAlgCustomPostText, setXAlgCustomPostText] = useState<string>("SpaceX Starship successfully landed in Mechazilla! Dogecoin payment node goes live on Starlink terminals. Hyper-abundance approaches.");

  // --- 𝕏 Reverse-Engineered Algorithm & ad calculation useMemos ---
  const calculatedAlgVelocity = useMemo(() => {
    let base = 100;
    
    // Add blue badge boost
    base = base * xAlgBlueBadgeBoost;
    
    // Outbound link penalty
    if (xAlgOutboundLinkPenalty) {
      base = base * 0.15;
    }
    
    // Media attachments
    base = base * xAlgMediaAttachmentBoost;
    
    // Musk / Elon Inner Circle boost
    if (xAlgMuskCirclePriorityBoost) {
      const lower = xAlgCustomPostText.toLowerCase();
      if (
        lower.includes("musk") || 
        lower.includes("elon") || 
        lower.includes("starship") || 
        lower.includes("doge") || 
        lower.includes("spacex") || 
        lower.includes("starlink") || 
        lower.includes("mask") || 
        lower.includes("grok") ||
        lower.includes("government efficiency")
      ) {
        base = base * 15.0; // massive 15x real-world boost!
      } else {
        base = base * 1.5; 
      }
    }
    
    // Engagement / Reply acceleration
    base = base * xAlgEngagementBoost;
    
    // Category booster
    let categoryMultiplier = 1.0;
    if (xAlgMockContentCategory === "politics") categoryMultiplier = 2.4;
    else if (xAlgMockContentCategory === "crypto") categoryMultiplier = 1.9;
    else if (xAlgMockContentCategory === "lifestyle") categoryMultiplier = 0.55;
    else if (xAlgMockContentCategory === "journalism") categoryMultiplier = 1.6;
    else if (xAlgMockContentCategory === "academic") categoryMultiplier = 0.85;
    
    base = base * categoryMultiplier;
    
    return Math.round(base);
  }, [
    xAlgBlueBadgeBoost,
    xAlgOutboundLinkPenalty,
    xAlgMediaAttachmentBoost,
    xAlgMuskCirclePriorityBoost,
    xAlgEngagementBoost,
    xAlgMockContentCategory,
    xAlgCustomPostText
  ]);

  const adRevenueReport = useMemo(() => {
    const yearReports = {
      "2022": {
        title: "2022: Pre-Acquisition Balance / 传统品牌至上时代",
        desc: "Initially, Twitter relied on massive Fortune 500 brand sponsors representing 90% of revenue. Standard programmatic performance ads were secondary, and subscriptions was virtually zero. Low volatility, high reliance on corporate consensus.",
        descZh: "收购前的 Twitter 极度依赖传统财富 500 强品牌广告（占比达 90%）。程序化买量与订阅收入微乎其微。内容审核极为严苛，商业体系偏保守稳健，但抗风险能力较低。",
        brandPercent: 90,
        unsolicitedPercent: 8,
        subscriptionPercent: 2,
        dataCapPercent: 0,
        totalEstAdRev: "$4.73B",
        monetizationTone: "Enterprise Brand Driven",
        statusBadge: "Corporate Hegemony"
      },
      "2023": {
        title: "2023: The Great Advertiser Exodus / 广告主集体撤退与秩序重组",
        desc: "Musk completed the $44B acquisition. Traditional tier-1 advertisers staged boycotts over safety concerns. Prompting Musk to tell boycotting brands to 'Go F***' themselves. Performance small business (SMB) ads, early crypto affiliates, and Premium subscription tiers are launched as countermeasures.",
        descZh: "完成 440 亿美元私有化收购。由于对言论尺度放宽的担忧，传统品牌广告主爆发大规模撤单。马斯克在公开采访中强硬回击。平台被迫紧急推出 SMB 直接响应广告、加密货币推广联盟以及早期的 Premium 蓝标订阅付费体系作为对冲。",
        brandPercent: 35,
        unsolicitedPercent: 42,
        subscriptionPercent: 15,
        dataCapPercent: 8,
        totalEstAdRev: "$2.45B",
        monetizationTone: "Sovereign Resistance",
        statusBadge: "Rebellion Influx"
      },
      "2024": {
        title: "2024: Direct Response & Web3 Primacy / 直接响应与 Web3 爆发期",
        desc: "Sovereign direct-response campaigns, affiliate networks, casinos, DeFi protocols, and Web3 social plugins (including Mask Network verified accounts) take center stage. Programmatic ads became the primary yield driver, bypassing traditional agencies.",
        descZh: "品牌广告结构彻底瓦解，直接响应广告（买量广告、海外跨境电商、DeFi 协议、加密代币博弈推广）和自媒体推广占据绝对主导。在 Mask Network 等 Web3 生态融合下，NFT 卡牌及链上凭证投放高频爆发，程序化智能竞价成为盈利中枢。",
        brandPercent: 20,
        unsolicitedPercent: 55,
        subscriptionPercent: 17,
        dataCapPercent: 8,
        totalEstAdRev: "$3.12B",
        monetizationTone: "Web3 Performance Surge",
        statusBadge: "Algorithmic Programmatic"
      },
      "2025": {
        title: "2025: Government Efficiency (D.O.G.E) Intersect / 机构能效红利与主权流量",
        desc: "As government streamlining (D.O.G.E) begins, politico-economic policy announcements migrate natively to 𝕏. Advertising shifts fundamentally towards sovereign political campaigns, defense contractors, crypto investment vehicles, and AI hardware brokers.",
        descZh: "随着美国政府效率部（D.O.G.E）发力，政务改革、效率主案等主权信息天然向 𝕏 倾斜。广告投放转向主权政治宣传、特区军工链条、数字金融 ETF 资产，以及 AI 算力中介。多头流量开始回吐惊人商业现金流。",
        brandPercent: 18,
        unsolicitedPercent: 57,
        subscriptionPercent: 16,
        dataCapPercent: 9,
        totalEstAdRev: "$3.95B",
        monetizationTone: "Sovereign & Policy Driven",
        statusBadge: "D.O.G.E Synergistic"
      },
      "2026": {
        title: "2026: Sovereign Integrated Data Matrix / 现世主权算力与全要素互联",
        desc: "The current state: 𝕏 advertising operates on highly optimized automated AI models. Revenue is supported by xAI (Grok API subscription linkages), space-industrial logistics, and direct consumer telemetry of Starlink. Safe, alternative, zero-leaks corporate ecosystem.",
        descZh: "现今状态：广告业务全面接入 AI 极速智能投喂，其背后由 xAI（Grok 神经网络）、SpaceX 星链硬联通和特斯拉车载系统底层直达。极客品牌、跨境主权直接响应广告占比攀升，彻底摆脱传统欧美公关媒体控制。",
        brandPercent: 15,
        unsolicitedPercent: 58,
        subscriptionPercent: 18,
        dataCapPercent: 9,
        totalEstAdRev: "$4.15B",
        monetizationTone: "AI & Sovereign Multi-Hub",
        statusBadge: "Hyper-growth Steady"
      }
    };
    return yearReports[xAdSelectedYear];
  }, [xAdSelectedYear]);

  // Dynamic user replies input on Musk's tweets
  const [userCommentText, setUserCommentText] = useState<Record<string, string>>({});

  // Core Twitter / X Ingestion feed mock list
  const [tweets, setTweets] = useState<MuskTweet[]>([
    {
      id: "tweet-01",
      time: "24m ago",
      text: "Government spending cuts are essential. D.O.G.E is going to unleash maximum technical efficiency and clear out the regulatory bureaucracy. Efficiency is the key to interplanetary civilization.",
      textZh: "减少政府支出至关重要。D.O.G.E (政府效率部) 将释放最大的技术效率，并清除监管官僚主义。效率是走向星际文明的关键。",
      likes: 142000,
      retweets: 28400,
      replies: 12500,
      marketImpact: "Extreme Bullish",
      targetAsset: "DOGE",
      probabilityShift: 18.5,
      comments: [
        { user: "Vivek Ramaswamy", handle: "@VivekGRamaswamy", text: "100% agreed. It's time to take a chainsaw to the administrative state. Simple rules, lean departments.", time: "20m ago", verified: true },
        { user: "Shibetoshi Nakamoto", handle: "@BillyM2k", text: "efficiency makes the universe more fun! less friction", time: "18m ago", verified: true },
        { user: "DOGE Bull 420", handle: "@DogecoinMaximist", text: "D.O.G.E to $1 is inevitable! 🐕🚀", time: "15m ago", verified: false }
      ]
    },
    {
      id: "tweet-02",
      time: "2h ago",
      text: "The web social matrix must protect user identity but keep interactions open and serverless. Decentralized masks are interesting shields for human digital dignity.",
      textZh: "Web社交矩阵必须保护用户的身份隐私，同时保持交互开放和无服务器化。去中心化的遮罩/面具 (Mask) 是人类数字尊严的有趣盾牌。",
      likes: 85200,
      retweets: 14500,
      replies: 6200,
      marketImpact: "Bullish",
      targetAsset: "MASK",
      probabilityShift: 11.2,
      comments: [
        { user: "Vitalik Buterin", handle: "@VitalikButerin", text: "Privacy-preserving identity systems using zero-knowledge computations on decentralized platforms are getting extremely robust this year.", time: "1.5h ago", verified: true },
        { user: "Mask Fanatic", handle: "@MaskProtocolLover", text: "Is Elon referring to $MASK Network again? The social middleware layer is skyrocketing! 🚀", time: "1.1h ago", verified: false }
      ]
    },
    {
      id: "tweet-03",
      time: "5h ago",
      text: "Grok 3 is trained on the absolute limit of compute cluster engineering. 100,000 liquid-cooled H100s connected directly via ultra-low latency mesh fabric. It represents the pursuit of objective truth.",
      textZh: "Grok 3 训练在计算集群工程的绝对极限之上。10万张液冷 H100 显卡通过极低延迟的网格级架构直接互连。它代表着对客观真理的追求。",
      likes: 198000,
      retweets: 34100,
      replies: 18900,
      marketImpact: "Highly Volatile",
      targetAsset: "Grok",
      probabilityShift: 15.4,
      comments: [
        { user: "xAI Compute Node", handle: "@xai_cluster", text: "The thermal density logs look pristine. All nodes fully utilized at peak teraflops.", time: "4.5h ago", verified: true },
        { user: "Yann LeCun", handle: "@ylecun", text: "objective truth requires rigorous causal reasoning, not just massive token ingestion clusters.", time: "4h ago", verified: true }
      ]
    },
    {
      id: "tweet-04",
      time: "10h ago",
      text: "SpaceX will dispatch five uncrewed Starships to Mars in two years. If those land safely, crewed missions are possible in four years. Humanity must become multiplanetary before any terrestrial filter triggers.",
      textZh: "SpaceX 将在两年内向火星发射5艘无人的星舰。如果落降安全，载人任务有望在四年内展开。在地球任何大过滤器被触发之前，人类必须成为多行星物种。",
      likes: 310000,
      retweets: 54000,
      replies: 24500,
      marketImpact: "Neutral",
      targetAsset: "All",
      probabilityShift: 4.8,
      comments: [
        { user: "Lex Fridman", handle: "@lexfridman", text: "Beautiful vision of the future. The sheer engineering audacity makes life worth living.", time: "9h ago", verified: true },
        { user: "Mars Pioneer", handle: "@elon_mars", text: "Put me on the list, Elon! I don't care if there's no oxygen, let's build the dome.", time: "8.5h ago", verified: false }
      ]
    }
  ]);

  // --- Core Related People Matrix (The Musk Orbit) ---
  const orbitPeople = useMemo<OrbitPerson[]>(() => [
    {
      id: "trump",
      name: "Donald Trump",
      nameZh: "唐纳德·特朗普",
      handle: "@realDonaldTrump",
      avatar: "DT",
      avatarColor: "from-amber-600 to-yellow-500",
      role: "45th & 47th POTUS / Co-initiator of D.O.G.E",
      relationType: "D.O.G.E Partner",
      stance: "Total deregulation of energy grids, supporting local cryptocurrency miners, streamlining Federal bureaucratic systems under Elon and Vivek's direct recommendations.",
      mutualSynergy: 94,
      latestQuote: "Elon is a fantastic guy, a absolute genius who knows how to cut wasteful spending. We will make Washington lean, efficient, and great again.",
      latestQuoteZh: "埃隆是一个了不起的人，一个绝对知道如何削减浪费支出的天才。我们将使华盛顿变得更精干、更高效、更伟大。"
    },
    {
      id: "vivek",
      name: "Vivek Ramaswamy",
      nameZh: "维维克·拉马斯瓦米",
      handle: "@VivekGRamaswamy",
      avatar: "VR",
      avatarColor: "from-rose-600 to-pink-500",
      role: "Co-leader of the Department of Gov Efficiency",
      relationType: "D.O.G.E Partner",
      stance: "Dismantling corrupt administrative systems, eliminating unconstitutional mandates, using programmatic transparency ledger nodes to track tax outlays.",
      mutualSynergy: 90,
      latestQuote: "With Elon, we aren't using a chisel on the federal budget – we are using a chainsaw. Direct transparent reporting directly to X public nodes.",
      latestQuoteZh: "和埃隆一起，我们不会对联邦预算小修小补——我们要用电锯。直接向 X 上的公共节点进行透明的报告，不设任何遮掩。"
    },
    {
      id: "billy",
      name: "Billy Markus (Shibetoshi)",
      nameZh: "比利·马库斯 (Shibetoshi Nakamoto)",
      handle: "@BillyM2k",
      avatar: "BM",
      avatarColor: "from-yellow-500 to-amber-400 text-slate-950",
      role: "Co-creator of Dogecoin / Social Meme Catalyst",
      relationType: "Media Orbit",
      stance: "Spreading lighthearted memes, criticizing regulatory overreaches, acting as the primary community bridge for daily cultural interactions on X.",
      mutualSynergy: 83,
      latestQuote: "government is basically a computer that has too many legacy tabs open and is running out of RAM. doge represents a reboot button.",
      latestQuoteZh: "政府基本上就像是一台打开了太多旧标签页且内存快用完的电脑。而 doge 代表了一个重启按钮：清爽有趣。"
    },
    {
      id: "vitalik",
      name: "Vitalik Buterin",
      nameZh: "维塔利克·布特林 (神鱼/V神)",
      handle: "@VitalikButerin",
      avatar: "VB",
      avatarColor: "from-blue-605 to-sky-505",
      role: "Co-founder of Ethereum / Crypto Ideologist",
      relationType: "Technical Critic",
      stance: "Pushing hard for real decentralization, zero-knowledge scalability shields, criticizing centralized state payments but praising algorithmic public efficiency.",
      mutualSynergy: 68,
      latestQuote: "P2P social channels need high privacy and censorship resistance. I hope Twitter/X integrates robust client-side encryption rather than just server-side widgets.",
      latestQuoteZh: "点对点的社交渠道需要高度的隐私和抗审查性。我希望 Twitter/X 部署健全的客户端端到端加密，而不仅仅是服务器端的网页微件。"
    },
    {
      id: "rogan",
      name: "Joe Rogan",
      nameZh: "乔·罗根",
      handle: "@joerogan",
      avatar: "JR",
      avatarColor: "from-purple-700 to-indigo-600",
      role: "Podcaster / Media Platform Host",
      relationType: "Media Orbit",
      stance: "Exploring the boundary of artificial intelligence, planetary survival, alternative historical analysis, and on-chain decentralized sovereignty mechanics.",
      mutualSynergy: 77,
      latestQuote: "It's wild to talk with Elon. He’s sitting there computing full orbital rockets physics trajectories in his brain while we're talking about apes.",
      latestQuoteZh: "和埃隆交谈真的是太疯狂了。他在脑子里默默计算着轨道火箭的复杂物理运动轨迹，而我们当时正在聊大猩猩。"
    }
  ], []);

  // --- Core Topics Ledger focusing strictly on Musk / MASK orbit ---
  const topics = useMemo<MuskTopic[]>(() => [
    {
      id: "doge-topic",
      name: "D.O.G.E (Dept Of Gov Efficiency)",
      symbol: "DOGE",
      hypeScore: 92,
      marketCap: "$56.8 Billion (Token)",
      dailyVolume: "$3.42 Billion",
      statusText: "Government reform catalyst. Merges meme culture with direct federal fiscal audits.",
      statusTextZh: "政府改革催化剂。将网梗文化与重磅联邦财务审计融为一体，激发市场无限投机想象。",
      description: "Proposed department directed with eliminating waste, cutting regulations, and restructuring federal agencies. Drives high-volatility trading spikes.",
      descriptionZh: "提议设立的组织，旨在消除浪费、削减冗余法规和重组联邦机构。它是加密市场大流量交易激增的主引擎。",
      associatedTraders: 44200,
      chartData: [
        { h: "Jun 10", mentions: 120, volume: 15 },
        { h: "Jun 11", mentions: 180, volume: 22 },
        { h: "Jun 12", mentions: 420, volume: 58 },
        { h: "Jun 13", mentions: 650, volume: 92 },
        { h: "Jun 14", mentions: 890, volume: 145 },
        { h: "Jun 15", mentions: 1040, volume: 198 }
      ]
    },
    {
      id: "mask-topic",
      name: "Mask Network ($MASK) & Identity",
      symbol: "MASK",
      hypeScore: 88,
      marketCap: "$420 Million",
      dailyVolume: "$114 Million",
      statusText: "Dual catalyst. Plays on social browser encryption and Musk's literal name.",
      statusTextZh: "双重催化效应。玩转社交浏览器隐私插件加密和马斯克姓氏（Mask/Musk）双重双关语。",
      description: "Decentralized portal that allows users to encrypt social messages and launch decentralized trading widgets directly inside Twitter/X interface.",
      descriptionZh: "去中心化协议门户，允许用户对社交信息进行加密，并直接在 Twitter/X 界面内启动去中心化交易与红包小部件。",
      associatedTraders: 18400,
      chartData: [
        { h: "Jun 10", mentions: 85, volume: 24 },
        { h: "Jun 11", mentions: 90, volume: 28 },
        { h: "Jun 12", mentions: 210, volume: 55 },
        { h: "Jun 13", mentions: 490, volume: 98 },
        { h: "Jun 14", mentions: 670, volume: 112 },
        { h: "Jun 15", mentions: 820, volume: 154 }
      ]
    },
    {
      id: "grok-topic",
      name: "xAI / Grok Cluster Engineering",
      symbol: "GROK",
      hypeScore: 84,
      marketCap: "N/A (Private Corp) / $240M Token Proxy",
      dailyVolume: "$38 Million",
      statusText: "Compute limits power growth. Real-time evaluation feeds directly into Grok.",
      statusTextZh: "计算极限赋能产业。实时宏观与微观数据直接作为 Grok 模型的真理输入源。",
      description: "Musk's AI powerhouse using Colossus, a massive 100k liquid-cooled GPU supercluster, for real-time objective truth generation and model weights optimization.",
      descriptionZh: "马斯克的AI重磅力量，利用强大的 100k 液冷 GPU 巨型集群 Colossus，提供实时、客观的世界观检索与大语言模型训练。",
      associatedTraders: 12100,
      chartData: [
        { h: "Jun 10", mentions: 210, volume: 11 },
        { h: "Jun 11", mentions: 240, volume: 14 },
        { h: "Jun 12", mentions: 310, volume: 21 },
        { h: "Jun 13", mentions: 490, volume: 38 },
        { h: "Jun 14", mentions: 580, volume: 46 },
        { h: "Jun 15", mentions: 710, volume: 52 }
      ]
    },
    {
      id: "mars-topic",
      name: "SpaceX Starship Mars Colony",
      symbol: "STARSHIP",
      hypeScore: 78,
      marketCap: "$250 Billion (Private)",
      dailyVolume: "$15 Million (Token proxy speculation)",
      statusText: "Interstellar momentum. Multiplanetary civilization timeline tracker.",
      statusTextZh: "星际大势动能。人类多行星物种迁徙时间轴终极指标器。",
      description: "Fully reusable orbital heavy flight system. Starship comments trigger massive speculation on adjacent space/satellite network proxies and memes.",
      descriptionZh: "完全可重复使用的火箭重型飞行系统。太空/火星评论每次发布都会引发无数火星迷因、卫星通信概念币的波动。",
      associatedTraders: 8500,
      chartData: [
        { h: "Jun 10", mentions: 140, volume: 4 },
        { h: "Jun 11", mentions: 160, volume: 6 },
        { h: "Jun 12", mentions: 180, volume: 5 },
        { h: "Jun 13", mentions: 310, volume: 12 },
        { h: "Jun 14", mentions: 450, volume: 18 },
        { h: "Jun 15", mentions: 520, volume: 22 }
      ]
    },
    {
      id: "robotaxi-topic",
      name: "Tesla FSD / Optimus Artificial Life",
      symbol: "TSLA",
      hypeScore: 82,
      marketCap: "$845 Billion",
      dailyVolume: "$24.5 Billion",
      statusText: "Real-world camera-only neural networks and physical humanoid robotics scaling.",
      statusTextZh: "纯视觉端到端神经网络与真实物理世界类人机器人Optimus的制造缩影。",
      description: "Tesla end-to-end neural network driving policy (v12.5+) and zero-heuristic joint humanoid robots driving physical productivity assets.",
      descriptionZh: "特斯拉端到端驾驶策略及无人工规则的Optimus类人机器人，代表着人工智能大规模落地现实的前哨战。",
      associatedTraders: 55000,
      chartData: [
        { h: "Jun 10", mentions: 195, volume: 180 },
        { h: "Jun 11", mentions: 220, volume: 204 },
        { h: "Jun 12", mentions: 240, volume: 195 },
        { h: "Jun 13", mentions: 390, volume: 280 },
        { h: "Jun 14", mentions: 440, volume: 320 },
        { h: "Jun 15", mentions: 490, volume: 388 }
      ]
    }
  ], []);

  // Filter currently active topic
  const activeTopic = useMemo(() => {
    return topics.find(t => t.id === selectedTopicId) || topics[0];
  }, [topics, selectedTopicId]);

  // Filter currently active orbit person
  const activeOrbitPerson = useMemo(() => {
    return orbitPeople.find(p => p.id === selectedOrbitPersonId) || orbitPeople[0];
  }, [orbitPeople, selectedOrbitPersonId]);

  // Real-time fluctuating tickers for related tokens
  useEffect(() => {
    const clock = setInterval(() => {
      setMuskTickerPrices(prev => {
        const driftDoge = (Math.random() - 0.495) * 0.0028;
        const driftMask = (Math.random() - 0.493) * 0.024;
        const driftTsla = (Math.random() - 0.5) * 0.35;
        const driftGrok = (Math.random() - 0.497) * 0.0006;
        const driftSpacex = (Math.random() - 0.47) * 0.42; // slightly bullish drift!
        
        let newDoge = prev.DOGE + driftDoge;
        let newMask = prev.MASK + driftMask;
        let newTsla = prev.TESLA + driftTsla;
        let newGrok = prev.GROK + driftGrok;
        let newSpacex = prev.SPACEX + driftSpacex;

        if (newDoge <= 0.01) newDoge = 0.01;
        if (newMask <= 0.1) newMask = 0.1;
        if (newTsla <= 1) newTsla = 1;
        if (newGrok <= 0.001) newGrok = 0.001;
        if (newSpacex <= 50) newSpacex = 50;

        return {
          ...prev,
          DOGE: Number(newDoge.toFixed(4)),
          DOGEChange: prev.DOGEChange + (driftDoge > 0 ? 0.12 : -0.11),
          MASK: Number(newMask.toFixed(3)),
          MASKChange: prev.MASKChange + (driftMask > 0 ? 0.15 : -0.14),
          TESLA: Number(newTsla.toFixed(2)),
          TESLAChange: prev.TESLAChange + (driftTsla > 0 ? 0.05 : -0.05),
          GROK: Number(newGrok.toFixed(4)),
          GROKChange: prev.GROKChange + (driftGrok > 0 ? 0.10 : -0.09),
          SPACEX: Number(newSpacex.toFixed(2)),
          SPACEXChange: prev.SPACEXChange + (driftSpacex > 0 ? 0.08 : -0.07)
        };
      });
    }, 4500);

    return () => clearInterval(clock);
  }, []);

  // SpaceX custom high-velocity live ticker feeder + starlink subscriber count incrementer
  useEffect(() => {
    const liveFeeder = setInterval(() => {
      setSpacexLiveChartData(prev => {
        const nextTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const lastEntry = prev[prev.length - 1];
        const lastPrice = lastEntry ? lastEntry.price : 325.80;
        
        // Random walk with 0.5% upward index bias
        const delta = (Math.random() - 0.46) * 0.95;
        const nextPrice = Number(Math.max(100, lastPrice + delta).toFixed(2));
        const nextVolume = Math.round(8000 + Math.random() * 25000);
        
        const updated = [...prev, { time: nextTime, price: nextPrice, volume: nextVolume }];
        return updated.slice(-25); // retain last 25 ticks
      });

      // Increment live terminals simulating dynamic organic user registrations online
      setSpacexLiveTerminalsCount(c => c + Math.floor(Math.random() * 3) + 1);
    }, 3500);

    return () => clearInterval(liveFeeder);
  }, []);

  // SpaceX simulation flight sequence handler
  useEffect(() => {
    if (spacexLaunchSimState === "launching") {
      const timer = setTimeout(() => {
        setSpacexLaunchSimState("maxq");
        // Apply dynamic impact updates
        setMuskTickerPrices(prev => ({
          ...prev,
          SPACEX: Number((prev.SPACEX * 1.018).toFixed(2)),
          SPACEXChange: prev.SPACEXChange + 1.8
        }));
      }, 2500);
      return () => clearTimeout(timer);
    } else if (spacexLaunchSimState === "maxq") {
      const timer = setTimeout(() => {
        setSpacexLaunchSimState("booster_catch");
        setMuskTickerPrices(prev => ({
          ...prev,
          SPACEX: Number((prev.SPACEX * 1.026).toFixed(2)),
          SPACEXChange: prev.SPACEXChange + 2.6
        }));
      }, 3000);
      return () => clearTimeout(timer);
    } else if (spacexLaunchSimState === "booster_catch") {
      const timer = setTimeout(() => {
        setSpacexLaunchSimState("success");
        setMuskTickerPrices(prev => ({
          ...prev,
          SPACEX: Number((prev.SPACEX * 1.039).toFixed(2)),
          SPACEXChange: prev.SPACEXChange + 3.9
        }));
      }, 3000);
      return () => clearTimeout(timer);
    } else if (spacexLaunchSimState === "success") {
      const timer = setTimeout(() => {
        setSpacexLaunchSimState("idle");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [spacexLaunchSimState]);

  // Interactive simulated tweet execution panel
  const handleSimulateTweet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tweetInput.trim()) return;

    const lowerInput = tweetInput.toLowerCase();
    
    // Determine the key sentiment impact and the key target asset
    let impact: MuskTweet["marketImpact"] = "Neutral";
    let target: MuskTweet["targetAsset"] = "All";
    let shiftPercent = 2.5 + Math.random() * 5.0;

    if (lowerInput.includes("doge") || lowerInput.includes("government efficiency") || lowerInput.includes("efficiency")) {
      target = "DOGE";
      impact = "Extreme Bullish";
      shiftPercent = 15.0 + Math.random() * 12.0;
    } else if (lowerInput.includes("mask") || lowerInput.includes("privacy") || lowerInput.includes("shield")) {
      target = "MASK";
      impact = "Bullish";
      shiftPercent = 12.0 + Math.random() * 9.0;
    } else if (lowerInput.includes("grok") || lowerInput.includes("ai") || lowerInput.includes("compute")) {
      target = "Grok";
      impact = "Highly Volatile";
      shiftPercent = 9.5 + Math.random() * 7.5;
    } else if (lowerInput.includes("tesla") || lowerInput.includes("taxi") || lowerInput.includes("car") || lowerInput.includes("optimus")) {
      target = "TESLA";
      impact = "Bullish";
      shiftPercent = 3.5 + Math.random() * 4.0;
    } else if (lowerInput.includes("spacex") || lowerInput.includes("starlink") || lowerInput.includes("starship") || lowerInput.includes("mars") || lowerInput.includes("booster") || lowerInput.includes("rocket")) {
      target = "SPACEX";
      impact = "Extreme Bullish";
      shiftPercent = 14.2 + Math.random() * 11.5;
    }

    const newTweetId = `tweet-sim-${Date.now()}`;
    const newTweet: MuskTweet = {
      id: newTweetId,
      time: "Just Now",
      text: tweetInput,
      textZh: `${tweetInput} (去中心化仿真系统编译结果：该条动态可能引发关联池瞬时变动。)`,
      likes: 1200,
      retweets: 240,
      replies: 150,
      marketImpact: impact,
      targetAsset: target,
      probabilityShift: Number(shiftPercent.toFixed(1)),
      comments: [
        { user: "Grok AI Studio", handle: "@grok_sim_bot", text: "Computing real-time projection metrics... sentiment vector shift confirmed.", time: "Just Now", verified: true },
        { user: "DeFi Speculator", handle: "@de_re_ape", text: "Elon tweeted! Frontrunning liquidity pools in 3... 2... 1...", time: "Just Now", verified: false }
      ]
    };

    setTweets(prev => [newTweet, ...prev]);
    setTweetInput("");
    setTotalSimulatedTweetsCount(prev => prev + 1);

    // Apply instantaneous price impacts
    const shockMultiplier = impact === "Extreme Bullish" ? 1.09 : impact === "Bullish" ? 1.04 : impact === "Highly Volatile" ? 0.96 : 1.01;
    setMuskTickerPrices(prev => {
      let multiplierScale = 1 + (shiftPercent / 100);
      return {
        ...prev,
        DOGE: target === "DOGE" ? Number((prev.DOGE * multiplierScale).toFixed(4)) : prev.DOGE,
        DOGEChange: target === "DOGE" ? prev.DOGEChange + shiftPercent : prev.DOGEChange,
        MASK: target === "MASK" ? Number((prev.MASK * multiplierScale).toFixed(3)) : prev.MASK,
        MASKChange: target === "MASK" ? prev.MASKChange + shiftPercent : prev.MASKChange,
        TESLA: target === "TESLA" ? Number((prev.TESLA * multiplierScale).toFixed(2)) : prev.TESLA,
        TESLAChange: target === "TESLA" ? prev.TESLAChange + (shiftPercent / 3) : prev.TESLAChange,
        GROK: target === "Grok" ? Number((prev.GROK * multiplierScale).toFixed(4)) : prev.GROK,
        GROKChange: target === "Grok" ? prev.GROKChange + shiftPercent : prev.GROKChange,
        SPACEX: target === "SPACEX" ? Number((prev.SPACEX * multiplierScale).toFixed(2)) : prev.SPACEX,
        SPACEXChange: target === "SPACEX" ? prev.SPACEXChange + shiftPercent : prev.SPACEXChange
      };
    });
  };

  // User comments system on tweets
  const handleAddComment = (tweetId: string) => {
    const text = userCommentText[tweetId];
    if (!text || !text.trim()) return;

    setTweets(prev => prev.map(tw => {
      if (tw.id === tweetId) {
        return {
          ...tw,
          comments: [
            ...tw.comments,
            {
              user: "You (Simulated Wallet)",
              handle: "@defihub_user",
              text: text,
              time: "Just Now",
              verified: false
            }
          ],
          replies: tw.replies + 1
        };
      }
      return tw;
    }));

    setUserCommentText(prev => ({
      ...prev,
      [tweetId]: ""
    }));
  };

  // Ask Grok AI for Real-time analysis of the Musk/MASK correlation
  const handleAskGrok = () => {
    setGrokLoading(true);
    setGrokResponse(null);
    setTimeout(() => {
      const answers = [
        "**[Grok 3 Real-Time Correlation Audit]**\n\n1. **MASK Network ($MASK) Correlation**: Our neural net detected a 87.2% semantic convergence score. Because the ticker name fits 'Mask/Musk', automated arbitrage scripts on Decentralized Exchanges (Uniswap v3) deploy matching buy ladders whenever Elon tweets about 'mask', 'shields' or 'internet browser privacy'. Recommend keeping a tight hedge threshold.\n\n2. **D.O.G.E (Gov Efficiency)**: Extreme consensus synchronization. The Department is not a standard program, it operates as a full fiscal chainsaw. We estimate a base $DOGE liquidity pool backing of over $1.4B will act as a buffer against deep drawdowns over the current financial date spectrum.",
        "**[Grok 3 Real-Time Correlation Audit]**\n\n1. **Social Payment Matrix**: Musk's tweets advocating frictionless P2P micromemo currencies acts as a high-frequency trading trigger. Whenever SpaceX tests heavy boosters, adjacent digital assets track a +8% variance inside a 45-minute window.\n\n2. **Arbitrage Protocol Advisory**: The spread between actual Musk declarations (Twitter/X API) and synthetic token derivatives ($MASK Network) represents a crucial yield vector. Deploying a low-latency trigger routing across Ethereum and Base is recommended.",
        "**[Grok 3 Real-Time Correlation Audit]**\n\n1. **Optimal Stance Matrix**: The general community sentiment represents a 'High-Energy Hype Index' (91.4%). Donald Trump's energy grid policies create custom mining reliefs that align with Elon's Mars mission power nodes. Expect deep correlation vectors on computing proxies and real-world assets (Tesla AI, Optimus ecosystem)."
      ];
      setGrokResponse(answers[Math.floor(Math.random() * answers.length)]);
      setGrokLoading(false);
    }, 1800);
  };

  return (
    <div className="space-y-6">
      
      {/* 🌌 HERO INTEL CORNER CARD */}
      <div id="musk-section-hero" className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 border border-slate-800 rounded-2xl p-5 lg:p-6 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-500/5 rounded-full blur-[80px] pointer-events-none"></div>
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2.5 max-w-4xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[8.5px] font-black tracking-widest font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30 uppercase">
                EXCLUSIVE MASK & MUSK INTEL HUB
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[8.5px] font-mono text-slate-400 uppercase tracking-wider">
                马斯克圈专题决策沙盘
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-mono tracking-tight text-white uppercase">
              Elon Musk Ecosystem & Public Impact Terminal
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Only focusing on <strong>MASK / Elon Musk</strong> and associated orbits. Access aggregated timelines of his public statements, dissect coin dynamics like <strong>$DOGE</strong> and <strong>$MASK</strong>, scan his core orbit of direct collaborators (Donald Trump, Vivek, Vitalik), and run mock tweet-impact simulation stress-tests in real-time.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch lg:items-center gap-3 shrink-0">
            <button
              onClick={handleAskGrok}
              disabled={grokLoading}
              className="px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 disabled:from-slate-800 disabled:to-slate-900 text-white font-mono text-[10.5px] font-black uppercase rounded-lg shadow-lg shadow-cyan-950/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer border border-cyan-400/20"
            >
              {grokLoading ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Grok Analyzing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5 fill-cyan-400/20" />
                  <span>Inquire Grok Audit / 咨询Grok审计</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Dynamic AI Statement Output Panel */}
        <AnimatePresence>
          {grokResponse && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 bg-slate-950/90 rounded-xl border border-cyan-500/20 font-mono text-[10px] text-slate-300 leading-relaxed max-w-5xl relative"
            >
              <div className="absolute top-2.5 right-2.5">
                <button 
                  onClick={() => setGrokResponse(null)}
                  className="text-slate-500 hover:text-slate-350 bg-slate-900 p-0.5 rounded cursor-pointer"
                >
                  Close
                </button>
              </div>
              <p className="text-[8px] text-cyan-400 font-extrabold uppercase tracking-widest mb-1.5 flex items-center gap-1">
                <Cpu className="h-3 w-3 animate-pulse" /> Grok 3 Advanced Intelligence Output (马斯克强关联审计):
              </p>
              <div className="whitespace-pre-line font-sans text-xs text-slate-300">
                {grokResponse}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 📊 MUSK INDEX TICKERS TELEMETRY */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { ticker: "DOGE", desc: "Dogecoin Meme Champion", price: muskTickerPrices.DOGE, change: muskTickerPrices.DOGEChange, minDigits: 4, maxDigits: 4, badge: "Core Asset" },
          { ticker: "MASK", desc: "Mask Network Dual Catalyst", price: muskTickerPrices.MASK, change: muskTickerPrices.MASKChange, minDigits: 3, maxDigits: 3, badge: "Social Crypt" },
          { ticker: "TESLA", desc: "Tesla Autonomous AI", price: muskTickerPrices.TESLA, change: muskTickerPrices.TESLAChange, minDigits: 2, maxDigits: 2, badge: "Real-world AI" },
          { ticker: "GROK", desc: "xAI Private Token Proxy", price: muskTickerPrices.GROK, change: muskTickerPrices.GROKChange, minDigits: 4, maxDigits: 4, badge: "Compute Proxy" },
          { ticker: "SPACEX", desc: "SpaceX Space Frontier Elite", price: muskTickerPrices.SPACEX, change: muskTickerPrices.SPACEXChange, minDigits: 2, maxDigits: 2, badge: "IPO Listed Stock" }
        ].map(t => {
          const isUp = t.change >= 0;
          return (
            <div key={t.ticker} className={`p-4 rounded-xl border flex flex-col justify-between space-y-2 relative overflow-hidden transition-all ${
              t.ticker === "SPACEX" 
                ? "bg-slate-950 border-indigo-500/30 shadow-lg shadow-indigo-950/20" 
                : "bg-slate-950 border-slate-900"
            }`}>
              <div className={`absolute top-0 right-0 font-mono text-[7px] font-black uppercase px-2 py-0.5 rounded-bl border-l border-b ${
                t.ticker === "SPACEX" 
                  ? "bg-indigo-900/40 text-indigo-300 border-indigo-800/40" 
                  : "bg-slate-900 text-slate-500 border-slate-850"
              }`}>
                {t.badge}
              </div>
              <div className="space-y-0.5">
                <span className="text-[10.5px] font-mono font-bold text-slate-400 uppercase tracking-tight">{t.ticker}/USD</span>
                <p className="text-[8px] text-slate-600 truncate font-sans">{t.desc}</p>
              </div>
              <div className="flex items-baseline justify-between gap-1.5 pt-1.5 border-t border-slate-905">
                <span className={`text-lg font-black font-mono ${t.ticker === "SPACEX" ? "text-indigo-350" : "text-slate-100"}`}>
                  ${t.price.toLocaleString(undefined, { minimumFractionDigits: t.minDigits, maximumFractionDigits: t.maxDigits })}
                </span>
                <span className={`text-[10px] font-bold font-mono ${isUp ? "text-emerald-400" : "text-rose-400"} flex items-center`}>
                  {isUp ? "▲ +" : "▼ "}{t.change.toFixed(2)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 🚀 SPACEX GLOBAL IPO TERMINAL & OPERATIONS CENTER */}
      <div className="bg-gradient-to-b from-slate-950 to-indigo-950/60 border border-indigo-900/30 rounded-2xl p-5 lg:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none"></div>
        
        {/* Header Block with IPO badge & real-time indicators */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-indigo-950 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-950/50 rounded-xl border border-indigo-500/30 text-indigo-400">
              <Globe className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black tracking-widest font-mono text-indigo-400 bg-indigo-950 border border-indigo-500/40 px-2 py-0.5 rounded uppercase">
                  NASDAQ LISTED: SPCX
                </span>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span className="text-[9px] font-mono text-slate-400">NASDAQ REAL-TIME FEED (SEC COMPLIANT)</span>
              </div>
              <h3 className="text-sm sm:text-base font-black font-mono text-white tracking-tight uppercase flex items-center gap-2 mt-0.5">
                SpaceX Global IPO Terminal & Orbital Intelligence / 马斯克太空探索第一股专题
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-900/40 p-2 rounded-xl border border-indigo-950/40">
            <div>
              <span className="text-[7.5px] text-slate-500 block uppercase font-mono">SX IPO Listing Valuation</span>
              <span className="text-xs font-black font-mono text-slate-100">$365,000,000,000</span>
            </div>
            <div className="h-6 w-px bg-indigo-950/80"></div>
            <div>
              <span className="text-[7.5px] text-slate-500 block uppercase font-mono">SX Shares Authorized</span>
              <span className="text-xs font-black font-mono text-slate-100">1,250,000,000</span>
            </div>
          </div>
        </div>

        {/* Inner Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left Column (lg:col-span-6): Live price chart + Simulation operations */}
          <div className="lg:col-span-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-indigo-300 font-bold uppercase block">SPCX Real-Time Share Price (USD)</span>
                  <p className="text-[8px] text-slate-450 font-mono">Interactive tick frequency: 3.5s. High-energy retail consensus.</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-mono font-black text-white">
                    ${muskTickerPrices.SPACEX.toFixed(2)}
                  </span>
                  <span className={`text-[10px] font-mono font-bold ml-2 ${muskTickerPrices.SPACEXChange >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {muskTickerPrices.SPACEXChange >= 0 ? "▲ +" : "▼ "}{muskTickerPrices.SPACEXChange.toFixed(2)}%
                  </span>
                </div>
              </div>

              {/* SpaceX stock price Area Chart */}
              <div className="h-44 w-full bg-slate-950/80 p-2 rounded-xl border border-indigo-950/50 relative">
                {/* Launch state watermark/indicator overlays */}
                {spacexLaunchSimState !== "idle" && (
                  <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-[1px] flex flex-col items-center justify-center.5 z-20 space-y-2 font-mono text-center p-4">
                    <span className="flex h-3 w-3 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                    </span>
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest animate-pulse">
                      {spacexLaunchSimState === "launching" && "🚀 IGNITION & LIFT-OFF SEQUENCE INITIALIZED..."}
                      {spacexLaunchSimState === "maxq" && "⚡ VEHICLE EXCEEDING MAX-Q (AERODYNAMIC PRESSURE)..."}
                      {spacexLaunchSimState === "booster_catch" && "🧲 MEGAPTRON ARMS LOCKED: CATCHING BOOSTER IN MID-AIR..."}
                      {spacexLaunchSimState === "success" && "✨ ORBITAL INSERTION COMPLETED - SHOCK PREMIUM APPLIED!"}
                    </span>
                    <span className="text-[8.5px] text-slate-450 font-sans max-w-sm">
                      {spacexLaunchSimState === "launching" && "Engines lit. All systems green. Capital markets calculating positive delta weights."}
                      {spacexLaunchSimState === "maxq" && "Highest structural stress cleared. Institutional buy order clusters firing."}
                      {spacexLaunchSimState === "booster_catch" && "Mechazilla arms align. The most audacious engineering feat in human history is active."}
                      {spacexLaunchSimState === "success" && "Mission success! SpaceX stock values surged over +3.9% instantly under global retail excitement."}
                    </span>
                  </div>
                )}
                
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={spacexLiveChartData} margin={{ top: 5, right: 5, left: -22, bottom: 0 }}>
                    <XAxis dataKey="time" stroke="#4f46e5" opacity={0.35} fontSize={7} tickLine={false} />
                    <YAxis domain={['auto', 'auto']} stroke="#4f46e5" opacity={0.35} fontSize={7} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#020617", borderColor: "#312e81", fontSize: "10px", fontFamily: "monospace" }} 
                    />
                    <defs>
                      <linearGradient id="colorSpacexChart" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.35}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area 
                      type="monotone" 
                      dataKey="price" 
                      stroke="#6366f1" 
                      strokeWidth={1.8} 
                      fillOpacity={1} 
                      fill="url(#colorSpacexChart)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Launch simulation triggers */}
            <div className="bg-slate-900/30 p-3 rounded-lg border border-indigo-950/40">
              <span className="text-[8px] font-black text-indigo-400 block uppercase font-mono mb-2 tracking-wider">
                SPACE LOGISTICS CONSOLE: Run Interactive Valuation Trigger
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  disabled={spacexLaunchSimState !== "idle"}
                  onClick={() => setSpacexLaunchSimState("launching")}
                  className="p-2 border border-indigo-900/80 hover:border-indigo-700 bg-slate-950 hover:bg-slate-900 text-indigo-300 rounded font-mono text-[9px] font-bold text-center leading-tight transition active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span className="block">🚀 TEST FLIGHT</span>
                  <span className="text-[7.5px] text-slate-550 font-normal">Starship Launch (+Change)</span>
                </button>
                <button
                  type="button"
                  disabled={spacexLaunchSimState !== "idle"}
                  onClick={() => {
                    setSpacexLaunchSimState("launching");
                    // deploy payload effect
                    setSpacexLiveTerminalsCount(c => c + 185000); // mass deploy users
                  }}
                  className="p-2 border border-indigo-900/80 hover:border-indigo-700 bg-slate-950 hover:bg-slate-900 text-indigo-300 rounded font-mono text-[9px] font-bold text-center leading-tight transition active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span className="block">📡 STARLINK OPS</span>
                  <span className="text-[7.5px] text-slate-500 font-normal">Deploy +185,000 Terminals</span>
                </button>
                <button
                  type="button"
                  disabled={spacexLaunchSimState !== "idle"}
                  onClick={() => {
                    setSpacexLaunchSimState("launching");
                    setMuskTickerPrices(prev => ({
                      ...prev,
                      SPACEX: Number((prev.SPACEX * 1.055).toFixed(2)),
                      SPACEXChange: prev.SPACEXChange + 5.5
                    }));
                  }}
                  className="p-2 border border-indigo-900/80 hover:border-indigo-700 bg-slate-950 hover:bg-slate-900 text-indigo-300 rounded font-mono text-[9px] font-bold text-center leading-tight transition active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span className="block">🌙 ARTEMIS MILESTONE</span>
                  <span className="text-[7.5px] text-slate-500 font-normal">NASA Lunar Lander Contract</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column (lg:col-span-6): Investor Briefings Tabs */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
            
            {/* Horizontal Tabs Selection */}
            <div className="flex border-b border-indigo-950 gap-1 overflow-x-auto pb-1">
              {[
                { id: "chart", name: "📈 Live Order Feed" },
                { id: "advantage", name: "⚡ Launch Cost Advantage" },
                { id: "starlink", name: "📡 Starlink Moat" },
                { id: "ipo", name: "💰 IPO Allocation Plans" }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSpacexActiveTab(tab.id as any)}
                  className={`px-3 py-1.5 font-mono text-[10px] font-bold uppercase transition-all flex-shrink-0 cursor-pointer ${
                    spacexActiveTab === tab.id 
                      ? "text-indigo-400 border-b-2 border-indigo-500 bg-indigo-950/20" 
                      : "text-slate-550 hover:text-slate-350 hover:bg-slate-900/25"
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </div>

            {/* TAB CONTENT: Live trade indicators */}
            {spacexActiveTab === "chart" && (
              <div className="space-y-3 bg-slate-950/40 p-4 rounded-xl border border-indigo-950/40 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="text-[9px] font-black text-indigo-400 block uppercase font-mono">Institution Trading Activity (Mock Feed)</span>
                  <div className="space-y-1.5 font-mono text-[9.5px]">
                    <div className="flex justify-between items-center bg-slate-900/30 p-1.5 rounded">
                      <span className="text-emerald-400 font-bold">▲ ADVANCED ACCUMULATE</span>
                      <span className="text-slate-350">Fidelity Space Fund acquired 45,000 shares</span>
                      <span className="text-slate-500">14s ago</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-900/30 p-1.5 rounded">
                      <span className="text-emerald-400 font-bold">▲ OTC INTAKE</span>
                      <span className="text-slate-350">ARK Space Exploration ETF bought 38,000 shares</span>
                      <span className="text-slate-500">1m ago</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-900/30 p-1.5 rounded">
                      <span className="text-cyan-400 font-semibold">◆ BLOCK CROSS</span>
                      <span className="text-slate-350">Morgan Stanley Private Wealth filled 150,000 shares</span>
                      <span className="text-slate-500">4m ago</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-900/30 p-1.5 rounded">
                      <span className="text-emerald-400 font-bold">▲ REGULATORY FILING</span>
                      <span className="text-slate-350">SpaceX Employee Stock Plan converts +420,000 shares</span>
                      <span className="text-slate-500">12m ago</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-indigo-950/35 border border-indigo-900/45 rounded-lg text-slate-350 text-[11px] font-sans leading-relaxed">
                  <strong>SpaceX (SPCX) IPO Overview:</strong> Listed successfully under a direct listing procedure. By unleashing the private aerospace bottleneck to traditional investors, SpaceX is now poised to integrate with xAI computing grids and Tesla's robotic industrial manufacturing.
                </div>
              </div>
            )}

            {/* TAB CONTENT: Launch cost reduction comparisons */}
            {spacexActiveTab === "advantage" && (
              <div className="space-y-3 bg-slate-950/40 p-4 rounded-xl border border-indigo-950/40 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black text-indigo-400 uppercase font-mono">Payload Launch Cost Comparison (USD / KG)</span>
                    <span className="text-[8.5px] text-slate-550 font-mono">Lower is superior</span>
                  </div>
                  
                  {/* CSS Bar Chart comparisons */}
                  <div className="space-y-2.5 font-mono text-[9px]">
                    <div>
                      <div className="flex justify-between text-slate-450 mb-0.5">
                        <span>Space Shuttle (ULA Legacy expendable)</span>
                        <span className="text-rose-400 font-bold">$18,500 / kg</span>
                      </div>
                      <div className="w-full bg-slate-900 h-2 rounded overflow-hidden">
                        <div className="bg-rose-500 h-full rounded" style={{ width: "100%" }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-455 mb-0.5">
                        <span>Ariane 5 (Legacy European payload carrier)</span>
                        <span className="text-rose-350 font-medium">$8,900 / kg</span>
                      </div>
                      <div className="w-full bg-slate-900 h-2 rounded overflow-hidden">
                        <div className="bg-rose-450 h-full rounded" style={{ width: "48%" }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-450 mb-0.5">
                        <span>Falcon 9 (SpaceX Reusable Stage 1)</span>
                        <span className="text-emerald-405 font-medium">$2,100 / kg</span>
                      </div>
                      <div className="w-full bg-slate-900 h-2 rounded overflow-hidden">
                        <div className="bg-cyan-500 h-full rounded" style={{ width: "11%" }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-indigo-400 font-black mb-0.5 border-t border-indigo-950/35 pt-1">
                        <span>Starship System (SpaceX Target Fully Reusable)</span>
                        <span className="text-emerald-400 font-black">&lt; $95 / kg 🚀</span>
                      </div>
                      <div className="w-full bg-slate-900 h-2 rounded overflow-hidden border border-indigo-500/20">
                        <div className="bg-indigo-500 h-full rounded animate-pulse" style={{ width: "3.5%" }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 leading-normal font-sans bg-indigo-950/20 p-2.5 rounded border border-indigo-900/30">
                  <strong>The Launch Cost Moat:</strong> By recovering and catching both rockets and boosters (Mechazilla arms catch), SpaceX creates a raw structural margin advantage. Competitive systems remain fundamentally expendable, resulting in a 90x margin bottleneck.
                </div>
              </div>
            )}

            {/* TAB CONTENT: Starlink active terminals, bypassing fiber */}
            {spacexActiveTab === "starlink" && (
              <div className="space-y-4 bg-slate-950/40 p-4 rounded-xl border border-indigo-950/40 flex-1 flex flex-col justify-between font-sans">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black text-indigo-400 uppercase font-mono">STARLINK GLOBAL TERM DEPLOYMENT TRACKER</span>
                    <span className="text-[8.5px] text-slate-550 font-mono">REAL-TIME INGESTION</span>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-indigo-900/40 text-center space-y-1">
                    <span className="text-[8px] text-slate-550 block uppercase font-mono tracking-wider">Active Starlink Terminals Globally</span>
                    <span className="text-2xl font-black font-mono text-emerald-400 tracking-wider">
                      {spacexLiveTerminalsCount.toLocaleString()}
                    </span>
                    <span className="text-[8px] text-emerald-500/80 block font-mono">● Incremental terminal active notifications firing live</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[9px] font-mono">
                  <div className="bg-slate-900/40 p-2 rounded">
                    <span className="text-slate-500 block">RECURRING EBITDA</span>
                    <span className="text-slate-200 font-bold">~ 74.2% Operator Margin</span>
                  </div>
                  <div className="bg-slate-900/40 p-2 rounded">
                    <span className="text-slate-500 block">DIRECT-TO-CELL</span>
                    <span className="text-slate-200 font-bold">Bypassing local telco towers</span>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 font-sans leading-normal">
                  <strong>Bypassing Traditional Infrastructure:</strong> Starlink is now the primary cash cow for SpaceX, delivering high-speed internet anywhere on Earth. This recurring consumer/enterprise cash flow directly funds the development of deep-space heavy systems.
                </p>
              </div>
            )}

            {/* TAB CONTENT: IPO plans allocation */}
            {spacexActiveTab === "ipo" && (
              <div className="space-y-4 bg-slate-950/40 p-4 rounded-xl border border-indigo-950/40 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="text-[9px] font-black text-indigo-400 block uppercase font-mono">IPO Capital Expenditure Plans (募资投向细分)</span>
                  
                  <div className="space-y-2 text-[10px] font-mono">
                    <div className="space-y-1">
                      <div className="flex justify-between text-slate-350">
                        <span>1. Raptor 3 Engine Mass Manufacturing (35%)</span>
                        <span className="text-indigo-450 font-bold">$8.75 Billion</span>
                      </div>
                      <div className="w-full bg-slate-900 h-1.5 rounded overflow-hidden">
                        <div className="bg-indigo-500 h-full" style={{ width: "35%" }}></div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-slate-350">
                        <span>2. Starship Orbital Cryogenic Refueling (25%)</span>
                        <span className="text-indigo-450 font-semibold">$6.25 Billion</span>
                      </div>
                      <div className="w-full bg-slate-900 h-1.5 rounded overflow-hidden">
                        <div className="bg-indigo-600/80 h-full" style={{ width: "25%" }}></div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-indigo-300">
                        <span>3. Starlink Gen 3 Satellite Laser Upgrades (25%)</span>
                        <span className="text-indigo-450 font-semibold">$6.25 Billion</span>
                      </div>
                      <div className="w-full bg-slate-900 h-1.5 rounded overflow-hidden">
                        <div className="bg-indigo-700/80 h-full" style={{ width: "25%" }}></div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-slate-355">
                        <span>4. Mars Cargo Fleet Colony Pathfinder (15%)</span>
                        <span className="text-indigo-455 font-medium">$3.75 Billion</span>
                      </div>
                      <div className="w-full bg-slate-900 h-1.5 rounded overflow-hidden">
                        <div className="bg-indigo-800/80 h-full" style={{ width: "15%" }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-[10.5px] text-slate-350 leading-relaxed font-sans bg-indigo-950/20 p-2 border border-indigo-900/20 rounded">
                  <strong>Artemis Trust Commitments:</strong> Under NASA's Artemis Lunar Exploration Contracts, SpaceX holds $4.2B in milestones. The IPO capital ensures rapid execution of non-terrestrial infrastructure.
                </p>
              </div>
            )}

          </div>

        </div>
      </div>

      {/* 🔮 𝕏 ADVERTISING REVENUE SHIFTS & recommendation ALGORITHM INSPECTOR */}
      <div className="bg-gradient-to-b from-slate-950 to-slate-900/90 border border-slate-800 rounded-2xl p-5 lg:p-6 shadow-xl relative overflow-hidden space-y-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none"></div>
        
        {/* Header Block with Twitter/X logo & security clearances */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-850 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-950/30 rounded-xl border border-cyan-550/20 text-cyan-400">
              <Twitter className="h-5 w-5 fill-cyan-400/10 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black tracking-widest font-mono text-cyan-400 bg-cyan-950 border border-cyan-900/60 px-2 py-0.5 rounded uppercase">
                  𝕏 OS INTEL LAB
                </span>
                <span className="text-[9px] font-mono text-slate-500">REVERSE ENGINEERED recommendation ENGINE RESEARCH</span>
              </div>
              <h3 className="text-sm sm:text-base font-black font-mono text-white tracking-tight uppercase flex items-center gap-2 mt-0.5">
                𝕏 Algorithm Velocity & Ad Metric Analyzer / 𝕏算法底层流速与广告投放重组沙盘
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 bg-slate-900/80 border border-slate-800 rounded-lg text-[10px] font-mono text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
            <span>SYSTEM AUDITING NODE active</span>
          </div>
        </div>

        {/* Diagnostic Grid Selection */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT COLUMN: Advertising Revenue Paradigm Revolution */}
          <div className="lg:col-span-6 space-y-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-black text-cyan-400 uppercase tracking-wider block">
                  🛡️ 1. Advertising Structural Evolution / 广告投放大变局研判
                </span>
                <span className="text-[9px] text-slate-550 font-mono">Select Historical Milestone:</span>
              </div>
              <p className="text-[9px] text-slate-450 leading-relaxed font-sans">
                Explore the epochal transformation from corporate brand hegemony (pre-acquisition) to Web3 decentralized ad grids and AI programmatic buyouts after Musk's acquisition.
              </p>
            </div>

            {/* Year selectors */}
            <div className="grid grid-cols-5 gap-1.5">
              {(["2022", "2023", "2024", "2025", "2026"] as const).map(yr => {
                const isSelected = xAdSelectedYear === yr;
                return (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => setXAdSelectedYear(yr)}
                    className={`py-1.5 font-mono text-[10px] font-bold text-center border rounded-lg transition-all cursor-pointer ${
                      isSelected 
                        ? "bg-cyan-950/45 border-cyan-500/50 text-cyan-300 font-extrabold shadow" 
                        : "bg-slate-900/60 border-slate-850 text-slate-500 hover:text-slate-300 hover:border-slate-800"
                    }`}
                  >
                    {yr}
                    {yr === "2022" && <span className="block text-[6.5px] text-slate-600 font-normal">Pre-Buyout</span>}
                    {yr === "2023" && <span className="block text-[6.5px] text-slate-650 font-normal">Boycott</span>}
                    {yr === "2024" && <span className="block text-[6.5px] text-slate-650 font-normal">Web3 Influx</span>}
                    {yr === "2025" && <span className="block text-[6.5px] text-slate-650 font-normal">DOGE Era</span>}
                    {yr === "2026" && <span className="block text-[6.5px] text-cyan-600 font-normal animate-pulse">Now</span>}
                  </button>
                );
              })}
            </div>

            {/* Dynamic Year Report Box */}
            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-900/80 space-y-4">
              <div className="flex items-start justify-between border-b border-slate-900 pb-2.5">
                <div>
                  <h4 className="text-xs font-black text-white font-mono uppercase tracking-tight">
                    {adRevenueReport.title}
                  </h4>
                  <span className="text-[8.5px] text-indigo-400 font-mono uppercase font-bold">
                    Tone Index: {adRevenueReport.monetizationTone}
                  </span>
                </div>
                <span className="text-[8px] font-mono font-black text-cyan-400 bg-cyan-950/50 border border-cyan-900/40 px-2 py-0.5 rounded">
                  {adRevenueReport.statusBadge}
                </span>
              </div>

              {/* Progress meters representing actual commercial streams */}
              <div className="space-y-2.5 font-mono text-[9.5px]">
                {/* 1. Brand Ads */}
                <div className="space-y-1">
                  <div className="flex justify-between text-slate-400 font-medium">
                    <span>🏢 Fortune 500 Legacy Brand Sponsors / 传统品牌广告</span>
                    <span className="text-slate-200 font-black">{adRevenueReport.brandPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded overflow-hidden">
                    <div 
                      className="bg-blue-500 h-full rounded transition-all duration-500" 
                      style={{ width: `${adRevenueReport.brandPercent}%` }}
                    ></div>
                  </div>
                </div>

                {/* 2. Direct-Response / Programmatic / Speculative Crypto */}
                <div className="space-y-1">
                  <div className="flex justify-between text-slate-400 font-medium">
                    <span>⚡ Direct Response, Programmatic & Web3 Ad Influx / 直接响应与中小竞价/加密广告</span>
                    <span className="text-slate-250 font-black">{adRevenueReport.unsolicitedPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded overflow-hidden">
                    <div 
                      className="bg-cyan-500 h-full rounded transition-all duration-500" 
                      style={{ width: `${adRevenueReport.unsolicitedPercent}%` }}
                    ></div>
                  </div>
                </div>

                {/* 3. Subscriptions / Premium / Verification */}
                <div className="space-y-1">
                  <div className="flex justify-between text-slate-400 font-medium">
                    <span>💎 Premium, Premium+ & Verification Blue Subscriptions / 会员增值与认证费</span>
                    <span className="text-slate-250 font-black">{adRevenueReport.subscriptionPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded overflow-hidden">
                    <div 
                      className="bg-indigo-500 h-full rounded transition-all duration-500" 
                      style={{ width: `${adRevenueReport.subscriptionPercent}%` }}
                    ></div>
                  </div>
                </div>

                {/* 4. Enterprise Computing & API telemetry */}
                <div className="space-y-1">
                  <div className="flex justify-between text-slate-400 font-medium">
                    <span>📡 xAI Linkages, Compute Feeds & Raw API Datastreams / 数据流与xAI算力授权等</span>
                    <span className="text-slate-250 font-black">{adRevenueReport.dataCapPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded overflow-hidden">
                    <div 
                      className="bg-orange-500 h-full rounded transition-all duration-500" 
                      style={{ width: `${adRevenueReport.dataCapPercent}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Summary Analyst Paragraphs */}
              <div className="space-y-2 text-[10.5px] leading-relaxed text-slate-350 font-sans border-t border-slate-900/60 pt-3">
                <p>
                  <strong>Historical Diagnosis:</strong> {adRevenueReport.desc}
                </p>
                <p className="text-slate-450 italic bg-slate-900/25 p-2 rounded border border-slate-900 text-[10px]">
                  <strong>分析研判：</strong>{adRevenueReport.descZh}
                </p>
                <div className="flex justify-between items-center bg-cyan-950/10 border border-cyan-900/30 p-2 rounded-lg font-mono text-[9px] mt-1">
                  <span className="text-slate-450 text-[8.5px]">ESTIMATED 𝕏 ANNUALIZED MONETIZATION REVENUE</span>
                  <span className="text-cyan-400 font-black text-xs">{adRevenueReport.totalEstAdRev}</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: recommendation Algorithmic Sandbox */}
          <div className="lg:col-span-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-black text-indigo-400 uppercase tracking-wider block">
                🧠 2. Algorithmic Velocity Multiplex / 底层推荐推送流速解密沙盘
              </span>
              <p className="text-[9px] text-slate-450 leading-relaxed font-sans">
                Twitter/𝕏 uses precise float multipliers on content parameters. Type custom text or align recommendation filters to simulate platform reach and viral propagation velocity.
              </p>
            </div>

            {/* Custom text simulator form input */}
            <div className="space-y-1 font-mono">
              <span className="text-[8.5px] text-slate-500 uppercase font-bold">Post Context Content (Type text containing keywords for live weights check):</span>
              <textarea
                rows={2}
                value={xAlgCustomPostText}
                onChange={(e) => setXAlgCustomPostText(e.target.value)}
                placeholder="Write target post message..."
                className="w-full bg-slate-950 border border-slate-850 hover:border-slate-800 rounded-xl p-2.5 text-[10.5px] text-white focus:outline-none focus:border-cyan-500/30 font-sans resize-none"
              />
            </div>

            {/* Content Category Multiplier Picker */}
            <div className="space-y-1 font-mono">
              <span className="text-[8.5px] text-slate-500 uppercase font-bold block">Assigned Topic Class Priority Factors:</span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1">
                {[
                  { id: "politics", name: "Politics / Reform", mul: "2.4x", desc: "Government Efficiency & policy priority" },
                  { id: "crypto", name: "Web3 / Meme", mul: "1.9x", desc: "Doge, Mask Network, high buzz spec" },
                  { id: "lifestyle", name: "General Life", mul: "0.55x", desc: "Domestic daily topics, heavily depressed" },
                  { id: "journalism", name: "Alt Journalism", mul: "1.6x", desc: "Citizen journalists bypassing traditional bias" },
                  { id: "academic", name: "In-depth Code", mul: "0.85x", desc: "Longform deep engineering insights" }
                ].map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setXAlgMockContentCategory(cat.id as any)}
                    title={cat.desc}
                    className={`p-1 border rounded font-mono text-[8.5px] text-left relative transition-all cursor-pointer ${
                      xAlgMockContentCategory === cat.id
                        ? "bg-indigo-950/40 border-indigo-500/50 text-indigo-300 font-bold"
                        : "bg-slate-900 border-transparent text-slate-500 hover:text-slate-350"
                    }`}
                  >
                    <span className="block truncate">{cat.name}</span>
                    <span className="text-emerald-400 font-bold block text-[7.5px]">{cat.mul} Base</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sandbox Parameter Toggles and sliders */}
            <div className="space-y-2.5 bg-slate-950/40 p-3 rounded-lg border border-slate-900 font-mono text-[9px]">
              {/* Sliders Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <div className="flex justify-between items-center text-slate-400 mb-1">
                    <span>👑 Premium Verification Boost:</span>
                    <span className="text-cyan-400 font-bold">+{xAlgBlueBadgeBoost.toFixed(1)}x Priority</span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="8.0"
                    step="0.5"
                    value={xAlgBlueBadgeBoost}
                    onChange={(e) => setXAlgBlueBadgeBoost(parseFloat(e.target.value))}
                    className="w-full accent-cyan-500 bg-slate-900 h-1 rounded-lg outline-none cursor-pointer"
                  />
                  <span className="text-[7px] text-slate-550 block mt-0.5">Blue Badge comments appear above raw accounts.</span>
                </div>

                <div>
                  <div className="flex justify-between items-center text-slate-400 mb-1">
                    <span>🎥 Native Media Priority:</span>
                    <span className="text-cyan-400 font-bold">+{xAlgMediaAttachmentBoost.toFixed(1)}x Booster</span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="5.0"
                    step="0.2"
                    value={xAlgMediaAttachmentBoost}
                    onChange={(e) => setXAlgMediaAttachmentBoost(parseFloat(e.target.value))}
                    className="w-full accent-cyan-500 bg-slate-900 h-1 rounded-lg outline-none cursor-pointer"
                  />
                  <span className="text-[7px] text-slate-550 block mt-0.5">Native videos/images prioritized over plain layout texts.</span>
                </div>
              </div>

              {/* Toggles Grid */}
              <div className="grid grid-cols-2 gap-4 border-t border-slate-900/60 pt-2.5">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={xAlgOutboundLinkPenalty}
                    onChange={(e) => setXAlgOutboundLinkPenalty(e.target.checked)}
                    className="rounded border-slate-800 bg-slate-900 text-cyan-500 focus:ring-0 cursor-pointer h-3.5 w-3.5"
                  />
                  <div>
                    <span className="text-[8.5px] font-bold text-slate-400 group-hover:text-slate-200 transition-colors">
                      Outbound Link Suppressor
                    </span>
                    <span className="block text-[7px] text-rose-400/80 font-normal">Apply -85% penalty (stay on-site)</span>
                  </div>
                </label>

                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={xAlgMuskCirclePriorityBoost}
                    onChange={(e) => setXAlgMuskCirclePriorityBoost(e.target.checked)}
                    className="rounded border-slate-800 bg-slate-900 text-cyan-500 focus:ring-0 cursor-pointer h-3.5 w-3.5"
                  />
                  <div>
                    <span className="text-[8.5px] font-bold text-slate-400 group-hover:text-slate-200 transition-colors">
                      Musk-Circle Keyword Affinity
                    </span>
                    <span className="block text-[7px] text-emerald-400/80 font-normal">Super-amplification constants active</span>
                  </div>
                </label>
              </div>
            </div>

            {/* RESULTS telemetry display */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-900 flex items-center justify-between gap-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 h-full w-48 bg-gradient-to-l from-indigo-500/5 to-transparent pointer-events-none"></div>
              
              <div className="space-y-1 z-10">
                <div className="text-[8px] text-slate-550 block uppercase font-bold tracking-widest font-mono">
                  Calculated Algorithmic Visibility Speed / 模拟平台流速系数
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black font-mono text-cyan-300 tracking-tight">
                    {calculatedAlgVelocity.toLocaleString()}
                  </span>
                  <span className="text-[9px] text-slate-450 font-mono">Flow Indices</span>
                </div>
                
                {/* Multiplier review status */}
                <div className="text-[9.5px] font-sans font-semibold">
                  {calculatedAlgVelocity < 100 && (
                    <span className="text-rose-400 flex items-center gap-1">
                      ⚠️ Depressed Stream (Shadow suppression & link quarantine) / 外链引流限制中
                    </span>
                  )}
                  {calculatedAlgVelocity >= 100 && calculatedAlgVelocity < 500 && (
                    <span className="text-slate-400 flex items-center gap-1">
                      ● Standard Organic Influx Reach / 正常信息流 (No active push triggers)
                    </span>
                  )}
                  {calculatedAlgVelocity >= 500 && calculatedAlgVelocity < 2000 && (
                    <span className="text-indigo-400 flex items-center gap-1">
                      ▲ Premium Boosted Stream / 订阅优质放大推送 (Blue Badge & media prioritized)
                    </span>
                  )}
                  {calculatedAlgVelocity >= 2000 && (
                    <span className="text-emerald-400 font-bold flex items-center gap-1 animate-pulse">
                      🚀 Interplanetary Velocity Spike / 极其强烈的火爆流速推送 (Absolute exposure boom)!
                    </span>
                  )}
                </div>
              </div>

              {/* Research Insights Summary mini list */}
              <div className="p-2.5 bg-slate-900/50 rounded border border-slate-850/60 max-w-[210px] text-right font-mono text-[7.5px] leading-tight space-y-1.5 shrink-0">
                <p className="text-slate-500 block font-normal uppercase">Verified Leaked Algorithmic Rules:</p>
                <div className="text-slate-400">
                  <span className="text-indigo-400 block font-bold">1. Outbound Links Exception</span>
                  Alg depresses URL domains to prevent viewer retention loss.
                </div>
                <div className="text-slate-450">
                  <span className="text-cyan-400 block font-bold">2. The "Author_Is_Elon" Multiplier</span>
                  System maintains high weighting on Musk network assets.
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* 🚀 PRIMARY CONTENT GRID - SPLIT VIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT COLUMN (Lg:col-span-7): Tweet Declarations & Simulated Publisher */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Tweet Simulation Panel */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-900 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-cyan-950/40 rounded-lg border border-cyan-900/10 text-cyan-400">
                  <Twitter className="h-4 w-4 fill-cyan-400/20" />
                </div>
                <div>
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                    Synthetic Public Tweet Simulator
                  </h3>
                  <p className="text-[9.5px] text-slate-500 font-mono">
                    Model immediate price index shocks across $DOGE, $MASK & Grok
                  </p>
                </div>
              </div>

              {totalSimulatedTweetsCount > 0 && (
                <span className="text-[8px] font-mono font-black text-rose-400 bg-rose-950/60 border border-rose-900/50 px-2 py-0.5 rounded uppercase">
                  Simulated Shock Waves: {totalSimulatedTweetsCount}
                </span>
              )}
            </div>

            <form onSubmit={handleSimulateTweet} className="space-y-3">
              <div className="space-y-1.5 font-mono">
                <label className="text-[8px] text-slate-500 uppercase font-black tracking-wider block">
                  Write Simulation Message / 拟定推文内容 (Try mentioning Dogecoin, Mask social identity, or Grok AI compute):
                </label>
                <div className="relative">
                  <textarea
                    rows={3}
                    value={tweetInput}
                    onChange={(e) => setTweetInput(e.target.value)}
                    placeholder="e.g. The future is decentralization. DOGE is taking over government fat! Or: Mask Network identity preserves privacy."
                    className="w-full bg-slate-900/70 border border-slate-850 hover:border-slate-800 focus:border-cyan-500/50 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:ring-1 focus:ring-cyan-500/20 focus:outline-none font-sans resize-none"
                  />
                  
                  {/* Preset Quick injection templates */}
                  <div className="absolute bottom-2 right-2 flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setTweetInput("Efficiency is vital. D.O.G.E is cutting administrative friction completely.")}
                      className="text-[8.5px] font-mono text-cyan-400 bg-slate-950/90 border border-slate-850 px-2 py-0.8 rounded hover:bg-slate-900 cursor-pointer"
                    >
                      + D.O.G.E
                    </button>
                    <button
                      type="button"
                      onClick={() => setTweetInput("P2P social browser filters need decentralization. Mask shields are crucial.")}
                      className="text-[8.5px] font-mono text-purple-400 bg-slate-950/90 border border-slate-850 px-2 py-0.8 rounded hover:bg-slate-900 cursor-pointer"
                    >
                      + Mask Web3
                    </button>
                    <button
                      type="button"
                      onClick={() => setTweetInput("Grok 3 outputting absolute objective causal truth on Colossus.")}
                      className="text-[8.5px] font-mono text-emerald-400 bg-slate-950/90 border border-slate-850 px-2 py-0.8 rounded hover:bg-slate-900 cursor-pointer"
                    >
                      + xAI Grok
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[7.5px] text-slate-600 font-sans leading-none block">
                  *Publishing triggers rapid AI-driven market volatility vectors.
                </span>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-100 font-mono text-[9.5px] font-black uppercase rounded-lg shadow-md hover:shadow-cyan-950/40 cursor-pointer active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <Send className="h-3 w-3" />
                  <span>Execute Shock Influx / 释放波段冲击</span>
                </button>
              </div>
            </form>
          </div>

          {/* Social Tweet Feed Ingestion Container */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-900 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <div className="flex items-center gap-2">
                <Twitter className="h-4.5 w-4.5 text-cyan-400" />
                <div>
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                    Elon Musk Public Declaration Feed
                  </h3>
                  <p className="text-[9.5px] text-slate-500 font-mono">
                    Ingested real-time comments, statements, and Twitter/X replies
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setTweets(prev => {
                    const extra = {
                      id: `tweet-extra-${Date.now()}`,
                      time: "Just Now",
                      text: "The sheer velocity of decentralized payment transfers makes fiat look like the stone age. High throughput leads to abundance.",
                      textZh: "去中心化支付传输的惊人速度使法定货币看起来就像石器时代。高吞吐力必然导致物质极大丰饶。",
                      likes: 95000,
                      retweets: 12400,
                      replies: 5400,
                      marketImpact: "Extreme Bullish" as const,
                      targetAsset: "DOGE" as const,
                      probabilityShift: 14.5,
                      comments: [
                        { user: "Dogecoin Dev Node", handle: "@dogedev", text: "Optimizing transactional gas sizes continuously. High capacity bounds are ready.", time: "Just Now", verified: true }
                      ]
                    };
                    return [extra, ...prev];
                  });
                }}
                className="text-[9px] font-mono text-slate-400 hover:text-cyan-400 flex items-center gap-1 transition cursor-pointer border border-slate-850 px-2 py-1 rounded hover:bg-slate-900"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Inject Statement</span>
              </button>
            </div>

            <div className="space-y-4 max-h-[620px] overflow-y-auto pr-1">
              <AnimatePresence initial={false}>
                {tweets.map(tw => (
                  <motion.div
                    key={tw.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0 }}
                    className="p-4 bg-slate-900/40 rounded-xl border border-slate-900/80 space-y-3 relative group overflow-hidden"
                  >
                    {/* Corner gradient depending on impact */}
                    <div className={`absolute top-0 right-0 w-1 px-3 py-0.2 rounded-bl text-[7px] font-mono font-black uppercase text-center ${
                      tw.marketImpact === "Extreme Bullish" ? "bg-emerald-950 text-emerald-400 border-l border-b border-emerald-800/40" :
                      tw.marketImpact === "Bullish" ? "bg-cyan-950 text-cyan-400 border-l border-b border-cyan-800/40" :
                      tw.marketImpact === "Highly Volatile" ? "bg-amber-950 text-amber-400 border-l border-b border-amber-800/40" :
                      "bg-slate-900 text-slate-400 border-l border-b border-slate-800"
                    }`}>
                      {tw.marketImpact}
                    </div>

                    {/* Author line */}
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-slate-900 to-black border border-slate-700 flex items-center justify-center text-xs font-black text-slate-200">
                        𝕏
                      </div>
                      <div className="leading-tight">
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] font-black text-slate-200 font-mono">Elon Musk</span>
                          <span className="text-cyan-400 text-[8.5px] select-none">☑</span>
                          <span className="text-[9px] text-slate-550 font-mono">@elonmusk</span>
                        </div>
                        <span className="text-[8px] text-slate-600 font-mono">{tw.time}</span>
                      </div>
                    </div>

                    {/* Main content */}
                    <div className="space-y-1.5 pl-9">
                      <p className="text-xs text-slate-200 leading-relaxed font-sans">{tw.text}</p>
                      <p className="text-[11px] text-slate-450 leading-relaxed font-sans italic bg-slate-950/20 p-2.5 rounded-lg border border-slate-900/60">
                        {tw.textZh}
                      </p>
                    </div>

                    {/* Meta stats counters */}
                    <div className="flex items-center gap-6 pl-9 border-t border-slate-905 pt-2 text-[9px] font-mono text-slate-500">
                      <button type="button" className="flex items-center gap-1.5 hover:text-rose-400 cursor-pointer">
                        <Heart className="h-3.5 w-3.5" />
                        <span>{(tw.likes / 1000).toFixed(1)}k</span>
                      </button>
                      <button type="button" className="flex items-center gap-1.5 hover:text-cyan-400 cursor-pointer">
                        <Share2 className="h-3.5 w-3.5" />
                        <span>{(tw.retweets / 1000).toFixed(1)}k</span>
                      </button>
                      <div className="flex items-center gap-1.5">
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>{tw.replies} Replies</span>
                      </div>
                      
                      <div className="ml-auto flex items-center gap-1">
                        <span className="text-[8px] text-slate-550 uppercase">Impact Spectrum:</span>
                        <span className={`px-1.5 py-0.2 rounded text-[7.5px] font-bold ${
                          tw.targetAsset === "DOGE" ? "bg-emerald-950 text-emerald-400 border border-emerald-900/40" :
                          tw.targetAsset === "MASK" ? "bg-purple-950 text-purple-400 border border-purple-900/40" :
                          tw.targetAsset === "Grok" ? "bg-amber-950 text-amber-400 border border-amber-900/40" :
                          "bg-slate-950 text-slate-400 border border-slate-900"
                        }`}>
                          {tw.targetAsset} +/-{tw.probabilityShift}%
                        </span>
                      </div>
                    </div>

                    {/* Thread comments subsegment */}
                    <div className="ml-9 border-l-2 border-slate-900 pl-3 space-y-2 mt-2 pt-1">
                      {tw.comments.map((cmt, idx) => (
                        <div key={idx} className="text-[10px] space-y-0.5">
                          <div className="flex items-center gap-1">
                            <span className="font-extrabold text-slate-300 font-mono">{cmt.user}</span>
                            {cmt.verified && <span className="text-cyan-400 text-[8px] select-none">☑</span>}
                            <span className="text-slate-550 text-[8.5px] font-mono">{cmt.handle}</span>
                            <span className="text-slate-650 text-[8px] ml-auto font-mono">{cmt.time}</span>
                          </div>
                          <p className="text-slate-405 leading-relaxed font-sans">{cmt.text}</p>
                        </div>
                      ))}

                      {/* Add localized simulation reply */}
                      <div className="flex gap-1.5 pt-2">
                        <input
                          type="text"
                          value={userCommentText[tw.id] || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setUserCommentText(prev => ({ ...prev, [tw.id]: val }));
                          }}
                          placeholder="Post your simulated reply here..."
                          className="flex-1 bg-slate-950 border border-slate-850 hover:border-slate-800 rounded px-2.5 py-1 text-[10px] text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/40 font-sans"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddComment(tw.id)}
                          className="px-2.5 bg-slate-850 hover:bg-slate-800 text-slate-300 rounded font-mono text-[9px] font-black uppercase cursor-pointer"
                        >
                          Comment
                        </button>
                      </div>
                    </div>

                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN (Lg:col-span-5): Orbit People & Associated Topics */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* People Circle Orbit Matrix */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-900 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
              <Users className="h-4.5 w-4.5 text-cyan-400" />
              <div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                  Core Orbit: Associated People Matrix
                </h3>
                <p className="text-[9.5px] text-slate-500 font-mono">
                  Characters in Elon Musk's immediate circle and government projects
                </p>
              </div>
            </div>

            {/* Orbit Switch buttons */}
            <div className="flex flex-wrap gap-1.5">
              {orbitPeople.map(p => {
                const isActive = selectedOrbitPersonId === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedOrbitPersonId(p.id)}
                    className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-mono cursor-pointer transition-all flex items-center gap-1.5 ${
                      isActive 
                        ? "bg-cyan-950/40 border-cyan-500/50 text-cyan-300 font-extrabold shadow shadow-cyan-950/20" 
                        : "bg-slate-900 border-transparent text-slate-400 hover:text-slate-300"
                    }`}
                  >
                    <span className={`h-2 w-2 rounded-full bg-gradient-to-tr ${p.avatarColor}`}></span>
                    <span>{p.name.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>

            {/* Orbit character diagnostic card */}
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-900 space-y-3 font-mono">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-xs font-black text-white">{activeOrbitPerson.name}</h4>
                  <p className="text-[8.5px] text-cyan-450">{activeOrbitPerson.handle}</p>
                </div>
                <div className="text-right">
                  <span className="text-[8px] text-slate-500 block uppercase font-black">Mutual Synergy Index</span>
                  <span className="text-sm font-black text-emerald-400">{activeOrbitPerson.mutualSynergy}% Match</span>
                </div>
              </div>

              <div className="space-y-1.5 text-[9.5px] leading-relaxed">
                <div>
                  <span className="text-[7.5px] text-slate-500 block uppercase font-bold">Orbit Role & Affiliation:</span>
                  <span className="text-slate-300 font-extrabold">{activeOrbitPerson.role}</span>
                </div>
                <div>
                  <span className="text-[7.5px] text-slate-500 block uppercase font-bold">Relation Classification:</span>
                  <span className="text-slate-300 font-semibold">{activeOrbitPerson.relationType}</span>
                </div>
                <div>
                  <span className="text-[7.5px] text-slate-500 block uppercase font-bold">Core Stance / Position:</span>
                  <p className="text-slate-400 font-sans text-[10px] leading-normal">{activeOrbitPerson.stance}</p>
                </div>
              </div>

              {/* Latest Quote Interaction timeline */}
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-905 space-y-1 border-emerald-500/10">
                <span className="text-[7.5px] text-emerald-400 font-black block uppercase tracking-wider">
                  Latest Ingested Quote on Musk / D.O.G.E Orbit:
                </span>
                <p className="text-[10px] text-slate-300 leading-relaxed font-sans font-medium">
                  "{activeOrbitPerson.latestQuote}"
                </p>
                <p className="text-[9.5px] text-slate-450 leading-relaxed font-sans italic pt-1 border-t border-slate-905/40 mt-1">
                  {activeOrbitPerson.latestQuoteZh}
                </p>
              </div>
            </div>
          </div>

          {/* Associated Topics Catalyst Ledgers */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-900 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <div className="flex items-center gap-2">
                <Flame className="h-4.5 w-4.5 text-cyan-400" />
                <div>
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                    Associated Heavy-weight Topics
                  </h3>
                  <p className="text-[9.5px] text-slate-500 font-mono">
                    Hot catalysts linked to public speculative momentum
                  </p>
                </div>
              </div>
            </div>

            {/* List of topic cards */}
            <div className="space-y-2">
              {topics.map(t => {
                const isActive = t.id === selectedTopicId;
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTopicId(t.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                      isActive 
                        ? "bg-slate-900 border-cyan-500/50 shadow shadow-cyan-950/40 scale-[1.01]" 
                        : "bg-slate-900/30 border-slate-900/40 hover:border-slate-800"
                    }`}
                  >
                    <div className="space-y-1 leading-tight min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-black text-slate-200 font-mono truncate">{t.name}</span>
                        {t.symbol && (
                          <span className="text-[8px] bg-slate-950 text-cyan-400 border border-slate-850 px-1.5 py-0.2 rounded font-mono">
                            {t.symbol}
                          </span>
                        )}
                      </div>
                      <p className="text-[9px] text-slate-500 font-sans truncate">{t.statusTextZh}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[8px] text-slate-500 block uppercase font-mono">Buzz Index</span>
                      <span className="text-[11px] font-black font-mono text-cyan-400">{t.hypeScore}%</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Interactive chart and diagnostics of the active topic */}
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-900 space-y-3 font-mono">
              <div className="flex justify-between items-center pb-2 border-b border-slate-905">
                <span className="text-[9.5px] font-black text-slate-200">{activeTopic.name} (Mentions Analysis)</span>
                <span className="text-[8.5px] text-slate-500">MAPPING SPECTRUM: {globalStartDate} - {globalEndDate}</span>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] text-slate-300 font-sans leading-normal">{activeTopic.description}</p>
                <p className="text-[9.5px] text-slate-455 font-sans leading-normal italic">{activeTopic.descriptionZh}</p>
              </div>

              {/* Mentions Spark area chart */}
              <div className="h-28 w-full bg-slate-950/50 p-1.5 rounded-lg border border-slate-905">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activeTopic.chartData} margin={{ top: 2, right: 2, left: -22, bottom: 2 }}>
                    <XAxis dataKey="h" stroke="#475569" fontSize={8} tickLine={false} />
                    <YAxis stroke="#475569" fontSize={8} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#020617", borderColor: "#1e293b", fontSize: "10px", fontFamily: "monospace" }} 
                    />
                    <defs>
                      <linearGradient id="colorMentions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area 
                      type="monotone" 
                      dataKey="mentions" 
                      stroke="#06b6d4" 
                      strokeWidth={1.5} 
                      fillOpacity={1} 
                      fill="url(#colorMentions)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Financial proxy values */}
              <div className="grid grid-cols-2 gap-3 text-[9px] pt-1">
                <div className="bg-slate-950 p-2 rounded border border-slate-905">
                  <span className="text-[7px] text-slate-500 block uppercase">Associated Market Cap:</span>
                  <span className="text-white font-extrabold">{activeTopic.marketCap}</span>
                </div>
                <div className="bg-slate-955 p-2 rounded border border-slate-905">
                  <span className="text-[7px] text-slate-500 block uppercase">24h Speculative Vol:</span>
                  <span className="text-white font-extrabold">{activeTopic.dailyVolume}</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
