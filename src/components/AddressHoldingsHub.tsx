import React, { useState, useMemo, useEffect } from "react";
import { 
  Building2, 
  Users, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  Calendar, 
  Layers, 
  Cpu, 
  FileSpreadsheet, 
  ChevronLeft, 
  ChevronRight, 
  DollarSign, 
  TrendingUp, 
  ShieldCheck, 
  PieChart as LucidePieChart, 
  Volume2, 
  RefreshCw,
  Award,
  LayoutGrid,
  Bell,
  X,
  Sparkles,
  Zap,
  Scale
} from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid, Legend } from "recharts";

interface AddressHoldingsHubProps {
  currentPrices: { [key: string]: number };
  onSelectAddress?: (address: string) => void;
}

// Entity types for addresses
type EntityType = "Exchange" | "Institution/Fund" | "Corporate Treasury" | "DeFi Protocol" | "Individual Whale" | "Smart Contract Bridge";

interface HoldingAddress {
  rank: number;
  address: string;
  label: string;
  type: EntityType;
  balance: number;
  valueUsd: number;
  percentage: number;
  periodChange: number; // percentage change in balance during selected period
  lastActive: string;
}

interface VolumeAddress {
  rank: number;
  address: string;
  label: string;
  type: "Arbitrage Bot" | "Exchange Hot Wallet" | "Institution/Fund" | "Market Maker" | "DeFi Smart Contract" | "High-Freq Whale";
  sevenDayVolumeUsd: number;
  txCount7d: number;
  averageTxSizeUsd: number;
  netFlowType: "Inflow" | "Outflow" | "Neutral";
  dominantAsset: string;
}

const STABLECOIN_CLASSIFICATIONS: Record<string, {
  category: "Fiat-Collateralized" | "Crypto-Collateralized" | "Synthetic / Algorithmic" | "Commodity-Backed";
  definition: string;
  badgeColor: string;
  reserveVerificationMode: string;
}> = {
  USDT: {
    category: "Fiat-Collateralized",
    definition: "Backed 1:1 by real-world cash or short-term cash equivalents (like U.S. Treasury bills) safely stored in bank reserves.",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    reserveVerificationMode: "Quarterly Independent Attestations (BDO)"
  },
  USDC: {
    category: "Fiat-Collateralized",
    definition: "Backed 1:1 by real-world cash or short-term cash equivalents (like U.S. Treasury bills) safely stored in bank reserves.",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    reserveVerificationMode: "Monthly Attestations & BlackRock Fund Management"
  },
  PYUSD: {
    category: "Fiat-Collateralized",
    definition: "Backed 1:1 by real-world cash or short-term cash equivalents (like U.S. Treasury bills) safely stored in bank reserves.",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    reserveVerificationMode: "Paxos Trust NYDFS Regulated Monthly Reports"
  },
  USD1: {
    category: "Fiat-Collateralized",
    definition: "Backed 1:1 by real-world cash or short-term cash equivalents (like U.S. Treasury bills) safely stored in bank reserves.",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    reserveVerificationMode: "Regular Independent Audir verification loops"
  },
  USDS: {
    category: "Crypto-Collateralized",
    definition: "Backed by a basket of other volatile cryptocurrencies or tokenized Treasuries. Reserves heavily exceed the issued stablecoin value to buffer market volatility.",
    badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
    reserveVerificationMode: "On-Chain DAO Smart Contracts & RWA Dashboards"
  },
  DAI: {
    category: "Crypto-Collateralized",
    definition: "Backed by a basket of other volatile cryptocurrencies. To protect against market drops, these tokens are \"over-collateralized,\" meaning the reserve value heavily exceeds the issued stablecoin value.",
    badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
    reserveVerificationMode: "Real-time Chainlink Proof of Reserves & Maker Smart Contract Audits"
  },
  USDe: {
    category: "Synthetic / Algorithmic",
    definition: "Maintain their peg using supply manipulation via smart contracts or derivatives strategies, dynamically \"minting\" (creating) or \"burning\" (destroying) tokens based on market demand (such as delta-neutral shorting).",
    badgeColor: "bg-pink-500/10 text-pink-400 border-pink-500/30",
    reserveVerificationMode: "Smart Contract Hedging Escrow & Exchange API Verification"
  },
  PAXG: {
    category: "Commodity-Backed",
    definition: "Tied to physical assets such as real estate or gold bars.",
    badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    reserveVerificationMode: "Bullion serial audits & physical Brink's vault registries"
  }
};

// Corporate and Institutional Holdings Datastructures across assets
interface CorporateHolder {
  name: string;
  holdingAmount: number; // in native asset units (e.g. BTC, ETH, SOL, USDT, USDC)
  holdingUsd: number;
  useCase: string;
  riskClass: "Minimal" | "Low" | "Medium" | "High";
}

interface InstitutionalAuditBacking {
  title: string;
  tag: string;
  pieData: { name: string; value: number; color: string }[];
  auditFirm: string;
  lastAuditedDate: string;
  redemptionSlaHours?: number;
  stakingYield?: number;
  enterpriseUsersCount: number;
  systemicRiskScore: "AA+" | "AA" | "A+" | "A" | "A-";
  description: string;
}

const INSTITUTIONAL_BACKING_DASHBOARD: Record<string, InstitutionalAuditBacking> = {
  BTC: {
    title: "Sovereign Listed Corporate Reserves",
    tag: "BTC INSTITUTIONAL RESERVE TELEMETRY",
    pieData: [
      { name: "Public treasuries (10-Q)", value: 65.5, color: "#f97316" },
      { name: "Sovereign/National Funds", value: 16.2, color: "#10b981" },
      { name: "Private Investment Trusts", value: 13.1, color: "#06b6d4" },
      { name: "Systemic ETF Escrows", value: 5.2, color: "#a855f7" }
    ],
    auditFirm: "Coinbase Prime Custody / SEC Reports",
    lastAuditedDate: "2026-05-18",
    enterpriseUsersCount: 220,
    systemicRiskScore: "AA+",
    description: "Bitcoin public corporate reserves are strictly audited via public SEC quarterly filings (10-Q/10-K) and cryptographic on-chain UTXO proof-of-reserves."
  },
  ETH: {
    title: "Ethereum Proof-of-Stake Enterprise Pools",
    tag: "ETH ENTERPRISE DEPLOYMENT TELEMETRY",
    pieData: [
      { name: "Sovereign Exchange Trusts", value: 46.8, color: "#6366f1" },
      { name: "Decentralized Staking Pools", value: 32.5, color: "#38bdf8" },
      { name: "Corporate Development Funds", value: 14.5, color: "#10b981" },
      { name: "Private Equity Escrows", value: 6.2, color: "#ec4899" }
    ],
    auditFirm: "Lido DAO / ConsenSys MultiSig",
    lastAuditedDate: "2026-05-22",
    stakingYield: 3.8,
    enterpriseUsersCount: 540,
    systemicRiskScore: "AA",
    description: "Ethereum institutional allocations primarily target decentralized governance or liquid staking contracts to secure physical consensus and gas fee rewards."
  },
  SOL: {
    title: "Solana Liquid Institutional Allocations",
    tag: "SOL VENTURE RESERVES TELEMETRY",
    pieData: [
      { name: "Foundation Development Vaults", value: 54.2, color: "#14b8a6" },
      { name: "Bankruptcy Estate Restructuring", value: 23.5, color: "#a5b4fc" },
      { name: "Liquid Venture Treasuries", value: 14.8, color: "#f59e0b" },
      { name: "Validator Staking Escrow", value: 7.5, color: "#10b981" }
    ],
    auditFirm: "Solana Foundation Core Council",
    lastAuditedDate: "2026-05-12",
    stakingYield: 6.2,
    enterpriseUsersCount: 395,
    systemicRiskScore: "A",
    description: "Solana holdings represent high-speed payment reserves and venture capital allocations distributed across regulated custody accounts and validator pools."
  },
  USDT: {
    title: "USDT Reserve Backing Audit (Tether)",
    tag: "USDT INSTITUTIONAL AUDIT TELEMETRY",
    pieData: [
      { name: "U.S. Treasuries", value: 82.5, color: "#06b6d4" },
      { name: "Cash / Short deposits", value: 6.2, color: "#10b981" },
      { name: "Repo Agreements", value: 8.3, color: "#a855f7" },
      { name: "Commercial Paper", value: 1.1, color: "#f59e0b" },
      { name: "Other Liquid Assets", value: 1.9, color: "#ec4899" }
    ],
    auditFirm: "BDO Italia S.p.A.",
    lastAuditedDate: "2026-03-31",
    redemptionSlaHours: 24,
    enterpriseUsersCount: 1480,
    systemicRiskScore: "A-",
    description: "Tether reserves are backed by extremely high percentages of direct US Treasury Bills. Verified via standard independent quarterly audits."
  },
  USDC: {
    title: "USDC Reserve Backing Audit (Circle)",
    tag: "USDC INSTITUTIONAL AUDIT TELEMETRY",
    pieData: [
      { name: "U.S. Treasuries", value: 89.2, color: "#06b6d4" },
      { name: "Cash / Short deposits", value: 4.8, color: "#10b981" },
      { name: "Repo Agreements", value: 6.0, color: "#a855f7" },
      { name: "Commercial Paper", value: 0.0, color: "#f59e0b" },
      { name: "Other Liquid Assets", value: 0.0, color: "#ec4899" }
    ],
    auditFirm: "Deloitte & Touche LLP",
    lastAuditedDate: "2026-04-30",
    redemptionSlaHours: 12,
    enterpriseUsersCount: 3255,
    systemicRiskScore: "A+",
    description: "Circle USDC maintains high-grade liquidity backing utilizing custom managed BlackRock money market instruments under SEC regulatory supervision."
  },
  PYUSD: {
    title: "PYUSD Reserve Backing (PayPal / Paxos)",
    tag: "PYUSD COMPLIANCE AUDIT TELEMETRY",
    pieData: [
      { name: "U.S. Treasuries", value: 75.0, color: "#06b6d4" },
      { name: "U.S. Treasury Repos", value: 20.0, color: "#a855f7" },
      { name: "Insured Bank Deposits", value: 5.0, color: "#10b981" }
    ],
    auditFirm: "WithumSmith+Brown, PC",
    lastAuditedDate: "2026-04-30",
    redemptionSlaHours: 12,
    enterpriseUsersCount: 1540,
    systemicRiskScore: "AA",
    description: "PayPal USD is issued by Paxos Trust Company and is fully backed by highly liquid cash, short-term Treasuries, and overnight repos under NYDFS oversight."
  },
  USD1: {
    title: "USD1 Liquid Asset Reserves",
    tag: "USD1 RESERVES COMPLIANCE",
    pieData: [
      { name: "Cash Reserves", value: 50.0, color: "#10b981" },
      { name: "Short-Term Treasuries", value: 45.0, color: "#06b6d4" },
      { name: "Liquidity Pools", value: 5.0, color: "#a855f7" }
    ],
    auditFirm: "Deloitte & Touche",
    lastAuditedDate: "2026-05-15",
    redemptionSlaHours: 24,
    enterpriseUsersCount: 320,
    systemicRiskScore: "A",
    description: "USD1 maintains a highly liquid, conservative reserve composition consisting primarily of bank deposits and high-grade short duration sovereign debt."
  },
  USDS: {
    title: "USDS Sky Asset Backing (Sky Dollar)",
    tag: "USDS DECENTRALIZED PROTOCOL BACKING",
    pieData: [
      { name: "RWA & Treasuries", value: 72.0, color: "#06b6d4" },
      { name: "USDC Stablecoin Pools", value: 18.0, color: "#38bdf8" },
      { name: "Over-collateralized Crypto", value: 10.0, color: "#10b981" }
    ],
    auditFirm: "Sky Ecosystem DAO Audits",
    lastAuditedDate: "2026-05-20",
    stakingYield: 6.25,
    enterpriseUsersCount: 890,
    systemicRiskScore: "A",
    description: "Sky USDS (formerly DAI) features a dual hybrid model combining highly secure Tokenized Real-World Assets (RWA) and decentralized cryptocurrency over-collateralization."
  },
  DAI: {
    title: "DAI MakerDAO Over-Collateralization",
    tag: "DAI DECENTRALISED RESERVE TELEMETRY",
    pieData: [
      { name: "Wrapped Ethereum (WETH)", value: 42.5, color: "#6366f1" },
      { name: "Tokenized RWA Treasuries", value: 31.2, color: "#06b6d4" },
      { name: "Wrapped Bitcoin (WBTC)", value: 16.8, color: "#f97316" },
      { name: "USDC Reserve backing", value: 9.5, color: "#38bdf8" }
    ],
    auditFirm: "Chainlink Proof of Reserves",
    lastAuditedDate: "2026-05-25",
    stakingYield: 5.40,
    enterpriseUsersCount: 2280,
    systemicRiskScore: "A+",
    description: "DAI operates as a highly resilient, over-collateralized stablecoin governed entirely by MakerDAO smart contracts. Protected via automated liquidation engine triggers."
  },
  USDe: {
    title: "USDe Ethena Synthetic Dollar Collateral",
    tag: "USDE DELTA-NEUTRAL COVERAGE TELEMETRY",
    pieData: [
      { name: "Staked ETH (stETH)", value: 50.0, color: "#38bdf8" },
      { name: "Short ETH Futures", value: 50.0, color: "#ec4899" }
    ],
    auditFirm: "Zokyo / Quantstamp Security",
    lastAuditedDate: "2026-05-18",
    stakingYield: 15.42,
    enterpriseUsersCount: 425,
    systemicRiskScore: "A-",
    description: "Ethena USDe is a synthetic dollar backed by delta-neutral hedging. Every 1 USDe minted holds an equal amount of spot stETH and short perpetual futures."
  },
  PAXG: {
    title: "PAXG Physical Gold Allocations (Pax Gold)",
    tag: "PAXG GOLD BAR RESERVE TELEMETRY",
    pieData: [
      { name: "London Good Delivery Gold Bars", value: 100.0, color: "#eab308" }
    ],
    auditFirm: "Withum Auditing & Brink's Vaults",
    lastAuditedDate: "2026-04-30",
    enterpriseUsersCount: 955,
    systemicRiskScore: "AA",
    description: "Each Pax Gold (PAXG) token represents one fine troy ounce of a London Good Delivery gold bar, stored in Brink's secure bullion vaults and audited monthly."
  }
};

