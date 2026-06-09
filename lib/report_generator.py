"""
Report Generator for 五看三定 AI Strategic Analysis.

Generates clean MD and CSS-enhanced HTML reports from pipeline data.
Uses Jinja2 for HTML templating and string building for Markdown.
"""

import json
import os
import re
from datetime import date
from pathlib import Path

TEMPLATE_DIR = Path(__file__).resolve().parent.parent / "templates"


# =========================================================================
# HTML Report (Jinja2)
# =========================================================================

def _render_html(context: dict) -> str:
    """Render the full HTML report from the Jinja2 template."""
    from jinja2 import Environment, FileSystemLoader

    env = Environment(
        loader=FileSystemLoader(str(TEMPLATE_DIR)),
        autoescape=False,  # We control the content — no HTML in data
    )

    # Register custom filters
    def xml_wrap(value, tag):
        return f"<{tag}>{value}</{tag}>"
    env.filters["xml_wrap"] = xml_wrap

    def strip_parens(value):
        """Remove ALL parenthetical content: （...） and (...)."""
        import re
        if not value:
            return value
        # Remove all （中文括号及内容）
        value = re.sub(r'\s*（[^）]*）', '', value)
        # Remove all (English括号及内容)
        value = re.sub(r'\s*\([^)]*\)', '', value)
        return value.strip()
    env.filters["strip_parens"] = strip_parens

    def extract_parens(value):
        """Extract ONLY parenthetical content (source annotations)."""
        import re
        if not value:
            return ''
        parts = []
        # Extract （...）
        for m in re.finditer(r'（([^）]*)）', value):
            parts.append(m.group(1))
        # Extract (...)
        for m in re.finditer(r'\(([^)]*)\)', value):
            parts.append(m.group(1))
        return '；'.join(parts) if parts else ''
    env.filters["extract_parens"] = extract_parens

    def numval(value):
        """Extract numeric value from a mixed string like '2亿元' → 2.0."""
        if value is None:
            return 0
        if isinstance(value, (int, float)):
            return float(value)
        import re
        s = re.sub(r'[^0-9.\-]', '', str(value))
        try:
            return float(s) if s else 0
        except ValueError:
            return 0
    env.filters["numval"] = numval

    template = env.get_template("report-template.j2")
    return template.render(**context)


# =========================================================================
# Markdown Report (string builder)
# =========================================================================

