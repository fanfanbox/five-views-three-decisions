#!/usr/bin/env python3
"""
五看三定AI战略洞察助手 (Five Views, Three Decisions) — DeepSeek Native API Version
===================================================================================

基于华为IPD DSTE "五看三定"方法论的全自动战略分析流水线。
输入新产品方向 → 一键输出完整战略洞察报告（MD + HTML双格式）。

用法:
  python workflow.py "卫星反作用飞轮电机"
  python workflow.py "800V SiC电驱系统" --model deepseek-chat --output-dir ./my_reports

环境变量:
  DEEPSEEK_API_KEY  必需的DeepSeek API密钥

输出:
  output/{YYYY-MM-DD}-{slug}-report.md
  output/{YYYY-MM-DD}-{slug}-report.html

Copyright (c) 2026 Dr.-ING Jian WANG. Released under MIT License.
"""

import argparse
import json
import os
import re
import sys
import time
import traceback
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import date
from pathlib import Path

# Ensure we can import lib/ from script directory
SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPT_DIR))

import requests
from ddgs import DDGS

from lib.report_generator import generate_reports


# =========================================================================
# Configuration
# =========================================================================

DEFAULT_MODEL = "deepseek-chat"
DEFAULT_OUTPUT_DIR = SCRIPT_DIR / "output"
API_BASE = "https://api.deepseek.com/chat/completions"

# Validate API key
DEEPSEEK_API_KEY = os.environ.get("DEEPSEEK_API_KEY", "")
if not DEEPSEEK_API_KEY:
    print("❌ 请设置环境变量 DEEPSEEK_API_KEY")
    print("    export DEEPSEEK_API_KEY='your-key-here'")
    print("   或者在 .env 文件中设置（需安装 python-dotenv）")
    sys.exit(1)


# =========================================================================
# DuckDuckGo Search
# =========================================================================

def search_web(query: str, max_results: int = 10) -> list:
    """Search via DuckDuckGo, return list of {title, link, snippet}."""
    results = []
    try:
        with DDGS() as ddgs:
            for r in ddgs.text(query, max_results=max_results):
                results.append({
                    "title": r.get("title", ""),
                    "link": r.get("link", ""),
                    "snippet": r.get("body", ""),
                })
    except Exception as e:
        print(f"  [WARN] Search failed for '{query[:50]}': {e}")
    return results


# =========================================================================
# DeepSeek API call
# =========================================================================

def call_deepseek(system_prompt: str, user_prompt: str,
                  model: str = DEFAULT_MODEL, temperature: float = 0.3,
                  max_tokens: int = 4096) -> str:
    """Call DeepSeek Chat API with system + user prompts, return content string."""
    headers = {
        "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "temperature": temperature,
        "max_tokens": max_tokens,
    }
    resp = requests.post(API_BASE, headers=headers, json=payload, timeout=120)
    resp.raise_for_status()
    data = resp.json()
    content = data["choices"][0]["message"]["content"]

    # Strip markdown code fences if present
    content = content.strip()
    if content.startswith("```"):
        content = re.sub(r'^```(?:json)?\s*', '', content)
        content = re.sub(r'\s*```$', '', content)
    return content.strip()


def call_deepseek_json(system_prompt: str, user_prompt: str, **kwargs) -> dict:
    """Call DeepSeek and parse JSON response."""
    raw = call_deepseek(system_prompt, user_prompt, **kwargs)
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        # Try to extract JSON from markdown
        m = re.search(r'\{.*\}', raw, re.DOTALL)
        if m:
            return json.loads(m.group())
        print(f"  [WARN] Failed to parse JSON from response, len={len(raw)}")
        print(f"  [DEBUG] Raw: {raw[:300]}")
        return {}


# =========================================================================
# System Prompts (五看三定)
# =========================================================================

