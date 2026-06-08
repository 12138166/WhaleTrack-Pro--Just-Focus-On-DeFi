import React, { useState, useMemo } from "react";
import { 
  ShieldCheck, 
  Gavel, 
  MessageSquare, 
  Users, 
  Scale, 
  Search, 
  ExternalLink, 
  Clock, 
  TrendingUp, 
  Cpu, 
  MessageCircle,
  AlertCircle,
  FileText,
  BadgeAlert,
  HelpCircle,
  Radio,
  Share2,
  Bell,
  BellOff,
  X,
  Sparkles,
  Check,
  Plus,
  Download
} from "lucide-react";
import { jsPDF } from "jspdf";

// Types
interface PolicyItem {
  id: string;
  category: "official-law" | "pending-claim";
  title: string;
  authority: string;
  year: string;
  status: string;
  description: string;
  keyTakeaway: string;
  legalBinding: boolean;
  citationUrl?: string;
  impactScore: "High" | "Medium" | "Low";
}

interface SpeechItem {
  id: string;
  speaker: string;
  title: string;
  role: string;
  date: string;
  quote: string;
  context: string;
  sentiment: "Bullish" | "Neutral" | "Regulated-Hawkish" | "Cautious";
}

interface SocialAccount {
  id: string;
  name: string;
  handle: string;
  platform: string;
  followers: string;
  description: string;
  keyStance: string;
  avatarColor: string;
  profileUrl: string;
}

// Data Sets
const POLICY_DATABASE: PolicyItem[] = [
  // Official Law / Legally Binding Decrees
  {
    id: "fed-yy",
    category: "official-law",
    title: "Federal Reserve Regulation YY",
    authority: "Federal Reserve Board",
    year: "2024-2026",
    status: "Active Law",
    description: "Enhanced Prudential Standards establishing strict tier-1 capital reserves and disclosure mandates governing sovereign US banking entities engaging in digital asset brokerages and custodial services.",
    keyTakeaway: "Guarantees that bank exposure to digital assets is fully collateralized with high-quality liquid assets (HQLA), preventing cascading liquidity contractions.",
    legalBinding: true,
    impactScore: "High"
  },
  {
    id: "occ-1170",
    category: "official-law",
    title: "OCC Interpretive Letter 1170 & 1172",
    authority: "Office of the Comptroller of the Currency",
    year: "2021 (Affirmed 2025)",
    status: "Active Directive",
    description: "Official administrative permission authorizing federally chartered national banks to act as node operators inside decentralized blockchain networks and custody crypto assets.",
    keyTakeaway: "Legitimizes blockchain ledgers as a standard alternative monetary clearing rail for traditional finance deposits and wire clearances.",
    legalBinding: true,
    impactScore: "High"
  },
  {
    id: "sec-sab121",
    category: "official-law",
    title: "SEC Staff Accounting Bulletin 121 (SAB 121)",
    authority: "Securities and Exchange Commission",
    year: "2022-2026",
    status: "Active Agency Guidelines",
    description: "Enforced SEC accounting mandate requiring all public reporting companies safeguarding digital assets on behalf of platform users to classify those assets as liabilities on their balance sheets.",
    keyTakeaway: "Severely restricts public banks from scaling crypto custody at institutional levels, as it inflates their leverage ratio equations.",
    legalBinding: true, // It is treated as binding in practice due to SEC audit enforcement
    impactScore: "High"
  },
  {
    id: "fed-joint-2023",
    category: "official-law",
    title: "Joint Statement on Crypto-Asset Banking Risks",
    authority: "Fed, FDIC, & OCC",
    year: "2023",
    status: "Joint Interagency Rule",
    description: "A formal joint declaration detailing liquidity concentration risks of stablecoin reserves, systemic exposure risks on bank balance sheets, and warning against co-mingling deposit types.",
    keyTakeaway: "Requires rigorous compliance checks and limits risk concentration to secure legacy deposits from on-chain bank runs.",
    legalBinding: true,
    impactScore: "Medium"
  },
  
  // Claim but NOT LAW yet (Bills, proposals, legislative efforts)
  {
    id: "bitcoin-act-2024",
    category: "pending-claim",
    title: "The Strategic BITCOIN Act of 2024",
    authority: "Senator Cynthia Lummis (WY)",
    year: "2024-2026",
    status: "Proposed Bill (Pending Vote)",
    description: "Legislative proposal directing the U.S. Treasury to establish a 'Strategic Bitcoin Reserve' and accumulate a targeted stock of 1,000,000 BTC over a five-year period via federal gold swap models.",
    keyTakeaway: "An aspirational claim/bill seeking to designate Bitcoin as a sovereign hard reserve asset. Highly bullish, but remains an unpassed bill, not law.",
    legalBinding: false,
    impactScore: "High"
  },
  {
    id: "fit21-act",
    category: "pending-claim",
    title: "FIT21 (Financial Innovation & Tech for 21st Century)",
    authority: "U.S. House of Representatives / Passed House",
    year: "2024-2026",
    status: "Proposed Bill (Passed House, Pending Senate)",
    description: "A landmark legislative framework seeking to redefine legal jurisdictions, transferring primary decentralization oversight to the CFTC while preserving securities governance under the SEC.",
    keyTakeaway: "Establishes formal tests to determine whether a digital asset is decentralized enough to avoid securities classification. Not yet signed into law.",
    legalBinding: false,
    impactScore: "High"
  },
  {
    id: "sab121-repeal",
    category: "pending-claim",
    title: "H.J.Res 109 - SAB 121 Congressional Repeal",
    authority: "U.S. Congress (Bipartisan Sponsor)",
    year: "2024-2025",
    status: "Proposed Joint Resolution (Vetoed / Under Renegotiation)",
    description: "A bipartisan joint congressional resolution invoked under the Congressional Review Act to strike down the SEC's controversial SAB 121 accounting requirement.",
    keyTakeaway: "Bipartisan support was blocked by an executive veto. Remains a claim/controversy, awaiting compromised statutory revisions.",
    legalBinding: false,
    impactScore: "Medium"
  },
  {
    id: "stablecoin-harmonization",
    category: "pending-claim",
    title: "Lummis-Gillibrand Payment Stablecoin Act",
    authority: "Senate Committee on Banking",
    year: "2024-2026",
    status: "Proposed Bill (In Committee)",
    description: "Proposed framework that would require stablecoin issuers to maintain one-to-one liquid cash or short-term U.S. Treasury backing, while forbidding algorithmic algorithmic unbacked models.",
    keyTakeaway: "Establishes state and federal regulatory licensing channels specifically for non-bank payment stablecoin mints. Still in legislative committee stages.",
    legalBinding: false,
    impactScore: "High"
  }
];

