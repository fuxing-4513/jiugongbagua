import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '常见问题 - 九宫八卦',
  description: '关于九宫八卦命理平台的常见问题解答，涵盖使用说明、命理解读、隐私安全等内容。',
};

const faqs = [
  {
    q: '九宫八卦是什么？',
    a: '九宫八卦是一个中国传统命理文化在线平台，提供八字算命、紫微斗数、六爻占卜、小六壬、周公解梦、姓名打分、风水布局、奇门遁甲、梅花易数等多种命理工具，帮助用户了解自身命运走向。',
  },
  { q: '使用这个平台需要付费吗？', a: '大部分基础功能完全免费，包括八字排盘、每日运势、黄历查询等。高级功能（如AI深度分析、详细命理报告等）需开通VIP会员。' },
  { q: '命理推算的结果准确吗？', a: '命理学是中国传统文化的重要组成部分，已有数千年历史。我们的算法基于传统命理经典理论，但结果仅供娱乐参考，请勿过度依赖。命运掌握在自己手中。' },
  { q: '如何保护我的隐私？', a: '所有排盘计算均在浏览器本地完成，我们不会上传或存储您的个人信息。生日等敏感数据仅用于当次计算，不会被发送到服务器。' },
  { q: '什么是八字（四柱命理）？', a: '八字是根据出生年月日时的天干地支组成的八个字，反映一个人的先天命格。年柱代表根基，月柱代表父母与少年，日柱代表自身与配偶，时柱代表子女与晚年。' },
  { q: '紫微斗数和八字有什么区别？', a: '八字以天干地支为基础，推算五行生克；紫微斗数以星曜为核心，分析十二宫格局。两者都是中华传统命理的重要分支，各有侧重，可以互相参考。' },
  { q: '支持哪些语言？', a: '目前支持简体中文、繁体中文和英文三种语言，可通过导航栏的语言切换按钮进行切换。' },
  { q: '如何联系客服？', a: '如有问题或建议，请通过专家预约页面提交咨询，或发送邮件至我们的客服邮箱。我们会在24小时内回复。' },
];

export default function FAQPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gold-400 font-serif mb-2">常见问题</h1>
      <p className="text-gray-400 mb-8">关于九宫八卦命理平台的常见疑问解答</p>
      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <details key={i} className="bg-dark-800 border border-dark-600 rounded-lg group">
            <summary className="px-5 py-4 cursor-pointer text-gray-200 font-medium hover:text-gold-400 transition-colors select-none">
              {faq.q}
            </summary>
            <div className="px-5 pb-4 text-sm text-gray-400 leading-relaxed border-t border-dark-700 pt-3">
              {faq.a}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
