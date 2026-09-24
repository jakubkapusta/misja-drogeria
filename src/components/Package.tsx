import type { ReactElement } from 'react'
import type { Look } from '../types'

interface Area { x: number; y: number; w: number; h: number }

const isCJK = (ch: string) => /[　-鿿＀-￯]/.test(ch)
const textWidth = (s: string) => [...s].reduce((a, c) => a + (isCJK(c) ? 1 : 0.62), 0)

function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16)
  const f = (v: number) => Math.max(0, Math.min(255, Math.round(v + amt * 255)))
  const r = f(n >> 16), g = f((n >> 8) & 255), b = f(n & 255)
  return `rgb(${r},${g},${b})`
}

function Body({ look }: { look: Look }): { el: ReactElement; area: Area } {
  const { shape, body, accent } = look
  const edge = shade(body, -0.18)
  switch (shape) {
    case 'tube':
      return {
        area: { x: 33, y: 26, w: 34, h: 88 },
        el: <>
          <rect x="24" y="12" width="52" height="9" rx="1.5" fill={shade(body, -0.08)} stroke={edge} strokeWidth=".8" />
          <path d="M26 20 L74 20 L67 120 L33 120 Z" fill={body} stroke={edge} strokeWidth="1" />
          <rect x="35" y="118" width="30" height="20" rx="3" fill={accent} stroke={shade(accent, -0.2)} strokeWidth=".8" />
        </>,
      }
    case 'pump':
      return {
        area: { x: 28, y: 54, w: 44, h: 78 },
        el: <>
          <rect x="37" y="24" width="26" height="11" rx="2" fill={accent} />
          <rect x="58" y="26" width="22" height="5" rx="2" fill={accent} />
          <rect x="43" y="34" width="14" height="12" fill={shade(accent, -0.1)} />
          <rect x="24" y="44" width="52" height="94" rx="11" fill={body} stroke={edge} strokeWidth="1" />
        </>,
      }
    case 'spray':
      return {
        area: { x: 33, y: 52, w: 34, h: 80 },
        el: <>
          <rect x="33" y="14" width="34" height="32" rx="12" fill={accent} stroke={shade(accent, -0.15)} strokeWidth=".8" />
          <rect x="30" y="42" width="40" height="96" rx="12" fill={body} stroke={edge} strokeWidth="1" />
        </>,
      }
    case 'bottle':
      return {
        area: { x: 30, y: 48, w: 40, h: 84 },
        el: <>
          <rect x="38" y="18" width="24" height="22" rx="3" fill={accent} />
          <rect x="26" y="38" width="48" height="100" rx="13" fill={body} stroke={edge} strokeWidth="1" />
        </>,
      }
    case 'pouch':
      return {
        area: { x: 18, y: 46, w: 64, h: 84 },
        el: <>
          <path d="M13 12 Q50 7 87 12 L89 134 Q50 139 11 134 Z" fill={body} stroke={edge} strokeWidth="1" />
          <line x1="14" y1="30" x2="86" y2="30" stroke={shade(body, -0.12)} strokeWidth="1" />
          <rect x="39" y="11" width="22" height="31" fill={accent} />
          <circle cx="50" cy="19" r="3.4" fill="rgba(0,0,0,.35)" />
        </>,
      }
    case 'refill':
      return {
        area: { x: 22, y: 42, w: 56, h: 88 },
        el: <>
          <rect x="70" y="6" width="12" height="14" rx="2" fill={accent} />
          <path d="M16 30 L64 30 L84 18 L84 134 Q50 139 16 134 Z" fill={body} stroke={edge} strokeWidth="1" />
        </>,
      }
    case 'bag':
      return {
        area: { x: 20, y: 34, w: 60, h: 96 },
        el: <>
          <rect x="16" y="22" width="68" height="116" rx="5" fill={body} stroke={edge} strokeWidth="1" />
          <rect x="16" y="18" width="68" height="10" rx="2" fill={accent} />
        </>,
      }
    case 'box':
      return {
        area: { x: 20, y: 32, w: 56, h: 100 },
        el: <>
          <path d="M16 26 L24 19 L88 19 L80 26 Z" fill={shade(body, 0.08)} stroke={edge} strokeWidth=".8" />
          <path d="M80 26 L88 19 L88 131 L80 138 Z" fill={shade(body, -0.15)} stroke={edge} strokeWidth=".8" />
          <rect x="16" y="26" width="64" height="112" fill={body} stroke={edge} strokeWidth="1" />
          <rect x="16" y="126" width="64" height="12" fill={accent} />
        </>,
      }
    case 'jar':
      return {
        area: { x: 20, y: 92, w: 60, h: 40 },
        el: <>
          <rect x="16" y="70" width="68" height="20" rx="4" fill={accent} />
          <rect x="18" y="88" width="64" height="50" rx="8" fill={body} stroke={edge} strokeWidth="1" />
        </>,
      }
    case 'stick':
      return {
        area: { x: 34, y: 70, w: 32, h: 62 },
        el: <>
          <rect x="31" y="60" width="38" height="78" rx="7" fill={body} stroke={edge} strokeWidth="1" />
          <rect x="31" y="18" width="38" height="46" rx="10" fill={accent} stroke={shade(accent, -0.15)} strokeWidth=".8" />
        </>,
      }
    case 'tin':
      return {
        area: { x: 26, y: 54, w: 48, h: 78 },
        el: <>
          <rect x="22" y="42" width="56" height="96" rx="3" fill={body} stroke={edge} strokeWidth="1" />
          <rect x="20" y="30" width="60" height="18" rx="3" fill={accent} stroke={shade(accent, -0.2)} strokeWidth=".8" />
          <ellipse cx="50" cy="30" rx="30" ry="3" fill={shade(accent, 0.12)} />
        </>,
      }
    case 'pack':
      return {
        area: { x: 18, y: 58, w: 64, h: 76 },
        el: <>
          <rect x="12" y="28" width="76" height="110" rx="11" fill={body} stroke={edge} strokeWidth="1" />
          <rect x="30" y="36" width="40" height="16" rx="6" fill={accent} />
        </>,
      }
    case 'soap':
      return {
        area: { x: 18, y: 74, w: 64, h: 58 },
        el: <>
          <rect x="10" y="64" width="80" height="74" rx="30" fill={body} stroke={edge} strokeWidth="1" />
          <path d="M28 70 Q50 60 72 70" stroke={accent} strokeWidth="5" fill="none" strokeLinecap="round" />
        </>,
      }
  }
}

