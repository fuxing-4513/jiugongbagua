// 六十四卦深度分析 schema——每卦一文件（gua-deep/{guaNN}.ts）
// 深度标准：对齐干支庚金范例——每卦 2000-3000 字原创深度（非简单说明——护城河内容）
export interface HexagramDeep {
  id: string            // gua01
  ming: string          // 卦名全称（乾为天）
  jian: string          // 卦德一句话（乾=健行不息）
  jingjie: string[]     // 卦辞精解（2-4 条——逐句解核心义理）
  tuan: string          // 彖传精义（该卦最核心一句的思想展开——原创解读）
  xiang: string         // 大象传精义（观象明理——君子以……的现代引申）
  yaojing: {           // 爻位精析（每卦选 3-6 个关键爻——不必六爻全——但初/中/上选）
    yao: string         // 爻题（初九/九二……上九）
    ci: string          // 爻辞（原文）
    jie: string         // 精解（150-300 字——义理+占断）
  }[]
  cuozong: {            // 卦变关系
    cuo: string         // 错卦（旁通——六爻全变）
    zong: string        // 综卦（覆卦——上下颠倒）
    bian: string        // 之卦示例（某爻动成什么——写最有名的一动）
  }
  liuyao: string        // 六爻/纳甲应用（该卦装卦后断事要点——世应位置/典型断语）
  shuwei: string        // 术数方位对应（后天八卦方位/五行/节气——八纯卦写宫位——非八纯卦写所属宫）
  xiandai: string       // 现代启示（原创——该卦在决策/组织/心理/人生阶段的当代应用——300-500 字——护城河核心）
  jiugong: string[]     // 九宫按（原创点评 2-3 条——易学史上的理解分歧/常见误解/读卦门径）
}
