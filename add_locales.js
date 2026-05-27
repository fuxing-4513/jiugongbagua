const fs = require('fs');
const base = 'C:/Users/4513/.openclaw/workspace/jiugong-bagua/src/lib/locales/';

// Add to zh-CN
let c = fs.readFileSync(base + 'zh-CN.ts', 'utf8');
c = c.replace(/\s+taluo: \{/, `\n    fengshui: { name:'风水罗盘', desc: '八宅风水、九宫飞星、房屋布局分析', emoji: '🧭' },
    chenggu: { name:'称骨算命', desc: '袁天罡称骨法，测算一生福禄', emoji: '⚖️' },
    shengxiao: { name:'生肖运势', desc: '十二生肖每日每周每月运势', emoji: '🐉' },
    xingzuo: { name:'星座占卜', desc: '十二星座每日运势和性格分析', emoji: '♈' },
    qimen: { name:'奇门遁甲', desc: '三奇八门排盘预测吉凶', emoji: '🌀' },
    meihua: { name:'梅花易数', desc: '万物皆可占的易学方法', emoji: '🌸' },
    lingqian: { name:'灵签占卜', desc: '在线抽签，观音灵签吕祖灵签', emoji: '🏮' },\n    taluo: {`);
fs.writeFileSync(base + 'zh-CN.ts', c);

// Add to en
c = fs.readFileSync(base + 'en.ts', 'utf8');
c = c.replace(/\s+taluo: \{/, `\n    fengshui: { name:'Feng Shui Compass', desc: 'Eight house flying star Feng Shui analysis', emoji: '🧭' },
    chenggu: { name:'Bone Weight Fortune', desc: 'Yuan Tiangang bone weight fortune telling', emoji: '⚖️' },
    shengxiao: { name:'Zodiac Horoscope', desc: 'Daily weekly monthly Chinese zodiac horoscope', emoji: '🐉' },
    xingzuo: { name:'Horoscope', desc: 'Daily horoscope and zodiac personality analysis', emoji: '♈' },
    qimen: { name:'Qi Men Dun Jia', desc: 'Mysterious Gate divination', emoji: '🌀' },
    meihua: { name:'Plum Blossom I-Ching', desc: 'Everything can be divined', emoji: '🌸' },
    lingqian: { name:'Lottery Fortune', desc: 'Online divination sticks', emoji: '🏮' },\n    taluo: {`);
fs.writeFileSync(base + 'en.ts', c);

// Add to zh-TW
c = fs.readFileSync(base + 'zh-TW.ts', 'utf8');
c = c.replace(/\s+taluo: \{/, `\n    fengshui: { name:'風水羅盤', desc: '八宅風水、九宮飛星、房屋佈局分析', emoji: '🧭' },
    chenggu: { name:'稱骨算命', desc: '袁天罡稱骨法，測算一生福祿', emoji: '⚖️' },
    shengxiao: { name:'生肖運勢', desc: '十二生肖每日每週每月運勢', emoji: '🐉' },
    xingzuo: { name:'星座占卜', desc: '十二星座每日運勢和性格分析', emoji: '♈' },
    qimen: { name:'奇門遁甲', desc: '三奇八門排盤預測吉凶', emoji: '🌀' },
    meihua: { name:'梅花易數', desc: '萬物皆可占的易學方法', emoji: '🌸' },
    lingqian: { name:'靈籤占卜', desc: '在線抽籤，觀音靈籤呂祖靈籤', emoji: '🏮' },\n    taluo: {`);
fs.writeFileSync(base + 'zh-TW.ts', c);

console.log('All locales updated');