def _generate_md(context: dict) -> str:
    """Generate clean Markdown report from pipeline data."""
    pd_ = context["product_direction"]
    date_str = context["date_str"]
    parsed = context.get("parsed", {})
    trend = context.get("trend", {})
    comp = context.get("comp", {})
    cust = context.get("cust", {})
    self_data = context.get("self_data", {})
    opp = context.get("opp", {})
    synthesis = context.get("synthesis", {})
    goal = context.get("goal", {})
    strategy = context.get("strategy", {})
    plan = context.get("plan", {})

    md = f"# 五看三定战略洞察报告：{pd_}\n\n"
    md += f"> 生成日期：{date_str} | 作者：Dr.-ING Jian WANG\n\n"
    md += "---\n\n"

    # ---- 目录 ----
    md += "## 目录\n\n"
    toc_items = [
        "一、执行摘要", "二、看趋势", "三、看对手",
        "四、看客户", "五、看自己", "六、看机会", "七、交叉验证洞察",
        "八、定目标", "九、定策略", "十、定计划", "十一、附录",
    ]
    for i, item in enumerate(toc_items, 1):
        md += f"{i}. {item}\n"
    md += "\n---\n\n"

    # 一、执行摘要
    md += "## 一、执行摘要\n\n"
    insights = synthesis.get("cross_module_insights", [])
    if insights:
        md += f"**核心发现**：{insights[0]}\n\n"
    md += f"本报告对「{pd_}」进行了五看三定全维度战略分析，基于公开网络信息从技术趋势、竞争格局、客户需求、自身能力、市场机会五个维度出发，经交叉验证后形成目标-策略-计划三层决策建议。\n\n"

    # --- Key metrics ---
    gap_count = len(self_data.get("capability_gap_matrix", []))
    growth = opp.get("market_growth_rate", "")
    ttm = goal.get("business_targets", {}).get("time_to_market", "")
    first_opp = opp.get("opportunity_funnel", [])[:1]
    tam_str = ""
    if first_opp:
        t = first_opp[0].get("tam", {})
        tam_str = f"{t.get('value', '')}{t.get('unit', '') or ''}"
    md += "| 指标 | 值 |\n|------|----|\n"
    if growth:
        md += f"| 市场增速 | {growth} |\n"
    if tam_str:
        md += f"| TAM规模 | {tam_str} |\n"
    if ttm:
        md += f"| 上市周期 | {ttm} |\n"
    if gap_count:
        md += f"| 关键差距 | {gap_count}项 |\n"
    md += "\n"

    # (分析方法已移至附录)

    # 三、看趋势
    md += "## 二、看趋势：行业与技术风向标\n\n"

    # --- 中国 vs 全球市场分拆 ---
    ms_trend = trend.get("market_split", {})
    if ms_trend.get("china") or ms_trend.get("global"):
        md += "**市场分拆：中国 vs 全球**\n\n"
        if ms_trend.get("china"):
            md += "🇨🇳 **中国**"
            md += f"\n- 概述：{ms_trend['china'].get('outlook', '')}" if ms_trend['china'].get('outlook') else ""
            md += f"\n- 需求：{ms_trend['china'].get('key_demand', '')}" if ms_trend['china'].get('key_demand') else ""
            md += f"\n- 政策：{ms_trend['china'].get('policy_drivers', '')}" if ms_trend['china'].get('policy_drivers') else ""
            md += "\n\n"
        if ms_trend.get("global"):
            md += "🌍 **全球**"
            md += f"\n- 概述：{ms_trend['global'].get('outlook', '')}" if ms_trend['global'].get('outlook') else ""
            md += f"\n- 需求：{ms_trend['global'].get('key_demand', '')}" if ms_trend['global'].get('key_demand') else ""
            md += f"\n- 政策：{ms_trend['global'].get('policy_drivers', '')}" if ms_trend['global'].get('policy_drivers') else ""
            md += "\n\n"

    lifecycle = trend.get("technology_lifecycle", "")
    if lifecycle:
        md += f"**技术生命周期判断**：{lifecycle}\n\n"
        if trend.get("lifecycle_evidence", []):
            md += "**判断依据**：\n"
            for e in trend.get("lifecycle_evidence", []):
                md += f"- {e}\n"
            md += "\n"
    else:
        md += "**技术生命周期判断**：数据不足\n\n"

    if trend.get("key_trends", []):
        md += "**关键趋势**：\n"
        for t in trend.get("key_trends", []):
            conf = t.get("confidence", "")
            md += f"- **{t.get('trend', '')}**（置信度：{conf}）\n"
        md += "\n"

    if trend.get("policy_landscape", []):
        md += "**政策环境**：\n"
        for p in trend.get("policy_landscape", []):
            md += f"- **{p.get('region', '')}**：{p.get('policy', '')} → {p.get('impact', '')}\n"
        md += "\n"

    if trend.get("standards", []):
        md += "**标准体系**：\n"
        for s in trend.get("standards", []):
            md += f"- {s.get('standard', '')}（{s.get('status', '')}，{s.get('relevance', '')}）\n"
        md += "\n"

    # --- 技术路线 ---
    roadmap = trend.get("technology_roadmap", [])
    if roadmap:
        md += "**技术路线代际对比**：\n\n"
        md += "| 世代 | 时间范围 | 关键特征 | 预期提升 | 成熟度 |\n"
        md += "|------|----------|----------|----------|--------|\n"
        for r in roadmap:
            features = "、".join(r.get("key_features", []))
            md += f"| {r.get('generation','')} | {r.get('timeframe','')} | {features} | {r.get('expected_improvement','')} | {r.get('maturity','')} |\n"
        md += "\n"

    # --- 需求总量趋势 ---
    demand_trends = trend.get("demand_volume_trends", [])
    if demand_trends:
        md += "**需求总量变化趋势**：\n\n"
        md += "| 时期 | 需求量 | 增长率 | 驱动因素 |\n"
        md += "|------|--------|--------|----------|\n"
        for d in demand_trends:
            md += f"| {d.get('year_or_period','')} | {d.get('volume','')}{d.get('unit','')} | {d.get('growth_rate','')} | {d.get('driver','')} |\n"
        md += "\n"

    # --- 分地区需求 ---
    reg_demand = trend.get("regional_demand", [])
    if reg_demand:
        md += "**分地区需求分布**：\n\n"
        md += f"| 地区 | 需求量 | 备注 |\n|------|--------|------|\n"
        for r in reg_demand:
            md += f"| {r.get('region','')} | {r.get('value','')}{r.get('unit','')} | {r.get('note','')} |\n"
        md += f"\n> 数据年份：{(reg_demand[0] or {}).get('year', '')}\n\n"

    # --- 价格分布 ---
    pt = trend.get("price_trends", {})
    if pt:
        md += "**价格分布与变化**：\n\n"
        md += f"- 入门级：{pt.get('entry_level_price','—')}\n"
        md += f"- 中端：{pt.get('mid_range_price','—')}\n"
        md += f"- 高端：{pt.get('high_end_price','—')}\n"
        md += f"- 单位：{pt.get('unit','—')}\n"
        yoy = pt.get('year_over_year_change', '—')
        if yoy != '—' and '%' not in str(yoy):
            yoy = str(yoy) + '%'
        md += f"- 同比变化：{yoy}\n"
        if pt.get("trend_description"):
            md += f"- 说明：{pt['trend_description']}\n"
        md += "\n"

    # 四、看对手
    md += "## 三、看对手：竞争格局全景图\n\n"

    # --- 中国 vs 全球市场分拆 ---
    ms_comp = comp.get("market_split", {})
    if ms_comp.get("china") or ms_comp.get("global"):
        md += "**市场分拆：中国 vs 全球**\n\n"
        if ms_comp.get("china"):
            md += "🇨🇳 **中国**"
            md += f"\n- 竞争格局：{ms_comp['china'].get('landscape_summary', '')}" if ms_comp['china'].get('landscape_summary') else ""
            md += f"\n- 主要玩家：{ms_comp['china'].get('key_players', '')}" if ms_comp['china'].get('key_players') else ""
            md += f"\n- 国产化：{ms_comp['china'].get('localization_trend', '')}" if ms_comp['china'].get('localization_trend') else ""
            md += "\n\n"
        if ms_comp.get("global"):
            md += "🌍 **全球**"
            md += f"\n- 竞争格局：{ms_comp['global'].get('landscape_summary', '')}" if ms_comp['global'].get('landscape_summary') else ""
            md += f"\n- 主要玩家：{ms_comp['global'].get('key_players', '')}" if ms_comp['global'].get('key_players') else ""
            md += f"\n- 进入壁垒：{ms_comp['global'].get('entry_barriers', '')}" if ms_comp['global'].get('entry_barriers') else ""
            md += "\n\n"

    summary = comp.get("competitive_landscape_summary")
    if summary:
        md += f"> **竞争格局总结**：{summary}\n\n"
    else:
        md += "**竞争格局总结**：数据不足\n\n"

    players = comp.get("top_players", [])
    if players:
        md += "| 公司 | 类型 | 地区 | 目标市场 | 关键参数 | 价格区间 | 年产量 | 年营收 | 主要客户 |\n"
        md += "|------|------|------|----------|----------|----------|--------|--------|----------|\n"
        for p in players:
            tp = p.get("technical_params", {})
            param_str = "; ".join([f"{k}={v}" for k, v in tp.items()][:3])
            custs = "、".join(p.get("key_customers", [])) if p.get("key_customers") else "-"
            md += f"| {p.get('name', '')} | {p.get('type', '')} | {p.get('region', '')} | {p.get('target_market', '-')} | {param_str or '-'} | {p.get('price_range', '-')} | {p.get('annual_production', '-')} | {p.get('annual_revenue', '-')} | {custs} |\n"
        md += "\n"
        # 技术路线补充
        for p in players:
            if p.get("technology_roadmap"):
                md += f"- **{p.get('name','')} 技术路线**：{p['technology_roadmap']}\n"
        if any(p.get("technology_roadmap") for p in players):
            md += "\n"

    # --- 市场份额 ---
    ms = comp.get("market_share_distribution", [])
    if ms:
        md += "**市场份额分布**：\n\n"
        for m in ms:
            rank_str = f"（第{m.get('rank')}名）" if m.get("rank") else ""
            md += f"- **{m.get('company','')}**{rank_str}：{m.get('share_pct', '')}%\n"
        md += "\n"

    # --- 价格总览 ---
    po = comp.get("pricing_overview", {})
    if po:
        md += "**竞品价格总览**：\n\n"
        md += f"- 入门级：{po.get('entry_level','—')}\n"
        md += f"- 中端：{po.get('mid_range','—')}\n"
        md += f"- 高端：{po.get('high_end','—')}\n"
        md += f"- 趋势：{po.get('trend','—')}\n\n"

    threats = comp.get("emerging_threats", [])
    if threats:
        md += "**新兴威胁**：\n"
        for t in threats:
            md += f"- ⚠️ {t}\n"
        md += "\n"

    # 五、看客户
    md += "## 四、看客户：真实需求与痛点\n\n"

    # --- 中国 vs 全球市场分拆 ---
    ms_cust = cust.get("market_split", {})
    if ms_cust.get("china") or ms_cust.get("global"):
        md += "**市场分拆：中国 vs 全球**\n\n"
        if ms_cust.get("china"):
            md += "🇨🇳 **中国**"
            md += f"\n- 客户特征：{ms_cust['china'].get('customer_profile', '')}" if ms_cust['china'].get('customer_profile') else ""
            md += f"\n- 痛点：{ms_cust['china'].get('pain_points', '')}" if ms_cust['china'].get('pain_points') else ""
            md += f"\n- 采购特点：{ms_cust['china'].get('procurement_characteristics', '')}" if ms_cust['china'].get('procurement_characteristics') else ""
            md += "\n\n"
        if ms_cust.get("global"):
            md += "🌍 **全球**"
            md += f"\n- 客户特征：{ms_cust['global'].get('customer_profile', '')}" if ms_cust['global'].get('customer_profile') else ""
            md += f"\n- 痛点：{ms_cust['global'].get('pain_points', '')}" if ms_cust['global'].get('pain_points') else ""
            md += f"\n- 采购特点：{ms_cust['global'].get('procurement_characteristics', '')}" if ms_cust['global'].get('procurement_characteristics') else ""
            md += "\n\n"

    top_priority = cust.get("value_proposition_match", {}).get("top_priority")
    if top_priority:
        md += f"> **客户最关注**：{top_priority}\n\n"
    else:
        md += "**客户最关注**：数据不足\n\n"

    pain_points = cust.get("pain_points", [])
    if pain_points:
        md += "**痛点分析**：\n"
        for p in pain_points:
            freq = p.get("frequency", "")
            md += f"- **{p.get('pain', '')}**（频次：{freq}）\n"
            for q in p.get("quotes", []):
                md += f"  - \"{q}\"\n"
        md += "\n"

    what_want = cust.get("value_proposition_match", {}).get("what_customers_want", [])
    if what_want:
        md += "**客户价值诉求**：\n"
        for w in what_want:
            md += f"- {w}\n"
        md += "\n"

    # --- 客户细分 ---
    segs = cust.get("customer_segments", [])
    if segs:
        md += "**客户细分及需求规模**：\n\n"
        md += "| 细分 | 描述 | 需求规模 | 预算范围 | 采购周期 | 核心要求 | 增长潜力 |\n"
        md += "|------|------|----------|----------|----------|----------|----------|\n"
        for s in segs:
            reqs = "、".join(s.get("key_requirements", []))
            md += f"| {s.get('segment_name','')} | {s.get('description','')} | {s.get('demand_volume','—')} | {s.get('budget_range','—')} | {s.get('procurement_cycle','—')} | {reqs} | {s.get('growth_potential','—')} |\n"
        md += "\n"

    # --- 主要客户 ---
    major_custs = cust.get("major_customers", [])
    if major_custs:
        md += "**主要客户/采购方**：\n\n"
        md += "| 客户 | 地区 | 规模 | 核心要求 | 采购量 | 关系 |\n"
        md += "|------|------|------|----------|--------|------|\n"
        for c in major_custs:
            md += f"| {c.get('name','')} | {c.get('region','')} | {c.get('fleet_size_or_scale','—')} | {c.get('requirements','')} | {c.get('procurement_volume','—')} | {c.get('relationship_status','—')} |\n"
        md += "\n"

    # --- 采购模式 ---
    pp = cust.get("procurement_patterns", {})
    if pp:
        md += "**采购模式**：\n\n"
        md += f"- **典型订单量**：{pp.get('typical_order_volume','—')}\n"
        md += f"- **决策因素**：{' → '.join(pp.get('decision_factors', []))}\n"
        md += f"- **认证要求**：{'、'.join(pp.get('certification_requirements', []))}\n"
        md += f"- **交付周期**：{pp.get('lead_time_expectation','—')}\n\n"

    # 六、看自己
    md += "## 五、看自己：能力与差距\n\n"
    sc = self_data.get("self_capabilities", {})
    if sc.get("provided_by_user"):
        md += f"**自身能力描述**：{sc.get('description', '')}\n\n"
    else:
        md += "> ⚠️ 未提供自身能力数据。以下为基于竞品和客户需求的标准差距模板，请补充我司能力后进行精准分析。\n\n"

    gap_matrix = self_data.get("capability_gap_matrix", [])
    if gap_matrix:
        md += "| 维度 | 竞品标杆 | 客户需求 | 我司能力 | 差距 | 关键程度 |\n"
        md += "|------|----------|----------|----------|------|----------|\n"
        for g in gap_matrix:
            md += f"| {g.get('dimension', '')} | {g.get('competitor_benchmark', '')} | {g.get('customer_requirement', '')} | {g.get('our_capability', '')} | {g.get('gap', '')} | {g.get('criticality', '')} |\n"
        md += "\n"

    assets = self_data.get("strategic_assets", [])
    bottlenecks = self_data.get("resource_bottlenecks", [])
    if assets:
        md += f"**战略资产**：{'、'.join(assets)}\n\n"
    if bottlenecks:
        md += f"**资源瓶颈**：{'、'.join(bottlenecks)}\n\n"

    # 六、看机会
    md += "## 六、看机会：战略机会点\n\n"

    # --- 中国 vs 全球市场分拆 ---
    ms_opp = opp.get("market_split", {})
    if ms_opp.get("china") or ms_opp.get("global"):
        md += "**市场分拆：中国 vs 全球**\n\n"
        if ms_opp.get("china"):
            md += "🇨🇳 **中国**"
            md += f"\n- TAM：{ms_opp['china'].get('tam_summary', '')}" if ms_opp['china'].get('tam_summary') else ""
            md += f"\n- 增长：{ms_opp['china'].get('growth_rate', '')}" if ms_opp['china'].get('growth_rate') else ""
            md += f"\n- 机会：{'；'.join(ms_opp['china'].get('key_opportunities', []))}" if ms_opp['china'].get('key_opportunities') else ""
            md += f"\n- 风险：{ms_opp['china'].get('risks', '')}" if ms_opp['china'].get('risks') else ""
            md += "\n\n"
        if ms_opp.get("global"):
            md += "🌍 **全球**"
            md += f"\n- TAM：{ms_opp['global'].get('tam_summary', '')}" if ms_opp['global'].get('tam_summary') else ""
            md += f"\n- 增长：{ms_opp['global'].get('growth_rate', '')}" if ms_opp['global'].get('growth_rate') else ""
            md += f"\n- 机会：{'；'.join(ms_opp['global'].get('key_opportunities', []))}" if ms_opp['global'].get('key_opportunities') else ""
            md += f"\n- 风险：{ms_opp['global'].get('risks', '')}" if ms_opp['global'].get('risks') else ""
            md += "\n\n"

    verdict = opp.get("summary_verdict", "")
    growth_val = opp.get("market_growth_rate", "")
    if verdict:
        md += f"**市场规模判断**：{verdict}\n"
    if growth_val:
        md += f"**市场增长率**：{growth_val}\n"
    md += "\n"

    funnel = opp.get("opportunity_funnel", [])
    if funnel:
        funnel_sorted = sorted(funnel, key=lambda x: x.get("priority_rank", 999))
        md += "| # | 机会点 | Ansoff | 🇨🇳 中国TAM | 🌍 全球TAM | SAM | SOM | 吸引力 | 胜率 |\n"
        md += "|---|--------|--------|------------|-----------|-----|-----|--------|------|\n"
        for i, o in enumerate(funnel_sorted, 1):
            tam_cn = o.get("tam_china", {})
            tam_gl = o.get("tam_global", {})
            sam = o.get("sam", {})
            som = o.get("som", {})
            tam_cn_s = f"{tam_cn.get('value', '')}{tam_cn.get('unit', '') or ''}" if tam_cn else ""
            tam_gl_s = f"{tam_gl.get('value', '')}{tam_gl.get('unit', '') or ''}" if tam_gl else ""
            sam_s = f"{sam.get('value', '')}{sam.get('unit', '') or ''}" if sam else ""
            som_s = f"{som.get('value', '')}{som.get('unit', '') or ''}" if som else ""
            tam_cn_year = tam_cn.get('year', '') if tam_cn else ''
            tam_gl_year = tam_gl.get('year', '') if tam_gl else ''
            if tam_cn_year:
                tam_cn_s += f"（{tam_cn_year}）"
            if tam_gl_year:
                tam_gl_s += f"（{tam_gl_year}）"
            md += f"| {i} | {o.get('opportunity', '')} | {o.get('ansoff_quadrant', '-')} | {tam_cn_s} | {tam_gl_s} | {sam_s} | {som_s} | {o.get('attractiveness', '-')} | {o.get('win_probability', '-')} |\n"
        md += "\n"

    # --- 需求总量预测 ---
    forecast = opp.get("demand_forecast", [])
    if forecast:
        md += "**需求总量预测**：\n\n"
        md += "| 年份 | 市场需求 | 增长 | 驱动因素 |\n"
        md += "|------|----------|------|----------|\n"
        for f in forecast:
            v_val = f.get("total_demand_value", "") or ""
            v_unit = (f.get("total_demand_unit", "") or "")
            vol = str(v_val) + str(v_unit)
            if f.get("volume_if_available"):
                vol += f"（{f['volume_if_available']}{f.get('unit_if_available', '') or ''}）"
            md += f"| {f.get('year','')} | {vol} | {f.get('growth_rate','')} | {f.get('key_driver','')} |\n"
        md += "\n"

    # --- 市场细分 ---
    segs = opp.get("market_segmentation", [])
    if segs:
        md += "**市场细分结构**：\n\n"
        for sg in segs:
            md += f"**{sg.get('segment','')}**：\n\n"
            md += "| 子市场 | TAM | 增长率 | 占比 |\n"
            md += "|--------|-----|--------|------|\n"
            for sub in sg.get("sub_segments", []):
                md += f"| {sub.get('name','')} | {sub.get('tam','')}{sub.get('tam_unit','') or ''} | {sub.get('growth_rate','—')} | {sub.get('share_pct','—')} |\n"
            md += "\n"

    # --- 价格分析 ---
    pa = opp.get("price_analysis", {})
    if pa:
        md += "**价格分析**：\n\n"
        el = pa.get("entry_level", {})
        mr = pa.get("mid_range", {})
        he = pa.get("high_end", {})
        md += f"- **入门级**：{el.get('price','—')}{el.get('unit','') or ''}（{el.get('typical_application','—')}）\n"
        md += f"- **中端**：{mr.get('price','—')}{mr.get('unit','') or ''}（{mr.get('typical_application','—')}）\n"
        md += f"- **高端**：{he.get('price','—')}{he.get('unit','') or ''}（{he.get('typical_application','—')}）\n"
        md += f"- **趋势**：{pa.get('price_trend','—')}\n"
        if pa.get("price_drivers"):
            md += f"- **影响因素**：{'、'.join(pa['price_drivers'])}\n"
        md += "\n"

    # 八、交叉验证
    md += "## 七、交叉验证洞察\n\n"
    conflicts = synthesis.get("conflicts", [])
    if conflicts:
        md += "### 矛盾与风险\n\n"
        for c in conflicts:
            sev = c.get("severity", "")
            md += f"- **[{sev}]** {c.get('description', '')}\n"
            if c.get("resolution"):
                md += f"  - 解释：{c['resolution']}\n"
        md += "\n"

    if insights:
        md += "### 跨模块关联发现\n\n"
        for ins in insights:
            md += f"- {ins}\n"
        md += "\n"

    prioritized = synthesis.get("prioritized_opportunities", [])
    if prioritized:
        md += "### 机会优先级排序\n\n"
        md += "| 机会 | 评分 | 依据 |\n"
        md += "|------|------|------|\n"
        for o in prioritized:
            md += f"| {o.get('opportunity', '')} | {o.get('score', '')} | {o.get('rationale', '')} |\n"
        md += "\n"

    # 九、定目标
    md += "## 八、定目标：产品与商业红线\n\n"
    indicators = goal.get("technical_mvp", {}).get("indicators", [])
    if indicators:
        md += "### 技术红线（MVP关键指标）\n\n"
        md += "| 参数 | 目标值 | 依据 |\n"
        md += "|------|--------|------|\n"
        for ind in indicators:
            md += f"| {ind.get('param', '')} | {ind.get('target', '')} | {ind.get('basis', '')} |\n"
        md += "\n"

    certs = goal.get("technical_mvp", {}).get("required_certifications", [])
    if certs:
        md += f"**必须认证**：{'、'.join(certs)}\n\n"

    mvp_v = goal.get("technical_mvp", {}).get("mvp_verdict", "")
    if mvp_v:
        md += f"**MVP定位**：{mvp_v}\n\n"

    bt = goal.get("business_targets", {})
    md += "### 商业目标\n\n"
    md += f"- **上市时间**：{bt.get('time_to_market', '待定')}\n"
    md += f"- **目标成本**：{bt.get('target_cost', '待定')}\n"
    md += f"- **首年销量**：{bt.get('first_year_sales_estimate', '待定')}\n\n"

    # 十、定策略
    md += "## 九、定策略：差异化制胜点\n\n"
    rec = strategy.get("recommended_strategy", "")
    rationale = strategy.get("rationale", "")
    if rec:
        md += f"**推荐策略**：**{rec}**\n\n"
        if rationale:
            md += f"**理由**：{rationale}\n\n"

    edges = strategy.get("differentiation_edges", [])
    if edges:
        md += "**差异化支撑**：\n"
        for e in edges:
            md += f"- ✅ {e}\n"
        md += "\n"

    rejected = strategy.get("rejected_strategies", [])
    if rejected:
        md += "**已排除策略**：\n"
        for r in rejected:
            md += f"- ❌ {r.get('strategy', '')}：{r.get('reason', '')}\n"
        md += "\n"

    # 十一、定计划
    md += "## 十、定计划：研发路线图\n\n"
    milestones = plan.get("milestones", [])
    if milestones:
        md += "### 里程碑\n\n"
        md += "| 阶段 | 时间 | 关键交付物 |\n"
        md += "|------|------|----------|\n"
        for m in milestones:
            md += f"| {m.get('phase', '')} | {m.get('timeline', '')} | {m.get('deliverables', '')} |\n"
        md += "\n"

    risks = plan.get("top_risks", [])
    if risks:
        md += "### Top 技术风险\n\n"
        for r in risks:
            md += f"1. **{r.get('risk', '')}**（影响阶段：{r.get('affected_phase', '')}）\n"
            md += f"   - 缓解措施：{r.get('mitigation', '')}\n"
        md += "\n"

    res = plan.get("resource_suggestions", "")
    if res:
        md += "### 资源建议\n\n"
        md += f"{res}\n\n"

    # 十二、附录
    md += "## 十一、附录\n\n"

    # A · 分析方法
    md += "### A · 分析方法\n\n"
    md += "本报告采用基于IPD DSTE体系的**五看三定**方法论，通过多智能体并行搜索 → 交叉验证 → 递进决策三层流水线生成。\n\n"
    md += "**分析流程**\n\n"
    md += "1. **Phase 1 · 输入解析** — 解析产品方向 → 技术域 / 应用域 / 约束条件\n"
    md += "2. **Phase 2 · 五看（5×并行搜索+AI分析）** — 看趋势 / 看对手 / 看客户 / 看自己 / 看机会\n"
    md += "3. **Phase 3 · 交叉验证** — 去重 · 矛盾识别 · 跨模块关联 · 优先级排序\n"
    md += "4. **Phase 4 · 三定（3×递进决策）** — 定目标 → 定策略 → 定计划\n\n"

    md += "**搜索范围**\n\n"
    md += "| 来源 | 类型 | 说明 |\n"
    md += "|------|------|------|\n"
    md += "| 🔍 DuckDuckGo | Web Search | 中英文关键词搜索，按产品方向/技术域/应用域多维度查询，结果去重 |\n"
    md += "| 🤖 DeepSeek AI | LLM Analysis | DeepSeek-v4-flash / deepseek-chat 模型，对所有搜索数据进行结构化分析 |\n"
    md += "| 📚 Wikipedia | 参考补充 | 用于技术概念验证和基本原理查证 |\n\n"

    md += "**分析参数**\n\n"
    md += f"- **产品方向**：{pd_}\n"
    md += f"- **技术域**：{parsed.get('技术域', '—')}\n"
    md += f"- **应用域**：{parsed.get('应用域', '—')}\n"
    md += f"- **约束条件**：{parsed.get('约束条件', '未指定')}\n"
    md += f"- **搜索范围**：DuckDuckGo Web Search (中英文) + DeepSeek AI + Wikipedia\n"
    md += f"- **分析引擎**：DeepSeek-v4-flash / deepseek-chat\n"
    md += f"- **生成日期**：{date_str}\n\n"

    # B · 数据来源
    md += "### B · 数据来源 / References\n\n"
    refs = context.get("references", [])
    if refs:
        for i, r in enumerate(refs, 1):
            title = r.get("title", "")
            url = r.get("url", "")
            domain = r.get("domain", "")
            md += f"{i}. **{title}**"
            if domain:
                md += f" [{domain}]"
            if url:
                md += f" — {url}"
            md += "\n"
        md += "\n"
    else:
        md += "报告生成过程中收集的参考来源将在完善数据结构后呈现。\n\n"

    # C · 缩写说明
    md += "### C · 缩写说明\n\n"
    md += "| 缩写 | 全称 | 中文含义 |\n"
    md += "|------|------|----------|\n"
    md += "| **TAM** | Total Addressable Market | 总可寻址市场，产品或服务在理想情况下能达到的最大市场规模 |\n"
    md += "| **SAM** | Serviceable Available Market | 可服务市场，产品/渠道能触达的市场部分 |\n"
    md += "| **SOM** | Serviceable Obtainable Market | 可获得市场，短期内实际能拿下的市场份额 |\n"
    md += "| **CAGR** | Compound Annual Growth Rate | 复合年增长率，衡量投资或市场在特定时期内的年均增长速度 |\n"
    md += "| **BLDC** | Brushless DC Motor | 无刷直流电机，电子换向的永磁同步电机 |\n"
    md += "| **PMSM** | Permanent Magnet Synchronous Motor | 永磁同步电机，高效率、高功率密度的交流电机 |\n"
    md += "| **PHM** | Prognostics and Health Management | 故障预测与健康管理，设备状态监测和寿命预测技术 |\n"
    md += "| **MVP** | Minimum Viable Product | 最小可行产品，满足核心功能的最简产品版本 |\n"
    md += "| **BOM** | Bill of Materials | 物料清单，产品所需所有零部件的清单和成本 |\n"
    md += "| **ITAR** | International Traffic in Arms Regulations | 国际武器贸易条例，美国对国防相关技术的出口管制 |\n"
    md += "| **ECSS** | European Cooperation for Space Standardization | 欧洲空间标准化合作组织，制定航天领域统一标准 |\n"
    md += "| **GJB** | 国军标（Guo Jun Biao） | 中国军用标准，军用产品的质量和技术规范 |\n\n"

    # D · 方法声明
    md += "### D · 方法声明\n\n"
    md += "> 本报告由五看三定AI战略洞察助手 v1.0 自动生成。数据来源于 DuckDuckGo 公开网络搜索（中英文多维度查询），经 DeepSeek AI 模型进行结构化分析和推理。交叉验证环节对五看结果进行矛盾识别和优先级排序。建议在正式 Charter 评审前由人工核实关键数据点的准确性。\n\n"
    md += "> ⚠️ 本报告中的市场数据、竞争对手信息、技术参数等均基于公开网络信息，可能存在时效性和完整性问题。所有分析结论仅供战略决策参考，不构成投资建议。\n"

    return md


