import { motion } from 'framer-motion'
import { LuCircleCheck, LuFileText } from 'react-icons/lu'
import { dashFadeUp as fadeUp } from '../../../../styles/animations'
import PostMenu from './PostMenu'

export default function RecentPostsCard({ posts, onEdit, onDuplicate, onDelete }) {
  return (
    <motion.div
      className="chart-card"
      variants={fadeUp} initial="hidden" animate="visible" custom={3}
    >
      <div className="chart-card__header">
        <h3>Publicações recentes</h3>
      </div>
      <div className="recent-posts">
        {posts.map((post) => {
          const { id, title, date, time, status } = post
          return (
            <div key={id} className="recent-post">
              <div className={`recent-post__status recent-post__status--${status}`}>
                {status === 'published' ? <LuCircleCheck size={14} /> : <LuFileText size={14} />}
              </div>
              <div className="recent-post__info">
                <p>{title}</p>
                <span>{date} • {time}</span>
              </div>
              <span className={`recent-post__badge recent-post__badge--${status}`}>
                {status === 'published' ? 'Publicado' : 'Rascunho'}
              </span>
              <PostMenu
                onEdit={() => onEdit(post)}
                onDuplicate={() => onDuplicate(post)}
                onDelete={() => onDelete(id)}
              />
            </div>
          )
        })}
        {posts.length === 0 && (
          <p className="recent-posts__empty">Nenhuma publicação recente.</p>
        )}
      </div>
    </motion.div>
  )
}
