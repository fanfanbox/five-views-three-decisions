# Five Views, Three Decisions (五看三定) — AI Strategic Analysis Engine

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)

**五看三定AI战略洞察助手** — Based on Huawei IPD DSTE methodology, this tool helps R&D teams complete 80% of market intelligence gathering and preliminary screening during the Charter (New Product Introduction) phase. Input a new product direction, output a complete strategic analysis report (MD + HTML dual format).

基于华为IPD DSTE「五看三定」方法论的全自动战略分析流水线。输入新产品方向，一键输出完整战略洞察报告（MD+HTML双格式）。

---

## Architecture (架构)

```
┌─────────────────────────────────────────────────────────────┐
│                 输入：新产品方向                              │
│          "卫星反作用飞轮电机" / "800V SiC电驱"               │
└──────────────────────┬──────────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  Phase 1: 输入解析 (Input Parsing)                          │
│  将产品方向拆解 → {技术域, 应用域, 约束条件}                 │
└──────────────────────┬──────────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  Phase 2: 五看并行 (5 Parallel Views)                       │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐              │
│  │看趋势│ │看对手│ │看客户│ │看自己│ │看机会│              │
│  │Trend │ │Compet│ │Cust  │ │Self  │ │Oppty │              │
│  └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘              │
│     └────────┴────┬────┴────────┴────────┘                  │
│                   ▼                                         │
│  Phase 3: 交叉验证 (Cross-Validation)                        │
│  去重 → 矛盾识别 → 跨模块关联 → 优先级排序                   │
└──────────────────────┬──────────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  Phase 4: 三定决策 (3 Sequential Decisions)                  │
│  定目标 (Goals) → 定策略 (Strategy) → 定计划 (Plan)          │
└──────────────────────┬──────────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  Phase 5: 报告生成 (Report Generation)                       │
│  📄 Markdown 报告 + 🌐 网页HTML报告 (含CSS图表)             │
└─────────────────────────────────────────────────────────────┘
```

## Features (功能特点)

- **Multi-Agent Parallel Analysis**: 5 domain-specific AI agents analyze simultaneously (trends, competitors, customers, self, opportunities)
- **DuckDuckGo Web Search**: Each agent collects real-time market intelligence from public sources
- **Cross-Validation**: Automatic conflict detection across modules (e.g., price data consistency, TAM alignment)
- **Market Sizing**: TAM/SAM/SOM with China vs Global split
- **Decision Engine**: Goals → Strategy → Plan with rationale
- **Dual-Format Reports**: Markdown + CSS-enhanced HTML with charts (bar charts, line charts, maturity meters)

## Prerequisites (前置要求)

- **Python 3.10+**
- **DeepSeek API Key** — [Get one here](https://platform.deepseek.com/)
- Internet connection (for DuckDuckGo search)

## Installation (安装)

```bash
# 1. Clone the repository
git clone https://github.com/fanfanbox/five-views-three-decisions.git
cd five-views-three-decisions

# 2. Install dependencies
pip install -r requirements.txt

# 3. Set your DeepSeek API key
# Option A: Environment variable
export DEEPSEEK_API_KEY='your-key-here'

# Option B: Create .env file (copy from template)
cp .env.example .env
# Then edit .env with your API key
```

## Usage (使用方法)

### Basic Usage

```bash
python workflow.py "卫星反作用飞轮电机 Satellite Reaction Wheel Motor"
```

### Advanced Options

```bash
# Specify output directory
python workflow.py "高功率密度轴向磁通电机" --output-dir ./my_reports

# Use a specific model
python workflow.py "800V SiC电驱系统" --model deepseek-chat

# Set custom report date
python workflow.py "固态电池" --date 2026-06-09
```

### Claude Code Skill Integration

To use as a Claude Code slash command:

1. Copy the entire repo into your project's `.claude/skills/` directory
2. Create a `main.md` with the following content:

```yaml
---
name: 5S3DAnalysis
description: 五看三定AI战略洞察助手
skill: true
---

# /5S3DAnalysis — 五看三定AI战略洞察助手

当用户输入 `/5S3DAnalysis <产品方向>` 时，运行:
```
python .claude/skills/5S3DAnalysis/workflow.py "<产品方向>"
```
```

## Output (输出示例)

Each run generates two files in the `output/` directory:

```
output/
├── 2026-06-09-卫星反作用飞轮电机-report.md      # Markdown 格式
└── 2026-06-09-卫星反作用飞轮电机-report.html     # HTML 格式（含CSS图表）
```

### Report Sections

| # | Section | Description |
|---|---------|-------------|
| 一 | 执行摘要 | Executive summary with key metrics |
| 二 | 看趋势 | Technology trends, policies, standards |
| 三 | 看对手 | Competitor landscape, parameter benchmarks |
| 四 | 看客户 | Customer pain points, procurement patterns |
| 五 | 看自己 | Capability gap analysis |
| 六 | 看机会 | Market sizing (TAM/SAM/SOM), opportunities |
| 七 | 交叉验证 | Cross-module conflicts & insights |
| 八 | 定目标 | Technical MVP + business targets |
| 九 | 定策略 | Recommended strategy + differentiation |
| 十 | 定计划 | Milestones + risks + resources |
| 十一 | 附录 | Methodology & references |

## Dependencies (依赖项)

| Package | Version | Purpose |
|---------|---------|---------|
| `requests` | >=2.28 | DeepSeek API calls |
| `ddgs` | >=9.14 | DuckDuckGo search |
| `duckduckgo_search` | >=8.1 | DuckDuckGo search engine |
| `jinja2` | >=3.1 | HTML report templating |

## Configuration (配置)

All configuration is via environment variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `DEEPSEEK_API_KEY` | ✅ Yes | Your DeepSeek API key |

## License

MIT License — see [LICENSE](LICENSE) for details.

## Author

**Dr.-ING Jian WANG** — 五看三定AI战略分析引擎 v2.0
