import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '隐私政策 - 九宫八卦',
  description: '九宫八卦隐私政策：我们重视您的隐私，所有排盘数据仅在浏览器本地处理，不上传服务器。',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gold-400 font-serif mb-2">隐私政策</h1>
      <p className="text-gray-400 mb-2">九宫八卦重视您的隐私保护</p>
      <p className="text-xs text-gray-500 mb-8">最后更新日期：2024年1月</p>

      <div className="space-y-8">
        <section>
          <h2 className="text-lg font-semibold text-gold-300 mb-2">信息收集</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            我们仅收集您主动提供的最少必要信息（如注册邮箱）。生辰八字、姓名等命理排盘所需的数据<strong className="text-gray-300">仅在您的浏览器本地计算处理</strong>，
            不会上传至服务器。我们无法访问您的排盘数据，也无法将其用于任何其他目的。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gold-300 mb-2">Cookie 与本地存储</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            我们可能使用 Cookie 和浏览器本地存储来保存您的语言偏好（简/繁/英）和界面设置。这些数据不用于追踪个人身份，仅用于提升使用体验。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gold-300 mb-2">数据安全</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            我们采用合理的技术手段保护用户数据安全。由于排盘计算在浏览器端完成，无需担心生辰信息在传输过程中泄露。网站使用 HTTPS 加密传输。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gold-300 mb-2">第三方服务</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            我们使用 Google Fonts 提供字体服务，使用 Vercel 提供网站托管服务。这些第三方服务可能有各自的数据处理政策，建议您查阅相关文档。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gold-300 mb-2">用户权利</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            您有权查询、更正、删除我们存储的个人信息。由于我们不存储命理排盘数据，这些数据由您自行管理。如需删除账户信息，请通过联系我们页面与我们联系。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gold-300 mb-2">政策更新</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            我们可能会更新本隐私政策，更新后的政策将发布在本页面。重大变更时我们会通过网站公告等方式通知您。建议定期查看本页面。
          </p>
        </section>
      </div>
    </div>
  );
}
