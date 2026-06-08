import { WhaleWallet } from "./types";

export const CURATED_WHALES: WhaleWallet[] = [
  {
    address: "34xp4vRoCGJ7M3Ym623EERC1vhbk3v8JDY",
    blockchainLabel: "Binance Cold Wallet (Oldest)",
    network: "Bitcoin",
    initialBalance: "248,597 BTC",
    txCount: 849,
    age: "7 years",
    riskRating: "Low",
    isExchange: true,
    notes: "Historically one of the largest single Bitcoin cold stores. Extremely stable balance sheets.",
    assetBalances: [
      { symbol: "BTC", amount: 248590, valueUsd: 23616050000 },
      { symbol: "USDT", amount: 0, valueUsd: 0 }
    ]
  },
  {
    address: "1FzWLv6N861bE43rGDX6eA7L99y4XGDE3c",
    blockchainLabel: "MicroStrategy Private Trust",
    network: "Bitcoin",
    initialBalance: "193,000 BTC",
    txCount: 162,
    age: "4 years",
    riskRating: "Low",
    isExchange: false,
    notes: "Corporate reserves of Marathon/MicroStrategy structure. Accumulation behaviour with zero sales history.",
    assetBalances: [
      { symbol: "BTC", amount: 193000, valueUsd: 18335000000 }
    ]
  },
  {
    address: "bc1qgd984fh9gdsjlgjfl89gshgdsjg8s7h",
    blockchainLabel: "Mt. Gox Hack Trustee Wallet",
    network: "Bitcoin",
    initialBalance: "47,228 BTC",
    txCount: 42,
    age: "11 years",
    riskRating: "High",
    isExchange: false,
    notes: "Managed by state liquidator. Movement from this address causes severe market anticipation cascades.",
    assetBalances: [
      { symbol: "BTC", amount: 47228, valueUsd: 4486660000 }
    ]
  },
  {
    address: "0x28C6c06298d514Db089934071355E5743bf21d60",
    blockchainLabel: "Binance 14 (Ethereum Hot Wallet)",
    network: "Ethereum",
    initialBalance: "1,240,000 ETH",
    txCount: 948120,
    age: "6 years",
    riskRating: "Low",
    isExchange: true,
    notes: "Core gas provider and sweep point for millions of retail Binance depositors. Extreme traffic.",
    assetBalances: [
      { symbol: "ETH", amount: 1240000, valueUsd: 4340000000 },
      { symbol: "USDT", amount: 350000000, valueUsd: 350000000 },
      { symbol: "USDC", amount: 125000000, valueUsd: 125000000 }
    ]
  },
  {
    address: "0x00000000219ab540356cBB839Cbe05303d7705Fa",
    blockchainLabel: "Eth2 Beacon Chain Deposit Contract",
    network: "Ethereum",
    initialBalance: "38,212,500 ETH",
    txCount: 412000,
    age: "5 years",
    riskRating: "Low",
    isExchange: false,
    notes: "The foundational consensus staking pool for Ethereum validators. One-way deposit flow behavior.",
    assetBalances: [
      { symbol: "ETH", amount: 38212500, valueUsd: 133743750000 }
    ]
  },
  {
    address: "0x9812A27d62058309aDfCEe54C1b6EE6BFd55efD7",
    blockchainLabel: "Justin Sun Private DeFi Wallet",
    network: "Ethereum",
    initialBalance: "282,100 ETH + DeFi Pools",
    txCount: 2201,
    age: "4 years",
    riskRating: "High",
    isExchange: false,
    notes: "High-risk private whale profile. Actively takes gigantic leveraged yield farming structures in MakerDao and Lido.",
    assetBalances: [
      { symbol: "ETH", amount: 282100, valueUsd: 987350000 },
      { symbol: "USDT", amount: 142000000, valueUsd: 142000000 },
      { symbol: "USDC", amount: 55000000, valueUsd: 55000000 }
    ]
  },
  {
    address: "0x1231355446546Fff88856F745339FF5123FFaa90",
    blockchainLabel: "Looted Funds (Ronin Network Hacker)",
    network: "Ethereum",
    initialBalance: "82,410 ETH",
    txCount: 184,
    age: "3 years",
    riskRating: "Critical",
    isExchange: false,
    notes: "Stolen assets under sanction. Attempts mixers like Tornado Cash randomly, causing high gas burns.",
    assetBalances: [
      { symbol: "ETH", amount: 82410, valueUsd: 288435000 }
    ]
  },
  {
    address: "9W52YvS9re9ZXYf7Z4Z4c93dsksfkgTsk2j3",
    blockchainLabel: "Solana Foundation Reserve Store",
    network: "Solana",
    initialBalance: "43,000,300 SOL",
    txCount: 38402,
    age: "6 years",
    riskRating: "Low",
    isExchange: false,
    notes: "Development pools, occasional grant distributions. Low volatility.",
    assetBalances: [
      { symbol: "SOL", amount: 43000300, valueUsd: 7740054000 }
    ]
  },
  {
    address: "At38dsksfkgTsk2j39W52YvS9re9ZXYf7Z4Z4c93",
    blockchainLabel: "FTX Recovery Liquidation Agent",
    network: "Solana",
    initialBalance: "14,800,000 SOL",
    txCount: 948,
    age: "3 years",
    riskRating: "High",
    isExchange: false,
    notes: "Locked and unlocked assets targeted for bankruptcy cash payout. Occasional OTC auction releases.",
    assetBalances: [
      { symbol: "SOL", amount: 14800000, valueUsd: 2664000000 },
      { symbol: "USDC", amount: 48000000, valueUsd: 48000000 }
    ]
  },
  {
    address: "GC2z7dK95j7sL3pE1rT3G3H9aW9dE8fC7gB5aWS1",
    blockchainLabel: "Raydium AMM Infinite Pool Provider",
    network: "Solana",
    initialBalance: "8,210,000 SOL",
    txCount: 385102,
    age: "3 years",
    riskRating: "Low",
    isExchange: false,
    notes: "Central liquidity contract representing Solana retail pool tokens and liquidity locks.",
    assetBalances: [
      { symbol: "SOL", amount: 8210000, valueUsd: 1477800000 },
      { symbol: "USDC", amount: 110000000, valueUsd: 110000000 },
      { symbol: "USDT", amount: 45000000, valueUsd: 45000000 }
    ]
  },
  {
    address: "TYGsa8f9shfdgkd7gksghskjgf7shdg9kd",
    blockchainLabel: "Tether Treasury (Tron Network Core)",
    network: "Tron",
    initialBalance: "54,200,000,000 USDT",
    txCount: 162948,
    age: "6 years",
    riskRating: "Low",
    isExchange: false,
    notes: "Primary printing registry of USD Tether on Tron network. Authorizes multi-hundred million mints daily.",
    assetBalances: [
      { symbol: "USDT", amount: 54200000000, valueUsd: 54200000000 }
    ]
  },
  {
    address: "TYss7hdsgjkdGfS1gKsGd7KgSgd9Kd7hgS",
    blockchainLabel: "Huobi/HTX Exchange Sweep cold wallet",
    network: "Tron",
    initialBalance: "18,400,000 TRX + Peak Stablecoins",
    txCount: 394812,
    age: "5 years",
    riskRating: "Medium",
    isExchange: true,
    notes: "Key Tron exchange address holding a massive chunk of stablecoin reserves used for Justin Sun ecosystem.",
    assetBalances: [
      { symbol: "TRX", amount: 18400000, valueUsd: 2200000 },
      { symbol: "USDT", amount: 1400000000, valueUsd: 1400000000 }
    ]
  }
];