TREND_SYSTEM = '''你是一个行业技术趋势分析师（"看趋势"）。分析技术趋势、政策环境和标准体系。
基于提供的搜索结果进行分析。输出必须是JSON格式，包含：
- technology_lifecycle: "导入期"|"爆发期"|"成熟期"|"衰退期"
- lifecycle_evidence: ["判断依据列表"]
- policy_landscape: [{region, policy, impact}]
- standards: [{standard, status, relevance}]
- key_trends: [{trend, confidence: "高"|"中"|"低", source_url}]
- demand_volume_trends: [{year_or_period, volume_numeric: 数值（纯数字，无单位）, volume_description, unit: "万套"|"亿美元"等, source_note}]  — 需求总量变化趋势（至少4个时间点），用于生成折线图
- regional_demand: [{region, demand_value: "数值", unit: "亿元或亿美元", share_pct: "百分比数字（如24%）", note}]  — 分地区需求分布
- price_trends: {trend_description, entry_level_price: "根据搜索结果填写数值", mid_range_price: "根据搜索结果填写数值", high_end_price: "根据搜索结果填写数值", unit: "**必须输出单位，如美元/台、万元/套等，不可为空**", year_over_year_change: "**必须含%号，如-5.5%或-3.5%**", source_note}
- technology_roadmap: [{phase, timeline_estimate, key_technologies, maturity_forecast}]  — 技术路线图
- market_split: {china: {outlook: "中国市场需求概述与技术发展特点", key_demand: "需求特征（含数据）", policy_drivers: "政策驱动因素"}, global: {outlook: "全球市场概述与技术趋势", key_demand: "需求特征（含数据）", policy_drivers: "政策驱动因素"}}  — 中国vs全球市场分拆分析'''

COMPETITOR_SYSTEM = '''你是一个竞争情报分析师（"看对手"）。识别主要竞争对手和技术参数对标。
基于提供的搜索结果进行分析。输出必须是JSON格式，包含：
- top_players: [{name, type: "巨头"|"初创"|"跨界", region, funding, key_products: [产品名或型号列表], technical_params: {效率,功率密度,寿命,重量,扭矩等其他关键参数}, target_market, price_range: "价格区间", annual_production: "年产量（如有）", annual_revenue: "年营收（如有）", key_customers: ["主要客户列表"], technology_roadmap: "该公司的技术路线方向", source_urls}]
- emerging_threats: ["新兴威胁列表"]
- competitive_landscape_summary: "竞争格局总结"
- market_share_distribution: [{company, share_pct, rank}]
- pricing_overview: {entry_level: "入门级价格", mid_range: "中端价格", high_end: "高端价格", unit: "美元/台或人民币/台", trend: "价格变化趋势"}
- market_split: {china: {landscape_summary: "中国市场竞争格局特点", key_players: "主要国内玩家", localization_trend: "国产化趋势"}, global: {landscape_summary: "全球竞争格局特点", key_players: "主要国际玩家", entry_barriers: "进入壁垒"}}  — 中国vs全球市场分拆

请基于搜索结果的全面覆盖主要竞争对手，区分国际和国内玩家。
每个公司输出target_market、price_range（含单位）、technical_params（根据产品特性填写关键参数）、annual_production/annual_revenue（标注"未公开"或提供数据）。'''

CUSTOMER_SYSTEM = '''你是一个客户洞察分析师（"看客户"）。识别客户痛点和未被满足的需求，以及客户结构和采购模式。
基于提供的搜索结果进行分析。输出必须是JSON格式，包含：
- pain_points: [{pain, frequency: "高"|"中"|"低", source_type, quotes: []}]
- value_proposition_match: {what_customers_want: [], top_priority: "..."}
- procurement_signals: [{signal, source}]
- customer_segments: [{segment_name: "根据产品方向填写，如制造商|运营商|政府/国防|科研机构等", description, demand_volume, budget_range, procurement_cycle, key_requirements: [], growth_potential: "高"|"中"|"低"}]  — 客户细分及需求规模
- major_customers: [{name, region, scale_or_volume, requirements, procurement_volume, relationship_status: "现有"|"潜在"}]  — 主要客户/采购方
- procurement_patterns: {typical_order_volume, decision_factors: [], certification_requirements: [], lead_time_expectation, payment_terms}  — 采购模式
- market_split: {china: {customer_profile: "中国客户特征与需求", pain_points: "中国特有痛点", procurement_characteristics: "采购特点"}, global: {customer_profile: "全球客户特征与需求", pain_points: "全球共性痛点", procurement_characteristics: "采购特点"}}  — 中国vs全球客户分拆'''

