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
  },
  {
    address: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
    blockchainLabel: "Binance 8 (BNB Chain Validator)",
    network: "BNB Chain",
    initialBalance: "2,450,000 BNB",
    txCount: 154032,
    age: "5 years",
    riskRating: "Low",
    isExchange: true,
    notes: "Core staking validator and liquidity bridge pipeline for Binance smart chain operations.",
    assetBalances: [
      { symbol: "BNB", amount: 2450000, valueUsd: 1421000000 },
      { symbol: "USDT", amount: 210000000, valueUsd: 210000000 }
    ]
  },
  {
    address: "0x3912A848deCee8546fFD91295324009aA9821aCf",
    blockchainLabel: "PancakeSwap Main Router Bot Target",
    network: "BNB Chain",
    initialBalance: "184,800 BNB + DeFi LPs",
    txCount: 651203,
    age: "4 years",
    riskRating: "High",
    isExchange: false,
    notes: "Sub-second multi-hop swap bot tracking PancakeSwap pools. Highly optimized sandwich runner.",
    assetBalances: [
      { symbol: "BNB", amount: 184805, valueUsd: 107186900 },
      { symbol: "CAKE", amount: 15400000, valueUsd: 38500000 }
    ]
  },
  {
    address: "0xAb8413554F84A657335eefC14DFA85d11A1B2817",
    blockchainLabel: "Arbitrum MEV King (Sandwich Node)",
    network: "Arbitrum",
    initialBalance: "5,400 ETH (~$18M)",
    txCount: 98402,
    age: "2 years",
    riskRating: "Critical",
    isExchange: false,
    notes: "Utilizes extreme custom sequencer gas tips. High susceptibility to GMX slippage capture.",
    assetBalances: [
      { symbol: "ETH", amount: 5400, valueUsd: 18900000 },
      { symbol: "ARB", amount: 14200000, valueUsd: 12780000 }
    ]
  },
  {
    address: "0x6842fd757de814bA940dCEE85c98fD9446fdf8eD",
    blockchainLabel: "GMX Protocol Vault Reserve Store",
    network: "Arbitrum",
    initialBalance: "45,800 ETH + Collateral Pool",
    txCount: 22031,
    age: "3 years",
    riskRating: "Low",
    isExchange: false,
    notes: "Central index protocol storage representing GLP backing assets. Safe custody parameters.",
    assetBalances: [
      { symbol: "ETH", amount: 45800, valueUsd: 160300000 },
      { symbol: "BTC", amount: 1100, valueUsd: 104500000 },
      { symbol: "USDC", amount: 148000000, valueUsd: 148000000 }
    ]
  },
  {
    address: "0x673185F5cbb8125191A77F54bceBBcFA018c1C9D",
    blockchainLabel: "Base L2 Rollup Sequencer Node",
    network: "Base",
    initialBalance: "22,500 ETH in flight",
    txCount: 1542380,
    age: "1.5 years",
    riskRating: "Low",
    isExchange: false,
    notes: "Official Coinbase sequencer execution point. Transmits state roots directly to Ethereum Mainnet every 15 minutes.",
    assetBalances: [
      { symbol: "ETH", amount: 22500, valueUsd: 78750000 }
    ]
  },
  {
    address: "0x1a84f3D94bC81E335ffA93cf4bD7Aee8fcff01cf",
    blockchainLabel: "Aerodrome AMM Liquidity Router",
    network: "Base",
    initialBalance: "45,200,000 AERO",
    txCount: 840102,
    age: "1 year",
    riskRating: "Medium",
    isExchange: false,
    notes: "Aggressive slippage loops. Multi-router paths targeted by Frontrunning searchers on Base network.",
    assetBalances: [
      { symbol: "AERO", amount: 45200000, valueUsd: 54240000 },
      { symbol: "USDC", amount: 35000000, valueUsd: 35000000 }
    ]
  },
  {
    address: "0x8E12a849Df7FD735f492b41F74Cd393da018dCc3",
    blockchainLabel: "Trader Joe Infinite Liquidator",
    network: "Avalanche",
    initialBalance: "1,250,500 AVAX",
    txCount: 84302,
    age: "3 years",
    riskRating: "Critical",
    isExchange: false,
    notes: "Flashloan powered MEV liquidation pipeline. Targets Benqi and Aave markets over Avalanche L1 network.",
    assetBalances: [
      { symbol: "AVAX", amount: 1250500, valueUsd: 33763500 },
      { symbol: "USDC", amount: 24000000, valueUsd: 24000000 }
    ]
  },
  {
    address: "0x53d2C253B820A3efB8Eee1280053C29eB9d09aef",
    blockchainLabel: "Avalanche Foundation Treasury",
    network: "Avalanche",
    initialBalance: "8,500,000 AVAX Store",
    txCount: 1421,
    age: "5 years",
    riskRating: "Low",
    isExchange: false,
    notes: "Cold backing store for grant distributions, community chest allocations, and L1 validator delegation support.",
    assetBalances: [
      { symbol: "AVAX", amount: 8500000, valueUsd: 229500000 }
    ]
  },
  {
    address: "0x847de10D832204E9efc9914EfF2B9D0Adee74E4f",
    blockchainLabel: "Velodrome V2 Solidly LP Whitelist",
    network: "Optimism",
    initialBalance: "15,400 ETH Layer Store",
    txCount: 75430,
    age: "2 years",
    riskRating: "High",
    isExchange: false,
    notes: "Main protocol backing address for veOP emissions and yield lockers. Constant dynamic re-staking actions.",
    assetBalances: [
      { symbol: "ETH", amount: 15400, valueUsd: 53900000 },
      { symbol: "OP", amount: 18500000, valueUsd: 40700000 }
    ]
  },
  {
    address: "0x09Df84deC2AeeE5c8435d12C85Cdb922DE843F8D",
    blockchainLabel: "OP Collective Council Multi-Sig",
    network: "Optimism",
    initialBalance: "41,000,000 OP Reserve",
    txCount: 382,
    age: "3 years",
    riskRating: "Low",
    isExchange: false,
    notes: "Core Optimism governance treasury. Highly secured multi-signature custodian workflow.",
    assetBalances: [
      { symbol: "OP", amount: 41000000, valueUsd: 90200000 }
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
