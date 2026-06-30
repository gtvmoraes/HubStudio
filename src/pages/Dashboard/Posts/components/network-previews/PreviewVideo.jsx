import { useRef, useState } from 'react'
import { LuPlay, LuPause } from 'react-icons/lu'

/**
 * Vídeo funcional dentro dos previews de rede.
 * Clique no quadro reproduz/pausa. Mostra overlay de play quando pausado.
 * Mantém o visual limpo das redes (sem barra de controles nativa).
 */
export default function PreviewVideo({ src, className = '' }) {
  const videoRef = useRef(null)
  const [playing, setPlaying] = useState(false)

  const toggle = (e) => {
    e.stopPropagation()
    const v = videoRef.current
    if (!v) return
    if (v.paused) {
      v.play()
    } else {
      v.pause()
    }
  }

  return (
    <div className={`np-video${className ? ` ${className}` : ''}`} onClick={toggle}>
      <video
        ref={videoRef}
        src={src}
        muted
        playsInline
        loop
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      <button
        type="button"
        className={`np-video__btn${playing ? ' np-video__btn--playing' : ''}`}
        onClick={toggle}
        aria-label={playing ? 'Pausar vídeo' : 'Reproduzir vídeo'}
      >
        {playing ? <LuPause size={20} /> : <LuPlay size={20} />}
      </button>
    </div>
  )
}