const SPEECH_DATABASE: SpeechItem[] = [
  {
    id: "trump-nashville",
    speaker: "Donald Trump",
    role: "President of the United States",
    title: "Nashville Keynote Block-policy Address",
    date: "July 2024",
    quote: "If crypto is going to define the future, I want it mined, minted, and made in the USA. We will immediately establish a national Strategic Bitcoin Reserve... This administration will protect self-custody and keep Elizabeth Warren's regulators far away from your coins.",
    context: "Spoke directly to the global Bitcoin conference, shifting official political framework from historical scrutiny to active capital assimilation policies.",
    sentiment: "Bullish"
  },
  {
    id: "trump-economic",
    speaker: "Donald Trump",
    role: "President of the United States",
    title: "New York Economic Club Address",
    date: "September 2025",
    quote: "We are turning America into the world capital of crypto and artificial intelligence. We will lower energy overheads substantially to make sure our grid easily powers high-throughput validators, AI model arrays, and domestic industrial mining hubs.",
    context: "Focused on regulatory deregulation, domestic energy expansion, and blockchain innovation as core pillars of national economic competitiveness.",
    sentiment: "Bullish"
  },
  {
    id: "powell-house",
    speaker: "Jerome Powell",
    role: "Former Federal Reserve Chair",
    title: "House Financial Services Committee Testimony",
    date: "2023-2025 Retrospective",
    quote: "We see stablecoins as a form of money... In advanced sovereign economies, the ultimate source of monetary trust is the central bank. We must have a robust federal regulatory footprint over payment stablecoins so they don't threaten dollar stability.",
    context: "Sought systematic oversight without proposing an outright ban. Acknowledged that stablecoins have real utility but warned about sovereign risk if left completely unregulated.",
    sentiment: "Regulated-Hawkish"
  },
  {
    id: "powell-crypto-stance",
    speaker: "Jerome Powell",
    role: "Former Federal Reserve Chair",
    title: "ECB Forum on Central Banking Keynote",
    date: "June 2024 Remarks",
    quote: "DeFi and crypto arrays operate outside regulatory perimeters. While they haven't triggered systemic traditional bank failures yet, they require coordinated guardrails. However, we have no desire to stifle private innovation unnecessarily.",
    context: "Expressed caution regarding DeFi leverage cycles, emphasizing a balanced perspective of non-intervention unless banking linkages expand.",
    sentiment: "Cautious"
  },
  {
    id: "warsh-cbdc",
    speaker: "Kevin Warsh",
    role: "Federal Reserve Chair (Newly Appointed, 2026)",
    title: "Senate Banking Briefing on Liquidity Rails",
    date: "February 2026",
    quote: "The Federal Reserve will not issue an invasive retail CBDC. Private stablecoin innovations, when fully backed by short-term Treasury securities and subjected to transparent auditing, represent an organic expansion of the global dollar clearing house.",
    context: "Underlined his strong pro-market regulatory perspective, suggesting the Fed should focus on fast wholesale settlement rather than crowding out private DeFi solutions.",
    sentiment: "Bullish"
  },
  {
    id: "warsh-monetary-future",
    speaker: "Kevin Warsh",
    role: "Federal Reserve Chair (Newly Appointed, 2026)",
    title: "Federal Reserve Board Briefing Statement",
    date: "April 2026",
    quote: "Sovereign currencies remain paramount, but sound money principles require us to look constructively at digital alternatives. The integrity of ledger registries, whether sovereign or decentralized, depends on rigorous transparency, clearing SLA speed, and strict capital discipline.",
    context: "Discussing modernizing central banking systems and integrating cryptographic reserve standards into global macroeconomic custody systems.",
    sentiment: "Neutral"
  }
];

