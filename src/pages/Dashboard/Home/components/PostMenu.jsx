import { useState, useEffect, useRef } from 'react'
import { LuEllipsisVertical, LuPencil, LuCopy, LuTrash2 } from 'react-icons/lu'

// Dropdown de ações para uma publicação (Editar / Duplicar / Excluir).
export default function PostMenu({ onEdit, onDuplicate, onDelete }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div className="post-menu" ref={ref}>
      <button
        type="button"
        className="recent-post__more"
        onClick={() => setOpen(o => !o)}
        aria-label="Opções do post"
        aria-expanded={open}
      >
        <LuEllipsisVertical size={16} />
      </button>
      {open && (
        <div className="post-menu__dropdown" role="menu">
          <button type="button" onClick={() => { setOpen(false); onEdit() }}>
            <LuPencil size={14} /> Editar
          </button>
          <button type="button" onClick={() => { setOpen(false); onDuplicate() }}>
            <LuCopy size={14} /> Duplicar
          </button>
          <button type="button" className="post-menu__danger" onClick={() => { setOpen(false); onDelete() }}>
            <LuTrash2 size={14} /> Excluir
          </button>
        </div>
      )}
    </div>
  )
}
