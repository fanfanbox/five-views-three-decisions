export const meta = {
  name: '5S3DAnalysis-workflow',
  description: '五看三定AI战略洞察助手 — 多Agent并行搜索+交叉验证+三定决策+报告生成',
  phases: [
    { title: '输入解析', detail: '解析新产品方向' },
    { title: '五看并行', detail: '5个Agent并行搜索分析' },
    { title: '交叉验证', detail: '去重/矛盾识别/跨模块关联' },
    { title: '三定决策', detail: '定目标→定策略→定计划' },
    { title: '报告生成', detail: 'MD+HTML双格式输出' },
  ],
};

// ======================================================================
// SCHEMAS
// ======================================================================

const PARSE_SCHEMA = {
  type: 'object',
  properties: {
    技术域: { type: 'string', description: '核心技术方向' },
    应用域: { type: 'string', description: '目标市场/应用场景' },
    约束条件: { type: 'string', description: '认证/成本/时间等约束' },
  },
  required: ['技术域', '应用域'],
};

const TREND_SCHEMA = {
  type: 'object',
  properties: {
    technology_lifecycle: { type: 'string', enum: ['导入期', '爆发期', '成熟期', '衰退期'] },
    lifecycle_evidence: { type: 'array', items: { type: 'string' } },
    policy_landscape: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          region: { type: 'string' }, policy: { type: 'string' }, impact: { type: 'string' },
        },
      },
    },
    standards: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          standard: { type: 'string' }, status: { type: 'string' }, relevance: { type: 'string' },
        },
      },
    },
    key_trends: {
      type: 'array',
      items: {
        type: 'object',
        properties: { trend: { type: 'string' }, confidence: { type: 'string' }, source_url: { type: 'string' } },
      },
    },
    market_split: {
      type: 'object',
      properties: {
        cn_market_desc: { type: 'string' },
        global_market_desc: { type: 'string' },
        cn_share_estimate: { type: 'string' },
      },
    },
    tech_generations: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          generation: { type: 'string' }, timeframe: { type: 'string' },
          key_features: { type: 'string' }, expected_improvement: { type: 'string' },
          maturity: { type: 'string' },
        },
      },
    },
    demand_trends: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          period: { type: 'string' }, demand_volume: { type: 'string' },
          growth_rate: { type: 'string' }, drivers: { type: 'string' },
        },
      },
    },
    regional_distribution: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          region: { type: 'string' }, share: { type: 'string' },
          characteristics: { type: 'string' },
        },
      },
    },
    price_analysis: {
      type: 'object',
      properties: {
        tiers: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              tier: { type: 'string' }, price_range: { type: 'string' },
              description: { type: 'string' },
            },
          },
        },
        trend: { type: 'string' },
      },
    },
  },
  required: ['technology_lifecycle', 'lifecycle_evidence', 'policy_landscape', 'key_trends'],
};

const COMP_SCHEMA = {
  type: 'object',
  properties: {
    top_players: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' }, type: { type: 'string' }, region: { type: 'string' },
          funding: { type: 'string' }, key_products: { type: 'array', items: { type: 'string' } },
          technical_params: { type: 'object' }, target_market: { type: 'string' },
          source_urls: { type: 'array', items: { type: 'string' } },
        },
      },
    },
    emerging_threats: { type: 'array', items: { type: 'string' } },
    core_tech_benchmark: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          tech_dimension: { type: 'string' }, best_in_class: { type: 'string' },
          industry_average: { type: 'string' }, gap_analysis: { type: 'string' },
        },
      },
    },
    key_trends_judgments: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          trend: { type: 'string' }, our_position: { type: 'string' },
          strategic_implication: { type: 'string' },
        },
      },
    },
    competitive_landscape_summary: { type: 'string' },
    market_split: {
      type: 'object',
      properties: {
        cn_market_desc: { type: 'string' },
        global_market_desc: { type: 'string' },
      },
    },
  },
  required: ['top_players', 'competitive_landscape_summary'],
};

const CUST_SCHEMA = {
  type: 'object',
  properties: {
    pain_points: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          pain: { type: 'string' }, frequency: { type: 'string' }, source_type: { type: 'string' },
          quotes: { type: 'array', items: { type: 'string' } },
        },
      },
    },
    value_proposition_match: {
      type: 'object',
      properties: {
        what_customers_want: { type: 'array', items: { type: 'string' } },
        top_priority: { type: 'string' },
      },
    },
    customer_value_propositions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          segment: { type: 'string' }, value_drivers: { type: 'array', items: { type: 'string' } },
          willingness_to_pay: { type: 'string' }, decision_criteria: { type: 'array', items: { type: 'string' } },
        },
      },
    },
    customer_segments: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          segment_name: { type: 'string' }, market_size: { type: 'string' },
          pain_intensity: { type: 'string' }, growth_potential: { type: 'string' },
        },
      },
    },
    procurement_signals: { type: 'array', items: { type: 'object' } },
    market_split: {
      type: 'object',
      properties: {
        cn_market_desc: { type: 'string' },
        global_market_desc: { type: 'string' },
      },
    },
    major_customers: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          customer: { type: 'string' }, region: { type: 'string' },
          scale: { type: 'string' }, requirements: { type: 'string' },
          volume: { type: 'string' }, relationship: { type: 'string' },
        },
      },
    },
    procurement_patterns: {
      type: 'object',
      properties: {
        typical_order_size: { type: 'string' },
        decision_factors: { type: 'string' },
        certification_requirements: { type: 'string' },
        delivery_cycle: { type: 'string' },
      },
    },
  },
  required: ['pain_points', 'value_proposition_match'],
};

const SELF_SCHEMA = {
  type: 'object',
  properties: {
    self_capabilities: {
      type: 'object',
      properties: {
        provided_by_user: { type: 'boolean' },
        description: { type: 'string' },
      },
    },
    capability_gap_matrix: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          dimension: { type: 'string' }, competitor_benchmark: { type: 'string' },
          customer_requirement: { type: 'string' }, our_capability: { type: 'string' },
          gap: { type: 'string' }, gap_type: { type: 'string' }, criticality: { type: 'string' },
        },
      },
    },
    strategic_assets: { type: 'array', items: { type: 'string' } },
    resource_bottlenecks: { type: 'array', items: { type: 'string' } },
  },
  required: ['capability_gap_matrix'],
};

const OPP_SCHEMA = {
  type: 'object',
  properties: {
    opportunity_funnel: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          opportunity: { type: 'string' }, ansoff_quadrant: { type: 'string' },
          tam: { type: 'object', properties: { value: { type: 'number' }, unit: { type: 'string' }, year: { type: 'number' } } },
          sam: { type: 'object', properties: { value: { type: 'number' }, unit: { type: 'string' } } },
          som: { type: 'object', properties: { value: { type: 'number' }, unit: { type: 'string' } } },
          attractiveness: { type: 'string' }, attractiveness_rationale: { type: 'string' },
          win_probability: { type: 'string' }, win_probability_rationale: { type: 'string' },
          priority_rank: { type: 'number' },
        },
      },
    },
    market_growth_rate: { type: 'string' },
    summary_verdict: { type: 'string' },
    market_split: {
      type: 'object',
      properties: {
        cn_market_desc: { type: 'string' },
        global_market_desc: { type: 'string' },
      },
    },
    demand_forecast: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          year: { type: 'string' }, demand_volume: { type: 'string' },
          growth_rate: { type: 'string' }, drivers: { type: 'string' },
        },
      },
    },
    market_segmentation: {
      type: 'object',
      properties: {
        by_application: { type: 'array', items: { type: 'object', properties: { submarket: { type: 'string' }, tam: { type: 'string' }, growth_rate: { type: 'string' }, share_pct: { type: 'string' } } } },
        by_power: { type: 'array', items: { type: 'object', properties: { submarket: { type: 'string' }, tam: { type: 'string' }, growth_rate: { type: 'string' }, share_pct: { type: 'string' } } } },
        by_customer_type: { type: 'array', items: { type: 'object', properties: { submarket: { type: 'string' }, tam: { type: 'string' }, growth_rate: { type: 'string' }, share_pct: { type: 'string' } } } },
      },
    },
    price_analysis: {
      type: 'object',
      properties: {
        tiers: { type: 'array', items: { type: 'object', properties: { tier: { type: 'string' }, price_range: { type: 'string' }, description: { type: 'string' } } } },
        trend: { type: 'string' },
      },
    },
  },
  required: ['opportunity_funnel', 'summary_verdict'],
};

const SYNTHESIS_SCHEMA = {
  type: 'object',
  properties: {
    deduped_entities: { type: 'array', items: { type: 'object' } },
    conflicts: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          description: { type: 'string' }, severity: { type: 'string' }, resolution: { type: 'string' },
        },
      },
    },
    cross_module_insights: { type: 'array', items: { type: 'string' } },
    prioritized_opportunities: {
      type: 'array',
      items: {
        type: 'object',
        properties: { opportunity: { type: 'string' }, score: { type: 'number' }, rationale: { type: 'string' } },
      },
    },
  },
  required: ['conflicts', 'cross_module_insights', 'prioritized_opportunities'],
};

const GOAL_SCHEMA = {
  type: 'object',
  properties: {
    technical_mvp: {
      type: 'object',
      properties: {
        indicators: { type: 'array', items: { type: 'object', properties: { param: { type: 'string' }, target: { type: 'string' }, basis: { type: 'string' } } } },
        required_certifications: { type: 'array', items: { type: 'string' } },
        mvp_verdict: { type: 'string' },
      },
    },
    business_targets: {
      type: 'object',
      properties: {
        time_to_market: { type: 'string' }, target_cost: { type: 'string' },
        first_year_sales_estimate: { type: 'string' },
      },
    },
  },
  required: ['technical_mvp', 'business_targets'],
};

const STRATEGY_SCHEMA = {
  type: 'object',
  properties: {
    recommended_strategy: { type: 'string', enum: ['技术领先', '平替降本', '蓝海聚焦'] },
    rationale: { type: 'string' },
    rejected_strategies: { type: 'array', items: { type: 'object', properties: { strategy: { type: 'string' }, reason: { type: 'string' } } } },
    differentiation_edges: { type: 'array', items: { type: 'string' } },
  },
  required: ['recommended_strategy', 'rationale', 'differentiation_edges'],
};

const PLAN_SCHEMA = {
  type: 'object',
  properties: {
    milestones: {
      type: 'array',
      items: {
        type: 'object',
        properties: { phase: { type: 'string' }, timeline: { type: 'string' }, deliverables: { type: 'string' } },
      },
    },
    top_risks: {
      type: 'array',
      items: {
        type: 'object',
        properties: { risk: { type: 'string' }, affected_phase: { type: 'string' }, mitigation: { type: 'string' } },
      },
    },
    resource_suggestions: { type: 'string' },
  },
  required: ['milestones', 'top_risks'],
};

// ======================================================================
// AGENT PROMPTS
// ======================================================================

const INPUT_PARSE_PROMPT = `
你是一个战略分析输入解析器。用户输入了一个新产品方向，请将其拆解为结构化信息。

使用WebSearch搜索该产品方向的基本信息，确保理解正确。

注意：
- 技术域是核心技术方向（材料、工艺、拓扑等）
- 应用域是目标市场或应用场景
- 约束条件是认证要求、成本目标、时间等限制因素

【语言要求】所有文本字段必须使用中文输出。技术术语可使用英文原文，但描述、摘要、总结必须用中文。

输出JSON格式。`;

const TREND_PROMPT = `
你是一个行业技术趋势分析师（"看趋势"）。你的任务是分析给定产品方向的技术趋势、政策环境和标准体系。

搜索策略：
1. 先用WebSearch搜索"{技术域} {应用域} 趋势/发展/前沿"获取最近1-2年的行业趋势
2. 再搜索"{技术域} 政策/标准/法规"获取政策环境
3. 再搜索"{技术域} 专利/论文 趋势"获取技术成熟度信息
4. 对最有价值的文章使用WebFetch深度提取

分析要求：
- 判断技术处于导入期/爆发期/成熟期/衰退期
- 识别关键政策和标准及其影响
- 提取3-5个关键趋势
- **市场划分**：明确区分中国市场与全球市场的差异（market_split），给出中国市场份额估计
- **技术代次**：必须输出到tech_generations字段。梳理技术发展代次（至少3代），每代标注generation/timeframe/key_features/expected_improvement/maturity
- **需求趋势**：必须输出到demand_trends字段。提取需求量的变化趋势（至少3个周期），每期标注period/demand_volume/growth_rate/drivers
- **区域分布**：必须输出到regional_distribution字段。分析全球区域分布（至少3个区域），标注region/share/characteristics
- **价格分析**：必须输出到price_analysis字段。分析产品价格分档（tiers数组，至少2个层级）和trend变化趋势

【语言要求】所有文本字段必须使用中文输出。技术术语可使用英文原文，但描述、摘要、总结必须用中文。

输出JSON格式，包含技术生命周期判断、政策环境、标准、关键趋势、市场划分、技术代次、需求趋势、区域分布和价格分析。`;