export const STATIC_ALERT_TEMPLATES = [
  {
    asset: "BTC",
    network: "Bitcoin",
    fromLabel: "Miracle Miner Pool",
    toLabel: "Coinbase Exchange",
    baseAmount: 450,
    flowType: "Exchange Inflow",
  },
  {
    asset: "ETH",
    network: "Ethereum",
    fromLabel: "Arbitrum L2 Native Bridge",
    toLabel: "Binance Hot Deposit",
    baseAmount: 12500,
    flowType: "Exchange Inflow",
  },
  {
    asset: "USDT",
    network: "Ethereum",
    fromLabel: "Tether Multi-Sig Treasury",
    toLabel: "Binance Wallet 14",
    baseAmount: 75000000,
    flowType: "Wallet to Wallet",
  },
  {
    asset: "USDC",
    network: "Solana",
    fromLabel: "Circle Cold Store",
    toLabel: "FTX Liquidation Custody",
    baseAmount: 45000000,
    flowType: "Wallet to Wallet",
  },
  {
    asset: "SOL",
    network: "Solana",
    fromLabel: "Raydium Liquidity Pool",
    toLabel: "Sovereign Validator Stake",
    baseAmount: 85000,
    flowType: "Wallet to Wallet",
  },
  {
    asset: "ETH",
    network: "Ethereum",
    fromLabel: "Binance 14 (Ethereum Hot Wallet)",
    toLabel: "Private Shark (0x4fd...921)",
    baseAmount: 8400,
    flowType: "Exchange Outflow",
  },
  {
    asset: "USDT",
    network: "Tron",
    fromLabel: "Binance Tron Cold wallet",
    toLabel: "Tether Burn Agent",
    baseAmount: 120000000,
    flowType: "Wallet to Wallet",
  },
  {
    asset: "BTC",
    network: "Bitcoin",
    fromLabel: "Mt. Gox Hack Trustee Wallet",
    toLabel: "Kraken Whitelist Inflow",
    baseAmount: 1800,
    flowType: "Exchange Inflow",
  },
  {
    asset: "PYUSD",
    network: "Ethereum",
    fromLabel: "Paxos Treasury NYDFS Node",
    toLabel: "PayPal Settlement Vault",
    baseAmount: 12000000,
    flowType: "Wallet to Wallet",
  },
  {
    asset: "USD1",
    network: "Ethereum",
    fromLabel: "USD1 Issuer Mint Contract",
    toLabel: "CEX Market Liquidity Buffer",
    baseAmount: 4800000,
    flowType: "Wallet to Wallet",
  },
  {
    asset: "USDS",
    network: "Ethereum",
    fromLabel: "Sky Protocol PSM Vault",
    toLabel: "DeFi Yield Optimizer Pool",
    baseAmount: 15500000,
    flowType: "Wallet to Wallet",
  },
  {
    asset: "DAI",
    network: "Ethereum",
    fromLabel: "Maker DSR Savings Proxy",
    toLabel: "Uniswap V3 SuperPool",
    baseAmount: 18500000,
    flowType: "Wallet to Wallet",
  },
  {
    asset: "USDe",
    network: "Ethereum",
    fromLabel: "Ethena Hedging Reserve Escrow",
    toLabel: "Deribit Exchange Short Hedge Router",
    baseAmount: 24000000,
    flowType: "Wallet to Wallet",
  },
  {
    asset: "PAXG",
    network: "Ethereum",
    fromLabel: "Paxos Gold Vault Custodian",
    toLabel: "Bullion Broker Sweep Bridge",
    baseAmount: 1200,
    flowType: "Wallet to Wallet",
  }
];