const FONT = "'Zen Maru Gothic','M PLUS Rounded 1c',system-ui,sans-serif"

function BigText({ text, area, vert, ink }: { text: string; area: Area; vert?: boolean; ink: string }) {
  const chars = [...text]
  const cjkShare = chars.filter(isCJK).length / Math.max(1, chars.length)
  if (vert && cjkShare > 0.6 && area.h > area.w * 0.9) {
    const size = Math.min(area.w * 0.62, (area.h - 4) / chars.length, 20)
    const total = size * chars.length
    const cx = area.x + area.w / 2
    const y0 = area.y + (area.h - total) / 2 + size * 0.86
    return <g fill={ink} fontFamily={FONT} fontWeight={900} fontSize={size} textAnchor="middle">
      {chars.map((c, i) => c === 'ー'
        ? <text key={i} x={cx} y={y0 + i * size - size * 0.36} transform={`rotate(90 ${cx} ${y0 + i * size - size * 0.36})`} dominantBaseline="middle">ー</text>
        : <text key={i} x={cx} y={y0 + i * size}>{c}</text>)}
    </g>
  }
  const size = Math.min(18, (area.w - 2) / textWidth(text), area.h * 0.4)
  return <text x={area.x + area.w / 2} y={area.y + area.h / 2 + size * 0.35} fill={ink} fontFamily={FONT}
    fontWeight={900} fontSize={size} textAnchor="middle">{text}</text>
}

export function Package({ look, size = 1, className }: { look: Look; size?: number; className?: string }) {
  const { el, area } = Body({ look })
  const { brand, big, sub, badge, ink, vert, stripe } = look
  const brandSize = Math.min(7, (area.w - 2) / Math.max(1, textWidth(brand ?? '')))
  const subSize = sub ? Math.min(7.5, (area.w - 4) / textWidth(sub)) : 0
  const inner: Area = {
    x: area.x,
    y: area.y + (brand ? brandSize + 3 : 0),
    w: area.w,
    h: area.h - (brand ? brandSize + 3 : 0) - (sub ? subSize + 4 : 0),
  }
  return (
    <svg viewBox="0 0 100 140" width={70 * size} height={98 * size} className={className} aria-hidden>
      <ellipse cx="50" cy="138" rx="38" ry="3" fill="rgba(0,0,0,.18)" />
      {el}
      {stripe && <rect x={area.x - 2} y={area.y + area.h - 3} width={area.w + 4} height="3" fill={stripe} opacity=".85" />}
      {brand && <text x={area.x + area.w / 2} y={area.y + brandSize} fontSize={brandSize} fill={ink} opacity=".85"
        fontFamily={FONT} fontWeight={700} textAnchor="middle" letterSpacing=".3">{brand}</text>}
      <BigText text={big} area={inner} vert={vert} ink={ink} />
      {sub && <text x={area.x + area.w / 2} y={area.y + area.h - 2} fontSize={subSize} fill={ink}
        fontFamily={FONT} fontWeight={700} textAnchor="middle">{sub}</text>}
      {badge && <g>
        <circle cx={area.x + area.w - 5} cy={area.y + 14} r="8.5" fill="#e0322b" stroke="#fff" strokeWidth="1.2" />
        <text x={area.x + area.w - 5} y={area.y + 14 + 3.3} fontSize={badge.length > 1 ? 7 : 9.5} fill="#fff"
          fontFamily={FONT} fontWeight={900} textAnchor="middle">{badge}</text>
      </g>}
      {/* połysk */}
      <rect x={area.x - 3} y={area.y - 6} width="5" height={area.h * 0.8} rx="2.5" fill="#fff" opacity=".22" />
    </svg>
  )
}
