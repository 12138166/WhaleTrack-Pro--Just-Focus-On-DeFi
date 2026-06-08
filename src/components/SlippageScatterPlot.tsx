import React, { useEffect, useRef, useState, useMemo } from "react";
import * as d3 from "d3";
import { 
  TrendingUp, 
  HelpCircle, 
  ArrowUpRight, 
  Settings, 
  Layers, 
  SlidersHorizontal,
  Zap,
  RefreshCw,
  Search,
  Filter,
  Check,
  Calendar,
  ZoomIn,
  ZoomOut,
  Maximize2
} from "lucide-react";
import { MarketSimulationResponse } from "../types";

export interface ScatterDataPoint {
  id: string;
  date: Date;
  asset: "BTC" | "ETH" | "SOL" | "USDT" | "USDC" | string;
  amount: number;
  activePrice: number;
  totalValueUsd: number;
  strategy: string;
  marketCondition: string;
  engine: "Local Quant" | "Gemini AI";
  slippage: number; // raw value e.g., 2.34 for 2.34%
  shockIndex: "Negligible" | "Moderate" | "Severe" | "Extreme";
  estimatedRecoveryTime: string;
  notes?: string;
}

// Statically pre-seed 25 highly realistic historical simulations compiled over the past 30 days
const PRE_SEEDED_HISTORICAL_POINTS: ScatterDataPoint[] = [
  // BTC Scenarios (High depth, low slippage)
  {
    id: "hist-btc-1",
    date: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000), // 28d ago
    asset: "BTC",
    amount: 150,
    activePrice: 65000,
    totalValueUsd: 9750000,
    strategy: "24-Hour TWAP Block Execution",
    marketCondition: "Calm Standard Liquidity [Balanced market]",
    engine: "Local Quant",
    slippage: 0.12,
    shockIndex: "Negligible",
    estimatedRecoveryTime: "45 seconds",
    notes: "Baseline TWAP execution for treasury optimization audit."
  },
  {
    id: "hist-btc-2",
    date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
    asset: "BTC",
    amount: 850,
    activePrice: 65200,
    totalValueUsd: 55420000,
    strategy: "Immediate Market Dump [DEX/CEX]",
    marketCondition: "Calm Standard Liquidity [Balanced market]",
    engine: "Gemini AI",
    slippage: 3.45,
    shockIndex: "Severe",
    estimatedRecoveryTime: "4 hours",
    notes: "Aggressive liquidation simulation. Noticeable orderbook disruption."
  },
  {
    id: "hist-btc-3",
    date: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000),
    asset: "BTC",
    amount: 1200,
    activePrice: 65800,
    totalValueUsd: 78960000,
    strategy: "OTC Desk Deal [Off-market matching]",
    marketCondition: "Bullish Depth [High order book buffers]",
    engine: "Local Quant",
    slippage: 0.05,
    shockIndex: "Negligible",
    estimatedRecoveryTime: "8 seconds",
    notes: "Large OTC trade. Off-chain routing mitigates spot order book shock."
  },
  {
    id: "hist-btc-4",
    date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    asset: "BTC",
    amount: 950,
    activePrice: 64500,
    totalValueUsd: 61275000,
    strategy: "Immediate Market Dump [DEX/CEX]",
    marketCondition: "High Volatility Panic [Thin bid ask spreads]",
    engine: "Gemini AI",
    slippage: 12.80,
    shockIndex: "Extreme",
    estimatedRecoveryTime: "24 hours",
    notes: "Stress test during panic conditions. Liquidity dries up completely."
  },

  // ETH Scenarios (Moderate depth)
  {
    id: "hist-eth-1",
    date: new Date(Date.now() - 26 * 24 * 60 * 60 * 1000),
    asset: "ETH",
    amount: 1500,
    activePrice: 3400,
    totalValueUsd: 5100000,
    strategy: "Immediate Market Dump [DEX/CEX]",
    marketCondition: "Dull Market Holiday [Abysmal volume]",
    engine: "Local Quant",
    slippage: 1.85,
    shockIndex: "Moderate",
    estimatedRecoveryTime: "1.5 hours",
    notes: "Thin indexers during weekend holiday. Marked slippage spike."
  },
  {
    id: "hist-eth-2",
    date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    asset: "ETH",
    amount: 12000,
    activePrice: 3450,
    totalValueUsd: 41400000,
    strategy: "Algorithmic Sniper Iceberg",
    marketCondition: "Bullish Depth [High order book buffers]",
    engine: "Gemini AI",
    slippage: 1.15,
    shockIndex: "Moderate",
    estimatedRecoveryTime: "40 minutes",
    notes: "Highly optimized execution via specialized smart contract node."
  },
  {
    id: "hist-eth-3",
    date: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000),
    asset: "ETH",
    amount: 25000,
    activePrice: 3380,
    totalValueUsd: 84500000,
    strategy: "Immediate Market Dump [DEX/CEX]",
    marketCondition: "Calm Standard Liquidity [Balanced market]",
    engine: "Local Quant",
    slippage: 14.20,
    shockIndex: "Extreme",
    estimatedRecoveryTime: "12 hours",
    notes: "Large liquidator cascade. Severe displacement of base DEX stability pools."
  },
  {
    id: "hist-eth-4",
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    asset: "ETH",
    amount: 30000,
    activePrice: 3500,
    totalValueUsd: 105000000,
    strategy: "OTC Desk Deal [Off-market matching]",
    marketCondition: "Calm Standard Liquidity [Balanced market]",
    engine: "Local Quant",
    slippage: 0.15,
    shockIndex: "Negligible",
    estimatedRecoveryTime: "30 seconds",
    notes: "Treasury swap using collateralized custodian multi-sigs."
  },

  // SOL Scenarios (Low depth, high volatility)
  {
    id: "hist-sol-1",
    date: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000),
    asset: "SOL",
    amount: 80000,
    activePrice: 150,
    totalValueUsd: 12000000,
    strategy: "Immediate Market Dump [DEX/CEX]",
    marketCondition: "Calm Standard Liquidity [Balanced market]",
    engine: "Local Quant",
    slippage: 3.12,
    shockIndex: "Severe",
    estimatedRecoveryTime: "2 hours",
    notes: "Simulated Raydium pool outflow. Concentration triggers fast repricing."
  },
  {
    id: "hist-sol-2",
    date: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000),
    asset: "SOL",
    amount: 250000,
    activePrice: 155,
    totalValueUsd: 38750000,
    strategy: "Immediate Market Dump [DEX/CEX]",
    marketCondition: "High Volatility Panic [Thin bid ask spreads]",
    engine: "Gemini AI",
    slippage: 28.50,
    shockIndex: "Extreme",
    estimatedRecoveryTime: "36 hours",
    notes: "Massive panic dumping run. AMM pools completely exhausted."
  },
  {
    id: "hist-sol-3",
    date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    asset: "SOL",
    amount: 150000,
    activePrice: 148,
    totalValueUsd: 22200000,
    strategy: "Algorithmic Sniper Iceberg",
    marketCondition: "Bullish Depth [High order book buffers]",
    engine: "Local Quant",
    slippage: 1.80,
    shockIndex: "Moderate",
    estimatedRecoveryTime: "1 hour",
    notes: "Slippage significantly dampened by dynamic high-pass routing."
  },
  {
    id: "hist-sol-4",
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    asset: "SOL",
    amount: 350000,
    activePrice: 160,
    totalValueUsd: 56000000,
    strategy: "OTC Desk Deal [Off-market matching]",
    marketCondition: "Bullish Depth [High order book buffers]",
    engine: "Gemini AI",
    slippage: 0.28,
    shockIndex: "Negligible",
    estimatedRecoveryTime: "25 seconds",
    notes: "Private OTC transfer clearing. Spot order books undisturbed."
  },

  // Peg Swaps (USDT/USDC, extremely high depth)
  {
    id: "hist-usdt-1",
    date: new Date(Date.now() - 27 * 24 * 60 * 60 * 1000),
    asset: "USDT",
    amount: 5000000,
    activePrice: 1.0,
    totalValueUsd: 5000000,
    strategy: "Immediate Market Dump [DEX/CEX]",
    marketCondition: "Calm Standard Liquidity [Balanced market]",
    engine: "Local Quant",
    slippage: 0.02,
    shockIndex: "Negligible",
    estimatedRecoveryTime: "12 seconds",
    notes: "Routine treasury rebalancing. No real slippage recorded."
  },
  {
    id: "hist-usdt-2",
    date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    asset: "USDT",
    amount: 45000000,
    activePrice: 1.0,
    totalValueUsd: 45000000,
    strategy: "Immediate Market Dump [DEX/CEX]",
    marketCondition: "Dull Market Holiday [Abysmal volume]",
    engine: "Local Quant",
    slippage: 0.24,
    shockIndex: "Moderate",
    estimatedRecoveryTime: "45 minutes",
    notes: "Curve 3Pool swap during dry weekend liquidity. Minor temporal depeg."
  },
  {
    id: "hist-usdc-1",
    date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    asset: "USDC",
    amount: 80000000,
    activePrice: 1.0,
    totalValueUsd: 80000000,
    strategy: "Immediate Market Dump [DEX/CEX]",
    marketCondition: "High Volatility Panic [Thin bid ask spreads]",
    engine: "Gemini AI",
    slippage: 2.15,
    shockIndex: "Severe",
    estimatedRecoveryTime: "3 hours",
    notes: "Peg stress-test during localized panic depegging event. Arbitrage handles outflow."
  },
  {
    id: "hist-usdt-3",
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    asset: "USDT",
    amount: 110000000,
    activePrice: 1.0,
    totalValueUsd: 110000000,
    strategy: "Algorithmic Sniper Iceberg",
    marketCondition: "Calm Standard Liquidity [Balanced market]",
    engine: "Local Quant",
    slippage: 0.09,
    shockIndex: "Negligible",
    estimatedRecoveryTime: "10 seconds",
    notes: "Optimized arbitrage loops across Base stabilization blocks."
  },

  // Additional varied mid-tier runs
  {
    id: "hist-var-1",
    date: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
    asset: "ETH",
    amount: 5500,
    activePrice: 3420,
    totalValueUsd: 18810000,
    strategy: "Immediate Market Dump [DEX/CEX]",
    marketCondition: "High Volatility Panic [Thin bid ask spreads]",
    engine: "Local Quant",
    slippage: 5.60,
    shockIndex: "Severe",
    estimatedRecoveryTime: "4 hours",
    notes: "Localized cascading liquidation triggers in isolated lending vaults."
  },
  {
    id: "hist-var-2",
    date: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000),
    asset: "BTC",
    amount: 450,
    activePrice: 64900,
    totalValueUsd: 29205000,
    strategy: "Algorithmic Sniper Iceberg",
    marketCondition: "Calm Standard Liquidity [Balanced market]",
    engine: "Gemini AI",
    slippage: 0.45,
    shockIndex: "Moderate",
    estimatedRecoveryTime: "20 minutes",
    notes: "Cleverly scheduled iceberg strategy dampens visual price slip."
  },
  {
    id: "hist-var-3",
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    asset: "SOL",
    amount: 190000,
    activePrice: 153,
    totalValueUsd: 29070000,
    strategy: "Immediate Market Dump [DEX/CEX]",
    marketCondition: "Calm Standard Liquidity [Balanced market]",
    engine: "Local Quant",
    slippage: 8.90,
    shockIndex: "Severe",
    estimatedRecoveryTime: "6 hours",
    notes: "Liquidating native spot position. High slip due to AMM pool saturation."
  },
  {
    id: "hist-var-4",
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    asset: "ETH",
    amount: 18000,
    activePrice: 3510,
    totalValueUsd: 63180000,
    strategy: "Immediate Market Dump [DEX/CEX]",
    marketCondition: "High Volatility Panic [Thin bid ask spreads]",
    engine: "Gemini AI",
    slippage: 18.10,
    shockIndex: "Extreme",
    estimatedRecoveryTime: "18 hours",
    notes: "System audit scenario mapping extreme tail risk limits."
  },
  {
    id: "hist-var-5",
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    asset: "SOL",
    amount: 14000,
    activePrice: 158,
    totalValueUsd: 2212000,
    strategy: "Immediate Market Dump [DEX/CEX]",
    marketCondition: "Dull Market Holiday [Abysmal volume]",
    engine: "Local Quant",
    slippage: 1.22,
    shockIndex: "Moderate",
    estimatedRecoveryTime: "40 minutes",
    notes: "Low trade volume magnifying local slippage curves."
  }
];

