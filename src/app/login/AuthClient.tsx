'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import Breadcrumb from '@/components/Breadcrumb'

function AuthContent() {
  const router = useRouter()
  const params = useSearchParams()
  const next = params.get('next') || '/mycharts'
  const [mode, setMode] = useState<'login' | 'register'>(params.get('mode') === 'register' ? 'register' : 'login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (mode === 'login') await api.login(email, password)
      else await api.register(email, password, nickname)
      router.push(next)
    } catch (err) {
      setError((err as Error).message)
    }
    setBusy(false)
  }

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <Breadcrumb items={[{ label: '首页', href: '/' }, { label: mode === 'login' ? '登录' : '注册' }]} />

      <div className="jg-tile p-7">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-1.5">
            {mode === 'login' ? '欢迎回来' : '创建你的命盘档案'}
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            {mode === 'login'
              ? '登录后可查看、管理云端保存的排盘记录'
              : '保存排盘记录 · 生成分享编号发给顾问 · 随时回看'}
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1.5">昵称（可选）</label>
              <input value={nickname} onChange={e => setNickname(e.target.value)} maxLength={30}
                placeholder="怎么称呼你"
                className="jg-input w-full text-sm" />
            </div>
          )}
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1.5">邮箱</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="jg-input w-full text-sm" />
          </div>
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1.5">密码</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} minLength={8}
              placeholder={mode === 'register' ? '至少 8 位' : '你的密码'}
              className="jg-input w-full text-sm" />
          </div>

          {error && (
            <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button type="submit" disabled={busy} className="jg-btn-primary w-full !min-h-[44px]">
            {busy ? '请稍候…' : mode === 'login' ? '登 录' : '注册并登录'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-5">
          {mode === 'login' ? '还没有账号？' : '已有账号？'}
          <button
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
            className="jg-text-accent ml-1 hover:underline"
          >
            {mode === 'login' ? '免费注册' : '去登录'}
          </button>
        </p>

        <p className="text-center text-[10px] text-gray-400 dark:text-gray-500 mt-5 leading-relaxed">
          排盘计算在浏览器本地完成；账号仅用于云端保存你的命盘记录。<br />
          我们不收集、不出售任何个人信息。
        </p>
      </div>

      <p className="text-center mt-5">
        <Link href="/" className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">← 返回首页</Link>
      </p>
    </div>
  )
}

export default function AuthClient() {
  return (
    <Suspense fallback={<div className="min-h-[50vh]" />}>
      <AuthContent />
    </Suspense>
  )
}
