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
