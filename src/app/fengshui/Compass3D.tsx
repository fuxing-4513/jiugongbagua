'use client'

/**
 * Compass3D —— 真 3D 风水罗盘（方案 B，用户拍板）
 *
 * - 多层圆盘悬浮堆叠：底座刻度盘 → 二十四山盘 → 八卦宫盘 → 天池（指针盘），
 *   每层 = CanvasTexture 圆面 + 侧壁圆筒 + 顶部边缘倒角环 + 蚀刻纹，金属质感、无任何光斑/阴影。
 * - 盘体慢速自转；OrbitControls 懒加载（动态 import），按住拖拽可从任意角度查看。
 * - scene.background = null + renderer alpha → 融入页面双主题；文字颜色读 <html data-theme>。
 * - 天池红针指向「向口方位」，八卦宫盘同步高亮向口宫 —— 与页面输入联动。
 * - WebGL 不可用时自动回退到静态 SVG 罗盘。
 * - 画布尺寸由 ResizeObserver 自适应容器（最大 ~500px，移动端跟随容器）。
 */

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { PALETTES, LAYER_RADII, paintAll, type Palette, type ThemeMode, type LayerKey } from './compassPaint'
import RotatingCompass from '@/components/visual/RotatingCompass'

/** 每层厚度与悬浮高度（世界单位） */
const LAYER_SPEC: { key: LayerKey; radius: number; thick: number; y: number }[] = [
  { key: 'plate', radius: LAYER_RADII.plate, thick: 0.085, y: 0 },
  { key: 'mount', radius: LAYER_RADII.mount, thick: 0.072, y: 0.118 },
  { key: 'palace', radius: LAYER_RADII.palace, thick: 0.06, y: 0.223 },
  { key: 'tianchi', radius: LAYER_RADII.tianchi, thick: 0.048, y: 0.312 },
]

function themeOf(): ThemeMode {
  if (typeof document === 'undefined') return 'day'
  return document.documentElement.getAttribute('data-theme') === 'night' ? 'night' : 'day'
}
function facingIdxOf(deg: number): number {
  const d = ((deg % 360) + 360) % 360
  return Math.floor((d + 22.5) / 45) % 8
}

interface LayerRec {
  key: LayerKey
  tex: THREE.CanvasTexture
  rimMat: THREE.MeshBasicMaterial
  edgeMat: THREE.MeshBasicMaterial
}

interface SceneApi {
  setFacing: (deg: number) => void
  setTheme: (mode: ThemeMode) => void
  dispose: () => void
}