const ALL_ASSET_CORPORATE_TREASURIES: Record<string, CorporateHolder[]> = {
  BTC: [
    { name: "MicroStrategy Inc. (MSTR)", holdingAmount: 214400, holdingUsd: 20368000000, useCase: "Long-Term Corporate Reserve", riskClass: "Minimal" },
    { name: "Marathon Digital Holdings", holdingAmount: 25200, holdingUsd: 2394000000, useCase: "Proof-of-Work Treasury Cushion", riskClass: "Low" },
    { name: "Tesla Inc. Cash Reserves", holdingAmount: 9720, holdingUsd: 923400000, useCase: "Strategic Liquidity Hedging", riskClass: "Medium" },
    { name: "Block Inc. (Square Group)", holdingAmount: 8020, holdingUsd: 761900000, useCase: "Inflation-Proof Balance Sheet", riskClass: "Minimal" },
    { name: "Hut 8 Mining Operations", holdingAmount: 9100, holdingUsd: 864500000, useCase: "Mining Output Retention (HODL)", riskClass: "Low" },
    { name: "Metaplanet Japan Corp", holdingAmount: 1018, holdingUsd: 96712000, useCase: "Fiduciary Currency Safe-Haven", riskClass: "Minimal" }
  ],
  ETH: [
    { name: "Grayscale Ethereum Trust (ETHE)", holdingAmount: 1200000, holdingUsd: 4200000000, useCase: "Institutional Investment Trust", riskClass: "Minimal" },
    { name: "ConsenSys Software Inc.", holdingAmount: 185000, holdingUsd: 647500000, useCase: "Gas & Development Escrow", riskClass: "Minimal" },
    { name: "Meitu Inc. Hong Kong", holdingAmount: 31000, holdingUsd: 108500000, useCase: "Emerging Tech Research Allocation", riskClass: "Low" },
    { name: "Metaplanet ETH Core Fund", holdingAmount: 12500, holdingUsd: 43750000, useCase: "Multi-Asset Treasury Strategy", riskClass: "Minimal" },
    { name: "Reddit Inc. Corporate Accounts", holdingAmount: 4200, holdingUsd: 14700000, useCase: "Decentralized Product Utility", riskClass: "Medium" }
  ],
  SOL: [
    { name: "Solana Foundation Core Store", holdingAmount: 43000000, holdingUsd: 7740000000, useCase: "Developer Grants & Ecosystem Incubation", riskClass: "Minimal" },
    { name: "FTX/Alameda Bankruptcy Trustees", holdingAmount: 14800000, holdingUsd: 2664000000, useCase: "Creditor Distribution Escrow", riskClass: "High" },
    { name: "Jump Crypto Liquid Market Maker", holdingAmount: 2500000, holdingUsd: 450000000, useCase: "Market Making Order-Book Collateral", riskClass: "Low" },
    { name: "Cumberland DRW Trading Node", holdingAmount: 1250000, holdingUsd: 225000000, useCase: "OTC Instant Cleared Brokerage", riskClass: "Minimal" },
    { name: "Sygnum Swiss Client Pool", holdingAmount: 840000, holdingUsd: 151200000, useCase: "Regulated Swiss Banking Staking", riskClass: "Minimal" }
  ],
  USDT: [
    { name: "Cumberland (DRW Group)", holdingAmount: 1420000000, holdingUsd: 1420000000, useCase: "OTC Arbitrage Settlement", riskClass: "Minimal" },
    { name: "Binance Liquidity Buffer Vault", holdingAmount: 2850000000, holdingUsd: 2850000000, useCase: "Exchange Margin Collateral", riskClass: "Low" },
    { name: "Justin Sun Group (Lido Alloc)", holdingAmount: 650000000, holdingUsd: 650000000, useCase: "Leveraged Staking Yields", riskClass: "Medium" },
    { name: "FalconX Prime Operations", holdingAmount: 480000000, holdingUsd: 480000000, useCase: "Institutional Settlement Credit", riskClass: "Minimal" },
    { name: "Bybit Swap Reserve Bridge", holdingAmount: 790000000, holdingUsd: 790000000, useCase: "Derivatives Liquidation Fund", riskClass: "Low" },
    { name: "Nexon Co. Corporate Treasury", holdingAmount: 110000000, holdingUsd: 110000000, useCase: "Cross-border Corporate Yields", riskClass: "Minimal" }
  ],
  USDC: [
    { name: "Circle Reserve Fund (BlackRock MMF)", holdingAmount: 18500000000, holdingUsd: 18500000000, useCase: "Reserve Collateral Management", riskClass: "Minimal" },
    { name: "Coinbase Settlement Pools", holdingAmount: 4200000000, holdingUsd: 4200000000, useCase: "Instant Cleared User Balances", riskClass: "Minimal" },
    { name: "Tesla Inc. Stable Backing", holdingAmount: 150000000, holdingUsd: 150000000, useCase: "Corporate Treasury Cash Hedge", riskClass: "Minimal" },
    { name: "dYdX Insurance Reserve v4", holdingAmount: 310000000, holdingUsd: 310000000, useCase: "Decentralized Exchange Margin Pool", riskClass: "Low" },
    { name: "Fidelity Digital Custody Vault", holdingAmount: 1250000000, holdingUsd: 1250000000, useCase: "Client Discretionary Portfolios", riskClass: "Minimal" },
    { name: "Stripe Payment Gateway Sweeper", holdingAmount: 420000000, holdingUsd: 420000000, useCase: "Merchant Fiat Auto-Conversion", riskClass: "Minimal" }
  ],
  PYUSD: [
    { name: "PayPal Liquid Reserve Depot", holdingAmount: 120000000, holdingUsd: 120000000, useCase: "Fiduciary Merchant Settlement", riskClass: "Minimal" },
    { name: "Venmo App Cash Reserves", holdingAmount: 85000000, holdingUsd: 85000000, useCase: "Peer-to-Peer Settlement Ledger", riskClass: "Minimal" },
    { name: "Paxos Trust Operating Treasury", holdingAmount: 45000000, holdingUsd: 45000000, useCase: "Security Margin & Issuance Reserve", riskClass: "Minimal" },
    { name: "Kraken Commercial Client Pool", holdingAmount: 32000000, holdingUsd: 32000000, useCase: "High-yield Retail Custody Reserves", riskClass: "Low" }
  ],
  USD1: [
    { name: "Galaxy Digital Capital Treasury", holdingAmount: 35000000, holdingUsd: 35000000, useCase: "Institutional Collateral Clearing", riskClass: "Minimal" },
    { name: "FalconX Settlement Hub", holdingAmount: 25000000, holdingUsd: 25000000, useCase: "Instant Settlement Bridge Ledger", riskClass: "Minimal" },
    { name: "Cumberland Global Liquid Reserves", holdingAmount: 18000000, holdingUsd: 18000000, useCase: "Arbitrage Liquidity Buffer", riskClass: "Low" }
  ],
  USDS: [
    { name: "Summer.fi Decentralized Leverage Vaults", holdingAmount: 340000000, holdingUsd: 340000000, useCase: "DeFi CDP Collateral Minting", riskClass: "Low" },
    { name: "Spark Protocol Treasury Deposit", holdingAmount: 245000000, holdingUsd: 245000000, useCase: "Protocol Stability Modules", riskClass: "Low" },
    { name: "Sky Core governance Endowment", holdingAmount: 120000000, holdingUsd: 120000000, useCase: "Ecosystem Innovation Initiatives", riskClass: "Minimal" },
    { name: "SubDAO Yield Strategy Module", holdingAmount: 95000000, holdingUsd: 95000000, useCase: "Algorithmic Staking Return Pools", riskClass: "Medium" }
  ],
  DAI: [
    { name: "MakerDAO Peg Stability Module (PSM)", holdingAmount: 510000000, holdingUsd: 510000000, useCase: "Arb Peg Stabilization", riskClass: "Minimal" },
    { name: "Aave V3 Reserve Multi-Pool", holdingAmount: 420000000, holdingUsd: 420000000, useCase: "Collateralized DeFi Borrows", riskClass: "Low" },
    { name: "Uniswap V3 Core DAI LP Vault", holdingAmount: 180000000, holdingUsd: 180000000, useCase: "On-Chain Spot Token Swaps", riskClass: "Low" },
    { name: "Compound v2 Governance Reserves", holdingAmount: 120000000, holdingUsd: 120000000, useCase: "Decentralized Loan Collateral", riskClass: "Minimal" }
  ],
  USDe: [
    { name: "Ethena Reserve Fund Vault", holdingAmount: 420000000, holdingUsd: 420000000, useCase: "Delta-Neutral Insurance Funds", riskClass: "Medium" },
    { name: "Wintermute Market Making Ledger", holdingAmount: 210000000, holdingUsd: 210000000, useCase: "Derivatives Hedging Margin", riskClass: "Low" },
    { name: "Deribit Exchange Delta Hedging Node", holdingAmount: 145000000, holdingUsd: 145000000, useCase: "Futures Settlement Collateral", riskClass: "Medium" },
    { name: "Bybit USDe Elastic Incentive Pool", holdingAmount: 95000000, holdingUsd: 95000000, useCase: "Perpetual Funding Rate Farming", riskClass: "High" }
  ],
  PAXG: [
    { name: "Paxos Corporate Gold Vault", holdingAmount: 85200, holdingUsd: 195960000, useCase: "Bullion Reserve Collateral", riskClass: "Minimal" },
    { name: "Sygnum Bank Precious Metals Custody", holdingAmount: 42100, holdingUsd: 96830000, useCase: "Tokenized Wealth Management Assets", riskClass: "Minimal" },
    { name: "Bitcoin Suisse Commodity Vault", holdingAmount: 22400, holdingUsd: 51520000, useCase: "Inflation Hedge Strategy Reserves", riskClass: "Minimal" }
  ]
};

// Generates 200 Holding Addresses deterministically based on input parameters
function generateTop200Holders(asset: string, period: string, price: number): HoldingAddress[] {
  const holders: HoldingAddress[] = [];
  
  // Base scales of holding amounts
  let baseScale = 100000;
  if (asset === "BTC") baseScale = 45000;
  else if (asset === "ETH") baseScale = 850000;
  else if (asset === "SOL") baseScale = 2200000;
  else if (asset === "USDT") baseScale = 800000000;
  else if (asset === "USDC") baseScale = 480000000;
  else if (asset === "PYUSD") baseScale = 80000000;
  else if (asset === "USD1") baseScale = 45000000;
  else if (asset === "USDS") baseScale = 950000000;
  else if (asset === "DAI") baseScale = 1100000000;
  else if (asset === "USDe") baseScale = 850000000;
  else if (asset === "PAXG") baseScale = 45000;

  const entityTypes: EntityType[] = [
    "Exchange", "Institution/Fund", "Corporate Treasury", 
    "DeFi Protocol", "Individual Whale", "Smart Contract Bridge"
  ];

  const labelsExchange = ["Binance Custody", "Coinbase Premium Store", "Kraken Strategic Reserves", "OKX cold treasury", "Huobi Sweep Node"];
  const labelsInstitutional = ["BlackRock Sovereign Fund", "Fidelity Digital Core", "Grayscale Portfolio Bridge", "Galaxy Digital Trust", "Franklin Templeton Tech"];
  const labelsDeFi = ["UniSwap v3 Liquidity Pool", "MakerDAO Peg Stability Module", "Lido Staking Reserve Contract", "Aave v3 Core Escrow", "Curve Lending Contract"];
  const labelsCorporate = ["MicroStrategy Treasury", "Marathon Digital Holdings", "Tesla Reserves Node", "Square Cash Reserve", "Sovereign Wealth Depot"];
  const labelsBridges = ["Arbitrum L2 Native Bridge", "Optimism Bridge Portal", "Wormhole Wrapper Escrow", "Base Core L1 Bridge", "Polygon Custom Bridge"];
  const labelsWhale = ["Sovereign Industrialist Whale", "Early Genesis Accumulator", "Venture Seed Allocator", "Decentralized Founder Address", "Dormant Satoshi Era Address"];

  // Total hypothetical supply representation for percentage calculations
  const totalRepresentedSupply = baseScale * 45;

  for (let rank = 1; rank <= 200; rank++) {
    // Generate power-law distribution decay
    const factor = Math.pow(rank, -0.65);
    const balance = Math.round(baseScale * factor * (0.85 + Math.sin(rank * 0.17) * 0.15));
    const valueUsd = balance * price;
    const percentage = (balance / totalRepresentedSupply) * 100;

    // Period changes based on rank/type
    let periodPctChange = (Math.cos(rank * 0.45) * 11).toFixed(2);
    // Give some realistic accumulation behaviors for specific periods
    if (period === "Last 30 Days") {
      periodPctChange = (Math.sin(rank * 0.9) * 4.5 + (rank % 5 === 0 ? 3 : -1)).toFixed(2);
    } else if (period === "Last 90 Days") {
      periodPctChange = (Math.sin(rank * 0.6) * 12.8 + (rank % 6 === 0 ? 8 : -2)).toFixed(2);
    }

    // Determine entity type and label deterministically
    let type: EntityType = "Individual Whale";
    let label = "";

    if (rank <= 3) {
      type = rank === 1 ? "Exchange" : rank === 2 ? "Institution/Fund" : "Smart Contract Bridge";
    } else {
      const idx = (rank * 17) % entityTypes.length;
      type = entityTypes[idx];
    }

    if (type === "Exchange") {
      label = labelsExchange[rank % labelsExchange.length] + ` (#${(rank % 3) + 1})`;
    } else if (type === "Institution/Fund") {
      label = labelsInstitutional[rank % labelsInstitutional.length] + ` (Beta-${rank})`;
    } else if (type === "DeFi Protocol") {
      label = labelsDeFi[rank % labelsDeFi.length] + ` Pool`;
    } else if (type === "Corporate Treasury") {
      label = labelsCorporate[rank % labelsCorporate.length] + ` (Node ${rank})`;
    } else if (type === "Smart Contract Bridge") {
      label = labelsBridges[rank % labelsBridges.length];
    } else {
      label = labelsWhale[rank % labelsWhale.length] + ` #${1000 + rank}`;
    }

    // Generate hexadecimal address deterministically
    const rawHashParts = [
      asset.toLowerCase(),
      rank.toString(16),
      Math.abs(Math.sin(rank) * 10000000).toString(16).slice(0, 8),
      "4fd8",
      "92a" + (rank % 10),
      "bc19"
    ];
    let address = "";
    if (asset === "BTC") {
      address = `bc1q${rawHashParts.join("").slice(0, 36)}`;
    } else if (asset === "SOL") {
      address = `${rawHashParts.join("").toUpperCase().slice(0, 24)}HkZp${rank}Y9`;
    } else {
      address = `0x${rawHashParts.join("").slice(0, 38)}`;
    }

    // Days ago
    const daysAgo = (rank % 15) === 0 ? "1 hr ago" : `${Math.floor(rank / 4.4) + 1} days ago`;

    holders.push({
      rank,
      address,
      label,
      type,
      balance,
      valueUsd,
      percentage: Number(percentage.toFixed(4)),
      periodChange: parseFloat(periodPctChange),
      lastActive: daysAgo
    });
  }

  return holders;
}

