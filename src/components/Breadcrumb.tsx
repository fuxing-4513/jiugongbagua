'use client'
import Link from 'next/link'

interface Crumb {
  label: string
  href?: string
}

export default function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav className="flex items-center gap-1 text-xs text-gray-500 mb-4">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <span className="text-gray-400 mx-0.5">/</span>}
          {item.href
            ? <Link href={item.href} className="hover:text-gold-600 transition-colors">{item.label}</Link>
            : <span className="text-gray-600">{item.label}</span>}
        </span>
      ))}
    </nav>
  )
}
