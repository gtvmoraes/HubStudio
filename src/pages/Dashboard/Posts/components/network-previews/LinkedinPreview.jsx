import { LuThumbsUp, LuMessageCircle, LuRepeat, LuSend, LuImage, LuGlobe, LuLightbulb, LuTarget } from 'react-icons/lu'

export default function LinkedinPreview({ type = 'post', title, content, user, media = [] }) {
  const name = user?.name || 'Você'
  const isArticle = type === 'article'
  const firstMedia = media[0]

  // Artigo tem layout diferente — destaque pro título e thumbnail horizontal
  if (isArticle) {
    return (
      <div className="np-li np-li--article">
        <div className={`np-li__article-cover${firstMedia ? ' np-li__article-cover--filled' : ''}`}>
          {firstMedia ? (
            firstMedia.type === 'video'
              ? <video src={firstMedia.url} muted playsInline />
              : <img src={firstMedia.url} alt="" />
          ) : (
            <LuImage size={36} />
          )}
        </div>
        <div className="np-li__article-body">
          <span className="np-li__article-tag">Artigo</span>
          <h3>{title || 'Título do seu artigo'}</h3>
          {content && <p>{content.slice(0, 140)}{content.length > 140 ? '...' : ''}</p>}
          <div className="np-li__article-author">
            <div className="np-li__avatar">{name[0]}</div>
            <span><strong>{name}</strong> · agora</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="np-li">
      <div className="np-li__header">
        <div className="np-li__avatar">{name[0]}</div>
        <div className="np-li__user">
          <strong>{name}</strong>
          <span>Profissional · 1º</span>
          <span className="np-li__time">agora · <LuGlobe size={10} /></span>
        </div>
      </div>

      {content && (
        <div className="np-li__text">
          {content.split('\n').slice(0, 6).map((line, i) => <p key={i}>{line || ' '}</p>)}
        </div>
      )}

      <div className={`np-li__media${firstMedia ? ' np-li__media--filled' : ''}`}>
        {firstMedia ? (
          firstMedia.type === 'video'
            ? <video src={firstMedia.url} muted playsInline />
            : <img src={firstMedia.url} alt="" />
        ) : (
          <LuImage size={36} />
        )}
      </div>

      <div className="np-li__counts">
        <span className="np-li__reactions">
          <span className="np-li__reaction np-li__reaction--like"><LuThumbsUp size={9} /></span>
          <span className="np-li__reaction np-li__reaction--celebrate"><LuTarget size={9} /></span>
          <span className="np-li__reaction np-li__reaction--insight"><LuLightbulb size={9} /></span>
          234 · 56 comentários
        </span>
      </div>

      <div className="np-li__actions">
        <button><LuThumbsUp size={15} /> Reagir</button>
        <button><LuMessageCircle size={15} /> Comentar</button>
        <button><LuRepeat size={15} /> Repostar</button>
        <button><LuSend size={15} /> Enviar</button>
      </div>
    </div>
  )
}
