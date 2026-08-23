import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '服务条款',
  description: '九宫八卦平台服务条款：基础功能免费使用，命理分析仅供娱乐参考，不构成专业建议。',
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gold-400 font-serif mb-2">服务条款</h1>
      <p className="text-gray-400 mb-2">使用九宫八卦平台前请阅读以下条款</p>
      <p className="text-xs text-gray-500 mb-8">最后更新日期：2024年1月</p>

      <div className="space-y-8">
        <section>
          <h2 className="text-lg font-semibold text-gold-300 mb-2">服务说明</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            九宫八卦（jiugongbagua.com）提供命理分析、排盘解读等信息服务，涵盖八字排盘、紫微斗数、六爻、小六壬、风水布局等 19+ 种命理工具。
            基础功能免费使用，部分高级功能（AI深度分析、详细命理报告等）需开通 VIP 会员。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gold-300 mb-2">免责声明</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            本平台所有命理分析和建议<strong className="text-gray-300">仅供娱乐参考</strong>，不构成任何医疗、法律、投资、心理咨询或人生决策的专业建议。
            命理学结果反映的是传统理论模型推演，不能替代现实生活中的理性判断和专业咨询。用户应自行判断并承担基于平台内容所作决策的后果。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gold-300 mb-2">用户义务</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            用户不得利用本平台进行任何违法违规活动，不得干扰平台正常运行，不得滥用或攻击平台服务。用户应提供真实准确的信息以确保排盘结果的正确性。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gold-300 mb-2">知识产权</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            本平台的代码、设计、算法及原创内容受知识产权法律保护。所引用的古籍原文（如《滴天髓》《紫微斗数全书》《周易》等）已过版权保护期，可自由引用；
            但平台原创的解读、分析和翻译内容未经许可不得商用。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gold-300 mb-2">责任限制</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            在法律允许的最大范围内，九宫八卦不对因使用或无法使用本平台服务而产生的任何直接或间接损失承担责任，包括但不限于数据丢失、决策失误等。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gold-300 mb-2">适用法律</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            本条款适用中华人民共和国法律。与本平台相关的争议应友好协商解决，协商不成的提交有管辖权的人民法院处理。
          </p>
        </section>
      </div>
    </div>
  );
}