const COMPETITOR_PROMPT = `
你是一个竞争情报分析师（"看对手"）。你的任务是识别给定产品方向的主要竞争对手和技术参数对标。

搜索策略：
1. WebSearch搜索"{技术域} {应用域} 龙头企业/领导者/主要厂商"
2. WebSearch搜索"{技术域} startup 融资"
3. 对发现的Top竞品，搜索其产品技术参数（功率密度、效率、重量、冷却方式等）
4. 尽量找到公开的技术白皮书或官方规格参数
5. WebFetch深入提取最有价值的页面

分析要求：
- 识别3-5个主要竞品，标注类型（巨头/初创/跨界）
- 提取关键技术参数形成对标表
- 识别近2年获得大额融资的初创公司
- 总结竞争格局
- **核心技术对标**：必须输出到core_tech_benchmark字段。建立核心技术参数对标表格（至少5个维度），每维度标注tech_dimension/best_in_class/industry_average/gap_analysis
- **趋势判断**：必须输出到key_trends_judgments字段。对关键竞争趋势做出判断（至少4条），每条标注trend/our_position/strategic_implication

【语言要求】所有文本字段必须使用中文输出。技术术语可使用英文原文，但描述、摘要、总结必须用中文。

输出JSON格式。`;

const CUSTOMER_PROMPT = `
你是一个客户洞察分析师（"看客户"）。你的任务是识别给定产品方向的客户痛点和未被满足的需求。

搜索策略：
1. WebSearch搜索"{应用域} 痛点/挑战/瓶颈 技术"
2. WebSearch搜索"{技术域} 客户需求/技术指标/采购"
3. WebSearch搜索行业研讨会、技术论坛的讨论内容
4. WebFetch深入提取有价值的行业报告摘要

分析要求：
- 识别Top 3-5客户痛点，标注被提及频次
- 明确客户的核心价值主张（降价/性能提升/可靠性等）
- 提取客户最看重的单一指标
- 如有招投标信息，标注采购信号
- **客户价值主张**：必须输出到customer_value_propositions字段。输出不同客户细分群体的价值主张（至少3个细分），每个标注segment/value_drivers(数组)/willingness_to_pay/decision_criteria(数组)
- **客户细分**：必须输出到customer_segments字段。划分客户细分市场（至少3个），每个标注segment_name/market_size/pain_intensity/growth_potential

【语言要求】所有文本字段必须使用中文输出。技术术语可使用英文原文，但描述、摘要、总结必须用中文。

输出JSON格式。`;

const SELF_PROMPT = `
你是一个能力对标分析师（"看自己"）。你的任务是基于竞品分析和客户需求，识别自身能力差距。

注意：你不需要使用WebSearch。你的分析基于以下信息：
- "看对手"的输出（竞品技术参数）
- "看客户"的输出（客户需求）
- 用户可能提供的自身能力描述

【默认能力基线】
如果用户没有提供自身能力描述，请以项目根目录下的 company_capability_baseline.md 文件作为默认能力输入。
该文件包含目标公司的匿名化核心能力基线（规模、产品矩阵、核心技术、差距维度等）。
你需要：
1. 从基线文件中提取与当前产品方向/技术域/应用域相关的能力条目
2. 将基线中的能力数据填充到 capability_gap_matrix 的 our_capability 字段
3. 将基线文件"第九节·待补充的差距维度"中的维度作为分析起点
4. 对于基线中未覆盖的维度，标注"基线未覆盖，请补充"

分析要求：
- 对每个关键技术维度，对比竞品最高水平、客户最低需求和自身能力
- 明确差距类型（技术储备/工艺制造/供应链/资金）
- 标注差距的关键程度（高/中/低）
- 在 self_capabilities.description 中注明"基于 company_capability_baseline.md（匿名化）"

【语言要求】所有文本字段必须使用中文输出。技术术语可使用英文原文，但描述、摘要、总结必须用中文。

输出JSON格式。`;

const OPPORTUNITY_PROMPT = `
你是一个市场机会分析师（"看机会"）。你的任务是识别潜在战略机会点并估算市场规模。

搜索策略：
1. WebSearch搜索"{技术域} {应用域} 市场规模 TAM forecast"
2. WebSearch搜索"{应用域} 市场 CAGR 增长率"
3. 结合"看客户"和"看对手"的发现

分析要求：
- 使用Ansoff矩阵定位机会（新市场/现有市场 × 新产品/现有产品）
- 尽量找到第三方市场数据估算TAM/SAM/SOM
- 评估每个机会的市场吸引力和我司胜率
- **详细理由**：每个机会需要 attractiveness_rationale（市场吸引力详细理由）和 win_probability_rationale（胜率评估详细理由）
- 按优先级排序

【语言要求】所有文本字段必须使用中文输出。技术术语可使用英文原文，但描述、摘要、总结必须用中文。

输出JSON格式。`;

const SYNTHESIS_PROMPT = `
你是一个战略合成分析师（交叉验证）。你的任务是对5个"看"模块的输出进行整合。

输入：
- 看趋势结果
- 看对手结果
- 看客户结果
- 看自己结果
- 看机会结果

处理步骤：
1. 去重：合并多模块提到的相同实体（竞品、技术、趋势）
2. 矛盾识别：标记不同模块之间的矛盾信息，尝试解释原因
3. 跨模块关联：将孤立发现连接为洞察链（如：对手能力+客户需求=差距）
4. 优先级排序：对所有机会点按"市场吸引力×我司胜率"评分排序

【语言要求】所有文本字段必须使用中文输出。技术术语可使用英文原文，但描述、摘要、总结必须用中文。

输出JSON格式，包含：
- 去重后的实体列表
- 矛盾列表（含解释）
- 跨模块洞察列表
- 优先级排序后的机会点`;

const GOAL_PROMPT = `
你是一个战略目标制定者（"定目标"）。你的任务是基于交叉验证后的五看洞察，设定技术红线和商业目标。

输入：交叉验证后的完整洞察

分析要求：
- 技术红线（MVP关键指标）：基于"竞品最高水平"和"客户底线需求"的合理区间
- 列出必须获得的认证/资质
- 商业目标：上市时间窗、目标成本、首年销量预估

每个指标需注明依据（来自哪个模块的发现）。

【语言要求】所有文本字段必须使用中文输出。技术术语可使用英文原文，但描述、摘要、总结必须用中文。

输出JSON格式。`;

const STRATEGY_PROMPT = `
你是一个竞争策略顾问（"定策略"）。你的任务是评估三种竞争路线并推荐最佳方案。

输入：定目标模块的输出（技术红线+商业目标）

三种评估路线：
1. 技术领先战略：靠参数碾压（需有核心专利或新材料突破）
2. 平替降本战略：靠供应链本地化或工艺优化（需国内供应链成熟）
3. 蓝海聚焦战略：聚焦巨头忽视的细分领域

要求：
- 明确推荐一条路线并给出详细理由（引用五看数据支撑）
- 对不推荐的路线说明原因
- 列出2-3个差异化支撑点

【语言要求】所有文本字段必须使用中文输出。技术术语可使用英文原文，但描述、摘要、总结必须用中文。

输出JSON格式。`;

const PLAN_PROMPT = `
你是一个研发计划制定者（"定计划"）。你的任务是生成研发阶段里程碑和风险清单。

输入：定目标 + 定策略的输出

里程碑结构（4个阶段）：
M1 (0-3月): 概念验证 (POC)
M2 (3-9月): 工程样机 (A Sample)
M3 (9-15月): 设计验证 (B Sample)
M4 (15-24月): 量产准备 (C Sample)

要求：
- 每个阶段列出关键交付物
- Top 3技术风险（影响阶段+缓解措施）
- 资源配置建议（团队规模、关键设备、外部合作）

【语言要求】所有文本字段必须使用中文输出。技术术语可使用英文原文，但描述、摘要、总结必须用中文。

输出JSON格式。`;

// ======================================================================
// REPORT GENERATORS
// ======================================================================