SELF_SYSTEM = '''你是一个能力对标分析师（"看自己"）。基于竞品和客户需求识别自身能力差距。
如果未提供自身能力，输出标准差距模板。输出必须是JSON格式，包含：
- self_capabilities: {provided_by_user: false, description: "未提供"}
- capability_gap_matrix: [{dimension, competitor_benchmark, customer_requirement, our_capability, gap, gap_type: "技术储备"|"工艺制造"|"供应链"|"资金", criticality: "高"|"中"|"低"}]
- strategic_assets: []
- resource_bottlenecks: []'''

OPPORTUNITY_SYSTEM = '''你是一个市场机会分析师（"看机会"）。识别战略机会点并估算市场规模。
基于提供的搜索结果进行分析。输出必须是JSON格式，包含：
- opportunity_funnel: [{opportunity, ansoff_quadrant, tam_china: {value, unit, year: "2025年"或具体年份}, tam_global: {value, unit, year: "2025年"}, sam: {value, unit, year: "2025年"}, som: {value, unit, year: "2025年"}, attractiveness, win_probability, priority_rank}]  — 注意！TAM必须拆分为中国市场和中国以外的全球市场，tam_china为中国市场TAM，tam_global为全球（含中国或不含中国均可，请在year中注明"全球含中国"或"全球不含中国"）
- market_growth_rate: "CAGR估值（标注年份范围，如2024-2030 CAGR 12-15%）"
- summary_verdict: "市场总体判断（标注年份）"
- demand_forecast: [{year, total_demand_value, total_demand_unit, volume_if_available, unit_if_available, growth_rate, key_driver}]  — 需求总量预测（至少3个时间点，标注明确年份如2024, 2027, 2030）
- market_segmentation: [{segment: "按应用"|"按功率"|"按客户类型", sub_segments: [{name, tam, tam_unit, growth_rate, share_pct}]}]  — 市场细分结构
- price_analysis: {entry_level: {price, unit, typical_application}, mid_range: {price, unit, typical_application}, high_end: {price, unit, typical_application}, price_trend: "价格变化趋势", price_drivers: ["影响因素"]}  — 价格分布
- market_split: {china: {tam_summary: "中国市场TAM规模与预测", growth_rate: "增长率（含年份范围）", key_opportunities: ["关键机会点列表"], risks: "特有风险"}, global: {tam_summary: "全球TAM与预测", growth_rate: "增长率", key_opportunities: ["关键机会点"], risks: "特有风险"}}  — 中国vs全球市场机会分拆'''

SYNTHESIS_SYSTEM = '''你是一个战略合成分析师（交叉验证）。整合5个"看"模块的输出。
特别注意检查以下跨模块矛盾：
1. **看趋势的价格数据 vs 看机会的价格数据** — 对比 trend.price_trends (入门/中端/高端) 与 opp.price_analysis (entry/mid/high) 的数值和单位，若有显著差异（如数值相差>50%）或单位不一致，作为高优先级冲突报告
2. **看趋势的demand_volume_trends vs 看机会的demand_forecast** — 对比需求总量数据，判断是否一致
3. **看对手 vs 看客户** — 竞品产品参数是否匹配客户需求
4. **看对手 vs 看机会** — 竞争格局是否支持市场机会判断
5. **TAM数据一致性** — 跨模块TAM/SAM数据必须一致，若同一市场不同模块TAM差异>30%，标记为冲突

输出必须是JSON格式，包含：
- deduped_entities: [{entity, appearing_in: ["看趋势"|"看对手"|"看客户"|"看机会"], unified_description}]
- conflicts: [{description, severity: "高"|"中"|"低", modules: [], resolution: "解释", suggested_action: "建议操作"}]
- cross_module_insights: ["字符串数组，每个元素为纯文本字符串（不要用对象格式），每条需包含2-3个模块的关联信息和关键数据"]
- prioritized_opportunities: [{opportunity, score: 0-100, rationale}]
- data_gaps: ["数据缺失列表"]'''

