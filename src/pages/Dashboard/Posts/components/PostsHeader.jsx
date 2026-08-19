import { useNavigate } from 'react-router-dom'
import { LuSearch, LuPlus } from 'react-icons/lu'

export default function PostsHeader({ query, onQueryChange, contextLabel }) {
  const navigate = useNavigate()

  return (
    <div className="posts-page__header">
      <div className="posts-page__title">
        <h1>Posts</h1>
        <p>
          Crie, agende e acompanhe todas as suas publicações.
          {contextLabel && <> Mostrando: <strong>{contextLabel}</strong>.</>}
        </p>
      </div>

      <div className="posts-page__actions">
        <label className="posts-page__search">
          <LuSearch size={15} />
          <input
            type="search"
            placeholder="Buscar por título ou conteúdo..."
            value={query}
            onChange={e => onQueryChange(e.target.value)}
          />
        </label>

        <button
          type="button"
          className="posts-page__new"
          onClick={() => navigate('/dashboard/posts/novo')}
        >
          <LuPlus size={16} /> Novo post
        </button>
      </div>
    </div>
  )
}