export default function Compass3D({
  facingDeg = 180,
  className = '',
}: {
  facingDeg?: number
  className?: string
}) {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const apiRef = useRef<SceneApi | null>(null)
  const facingRef = useRef(facingDeg)
  const [failed, setFailed] = useState(() => {
    if (typeof document === 'undefined') return false // SSR/prerender
    try {
      const c = document.createElement('canvas')
      return !c.getContext('webgl2') // three r163+ 仅支持 WebGL2
    } catch {
      return true
    }
  })

  // ── 场景生命周期（仅客户端，SSR/prerender 不执行任何 three 代码） ──
  useEffect(() => {
    const host = hostRef.current
    if (!host || failed) return
    let disposed = false
    let raf = 0
    let renderer: THREE.WebGLRenderer
    let controls: { update: () => void; dispose: () => void; enableDamping: boolean } | null = null

    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' })
    } catch {
      queueMicrotask(() => setFailed(true)) // 延迟到 effect 之外再 setState
      return
    }
    renderer.setClearColor(0x000000, 0)
    renderer.setPixelRatio(Math.min(typeof devicePixelRatio === 'number' ? devicePixelRatio : 1, 2))
    const canvas = renderer.domElement
    canvas.style.display = 'block'
    canvas.style.margin = 'auto'
    host.appendChild(canvas)

    const scene = new THREE.Scene() // background = null → 透明
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 80)
    camera.position.set(0, 2.42, 3.18)
    const spin = new THREE.Group()
    scene.add(spin)

    const geos: THREE.BufferGeometry[] = []
    const mats: THREE.MeshBasicMaterial[] = []
    const recs: LayerRec[] = []
    let rimColor = ''
    let dotMat: THREE.MeshBasicMaterial | null = null
    const paintFacing = (mode: Palette, fDeg: number) => paintAll(mode, facingIdxOf(fDeg), fDeg)

    function buildLayers(pal: Palette) {
      rimColor = pal.line
      LAYER_SPEC.forEach((spec) => {
        const g = new THREE.Group()
        g.position.y = spec.y

        const canvas0 = paintFacing(pal, facingRef.current)[spec.key]
        const tex = new THREE.CanvasTexture(canvas0)
        tex.colorSpace = THREE.SRGBColorSpace
        tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy())

        // 顶面圆盘（双面，便于绕到底部查看时依然成画）
        const faceGeo = new THREE.CircleGeometry(spec.radius, 128)
        const faceMat = new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide })
        const face = new THREE.Mesh(faceGeo, faceMat)
        face.rotation.x = -Math.PI / 2
        face.position.y = spec.thick / 2
        g.add(face)

        // 侧壁（厚度）
        const rimGeo = new THREE.CylinderGeometry(spec.radius, spec.radius, spec.thick, 128, 1, true)
        const rimMat = new THREE.MeshBasicMaterial({ color: rimColor })
        g.add(new THREE.Mesh(rimGeo, rimMat))

        // 顶部倒角环（细圆环，模拟金属压边，无阴影）
        const torusGeo = new THREE.TorusGeometry(spec.radius - 0.006, 0.011, 12, 128)
        torusGeo.rotateX(Math.PI / 2)
        const edgeMat = new THREE.MeshBasicMaterial({ color: rimColor })
        const torus = new THREE.Mesh(torusGeo, edgeMat)
        torus.position.y = spec.thick / 2
        g.add(torus)

        spin.add(g)
        geos.push(faceGeo, rimGeo, torusGeo)
        mats.push(faceMat, rimMat, edgeMat)
        recs.push({ key: spec.key, tex, rimMat, edgeMat })
      })

      // 底座外圈小星点（细颗粒，沿用站点细点装饰语言）
      const dotGeo = new THREE.SphereGeometry(0.0125, 10, 8)
      geos.push(dotGeo)
      dotMat = new THREE.MeshBasicMaterial({ color: pal.dot })
      for (let k = 0; k < 8; k++) {
        const a = ((k * 45 + 22.5) * Math.PI) / 180
        const d = new THREE.Mesh(dotGeo, dotMat)
        d.position.set(Math.sin(a) * 1.062, 0.048, -Math.cos(a) * 1.062)
        spin.add(d)
      }
      mats.push(dotMat)
    }

    function refreshLayers(pal: Palette, fDeg: number) {
      const painted = paintFacing(pal, fDeg)
      recs.forEach((r) => {
        r.tex.image = painted[r.key]
        r.tex.needsUpdate = true
        r.rimMat.color.set(pal.line)
        r.edgeMat.color.set(pal.line)
      })
      if (dotMat) dotMat.color.set(pal.dot)
    }

    buildLayers(PALETTES[themeOf()])

    // 懒加载 OrbitControls（不进首屏主包）
    let controlsCancelled = false
    type ControlsLike = {
      update: () => void
      dispose: () => void
      enableDamping: boolean
      target: { set: (x: number, y: number, z: number) => void }
    }
    type ControlsCtor = new (a: unknown, b: unknown) => ControlsLike
    import('three/examples/jsm/controls/OrbitControls.js')
      .then((mod) => {
        if (disposed || controlsCancelled) return
        const OC: ControlsCtor | undefined =
          (mod as { OrbitControls?: ControlsCtor }).OrbitControls ||
          (mod as unknown as { default?: ControlsCtor }).default
        if (!OC) return
        const c = new OC(camera, renderer.domElement)
        c.enableDamping = true
        controls = c
        ;(c as unknown as Record<string, unknown>).dampingFactor = 0.08
        ;(c as unknown as Record<string, unknown>).enablePan = false
        ;(c as unknown as Record<string, unknown>).minDistance = 2.3
        ;(c as unknown as Record<string, unknown>).maxDistance = 7.5
        ;(c as unknown as Record<string, unknown>).minPolarAngle = Math.PI * 0.1
        ;(c as unknown as Record<string, unknown>).maxPolarAngle = Math.PI * 0.55
        ;(c as unknown as Record<string, unknown>).rotateSpeed = 0.55
        ;(c as unknown as Record<string, unknown>).zoomSpeed = 0.7
        c.target.set(0, 0.02, 0)
      })
      .catch(() => undefined) // 加载失败仅失去拖拽，罗盘与自转不受影响

    const clock = new THREE.Clock()
    const tick = () => {
      if (disposed) return
      const dt = Math.min(clock.getDelta(), 0.05)
      spin.rotation.y += dt * 0.014 // 慢速自转 ≈ 每圈 7.5 分钟
      if (controls) controls.update()
      renderer.render(scene, camera)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    // 尺寸自适应（容器 ResizeObserver，最大 ~500px 由外层 CSS 限制）
    const resize = () => {
      const w = Math.max(40, Math.floor(host.clientWidth))
      const h = Math.max(40, Math.floor(host.clientHeight || host.clientWidth))
      renderer.setPixelRatio(Math.min(typeof devicePixelRatio === 'number' ? devicePixelRatio : 1, 2))
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(host)

    // 上下文丢失 → 回退静态 SVG
    const onLost = (e: Event) => {
      e.preventDefault()
      if (!disposed) setFailed(true)
    }
    canvas.addEventListener('webglcontextlost', onLost)

    const api: SceneApi = {
      setFacing(deg) {
        if (disposed) return
        refreshLayers(PALETTES[themeOf()], deg)
      },
      setTheme(mode) {
        if (disposed) return
        refreshLayers(PALETTES[mode], facingRef.current)
      },
      dispose() {
        disposed = true
        controlsCancelled = true
        cancelAnimationFrame(raf)
        ro.disconnect()
        canvas.removeEventListener('webglcontextlost', onLost)
        controls?.dispose()
        geos.forEach((g) => g.dispose())
        mats.forEach((m) => m.dispose())
        recs.forEach((r) => r.tex.dispose())
        spin.clear()
        renderer.dispose()
        if (canvas.parentNode === host) host.removeChild(canvas)
      },
    }
    apiRef.current = api

    return () => {
      api.dispose()
      apiRef.current = null
    }
  }, [failed])

  // 主题切换（html[data-theme] 属性变化 → 重绘文字层颜色）
  useEffect(() => {
    const obs = new MutationObserver(() => {
      apiRef.current?.setTheme(themeOf())
    })
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => obs.disconnect()
  }, [])

  // 坐向联动：向口度数变化 → 天池指针 + 八卦宫高亮
  useEffect(() => {
    facingRef.current = facingDeg
    apiRef.current?.setFacing(facingDeg)
  }, [facingDeg])

  if (failed) {
    return (
      <div className={`mx-auto flex w-full items-center justify-center ${className}`}>
        <RotatingCompass size={500} className="h-auto w-full max-w-[500px]" />
      </div>
    )
  }

  return (
    <div
      ref={hostRef}
      className={`relative mx-auto aspect-square w-full max-w-[500px] select-none touch-none ${className}`}
      role="img"
      aria-label="可拖拽旋转的 3D 立体风水罗盘：二十四山、八卦宫与天池指针"
    />
  )
}
