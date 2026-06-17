# 🐋 WhaleTrack Pro: Just Focus On DeFi

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)]()

## 📖 项目简介 (Introduction)

**WhaleTrack Pro** 是一款专为去中心化金融（DeFi）领域打造的链上“巨鲸（Whale）”与“聪明钱（Smart Money）”追踪及数据分析系统。

在高度博弈与信息不对称的 Web3 市场中，大资金的链上异动往往是市场趋势演变的前瞻性指标。本项目旨在通过高频、低延迟的链上数据解析，结合结构化的过滤模型，帮助研究员、交易者及 DeFi 深度参与者剥离市场噪音，**“只关注纯粹的 DeFi 链上信号” (Just Focus On DeFi)**，从而制定更具数据支撑的投资与研究策略。

## ✨ 核心功能 (Core Features)

- **⚡ 实时链上监控 (Real-Time On-Chain Monitoring)**: 毫秒级解析主流 DEX (如 Uniswap, Curve, PancakeSwap) 上的巨额 Swap、添加/移除流动性 (LP) 等关键事件。
- **🧠 聪明钱标记与追踪 (Smart Money Tracking)**: 建立巨鲸地址库与高胜率地址标签，实时跟踪其资金流向与持仓变化网络。
- **🚨 多渠道实时预警 (Multi-Channel Alerts)**: 支持将大额异动信号通过 Telegram Bot、Discord Webhook 或自定义 API 实时推送。
- **📊 可视化数据看板 (DeFi Dashboard)**: 提供直观的图表与资金流向图（Sankey Diagram），深度剖析资金跨链与协议间的转移路径。
- **🛡️ 基础防御性风险分析 (Risk Analysis)**: 结合 MEV 夹击检测与代币合约行为扫描，对异常的链上流动性撤离（Rug Pull）发出早期预警。

## 🛠️ 技术架构体系 (Tech Stack & Architecture)

*（请根据您的实际开发环境对本章节进行增删）*

- **前端 (Frontend)**: React.js / Next.js, Tailwind CSS, ECharts / D3.js (数据流向可视化)
- **后端 (Backend)**: Node.js (NestJS) 或 Python (FastAPI)，负责处理高并发请求与异步任务调度。
- **链上数据层 (Data Layer)**: 
  - **RPC 节点提供商**: Alchemy / Infura / QuickNode
  - **解析工具**: Web3.js / Ethers.js, The Graph (GraphQL Subgraphs)
- **数据库与中间件 (Database & Middleware)**: PostgreSQL (历史数据持久化), Redis (高频数据缓存、Pub/Sub 消息队列)
- **部署与运维 (DevOps)**: Docker Compose, GitHub Actions (CI/CD)

## 🚀 快速开始 (Quick Start)

### 1. 环境准备 (Prerequisites)
请确保您的本地开发服务器或物理机已安装以下依赖：
- [Node.js](https://nodejs.org/) (v16.x 或更高版本) 或 Python 3.9+
- [Yarn](https://yarnpkg.com/) / [npm](https://www.npmjs.com/)
- [PostgreSQL](https://www.postgresql.org/) & [Redis](https://redis.io/)
- 有效的 Web3 RPC WSS/HTTP API Key

### 2. 克隆项目 (Clone the Repository)
```bash
git clone [https://github.com/12138166/WhaleTrack-Pro--Just-Focus-On-DeFi.git](https://github.com/12138166/WhaleTrack-Pro--Just-Focus-On-DeFi.git)
cd WhaleTrack-Pro--Just-Focus-On-DeFi

```

### 3. 安装依赖 (Install Dependencies)

```bash
# 进入后端目录并安装依赖
cd backend && yarn install

# 进入前端目录并安装依赖
cd ../frontend && yarn install

```

### 4. 环境变量配置 (Environment Configuration)

在项目根目录或 `backend` 目录下，复制环境变量配置模板并填入您自己的核心参数：

```bash
cp .env.example .env

```

`.env` 文件示例配置：

```env
PORT=3000
DATABASE_URL=postgres://user:password@localhost:5432/whaletrack
REDIS_URL=redis://localhost:6379

# 区块链节点配置
RPC_PROVIDER_HTTP=[https://eth-mainnet.alchemyapi.io/v2/YOUR_ALCHEMY_KEY](https://eth-mainnet.alchemyapi.io/v2/YOUR_ALCHEMY_KEY)
RPC_PROVIDER_WSS=wss://eth-mainnet.alchemyapi.io/v2/YOUR_ALCHEMY_KEY

# 预警系统配置
TELEGRAM_BOT_TOKEN=your_tg_bot_token
DISCORD_WEBHOOK_URL=your_discord_webhook_url

```

### 5. 启动服务 (Run the Application)

建议使用 Docker 进行容器化启动，以保证环境的一致性：

```bash
# 启动数据库与缓存服务
docker-compose up -d db redis

# 启动本地开发服务器
cd backend && yarn run dev
cd ../frontend && yarn run dev

```

启动完成后，可在浏览器访问前端数据看板: `http://localhost:3000`

## 🗺️ 发展路线图 (Roadmap)

* [x] **Phase 1**: 支持 Ethereum 主网核心 DEX（Uniswap V2/V3）的实时流解析。
* [x] **Phase 2**: 完善内部地址标签库，接入 Telegram & Discord 预警机器人。
* [ ] **Phase 3**: 扩展 Layer 2 多链支持（Arbitrum, Optimism, Base）。
* [ ] **Phase 4**: 引入统计套利与机器学习（ML）聚类算法，自动甄别“高胜率交易者”与“MEV 机器人”。
* [ ] **Phase 5**: 封装标准化的 RESTful API，赋能第三方量化交易团队。

## 🤝 参与贡献 (Contributing)

我们欢迎加密研究员、Web3 开发者以任何形式参与贡献。无论是提出数据维度的需求（Issues）、修复逻辑 Bug，还是提交新的代码（Pull Requests），请遵循以下标准流程：

1. Fork 本项目仓库
2. 创建您的特性分支 (`git checkout -b feature/NewDeFiProtocol`)
3. 提交您的更改 (`git commit -m 'Add tracking for specific protocol'`)
4. 将更改推送到分支 (`git push origin feature/NewDeFiProtocol`)
5. 发起一个 Pull Request (PR) 并附带详尽的代码变更说明

## 📜 许可证与免责声明 (License & Disclaimer)

本项目基于 [MIT License](https://www.google.com/search?q=LICENSE) 协议开源。

> **免责声明 (Disclaimer)**: WhaleTrack Pro 提供的数据解析与预警信号仅供学术研究、技术探讨与链上数据分析参考，绝对不构成任何形式的投资、税务或法律建议。加密货币及 DeFi 市场具备极高风险性与不确定性，请始终保持独立思考（DYOR）并谨慎决策。

---

*Powered by 12138166 | Just Focus On DeFi*