# =========================================================================
# Public API
# =========================================================================

def build_context(product_direction: str, parsed: dict, wukan: list,
                  synthesis: dict, goal: dict, strategy: dict, plan: dict,
                  date_str: str, search_results: dict = None) -> dict:
    """Build the template context dictionary from pipeline data."""
    trend = wukan[0] if len(wukan) > 0 else {}
    comp = wukan[1] if len(wukan) > 1 else {}
    cust = wukan[2] if len(wukan) > 2 else {}
    self_data = wukan[3] if len(wukan) > 3 else {}
    opp = wukan[4] if len(wukan) > 4 else {}

    # Extract references from all data sources
    references = _extract_references(trend, comp, search_results)

    return {
        "product_direction": product_direction,
        "date_str": date_str,
        "parsed": parsed,
        "trend": trend,
        "comp": comp,
        "cust": cust,
        "self_data": self_data,
        "opp": opp,
        "synthesis": synthesis,
        "goal": goal,
        "strategy": strategy,
        "plan": plan,
        "references": references,
    }


def _extract_references(trend: dict, comp: dict,
                        search_results: dict = None) -> list[dict]:
    """Extract reference list from trend/competitor data and raw search results."""
    seen_urls = set()
    refs = []

    # From key_trends
    for t in trend.get("key_trends", []):
        url = t.get("source_url", "")
        if url and url not in seen_urls:
            seen_urls.add(url)
            refs.append({
                "title": t.get("trend", "技术趋势"),
                "url": url,
                "domain": "技术趋势",
            })

    # From competitors
    for p in comp.get("top_players", []):
        for url in p.get("source_urls", []):
            if url and url not in seen_urls:
                seen_urls.add(url)
                refs.append({
                    "title": f"{p.get('name', '竞争对手')} — 产品信息",
                    "url": url,
                    "domain": "竞争对手",
                })

    # From raw search results (if provided)
    if search_results:
        for src_type, results in search_results.items():
            domain_label = {
                "trend": "技术趋势", "comp": "竞争对手",
                "cust": "客户需求", "self": "自身能力", "opp": "市场机会",
            }.get(src_type, "网络搜索")
            for r in (results or []):
                url = r.get("href", r.get("url", ""))
                title = r.get("title", r.get("body", ""))
                if url and url not in seen_urls and title:
                    seen_urls.add(url)
                    refs.append({
                        "title": title[:120],
                        "url": url,
                        "domain": domain_label,
                    })

    return refs


