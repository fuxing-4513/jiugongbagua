// 快速测试：用教材案例验证大运分析新逻辑
import { analyzeJudgment } from '../src/lib/bazi-judgment.js';

// 案例1: 乾 壬申 甲辰 辛酉 癸巳（未土运 → 教材案例）
// 案例2: 坤 己未 庚午 乙卯 壬午（酉金运）
// 案例3: 乾 庚子 甲寅 甲午 甲子（用户测试八字）

const testCases = [
  {
    name: '乾壬申甲辰辛酉癸巳·未土运',
    pills: [
      {gan: '壬', zhi: '申', gz: '壬申'},
      {gan: '甲', zhi: '辰', gz: '甲辰'},
      {gan: '辛', zhi: '酉', gz: '辛酉'},
      {gan: '癸', zhi: '巳', gz: '癸巳'}
    ],
    riGan: '辛', gender: '男', birthYear: 1992,
    currentYear: 2026,
    currentDaYunGan: '己', currentDaYunZhi: '未'
  },
  {
    name: '乾庚子甲寅甲午甲子',
    pills: [
      {gan: '庚', zhi: '子', gz: '庚子'},
      {gan: '甲', zhi: '寅', gz: '甲寅'},
      {gan: '甲', zhi: '午', gz: '甲午'},
      {gan: '甲', zhi: '子', gz: '甲子'}
    ],
    riGan: '甲', gender: '男', birthYear: 1960,
    currentYear: 2026,
    currentDaYunGan: '戊', currentDaYunZhi: '寅'   // 假设
  },
  {
    name: '坤己未庚午乙卯壬午·酉金运',
    pills: [
      {gan: '己', zhi: '未', gz: '己未'},
      {gan: '庚', zhi: '午', gz: '庚午'},
      {gan: '乙', zhi: '卯', gz: '乙卯'},
      {gan: '壬', zhi: '午', gz: '壬午'}
    ],
    riGan: '乙', gender: '女', birthYear: 1979,
    currentYear: 2026,
    currentDaYunGan: '癸', currentDaYunZhi: '酉'
  }
];

for (const tc of testCases) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`>>> ${tc.name}`);
  console.log('='.repeat(60));
  try {
    const result = analyzeJudgment(
      tc.pills, tc.riGan, tc.gender, tc.birthYear,
      tc.currentYear, tc.currentDaYunGan, tc.currentDaYunZhi
    );
    if (result.daYunFourStepNarr) {
      console.log(result.daYunFourStepNarr.join('\n'));
    } else {
      console.log('(无大运分析输出)');
    }
  } catch (e: any) {
    console.log(`错误: ${e.message || e}`);
  }
}
