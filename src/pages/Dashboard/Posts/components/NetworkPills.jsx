import { FaInstagram, FaTiktok, FaYoutube, FaFacebook, FaLinkedin } from 'react-icons/fa'
import { FaXTwitter } from 'react-icons/fa6'
import { NETWORK_META, networkColor } from '../../../../services/posts'
import { useTheme } from '../../../../contexts/ThemeContext'

const NETWORK_ICONS = {
  instagram: FaInstagram,
  tiktok:    FaTiktok,
  youtube:   FaYoutube,
  facebook:  FaFacebook,
  linkedin:  FaLinkedin,
  twitter:   FaXTwitter,
}

export default function NetworkPills({ networks = [], size = 14 }) {
  const { theme } = useTheme()
  return (
    <div className="net-pills">
      {networks.map(n => {
        const Icon = NETWORK_ICONS[n]
        if (!Icon) return null
        return (
          <span
            key={n}
            className="net-pills__item"
            style={{ color: networkColor(n, theme) }}
            title={NETWORK_META[n]?.label || n}
          >
            <Icon size={size} />
          </span>
        )
      })}
    </div>
  )
}