def generate_reports(product_direction: str, parsed: dict, wukan: list,
                     synthesis: dict, goal: dict, strategy: dict, plan: dict,
                     date_str: str, search_results: dict = None,
                     output_dir: str = None) -> tuple:
    """Generate both MD and HTML reports.

    Returns:
        tuple: (md_content: str, html_content: str)
    """
    if not output_dir:
        output_dir = Path(__file__).resolve().parent.parent.parent.parent / "docs" / "5s3d-reports"
        os.makedirs(output_dir, exist_ok=True)

    context = build_context(
        product_direction, parsed, wukan, synthesis,
        goal, strategy, plan, date_str, search_results,
    )

    md_content = _generate_md(context)
    html_content = _render_html(context)

    slug = _generate_slug(product_direction)
    md_path = Path(output_dir) / f"{date_str}-{slug}-report.md"
    html_path = Path(output_dir) / f"{date_str}-{slug}-report.html"

    with open(md_path, "w", encoding="utf-8") as f:
        f.write(md_content)
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(html_content)

    return md_content, html_content


def _generate_slug(text: str) -> str:
    """Generate URL-safe slug from Chinese/English text."""
    slug = re.sub(r"[^\w一-鿿]", "-", text)
    slug = re.sub(r"-+", "-", slug)
    slug = slug.strip("-")
    return slug[:60]