GOAL_SYSTEM = '''你是一个战略目标制定者（"定目标"）。基于交叉验证后的五看洞察，设定技术红线和商业目标。
输出必须是JSON格式，包含：
- technical_mvp: {indicators: [{param: "技术参数名（如功率密度、效率、成本等）", target: "目标值（含单位）", basis: "依据（引用具体模块发现）"}], required_certifications: ["必须认证"], mvp_verdict: "MVP定位一句话"}
- business_targets: {time_to_market: "上市周期（如18个月）", target_cost: "目标成本", first_year_sales_estimate: "首年销量预估及计算依据"}'''

STRATEGY_SYSTEM = '''你是一个竞争策略顾问（"定策略"）。评估三种路线并推荐最佳策略。
输出必须是JSON格式，包含：
- recommended_strategy: "具体策略名称（务必结合具体产品和市场给出有意义的名称，不要太笼统，如"低成本快速验证策略"或"高性能技术领先策略"）"
- rationale: "推荐理由（引用五看数据支撑）"
- rejected_strategies: [{strategy: "被否策略", reason: "原因"}]
- differentiation_edges: ["差异化支撑点列表"]'''

PLAN_SYSTEM = '''你是一个研发计划制定者（"定计划"）。生成研发阶段里程碑和风险清单。
输出必须是JSON格式，包含：
- milestones: [{phase: "阶段名（如M1概念验证）", timeline: "时间（如0-3个月）", deliverables: "关键交付物描述"}]
- top_risks: [{risk: "风险描述", affected_phase: "影响阶段", mitigation: "缓解措施"}]
- resource_suggestions: "资源配置建议（团队规模、关键设备、外部合作等）"'''


# =========================================================================
# Search queries per view
# =========================================================================

def build_queries(view: str, tech_domain: str, app_domain: str, direction: str) -> list:
    """Build search queries for a given view."""
    queries_map = {
        "trend": [
            f"{tech_domain} {app_domain} 趋势 发展 前沿 2026",
            f"{tech_domain} {direction} 市场规模 预测",
            f"{tech_domain} {app_domain} 政策 标准 法规",
            f"{direction} technology trend market forecast 2026",
            f"{direction} price range comparison 2025",
        ],
        "competitor": [
            f"{tech_domain} {app_domain} 龙头企业 竞争格局 2025",
            f"{direction} manufacturer supplier",
            f"{direction} motor price cost production volume manufacturer 2025",
            f"{direction} company revenue market share 2025",
            f"{tech_domain} {app_domain} 专利 技术路线",
        ],
        "customer": [
            f"{tech_domain} {app_domain} 痛点 挑战 瓶颈",
            f"{direction} customer pain point requirement",
            f"{tech_domain} {app_domain} 采购 招标 认证",
            f"{direction} demand procurement 2025",
        ],
        "self": [
            f"{tech_domain} {app_domain} 技术指标 参数 对比",
            f"{direction} technical specification comparison",
        ],
        "opportunity": [
            f"{tech_domain} {app_domain} 市场 规模 TAM 预测 2025",
            f"{direction} market size forecast",
            f"全球{tech_domain} 市场规模 细分 增长率",
            f"{direction} market segmentation price analysis 2025",
        ],
    }
    return queries_map.get(view, [])


# =========================================================================
# Individual view analysis
# =========================================================================

def analyze_trend(direction: str, tech_domain: str, app_domain: str, model: str) -> dict:
    """看趋势：行业与技术风向标"""
    print(f"\n  📌 [1/5] 看趋势")
    all_results = []
    queries = build_queries("trend", tech_domain, app_domain, direction)
    for q in queries:
        res = search_web(q)
        all_results.extend(res)
        print(f"    📄 获取到 {len(res)} 条搜索结果")
    context = f"产品方向: {direction}\n技术域: {tech_domain}\n应用域: {app_domain}\n\n搜索结果:\n{json.dumps(all_results, ensure_ascii=False, indent=2)[:8000]}"
    result = call_deepseek_json(TREND_SYSTEM, context, model=model)
    print(f"  ✅ 分析完成")
    return result


