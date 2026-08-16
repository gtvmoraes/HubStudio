import { useRef, useState, useEffect } from 'react'
import { LuCloudUpload, LuX, LuPlus, LuPlay, LuImage } from 'react-icons/lu'

export default function MediaUploader({
  media = [],
  onChange,
  allowMultiple = true,
  allowedImageMimeTypes = null,
  onRejected = null,
  validateImage = null,
  onAspectRejected = null,
}) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    return () => {
      media.forEach(m => m.url && URL.revokeObjectURL(m.url))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Mede a resolução real da imagem (precisa do object URL carregado no <img>)
  const measureImage = (url) => new Promise(resolve => {
    const img = new Image()
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight })
    img.onerror = () => resolve(null)
    img.src = url
  })

  const addFiles = async (fileList) => {
    if (!fileList || fileList.length === 0) return

    const all = Array.from(fileList)
    const mimeRejected = allowedImageMimeTypes
      ? all.filter(f => !f.type.startsWith('video/') && !allowedImageMimeTypes.includes(f.type))
      : []
    const mimeAccepted = mimeRejected.length > 0 ? all.filter(f => !mimeRejected.includes(f)) : all

    if (mimeRejected.length > 0 && onRejected) {
      onRejected(mimeRejected)
    }

    if (mimeAccepted.length === 0) return

    // Valida proporção antes de aceitar (só se aplica a imagem; vídeo passa direto)
    const checked = await Promise.all(mimeAccepted.map(async file => {
      const url = URL.createObjectURL(file)
      if (!file.type.startsWith('image/') || !validateImage) {
        return { file, url, ok: true }
      }
      const dims = await measureImage(url)
      if (!dims) return { file, url, ok: true } // não deu pra medir, deixa passar

      const result = validateImage(dims.width, dims.height)
      if (!result.valid) {
        URL.revokeObjectURL(url)
        return { file, ok: false, message: result.message }
      }
      return { file, url, ok: true }
    }))

    const aspectRejected = checked.filter(c => !c.ok)
    if (aspectRejected.length > 0 && onAspectRejected) {
      onAspectRejected(aspectRejected.map(r => r.file), aspectRejected[0].message)
    }

    const accepted = checked.filter(c => c.ok)
    if (accepted.length === 0) return

    const incoming = accepted.map(({ file, url }) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      file,
      name: file.name,
      size: file.size,
      type: file.type.startsWith('video/') ? 'video' : 'image',
      url,
    }))
    onChange(allowMultiple ? [...media, ...incoming] : incoming.slice(0, 1))
  }

  const removeItem = (id) => {
    const target = media.find(m => m.id === id)
    if (target?.url) URL.revokeObjectURL(target.url)
    onChange(media.filter(m => m.id !== id))
  }

  const openPicker = () => inputRef.current?.click()

  // Drag handlers
  const onDragOver = (e) => { e.preventDefault(); setDragging(true) }
  const onDragLeave = (e) => { e.preventDefault(); setDragging(false) }
  const onDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    addFiles(e.dataTransfer.files)
  }

  const isEmpty = media.length === 0

  const formatHint = allowedImageMimeTypes
    ? `${allowedImageMimeTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')}, MP4 · até 20 MB`
    : 'JPG, PNG, MP4 · até 20 MB'

  const inputAccept = allowedImageMimeTypes
    ? `${allowedImageMimeTypes.join(',')},video/*`
    : 'image/*,video/*'

  return (
    <div
      className={`uploader${dragging ? ' uploader--drag' : ''}${isEmpty ? ' uploader--empty' : ''}`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {isEmpty ? (
        <button type="button" className="uploader__empty" onClick={openPicker}>
          <div className="uploader__empty-icon">
            <LuCloudUpload size={28} />
          </div>
          <strong>Arraste arquivos aqui</strong>
          <span>ou clique pra escolher do computador</span>
          <span className="uploader__formats">{formatHint}</span>
        </button>
      ) : (
        <div className="uploader__grid">
          {media.map(m => (
            <div key={m.id} className="uploader__item">
              <div className="uploader__thumb">
                {m.type === 'video' ? (
                  <>
                    <video src={m.url} muted playsInline />
                    <LuPlay size={20} className="uploader__type-icon" />
                  </>
                ) : (
                  <>
                    <img src={m.url} alt={m.name} />
                    <LuImage size={14} className="uploader__type-icon uploader__type-icon--corner" />
                  </>
                )}
                <button
                  type="button"
                  className="uploader__remove"
                  onClick={() => removeItem(m.id)}
                  aria-label="Remover arquivo"
                >
                  <LuX size={14} />
                </button>
              </div>
              <span className="uploader__name" title={m.name}>{m.name}</span>
            </div>
          ))}

          {allowMultiple && (
            <button type="button" className="uploader__add" onClick={openPicker}>
              <LuPlus size={22} />
              <span>Adicionar mais</span>
            </button>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={inputAccept}
        multiple={allowMultiple}
        hidden
        onChange={e => addFiles(e.target.files)}
      />
    </div>
  )
}
