import { motion } from 'framer-motion'
import { LuTrendingUp, LuBell, LuSparkles } from 'react-icons/lu'
import { MOCKUP_BARS } from '../data'

const KPIS = [
  { v: '24.5k', l: 'Alcance' },
  { v: '8.3%',  l: 'Engaj.' },
  { v: '12',    l: 'Agendados' },
]

const DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export default function HeroMockup() {
  return (
    <motion.div
      className="l-hero__visual"
      initial={{ opacity: 0, x: 60, y: 10 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.9, delay: 0.25, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="l-mockup">
        <div className="l-mockup__bar">
          <div className="l-mockup__dots">
            <span style={{ background: '#FF5F57' }} />
            <span style={{ background: '#FFBD2E' }} />
            <span style={{ background: '#28CA42' }} />
          </div>
          <span className="l-mockup__title">HubStudio — Dashboard</span>
        </div>
        <div className="l-mockup__body">
          <div className="l-mockup__kpis">
            {KPIS.map(k => (
              <div key={k.l} className="l-mockup__kpi">
                <strong>{k.v}</strong>
                <span>{k.l}</span>
              </div>
            ))}
          </div>
          <div className="l-mockup__chart">
            {MOCKUP_BARS.map((h, i) => (
              <motion.div
                key={i}
                className="l-mockup__bar-item"
                style={{ '--h': h + '%' }}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: 0.6 + i * 0.07, duration: 0.5, ease: 'easeOut' }}
              />
            ))}
          </div>
          <div className="l-mockup__days">
            {DAYS.map((d, i) => (
              <div key={d} className={`l-mockup__day${i < 4 ? ' has-post' : ''}`}>
                <span>{d}</span>
                {i < 4 && <div className="l-mockup__dot" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <motion.div
        className="l-float l-float--1"
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
      >
        <div className="l-float__icon"><LuTrendingUp /></div>
        <div>
          <strong>+127%</strong>
          <span>engajamento</span>
        </div>
      </motion.div>

      <motion.div
        className="l-float l-float--2"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
      >
        <div className="l-float__icon"><LuBell /></div>
        <div>
          <strong>Post agendado</strong>
          <span>amanhã, 09:00</span>
        </div>
      </motion.div>

      <motion.div
        className="l-float l-float--3"
        animate={{ y: [0, -8, 0] }}
        transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
      >
        <div className="l-float__icon"><LuSparkles /></div>
        <div>
          <strong>IA sugeriu</strong>
          <span>5 hashtags</span>
        </div>
      </motion.div>
    </motion.div>
  )
}