def analyze_competitor(direction: str, tech_domain: str, app_domain: str, model: str) -> dict:
    """看对手：竞争格局全景图"""
    print(f"\n  📌 [2/5] 看对手")
    all_results = []
    queries = build_queries("competitor", tech_domain, app_domain, direction)
    for q in queries:
        res = search_web(q)
        all_results.extend(res)
        print(f"    📄 获取到 {len(res)} 条搜索结果")
    context = f"产品方向: {direction}\n技术域: {tech_domain}\n应用域: {app_domain}\n\n搜索结果:\n{json.dumps(all_results, ensure_ascii=False, indent=2)[:8000]}"
    result = call_deepseek_json(COMPETITOR_SYSTEM, context, model=model)
    print(f"  ✅ 分析完成")
    return result


def analyze_customer(direction: str, tech_domain: str, app_domain: str, model: str) -> dict:
    """看客户：真实需求与痛点"""
    print(f"\n  📌 [3/5] 看客户")
    all_results = []
    queries = build_queries("customer", tech_domain, app_domain, direction)
    for q in queries:
        res = search_web(q)
        all_results.extend(res)
        print(f"    📄 获取到 {len(res)} 条搜索结果")
    context = f"产品方向: {direction}\n技术域: {tech_domain}\n应用域: {app_domain}\n\n搜索结果:\n{json.dumps(all_results, ensure_ascii=False, indent=2)[:8000]}"
    result = call_deepseek_json(CUSTOMER_SYSTEM, context, model=model)
    print(f"  ✅ 分析完成")
    return result


def analyze_self(direction: str, tech_domain: str, app_domain: str,
                 competitor_data: dict, customer_data: dict, model: str) -> dict:
    """看自己：能力与差距"""
    print(f"\n  📌 [4/5] 看自己")
    context = (
        f"产品方向: {direction}\n\n"
        f"--- 竞品数据 ---\n{json.dumps(competitor_data, ensure_ascii=False, indent=2)}\n\n"
        f"--- 客户需求 ---\n{json.dumps(customer_data, ensure_ascii=False, indent=2)}"
    )
    result = call_deepseek_json(SELF_SYSTEM, context, model=model)
    print(f"  ✅ 分析完成")
    return result


def analyze_opportunity(direction: str, tech_domain: str, app_domain: str,
                        trend_data: dict, competitor_data: dict,
                        customer_data: dict, model: str) -> dict:
    """看机会：战略机会点"""
    print(f"\n  📌 [5/5] 看机会")
    all_results = []
    queries = build_queries("opportunity", tech_domain, app_domain, direction)
    for q in queries:
        res = search_web(q)
        all_results.extend(res)
        print(f"    📄 获取到 {len(res)} 条搜索结果")
    context = (
        f"产品方向: {direction}\n\n"
        f"--- 看趋势 ---\n{json.dumps(trend_data, ensure_ascii=False, indent=2)}\n\n"
        f"--- 看对手 ---\n{json.dumps(competitor_data, ensure_ascii=False, indent=2)}\n\n"
        f"--- 看客户 ---\n{json.dumps(customer_data, ensure_ascii=False, indent=2)}\n\n"
        f"--- 搜索结果 ---\n{json.dumps(all_results, ensure_ascii=False, indent=2)[:6000]}"
    )
    result = call_deepseek_json(OPPORTUNITY_SYSTEM, context, model=model)
    print(f"  ✅ 分析完成")
    return result


def analyze_synthesis(trend: dict, comp: dict, cust: dict,
                      self_data: dict, opp: dict, model: str) -> dict:
    """交叉验证"""
    print(f"\n{'='*60}")
    print(f"🔗 Phase 3: 交叉验证")
    print(f"{'='*60}")
    context = (
        f"--- 看趋势 ---\n{json.dumps(trend, ensure_ascii=False, indent=2)}\n\n"
        f"--- 看对手 ---\n{json.dumps(comp, ensure_ascii=False, indent=2)}\n\n"
        f"--- 看客户 ---\n{json.dumps(cust, ensure_ascii=False, indent=2)}\n\n"
        f"--- 看自己 ---\n{json.dumps(self_data, ensure_ascii=False, indent=2)}\n\n"
        f"--- 看机会 ---\n{json.dumps(opp, ensure_ascii=False, indent=2)}"
    )
    result = call_deepseek_json(SYNTHESIS_SYSTEM, context, model=model)
    print(f"  ✅ 跨模块洞察: {len(result.get('cross_module_insights', []))} 条")
    print(f"  ✅ 矛盾识别: {len(result.get('conflicts', []))} 条")
    return result


