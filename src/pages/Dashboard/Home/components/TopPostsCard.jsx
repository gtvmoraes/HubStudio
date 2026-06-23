import { motion } from 'framer-motion'
import { LuEye, LuHeart } from 'react-icons/lu'
import { dashFadeUp as fadeUp } from '../../../../styles/animations'

export default function TopPostsCard({ posts }) {
  return (
    <motion.div
      className="chart-card chart-card--top-posts"
      variants={fadeUp} initial="hidden" animate="visible" custom={8}
    >
      <div className="chart-card__header">
        <h3>Top 5 publicações</h3>
        <span className="chart-card__sub">Por engajamento</span>
      </div>

      {(!posts || posts.length === 0) ? (
        <div className="chart-card__empty">Nenhuma publicação ainda.</div>
      ) : (
        <div className="top-posts">
          {posts.map(({ id, title, date, views, likes }) => (
            <div key={id} className="top-post">
              <div className="top-post__info">
                <p className="top-post__title">{title}</p>
                <span className="top-post__date">{date}</span>
              </div>
              <div className="top-post__stats">
                <span><LuEye size={12} /> {views}</span>
                <span><LuHeart size={12} /> {likes}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
