import { LuMessageCircle, LuRepeat, LuHeart, LuShare2, LuChartBar } from 'react-icons/lu'
import { FaXTwitter } from 'react-icons/fa6'
import PreviewVideo from './PreviewVideo'

const handle = (user) => (user?.name || 'voce').toLowerCase().replace(/\s+/g, '')

export default function TwitterPreview({ content, user, media = [] }) {
  const name = user?.name || 'Você'
  const username = handle(user)
  const firstMedia = media[0]

  return (
    <div className="np-tw">
      {/* Header com X icon */}
      <div className="np-tw__header">
        <FaXTwitter size={18} />
      </div>

      <div className="np-tw__post">
        <div className="np-tw__avatar">{name[0].toUpperCase()}</div>

        <div className="np-tw__body">
          <div className="np-tw__user">
            <strong>{name}</strong>
            <span>@{username} · agora</span>
          </div>

          {/* Texto */}
          {content && (
            <div className="np-tw__text">{content}</div>
          )}

          {/* Mídia */}
          {firstMedia && (
            <div className="np-tw__media">
              {firstMedia.type === 'video' ? (
                <PreviewVideo src={firstMedia.url} />
              ) : (
                <img src={firstMedia.url} alt="" />
              )}
            </div>
          )}

          {/* Ações */}
          <div className="np-tw__actions">
            <span><LuMessageCircle size={15} /> 12</span>
            <span><LuRepeat size={15} /> 34</span>
            <span><LuHeart size={15} /> 156</span>
            <span><LuChartBar size={15} /> 2.4K</span>
            <span><LuShare2 size={15} /></span>
          </div>
        </div>
      </div>
    </div>
  )
}