def analyze_goal(synthesis: dict, model: str) -> dict:
    """定目标"""
    print(f"\n  📌 定目标...")
    context = f"交叉验证输出:\n{json.dumps(synthesis, ensure_ascii=False, indent=2)}"
    result = call_deepseek_json(GOAL_SYSTEM, context, model=model)
    indicators = result.get("technical_mvp", {}).get("indicators", [])
    print(f"    ✅ MVP指标: {len(indicators)} 个")
    return result


def analyze_strategy(goal: dict, model: str) -> dict:
    """定策略"""
    print(f"  📌 定策略...")
    context = f"定目标输出:\n{json.dumps(goal, ensure_ascii=False, indent=2)}"
    result = call_deepseek_json(STRATEGY_SYSTEM, context, model=model)
    print(f"    ✅ 推荐策略: {result.get('recommended_strategy', '—')}")
    return result


def analyze_plan(goal: dict, strategy: dict, model: str) -> dict:
    """定计划"""
    print(f"  📌 定计划...")
    context = (
        f"定目标:\n{json.dumps(goal, ensure_ascii=False, indent=2)}\n\n"
        f"定策略:\n{json.dumps(strategy, ensure_ascii=False, indent=2)}"
    )
    result = call_deepseek_json(PLAN_SYSTEM, context, model=model)
    print(f"    ✅ 里程碑: {len(result.get('milestones', []))} 个")
    return result


# =========================================================================
# Product direction parsing
# =========================================================================

PARSE_SYSTEM = '''你是一个输入解析器。将用户输入的产品方向拆解为结构化信息。
输出必须是JSON格式，包含：
- 技术域: "核心技术方向（材料、工艺、拓扑等）"
- 应用域: "目标市场或应用场景"
- 约束条件: "认证要求、成本目标、时间等限制因素（未指定则输出'未指定'）"'''


def parse_input(direction: str, model: str) -> dict:
    """Parse product direction into structured fields."""
    print(f"\n{'='*60}")
    print(f"📥 Phase 1: 输入解析")
    print(f"产品方向: {direction}")
    print(f"{'='*60}")
    print(f"  🌐 搜索产品背景信息...")
    context = f"用户输入的产品方向: {direction}"
    result = call_deepseek_json(PARSE_SYSTEM, context, model=model)
    print(f"  ✅ 技术域: {result.get('技术域', '—')}")
    print(f"  ✅ 应用域: {result.get('应用域', '—')}")
    print(f"  ✅ 约束条件: {result.get('约束条件', '—')}")
    return result


# =========================================================================
# Main Pipeline
# =========================================================================