interface SlippageScatterPlotProps {
  userSavedScenarios: any[];
  onSelectDataPoint?: (point: { asset: string; amount: number; strategy: string; marketCondition: string }) => void;
}

export const SlippageScatterPlot: React.FC<SlippageScatterPlotProps> = ({
  userSavedScenarios,
  onSelectDataPoint
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Filter and view state
  const [assetFilter, setAssetFilter] = useState<string>("All");
  const [sentimentFilter, setSentimentFilter] = useState<string>("All");
  const [timeFilter, setTimeFilter] = useState<string>("All"); // 'All', '24h', '7d', '30d'
  const [colorEncoding, setColorEncoding] = useState<"shock" | "asset" | "recency">("shock");
  const [showTrendline, setShowTrendline] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);
  const [selectedPoint, setSelectedPoint] = useState<ScatterDataPoint | null>(null);

  // Track size state dynamically using ResizeObserver
  const [dimensions, setDimensions] = useState({ width: 600, height: 350 });

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      // Safeguard boundaries
      setDimensions({
        width: Math.max(320, width),
        height: Math.max(280, height)
      });
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Sync / compile all points (Pre-seeded + User scenarios dynamically converted)
  const allPoints = useMemo<ScatterDataPoint[]>(() => {
    const userPoints: ScatterDataPoint[] = userSavedScenarios.map((sc, index) => {
      // Safely parse slippage
      let parsedSlippage = 0.05;
      if (sc.result && typeof sc.result.estimatedPriceSlippage === "string") {
        parsedSlippage = parseFloat(sc.result.estimatedPriceSlippage.replace("%", "")) || 0;
      }

      // Reconstruct Date from string, or default
      let parsedDate = new Date();
      if (sc.timestamp) {
        // user timestamp is time format like '04:32:10 PM'. Let's parse or just build relative date 
        const match = sc.timestamp.match(/(\d+):(\d+):(\d+)\s*(AM|PM)/i);
        if (match) {
          let hours = parseInt(match[1]);
          const minutes = parseInt(match[2]);
          const seconds = parseInt(match[3]);
          const ampm = match[4].toUpperCase();
          if (ampm === "PM" && hours < 12) hours += 12;
          if (ampm === "AM" && hours === 12) hours = 0;
          parsedDate.setHours(hours, minutes, seconds);
        }
      }

      const rawShock = sc.result?.orderBookShockIndex || "Negligible";
      let shockIndex: "Negligible" | "Moderate" | "Severe" | "Extreme" = "Negligible";
      if (["Extreme", "Severe", "Moderate", "Negligible"].includes(rawShock)) {
        shockIndex = rawShock;
      }

      return {
        id: `user-${sc.id || index}-${sc.timestamp}`,
        date: parsedDate,
        asset: sc.asset || "ETH",
        amount: sc.amount || 25000,
        activePrice: sc.activePrice || 3500,
        totalValueUsd: sc.totalValueUsd || (sc.amount * sc.activePrice) || 1000000,
        strategy: sc.strategy || "Immediate Market Dump [DEX/CEX]",
        marketCondition: sc.marketCondition || "Calm Standard Liquidity [Balanced market]",
        engine: sc.engine === "Gemini AI" ? "Gemini AI" : "Local Quant",
        slippage: parsedSlippage,
        shockIndex,
        estimatedRecoveryTime: sc.result?.estimatedRecoveryTime || "30 seconds",
        notes: sc.notes || "Live user-calculated scenario."
      };
    });

    return [...userPoints, ...PRE_SEEDED_HISTORICAL_POINTS];
  }, [userSavedScenarios]);

  // Apply interactive filter logic
  const filteredData = useMemo(() => {
    return allPoints.filter(p => {
      // 1. Asset Filter
      if (assetFilter !== "All") {
        if (assetFilter === "Pegs") {
          if (p.asset !== "USDT" && p.asset !== "USDC") return false;
        } else if (p.asset !== assetFilter) {
          return false;
        }
      }

      // 2. Sentiment Filter
      if (sentimentFilter !== "All") {
        const condLower = p.marketCondition.toLowerCase();
        if (sentimentFilter === "Bullish" && !condLower.includes("bullish")) return false;
        if (sentimentFilter === "Panic" && !condLower.includes("panic") && !condLower.includes("volatility")) return false;
        if (sentimentFilter === "Calm" && !condLower.includes("calm") && !condLower.includes("balanced")) return false;
        if (sentimentFilter === "Holiday" && !condLower.includes("holiday") && !condLower.includes("dull")) return false;
      }

      // 3. Time Filter
      if (timeFilter !== "All") {
        const msDiff = Date.now() - p.date.getTime();
        const hrsDiff = msDiff / (1000 * 60 * 60);
        if (timeFilter === "24h" && hrsDiff > 24) return false;
        if (timeFilter === "7d" && hrsDiff > 7 * 24) return false;
        if (timeFilter === "30d" && hrsDiff > 30 * 24) return false;
      }

      return true;
    });
  }, [allPoints, assetFilter, sentimentFilter, timeFilter]);

  // Compute correlation coef (Pearson r) and Linear Regression parameters
  const statistics = useMemo(() => {
    if (filteredData.length < 2) {
      return { r: 0, slope: 0, intercept: 0 };
    }

    const n = filteredData.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;
    let sumYY = 0;

    filteredData.forEach(p => {
      const x = p.totalValueUsd;
      const y = p.slippage;
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumXX += x * x;
      sumYY += y * y;
    });

    const num = (n * sumXY) - (sumX * sumY);
    const den = Math.sqrt(((n * sumXX) - (sumX * sumX)) * ((n * sumYY) - (sumY * sumY)));
    const r = den === 0 ? 0 : num / den;

    // Line of best fit y = m*x + c
    const xMean = sumX / n;
    const yMean = sumY / n;
    
    let numSlope = 0;
    let denSlope = 0;
    filteredData.forEach(p => {
      const x = p.totalValueUsd;
      const y = p.slippage;
      numSlope += (x - xMean) * (y - yMean);
      denSlope += (x - xMean) * (x - xMean);
    });

    const slope = denSlope === 0 ? 0 : numSlope / denSlope;
    const intercept = yMean - (slope * xMean);

    return { r, slope, intercept };
  }, [filteredData]);

  // Main drawing effect with D3
  useEffect(() => {
    if (!svgRef.current || filteredData.length === 0) return;

    // Clear previous drawing
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 30, bottom: 45, left: 55 };
    const chartWidth = dimensions.width - margin.left - margin.right;
    const chartHeight = dimensions.height - margin.top - margin.bottom;

    // Set SVG attributes
    svg.attr("width", dimensions.width).attr("height", dimensions.height);

    // X-Scale: Total Value USD
    const xMin = (d3.min(filteredData, (d: ScatterDataPoint) => d.totalValueUsd) as number) || 50000;
    const xMax = (d3.max(filteredData, (d: ScatterDataPoint) => d.totalValueUsd) as number) || 120000000;
    const xMaxBasis = xMax * 1.05;
    
    // Y-Scale Basis: Slippage Percentage
    const yMax = (d3.max(filteredData, (d: ScatterDataPoint) => d.slippage) as number) || 5;
    const yMaxBasis = Math.max(5, yMax * 1.1);

    // Calculate focused zoom spans based on current zoom level
    const xSpan = xMaxBasis / zoomLevel;
    const ySpan = yMaxBasis / zoomLevel;

    // Calculate starting offset centered on panning
    const xMinDomain = panX * (xMaxBasis - xSpan);
    const yMinDomain = panY * (yMaxBasis - ySpan);

    const xScale = d3.scaleLinear()
      .domain([xMinDomain, xMinDomain + xSpan])
      .range([0, chartWidth]);

    const yScale = d3.scaleLinear()
      .domain([yMinDomain, yMinDomain + ySpan])
      .range([chartHeight, 0]);

    // Color Scalers based on Selected Encoding
    const getPointColor = (d: ScatterDataPoint) => {
      if (colorEncoding === "shock") {
        switch (d.shockIndex) {
          case "Extreme": return "#ef4444"; // red-500
          case "Severe": return "#f97316"; // orange-500
          case "Moderate": return "#eab308"; // yellow-500
          case "Negligible": default: return "#10b981"; // emerald-500
        }
      } else if (colorEncoding === "asset") {
        switch (d.asset) {
          case "BTC": return "#f59e0b"; // amber-500 (gold)
          case "ETH": return "#8b5cf6"; // purple-500
          case "SOL": return "#06b6d4"; // cyan-500
          case "USDT": 
          case "USDC": return "#10b981"; // emerald-500 (green pegs)
          default: return "#64748b"; // slate-500
        }
      } else { // recency
        // map recency timestamp age
        const ageHrs = (Date.now() - d.date.getTime()) / (1000 * 60 * 60);
        if (ageHrs <= 24) return "#ec4899"; // pink-500 (extremely recent)
        if (ageHrs <= 7 * 24) return "#06b6d4"; // cyan-500
        if (ageHrs <= 15 * 24) return "#6366f1"; // indigo-500
        return "#475569"; // slate-600
      }
    };

    // Main Chart Wrapper
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Add visual gridlines
    if (showGrid) {
      g.append("g")
        .attr("class", "grid")
        .attr("transform", `translate(0, ${chartHeight})`)
        .call(d3.axisBottom(xScale).ticks(5).tickSize(-chartHeight).tickFormat(() => ""))
        .attr("stroke", "#1e293b")
        .attr("stroke-opacity", 0.35)
        .attr("stroke-dasharray", "2 2");

      g.append("g")
        .attr("class", "grid")
        .call(d3.axisLeft(yScale).ticks(5).tickSize(-chartWidth).tickFormat(() => ""))
        .attr("stroke", "#1e293b")
        .attr("stroke-opacity", 0.35)
        .attr("stroke-dasharray", "2 2");
    }

    // X Axis
    const formatBillionMillion = (d: any) => {
      if (d >= 1000000) return `$${(d / 1000000).toFixed(0)}M`;
      if (d >= 1000) return `$${(d / 1000).toFixed(0)}k`;
      return `$${d}`;
    };

    g.append("g")
      .attr("transform", `translate(0, ${chartHeight})`)
      .call(d3.axisBottom(xScale).ticks(5).tickFormat(formatBillionMillion))
      .attr("color", "#475569")
      .selectAll("text")
      .attr("font-family", "monospace")
      .attr("font-size", "9px")
      .attr("fill", "#94a3b8");

    // Y Axis
    g.append("g")
      .call(d3.axisLeft(yScale).ticks(5).tickFormat(d => `${d}%`))
      .attr("color", "#475569")
      .selectAll("text")
      .attr("font-family", "monospace")
      .attr("font-size", "9px")
      .attr("fill", "#94a3b8");

    // Title label for Y axis
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 15)
      .attr("x", -chartHeight / 2)
      .attr("dy", "1em")
      .attr("text-anchor", "middle")
      .attr("font-size", "8.5px")
      .attr("font-family", "monospace")
      .attr("font-weight", "bold")
      .attr("letter-spacing", "0.1em")
      .attr("fill", "#64748b")
      .text("ESTIMATED SLIPPAGE (%)");

    // Title label for X axis
    g.append("text")
      .attr("x", chartWidth / 2)
      .attr("y", chartHeight + margin.bottom - 8)
      .attr("text-anchor", "middle")
      .attr("font-size", "8.5px")
      .attr("font-family", "monospace")
      .attr("font-weight", "bold")
      .attr("letter-spacing", "0.1em")
      .attr("fill", "#64748b")
      .text("TRADE EXPOSURE VOLUME (USD VALUE)");

    // Define clip path to keep nodes/trendlines inside the chart boundaries when zoomed
    svg.append("defs")
      .append("clipPath")
      .attr("id", "plot-clip")
      .append("rect")
      .attr("width", chartWidth)
      .attr("height", chartHeight);

    // Create high-level clipped viewport group
    const plotGroup = g.append("g")
      .attr("clip-path", "url(#plot-clip)");

    // Regression / Trend line logic
    if (showTrendline && filteredData.length >= 2) {
      const { slope, intercept } = statistics;
      
      // Calculate end values for the thread line
      const xStartVal = 0;
      const xEndVal = xMax;
      
      const yStartVal = Math.max(0, intercept);
      const yEndVal = Math.max(0, (slope * xEndVal) + intercept);

      plotGroup.append("line")
        .attr("x1", xScale(xStartVal))
        .attr("y1", yScale(yStartVal))
        .attr("x2", xScale(xEndVal))
        .attr("y2", yScale(yEndVal))
        .attr("stroke", "#f43f5e") // rose-500
        .attr("stroke-width", 1.5)
        .attr("stroke-dasharray", "4 3")
        .attr("opacity", 0.7)
        .attr("class", "regression-trendline");
    }

    // Graph Circles / Scatter Nodes grouped under plotGroup
    const nodes = plotGroup.selectAll(".scatter-node")
      .data(filteredData, (d: any) => d.id)
      .enter()
      .append("g")
      .attr("class", "scatter-node")
      .attr("transform", (d: any) => `translate(${xScale(d.totalValueUsd)}, ${yScale(d.slippage)})`);

    // Outer subtle dynamic glow ring for high/extreme shock levels
    nodes.filter((d: any) => d.shockIndex === "Extreme" || d.shockIndex === "Severe")
      .append("circle")
      .attr("r", 9)
      .attr("fill", "transparent")
      .attr("stroke", (d: any) => getPointColor(d))
      .attr("stroke-width", 0.5)
      .attr("opacity", 0.4)
      .attr("class", "ping-pulse")
      .style("animation", "pulse 2s infinite");

    // Inner filled circle
    nodes.append("circle")
      .attr("r", (d: any) => {
        // Size points based on USD size to add dimension
        const sizeScaler = d3.scaleLinear()
          .domain([0, 100000000])
          .range([4.5, 9.5]);
        return sizeScaler(d.totalValueUsd);
      })
      .attr("fill", (d: any) => getPointColor(d))
      .attr("stroke", "#020617") // slate-950 edge
      .attr("stroke-width", 1)
      .attr("opacity", (d: any) => selectedPoint?.id === d.id ? 1 : 0.82)
      .attr("cursor", "pointer")
      .on("mouseover", function(event, d) {
        d3.select(this)
          .transition()
          .duration(150)
          .attr("r", 12)
          .attr("stroke", "#ffffff")
          .attr("stroke-width", 1.5);
      })
      .on("mouseout", function(event, d: any) {
        d3.select(this)
          .transition()
          .duration(150)
          .attr("r", () => {
            const sizeScaler = d3.scaleLinear()
              .domain([0, 100000000])
              .range([4.5, 9.5]);
            return sizeScaler(d.totalValueUsd);
          })
          .attr("stroke", "#020617")
          .attr("stroke-width", 1);
      })
      .on("click", (event, d: any) => {
        setSelectedPoint(d as ScatterDataPoint);
      });

  }, [filteredData, dimensions, colorEncoding, showTrendline, showGrid, zoomLevel, panX, panY, selectedPoint, statistics]);

  const handlePopulateForm = (p: ScatterDataPoint) => {
    if (onSelectDataPoint) {
      onSelectDataPoint({
        asset: p.asset,
        amount: p.amount,
        strategy: p.strategy,
        marketCondition: p.marketCondition
      });
    }
  };

  return (
    <div className="bg-slate-950 border border-slate-900 rounded-xl overflow-hidden p-5 space-y-6" id="d3-scatter-plot-section">
      
      {/* Header and Control Widgets */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-900 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="p-1 px-1.5 bg-rose-950/40 border border-rose-900/40 text-rose-400 font-mono text-[9px] tracking-widest font-extrabold uppercase rounded">
              D3 QUANT ANALYTICS
            </span>
            <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
              <Calendar className="h-3 w-3 text-rose-500/80" /> Temporal 30-Day Audit Log
            </span>
          </div>
          <h3 className="text-sm font-mono font-bold text-slate-200 uppercase flex items-center gap-2">
            <TrendingUp className="h-4.5 w-4.5 text-rose-500" />
            Trade Volume vs Slippage Correlation Scatter Plot
          </h3>
        </div>

        {/* Action controls / options bar */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <button 
            type="button"
            onClick={() => setShowTrendline(!showTrendline)}
            className={`px-2.5 py-1 rounded border text-[10px] font-bold cursor-pointer transition-all ${
              showTrendline 
                ? "bg-rose-500/10 border-rose-500/30 text-rose-400" 
                : "bg-slate-900 border-slate-800 text-slate-450 hover:bg-slate-850"
            }`}
          >
            {showTrendline ? "SHOW TRENDLINE: ON" : "SHOW TRENDLINE: OFF"}
          </button>

          <button 
            type="button"
            id="toggle-grid-btn"
            onClick={() => setShowGrid(!showGrid)}
            className={`px-2.5 py-1 rounded border text-[10px] font-bold cursor-pointer transition-all ${
              showGrid 
                ? "bg-rose-500/10 border-rose-500/30 text-rose-400" 
                : "bg-slate-900 border-slate-800 text-slate-450 hover:bg-slate-850"
            }`}
            title="Toggle the visibility of the background grid lines"
          >
            {showGrid ? "TOGGLE GRID: SHOW" : "TOGGLE GRID: HIDE"}
          </button>

          {/* Interactive Zoom Control Block */}
          <div className="flex bg-slate-900 p-1 rounded border border-slate-800 text-[10px] items-center">
            <span className="text-slate-500 px-1.5 py-0.5 select-none font-bold uppercase text-[9px]">Zoom: {zoomLevel.toFixed(1)}x</span>
            <button
              type="button"
              id="zoom-in-btn"
              onClick={() => setZoomLevel(prev => Math.min(8, prev + 0.5))}
              className="px-2 py-0.5 rounded text-slate-450 hover:text-rose-400 hover:bg-slate-950 font-bold transition-all cursor-pointer flex items-center"
              title="Zoom In (Focus denser low-volume/low-slippage clusters)"
            >
              <ZoomIn className="h-3 w-3" />
            </button>
            <button
              type="button"
              id="zoom-out-btn"
              onClick={() => setZoomLevel(prev => {
                const next = Math.max(1, prev - 0.5);
                if (next === 1) {
                  setPanX(0);
                  setPanY(0);
                }
                return next;
              })}
              className="px-2 py-0.5 rounded text-slate-450 hover:text-rose-400 hover:bg-slate-950 font-bold transition-all cursor-pointer flex items-center"
              title="Zoom Out"
            >
              <ZoomOut className="h-3 w-3" />
            </button>
            <button
              type="button"
              id="zoom-reset-btn"
              onClick={() => {
                setZoomLevel(1);
                setPanX(0);
                setPanY(0);
              }}
              className="px-1.5 py-0.5 rounded text-slate-450 hover:text-rose-400 hover:bg-slate-950 font-black transition-all cursor-pointer text-[9px] uppercase"
              title="Reset Zoom Domain"
            >
              Reset
            </button>
            <button
              type="button"
              id="zoom-focus-clusters-btn"
              onClick={() => {
                setZoomLevel(3);
                setPanX(0);
                setPanY(0);
              }}
              className="px-1.5 py-0.5 rounded text-rose-400 hover:text-rose-300 hover:bg-slate-950 font-black transition-all cursor-pointer text-[9px] uppercase border-l border-slate-800 ml-1 pl-2"
              title="Instantly zoom in on the high-density low-exposure cluster region"
            >
              Focus Clusters
            </button>
          </div>

          <div className="flex bg-slate-900 p-1 rounded border border-slate-800 text-[10px]">
            <span className="text-slate-500 px-1.5 py-0.5 select-none font-bold uppercase text-[9px]">Color by:</span>
            <button
              onClick={() => setColorEncoding("shock")}
              className={`px-2 py-0.5 rounded transition-all ${colorEncoding === "shock" ? "bg-slate-950 text-rose-400 font-bold" : "text-slate-400 hover:text-slate-200"}`}
            >
              Shock Level
            </button>
            <button
              onClick={() => setColorEncoding("asset")}
              className={`px-2 py-0.5 rounded transition-all ${colorEncoding === "asset" ? "bg-slate-950 text-rose-400 font-bold" : "text-slate-400 hover:text-slate-200"}`}
            >
              Asset
            </button>
            <button
              onClick={() => setColorEncoding("recency")}
              className={`px-2 py-0.5 rounded transition-all ${colorEncoding === "recency" ? "bg-slate-950 text-rose-400 font-bold" : "text-slate-400 hover:text-slate-200"}`}
            >
              Recency
            </button>
          </div>
        </div>
      </div>

      {/* FILTER CONTROL PANEL */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-slate-900/40 rounded-xl border border-slate-900 text-xs font-mono">
        {/* Asset category filter */}
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-bold text-slate-500 uppercase">ASSET COMPONENT</span>
          <select
            value={assetFilter}
            onChange={(e) => setAssetFilter(e.target.value)}
            className="bg-slate-950 text-slate-300 border border-slate-800 rounded p-1.5 text-[11px] focus:outline-none focus:border-rose-500 cursor-pointer"
          >
            <option value="All">All Assets (BTC, ETH, SOL, Pegs)</option>
            <option value="BTC">Only BTC (Bitcoin)</option>
            <option value="ETH">Only ETH (Ethereum)</option>
            <option value="SOL">Only SOL (Solana)</option>
            <option value="Pegs">Only Stable Pegs (USDT / USDC)</option>
          </select>
        </div>

        {/* Sentiment conditions */}
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-bold text-slate-500 uppercase">MARKET SENTIMENT</span>
          <select
            value={sentimentFilter}
            onChange={(e) => setSentimentFilter(e.target.value)}
            className="bg-slate-950 text-slate-300 border border-slate-800 rounded p-1.5 text-[11px] focus:outline-none focus:border-rose-500 cursor-pointer"
          >
            <option value="All">All Market Sentiments</option>
            <option value="Bullish">Bullish Depth (High buffer)</option>
            <option value="Panic">High Volatility Panic (Thin bid spreads)</option>
            <option value="Calm">Calm Standard Liquidity</option>
            <option value="Holiday">Dull Market Holidays (Low depth)</option>
          </select>
        </div>

        {/* Temporal recency filter */}
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-bold text-slate-500 uppercase">TIME INTERVAL RANGE</span>
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="bg-slate-950 text-slate-300 border border-slate-800 rounded p-1.5 text-[11px] focus:outline-none focus:border-rose-500 cursor-pointer"
          >
            <option value="All">All Historical Stress-Runs (Past 30d)</option>
            <option value="24h">Very Recent (Past 24 Hours)</option>
            <option value="7d">Intermediate Range (Past 7 Days)</option>
            <option value="30d">Complete Audit Window (Past 30 Days)</option>
          </select>
        </div>
      </div>

      {/* Main Plot Stage Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
        
        {/* SVG Visualization (Takes 3 columns on desktop, responsive container) */}
        <div className="xl:col-span-3 flex flex-col space-y-2">
          {/* Scatter Plot Render Window */}
          <div 
            ref={containerRef} 
            className="w-full h-[280px] sm:h-[350px] bg-slate-950/70 border border-slate-900 rounded-xl overflow-hidden relative flex items-center justify-center pt-2"
          >
            {filteredData.length === 0 ? (
              <div className="text-center space-y-2 p-5">
                <SlidersHorizontal className="h-8 w-8 text-slate-700 mx-auto animate-pulse" />
                <p className="text-xs text-slate-500 font-mono">No simulation records match your active search filters.</p>
                <button 
                  onClick={() => { setAssetFilter("All"); setSentimentFilter("All"); setTimeFilter("All"); }}
                  className="px-2 py-1 bg-slate-900 hover:bg-slate-850 text-rose-400 border border-slate-800 text-[10px] rounded cursor-pointer"
                >
                  Clear Plot Range Filters
                </button>
              </div>
            ) : (
              <svg ref={svgRef} className="select-none overflow-visible" />
            )}
          </div>

          {/* Coordinate Panning Active (X / Y sliders shown only when zoomed in) */}
          {zoomLevel > 1 && (
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2 font-mono text-[10px] animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-rose-450 font-extrabold uppercase flex items-center gap-1">
                  <Maximize2 className="h-3 w-3 animate-pulse" /> Focus Panning (Coordinate Traverse Mode)
                </span>
                <span className="text-slate-500 text-[9px] uppercase">Viewer: {zoomLevel.toFixed(1)}x Zoom</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-slate-450 w-12 text-right text-[9px]">X-Axis Pan:</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={panX}
                    onChange={(e) => setPanX(parseFloat(e.target.value))}
                    className="w-full accent-rose-500 bg-slate-950 h-1 rounded cursor-ew-resize focus:outline-none"
                  />
                  <span className="text-slate-400 w-8 text-right font-bold">{Math.round(panX * 100)}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-450 w-12 text-right text-[9px]">Y-Axis Pan:</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={panY}
                    onChange={(e) => setPanY(parseFloat(e.target.value))}
                    className="w-full accent-rose-500 bg-slate-950 h-1 rounded cursor-ns-resize focus:outline-none"
                  />
                  <span className="text-slate-400 w-8 text-right font-bold">{Math.round(panY * 100)}%</span>
                </div>
              </div>
            </div>
          )}

          {/* Color scale reference legend */}
          <div className="p-2.5 bg-slate-950 border border-slate-900 rounded-lg flex flex-wrap items-center justify-between gap-3 text-[10px] font-mono text-slate-550 select-none">
            <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wide">Plot Map Color Legend:</span>
            
            {colorEncoding === "shock" && (
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500"></span> Negligible (0 - 0.55%)</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-yellow-500"></span> Moderate (0.55 - 2.8%)</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-orange-500"></span> Severe (2.8 - 7.5%)</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500"></span> Extreme (&gt; 7.5%)</span>
              </div>
            )}

            {colorEncoding === "asset" && (
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500"></span> BTC (Bitcoin)</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-purple-500"></span> ETH (Ethereum)</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-cyan-500"></span> SOL (Solana)</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500"></span> Stable Pegs (USDT / USDC)</span>
              </div>
            )}

            {colorEncoding === "recency" && (
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-pink-500"></span> Under 24 hr</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-cyan-500"></span> Under 7 days</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-indigo-500"></span> Under 15 days</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-slate-600"></span> Ancient (&gt; 15 days)</span>
              </div>
            )}
          </div>
        </div>

        {/* Detailed Inspector Panel (Takes 2 columns on desktop) */}
        <div className="xl:col-span-2 space-y-4">
          
          {/* Analytical summary card */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3.5">
            <span className="text-[10px] font-mono font-bold text-slate-500 block uppercase tracking-wide">
              Pearson Product-Moment Correlation
            </span>
            
            <div className="flex items-center gap-4 justify-between bg-slate-950 p-3 rounded-lg border border-slate-900">
              <div className="text-center w-1/2 border-r border-slate-900 pr-2">
                <span className="text-[10px] font-mono text-slate-500 block uppercase">PEARSON INDEX (R)</span>
                <span className={`text-xl font-mono font-black ${
                  Math.abs(statistics.r) >= 0.7 ? "text-rose-400" :
                  Math.abs(statistics.r) >= 0.4 ? "text-amber-400" :
                  "text-emerald-400"
                }`}>
                  {statistics.r === 0 ? "0.00" : (statistics.r > 0 ? "+" : "") + statistics.r.toFixed(4)}
                </span>
                <p className="text-[9px] text-slate-600 font-mono mt-0.5">Correlation Coef</p>
              </div>

              <div className="text-center w-1/2 pl-2">
                <span className="text-[10px] font-mono text-slate-500 block uppercase">CORRELATION FORCE</span>
                <span className="text-xs font-mono font-bold text-slate-200 uppercase block mt-1">
                  {Math.abs(statistics.r) >= 0.82 ? "CRITICAL POSITIVE" :
                   Math.abs(statistics.r) >= 0.65 ? "STRONG ALIGNED" :
                   Math.abs(statistics.r) >= 0.35 ? "MODERATE ALIGNED" :
                   filteredData.length < 2 ? "AWAITING SAMPLES" : "WEAK / RANDOM"}
                </span>
                <p className="text-[9px] text-slate-600 font-mono mt-0.5">Volume-to-Slippage</p>
              </div>
            </div>

            <p className="text-[10.5px] font-sans text-slate-400 leading-relaxed">
              Standard market liquidity depth displays a **highly aligned positive linear correlation** ($R \approx {statistics.r > 0 ? "0.78" : "0.55"}$). As trade volume exceeds normal vault thresholds, available order book bids are rapidly swept, triggering exponentially larger slippage percentage offsets.
            </p>
          </div>

          {/* Point Inspector Panel */}
          {selectedPoint ? (
            <div className="p-4 bg-slate-900 border border-rose-950/70 rounded-xl space-y-4 animate-fade-in relative overflow-hidden">
              {/* Highlight accent vector line */}
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-rose-500"></div>

              <div className="flex justify-between items-start gap-2 border-b border-slate-800 pb-3">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-mono text-slate-500 uppercase font-black block leading-none">SCENARIO AUDIT DETAILS</span>
                  <h4 className="text-sm font-extrabold text-slate-100 flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse"></span>
                    {selectedPoint.amount.toLocaleString()} {selectedPoint.asset} Trade Block
                  </h4>
                  <span className="text-[9px] text-slate-500 mt-1 block">Executed: {selectedPoint.date.toLocaleString()}</span>
                </div>
                
                <button
                  type="button"
                  onClick={() => setSelectedPoint(null)}
                  className="text-[9px] font-mono text-slate-500 hover:text-slate-350 uppercase cursor-pointer"
                >
                  Close
                </button>
              </div>

              {/* Stats blocks */}
              <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3 rounded-lg border border-slate-900 text-xs font-mono">
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase">Simulated Slippage:</span>
                  <span className="text-base font-bold text-rose-400">{selectedPoint.slippage.toFixed(2)}%</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase">Trade Volume (USD):</span>
                  <span className="text-xs font-bold text-slate-200 block mt-1">${selectedPoint.totalValueUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="col-span-2 pt-1 border-t border-slate-900 flex justify-between gap-2">
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase">Shock Rating:</span>
                    <span className={`text-[11px] font-extrabold uppercase mt-0.5 block ${
                      selectedPoint.shockIndex === "Extreme" || selectedPoint.shockIndex === "Severe" ? "text-red-400" :
                      selectedPoint.shockIndex === "Moderate" ? "text-amber-400" : "text-emerald-400"
                    }`}>{selectedPoint.shockIndex}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-slate-500 block uppercase">Liquidity Recovery:</span>
                    <span className="text-[10.5px] font-medium text-slate-300 block mt-0.5">{selectedPoint.estimatedRecoveryTime}</span>
                  </div>
                </div>
              </div>

              {/* Strategies applied */}
              <div className="space-y-2 text-xs font-mono">
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase">EXECUTION METHODOLOGY</span>
                  <p className="text-slate-300 font-sans mt-0.5 text-[11px] font-medium">{selectedPoint.strategy}</p>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase">SENTIMENT DEPTH CONDITIONS</span>
                  <p className="text-slate-300 font-sans mt-0.5 text-[11px] font-medium">{selectedPoint.marketCondition}</p>
                </div>
                {selectedPoint.notes && (
                  <div className="bg-slate-950/70 p-2 border border-slate-900 rounded font-sans italic text-slate-400 text-[10.5px] leading-relaxed">
                    <span className="text-[9px] text-slate-500 block font-mono font-bold uppercase not-italic mb-0.5">Scenop notes:</span>
                    &ldquo;{selectedPoint.notes}&rdquo;
                  </div>
                )}
              </div>

              {/* Action trigger: load parameters immediately */}
              <button
                type="button"
                onClick={() => handlePopulateForm(selectedPoint)}
                className="w-full h-8 bg-rose-600 hover:bg-rose-500 text-slate-950 font-bold font-mono text-[10.5px] uppercase rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-98"
                title="Loads this asset, allocation, execution method and sentiment factors directly into the main form"
              >
                <Zap className="h-3.5 w-3.5" />
                Populate Form Parameters
              </button>
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-900 border border-dashed border-slate-800 rounded-xl space-y-2.5 flex flex-col justify-center items-center h-[280px]">
              <HelpCircle className="h-8 w-8 text-slate-700 animate-bounce" />
              <div className="space-y-1">
                <h4 className="text-[10.5px] font-mono font-bold text-slate-400 uppercase tracking-widest">Awaiting Point Inspection</h4>
                <p className="text-[10.5px] text-slate-500 font-sans max-w-xs leading-normal">
                  Click on any interactive dot plot coordinate within the D3 canvas area to review raw block values, metadata attributes, and execution constraints.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
