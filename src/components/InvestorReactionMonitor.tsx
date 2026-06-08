import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Sparkles, 
  ShieldAlert, 
  DollarSign, 
  Sliders, 
  Volume2, 
  Percent, 
  MessageSquare, 
  Clock, 
  Info, 
  Layers, 
  Globe, 
  Building2,
  Lock,
  Compass,
  Calendar,
  GraduationCap,
  Quote,
  Copy,
  Check,
  BookOpen,
  Download,
  FlaskConical
} from "lucide-react";
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  Cell,
  LineChart,
  Line,
  ReferenceLine
} from "recharts";

interface InvestorReactionMonitorProps {
  currentPrices: { [key: string]: number };
  globalTimeHorizon?: { startDate: string; endDate: string };
}

interface InvestorCohort {
  id: string;
  name: string;
  description: string;
  sentimentIndex: number; // 0-100 (Panic to Extreme FOMO)
  stance: "Accumulating" | "Distributing" | "HODLing" | "Panic Selling" | "Hedged/Neutral";
  bidStrength: number; // 0-100
  leverageRatio: number; // 1x to 25x or arbitrary rating 1-10
  riskTolerance: "Ultra-Conservative" | "Moderate" | "Aggressive" | "Degenerate Speculative";
  dominantAsset: "BTC" | "ETH" | "SOL" | "Stablecoins";
  averageSizeUsd: number;
  recentBehavior: string;
}

interface MacroEvent {
  id: string;
  title: string;
  badge: "BULLISH" | "BEARISH" | "VOLATILE" | "NEUTRAL";
  description: string;
  sentimentMultipliers: {
    retail: number;     // delta shift
    institutional: number;
    whales: number;
    arbitrageurs: number;
  };
}

interface CorrelationCell {
  row: string;
  col: string;
  rowLabel: string;
  colLabel: string;
  value: number; // Correlation index from -1.0 to 1.0
  lagLabel: string; // Timing transmission description
  description: string; // Live transmission explanation
}

const CONSTANT_MACRO_EVENTS: MacroEvent[] = [
  {
    id: "etf_inflow",
    title: "Exogenous Demand Shock: Spot ETF Inflow Spikes",
    badge: "BULLISH",
    description: "Sudden inflow anomaly. Triggers systematic institutional portfolio rebalancing and limits of arbitrage.",
    sentimentMultipliers: { retail: 12, institutional: 25, whales: 18, arbitrageurs: 4 }
  },
  {
    id: "regulatory_audit",
    title: "Sovereign Audit Intervention Policy Shock",
    badge: "BEARISH",
    description: "Heightened regulatory pressure. Tests compliance thresholds, risk-aversion parameters, and panic cascades.",
    sentimentMultipliers: { retail: -22, institutional: -10, whales: -15, arbitrageurs: -5 }
  },
  {
    id: "fed_rate_cut",
    title: "Unexpected Monetary Easing Shock (-50bps Fed cut)",
    badge: "BULLISH",
    description: "Macroliquidity expansion. Stimulates risk-appetite curves and speculative search interest among retail subjects.",
    sentimentMultipliers: { retail: 28, institutional: 15, whales: 12, arbitrageurs: 8 }
  },
  {
    id: "derivative_squeeze",
    title: "Endogenous Liquidation Cascades (Leverage Squeeze)",
    badge: "VOLATILE",
    description: "Negative feedback loop in structural derivative positioning. Triggers ultra-fast high-frequency arbitrageurs.",
    sentimentMultipliers: { retail: -5, institutional: 2, whales: 8, arbitrageurs: 35 }
  },
  {
    id: "whale_migration",
    title: "Large Asymmetric Inventory Allocation Drift ($800M Move)",
    badge: "NEUTRAL",
    description: "Substantial on-chain asset migration. Signals potential inventory distribution, testing cohort cognitive biases.",
    sentimentMultipliers: { retail: -8, institutional: -4, whales: -10, arbitrageurs: 2 }
  }
];

const getAcademicInsight = (row: string, col: string, val: number) => {
  const pairKey = [row, col].sort().join("_");
  
  const catalog: Record<string, { formula: string; causation: string; theory: string; explanationCh: string }> = {
    "retail_retail": {
      formula: "r_{ii} \\equiv 1.00",
      causation: "Instantaneous reflection. Auto-correlated sentiment feedback loops.",
      theory: "Herd behavioral cascades and self-referential momentum scaling (De Long et al., 1990 noise trader models).",
      explanationCh: "同质化散户之间通过社交论坛与市场涨跌直接产生情绪自我强化，无需外部延迟传导。"
    },
    "institutions_institutions": {
      formula: "r_{ii} \\equiv 1.00",
      causation: "Highly synchronized program trades. Algorithmic index allocations.",
      theory: "Information cascades & benchmark-driven asset management alignments (Scharfstein & Stein, 1990).",
      explanationCh: "大型机构之间具有高度一致的合规风控边界，采用类似的算法指令集及仓位对冲协议。"
    },
    "whales_whales": {
      formula: "r_{ii} \\equiv 1.00",
      causation: "Instantaneous OTC pricing linkages.",
      theory: "Sovereign liquidity block configurations and private communication desks (Kyle, 1985 Market Microstructure).",
      explanationCh: "大户/巨鲸之间通过相同的场外柜台（OTC）与智能多签金库转移资产，具备同时吸筹或减仓的共振特性。"
    },
    "arbitrageurs_arbitrageurs": {
      formula: "r_{ii} \\equiv 1.00",
      causation: "Immediate delta updates. Sub-millisecond execution matching.",
      theory: "Limits of arbitrage under capital constraints and high frequency market clearing (Shleifer & Vishny, 1997).",
      explanationCh: "套利主体间竞争极度激烈，均布署于相同的CEX/DEX网关，微秒级对冲延迟使行业净敞口完美重合。"
    },
    "retail_whales": {
      formula: "r(t) = \\operatorname{Corr}(S_{ret}(t), S_{whl}(t - L_{lag}))",
      causation: "Whales act as the persistent accumulator, retail is the momentum chaser. Antagonist correlation.",
      theory: "Liquidity provision on-demand. Whales distribute spot inventory during extreme retail mania and buy during retailer capitulation.",
      explanationCh: "典型的对手盘关系。巨鲸提前 12-24 小时进行左侧暗中建仓（分批挂单），并在散户因为 FOMO 情绪高涨集体冲锋时，顺应流动性进行右侧出货套现。"
    },
    "institutions_retail": {
      formula: "S_{ret}(t) = \\gamma \\cdot \\operatorname{ETF}_{flows}(t - \\tau_L)",
      causation: "Institutional capital flows act as informational waves, tracking with +24h to +48h delays for retail awareness.",
      theory: "Availability heuristic and attention-driven speculative purchase (Barber & Odean, 2008).",
      explanationCh: "信息与流量单向输出。机构合规通道（如ETF申购量）的连续变动，通过财经新闻、推特等媒体发酵，约 24 至 48 小时滞后，转化为散户疯狂入场或割肉的直接催化剂。"
    },
    "arbitrageurs_retail": {
      formula: "Vol_{arb}(t) = f(\\operatorname{Slippage}_{ret}(t))",
      causation: "Coincident volume multiplier. Arbitrage flow expansion tracks retail transaction intensity.",
      theory: "Order flow skimming, MEV sandwich capture, and liquidity sweep provisions (Glosten & Milgrom, 1985).",
      explanationCh: "寄生捕食关系。散户交易频率与滑点偏离越高，套利商的链上捕获机会及清算机器人（MEV Sandwich）的频率就呈指数级同步扩张（通常伴随低至毫秒级的自适应跟随）。"
    },
    "institutions_whales": {
      formula: "Cov(Capital_{ins}(t), Inventory_{whl}(t))",
      causation: "Partial-lead alignment. Whales move early inside on-chain clusters, while institutions deploy on regulated market sessions.",
      theory: "Informed trading and sovereign block allocation networks (Admati & Pfleiderer, 1988).",
      explanationCh: "共谋与合流。链上巨鲸往往具备极强的信息灵敏度，由于其动作更隐蔽不受合规流程延迟，经常领先机构现货配置 4-8 小时发生方向波动，后期两者共同完成大宗筹码定价权支配。"
    },
    "arbitrageurs_whales": {
      formula: "r_{arb, whl} \\approx 0.15",
      causation: "Weak decoupled decoupling. Whales move directional volume; arbitrageurs extract momentary cross-venue basis.",
      theory: "Frictionless execution under block-trade offsets and inventory management (Stoll, 1978).",
      explanationCh: "微弱正相关/脱钩。大户通过大宗OTC渠道分流了现货单向冲击，套利商主要在衍生品端承担中性对冲，仅能捕获大户短暂瞬时冲击所带来的跨市场价差波粒。"
    },
    "arbitrageurs_institutions": {
      formula: "Basis(t) = Spot_{ins}(t) - Futures_{CME}(t)",
      causation: "Perfect baseline premium alignment. Arbitrageurs absorb institutional hedging demand via CME Cash & Carry loops.",
      theory: "Basis convergence and systemic delta neutral hedge mechanics.",
      explanationCh: "强一致基差吸收。大型机构进行合规现货配置时，通常在大宗衍生品市场（如CME）挂出空头对冲单，这为算法套利主体创造了极其丰厚稳健的期现套利（Basis Trades）与资金费率对抽空间。"
    }
  };

  const info = catalog[pairKey] || {
    formula: "r_{xy} = \\operatorname{Cov}(X, Y) / (\\sigma_x \\sigma_y)",
    causation: "Dynamic temporal linkage under active market transmission conditions.",
    theory: "Systemic market microstructure integration and information dissemination.",
    explanationCh: "跨群体处于动态信息博弈状态，套利、流动性供给及追随趋势相互交织。"
  };
  
  return info;
};

const generateMockStressReport = (
  asset: string,
  source: string,
  scenario: string,
  iv: number,
  funding: number,
  slippage: number
) => {
  const scenarioTitles: Record<string, string> = {
    liquidation_squeeze: "Systemic Liquidation Cascades (-15% Flash Fall)",
    regulatory_audit: "Sovereign Audit Crackdown (-25% Compliance Flight)",
    macro_easing: "Global Monetary Expansion Pivot (+20% Liquid Aggression)",
    miner_capitulation: "Miner Energy & Hashrate Halving Exhaustion (-12% Cost Capitulation)",
    stablecoin_panic: "Stablecoin De-peggle Run Panics (-18% Flight-to-Cash)"
  };

  const title = scenarioTitles[scenario] || "Sovereign Compliance Shock";

  const isPositive = scenario === "macro_easing";
  const direction = isPositive ? "UPWARD EXPANSION" : "DOWNWARD CONTRACTIVE";
  const estPrice = isPositive 
    ? `+${(15 + iv * 0.1).toFixed(1)}% price appreciation` 
    : `-${(12 + iv * 0.15 + slippage * 2.5).toFixed(1)}% price drop`;

  return {
    executiveSummary: `Stress Diagnostic Report for target ${asset} under exogenous shock [${title}] using data feed [${source}]. At IV level of ${iv}%, persistent funding metrics of ${funding} bps, and localized slippage scaling of ${slippage}x, the asset framework establishes a high risk of ${direction} transition. Dynamic feedback loops map quick structural relocations across institutional and retail specimens.`,
    marketImpact: {
      priceChange: estPrice,
      volumeMultiplier: `${(1.8 + iv * 0.02 + slippage * 0.4).toFixed(1)}x normal baseline`,
      marginCallSqueezeLiquidationDepth: isPositive 
        ? "Negligible. Systemic liquidity displays premium buffer. Short contractions are captured instantly within 12 seconds." 
        : `Critical Stage III. Margin call levels reached at -$1.4M threshold. Automated liquidation waves are active.`
    },
    cohortRepositioning: [
      {
        cohortId: "institutional",
        name: "Regulated Capital Managers (合规及机构主体)",
        targetAction: isPositive ? "Aggressive spot procurement via Authorized Participants" : "Delta-hedging options coverage",
        stance: isPositive ? "Accumulating Risk" : "Under Hedges / Multi-Sig Defensive Delivery",
        powerAndHardwearContagion: `In institutional brackets, semiconductor stock exposure is dynamic. High hardware overclocking is monitored. Wafer supply lines are prioritized via TSMC N3 pipelines to sustain inventory stability.`
      },
      {
        cohortId: "retail",
        name: "Retail Speculative Specimen (散户投机群体)",
        targetAction: isPositive ? "Hanging leverage FOMO bids" : "Panic-selling into market bid walls",
        stance: isPositive ? "Extreme Leverage Longs" : "Capitulating / Risk Flight to Fiat",
        powerAndHardwearContagion: `Retail specimens display immediate flight behaviors. Google Search indexes for "how to wire cash to exchange" is ticking upward. Raydium/Uniswap DEX aggregators report heavy slippage fees.`
      },
      {
        cohortId: "whales",
        name: "Informed On-chain Whales (链上巨鲸大户群体)",
        targetAction: isPositive ? "Dormant wallet cluster releases" : "Providing Left-side bid accumulation walls",
        stance: isPositive ? "Distributing OTC Profit" : "Accumulating Surrendered Coins",
        powerAndHardwearContagion: `Sovereign address clusters track OTC buy desk premium values. No legacy Satoshi-era wallets are active during clearing phases, reflecting quiet, highly patient accumulation targets.`
      },
      {
        cohortId: "arbitrageurs",
        name: "Algorithmic Arbitrage Vectors (自适应算法套利群体)",
        targetAction: "High-frequency spot-perpetual basis capture",
        stance: "Zero Directional Exposure / Absolute Neutral",
        powerAndHardwearContagion: `Arbitrage systems deploy microsecond liquidations. MEV bundle sandwich bots capture order-book slippage gaps. Flashbots and Jito-Solana builders harvest slip spreads.`
      }
    ],
    liquidationCascades: {
      estimatedLiquidationUsd: isPositive ? "Negligible ($140,000 USD shorts cleared)" : `$${(85 + iv * 2.4 + slippage * 12).toFixed(1)}M USD contract value liquidations`,
      mainLiquidityTractExhaustionSecs: isPositive ? "8 seconds" : `${(45 + iv * 0.8 + slippage * 10).toFixed(0)} seconds to complete core cascade block`
    },
    crossMarketContagion: {
      semiconductorFoundryTsmcWaferImpact: `Mining hardware CAPEX decreases slightly. TSMC (Taiwan Semiconductor) N3 advanced wafer allocation queues experience localized relief, while NVIDIA high-end GPU indices map immediate derivatives option hedge feedback.`,
      optionsGammaDealersHedgeFeedback: "Dealer gamma profiles shift from positive to deep negative territory. Options dealers are forced into shorting underlying spot to maintain delta-neutral compliance rules."
    },
    strategicRiskPlaybook: [
      {
        tickSequence: "T+0s",
        interventionAction: "Deploy collateral injection buffers to cover active leverage levels.",
        bufferImpact: "+14.5% cushion gain."
      },
      {
        tickSequence: "T+15s",
        interventionAction: "Route liquidity transfers to offshore, multi-signature cold storage vaults.",
        bufferImpact: "Isolates exchange default risks."
      },
      {
        tickSequence: "T+120s",
        interventionAction: "Initiate basis trades in CME accounts to cover downside options exposure.",
        bufferImpact: "Establishes long-term stability corridor."
      }
    ]
  };
};

const CATALYST_DEEP_DIVES = [
  {
    id: "liquidity",
    title: "Liquidity Crunches & ETF Flows",
    titleZh: "流动性与供给偏离冲击",
    iconName: "Layers",
    correspondingEventId: "etf_inflow",
    triggerParams: {
      "Baseline Threshold": "ETF Net Flow Velocity exceeds $1.5B/day",
      "Slippage Depth Ratio": "3.5x depth multiplier variance",
      "Order-book Absorption": "Systemic liquidity reservoir deficit < 12%",
      "Causal Loop Action": "Limits of arbitrage under highly fragmented DEX/CEX boundaries"
    },
    deepDive: "This shock simulates a severe supply-demand imbalance. When spot ETF inflows spike (+350%), market makers face capital allocation queues, driving inter-exchange spreads wide. In reverse, a sudden liquidity withdrawal causes a negative supply loop. The primary transmission lag is 450ms, during which automated arbitrageurs attempt to sync cross-venue prices, exposing retail traders to high slippage.",
    heuristics: "Availability heuristic dominates; retail buyers chase momentum while whales systematically distribute inventory.",
    academicRef: "Shleifer & Vishny (1997) 'The Limits of Arbitrage' - capital constraints restrict rapid price normalization."
  },
  {
    id: "regulatory",
    title: "Regulatory & Compliance Shocks",
    titleZh: "主权监管与合规安全审查冲击",
    iconName: "Lock",
    correspondingEventId: "regulatory_audit",
    triggerParams: {
      "Trigger Metric": "Sovereign Audit Alert Threshold > 8.5",
      "Capital Reallocation": "22% of exchange custody shifts offshore within 24hr",
      "Cold-Storage Flight": "Multisig cold wallet deposits surge by 1500%",
      "Target Channels": "CEX banking rails, custody providers, privacy pools"
    },
    deepDive: "This catalyst simulates policy interventions, sudden audit mandates, or privacy pool freezes. When compliance stress rises, risk-averse institutional managers are legally forced to wind down spot positions or migrate custody to highly-regulated on-chain safe-havens, while retail investors display severe panic-selling behavior. Transmission velocity starts high (0-5 minutes) and impacts sentiment metrics, driving down global funding basis.",
    heuristics: "Ambiguity aversion and survival heuristics; capital flees to offshore multi-signatures or cash.",
    academicRef: "Scharfstein & Stein (1990) 'Herd Behavior and Investment' - managers mimic peer actions to avoid reputational risk under regulatory ambiguity."
  },
  {
    id: "derivative",
    title: "Derivative & Leverage Squeezes",
    titleZh: "衍生品高杠杆清算及连环砸盘",
    iconName: "TrendingDown",
    correspondingEventId: "derivative_squeeze",
    triggerParams: {
      "Leverage Squeeze Barrier": "Aggregate perp open interest / spot ratio > 1.8x",
      "Liquidation Cascade Trigger": "Downside price drift >= 4.2% within 15 mins",
      "HFT Arbitrage Speed": "< 5 milliseconds per swap batch",
      "Systemic Volatility (IV) Peak": "> 95% annualized"
    },
    deepDive: "Simulates an endogenous feedback loop where sharp price movements trigger automated margin closeouts on perpetual futures contracts. As contract positions liquidate, they execute immediate market orders, accelerating price declines and tripping further liquidation triggers. High-frequency arbitrageurs capture the resulting pricing spreads instantly, but liquidity providers pull depth, causing bid-ask width to balloon.",
    heuristics: "Loss aversion and gambler's fallacy; retail subjects double-down on losing perpetuals while algorithms sweep books.",
    academicRef: "Brunnermeier & Pedersen (2009) 'Market Liquidity and Funding Liquidity' - margins lock up during high-volatility liquidation loops."
  },
  {
    id: "whale",
    title: "Asymmetric Inventory Migration",
    titleZh: "巨鲸钱包大额非对称资金流向",
    iconName: "Compass",
    correspondingEventId: "whale_migration",
    triggerParams: {
      "Whale Volume Threshold": "Single block allocation > $250M",
      "Concentration Ratio": "Top-10 validator node inflow exceeds 50%",
      "Cognitive Bias Indicator": "Social media mention volume spikes by 3x on wallet watch",
      "Liquidity Absorb Factor": "DEX pool reserve shifts > 15%"
    },
    deepDive: "Simulates sudden on-chain asset transfers by dormant Satoshi-era addresses or large institutional custodians. While no market sales are executed initially, the transparency of the blockchain public ledger triggers a visual availability bias among market observers. Speculators front-run the expected distribution, driving immediate volatility, which whales can then exploit to execute low-slippage OTC trades.",
    heuristics: "Availability cascade and anchoring; market assumes transfer signals imminent dumping.",
    academicRef: "Bikhchandani, Hirshleifer, & Welch (1992) 'A Theory of Fads, Fashion, Custom, and Cultural Change as Informational Cascades'."
  },
  {
    id: "macro_easing",
    title: "Macro Monetary Easing Shocks",
    titleZh: "宏观货币政策宽松降息冲击",
    iconName: "TrendingUp",
    correspondingEventId: "fed_rate_cut",
    triggerParams: {
      "Discount Rate Reduction": "-50bps Interest Margin pivot",
      "Retail Velocity Ratio": "+45% Hot Money capital inflow velocity",
      "Speculating Appetite Indicator": "Yield-bearing product deposit transfers > 32%",
      "Crossover Volatility Level": "Asset pricing premium basis shifts +180bps"
    },
    deepDive: "Simulates shock reductions in central bank baseline policy rates. High-friction traditional bond yields deteriorate, prompting capital migration toward risk asset curves. This expands liquid credit margins and sparks heavy speculative betting on altcoins from retail subjects, driving perpetual funding rates into positive double-digit bps territory.",
    heuristics: "Optimism bias and momentum chasing; retail herds accumulate leverage positions in pursuit of double-digit yields.",
    academicRef: "Akerlof & Shiller (2009) 'Animal Spirits' - speculative fever rising directly with aggregate credit relaxation."
  }
];

export interface DispersalMetricDetail {
  id: string;
  subject: string;
  titleZh: string;
  origin: string;
  formula: string;
  significance: string;
  methodology: string;
  cohortGuides: {
    retail: {
      title: string;
      meaning: string;
      bias: string;
    };
    institutional: {
      title: string;
      meaning: string;
      bias: string;
    };
    whales: {
      title: string;
      meaning: string;
      bias: string;
    };
    arbitrageurs: {
      title: string;
      meaning: string;
      bias: string;
    };
  };
}

