import React, { useEffect, useRef, useState, useMemo } from "react";
import * as d3 from "d3";
import { 
  Activity, 
  HelpCircle, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  Sliders, 
  Info, 
  Layers, 
  Flame, 
  ArrowRight,
  ShieldAlert,
  Compass
} from "lucide-react";

// Types
export interface HeatmapDataPoint {
  exchange: string;
  timeBucket: string;
  timeLabel: string;
  value: number; // For Net Flow (USD Millions): negative for outflow, positive for inflow
  activitySpeed: number; // For Heat Speed (transactions/sec): 0 to 100
  confidence: number; // Predicted confidence percentage (0 to 100)
  isPrediction: boolean;
  depthUSD: number; // Depth in millions of USD
  latencyMs: number; // API stream latency
}

const EXCHANGES = [
  "Binance Global",
  "Coinbase Prime",
  "OKX Leverage",
  "Kraken OTC",
  "Uniswap v3 (AMM)",
  "dYdX Protocol"
];

const TIME_BUCKETS = [
  { key: "t-12h", label: "T - 12h", desc: "12 hours ago", isPred: false },
  { key: "t-8h", label: "T - 8h", desc: "8 hours ago", isPred: false },
  { key: "t-4h", label: "T - 4h", desc: "4 hours ago", isPred: false },
  { key: "t-now", label: "T (Current)", desc: "Current Feed", isPred: false },
  { key: "t+4h", label: "T + 4h (AI)", desc: "4h AI Forecast", isPred: true },
  { key: "t+8h", label: "T + 8h (AI)", desc: "8h AI Forecast", isPred: true },
  { key: "t+12h", label: "T + 12h (AI)", desc: "12h AI Forecast", isPred: true },
  { key: "t+16h", label: "T + 16h (AI)", desc: "16h AI Forecast", isPred: true }
];

