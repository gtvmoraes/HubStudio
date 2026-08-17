import { useState, useEffect } from 'react'
import { LuHeart, LuMessageCircle, LuSend, LuBookmark, LuPlay, LuImage, LuChevronLeft, LuChevronRight } from 'react-icons/lu'
import PreviewVideo from './PreviewVideo'

const handle = (user) => (user?.name || 'voce').toLowerCase().replace(/\s+/g, '_')

// Renderiza a mídia (image/video) ou um placeholder
function MediaSlot({ item, placeholderIcon }) {
  if (!item) return placeholderIcon
  if (item.type === 'video') return <PreviewVideo src={item.url} />
  return <img src={item.url} alt="" />
}

export default function InstagramPreview({ type = 'feed', content, user, media = [] }) {
  const username = handle(user)
  const isVertical = type === 'reel' || type === 'story'
  const isStory = type === 'story'
  const isCarousel = type === 'carousel'
  const firstMedia = media[0]

  // Navegação real do carrossel: volta pro início se a mídia mudar (imagem removida/trocada)
  const [activeIndex, setActiveIndex] = useState(0)
  useEffect(() => { setActiveIndex(0) }, [media.length])

  const activeMedia = isCarousel ? media[activeIndex] : firstMedia
  const goPrev = (e) => { e.stopPropagation(); setActiveIndex(i => (i - 1 + media.length) % media.length) }
  const goNext = (e) => { e.stopPropagation(); setActiveIndex(i => (i + 1) % media.length) }

  // Story tem layout diferente — quase fullscreen, texto sobreposto
  if (isStory) {
    return (
      <div className="np-ig np-ig--story">
        <div className="np-ig__story-header">
          <div className="np-ig__avatar">{(user?.name?.[0] || 'V').toUpperCase()}</div>
          <span>{username}</span>
          <span className="np-ig__story-time">agora</span>
        </div>
        <div className="np-ig__story-bar"><span /></div>
        <div className="np-ig__story-media">
          <MediaSlot item={firstMedia} placeholderIcon={<LuImage size={48} />} />
        </div>
        {content && (
          <div className="np-ig__story-text">{content.split('\n')[0]}</div>
        )}
      </div>
    )
  }

  return (
    <div className="np-ig">
      {/* Header */}
      <div className="np-ig__header">
        <div className="np-ig__avatar">{(user?.name?.[0] || 'V').toUpperCase()}</div>
        <div className="np-ig__user">
          <strong>{username}</strong>
          <span>Original audio</span>
        </div>
        <span className="np-ig__more">⋯</span>
      </div>

      {/* Mídia */}
      <div className={`np-ig__media np-ig__media--${isVertical ? 'vert' : 'square'}${firstMedia ? ' np-ig__media--filled' : ''}`}>
        <MediaSlot
          item={activeMedia}
          placeholderIcon={!isVertical ? <LuImage size={36} /> : null}
        />
        {type === 'reel' && !firstMedia && <LuPlay size={36} className="np-ig__play" />}

        {isCarousel && media.length > 1 && (
          <>
            <button type="button" className="np-ig__nav np-ig__nav--prev" onClick={goPrev} aria-label="Imagem anterior">
              <LuChevronLeft size={16} />
            </button>
            <button type="button" className="np-ig__nav np-ig__nav--next" onClick={goNext} aria-label="Próxima imagem">
              <LuChevronRight size={16} />
            </button>
            <div className="np-ig__dots">
              {media.map((m, i) => (
                <span key={m.id ?? i} className={`np-ig__dot${i === activeIndex ? ' np-ig__dot--active' : ''}`} />
              ))}
            </div>
          </>
        )}

        {isCarousel && (
          <span className="np-ig__indicator">{media.length > 0 ? activeIndex + 1 : 1}/{Math.max(media.length, 1)}</span>
        )}
      </div>

      {/* Ações */}
      <div className="np-ig__actions">
        <LuHeart size={22} />
        <LuMessageCircle size={22} />
        <LuSend size={22} />
        <LuBookmark size={22} className="np-ig__save" />
      </div>

      <div className="np-ig__likes">12.345 curtidas</div>

      {/* Caption */}
      {content && (
        <div className="np-ig__caption">
          <strong>{username}</strong>{' '}
          <span>{content}</span>
        </div>
      )}
    </div>
  )
}
