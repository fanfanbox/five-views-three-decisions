---
name: 5S3DAnalysis
description: 五看三定AI战略洞察助手 — 基于华为DSTE方法论，输入新产品方向后一键输出完整战略洞察报告
skill: true
---

# /5S3DAnalysis — 五看三定AI战略洞察助手 (v1.0)

> **Release v1.0** | 基于华为IPD DSTE方法论 | 作者：Dr.-ING Jian WANG
> GitHub: https://github.com/fanfanbox/five-views-three-decisions

## Description

基于华为IPD DSTE "五看三定"（Five Views, Three Decisions）方法论，本Skill是一个AI战略洞察助手，帮助研发团队在Charter（新产品启动）阶段完成80%的市场情报搜集与初筛工作。

输入新产品方向，一键输出可直接用于Charter汇报的完整战略洞察报告（MD+HTML双格式）。

## Usage

```
/5S3DAnalysis <新产品方向>
```

**Examples:**
- `/5S3DAnalysis 高功率密度轴向磁通电机在低空经济中的应用`
- `/5S3DAnalysis 800V SiC电驱系统在新能源重卡中的机会`
- `/5S3DAnalysis 固态电池在消费电子中的商业化路径`

## What It Does

一键全自动输出完整报告，包含4层分析流水线：

### Layer 1: 五看并行 (5 Agents Parallel)
| Agent | 职责 | 搜索策略 |
|-------|------|----------|
| 看趋势 | 技术生命周期定位 + 政策/标准分析 | WebSearch行业趋势 + 政策 |
| 看对手 | 竞品识别 + 技术参数对标 | WebSearch竞品 + WebFetch白皮书 |
| 看客户 | 痛点捕获 + 价值主张匹配 | WebSearch客户需求 + 行业报告 |
| 看自己 | 能力差距矩阵 | 对标分析（默认使用 `company_capability_baseline.md`） |
| 看机会 | TAM/SAM/SOM + Ansoff矩阵 | WebSearch市场规模数据 |

### Layer 2: 交叉验证 (Synthesis)
去重 → 矛盾识别 → 跨模块关联发现 → 机会优先级排序

### Layer 3: 三定递进 (Sequential Decisions)
定目标（技术红线+商业目标）→ 定策略（差异化路线推荐）→ 定计划（里程碑+风险清单）

### Layer 4: 报告生成 (Dual-Format Output)
- `docs/5s3d-reports/{YYYY-MM-DD}-{slug}-report.md`
- `docs/5s3d-reports/{YYYY-MM-DD}-{slug}-report.html`

## Implementation

When user invokes `/5S3DAnalysis <product direction>`:

1. Parse user input into search intent triple: {技术域, 应用域, 约束条件}
2. Call Workflow tool with script `.claude/skills/5S3DAnalysis/workflow-5S3DAnalysis.js`, passing the parsed input as args
3. The Workflow orchestrates the full 4-layer pipeline:
   - `phase('输入解析')` → input parsing agent
   - `phase('五看并行')` → `parallel()` 5 agents
   - `phase('交叉验证')` → synthesis agent
   - `phase('三定决策')` → 3 sequential agents
   - `phase('报告生成')` → MD + HTML dual output
4. On completion, report saved file paths to user

## 看自己：能力基线文件

`看自己` Agent 默认使用项目根目录下的 **`company_capability_baseline.md`** 作为能力输入。该文件包含目标公司的匿名化核心能力基线：

| 章节 | 内容 |
|------|------|
| 公司定位 | 全球独立动力总成技术供应商 |
| 关键规模 | ~19,000人 / 18工厂 / 5研发中心 / >800万台电机/年 |
| 产品矩阵 | 发动机×9 + 混动系统×4 + 电驱×4 + 增程器×2 |
| 核心技术 | 燃烧热管理 / 电气化集成 / 多燃料 / 模块化平台 / 智能制造 |
| 差距维度 | 纯电驱动 / 固态电池 / SDV / 燃料电池 / 航空低空 / 非公路 |

