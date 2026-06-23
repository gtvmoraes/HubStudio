import { useState, useEffect } from 'react'
import { FaInstagram, FaTiktok, FaYoutube, FaFacebook, FaLinkedin } from 'react-icons/fa'
import { FaXTwitter } from 'react-icons/fa6'
import { NETWORK_META, networkColor } from '../../../../services/posts'
import { useTheme } from '../../../../contexts/ThemeContext'
import InstagramPreview from './network-previews/InstagramPreview'
import TiktokPreview from './network-previews/TiktokPreview'
import YoutubePreview from './network-previews/YoutubePreview'
import FacebookPreview from './network-previews/FacebookPreview'
import LinkedinPreview from './network-previews/LinkedinPreview'
import TwitterPreview from './network-previews/TwitterPreview'
import './network-previews/styles.css'

const ICONS = {
  instagram: FaInstagram,
  tiktok:    FaTiktok,
  youtube:   FaYoutube,
  facebook:  FaFacebook,
  linkedin:  FaLinkedin,
  twitter:   FaXTwitter,
}

const PREVIEWS = {
  instagram: InstagramPreview,
  tiktok:    TiktokPreview,
  youtube:   YoutubePreview,
  facebook:  FacebookPreview,
  linkedin:  LinkedinPreview,
  twitter:   TwitterPreview,
}

/**
 * Preview de celular com tabs entre redes.
 * Suporta duas formas de receber conteúdo:
 *   - contentByNetwork: { [networkId]: { title, content, media } } — preferido
 *   - title/content/media globais — fallback (modo legado)
 *
 * `activeNetwork` (opcional): força qual rede está sendo exibida (sincroniza
 * com tabs do composer). Se não passado, gerencia state interno.
 */
export default function PhonePreview({
  networks, typesByNetwork,
  // Modo per-network (novo)
  contentByNetwork,
  // Modo global (fallback)
  title, content, media,
  user,
  activeNetwork, onActiveNetworkChange,
}) {
  const { theme } = useTheme()
  const [internalActive, setInternalActive] = useState(networks[0])
  const active = activeNetwork || internalActive

  // Mantém a rede ativa válida quando a lista de networks muda
  useEffect(() => {
    if (networks.length === 0) return
    if (!networks.includes(internalActive)) {
      const next = networks[0]
      setInternalActive(next)
      onActiveNetworkChange?.(next)
    }
  }, [networks, internalActive, onActiveNetworkChange])

  const setActive = (n) => {
    setInternalActive(n)
    onActiveNetworkChange?.(n)
  }

  // Estado vazio
  if (networks.length === 0) {
    return (
      <div className="phone-preview">
        <div className="phone-preview__empty">
          <div className="phone-preview__frame phone-preview__frame--empty">
            <div className="phone-preview__notch" />
            <div className="phone-preview__screen phone-preview__screen--empty">
              <p>Escolha uma rede pra ver o preview</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const activeType = typesByNetwork[active]
  const Preview = PREVIEWS[active]
  const meta = NETWORK_META[active]

  // Resolve qual conteúdo passar pro preview (per-network ou fallback global)
  const localContent = contentByNetwork?.[active]
  const resolvedTitle   = localContent?.title   ?? title
  const resolvedContent = localContent?.content ?? content
  const resolvedMedia   = localContent?.media   ?? media ?? []

  return (
    <div className="phone-preview">
      {/* Tabs das redes — aparece com 2+ */}
      {networks.length > 1 && (
        <div className="phone-preview__tabs">
          {networks.map(n => {
            const Icon = ICONS[n]
            const m = NETWORK_META[n]
            const isActive = n === active
            return (
              <button
                key={n}
                type="button"
                className={`phone-preview__tab${isActive ? ' phone-preview__tab--active' : ''}`}
                onClick={() => setActive(n)}
                style={isActive ? { color: networkColor(n, theme) } : {}}
                title={m?.label}
              >
                <Icon size={16} />
              </button>
            )
          })}
        </div>
      )}

      {/* Phone frame */}
      <div className="phone-preview__frame">
        <div className="phone-preview__notch" />
        <div className="phone-preview__screen">
          {Preview && (
            <Preview
              type={activeType}
              title={resolvedTitle}
              content={resolvedContent}
              media={resolvedMedia}
              user={user}
            />
          )}
        </div>
      </div>

      {/* Rótulo */}
      <span className="phone-preview__label" style={{ color: networkColor(active, theme) }}>
        {meta?.label} · {meta?.types.find(t => t.id === activeType)?.label || ''}
      </span>
    </div>
  )
}