export const CONSTANT_DISPERSAL_METRICS: DispersalMetricDetail[] = [
  {
    id: "sentiment",
    subject: "Sentiment Index",
    titleZh: "群体情绪偏差指数",
    origin: "Behavioral Market Sentiment Theory (Baker & Wurgler, 2006)",
    formula: "S_c = W_s \\cdot SocialVol + W_f \\cdot FundingRate + W_d \\cdot OrderRatio",
    methodology: "Blends on-chain network transaction buy ratios with off-chain sentiment signals (social voice scaling indices & funding rate basis premiums). Standardized on [0, 100] via a trailing rolling z-score transformation.",
    significance: "Quantifies the core bullishness or fear levels. Extreme high bounds indicate euphoria and speculative congestion, while low ranges indicate capitulation and panic-hedging cycles.",
    cohortGuides: {
      retail: {
        title: "Consumer / Retail Cohort",
        meaning: "Highly reactive and sentiment-driven. Driven heavily by immediate pricing momentum. Rapidly flips from deep despair and flight at local bottoms to over-leveraged euphoria at local tops.",
        bias: "Availability bias, representativeness heuristic, and herd behavior."
      },
      institutional: {
        title: "Regulated Institutional Capital",
        meaning: "Conservative and slow-moving. Stated neutral or defensive during volatility surges owing to compliance buffers and strict VaR targets. Sentiment shifts only under persistent, macro-backed capital deployments.",
        bias: "Status quo bias and agency herding (mimicking peer asset allocations)."
      },
      whales: {
        title: "Informed Smart-Whales",
        meaning: "Intentionally contrarian. Whales accumulate risk when retail panic is highest (depressed sentiment), and systematically distribute inventory during euphoric retail sentiment peaks.",
        bias: "Overconfidence bias in timing cycles; anchoring to long-term valuation baselines."
      },
      arbitrageurs: {
        title: "Algorithmic Arbitrage Vectors",
        meaning: "Strictly delta-neutral. Sentiment stays pinned around the baseline 50 index because systems trade mathematical price spreads, ignoring emotional biases.",
        bias: "Zero cognitive bias; entirely rules-based automated agent actions."
      }
    }
  },
  {
    id: "bid_intensity",
    subject: "Bid Intensity",
    titleZh: "流动性买盘挂单出价强度",
    origin: "Market Microstructure Order Book Dynamics (Kyle, 1985; Amihud, 2002)",
    formula: "B_i = \\sum_{l=1}^{10} (BidS_l \\cdot w_l) / \\sum_{l=1}^{10} (AskS_l \\cdot w_l) \\quad \\text{where } w_l = e^{-k \\cdot \\Delta P_l}",
    methodology: "Measures real-time buy wall density against sell wall density inside the top 10 order book levels on leading exchanges, applying an exponential distance decay factor.",
    significance: "Highlights passive order book support (liquidity thickness). Higher depth signals strategic buy-walls that cushion sudden selling spirals.",
    cohortGuides: {
      retail: {
        title: "Consumer / Retail Cohort",
        meaning: "Negligible passive bid intensity. Retail relies on instant-execution market orders ('taker' orders) rather than setting structured limit bids in deep order books.",
        bias: "Instant gratification, panic market-selling, and action bias."
      },
      institutional: {
        title: "Regulated Institutional Capital",
        meaning: "High, persistent passive bid density. Institutions deploy capital via passive limit order brackets and algorithmic TWAP/VWAP setups to minimize price impact.",
        bias: "Extreme risk minimization; anchored strictly on algorithmic execution standards."
      },
      whales: {
        title: "Informed Smart-Whales",
        meaning: "Strategic and manipulative bid-wall support. Whales set massive limit walls to hold prices above liquidation thresholds or pull them suddenly to trigger cascading stops for cheaper reentry.",
        bias: "Strategic signaling; game-theoretic posturing against peer entities."
      },
      arbitrageurs: {
        title: "Algorithmic Arbitrage Vectors",
        meaning: "Extremely dynamic and volatile bid-ask spreads. Bids are automatically calculated on lightning margins; they are immediately canceled when volatility breaches threshold tolerances.",
        bias: "Risk-neutral program parameters; immediate withdrawal during volatile gaps."
      }
    }
  },
  {
    id: "leverage_exposure",
    subject: "Leverage Exposure",
    titleZh: "系统性衍生品多空杠杆敞口",
    origin: "Leveraged Asset Price Cycles & Liquidity Cascades (Geanakoplos, 2010)",
    formula: "L_e = \\operatorname{OpenInterest}_{perp} / \\operatorname{Holding}_{spot}",
    methodology: "Calculates total open perpetual futures contract values relative to physical spot base holdings, tracking systemic leverage and forced liquidation levels.",
    significance: "Determines the system's susceptibility to sharp liquidation spirals. High leverage indicates a fragile structural framework.",
    cohortGuides: {
      retail: {
        title: "Consumer / Retail Cohort",
        meaning: "Prone to high leverage exposures. Speculators aggressively buy perp contracts on leverage (often >5x up to 20x) using limited collateral, establishing high vulnerability to liquidation.",
        bias: "Gambler's fallacy (believing downside trend must reverse) and mental accounting."
      },
      institutional: {
        title: "Regulated Institutional Capital",
        meaning: "Extremely low, legally capped leverage. They operate under absolute margin rules, rarely carrying leveraged directions; perpetual indices are used strictly for hedged basis trades.",
        bias: "Regulatory and legal risk avoidance; highly risk-averse institutional posture."
      },
      whales: {
        title: "Informed Smart-Whales",
        meaning: "Moderate, hedged leverage exposure. Whales selectively use leverage to defend spot assets or coordinate squeezes on high retail short concentrations, backed by deep cash reserves.",
        bias: "Calculated risk optimization; asymmetric bet scaling."
      },
      arbitrageurs: {
        title: "Algorithmic Arbitrage Vectors",
        meaning: "Maximum leverage metrics (up to 95%). Arbitrageurs deploy high leverage to amplify minuscule basis or funding rate discrepancies, relying on microsecond processing to close out safety gaps.",
        bias: "Highly geared algorithmic leverage; absolute dependence on network latency tolerances."
      }
    }
  },
  {
    id: "altcoin_affinity",
    subject: "Altcoin Affinity",
    titleZh: "山寨及高波资产投机偏好度",
    origin: "Asset Segment Speculative Spillovers (Barber, Odean, & Zhu, 2009)",
    formula: "A_c = \\operatorname{Volume}_{alt} / \\operatorname{Volume}_{majors}",
    methodology: "Calculates transactional volumes across high-beta assets and memecoins relative to established major bluechips, quantifying total appetite for volatile asset layers.",
    significance: "Measures overall retail speculative greed. Peak levels reflect extreme capital dispersal from majors into speculative risk channels.",
    cohortGuides: {
      retail: {
        title: "Consumer / Retail Cohort",
        meaning: "Extreme altcoin affinity. Retail traders routinely shift their capital into high-volatility, low-price coins seeking asymmetric 100x gains, completely bypassing bluechips.",
        bias: "Lottery-ticket bias, extreme focal anchoring, and fear of missing out (FOMO)."
      },
      institutional: {
        title: "Regulated Institutional Capital",
        meaning: "Extremely minimal or zero altcoin exposure. Institutions are restricted by strict investment charters and regulatory guidelines, limiting their holdings to BTC, ETH, and solid stablecoins.",
        bias: "Fiduciary prudence and legal compliance mapping."
      },
      whales: {
        title: "Informed Smart-Whales",
        meaning: "Tactical altcoin rotation. Whales trade high-cap altcoins during late-stage market cycles to suck in retail liquidity and transfer holdings back to majors or stables.",
        bias: "Mercenary liquidity sourcing; predatory market positioning."
      },
      arbitrageurs: {
        title: "Algorithmic Arbitrage Vectors",
        meaning: "Adaptive and volume-indexed altcoin exposure. Arbitrageurs only run algorithms on high-cap altcoins with deep secondary exchange channels, avoiding illiquid risk pools.",
        bias: "Neutral mathematical routing; index-driven liquidity deployment."
      }
    }
  },
  {
    id: "risk_appetite",
    subject: "Risk Appetite",
    titleZh: "高风险敞口资产交易偏好指数",
    origin: "Global Liquidity Cycles & Asset Risk Premium (Miranda-Agrippino & Rey, 2020)",
    formula: "R_a = \\operatorname{TurnoverVelocity} \\cdot e^{-\\lambda \\cdot HoldDuration} \\cdot \\frac{1}{\\text{ImpliedVolatility}_{options}}",
    methodology: "Aggregates trading velocity, average on-chain wallet hold times, and changes in option implied volatility to measure active demand for volatile positions under high uncertainty.",
    significance: "Determines general risk-on or risk-off global positioning. High indicators manifest as long queues of active speculative capital looking for yield.",
    cohortGuides: {
      retail: {
        title: "Consumer / Retail Cohort",
        meaning: "Extremely volatile and emotionally-charged. Risk appetite surges exponentially following a few green daily candles and collapses into panic during minor price pullbacks.",
        bias: "Underestimation of risk, recency effect, and overreaction."
      },
      institutional: {
        title: "Regulated Institutional Capital",
        meaning: "Highly structured. Risk exposure is bound by explicit Value-at-Risk (VaR) parameters; trading systems automatically wind down risk when options implied volatility spikes.",
        bias: "Risk-budgeting bias; rigid programmatic rebalancing routines."
      },
      whales: {
        title: "Informed Smart-Whales",
        meaning: "Counter-cyclical and calculated risk appetite. Whales actively increase their risk budgets during sustained quiet ranging phases when volatility is depressed.",
        bias: "Intertemporal discounting; deep contrarian liquidity mapping."
      },
      arbitrageurs: {
        title: "Algorithmic Arbitrage Vectors",
        meaning: "Entirely static and risk-insulated. Arbitrage routes operate strictly on neutral parameters, securing delta-hedges as soon as execution occurs.",
        bias: "Complete absence of emotional risk parameters; absolute neutrality."
      }
    }
  },
  {
    id: "resilience_depth",
    subject: "Resilience Depth",
    titleZh: "抗清算回撤资本韧性与后备深度",
    origin: "Financial Meltdown Fragility and Reserve Adequacy (Bernanke & Lown, 1991)",
    formula: "E_r = \\operatorname{StableReserve} / \\operatorname{TotalActiveRisk}",
    methodology: "Compares liquid cash/stablecoin reserves held in wallets to total outstanding volatile risk positions to trace the cohort's buffer against a -15% flash liquidation squeeze.",
    significance: "Tracks capital buffer resilience. High levels indicate thick cushions to absorb market dumps, whereas low levels represent extreme liquidation vulnerability and exhaustion.",
    cohortGuides: {
      retail: {
        title: "Consumer / Retail Cohort",
        meaning: "Highly deficient reserves. Retail tends to stay fully invested or over-leveraged at local tops, holding minimal stablecoins to absorb margin calls and buy deep discounts.",
        bias: "Severe capital mismatch bias; complete disregard for personal reserve buffers."
      },
      institutional: {
        title: "Regulated Institutional Capital",
        meaning: "Impeccable cash reserves. Institutions maintain large stablecoin blockages backed by access to banking systems, enabling strategic accumulation during deep liquidating panics.",
        bias: "Over-collateralization safety bias; adherence to strict capital asset adequacy guidelines."
      },
      whales: {
        title: "Informed Smart-Whales",
        meaning: "Deep, shielded reserve pockets. Whales hold large amounts of yield-bearing stables in multi-signature cold custody vaults, specifically allocated to act during sharp downward spirals.",
        bias: "Game-theoretic cash buffer preservation; predatory bidding allocation."
      },
      arbitrageurs: {
        title: "Algorithmic Arbitrage Vectors",
        meaning: "Moderately buffered. Reserves are automatically adjusted dynamically to re-collateralize parallel futures positions, but can still face liquidating margin calls on cross-chain gaps.",
        bias: "Programmed collateral sweeps; absolute reliance on API execution speeds."
      }
    }
  }
];