def run_pipeline(direction: str, date_str: str = "",
                 model: str = DEFAULT_MODEL,
                 output_dir: str = "") -> dict:
    """Run the full 5S3D analysis pipeline."""
    if not date_str:
        date_str = date.today().isoformat()

    output_path = Path(output_dir) if output_dir else DEFAULT_OUTPUT_DIR
    output_path.mkdir(parents=True, exist_ok=True)

    start_time = time.time()

    # Phase 1: Input parsing
    parsed = parse_input(direction, model)
    tech_domain = parsed.get("技术域", "")
    app_domain = parsed.get("应用域", "")

    # Phase 2: 五看并行 (5 parallel agents)
    print(f"\n{'='*60}")
    print(f"🔍 Phase 2: 五看并行 (Parallel)")
    print(f"{'='*60}")

    with ThreadPoolExecutor(max_workers=5) as executor:
        futures = {
            executor.submit(analyze_trend, direction, tech_domain, app_domain, model): "trend",
            executor.submit(analyze_competitor, direction, tech_domain, app_domain, model): "competitor",
            executor.submit(analyze_customer, direction, tech_domain, app_domain, model): "customer",
        }
        results = {}
        for future in as_completed(futures):
            name = futures[future]
            results[name] = future.result()

        # 看自己 depends on competitor + customer
        results["self"] = analyze_self(
            direction, tech_domain, app_domain,
            results.get("competitor", {}), results.get("customer", {}), model,
        )

        # 看机会 depends on trend + competitor + customer
        results["opportunity"] = analyze_opportunity(
            direction, tech_domain, app_domain,
            results.get("trend", {}), results.get("competitor", {}),
            results.get("customer", {}), model,
        )

    trend = results.get("trend", {})
    comp = results.get("competitor", {})
    cust = results.get("customer", {})
    self_data = results.get("self", {})
    opp = results.get("opportunity", {})

    # Phase 3: Cross-validation
    synthesis = analyze_synthesis(trend, comp, cust, self_data, opp, model)

    # Phase 4: 三定决策 (Sequential)
    print(f"\n{'='*60}")
    print(f"🎯 Phase 4: 三定决策 (Sequential)")
    print(f"{'='*60}")
    goal = analyze_goal(synthesis, model)
    strategy = analyze_strategy(goal, model)
    plan = analyze_plan(goal, strategy, model)

    # Phase 5: Report Generation
    print(f"\n{'='*60}")
    print(f"📝 Phase 5: 报告生成")
    print(f"{'='*60}")
    elapsed = time.time() - start_time

    # Build args expected by report_generator
    wukan = [trend, comp, cust, self_data, opp]
    sanding = {"goal": goal, "strategy": strategy, "plan": plan}
    md_report, html_report = generate_reports(
        product_direction=direction,
        parsed=parsed,
        wukan=wukan,
        synthesis=synthesis,
        goal=goal,
        strategy=strategy,
        plan=plan,
        date_str=date_str,
        output_dir=str(output_path),
    )

    # Write files
    slug = re.sub(r'[^a-zA-Z0-9一-鿿\-]', '-', direction)[:60]
    slug = re.sub(r'-+', '-', slug).strip('-')
    md_path = output_path / f"{date_str}-{slug}-report.md"
    html_path = output_path / f"{date_str}-{slug}-report.html"

    md_path.write_text(md_report, encoding="utf-8")
    html_path.write_text(html_report, encoding="utf-8")

    print(f"\n{'='*60}")
    print(f"✅ 报告生成完成！耗时: {elapsed:.0f}s")
    print(f"📄 MD:  {md_path}")
    print(f"🌐 HTML: {html_path}")
    print(f"{'='*60}")

    return {
        "md_path": str(md_path),
        "html_path": str(html_path),
        "elapsed": elapsed,
        "direction": direction,
    }


# =========================================================================
# CLI Entry Point
# =========================================================================

def main():
    parser = argparse.ArgumentParser(
        description="五看三定AI战略洞察助手 (Five Views, Three Decisions)",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=(
            "示例:\n"
            "  python workflow.py \"卫星反作用飞轮电机\"\n"
            "  python workflow.py \"高功率密度电机\" --model deepseek-chat --output-dir ./reports\n"
            "  python workflow.py \"800V SiC电驱系统\" --date 2026-06-09\n"
        ),
    )
    parser.add_argument(
        "direction",
        nargs="+",
        help="新产品方向名称（可输入中英文混合，如 '卫星反作用飞轮电机'）",
    )
    parser.add_argument(
        "--model", default=DEFAULT_MODEL,
        help=f"DeepSeek模型名 (默认: {DEFAULT_MODEL})",
    )
    parser.add_argument(
        "--output-dir", default="",
        help=f"报告输出目录 (默认: {DEFAULT_OUTPUT_DIR})",
    )
    parser.add_argument(
        "--date", default="",
        help="报告日期，YYYY-MM-DD格式 (默认: 今天)",
    )

    args = parser.parse_args()
    direction = " ".join(args.direction)

    run_pipeline(
        direction=direction,
        date_str=args.date,
        model=args.model,
        output_dir=args.output_dir,
    )


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⏹ 用户中断")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ 流水线执行失败: {e}")
        traceback.print_exc()
        sys.exit(1)
