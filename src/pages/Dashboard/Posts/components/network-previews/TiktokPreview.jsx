import { LuHeart, LuMessageCircle, LuShare2, LuMusic, LuPlay, LuImage } from 'react-icons/lu'

const handle = (user) => (user?.name || 'voce').toLowerCase().replace(/\s+/g, '_')

export default function TiktokPreview({ type = 'video', content, user, media = [] }) {
  const username = handle(user)
  const firstMedia = media[0]
  return (
    <div className="np-tt">
      {/* Mídia full-screen vertical */}
      <div className={`np-tt__media${firstMedia ? ' np-tt__media--filled' : ''}`}>
        {firstMedia ? (
          firstMedia.type === 'video'
            ? <video src={firstMedia.url} muted playsInline />
            : <img src={firstMedia.url} alt="" />
        ) : (
          type === 'video' ? <LuPlay size={48} /> : <LuImage size={48} />
        )}
      </div>

      {/* Side actions */}
      <div className="np-tt__side">
        <div className="np-tt__avatar">{(user?.name?.[0] || 'V').toUpperCase()}</div>
        <div className="np-tt__action"><LuHeart size={26} /><span>1.2K</span></div>
        <div className="np-tt__action"><LuMessageCircle size={26} /><span>184</span></div>
        <div className="np-tt__action"><LuShare2 size={26} /><span>56</span></div>
        <div className="np-tt__disc"><LuMusic size={14} /></div>
      </div>

      {/* Bottom info */}
      <div className="np-tt__bottom">
        <strong>@{username}</strong>
        {content && <p>{content}</p>}
        <span className="np-tt__music"><LuMusic size={12} /> som original · {username}</span>
      </div>

      {/* Top bar */}
      <div className="np-tt__topbar">
        <span>Seguindo</span>
        <span className="np-tt__topbar--active">Para você</span>
      </div>
    </div>
  )
}