// Generates 200 Volume Addresses (trading volume in 7 days)
function generateTop200Volume(asset: string, price: number): VolumeAddress[] {
  const volumeList: VolumeAddress[] = [];

  let baseVolScaleUsd = 120000000; // default for major stablecoins/assets
  if (asset === "BTC") baseVolScaleUsd = 210000000;
  else if (asset === "ETH") baseVolScaleUsd = 145000000;
  else if (asset === "SOL") baseVolScaleUsd = 85000000;
  else if (asset === "PYUSD") baseVolScaleUsd = 45000000;
  else if (asset === "USD1") baseVolScaleUsd = 15000000;
  else if (asset === "USDS") baseVolScaleUsd = 180000000;
  else if (asset === "DAI") baseVolScaleUsd = 140000000;
  else if (asset === "USDe") baseVolScaleUsd = 190000000;
  else if (asset === "PAXG") baseVolScaleUsd = 8000000;

  const botLabels = ["ArbVanguard-Flash", "JitoBundler-MEV", "DexTornado-Bot", "SlippageSteal-Router", "LiquidatorPrime"];
  const mmLabels = ["Wintermute Market Maker", "Jump Liquidity Guard", "Cumberland Flow Router", "AmberGroup Market Node", "GSR Prime Liquidity"];
  const cexHotLabels = ["Binance Hot Sweep", "Coinbase Fast Deposit", "OKX Aggregator Node", "Kraken Router Outflow", "HTX Instant Pool"];
  const defiSmartLabels = ["UniSwap Router v3-4", "1inch Router Splitter", "Jupiter SWAP Protocol", "Curve Triple Pool Deposit", "CoW Protocol Settlement"];
  const instLabels = ["DRW Holdings Core", "Susquehanna Crypto Fund", "Jane Street Prime Flow", "Citadel Securities Node", "Point72 Token Pool"];
  const whaleLabels = ["Sovereign Trader Whale", "High-Volume Execution Entity", "Speculative Intra-Day Aggregator", "Delta-Neutral Arbitrageur"];

  for (let rank = 1; rank <= 200; rank++) {
    // Decay factor for 7-day trade volume
    const factor = Math.pow(rank, -0.68);
    const volumeUsd = baseVolScaleUsd * factor * (0.88 + Math.cos(rank * 0.23) * 0.12);
    const txCount7d = Math.round(5000 * Math.pow(rank, -0.5) * (0.5 + Math.sin(rank) * 0.4)) + (rank % 12 === 0 ? 12000 : 25);
    const averageTxSizeUsd = volumeUsd / txCount7d;

    let type: VolumeAddress["type"] = "Arbitrage Bot";
    let label = "";

    const typeMod = rank % 6;
    if (typeMod === 0) type = "Arbitrage Bot";
    else if (typeMod === 1) type = "Exchange Hot Wallet";
    else if (typeMod === 2) type = "Market Maker";
    else if (typeMod === 3) type = "DeFi Smart Contract";
    else if (typeMod === 4) type = "Institution/Fund";
    else type = "High-Freq Whale";

    if (type === "Arbitrage Bot") {
      label = botLabels[rank % botLabels.length] + `_#${rank}`;
    } else if (type === "Market Maker") {
      label = mmLabels[rank % mmLabels.length] + ` (#${(rank % 2) + 1})`;
    } else if (type === "Exchange Hot Wallet") {
      label = cexHotLabels[rank % cexHotLabels.length] + ` v${rank % 3}`;
    } else if (type === "DeFi Smart Contract") {
      label = defiSmartLabels[rank % defiSmartLabels.length];
    } else if (type === "Institution/Fund") {
      label = instLabels[rank % instLabels.length];
    } else {
      label = whaleLabels[rank % whaleLabels.length] + ` (ID ${5000 + rank})`;
    }

    const flowMod = rank % 3;
    const netFlowType: VolumeAddress["netFlowType"] = flowMod === 0 ? "Inflow" : flowMod === 1 ? "Outflow" : "Neutral";

    // Generate address hash
    const rawHashParts = [
      rank.toString(16),
      Math.abs(Math.cos(rank) * 10000000).toString(16).slice(0, 8),
      asset.toLowerCase(),
      "7dvol",
      "ff4" + (rank % 10)
    ];

    let address = "";
    if (asset === "BTC") {
      address = `bc1q${rawHashParts.join("").slice(0, 36)}`;
    } else if (asset === "SOL") {
      address = `${rawHashParts.join("").toUpperCase().slice(0, 24)}HkVol${rank}`;
    } else {
      address = `0x${rawHashParts.join("").slice(0, 38)}`;
    }

    volumeList.push({
      rank,
      address,
      label,
      type,
      sevenDayVolumeUsd: volumeUsd,
      txCount7d,
      averageTxSizeUsd,
      netFlowType,
      dominantAsset: asset
    });
  }

  return volumeList;
}