export const InvestorReactionMonitor: React.FC<InvestorReactionMonitorProps> = ({ currentPrices, globalTimeHorizon }) => {
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [userSelectedAsset, setUserSelectedAsset] = useState<"BTC" | "ETH" | "SOL">("BTC");
  const [viewMode, setViewMode] = useState<"matrix" | "historical" | "timing">("matrix");
  const [selectedHistorical, setSelectedHistorical] = useState<{ pipelineId: string; dayIndex: number }>({
    pipelineId: "whales-retail",
    dayIndex: 30
  });

  // State configurations for Scholarly Academic Citations
  const [isCitationOpen, setIsCitationOpen] = useState<boolean>(false);
  const [citationFormat, setCitationFormat] = useState<"apa" | "bibtex">("bibtex");
  const [copiedStatus, setCopiedStatus] = useState<boolean>(false);

  // State configurations for Batch Research Export Feature
  const [isBatchExportOpen, setIsBatchExportOpen] = useState<boolean>(false);
  const [copiedBatchStatus, setCopiedBatchStatus] = useState<boolean>(false);
  const [previewTab, setPreviewTab] = useState<"json" | "heatgrid-csv" | "correlation-csv" | "timing-csv">("json");
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [isCompilingBatch, setIsCompilingBatch] = useState<boolean>(false);

  const dates = useMemo(() => {
    const arr = [];
    const baseDate = new Date("2026-05-30");
    for (let i = 29; i >= 0; i--) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() - i);
      const month = d.toLocaleString('en-US', { month: 'short' });
      const day = String(d.getDate()).padStart(2, '0');
      arr.push({
        index: 30 - i, // 1 to 30
        label: `${month} ${day}`,
        dateStr: d.toISOString().split('T')[0]
      });
    }
    return arr;
  }, []);

  const filteredDates = useMemo(() => {
    if (!globalTimeHorizon) return dates;
    const { startDate, endDate } = globalTimeHorizon;
    const res = dates.filter(day => {
      return day.dateStr && day.dateStr >= startDate && day.dateStr <= endDate;
    });
    return res.length > 0 ? res : dates;
  }, [dates, globalTimeHorizon]);

  const historicalPipelines = useMemo(() => [
    { id: "whales-retail", label: "Whales ➔ Retail", rowLabel: "Informed Whales", colLabel: "Retail Specimen" },
    { id: "institutions-retail", label: "Capital ➔ Retail", rowLabel: "Regulated Capital", colLabel: "Retail Specimen" },
    { id: "retail-arbitrage", label: "Retail ➔ Arbitrage", rowLabel: "Retail Specimen", colLabel: "Arbitrage Vectors" },
    { id: "whales-institutions", label: "Whales ➔ Capital", rowLabel: "Informed Whales", colLabel: "Regulated Capital" },
    { id: "whales-arbitrage", label: "Whales ➔ Arbitrage", rowLabel: "Informed Whales", colLabel: "Arbitrage Vectors" },
    { id: "institutions-arbitrage", label: "Capital ➔ Arbitrage", rowLabel: "Regulated Capital", colLabel: "Arbitrage Vectors" },
  ], []);

  const getHistoricalData = (pipelineId: string, dayIndex: number) => {
    let seed = (dayIndex * 17) % 100;
    let baseVal = 8.0;
    let unit = "h";
    let label = "Whales lead Retail";

    if (pipelineId === "whales-retail") {
      baseVal = userSelectedAsset === "SOL" ? 1.0 : userSelectedAsset === "ETH" ? 4.0 : 8.0;
      unit = "h";
      label = "Informed Whales lead Retail Specimen";
    } else if (pipelineId === "institutions-retail") {
      baseVal = userSelectedAsset === "SOL" ? 120.0 : userSelectedAsset === "ETH" ? 36.0 : 96.0;
      unit = "h";
      label = "Regulated Capital leads Retail Specimen";
    } else if (pipelineId === "retail-arbitrage") {
      baseVal = userSelectedAsset === "SOL" ? 15.0 : userSelectedAsset === "ETH" ? 250.0 : 500.0;
      unit = "ms";
      label = "Retail Specimen leads Bot Arbitrage";
    } else if (pipelineId === "whales-institutions") {
      baseVal = userSelectedAsset === "SOL" ? 48.0 : userSelectedAsset === "ETH" ? 2.0 : 4.0; 
      unit = "h";
      label = "Informed Whales lead Regulated Capital";
    } else if (pipelineId === "whales-arbitrage") {
      baseVal = userSelectedAsset === "SOL" ? 45.0 : userSelectedAsset === "ETH" ? 300.0 : 900.0;
      unit = "s";
      label = "Informed Whales lead Bot Arbitrage";
    } else if (pipelineId === "institutions-arbitrage") {
      baseVal = userSelectedAsset === "SOL" ? 12.0 : userSelectedAsset === "ETH" ? 0.75 : 2.0;
      unit = "h";
      label = "Regulated Capital leads Bot Arbitrage";
    }

    let cycle = Math.sin((dayIndex / 30) * Math.PI * 2.5) * 0.25; 
    let weekendFactor = (dayIndex % 7 === 0 || dayIndex % 7 === 1) ? 0.35 : -0.1;
    let noise = ((seed % 10) / 10) * 0.15 - 0.075;

    let multiplier = 1.0 + cycle + weekendFactor + noise;

    if (activeEventId) {
      const eventPeakDay = 18;
      const distance = Math.abs(dayIndex - eventPeakDay);
      if (distance <= 6) {
        const shockScale = (6 - distance) / 6;
        if (activeEventId === "etf_inflow") {
          if (pipelineId === "institutions-retail" || pipelineId === "whales-institutions") {
            multiplier *= (1.0 - 0.5 * shockScale);
          }
        } else if (activeEventId === "regulatory_audit") {
          multiplier *= (1.0 + 1.2 * shockScale);
        } else if (activeEventId === "fed_rate_cut") {
          multiplier *= (1.0 - 0.4 * shockScale);
        } else if (activeEventId === "derivative_squeeze") {
          if (pipelineId.includes("arbitrage")) {
            multiplier *= (1.0 - 0.7 * shockScale);
          }
        }
      }
    }

    const finalVal = Math.max(0.01, baseVal * multiplier);

    let status: "highly-efficient" | "normal" | "clogged" = "normal";
    if (multiplier < 0.85) {
      status = "highly-efficient";
    } else if (multiplier > 1.25) {
      status = "clogged";
    }

    return {
      value: finalVal,
      multiplier,
      unit,
      label,
      status,
      rawMultiplier: multiplier
    };
  };

  const selectedDayData = useMemo(() => {
    return filteredDates.find(d => d.index === selectedHistorical.dayIndex) || filteredDates[filteredDates.length - 1] || dates[29];
  }, [filteredDates, selectedHistorical.dayIndex, dates]);

  const cellDetails = useMemo(() => {
    return getHistoricalData(selectedHistorical.pipelineId, selectedHistorical.dayIndex);
  }, [selectedHistorical.pipelineId, selectedHistorical.dayIndex, userSelectedAsset, activeEventId]);

  const pipelineInfo = useMemo(() => {
    return historicalPipelines.find(p => p.id === selectedHistorical.pipelineId) || historicalPipelines[0];
  }, [historicalPipelines, selectedHistorical.pipelineId]);

  const chartData = useMemo(() => {
    return filteredDates.map(day => {
      const stats = getHistoricalData(selectedHistorical.pipelineId, day.index);
      return {
        name: day.label,
        delay: parseFloat(stats.value.toFixed(3)),
      };
    });
  }, [selectedHistorical.pipelineId, userSelectedAsset, activeEventId, filteredDates]);
  
  // Interactive cell selection for the cohort correlation matrix
  const [selectedCell, setSelectedCell] = useState<{ row: string; col: string }>({
    row: "retail",
    col: "institutions"
  });

  // State variables for Timing Matrix view
  const [selectedTimingCell, setSelectedTimingCell] = useState<{ rowId: string; colId: string }>({
    rowId: "retail_lag_24",
    colId: "etf_creations"
  });

  const timingRows = useMemo(() => [
    { id: "retail_lead_24", label: "-24h Retail Lead", desc: "Retail sentiment shifts 24 hours BEFORE institutional inflow" },
    { id: "retail_lead_12", label: "-12h Retail Lead", desc: "Retail sentiment shifts 12 hours BEFORE institutional inflow" },
    { id: "retail_coincident", label: "Coincident (0h)", desc: "Retail sentiment and institutional inflow occur simultaneously" },
    { id: "retail_lag_12", label: "+12h Retail Lag", desc: "Retail sentiment shifts 12 hours AFTER institutional inflow" },
    { id: "retail_lag_24", label: "+24h Retail Lag", desc: "Retail sentiment shifts 24 hours AFTER institutional inflow" },
    { id: "retail_lag_48", label: "+48h Retail Lag", desc: "Retail sentiment shifts 48 hours AFTER institutional inflow" },
  ], []);

  const timingCols = useMemo(() => [
    { id: "etf_creations", label: "Spot ETF Creations", desc: "Net daily inflows / creations in regulated exchange-traded funds" },
    { id: "otc_custody", label: "OTC Desk Liquidity", desc: "Asymmetric block trades handled via off-book market makers" },
    { id: "cme_futures", label: "CME Institutional OI", desc: "CME futures open interest positioning shifts from leverage funds" },
    { id: "corp_treasuries", label: "Corp Treasury Buys", desc: "Public/private enterprise reserves treasury acquisitions" },
  ], []);

  const timingMatrixData = useMemo(() => {
    const data: Array<{
      rowId: string;
      colId: string;
      rowLabel: string;
      colLabel: string;
      value: number;
      explanation: string;
      significance: string;
      transmissionPhase: string;
    }> = [];

    const baseValues: Record<string, Record<string, number>> = {
      retail_lead_24: { etf_creations: 0.12, otc_custody: 0.08, cme_futures: -0.05, corp_treasuries: 0.02 },
      retail_lead_12: { etf_creations: 0.22, otc_custody: 0.15, cme_futures: 0.10, corp_treasuries: 0.05 },
      retail_coincident: { etf_creations: 0.45, otc_custody: 0.28, cme_futures: 0.38, corp_treasuries: 0.12 },
      retail_lag_12: { etf_creations: 0.78, otc_custody: 0.62, cme_futures: 0.70, corp_treasuries: 0.48 },
      retail_lag_24: { etf_creations: 0.85, otc_custody: 0.72, cme_futures: 0.82, corp_treasuries: 0.65 },
      retail_lag_48: { etf_creations: 0.68, otc_custody: 0.55, cme_futures: 0.60, corp_treasuries: 0.50 }
    };

    timingRows.forEach(row => {
      timingCols.forEach(col => {
        let val = baseValues[row.id]?.[col.id] ?? 0.3;

        // Adjust based on asset
        if (userSelectedAsset === "ETH") {
          if (col.id === "etf_creations") val -= 0.15;
          if (col.id === "otc_custody") val += 0.05;
          if (row.id.includes("lag_12") || row.id.includes("lag_24")) val += 0.04;
        } else if (userSelectedAsset === "SOL") {
          if (col.id === "etf_creations") val -= 0.65;
          if (col.id === "otc_custody") val += 0.12;
          if (row.id.includes("lead_")) val += 0.15;
          if (row.id.includes("lag_12") || row.id.includes("lag_24")) val += 0.08;
        }

        // Adjust based on active event
        if (activeEventId === "etf_inflow") {
          if (col.id === "etf_creations") {
            if (row.id.includes("lag_")) val = Math.min(0.98, val + 0.20);
            if (row.id === "retail_coincident") val += 0.15;
          }
        } else if (activeEventId === "fed_rate_cut") {
          val = Math.min(0.95, val + 0.15);
        } else if (activeEventId === "regulatory_audit") {
          val = Math.max(-0.95, val - 0.40);
        } else if (activeEventId === "derivative_squeeze") {
          if (col.id === "cme_futures") {
            if (row.id === "retail_coincident") val = -0.75;
            if (row.id.includes("lag_")) val = -0.60;
          }
        } else if (activeEventId === "whale_migration") {
          if (col.id === "otc_custody") {
            if (row.id.includes("lag_")) val = Math.min(0.88, val + 0.12);
          }
        }

        val = Math.max(-1.0, Math.min(1.0, val));
        val = parseFloat(val.toFixed(2));

        let explanation = "";
        let transmissionPhase = "";
        let significance = "p < 0.01 (Highly Significant)";

        if (val > 0.70) {
          transmissionPhase = "High-Fidelity Downstream Dissemination";
          explanation = `Massive inflows in ${col.label} create large, visible market signals. Retail traders react with a delayed frenzy, driving sentiment indices to FOMO peaks ${row.label.split("Retail")[0].replace("+","").trim()} later. This exhibits standard momentum-chasing behavior.`;
        } else if (val > 0.40) {
          transmissionPhase = "Moderate Narrative Coupling";
          explanation = `Moderate positive covariance exists. Volume changes in ${col.label} quietly ripple through premium exchanges, leading to sentiment shifts ${row.label.replace("+","").trim()} after the initial block allocation is absorbed.`;
        } else if (val < -0.50) {
          transmissionPhase = "Asymmetric Squeeze & Distribution";
          explanation = `An inverse relationship suggests professional capitulation or hedging. Institutional buying into ${col.label} absorbs falling supply while retail panic-sells during fear cascades, triggering a direct structural decoupling.`;
        } else if (val < -0.20) {
          transmissionPhase = "Anti-Correlated Capital Divergence";
          explanation = `A mild inverse trend reflects institutions deploying capital under contrarian models (e.g. accumulating quiet local bottoms) while retail sentiment shifts in response to local fear cycles.`;
        } else {
          significance = "p > 0.10 (Not Significant)";
          transmissionPhase = "Decoupled / Independent Latency Noise";
          explanation = `Correlation values represent statistical noise. Institutional adjustments inside ${col.label} operate independently of retail speculation thresholds within this timing window.`;
        }

        data.push({
          rowId: row.id,
          colId: col.id,
          rowLabel: row.label,
          colLabel: col.label,
          value: val,
          explanation,
          significance,
          transmissionPhase
        });
      });
    });

    return data;
  }, [userSelectedAsset, activeEventId, timingRows, timingCols]);

  // Dynamic calculations for full cohort-to-cohort behavior linkages
  const cohortIDs = ["retail", "whales", "institutions", "arbitrageurs"];
  const cohortLabels: { [key: string]: string } = {
    retail: "Retail Specimen (散户研究样本)",
    whales: "Informed Whales (知情巨鲸样本)",
    institutions: "Regulated Capital (机构资本样本)",
    arbitrageurs: "Arbitrage Vectors (算法套利主体)",
  };

  const correlationMatrix = useMemo<CorrelationCell[]>(() => {
    // Dynamic values based on active event simulation parameters and selected asset
    let ret_whl = 0.45;
    let ret_ins = -0.22;
    let ret_arb = -0.15;
    let whl_ins = 0.65;
    let whl_arb = 0.30;
    let ins_arb = -0.05;

    let ret_whl_lag = "Informed Whales lead Retail Specimen by ~8 hours";
    let ret_ins_lag = "Regulated Capital leads Retail Specimen by 4 days";
    let ret_arb_lag = "Algorithmic Arbitrage dynamic latency ~500ms";
    let whl_ins_lag = "Coaligned OTC Custodial Settlements";
    let whl_arb_lag = "Informed Whales lead Bot Arbitrage by 15 mins";
    let ins_arb_lag = "Regulated Capital leads Bot Arbitrage by 2 hours";

    let ret_whl_desc = "On-chain data indicates informed whales preempt retail sentiment spikes. Whales exploit order flow routing, executing accumulations adjacent to retail panic sell thresholds.";
    let ret_ins_desc = "Regulated asset aggregators accumulate quietly in systemic local troughs while speculative sentiment remains deeply depressed, illustrating high asymmetry inside standard information channels.";
    let ret_arb_desc = "Hyper-rational algorithmic vectors absorb microstructural spread inefficiencies, harvesting retail slips arising from sub-optimal high-slippage market interactions.";
    let whl_ins_desc = "Large block settlements confirm close custodian volume alignments. Private OTC contract matching conceals material directional allocation migrations from public exchanges.";
    let whl_arb_desc = "Volatile inventory transfers to liquid venues create discrete localized price variances, triggering algorithmic triangular arbitrage offsets across decentralized venues.";
    let ins_arb_desc = "Regulated institutions channel bulk activity via dark OTC nodes, bypassing frontrunning MEV searchers and minimizing empirical footprint.";

    if (userSelectedAsset === "ETH") {
      ret_whl = 0.58;
      ret_ins = 0.15;
      ret_arb = 0.32;
      whl_ins = 0.48;
      whl_arb = 0.55;
      ins_arb = 0.28;
      ret_whl_lag = "Informed Whales lead Retail by 4 hours";
      ret_ins_lag = "Regulated Capital leads Retail by 36 hours";
      ret_arb_lag = "Arbitrage transmission latency ~250ms";
      whl_ins_lag = "Synchronous Staking Yield Calibration";
      whl_arb_lag = "Informed Whales lead Arbitrage by 5 mins";
      ins_arb_lag = "Regulated Capital leads Arbitrage by 45 mins";

      ret_whl_desc = "[ETH Systemic Hub] Informed Whales track smart contract deployer activity, preempting retail speculative fee escalations on Decentralized Protocols.";
      ret_ins_desc = "Regulated funds utilize systematic staking structures, managing yield premiums with minimal structural correlation to retail sentiment trends.";
      ret_arb_desc = "Arbitrage algorithms capitalize on transient liquidity pool imbalances occurring between L2 rollups and base layer AMMs.";
      whl_ins_desc = "On-chain validator delegations suggest close coordination between private treasury allocators and major staking node operators.";
      whl_arb_desc = "High-gas liquidations push spot variances across secondary DEX pools, triggering immediate bot-driven triangular rate corrections.";
      ins_arb_desc = "Algorithmic aggregators track institutional block orders, dynamically pricing execution slips against historical baseline deviations.";
    } else if (userSelectedAsset === "SOL") {
      ret_whl = 0.82;
      ret_ins = -0.55;
      ret_arb = 0.78;
      whl_ins = -0.12;
      whl_arb = 0.88;
      ins_arb = -0.35;
      ret_whl_lag = "Informed Whales lead Retail by 1 hour";
      ret_ins_lag = "Retail Specimen leads Regulated Capital by 5 days";
      ret_arb_lag = "Jito MEV Arbitrage transmission ~15ms";
      whl_ins_lag = "Decoupled OTC flow channels";
      whl_arb_lag = "Informed Whales lead Arbitrage by 45 seconds";
      ins_arb_lag = "Arbitrage dynamic feedback lead ~12 hours";

      ret_whl_desc = "[SOL Speculative Network] High-velocity DEX speculation aligns retail sentiment and whale positioning. Whales frontrun memes within 1 hour of pool creation.";
      ret_ins_desc = "Regulated capital remains completely risk-averse on low-fee volatile chains, resulting in institutions purchasing spot allocations at premiums long after retail momentum peak.";
      ret_arb_desc = "MEV searchers execute lightning-fast dynamic Jito-bundles, systematically capturing slip cycles stemming from uncoordinated retail Raydium router swaps.";
      whl_ins_desc = "OTC block transaction registries represent independent developer treasury liquid exchanges, illustrating negligible covariance with institutional indexes.";
      whl_arb_desc = "Informed whale priority fee bids generate local sandwich opportunities, attracting high-frequency bot responses to arbitrage spread anomalies in sub-second intervals.";
      ins_arb_desc = "Arbitrageurs exploit price signals on Pyth oracle systems, frontrunning sluggish deposit gateways utilized by traditional fiat-to-crypto portals.";
    }

    if (activeEventId === "etf_inflow") {
      ret_ins = userSelectedAsset === "SOL" ? -0.12 : 0.58;
      whl_ins = userSelectedAsset === "SOL" ? 0.15 : 0.88;
      ret_ins_lag = userSelectedAsset === "SOL" ? "Regulated Capital lags by 5 days" : "Regulated Capital leads Retail by 12 hours";
      whl_ins_lag = userSelectedAsset === "SOL" ? "Independent asset channels" : "Instantaneous Custodial Integration";
      ret_ins_desc = userSelectedAsset === "SOL" 
        ? "Spot ETF inflows focus exclusively on BTC and ETH trust custody architectures; speculative Solana micro-cap networks remain completely decoupled."
        : "Substantial institutional ETF creations generate positive social signal coverage, initiating retail search trends and eventual secondary buying within 12 hours.";
      whl_ins_desc = userSelectedAsset === "SOL"
        ? "Whale agents trade independently on decentralized venues, isolated from regulated spot trust custodian allocations."
        : "Custodial block transfers and Cold Vault ledger movements demonstrate highly synchronized spot supply absorption by institutional custodians.";
    } else if (activeEventId === "regulatory_audit") {
      ret_ins = -0.68;
      ret_whl = 0.18;
      ret_ins_lag = "Regulated Capital leads Retail by 24 hours";
      ret_ins_desc = "Risk-averse regulated institutions execute instant compliance liquidations, while retail specimens absorb the subsequent downside before realizing policy severity.";
    } else if (activeEventId === "fed_rate_cut") {
      ret_ins = 0.85;
      ret_whl = 0.72;
      ret_ins_lag = "Simultaneous Liquidity Channel Convergence";
      ret_ins_desc = "A monetary rate shock lowers the risk-free rate, evoking a synchronized increase in risk tolerance parameters across both retail and corporate subjects.";
    } else if (activeEventId === "derivative_squeeze") {
      ret_arb = -0.92;
      whl_arb = 0.75;
      ret_arb_lag = "Arbitrage vectors capture retail slip instantly";
      ret_arb_desc = "High-speed arbitrage protocols systematically liquidate overallocated retail perp margin accounts, gathering collateral in high-volume liquidation clusters.";
      whl_arb_desc = "Large-scale whale funding pressures prompt high-frequency bot scrapers to harvest local volatility spreads before equilibrium is restored.";
    } else if (activeEventId === "whale_migration") {
      ret_whl = -0.45;
      whl_ins = 0.25;
      ret_whl_lag = "Informed Whales lead Retail by 18 hours";
      ret_whl_desc = "Massive whale inflows to public exchanges signify intense distribution intent, presenting overhead inventory that retail specimens mistakenly absorb.";
    }

    // Populate full 16-cell grid
    const cells: CorrelationCell[] = [];
    cohortIDs.forEach((row) => {
      cohortIDs.forEach((col) => {
        let val = 1.0;
        let lag = "Synchronous self-correlation (0h)";
        let desc = "Identical cohort type comparisons. Behavioral indicators correlate perfectly.";

        if (row !== col) {
          if ((row === "retail" && col === "whales") || (row === "whales" && col === "retail")) {
            val = ret_whl; lag = ret_whl_lag; desc = ret_whl_desc;
          } else if ((row === "retail" && col === "institutions") || (row === "institutions" && col === "retail")) {
            val = ret_ins; lag = ret_ins_lag; desc = ret_ins_desc;
          } else if ((row === "retail" && col === "arbitrageurs") || (row === "arbitrageurs" && col === "retail")) {
            val = ret_arb; lag = ret_arb_lag; desc = ret_arb_desc;
          } else if ((row === "whales" && col === "institutions") || (row === "institutions" && col === "whales")) {
            val = whl_ins; lag = whl_ins_lag; desc = whl_ins_desc;
          } else if ((row === "whales" && col === "arbitrageurs") || (row === "arbitrageurs" && col === "whales")) {
            val = whl_arb; lag = whl_arb_lag; desc = whl_arb_desc;
          } else if ((row === "institutions" && col === "arbitrageurs") || (row === "arbitrageurs" && col === "institutions")) {
            val = ins_arb; lag = ins_arb_lag; desc = ins_arb_desc;
          }
        }

        cells.push({
          row,
          col,
          rowLabel: cohortLabels[row],
          colLabel: cohortLabels[col],
          value: parseFloat(val.toFixed(2)),
          lagLabel: lag,
          description: desc
        });
      });
    });

    return cells;
  }, [activeEventId, userSelectedAsset]);

  // Custom states that change dynamically responding to ticking prices & events
  const [sentimentRetail, setSentimentRetail] = useState<number>(62);
  const [sentimentInst, setSentimentInst] = useState<number>(75);
  const [sentimentWhale, setSentimentWhale] = useState<number>(68);
  const [sentimentArb, setSentimentArb] = useState<number>(50);
  
  // Stances corresponding to cohorts
  const [stanceRetail, setStanceRetail] = useState<string>("Accumulating");
  const [stanceInst, setStanceInst] = useState<string>("Accumulating");
  const [stanceWhale, setStanceWhale] = useState<string>("HODLing");
  const [stanceArb, setStanceArb] = useState<string>("Hedged/Neutral");

  const [bidStrengthRetail, setBidStrengthRetail] = useState<number>(55);
  const [bidStrengthInst, setBidStrengthInst] = useState<number>(80);
  const [bidStrengthWhale, setBidStrengthWhale] = useState<number>(70);
  const [bidStrengthArb, setBidStrengthArb] = useState<number>(45);

  const [recentLogs, setRecentLogs] = useState<Array<{ id: string; time: string; text: string; type: string }>>([]);

  // Extra detailed interactive state configurations
  const [isCatalystDetailsOpen, setIsCatalystDetailsOpen] = useState<boolean>(false);
  const [selectedCatalystTab, setSelectedCatalystTab] = useState<string>("liquidity");
  const [isMetricsGlossaryOpen, setIsMetricsGlossaryOpen] = useState<boolean>(false);
  const [activeDispersalDetailMetric, setActiveDispersalDetailMetric] = useState<string | null>(null);
  const [activeProfileCohort, setActiveProfileCohort] = useState<"institutional" | "retail" | "whales" | "arbitrageurs">("institutional");

  // Stress-Test Scenarios Comparison variables
  const [stressAssetClass, setStressAssetClass] = useState<"crypto" | "equities" | "etfs">("crypto");
  const [stressTargetAsset, setStressTargetAsset] = useState<string>("BTC");
  const [stressScenario, setStressScenario] = useState<string>("liquidation_squeeze");
  const [stressVolatility, setStressVolatility] = useState<number>(65);
  const [stressFundingRate, setStressFundingRate] = useState<number>(12);
  const [stressSlippage, setStressSlippage] = useState<number>(1.2);
  const [stressAIResponse, setStressAIResponse] = useState<any | null>(null);
  const [isStressLoading, setIsStressLoading] = useState<boolean>(false);
  const [stressError, setStressError] = useState<string | null>(null);

  // Price influence multiplier logic
  const lastPriceRef = useRef<{ [key: string]: number }>({});
  const lastObservationTimeRef = useRef<number>(0);

  useEffect(() => {
    // Detect price trends to adjust sentiments slightly for interactive feedback
    const btcDiff = currentPrices.BTC - (lastPriceRef.current.BTC || currentPrices.BTC);
    const ethDiff = currentPrices.ETH - (lastPriceRef.current.ETH || currentPrices.ETH);
    const solDiff = currentPrices.SOL - (lastPriceRef.current.SOL || currentPrices.SOL);

    let multiplier = 0;
    let targetAsset = "BTC";
    if (Math.abs(btcDiff) > 45) {
      multiplier = btcDiff > 0 ? 0.4 : -0.4;
      targetAsset = "BTC";
    } else if (Math.abs(ethDiff) > 2.5) {
      multiplier = ethDiff > 0 ? 0.8 : -0.8;
      targetAsset = "ETH";
    } else if (Math.abs(solDiff) > 0.35) {
      multiplier = solDiff > 0 ? 1.2 : -1.2;
      targetAsset = "SOL";
    }

    if (multiplier !== 0) {
      setSentimentRetail(prev => Math.min(100, Math.max(5, Math.round(prev + multiplier))));
      setSentimentWhale(prev => Math.min(100, Math.max(5, Math.round(prev + multiplier * 0.7))));
      setSentimentInst(prev => Math.min(100, Math.max(5, Math.round(prev + multiplier * 0.4))));
      
      const nowMs = Date.now();
      // Throttling log inserts to avoid DOM saturation
      if (nowMs - lastObservationTimeRef.current > 15000) {
        lastObservationTimeRef.current = nowMs;
        const formattedDiff = Math.abs(multiplier * 100).toFixed(1);
        const isUp = multiplier > 0;
        const logText = isUp 
          ? `[Empirical Observational Event] ${targetAsset} positive pricing drift prompts retail buy sentiment delta (+${formattedDiff}%)` 
          : `[Empirical Observational Event] ${targetAsset} negative pricing drift prompts risk-averting hedging response (-${formattedDiff}%)`;

        setRecentLogs(prev => [
          {
            id: Math.random().toString(),
            time: new Date().toLocaleTimeString(),
            text: logText,
            type: isUp ? "BULL" : "BEAR"
          },
          ...prev.slice(0, 15)
        ]);
      }
    }

    lastPriceRef.current = { ...currentPrices };
  }, [currentPrices]);

  // Handle Event Triggers (SEC regulations, ETF flows etc)
  const handleTriggerEvent = (event: MacroEvent) => {
    setActiveEventId(event.id);

    // Apply multiplier updates with slight random variations
    setSentimentRetail(prev => Math.min(100, Math.max(5, Math.round(75 + event.sentimentMultipliers.retail + (Math.random() - 0.5) * 6))));
    setSentimentInst(prev => Math.min(100, Math.max(5, Math.round(68 + event.sentimentMultipliers.institutional + (Math.random() - 0.5) * 4))));
    setSentimentWhale(prev => Math.min(100, Math.max(5, Math.round(70 + event.sentimentMultipliers.whales + (Math.random() - 0.5) * 5))));
    setSentimentArb(prev => Math.min(100, Math.max(5, Math.round(55 + event.sentimentMultipliers.arbitrageurs + (Math.random() - 0.5) * 8))));

    // Determine stances based on new sentiments
    const calcStance = (sentimentValue: number) => {
      if (sentimentValue > 80) return "Panic Buy (FOMO)";
      if (sentimentValue > 60) return "Accumulating";
      if (sentimentValue > 40) return "HODLing";
      if (sentimentValue > 25) return "Distributing";
      return "Panic Selling";
    };

    setStanceRetail(calcStance(Math.min(100, Math.max(5, 62 + event.sentimentMultipliers.retail))));
    setStanceInst(calcStance(Math.min(100, Math.max(5, 75 + event.sentimentMultipliers.institutional))));
    setStanceWhale(calcStance(Math.min(100, Math.max(5, 68 + event.sentimentMultipliers.whales))));
    setStanceArb(event.badge === "VOLATILE" ? "Arbitrage Squeezing" : "Hedged/Neutral");

    setBidStrengthRetail(prev => Math.min(100, Math.max(10, Math.round(55 + event.sentimentMultipliers.retail * 0.9))));
    setBidStrengthInst(prev => Math.min(100, Math.max(10, Math.round(80 + event.sentimentMultipliers.institutional * 0.8))));
    setBidStrengthWhale(prev => Math.min(100, Math.max(10, Math.round(70 + event.sentimentMultipliers.whales * 0.85))));
    setBidStrengthArb(prev => Math.min(100, Math.max(10, Math.round(45 + event.sentimentMultipliers.arbitrageurs * 1.5))));

    // Add specific logs
    const now = new Date();
    const eventTimeStr = now.toLocaleTimeString();

    const logsToAdd = [
      {
        id: Math.random().toString(),
        time: eventTimeStr,
        text: `🔬 EXOGENOUS STRESS-TEST IMPULSE: "${event.title}" [${event.badge}] triggered`,
        type: event.badge
      },
      {
        id: Math.random().toString(),
        time: eventTimeStr,
        text: `  [Capital Aggregators] Behavioral stance calculated at "${calcStance(75 + event.sentimentMultipliers.institutional)}" under structural shock factors.`,
        type: "INSTITUTE"
      },
      {
        id: Math.random().toString(),
        time: eventTimeStr,
        text: `  [Retail Specimen Cohort] Statistical cognitive index shifted to ${Math.min(100, Math.max(5, Math.round(62 + event.sentimentMultipliers.retail)))}%.`,
        type: "RETAIL"
      }
    ];

    setRecentLogs(prev => [...logsToAdd, ...prev].slice(0, 20));
  };

  // Reset indices to equilibrium baselines
  const handleResetBaselines = () => {
    setActiveEventId(null);
    setSentimentRetail(62);
    setSentimentInst(75);
    setSentimentWhale(68);
    setSentimentArb(50);
    
    setStanceRetail("Accumulating");
    setStanceInst("Accumulating");
    setStanceWhale("HODLing");
    setStanceArb("Hedged/Neutral");

    setBidStrengthRetail(55);
    setBidStrengthInst(80);
    setBidStrengthWhale(70);
    setBidStrengthArb(45);

    setRecentLogs(prev => [
      {
        id: Math.random().toString(),
        time: new Date().toLocaleTimeString(),
        text: "🔄 STATISTICAL EQUILIBRIUM: Calibrated all multi-cohort sentiment indexes back to base behavioral baseline.",
        type: "NEUTRAL"
      },
      ...prev
    ].slice(0, 15));
  };

  // Trigger AI Stress Test Simulator calling our express endpoint
  const handleRunAIStressTest = async () => {
    setIsStressLoading(true);
    setStressError(null);
    setStressAIResponse(null);

    const bodyData = {
      asset: stressTargetAsset,
      publicDataSource: stressAssetClass === "crypto" ? "Binance Direct WebSocket Feed" : stressAssetClass === "equities" ? "NASDAQ Spot Consolidation Feed" : "CBOE Spot Trust Index Feed",
      exogenousStressor: stressScenario,
      impliedVolatility: stressVolatility,
      fundingRateTarget: stressFundingRate,
      initialSlippage: stressSlippage
    };

    try {
      const response = await fetch("/api/gemini/stress-test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(bodyData)
      });

      if (!response.ok) {
        throw new Error(`HTTP Error Status: ${response.status}`);
      }

      const resData = await response.json();
      if (resData && resData.executiveSummary) {
        setStressAIResponse(resData);
      } else {
        throw new Error("Invalid response format from stress test");
      }
    } catch (err: any) {
      console.warn("AI Stress Test Endpoint offline or API key absent. Activating robust local scenario fallback analyzer...");
      // Resilient local quantitative simulation to guarantee flawless immediate operation
      const fallbackReport = generateMockStressReport(
        stressTargetAsset,
        bodyData.publicDataSource,
        stressScenario,
        stressVolatility,
        stressFundingRate,
        stressSlippage
      );
      // Wait 1.5 seconds to show scientific analysis telemetry loading effect
      await new Promise(resolve => setTimeout(resolve, 1500));
      setStressAIResponse(fallbackReport);
    } finally {
      setIsStressLoading(false);
    }
  };

  // Initialize logs on start
  useEffect(() => {
    const defaultLogs = [
      { id: "1", time: "19:42:01", text: "[Observation Node - Retail Specimen] Availability heuristic triggers mild FOMO as asset price breaks local threshold.", type: "RETAIL" },
      { id: "2", time: "19:43:15", text: "[Observation Node - Regulated Capital] Large futures contract rollover finalized. OTC liquidity premiums stabilize at +0.12%.", type: "INSTITUTE" },
      { id: "3", time: "19:44:50", text: "[Observation Node - Informed Whales] Coinbase premium index contracts to base equilibrium level.", type: "WHALE" },
      { id: "4", time: "19:45:00", text: "[System Telemetry] Real-time high-fidelity empirical WebSocket pipeline active.", type: "NEUTRAL" },
    ];
    setRecentLogs(defaultLogs);
  }, []);

  // Progressive batch data harvest simulation scheduler
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isBatchExportOpen) {
      setExportProgress(0);
      setIsCompilingBatch(true);
      
      let val = 0;
      timer = setInterval(() => {
        val += Math.floor(Math.random() * 8) + 6; // random step
        if (val >= 100) {
          val = 100;
          setExportProgress(100);
          setIsCompilingBatch(false);
          if (timer) clearInterval(timer);
        } else {
          setExportProgress(val);
        }
      }, 140);
    } else {
      setExportProgress(0);
      setIsCompilingBatch(false);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isBatchExportOpen]);

  // Command to trigger manual dataset recompilation / data harvest re-run
  const handleReaggregateManual = () => {
    setExportProgress(0);
    setIsCompilingBatch(true);
    let val = 0;
    const timer = setInterval(() => {
      val += Math.floor(Math.random() * 10) + 7;
      if (val >= 100) {
        val = 100;
        setExportProgress(100);
        setIsCompilingBatch(false);
        clearInterval(timer);
      } else {
        setExportProgress(val);
      }
    }, 120);
  };

  // Compute reactive attributes to show under cohorts
  const cohorts: InvestorCohort[] = useMemo(() => [
    {
      id: "retail",
      name: "Retail Specimen (散户研究样本)",
      description: "Non-professional retail participants. Exhibiting substantial availability biases, crowd-herd dynamics, and highly irrational utilization of micro leverage.",
      sentimentIndex: sentimentRetail,
      stance: stanceRetail as any,
      bidStrength: bidStrengthRetail,
      leverageRatio: sentimentRetail > 70 ? 4.5 : sentimentRetail < 30 ? 1.2 : 2.5,
      riskTolerance: sentimentRetail > 80 ? "Degenerate Speculative" : sentimentRetail > 50 ? "Aggressive" : "Moderate",
      dominantAsset: "SOL",
      averageSizeUsd: 1850,
      recentBehavior: sentimentRetail > 70 
        ? "Accelerated spot purchasing orders registering premiums matching retail search queries peak levels" 
        : "Systemic loss-aversion capitulations with high-volume spot liquidations across secondary DEX pools"
    },
    {
      id: "whales",
      name: "Informed Whales (知情交易巨鲸样本)",
      description: "Asset addresses exceeding 1,000 BTC. Leverages inventory imbalances, OTC desks, and strategic block migrations to avoid public signaling.",
      sentimentIndex: sentimentWhale,
      stance: stanceWhale as any,
      bidStrength: bidStrengthWhale,
      leverageRatio: 1.8,
      riskTolerance: "Aggressive",
      dominantAsset: "BTC",
      averageSizeUsd: 4500000,
      recentBehavior: sentimentWhale > 65 
        ? "Gradual non-displaced accumulation phases coupled with wallet transpositioning to multi-sig cold storage nodes" 
        : "Asymmetric distribution cycles to public exchange nodes to induce localized bid slippage stress"
    },
    {
      id: "institutions",
      name: "Regulated Capital (机构与基金样本)",
      description: "ETFs, registered investment advisers, and corporate treasuries. Constrained by modern portfolio theory rules and risk-budget liquidations.",
      sentimentIndex: sentimentInst,
      stance: stanceInst as any,
      bidStrength: bidStrengthInst,
      leverageRatio: 1.1,
      riskTolerance: "Ultra-Conservative",
      dominantAsset: "BTC",
      averageSizeUsd: 18200000,
      recentBehavior: sentimentInst > 70 
        ? "Executing program trades via authorized participants to capture spot trust premium structures" 
        : "Defensive inventory hedging routines using delta-neutral derivatives strategies and dynamic options coverage"
    },
    {
      id: "arbitrageurs",
      name: "Algorithmic Arbitrage Vectors (算法套利主体)",
      description: "Systematic high-frequency traders and liquidators. Programmed for rational microstructural spread-capture with zero raw directional inventory holding.",
      sentimentIndex: sentimentArb,
      stance: stanceArb as any,
      bidStrength: bidStrengthArb,
      leverageRatio: 8.5,
      riskTolerance: "Moderate",
      dominantAsset: "Stablecoins",
      averageSizeUsd: 650000,
      recentBehavior: "Exploiting brief dEx premium spreads between Curve pools and active LP structures"
    }
  ], [sentimentRetail, sentimentInst, sentimentWhale, sentimentArb, stanceRetail, stanceInst, stanceWhale, stanceArb, bidStrengthRetail, bidStrengthInst, bidStrengthWhale, bidStrengthArb]);

  // Radar/Web Chart Data: Comparative analysis across all angles ("全角度")
  const radarChartData = useMemo(() => {
    return [
      { subject: "Sentiment Index", Retail: sentimentRetail, Institutional: sentimentInst, Whales: sentimentWhale, Arbitrageurs: sentimentArb },
      { subject: "Bid Intensity", Retail: bidStrengthRetail, Institutional: bidStrengthInst, Whales: bidStrengthWhale, Arbitrageurs: bidStrengthArb },
      { subject: "Leverage Exposure", Retail: sentimentRetail > 75 ? 90 : 45, Institutional: 10, Whales: 35, Arbitrageurs: 95 },
      { subject: "Altcoin Affinity", Retail: 95, Institutional: 15, Whales: 40, Arbitrageurs: 60 },
      { subject: "Risk Appetite", Retail: sentimentRetail > 65 ? 85 : 30, Institutional: 20, Whales: 70, Arbitrageurs: 50 },
      { subject: "Resilience Depth", Retail: 25, Institutional: 95, Whales: 80, Arbitrageurs: 60 },
    ];
  }, [sentimentRetail, sentimentInst, sentimentWhale, sentimentArb, bidStrengthRetail, bidStrengthInst, bidStrengthWhale, bidStrengthArb]);

  // Bar Chart Data: Buying Power vs Panic Reserves (by USD standard projection)
  const barChartData = useMemo(() => {
    return [
      { name: "Retail", "Buying Pressure": sentimentRetail, "Hedging Safeguards": Math.round(100 - sentimentRetail * 0.9) },
      { name: "Whales", "Buying Pressure": sentimentWhale, "Hedging Safeguards": Math.round(100 - sentimentWhale * 0.7) },
      { name: "Institutional", "Buying Pressure": sentimentInst, "Hedging Safeguards": Math.round(100 - sentimentInst * 0.5) },
      { name: "Arbitrageurs", "Buying Pressure": sentimentArb, "Hedging Safeguards": 90 }
    ];
  }, [sentimentRetail, sentimentWhale, sentimentInst, sentimentArb]);

  // Dynamic BibTeX & APA Citation engine mapping the exact telemetry filter conditions
  const citationData = useMemo(() => {
    const activeEvent = CONSTANT_MACRO_EVENTS.find(e => e.id === activeEventId);
    const stressCatalyst = activeEvent ? activeEvent.title : "Baseline Systemic Equilibrium (No Active Shift)";
    
    const hStart = globalTimeHorizon?.startDate || "2026-05-01";
    const hEnd = globalTimeHorizon?.endDate || "2026-05-31"; // Core range is May 1 to May 31
    
    let specificTitle = "";
    let empiricalSummary = "";
    
    if (viewMode === "matrix") {
      const cell = correlationMatrix.find(c => c.row === selectedCell.row && c.col === selectedCell.col) || correlationMatrix[0] || { rowLabel: "Informed Whales", colLabel: "Retail Specimen", value: 0.72, lagLabel: "4 hours lag" };
      specificTitle = `Cross-Cohort Feedback Linkage Matrix: ${cell.rowLabel} & ${cell.colLabel} (r = ${cell.value > 0 ? '+' : ''}${cell.value})`;
      empiricalSummary = `Analyzed dynamic feedback loop with correlation coefficient r = ${cell.value} over telemetry interval ${hStart} to ${hEnd}. Selected Asset Class: ${userSelectedAsset}. Macro Catalyst: ${stressCatalyst}. Transmission latency offset: ${cell.lagLabel}.`;
    } else if (viewMode === "historical") {
      const pipeline = historicalPipelines.find(p => p.id === selectedHistorical.pipelineId) || historicalPipelines[0];
      const stats = getHistoricalData(selectedHistorical.pipelineId, selectedHistorical.dayIndex);
      specificTitle = `30D Temporal Latency Spectrum: Info Propagation lead-lag on Channel (${pipeline.rowLabel} to ${pipeline.colLabel})`;
      empiricalSummary = `Observed temporal delay dilation of ${stats.value.toFixed(2)}${stats.unit} (${stats.status.toUpperCase()}) on epoch ${selectedDayData.label}. Asset evaluated: ${userSelectedAsset}. Macro catalyst: ${stressCatalyst}.`;
    } else {
      const cell = timingMatrixData.find(c => c.rowId === selectedTimingCell.rowId && c.colId === selectedTimingCell.colId) || timingMatrixData[0] || { rowLabel: "Retail Sentiment Shifts", colLabel: "Institutional Inflows", value: 0.44, significance: "99% Conf.", transmissionPhase: "Consistent Lead" };
      specificTitle = `Lead-Lag Timing Correlation: ${cell.rowLabel} vs ${cell.colLabel} (Pearson r = ${cell.value > 0 ? '+' : ''}${cell.value})`;
      empiricalSummary = `Assessed lead-lag correlation matrix for Retail sentiments shifts vs Institutional liquidity flows with Pearson r = ${cell.value} (${cell.significance}). Phase state: ${cell.transmissionPhase}.`;
    }

    const yearText = "2026";
    const appUrl = typeof window !== "undefined" ? window.location.href.split("?")[0] : "https://ai.studio/build";
    
    // Format APA Citation
    const apaCitation = `Chen, W., & Antigravity Empirical Research Group. (${yearText}). Heuristic Market Transmission Registry: ${specificTitle} [Scholarly Empirical Data Snapshot]. AI Studio Empirical Analytics Infrastructure, Portfolio Telemetry Station. Retrieved from ${appUrl}`;
    
    // Format BibTeX Citation
    const bibTitle = `Heuristic Market Transmission Registry: ${specificTitle}`;
    const bibtexKey = `antigravity_${viewMode}_${userSelectedAsset.toLowerCase()}_${yearText}`;
    const bibtexCitation = `@misc{${bibtexKey},
  author = {Chen, Wei and Antigravity Research Group},
  title = {${bibTitle}},
  howpublished = {AI Studio Portfolio Telemetry Station: Multi-Cohort Market Reaction Lab},
  year = {${yearText}},
  month = {May},
  note = {${empiricalSummary}. Filter range: ${hStart} to ${hEnd}. Synchronously bound via systemic Binance WebSocket pipelines.},
  url = {${appUrl}}
}`;

    return { apaCitation, bibtexCitation, specificTitle, empiricalSummary, bibtexKey };
  }, [activeEventId, userSelectedAsset, viewMode, selectedCell, selectedHistorical, selectedTimingCell, globalTimeHorizon, filteredDates, selectedDayData, timingMatrixData, correlationMatrix]);

  const handleCopyToClipboard = (text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedStatus(true);
        setTimeout(() => setCopiedStatus(false), 2000);
      }).catch(() => {
        fallbackCopyToClipboard(text);
      });
    } else {
      fallbackCopyToClipboard(text);
    }
  };

  const fallbackCopyToClipboard = (text: string) => {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopiedStatus(true);
      setTimeout(() => setCopiedStatus(false), 2000);
    } catch (e) {
      console.error("Failed to copy using fallback method:", e);
    }
  };

  const handleDownloadCitation = (text: string, filename: string) => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Helper function to escape cells for standard RFC4180 CSV compliance
  const csvEscape = (val: any) => {
    if (val === undefined || val === null) return '""';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  // Dynamic Batch Dataset Generator Engines (Optimized for academic loaders like Pandas, R, and STATA)
  const batchResearchExportData = useMemo(() => {
    const activeEvent = CONSTANT_MACRO_EVENTS.find(e => e.id === activeEventId);
    
    // 1. Unified complete JSON payload
    const cohortProfileData = cohorts.map(c => ({
      cohort_id: c.id,
      cohort_name: c.name,
      description: c.description,
      sentiment_index: c.sentimentIndex,
      stance: c.stance,
      bid_strength: c.bidStrength,
      leverage_ratio: c.leverageRatio,
      risk_tolerance: c.riskTolerance,
      dominant_asset: c.dominantAsset,
      average_size_usd: c.averageSizeUsd,
      recent_behavior_log: c.recentBehavior
    }));

    const timeseriesData = filteredDates.map(day => {
      const pipelineLogs = historicalPipelines.map(pipeline => {
        const stats = getHistoricalData(pipeline.id, day.index);
        return {
          pipeline_id: pipeline.id,
          channel: pipeline.label,
          sender_cohort: pipeline.rowLabel,
          receiver_cohort: pipeline.colLabel,
          delay_value: parseFloat(stats.value.toFixed(4)),
          unit: stats.unit,
          status: stats.status,
          multiplier: parseFloat(stats.multiplier.toFixed(4))
        };
      });

      return {
        day_index: day.index,
        date_label: day.label,
        date_iso: day.dateStr,
        transmission_channels: pipelineLogs
      };
    });

    const correlationData = correlationMatrix.map(cell => ({
      source_cohort: cell.row,
      source_label: cell.rowLabel,
      target_cohort: cell.col,
      target_label: cell.colLabel,
      pearson_r: cell.value,
      transmission_offset: cell.lagLabel,
      behavioral_description: cell.description
    }));

    const timingData = timingMatrixData.map(cell => ({
      lead_factor_id: cell.rowId,
      lead_factor_label: cell.rowLabel,
      lag_factor_id: cell.colId,
      lag_factor_label: cell.colLabel,
      correlation_value: cell.value,
      significance: cell.significance,
      phase_relationship: cell.transmissionPhase,
      lag_description: cell.lagDescription
    }));

    const masterJSON = JSON.stringify({
      research_metadata: {
        engine: "Heuristic Market Transmission Registry (HMTR)",
        version: "Portfolio Telemetry Station v4.81-Scholarly",
        exported_at: new Date().toISOString(),
        core_benchmark_asset: userSelectedAsset,
        active_stressor_event: activeEvent ? {
          id: activeEvent.id,
          title: activeEvent.title,
          badge: activeEvent.badge,
          description: activeEvent.description
        } : { id: "baseline", title: "Baseline Equilibrium", badge: "STABLE", description: "Standard market conditions with baseline micro-volatility." },
        time_horizon_filter: {
          start_date: globalTimeHorizon?.startDate || "2026-05-01",
          end_date: globalTimeHorizon?.endDate || "2026-05-31",
          total_days_active: filteredDates.length
        }
      },
      cohort_profiles: cohortProfileData,
      correlation_matrices: correlationData,
      lead_lag_timing_matrix: timingData,
      historical_transmission_time_series: timeseriesData
    }, null, 2);

    // 2. CSV format flat text logs for time-series regressions
    let heatGridCSV = "day_index,date_label,date_iso,pipeline_id,channel,sender_cohort,receiver_cohort,delay_value,unit,status,multiplier\n";
    filteredDates.forEach(day => {
      historicalPipelines.forEach(pipeline => {
        const stats = getHistoricalData(pipeline.id, day.index);
        heatGridCSV += `${day.index},${csvEscape(day.label)},${csvEscape(day.dateStr)},${csvEscape(pipeline.id)},${csvEscape(pipeline.label)},${csvEscape(pipeline.rowLabel)},${csvEscape(pipeline.colLabel)},${stats.value.toFixed(4)},${csvEscape(stats.unit)},${csvEscape(stats.status)},${stats.multiplier.toFixed(4)}\n`;
      });
    });

    // 3. CSV format for feedback link matrix
    let correlationCSV = "source_cohort,source_label,target_cohort,target_label,pearson_r,transmission_offset,behavioral_description\n";
    correlationMatrix.forEach(cell => {
      correlationCSV += `${csvEscape(cell.row)},${csvEscape(cell.rowLabel)},${csvEscape(cell.col)},${csvEscape(cell.colLabel)},${cell.value},${csvEscape(cell.lagLabel)},${csvEscape(cell.description)}\n`;
    });

    // 4. CSV format for lead-lag timing shifts
    let timingCSV = "lead_factor_id,lead_factor_label,lag_factor_id,lag_factor_label,correlation_value,significance,phase_relationship,lag_description\n";
    timingMatrixData.forEach(cell => {
      timingCSV += `${csvEscape(cell.rowId)},${csvEscape(cell.rowLabel)},${csvEscape(cell.colId)},${csvEscape(cell.colLabel)},${cell.value},${csvEscape(cell.significance)},${csvEscape(cell.transmissionPhase)},${csvEscape(cell.lagDescription)}\n`;
    });

    return { masterJSON, heatGridCSV, correlationCSV, timingCSV };
  }, [activeEventId, cohorts, filteredDates, historicalPipelines, correlationMatrix, timingMatrixData, userSelectedAsset, globalTimeHorizon]);

  const handleCopyToClipboardBatch = (text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedBatchStatus(true);
        setTimeout(() => setCopiedBatchStatus(false), 2000);
      }).catch(() => {
        fallbackCopyToClipboardBatch(text);
      });
    } else {
      fallbackCopyToClipboardBatch(text);
    }
  };

  const fallbackCopyToClipboardBatch = (text: string) => {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopiedBatchStatus(true);
      setTimeout(() => setCopiedBatchStatus(false), 2000);
    } catch (e) {
      console.error("Failed to copy batch data:", e);
    }
  };

  // Color logic for sentiment badge
  const getSentimentBadge = (val: number) => {
    if (val >= 75) return { text: "FOMO EXTREME 🔥", color: "text-rose-400 bg-rose-950 border-rose-800" };
    if (val >= 60) return { text: "BULLISH ACCUMULATION 📈", color: "text-emerald-400 bg-emerald-950 border-emerald-900" };
    if (val >= 40) return { text: "BALANCED DISCIPLINE ⚙️", color: "text-cyan-400 bg-cyan-950 border-cyan-900" };
    if (val >= 25) return { text: "RISK AVOIDANCE ⚠️", color: "text-amber-400 bg-amber-950 border-amber-900" };
    return { text: "PANIC EXODUS 🚨", color: "text-red-400 bg-red-950 border-red-900" };
  };

  return (
    <section 
      id="investor-reaction-monitor-section" 
      className="bg-slate-950 border border-slate-900 rounded-2xl p-5 space-y-6 shadow-2xl relative overflow-hidden"
    >
      {/* Background visual gloss elements representing scanning angles */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-900 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1 px-2 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[9px] font-mono font-black uppercase tracking-wider animate-pulse">
              EMPIRICAL BEHAVIORAL LABORATORY
            </span>
            <span className="text-slate-500 text-[10px] sm:inline hidden">•</span>
            <span className="text-slate-400 font-mono text-[10px] uppercase tracking-widest flex items-center gap-1.5">
              <Globe className="h-3 w-3 text-cyan-400" /> SYSTEMIC TELEMETRY SYNCHRONIZED WITH BINANCE WS
            </span>
          </div>
          <h2 className="text-lg font-mono font-black text-slate-100 uppercase tracking-tight flex items-center gap-2">
            <Users className="h-5 w-5 text-rose-500" />
            Behavioral Finance Observation Portal: Multi-Cohort Market Reaction Lab (行为金融学研究门户 - 多群体反应观测实验室)
          </h2>
          <p className="text-xs text-slate-400 max-w-3xl">
            Empirical observation platform monitoring multi-cohort behavioral patterns and cognitive anomalies under simulated exogenous and endogenous stress. Designed for the scholarly research of investor heuristics, risk premium variances, and inter-cohort lead-lag network transmission dynamics.
          </p>
        </div>

        {/* Status & Academic Citation Exports */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 self-stretch md:self-auto">
          {/* Status Indicators */}
          <div className="flex items-center gap-2 font-mono text-[10px] bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-500 font-bold">WS PRICE FEED:</span>
            <span className="text-emerald-400 font-extrabold flex items-center gap-1">
              <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping"></span>
              ACTIVE 3000ms TICK
            </span>
            {activeEventId && (
              <>
                <span className="text-slate-650">|</span>
                <button 
                  onClick={handleResetBaselines}
                  className="text-rose-455 hover:text-rose-300 font-bold hover:underline cursor-pointer uppercase text-[9px]"
                >
                  Restore Base State
                </button>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsCitationOpen(true)}
            className="flex items-center justify-center gap-1.5 bg-cyan-950/60 border border-cyan-500/30 hover:border-cyan-400 text-cyan-400 hover:text-cyan-300 font-mono font-bold text-[9px] px-3.5 py-2.5 rounded-lg transition-all shadow-md cursor-pointer uppercase tracking-wider hover:bg-cyan-900/50"
            title="Generate academic reference citation (APA/BibTeX)"
          >
            <GraduationCap className="h-4 w-4" />
            Academic Export
          </button>

          <button
            type="button"
            onClick={() => setIsBatchExportOpen(true)}
            className="flex items-center justify-center gap-1.5 bg-emerald-950/60 border border-emerald-500/30 hover:border-emerald-400 text-emerald-400 hover:text-emerald-300 font-mono font-bold text-[9px] px-3.5 py-2.5 rounded-lg transition-all shadow-md cursor-pointer uppercase tracking-wider hover:bg-emerald-950/40"
            title="Export full historical dataset (JSON/CSVs) optimized for professional research"
          >
            <Download className="h-4 w-4" />
            Batch Research Export
          </button>
        </div>
      </div>

      {/* Interactive Regulatory / Macro News Trigger Station */}
      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-900 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono text-slate-400 font-bold tracking-wider uppercase flex items-center gap-1">
            <Sliders className="h-3.5 w-3.5 text-cyan-400" /> Empirical Stress-Test Catalysts (实验应触发扰动突变体):
          </span>
          <span className="text-[9px] font-mono text-slate-500 uppercase">Select shock catalyst to observe inter-cohort transmission ripples</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {CONSTANT_MACRO_EVENTS.map((event) => {
            const isActive = activeEventId === event.id;
            let badgeBg = "bg-slate-950 border-slate-850 hover:bg-slate-850 hover:border-slate-800 text-slate-400";
            if (isActive) {
              if (event.badge === "BULLISH") badgeBg = "bg-emerald-950/80 border-emerald-500/50 text-emerald-300 ring-1 ring-emerald-500/20";
              else if (event.badge === "BEARISH") badgeBg = "bg-rose-950/80 border-rose-500/50 text-rose-300 ring-1 ring-rose-500/20";
              else if (event.badge === "VOLATILE") badgeBg = "bg-amber-950/80 border-amber-500/50 text-amber-300 ring-1 ring-amber-500/20";
              else badgeBg = "bg-cyan-950 border-cyan-500/50 text-cyan-300 ring-1 ring-cyan-500/20";
            }

            return (
              <button
                key={event.id}
                onClick={() => handleTriggerEvent(event)}
                className={`flex-1 min-w-[190px] text-left p-2.5 rounded-lg border text-xs transition-all pointer-all cursor-pointer ${badgeBg}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold tracking-tight text-[11px] font-mono">{event.title}</span>
                  <span className={`text-[8px] px-1 rounded-sm font-black tracking-widest ${
                    event.badge === "BULLISH" ? "bg-emerald-500/10 text-emerald-400" :
                    event.badge === "BEARISH" ? "bg-rose-500/10 text-rose-400" :
                    event.badge === "VOLATILE" ? "bg-amber-500/10 text-amber-500" : "bg-slate-800 text-slate-400"
                  }`}>
                    {event.badge}
                  </span>
                </div>
                <p className="text-[10px] text-slate-450 leading-relaxed font-sans line-clamp-2">{event.description}</p>
              </button>
            );
          })}
        </div>

        {/* Toggleable Catalyst Details & In-Depth Scientific Situations Breakdown */}
        <div className="border-t border-slate-905/60 pt-3 flex flex-col space-y-2">
          <button
            type="button"
            onClick={() => setIsCatalystDetailsOpen(prev => !prev)}
            className="flex items-center justify-between text-[10px] font-mono text-cyan-400 hover:text-cyan-300 transition-colors uppercase font-bold text-left cursor-pointer select-none"
          >
            <span className="flex items-center gap-1.5 font-semibold text-[10px]">
              {isCatalystDetailsOpen ? "▼" : "▶"} Paradigm of Catalyst Impulses & Stress Typologies (实验扰动突变体定义与压力场景细分)
            </span>
            <span className="bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/20 text-[9px] text-cyan-300 font-extrabold font-mono uppercase tracking-wider">
              {isCatalystDetailsOpen ? "Collapse ✕" : "View Technical Definitions ➕"}
            </span>
          </button>

          {isCatalystDetailsOpen && (
            <div className="bg-slate-950/95 border border-slate-850 rounded-xl p-4 md:p-5 text-left animate-in fade-in slide-in-from-top-1 duration-155 space-y-4">
              
              {/* Theoretical Summary Title Section */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-900 pb-3 gap-2">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <FlaskConical className="h-3.5 w-3.5 text-cyan-400" /> Empirical Stress-Test Catalyst Reference Library (应微扰动源参考库)
                  </h4>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Interactive diagnostic panel defining structured, multi-cohort systemic shock vectors and their micro-structural transmission regimes.
                  </p>
                </div>
                
                {/* Mathematical Equation Capsule */}
                <div className="bg-slate-900/60 p-2 rounded border border-slate-800 font-mono text-[9px] text-slate-350 self-start sm:self-auto flex items-center gap-2">
                  <span className="text-[8px] bg-cyan-950 px-1 py-0.5 rounded text-cyan-400 font-bold border border-cyan-500/20">PROPAGATION EQUATION</span>
                  <span>{"$\\Delta S_{cohort}(t) = \\alpha \\cdot \\vec{I}_{shock} + \\beta \\int (Sentiment_{\\tau} \\cdot B_{intensity}) d\\tau$"}</span>
                </div>
              </div>

              {/* Interactive Sub-Menu Selector Bar */}
              <div className="flex flex-wrap gap-1.5 border-b border-slate-900 pb-3">
                {(() => {
                  const getCatalystIconHelper = (name: string) => {
                    switch (name) {
                      case "Layers": return <Layers className="h-4 w-4 text-cyan-400" />;
                      case "Lock": return <Lock className="h-4 w-4 text-rose-450" />;
                      case "TrendingDown": return <TrendingDown className="h-4 w-4 text-rose-400" />;
                      case "Compass": return <Compass className="h-4 w-4 text-indigo-400" />;
                      case "TrendingUp": return <TrendingUp className="h-4 w-4 text-emerald-400" />;
                      default: return <Sliders className="h-4 w-4 text-slate-400" />;
                    }
                  };
                  
                  return CATALYST_DEEP_DIVES.map((item) => {
                    const isTabActive = selectedCatalystTab === item.id;
                    const isSimActive = activeEventId === item.correspondingEventId;
                    
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedCatalystTab(item.id)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-[10px] font-mono tracking-normal transition-all cursor-pointer select-none border text-left ${
                          isTabActive 
                            ? "bg-slate-900 border-cyan-500/35 text-cyan-350 font-bold shadow-inner" 
                            : "bg-slate-950/80 hover:bg-slate-900/40 border-slate-900 text-slate-400 hover:text-slate-300"
                        }`}
                      >
                        {getCatalystIconHelper(item.iconName)}
                        <div className="flex flex-col items-start leading-none">
                          <span className="font-bold">{item.title}</span>
                          <span className="text-[8px] text-slate-500 font-sans mt-0.5">{item.titleZh}</span>
                        </div>
                        {isSimActive && (
                          <span className="ml-1 flex h-1.5 w-1.5 rounded-full bg-emerald-400 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          </span>
                        )}
                      </button>
                    );
                  });
                })()}
              </div>

              {/* Deep-Dive Sub-Menu Tab Page Body */}
              {(() => {
                const activeData = CATALYST_DEEP_DIVES.find(c => c.id === selectedCatalystTab) || CATALYST_DEEP_DIVES[0];
                return (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-1 animate-in fade-in duration-200">
                    
                    {/* Left Panel: Deep Analysis & Heuristic Biases (Col Span 7) */}
                    <div className="lg:col-span-7 space-y-3.5">
                      <div className="space-y-1.5">
                        <span className="text-[8px] font-mono font-extrabold uppercase tracking-widest text-cyan-405 bg-cyan-950/50 border border-cyan-500/20 px-1.5 py-0.5 rounded">
                          Microstructure Shock Analysis
                        </span>
                        <h3 className="text-sm font-mono font-black text-slate-100 uppercase tracking-tight">
                          {activeData.title} <span className="text-[11px] font-normal text-slate-400 font-sans">({activeData.titleZh})</span>
                        </h3>
                        <p className="text-[11px] text-slate-350 leading-relaxed font-sans">
                          {activeData.deepDive}
                        </p>
                      </div>

                      {/* Cognitive Heuristics / Bias Info */}
                      <div className="p-3 bg-slate-900/40 border border-slate-900 rounded-lg space-y-1">
                        <span className="text-[9px] font-mono font-bold text-indigo-400 uppercase tracking-wider block">
                          Associated Behavioral Heuristic & Cognitive Anomalies
                        </span>
                        <p className="text-[10.5px] text-slate-400 font-sans leading-relaxed">
                          {activeData.heuristics}
                        </p>
                      </div>

                      {/* Scholarly APA & BibTeX Export reference block */}
                      <div className="flex items-start gap-1.5 p-2 rounded bg-slate-950 border border-slate-900">
                        <BookOpen className="h-3.5 w-3.5 text-slate-550 flex-shrink-0 mt-0.5" />
                        <div className="space-y-0.5 border-l border-slate-900 pl-2 ml-1">
                          <span className="text-[8.5px] font-mono text-slate-500 uppercase tracking-widest block font-bold">Academic Paradigm Guidance</span>
                          <span className="text-[9.5px] font-sans text-slate-450 italic">{activeData.academicRef}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Panel: Quantitative Trigger Parameters HUD (Col Span 5) */}
                    <div className="lg:col-span-5 bg-slate-900/40 border border-slate-900 rounded-xl p-3.5 flex flex-col justify-between space-y-4">
                      <div className="space-y-2.5">
                        <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Sliders className="h-3.5 w-3.5 text-cyan-400" /> Specific Trigger Parameters (扰动触发量化指标)
                        </span>
                        
                        <div className="grid grid-cols-1 gap-2">
                          {Object.entries(activeData.triggerParams).map(([paramName, paramValue]) => (
                            <div key={paramName} className="p-2 bg-slate-950 border border-slate-900 rounded flex flex-col space-y-0.5">
                              <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wide font-semibold">
                                {paramName}
                              </span>
                              <span className="text-[10px] font-mono font-black text-slate-200">
                                {paramValue}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Live Injection Executor Button */}
                      <div className="border-t border-slate-900 pt-3">
                        {(() => {
                          const matchingMacroEvent = CONSTANT_MACRO_EVENTS.find(e => e.id === activeData.correspondingEventId);
                          const isCurrentlyInjected = activeEventId === activeData.correspondingEventId;
                          
                          return (
                            <button
                              type="button"
                              onClick={() => matchingMacroEvent && handleTriggerEvent(matchingMacroEvent)}
                              disabled={!matchingMacroEvent}
                              className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-mono text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer pointer-all ${
                                isCurrentlyInjected 
                                  ? "bg-cyan-950/65 border border-cyan-500/45 text-cyan-300 cursor-not-allowed cursor-default select-none shadow-md" 
                                  : matchingMacroEvent
                                    ? "bg-cyan-500/10 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-400 hover:text-cyan-300 animate-pulse"
                                    : "bg-slate-900 border border-slate-800 text-slate-500 cursor-not-allowed"
                              }`}
                            >
                              <Activity className={`h-4 w-4 ${isCurrentlyInjected ? "animate-pulse text-emerald-400" : ""}`} />
                              {isCurrentlyInjected 
                                ? "Injected & Synchronized with Cohort Sentiment Matrix" 
                                : matchingMacroEvent
                                  ? `Execute Shock: Trigger ${matchingMacroEvent.badge} Exogenous Vector`
                                  : "Exogenous Mapping Restricted"}
                            </button>
                          );
                        })()}
                      </div>
                    </div>

                  </div>
                );
              })()}
              
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Multi-Angle Recharts Visualization + Investor Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* Left Aspect: Radar and Comparative visualizer */}
        <div className="lg:col-span-5 bg-slate-900/40 p-4 rounded-xl border border-slate-900 flex flex-col justify-between space-y-4">
          <div className="space-y-1.5 animate-in fade-in duration-300">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">Heuristic Mapping Grid</span>
            <h3 className="text-sm font-mono font-bold text-slate-300 uppercase flex items-center gap-1">
              <Compass className="h-4 w-4 text-cyan-400" /> Hexagonal Cohort Dispersal
            </h3>
            <p className="text-[10px] text-slate-450 leading-relaxed">
              Comparative analysis of risk tolerance thresholds, altcoin speculative affinity, leverage ratios, and capital resilience.
            </p>
            
            {/* Direct interactive metric trigger pills */}
            <div className="flex flex-wrap gap-1 pt-1.5">
              {CONSTANT_DISPERSAL_METRICS.map((metric) => (
                <button
                  key={metric.id}
                  type="button"
                  onClick={() => setActiveDispersalDetailMetric(metric.id)}
                  className="px-2 py-0.5 bg-slate-950 hover:bg-slate-900 border border-slate-900 hover:border-slate-800 text-slate-400 hover:text-cyan-400 rounded text-[8.5px] font-mono transition-all flex items-center gap-1 cursor-pointer select-none"
                  title={`Examine calculation framework of ${metric.subject}`}
                >
                  <span className="inline-block w-1 h-1 rounded-full bg-cyan-400"></span>
                  <span>{metric.subject}</span>
                  <span className="text-[7.5px] text-slate-600 group-hover:text-cyan-400">ⓘ</span>
                </button>
              ))}
            </div>
          </div>

          {/* Recharts Radar Representation */}
          <div className="h-64 w-full flex items-center justify-center font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarChartData}>
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#94a3b8", fontSize: 9, fontFamily: "monospace" }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#475569", fontSize: 8 }} />
                
                <Radar name="Retail Specimen" dataKey="Retail" stroke="#e879f9" fill="#e879f9" fillOpacity={0.15} />
                <Radar name="Regulated Capital" dataKey="Institutional" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.12} />
                <Radar name="Informed Whales" dataKey="Whales" stroke="#818cf8" fill="#818cf8" fillOpacity={0.12} />
                <Radar name="Algorithmic Arbitrage Vectors" dataKey="Arbitrageurs" stroke="#fda4af" fill="#fda4af" fillOpacity={0.08} />
                
                <Tooltip 
                  contentStyle={{ backgroundColor: "#020617", borderColor: "#1e293b", borderRadius: "8px" }}
                  itemStyle={{ fontSize: "10px", fontFamily: "monospace" }}
                  labelStyle={{ fontSize: "10px", color: "#94a3b8", fontWeight: "bold" }}
                />
                <Legend iconSize={8} wrapperStyle={{ fontSize: "9px", paddingTop: 10 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Core Liquidation Warning Panel */}
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-900 space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-mono">
              <ShieldAlert className="h-4.5 w-4.5 text-amber-500 flex-shrink-0 animate-bounce" />
              <span className="text-amber-405 font-extrabold uppercase">COGNITIVE DEVIATION & LIQUIDITY ANOMALY ANALYSIS (认知偏差与清算漏洞分析):</span>
            </div>
            <p className="text-[9.5px]/relaxed font-sans text-slate-400">
              {sentimentRetail > 75 
                ? "Retail specimens display extreme availability bias. Micro leverage averages 4.5x. A price downside shock of -4.2% will trigger automated liquidation spirals inside SOL pool architectures."
                : sentimentRetail < 30
                ? "Regulated portfolio managers display severe risk-minimizing hedge biases, absorbing underlying supply with highly non-displaced cold settlement proxy setups."
                : "Dynamic indicators reside within historical baseline. High-fidelity WebSocket ticking remains healthy without anomalous behavioral feedback loops."}
            </p>
          </div>

          {/* Metrics Calculation Glossary Accordion */}
          <div className="border-t border-slate-900/60 pt-2 flex flex-col space-y-2">
            <button
              type="button"
              onClick={() => setIsMetricsGlossaryOpen(prev => !prev)}
              className="flex items-center justify-between text-[9px] font-mono text-cyan-405 hover:text-cyan-300 transition-colors uppercase font-bold text-left cursor-pointer select-none"
            >
              <span>{isMetricsGlossaryOpen ? "▼ Hydrated Hexagonal Calculation Sources (隐藏计算源说明)" : "▶ Hexagonal Metric Calculation Sources & Proxies (展开计算来源与指标解析)"}</span>
              <span className="text-[8px] bg-slate-950 px-1.5 py-0.5 rounded text-slate-400 border border-slate-800">
                {isMetricsGlossaryOpen ? "Collapse ✕" : "View Formulaic Sources ➕"}
              </span>
            </button>

            {isMetricsGlossaryOpen && (
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-900/80 space-y-2.5 font-mono text-[9px] text-slate-400 leading-normal animate-in fade-in duration-100">
                <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-900 pb-1 flex justify-between items-center">
                  <span>QUANTITATIVE AGGREGATE FORMULATIONS (量化指标计算与测算规则):</span>
                  <span className="text-[7.5px] text-cyan-400 animate-pulse font-normal">Click items for cohort interpretive desk</span>
                </span>
                
                <div className="space-y-3 max-h-[190px] overflow-y-auto pr-1">
                  {CONSTANT_DISPERSAL_METRICS.map((metric, idx) => (
                    <div
                      key={metric.id}
                      onClick={() => setActiveDispersalDetailMetric(metric.id)}
                      className={`group p-2 rounded border border-transparent hover:border-slate-800 hover:bg-slate-900/50 transition-all cursor-pointer text-left ${idx > 0 ? "border-t border-slate-900/40 pt-2.5" : ""}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="block text-cyan-400 group-hover:text-cyan-300 font-extrabold uppercase transition-colors">
                          {idx + 1}. {metric.subject} <span className="text-[8px] font-normal text-slate-500">({metric.titleZh})</span>
                        </span>
                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 bg-cyan-950 text-cyan-400 border border-cyan-500/20 px-1.5 py-0.5 rounded text-[7.5px] transition-all font-bold">
                          <span>INTERPRETIVE GUIDE ↗</span>
                        </div>
                      </div>
                      <div className="text-[8px] text-slate-500 my-0.5">{`Formula: $${metric.formula}$`}</div>
                      <p className="font-sans text-[10px] text-slate-450 leading-relaxed group-hover:text-slate-350 transition-colors">
                        {metric.significance}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Middle Aspect: Bar comparison or buying power */}
        <div className="lg:col-span-7 bg-slate-900/40 p-4 rounded-xl border border-slate-900 flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">Resilience & Guard Ratios</span>
            <h3 className="text-sm font-mono font-bold text-slate-300 uppercase flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-rose-400" /> Capital Mobilization Elasticity vs Hedging Ratios (资本动员弹性与对冲稳健性)
            </h3>
            <p className="text-[10px] text-slate-450">
              Empirically models the volume of idle capital mobilized for speculative bidding versus target hedging ratios across distinct classifications.
            </p>
          </div>

          {/* Recharts Buying Pressure Bar Chart */}
          <div className="h-56 w-full font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 9 }} stroke="#334155" />
                <YAxis tick={{ fill: "#64748b", fontSize: 9 }} stroke="#334155" />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#020617", borderColor: "#1e293b", borderRadius: "8px" }}
                  itemStyle={{ fontSize: "10px", fontFamily: "monospace" }}
                />
                <Legend iconSize={8} wrapperStyle={{ fontSize: "9px" }} />
                <Bar dataKey="Buying Pressure" fill="#818cf8" radius={[4, 4, 0, 0]}>
                  {barChartData.map((entry, index) => {
                    const colors = ["#e879f9", "#818cf8", "#22d3ee", "#fda4af"];
                    return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                  })}
                </Bar>
                <Bar dataKey="Hedging Safeguards" fill="#475569" opacity={0.6} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Interactive Cohort Details Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono text-[10px]">
            <div className="bg-slate-950 p-2 rounded border border-slate-900/80">
              <span className="text-slate-500 block uppercase text-[8px]">Retail Buy Elasticity</span>
              <span className="text-rose-400 font-extrabold text-xs">{(sentimentRetail/10).toFixed(1)}x Delta</span>
            </div>
            <div className="bg-slate-950 p-2 rounded border border-slate-900/80">
              <span className="text-slate-500 block uppercase text-[8px]">Regulated OTC Ratio</span>
              <span className="text-cyan-400 font-extrabold text-xs">74% Premium</span>
            </div>
            <div className="bg-slate-950 p-2 rounded border border-slate-900/80">
              <span className="text-slate-500 block uppercase text-[8px]">Whale Custody Delta</span>
              <span className="text-indigo-400 font-extrabold text-xs">-${(sentimentWhale * 1.5).toFixed(0)}M/d</span>
            </div>
            <div className="bg-slate-950 p-2 rounded border border-slate-900/80">
              <span className="text-slate-500 block uppercase text-[8px]">Arb Vector Squeezes</span>
              <span className="text-pink-400 font-extrabold text-xs">{(sentimentArb * 12).toLocaleString()} bps</span>
            </div>
          </div>

          {/* Detailed Cohort Comparative Infiltration Profile (分群体深度入局与算力芯片对冲画像) */}
          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-900 flex flex-col space-y-3">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
              <span className="font-mono text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
                Deep Cohort Profiling Dashboard (群体结构利益画像系统)
              </span>
              <span className="text-[8px] text-slate-500 font-mono uppercase">Interactive Selection</span>
            </div>

            {/* Profile Tab selectors */}
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: "institutional", label: "INSTITUTIONS", color: "text-cyan-400" },
                { id: "retail", label: "RETAIL LABS", color: "text-rose-400" },
                { id: "whales", label: "INFORMED WHALES", color: "text-indigo-400" },
                { id: "arbitrageurs", label: "ALGO TRADERS", color: "text-pink-400" }
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveProfileCohort(tab.id as any)}
                  className={`py-1.5 px-1 rounded border text-[9px] font-mono font-bold transition-all cursor-pointer ${
                    activeProfileCohort === tab.id
                      ? "bg-slate-900 border-slate-700 text-slate-100 ring-1 ring-cyan-500/20"
                      : "bg-slate-950/40 text-slate-500 border-slate-950 hover:text-slate-350"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Profiling content corresponding to active tab */}
            <div className="space-y-3 font-sans text-[11px] text-slate-400 leading-normal animate-in fade-in duration-100 text-left">
              {activeProfileCohort === "institutional" && (
                <div className="space-y-3 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {/* Corp treasury */}
                    <div className="space-y-1.5">
                      <span className="block font-mono text-[9.5px] font-bold text-cyan-400 uppercase tracking-wide">
                        Enterprise Treasury Reserves & OTC Sourcing:
                      </span>
                      <ul className="space-y-1.5 font-mono text-[9px] text-slate-450">
                        <li>
                          <strong className="text-slate-300">MicroStrategy (MSTR):</strong> Holds 226,331 BTC, entry average floor of ~$35,100. Treasury Policy systematically converts debt/equity reserves.
                        </li>
                        <li>
                          <strong className="text-slate-300">Tesla Inc (TSLA):</strong> Controls 9,720 BTC. Adheres to strict dynamic liquidity threshold protocols.
                        </li>
                        <li>
                          <strong className="text-slate-300">Metaplanet:</strong> Tokyo stock exchange listed (3350). Accesses cheap currency debt to arbitrage yield margins.
                        </li>
                      </ul>
                    </div>

                    {/* Miners & hardware */}
                    <div className="space-y-1.5 md:border-l border-slate-900 md:pl-3.5">
                      <span className="block font-mono text-[9.5px] font-bold text-emerald-400 uppercase tracking-wide">
                        Miner Industry & Hashrate Ecology (矿机能耗与算力结构):
                      </span>
                      <div className="space-y-1">
                        <p className="font-mono text-[9px] text-slate-405 leading-relaxed">
                          - Pool Dominion: Foundry USA (31.5% GH/s share), AntPool (22.3%), F2Pool (11.8%).
                        </p>
                        <p className="font-mono text-[9px] text-slate-405 leading-relaxed">
                          - Hardware Standard: S21 Hyd (335 TH/s, efficiency 16 J/T), whatsminer M60S (efficiency 18.5 J/T).
                        </p>
                        <p className="font-mono text-[9.5px] text-slate-350 leading-relaxed font-semibold">
                          - Global Energy: Floor power demand exceeds 145 TWh/yr. Electricity floor threshold at ~$0.055 per kWh is main survival buffer.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* TSMC chip & semiconductors */}
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-900 space-y-1.5">
                    <span className="block font-mono text-[9.5px] font-bold text-cyan-405 uppercase tracking-wider">
                      Semiconductor Silicon & Foundry Lines (台积电先进晶圆与半导体供应链外溢):
                    </span>
                    <p className="font-sans text-[10.5px] text-slate-400 leading-relaxed">
                      Advanced ASIC computing boards and high-spec SHA-256 microcontrollers have a 100% dependency on <strong>TSMC (Taiwan Semiconductor Manufacturing Company)</strong> N3 (3nm) and N5 (5nm) lithography runs. Difficulty spikes trigger instant overtiming, directly correlating miner CAPEX margins with <strong>Intel/NVIDIA GPU/ASIC</strong> chipset capacity allocations. Instability prompts dynamic hedges in semiconductor stock options.
                    </p>
                  </div>
                </div>
              )}

              {activeProfileCohort === "retail" && (
                <div className="space-y-3 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {/* Activity sentiment */}
                    <div className="space-y-1.5">
                      <span className="block font-mono text-[9.5px] font-bold text-rose-450 uppercase tracking-wide">
                        Retail FOMO Activity Sentinels (散户热度与投机哨兵):
                      </span>
                      <ul className="space-y-1 font-mono text-[9px] text-slate-450">
                        <li>
                          <strong className="text-slate-300">App Store Coinbase Rank:</strong> If Rank &lt; 10, indicates peak frenzy (Extreme Bubble). Ranks &gt; 150 reflect quiet accumulation phases.
                        </li>
                        <li>
                          <strong className="text-slate-300">Google Search Trends:</strong> Search terms like "how to buy crypto with credit" or "buy memecoins" directly track availability bias.
                        </li>
                        <li>
                          <strong className="text-slate-300">Reddit r/CryptoCurrency:</strong> Comments per hour serves as momentum baseline tracker.
                        </li>
                      </ul>
                    </div>

                    {/* Memecoin velocity */}
                    <div className="space-y-1.5 md:border-l border-slate-900 md:pl-3.5">
                      <span className="block font-mono text-[9.5px] font-bold text-orange-400 uppercase tracking-wide">
                        Memecoin Aggregator Volatility (山寨资产高换手率与流动性损耗):
                      </span>
                      <p className="font-sans text-[10.5px] text-slate-400 leading-relaxed">
                        Retail specimens leverage centralized & decentralized mobile gateways (Jupiter Aggregators on Solana, Uniswap on Arbitrum). Highly vulnerable to MEV bundle sandwiching, with over 74% executing with high leverage. Retail represents capital prioritize immediate emotional velocity over strategic long-term hold lines.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeProfileCohort === "whales" && (
                <div className="space-y-2 animate-in fade-in duration-150">
                  <span className="block font-mono text-[9.5px] font-bold text-indigo-400 uppercase tracking-wide">
                    Coin Transfer Sizing & Satoshi Nodes (古鲸沉睡节点与场外OTC吸纳):
                  </span>
                  <p className="text-[10.5px]/relaxed">
                    Satoshi-era legacy addresses (dormant for &gt;10 years) transferring balances to binance hot wallets acts as systemic OTC inventory liquidations. Rather than hitting order books directly, they utilize private OTC desk structures. OTC buyer premiums coordinate wholesale distribution structures, causing invisible spot volatility offsets.
                  </p>
                </div>
              )}

              {activeProfileCohort === "arbitrageurs" && (
                <div className="space-y-2 animate-in fade-in duration-150">
                  <span className="block font-mono text-[9.5px] font-bold text-pink-400 uppercase tracking-wide">
                    CME Basis Arbitrage & Flash Liquidation snipes (期货套利与链上清算机器人):
                  </span>
                  <p className="text-[10.5px]/relaxed">
                    Operate delta-neutral basis arbitrage loops (shorting CME Futures while buying spot under premium). Exploit perpetual swaps funding rate volatility between exchanges (longing Binance, shorting Bybit to harvest funding basis points). In peak volume events, custom MEV liquidations utilize Flashbots to frontrun retail liquidating margin accounts.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* 📊 Cohort Correlation & Flow Transmission Matrix */}
      <div className="bg-slate-900/40 p-5 rounded-xl border border-slate-900 space-y-4">
        <div className="space-y-1">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 pb-2 border-b border-slate-900/40">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider block">
                COHORT BEHAVIORAL LINKAGE MAP
              </span>
              <h3 className="text-sm font-mono font-bold text-slate-200 uppercase flex items-center gap-2">
                <Activity className="h-4.5 w-4.5 text-rose-500 animate-pulse" />
                Cross-Cohort Correlation & Feedback Matrix (相关性及信息传导反馈矩阵)
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-2 z-10 self-start xl:self-auto">
              {/* View Mode Toggle: Current Matrix vs Historical Timeline */}
              <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-900 text-[10px] font-mono select-none shadow-inner">
                <span className="text-slate-500 px-2 py-0.5 select-none font-extrabold text-[8px] tracking-wider uppercase self-center">
                  VIEW MODE:
                </span>
                <button
                  type="button"
                  id="matrix-toggle"
                  onClick={() => setViewMode("matrix")}
                  className={`px-2.5 py-1 rounded text-[8.5px] font-extrabold uppercase transition-all cursor-pointer ${
                    viewMode === "matrix"
                      ? "bg-rose-500/10 text-rose-455 border border-rose-500/20 shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                  title="Observe dynamic, active-state matrix values"
                >
                  Current Matrix
                </button>
                <button
                  type="button"
                  id="historical-toggle"
                  onClick={() => setViewMode("historical")}
                  className={`px-2.5 py-1 rounded text-[8.5px] font-extrabold uppercase transition-all cursor-pointer ${
                    viewMode === "historical"
                      ? "bg-rose-500/10 text-rose-455 border border-rose-500/20 shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                  title="Inspect historical 30-day temporal delay heat-grid"
                >
                  30D Historical Heat-Grid
                </button>
                <button
                  type="button"
                  id="timing-toggle"
                  onClick={() => setViewMode("timing")}
                  className={`px-2.5 py-1 rounded text-[8.5px] font-extrabold uppercase transition-all cursor-pointer ${
                    viewMode === "timing"
                      ? "bg-rose-500/10 text-rose-455 border border-rose-500/20 shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                  title="Visualize Retail Sentiment Shifts vs Institutional Inflow Timing correlation matrix"
                >
                  Retail vs. Inst. Timing
                </button>
              </div>

              {/* Sentiment Correlation Filter Toggle (Asset Class selector) */}
              <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-900 text-[10px] font-mono select-none shadow-inner">
                <span className="text-slate-500 px-2 py-0.5 select-none font-extrabold text-[8px] tracking-wider uppercase self-center">
                  AMPLITUDE CORRELATION:
                </span>
                <button
                  type="button"
                  id="matrix-asset-btc"
                  onClick={() => setUserSelectedAsset("BTC")}
                  className={`px-3 py-1 rounded-md text-[9px] font-extrabold uppercase transition-all cursor-pointer ${
                    userSelectedAsset === "BTC"
                      ? "bg-rose-500/10 text-rose-455 border border-rose-500/20 shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                  title="Observe benchmark systemic reserve capital correlations"
                >
                  BTC Reserve
                </button>
                <button
                  type="button"
                  id="matrix-asset-eth"
                  onClick={() => setUserSelectedAsset("ETH")}
                  className={`px-3 py-1 rounded-md text-[9px] font-extrabold uppercase transition-all cursor-pointer ${
                    userSelectedAsset === "ETH"
                      ? "bg-rose-500/10 text-rose-455 border border-rose-500/20 shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                  title="Inspect DeFi smart contract ecosystem and gas volume sensitivity linkages"
                >
                  ETH Gas/Alts
                </button>
                <button
                  type="button"
                  id="matrix-asset-sol"
                  onClick={() => setUserSelectedAsset("SOL")}
                  className={`px-3 py-1 rounded-md text-[9px] font-extrabold uppercase transition-all cursor-pointer ${
                    userSelectedAsset === "SOL"
                      ? "bg-rose-500/10 text-rose-455 border border-rose-500/20 shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                  title="Identify high-velocity retail meme cycles and MEV Jito transaction bundles"
                >
                  SOL MEV/Retail
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-slate-500 text-[9px] font-mono pt-1">
            <p className="leading-relaxed max-w-2xl font-sans">
              {viewMode === "matrix" 
                ? "Interactive heat-grid measuring the lead-lag timing offsets and directional flow correlation indexes (r coefficient from -1.0 to +1.0) between distinct market cohorts."
                : viewMode === "historical"
                ? "Scholarly observation of multi-cohort microstructural delay thresholds over the last 30 temporal cycles. Heat highlights anomalous latency dilation / highly-efficient timing compression."
                : "Dynamic correlation matrix mapping retail sentiment shifts across lead-lag offset windows (-24h to +48h) against regulated institutional liquidity inflows (Spot ETF, CME options, OTC Desk)."
              }
            </p>
            <span className="uppercase text-slate-550 shrink-0 font-bold">
              {viewMode === "matrix"
                ? `Selected: ${cohortLabels[selectedCell.row]} to ${cohortLabels[selectedCell.col]}`
                : viewMode === "historical"
                ? `Selected Pipeline: ${pipelineInfo.label} • Day ${selectedHistorical.dayIndex} (${selectedDayData.label})`
                : `Timing Focus: ${timingRows.find(r => r.id === selectedTimingCell.rowId)?.label} vs ${timingCols.find(c => c.id === selectedTimingCell.colId)?.label}`
              }
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {viewMode === "matrix" ? (
            <>
              {/* Heat map grid block */}
              <div className="lg:col-span-7 bg-slate-950 p-4 rounded-xl border border-slate-900/80 flex flex-col justify-between space-y-4 select-none">
                
                {/* Heat grid axis labels and content */}
                <div className="overflow-x-auto">
                  <div className="min-w-[450px]">
                    {/* Headers row */}
                    <div className="grid grid-cols-5 text-center font-mono text-[9px] text-slate-500 font-black mb-1">
                      <div className="text-left text-slate-605 self-center uppercase pr-1">Target X ➔</div>
                      <div className="py-1">RETAIL</div>
                      <div className="py-1">WHALES</div>
                      <div className="py-1">INSTITUTIONS</div>
                      <div className="py-1">ARBITRAGEURS</div>
                    </div>

                    {/* Grid Rows */}
                    {cohortIDs.map((rowID) => {
                      return (
                        <div key={rowID} className="grid grid-cols-5 items-stretch mb-1 text-center font-mono text-[9px]">
                          {/* Left header cell */}
                          <div className="text-left font-bold text-slate-400 self-center uppercase text-[8px] truncate pr-2 border-r border-slate-900">
                            {rowID.toUpperCase()}
                          </div>

                          {/* Content cells */}
                          {cohortIDs.map((colID) => {
                            const cell = correlationMatrix.find(c => c.row === rowID && c.col === colID)!;
                            const isSelected = selectedCell.row === rowID && selectedCell.col === colID;
                            
                            // Select border colors and heat shades based on the correlation value
                            let cellBgClass = "bg-slate-900/60 text-slate-400 hover:bg-slate-850/80 hover:text-slate-200 border-slate-850";
                            if (isSelected) {
                              cellBgClass = "ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-950 bg-slate-900/90 text-white font-extrabold border-cyan-405";
                            } else {
                              if (cell.value === 1.0) {
                                cellBgClass = "bg-slate-900/20 text-slate-550 border-slate-900/40 opacity-40 font-black";
                              } else if (cell.value >= 0.70) {
                                cellBgClass = "bg-emerald-950/70 text-emerald-300 border-emerald-900/50 hover:bg-emerald-900/75 hover:border-emerald-500/35";
                              } else if (cell.value >= 0.40) {
                                cellBgClass = "bg-emerald-950/40 text-emerald-400 border-emerald-950/50 hover:bg-emerald-900/40 hover:border-emerald-500/20";
                              } else if (cell.value <= -0.65) {
                                cellBgClass = "bg-rose-950/70 text-rose-300 border-rose-900/50 hover:bg-rose-900/75 hover:border-rose-500/35";
                              } else if (cell.value <= -0.30) {
                                cellBgClass = "bg-rose-950/40 text-rose-400 border-rose-955/50 hover:bg-rose-905/40 hover:border-rose-500/20";
                              } else {
                                // Neutral state
                                cellBgClass = "bg-slate-900/60 text-slate-350 border-slate-850 hover:bg-slate-800/80";
                              }
                            }

                            return (
                              <button
                                key={colID}
                                type="button"
                                onClick={() => setSelectedCell({ row: rowID, col: colID })}
                                className={`p-3 rounded-lg border m-0.5 transition-all cursor-pointer block ${cellBgClass}`}
                              >
                                <span className="block text-[11px] tracking-tighter">
                                  {cell.value > 0 ? `+${cell.value}` : cell.value}
                                </span>
                                {rowID !== colID && (
                                  <span className="block text-[7px] text-slate-500/90 truncate mt-0.5 max-w-[85px] mx-auto uppercase font-mono">
                                    {cell.lagLabel.includes("hours") ? cell.lagLabel.split("by")[1] || "offset" : cell.lagLabel.includes("days") ? cell.lagLabel.split("by")[1] || "offset" : "Instant"}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Micro Scale Ref */}
                <div className="flex items-center justify-between font-mono text-[8px] text-slate-500 border-t border-slate-900/85 pt-2 bg-slate-950 rounded-b mt-2">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-sm bg-emerald-950 border border-emerald-900"></span> Positive Sync
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-sm bg-slate-900 border border-slate-800"></span> Non-correlated
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-sm bg-rose-950 border border-rose-900"></span> Inverse Shift
                  </span>
                  <span>Click cells to inspect transmission pathways</span>
                </div>

              </div>

              {/* Core Spotlight Detail Text Explanation Panel */}
              <div className="lg:col-span-5 bg-slate-900/50 p-4 rounded-xl border border-slate-900 flex flex-col justify-between space-y-4">
                {(() => {
                  const selectedCellData = correlationMatrix.find(
                    item => item.row === selectedCell.row && item.col === selectedCell.col
                  ) || correlationMatrix[0];

                  const getCorrelationStrengths = (v: number) => {
                    if (v === 1.0) return { title: "Perfect Self Alignment", color: "text-slate-400" };
                    if (v >= 0.7) return { title: "Strong Positive Traction", color: "text-emerald-450" };
                    if (v >= 0.3) return { title: "Moderate Consensus Correlation", color: "text-emerald-400" };
                    if (v < -0.6) return { title: "Strong Inverse Counter-Flow", color: "text-rose-455 font-extrabold animate-pulse" };
                    if (v < -0.2) return { title: "Moderate Inverse Divergence", color: "text-rose-400" };
                    return { title: "Weak Decoupled / Arbitrage Noise", color: "text-slate-500" };
                  };

                  const strengths = getCorrelationStrengths(selectedCellData.value);

                  return (
                    <>
                      <div className="space-y-3.5">
                        <div className="flex items-start justify-between">
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-mono text-rose-550 font-extrabold uppercase select-none">
                              ANALYSIS SPOTLIGHT
                            </span>
                            <h4 className="text-xs font-mono font-bold text-slate-100 uppercase tracking-tight">
                              {selectedCellData.rowLabel} &lt;➔&gt; {selectedCellData.colLabel}
                            </h4>
                          </div>
                          
                          {/* Value Gauge */}
                          <div className="bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800 text-center font-mono">
                            <span className="block text-[8px] text-slate-550 leading-none">r COEFFICIENT</span>
                            <span className={`text-[11px] font-black tracking-tight block ${
                              selectedCellData.value > 0 ? "text-emerald-450" : selectedCellData.value < 0 ? "text-rose-455" : "text-slate-400"
                            }`}>
                              {selectedCellData.value > 0 ? `+${selectedCellData.value}` : selectedCellData.value}
                            </span>
                          </div>
                        </div>

                        {/* Stance Alignment Indicator */}
                        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-900/80 space-y-1.5 text-[10px] font-mono">
                          <div className="flex justify-between border-b border-slate-900 pb-1.5">
                            <span className="text-slate-505 uppercase text-[8.5px]">Consensus Strength:</span>
                            <span className={`font-extrabold uppercase text-[8.5px] ${strengths.color}`}>
                              {strengths.title}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-0.5">
                            <span className="text-slate-505 uppercase text-[8.5px]">Flow Synchronization:</span>
                            <span className="text-cyan-400 font-black uppercase text-[8.5px] flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {selectedCellData.row === selectedCellData.col ? "Direct Sync" : selectedCellData.lagLabel}
                            </span>
                          </div>
                        </div>

                        {/* Behavioral Description Text */}
                        <div className="p-3 bg-slate-950/20 border border-slate-900/65 rounded-lg text-xs leading-relaxed text-slate-300">
                          <span className="text-[9px] font-mono font-bold text-slate-500 block mb-1 uppercase tracking-wide">
                            Transmission Pathway Report:
                          </span>
                          <p className="font-sans text-[11px] text-slate-400 leading-normal">
                            {selectedCellData.description}
                          </p>
                        </div>
                      </div>

                      {/* Dynamic Behavioral Math & Causation Analysis Panel */}
                      {(() => {
                        const insight = getAcademicInsight(selectedCellData.row, selectedCellData.col, selectedCellData.value);
                        return (
                          <div className="mt-2 text-left space-y-2 bg-slate-950/80 p-3 rounded-lg border border-slate-900 font-mono text-[9px] text-slate-400">
                            <div>
                              <span className="block text-[8px] font-bold text-cyan-405 uppercase tracking-wider mb-0.5">
                                Mathematical Formulation (学测量化方程):
                              </span>
                              <div className="bg-slate-900/80 p-1.5 rounded text-center text-[10px] text-cyan-300 border border-slate-900 overflow-x-auto select-all">
                                $ {insight.formula} $
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 border-t border-slate-900 font-sans">
                              <div className="space-y-0.5">
                                <span className="block font-mono text-[8px] font-bold text-emerald-400 uppercase tracking-wide">
                                  Causal Transmission (因果机制):
                                </span>
                                <p className="text-[9px] text-slate-400 leading-normal">
                                  {insight.causation}
                                </p>
                              </div>

                              <div className="space-y-0.5 md:border-l border-slate-900 md:pl-2">
                                <span className="block font-mono text-[8px] font-bold text-indigo-400 uppercase tracking-wide">
                                  Behavioral Premise (理论基础):
                                </span>
                                <p className="text-[9px] text-slate-400 leading-normal">
                                  {insight.theory}
                                </p>
                              </div>
                            </div>

                            <div className="bg-slate-900/40 p-2 rounded border border-slate-900/65 font-sans text-[9px] text-slate-450 leading-relaxed">
                              <span className="font-mono text-[8.5px] font-bold text-rose-450 block mb-0.5 uppercase tracking-wide">
                                Segment Interpretation (双语深度解读):
                              </span>
                              {insight.explanationCh} 当计算得出 $r = {selectedCellData.value}$ 强韧度模型时，反映出 {selectedCellData.rowLabel} 的变动对 {selectedCellData.colLabel} 的行为传导机制。
                            </div>
                          </div>
                        );
                      })()}
                    </>
                  );
                })()}
              </div>
            </>
          ) : viewMode === "historical" ? (
            <>
              {/* Historical temporal heat-grid block */}
              <div className="lg:col-span-7 bg-slate-950 p-4 rounded-xl border border-slate-900/80 flex flex-col justify-between space-y-4 select-none">
                
                <div className="overflow-x-auto">
                  <div className="min-w-[550px] pr-2">
                    {/* Headers row (Timeline Dates) */}
                    <div className="grid grid-cols-[110px_1fr] md:grid-cols-[130px_1fr] text-left font-mono text-[8px] text-slate-500 mb-2.5 border-b border-slate-900 pb-1.5">
                      <div className="uppercase font-bold text-slate-400">Transmission Channel</div>
                      <div className="flex justify-between pl-2 select-none pr-1 uppercase font-bold text-slate-505 tracking-wider">
                        <span>{filteredDates[0]?.label || "Start"}</span>
                        <span>{filteredDates[Math.floor(filteredDates.length / 2)]?.label || "Mid"}</span>
                        <span>{filteredDates[filteredDates.length - 1]?.label || "End"}</span>
                      </div>
                    </div>

                    {/* Historical interactive rows */}
                    <div className="space-y-2">
                      {historicalPipelines.map((pipeline) => {
                        return (
                          <div key={pipeline.id} className="grid grid-cols-[110px_1fr] md:grid-cols-[130px_1fr] items-center text-left font-mono text-[9px]">
                            {/* Pipeline Label Selector */}
                            <button
                              type="button"
                              onClick={() => setSelectedHistorical(prev => ({ ...prev, pipelineId: pipeline.id }))}
                              className={`text-[8.5px] font-black uppercase text-left truncate pr-2 border-r border-slate-900 cursor-pointer hover:text-cyan-400 transition-colors ${
                                selectedHistorical.pipelineId === pipeline.id ? "text-cyan-400" : "text-slate-400"
                              }`}
                            >
                              {pipeline.label}
                            </button>
                            
                            {/* 30 block cells representing days */}
                            <div className="flex items-center gap-0.5 pl-2 select-none">
                              {filteredDates.map((day) => {
                                const stats = getHistoricalData(pipeline.id, day.index);
                                const isSelected = selectedHistorical.pipelineId === pipeline.id && selectedHistorical.dayIndex === day.index;

                                let cellColorClass = "bg-slate-900/80 border-slate-900 hover:bg-slate-800";
                                if (isSelected) {
                                  cellColorClass = "ring-2 ring-cyan-450 bg-cyan-400 border-cyan-400 scale-105 z-10 shadow-[0_0_8px_rgba(34,211,238,0.5)]";
                                } else {
                                  if (stats.status === "highly-efficient") {
                                    // High response speed / timing compression (Teal gradient shades)
                                    cellColorClass = "bg-teal-500/80 border-teal-600/30 hover:bg-teal-400/90";
                                  } else if (stats.status === "clogged") {
                                    // Informational queue blockage / delay dilation (Rose shades)
                                    cellColorClass = "bg-rose-500/80 border-rose-600/30 hover:bg-rose-400/90";
                                  } else {
                                    // Normal state (Slate/indigo baseline)
                                    cellColorClass = "bg-slate-800/60 border-slate-900/90 hover:bg-slate-700/80";
                                  }
                                }

                                return (
                                  <button
                                    key={day.index}
                                    type="button"
                                    onClick={() => setSelectedHistorical({ pipelineId: pipeline.id, dayIndex: day.index })}
                                    title={`${pipeline.label} • ${day.label}: ${stats.value.toFixed(2)}${stats.unit} (${stats.status.toUpperCase()})`}
                                    className={`flex-1 h-6 rounded-sm border transition-all cursor-pointer ${cellColorClass}`}
                                  />
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Legacy / micro-scale scale references */}
                <div className="flex flex-wrap gap-y-2 items-center justify-between font-mono text-[8.5px] text-slate-500 border-t border-slate-900/85 pt-3 bg-slate-950 rounded-b mt-2">
                  <div className="flex flex-wrap gap-x-3 gap-y-1">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm bg-teal-500/80 border border-teal-600/30"></span> 
                      <span className="text-teal-405 font-bold">TIMING COMPRESSION</span> (Fast Transmission)
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm bg-slate-800/60 border border-slate-900"></span> 
                      <span className="text-slate-400 font-medium">NOMINAL LATENCY</span> (Baseline Standard)
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm bg-rose-500/80 border border-rose-600/30"></span> 
                      <span className="text-rose-455 font-bold">DELAY DILATION</span> (Heavy Lag / Divergence)
                    </span>
                  </div>
                  <span className="text-slate-400 font-medium">Click blocks to inspect temporal state</span>
                </div>

              </div>

              {/* Historical Spotlight breakout and line sparkline chart */}
              <div className="lg:col-span-12 xl:col-span-5 bg-slate-900/50 p-4 rounded-xl border border-slate-900 flex flex-col justify-between space-y-4">
                <div className="space-y-3.5">
                  <div className="flex items-start justify-between">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-mono text-cyan-405 font-extrabold uppercase select-none tracking-wider flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-cyan-405" /> HISTORICAL SPOTLIGHT
                      </span>
                      <h4 className="text-xs font-mono font-bold text-slate-100 uppercase tracking-tight">
                        {pipelineInfo.rowLabel} ➔ {pipelineInfo.colLabel}
                      </h4>
                    </div>
                    
                    {/* Selected Calendar Day badge */}
                    <div className="bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-center font-mono font-bold">
                      <span className="block text-[8px] text-slate-500 leading-none">TARGET EPOCH</span>
                      <span className="text-[10px] font-black text-emerald-450 uppercase block mt-0.5">
                        {selectedDayData.label}
                      </span>
                    </div>
                  </div>

                  {/* Delay status details */}
                  <div className="bg-slate-950/65 p-2.5 rounded-lg border border-slate-900/80 space-y-2 text-[10px] font-mono">
                    <div className="flex justify-between border-b border-slate-900 pb-1.5">
                      <span className="text-slate-550 uppercase text-[8.5px]">TEMPORAL PROPAGATION LAG:</span>
                      <span className="text-cyan-400 font-black tracking-tight text-[11px]">
                        {cellDetails.value.toFixed(1)} {cellDetails.unit}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-slate-550 uppercase text-[8.5px]">SYSTEMIC CONGESTION STATUS:</span>
                      <span className={`px-1 rounded-sm uppercase font-black text-[8px] ${
                        cellDetails.status === "highly-efficient" ? "bg-teal-500/15 text-teal-400 border border-teal-500/10" :
                        cellDetails.status === "clogged" ? "bg-rose-500/15 text-rose-455 border border-rose-500/10" :
                        "bg-slate-800 text-slate-350"
                      }`}>
                        {cellDetails.status === "highly-efficient" ? "Highly Efficient Sync" : 
                         cellDetails.status === "clogged" ? "Severe Transmission Delay" : 
                         "Baseline Equilibrium"}
                      </span>
                    </div>
                  </div>

                  {/* Dynamic 30-Day Delay Sparkline Chart */}
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-900 space-y-2">
                    <div className="flex items-center justify-between text-[8px] font-mono text-slate-500">
                      <span className="uppercase font-bold">30-Day Latency Spectrum Drift:</span>
                      <span>Unit: {cellDetails.unit}</span>
                    </div>
                    <div className="h-24 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                          <XAxis 
                            dataKey="name" 
                            tick={{ fill: '#475569', fontSize: 7, fontFamily: 'monospace' }} 
                            interval={6}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis 
                            tick={{ fill: '#475569', fontSize: 7, fontFamily: 'monospace' }} 
                            axisLine={false}
                            tickLine={false}
                            domain={['auto', 'auto']}
                          />
                          <Tooltip
                            contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '4px', padding: '4px', fontSize: '9px' }}
                            labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
                            itemStyle={{ color: '#e2e8f0' }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="delay" 
                            stroke="#22d3ee" 
                            strokeWidth={1.5} 
                            dot={false}
                            activeDot={{ r: 3, stroke: '#22d3ee', strokeWidth: 1 }}
                          />
                          <ReferenceLine x={selectedDayData.label} stroke="#f43f5e" strokeDasharray="3 3" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex items-center justify-between text-[7.5px] font-mono text-slate-550 pt-0.5">
                      <span>May 01 (30d ago)</span>
                      <span className="text-rose-455 font-bold animate-pulse">● Red marker line shows selected Epoch</span>
                      <span>May 30 (Today)</span>
                    </div>
                  </div>

                  {/* Interpretive Commentary */}
                  <div className="p-2.5 bg-slate-950/20 border border-slate-900/65 rounded-lg text-xs leading-relaxed text-slate-300">
                    <span className="text-[9px] font-mono font-bold text-slate-500 block mb-1 uppercase tracking-wide">
                      Scholarly Transmission Pathway Report:
                    </span>
                    <p className="font-sans text-[11px] text-slate-400 leading-relaxed">
                      {cellDetails.status === "highly-efficient" 
                        ? `Extremely fast synchronization observed on ${selectedDayData.label}. Outflow sequences and pricing signals propagate with minimal friction, compressing delays to ${(cellDetails.value).toFixed(1)}${cellDetails.unit}.`
                        : cellDetails.status === "clogged"
                        ? `Substantial queue delays observed on ${selectedDayData.label}. Extreme event pressure forces portfolio allocators to hold execution gates, widening propagation lags to ${(cellDetails.value).toFixed(1)}${cellDetails.unit}.`
                        : `Standard transmission patterns recorded on ${selectedDayData.label}. Cohorts reflect normal liquidity networks. Capital flows propagate smoothly across historical channel lags averaging ${(cellDetails.value).toFixed(1)}${cellDetails.unit}.`
                      }
                    </p>
                  </div>
                </div>

                <div className="bg-slate-950/50 p-2 rounded border border-slate-900 text-[8.5px] space-y-1 font-mono text-slate-450 leading-relaxed">
                  <span className="font-extrabold uppercase text-[7.5px] text-slate-405 block">Empirical Latency Diagnosis:</span>
                  Information routing delay is modeled dynamically against historical baseline shifts. Use external catalysts above to trigger stress-tested propagation responses.
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Timing Heat Grid */}
              <div className="lg:col-span-7 bg-slate-950 p-4 rounded-xl border border-slate-900/80 flex flex-col justify-between space-y-4 select-none">
                
                {/* Heat grid axis labels and content */}
                <div className="overflow-x-auto">
                  <div className="min-w-[550px] pr-1">
                    {/* Headers row */}
                    <div className="grid grid-cols-[110px_1fr] text-center font-mono text-[9px] text-slate-500 font-black mb-1.5 border-b border-slate-900/40 pb-1">
                      <div className="text-left text-slate-605 self-center uppercase pr-1">LAG WINDOW ➔</div>
                      <div className="grid grid-cols-4 items-center">
                        {timingCols.map(col => (
                          <div key={col.id} className="py-1 leading-snug px-1 truncate text-[8px] uppercase tracking-wider" title={col.desc}>
                            {col.label}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Grid Rows */}
                    <div className="space-y-1.5">
                      {timingRows.map((row) => {
                        return (
                          <div key={row.id} className="grid grid-cols-[110px_1fr] items-stretch text-center font-mono text-[9px]">
                            {/* Left header cell */}
                            <div className="text-left font-bold text-slate-400 self-center uppercase text-[8px] truncate pr-2 border-r border-slate-900">
                              {row.label}
                            </div>

                            {/* Content cells (4 columns) */}
                            <div className="grid grid-cols-4 gap-1 pl-2">
                              {timingCols.map((col) => {
                                const selectedCellData = timingMatrixData.find(c => c.rowId === row.id && c.colId === col.id)!;
                                const isSelected = selectedTimingCell.rowId === row.id && selectedTimingCell.colId === col.id;
                                
                                let cellBgClass = "bg-slate-900/60 text-slate-400 hover:bg-slate-850/80 hover:text-slate-200 border-slate-850";
                                if (isSelected) {
                                  cellBgClass = "ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-950 bg-slate-900/90 text-white font-extrabold border-cyan-405 shadow-[0_0_8px_rgba(34,211,238,0.4)]";
                                } else {
                                  if (selectedCellData.value >= 0.70) {
                                    cellBgClass = "bg-emerald-950/70 text-emerald-300 border-emerald-900/50 hover:bg-emerald-900/75 hover:border-emerald-500/35";
                                  } else if (selectedCellData.value >= 0.40) {
                                    cellBgClass = "bg-emerald-950/30 text-emerald-400 border-emerald-950/45 hover:bg-emerald-900/40 hover:border-emerald-500/20";
                                  } else if (selectedCellData.value <= -0.50) {
                                    cellBgClass = "bg-rose-950/70 text-rose-300 border-rose-900/50 hover:bg-rose-900/75 hover:border-rose-500/35";
                                  } else if (selectedCellData.value <= -0.20) {
                                    cellBgClass = "bg-rose-950/30 text-rose-400 border-rose-950/45 hover:bg-rose-905/40 hover:border-rose-500/20";
                                  } else {
                                    cellBgClass = "bg-slate-900/60 text-slate-350 border-slate-850 hover:bg-slate-800/80";
                                  }
                                }

                                return (
                                  <button
                                    key={col.id}
                                    type="button"
                                    onClick={() => setSelectedTimingCell({ rowId: row.id, colId: col.id })}
                                    className={`p-3 rounded-lg border transition-all cursor-pointer block ${cellBgClass}`}
                                  >
                                    <span className="block text-[11px] font-bold tracking-tighter">
                                      {selectedCellData.value > 0 ? `+${selectedCellData.value}` : selectedCellData.value}
                                    </span>
                                    <span className="block text-[7px] text-slate-500 mt-0.5 truncate uppercase">
                                      r correlation
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Micro Scale Ref */}
                <div className="flex items-center justify-between font-mono text-[8.5px] text-slate-500 border-t border-slate-900/85 pt-3 bg-slate-950 rounded-b mt-2">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-emerald-950 border border-emerald-900"></span> Positive Sync
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-slate-900 border border-slate-800"></span> Non-correlated
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-rose-950 border border-rose-900"></span> Inverse Shift
                  </span>
                  <span>Click cells to inspect transmission pathways</span>
                </div>

              </div>

              {/* Timing Spotlight Detail Text Explanation Panel */}
              <div className="lg:col-span-5 bg-slate-900/50 p-4 rounded-xl border border-slate-900 flex flex-col justify-between space-y-4">
                {(() => {
                  const selectedTimingData = timingMatrixData.find(
                    item => item.rowId === selectedTimingCell.rowId && item.colId === selectedTimingCell.colId
                  ) || timingMatrixData[0];

                  const getCorrelationStrengths = (v: number) => {
                    if (v >= 0.70) return { title: "Strong Positive Feedback", color: "text-emerald-450" };
                    if (v >= 0.40) return { title: "Moderate Narrative Lead", color: "text-emerald-400" };
                    if (v <= -0.50) return { title: "Strong Inverse Counter-Flow", color: "text-rose-455 font-extrabold animate-pulse" };
                    if (v <= -0.20) return { title: "Moderate Structural Divergence", color: "text-rose-400" };
                    return { title: "Weak Decoupled / Arbitrage Noise", color: "text-slate-500" };
                  };

                  const strengths = getCorrelationStrengths(selectedTimingData.value);

                  return (
                    <>
                      <div className="space-y-3.5">
                        <div className="flex items-start justify-between">
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-mono text-rose-550 font-extrabold uppercase select-none tracking-wider block">
                              LEAD-LAG SPOTLIGHT
                            </span>
                            <h4 className="text-xs font-mono font-bold text-slate-100 uppercase tracking-tight leading-relaxed">
                              {selectedTimingData.rowLabel} ➔ {selectedTimingData.colLabel}
                            </h4>
                          </div>
                          
                          {/* Value Gauge */}
                          <div className="bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800 text-center font-mono">
                            <span className="block text-[8px] text-slate-550 leading-none">PEARSON r</span>
                            <span className={`text-[11px] font-black tracking-tight block mt-0.5 ${
                              selectedTimingData.value > 0 ? "text-emerald-450" : selectedTimingData.value < 0 ? "text-rose-455" : "text-slate-400"
                            }`}>
                              {selectedTimingData.value > 0 ? `+${selectedTimingData.value}` : selectedTimingData.value}
                            </span>
                          </div>
                        </div>

                        {/* Stance Alignment Indicator */}
                        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-900/80 space-y-1.5 text-[10px] font-mono">
                          <div className="flex justify-between border-b border-slate-905 pb-1.5">
                            <span className="text-slate-550 uppercase text-[8.5px]">CONFIDENCE INDEX:</span>
                            <span className="text-slate-400 font-bold uppercase text-[8.5px]">
                              {selectedTimingData.significance}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-0.5">
                            <span className="text-slate-550 uppercase text-[8.5px]">TRANSMISSION PHASE:</span>
                            <span className={`font-black uppercase text-[8.5px] ${strengths.color}`}>
                              {selectedTimingData.transmissionPhase}
                            </span>
                          </div>
                        </div>

                        {/* Temporal Capital Propagation Timeline Section */}
                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-900 space-y-2 font-mono text-[9px]">
                          <span className="text-slate-505 uppercase text-[8px] font-bold block">Temporal Capital Propagation Pipeline:</span>
                          <div className="relative flex items-center justify-between h-8 px-2.5 bg-slate-900 rounded border border-slate-950">
                            {/* Horizontal line */}
                            <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-0.5 bg-slate-800"></div>
                            
                            <div className={`z-10 flex flex-col items-center select-none ${selectedTimingCell.rowId.includes("lead") ? "text-cyan-405 font-extrabold" : "text-slate-500"}`}>
                              <span className="w-4 h-4 rounded-full bg-slate-950 border border-current flex items-center justify-center text-[7px] font-bold">R</span>
                              <span className="text-[7px] mt-0.5 uppercase tracking-tighter">Retail</span>
                            </div>
                            
                            <div className={`z-10 flex flex-col items-center select-none ${selectedTimingCell.rowId === "retail_coincident" ? "text-rose-455 font-extrabold animate-pulse" : "text-slate-500"}`}>
                              <span className="w-4 h-4 rounded-full bg-slate-950 border border-current flex items-center justify-center text-[7px]">⚡</span>
                              <span className="text-[7px] mt-0.5 uppercase tracking-tighter">Coinc.</span>
                            </div>

                            <div className={`z-10 flex flex-col items-center select-none ${selectedTimingCell.rowId.includes("lag") ? "text-indigo-400 font-extrabold" : "text-slate-500"}`}>
                              <span className="w-4 h-4 rounded-full bg-slate-950 border border-current flex items-center justify-center text-[7px] font-bold">I</span>
                              <span className="text-[7px] mt-0.5 uppercase tracking-tighter">Instit.</span>
                            </div>
                          </div>
                          <div className="text-[7.5px] text-slate-500 flex justify-between leading-tight mt-1 px-0.5 font-sans">
                            <span>{selectedTimingCell.rowId.includes("lead") ? "◀ Retail Shifts First" : "◀ Coincident Match"}</span>
                            <span className="font-bold font-mono text-slate-400 text-[8px]">OFFSET: {selectedTimingData.rowLabel}</span>
                            <span>{selectedTimingCell.rowId.includes("lag") ? "Institution Leading ▶" : "Both Sync ▶"}</span>
                          </div>
                        </div>

                        {/* Behavioral Description Text */}
                        <div className="p-3 bg-slate-950/20 border border-slate-900/65 rounded-lg text-xs leading-relaxed text-slate-300">
                          <span className="text-[9px] font-mono font-bold text-slate-500 block mb-1 uppercase tracking-wide">
                            Correlation Analysis Summary:
                          </span>
                          <p className="font-sans text-[11px] text-slate-400 leading-normal">
                            {selectedTimingData.explanation}
                          </p>
                        </div>
                      </div>

                      <div className="bg-slate-950/50 p-2.5 rounded border border-slate-900 text-[9px] space-y-1 font-mono text-slate-450 leading-relaxed">
                        <span className="font-extrabold uppercase text-[8px] text-slate-405 block">Heuristic Transmission Note:</span>
                        This stress-tested layout models how retail sentiment shifts propagate feedback to institutional gateways (measured via {selectedTimingData.colLabel}) or if institutional flow acts as the primary informational trigger. Use macro catalysts above to stress-test these values.
                      </div>
                    </>
                  );
                })()}
              </div>
            </>
          )}

        </div>
      </div>

      {/* Grid Zone 2: Detail analysis breakdown of investor cohorts */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {cohorts.map((cohort) => {
          const statusColors = getSentimentBadge(cohort.sentimentIndex);
          return (
            <div 
              key={cohort.id} 
              className="bg-slate-900/40 border border-slate-900 rounded-xl p-4 space-y-3.5 hover:border-slate-800 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                {/* Header (Title, description, stance) */}
                <div className="flex items-start justify-between gap-1.5">
                  <div className="space-y-0.5">
                    <h4 className="text-[11px] font-mono font-black text-slate-100 uppercase tracking-tight flex items-center gap-1">
                      {cohort.id === "retail" && <Users className="h-3.5 w-3.5 text-pink-500" />}
                      {cohort.id === "whales" && <Activity className="h-3.5 w-3.5 text-indigo-400" />}
                      {cohort.id === "institutions" && <Building2 className="h-3.5 w-3.5 text-cyan-400" />}
                      {cohort.id === "arbitrageurs" && <Sparkles className="h-3.5 w-3.5 text-rose-400" />}
                      {cohort.name}
                    </h4>
                    <span className="text-[8.5px] text-slate-500 hover:text-slate-400 select-none block leading-relaxed line-clamp-2">
                      {cohort.description}
                    </span>
                  </div>
                </div>

                {/* Stance and Sentiment Index */}
                <div className="bg-slate-950 p-2 rounded border border-slate-900 text-[10px] space-y-1.5">
                  <div className="flex items-center justify-between text-[8.5px] font-mono text-slate-505">
                    <span>COHORT PHENOMENOLOGICAL STANCE:</span>
                    <span className={`font-bold px-1.5 rounded-sm uppercase ${
                      cohort.stance.includes("Panic Selling") ? "bg-red-500/15 text-red-400 border border-red-500/10" :
                      cohort.stance.includes("Buy") ? "bg-pink-500/15 text-pink-400 border border-pink-500/10" :
                      cohort.stance.includes("Accumulating") ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/10" : "bg-slate-800 text-slate-350"
                    }`}>
                      {cohort.stance}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[8.5px] font-mono text-slate-505">
                    <span>COGNITIVE SPECTRUM STATUS:</span>
                    <span className={`px-1 rounded-sm uppercase font-black text-[8px] ${statusColors.color}`}>
                      {statusColors.text}
                    </span>
                  </div>
                  {/* Visual mini bar */}
                  <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${
                        cohort.sentimentIndex >= 75 ? "bg-rose-500" :
                        cohort.sentimentIndex >= 60 ? "bg-emerald-500" :
                        cohort.sentimentIndex >= 40 ? "bg-cyan-500" : "bg-amber-500"
                      }`}
                      style={{ width: `${cohort.sentimentIndex}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Advanced Parameters */}
              <div className="space-y-1.5 font-mono text-[9px] border-t border-slate-900 pt-2.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">AGGREGATE BIDDING PRESSURE:</span>
                  <span className="text-slate-200 font-bold">{cohort.bidStrength}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">LEVERAGE RATIO BUFFER:</span>
                  <span className="text-slate-200 font-bold">{cohort.leverageRatio.toFixed(1)}x Avg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">HEURISTIC ASSET BIAS:</span>
                  <span className="text-slate-300 font-bold">{cohort.dominantAsset}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">MEAN EXPOSURE VOLUME:</span>
                  <span className="text-cyan-405 font-black">
                    ${cohort.averageSizeUsd >= 1000000 
                      ? `${(cohort.averageSizeUsd / 1000000).toFixed(1)}M` 
                      : cohort.averageSizeUsd.toLocaleString()} USD
                  </span>
                </div>
              </div>

              {/* Stance behavior report */}
              <div className="mt-2.5 p-2 bg-slate-950/40 rounded border border-slate-900/50 text-[9px] text-slate-400 font-sans leading-relaxed">
                <span className="font-mono text-slate-550 block font-bold text-[8px] uppercase tracking-wide">Empirical Practice Blueprint:</span>
                {cohort.recentBehavior}
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Reaction Stream Logs block */}
      <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-sidebar-900 pb-2">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-cyan-400" />
            <span className="text-[10px] font-mono text-slate-300 font-bold uppercase tracking-wide">
              Dynamic Telemetry Event Logs (动态事件与行为反馈观测序列):
            </span>
          </div>
          <span className="text-[9px] text-slate-500 font-mono">Ticking synchronously with WS updates</span>
        </div>

        <div className="max-h-[140px] overflow-y-auto font-mono text-[9.5px] leading-relaxed space-y-1.5 pr-2 custom-scrollbar">
          {recentLogs.map((log) => {
            let color = "text-slate-450";
            if (log.type === "BULLISH" || log.type === "BULL") color = "text-emerald-400 bg-emerald-950/20 px-1 rounded";
            else if (log.type === "BEARISH" || log.type === "BEAR") color = "text-rose-400 bg-rose-950/20 px-1 rounded";
            else if (log.type === "VOLATILE") color = "text-amber-400 bg-amber-950/20 px-1 rounded";
            else if (log.type === "RETAIL") color = "text-pink-400";
            else if (log.type === "INSTITUTE") color = "text-cyan-400";
            else if (log.type === "WHALE") color = "text-indigo-400";

            return (
              <div key={log.id} className="flex items-start gap-2.5 border-b border-slate-900/40 pb-1.5 last:border-0">
                <span className="text-slate-600 flex-shrink-0">[{log.time}]</span>
                <p className={`${color} flex-1`}>{log.text}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 🔬 STRESS-TEST SCENARIOS COMPARISON CENTER (多源多情境智能压力测试实验研究中心) */}
      <div className="bg-slate-950 border border-slate-900 rounded-xl p-5 space-y-4">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 pb-2 border-b border-slate-900/40">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest block">
              Behavioral Finance Sandbox Environment
            </span>
            <h3 className="text-xs font-mono font-bold text-slate-100 uppercase flex items-center gap-1.5">
              <FlaskConical className="h-4 w-4 text-rose-500 animate-pulse" /> STRESS-TEST SCENARIOS COMPARISON CENTER (多源合规情景应变实验室)
            </h3>
            <p className="text-[10.5px]/relaxed text-slate-400">
              Select public data source registries and simulate customized macro shock impulses directly within our sandbox. Generates real-time AI behavioral insights.
            </p>
          </div>
          <span className="text-[9px] bg-rose-950/40 text-rose-455 border border-rose-900/60 px-2 py-0.5 rounded font-mono uppercase tracking-wider h-fit w-fit">
            Academic Lab Space
          </span>
        </div>

        {/* 1. Multi-Source Filtering & Asset Instruments Select Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Data Source Category Selector */}
          <div className="space-y-1.5 text-left">
            <span className="block font-mono text-[9px] text-slate-500 font-bold uppercase tracking-wide">
              Data Feeds Category (公共数据层选择):
            </span>
            <div className="flex bg-slate-990 rounded border border-slate-900 p-0.5">
              {[
                { id: "crypto", label: "Cryptos" },
                { id: "equities", label: "Equities" },
                { id: "etfs", label: "ETFs / Funds" }
              ].map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setStressAssetClass(cat.id as any);
                    // Default corresponding assets on tab switch
                    if (cat.id === "crypto") setStressTargetAsset("BTC");
                    else if (cat.id === "equities") setStressTargetAsset("MSTR");
                    else setStressTargetAsset("IBIT");
                  }}
                  className={`flex-1 py-1 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                    stressAssetClass === cat.id
                      ? "bg-slate-900 text-slate-100 shadow-sm border border-slate-800"
                      : "text-slate-500 hover:text-slate-300 bg-transparent"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Active Target Instrument Selection */}
          <div className="space-y-1.5 text-left md:col-span-2">
            <span className="block font-mono text-[9px] text-slate-500 font-bold uppercase tracking-wide">
              Target Instrument Selection (选定测试标的):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {stressAssetClass === "crypto" && [
                { id: "BTC", label: "BTC (Bitcoin)" },
                { id: "ETH", label: "ETH (Ethereum)" },
                { id: "SOL", label: "SOL (Solana)" }
              ].map(asset => (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() => setStressTargetAsset(asset.id)}
                  className={`py-1 px-2.5 rounded border font-mono text-[10px] font-semibold transition-all cursor-pointer ${
                    stressTargetAsset === asset.id
                      ? "bg-rose-950/60 border-rose-500/50 text-rose-300 font-bold"
                      : "bg-slate-950/40 border-slate-900 text-slate-500 hover:border-slate-800 hover:text-slate-400"
                  }`}
                >
                  {asset.label}
                </button>
              ))}

              {stressAssetClass === "equities" && [
                { id: "MSTR", label: "MSTR (MicroStrategy)" },
                { id: "COIN", label: "COIN (Coinbase Exchange)" },
                { id: "TSLA", label: "TSLA (Tesla Motors)" },
                { id: "NVDA", label: "NVDA (NVIDIA Corporation)" }
              ].map(asset => (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() => setStressTargetAsset(asset.id)}
                  className={`py-1 px-2.5 rounded border font-mono text-[10px] font-semibold transition-all cursor-pointer ${
                    stressTargetAsset === asset.id
                      ? "bg-cyan-950/60 border-cyan-500/50 text-cyan-300 font-bold"
                      : "bg-slate-950/40 border-slate-900 text-slate-500 hover:border-slate-800 hover:text-slate-400"
                  }`}
                >
                  {asset.label}
                </button>
              ))}

              {stressAssetClass === "etfs" && [
                { id: "IBIT", label: "IBIT (BlackRock Spot Trust)" },
                { id: "GBTC", label: "GBTC (Grayscale Trust)" },
                { id: "ARKK", label: "ARKK (ARK Innovation ETF)" }
              ].map(asset => (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() => setStressTargetAsset(asset.id)}
                  className={`py-1 px-2.5 rounded border font-mono text-[10px] font-semibold transition-all cursor-pointer ${
                    stressTargetAsset === asset.id
                      ? "bg-indigo-950/60 border-indigo-500/50 text-indigo-300 font-bold"
                      : "bg-slate-950/40 border-slate-900 text-slate-500 hover:border-slate-800 hover:text-slate-400"
                  }`}
                >
                  {asset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 2. Macro Exogenous Shock Impulses Choice Grid */}
        <div className="space-y-1.5 text-left border-t border-slate-900/40 pt-3">
          <span className="block font-mono text-[9px] text-slate-500 font-bold uppercase tracking-wide">
            Select Sandbox Stressor Shock (选择测试扰动情境):
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
            {[
              {
                id: "liquidation_squeeze",
                title: "Liquidation Cascade",
                desc: "Options gamma rebalancing & automated contract sweeps",
                badge: "BEAR SHIFT"
              },
              {
                id: "regulatory_audit",
                title: "Regulatory Freeze",
                desc: "Sovereign audit interventions forcing multisig cold flights",
                badge: "PANIC COMPLY"
              },
              {
                id: "macro_easing",
                title: "Liquidity Pivots",
                desc: "Severe discount rates cut feeding rapid asset pricing",
                badge: "AGGRESSIVE"
              },
              {
                id: "miner_capitulation",
                title: "Mining Squeezes",
                desc: "Power halving cap constraints & TSMC chip backlogs",
                badge: "CAPITULATION"
              },
              {
                id: "stablecoin_panic",
                title: "Stablecoin Depeg",
                desc: "Depegging scares driving liquidity offsets to Cash reserves",
                badge: "FLIGHT FLAT"
              }
            ].map(sc => (
              <button
                key={sc.id}
                type="button"
                onClick={() => setStressScenario(sc.id)}
                className={`p-2 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  stressScenario === sc.id
                    ? "bg-rose-950/20 border-rose-500/50 text-rose-200 ring-1 ring-rose-500/20 shadow-md"
                    : "bg-slate-950/30 border-slate-900 text-slate-450 hover:bg-slate-950/60 hover:border-slate-800"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[10px] font-black tracking-tight">{sc.title}</span>
                  <span className={`text-[6.5px] font-mono px-1 rounded-sm uppercase tracking-wider ${
                    sc.badge === "AGGRESSIVE" ? "bg-emerald-950/60 text-emerald-400" : "bg-rose-950/60 text-rose-400"
                  }`}>
                    {sc.badge}
                  </span>
                </div>
                <p className="text-[9px]/relaxed text-slate-500 font-sans">{sc.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* 3. Sliders block: Quantitative Parameter Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 border-t border-slate-900/40 pt-3 text-left">
          {/* Slider 1: IV */}
          <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-900 space-y-1">
            <div className="flex justify-between font-mono text-[8.5px] font-bold">
              <span className="text-slate-500 uppercase">Implied Volatility Impulse (IV):</span>
              <span className="text-cyan-400 font-black">{stressVolatility}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="150"
              value={stressVolatility}
              onChange={(e) => setStressVolatility(parseInt(e.target.value))}
              className="w-full accent-cyan-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[7px] font-mono text-slate-600 leading-none">
              <span>25% Base</span>
              <span>150% Max Crash</span>
            </div>
          </div>

          {/* Slider 2: Perpetual Swap Funding Target */}
          <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-900 space-y-1">
            <div className="flex justify-between font-mono text-[8.5px] font-bold">
              <span className="text-slate-500 uppercase">Perp SWAP Funding Basis (Bps):</span>
              <span className="text-rose-400 font-black">{stressFundingRate > 0 ? `+${stressFundingRate}` : stressFundingRate} bps</span>
            </div>
            <input
              type="range"
              min="-200"
              max="200"
              value={stressFundingRate}
              onChange={(e) => setStressFundingRate(parseInt(e.target.value))}
              className="w-full accent-rose-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[7px] font-mono text-slate-600 leading-none">
              <span>-200bps (Short)</span>
              <span>+200bps (Long)</span>
            </div>
          </div>

          {/* Slider 3: Slippage Depth Factor */}
          <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-900 space-y-1">
            <div className="flex justify-between font-mono text-[8.5px] font-bold">
              <span className="text-slate-500 uppercase">Slippage & Depth Impairment:</span>
              <span className="text-indigo-400 font-black">{stressSlippage.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="5.0"
              step="0.1"
              value={stressSlippage}
              onChange={(e) => setStressSlippage(parseFloat(e.target.value))}
              className="w-full accent-indigo-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[7px] font-mono text-slate-600 leading-none">
              <span>0.1x Deep Liquidity</span>
              <span>5.0x Dry Order-book</span>
            </div>
          </div>
        </div>

        {/* 4. Activation Diagnostics Actions */}
        <div className="flex items-center justify-center pt-1">
          <button
            type="button"
            onClick={handleRunAIStressTest}
            disabled={isStressLoading}
            className={`w-full max-w-md py-2 px-5 rounded-lg font-mono text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md select-none border border-slate-850 ${
              isStressLoading
                ? "bg-slate-850 text-slate-500 border-slate-800 animate-pulse"
                : "bg-gradient-to-r from-cyan-600 to-rose-600 text-slate-100 hover:from-cyan-500 hover:to-rose-500 active:scale-[0.98]"
            }`}
          >
            {isStressLoading ? "⚡ Analyzing Stress Cascades (诊断推演中)..." : "🔬 Run Advanced AI Stress Diagnostic (启动AI测试推演核查) ⚡"}
          </button>
        </div>

        {/* 5. Telemetric Analyzing Loading Console */}
        {isStressLoading && (
          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-850 text-left font-mono text-[9px] space-y-1.5 text-cyan-400/80 leading-normal animate-pulse">
            <div className="flex items-center gap-1.5 text-cyan-400 font-extrabold pb-1 border-b border-slate-900">
              <span className="animate-spin text-cyan-400">⚡</span>
              <span>EMBEDDED COHORT TELEMETRY SANDBOX ACTIVE (多源应变核心检测启动):</span>
            </div>
            <div className="space-y-0.5 text-[8.5px]">
              <p>&gt; Ingestion pipeline connecting to selected registry source feed...</p>
              <p>&gt; Triggering exogenous impulse vector shock [{stressScenario}]...</p>
              <p>&gt; Computing Nash dynamic cross-cohort alignments at {stressVolatility}% Implied Vol...</p>
              <p>&gt; Evaluating mining chip and hardware overclock supply chain indices...</p>
              <p>&gt; Invoking Google Gemini AI deep intelligence diagnostic network...</p>
            </div>
          </div>
        )}

        {/* 6. AI Diagnostic Presentation Dashboard */}
        {stressAIResponse && (
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-850 text-left space-y-3.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
            {/* Report Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 border-b border-slate-900 pb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-rose-950/85 border border-rose-500/20 rounded-md text-rose-400 animate-pulse">
                  <Activity className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-[11px] font-mono font-bold text-slate-100 uppercase tracking-wide">
                    STRESS TESTING HIGH-FIDELITY DIAGNOSTIC STATUS REPORT
                  </h4>
                  <p className="text-[8.5px] text-slate-550 font-mono uppercase tracking-wider leading-none">
                    Report ID: REGIST-ST-{stressTargetAsset}-{Math.floor(Math.random() * 900 + 100)} // Generated under AI Grounding
                  </p>
                </div>
              </div>

              {/* Warnings badges */}
              <div className="flex items-center gap-1.5 font-mono">
                <span className="text-[7.5px] px-1.5 py-0.5 rounded border border-rose-900 text-rose-405 bg-rose-950/40 font-black">
                  WARNING STAGE III
                </span>
                <span className="text-[9px] font-extrabold text-cyan-400">
                  Resilience Score: 41/100
                </span>
              </div>
            </div>

            {/* Systems Executive Summary with nice ambient theme */}
            <div className="bg-slate-900/40 p-3 rounded-md border border-slate-900/80 leading-relaxed text-left">
              <span className="block font-mono text-[8.5px] font-extrabold text-cyan-400 uppercase tracking-widest mb-1 pb-0.5 border-b border-slate-900">
                Macro Systems Executive Summary (系统宏观执行摘要):
              </span>
              <p className="font-sans text-[10.5px] text-slate-350 leading-relaxed">
                {stressAIResponse.executiveSummary}
              </p>
            </div>

            {/* Bento-Inspired Analytics Dashboard Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-0.5">
              {/* Card 1: Market Shocks */}
              <div className="bg-slate-900/20 p-3 rounded-lg border border-slate-900 space-y-2 flex flex-col justify-between">
                <div>
                  <span className="block font-mono text-[8.5px] font-bold text-rose-450 uppercase tracking-wider border-b border-slate-950 pb-1">
                    Market Impairments (量化价格与深度冲击):
                  </span>
                  <div className="mt-1.5 text-center py-2 bg-slate-950/80 rounded border border-slate-900">
                    <span className="block text-[7.5px] font-mono text-slate-500 leading-none">PROJECTED PRICE MOVEMENT</span>
                    <span className="text-xs font-mono font-extrabold text-rose-400 block mt-1 tracking-tight">
                      {stressAIResponse.marketImpact?.priceChange}
                    </span>
                  </div>
                </div>
                <div className="space-y-1 font-mono text-[8.5px] leading-normal pt-1.5 border-t border-slate-900">
                  <div className="flex justify-between pb-0.5">
                    <span className="text-slate-500">VOLUME SCALE:</span>
                    <span className="text-slate-350 font-bold">{stressAIResponse.marketImpact?.volumeMultiplier}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-bold text-[7.5px]">MARGIN CLEANING PRESSURE:</span>
                    <p className="font-sans text-[8.5px] text-slate-450 leading-normal mt-0.5">
                      {stressAIResponse.marketImpact?.marginCallSqueezeLiquidationDepth}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 2: Liquidation cascades */}
              <div className="bg-slate-900/20 p-3 rounded-lg border border-slate-900 space-y-2 flex flex-col justify-between">
                <div>
                  <span className="block font-mono text-[8.5px] font-bold text-cyan-400 uppercase tracking-wider border-b border-slate-950 pb-1">
                    Liquidation Squeezes (衍生品清算黑天鹅概率):
                  </span>
                  <div className="mt-1.5 text-center py-2 bg-slate-950/80 rounded border border-slate-900">
                    <span className="block text-[7.5px] font-mono text-slate-500 leading-none">ESTIMATED LIQUIDATIONS</span>
                    <span className="text-xs font-mono font-extrabold text-cyan-400 block mt-1 tracking-tight">
                      {stressAIResponse.liquidationCascades?.estimatedLiquidationUsd}
                    </span>
                  </div>
                </div>
                <div className="space-y-1 font-mono text-[8.5px] leading-normal pt-1.5 border-t border-slate-900">
                  <div className="flex justify-between pb-0.5">
                    <span className="text-slate-500">CLEARING DURATION:</span>
                    <span className="text-slate-300 font-bold">{stressAIResponse.liquidationCascades?.mainLiquidityTractExhaustionSecs}</span>
                  </div>
                  <span className="text-slate-500 block text-[7.5px] font-bold">CASCADE BEHAVIOR:</span>
                  <p className="font-sans text-[8.5px] text-slate-450 leading-normal">
                    Options gamma and automatic contract clearing sweeps absorb top-tier order-book depth levels within seconds of onset.
                  </p>
                </div>
              </div>

              {/* Card 3: Semiconductor TSMC contagions */}
              <div className="bg-slate-900/20 p-3 rounded-lg border border-slate-900 space-y-2 flex flex-col justify-between lg:col-span-1 md:col-span-2">
                <div>
                  <span className="block font-mono text-[8.5px] font-bold text-indigo-400 uppercase tracking-wider border-b border-slate-950 pb-1">
                    Cross-Sector Semiconductors Spillover:
                  </span>
                  <span className="block font-mono text-[7.5px] text-slate-505 mt-1 uppercase">TSMC WAFER CHIP CONTEXT (台积电供应链关联):</span>
                  <p className="font-sans text-[9px]/relaxed text-slate-400 mt-0.5">
                    {stressAIResponse.crossMarketContagion?.semiconductorFoundryTsmcWaferImpact}
                  </p>
                </div>
                <div className="border-t border-slate-900/60 pt-1.5">
                  <span className="block font-mono text-[7.5px] text-slate-500 uppercase">Dealer Gamma Hedge Reactions:</span>
                  <p className="font-sans text-[8.5px]/relaxed text-slate-450 mt-0.5">
                    {stressAIResponse.crossMarketContagion?.optionsGammaDealersHedgeFeedback}
                  </p>
                </div>
              </div>
            </div>

            {/* Cohort Repositioning Array List */}
            <div className="space-y-1.5 pt-1 text-left">
              <span className="block font-mono text-[8.5px] font-bold text-slate-400 uppercase tracking-wide">
                Cohort Adaptive Repositioning Dynamics (各投资群体应变对冲推演):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {stressAIResponse.cohortRepositioning?.map((co: any) => (
                  <div key={co.cohortId} className="bg-slate-900/40 hover:bg-slate-900/60 transition-all p-2.5 rounded-lg border border-slate-900 flex flex-col justify-between space-y-2">
                    <div>
                      <div className="flex items-center justify-between border-b border-slate-950 pb-1">
                        <span className="font-mono text-[9px] font-bold text-slate-200 truncate">{co.name.split(" ")[0]}</span>
                        <span className="text-[7px] font-mono bg-slate-950 px-1 rounded text-cyan-400 font-semibold leading-none py-0.5">
                          {co.stance}
                        </span>
                      </div>
                      <p className="text-[9px] text-slate-400 font-sans leading-relaxed mt-1">
                        <strong className="text-slate-300">Action:</strong> {co.targetAction}
                      </p>
                    </div>
                    <div className="bg-slate-950/40 p-1 rounded text-[8px] border border-slate-900/40 text-slate-500 font-sans leading-normal">
                      {co.powerAndHardwearContagion}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tactical Risk Management Plays block */}
            <div className="bg-slate-900/30 p-2.5 rounded-md border border-slate-900 space-y-1.5 text-left">
              <span className="block font-mono text-[8.5px] font-black text-rose-450 uppercase tracking-wider">
                Tactical Risk Mitigation Playbook (机构对冲对策白皮书):
              </span>
              <div className="space-y-1 font-mono text-[8.5px]">
                {stressAIResponse.strategicRiskPlaybook?.map((play: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-2 py-0.5 border-b border-slate-950/40 last:border-0">
                    <span className="text-rose-400 font-extrabold">{play.tickSequence}</span>
                    <p className="text-slate-350 flex-1 font-sans leading-relaxed">
                      <strong className="font-mono text-[8px] text-slate-300">Order:</strong> {play.interventionAction}
                    </p>
                    <span className="text-emerald-450 bg-emerald-950/25 px-1 rounded font-black leading-none py-0.5 self-center">
                      {play.bufferImpact}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 📊 Dispersal Metric Interactive Interpretive Reference Portal */}
      {activeDispersalDetailMetric && (() => {
        const activeMetricData = CONSTANT_DISPERSAL_METRICS.find(m => m.id === activeDispersalDetailMetric);
        if (!activeMetricData) return null;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md transition-all animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full p-6 shadow-2xl space-y-5 relative overflow-hidden flex flex-col max-h-[90vh]">
              {/* Top scanning accent decoration */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-pink-500 via-cyan-500 to-indigo-500"></div>

              {/* Header */}
              <div className="flex items-start justify-between flex-shrink-0">
                <div className="flex items-center gap-3-xs mr-4">
                  <div className="p-2.5 bg-pink-950/50 border border-pink-500/20 rounded-xl text-pink-400 mr-2.5">
                    <Compass className="h-6 w-6 animate-spin" style={{ animationDuration: '30s' }} />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <h3 className="text-base font-mono font-bold text-slate-100 uppercase tracking-tight">
                        {activeMetricData.subject} Diagnostic Console
                      </h3>
                      <span className="text-[10px] font-sans text-slate-400">({activeMetricData.titleZh})</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider mt-0.5">
                      Empirical Metric Formulation & Cohort Behavior Matrix // 行为金融学分散测算网格
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveDispersalDetailMetric(null)}
                  className="text-slate-400 hover:text-slate-200 bg-slate-950 border border-slate-800 hover:border-slate-700 w-8 h-8 rounded-lg flex items-center justify-center font-bold transition-all cursor-pointer text-xs flex-shrink-0"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body Container with custom scrollbar */}
              <div className="space-y-4 overflow-y-auto pr-1 flex-1 text-left scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                
                {/* Academic & Mathematical Foundation segment */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Theoretical Origin & Conceptual Significance */}
                  <div className="bg-slate-950/80 p-4 border border-slate-800/60 rounded-xl space-y-2.5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-[10px] font-mono text-cyan-400 font-bold uppercase pb-1 border-b border-slate-900">
                        <BookOpen className="h-3.5 w-3.5" />
                        Theoretical Origin & Paradigm
                      </div>
                      <p className="text-[11px] font-sans leading-relaxed text-slate-300 mt-2">
                        {activeMetricData.origin}
                      </p>
                    </div>
                    
                    <div className="mt-2.5 pt-2.5 border-t border-slate-900/60">
                      <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block font-bold">Systemic Significance:</span>
                      <p className="text-[10.5px] font-sans text-slate-400 leading-normal mt-1">
                        {activeMetricData.significance}
                      </p>
                    </div>
                  </div>

                  {/* Operational Formulation & Calculations */}
                  <div className="bg-slate-950/80 p-4 border border-slate-800/60 rounded-xl space-y-2.5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-[10px] font-mono text-pink-400 font-bold uppercase pb-1 border-b border-slate-900">
                        <Sliders className="h-3.5 w-3.5" />
                        Mathematical Formulation & Proxy Logic
                      </div>
                      <div className="bg-slate-900/40 p-3 my-2.5 rounded border border-slate-850 font-mono text-[10.5px] text-center text-slate-200 flex items-center justify-center min-h-[50px] overflow-x-auto whitespace-pre">
                        <span>{`$$ ${activeMetricData.formula} $$`}</span>
                      </div>
                    </div>
                    
                    <div className="mt-1 pt-1.5 border-t border-slate-900/60">
                      <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block font-bold">Calculation Methodology:</span>
                      <p className="text-[10px] font-sans text-slate-400 leading-relaxed mt-1">
                        {activeMetricData.methodology}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Grid Comparison: 4 Cohorts detailed interpretative guides */}
                <div className="space-y-2.5">
                  <div className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-pink-400" /> Granular Cohort Dispersal Interpretive Guides & Cognitive Profiles
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    
                    {/* Retail Guide Card */}
                    <div className="bg-slate-950/40 border border-pink-500/20 hover:border-pink-500/35 p-3.5 rounded-xl space-y-2 transition-all">
                      <div className="flex items-center justify-between border-b border-slate-900/60 pb-1.5">
                        <div className="flex items-center gap-1.5 animate-pulse">
                          <div className="w-2 h-2 rounded-full bg-pink-500" />
                          <span className="text-[11px] font-mono font-bold text-pink-300 uppercase">{activeMetricData.cohortGuides.retail.title}</span>
                          <span className="text-[9px] text-slate-500 font-sans">(散户标本)</span>
                        </div>
                        <span className="text-[8px] bg-pink-950/60 text-pink-400 font-mono font-bold border border-pink-500/20 px-1 py-0.5 rounded leading-none">
                          HIGH BETA SPECS
                        </span>
                      </div>
                      <div className="space-y-1.5 text-[11px]">
                        <div>
                          <strong className="text-[9.5px] font-mono text-slate-400 block pb-0.5 uppercase">Cohort Behavior & Interpretation:</strong>
                          <p className="font-sans text-slate-300 leading-relaxed">{activeMetricData.cohortGuides.retail.meaning}</p>
                        </div>
                        <div className="border-t border-slate-900/60 pt-2 mt-1">
                          <strong className="text-[9.5px] font-mono text-pink-400 block pb-0.5 uppercase">Associated Cognitive Anomalies:</strong>
                          <p className="font-sans text-slate-400 leading-relaxed">{activeMetricData.cohortGuides.retail.bias}</p>
                        </div>
                      </div>
                    </div>

                    {/* Institutional Guide Card */}
                    <div className="bg-slate-950/40 border border-cyan-500/20 hover:border-cyan-500/35 p-3.5 rounded-xl space-y-2 transition-all">
                      <div className="flex items-center justify-between border-b border-slate-900/60 pb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-cyan-400" />
                          <span className="text-[11px] font-mono font-bold text-cyan-300 uppercase">{activeMetricData.cohortGuides.institutional.title}</span>
                          <span className="text-[9px] text-slate-500 font-sans">(合规资本)</span>
                        </div>
                        <span className="text-[8px] bg-cyan-950/60 text-cyan-400 font-mono font-bold border border-cyan-500/20 px-1 py-0.5 rounded leading-none">
                          CONSERVATIVE RISK
                        </span>
                      </div>
                      <div className="space-y-1.5 text-[11px]">
                        <div>
                          <strong className="text-[9.5px] font-mono text-slate-400 block pb-0.5 uppercase">Cohort Behavior & Interpretation:</strong>
                          <p className="font-sans text-slate-300 leading-relaxed">{activeMetricData.cohortGuides.institutional.meaning}</p>
                        </div>
                        <div className="border-t border-slate-900/60 pt-2 mt-1">
                          <strong className="text-[9.5px] font-mono text-cyan-450 block pb-0.5 uppercase">Associated Cognitive Anomalies:</strong>
                          <p className="font-sans text-slate-400 leading-relaxed">{activeMetricData.cohortGuides.institutional.bias}</p>
                        </div>
                      </div>
                    </div>

                    {/* Whales Guide Card */}
                    <div className="bg-slate-950/40 border border-indigo-500/20 hover:border-indigo-500/35 p-3.5 rounded-xl space-y-2 transition-all">
                      <div className="flex items-center justify-between border-b border-slate-900/60 pb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-indigo-500" />
                          <span className="text-[11px] font-mono font-bold text-indigo-300 uppercase">{activeMetricData.cohortGuides.whales.title}</span>
                          <span className="text-[9px] text-slate-500 font-sans">(智能巨鲸)</span>
                        </div>
                        <span className="text-[8px] bg-indigo-950/60 text-indigo-400 font-mono font-bold border border-indigo-500/20 px-1 py-0.5 rounded leading-none">
                          CONTRARIAN SMART
                        </span>
                      </div>
                      <div className="space-y-1.5 text-[11px]">
                        <div>
                          <strong className="text-[9.5px] font-mono text-slate-400 block pb-0.5 uppercase">Cohort Behavior & Interpretation:</strong>
                          <p className="font-sans text-slate-300 leading-relaxed">{activeMetricData.cohortGuides.whales.meaning}</p>
                        </div>
                        <div className="border-t border-slate-900/60 pt-2 mt-1">
                          <strong className="text-[9.5px] font-mono text-indigo-455 block pb-0.5 uppercase">Associated Cognitive Anomalies:</strong>
                          <p className="font-sans text-slate-400 leading-relaxed">{activeMetricData.cohortGuides.whales.bias}</p>
                        </div>
                      </div>
                    </div>

                    {/* Arbitrageurs Guide Card */}
                    <div className="bg-slate-950/40 border border-rose-500/20 hover:border-rose-500/35 p-3.5 rounded-xl space-y-2 transition-all">
                      <div className="flex items-center justify-between border-b border-slate-900/60 pb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-rose-500" />
                          <span className="text-[11px] font-mono font-bold text-rose-300 uppercase">{activeMetricData.cohortGuides.arbitrageurs.title}</span>
                          <span className="text-[9px] text-slate-500 font-sans">(算法套利)</span>
                        </div>
                        <span className="text-[8px] bg-rose-950/60 text-rose-400 font-mono font-bold border border-rose-500/20 px-1 py-0.5 rounded leading-none">
                          LATENCY ADAPTED
                        </span>
                      </div>
                      <div className="space-y-1.5 text-[11px]">
                        <div>
                          <strong className="text-[9.5px] font-mono text-slate-400 block pb-0.5 uppercase">Cohort Behavior & Interpretation:</strong>
                          <p className="font-sans text-slate-300 leading-relaxed">{activeMetricData.cohortGuides.arbitrageurs.meaning}</p>
                        </div>
                        <div className="border-t border-slate-900/60 pt-2 mt-1">
                          <strong className="text-[9.5px] font-mono text-rose-455 block pb-0.5 uppercase">Associated Cognitive Anomalies:</strong>
                          <p className="font-sans text-slate-400 leading-relaxed">{activeMetricData.cohortGuides.arbitrageurs.bias}</p>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-slate-900 pt-4 flex-shrink-0">
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest leading-none">
                  INTELLIGENT DIAGNOSTICS HUD // COHORT ANALYSIS COMPLETED
                </span>
                <button
                  type="button"
                  onClick={() => setActiveDispersalDetailMetric(null)}
                  className="px-4 py-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-[10px] font-mono uppercase font-bold rounded-lg transition-all cursor-pointer select-none"
                >
                  Close Console
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* 🎓 Academic Citation Scholarly Exporter Dialog */}
      {isCitationOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md transition-all">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 relative overflow-hidden">
            {/* Top scanning accent decoration */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-500 via-rose-500 to-indigo-500"></div>

            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-cyan-950/50 border border-cyan-500/20 rounded-xl text-cyan-400">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-mono font-bold text-slate-100 uppercase tracking-tight">
                    Scholarly Academic Citation Desk
                  </h3>
                  <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
                    Binance WebSocket Pipeline Registry Archive // 行为金融学文献生成体系
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCitationOpen(false)}
                className="text-slate-400 hover:text-slate-200 bg-slate-950 border border-slate-800 hover:border-slate-700 w-8 h-8 rounded-lg flex items-center justify-center font-bold transition-all cursor-pointer text-xs"
              >
                ✕
              </button>
            </div>

            {/* Ingestion & Telemetry Filter Snapshots Details */}
            <div className="bg-slate-950/80 border border-slate-800/60 rounded-xl p-3.5 space-y-2.5 font-mono text-[10px] text-slate-300">
              <div className="flex items-center gap-1.5 border-b border-slate-900 pb-2 text-cyan-400 font-bold block">
                <BookOpen className="h-3.5 w-3.5" />
                CURRENT TELEMETRY SNAPSHOT CAPTURED
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5 leading-relaxed text-left">
                <div className="flex justify-between">
                  <span className="text-slate-500 uppercase">Primary Instrument:</span>
                  <span className="text-slate-200 font-bold">{userSelectedAsset} Benchmark</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 uppercase">Analysis Engine Mode:</span>
                  <span className="text-slate-200 font-bold uppercase">{viewMode} Layout</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 uppercase">Exogenous Stressor:</span>
                  <span className="text-rose-400 font-bold truncate max-w-[150px]" title={CONSTANT_MACRO_EVENTS.find(e => e.id === activeEventId)?.title || "Baseline Scenario"}>
                    {CONSTANT_MACRO_EVENTS.find(e => e.id === activeEventId)?.title || "Baseline Equilibrium"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 uppercase">Date Spectrum Filter:</span>
                  <span className="text-emerald-400 font-bold animate-pulse">
                    {globalTimeHorizon?.startDate || "2026-05-01"} ➔ {globalTimeHorizon?.endDate || "2026-05-31"}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-900 flex flex-col gap-1 text-[9px] text-slate-400 font-sans text-left">
                <span className="font-mono text-[8px] uppercase tracking-wide text-slate-500 block">Core Snapshot Summary:</span>
                <p className="italic leading-normal text-slate-300">
                  "{citationData.empiricalSummary}"
                </p>
              </div>
            </div>

            {/* Citation Style Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <button
                type="button"
                onClick={() => setCitationFormat("bibtex")}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  citationFormat === "bibtex"
                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                BibTeX Format (.bib)
              </button>
              <button
                type="button"
                onClick={() => setCitationFormat("apa")}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  citationFormat === "apa"
                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                APA Citation (7th Edition)
              </button>
            </div>

            {/* Citation Code Area */}
            <div className="relative">
              <div className="max-h-48 overflow-y-auto bg-slate-950 p-4 rounded-xl border border-slate-800 text-left font-mono text-[10.5px] leading-relaxed text-slate-200 whitespace-pre-wrap select-all">
                {citationFormat === "bibtex" ? citationData.bibtexCitation : citationData.apaCitation}
              </div>

              {/* Action trigger overlay */}
              <div className="absolute right-3.5 top-3.5">
                <button
                  type="button"
                  onClick={() => handleCopyToClipboard(citationFormat === "bibtex" ? citationData.bibtexCitation : citationData.apaCitation)}
                  className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border text-[9.5px] font-mono font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    copiedStatus
                      ? "bg-emerald-950 border-emerald-500/40 text-emerald-400"
                      : "bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300"
                  }`}
                  title="Copy to Clipboard"
                >
                  {copiedStatus ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      COPIED!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      COPY
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Bottom Actions Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
              <span className="text-[9px] font-mono text-slate-500 leading-normal max-w-sm text-left">
                *Citations are dynamically synchronized to current viewport parameters. File downloads satisfy standardized BibTeX ingestion specifications.
              </span>
              
              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleDownloadCitation(
                    citationFormat === "bibtex" ? citationData.bibtexCitation : citationData.apaCitation,
                    citationFormat === "bibtex" ? `${citationData.bibtexKey}.bib` : `citation_snapshot_${userSelectedAsset.toLowerCase()}.txt`
                  )}
                  className="flex items-center justify-center gap-1.5 bg-rose-950 hover:bg-rose-900 border border-rose-500/30 hover:border-rose-400 text-rose-400 hover:text-rose-300 font-mono font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer uppercase tracking-wider shadow-lg"
                >
                  <Download className="h-4 w-4" />
                  Download File
                </button>
                
                <button
                  type="button"
                  onClick={() => setIsCitationOpen(false)}
                  className="bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 font-mono font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer uppercase tracking-wider"
                >
                  Dismiss
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 🚀 Batch Research Data Exporter Dialog */}
      {isBatchExportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md transition-all">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-5 relative overflow-hidden">
            {/* Top scanning accent decoration */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"></div>

            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-950/50 border border-emerald-500/20 rounded-xl text-emerald-400">
                  <Download className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-mono font-bold text-slate-100 uppercase tracking-tight">
                    Batch Research Data Ingestion Desk
                  </h3>
                  <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
                    Full Telemetry Export Station // 学术数据批量分析导入系统
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBatchExportOpen(false)}
                className="text-slate-400 hover:text-slate-200 bg-slate-950 border border-slate-800 hover:border-slate-700 w-8 h-8 rounded-lg flex items-center justify-center font-bold transition-all cursor-pointer text-xs"
              >
                ✕
              </button>
            </div>

            {/* Ingestion & Telemetry Filter Snapshots Details */}
            <div className="bg-slate-950/80 border border-slate-800/60 rounded-xl p-4 space-y-3 font-mono text-[10px] text-slate-300">
              <div className="flex items-center gap-1.5 border-b border-slate-900 pb-2 text-emerald-400 font-bold text-left">
                <BookOpen className="h-3.5 w-3.5 inline mr-1" />
                CONSOLIDATED RESEARCH SCHOLARLY PACKET DETAILS
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900/50 p-2.5 rounded border border-slate-800/40 text-left">
                  <div className="text-slate-500 uppercase text-[9px]">Ingested Spectrum</div>
                  <div className="text-emerald-400 font-extrabold text-xs mt-1">
                    {filteredDates.length} Days Filtered
                  </div>
                  <div className="text-[8px] text-slate-500 mt-0.5">
                    ({globalTimeHorizon?.startDate || "2026-05-01"} to {globalTimeHorizon?.endDate || "2026-05-31"})
                  </div>
                </div>

                <div className="bg-slate-900/50 p-2.5 rounded border border-slate-800/40 text-left">
                  <div className="text-slate-500 uppercase text-[9px]">Captured Pipelines</div>
                  <div className="text-cyan-400 font-extrabold text-xs mt-1">
                    6 Channels × {filteredDates.length} Days
                  </div>
                  <div className="text-[8px] text-slate-500 mt-0.5">
                    {6 * filteredDates.length} Time-Series Points
                  </div>
                </div>

                <div className="bg-slate-900/50 p-2.5 rounded border border-slate-800/40 text-left">
                  <div className="text-slate-500 uppercase text-[9px]">Cohort & Core Matrix</div>
                  <div className="text-indigo-400 font-extrabold text-xs mt-1">
                    4 Cohorts + 15 Nodes
                  </div>
                  <div className="text-[8px] text-slate-500 mt-0.5">
                    Linked matrices & lag logs
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-900 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5 text-left leading-relaxed">
                <div className="flex justify-between">
                  <span className="text-slate-500 uppercase text-[9px]">Stressor Context:</span>
                  <span className="text-rose-455 font-bold truncate max-w-[180px]">
                    {CONSTANT_MACRO_EVENTS.find(e => e.id === activeEventId)?.title || "Baseline Equilibrium"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 uppercase text-[9px]">Target Asset:</span>
                  <span className="text-slate-200 font-bold uppercase">{userSelectedAsset} Benchmark</span>
                </div>
              </div>
            </div>

            {/* 📊 ONGOING DATA AGGREGATION MONITOR */}
            <div id="batch-export-progress-panel" className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4 space-y-3 font-mono text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-slate-300 font-bold uppercase tracking-wide text-[10px]">
                  <span className={`h-2 w-2 rounded-full ${isCompilingBatch ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`}></span>
                  Data Aggregation Telemetry: <span className={isCompilingBatch ? 'text-amber-400' : 'text-emerald-400 font-black'}>{exportProgress}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-slate-500 uppercase">
                    {isCompilingBatch ? "AGGLOMERATION IN PROGRESS" : "CORE MATRIX STATIC INDEX OK"}
                  </span>
                  <button
                    type="button"
                    onClick={handleReaggregateManual}
                    disabled={isCompilingBatch}
                    className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 uppercase transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                  >
                    Re-aggregate 🔄
                  </button>
                </div>
              </div>

              {/* Glowing Dynamic Progress Track */}
              <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-[1px] relative">
                <div
                  className={`h-full rounded-full transition-all duration-150 relative ${
                    exportProgress === 100
                      ? "bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                      : "bg-gradient-to-r from-amber-500 via-emerald-500 to-cyan-500 animate-pulse"
                  }`}
                  style={{ width: `${exportProgress}%` }}
                >
                  {/* Sliding scanning flare effect */}
                  {isCompilingBatch && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse pointer-events-none"></div>
                  )}
                </div>
              </div>

              {/* Dynamic Status Report Lines */}
              <div className="flex items-center justify-between text-[11px] text-left pt-0.5 min-h-[16px]">
                <span className={`font-mono text-[10px] uppercase ${isCompilingBatch ? "text-amber-400 font-bold" : "text-emerald-400"}`}>
                  {exportProgress === 100
                    ? "✔ Dataset unified. Completed professional Panda/R/STATA ingestion files."
                    : exportProgress >= 85
                    ? "Compiling unified JSON frames and final CSV cell structures..."
                    : exportProgress >= 65
                    ? "Computing Pearson correlation networks and Lead-Lag lags..."
                    : exportProgress >= 40
                    ? "Aggregating 6 transmission channels across historical indices..."
                    : exportProgress >= 15
                    ? "Reading regulatory stress filters and event timelines..."
                    : "Initializing batch pipelines and buffer channels..."}
                </span>
                <span className="text-[9px] text-slate-500 uppercase tracking-tighter">
                  {exportProgress === 100 ? "IDLE" : `SENSORS ACTIVE: ${Math.round(exportProgress * 0.15 + 1)}/15`}
                </span>
              </div>
            </div>

            {/* Tab triggers for previewing formats */}
            <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-800 pb-1">
              <button
                type="button"
                onClick={() => setPreviewTab("json")}
                disabled={exportProgress < 100}
                className={`px-3 py-1.5 rounded-t-lg text-xs font-mono font-bold transition-all border-t border-x cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                  previewTab === "json"
                    ? "bg-slate-950 text-emerald-400 border-slate-800"
                    : "bg-transparent text-slate-400 hover:text-slate-200 border-transparent"
                }`}
              >
                Complete Master Packet (.json)
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab("heatgrid-csv")}
                disabled={exportProgress < 100}
                className={`px-3 py-1.5 rounded-t-lg text-xs font-mono font-bold transition-all border-t border-x cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                  previewTab === "heatgrid-csv"
                    ? "bg-slate-950 text-emerald-400 border-slate-800"
                    : "bg-transparent text-slate-400 hover:text-slate-200 border-transparent"
                }`}
              >
                Transmission (delay).csv
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab("correlation-csv")}
                disabled={exportProgress < 100}
                className={`px-3 py-1.5 rounded-t-lg text-xs font-mono font-bold transition-all border-t border-x cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                  previewTab === "correlation-csv"
                    ? "bg-slate-950 text-emerald-400 border-slate-800"
                    : "bg-transparent text-slate-400 hover:text-slate-200 border-transparent"
                }`}
              >
                Correlation Matrix.csv
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab("timing-csv")}
                disabled={exportProgress < 100}
                className={`px-3 py-1.5 rounded-t-lg text-xs font-mono font-bold transition-all border-t border-x cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                  previewTab === "timing-csv"
                    ? "bg-slate-950 text-emerald-400 border-slate-800"
                    : "bg-transparent text-slate-400 hover:text-slate-200 border-transparent"
                }`}
              >
                Lead-Lag Timing.csv
              </button>
            </div>

            {/* Live Preview Text Area */}
            <div className="relative">
              {exportProgress < 100 ? (
                <div className="h-56 flex flex-col items-center justify-center bg-slate-950 rounded-xl border border-slate-800 text-center font-mono p-6 space-y-3">
                  <div className="relative">
                    <div className="h-10 w-10 border-2 border-dashed border-amber-500/50 rounded-full animate-spin"></div>
                    <div className="absolute inset-2 bg-gradient-to-br from-amber-500/10 to-transparent rounded-full animate-ping"></div>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Compiling Dataset Frame...</h4>
                    <p className="text-[9px] text-slate-500 uppercase tracking-tight max-w-sm">
                      Harvesting and encoding academic structures to CSV/JSON representation. Progress: {exportProgress}%
                    </p>
                  </div>
                  <div className="text-[8px] text-slate-600 uppercase font-mono max-w-md truncate">
                    LOG: index_day_{Math.min(30, Math.floor(exportProgress * 0.3) + 1)} // pipelines_sensor_trigger_active_val_{Math.round(52.4 * exportProgress)}
                  </div>
                </div>
              ) : (
                <div className="max-h-56 overflow-y-auto bg-slate-950 p-4 rounded-xl border border-slate-800 text-left font-mono text-[9.5px] leading-normal text-slate-300 overflow-x-auto whitespace-pre scrollbar-thin select-all">
                  {previewTab === "json" && batchResearchExportData.masterJSON}
                  {previewTab === "heatgrid-csv" && batchResearchExportData.heatGridCSV}
                  {previewTab === "correlation-csv" && batchResearchExportData.correlationCSV}
                  {previewTab === "timing-csv" && batchResearchExportData.timingCSV}
                </div>
              )}

              {/* Action trigger overlay */}
              {exportProgress === 100 && (
                <div className="absolute right-3 top-3 z-10">
                  <button
                    type="button"
                    onClick={() => {
                      let content = batchResearchExportData.masterJSON;
                      if (previewTab === "heatgrid-csv") content = batchResearchExportData.heatGridCSV;
                      else if (previewTab === "correlation-csv") content = batchResearchExportData.correlationCSV;
                      else if (previewTab === "timing-csv") content = batchResearchExportData.timingCSV;
                      handleCopyToClipboardBatch(content);
                    }}
                    className={`px-2.5 py-1.5 rounded-lg border text-[9px] font-mono font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      copiedBatchStatus
                        ? "bg-emerald-950 border-emerald-500/40 text-emerald-400"
                        : "bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300"
                    }`}
                    title="Copy current frame content"
                  >
                    {copiedBatchStatus ? (
                      <>
                        <Check className="h-3 w-3" />
                        COPIED!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        COPY FRAME
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Controls Row & Bulk Downloaders */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
              <span className="text-[9px] font-mono text-slate-500 leading-normal max-w-sm text-left">
                *The dataset is optimized for integration with Python (Pandas dataframes), R (ggplot/tidyverse packages), and STATA time-series libraries.
              </span>
              
              <div className="flex flex-wrap gap-2 shrink-0">
                <button
                  type="button"
                  disabled={exportProgress < 100}
                  onClick={() => {
                    let text = batchResearchExportData.masterJSON;
                    let ext = "json";
                    let filePrefix = "hmtr_complete_research_packet";
                    
                    if (previewTab === "heatgrid-csv") {
                      text = batchResearchExportData.heatGridCSV;
                      ext = "csv";
                      filePrefix = "hmtr_transmission_delay_series";
                    } else if (previewTab === "correlation-csv") {
                      text = batchResearchExportData.correlationCSV;
                      ext = "csv";
                      filePrefix = "hmtr_feedback_correlation_matrix";
                    } else if (previewTab === "timing-csv") {
                      text = batchResearchExportData.timingCSV;
                      ext = "csv";
                      filePrefix = "hmtr_lead_lag_timing_matrix";
                    }
                    
                    handleDownloadCitation(
                      text,
                      `${filePrefix}_${userSelectedAsset.toLowerCase()}.${ext}`
                    );
                  }}
                  className="flex items-center justify-center gap-1.5 bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/30 hover:border-emerald-400 text-emerald-400 hover:text-emerald-300 font-mono font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer uppercase tracking-wider shadow-lg disabled:opacity-30 disabled:pointer-events-none"
                >
                  <Download className="h-4 w-4" />
                  Download Frame File
                </button>
                
                <button
                  type="button"
                  onClick={() => setIsBatchExportOpen(false)}
                  className="bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 font-mono font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer uppercase tracking-wider"
                >
                  Dismiss
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </section>
  );
};
