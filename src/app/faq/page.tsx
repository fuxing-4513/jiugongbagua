import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '常见问题 - 九宫八卦',
  description: '关于九宫八卦命理平台的常见问题解答，涵盖入门指南、准确度、隐私安全、功能选择、收费说明、技术支持等。',
};

const categories = [
  { id: 'beginner', title: '🚀 入门指南', desc: '第一次来，怎么开始？需要什么信息？' },
  { id: 'accuracy', title: '🎯 准确性与适用范围', desc: 'AI 算的准吗？结果怎么理解？' },
  { id: 'privacy', title: '🔒 隐私与数据安全', desc: '出生信息会被怎么处理？' },
  { id: 'features', title: '🧰 功能与体系选择', desc: '八字/紫微/六爻/梅花，我适合用哪个？' },
  { id: 'pricing', title: '💰 收费说明', desc: '免费的部分有哪些？VIP 有什么？' },
  { id: 'technical', title: '📱 技术与设备', desc: '手机能用吗？支持离线吗？' },
];

const faqs = [
  { q: '九宫八卦是什么？', a: '九宫八卦是一个中国传统命理文化在线平台，提供八字算命、紫微斗数、六爻占卜、小六壬、周公解梦、姓名打分、风水布局、奇门遁甲、梅花易数等 19+ 种命理工具。以古籍原文为根基，结合 AI 智能分析，帮助用户了解自身命运走向。', category: 'beginner' },
  { q: '第一次使用，从哪里开始？', a: '推荐从「四柱八字」开始——只需输入出生年月日时，系统自动生成命盘和解读。首页也有「八字命理课堂」帮助入门。想快速占卜可以试试「小六壬」或「六爻占卜」。', category: 'beginner' },
  { q: '使用这个平台需要付费吗？', a: '大部分基础功能完全免费，包括八字排盘、每日运势、黄历查询等。高级功能（如 AI 深度分析、详细命理报告等）需开通 VIP 会员。', category: 'pricing' },
  { q: 'VIP 会员有什么权益？', a: 'VIP 会员可享受 AI 深度命理分析、合婚详解、完整命盘报告、优先体验新功能等权益。基础排盘和日常查询始终免费。', category: 'pricing' },
  { q: '命理推算的结果准确吗？', a: '命理学是中国传统文化的重要组成部分，已有数千年历史。我们的算法基于《滴天髓》《紫微斗数全书》《周易》等传统命理经典理论，但结果仅供娱乐参考，请勿过度依赖。命运掌握在自己手中。', category: 'accuracy' },
  { q: 'AI 批命与真人命理师有什么区别？', a: 'AI 批命基于经典古籍算法和大量命例训练，能快速给出系统性分析，适合入门了解。真人命理师能结合个人气场、面相、实际环境做出更灵活的判断。两者可互补参考。', category: 'accuracy' },
  { q: '如何保护我的隐私？', a: '所有排盘计算均在浏览器本地完成，我们不会上传或存储您的个人信息。生辰等敏感数据仅用于当次计算，不会被发送到服务器。详见隐私政策。', category: 'privacy' },
  { q: '八字、紫微斗数、六爻有什么区别，我该用哪个？', a: '八字以天干地支为基础，推算五行生克和一生大运，适合了解整体命运格局；紫微斗数以星曜为核心，分析十二宫，适合深入了解性格和各方运势；六爻占卜针对具体问题起卦，适合短期决策参考；梅花易数灵活快捷，万物皆可占。可以根据你的需求选择。', category: 'features' },
  { q: '支持哪些语言？', a: '目前支持简体中文、繁体中文和英文三种语言，可通过导航栏的语言切换按钮进行切换。', category: 'technical' },
  { q: '手机能用吗？', a: '完全支持手机端使用，所有功能均已适配移动浏览器。建议在浏览器中添加到主屏幕，体验类似原生 App。', category: 'technical' },
  { q: '如何联系客服？', a: '请访问联系我们页面获取联系方式，或通过专家预约页面提交咨询。常见问题可在帮助中心找到答案。', category: 'technical' },
];

export default function FAQPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gold-400 font-serif mb-2">常见问题</h1>
      <p className="text-gray-400 mb-8">关于九宫八卦命理平台的常见疑问解答</p>

      {/* 分类导航 */}
      <div className="flex flex-wrap gap-2 mb-10">
        {categories.map((cat) => (
          <a key={cat.id} href={`#cat-${cat.id}`}
            className="text-xs px-3 py-1.5 rounded-full bg-dark-700 border border-dark-600 text-gray-300 hover:border-gold-500/50 hover:text-gold-400 transition-colors"
          >
            {cat.title}
          </a>
        ))}
      </div>

      {/* 按分类展示 */}
      {categories.map((cat) => {
        const catFaqs = faqs.filter(f => f.category === cat.id)
        if (catFaqs.length === 0) return null
        return (
          <section key={cat.id} id={`cat-${cat.id}`} className="mb-10">
            <h2 className="text-xl font-semibold text-gold-400 font-serif mb-1">{cat.title}</h2>
            <p className="text-xs text-gray-500 mb-4">{cat.desc}</p>
            <div className="space-y-3">
              {catFaqs.map((faq, i) => (
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
          </section>
        )
      })}

      {/* 底部引导 */}
      <div className="text-center p-6 bg-dark-800/40 border border-dark-600 rounded-xl mt-8">
        <h2 className="text-lg font-semibold text-gold-300 mb-2">还有其他问题？</h2>
        <p className="text-sm text-gray-400 mb-4">访问帮助中心或直接联系我们</p>
        <div className="flex justify-center gap-3">
          <Link href="/help" className="px-5 py-2 bg-gold-400/15 border border-gold-400/30 rounded-lg text-gold-400 text-sm hover:bg-gold-400/25 transition-colors">帮助中心</Link>
          <Link href="/contact" className="px-5 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-300 text-sm hover:text-gold-400 transition-colors">联系我们</Link>
        </div>
      </div>
    </div>
  )
}