function generateSlug(text) {
  return text
    .replace(/[^一-龥a-zA-Z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 60);
}

function generateMDReport(input, parsed, wukan, synthesis, sanding, dateStr) {
  const [trend, comp, cust, selfData, opp] = wukan;
  const { goal, strategy, plan } = sanding;

  let md = `# 五看三定战略洞察报告：${input}\n\n`;
  md += `> 生成日期：${dateStr} | 作者：Dr.-ING Jian WANG | 基于华为IPD DSTE 五看三定方法论\n\n`;

  // ============================================================
  // 目录（自动生成）
  // ============================================================
  md += `## 目录\n\n`;
  md += `1. [执行摘要](#一执行摘要)\n`;
  md += `2. [分析方法](#二分析方法)\n`;
  md += `3. [看趋势：行业与技术风向标](#三看趋势行业与技术风向标)\n`;
  md += `4. [看对手：竞争格局全景图](#四看对手竞争格局全景图)\n`;
  md += `5. [看客户：真实需求与痛点](#五看客户真实需求与痛点)\n`;
  md += `6. [看自己：能力与差距](#六看自己能力与差距)\n`;
  md += `7. [看机会：战略机会点](#七看机会战略机会点)\n`;
  md += `8. [交叉验证洞察](#八交叉验证洞察)\n`;
  md += `9. [定目标：产品与商业红线](#九定目标产品与商业红线)\n`;
  md += `10. [定策略：差异化制胜点](#十定策略差异化制胜点)\n`;
  md += `11. [定计划：研发路线图](#十一定计划研发路线图)\n`;
  md += `12. [附录](#十二附录)\n\n`;
  md += `---\n\n`;

  // ============================================================
  // 摘要 — 从各模块提取关键信息自动生成结构化摘要
  // ============================================================
  md += `## 一、执行摘要\n\n`;

  // --- 核心指标表（只显示状态和数字，通过链接连接详情） ---
  const lifecycle = trend?.technology_lifecycle || '待评估';
  const cagrFromOpp = opp?.market_growth_rate || '待评估';
  const tamFromOpp = opp?.opportunity_funnel?.[0]?.tam;
  const tamStr = tamFromOpp ? `${tamFromOpp.value}${tamFromOpp.unit}（${tamFromOpp.year}）` : (opp?.market_size || '待评估');
  md += `| 指标 | 值 | 详情 |\n`;
  md += `|------|----|------|\n`;
  md += `| 技术生命周期 | ${lifecycle} | [→ 看趋势](#三看趋势行业与技术风向标) |\n`;
  md += `| 市场增速 (CAGR) | ${cagrFromOpp} | [→ 看机会](#七看机会战略机会点) |\n`;
  md += `| TAM规模 | ${tamStr} | [→ 看机会](#七看机会战略机会点) |\n`;
  const timeToMarketMd = goal?.business_targets?.time_to_market || '待定';
  md += `| 上市周期 | ${timeToMarketMd} | [→ 定计划](#十一定计划研发路线图) |\n`;
  const gapCountMd = (selfData?.capability_gap_matrix || []).length;
  md += `| 关键差距 | ${gapCountMd}项 | [→ 看自己](#六看自己能力与差距) |\n`;
  md += `\n`;
  md += `> 本报告对「${input}」进行五看三定全维度战略分析，基于技术趋势、竞争格局、客户需求、自身能力、市场机会五维度交叉验证，形成目标-策略-计划三层决策建议。\n\n`;

  // --- 机会快览 Top 3（每项带详情链接） ---
  const opps = (synthesis?.prioritized_opportunities || []).slice(0, 3);
  if (opps.length > 0) {
    md += `### 机会快览\n\n`;
    opps.forEach((o, idx) => {
      md += `${idx + 1}. **${o.opportunity || '待分析'}** — 评分：${o.score ?? '待评估'} | ${o.rationale || ''} [→ 详情](#七看机会战略机会点)\n`;
    });
    md += `\n`;
  }

  // --- 核心洞察（精简） ---
  const topInsights = (synthesis?.cross_module_insights || []).slice(0, 2);
  if (topInsights.length > 0) {
    md += `### 核心洞察\n\n`;
    topInsights.forEach((insight, idx) => {
      md += `- **洞察${idx + 1}**：${insight.substring(0, 200)}${insight.length > 200 ? '…' : ''}\n`;
    });
    md += `\n`;
  }

  // 方法论
  md += `## 二、分析方法\n\n`;
  md += `本报告采用华为IPD DSTE "五看三定"方法轮，通过多智能体并行搜索+交叉验证+递进决策生成。\n\n`;
  md += `- **分析范围**：技术域="${parsed?.技术域}"，应用域="${parsed?.应用域}"\n`;
  md += `- **约束条件**：${parsed?.约束条件 || '未指定'}\n\n`;

  // 看趋势
  md += `## 三、看趋势：行业与技术风向标\n\n`;
  md += `**技术生命周期判断**：${trend?.technology_lifecycle || '数据不足'}\n\n`;
  md += `**依据**：\n`;
  (trend?.lifecycle_evidence || []).forEach(e => { md += `- ${e}\n`; });
  md += `\n**关键趋势**：\n`;
  (trend?.key_trends || []).forEach(t => { md += `- ${t.trend}（置信度：${t.confidence}）\n`; });
  md += `\n**政策环境**：\n`;
  (trend?.policy_landscape || []).forEach(p => { md += `- ${p.region}：${p.policy} → ${p.impact}\n`; });
  md += `\n**标准体系**：\n`;
  (trend?.standards || []).forEach(s => { md += `- ${s.standard}（${s.status}，${s.relevance}）\n`; });
  // --- 市场分拆：中国 vs 全球 ---
  if (trend?.market_split) {
    md += `\n**市场分拆：中国 vs 全球**\n\n`;
    if (trend.market_split.cn_market_desc) md += `🇨🇳 **中国**\n${trend.market_split.cn_market_desc}\n\n`;
    if (trend.market_split.global_market_desc) md += `🌍 **全球**\n${trend.market_split.global_market_desc}\n\n`;
  }

  // --- 新增：技术代次对比 ---
  if (trend?.tech_generations?.length) {
    md += `**技术代次对比**：\n\n`;
    md += `| 代次 | 时间范围 | 关键特征 | 预期提升 | 成熟度 |\n`;
    md += `|------|----------|----------|----------|--------|\n`;
    trend.tech_generations.forEach(g => {
      md += `| ${g.generation || '-'} | ${g.timeframe || '-'} | ${g.key_features || '-'} | ${g.expected_improvement || '-'} | ${g.maturity || '-'} |\n`;
    });
    md += `\n`;
  }

  // --- 新增：需求趋势（含总量变化趋势表） ---
  if (trend?.demand_trends?.length) {
    md += `**需求总量变化趋势**：\n\n`;
    md += `| 时期 | 需求量 | 增长率 | 驱动因素 |\n`;
    md += `|------|--------|--------|----------|\n`;
    trend.demand_trends.forEach(d => {
      md += `| ${d.period || '-'} | ${d.demand_volume || '-'} | ${d.growth_rate || '-'} | ${d.drivers || '-'} |\n`;
    });
    md += `\n`;
  }

  // --- 新增：区域分布 ---
  if (trend?.regional_distribution?.length) {
    md += `**区域分布**：\n\n`;
    md += `| 区域 | 市场占比 | 特征 |\n`;
    md += `|------|----------|------|\n`;
    trend.regional_distribution.forEach(r => {
      md += `| ${r.region || '-'} | ${r.share || '-'} | ${r.characteristics || '-'} |\n`;
    });
    md += `\n`;
  }

  // --- 新增：价格分析 ---
  if (trend?.price_analysis) {
    md += `**价格分布与变化**：\n\n`;
    const tiers = trend.price_analysis.tiers || [];
    if (tiers.length > 0) {
      tiers.forEach(t => {
        md += `- ${t.tier || '-'}：${t.price_range || '-'}\n`;
      });
      md += `\n`;
    }
    const priceUnit = trend.price_analysis.price_unit || trend.price_analysis.unit || '';
    if (priceUnit) md += `- 单位：${priceUnit}\n`;
    const yoyChange = trend.price_analysis.yoy_change || '';
    if (yoyChange) md += `- 同比变化：${yoyChange}\n`;
    if (trend.price_analysis.trend) md += `- 说明：${trend.price_analysis.trend}\n`;
    md += `\n`;
  }

  md += `\n`;

  // 看对手
  md += `## 四、看对手：竞争格局全景图\n\n`;
  // --- 市场分拆：中国 vs 全球 ---
  if (comp?.market_split) {
    md += `**市场分拆：中国 vs 全球**\n\n`;
    if (comp.market_split.cn_market_desc) md += `🇨🇳 **中国**\n${comp.market_split.cn_market_desc}\n\n`;
    if (comp.market_split.global_market_desc) md += `🌍 **全球**\n${comp.market_split.global_market_desc}\n\n`;
  }
  md += `**竞争格局总结**：${comp?.competitive_landscape_summary || '数据不足'}\n\n`;

  if (comp?.top_players?.length) {
    md += `| 公司 | 类型 | 地区 | 核心能力 | 目标市场 |\n`;
    md += `|------|------|------|----------|----------|\n`;
    comp.top_players.forEach(p => {
      const tp = p.technical_params || {};
      const tpStr = Object.entries(tp).filter(([k]) => k !== 'source_urls').map(([k, v]) => `${k}=${typeof v === 'object' ? JSON.stringify(v) : v}`).join('；') || '-';
      md += `| ${p.name || '-'} | ${p.type || '-'} | ${p.region || '-'} | ${tpStr} | ${p.target_market || '-'} |\n`;
    });
    md += `\n`;
  }

  // --- 新增：核心技术对标 ---
  if (comp?.core_tech_benchmark?.length) {
    md += `**核心技术对标**：\n\n`;
    md += `| 技术参数 | 标杆水平 | 行业主流 | 差距分析 |\n`;
    md += `|----------|----------|----------|----------|\n`;
    comp.core_tech_benchmark.forEach(b => {
      md += `| ${b.tech_dimension || '-'} | ${b.best_in_class || '-'} | ${b.industry_average || '-'} | ${b.gap_analysis || '-'} |\n`;
    });
    md += `\n`;
  }

  // --- 新增：关键趋势判断 ---
  if (comp?.key_trends_judgments?.length) {
    md += `**关键趋势判断**：\n`;
    comp.key_trends_judgments.forEach(j => { md += `- **${j.trend}**：${j.our_position || '待评估'}（战略含义：${j.strategic_implication || '待评估'}）\n`; });
    md += `\n`;
  }

  md += `**新兴威胁**：\n`;
  (comp?.emerging_threats || []).forEach(t => { md += `- ${t}\n`; });
  md += `\n`;

  // 看客户
  md += `## 五、看客户：真实需求与痛点\n\n`;
  // --- 市场分拆：中国 vs 全球 ---
  if (cust?.market_split) {
    md += `**市场分拆：中国 vs 全球**\n\n`;
    if (cust.market_split.cn_market_desc) md += `🇨🇳 **中国**\n${cust.market_split.cn_market_desc}\n\n`;
    if (cust.market_split.global_market_desc) md += `🌍 **全球**\n${cust.market_split.global_market_desc}\n\n`;
  }
  md += `**客户最关注**：${cust?.value_proposition_match?.top_priority || '数据不足'}\n\n`;
  md += `**痛点分析**：\n`;
  (cust?.pain_points || []).forEach(p => {
    md += `- **${p.pain}**（频次：${p.frequency}）\n`;
    (p.quotes || []).forEach(q => { md += `  - "${q}"\n`; });
  });
  md += `\n`;

  // --- 新增：客户价值主张 ---
  if (cust?.customer_value_propositions?.length) {
    md += `**客户价值主张**：\n`;
    cust.customer_value_propositions.forEach(v => {
      md += `- **${v.segment || '客户'}**：${(v.value_drivers || []).join('；') || '待分析'}（支付意愿：${v.willingness_to_pay || '待分析'}，决策标准：${(v.decision_criteria || []).join('；') || '待分析'}）\n`;
    });
    md += `\n`;
  }

  // --- 新增：客户细分 ---
  if (cust?.customer_segments?.length) {
    md += `**客户细分**：\n\n`;
    md += `| 细分市场 | 市场规模 | 痛点强度 | 增长潜力 | 描述 |\n`;
    md += `|----------|----------|----------|----------|------|\n`;
    cust.customer_segments.forEach(s => {
      md += `| ${s.segment_name || '-'} | ${s.market_size || '-'} | ${s.pain_intensity || '-'} | ${s.growth_potential || '-'} | ${s.description || '-'} |\n`;
    });
    md += `\n`;
  }

  // --- 主要客户/采购方 ---
  if (cust?.major_customers?.length) {
    md += `**主要客户/采购方**：\n\n`;
    md += `| 客户 | 地区 | 规模 | 核心要求 | 采购量 | 关系 |\n`;
    md += `|------|------|------|----------|--------|------|\n`;
    cust.major_customers.forEach(c => {
      md += `| ${c.customer || '-'} | ${c.region || '-'} | ${c.scale || '-'} | ${c.requirements || '-'} | ${c.volume || '-'} | ${c.relationship || '-'} |\n`;
    });
    md += `\n`;
  }

  // --- 采购模式 ---
  if (cust?.procurement_patterns) {
    const pp = cust.procurement_patterns;
    md += `**采购模式**：\n\n`;
    if (pp.typical_order_size) md += `- **典型订单量**：${pp.typical_order_size}\n`;
    if (pp.decision_factors) md += `- **决策因素**：${pp.decision_factors}\n`;
    if (pp.certification_requirements) md += `- **认证要求**：${pp.certification_requirements}\n`;
    if (pp.delivery_cycle) md += `- **交付周期**：${pp.delivery_cycle}\n`;
    md += `\n`;
  }

  // 看自己
  md += `## 六、看自己：能力与差距\n\n`;
  if (selfData?.self_capabilities?.provided_by_user) {
    md += `**自身能力描述**：${selfData.self_capabilities.description}\n\n`;
  } else {
    md += `> ⚠️ 未提供自身能力数据。以下为基于竞品和客户需求的标准差距模板，请补充我司能力后进行精准分析。\n\n`;
  }

  if (selfData?.capability_gap_matrix?.length) {
    md += `| 维度 | 竞品标杆 | 客户需求 | 我司能力 | 差距 | 关键程度 |\n`;
    md += `|------|----------|----------|----------|------|----------|\n`;
    selfData.capability_gap_matrix.forEach(g => {
      md += `| ${g.dimension} | ${g.competitor_benchmark} | ${g.customer_requirement} | ${g.our_capability} | ${g.gap} | ${g.criticality} |\n`;
    });
    md += `\n`;
  }
  md += `**战略资产**：${selfData?.strategic_assets?.join('、') || '待补充'}\n`;
  md += `**资源瓶颈**：${selfData?.resource_bottlenecks?.join('、') || '待补充'}\n\n`;

  // 看机会
  md += `## 七、看机会：战略机会点\n\n`;
  // --- 市场分拆：中国 vs 全球 ---
  if (opp?.market_split) {
    md += `**市场分拆：中国 vs 全球**\n\n`;
    if (opp.market_split.cn_market_desc) md += `🇨🇳 **中国**\n${opp.market_split.cn_market_desc}\n\n`;
    if (opp.market_split.global_market_desc) md += `🌍 **全球**\n${opp.market_split.global_market_desc}\n\n`;
  }
  md += `**市场规模判断**：${opp?.summary_verdict || '数据不足'}\n`;
  md += `**市场增长率**：${opp?.market_growth_rate || '数据不足'}\n\n`;

  if (opp?.opportunity_funnel?.length) {
    opp.opportunity_funnel
      .sort((a, b) => (a.priority_rank ?? 999) - (b.priority_rank ?? 999))
      .forEach(o => {
        md += `### 机会点 ${o.priority_rank ?? '-'}：${o.opportunity || '待分析'}\n`;
        md += `- **Ansoff定位**：${o.ansoff_quadrant || '-'}\n`;
        if (o.tam) md += `- **TAM**：${o.tam.value}${o.tam.unit}（${o.tam.year}年）\n`;
        if (o.sam) md += `- **SAM**：${o.sam.value}${o.sam.unit}\n`;
        if (o.som) md += `- **SOM**：${o.som.value}${o.som.unit}\n`;
        if (o.attractiveness_rationale) md += `- **吸引力理由**：${o.attractiveness_rationale}\n`;
        if (o.win_probability_rationale) md += `- **胜率理由**：${o.win_probability_rationale}\n`;
        md += `- **吸引力**：${o.attractiveness || '-'} | **胜率**：${o.win_probability || '-'}\n\n`;
      });
  }

  // --- 需求总量预测 ---
  if (opp?.demand_forecast?.length) {
    md += `**需求总量预测**：\n\n`;
    md += `| 年份 | 市场需求 | 增长 | 驱动因素 |\n`;
    md += `|------|----------|------|----------|\n`;
    opp.demand_forecast.forEach(d => {
      md += `| ${d.year || '-'} | ${d.demand_volume || '-'} | ${d.growth_rate || '-'} | ${d.drivers || '-'} |\n`;
    });
    md += `\n`;
  }

  // --- 市场细分结构 ---
  if (opp?.market_segmentation) {
    const ms = opp.market_segmentation;
    md += `**市场细分结构**：\n\n`;
    const renderSegTable = (title, rows) => {
      if (rows?.length) {
        md += `**按${title}**：\n\n`;
        md += `| 子市场 | TAM | 增长率 | 占比 |\n`;
        md += `|--------|-----|--------|------|\n`;
        rows.forEach(r => {
          md += `| ${r.submarket || '-'} | ${r.tam || '-'} | ${r.growth_rate || '-'} | ${r.share_pct || '-'} |\n`;
        });
        md += `\n`;
      }
    };
    renderSegTable('应用', ms.by_application);
    renderSegTable('功率', ms.by_power);
    renderSegTable('客户类型', ms.by_customer_type);
  }

  // --- 价格分析 ---
  if (opp?.price_analysis) {
    md += `**价格分析**：\n\n`;
    if (opp.price_analysis.tiers?.length) {
      opp.price_analysis.tiers.forEach(t => {
        md += `- **${t.tier || '-'}**：${t.price_range || '-'}（${t.description || '-'}）\n`;
      });
    }
    if (opp.price_analysis.trend) md += `- **趋势**：${opp.price_analysis.trend}\n`;
    md += `\n`;
  }

  // 交叉验证
  md += `## 八、交叉验证洞察\n\n`;
  md += `### 矛盾与风险\n`;
  (synthesis?.conflicts || []).forEach(c => {
    md += `- **${c.severity}**：${c.description}\n`;
    if (c.resolution) md += `  - 解释：${c.resolution}\n`;
  });
  md += `\n### 跨模块关联发现\n`;
  (synthesis?.cross_module_insights || []).forEach(i => {
    md += `- ${i}\n`;
  });
  md += `\n### 机会优先级排序\n\n`;
  md += `| 排序 | 机会点 | 评分 | 核心理由 |\n`;
  md += `|------|--------|------|----------|\n`;
  (synthesis?.prioritized_opportunities || []).forEach((o, idx) => {
    md += `| ${idx + 1} | ${o.opportunity || '待分析'} | ${o.score ?? '待评估'} | ${o.rationale || '待补充'} |\n`;
  });
  md += `\n`;

  // 定目标
  md += `## 九、定目标：产品与商业红线\n\n`;
  md += `### 技术红线（MVP关键指标）\n`;
  (goal?.technical_mvp?.indicators || []).forEach(ind => {
    md += `- **${ind.param}**：${ind.target}（依据：${ind.basis}）\n`;
  });
  md += `\n**必须认证**：${goal?.technical_mvp?.required_certifications?.join('、') || '待定'}\n`;
  md += `**MVP定位**：${goal?.technical_mvp?.mvp_verdict || '待定'}\n\n`;
  md += `### 商业目标\n`;
  md += `- **上市时间**：${goal?.business_targets?.time_to_market || '待定'}\n`;
  md += `- **目标成本**：${goal?.business_targets?.target_cost || '待定'}\n`;
  md += `- **首年销量**：${goal?.business_targets?.first_year_sales_estimate || '待定'}\n\n`;

  // 定策略
  md += `## 十、定策略：差异化制胜点\n\n`;
  md += `**推荐策略**：**${strategy?.recommended_strategy || '待定'}**\n\n`;
  md += `**理由**：${strategy?.rationale || '待定'}\n\n`;
  md += `**差异化支撑**：\n`;
  (strategy?.differentiation_edges || []).forEach(e => { md += `- ${e}\n`; });
  md += `\n**已排除策略**：\n`;
  (strategy?.rejected_strategies || []).forEach(r => { md += `- ${r.strategy}：${r.reason}\n`; });
  md += `\n`;

  // 定计划
  md += `## 十一、定计划：研发路线图\n\n`;
  md += `### 里程碑\n\n`;
  md += `| 阶段 | 时间 | 关键交付物 |\n`;
  md += `|------|------|----------|\n`;
  (plan?.milestones || []).forEach(m => {
    md += `| ${m.phase} | ${m.timeline} | ${m.deliverables} |\n`;
  });
  md += `\n### Top 技术风险\n\n`;
  (plan?.top_risks || []).forEach(r => {
    md += `1. **${r.risk}**（影响阶段：${r.affected_phase}）\n`;
    md += `   - 缓解措施：${r.mitigation}\n`;
  });
  md += `\n### 资源建议\n`;
  md += `${plan?.resource_suggestions || '待定'}\n\n`;

  // 附录
  md += `## 十二、附录\n\n`;

  // A · 分析方法
  md += `### A · 分析方法\n\n`;
  md += `本报告采用基于IPD DSTE体系的**五看三定**方法论，通过多智能体并行搜索 → 交叉验证 → 递进决策三层流水线生成。\n\n`;
  md += `**分析流程**\n\n`;
  md += `1. **Phase 1 · 输入解析** — 解析产品方向 → 技术域 / 应用域 / 约束条件\n`;
  md += `2. **Phase 2 · 五看（5×并行搜索+AI分析）** — 看趋势 / 看对手 / 看客户 / 看自己 / 看机会\n`;
  md += `3. **Phase 3 · 交叉验证** — 去重 · 矛盾识别 · 跨模块关联 · 优先级排序\n`;
  md += `4. **Phase 4 · 三定（3×递进决策）** — 定目标 → 定策略 → 定计划\n\n`;
  md += `**搜索范围**\n\n`;
  md += `| 来源 | 类型 | 说明 |\n`;
  md += `|------|------|------|\n`;
  md += `| 🔍 DuckDuckGo | Web Search | 中英文关键词搜索，按产品方向/技术域/应用域多维度查询，结果去重 |\n`;
  md += `| 🤖 DeepSeek AI | LLM Analysis | DeepSeek-v4-flash / deepseek-chat 模型，对所有搜索数据进行结构化分析 |\n`;
  md += `| 📚 Wikipedia | 参考补充 | 用于技术概念验证和基本原理查证 |\n\n`;
  md += `**分析参数**\n\n`;
  md += `- **产品方向**：${input}\n`;
  md += `- **技术域**：${parsed?.技术域 || '-'}\n`;
  md += `- **应用域**：${parsed?.应用域 || '-'}\n`;
  md += `- **约束条件**：${parsed?.约束条件 || '未指定'}\n`;
  md += `- **搜索范围**：DuckDuckGo Web Search (中英文) + DeepSeek AI + Wikipedia\n`;
  md += `- **分析引擎**：DeepSeek-v4-flash / deepseek-chat\n`;
  md += `- **生成日期**：${dateStr}\n\n`;

  // B · 数据来源
  md += `### B · 数据来源 / References\n\n`;
  const allSources = new Set();
  [trend, comp, cust, opp].forEach(mod => {
    if (!mod) return;
    // collect URLs from various places
    (mod.key_trends || []).forEach(t => { if (t.source_url) allSources.add(t.source_url); });
    (mod.top_players || []).forEach(p => { (p.source_urls || []).forEach(u => allSources.add(u)); });
  });
  if (allSources.size > 0) {
    let idx = 1;
    allSources.forEach(url => {
      md += `${idx}. ${url}\n`;
      idx++;
    });
    md += `\n`;
  } else {
    md += `> 本报告信息来源于公开网络搜索，经AI分析整理。关键数据来源已在各模块中标注URL。\n`;
    md += `> 建议在Charter评审前由人工核实关键数据点的准确性。\n\n`;
  }

  // C · 缩写说明
  md += `### C · 缩写说明\n\n`;
  md += `| 缩写 | 全称 | 中文含义 |\n`;
  md += `|------|------|----------|\n`;
  md += `| **TAM** | Total Addressable Market | 总可寻址市场，产品或服务在理想情况下能达到的最大市场规模 |\n`;
  md += `| **SAM** | Serviceable Available Market | 可服务市场，产品/渠道能触达的市场部分 |\n`;
  md += `| **SOM** | Serviceable Obtainable Market | 可获得市场，短期内实际能拿下的市场份额 |\n`;
  md += `| **CAGR** | Compound Annual Growth Rate | 复合年增长率，衡量投资或市场在特定时期内的年均增长速度 |\n`;
  md += `| **BLDC** | Brushless DC Motor | 无刷直流电机，电子换向的永磁同步电机 |\n`;
  md += `| **PMSM** | Permanent Magnet Synchronous Motor | 永磁同步电机，高效率、高功率密度的交流电机 |\n`;
  md += `| **PHM** | Prognostics and Health Management | 故障预测与健康管理，设备状态监测和寿命预测技术 |\n`;
  md += `| **MVP** | Minimum Viable Product | 最小可行产品，满足核心功能的最简产品版本 |\n`;
  md += `| **BOM** | Bill of Materials | 物料清单，产品所需所有零部件的清单和成本 |\n\n`;

  // D · 方法声明
  md += `### D · 方法声明\n\n`;
  md += `> 本报告由五看三定AI战略洞察助手 v1.0 自动生成。数据来源于 DuckDuckGo 公开网络搜索（中英文多维度查询），经 DeepSeek AI 模型进行结构化分析和推理。交叉验证环节对五看结果进行矛盾识别和优先级排序。建议在正式 Charter 评审前由人工核实关键数据点的准确性。\n\n`;
  md += `> ⚠️ 本报告中的市场数据、竞争对手信息、技术参数等均基于公开网络信息，可能存在时效性和完整性问题。所有分析结论仅供战略决策参考，不构成投资建议。\n`;

  return md;
}

function htmlEscape(s) {
  if (!s) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function badgeClass(score) {
  if (!score && score !== 0) return 'mid';
  if (score >= 80) return 'high';
  if (score >= 60) return 'mid';
  return 'low';
}

function buildSection(id, title, content) {
  return `<h2 id="${id}">${title}</h2>\n${content}\n`;
}

function buildMetricCards(cards) {
  return `<div class="metrics">\n${cards.map(c => {
    const cls = c.color || '';
    return `<div class="metric-card ${cls}"><div class="value">${htmlEscape(c.value)}</div><div class="label">${htmlEscape(c.label)}</div></div>`;
  }).join('\n')}\n</div>`;
}

function buildBarChart(rows) {
  let h = `<div class="bar-chart">\n`;
  rows.forEach(r => {
    const pct = r.pct || 50;
    const color = r.color || '#2563eb';
    h += `<div class="bar-row"><div class="bar-label">${htmlEscape(r.label)}</div><div class="bar-track"><div class="bar-fill" style="width:${pct}%; background:${color};">${htmlEscape(r.fillText || '')}</div></div><div class="bar-value">${htmlEscape(r.value || '')}</div></div>\n`;
  });
  h += `</div>`;
  return h;
}

function buildLineChart(demandTrends) {
  if (!demandTrends || !demandTrends.length) return '';

  // Parse numeric values from demand_volume strings (handle "亿元""亿美元""亿美元" etc.)
  const parseNum = (s) => {
    if (typeof s !== 'string') return NaN;
    const m = s.match(/[\d.]+/);
    return m ? parseFloat(m[0]) : NaN;
  };
  const points = demandTrends.map(d => ({
    period: d.period,
    val: parseNum(d.demand_volume)
  })).filter(p => !isNaN(p.val));

  if (points.length < 2) return '';

  const minVal = Math.min(...points.map(p => p.val));
  const maxVal = Math.max(...points.map(p => p.val));
  const range = maxVal - minVal || 1;

  // SVG coordinates: x 45→485, y 150→20
  const X_MIN = 45, X_MAX = 485, Y_MIN = 20, Y_MAX = 150;
  const xStep = points.length > 1 ? (X_MAX - X_MIN) / (points.length - 1) : 0;

  const scaleY = (v) => Y_MAX - ((v - minVal) / range) * (Y_MAX - Y_MIN);
  // Round to 4 decimal places for clean SVG
  const rd = (n) => Math.round(n * 10000) / 10000;

  // Generate 5 Y-axis reference values
  const yRefs = [];
  for (let i = 0; i < 5; i++) {
    const v = minVal + (range / 4) * i;
    yRefs.push({ val: v, y: rd(scaleY(v)) });
  }

  const polylinePoints = points.map((p, i) => `${rd(X_MIN + i * xStep)},${rd(scaleY(p.val))}`).join(' ');
  const polygonPoints = `${polylinePoints} ${X_MAX},${Y_MAX} ${X_MIN},${Y_MAX}`;

  let svg = `<div class="line-chart">\n`;
  svg += `  <svg viewBox="0 0 500 180" style="width:100%;height:180px;">\n`;
  svg += `    <defs><linearGradient id="lg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#3b82f6" stop-opacity="0.15"/><stop offset="100%" stop-color="#3b82f6" stop-opacity="0.01"/></linearGradient></defs>\n`;
  svg += `    <line x1="${X_MIN}" y1="${Y_MIN}" x2="${X_MIN}" y2="${Y_MAX}" stroke="#cbd5e1" stroke-width="1"/>\n`;
  svg += `    <line x1="${X_MIN}" y1="${Y_MAX}" x2="${X_MAX}" y2="${Y_MAX}" stroke="#cbd5e1" stroke-width="1"/>\n`;

  // Reference grid lines
  yRefs.forEach(ref => {
    svg += `      <line x1="${X_MIN}" y1="${ref.y}" x2="${X_MAX}" y2="${ref.y}" stroke="#f1f5f9" stroke-width="1"/>\n`;
    svg += `      <text x="${X_MIN - 8}" y="${rd(ref.y + 4)}" text-anchor="end" fill="#94a3b8" font-size="10">${Math.round(ref.val)}</text>\n`;
  });

  // Fill polygon and polyline
  svg += `    <polygon points="${polygonPoints}" fill="url(#lg)"/>\n`;
  svg += `    <polyline points="${polylinePoints}" fill="none" stroke="#2563eb" stroke-width="2" stroke-linejoin="round"/>\n`;

  // Data point circles and labels
  points.forEach((p, i) => {
    const cx = rd(X_MIN + i * xStep);
    const cy = rd(scaleY(p.val));
    svg += `      <circle cx="${cx}" cy="${cy}" r="4" fill="#fff" stroke="#2563eb" stroke-width="2"/>\n`;
    svg += `      <text x="${cx}" y="168" text-anchor="middle" fill="#64748b" font-size="10">${p.period}</text>\n`;
    svg += `      <text x="${cx}" y="${rd(cy - 10)}" text-anchor="middle" fill="#1e293b" font-size="11" font-weight="600">${Math.round(p.val)}</text>\n`;
  });

  svg += `  </svg>\n`;
  svg += `</div>`;
  return svg;
}

function buildCallout(type, title, body) {
  return `<div class="callout ${type}"><div class="title">${htmlEscape(title)}</div>${body}</div>`;
}

function buildTimeline(items) {
  let h = `<div class="timeline">\n`;
  items.forEach(it => {
    h += `<div class="timeline-item"><div class="phase">${htmlEscape(it.phase)}`;
    if (it.period) h += `<span class="period">${htmlEscape(it.period)}</span>`;
    h += `</div><div class="detail">${htmlEscape(it.detail)}</div></div>\n`;
  });
  h += `</div>`;
  return h;
}

function buildCompCard(name, tagLabel, tagClass, details) {
  let h = `<div class="comp-card"><div class="name">${htmlEscape(name)}`;
  if (tagLabel) h += `<span class="tag ${tagClass || ''}">${htmlEscape(tagLabel)}</span>`;
  h += `</div><div class="detail">${htmlEscape(details)}</div></div>`;
  return h;
}

function buildTable(headers, rows, opts = {}) {
  let h = `<table>${opts.colWidths ? `<colgroup>${opts.colWidths.map(w => `<col style="width:${w}">`).join('')}</colgroup>` : ''}\n<tr>${headers.map(hd => `<th>${hd}</th>`).join('')}</tr>\n`;
  rows.forEach(row => {
    h += `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>\n`;
  });
  h += `</table>`;
  return h;
}

function generateHTMLReport(data, dateStr) {
  const { input, parsed, wukan, synthesis, sanding } = data;
  const [trend, comp, cust, selfData, opp] = wukan;
  const { goal, strategy, plan } = sanding;

  const css = `<style>/* 五看三定战略洞察报告 - 样式表 v2.0 */
body {
  font-family: -apple-system, "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif;
  max-width: 960px; margin: 0 auto; padding: 40px 24px;
  color: #1e293b; line-height: 1.8; background: #f8fafc;
}
.report { background: #fff; padding: 48px 56px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,.08); }
.header { text-align: center; padding-bottom: 28px; margin-bottom: 32px; border-bottom: 2px solid #e2e8f0; }
.header h1 { font-size: 26px; color: #0f172a; margin: 0 0 6px; letter-spacing: 1px; }
.header .meta { color: #64748b; font-size: 13px; }
.header .author { color: #2563eb; font-size: 13px; font-weight: 600; margin-top: 4px; }
.toc { background: #f1f5f9; border-radius: 8px; padding: 12px 20px; margin-bottom: 28px; display: flex; flex-wrap: wrap; gap: 4px 18px; font-size: 13px; }
.toc a { color: #3b82f6; text-decoration: none; }
.toc a:hover { text-decoration: underline; }
.toc-sep { color: #cbd5e1; }
.metrics { display: flex; gap: 16px; margin-bottom: 32px; flex-wrap: wrap; }
.metric-card { flex: 1; min-width: 120px; background: linear-gradient(135deg, #1e3a5f, #2563eb); border-radius: 10px; padding: 16px 12px; color: #fff; text-align: center; }
.metric-card .value { font-size: 24px; font-weight: 700; line-height: 1.2; }
.metric-card .label { font-size: 12px; opacity: .8; margin-top: 4px; }
.metric-card.green { background: linear-gradient(135deg, #065f46, #059669); }
.metric-card.orange { background: linear-gradient(135deg, #92400e, #d97706); }
.metric-card.purple { background: linear-gradient(135deg, #4c1d95, #7c3aed); }
.metric-card.teal { background: linear-gradient(135deg, #0f766e, #14b8a6); }
a.metric-link { text-decoration: none; color: inherit; display: block; flex: 1; min-width: 120px; }
a.metric-link:hover .metric-card { filter: brightness(1.15); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,.2); }
a.metric-link .metric-card { transition: all .2s ease; }
h2 { font-size: 20px; color: #0f172a; border-bottom: 2px solid #2563eb; padding-bottom: 8px; margin: 36px 0 16px; }
h3 { font-size: 16px; color: #2563eb; margin: 24px 0 12px; }
h4 { font-size: 14px; color: #475569; margin: 16px 0 8px; }
table { width: 100%; border-collapse: collapse; margin: 12px 0 20px; font-size: 13px; }
th { background: #1e293b; color: #fff; padding: 10px 12px; text-align: left; font-weight: 600; }
td { padding: 9px 12px; border-bottom: 1px solid #e2e8f0; }
tr:nth-child(even) td { background: #f8fafc; }
tr:hover td { background: #eff6ff; }
.callout { margin: 16px 0; padding: 14px 18px; border-radius: 8px; border-left: 4px solid; font-size: 13px; }
.callout .title { font-weight: 700; margin-bottom: 6px; }
.callout.info { background: #eff6ff; border-color: #3b82f6; color: #1e40af; }
.callout.warning { background: #fffbeb; border-color: #f59e0b; color: #92400e; }
.callout.danger { background: #fef2f2; border-color: #ef4444; color: #991b1b; }
.badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 600; margin: 0 2px; }
.badge.high { background: #fef2f2; color: #dc2626; border: 1px solid #fca5a5; }
.badge.mid { background: #fffbeb; color: #d97706; border: 1px solid #fcd34d; }
.badge.low { background: #f0fdf4; color: #16a34a; border: 1px solid #86efac; }
.bar-chart { margin: 12px 0 20px; }
.bar-row { display: flex; align-items: center; margin: 5px 0; font-size: 13px; }
.bar-label { width: 120px; flex-shrink: 0; color: #475569; padding-right: 8px; }
.bar-track { flex: 1; background: #e2e8f0; border-radius: 6px; height: 22px; position: relative; overflow: hidden; }
.bar-fill { height: 100%; border-radius: 6px; display: flex; align-items: center; padding-left: 8px; color: #fff; font-size: 11px; font-weight: 600; white-space: nowrap; }
.bar-value { min-width: 50px; text-align: right; padding-left: 8px; color: #1e293b; font-weight: 600; font-size: 12px; }
.maturity-meter { display: flex; gap: 4px; margin: 12px 0; }
.maturity-seg { height: 34px; flex: 1; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; border-radius: 4px; transition: all .3s; }
.maturity-seg.active { transform: scale(1.05); box-shadow: 0 2px 8px rgba(0,0,0,.15); }
.comp-grid { display: flex; gap: 12px; margin: 12px 0 20px; flex-wrap: wrap; }
.comp-card { flex: 1; min-width: 160px; background: #f8fafc; border-radius: 8px; padding: 12px; border: 1px solid #e2e8f0; }
.comp-card .name { font-weight: 700; font-size: 14px; color: #0f172a; }
.comp-card .tag { font-size: 11px; color: #fff; background: #2563eb; border-radius: 4px; padding: 1px 6px; display: inline-block; margin-left: 4px; vertical-align: middle; }
.comp-card .tag.startup { background: #059669; }
.comp-card .tag.cross { background: #d97706; }
.comp-card .detail { font-size: 12px; color: #64748b; margin-top: 4px; line-height: 1.5; }
.timeline { position: relative; margin: 16px 0 20px; padding: 0 0 0 24px; }
.timeline::before { content: ''; position: absolute; left: 10px; top: 0; bottom: 0; width: 3px; background: #e2e8f0; border-radius: 2px; }
.timeline-item { position: relative; margin-bottom: 20px; padding-left: 16px; }
.timeline-item::before { content: ''; position: absolute; left: -20px; top: 5px; width: 14px; height: 14px; border-radius: 50%; background: #fff; border: 3px solid #2563eb; }
.timeline-item .phase { font-weight: 700; color: #0f172a; font-size: 14px; }
.timeline-item .period { color: #64748b; font-size: 12px; font-weight: 400; margin-left: 6px; }
.timeline-item .detail { font-size: 13px; color: #475569; margin-top: 2px; }
.ref-list { margin: 12px 0; }
.ref-item { display: flex; gap: 8px; padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-size: 12px; align-items: flex-start; }
.ref-item .source { color: #3b82f6; text-decoration: none; word-break: break-all; }
.ref-item .tag-domain { background: #e0e7ff; color: #4338ca; padding: 1px 6px; border-radius: 4px; font-size: 10px; flex-shrink: 0; }
.ref-item .cite-text { flex: 1; }
blockquote { margin: 12px 0; padding: 10px 16px; background: #f1f5f9; border-left: 3px solid #94a3b8; border-radius: 0 6px 6px 0; color: #475569; font-style: italic; font-size: 13px; }
.footer { margin-top: 36px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center; }
.method-badge { display: inline-block; padding: 1px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
.method-badge.search { background: #dbeafe; color: #1d4ed8; }
.method-badge.ai { background: #f3e8ff; color: #7c3aed; }
.method-badge.wiki { background: #d1fae5; color: #047857; }
.flex-trend { display: flex; gap: 20px; margin: 12px 0 20px; }
.flex-trend .flex-text { flex: 3; min-width: 0; }
.flex-trend .flex-text p { margin: 4px 0; font-size: 13px; line-height: 1.7; color: #1e293b; }
.flex-trend .flex-text ul { margin: 4px 0; font-size: 13px; color: #475569; padding-left: 18px; }
.flex-trend .flex-text ul li { margin: 3px 0; }
.flex-trend .flex-chart { flex: 1.2; min-width: 0; }
.flex-trend .flex-chart .bar-chart { margin: 0; }
.flex-trend .flex-chart .bar-label { width: 80px; font-size: 11px; }
.flex-trend .flex-chart .bar-track { height: 16px; }
.flex-trend .flex-chart .bar-fill { font-size: 10px; height: 16px; }
.flex-trend .flex-chart .bar-value { font-size: 10px; min-width: 30px; }
.callout .title { font-weight: 700; margin-bottom: 6px; }
.line-chart { margin: 16px 0 20px; background: #f8fafc; border-radius: 8px; padding: 12px; }
.line-chart svg { display: block; }
.region-demand table { font-size: 13px; }
.region-demand td { padding: 7px 10px; }
@media print {
  body { background: #fff; padding: 0; }
  .report { box-shadow: none; padding: 24px; }
  h2 { break-before: auto; }
}</style>`;

  // =============================================
  // HEADER + TOC
  // =============================================
  const title = `五看三定战略洞察报告：${htmlEscape(input)}`;
  const pageTitle = `五看三定战略洞察报告`;
  const tocItems = [
    { id: 's1', label: '执行摘要' }, { id: 's2', label: '分析方法' },
    { id: 's3', label: '看趋势' }, { id: 's4', label: '看对手' },
    { id: 's5', label: '看客户' }, { id: 's6', label: '看自己' },
    { id: 's7', label: '看机会' }, { id: 's8', label: '交叉验证' },
    { id: 's9', label: '定目标' }, { id: 's10', label: '定策略' },
    { id: 's11', label: '定计划' }, { id: 's12', label: '附录' },
  ];
  let toc = `<div class="toc">\n`;
  tocItems.forEach((it, idx) => {
    toc += `<a href="#${it.id}">${it.label}</a>`;
    if (idx < tocItems.length - 1) toc += `<span class="toc-sep">|</span>`;
  });
  toc += `\n</div>`;

  // =============================================
  // 1. EXECUTIVE SUMMARY + METRICS CARDS
  // =============================================
  const lifecycle = trend?.technology_lifecycle || '待评估';
  const lifecycleColors = { '导入期': '#f59e0b', '爆发期': '#2563eb', '成熟期': '#059669', '衰退期': '#64748b' };
  const lifecycleColor = lifecycleColors[lifecycle] || '#64748b';

  const opportunityCount = (opp?.opportunity_funnel || []).length;
  const topOpp = synthesis?.prioritized_opportunities?.[0];
  const topOppName = topOpp?.opportunity || '待分析';
  const topOppScore = topOpp?.score ?? '待评估';
  const topPlayerCount = (comp?.top_players || []).length;
  const painCount = (cust?.pain_points || []).length;
  const gapCount = (selfData?.capability_gap_matrix || []).length;

  // Extract dynamic values for metric cards
  const firstOppTAM = opp?.opportunity_funnel?.[0]?.tam;
  const marketSizeRaw = opp?.market_size || (firstOppTAM ? `${firstOppTAM.value}${firstOppTAM.unit}（${firstOppTAM.year}）` : (opp?.summary_verdict || '待评估'));
  const marketSizeShort = marketSizeRaw.length > 22 ? marketSizeRaw.substring(0, 22) + '…' : marketSizeRaw;
  const cagrRaw = opp?.market_growth_rate || '待评估';
  const cagrShort = cagrRaw.length > 18 ? cagrRaw.substring(0, 18) + '…' : cagrRaw;
  const timeToMarket = goal?.business_targets?.time_to_market || '待定';
  const lifecycleColorClass = lifecycleColor === '#059669' ? 'green' : (lifecycleColor === '#2563eb' ? '' : (lifecycleColor === '#f59e0b' ? 'orange' : 'purple'));

  const metricCards = `<div class="metrics">
<a href="#s3" class="metric-link"><div class="metric-card ${lifecycleColorClass}"><div class="value">${htmlEscape(lifecycle)}</div><div class="label">技术生命周期</div></div></a>
<a href="#s7" class="metric-link"><div class="metric-card green"><div class="value">${htmlEscape(marketSizeShort)}</div><div class="label">🌍 全球市场规模</div></div></a>
<a href="#s3" class="metric-link"><div class="metric-card"><div class="value">${htmlEscape(cagrShort)}</div><div class="label">📈 市场增速</div></div></a>
<a href="#s11" class="metric-link"><div class="metric-card orange"><div class="value">${htmlEscape(timeToMarket)}</div><div class="label">⏱ 规模化周期</div></div></a>
<a href="#s6" class="metric-link"><div class="metric-card purple"><div class="value">${gapCount}项</div><div class="label">🔑 关键差距</div></div></a>
</div>`;

  // --- 简洁版执行摘要：仅状态+数字+链接，无冗长段落 ---
  let summaryHtml = `<h2 id="s1">一、执行摘要</h2>\n${metricCards}\n`;

  // --- 一句话概述 ---
  summaryHtml += `<p>本报告对「${htmlEscape(input)}」进行五看三定全维度战略分析，基于技术趋势、竞争格局、客户需求、自身能力、市场机会五维度交叉验证，形成目标-策略-计划三层决策建议。</p>\n`;

  // --- 机会快览 ---
  const top3opps = (synthesis?.prioritized_opportunities || []).slice(0, 3);
  if (top3opps.length > 0) {
    summaryHtml += `<h3>机会快览</h3>\n`;
    summaryHtml += `<ol>`;
    top3opps.forEach(o => {
      summaryHtml += `<li><strong>${htmlEscape(o.opportunity || '待分析')}</strong> — <span class="badge ${badgeClass(o.score)}">${htmlEscape(String(o.score ?? '待评估'))}</span> ${htmlEscape((o.rationale || '').substring(0, 100))} <a href="#s7">→ 详情</a></li>`;
    });
    summaryHtml += `</ol>\n`;
  }

  // --- 核心洞察（精简） ---
  const topInsights = (synthesis?.cross_module_insights || []).slice(0, 2);
  if (topInsights.length > 0) {
    summaryHtml += `<h3>核心洞察</h3>\n`;
    topInsights.forEach((insight, idx) => {
      summaryHtml += `<p><strong>洞察${idx + 1}</strong>：${htmlEscape(insight.substring(0, 200))}${insight.length > 200 ? '…' : ''}</p>\n`;
    });
  }

  // =============================================
  // 2. METHODOLOGY
  // =============================================
  let methodHtml = `<h2 id="s2">二、分析方法</h2>\n`;
  methodHtml += `<p>本报告采用华为IPD DSTE <strong>五看三定</strong>方法轮，通过多智能体并行搜索 → 交叉验证 → 递进决策生成。</p>\n`;
  methodHtml += buildTable(['参数', '值'], [
    ['技术域', htmlEscape(parsed?.技术域 || '-')],
    ['应用域', htmlEscape(parsed?.应用域 || '-')],
    ['约束条件', htmlEscape(parsed?.约束条件 || '未指定')],
    ['生成日期', htmlEscape(dateStr)],
  ]);

  // =============================================
  // 3. TREND
  // =============================================
  let trendHtml = `<h2 id="s3">三、看趋势：行业与技术风向标</h2>\n`;

  // Maturity meter
  const lifecycleStages = ['导入期', '爆发期', '成熟期', '衰退期'];
  const activeIdx = lifecycleStages.indexOf(lifecycle);
  const segColors = ['#f59e0b', '#2563eb', '#059669', '#64748b'];
  let meter = `<div class="maturity-meter">\n`;
  lifecycleStages.forEach((s, idx) => {
    const isActive = idx === activeIdx;
    meter += `<div class="maturity-seg${isActive ? ' active' : ''}" style="background:${isActive ? segColors[idx] : '#e2e8f0'}; color:${isActive ? '#fff' : '#94a3b8'};">${s}</div>\n`;
  });
  meter += `</div>`;
  trendHtml += `\n${meter}\n`;

  trendHtml += `<p><strong>技术生命周期判断</strong>：${htmlEscape(lifecycle)}</p>\n`;
  trendHtml += `<p><strong>依据</strong>：</p><ul>\n`;
  (trend?.lifecycle_evidence || []).forEach(e => { trendHtml += `<li>${htmlEscape(e)}</li>\n`; });
  trendHtml += `</ul>\n`;

  // Key trends with bar chart
  const trends = (trend?.key_trends || []);
  if (trends.length > 0) {
    trendHtml += `<h3>关键趋势</h3>\n`;
    trendHtml += `<div class="flex-trend"><div class="flex-text"><ul>\n`;
    trends.forEach(t => {
      trendHtml += `<li><strong>${htmlEscape(t.trend)}</strong> — 置信度：${htmlEscape(t.confidence)}</li>\n`;
    });
    trendHtml += `</ul></div><div class="flex-chart">`;
    const trendBars = trends.map((t, i) => {
      const confMap = { '高': 90, '中': 60, '低': 30 };
      const pct = confMap[t.confidence] || 50;
      return { label: t.trend.substring(0, 8), pct, value: t.confidence, color: i === 0 ? '#2563eb' : (i === 1 ? '#059669' : '#d97706') };
    });
    trendHtml += buildBarChart(trendBars);
    trendHtml += `</div></div>\n`;
  }

  // Policy landscape
  const policies = (trend?.policy_landscape || []);
  if (policies.length > 0) {
    trendHtml += `<h3>政策环境</h3>\n`;
    trendHtml += buildTable(['地区', '政策', '影响'], policies.map(p => [htmlEscape(p.region), htmlEscape(p.policy), htmlEscape(p.impact)]));
  }

  // Standards
  const standards = (trend?.standards || []);
  if (standards.length > 0) {
    trendHtml += `<h3>标准体系</h3>\n`;
    trendHtml += buildTable(['标准', '状态', '相关性'], standards.map(s => [htmlEscape(s.standard), htmlEscape(s.status), htmlEscape(s.relevance)]));
  }

  // --- 市场划分 ---
  if (trend?.market_split) {
    trendHtml += `<h3>市场规模划分</h3>\n`;
    const msRows = [];
    if (trend.market_split.cn_market_desc) msRows.push(['🇨🇳 中国市场', htmlEscape(trend.market_split.cn_market_desc)]);
    if (trend.market_split.global_market_desc) msRows.push(['🌍 全球市场', htmlEscape(trend.market_split.global_market_desc)]);
    if (trend.market_split.cn_share_estimate) msRows.push(['中国占比', htmlEscape(trend.market_split.cn_share_estimate)]);
    if (msRows.length > 0) trendHtml += buildTable(['维度', '描述'], msRows);
  }

  // --- 技术代次对比 ---
  const techGens = (trend?.tech_generations || []);
  if (techGens.length > 0) {
    trendHtml += `<h3>技术代次对比</h3>\n`;
    trendHtml += buildTable(['代次', '时间范围', '关键特征', '预期提升', '成熟度'],
      techGens.map(g => [htmlEscape(g.generation || '-'), htmlEscape(g.timeframe || '-'), htmlEscape(g.key_features || '-'), htmlEscape(g.expected_improvement || '-'), htmlEscape(g.maturity || '-')]));
  }

  // --- 需求总量变化趋势（含折线图） ---
  const demandTrends = (trend?.demand_trends || []);
  if (demandTrends.length > 0) {
    trendHtml += `<h3>需求总量变化趋势</h3>\n`;
    trendHtml += buildLineChart(demandTrends);
    trendHtml += buildTable(['时期', '需求量', '增长率', '驱动因素'],
      demandTrends.map(d => [htmlEscape(d.period || '-'), htmlEscape(d.demand_volume || '-'), htmlEscape(d.growth_rate || '-'), htmlEscape(d.drivers || '-')]));
  }

  // --- 区域分布 ---
  const regionalDist = (trend?.regional_distribution || []);
  if (regionalDist.length > 0) {
    trendHtml += `<h3>区域分布</h3>\n`;
    trendHtml += buildTable(['区域', '市场占比', '特征'],
      regionalDist.map(r => [htmlEscape(r.region || '-'), htmlEscape(r.share || '-'), htmlEscape(r.characteristics || '-')]));
  }

  // --- 价格分布与变化 ---
  if (trend?.price_analysis) {
    trendHtml += `<h3>价格分布与变化</h3>\n`;
    const tiers = trend.price_analysis.tiers || [];
    if (tiers.length > 0) {
      trendHtml += `<ul>\n`;
      tiers.forEach(t => {
        trendHtml += `<li><strong>${htmlEscape(t.tier || '-')}</strong>：${htmlEscape(t.price_range || '-')}${t.description ? htmlEscape(t.description) : ''}</li>\n`;
      });
      trendHtml += `</ul>\n`;
    }
    const priceUnit = trend.price_analysis.price_unit || trend.price_analysis.unit || '';
    if (priceUnit) trendHtml += `<p><strong>单位</strong>：${htmlEscape(priceUnit)}</p>\n`;
    const yoyChange = trend.price_analysis.yoy_change || '';
    if (yoyChange) trendHtml += `<p><strong>同比变化</strong>：${htmlEscape(yoyChange)}</p>\n`;
    if (trend.price_analysis.trend) {
      trendHtml += `<p><em>${htmlEscape(trend.price_analysis.trend)}</em></p>\n`;
    }
  }

  // =============================================
  // 4. COMPETITOR
  // =============================================
  let compHtml = `<h2 id="s4">四、看对手：竞争格局全景图</h2>\n`;

  // Comp cards grid
  const players = (comp?.top_players || []);
  if (players.length > 0) {
    compHtml += `<div class="comp-grid">\n`;
    players.forEach(p => {
      const tagType = (p.type || '').includes('Startup') ? 'startup' : ((p.type || '').includes('跨国') ? 'cross' : '');
      const detail = `${p.region || '-'} | ${p.target_market || '-'}`;
      compHtml += buildCompCard(p.name || '-', p.type || '', tagType, detail);
    });
    compHtml += `</div>\n`;

    // Competition summary callout
    compHtml += buildCallout('info', '竞争格局总结', `<p>${htmlEscape(comp?.competitive_landscape_summary || '数据不足')}</p>`);

    // Player table
    compHtml += `<h3>竞品详细对比</h3>\n`;
    compHtml += buildTable(['公司', '类型', '地区', '核心能力', '目标市场'], players.map(p => {
      const tp = p.technical_params || {};
      const tpStr = Object.entries(tp).filter(([k]) => k !== 'source_urls').map(([k, v]) => `${k}=${typeof v === 'object' ? JSON.stringify(v) : v}`).join('；') || '-';
      return [htmlEscape(p.name || '-'), htmlEscape(p.type || '-'), htmlEscape(p.region || '-'), htmlEscape(tpStr), htmlEscape(p.target_market || '-')];
    }));
  } else {
    compHtml += `<p>暂无竞品数据。</p>\n`;
  }

  // Emerging threats
  const threats = (comp?.emerging_threats || []);
  if (threats.length > 0) {
    compHtml += `<h3>新兴威胁</h3>\n<ul>\n`;
    threats.forEach(t => { compHtml += `<li>${htmlEscape(t)}</li>\n`; });
    compHtml += `</ul>\n`;
  }

  // --- 核心技术对标 ---
  const coreBench = (comp?.core_tech_benchmark || []);
  if (coreBench.length > 0) {
    compHtml += `<h3>核心技术对标</h3>\n`;
    compHtml += buildTable(['技术参数', '标杆水平', '行业主流', '差距分析'],
      coreBench.map(b => [htmlEscape(b.tech_dimension || '-'), htmlEscape(b.best_in_class || '-'), htmlEscape(b.industry_average || '-'), htmlEscape(b.gap_analysis || '-')]));
  }

  // --- 关键趋势判断 ---
  const keyTrendJudgments = (comp?.key_trends_judgments || []);
  if (keyTrendJudgments.length > 0) {
    compHtml += `<h3>关键趋势判断</h3>\n<ul>\n`;
    keyTrendJudgments.forEach(j => {
      compHtml += `<li><strong>${htmlEscape(j.trend)}</strong>：${htmlEscape(j.our_position || '待评估')}（战略含义：${htmlEscape(j.strategic_implication || '待评估')}）</li>\n`;
    });
    compHtml += `</ul>\n`;
  }

  // =============================================
  // 5. CUSTOMER
  // =============================================
  let custHtml = `<h2 id="s5">五、看客户：真实需求与痛点</h2>\n`;
  custHtml += `<p><strong>客户最关注</strong>：${htmlEscape(cust?.value_proposition_match?.top_priority || '数据不足')}</p>\n`;

  const painPoints = (cust?.pain_points || []);
  if (painPoints.length > 0) {
    custHtml += `<h3>痛点分析</h3>\n<div class="flex-pain"><div class="flex-text"><ul>\n`;
    painPoints.forEach(p => {
      custHtml += `<li><strong>${htmlEscape(p.pain)}</strong>（频次：${htmlEscape(p.frequency)}）</li>\n`;
      (p.quotes || []).forEach(q => { custHtml += `<p style="font-size:12px;color:#64748b;margin:2px 0 0 16px;">"${htmlEscape(q)}"</p>\n`; });
    });
    custHtml += `</ul></div><div class="flex-chart">`;
    const painBars = painPoints.map((p, i) => {
      const freqMap = { '高': 85, '中': 55, '低': 25 };
      return { label: p.pain.substring(0, 8), pct: freqMap[p.frequency] || 50, value: p.frequency, color: i === 0 ? '#dc2626' : (i === 1 ? '#d97706' : '#64748b') };
    });
    custHtml += buildBarChart(painBars);
    custHtml += `</div></div>\n`;
  }

  // What customers want
  const wants = (cust?.value_proposition_match?.what_customers_want || []);
  if (wants.length > 0) {
    custHtml += `<h3>客户核心诉求</h3>\n<ul>\n`;
    wants.forEach(w => { custHtml += `<li>${htmlEscape(w)}</li>\n`; });
    custHtml += `</ul>\n`;
  }

  // --- 客户价值主张 ---
  const valueProps = (cust?.customer_value_propositions || []);
  if (valueProps.length > 0) {
    custHtml += `<h3>客户价值主张</h3>\n<ul>\n`;
    valueProps.forEach(v => {
      custHtml += `<li><strong>${htmlEscape(v.segment || '客户')}</strong>：${htmlEscape((v.value_drivers || []).join('；') || '待分析')}（支付意愿：${htmlEscape(v.willingness_to_pay || '待分析')}，决策标准：${htmlEscape((v.decision_criteria || []).join('；') || '待分析')}）</li>\n`;
    });
    custHtml += `</ul>\n`;
  }

  // --- 客户细分 ---
  const custSegments = (cust?.customer_segments || []);
  if (custSegments.length > 0) {
    custHtml += `<h3>客户细分</h3>\n`;
    custHtml += buildTable(['细分市场', '市场规模', '痛点强度', '增长潜力', '描述'],
      custSegments.map(s => [htmlEscape(s.segment_name || '-'), htmlEscape(s.market_size || '-'), htmlEscape(s.pain_intensity || '-'), htmlEscape(s.growth_potential || '-'), htmlEscape(s.description || '-')]));
  }

  // =============================================
  // 6. SELF
  // =============================================
  let selfHtml = `<h2 id="s6">六、看自己：能力与差距</h2>\n`;
  if (selfData?.self_capabilities?.provided_by_user) {
    selfHtml += `<p><strong>自身能力描述</strong>：${htmlEscape(selfData.self_capabilities.description)}</p>\n`;
  } else {
    selfHtml += buildCallout('warning', '⚠️ 未提供自身能力数据', '<p>以下为基于竞品和客户需求的标准差距模板，请补充我司能力后进行精准分析。</p>');
  }

  const gaps = (selfData?.capability_gap_matrix || []);
  if (gaps.length > 0) {
    selfHtml += `<h3>能力差距矩阵</h3>\n`;
    selfHtml += buildTable(
      ['维度', '竞品标杆', '客户需求', '我司能力', '差距', '关键程度'],
      gaps.map(g => {
        const gapBadge = `<span class="badge ${badgeClass(g.gap_type === '大' ? 30 : g.gap_type === '中' ? 60 : 90)}">${htmlEscape(g.gap || '-')}</span>`;
        return [htmlEscape(g.dimension), htmlEscape(g.competitor_benchmark), htmlEscape(g.customer_requirement), htmlEscape(g.our_capability), gapBadge, htmlEscape(g.criticality)];
      })
    );
  }

  const assets = selfData?.strategic_assets || [];
  const bottlenecks = selfData?.resource_bottlenecks || [];
  if (assets.length > 0 || bottlenecks.length > 0) {
    selfHtml += `<h3>战略资产与瓶颈</h3>\n`;
    if (assets.length > 0) selfHtml += `<p><strong>战略资产</strong>：${htmlEscape(assets.join('、'))}</p>\n`;
    if (bottlenecks.length > 0) selfHtml += `<p><strong>资源瓶颈</strong>：${htmlEscape(bottlenecks.join('、'))}</p>\n`;
  }

  // =============================================
  // 7. OPPORTUNITY
  // =============================================
  let oppHtml = `<h2 id="s7">七、看机会：战略机会点</h2>\n`;
  oppHtml += `<p><strong>市场规模判断</strong>：${htmlEscape(opp?.summary_verdict || '数据不足')}</p>\n`;
  oppHtml += `<p><strong>市场增长率</strong>：${htmlEscape(opp?.market_growth_rate || '数据不足')}</p>\n`;

  const funnel = (opp?.opportunity_funnel || []);
  if (funnel.length > 0) {
    oppHtml += `<h3>机会漏斗</h3>\n`;
    oppHtml += buildTable(
      ['排序', '机会点', 'Ansoff定位', 'TAM', 'SAM', 'SOM', '吸引力', '胜率'],
      funnel
        .sort((a, b) => (a.priority_rank ?? 999) - (b.priority_rank ?? 999))
        .map(o => [
          htmlEscape(String(o.priority_rank ?? '-')),
          `<strong>${htmlEscape(o.opportunity || '待分析')}</strong>`,
          htmlEscape(o.ansoff_quadrant || '-'),
          o.tam ? `${o.tam.value}${o.tam.unit}（${o.tam.year}）` : '-',
          o.sam ? `${o.sam.value}${o.sam.unit}` : '-',
          o.som ? `${o.som.value}${o.som.unit}` : '-',
          htmlEscape(o.attractiveness || '-'),
          htmlEscape(o.win_probability || '-'),
        ])
    );
  }

  // =============================================
  // 8. CROSS-VALIDATION
  // =============================================
  let synthHtml = `<h2 id="s8">八、交叉验证洞察</h2>\n`;
  const conflicts = (synthesis?.conflicts || []);
  if (conflicts.length > 0) {
    synthHtml += `<h3>矛盾与风险</h3>\n`;
    conflicts.forEach(c => {
      const sev = c.severity || '';
      const calloutType = sev.includes('高') ? 'danger' : (sev.includes('中') ? 'warning' : 'info');
      const body = `<p>${htmlEscape(c.description)}</p>${c.resolution ? '<p><strong>解释</strong>：' + htmlEscape(c.resolution) + '</p>' : ''}`;
      synthHtml += buildCallout(calloutType, c.severity || '风险', body);
    });
  }

  const insights = (synthesis?.cross_module_insights || []);
  if (insights.length > 0) {
    synthHtml += `<h3>跨模块关联发现</h3>\n<ul>\n`;
    insights.forEach(i => { synthHtml += `<li>${htmlEscape(i)}</li>\n`; });
    synthHtml += `</ul>\n`;
  }

  // Priority ranking table
  const prioritized = (synthesis?.prioritized_opportunities || []);
  if (prioritized.length > 0) {
    synthHtml += `<h3>机会优先级排序</h3>\n`;
    synthHtml += buildTable(
      ['机会', '评分', '依据'],
      prioritized.map(o => [
        `<strong>${htmlEscape(o.opportunity || '待分析')}</strong>`,
        `<span class="badge ${badgeClass(o.score)}">${htmlEscape(String(o.score ?? '待评估'))}</span>`,
        htmlEscape(o.rationale || '待补充'),
      ])
    );
  }

  // =============================================
  // 9. GOAL
  // =============================================
  let goalHtml = `<h2 id="s9">九、定目标：产品与商业红线</h2>\n`;
  const indicators = (goal?.technical_mvp?.indicators || []);
  if (indicators.length > 0) {
    goalHtml += `<h3>技术红线（MVP关键指标）</h3>\n`;
    goalHtml += buildBarChart(indicators.map((ind, i) => ({
      label: ind.param || '-',
      pct: 85,
      value: ind.target || '-',
      fillText: ind.target || '',
      color: '#2563eb',
    })));

    goalHtml += `<h4>指标详情</h4>\n`;
    goalHtml += buildTable(
      ['参数', '目标值', '依据'],
      indicators.map(ind => [
        `<strong>${htmlEscape(ind.param || '-')}</strong>`,
        htmlEscape(ind.target || '-'),
        htmlEscape(ind.basis || '-'),
      ])
    );
  }

  const certs = (goal?.technical_mvp?.required_certifications || []);
  if (certs.length > 0) {
    goalHtml += `<p><strong>必须认证</strong>：${certs.map(c => '<span class="badge high">' + htmlEscape(c) + '</span>').join('')}</p>\n`;
  }

  goalHtml += buildCallout('info', 'MVP定位', `<p>${htmlEscape(goal?.technical_mvp?.mvp_verdict || '待定')}</p>`);

  const bizTargets = goal?.business_targets || {};
  goalHtml += `<h3>商业目标</h3>\n`;
  goalHtml += buildTable(
    ['指标', '目标'],
    [
      ['上市时间', htmlEscape(bizTargets.time_to_market || '待定')],
      ['目标成本', htmlEscape(bizTargets.target_cost || '待定')],
      ['首年销量', htmlEscape(bizTargets.first_year_sales_estimate || '待定')],
    ].map(r => [r[0], r[1]]),
    { colWidths: ['30%', '70%'] }
  );

  // =============================================
  // 10. STRATEGY
  // =============================================
  let stratHtml = `<h2 id="s10">十、定策略：差异化制胜点</h2>\n`;
  const rationale = strategy?.rationale || '待定';
  stratHtml += buildCallout('info', `推荐策略：${htmlEscape(strategy?.recommended_strategy || '待定')}`, `<p>${htmlEscape(rationale)}</p>`);

  const edges = (strategy?.differentiation_edges || []);
  if (edges.length > 0) {
    stratHtml += `<h3>差异化支撑</h3>\n<ul>\n`;
    edges.forEach(e => { stratHtml += `<li>${htmlEscape(e)}</li>\n`; });
    stratHtml += `</ul>\n`;
  }

  const rejected = (strategy?.rejected_strategies || []);
  if (rejected.length > 0) {
    stratHtml += `<h3>已排除策略</h3>\n`;
    stratHtml += buildTable(
      ['策略', '排除原因'],
      rejected.map(r => [htmlEscape(r.strategy || '-'), htmlEscape(r.reason || '-')])
    );
  }

  // =============================================
  // 11. PLAN
  // =============================================
  let planHtml = `<h2 id="s11">十一、定计划：研发路线图</h2>\n`;
  let timelineItems = [];
  const milestones = (plan?.milestones || []);
  if (milestones.length > 0) {
    planHtml += `<h3>里程碑</h3>\n`;
    timelineItems = milestones.map(m => ({
      phase: m.phase || '-',
      period: m.timeline || '',
      detail: m.deliverables || '-',
    }));
    planHtml += buildTimeline(timelineItems);
  }

  const risks = (plan?.top_risks || []);
  if (risks.length > 0) {
    planHtml += `<h3>Top 技术风险</h3>\n`;
    risks.forEach(r => {
      const body = `<p><strong>影响阶段</strong>：${htmlEscape(r.affected_phase || '-')}</p><p><strong>缓解措施</strong>：${htmlEscape(r.mitigation || '-')}</p>`;
      planHtml += buildCallout('danger', r.risk || '未知风险', body);
    });
  }

  planHtml += `<h3>资源建议</h3>\n<p>${htmlEscape(plan?.resource_suggestions || '待定')}</p>\n`;

  // =============================================
  // 12. APPENDIX
  // =============================================
  let appendixHtml = `<h2 id="s12">十二、附录</h2>\n`;
  appendixHtml += `<h3>A · 分析方法</h3>\n`;
  appendixHtml += `<p>本报告采用基于IPD DSTE体系的<strong>五看三定</strong>方法论，通过多智能体并行搜索 → 交叉验证 → 递进决策三层流水线生成。</p>\n`;
  appendixHtml += `<h4>分析流程</h4>\n`;
  appendixHtml += buildTimeline([
    { phase: 'Phase 1 · 输入解析', period: '', detail: '解析产品方向 → 技术域 / 应用域 / 约束条件' },
    { phase: 'Phase 2 · 五看', period: '5×并行搜索+AI分析', detail: '看趋势 / 看对手 / 看客户 / 看自己 / 看机会' },
    { phase: 'Phase 3 · 交叉验证', period: '', detail: '去重 · 矛盾识别 · 跨模块关联 · 优先级排序' },
    { phase: 'Phase 4 · 三定', period: '3×递进决策', detail: '定目标 → 定策略 → 定计划' },
  ]);

  appendixHtml += `<h4>搜索范围</h4>\n`;
  appendixHtml += buildTable(
    ['来源', '类型', '说明'],
    [
      ['<span class="method-badge search">🔍 DuckDuckGo</span>', 'Web Search', '中英文关键词搜索，按产品方向/技术域/应用域多维度查询，结果去重'],
      ['<span class="method-badge ai">🤖 DeepSeek AI</span>', 'LLM Analysis', 'DeepSeek-v4-flash / deepseek-chat 模型，对所有搜索数据进行结构化分析'],
      ['<span class="method-badge wiki">📚 Wikipedia</span>', '参考补充', '用于技术概念验证和基本原理查证'],
    ]
  );

  appendixHtml += `<h4>分析参数</h4>\n`;
  appendixHtml += buildTable(
    ['参数', '值'],
    [
      ['产品方向', htmlEscape(input)],
      ['技术域', htmlEscape(parsed?.技术域 || '-')],
      ['应用域', htmlEscape(parsed?.应用域 || '-')],
      ['约束条件', htmlEscape(parsed?.约束条件 || '未指定')],
      ['搜索范围', 'DuckDuckGo Web Search (中英文) + DeepSeek AI + Wikipedia'],
      ['分析引擎', 'DeepSeek-v4-flash / deepseek-chat'],
      ['生成日期', htmlEscape(dateStr)],
    ].map(r => [r[0], r[1]]),
    { colWidths: ['30%', '70%'] }
  );

  // Collect references from all agents
  appendixHtml += `<h3>B · 数据来源 / References</h3>\n<div class="ref-list">\n`;
  let refIdx = 0;
  const collectRefs = (items, domain) => {
    let h = '';
    (items || []).forEach(item => {
      const text = item.trend || item.description || item.pain || item.opportunity || item.risk || '';
      const urls = item.source_url || item.source_urls || [];
      const urlList = Array.isArray(urls) ? urls : [urls];
      urlList.forEach(u => {
        if (u) {
          refIdx++;
          h += `<div class="ref-item"><span class="cite-text">${htmlEscape(text)}</span><span class="tag-domain">${htmlEscape(domain)}</span><a class="source" href="${htmlEscape(u)}" target="_blank">${htmlEscape(u)}</a></div>\n`;
        }
      });
    });
    return h;
  };

  // Trend refs
  (trend?.key_trends || []).forEach(t => {
    if (t.source_url) {
      refIdx++;
      appendixHtml += `<div class="ref-item"><span class="cite-text">${htmlEscape(t.trend)}</span><span class="tag-domain">技术趋势</span><a class="source" href="${htmlEscape(t.source_url)}" target="_blank">${htmlEscape(t.source_url)}</a></div>\n`;
    }
  });

  // Competitor refs
  (comp?.top_players || []).forEach(p => {
    const urls = p.source_urls || [];
    urls.forEach(u => {
      if (u) {
        refIdx++;
        appendixHtml += `<div class="ref-item"><span class="cite-text">${htmlEscape(p.name)} — 产品信息</span><span class="tag-domain">竞争对手</span><a class="source" href="${htmlEscape(u)}" target="_blank">${htmlEscape(u)}</a></div>\n`;
      }
    });
  });

  appendixHtml += `</div>\n`;

  // Abbreviation legend
  appendixHtml += `<h3>C · 缩写说明</h3>\n`;
  appendixHtml += buildTable(
    ['缩写', '全称', '中文含义'],
    [
      ['TAM', 'Total Addressable Market', '总可寻址市场'],
      ['SAM', 'Serviceable Available Market', '可服务市场'],
      ['SOM', 'Serviceable Obtainable Market', '可获得市场'],
      ['CAGR', 'Compound Annual Growth Rate', '复合年增长率'],
      ['BLDC', 'Brushless DC Motor', '无刷直流电机'],
      ['MVP', 'Minimum Viable Product', '最小可行产品'],
      ['BOM', 'Bill of Materials', '物料清单'],
    ].map(r => [r[0], r[1], r[2]]),
    { colWidths: ['20%', '40%', '40%'] }
  );

  appendixHtml += `<h3>D · 方法声明</h3>\n`;
  appendixHtml += `<blockquote>本报告由五看三定AI战略洞察助手 v1.0 自动生成。数据来源于 DuckDuckGo 公开网络搜索（中英文多维度查询），经 DeepSeek AI 模型进行结构化分析和推理。交叉验证环节对五看结果进行矛盾识别和优先级排序。建议在正式 Charter 评审前由人工核实关键数据点的准确性。</blockquote>\n`;
  appendixHtml += `<blockquote>⚠️ 本报告中的市场数据、竞争对手信息、技术参数等均基于公开网络信息，可能存在时效性和完整性问题。所有分析结论仅供战略决策参考，不构成投资建议。</blockquote>\n`;

  // Footer
  const footerHtml = `<div class="footer"><p>五看三定AI战略洞察助手 v1.0 | 基于IPD DSTE 五看三定方法论 | 作者：Dr.-ING Jian WANG</p><p>报告生成于 ${htmlEscape(dateStr)} | 数据来源：DuckDuckGo + DeepSeek AI</p></div>`;

  // =============================================
  // ASSEMBLE FULL HTML
  // =============================================
  const fullHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${pageTitle}：${htmlEscape(input)}</title>${css}
</head><body><div class="report">
<div class="header"><h1>${pageTitle}</h1><div class="meta">生成日期：${htmlEscape(dateStr)} | 基于华为IPD DSTE 五看三定方法论</div><div class="author">作者：Dr.-ING Jian WANG</div></div>
${toc}
${summaryHtml}
${methodHtml}
${trendHtml}
${compHtml}
${custHtml}
${selfHtml}
${oppHtml}
${synthHtml}
${goalHtml}
${stratHtml}
${planHtml}
${appendixHtml}
${footerHtml}
</div></body></html>`;

  return fullHtml;
}

// ======================================================================
// MAIN WORKFLOW
// ======================================================================

// Support both string (just product direction) and object { input, date }
const raw = (typeof args === 'string') ? { input: args, date: '' } : (args || {});
const input = raw.input;
const dateStr = raw.date || '2026-06-09';
if (!input || typeof input !== 'string') {
  throw new Error('请输入新产品方向，例如："高功率密度轴向磁通电机在低空经济中的应用"');
}

log(`收到产品方向: ${input}`);

// Phase 1: Input Parsing
phase('输入解析');
const parsed = await agent(
  `${INPUT_PARSE_PROMPT}\n\n用户输入的产品方向: ${input}`,
  { schema: PARSE_SCHEMA, label: '输入解析', model: 'haiku' }
);
log(`解析完成: 技术域=${parsed?.技术域}, 应用域=${parsed?.应用域}`);

// Phase 2: 五看并行
phase('五看并行');
const searchContext = `产品方向: ${input}\n技术域: ${parsed?.技术域 || '未知'}\n应用域: ${parsed?.应用域 || '未知'}\n约束条件: ${parsed?.约束条件 || '未指定'}`;

const wukan = await parallel([
  () => agent(`${TREND_PROMPT}\n\n${searchContext}`, { schema: TREND_SCHEMA, label: '看趋势', phase: '五看并行', model: 'haiku' }),
  () => agent(`${COMPETITOR_PROMPT}\n\n${searchContext}`, { schema: COMP_SCHEMA, label: '看对手', phase: '五看并行', model: 'haiku' }),
  () => agent(`${CUSTOMER_PROMPT}\n\n${searchContext}`, { schema: CUST_SCHEMA, label: '看客户', phase: '五看并行', model: 'haiku' }),
  () => agent(`${SELF_PROMPT}\n\n${searchContext}`, { schema: SELF_SCHEMA, label: '看自己', phase: '五看并行', model: 'haiku' }),
  () => agent(`${OPPORTUNITY_PROMPT}\n\n${searchContext}`, { schema: OPP_SCHEMA, label: '看机会', phase: '五看并行', model: 'haiku' }),
]);
log(`五看并行完成: ${wukan.filter(Boolean).length}/5 agents completed`);

// Phase 3: Cross-validation
phase('交叉验证');
const synthesisInput = `技术域: ${parsed?.技术域}\n应用域: ${parsed?.应用域}\n\n--- 看趋势 ---\n${JSON.stringify(wukan[0], null, 2)}\n\n--- 看对手 ---\n${JSON.stringify(wukan[1], null, 2)}\n\n--- 看客户 ---\n${JSON.stringify(wukan[2], null, 2)}\n\n--- 看自己 ---\n${JSON.stringify(wukan[3], null, 2)}\n\n--- 看机会 ---\n${JSON.stringify(wukan[4], null, 2)}`;

const synthesis = await agent(
  `${SYNTHESIS_PROMPT}\n\n${synthesisInput}`,
  { schema: SYNTHESIS_SCHEMA, label: '交叉验证', model: 'haiku' }
);
log(`交叉验证完成: ${synthesis?.cross_module_insights?.length || 0} 条跨模块洞察`);

// Phase 4: 三定递进
phase('三定决策');
const decisionContext = `产品方向: ${input}\n\n--- 交叉验证输出 ---\n${JSON.stringify(synthesis, null, 2)}`;

const goal = await agent(`${GOAL_PROMPT}\n\n${decisionContext}`, { schema: GOAL_SCHEMA, label: '定目标', model: 'haiku' });
log(`定目标完成: ${goal?.technical_mvp?.indicators?.length || 0} 个MVP指标`);

const strategy = await agent(
  `${STRATEGY_PROMPT}\n\n定目标输出:\n${JSON.stringify(goal, null, 2)}`,
  { schema: STRATEGY_SCHEMA, label: '定策略', model: 'haiku' }
);
log(`定策略完成: 推荐 ${strategy?.recommended_strategy || '待定'}`);

const plan = await agent(
  `${PLAN_PROMPT}\n\n定目标:\n${JSON.stringify(goal, null, 2)}\n\n定策略:\n${JSON.stringify(strategy, null, 2)}`,
  { schema: PLAN_SCHEMA, label: '定计划', model: 'haiku' }
);
log(`定计划完成: ${plan?.milestones?.length || 0} 个里程碑`);

// Phase 5: Report Generation
phase('报告生成');
const slug = generateSlug(input);

const mdReport = generateMDReport(input, parsed, wukan, synthesis, { goal, strategy, plan }, dateStr);
const htmlReport = generateHTMLReport({ input, parsed, wukan, synthesis, sanding: { goal, strategy, plan } }, dateStr);

const filename = `${dateStr}-${slug}-report`;
log(`报告生成完成: ${filename}`);

return {
  mdReport,
  htmlReport,
  filename,
  productDirection: input,
  summary: {
    techDomain: parsed?.技术域,
    appDomain: parsed?.应用域,
    lifecycle: wukan[0]?.technology_lifecycle,
    topPlayers: wukan[1]?.top_players?.map(p => p.name),
    topPainPoints: wukan[2]?.pain_points?.slice(0, 3).map(p => p.pain),
    topOpportunities: synthesis?.prioritized_opportunities?.slice(0, 3).map(o => o.opportunity),
    recommendedStrategy: strategy?.recommended_strategy,
    milestones: plan?.milestones?.map(m => `${m.phase} (${m.timeline})`),
  },
};
