import { LuPlay, LuThumbsUp, LuShare2, LuDownload, LuBell } from 'react-icons/lu'

export default function YoutubePreview({ type = 'video', title, content, user, media = [] }) {
  const isShorts = type === 'shorts'
  const channelName = user?.name || 'Seu Canal'
  const firstMedia = media[0]

  // YouTube Shorts é um formato vertical similar a TikTok/Reels
  if (isShorts) {
    return (
      <div className="np-yt np-yt--shorts">
        <div className={`np-yt__shorts-media${firstMedia ? ' np-yt__shorts-media--filled' : ''}`}>
          {firstMedia ? (
            firstMedia.type === 'video'
              ? <video src={firstMedia.url} muted playsInline />
              : <img src={firstMedia.url} alt="" />
          ) : (
            <LuPlay size={48} />
          )}
        </div>
        <div className="np-yt__shorts-bottom">
          <strong>@{channelName.toLowerCase().replace(/\s+/g, '')}</strong>
          {(title || content) && <p>{title || content}</p>}
        </div>
        <div className="np-yt__shorts-side">
          <div className="np-yt__shorts-avatar">{channelName[0]}</div>
          <div className="np-yt__shorts-action"><LuThumbsUp size={22} /><span>12K</span></div>
          <div className="np-yt__shorts-action"><LuShare2  size={22} /><span>342</span></div>
        </div>
      </div>
    )
  }

  // YouTube vídeo padrão — orientação horizontal
  return (
    <div className="np-yt">
      {/* Thumbnail/player horizontal */}
      <div className={`np-yt__player${firstMedia ? ' np-yt__player--filled' : ''}`}>
        {firstMedia ? (
          firstMedia.type === 'video'
            ? <video src={firstMedia.url} muted playsInline />
            : <img src={firstMedia.url} alt="" />
        ) : (
          <LuPlay size={36} />
        )}
        <span className="np-yt__duration">12:34</span>
      </div>

      {/* Título do vídeo */}
      <h3 className="np-yt__title">
        {title || 'O título do seu vídeo aparece aqui'}
      </h3>

      {/* Stats */}
      <div className="np-yt__stats">
        12.345 visualizações · há 2 horas
      </div>

      {/* Botões de ação */}
      <div className="np-yt__actions">
        <div className="np-yt__action"><LuThumbsUp size={16} /> 1.2K</div>
        <div className="np-yt__action"><LuShare2  size={16} /> Compartilhar</div>
        <div className="np-yt__action"><LuDownload size={16} /> Download</div>
      </div>

      {/* Canal */}
      <div className="np-yt__channel">
        <div className="np-yt__avatar">{channelName[0]}</div>
        <div className="np-yt__channel-info">
          <strong>{channelName}</strong>
          <span>156 mil inscritos</span>
        </div>
        <button className="np-yt__sub"><LuBell size={12} /> Inscrever-se</button>
      </div>

      {/* Descrição */}
      {content && (
        <div className="np-yt__desc">
          {content.split('\n').slice(0, 2).join(' ').slice(0, 100)}
          {content.length > 100 ? '...' : ''}
        </div>
      )}
    </div>
  )
}