const SOCIAL_ACCOUNTS: SocialAccount[] = [
  {
    id: "trump-social",
    name: "Donald Trump",
    handle: "@realDonaldTrump",
    platform: "Truth Social & X",
    followers: "94.5M",
    description: "45th & 47th President of the United States. Spearheads the official national push toward native strategic crypto reserves, validator tax reliefs, and digital asset deregulation.",
    keyStance: "National Bitcoin Accumulation, Anti-CBDC mandate, Self-Custody Protections.",
    avatarColor: "from-amber-600 to-yellow-500",
    profileUrl: "https://x.com/realDonaldTrump"
  },
  {
    id: "musk-social",
    name: "Elon Musk",
    handle: "@elonmusk",
    platform: "X (formerly Twitter)",
    followers: "192.8M",
    description: "CEO of Tesla & SpaceX, Owner of X, Co-founder of xAI and Neuralink. Prolific commentator on decentralized payment assets, Dogecoin advocate, and digital asset payments integration.",
    keyStance: "Frictionless P2P digital micropayments, algorithmic efficiency, currency design critique.",
    avatarColor: "from-slate-800 to-black border border-slate-700",
    profileUrl: "https://x.com/elonmusk"
  },
  {
    id: "huang-social",
    name: "Jensen Huang (黄仁勋)",
    handle: "@NVIDIA",
    platform: "X / Nvidia Corporate Network",
    followers: "2.4M (Company)",
    description: "Co-founder & CEO of NVIDIA. Supplies key computing engines (GPUs) powering Proof-of-Work blockchain mining blocks, decentralized zero-knowledge proofs (ZKP) computation, and on-chain AI models.",
    keyStance: "Hardware accelerated zero-knowledge processing, distributed computing node infrastructures.",
    avatarColor: "from-emerald-700 to-green-500",
    profileUrl: "https://x.com/nvidia"
  },
  {
    id: "cz-social",
    name: "CZ (Changpeng Zhao)",
    handle: "@cz_binance",
    platform: "X (formerly Twitter)",
    followers: "8.9M",
    description: "Founder and Former CEO of Binance (the world's largest crypto exchange). Global blockchain pioneer focused on liquid market depth, off-grid peer infrastructure, and Web3 education.",
    keyStance: "Decentralized liquidity, exchange reserve transparency (PoR), global compliance convergence.",
    avatarColor: "from-yellow-500 to-slate-900",
    profileUrl: "https://x.com/cz_binance"
  },
  {
    id: "sun-social",
    name: "Justin Sun (孙宇晨)",
    handle: "@justinsuntron",
    platform: "X & Weibo",
    followers: "3.6M",
    description: "Founder of TRON Network, Advisor to HTX Global, Member of the Grenada WTO Delegation. Major stakeholder in dollar-pegged liquidity networks, active stablecoin market activities, and DeFi yield nodes.",
    keyStance: "Stablecoin liquidity pipelines (USDT/USDD), cross-chain standardizations, high-throughput utility networks.",
    avatarColor: "from-purple-600 to-blue-500",
    profileUrl: "https://x.com/justinsuntron"
  }
];

const SIMULATED_POLICIES_POOL: PolicyItem[] = [
  {
    id: "sim-sol-etf",
    category: "official-law",
    title: "SEC Grants Omnibus Approval for Multi-Asset Spot Altcoin ETFs",
    authority: "Securities and Exchange Commission",
    year: "2026",
    status: "Approved Directive",
    description: "Official administrative order clearing the path for institutional Solana, Ripple, and Litecoin index spot-market exchange traded funds with direct cash redemptions.",
    keyTakeaway: "Allows conventional mutual funds and secondary retirement portfolios to scale raw long-exposures to diverse layered altcoin smart-contracts.",
    legalBinding: true,
    impactScore: "High"
  },
  {
    id: "sim-fed-blockchain",
    category: "official-law",
    title: "FedNow Layer-2 Settlement Bridge Release",
    authority: "Federal Reserve Board",
    year: "2026",
    status: "Active Policy",
    description: "Federal reserve launches standard API ledger integrations matching FedNow real-time wholesale settlements onto public zero-knowledge rollups.",
    keyTakeaway: "Slashes stablecoin-to-fiat clearance SLA delays from multiple bank business hours down to instant multi-signature settlement cycles.",
    legalBinding: true,
    impactScore: "High"
  },
  {
    id: "sim-tax-holiday",
    category: "pending-claim",
    title: "US Validator Energy & Mining Tax Holiday Act",
    authority: "Senate Committee on Finance",
    year: "2026",
    status: "Proposed Bill (Under Review)",
    description: "Congressional proposal introducing 0% corporate tax offsets for validators and cryptographic miners utilizing 100% sustainable alternative power sources.",
    keyTakeaway: "Triggers aggressive clean-energy capital inflows to expand national processing power margins ahead of overseas mining coalitions.",
    legalBinding: false,
    impactScore: "High"
  },
  {
    id: "sim-stable-yield",
    category: "pending-claim",
    title: "Payment Stablecoin Decentralized Yield Act",
    authority: "U.S. House of Representatives",
    year: "2026",
    status: "Proposed Bill (In Debate)",
    description: "Draft framework attempting to allow licensed non-bank stablecoin issuers to pass secure short-term sovereign interest returns directly down to retail consumer accounts.",
    keyTakeaway: "Blurs the boundaries between sovereign yield benchmarks and native ledger payments, making crypto wallets highly competitive with yielding bank deposits.",
    legalBinding: false,
    impactScore: "Medium"
  },
  {
    id: "sim-treasury-token",
    category: "official-law",
    title: "Treasury Department Tokenized Asset Custody Framework",
    authority: "U.S. Department of the Treasury",
    year: "2026",
    status: "Active Regulation",
    description: "Department decree standardizing multi-signature lockboxes for the collateralization of public state budgets with tokenized government treasury bonds.",
    keyTakeaway: "Instantly solidifies blockchain structures as valid custody environments for actual national public debt documents.",
    legalBinding: true,
    impactScore: "High"
  },
  {
    id: "sim-cftc-defi",
    category: "pending-claim",
    title: "CFTC Commodity Broker Exemption for Pure Defi Protocol Nodes",
    authority: "Commodity Futures Trading Commission",
    year: "2026",
    status: "Pending Rulemaking Proposal",
    description: "Administrative petition to exempt automated on-chain liquidity pools and smart contracts from physical intermediary registration conditions.",
    keyTakeaway: "Protects decentralized app developers from impossible broker compliance liabilities, as long as they lack administrative ledger keys.",
    legalBinding: false,
    impactScore: "Medium"
  }
];

