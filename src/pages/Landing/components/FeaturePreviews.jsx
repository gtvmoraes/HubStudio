import { LuSparkles, LuTrendingUp } from 'react-icons/lu'
import { FaInstagram, FaTiktok, FaYoutube, FaFacebook, FaLinkedin } from 'react-icons/fa'
import { FaXTwitter } from 'react-icons/fa6'

export function FeatureCalendarPreview() {
  const days = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D']
  const posts = new Set([1, 4, 8, 11])
  return (
    <div className="l-bento__preview l-bento__preview--calendar">
      <div className="l-fp-cal__head">
        {days.map((d, i) => <span key={i}>{d}</span>)}
      </div>
      <div className="l-fp-cal__grid">
        {Array.from({ length: 14 }).map((_, i) => (
          <div key={i} className={`l-fp-cal__cell${posts.has(i) ? ' l-fp-cal__cell--post' : ''}`}>
            <span>{i + 14}</span>
            {posts.has(i) && <span className="l-fp-cal__dot" />}
          </div>
        ))}
      </div>
    </div>
  )
}

export function FeatureChartPreview() {
  const bars = [42, 60, 48, 75, 55, 88, 70]
  return (
    <div className="l-bento__preview l-bento__preview--chart">
      <div className="l-fp-chart__head">
        <span className="l-fp-chart__metric">
          <LuTrendingUp />
          +127%
        </span>
        <span className="l-fp-chart__live">
          <span className="l-fp-chart__pulse" />
          Ao vivo
        </span>
      </div>
      <div className="l-fp-chart__bars">
        {bars.map((h, i) => (
          <div key={i} className="l-fp-chart__bar" style={{ '--h': `${h}%`, '--i': i }} />
        ))}
      </div>
    </div>
  )
}

export function FeatureHashtagsPreview() {
  return (
    <div className="l-bento__preview l-bento__preview--hashtags">
      <span className="l-fp-tag-label">
        <LuSparkles size={12} />
        IA sugeriu
      </span>
      <div className="l-fp-tag-list">
        {['#marketing', '#growth', '#socialmedia', '#contentcreator'].map((tag, i) => (
          <span key={tag} className="l-fp-tag" style={{ '--i': i }}>{tag}</span>
        ))}
      </div>
    </div>
  )
}

export function FeaturePlatformsPreview() {
  const platforms = [
    { Icon: FaInstagram, color: '#E1306C' },
    { Icon: FaTiktok,    color: '#010101' },
    { Icon: FaYoutube,   color: '#FF0000' },
    { Icon: FaFacebook,  color: '#1877F2' },
    { Icon: FaLinkedin,  color: '#0A66C2' },
    { Icon: FaXTwitter,  color: '#000000' },
  ]
  return (
    <div className="l-bento__preview l-bento__preview--platforms">
      <div className="l-fp-platform-stack">
        {platforms.map(({ Icon, color }, i) => (
          <span key={i} className="l-fp-platform" style={{ '--i': i, background: color }}>
            <Icon />
          </span>
        ))}
      </div>
    </div>
  )
}
