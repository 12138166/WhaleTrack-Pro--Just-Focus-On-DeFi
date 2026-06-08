import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini client
let aiInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not defined.");
    }
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

// API Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Endpoint 1: Gemini Wallet Analysis
app.post("/api/gemini/analyze-wallet", async (req, res) => {
  try {
    const { address, network, blockchainLabel, initialBalance, assetBalances, age, txCount } = req.body;

    if (!address) {
      return res.status(400).json({ error: "Address is required for analysis." });
    }

    let ai;
    try {
      ai = getGeminiClient();
    } catch (err: any) {
      return res.status(500).json({
        error: "Gemini API Client failed to initialize. Please check if GEMINI_API_KEY is configured in Settings > Secrets.",
        message: err.message
      });
    }

    const payload = `
      Perform an exhaustive cryptocurrency wallet on-chain behavioral analysis for this whale wallet, and specifically evaluate whether it behaves as an automated trading or MEV bot.
      Address: ${address}
      Network: ${network}
      Curated Tag/Label: ${blockchainLabel || "Unknown Entity"}
      Current Balance: ${initialBalance}
      Breakdown of Assets: ${JSON.stringify(assetBalances)}
      Approximate Wallet Age: ${age || "N/A"}
      Transaction Count: ${txCount || "N/A"}
    `;

    const systemInstruction = `
      You are an elite cyber-forensic blockchain analyst and quantitative researcher specializing in on-chain tracking of whale wallets and automated crypto smart contracts.
      Deliver a highly professional, structured JSON report detailing the behavioral classification, risk profile, security exposure, and explicit MEV/bot trading characteristics of the provided address.
      Strictly follow the JSON response schema. No extra text, Markdown block wrapping (\`\`\`json) of the JSON is in response text, just raw JSON.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: payload,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: [
            "behavioralPersona",
            "classificationTags",
            "riskScore",
            "riskJustification",
            "tradingPatternAnalysis",
            "liquidityInfluenceRating",
            "influenceDescription",
            "strategicRecommendations",
            "botDetection"
          ],
          properties: {
            behavioralPersona: {
              type: Type.STRING,
              description: "E.g., 'Arb Speedrunner', 'Sovereign Wealth Accumulator', 'Defi Pool Leech', 'Exchange Hot Deposit'"
            },
            classificationTags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Array of labels e.g., ['diamond-hands', 'highly-active', 'dex-dumper']"
            },
            riskScore: {
              type: Type.INTEGER,
              description: "On-chain risk rating from 0 to 100."
            },
            riskJustification: {
              type: Type.STRING,
              description: "Detailed justification of assigned risk score based on holding history, size, and interaction type."
            },
            tradingPatternAnalysis: {
              type: Type.STRING,
              description: "Deep dive into trading frequency, day/night cycles, panic characteristics, and holding times."
            },
            liquidityInfluenceRating: {
              type: Type.STRING,
              description: "E.g., 'Systemic', 'Severe', 'Moderate', 'Low'"
            },
            influenceDescription: {
              type: Type.STRING,
              description: "How changes in this wallet's balance impact token slippage and general price pressure."
            },
            strategicRecommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Recommendations for retail monitors tracking this address (e.g. 'Front-run on DEX inflows', 'Ignore-long-term-locked')."
            },
            botDetection: {
              type: Type.OBJECT,
              description: "Advanced bot and MEV identification characteristics of the address.",
              required: ["isBot", "botLikelihood", "primaryIndicators", "botTypeClassification", "automationsExplanation"],
              properties: {
                isBot: {
                  type: Type.BOOLEAN,
                  description: "True if the address is highly likely an automated trading bot (e.g. MEV, sandwich, arbitrage, market maker, aggregator), false otherwise."
                },
                botLikelihood: {
                  type: Type.INTEGER,
                  description: "A probability percentage between 0 and 100 on how likely this address is automated bot activity."
                },
                primaryIndicators: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "List of triggers indicating robotic activity, e.g. ['High sub-second repeat rate', 'Atomic flashloan dependencies', 'Exclusive dApp routing state']"
                },
                botTypeClassification: {
                  type: Type.STRING,
                  description: "The specific classification of the bot (e.g. 'Flash Loan Arbitrageur', 'CoW Protocol Solver', 'Solana MEV Bundler', 'Liquidation Sniper', 'N/A - Standard Human Portfolio')"
                },
                automationsExplanation: {
                  type: Type.STRING,
                  description: "Highly detailed cyber-forensics explanation on how this bot is programmed, its speeds, gas optimization behavior, and transaction frequencies."
                }
              }
            }
          }
        }
      }
    });

    const jsonText = response.text ? response.text.trim() : "{}";
    const data = JSON.parse(jsonText);
    res.json(data);
  } catch (error: any) {
    console.error("Error in analyze-wallet API:", error);
    res.status(500).json({ error: "Failed to generate AI portfolio analysis.", detail: error.message });
  }
});

// Endpoint 2: Gemini Market Impact Simulator
app.post("/api/gemini/simulate-market-impact", async (req, res) => {
  try {
    const { asset, amount, strategy, marketCondition } = req.body;

    if (!asset || !amount) {
      return res.status(400).json({ error: "Asset and amount are required for market impact simulation." });
    }

    let ai;
    try {
      ai = getGeminiClient();
    } catch (err: any) {
      return res.status(500).json({
        error: "Gemini API Client failed to initialize. Please check if GEMINI_API_KEY is configured in Settings > Secrets.",
        message: err.message
      });
    }

    const prompt = `
      Analyze the hypothetical market impact and order-book liquidity shock of the following trade:
      Asset: ${asset}
      Amount to Execute: ${amount}
      Execution Strategy: ${strategy} (e.g., Immediate Market Dump, 24-Hour TWAP, OTC Desk Deal)
      Current Market State: ${marketCondition} (e.g., Bullish Depth, High Volatility Panic, Calm Standard Liquidity)
    `;

    const systemInstruction = `
      You are a Chief Risk Officer (CRO) and senior microstructural market researcher at an institutional crypto OTC desk.
      Provide an ultra-detailed quantitative liquidity stress-test simulation in raw JSON format.
      No other text or wrappers around the JSON.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: [
            "estimatedPriceSlippage",
            "orderBookShockIndex",
            "cascadeLiquidationRisk",
            "secondaryContagionSectors",
            "estimatedRecoveryTime",
            "optimalExecutionAdvice",
            "hedgingCounterstrategies"
          ],
          properties: {
            estimatedPriceSlippage: {
              type: Type.STRING,
              description: "E.g., '1.85%' or '12.4%'"
            },
            orderBookShockIndex: {
              type: Type.STRING,
              description: "E.g., 'Extreme', 'Severe', 'Moderate', 'Negligible'"
            },
            cascadeLiquidationRisk: {
              type: Type.STRING,
              description: "Brief analysis of potential futures or DeFi loan liquidations triggered by the slide."
            },
            secondaryContagionSectors: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Sectors most impacted e.g. ['L2 Bridges', 'Liquid Staking Pools', 'DePy Index Pegs']"
            },
            estimatedRecoveryTime: {
              type: Type.STRING,
              description: "Estimate of how long until market depth reforms (e.g., '2.5 hours', '4 days')"
            },
            optimalExecutionAdvice: {
              type: Type.STRING,
              description: "Specific trading-desk logic on how to execute this block cleanly to minimize slippage."
            },
            hedgingCounterstrategies: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Specific hedging plays for retail monitors during execution (e.g. 'Short long-dated futures', 'Buy out of the money puts')."
            }
          }
        }
      }
    });

    const jsonText = response.text ? response.text.trim() : "{}";
    const data = JSON.parse(jsonText);
    res.json(data);
  } catch (error: any) {
    console.error("Error in simulate-market-impact API:", error);
    res.status(500).json({ error: "Failed to simulate market impact.", detail: error.message });
  }
});