interface PolicyToast {
  id: string;
  title: string;
  category: "official-law" | "pending-claim";
  authority: string;
  status: string;
  impactScore: "High" | "Medium" | "Low";
  timestamp: string;
}

export const CryptoPolicySection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"mandates" | "claims" | "speeches" | "socials">("mandates");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Convert POLICY_DATABASE to a dynamic state representation
  const [policies, setPolicies] = useState<PolicyItem[]>(POLICY_DATABASE);
  
  // Subscription toggle state (defaults to true for active engagement)
  const [isSubscribed, setIsSubscribed] = useState<boolean>(true);
  
  // List of active regulatory alerts/toasts
  const [toasts, setToasts] = useState<PolicyToast[]>([]);
  
  // Keep track of which pool index to simulate next
  const [poolIndex, setPoolIndex] = useState<number>(0);

  // Function to remove a specific toast
  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Trigger simulated addition to policies, triggering toast if subscribed is true
  const simulateNewPolicy = () => {
    // Get item from pool using circular queue
    const baseItem = SIMULATED_POLICIES_POOL[poolIndex];
    const uniqueId = `${baseItem.id}-${Date.now().toString(36)}`;
    const newItem: PolicyItem = {
      ...baseItem,
      id: uniqueId,
      year: "2026 (Simulated)"
    };

    // Update pool index
    setPoolIndex(prev => (prev + 1) % SIMULATED_POLICIES_POOL.length);

    // Append to virtual DATABASE state
    setPolicies(prev => [newItem, ...prev]);

    // If subscribed is enabled, push toast notification
    if (isSubscribed) {
      const toastId = `toast-${uniqueId}`;
      const newToast: PolicyToast = {
        id: toastId,
        title: newItem.title,
        category: newItem.category,
        authority: newItem.authority,
        status: newItem.status,
        impactScore: newItem.impactScore,
        timestamp: new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      };

      setToasts(prev => [newToast, ...prev].slice(0, 3));

      // Auto dismiss after 6.5s
      setTimeout(() => {
        removeToast(toastId);
      }, 6500);
    }
  };

  // Export of all active and pending policies into a formatted CSV spreadsheet report
  const exportToCSV = () => {
    const headers = [
      "Record ID",
      "Regulatory Category",
      "Policy Title",
      "Governing Authority",
      "Timeline Era",
      "Status Level",
      "Description Narrative",
      "Critical Takeaway Compliance Guidance",
      "Macro Impact Score",
      "Legal Binding Enforcement"
    ];
    
    const records = policies;
    
    const rows = records.map(p => [
      p.id,
      p.category === "official-law" ? "Federal Law & Mandate" : "Proposed Bill & Claim",
      p.title,
      p.authority,
      p.year,
      p.status,
      p.description,
      p.keyTakeaway,
      p.impactScore,
      p.legalBinding ? "ENFORCED" : "PROPOSED"
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.map(val => `"${val.replace(/"/g, '""')}"`).join(","))
    ].join("\r\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `US_Crypto_Legislative_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export of all active and pending policies into a professional, highly formatted PDF dossier report
  const exportToPDF = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });
    
    // Draw top branding header band (Deep Slate background color)
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 210, 38, "F");
    
    // Accent border line under header band
    doc.setFillColor(245, 158, 11); // Amber-500
    doc.rect(0, 38, 210, 1.5, "F");
    
    // Report Title
    doc.setTextColor(245, 158, 11); // Amber
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("US CRYPTOCURRENCY POLICY TELEMETRY REPORT", 14, 15);
    
    // Sub-header details
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.text(`Comprehensive dossier of active mandates & pending regulatory initiatives - Generated: ${new Date().toLocaleString()}`, 14, 22);
    
    doc.setTextColor(148, 163, 184); // Slate 400
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("SEC-COMPLIANT DIGITAL TELEMETRY STREAM FEED // SYSTEM v2026.1", 14, 28);
    
    let y = 48;
    
    // Summary Telemetry Block
    doc.setFillColor(241, 245, 249); // slate-100
    doc.rect(14, y, 182, 12, "F");
    
    // Border accent for statistic block
    doc.setFillColor(100, 116, 139); // slate-500
    doc.rect(14, y, 1, 12, "F");
    
    doc.setTextColor(15, 23, 42); // slate-900
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    
    const countLaws = policies.filter(p => p.category === "official-law").length;
    const countClaims = policies.filter(p => p.category === "pending-claim").length;
    const countHigh = policies.filter(p => p.impactScore === "High").length;
    
    doc.text(`SUMMARY TELEMETRY STATS:  Total Records: ${policies.length}  |  Enforced Laws: ${countLaws}  |  Pending Claims: ${countClaims}  |  High Impact Indicators: ${countHigh}`, 18, y + 7.5);
    
    y += 20;
    
    // Print each policy record
    policies.forEach((policy, index) => {
      // Clean text measurements to predict y vertical overlap and handle pagination cleanly
      const titleClean = `${index + 1}. ${policy.title.toUpperCase()}`;
      
      const descLines = doc.splitTextToSize(policy.description, 182);
      const takeawayLines = doc.splitTextToSize(`Compliance Readout: ${policy.keyTakeaway}`, 174);
      
      // Calculate box height dynamically
      const boxHeight = (takeawayLines.length * 4) + 5;
      
      // Space needed calculation
      const spaceNeeded = 5 + 4 + (descLines.length * 4) + 2 + boxHeight + 10;
      
      // If we overflow vertical printable limit (280mm), insert a new page and render running header
      if (y + spaceNeeded > 275) {
        doc.addPage();
        
        // Running Header
        doc.setFillColor(15, 23, 42); // slate-900 header block
        doc.rect(0, 0, 210, 12, "F");
        
        doc.setFillColor(245, 158, 11); // Amber accent
        doc.rect(0, 12, 210, 0.5, "F");
        
        doc.setTextColor(245, 158, 11);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.text("US CRYPTOCURRENCY POLICY TELEMETRY DIRECTORY - CONTINUED", 14, 8);
        
        y = 22; // reset starting vertical position on new page
      }
      
      // Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(15, 23, 42); // Deep navy charcoal
      doc.text(titleClean, 14, y);
      
      y += 5.5;
      
      // Metadata (Authority, Era, Status levels, Impact rating)
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      const isOfficial = policy.category === "official-law";
      if (isOfficial) {
        doc.setTextColor(217, 119, 6); // Amber-600
        doc.text(`[FEDERAL STANDARD: ${policy.status.toUpperCase()}]`, 14, y);
      } else {
        doc.setTextColor(6, 182, 212); // Cyan-500
        doc.text(`[PROPOSED LEGISLATIVE: ${policy.status.toUpperCase()}]`, 14, y);
      }
      
      doc.setTextColor(100, 116, 139); // slate-500
      doc.setFont("helvetica", "normal");
      doc.text(` | Timeline: ${policy.year} | Authority: ${policy.authority} | Impact: ${policy.impactScore}`, 75, y);
      
      y += 4.5;
      
      // Description text rendering
      doc.setTextColor(51, 65, 85); // slate-700
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.text(descLines, 14, y);
      
      y += (descLines.length * 4.2) + 2;
      
      // Compliance Readout Box
      doc.setFillColor(248, 250, 252); // slate-50 background for readout
      doc.rect(14, y, 182, boxHeight, "F");
      
      // Left vertical warning color-line
      doc.setFillColor(isOfficial ? 217 : 6, isOfficial ? 119 : 182, isOfficial ? 6 : 212); // Amber or Cyan
      doc.rect(14, y, 1.5, boxHeight, "F");
      
      doc.setTextColor(15, 23, 42); // slate-900
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8.5);
      doc.text(takeawayLines, 18, y + 4.5);
      
      y += boxHeight + 12; // spacer to next element
    });
    
    doc.save(`US_Crypto_Legislative_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  // Filter Policy Data
  const filteredPolicies = useMemo(() => {
    return policies.filter(p => {
      const matchSearch = 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.authority.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.keyTakeaway.toLowerCase().includes(searchQuery.toLowerCase());
      
      const tabCategory = activeTab === "mandates" ? "official-law" : "pending-claim";
      return matchSearch && p.category === tabCategory;
    });
  }, [policies, searchQuery, activeTab]);

  // Filter Speeches Data
  const filteredSpeeches = useMemo(() => {
    return SPEECH_DATABASE.filter(s => {
      return (
        s.speaker.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.quote.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.context.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [searchQuery]);

  // Filter Social Accounts Data
  const filteredSocials = useMemo(() => {
    return SOCIAL_ACCOUNTS.filter(acc => {
      return (
        acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        acc.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        acc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        acc.keyStance.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [searchQuery]);

  return (
    <div 
      className="bg-slate-950 border border-slate-900 rounded-xl p-5 space-y-5 relative overflow-hidden transition-all" 
      id="crypto-us-policy-analysis"
    >
      {/* Background design matrix overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0c101c_1px,transparent_1px),linear-gradient(to_bottom,#0c101c_1px,transparent_1px)] bg-[size:15px_15px] opacity-10 pointer-events-none"></div>

      {/* Header section with badge */}
      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1 bg-amber-950/40 text-amber-400 border border-amber-950 px-2 py-0.5 rounded font-mono text-[9px] font-bold tracking-widest uppercase">
            <Radio className="h-3 w-3 animate-pulse" />
            Macro policy telemetry
          </div>
          <h2 className="text-lg font-mono font-black tracking-tight text-slate-100 flex items-center gap-2">
            <Scale className="h-5 w-5 text-amber-400" />
            US Cryptocurrency Policy & Key Advocates Directory
          </h2>
          <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
            Authorized central bank decrees, pending statutory claims vs actual laws, key speeches from Donald Trump, current Fed Chair Kevin Warsh, and a social network tracking array.
          </p>
        </div>

        {/* Right side alignment: Subscription Toggle + Simulation Injection + Search Box */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Subscription Toggler Switch */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg p-1.5 h-9">
            <button
              id="policy-subscription-toggle"
              type="button"
              onClick={() => setIsSubscribed(!isSubscribed)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isSubscribed ? "bg-amber-500" : "bg-slate-800"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-slate-950 shadow ring-0 transition duration-200 ease-in-out ${
                  isSubscribed ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
            <span className="text-[10px] font-mono font-bold text-slate-450 uppercase flex items-center gap-1 min-w-[85px]">
              {isSubscribed ? (
                <>
                  <Bell className="h-3 w-3 text-amber-500 animate-bounce" />
                  <span className="text-amber-500">SUBSCRIBED</span>
                </>
              ) : (
                <>
                  <BellOff className="h-3 w-3 text-slate-505" />
                  <span className="text-slate-500">MUTED</span>
                </>
              )}
            </span>
          </div>

          {/* Simulated Event Injector Button */}
          <button
            id="policy-simulation-trigger-btn"
            onClick={simulateNewPolicy}
            className="flex items-center gap-1.5 h-9 text-[10px] font-mono font-black text-cyan-400 bg-cyan-950/20 hover:bg-cyan-950/40 px-3 rounded-lg border border-cyan-500/20 hover:border-cyan-500/40 transition-all cursor-pointer active:scale-95 text-nowrap"
            title="Schedules a new statutory policy claim or law into the local dataset list to prompt toast warnings"
          >
            <Plus className="h-3.5 w-3.5" />
            INJECT LEGISLATIVE SHIFT
          </button>

          {/* Document Export Actions Menu Widget */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg p-1.5 h-9" id="policy-export-controls">
            <span className="text-[9px] font-mono font-bold text-slate-500 uppercase px-1 hidden lg:inline select-none">Export Digest:</span>
            <button
              onClick={exportToCSV}
              id="export-csv-btn"
              className="flex items-center gap-1 text-[10px] h-6 font-mono font-bold text-emerald-450 hover:text-emerald-300 bg-slate-950 hover:bg-slate-900 px-2 rounded border border-emerald-950/30 hover:border-emerald-500/50 transition-all cursor-pointer active:scale-95"
              title="Download Microsoft Excel compatible CSV spreadsheet of all policies"
            >
              <Download className="h-2.5 w-2.5" />
              CSV
            </button>
            <button
              onClick={exportToPDF}
              id="export-pdf-btn"
              className="flex items-center gap-1 text-[10px] h-6 font-mono font-bold text-red-450 hover:text-red-300 bg-slate-950 hover:bg-slate-900 px-2 rounded border border-red-950/30 hover:border-red-500/50 transition-all cursor-pointer active:scale-95"
              title="Generate and download a beautifully styled PDF dossier booklet"
            >
              <FileText className="h-2.5 w-2.5" />
              PDF
            </button>
          </div>

          {/* Central Search Query */}
          <div className="relative w-full sm:w-52">
            <input
              type="text"
              id="policy-search-input"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 bg-slate-900 border border-slate-800 rounded-lg px-3 pl-8 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all"
            />
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
          </div>
        </div>
      </div>

      {/* Segment Navigation tabs */}
      <div className="relative flex flex-wrap gap-2 border-b border-slate-900 pb-3 font-mono text-xs">
        <button
          id="tab-btn-mandates"
          onClick={() => { setActiveTab("mandates"); }}
          className={`px-3.5 py-1.5 rounded-lg flex items-center gap-2 border transition-all cursor-pointer ${
            activeTab === "mandates"
              ? "bg-slate-900 border-amber-500/30 text-amber-400 font-bold shadow"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          Federal Laws & Mandates
        </button>
        <button
          id="tab-btn-claims"
          onClick={() => { setActiveTab("claims"); }}
          className={`px-3.5 py-1.5 rounded-lg flex items-center gap-2 border transition-all cursor-pointer ${
            activeTab === "claims"
              ? "bg-slate-900 border-cyan-500/30 text-cyan-400 font-bold shadow"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Gavel className="h-3.5 w-3.5" />
          Proposed Bills & Claims (Not Law)
        </button>
        <button
          id="tab-btn-speeches"
          onClick={() => { setActiveTab("speeches"); }}
          className={`px-3.5 py-1.5 rounded-lg flex items-center gap-2 border transition-all cursor-pointer ${
            activeTab === "speeches"
              ? "bg-slate-900 border-indigo-500/30 text-indigo-400 font-bold shadow"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          Monetary Speeches (Trump & Fed)
        </button>
        <button
          id="tab-btn-socials"
          onClick={() => { setActiveTab("socials"); }}
          className={`px-3.5 py-1.5 rounded-lg flex items-center gap-2 border transition-all cursor-pointer ${
            activeTab === "socials"
              ? "bg-slate-900 border-purple-500/30 text-purple-400 font-bold shadow"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          Social Directory Tracker
        </button>
      </div>

      {/* Tab Panels Contents */}
      <div className="relative">
        {/* Tab 1 & Tab 2: POLICY LEGISLATIVE DATABASE (Laws / Claims) */}
        {(activeTab === "mandates" || activeTab === "claims") && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="policy-cards-grid">
            {filteredPolicies.length > 0 ? (
              filteredPolicies.map((policy) => (
                <div 
                  key={policy.id} 
                  id={`policy-card-${policy.id}`}
                  className="bg-slate-900/40 border border-slate-900/80 rounded-xl p-4.5 hover:border-slate-800 transition-all flex flex-col justify-between gap-3 space-y-1 relative group"
                >
                  <div className="space-y-2">
                    {/* Header line with badge indicator */}
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono text-slate-500 font-bold tracking-widest uppercase">
                        {policy.authority}
                      </span>
                      <div className="flex items-center gap-2 font-mono text-[9px] font-bold">
                        <span className={`px-2 py-0.5 rounded leading-none ${
                          policy.legalBinding 
                            ? "bg-amber-950/40 text-amber-400 border border-amber-900/30" 
                            : "bg-cyan-950/40 text-cyan-400 border border-cyan-900/30"
                        }`}>
                          {policy.status}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded leading-none ${
                          policy.impactScore === "High" ? "bg-red-950/40 text-red-400 border border-red-900/30" :
                          policy.impactScore === "Medium" ? "bg-indigo-950/40 text-indigo-400 border border-indigo-900/30" :
                          "bg-slate-950/40 text-slate-400 border border-slate-850"
                        }`}>
                          Impact: {policy.impactScore}
                        </span>
                      </div>
                    </div>

                    <h3 className="font-mono text-sm font-black text-slate-200 group-hover:text-cyan-400 transition-all">
                      {policy.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-sans">
                      {policy.description}
                    </p>
                  </div>

                  {/* Operational Takeaway Callout */}
                  <div className="p-3 bg-slate-950 border border-slate-900/80 rounded-lg text-[11px] font-sans leading-relaxed text-slate-300 relative border-l-2 border-l-cyan-500/60">
                    <span className="text-[8px] font-mono text-cyan-400 block font-bold uppercase tracking-widest mb-1">
                      CRITICAL COMPLIANCE READOUT
                    </span>
                    {policy.keyTakeaway}
                  </div>

                  {/* Metadata Row */}
                  <div className="flex items-center justify-between pt-1 font-mono text-[10px] text-slate-500 border-t border-slate-900/50">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Timeline: {policy.year}
                    </span>
                    <span className="text-[10px]">
                      Type: {policy.legalBinding ? "Legally Binding Standard" : "Proposed Legislative Spec"}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div id="no-policies-element" className="col-span-2 text-center py-10 border border-dashed border-slate-900 rounded-xl space-y-2">
                <AlertCircle className="h-8 w-8 text-slate-500 mx-auto animate-bounce" />
                <p className="font-mono text-xs text-slate-400">No regulatory parameters matched the search constraint [{searchQuery}]</p>
                <button 
                  onClick={() => setSearchQuery("")}
                  className="font-mono text-[10px] text-cyan-405 underline cursor-pointer hover:text-cyan-300"
                >
                  Clear filter keywords
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: INFLUENTIAL SPEECHES (Trump, Powell, Warsh) */}
        {activeTab === "speeches" && (
          <div className="space-y-4" id="speech-cards-list">
            {filteredSpeeches.length > 0 ? (
              filteredSpeeches.map((sp) => (
                <div 
                  key={sp.id} 
                  id={`speech-card-${sp.id}`}
                  className="bg-slate-900/20 border border-slate-900 rounded-xl p-5 hover:border-slate-850 transition-all flex flex-col md:flex-row gap-5 items-start relative group"
                >
                  {/* Speaker Meta Identity Column */}
                  <div className="md:w-56 shrink-0 space-y-1 bg-slate-950 p-3 rounded-lg border border-slate-900 text-center md:text-left">
                    <span className="text-[8px] font-mono font-bold text-slate-500 tracking-wider uppercase block">
                      KEYNOTE PROCURATOR
                    </span>
                    <h3 className="font-mono text-sm font-black text-slate-200 leading-none">
                      {sp.speaker}
                    </h3>
                    <p className="text-[10px] text-amber-500 font-mono font-bold">{sp.role}</p>
                    
                    <div className="h-[2px] w-8 bg-slate-900 my-2 mx-auto md:mx-0"></div>

                    <div className="flex flex-col gap-1 text-[10px] text-slate-500 font-mono">
                      <span>Timeline: {sp.date}</span>
                      <span className="mt-1">
                        Stance:{" "}
                        <strong className={`px-1.5 py-0.5 rounded text-[9px] ${
                          sp.sentiment === "Bullish" ? "bg-emerald-950/40 text-emerald-400 border border-emerald-950" :
                          sp.sentiment === "Cautious" ? "bg-amber-950/40 text-amber-400 border border-amber-950" :
                          sp.sentiment === "Regulated-Hawkish" ? "bg-red-950/40 text-red-400 border border-red-950" :
                          "bg-slate-900 text-slate-400 border border-slate-800"
                        }`}>
                          {sp.sentiment}
                        </strong>
                      </span>
                    </div>
                  </div>

                  {/* Speech Quotation and Context */}
                  <div className="flex-1 space-y-3.5">
                    {/* Speech Title banner */}
                    <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                      <span className="font-mono text-xs font-bold text-slate-300 uppercase tracking-wide">
                        📜 {sp.title}
                      </span>
                      <span className="text-[9px] font-mono text-slate-500">2026 Telemetry Sync</span>
                    </div>

                    <p className="text-slate-200 text-xs italic font-sans leading-relaxed relative pl-4 border-l-2 border-l-indigo-500/40 py-0.5">
                      "{sp.quote}"
                    </p>

                    <div className="p-2.5 bg-slate-950/80 border border-slate-900/60 rounded text-[10px] font-mono text-slate-400 leading-normal">
                      <strong className="text-slate-300 block text-[9px] uppercase font-bold tracking-wider mb-0.5">
                        MACROECONOMIC CONTEXT
                      </strong>
                      {sp.context}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div id="no-speeches-element" className="text-center py-10 border border-dashed border-slate-900 rounded-xl space-y-2">
                <AlertCircle className="h-8 w-8 text-slate-500 mx-auto animate-bounce" />
                <p className="font-mono text-xs text-slate-400">No policy keynotes matched description [{searchQuery}]</p>
                <button 
                  onClick={() => setSearchQuery("")}
                  className="font-mono text-[10px] text-cyan-405 underline cursor-pointer hover:text-cyan-305"
                >
                  Reset keywords
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: SOCIAL DIRECTORY TRACKER */}
        {activeTab === "socials" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" id="social-cards-grid">
            {filteredSocials.length > 0 ? (
              filteredSocials.map((acc) => (
                <div 
                  key={acc.id} 
                  id={`social-card-${acc.id}`}
                  className="bg-slate-900/30 border border-slate-900 rounded-xl p-4.5 hover:border-slate-800 transition-all flex flex-col justify-between gap-4 relative group hover:shadow-[0_4px_15px_rgba(0,0,0,0.15)]"
                >
                  <div className="space-y-3">
                    {/* Header Row */}
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${acc.avatarColor} flex items-center justify-center font-mono text-sm font-black text-slate-105 shrink-0`}>
                        {acc.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-sans text-xs font-bold text-slate-200 leading-none">
                          {acc.name}
                        </h3>
                        <span className="text-[10px] font-mono text-cyan-400 mt-1 block">
                          {acc.handle}
                        </span>
                      </div>
                    </div>

                    <div className="h-[1px] bg-slate-900"></div>

                    {/* Description Body */}
                    <p className="text-[11px] text-slate-400 leading-relaxed font-sans min-h-[50px]">
                      {acc.description}
                    </p>

                    {/* Stance readouts tag */}
                    <div className="space-y-1">
                      <span className="text-[8px] font-mono text-slate-500 uppercase font-black block">Core Advocacy Stance</span>
                      <div className="text-[10px] font-mono text-slate-300 bg-slate-950 p-2 rounded border border-slate-900 leading-normal">
                        ⚡ {acc.keyStance}
                      </div>
                    </div>
                  </div>

                  {/* Operational Footer Details with links */}
                  <div className="flex items-center justify-between border-t border-slate-900/60 pt-2.5 mt-1 font-mono text-[10px]">
                    <span className="text-slate-500">
                      Platform: <strong className="text-slate-400 font-bold">{acc.platform}</strong>
                    </span>
                    <a 
                      href={acc.profileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-cyan-450 hover:text-cyan-300 font-bold flex items-center gap-1.5 transition-all text-[9px] hover:underline"
                    >
                      VISIT PROFILE
                      <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <div id="no-socials-element" className="col-span-3 text-center py-10 border border-dashed border-slate-900 rounded-xl space-y-2">
                <AlertCircle className="h-8 w-8 text-slate-500 mx-auto animate-bounce" />
                <p className="font-mono text-xs text-slate-400">No macro proponents matched search constraints [{searchQuery}]</p>
                <button 
                  onClick={() => setSearchQuery("")}
                  className="font-mono text-[10px] text-cyan-405 underline cursor-pointer hover:text-cyan-300"
                >
                  Clear search context
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cyber Compliance telemetry footer panel */}
      <div className="p-3 bg-slate-950 border border-slate-900 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 font-mono text-[10px]">
        <div className="flex items-center gap-1.5">
          <BadgeAlert className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
          <span>Fiduciary Regulatory Notice: In-app parameters serve structural simulation scopes. Keep sovereign guidelines in sync with SEC rules.</span>
        </div>
        <span className="text-[10px] shrink-0 font-bold tracking-widest text-slate-400 uppercase">
          SEC-COMPLIANT FEED ● v2026
        </span>
      </div>

      {/* POLICY ALERT TOASTS CONTAINER (TOP-RIGHT DEPLOYED TO PREVENT OVERLAPPING WITH BOTTOM-RIGHT WHALE TOASTS) */}
      <div className="fixed top-6 right-6 z-[99999] flex flex-col gap-3 w-[calc(100vw-3rem)] sm:w-96 pointer-events-none" id="policy-alert-toast-stack">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className="pointer-events-auto bg-slate-950/95 border border-amber-500/30 rounded-xl p-4 shadow-[0_0_20px_rgba(245,158,11,0.2)] backdrop-blur-md flex flex-col gap-2 relative overflow-hidden animate-slide-in-right transform transition-all duration-300"
            style={{
              borderLeft: "42px solid transparent",
            }}
          >
            {/* Left legal standard gavel ornament column */}
            <div className="absolute left-0 top-0 bottom-0 w-[42px] bg-slate-900 border-r border-slate-850 flex items-center justify-center pointer-events-none">
              <Gavel className="h-4 w-4 text-amber-500 animate-pulse" />
            </div>

            {/* Top right design amber background accent */}
            <div className="absolute top-0 right-0 h-10 w-10 bg-gradient-to-br from-amber-500/10 to-transparent pointer-events-none rounded-tr-xl"></div>

            {/* Header Row */}
            <div className="flex items-center justify-between pl-1">
              <div className="flex items-center gap-1.5 font-mono text-[9px] text-amber-500 font-black tracking-widest uppercase">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
                </span>
                LEGISLATIVE EVENT ALERT
              </div>
              <span className="text-[8px] text-slate-500 font-mono font-bold">{toast.timestamp}</span>
            </div>

            {/* Content body */}
            <div className="space-y-1 pl-1">
              <div className="text-xs text-slate-200 font-mono font-bold leading-tight">
                {toast.title}
              </div>
              <div className="flex flex-wrap items-center gap-1.5 text-[9px] font-mono text-slate-450">
                <span className="px-1 bg-slate-900 border border-slate-800 rounded">{toast.authority}</span>
                <span className={`px-1 rounded text-[8px] font-black ${
                  toast.category === "official-law" ? "bg-amber-955/40 text-amber-400 border border-amber-900/30" : "bg-cyan-955/40 text-cyan-400 border border-cyan-900/30"
                }`}>{toast.status}</span>
                <span className={`px-1 rounded text-[8px] ${
                  toast.impactScore === "High" ? "bg-red-955/40 text-red-400 border border-red-900/30" : "bg-slate-900 text-slate-400 border border-slate-800"
                }`}>Impact: {toast.impactScore}</span>
              </div>
            </div>

            {/* Dismiss trigger */}
            <button
              onClick={() => removeToast(toast.id)}
              className="absolute top-2 right-2 text-slate-500 hover:text-slate-200 p-0.5 rounded hover:bg-slate-900 transition-all cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
