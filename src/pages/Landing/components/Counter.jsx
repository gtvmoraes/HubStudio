import { useState } from 'react'
import { motion } from 'framer-motion'

export default function Counter({ end, suffix = '', label, delay = 0 }) {
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(false)

  const start = () => {
    if (started) return
    setStarted(true)
    const steps = 60
    const stepTime = 2000 / steps
    const inc = end / steps
    let cur = 0
    const t = setInterval(() => {
      cur += inc
      if (cur >= end) { setCount(end); clearInterval(t) }
      else setCount(Math.round(cur))
    }, stepTime)
  }

  return (
    <motion.div
      className="l-stat"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      onViewportEnter={start}
    >
      <strong>{count.toLocaleString('pt-BR')}{suffix}</strong>
      <span>{label}</span>
    </motion.div>
  )
}