**使用方式**：用户可通过以下方式覆盖默认基线：
1. 在调用 Skill 时附加自身能力描述文本
2. 修改 `company_capability_baseline.md` 文件内容
3. 创建新的能力基线文件并修改 `SELF_PROMPT` 中的路径引用

## Agent Prompts

All agent prompt templates are in `.claude/skills/5S3DAnalysis/prompts/`:
- `trend.md` — 看趋势
- `competitor.md` — 看对手
- `customer.md` — 看客户
- `self.md` — 看自己（含能力基线使用说明）
- `opportunity.md` — 看机会
- `synthesis.md` — 交叉验证
- `goal.md` — 定目标
- `strategy.md` — 定策略
- `plan.md` — 定计划

## Templates

- `templates/report-template.md` — MD 报告模板（含 v1.1 执行摘要格式）
- `templates/report-style.css` — HTML 报告样式 v2.0

## Output Structure

```markdown
# 五看三定战略洞察报告：{产品方向}
## 一、执行摘要（v1.1 简洁格式）
## 二、分析方法
## 三、看趋势 → 四、看对手 → 五、看客户 → 六、看自己 → 七、看机会
## 八、交叉验证洞察
## 九、定目标 → 十、定策略 → 十一、定计划
## 十二、附录
```

### 执行摘要格式约定（v1.1）

执行摘要遵循"只呈现状态和数字"原则，分为三个紧凑模块：

1. **核心指标表**：3列表格 `| 指标 | 值 | 详情 |`，每行的「详情」列通过 markdown 锚点链接到对应章节。包含5项指标：技术生命周期、CAGR、TAM、上市周期、关键差距。
2. **机会快览**：Top 3 机会点，每条一句话（≤100字），含评分和详情链接。
3. **核心洞察**：2-3条精简洞察，每条 ≤200字，截断不展开。

**设计原则**：摘要页 = 状态标签 + 关键数字。不写段落式叙述。解释性内容全部下沉到对应章节，通过链接导航。

## Error Handling

- 搜索无结果 → 标注"未找到数据"+替代搜索词建议
- 看自己无输入 → 自动使用 `company_capability_baseline.md` 作为默认能力基线
- 能力基线文件缺失 → 输出标准Gap模板，标注"请补充能力信息"
- Agent调用失败 → 跳过该模块，报告中标注
- 输入过于宽泛 → 提示用户缩小范围

## Files

```
.claude/skills/5S3DAnalysis/
├── main.md                          # 本文件 — Skill 定义
├── workflow-5S3DAnalysis.js         # 工作流编排脚本（~2020行）
├── prompts/                         # Agent 提示词模板
│   ├── trend.md                     # 看趋势
│   ├── competitor.md                # 看对手
│   ├── customer.md                  # 看客户
│   ├── self.md                      # 看自己
│   ├── opportunity.md               # 看机会
│   ├── synthesis.md                 # 交叉验证
│   ├── goal.md                      # 定目标
│   ├── strategy.md                  # 定策略
│   └── plan.md                      # 定计划
└── templates/                       # 报告模板
    ├── report-template.md           # MD 模板
    └── report-style.css             # HTML 样式

项目根目录:
├── company_capability_baseline.md   # 看自己默认能力基线（匿名化）
└── docs/5s3d-reports/              # 输出报告目录
```

## Changelog

### v1.0 (2026-07-30) — First Official Release
- 五看三定全流程：5并行搜索 → 交叉验证 → 3递进决策
- v1.1 简洁执行摘要格式（指标表 + 机会快览 + 核心洞察）
- 双格式报告输出（MD + HTML，含 SVG 图表和可视化）
- 集成匿名化公司能力基线（`company_capability_baseline.md`）
- 9 个 Agent 提示词模板 + 10 个 JSON Schema
- 锚点链接导航、竞品卡片、里程碑时间线等可视化组件
