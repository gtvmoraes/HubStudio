import { motion } from 'framer-motion'
import {
  LuRocket, LuCalendarClock, LuChartBar, LuCreditCard, LuPlug, LuUsers,
  LuFileText, LuArrowRight,
} from 'react-icons/lu'

const CATEGORY_ICONS = {
  rocket: LuRocket,
  calendar: LuCalendarClock,
  chart: LuChartBar,
  card: LuCreditCard,
  plug: LuPlug,
  users: LuUsers,
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } }),
}

export default function KnowledgeBase({ categories = [], articles = [], onOpenArticle, onOpenCategory }) {
  return (
    <div className="sup-kb chart-card">
      <div className="sup-section-head">
        <h3>Base de conhecimento</h3>
        <span className="sup-section-head__sub">Explore guias por categoria</span>
      </div>

      <div className="sup-kb__grid">
        {categories.map((cat, i) => {
          const Icon = CATEGORY_ICONS[cat.icon] ?? LuFileText
          return (
            <motion.button
              key={cat.id}
              type="button"
              className="sup-kb__cat"
              onClick={() => onOpenCategory?.(cat)}
              variants={fadeUp} initial="hidden" animate="visible" custom={i}
              whileHover={{ y: -3 }}
            >
              <span className="sup-kb__cat-icon"><Icon size={20} /></span>
              <span className="sup-kb__cat-body">
                <strong>{cat.title}</strong>
                <small>{cat.desc}</small>
              </span>
              <span className="sup-kb__cat-count">{cat.count} artigos</span>
            </motion.button>
          )
        })}
      </div>

      {articles.length > 0 && (
        <div className="sup-kb__popular">
          <span className="sup-kb__popular-label">Artigos populares</span>
          <ul className="sup-kb__articles">
            {articles.map(a => (
              <li key={a.id}>
                <button type="button" className="sup-kb__article" onClick={() => onOpenArticle?.(a)}>
                  <LuFileText size={15} className="sup-kb__article-icon" />
                  <span className="sup-kb__article-title">{a.title}</span>
                  <span className="sup-kb__article-views">{a.views} leituras</span>
                  <LuArrowRight size={15} className="sup-kb__article-arrow" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