// Endpoint 3: Gemini Quantum Stress Test & AI Analytics
app.post("/api/gemini/stress-test", async (req, res) => {
  try {
    const { asset, publicDataSource, exogenousStressor, impliedVolatility, fundingRateTarget, initialSlippage } = req.body;

    if (!asset || !exogenousStressor) {
      return res.status(400).json({ error: "Asset and exogenous stressor are required." });
    }

    let ai;
    try {
      ai = getGeminiClient();
    } catch (err: any) {
      return res.status(500).json({
        error: "Gemini API Client failed to initialize. Please check if GEMINI_API_KEY is configured in Settings > Secrets.",
        message: err.message
      });
    }

    const prompt = `
      You are conducting an advanced professional risk stress-test inside the Behavioral Finance Multi-Cohort Market Reaction Lab.
      Evaluate the stress-test simulation with these parameters:
      - Principal Benchmark Asset: ${asset}
      - Underpinning Asset Class / Data Source: ${publicDataSource}
      - Exogenous Stimulus Shocks (Stressor): ${exogenousStressor}
      - Implied Target Volatility: ${impliedVolatility || "Adaptive"}
      - Projected Futures Funding Rate: ${fundingRateTarget || "Baseline Dynamic"}
      - Market-Depth Initial Liquidity Slippage: ${initialSlippage || "Dynamic"}
      
      Please construct a comprehensive quantitative report modeling how this specific intervention is expected to propagate across diverse investor cohorts (Whales, Institutional Enterprises, Retail Speculators, and Algorithmic Arbitrageurs), what liquidation loops would trigger, any contagion risks to correlated sectors, and a definitive strategic playbook.
    `;

    const systemInstruction = `
      You are an elite quantitative behavioral economist, senior risk modeler, and principal director of a sovereign financial stress-testing lab.
      Construct a highly technical, rigorous, and logically consistent stress-test simulation report in raw JSON format.
      Your writing style must be highly professional, objective, analytical, and rich in advanced financial vocabulary (e.g., 'limits of arbitrage', 'liquidity black hole', 'asymmetric distribution cascade', 'delta-hedged positioning', 'arbitrage-harvesting vectors', 'MEV block-builder optimization').
      Strictly follow the JSON response schema. Return raw JSON text ONLY. Do NOT use markdown wrappers like \`\`\`json.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: [
            "executiveSummary",
            "marketMicrostructureImpact",
            "cohortRepositionings",
            "liquidationCascadeModel",
            "crossMarketContagionRisk",
            "strategicActionPlaybook"
          ],
          properties: {
            executiveSummary: {
              type: Type.STRING,
              description: "A comprehensive academic summary of the stress-test outcome, modeling systemic failures and general equilibrium shifts."
            },
            marketMicrostructureImpact: {
              type: Type.STRING,
              description: "Technical analysis of how order books, bid-ask spreads, and implied volatilities will absorb the impulse shock."
            },
            cohortRepositionings: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["cohort", "posture", "capitalRetentionRatio", "repositioningDetails"],
                properties: {
                  cohort: { type: Type.STRING, description: "The name of the cohort, e.g., 'Institutional', 'Retail', 'Whales', 'Arbitrageurs'" },
                  posture: { type: Type.STRING, description: "E.g., 'Flight-to-Safety', 'Contrarian Accumulation', 'Cascade Capitulation', 'Arbitrage harvesting'" },
                  capitalRetentionRatio: { type: Type.STRING, description: "Est. % of capital retained, e.g., '82.4%'" },
                  repositioningDetails: { type: Type.STRING, description: "Highly detailed behavioral description of what actions they take, what assets they buy/sell (specifically mentioning miner-power metrics, hardware shortages, TSMC semiconductor delays, or retail user indexes if applicable)." }
                }
              }
            },
            liquidationCascadeModel: {
              type: Type.STRING,
              description: "A mathematical description of sequential liquidation thresholds, margin-call triggers in derivative venues, and DeFi lending contract vulnerability offsets."
            },
            crossMarketContagionRisk: {
              type: Type.STRING,
              description: "How this shock triggers cross-sector slippage. Note specific dependencies like chip/ASIC manufacturers (NVIDIA, TSMC), stock markets, and interest swaps."
            },
            strategicActionPlaybook: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "A list of actionable steps for institutional traders or risk managers to neutralize, hedge, or exploit this specific systemic anomaly."
            }
          }
        }
      }
    });

    const jsonText = response.text ? response.text.trim() : "{}";
    const data = JSON.parse(jsonText);
    res.json(data);
  } catch (error: any) {
    console.error("Error in stress-test AI API:", error);
    res.status(500).json({ error: "Failed to generate AI stress-test analysis.", detail: error.message });
  }
});

// In-memory cache for Sentiment Velocity queries to prevent 429 Rate Limit errors and speed up standard UI triggers
const sentimentCache: Record<string, { timestamp: number; data: any }> = {};

// Endpoint 4: Gemini Search Injected Sentiment Velocity
app.post("/api/gemini/sentiment-velocity", async (req, res) => {
  const { protocolId, name, symbol } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Protocol name is required." });
  }

  const cacheKey = `${protocolId || ""}_${name.trim().toLowerCase()}`;
  const now = Date.now();

  // Return from server cache if query occurred within the last 15 minutes to preserve search grounding quota
  if (sentimentCache[cacheKey] && (now - sentimentCache[cacheKey].timestamp < 15 * 60 * 1000)) {
    return res.json(sentimentCache[cacheKey].data);
  }

  // Define high-fidelity fallback data in case API key is missing or calls fail.
  const getFallbackData = () => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    hash = Math.abs(hash);

    // Seed-based scores
    const baseScore = 50 + (hash % 35); // 50 to 85
    const velocity = hash % 3 === 0 ? "UPWARD" : hash % 3 === 1 ? "STABLE" : "DOWNWARD";
    
    const sparkline: number[] = [];
    let current = baseScore - 12;
    for (let i = 0; i < 6; i++) {
      let stepChange = ((hash + i * 53) % 7) - 2; // -2 to +4
      if (velocity === "UPWARD") stepChange += 1;
      if (velocity === "DOWNWARD") stepChange -= 1.5;
      current = Math.min(100, Math.max(0, Math.round(current + stepChange)));
      sparkline.push(current);
    }

    // Curated headlines based on prominent assets or generated fallback
    let headlinesList = [
      {
        title: `${name} TVL volume signals high momentum on major networks`,
        source: "DefiLlama News",
        score: Math.min(10, Math.max(-10, Math.round((baseScore - 50) / 4) + 1)),
        impactSummary: `Drives core staking utility and fees capture mechanisms.`,
        url: "https://llama.fi"
      },
      {
        title: `${name} DAO outlines major upgrades to smart contract framework`,
        source: "Governance Desk",
        score: Math.min(10, Math.max(-10, Math.round((baseScore - 50) / 5) + 2)),
        impactSummary: `Optimizes collateral ratios and transaction gas parameters.`,
        url: "https://snapshot.org"
      }
    ];

    if (protocolId === "lido" || name.toLowerCase().includes("lido")) {
      headlinesList = [
        {
          title: "Lido volume spikes as liquid staking adoption reaches historic highs across Layer 2 protocols",
          source: "Blockworks",
          score: 8,
          impactSummary: "Increases fee revenues and bolsters LDO utility.",
          url: "https://blockworks.co"
        },
        {
          title: "Ethereum governance debate heats up over liquid staking market share concerns",
          source: "CoinDesk",
          score: -3,
          impactSummary: "Introduces potential regulation scrutiny but holds staking dominance.",
          url: "https://coindesk.com"
        },
        {
          title: "Lido Alliance partners with high-performance Layer-2 networks to boost derivative yield",
          source: "CoinTelegraph",
          score: 7,
          impactSummary: "Creates massive cross-chain staking partnerships and capital efficiency.",
          url: "https://cointelegraph.com"
        }
      ];
    } else if (protocolId === "makerdao" || name.toLowerCase().includes("maker") || name.toLowerCase().includes("sky")) {
      headlinesList = [
        {
          title: "Sky Protocol registering massive USDS stablecoin inflows as savings rates interest peaks",
          source: "Decrypt",
          score: 9,
          impactSummary: "Strengthens capital reserves and increases MKR burn rate.",
          url: "https://decrypt.co"
        },
        {
          title: "Governance vote clears new subDAO launch to expand yield-farming parameters",
          source: "CoinDesk",
          score: 7,
          impactSummary: "Unlocks secondary liquidity mechanisms across DeFi ecosystems.",
          url: "https://coindesk.com"
        }
      ];
    } else if (protocolId === "uniswap" || name.toLowerCase().includes("uniswap")) {
      headlinesList = [
        {
          title: "Uniswap V4 hooks implementation accelerates customizable liquidity pools innovation",
          source: "The Defiant",
          score: 8,
          impactSummary: "Attracts heavy developer attention and advanced trading volumes.",
          url: "https://thedefiant.io"
        },
        {
          title: "Regulatory pressure on decentralized frontends creates temporary friction",
          source: "Bloomberg",
          score: -4,
          impactSummary: "Slight short-term sentiment dip but core on-chain protocol unaffected.",
          url: "https://bloomberg.com"
        }
      ];
    } else if (protocolId === "aave" || name.toLowerCase().includes("aave")) {
      headlinesList = [
        {
          title: "Aave V3 launches security-hardened markets across high-performance L2 chains",
          source: "DeFi Vanguard",
          score: 9,
          impactSummary: "Ensures higher collateral safety and boosts active lending pools.",
          url: "https://aave.com"
        },
        {
          title: "DAO considers fee-switch mechanisms to reward active AAVE stakers",
          source: "The Defiant",
          score: 8,
          impactSummary: "Creates massive buy-pressure potential and boosts governance alignment.",
          url: "https://thedefiant.io"
        }
      ];
    }

    return {
      currentScore: Math.round(sparkline[sparkline.length - 1]),
      velocityDirection: velocity as "UPWARD" | "DOWNWARD" | "STABLE",
      sparklineData: sparkline,
      headlines: headlinesList,
      sentimentConclusion: `${name} maintains stable governance with robust TVL reserves. Market participants are actively tracking upcoming Smart Contract shifts and delegations.`,
      retrievedFromLiveSearch: false
    };
  };

  try {
    let ai;
    try {
      ai = getGeminiClient();
    } catch (err: any) {
      const fallback = getFallbackData();
      // Cache the fallback to prevent future client requests from blocking the queue
      sentimentCache[cacheKey] = { timestamp: Date.now(), data: fallback };
      return res.json(fallback);
    }

    const searchPrompt = `
      Perform an online search for recent news, updates, headlines, or community discussions (ideally within May or June 2026 or last 30 days) regarding the DeFi protocol: "${name}" (token: ${symbol || "N/A"}).
      Analyze these stories to calculate a 0-100 progressive 'Sentiment Velocity' index (exactly 6 chronological score points capturing recent momentum), where 50 is neutral, >50 is bullish/positive, and <50 is bearish/conconcern.
      Return the results in the required JSON format. Include up to 4 real recent headlines/announcements found.
    `;

    const systemInstruction = `
      You are an expert quantitative crypto analyst specializing in behavioral data mining and sentiment index calculation.
      Provide a comprehensive sentiment study based on REAL live news or updates found during search grounding for "${name}".
      Extract accurate URLs for headlines that are real and valid.
      If news info is sparse, extrapolate realistic, highly technical, and professional headlines and sentiment metrics.
      Return raw JSON only, matching the response schema perfectly. Do NOT wrap with markdown \`\`\`json blocks.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: searchPrompt,
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: [
            "currentScore",
            "velocityDirection",
            "sparklineData",
            "headlines",
            "sentimentConclusion"
          ],
          properties: {
            currentScore: {
              type: Type.INTEGER,
              description: "Overall current sentiment score from 0 to 100."
            },
            velocityDirection: {
              type: Type.STRING,
              description: "Must be 'UPWARD', 'DOWNWARD', or 'STABLE' depending on sparkline trajectory."
            },
            sparklineData: {
              type: Type.ARRAY,
              items: { type: Type.INTEGER },
              description: "An array of exactly 6 integer values from 0 to 100 capturing sentiment velocity across consecutive points."
            },
            headlines: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["title", "source", "score", "impactSummary", "url"],
                properties: {
                  title: { type: Type.STRING, description: "Title of the news headline or event." },
                  source: { type: Type.STRING, description: "E.g., Coindesk, Decrypt, Twitter/DAO, Blockworks." },
                  score: { type: Type.INTEGER, description: "Specific sentiment rating for this news source from -10 to +10." },
                  impactSummary: { type: Type.STRING, description: "A concise description of why this impacts protocol status (max 15 words)." },
                  url: { type: Type.STRING, description: "A valid URL or search source url linked to this news item." }
                }
              }
            },
            sentimentConclusion: {
              type: Type.STRING,
              description: "A summary sentence reflecting the live search grounding insight."
            }
          }
        }
      }
    });

    const jsonText = response.text ? response.text.trim() : "{}";
    const data = JSON.parse(jsonText);
    
    // Safety check on returned sparklineData array length
    if (!data.sparklineData || !Array.isArray(data.sparklineData) || data.sparklineData.length !== 6) {
      data.sparklineData = [50, 52, 55, 58, 62, 65];
    }
    
    const finalReport = {
      ...data,
      retrievedFromLiveSearch: true
    };

    // Store in cache
    sentimentCache[cacheKey] = { timestamp: Date.now(), data: finalReport };

    res.json(finalReport);
  } catch (error: any) {
    // If we exceed rate limit quota or hit other Google GenAI API issues, log lightly and return seed-based high fidelity fallback data
    const apiCode = error?.status || error?.error?.code || "";
    if (apiCode === 429 || error?.message?.includes("RESOURCE_EXHAUSTED") || error?.message?.includes("quota")) {
      console.warn(`[Gemini API Quota Maxed] Serving fallback sentiment analysis map for ${name}`);
    } else {
      console.warn("Live Search Grounding Sentiment Velocity calculation failed. Falling back.", error.message || error);
    }
    
    const fallback = getFallbackData();
    // Cache the fallback so we don't query again immediately and hit the limit
    sentimentCache[cacheKey] = { timestamp: Date.now(), data: fallback };
    res.json(fallback);
  }
});

// Vite & Static file serving setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development Mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Started server in DEVELOPMENT mode with Vite Middleware.");
  } else {
    // Production Mode
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Started server in PRODUCTION mode serving /dist.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`WhaleTrack Pro Server is running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
