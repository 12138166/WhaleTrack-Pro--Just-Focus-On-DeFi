export interface AssetBalance {
  symbol: string;
  amount: number;
  valueUsd: number;
}

export interface WhaleWallet {
  address: string;
  blockchainLabel: string;
  network: "Ethereum" | "Bitcoin" | "Solana" | "BNB Chain" | "Tron" | "Arbitrum" | "Base" | "Avalanche" | "Optimism";
  initialBalance: string;
  txCount: number;
  age: string;
  riskRating: "Low" | "Medium" | "High" | "Critical";
  assetBalances: AssetBalance[];
  isExchange: boolean;
  notes: string;
}

export interface RealTimeAlert {
  id: string;
  timestamp: string;
  txHash: string;
  network: WhaleWallet["network"];
  asset: string;
  amount: number;
  amountUsd: number;
  fromAddress: string;
  fromLabel: string;
  toAddress: string;
  toLabel: string;
  flowType: "Exchange Inflow" | "Exchange Outflow" | "Wallet to Wallet";
  gasFeeUsd: number;
  assetTickerSnapshot?: TickerPrice;
}

export interface TickerPrice {
  symbol: string;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: number; // Volume in USD
}

export interface WalletAICognition {
  behavioralPersona: string;
  classificationTags: string[];
  riskScore: number;
  riskJustification: string;
  tradingPatternAnalysis: string;
  liquidityInfluenceRating: string;
  influenceDescription: string;
  strategicRecommendations: string[];
  botDetection?: {
    isBot: boolean;
    botLikelihood: number;
    primaryIndicators: string[];
    botTypeClassification: string;
    automationsExplanation: string;
  };
}

export interface MarketSimulationResponse {
  estimatedPriceSlippage: string;
  orderBookShockIndex: "Extreme" | "Severe" | "Moderate" | "Negligible" | string;
  cascadeLiquidationRisk: string;
  secondaryContagionSectors: string[];
  estimatedRecoveryTime: string;
  optimalExecutionAdvice: string;
  hedgingCounterstrategies: string[];
}