export const AddressHoldingsHub: React.FC<AddressHoldingsHubProps> = ({ currentPrices, onSelectAddress }) => {
  const [selectedAsset, setSelectedAsset] = useState<string>("BTC");
  
  const activePrice = currentPrices[selectedAsset] || 1;

  const [selectedPeriod, setSelectedPeriod] = useState<string>("Last 30 Days");
  const [activeTab, setActiveTab] = useState<"holdings" | "volume">("holdings");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedEntityType, setSelectedEntityType] = useState<string>("All");
  const [selectedHeatmapAddress, setSelectedHeatmapAddress] = useState<string>("");
  const [copiedWallet, setCopiedWallet] = useState<string>("");
  
  // Chart timeframe state selection
  const [chartPeriod, setChartPeriod] = useState<"7D" | "30D" | "90D" | "1Y">("30D");

  // Multi-wallet side-by-side selection
  const [compareAddresses, setCompareAddresses] = useState<string[]>([]);

  const toggleAddressCompare = (address: string) => {
    setCompareAddresses(prev => {
      if (prev.includes(address)) {
        return prev.filter(addr => addr !== address);
      }
      if (prev.length >= 2) {
        return [prev[1], address];
      }
      return [...prev, address];
    });
  };

  // TOAST NOTIFICATION CONFIG AND HOOK STATES
  interface ToastNotification {
    id: string;
    title: string;
    message: string;
    type: "success" | "info" | "warning";
    timestamp: string;
    whaleRank: number;
    whaleLabel: string;
    asset: string;
    diffAmount: number;
    diffUsd: number;
    newBalance: number;
  }

  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [autoSimulate, setAutoSimulate] = useState<boolean>(true);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const addToast = (params: {
    whaleRank: number;
    whaleLabel: string;
    asset: string;
    diffAmount: number;
    diffUsd: number;
    newBalance: number;
  }) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastNotification = {
      id,
      title: "⚡ WHALE WALLET SURGE",
      message: `${params.whaleLabel} is actively stacking more ${params.asset}.`,
      type: "success",
      timestamp: new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      whaleRank: params.whaleRank,
      whaleLabel: params.whaleLabel,
      asset: params.asset,
      diffAmount: params.diffAmount,
      diffUsd: params.diffUsd,
      newBalance: params.newBalance
    };

    setToasts(prev => [newToast, ...prev].slice(0, 4));

    // Auto-dismiss within 6 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 6000);
  };

  const historicalTrends = useMemo(() => {
    let numPoints = 12;
    if (chartPeriod === "7D") numPoints = 7;
    else if (chartPeriod === "30D") numPoints = 12;
    else if (chartPeriod === "90D") numPoints = 15;
    else if (chartPeriod === "1Y") numPoints = 12;

    const basePrice = activePrice;
    
    // Baseline TVL scale in USD Billions
    let baseTvlUsd = 4.8; 
    if (selectedAsset === "BTC") baseTvlUsd = 12.5;
    else if (selectedAsset === "ETH") baseTvlUsd = 48.2;
    else if (selectedAsset === "USDT") baseTvlUsd = 110.0;
    else if (selectedAsset === "USDC") baseTvlUsd = 32.5;
    else if (selectedAsset === "PYUSD") baseTvlUsd = 0.38;
    else if (selectedAsset === "USD1") baseTvlUsd = 0.12;
    else if (selectedAsset === "USDS") baseTvlUsd = 5.4;
    else if (selectedAsset === "DAI") baseTvlUsd = 5.1;
    else if (selectedAsset === "USDe") baseTvlUsd = 3.4;
    else if (selectedAsset === "PAXG") baseTvlUsd = 0.45;

    const data = [];
    const dateObj = new Date();
    
    for (let i = numPoints - 1; i >= 0; i--) {
      const d = new Date();
       d.setTime(dateObj.getTime());
      if (chartPeriod === "7D") {
        d.setDate(dateObj.getDate() - i);
      } else if (chartPeriod === "30D") {
        d.setDate(dateObj.getDate() - Math.round(i * 2.5));
      } else if (chartPeriod === "90D") {
        d.setDate(dateObj.getDate() - i * 6);
      } else if (chartPeriod === "1Y") {
        d.setMonth(dateObj.getMonth() - i);
      }

      const label = d.toLocaleDateString(undefined, { 
        month: "short", 
        day: chartPeriod === "1Y" ? undefined : "numeric"
      });

      const assetPhase = selectedAsset.length * 0.4;
      const t = (numPoints - 1 - i) / (numPoints - 1 || 1); 
      
      const waveValPrice = Math.sin(t * Math.PI * 1.5 + assetPhase) * 0.12 + Math.cos(t * Math.PI * 0.8) * 0.05;
      const waveValTvl = Math.sin(t * Math.PI * 1.2 + assetPhase + 0.5) * 0.15 + Math.cos(t * Math.PI * 1.1) * 0.04;

      const currentPriceFactor = 1.0 + waveValPrice * (1 - t) * 0.8;
      const pointPrice = basePrice * currentPriceFactor;
      const pointTvl = baseTvlUsd * (1.0 + waveValTvl * 0.6 + waveValPrice * 0.2);

      data.push({
        date: label,
        Price: Number(pointPrice.toFixed(selectedAsset.includes("USD") ? 4 : 2)),
        TVL: Number(pointTvl.toFixed(2)),
      });
    }

    if (data.length > 0) {
      data[data.length - 1].Price = basePrice;
    }

    return data;
  }, [selectedAsset, chartPeriod, activePrice]);

  const tvlChangePct = useMemo(() => {
    if (historicalTrends.length < 2) return 0;
    const initial = historicalTrends[0].TVL;
    const final = historicalTrends[historicalTrends.length - 1].TVL;
    return Number((((final - initial) / initial) * 100).toFixed(1));
  }, [historicalTrends]);

  const priceChangePct = useMemo(() => {
    if (historicalTrends.length < 2) return 0;
    const initial = historicalTrends[0].Price;
    const final = historicalTrends[historicalTrends.length - 1].Price;
    return Number((((final - initial) / initial) * 100).toFixed(1));
  }, [historicalTrends]);

  const correlationDesc = useMemo(() => {
    if (selectedAsset.includes("USD")) {
      return { val: "0.08", status: "Stable Shielded", style: "text-emerald-400 bg-emerald-950/20" };
    }
    const hash = selectedAsset.length % 3;
    if (hash === 0) return { val: "0.89", status: "Synthesized Sync", style: "text-cyan-400 bg-cyan-950/30" };
    if (hash === 1) return { val: "0.76", status: "Strong Positive", style: "text-purple-400 bg-purple-950/30" };
    return { val: "0.52", status: "Moderate Positive", style: "text-amber-400 bg-amber-950/30" };
  }, [selectedAsset]);
  
  // Pagination State (20 items per page)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 15;

  // Refresh lists when selection changes
  const holdersListOriginal = useMemo(() => {
    return generateTop200Holders(selectedAsset, selectedPeriod, activePrice);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAsset, selectedPeriod]);

  const [holdersList, setHoldersList] = useState<HoldingAddress[]>([]);

  useEffect(() => {
    setHoldersList(holdersListOriginal);
  }, [holdersListOriginal]);

  const holdersWithLiveUsd = useMemo(() => {
    return holdersList.map(item => ({
      ...item,
      valueUsd: item.balance * activePrice
    }));
  }, [holdersList, activePrice]);

  const updateWhaleHoldings = (rankToModify: number, increasePct: number) => {
    setHoldersList(prevList => {
      if (!prevList || prevList.length === 0) return prevList;
      return prevList.map(item => {
        if (item.rank === rankToModify) {
          const incrementFactor = 1 + increasePct / 100;
          const newBalance = Math.round(item.balance * incrementFactor);
          const newValueUsd = newBalance * activePrice;
          const extraPct = parseFloat((parseFloat(String(item.periodChange)) + increasePct).toFixed(2));
          const percentageRatio = newBalance / item.balance;
          const newPercentage = Number((item.percentage * percentageRatio).toFixed(4));
          
          addToast({
            whaleRank: item.rank,
            whaleLabel: item.label,
            asset: selectedAsset,
            diffAmount: newBalance - item.balance,
            diffUsd: newValueUsd - item.valueUsd,
            newBalance: newBalance
          });

          return {
            ...item,
            balance: newBalance,
            valueUsd: newValueUsd,
            periodChange: extraPct,
            percentage: newPercentage,
            lastActive: "Just now"
          };
        }
        return item;
      });
    });
  };

  useEffect(() => {
    if (!autoSimulate) return;

    const interval = setInterval(() => {
      const randomRank = Math.floor(Math.random() * 10) + 1; // top 10 positions
      const randomPct = Number((3 + Math.random() * 8).toFixed(2));
      updateWhaleHoldings(randomRank, randomPct);
    }, 16000);

    return () => clearInterval(interval);
  }, [autoSimulate, selectedAsset, activePrice]);

  const volumesList = useMemo(() => {
    return generateTop200Volume(selectedAsset, activePrice);
  }, [selectedAsset, activePrice]);

  // Dynamic Risk Heatmap generation (Top 100 address cells)
  const heatmapData = useMemo(() => {
    return holdersWithLiveUsd.slice(0, 100).map((item) => {
      let baseScore = 15;
      
      // Type-based systemic risk score
      if (item.type === "Smart Contract Bridge") baseScore = 80;
      else if (item.type === "Individual Whale") baseScore = 70;
      else if (item.type === "DeFi Protocol") baseScore = 55;
      else if (item.type === "Exchange") baseScore = 32;
      else if (item.type === "Institution/Fund") baseScore = 18;
      else if (item.type === "Corporate Treasury") baseScore = 8;

      // Concentration risk addition (percentage of held supply)
      let concentrationAdd = 0;
      if (item.percentage > 2.0) {
        concentrationAdd = 18;
      } else if (item.percentage > 0.8) {
        concentrationAdd = 12;
      } else if (item.percentage > 0.3) {
        concentrationAdd = 6;
      }

      // Outflow/Vol volatility addition
      let velocityAdd = 0;
      const parsedChange = parseFloat(String(item.periodChange));
      if (parsedChange < -5) {
        velocityAdd = 12; // Massive selling is elevated risk
      } else if (parsedChange > 12) {
        velocityAdd = 5; // Rapid bubble accumulation
      }

      const finalScore = Math.min(99, Math.max(5, baseScore + concentrationAdd + velocityAdd));
      
      let riskLevel: "Critical" | "Elevated" | "Moderate" | "Minimal" = "Minimal";
      if (finalScore >= 75) riskLevel = "Critical";
      else if (finalScore >= 50) riskLevel = "Elevated";
      else if (finalScore >= 25) riskLevel = "Moderate";

      return {
        ...item,
        riskScore: finalScore,
        riskLevel,
      };
    });
  }, [holdersWithLiveUsd]);

  const activeHeatmapItem = useMemo(() => {
    if (!heatmapData.length) return null;
    return heatmapData.find(h => h.address === selectedHeatmapAddress) || heatmapData[0];
  }, [heatmapData, selectedHeatmapAddress]);

  const isMatch = (item: any) => {
    const matchesSearch = !searchQuery || item.address.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.label.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedEntityType === "All" || item.type === selectedEntityType;
    return matchesSearch && matchesType;
  };

  // Reset page on filter/tab changes
  useEffect(() => {
    setCurrentPage(1);
    setSearchQuery("");
    setSelectedEntityType("All");
  }, [selectedAsset, selectedPeriod, activeTab]);

  // Filters for Holdings Tab
  const filteredHolders = useMemo(() => {
    return holdersWithLiveUsd.filter(item => {
      const matchesSearch = item.address.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.label.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedEntityType === "All" || item.type === selectedEntityType;
      return matchesSearch && matchesType;
    });
  }, [holdersWithLiveUsd, searchQuery, selectedEntityType]);

  // Filters for Volume Tab
  const filteredVolumes = useMemo(() => {
    return volumesList.filter(item => {
      const matchesSearch = item.address.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.label.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedEntityType === "All" || item.type === selectedEntityType;
      return matchesSearch && matchesType;
    });
  }, [volumesList, searchQuery, selectedEntityType]);

  // Look up full metadata of compared wallets (from holdings or volume top 200 list)
  const comparedWallets = useMemo(() => {
    return compareAddresses.map(address => {
      const holder = holdersWithLiveUsd.find(h => h.address === address);
      if (holder) {
        return {
          address: holder.address,
          label: holder.label,
          type: holder.type,
          rank: holder.rank,
          balance: holder.balance,
          valueUsd: holder.valueUsd,
          percentage: holder.percentage,
          periodChange: holder.periodChange,
          lastActive: holder.lastActive,
          isVolumeAsset: false,
          txCount7d: undefined,
          sevenDayVolumeUsd: undefined,
          averageTxSizeUsd: undefined,
          netFlowType: undefined,
          dominantAsset: selectedAsset,
          riskScore: Math.round(holder.rank * 0.4 + 15) > 100 ? 95 : Math.round(holder.rank * 0.4 + 15), // deterministic simulated risk
        };
      }
      const volEntity = volumesList.find(v => v.address === address);
      if (volEntity) {
        return {
          address: volEntity.address,
          label: volEntity.label,
          type: volEntity.type,
          rank: volEntity.rank,
          balance: volEntity.sevenDayVolumeUsd / activePrice,
          valueUsd: volEntity.sevenDayVolumeUsd,
          percentage: Number(((volEntity.sevenDayVolumeUsd / activePrice) / 10000000 * 100).toFixed(4)),
          periodChange: volEntity.netFlowType === "Inflow" ? 4.5 : volEntity.netFlowType === "Outflow" ? -3.8 : 0.0,
          lastActive: "Active (7d)",
          isVolumeAsset: true,
          txCount7d: volEntity.txCount7d,
          sevenDayVolumeUsd: volEntity.sevenDayVolumeUsd,
          averageTxSizeUsd: volEntity.averageTxSizeUsd,
          netFlowType: volEntity.netFlowType,
          dominantAsset: volEntity.dominantAsset,
          riskScore: Math.round(volEntity.txCount7d * 0.05 + 25) > 100 ? 90 : Math.round(volEntity.txCount7d * 0.05 + 25), // deterministic simulated risk
        };
      }
      return {
        address,
        label: "External Whale Wallet",
        type: "Individual Whale" as const,
        rank: 999,
        balance: 1540,
        valueUsd: 1540 * activePrice,
        percentage: 0.015,
        periodChange: 1.2,
        lastActive: "Recent",
        isVolumeAsset: false,
        txCount7d: undefined,
        sevenDayVolumeUsd: undefined,
        averageTxSizeUsd: undefined,
        netFlowType: undefined,
        dominantAsset: selectedAsset,
        riskScore: 35
      };
    });
  }, [compareAddresses, holdersWithLiveUsd, volumesList, selectedAsset, activePrice]);

  // Chart data simulating asset trajectory progression of compared wallets
  const comparedHistoricalSeries = useMemo(() => {
    if (comparedWallets.length === 0) return [];
    const numPoints = 12;
    const series = [];
    
    for (let i = numPoints - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i * 2);
      const dateLabel = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
      
      const dataPoint: any = { date: dateLabel };
      comparedWallets.forEach((wallet, idx) => {
        const volatility = idx === 0 ? 0.03 : 0.05;
        const trendDirection = wallet.periodChange >= 0 ? 1 : -1;
        const drift = (trendDirection * (numPoints - 1 - i) / (numPoints - 1)) * Math.abs(wallet.periodChange) / 100;
        const sineSwing = Math.sin(i * 0.8 + idx * 1.5) * volatility;
        const valueMult = 1 + sineSwing + drift;
        dataPoint[`wallet_${idx}_val`] = Math.round(wallet.valueUsd * valueMult);
        dataPoint[`wallet_${idx}_lbl`] = wallet.label;
      });
      series.push(dataPoint);
    }
    return series;
  }, [comparedWallets]);

  // Current Paginated Data
  const paginatedHolders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredHolders.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredHolders, currentPage]);

  const paginatedVolumes = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredVolumes.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredVolumes, currentPage]);

  const totalPages = activeTab === "holdings" 
    ? Math.ceil(filteredHolders.length / itemsPerPage) 
    : Math.ceil(filteredVolumes.length / itemsPerPage);

  // Entities breakdown lists based on current selected coin (For custom visual graphs)
  const entityBreakdownData = useMemo(() => {
    const breakdown: Record<string, { value: number; count: number }> = {};
    holdersWithLiveUsd.slice(0, 100).forEach(item => {
      if (!breakdown[item.type]) {
        breakdown[item.type] = { value: 0, count: 0 };
      }
      breakdown[item.type].value += item.valueUsd;
      breakdown[item.type].count += 1;
    });

    return Object.entries(breakdown).map(([name, stat]) => ({
      name,
      value: Math.round(stat.value),
      count: stat.count
    }));
  }, [holdersWithLiveUsd]);

  // Export filtered options to JSON helper
  const handleExportData = () => {
    const dataToExport = activeTab === "holdings" ? filteredHolders : filteredVolumes;
    const jsonString = `data:text/json;charset=utf-8,` + encodeURIComponent(
      JSON.stringify({
        asset: selectedAsset,
        period: selectedPeriod,
        type: activeTab,
        totalCount: dataToExport.length,
        extractedAt: new Date().toISOString(),
        data: dataToExport
      }, null, 2)
    );
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", `whaletrack_${selectedAsset.toLowerCase()}_top_200_${activeTab}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Dynamic corporate & backing reserves selector
  const activeBackingDashboard = INSTITUTIONAL_BACKING_DASHBOARD[selectedAsset];
  const corporateTreasuryList = ALL_ASSET_CORPORATE_TREASURIES[selectedAsset] || [];

  const stablePieData = useMemo(() => {
    if (!activeBackingDashboard) return [];
    return activeBackingDashboard.pieData;
  }, [activeBackingDashboard]);

  return (
    <section 
      id="onchain-accumulation-hub" 
      className="bg-slate-950 p-5 md:p-6 rounded-2xl border border-slate-900 shadow-2xl relative overflow-hidden transition-all duration-300 space-y-6"
    >
      {/* Decorative neon trace line */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-500 to-indigo-500 opacity-60"></div>

      {/* Header telemetry area */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping"></span>
            <span className="text-[10px] font-mono tracking-widest text-cyan-400 font-bold uppercase">SECUREGON BLOCKCHAIN DECO-STREAMS</span>
          </div>
          <h2 className="text-lg md:text-xl font-mono font-black tracking-tight text-slate-100 flex items-center gap-2">
            <Layers className="h-5.5 w-5.5 text-cyan-500" />
            ON-CHAIN ADRESS METRIC HUB
          </h2>
          <p className="text-xs text-slate-400 font-sans max-w-2xl">
            Real-time balance concentration matrices. Scan up to 200 elite network nodes holding the largest capital reserves or registering absolute transactional activity limits during dynamic periods.
          </p>
        </div>

        {/* Global Selectors panel */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Asset picker */}
          <div className="flex flex-col">
            <span className="text-[9px] font-mono text-slate-500 font-bold uppercase mb-1">SELECT REGULATORY ASSET / STABLECOIN</span>
            <div className="flex flex-wrap gap-1 bg-slate-900/60 p-1 rounded-lg border border-slate-800 font-mono text-xs max-w-2xl">
              {["BTC", "ETH", "SOL", "USDT", "USDC", "PYUSD", "USD1", "USDS", "DAI", "USDe", "PAXG"].map((coin) => (
                <button
                  key={coin}
                  onClick={() => setSelectedAsset(coin)}
                  className={`px-2 py-1 rounded transition-all cursor-pointer text-[10px] font-bold ${
                    selectedAsset === coin 
                      ? coin === "PAXG" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold" :
                        coin === "USDe" ? "bg-pink-500/20 text-pink-400 border border-pink-500/30 font-semibold" :
                        coin === "DAI" || coin === "USDS" ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 font-semibold" :
                        ["USDT", "USDC", "PYUSD", "USD1"].includes(coin) ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold" :
                        "bg-slate-800 text-cyan-400 border border-slate-700 font-bold" 
                      : "text-slate-400 hover:text-slate-200 border border-transparent"
                  }`}
                >
                  {coin}
                </button>
              ))}
            </div>
          </div>

          {/* Period setting picker (only applicable or rendered primarily in holdings context) */}
          <div className="flex flex-col">
            <span className="text-[9px] font-mono text-slate-500 font-bold uppercase mb-1">HOLDINGS TIMING DEPTH</span>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-slate-900 text-slate-300 font-mono text-xs font-bold rounded-lg py-2 px-3 border border-slate-800 focus:border-cyan-500 outline-none cursor-pointer hover:bg-slate-850 h-9"
            >
              <option value="Last 24 Hours">Last 24 Hours</option>
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="Last 90 Days">Last 90 Days</option>
              <option value="Last 1 Year">Last 1 Year</option>
            </select>
          </div>

          {/* Whale Simulation Tool */}
          <div className="flex flex-col">
            <span className="text-[9px] font-mono text-indigo-400 font-bold uppercase mb-1">WHALE ANOMALY GENERATOR</span>
            <div className="flex items-center gap-2.5 bg-slate-900/80 p-0.5 rounded-lg border border-slate-800 h-9 text-xs px-2.5 font-mono">
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-400 hover:text-cyan-400 select-none transition-all">
                <input
                  type="checkbox"
                  checked={autoSimulate}
                  onChange={(e) => setAutoSimulate(e.target.checked)}
                  className="accent-cyan-400 h-3.5 w-3.5 bg-slate-950 border border-slate-800 rounded cursor-pointer"
                />
                <span className="text-[10px] font-bold tracking-wider">AUTOSTREAM</span>
              </label>
              
              <div className="h-4 w-[1px] bg-slate-800" />
              
              <button
                onClick={() => {
                  const randomRank = Math.floor(Math.random() * 10) + 1;
                  const randomPct = Number((3 + Math.random() * 12).toFixed(2));
                  updateWhaleHoldings(randomRank, randomPct);
                }}
                className="flex items-center gap-1 text-[10px] font-bold text-cyan-400 bg-slate-850 px-2 py-1 rounded hover:bg-slate-800 transition-all border border-slate-800 hover:border-cyan-500/20 active:scale-95 cursor-pointer"
              >
                <RefreshCw className={`h-3 w-3 ${autoSimulate ? "animate-spin" : ""}`} style={{ animationDuration: "5s" }} />
                Instant Boost
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid containing Custom Backing Reserve Panel & Corporates */}
      {activeBackingDashboard && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 border border-slate-900 bg-slate-950/60 p-4 md:p-5 rounded-xl text-slate-200">
          
          {/* Reserve circular statistics breakdown block */}
          <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-900/30 inline-block text-[9px]">
                {activeBackingDashboard.tag}
              </span>
              <h3 className="text-base font-mono font-bold inline-flex items-center gap-1.5 text-slate-100">
                <Building2 className="h-4.5 w-4.5 text-indigo-400" />
                {activeBackingDashboard.title}
              </h3>
              <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                {activeBackingDashboard.description}
              </p>
            </div>

            <div className="w-full h-[150px] relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stablePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={68}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {stablePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#020617", borderColor: "#1e293b", borderRadius: "8px" }}
                    itemStyle={{ color: "#e2e8f0", fontFamily: "monospace", fontSize: "11px" }}
                    formatter={(value) => [`${value}%`, "Allocation"]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-bold">RATING</span>
                <span className="text-xl font-bold text-emerald-400 font-mono tracking-tight">{activeBackingDashboard.systemicRiskScore}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono bg-slate-900/40 p-2.5 rounded border border-slate-900">
              <div className="text-slate-400">
                Auditor: <span className="text-slate-200 font-bold block">{activeBackingDashboard.auditFirm}</span>
              </div>
              <div className="text-slate-400">
                Last Update: <span className="text-slate-200 font-bold block">{activeBackingDashboard.lastAuditedDate}</span>
              </div>
              <div className="text-slate-400">
                {activeBackingDashboard.redemptionSlaHours !== undefined ? (
                  <>SLA Hours: <span className="text-slate-200 font-bold block">{activeBackingDashboard.redemptionSlaHours} hrs SLA</span></>
                ) : activeBackingDashboard.stakingYield !== undefined ? (
                  <>Staking Yield: <span className="text-emerald-400 font-bold block">{activeBackingDashboard.stakingYield}% APR</span></>
                ) : (
                  <>Market Standard: <span className="text-slate-200 font-bold block">Regulated Custody</span></>
                )}
              </div>
              <div className="text-slate-400">
                Corporate Core: <span className="text-slate-200 font-bold block">{activeBackingDashboard.enterpriseUsersCount}+ Corps</span>
              </div>
            </div>
          </div>

          {/* Reserve Backing breakdown descriptive list */}
          <div className="lg:col-span-3 flex flex-col justify-center space-y-3">
            <span className="text-[9px] font-mono text-slate-500 font-bold uppercase tracking-wider">COLLATERAL CATEGORIES</span>
            <div className="space-y-2.5">
              {stablePieData.map((item, index) => (
                <div key={index} className="flex items-center justify-between font-mono text-xs p-1.5 border-b border-slate-900/50">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                    <span className="text-slate-300 font-medium">{item.name}</span>
                  </div>
                  <span className="text-slate-150 font-bold">{item.value.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Institutional Enterprise Holders and Corporate Backers */}
          <div className="lg:col-span-5 space-y-3 overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-cyan-400 tracking-wider uppercase inline-flex items-center gap-1">
                <Award className="h-3.5 w-3.5 text-cyan-400" />
                ENTERPRISE RESERVES & OTC ALLOCATIONS
              </span>
            </div>

            <div className="divide-y divide-slate-900 max-h-[220px] overflow-y-auto pr-1 select-none no-scrollbar border border-slate-900 rounded bg-slate-950 p-2.5 space-y-1.5 leading-none">
              {corporateTreasuryList.map((ent, idx) => (
                <div key={idx} className="pb-2 pt-1 font-mono hover:bg-slate-900/30 rounded px-1.5 transition-all">
                  <div className="flex items-center justify-between gap-2 overflow-hidden">
                    <span className="text-slate-200 font-bold truncate text-[11px]">{ent.name}</span>
                    <span className="text-cyan-400 font-bold text-[11px] text-right">
                      {ent.holdingAmount >= 1000000 
                        ? `${(ent.holdingAmount / 1000000).toFixed(2)}M` 
                        : ent.holdingAmount >= 1000 
                        ? `${(ent.holdingAmount / 1000).toFixed(1)}k` 
                        : ent.holdingAmount.toLocaleString()}{" "}
                      {selectedAsset}
                      <span className="text-slate-500 font-normal text-[9px] block text-right mt-0.5">
                        (${ent.holdingUsd >= 1000000000 
                          ? `${(ent.holdingUsd / 1000000000).toFixed(2)}B` 
                          : `${(ent.holdingUsd / 1000000).toFixed(1)}M`} USD)
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[9px] text-slate-500 mt-1">
                    <span className="truncate max-w-[150px]">{ent.useCase}</span>
                    <span className={`text-[8px] border px-1 rounded uppercase font-semibold ${
                      ent.riskClass === "Minimal" ? "bg-emerald-950/40 text-emerald-400 border-emerald-900/30" :
                      ent.riskClass === "Low" ? "bg-cyan-950/40 text-cyan-400 border-cyan-900/30" :
                      ent.riskClass === "Medium" ? "bg-amber-950/40 text-amber-400 border-amber-900/30" :
                      "bg-rose-950/40 text-rose-400 border-rose-900/30"
                    }`}>
                      {ent.riskClass} Risk
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            <p className="text-[10px] text-slate-500 font-sans italic text-right leading-none">
              *Displays vetted entities holding or settling institutional size over the past 30 days.
            </p>
          </div>
        </div>
      )}

      {STABLECOIN_CLASSIFICATIONS[selectedAsset] && (
        <div className="border border-slate-800 bg-slate-950/40 p-4 md:p-5 rounded-xl text-slate-200 grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
          <div className="lg:col-span-8 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono font-bold tracking-widest text-cyan-405 text-cyan-400 uppercase">STABLECOIN CLASSIFICATION & PROTOCOL TYPE</span>
              <span className={`text-[9px] font-mono font-bold border px-2 py-0.5 rounded-full ${STABLECOIN_CLASSIFICATIONS[selectedAsset].badgeColor}`}>
                {STABLECOIN_CLASSIFICATIONS[selectedAsset].category}
              </span>
            </div>
            <h4 className="text-sm font-mono font-bold text-slate-100 uppercase">
              {selectedAsset} Structural Categorization Paradigm
            </h4>
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              {STABLECOIN_CLASSIFICATIONS[selectedAsset].definition}
            </p>
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500 pt-1">
              <span className="font-bold text-slate-400">Reserve Verification Protocol:</span>
              <span className="text-slate-300 italic">{STABLECOIN_CLASSIFICATIONS[selectedAsset].reserveVerificationMode}</span>
            </div>
          </div>
          
          {/* A neat side indicator panel comparing types under scholar view */}
          <div className="lg:col-span-4 bg-slate-900/60 border border-slate-800/80 rounded-lg p-3 space-y-2 font-mono text-[10px] w-full">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">SCHOLASTIC TAXONOMY MATRIX</span>
            <div className="space-y-1.5">
              {[
                { name: "Fiat-Collateralized", examples: "USDT, USDC, PYUSD, USD1", active: STABLECOIN_CLASSIFICATIONS[selectedAsset].category === "Fiat-Collateralized" },
                { name: "Crypto-Collateralized", examples: "DAI, USDS (Sky Dollar)", active: STABLECOIN_CLASSIFICATIONS[selectedAsset].category === "Crypto-Collateralized" },
                { name: "Synthetic / Algorithmic", examples: "USDe (Delta-Neutral Hedging)", active: STABLECOIN_CLASSIFICATIONS[selectedAsset].category === "Synthetic / Algorithmic" },
                { name: "Commodity-Backed", examples: "PAXG (Physical Gold)", active: STABLECOIN_CLASSIFICATIONS[selectedAsset].category === "Commodity-Backed" }
              ].map((t) => (
                <div key={t.name} className={`p-1.5 rounded border transition-all ${
                  t.active 
                    ? "bg-cyan-950/25 border-cyan-800/80 text-cyan-400 font-bold font-semibold shadow-inner" 
                    : "bg-slate-950/30 border-slate-900 text-slate-500"
                }`}>
                  <div className="flex justify-between items-center text-[10px]">
                    <span>{t.name}</span>
                    {t.active && <span className="text-[8px] bg-cyan-900/40 px-1 rounded text-cyan-300 animate-pulse">ACTUAL</span>}
                  </div>
                  <span className={`text-[8px] font-sans font-normal block mt-0.5 ${t.active ? "text-cyan-500/80" : "text-slate-600"}`}>
                    e.g. {t.examples}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PRICE & TVL MOMENTUM ANALYTICS LINE CHART */}
      <div 
        className="bg-slate-950 border border-slate-900 rounded-xl p-5 space-y-4 relative overflow-hidden transition-all" 
        id="price-tvl-momentum-chart"
      >
        {/* Background circuit matrix styling */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0c101c_1px,transparent_1px),linear-gradient(to_bottom,#0c101c_1px,transparent_1px)] bg-[size:15px_15px] opacity-10 pointer-events-none"></div>

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-900 pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4.5 w-4.5 text-cyan-400 animate-pulse" />
            <div>
              <h3 className="font-mono text-xs font-bold text-slate-200 uppercase tracking-widest leading-none">
                {selectedAsset} Price vs. TVL Momentum Stream
              </h3>
              <p className="text-[9px] text-slate-500 font-mono mt-1">
                Synchronized historical chart mapping valuation trends against lockup reserve levels.
              </p>
            </div>
          </div>

          {/* Timeframe picker inside chart */}
          <div className="flex items-center gap-1.5 p-0.5 bg-slate-905 p-1 rounded-lg border border-slate-800 font-mono text-[10px]">
            {(["7D", "30D", "90D", "1Y"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setChartPeriod(p)}
                className={`px-2.5 py-1 rounded transition-all cursor-pointer font-bold ${
                  chartPeriod === p
                    ? "bg-slate-800 text-cyan-400 border border-slate-700/60 shadow"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Main Chart Canvas Area */}
          <div className="lg:col-span-8 bg-slate-1000/20 p-3 sm:p-4 border border-slate-900 rounded-lg h-[260px] sm:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={historicalTrends}
                margin={{ top: 10, right: 5, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#0f172a" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#475569" 
                  fontSize={9} 
                  tickLine={false}
                  fontFamily="monospace"
                />
                <YAxis 
                  yAxisId="left"
                  stroke="#06b6d4" 
                  fontSize={9} 
                  tickLine={false}
                  axisLine={false}
                  fontFamily="monospace"
                  domain={['auto', 'auto']}
                  tickFormatter={(val) => `$${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  stroke="#818cf8" 
                  fontSize={9} 
                  tickLine={false}
                  axisLine={false}
                  fontFamily="monospace"
                  domain={['auto', 'auto']}
                  tickFormatter={(val) => `$${val}B`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#020617", borderColor: "#1e293b", borderRadius: "8px" }}
                  labelStyle={{ color: "#94a3b8", fontFamily: "monospace", fontSize: "10px", fontWeight: "bold" }}
                  itemStyle={{ fontFamily: "monospace", fontSize: "10px" }}
                  formatter={(value: any, name: any) => {
                    if (name === "Price") {
                      return [`$${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, `${selectedAsset} Price`];
                    }
                    return [`$${value} Billion`, "Total Value Locked (TVL)"];
                  }}
                />
                <Legend 
                  verticalAlign="top"
                  height={36}
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: "10px", fontFamily: "monospace", paddingBottom: "10px" }}
                />
                <Line 
                  yAxisId="left"
                  name="Price"
                  type="monotone" 
                  dataKey="Price" 
                  stroke="#06b6d4" 
                  strokeWidth={2.5}
                  dot={{ r: 2 }}
                  activeDot={{ r: 4, strokeWidth: 0, fill: "#22d3ee" }}
                />
                <Line 
                  yAxisId="right"
                  name="TVL"
                  type="monotone" 
                  dataKey="TVL" 
                  stroke="#6366f1" 
                  strokeWidth={2.5}
                  dot={{ r: 2 }}
                  activeDot={{ r: 4, strokeWidth: 0, fill: "#818cf8" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Metrics Bento Box Panel */}
          <div className="lg:col-span-4 flex flex-col justify-between gap-3">
            <div className="p-3 bg-slate-900/20 border border-slate-900 rounded-lg space-y-3.5 h-full flex flex-col justify-between">
              <div>
                <span className="text-[8px] font-mono font-bold text-slate-500 tracking-wider uppercase block mb-3">
                  Momentum Stats Summary ({chartPeriod})
                </span>

                {/* Price trend stats grid */}
                <div className="grid grid-cols-2 gap-3 border-b border-slate-900 pb-3">
                  <div className="space-y-0.5">
                    <span className="text-[8px] text-slate-500 font-mono block uppercase font-bold">Latest valuation</span>
                    <span className="text-cyan-400 font-black font-mono text-xs sm:text-sm block">
                      ${activePrice.toLocaleString(undefined, { maximumFractionDigits: selectedAsset.includes("USD") ? 4 : 2 })}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[8px] text-slate-500 font-mono block uppercase font-bold">Price Wave</span>
                    <span className={`font-mono text-xs sm:text-sm font-black flex items-center gap-0.5 leading-none ${
                      priceChangePct >= 0 ? "text-emerald-400" : "text-rose-400"
                    }`}>
                      {priceChangePct >= 0 ? "+" : ""}{priceChangePct}%
                    </span>
                  </div>
                </div>

                {/* TVL trend stats grid */}
                <div className="grid grid-cols-2 gap-3 border-b border-slate-900 pb-3 pt-3">
                  <div className="space-y-0.5">
                    <span className="text-[8px] text-slate-500 font-mono block uppercase font-bold">Aggregate TVL</span>
                    <span className="text-indigo-400 font-black font-mono text-xs sm:text-sm block">
                      ${(historicalTrends[historicalTrends.length - 1]?.TVL || 0).toFixed(2)}B USD
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[8px] text-slate-500 font-mono block uppercase font-bold">TVL Momentum</span>
                    <span className={`font-mono text-xs sm:text-sm font-black flex items-center gap-0.5 leading-none ${
                      tvlChangePct >= 0 ? "text-emerald-400" : "text-rose-400"
                    }`}>
                      {tvlChangePct >= 0 ? "+" : ""}{tvlChangePct}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Valuation correlation index */}
              <div className="space-y-2 pt-2">
                <span className="text-[8px] text-slate-500 font-mono block uppercase font-bold">Dynamic Correlation Diagnostic</span>
                <div className={`p-2.5 rounded border border-slate-900/60 font-mono text-[10px] space-y-1.5 ${correlationDesc.style}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold uppercase text-[9px]">TIMELINE CORRELATION</span>
                    <span className="font-black">R: {correlationDesc.val}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold uppercase text-[9px]">AUDIT STATUS</span>
                    <span className="font-bold underline text-[9px]">{correlationDesc.status}</span>
                  </div>
                </div>
                <p className="text-[9px] text-slate-500 leading-normal font-sans">
                  Represents structural tracking efficiency. Highly positive values imply direct organic coordination between TVL deployment and overall price appreciation triggers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RISK CONCENTRATION MATRIX HEATMAP */}
      <div 
        className="bg-slate-950 border border-slate-900 rounded-xl p-5 space-y-4 relative overflow-hidden transition-all" 
        id="risk-concentration-heatmap"
      >
        {/* Decorative subtle grid lines background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0c101d_1px,transparent_1px),linear-gradient(to_bottom,#0c101d_1px,transparent_1px)] bg-[size:14px_14px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_100%,#000_100%,transparent_100%)] opacity-20 pointer-events-none"></div>
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-900 pb-3">
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-4.5 w-4.5 text-cyan-400 animate-pulse" />
            <div>
              <h3 className="font-mono text-xs font-bold text-slate-200 uppercase tracking-widest leading-none">
                Risk Concentration Heatmap
              </h3>
              <p className="text-[9px] text-slate-500 font-mono mt-1">
                Visualizing supply concentration, systemic entity classification, and capital transfer velocities.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[10px] font-mono">
            <span className="text-slate-500 uppercase font-semibold">ASSET BASE: </span>
            <span className="text-cyan-400 font-black">{selectedAsset} Top 100 Holdings</span>
          </div>
        </div>

        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Heatgrid Matrix */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono font-extrabold text-slate-400 tracking-wider uppercase block">
                Volatility Map (10x10 Node Spectrum)
              </span>
              <span className="text-[9px] font-mono text-slate-500 italic block">
                Rank 1 (Top Left) to Rank 100 (Bottom Right)
              </span>
            </div>

            <div className="bg-slate-1000/30 p-4 border border-slate-900 rounded-lg flex flex-col items-center">
              {/* Responsive 10x10 grid */}
              <div className="grid grid-cols-10 gap-1 sm:gap-1.5 w-full max-w-[450px]">
                {heatmapData.map((item) => {
                  const queryMatch = isMatch(item);
                  const isSelected = activeHeatmapItem?.address === item.address;
                  
                  let tileColorClass = "bg-emerald-500/80 hover:bg-emerald-400";
                  if (item.riskLevel === "Critical") {
                    tileColorClass = "bg-rose-600/90 hover:bg-rose-500 shadow-[0_0_4px_rgba(244,63,94,0.3)]";
                  } else if (item.riskLevel === "Elevated") {
                    tileColorClass = "bg-amber-500/90 hover:bg-amber-400 shadow-[0_0_4px_rgba(245,158,11,0.2)]";
                  } else if (item.riskLevel === "Moderate") {
                    tileColorClass = "bg-indigo-500/80 hover:bg-indigo-400";
                  }
                  
                  return (
                    <button
                      key={item.address}
                      onClick={() => setSelectedHeatmapAddress(item.address)}
                      style={isSelected ? {
                        "--glow-color": item.riskLevel === "Critical" ? "#ef4444" :
                                        item.riskLevel === "Elevated" ? "#f59e0b" :
                                        item.riskLevel === "Moderate" ? "#6366f1" : "#10b981"
                      } as React.CSSProperties : undefined}
                      className={`aspect-square rounded transition-all duration-300 relative cursor-pointer group/tile ${tileColorClass} ${
                        isSelected 
                          ? "z-20 animate-selected-node" 
                          : "hover:scale-110 hover:z-10 focus:outline-none"
                      } ${queryMatch ? "opacity-100" : "opacity-20 hover:opacity-45"}`}
                      title={`Rank #${item.rank}: ${item.label} (${item.type})`}
                    >
                      <span className="absolute inset-0 flex items-center justify-center font-mono text-[8px] sm:text-[9px] font-extrabold text-white opacity-0 group-hover/tile:opacity-100 transition-opacity pointer-events-none">
                        {item.rank}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Legend with risk labels */}
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 mt-4 pt-3 border-t border-slate-900 w-full text-[9px] sm:text-[10px] font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded bg-rose-600/95" />
                  <span className="text-slate-400">Critical Risk (≥75)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded bg-amber-500/95" />
                  <span className="text-slate-400">Elevated Risk (50-74)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded bg-indigo-500" />
                  <span className="text-slate-400">Moderate Risk (25-49)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded bg-emerald-500" />
                  <span className="text-slate-400">Minimal Risk (&lt;25)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Node concentration sidebar */}
          <div className="lg:col-span-5 p-4 bg-slate-900/10 border border-slate-900 rounded-lg flex flex-col justify-between space-y-4">
            {activeHeatmapItem ? (
              <div className="space-y-3.5 h-full flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] font-mono font-bold text-slate-500 tracking-wider uppercase block">
                      NODE RISK INSPECTOR
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400 font-extrabold bg-cyan-950/40 border border-cyan-900/30 px-1.5 py-0.2 rounded">
                      RANK #{activeHeatmapItem.rank}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-mono text-xs font-black text-slate-100 tracking-tight block truncate" title={activeHeatmapItem.label}>
                      {activeHeatmapItem.label}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-[9px] text-slate-500 select-all truncate block max-w-[200px]" title={activeHeatmapItem.address}>
                        {activeHeatmapItem.address}
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(activeHeatmapItem.address);
                          setCopiedWallet(activeHeatmapItem.address);
                          setTimeout(() => setCopiedWallet(""), 1500);
                        }}
                        className="text-cyan-500 hover:text-cyan-400 font-mono text-[8px] font-bold tracking-tighter px-1 rounded bg-cyan-950/30 border border-cyan-500/20 active:scale-95 transition-all cursor-pointer"
                      >
                        {copiedWallet === activeHeatmapItem.address ? "COPIED" : "COPY"}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 border-y border-slate-900/80 py-2 pt-1 font-mono text-[11px]">
                    <div className="pt-1">
                      <span className="text-[8px] text-slate-500 block uppercase font-bold">Supply Held</span>
                      <span className="text-white font-extrabold block">{activeHeatmapItem.percentage.toFixed(3)}%</span>
                    </div>
                    <div className="pt-1">
                      <span className="text-[8px] text-slate-500 block uppercase font-bold text-right sm:text-left">Period Wave</span>
                      <span className={`font-extrabold block text-right sm:text-left ${
                        parseFloat(String(activeHeatmapItem.periodChange)) >= 0 ? "text-emerald-400" : "text-rose-400"
                      }`}>
                        {parseFloat(String(activeHeatmapItem.periodChange)) >= 0 ? "+" : ""}{activeHeatmapItem.periodChange}%
                      </span>
                    </div>
                    <div className="col-span-2 pt-1 border-t border-slate-900/40">
                      <span className="text-[8px] text-slate-500 block uppercase font-bold">Total Holdings (USD)</span>
                      <span className="text-cyan-400 font-black block text-xs">
                        ${activeHeatmapItem.valueUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })} USD
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 font-mono">
                    <div className="flex items-center justify-between text-[9px] sm:text-[10px]">
                      <span className="text-slate-400 uppercase">SYSTEMIC CONCENTRATION SCORE:</span>
                      <span className={`font-black tracking-tight ${
                        activeHeatmapItem.riskLevel === "Critical" ? "text-rose-400" :
                        activeHeatmapItem.riskLevel === "Elevated" ? "text-amber-400" :
                        activeHeatmapItem.riskLevel === "Moderate" ? "text-indigo-300" : "text-emerald-400"
                      }`}>
                        {activeHeatmapItem.riskScore}%
                      </span>
                    </div>
                    <div className="h-1 bg-slate-900 rounded overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          activeHeatmapItem.riskLevel === "Critical" ? "bg-rose-500" :
                          activeHeatmapItem.riskLevel === "Elevated" ? "bg-amber-400" :
                          activeHeatmapItem.riskLevel === "Moderate" ? "bg-indigo-400" : "bg-emerald-500"
                        }`}
                        style={{ width: `${activeHeatmapItem.riskScore}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Drivers checklist */}
                  <div className="p-2.5 bg-slate-1000/60 border border-slate-900 rounded text-[9px] sm:text-[10px] font-mono leading-relaxed text-slate-400">
                    <span className="text-slate-300 font-bold block uppercase mb-0.5">Risk Diagnostics Trace</span>
                    <ul className="space-y-1 list-disc pl-3 text-slate-400 font-sans">
                      <li>
                        Type holds a <span className={`font-bold ${
                          activeHeatmapItem.riskLevel === "Critical" ? "text-rose-400" :
                          activeHeatmapItem.riskLevel === "Elevated" ? "text-amber-400" :
                          "text-cyan-400"
                        }`}>{activeHeatmapItem.type}</span> classification risk premium.
                      </li>
                      <li>
                        Holds <span className="text-slate-200 font-semibold">{activeHeatmapItem.balance.toLocaleString()} {selectedAsset}</span>, rendering supply weight concentration as {activeHeatmapItem.percentage > 1.0 ? "High" : "Moderate"}.
                      </li>
                      <li>
                        Period trend registers <span className={`font-semibold ${
                          parseFloat(String(activeHeatmapItem.periodChange)) >= 0 ? "text-emerald-400" : "text-rose-400"
                        }`}>
                          {parseFloat(String(activeHeatmapItem.periodChange)) >= 0 ? "active capital accumulation" : "active redistribution outlays"}
                        </span> of {activeHeatmapItem.periodChange}% in holdings.
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-900/60">
                  {onSelectAddress && (
                    <button
                      type="button"
                      onClick={() => onSelectAddress(activeHeatmapItem.address)}
                      className="w-full py-1.5 flex items-center justify-center gap-1.5 font-mono text-[9px] sm:text-[10px] font-bold text-cyan-400 hover:text-cyan-350 border border-cyan-500/25 bg-cyan-500/5 hover:bg-cyan-500/10 rounded transition-all cursor-pointer"
                    >
                      <Cpu className="h-3 w-3 animate-pulse" />
                      AUDIT ACTIVE BOT CHARACTERISTICS
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 font-mono text-xs italic">
                Select a cell grid node to inspect concentration risks.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ⚖️ WHALE WALLET PERFORMANCE COMPARATOR (SIDE-BY-SIDE) */}
      <div id="whale-comparator-section" className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-900/60 pb-3">
          <div className="space-y-0.5">
            <h3 className="text-sm font-mono font-black text-slate-100 flex items-center gap-2">
              <Scale className="h-5 w-5 text-amber-500 animate-pulse" />
              WHALE WALLET SIDE-BY-SIDE ANALYTICAL COMPARATOR
            </h3>
            <p className="text-[11px] text-slate-400 font-sans">
              Conduct side-by-side performance audit and capital trace analysis of whale portfolios.
            </p>
          </div>
          {compareAddresses.length > 0 && (
            <button
              onClick={() => setCompareAddresses([])}
              className="text-[10px] font-mono font-bold text-rose-400 hover:text-rose-350 px-2.5 py-1 rounded bg-rose-950/20 border border-rose-900/30 active:scale-95 transition-all cursor-pointer"
            >
              CLEAR COMPARISON ❌
            </button>
          )}
        </div>

        {compareAddresses.length === 0 ? (
          <div className="border border-dashed border-slate-800 rounded-xl bg-slate-950/25 p-6 text-center">
            <div className="mx-auto h-12 w-12 rounded-xl bg-slate-900/40 border border-slate-800 flex items-center justify-center text-slate-500 mb-2">
              <Scale className="h-6 w-6 text-slate-400 animate-pulse" />
            </div>
            <h4 className="text-xs font-mono font-bold text-slate-300">No Wallets Selected for Comparison</h4>
            <p className="text-[11px] text-slate-500 font-sans mt-1 max-w-md mx-auto">
              Browse the <span className="text-cyan-400 font-mono font-bold">TOP 200 HOLDERS</span> or <span className="text-indigo-400 font-mono font-bold">7-DAY VOLUME</span> tables below and click any <span className="text-amber-500 font-semibold font-mono">"Compare"</span> button to initiate dual-wallet telemetry tracking.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Split Screen Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Wallet A column */}
              {comparedWallets[0] ? (
                <div className="bg-slate-950/90 border border-slate-900 rounded-xl p-4 space-y-3.5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 h-10 w-10 bg-gradient-to-br from-cyan-500/10 to-transparent pointer-events-none rounded-tr-xl"></div>
                  <div className="flex items-start justify-between">
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-mono font-bold text-cyan-400 tracking-wider uppercase">WALLET A (BENCHMARK)</span>
                      <h4 className="font-mono text-sm font-black text-white flex items-center gap-1.5 leading-none">
                        <Award className="h-4 w-4 text-cyan-400" />
                        {comparedWallets[0].label} <span className="text-slate-500 text-xs font-normal">Rank #{comparedWallets[0].rank}</span>
                      </h4>
                    </div>
                    <button
                      onClick={() => setCompareAddresses(prev => prev.filter((_, i) => i !== 0))}
                      className="text-slate-500 hover:text-slate-300 p-1 rounded hover:bg-slate-950 cursor-pointer"
                      title="Remove from comparison"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Hash & Copy */}
                  <div className="bg-slate-1000 p-2 rounded border border-slate-900 flex items-center justify-between text-[11px] font-mono leading-none">
                    <span className="text-slate-400 truncate max-w-[280px]">{comparedWallets[0].address}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(comparedWallets[0].address);
                        setCopiedWallet(comparedWallets[0].address);
                        setTimeout(() => setCopiedWallet(""), 1500);
                      }}
                      className="text-cyan-500 hover:text-cyan-405 font-mono text-[9px] font-bold tracking-tighter"
                    >
                      {copiedWallet === comparedWallets[0].address ? "COPIED" : "COPY"}
                    </button>
                  </div>

                  {/* Comparative Metrics Grid */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                    <div className="bg-slate-900/30 p-2 rounded border border-slate-900">
                      <span className="text-[9px] text-slate-500 block uppercase font-bold">Category</span>
                      <span className="text-slate-200 font-bold block mt-0.5 truncate">{comparedWallets[0].type}</span>
                    </div>
                    <div className="bg-slate-900/30 p-2 rounded border border-slate-900">
                      <span className="text-[9px] text-slate-500 block uppercase font-bold">Current Supply Weight</span>
                      <span className="text-slate-200 font-bold block mt-0.5">{comparedWallets[0].percentage}%</span>
                    </div>
                    <div className="bg-slate-900/30 p-2 rounded border border-slate-900">
                      <span className="text-[9px] text-slate-500 block uppercase font-bold">Approx. Balance</span>
                      <span className="text-slate-200 font-bold block mt-0.5 truncate">
                        {comparedWallets[0].balance.toLocaleString(undefined, { maximumFractionDigits: 2 })} {selectedAsset}
                      </span>
                    </div>
                    <div className="bg-slate-900/30 p-2 rounded border border-slate-900">
                      <span className="text-[9px] text-slate-500 block uppercase font-bold">Valuation (USD)</span>
                      <span className="text-cyan-400 font-bold block mt-0.5">
                        ${comparedWallets[0].valueUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                    <div className="bg-slate-900/30 p-2 rounded border border-slate-900">
                      <span className="text-[9px] text-slate-500 block uppercase font-bold">Period Drift Rate</span>
                      <span className={`font-bold block mt-0.5 ${comparedWallets[0].periodChange >= 0 ? "text-emerald-400" : "text-rose-455"}`}>
                        {comparedWallets[0].periodChange >= 0 ? "+" : ""}{comparedWallets[0].periodChange}%
                        {comparedWallets[0].periodChange >= 0 ? " ↗" : " ↘"}
                      </span>
                    </div>
                    <div className="bg-slate-900/30 p-2 rounded border border-slate-900">
                      <span className="text-[9px] text-slate-500 block uppercase font-bold">Last Activity Trace</span>
                      <span className="text-slate-400 font-medium block mt-0.5">{comparedWallets[0].lastActive}</span>
                    </div>
                  </div>

                  {/* Transaction info if it's a volume wallet */}
                  {comparedWallets[0].isVolumeAsset && (
                    <div className="p-2 bg-indigo-950/20 border border-indigo-900/30 rounded text-[10px] font-mono grid grid-cols-2 gap-2 text-indigo-300">
                      <div>
                        <span>7D TX count:</span> <strong className="font-extrabold text-white">{comparedWallets[0].txCount7d?.toLocaleString()}</strong>
                      </div>
                      <div>
                        <span>Avg TX size:</span> <strong className="font-extrabold text-white">${comparedWallets[0].averageTxSizeUsd?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong>
                      </div>
                    </div>
                  )}

                  {/* Risk gauge indicator */}
                  <div className="space-y-1 font-mono text-[11px] pt-1 border-t border-slate-900/60">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-500 uppercase">SYSTEMIC CONCENTRATION SCORE:</span>
                      <span className={`font-black ${
                        comparedWallets[0].riskScore >= 75 ? "text-rose-400" :
                        comparedWallets[0].riskScore >= 50 ? "text-amber-400" : "text-emerald-400"
                      }`}>
                        {comparedWallets[0].riskScore}%
                      </span>
                    </div>
                    <div className="h-1 bg-slate-900 rounded overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          comparedWallets[0].riskScore >= 75 ? "bg-rose-500" :
                          comparedWallets[0].riskScore >= 50 ? "bg-amber-400" : "bg-emerald-500"
                        }`}
                        style={{ width: `${comparedWallets[0].riskScore}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Wallet B column */}
              {comparedWallets[1] ? (
                <div className="bg-slate-950/90 border border-slate-900 rounded-xl p-4 space-y-3.5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 h-10 w-10 bg-gradient-to-br from-amber-500/10 to-transparent pointer-events-none rounded-tr-xl"></div>
                  <div className="flex items-start justify-between">
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-mono font-bold text-amber-500 tracking-wider uppercase">WALLET B (SECONDARY CORRELATION)</span>
                      <h4 className="font-mono text-sm font-black text-white flex items-center gap-1.5 leading-none">
                        <Award className="h-4 w-4 text-amber-500" />
                        {comparedWallets[1].label} <span className="text-slate-500 text-xs font-normal">Rank #{comparedWallets[1].rank}</span>
                      </h4>
                    </div>
                    <button
                      onClick={() => setCompareAddresses(prev => prev.filter((_, i) => i !== 1))}
                      className="text-slate-500 hover:text-slate-300 p-1 rounded hover:bg-slate-950 cursor-pointer"
                      title="Remove from comparison"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Hash & Copy */}
                  <div className="bg-slate-1000 p-2 rounded border border-slate-900 flex items-center justify-between text-[11px] font-mono leading-none">
                    <span className="text-slate-400 truncate max-w-[280px]">{comparedWallets[1].address}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(comparedWallets[1].address);
                        setCopiedWallet(comparedWallets[1].address);
                        setTimeout(() => setCopiedWallet(""), 1500);
                      }}
                      className="text-amber-500 hover:text-amber-405 font-mono text-[9px] font-bold tracking-tighter"
                    >
                      {copiedWallet === comparedWallets[1].address ? "COPIED" : "COPY"}
                    </button>
                  </div>

                  {/* Comparative Metrics Grid */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                    <div className="bg-slate-900/30 p-2 rounded border border-slate-900">
                      <span className="text-[9px] text-slate-500 block uppercase font-bold">Category</span>
                      <span className="text-slate-200 font-bold block mt-0.5 truncate">{comparedWallets[1].type}</span>
                    </div>
                    <div className="bg-slate-900/30 p-2 rounded border border-slate-900">
                      <span className="text-[9px] text-slate-500 block uppercase font-bold">Current Supply Weight</span>
                      <span className="text-slate-200 font-bold block mt-0.5">{comparedWallets[1].percentage}%</span>
                    </div>
                    <div className="bg-slate-900/30 p-2 rounded border border-slate-900">
                      <span className="text-[9px] text-slate-500 block uppercase font-bold">Approx. Balance</span>
                      <span className="text-slate-200 font-bold block mt-0.5 truncate">
                        {comparedWallets[1].balance.toLocaleString(undefined, { maximumFractionDigits: 2 })} {selectedAsset}
                      </span>
                    </div>
                    <div className="bg-slate-900/30 p-2 rounded border border-slate-900">
                      <span className="text-[9px] text-slate-500 block uppercase font-bold">Valuation (USD)</span>
                      <span className="text-amber-500 font-bold block mt-0.5">
                        ${comparedWallets[1].valueUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                    <div className="bg-slate-900/30 p-2 rounded border border-slate-900">
                      <span className="text-[9px] text-slate-500 block uppercase font-bold">Period Drift Rate</span>
                      <span className={`font-bold block mt-0.5 ${comparedWallets[1].periodChange >= 0 ? "text-emerald-400" : "text-rose-455"}`}>
                        {comparedWallets[1].periodChange >= 0 ? "+" : ""}{comparedWallets[1].periodChange}%
                        {comparedWallets[1].periodChange >= 0 ? " ↗" : " ↘"}
                      </span>
                    </div>
                    <div className="bg-slate-900/30 p-2 rounded border border-slate-900">
                      <span className="text-[9px] text-slate-500 block uppercase font-bold">Last Activity Trace</span>
                      <span className="text-slate-400 font-medium block mt-0.5">{comparedWallets[1].lastActive}</span>
                    </div>
                  </div>

                  {/* Transaction info if it's a volume wallet */}
                  {comparedWallets[1].isVolumeAsset && (
                    <div className="p-2 bg-indigo-950/20 border border-indigo-900/30 rounded text-[10px] font-mono grid grid-cols-2 gap-2 text-indigo-300 font-bold">
                      <div>
                        <span>7D TX count:</span> <strong className="font-extrabold text-white">{comparedWallets[1].txCount7d?.toLocaleString()}</strong>
                      </div>
                      <div>
                        <span>Avg TX size:</span> <strong className="font-extrabold text-white">${comparedWallets[1].averageTxSizeUsd?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong>
                      </div>
                    </div>
                  )}

                  {/* Risk gauge indicator */}
                  <div className="space-y-1 font-mono text-[11px] pt-1 border-t border-slate-900/60">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-500 uppercase">SYSTEMIC CONCENTRATION SCORE:</span>
                      <span className={`font-black ${
                        comparedWallets[1].riskScore >= 75 ? "text-rose-400" :
                        comparedWallets[1].riskScore >= 50 ? "text-amber-400" : "text-emerald-400"
                      }`}>
                        {comparedWallets[1].riskScore}%
                      </span>
                    </div>
                    <div className="h-1 bg-slate-900 rounded overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          comparedWallets[1].riskScore >= 75 ? "bg-rose-500" :
                          comparedWallets[1].riskScore >= 50 ? "bg-amber-400" : "bg-emerald-500"
                        }`}
                        style={{ width: `${comparedWallets[1].riskScore}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border border-dashed border-slate-800 rounded-xl bg-slate-950/20 p-6 flex flex-col items-center justify-center text-center min-h-[290px]">
                  <Scale className="h-8 w-8 text-slate-600 animate-pulse mb-2.5" />
                  <h4 className="text-xs font-mono font-bold text-slate-400">Waiting for Secondary Wallet...</h4>
                  <p className="text-[10px] text-slate-500 max-w-[280px] mt-1 font-sans">
                    Click the <strong className="text-amber-500 font-semibold font-mono">"Compare"</strong> button on any other row in the lists below to visualize side-by-side performance trajectories and risk differentials in real-time.
                  </p>
                </div>
              )}
            </div>

            {/* Performance charts section */}
            {comparedWallets.length > 0 && (
              <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-slate-900/60 pb-2.5">
                  <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span>
                    Relative Portfolio Value Growth Comparison Trajectory
                  </span>
                  <span className="text-[9px] font-mono text-slate-500">PERIOD TRENDS: SINUSOIDAL DRIFT TRACK</span>
                </div>

                <div className="w-full h-[220px] pt-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={comparedHistoricalSeries} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1d2433" opacity={0.5} />
                      <XAxis 
                        dataKey="date" 
                        stroke="#64748b" 
                        fontSize={9} 
                        fontFamily="monospace"
                        tickLine={false}
                      />
                      <YAxis 
                        stroke="#64748b" 
                        fontSize={9} 
                        fontFamily="monospace"
                        tickFormatter={(val) => `$${(val / 1e6).toFixed(1)}M`}
                        tickLine={false}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: "#020617", borderColor: "#1e293b", borderRadius: "8px" }}
                        labelStyle={{ color: "#94a3b8", fontFamily: "monospace", fontSize: "10px", fontWeight: "bold" }}
                        itemStyle={{ fontFamily: "monospace", fontSize: "11px", padding: "1px 0" }}
                        formatter={(value: any, name: string) => {
                          const wIdx = name.includes("0") ? 0 : 1;
                          const lbl = comparedWallets[wIdx]?.label || "Whale";
                          return [`$${value.toLocaleString()} USD`, lbl];
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="wallet_0_val" 
                        stroke="#06b6d4" 
                        strokeWidth={2.5} 
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                        name="wallet_0_val"
                      />
                      {comparedWallets[1] && (
                        <Line 
                          type="monotone" 
                          dataKey="wallet_1_val" 
                          stroke="#f59e0b" 
                          strokeWidth={2.5} 
                          dot={{ r: 3 }}
                          activeDot={{ r: 5 }}
                          name="wallet_1_val"
                        />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Aggregator view containing holdings vs volume filters & lists */}
      <div className="space-y-4">
        {/* Toggle between holdings & volume buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-900 pb-3">
          
          {/* Left panel tabs: 200 Holdings vs 7d Volumes */}
          <div className="flex bg-slate-900/60 p-1.5 rounded-xl border border-slate-900 gap-1.5">
            <button
              onClick={() => setActiveTab("holdings")}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
                activeTab === "holdings" 
                  ? "bg-slate-800 text-slate-100 border border-slate-700/60 shadow" 
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/20"
              }`}
            >
              <Users className="h-4 w-4 text-cyan-400" />
              TOP 200 HOLDERS
            </button>
            <button
              onClick={() => setActiveTab("volume")}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
                activeTab === "volume" 
                  ? "bg-slate-800 text-slate-100 border border-slate-700/60 shadow" 
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/20"
              }`}
            >
              <Volume2 className="h-4 w-4 text-indigo-400" />
              7-DAY TRADING VOLUME TOP 200
            </button>
          </div>

          {/* Search and export action toolbar */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Entity/Class selectivity filter */}
            <select
              value={selectedEntityType}
              onChange={(e) => setSelectedEntityType(e.target.value)}
              className="bg-slate-900 text-slate-400 font-mono text-xs rounded-lg py-1.5 px-2 border border-slate-800 focus:border-cyan-500 outline-none cursor-pointer hover:bg-slate-850 h-9"
            >
              <option value="All">All Entities</option>
              {activeTab === "holdings" ? (
                <>
                  <option value="Exchange">CEX Providers</option>
                  <option value="Institution/Fund">Investment Funds</option>
                  <option value="Corporate Treasury">Corporate Treasuries</option>
                  <option value="DeFi Protocol">DeFi Protocols</option>
                  <option value="Smart Contract Bridge">Bridge Escrows</option>
                  <option value="Individual Whale">Individual Whales</option>
                </>
              ) : (
                <>
                  <option value="Arbitrage Bot">MEV / Arb Bots</option>
                  <option value="Exchange Hot Wallet">CEX Hot Wallets</option>
                  <option value="Market Maker">Market Makers</option>
                  <option value="DeFi Smart Contract">DeFi Contracts</option>
                  <option value="Institution/Fund">Institutional OTC</option>
                  <option value="High-Freq Whale">High-Freq Whales</option>
                </>
              )}
            </select>

            {/* Quick search */}
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search address or tags..."
                className="bg-slate-1000 text-slate-200 border border-slate-850 focus:border-cyan-500 outline-none rounded-lg font-mono text-xs pl-8 pr-3 py-1.5 h-9 w-[170px] sm:w-[200px]"
              />
            </div>

            {/* JSON Export button */}
            <button
              onClick={handleExportData}
              className="px-3 py-1.5 rounded-lg border border-cyan-500/30 bg-cyan-950/20 hover:bg-cyan-950/40 text-cyan-400 text-xs font-mono font-bold flex items-center gap-1.5 h-9 cursor-pointer transition-all hover:text-cyan-300"
              title="Download entire matched set to JSON"
            >
              <FileSpreadsheet className="h-4 w-4" />
              EXPORT LIST
            </button>
          </div>
        </div>

        {/* Aggregate metric summary blocks */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-900/30 border border-slate-900 p-3 rounded-xl font-mono text-xs">
          <div>
            <span className="text-[9px] text-slate-500 block uppercase font-bold">TOTAL SCANNED NODES</span>
            <span className="text-slate-200 font-bold block">200 Core Addresses</span>
          </div>
          <div>
            <span className="text-[9px] text-slate-500 block uppercase font-bold">MATCHES CURRENT QUERY</span>
            <span className="text-cyan-400 font-bold block">
              {activeTab === "holdings" ? filteredHolders.length : filteredVolumes.length} addresses
            </span>
          </div>
          <div>
            <span className="text-[9px] text-slate-500 block uppercase font-bold">NOMINAL ASSET BASE</span>
            <span className="text-slate-200 font-bold block">
              {selectedAsset} (${activePrice.toLocaleString()} USD)
            </span>
          </div>
          <div>
            <span className="text-[9px] text-slate-500 block uppercase font-bold">STYLING COMPLIANCE</span>
            <span className="text-indigo-400 font-bold block uppercase flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-indigo-400 animate-pulse" />
              VETTED RESERVE
            </span>
          </div>
        </div>

        {/* Aggregated List Table representation */}
        <div className="border border-slate-900 bg-slate-1000/60 rounded-xl overflow-x-auto">
          {activeTab === "holdings" ? (
            <table className="w-full text-left font-mono text-xs divide-y divide-slate-900 min-w-[700px]">
              <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3 w-14">Rank</th>
                  <th className="p-3">On-chain Address & Entity</th>
                  <th className="p-3">Classification Segment</th>
                  <th className="p-3 text-right">Balance ({selectedAsset})</th>
                  <th className="p-3 text-right">Holding Value (USD)</th>
                  <th className="p-3 text-right w-24">% Supply</th>
                  <th className="p-3 text-center w-24">Period Trend</th>
                  <th className="p-3 text-center w-28">Last Txt</th>
                  <th className="p-3 text-center w-28 text-amber-500 font-extrabold">Select Compare</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/60">
                {paginatedHolders.length > 0 ? (
                  paginatedHolders.map((item) => {
                    const isIncrease = item.periodChange >= 0;
                    return (
                      <tr 
                        key={item.rank}
                        onClick={() => onSelectAddress?.(item.address)}
                        className={`hover:bg-slate-900/50 group transition-all ${onSelectAddress ? "cursor-pointer" : ""}`}
                        title={onSelectAddress ? "Click to scan address and audit bot activity" : ""}
                      >
                        <td className="p-3 font-black text-slate-500 text-center">{item.rank}</td>
                        <td className="p-3 max-w-[200px]">
                          <div className="space-y-0.5">
                            <span className="text-white font-extrabold group-hover:text-cyan-400 transition-colors block text-[11px] truncate">
                              {item.label}
                            </span>
                            <span className="text-[10px] text-slate-500 truncate block font-sans" title={item.address}>
                              {item.address}
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={`text-[9px] px-2 py-0.5 rounded border ${
                            item.type === "Exchange" ? "bg-cyan-950/40 text-cyan-400 border-cyan-900/30" :
                            item.type === "Institution/Fund" ? "bg-purple-950/40 text-purple-400 border-purple-900/30" :
                            item.type === "Corporate Treasury" ? "bg-amber-950/40 text-amber-400 border-amber-900/30" :
                            item.type === "DeFi Protocol" ? "bg-emerald-950/40 text-emerald-400 border-emerald-900/30" :
                            item.type === "Smart Contract Bridge" ? "bg-rose-950/40 text-rose-400 border-rose-900/30" :
                            "bg-slate-900 text-slate-400 border-slate-800"
                          }`}>
                            {item.type}
                          </span>
                        </td>
                        <td className="p-3 text-right font-bold text-slate-150">
                          {item.balance.toLocaleString()}
                        </td>
                        <td className="p-3 text-right font-bold text-slate-300">
                          ${item.valueUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </td>
                        <td className="p-3 text-right text-[11px] text-slate-400">
                          {item.percentage}%
                        </td>
                        <td className="p-3 text-center">
                          <span className={`text-[10px] font-bold py-0.5 px-2 rounded-md flex items-center justify-center gap-0.5 ${
                            isIncrease 
                              ? "bg-emerald-950/30 text-emerald-400" 
                              : "bg-red-950/30 text-rose-400"
                          }`}>
                            {isIncrease ? "+" : ""}{item.periodChange}%
                            {isIncrease ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingUp className="h-2.5 w-2.5 rotate-180" />}
                          </span>
                        </td>
                        <td className="p-3 text-center text-[10px] text-slate-500 font-sans">
                          {item.lastActive}
                        </td>
                        <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleAddressCompare(item.address);
                            }}
                            className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold cursor-pointer transition-all ${
                              compareAddresses.includes(item.address)
                                ? "bg-amber-500 text-slate-950 font-extrabold shadow-md shadow-amber-500/20"
                                : "bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200"
                            }`}
                          >
                            {compareAddresses.includes(item.address) ? "⚖️ Comparing" : "Compare"}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-500 font-sans italic">
                      No matching addresses found for the given criteria. Try adjusting filters or typing query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left font-mono text-xs divide-y divide-slate-900 min-w-[700px]">
              <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3 w-14">Rank</th>
                  <th className="p-3">Trader Handle & Address</th>
                  <th className="p-3">Entity Speciality</th>
                  <th className="p-3 text-right">7-Day Volume (USD)</th>
                  <th className="p-3 text-right">Tx Count (7d)</th>
                  <th className="p-3 text-right">Avg Tx Size (USD)</th>
                  <th className="p-3 text-center w-28">Net Flow Tendency</th>
                  <th className="p-3 text-center w-20">Market Node</th>
                  <th className="p-3 text-center w-28 text-amber-505 font-extrabold">Select Compare</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/60">
                {paginatedVolumes.length > 0 ? (
                  paginatedVolumes.map((item) => {
                    return (
                      <tr 
                        key={item.rank}
                        onClick={() => onSelectAddress?.(item.address)}
                        className={`hover:bg-slate-900/50 group transition-all ${onSelectAddress ? "cursor-pointer" : ""}`}
                        title={onSelectAddress ? "Click to scan address and audit bot activity" : ""}
                      >
                        <td className="p-3 font-black text-slate-500 text-center">{item.rank}</td>
                        <td className="p-3 max-w-[200px]">
                          <div className="space-y-0.5">
                            <span className="text-white font-extrabold group-hover:text-cyan-400 transition-colors block text-[11px] truncate">
                              {item.label}
                            </span>
                            <span className="text-[10px] text-slate-500 truncate block font-sans" title={item.address}>
                              {item.address}
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={`text-[9px] px-2 py-0.5 rounded border ${
                            item.type === "Arbitrage Bot" ? "bg-red-950/40 text-rose-450 border-red-900/30" :
                            item.type === "Market Maker" ? "bg-indigo-950/40 text-indigo-400 border-indigo-900/30" :
                            item.type === "Exchange Hot Wallet" ? "bg-cyan-950/40 text-cyan-400 border-cyan-900/30" :
                            item.type === "DeFi Smart Contract" ? "bg-emerald-950/40 text-emerald-400 border-emerald-900/30" :
                            item.type === "Institution/Fund" ? "bg-purple-950/40 text-purple-400 border-purple-900/30" :
                            "bg-slate-900 text-slate-400"
                          }`}>
                            {item.type}
                          </span>
                        </td>
                        <td className="p-3 text-right font-black text-slate-100">
                          ${item.sevenDayVolumeUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </td>
                        <td className="p-3 text-right font-bold text-slate-350">
                          {item.txCount7d.toLocaleString()} txs
                        </td>
                        <td className="p-3 text-right font-medium text-slate-400 text-[11px]">
                          ${item.averageTxSizeUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </td>
                        <td className="p-3 text-center">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md inline-flex items-center gap-0.5 ${
                            item.netFlowType === "Inflow" ? "bg-emerald-950/30 text-emerald-400" :
                            item.netFlowType === "Outflow" ? "bg-rose-950/30 text-rose-400" :
                            "bg-slate-900 text-slate-400"
                          }`}>
                            {item.netFlowType === "Inflow" ? (
                              <><ArrowUpRight className="h-3 w-3" /> NET DEPOSIT</>
                            ) : item.netFlowType === "Outflow" ? (
                              <><ArrowDownLeft className="h-3 w-3" /> NET DRAWDOW</>
                            ) : (
                              "NEUTRAL ROUTE"
                            )}
                          </span>
                        </td>
                        <td className="p-3 text-center font-bold text-slate-400">
                          {item.dominantAsset}
                        </td>
                        <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleAddressCompare(item.address);
                            }}
                            className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold cursor-pointer transition-all ${
                              compareAddresses.includes(item.address)
                                ? "bg-amber-500 text-slate-950 font-extrabold shadow-md shadow-amber-500/20"
                                : "bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200"
                            }`}
                          >
                            {compareAddresses.includes(item.address) ? "⚖️ Comparing" : "Compare"}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-500 font-sans italic">
                      No matching high-volume addresses found for the given criteria. Try adjusting filters or typing query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between font-mono text-xs pt-3 border-t border-slate-900">
            <span className="text-slate-500">
              Showing page <strong className="text-slate-300">{currentPage}</strong> of <strong className="text-slate-300">{totalPages}</strong> ({activeTab === "holdings" ? filteredHolders.length : filteredVolumes.length} matching rows)
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className={`p-1.5 rounded border border-slate-800 bg-slate-900 text-slate-450 hover:text-slate-200 transition-all ${
                  currentPage === 1 ? "opacity-30 cursor-not-allowed" : "cursor-pointer"
                }`}
                title="Previous Page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              {/* Pagination indicators subset */}
              <div className="hidden sm:flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = i + 1;
                  // Shift page indices if active page is towards the end
                  if (currentPage > 3 && totalPages > 5) {
                    pageNum = currentPage - 3 + i;
                    if (pageNum + (4 - i) > totalPages) {
                      pageNum = totalPages - 4 + i;
                    }
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-2.5 py-1 rounded font-bold transition-all border ${
                        currentPage === pageNum 
                          ? "bg-cyan-950/20 text-cyan-400 border-cyan-500/40" 
                          : "text-slate-400 border-transparent hover:border-slate-800 hover:bg-slate-900/50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className={`p-1.5 rounded border border-slate-800 bg-slate-900 text-slate-455 hover:text-slate-250 transition-all ${
                  currentPage === totalPages ? "opacity-30 cursor-not-allowed" : "cursor-pointer"
                }`}
                title="Next Page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* TOAST SYSTEM CONTAINER STACK */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 w-[calc(100vw-3rem)] sm:w-96 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto bg-slate-950/95 border border-cyan-500/30 rounded-xl p-4 shadow-[0_0_20px_rgba(6,182,212,0.15)] backdrop-blur-md flex flex-col gap-2 relative overflow-hidden animate-slide-in-right transform transition-all duration-300"
            style={{
              borderLeft: "42px solid transparent",
            }}
          >
            {/* Left warning column indicator */}
            <div className="absolute left-0 top-0 bottom-0 w-[42px] bg-slate-900 border-r border-slate-850 flex items-center justify-center pointer-events-none">
              <Zap className="h-5 w-5 text-cyan-400 animate-pulse" />
            </div>

            {/* Decorative layout design accent */}
            <div className="absolute top-0 right-0 h-10 w-10 bg-gradient-to-br from-cyan-500/10 to-transparent pointer-events-none rounded-tr-xl"></div>
            
            {/* Header Row */}
            <div className="flex items-center justify-between pl-1">
              <div className="flex items-center gap-1.5 font-mono text-[9px] text-cyan-400 font-black tracking-widest uppercase">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-500"></span>
                </span>
                {toast.title}
              </div>
              <span className="text-[8px] text-slate-500 font-mono font-bold">{toast.timestamp}</span>
            </div>

            {/* Content body */}
            <div className="space-y-1 pl-1">
              <div className="text-xs text-slate-200 font-mono font-bold leading-tight flex items-center gap-1.5">
                <Award className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                {toast.whaleLabel} <span className="text-slate-500 font-normal">Rank #{toast.whaleRank}</span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans leading-snug">
                Acquired <strong className="text-emerald-400 font-mono font-bold">
                  +{toast.diffAmount >= 1000000 
                    ? `${(toast.diffAmount / 1000000).toFixed(2)}M` 
                    : toast.diffAmount >= 1000 
                    ? `${(toast.diffAmount / 1000).toFixed(1)}k` 
                    : toast.diffAmount.toLocaleString()} {toast.asset}
                </strong> 
                {" "}representing a position size surge of <strong className="text-emerald-400 font-bold">significant</strong> volume.
              </p>
            </div>

            {/* Valuation index metrics grid */}
            <div className="grid grid-cols-2 gap-2 mt-1.5 bg-slate-900/40 p-2 rounded border border-slate-900/60 font-mono text-[10px] pl-1">
              <div>
                <span className="text-slate-500 block text-[8px] uppercase font-bold leading-none mb-1">TX Valuation</span>
                <span className="text-cyan-400 font-black">
                  +${toast.diffUsd >= 1000000000 
                    ? `${(toast.diffUsd / 1000000000).toFixed(2)}B` 
                    : `${(toast.diffUsd / 1000000).toFixed(2)}M`} USD
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[8px] uppercase font-bold leading-none mb-1">New Post Balance</span>
                <span className="text-slate-300 font-bold">
                  {toast.newBalance >= 1000000 
                    ? `${(toast.newBalance / 1000000).toFixed(2)}M` 
                    : toast.newBalance >= 1000 
                    ? `${(toast.newBalance / 1000).toFixed(1)}k` 
                    : toast.newBalance.toLocaleString()} {toast.asset}
                </span>
              </div>
            </div>

            {/* Close handler close icon button */}
            <button
              onClick={() => removeToast(toast.id)}
              className="absolute top-2 right-2 text-slate-500 hover:text-slate-200 p-0.5 rounded hover:bg-slate-900 transition-all cursor-pointer animate-none"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};