export const PredictiveLiquidityHeatmap: React.FC = () => {
  const [selectedAsset, setSelectedAsset] = useState<"BTC" | "ETH" | "SOL" | "STABLES">("BTC");
  const [visualizationMode, setVisualizationMode] = useState<"netFlow" | "heatSpeed">("netFlow");
  const [whaleInflowBoost, setWhaleInflowBoost] = useState<number>(30); // Dynamic injection modifier
  const [timeHorizonScale, setTimeHorizonScale] = useState<number>(1.2); // Forecast temperature modifier
  const [highlightedCell, setHighlightedCell] = useState<HeatmapDataPoint | null>(null);
  const [recalculating, setRecalculating] = useState<boolean>(false);
  const [triggerPulse, setTriggerPulse] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Generate dynamic heatmap dataset based on parameters
  const heatmapDataset = useMemo(() => {
    // Deterministic base seed depending on asset selected
    const getBaseValue = (exchange: string, timeBucket: string) => {
      let hash = 0;
      const combined = exchange + timeBucket + selectedAsset;
      for (let i = 0; i < combined.length; i++) {
        hash = combined.charCodeAt(i) + ((hash << 5) - hash);
      }
      return hash;
    };

    const dataset: HeatmapDataPoint[] = [];

    EXCHANGES.forEach((ex) => {
      TIME_BUCKETS.forEach((bucket) => {
        const hashSeed = getBaseValue(ex, bucket.key);
        
        // Net Value mock: -80 to +80
        let baseNetFlow = (hashSeed % 60); // range from -59 to 59
        
        // Activity Speed mock: 10 to 95
        let baseSpeed = Math.abs((hashSeed * 7) % 85) + 12;

        const isPred = bucket.isPred;
        let finalNetFlow = baseNetFlow;
        let finalSpeed = baseSpeed;
        
        // Staging dynamic interactive boosts
        if (isPred) {
          // Future predictions are warped by whale boost input and scale
          const timeIndex = TIME_BUCKETS.indexOf(bucket) - 3; // 1, 2, 3, 4
          const multiplier = 1 + (timeIndex * 0.15 * timeHorizonScale);
          
          finalNetFlow = baseNetFlow + (whaleInflowBoost * 1.8 * (1 / multiplier));
          finalSpeed = baseSpeed * (1 + (whaleInflowBoost / 150));
          
          if (finalNetFlow > 100) finalNetFlow = 98 - (hashSeed % 10);
          if (finalNetFlow < -100) finalNetFlow = -95 + (hashSeed % 10);
          if (finalSpeed > 100) finalSpeed = 100;
        } else {
          // Historical values affected slightly by current alerts
          finalNetFlow = baseNetFlow + (whaleInflowBoost * 0.3);
          if (finalNetFlow > 100) finalNetFlow = 95;
        }

        // Add some noise based on triggerPulse
        const pulseAdjustment = Math.sin(triggerPulse + (hashSeed % 10)) * 6;
        finalNetFlow = Number((finalNetFlow + pulseAdjustment).toFixed(1));
        finalSpeed = Math.round(Math.max(5, Math.min(100, finalSpeed + (pulseAdjustment * 0.4))));

        // Predict confidence decays over time
        const baseConfidence = isPred 
          ? Math.max(45, 92 - (TIME_BUCKETS.indexOf(bucket) - 3) * 12 * timeHorizonScale)
          : 100;
        const confidence = Number(baseConfidence.toFixed(0));

        // Depth estimates and latency
        const depthBase = Math.abs((hashSeed * 13) % 450) + 120;
        const finalDepth = Number(((depthBase + finalSpeed * 2 + Math.abs(finalNetFlow)) / 10).toFixed(1));
        const finalLatency = Math.abs((hashSeed * 3) % 45) + (isPred ? 0 : 5);

        dataset.push({
          exchange: ex,
          timeBucket: bucket.key,
          timeLabel: bucket.label,
          value: finalNetFlow,
          activitySpeed: finalSpeed,
          confidence,
          isPrediction: isPred,
          depthUSD: finalDepth,
          latencyMs: finalLatency
        });
      });
    });

    return dataset;
  }, [selectedAsset, whaleInflowBoost, timeHorizonScale, triggerPulse]);

  // Hook to automatically assign highlighted cell on first load or changes
  useEffect(() => {
    if (heatmapDataset.length > 0) {
      // Find the center current cell or the most premium prediction as default
      const defaultCell = heatmapDataset.find(d => d.exchange === "Binance Global" && d.timeBucket === "t-now") 
        || heatmapDataset[0];
      setHighlightedCell(defaultCell);
    }
  }, [selectedAsset]);

  // Simulation Recalculator Trigger Effect
  const handleRecalculate = () => {
    setRecalculating(true);
    setTimeout(() => {
      setTriggerPulse(prev => prev + 1);
      setRecalculating(false);
    }, 850);
  };

  // SVG Drawing Engine via D3 Hooks
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    // Responsive sizing
    const margin = { top: 38, right: 20, bottom: 42, left: 110 };
    const containerWidth = containerRef.current.clientWidth || 600;
    const height = 240; // Desktop-friendly height 

    // Clear previous artwork
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    svg
      .attr("width", containerWidth)
      .attr("height", height);

    const width = containerWidth - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const chartGroup = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Bands & Axes Setup
    const xValues = TIME_BUCKETS.map(d => d.label);
    const yValues = EXCHANGES;

    const xScale = d3.scaleBand()
      .domain(xValues)
      .range([0, width])
      .padding(0.08);

    const yScale = d3.scaleBand()
      .domain(yValues)
      .range([0, innerHeight])
      .padding(0.08);

    // Color Scales
    // 1. Diverging Net Flow Color Scheme (Outflow - Red, Low - Slate Gray Dark, Inflow - Emerald Light)
    const colorScaleNetFlow = d3.scaleLinear<string>()
      .domain([-100, -35, 0, 35, 100])
      .range(["#f43f5e", "#fda4af", "#111827", "#a7f3d0", "#10b981"]);

    // 2. Sequential Heat Speed Color Scheme (Cyberpunk Pink -> Indigo/Dark Violet)
    const colorScaleHeatSpeed = d3.scaleLinear<string>()
      .domain([0, 35, 70, 100])
      .range(["#030712", "#4338ca", "#a855f7", "#ec4899"]);

    // Axes Drawing
    const xAxis = d3.axisBottom(xScale).tickSize(4);
    const yAxis = d3.axisLeft(yScale).tickSize(4);

    // Render X Axis
    chartGroup.append("g")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(xAxis)
      .attr("class", "x-axis-grp")
      .selectAll("text")
      .attr("font-family", "JetBrains Mono, SFMono-Regular, monospace")
      .attr("font-size", "9px")
      .attr("fill", "#94a3b8")
      .attr("dy", "8px");

    svg.selectAll(".x-axis-grp path, .x-axis-grp line")
      .attr("stroke", "#334155")
      .attr("opacity", 0.5);

    // Render Y Axis
    chartGroup.append("g")
      .call(yAxis)
      .attr("class", "y-axis-grp")
      .selectAll("text")
      .attr("font-family", "Inter, system-ui, sans-serif")
      .attr("font-size", "10px")
      .attr("fill", "#cbd5e1")
      .attr("font-weight", "600");

    svg.selectAll(".y-axis-grp path, .y-axis-grp line")
      .attr("stroke", "#334155")
      .attr("opacity", 0.5);

    // Dynamic vertical delimiter for past vs. prediction
    const currentIdx = TIME_BUCKETS.findIndex(b => b.key === "t-now");
    const cutoffX = xScale(TIME_BUCKETS[currentIdx].label)! + xScale.bandwidth() + xScale.bandwidth() * 0.04;

    // Draw the Predictive separator line
    chartGroup.append("line")
      .attr("x1", cutoffX)
      .attr("y1", -15)
      .attr("x2", cutoffX)
      .attr("y2", innerHeight + 10)
      .attr("stroke", "#3b82f6")
      .attr("stroke-width", 1.8)
      .attr("stroke-dasharray", "4,3")
      .attr("opacity", 0.8)
      .attr("id", "cutoff-separator");

    // Cutoff Label Left side
    chartGroup.append("text")
      .attr("x", cutoffX - 5)
      .attr("y", -8)
      .attr("text-anchor", "end")
      .attr("font-family", "JetBrains Mono, monospace")
      .attr("font-size", "7.5px")
      .attr("fill", "#64748b")
      .attr("font-weight", "bold")
      .text("HISTORICAL HISTOGRAM");

    // Cutoff Label Right side
    chartGroup.append("text")
      .attr("x", cutoffX + 5)
      .attr("y", -8)
      .attr("text-anchor", "start")
      .attr("font-family", "JetBrains Mono, monospace")
      .attr("font-size", "7.5px")
      .attr("fill", "#3b82f6")
      .attr("font-weight", "bold")
      .text("● AI PREDICTION TIMELINE");

    // Draw the individual Heatmap blocks
    const cells = chartGroup.selectAll(".heatmap-cell")
      .data(heatmapDataset, (d: any) => d.exchange + ":" + d.timeBucket);

    // Enter & Draw cells
    cells.enter()
      .append("rect")
      .attr("class", "heatmap-cell cursor-pointer transition-all duration-300")
      .attr("x", (d: any) => xScale(d.timeLabel)!)
      .attr("y", (d: any) => yScale(d.exchange)!)
      .attr("width", xScale.bandwidth())
      .attr("height", yScale.bandwidth())
      .attr("rx", 3)
      .attr("ry", 3)
      .attr("stroke", (d: any) => 
        highlightedCell && d.exchange === highlightedCell.exchange && d.timeBucket === highlightedCell.timeBucket 
          ? "#f59e0b" // Orange highlight border for active cell
          : d.isPrediction ? "rgba(59, 130, 246, 0.15)" : "#0c0f17"
      )
      .attr("stroke-width", (d: any) => 
        highlightedCell && d.exchange === highlightedCell.exchange && d.timeBucket === highlightedCell.timeBucket 
          ? 2.2 
          : 0.8
      )
      .attr("fill", (d: any) => {
        if (visualizationMode === "netFlow") {
          return colorScaleNetFlow(d.value);
        } else {
          return colorScaleHeatSpeed(d.activitySpeed);
        }
      })
      .attr("opacity", 0.95)
      .on("mouseover", function(event, d: any) {
        // Highlight square temporarily and scale it slightly
        d3.select(this)
          .attr("opacity", 1)
          .attr("stroke", "#38bdf8")
          .attr("stroke-width", 1.8);
      })
      .on("mouseout", function(event, d: any) {
        const isSelected = highlightedCell && d.exchange === highlightedCell.exchange && d.timeBucket === highlightedCell.timeBucket;
        d3.select(this)
          .attr("opacity", 0.95)
          .attr("stroke", isSelected ? "#f59e0b" : d.isPrediction ? "rgba(59, 130, 246, 0.15)" : "#0c0f17")
          .attr("stroke-width", isSelected ? 2.2 : 0.8);
      })
      .on("click", (event, d: any) => {
        setHighlightedCell(d);
      })
      // Staggered entering transition matching cyber vibes
      .style("opacity", 0)
      .transition()
      .duration(350)
      .delay((d: any, i) => i * 6)
      .style("opacity", 0.95);

    // Add value labels to individual cell rectangles if width permits
    if (xScale.bandwidth() > 32) {
      chartGroup.selectAll(".cell-text")
        .data(heatmapDataset)
        .enter()
        .append("text")
        .attr("class", "cell-text pointer-events-none")
        .attr("x", (d: any) => xScale(d.timeLabel)! + xScale.bandwidth() / 2)
        .attr("y", (d: any) => yScale(d.exchange)! + yScale.bandwidth() / 2 + 3.5)
        .attr("text-anchor", "middle")
        .attr("font-family", "JetBrains Mono, monospace")
        .attr("font-size", "8.5px")
        .attr("font-weight", "600")
        .attr("fill", (d: any) => {
          // Calculate high-contrast colors dynamically
          if (visualizationMode === "netFlow") {
            return Math.abs(d.value) > 40 ? "#0f172a" : "#cbd5e1";
          } else {
            return d.activitySpeed > 60 ? "#fff" : "#94a3b8";
          }
        })
        .text((d: any) => {
          if (visualizationMode === "netFlow") {
            return `${d.value > 0 ? "+" : ""}${Math.round(d.value)}`;
          } else {
            return `${d.activitySpeed}%`;
          }
        });
    }

  }, [heatmapDataset, visualizationMode, highlightedCell, triggerPulse]);

  // Handle automatic simulation tick
  const simulateLiveEvent = (type: "HUGE_INFLOW" | "HUGE_OUTFLOW" | "STANDBY") => {
    if (type === "HUGE_INFLOW") {
      setWhaleInflowBoost(prev => Math.min(100, prev + 25));
    } else if (type === "HUGE_OUTFLOW") {
      setWhaleInflowBoost(prev => Math.max(-100, prev - 25));
    } else {
      setWhaleInflowBoost(0);
      setTimeHorizonScale(1.0);
    }
    handleRecalculate();
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4 relative overflow-hidden" id="predictive-liquidity-heatmap-section">
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Title & Panel Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-900 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black tracking-widest font-mono text-cyan-405 bg-cyan-950 border border-cyan-900/60 px-2 py-0.5 rounded">
              D3 CONVOLVED ENGINE
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-ping"></span>
            <span className="text-[9px] text-slate-500 font-mono">QUANTIFACTS PREDICTIVE PIPELINE</span>
          </div>
          <h3 className="text-sm font-black font-mono text-white tracking-tight uppercase flex items-center gap-2">
            <Activity className="h-4.5 w-4.5 text-blue-500" />
            D3 Predictive Heatmap: Asset Flow & Liquidity Intensity / 跨交易所流动性流速预测沙盘
          </h3>
          <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
            Predicts future high-cap volume clusters by synthesizing on-chain mempool velocity, historical Gini delta, and cross-market OTC books. Click on tiles to parse raw depth statistics.
          </p>
        </div>

        {/* Quick Toggles */}
        <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto">
          {/* Asset Selection */}
          <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800 text-[10px] font-mono">
            {(["BTC", "ETH", "SOL", "STABLES"] as const).map(asset => (
              <button
                key={asset}
                onClick={() => setSelectedAsset(asset)}
                className={`px-2.5 py-1 rounded font-bold transition-all ${
                  selectedAsset === asset 
                    ? "bg-slate-950 text-sky-400 shadow" 
                    : "text-slate-500 hover:text-slate-350"
                }`}
              >
                {asset}
              </button>
            ))}
          </div>

          {/* Viz Mode Selection */}
          <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800 text-[10px] font-mono">
            <button
              onClick={() => setVisualizationMode("netFlow")}
              className={`px-2.5 py-1 rounded font-bold flex items-center gap-1 transition-all ${
                visualizationMode === "netFlow" 
                  ? "bg-blue-600 text-slate-950" 
                  : "text-slate-400 hover:text-slate-300"
              }`}
              title="Visualize Net Capital Flow in Millions USD"
            >
              <Compass className="h-3 w-3" />
              NET FLOW
            </button>
            <button
              onClick={() => setVisualizationMode("heatSpeed")}
              className={`px-2.5 py-1 rounded font-bold flex items-center gap-1 transition-all ${
                visualizationMode === "heatSpeed" 
                  ? "bg-pink-650 text-white" 
                  : "text-slate-400 hover:text-slate-300"
              }`}
              title="Visualize Transaction Activity Frequency"
            >
              <Flame className="h-3 w-3" />
              HEAT SPEED
            </button>
          </div>
        </div>
      </div>

      {/* MAIN LAYOUT: Split View of Heatmap Matrix Map and Selected Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* Left Column (col-span-8): D3 SVG Canvas Container */}
        <div className="lg:col-span-8 space-y-3 flex flex-col justify-between">
          <div 
            ref={containerRef} 
            className="w-full bg-slate-950/80 p-2.5 rounded-xl border border-slate-900 relative overflow-x-auto min-h-[250px]"
            style={{ scrollbarWidth: 'thin' }}
          >
            {recalculating && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[1px] flex flex-col items-center justify-center z-30 font-mono space-y-2">
                <RefreshCw className="h-6 w-6 text-cyan-400 animate-spin" />
                <span className="text-[10px] text-slate-300 uppercase tracking-widest font-black">
                  CONVOLVING FLOW GAUSSIAN DISTRIBUTIONS...
                </span>
              </div>
            )}
            
            <svg ref={svgRef} className="mx-auto block"></svg>
          </div>

          {/* LEGEND BLOCK */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/30 p-2.5 rounded-lg border border-slate-900/60 text-[9.5px] font-mono">
            {visualizationMode === "netFlow" ? (
              <div className="flex items-center gap-2">
                <span className="text-slate-500 uppercase">Flow Intensity Scale:</span>
                <span className="text-rose-500 font-bold">Heavy Outflow (-$100M)</span>
                <div className="w-28 h-2 bg-gradient-to-r from-rose-500 via-slate-900 to-emerald-500 rounded"></div>
                <span className="text-emerald-500 font-bold">Heavy Inflow (+$100M)</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-slate-500 uppercase">Activity Frequency Rate:</span>
                <span className="text-slate-450 font-medium">Low Idle (0 Hz)</span>
                <div className="w-28 h-2 bg-gradient-to-r from-gray-900 via-indigo-600 via-purple-500 to-pink-500 rounded"></div>
                <span className="text-pink-500 font-bold">Extreme Flurry (100 Hz)</span>
              </div>
            )}

            <span className="text-slate-500 font-sans italic text-[9px]">
              *Click on any grid tile to load deep analytics payload inside the right console panel.
            </span>
          </div>
        </div>

        {/* Right Column (col-span-4): Selected Cell Inspector & Calibration Controls */}
        <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
          
          {/* INSPECTOR PANEL */}
          <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 space-y-3 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-900 pb-2 mb-2">
                <span className="text-[9px] font-black text-cyan-405 uppercase font-mono tracking-wider">
                  🎯 Flow Node Intel Inspector
                </span>
                <span className="text-[8px] text-slate-550 font-mono">SEC RECTANGLE CLASSIFIER</span>
              </div>

              {highlightedCell ? (
                <div className="space-y-2.5 font-mono">
                  {/* Exchange and time headers */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase">{highlightedCell.exchange}</h4>
                      <p className="text-[8.5px] text-slate-500 font-sans">{highlightedCell.timeBucket === "t-now" ? "Live Stream Snapshot" : `Interval: ${highlightedCell.timeLabel}`}</p>
                    </div>
                    <span className={`text-[8.5px] px-2 py-0.5 rounded font-black ${
                      highlightedCell.isPrediction ? "bg-blue-950 text-blue-400 border border-blue-900/50" : "bg-slate-900 text-slate-400"
                    }`}>
                      {highlightedCell.isPrediction ? "AI FORECAST" : "REALTIME AUDIT"}
                    </span>
                  </div>

                  {/* Core heat and net metrics */}
                  <div className="grid grid-cols-2 gap-2 text-center pt-1">
                    <div className="bg-slate-900/50 p-2 rounded border border-slate-850">
                      <span className="text-[8px] text-slate-500 block uppercase">Net Liquid Flow</span>
                      <span className={`text-sm font-black ${
                        highlightedCell.value > 0 ? "text-emerald-400" : highlightedCell.value < 0 ? "text-rose-400" : "text-slate-400"
                      }`}>
                        {highlightedCell.value > 0 ? "+" : ""}{highlightedCell.value}M USD
                      </span>
                    </div>

                    <div className="bg-slate-900/50 p-2 rounded border border-slate-850">
                      <span className="text-[8px] text-slate-500 block uppercase">Activity Speed</span>
                      <span className="text-sm font-black text-indigo-400 flex items-center justify-center gap-1">
                        <Flame className="h-3.5 w-3.5 fill-indigo-500/20" />
                        {highlightedCell.activitySpeed} Hz
                      </span>
                    </div>
                  </div>

                  {/* Depth, Latency, and Confidence metrics */}
                  <div className="space-y-1.5 text-[10px] bg-slate-900/30 p-2 rounded.5 border border-slate-900 border-dashed">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Predicted Confidence:</span>
                      <span className={`font-semibold ${
                        highlightedCell.confidence > 80 ? "text-emerald-400" : highlightedCell.confidence > 60 ? "text-amber-400" : "text-red-400"
                      }`}>{highlightedCell.confidence}%</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500">2% Liquidity Depth:</span>
                      <span className="text-slate-350 font-bold">${highlightedCell.depthUSD.toFixed(1)}M USD</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500">Network Sync Latency:</span>
                      <span className="text-slate-350">{highlightedCell.latencyMs} ms</span>
                    </div>
                  </div>

                  <p className="text-[10px] font-sans text-slate-400 leading-relaxed pt-0.5 border-t border-slate-900">
                    {highlightedCell.isPrediction ? (
                      <span>Synthesized predictive volatility models expect a <strong className={highlightedCell.value >= 0 ? "text-emerald-405" : "text-rose-405"}>{highlightedCell.value >= 0 ? "bullish liquidity accumulation" : "protective distribution sweep"}</strong> due to macro delta pressure inside {highlightedCell.exchange}.</span>
                    ) : (
                      <span>Validated exchange spot telemetry indicates steady organic balances. No abnormal dark pool sweeps are currently bypassing native ledger hooks.</span>
                    )}
                  </p>
                </div>
              ) : (
                <div className="text-center py-8 font-mono text-[10px] text-slate-500">
                  Select key nodes on the D3 Heatmap grid to inspect details of exchange flow vectors.
                </div>
              )}
            </div>

            {/* Simulated Signal Ingestion buttons */}
            <div className="border-t border-slate-900 pt-3 mt-1">
              <span className="text-[8px] font-extrabold text-slate-500 uppercase block font-mono mb-2">
                📡 SIMULATED SIGNAL INGESTION CODES
              </span>
              <div className="grid grid-cols-3 gap-1.5 font-mono text-[8.5px]">
                <button
                  onClick={() => simulateLiveEvent("HUGE_INFLOW")}
                  className="py-1 px-1.5 bg-emerald-950/50 border border-emerald-900/60 text-emerald-400 rounded hover:bg-emerald-900/40 hover:text-emerald-300 transition active:scale-95 cursor-pointer text-center font-bold"
                  title="Inject huge Whale deposit signal wave"
                >
                  ▲ INFLOW INJECT
                </button>
                <button
                  onClick={() => simulateLiveEvent("HUGE_OUTFLOW")}
                  className="py-1 px-1.5 bg-red-950/50 border border-red-900/60 text-rose-400 rounded hover:bg-red-900/40 hover:text-rose-300 transition active:scale-95 cursor-pointer text-center font-bold"
                  title="Inject huge Whale withdrawal panic wave"
                >
                  ▼ OUTFLOW SWEEP
                </button>
                <button
                  onClick={() => simulateLiveEvent("STANDBY")}
                  className="py-1 px-1.5 bg-slate-900 border border-slate-800 text-slate-300 rounded hover:bg-slate-800 transition active:scale-95 cursor-pointer text-center"
                  title="Restore model to baseline parameters"
                >
                  ◆ RESET MATRIX
                </button>
              </div>
            </div>
          </div>

          {/* SIMULATED MODEL CONFIGURATORS */}
          <div className="bg-slate-955 p-3 rounded-xl border border-slate-900 space-y-2.5 font-mono text-[9px]">
            <span className="text-[8px] font-black font-mono text-blue-400 uppercase tracking-widest block flex items-center gap-1">
              <Sliders className="h-3 w-3" />
              Machine Learning Parameter Tuning
            </span>

            {/* Slider 1: Whale deposit injection strength override */}
            <div className="space-y-1">
              <div className="flex justify-between text-slate-400 font-semibold">
                <span>Whale Influx Modifier:</span>
                <span className="text-cyan-405 font-bold">{whaleInflowBoost > 0 ? `+${whaleInflowBoost}` : whaleInflowBoost}%</span>
              </div>
              <input
                type="range"
                min="-60"
                max="80"
                step="5"
                value={whaleInflowBoost}
                onChange={(e) => setWhaleInflowBoost(parseInt(e.target.value))}
                className="w-full accent-blue-500 bg-slate-900 h-1 rounded outline-none cursor-pointer"
              />
            </div>

            {/* Slider 2: AI prediction time decay rate (prediction temperature) */}
            <div className="space-y-1">
              <div className="flex justify-between text-slate-400 font-semibold">
                <span>Decay Rate (AI Temperature):</span>
                <span className="text-cyan-405 font-bold">{timeHorizonScale.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={timeHorizonScale}
                onChange={(e) => setTimeHorizonScale(parseFloat(e.target.value))}
                className="w-full accent-blue-500 bg-slate-900 h-1 rounded outline-none cursor-pointer"
              />
            </div>
            
            <button
              onClick={handleRecalculate}
              disabled={recalculating}
              className="w-full py-1.5 bg-blue-650 hover:bg-blue-500 text-slate-950 font-black rounded uppercase text-center flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer border border-transparent disabled:opacity-40"
            >
              <RefreshCw className={`h-3 w-3 ${recalculating ? "animate-spin" : ""}`} />
              RECALCULATE FORECASTS
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
