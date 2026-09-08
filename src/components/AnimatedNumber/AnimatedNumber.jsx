import { useEffect, useRef, useState } from 'react'

/**
 * Número que "sobe" de 0 até o valor quando os dados reais chegam.
 *
 * Aceita o valor JÁ FORMATADO como a UI mostra ("12.4K", "+7,4%", "1.234", "87")
 * — assim nenhum componente precisa mudar de onde tira o dado. O texto é
 * quebrado em prefixo + número + sufixo; só o número é animado.
 *
 * Regras:
 *  - Zero (ou texto sem número, tipo "—") NÃO anima: renderiza direto.
 *  - No último frame renderiza a STRING ORIGINAL, então o valor final é
 *    sempre idêntico ao que viria sem animação (zero risco de formatar torto).
 *  - Respeita `prefers-reduced-motion`.
 */

// "12.4K" → { prefix: '', num: 12.4, suffix: 'K', decimals: 1, style: 'plain' }
// exportado só para teste
export function parse(text) {
  const str = String(text ?? '')
  const m = str.match(/^(\D*?)(-?\d[\d.,]*)(.*)$/s)
  if (!m) return null

  const [, prefix, rawNum, suffix] = m
  const hasComma = rawNum.includes(',')
  const isDotThousands = !hasComma && /^-?\d{1,3}(\.\d{3})+$/.test(rawNum)

  let num, decimals, style
  if (hasComma) {
    // pt-BR: ponto separa milhar, vírgula separa decimal
    num = parseFloat(rawNum.replace(/\./g, '').replace(',', '.'))
    decimals = (rawNum.split(',')[1] || '').length
    style = 'ptbr'
  } else if (isDotThousands) {
    num = parseFloat(rawNum.replace(/\./g, ''))
    decimals = 0
    style = 'ptbr'
  } else {
    num = parseFloat(rawNum)
    decimals = (rawNum.split('.')[1] || '').length
    style = 'plain'
  }

  if (!Number.isFinite(num)) return null
  return { prefix, suffix, num, decimals, style }
}

export function format(value, { prefix, suffix, decimals, style }) {
  const body = style === 'ptbr'
    ? value.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    : value.toFixed(decimals)
  return `${prefix}${body}${suffix}`
}

const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t))

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

export default function AnimatedNumber({ value, duration = 900, className }) {
  const [display, setDisplay] = useState(value)
  const frameRef = useRef(null)

  useEffect(() => {
    const parsed = parse(value)

    // Sem número, zero, ou usuário pediu menos movimento → sem animação
    if (!parsed || parsed.num === 0 || prefersReducedMotion()) {
      setDisplay(value)
      return
    }

    const start = performance.now()
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1)
      if (t >= 1) {
        setDisplay(value)          // último frame = string original, exata
        return
      }
      setDisplay(format(parsed.num * easeOutExpo(t), parsed))
      frameRef.current = requestAnimationFrame(tick)
    }
    frameRef.current = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(frameRef.current)
  }, [value, duration])

  return <span className={className}>{display}</span>
}
