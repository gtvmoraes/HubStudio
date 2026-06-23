import { useState, useEffect, useRef } from 'react'
import {
  LuEllipsisVertical, LuPencil, LuCopy, LuTrash2,
  LuSend, LuCheck, LuX,
} from 'react-icons/lu'

// Menu de ações por post. As ações disponíveis variam por status.
export default function PostMenu({ post, onEdit, onDuplicate, onDelete, onSubmit, onApprove, onReject }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const close = (fn) => () => { setOpen(false); fn?.(post) }

  return (
    <div className="post-menu" ref={ref}>
      <button
        type="button"
        className="post-menu__trigger"
        onClick={() => setOpen(o => !o)}
        aria-label="Opções do post"
        aria-expanded={open}
      >
        <LuEllipsisVertical size={16} />
      </button>
      {open && (
        <div className="post-menu__dropdown" role="menu">
          {(post.status === 'draft' || post.status === 'scheduled' || post.status === 'rejected') && (
            <button type="button" onClick={close(onEdit)}>
              <LuPencil size={14} /> Editar
            </button>
          )}

          <button type="button" onClick={close(onDuplicate)}>
            <LuCopy size={14} /> Duplicar
          </button>

          {post.status === 'draft' && onSubmit && (
            <button type="button" onClick={close(onSubmit)}>
              <LuSend size={14} /> Submeter pra aprovação
            </button>
          )}

          {post.status === 'pending' && onApprove && (
            <button type="button" className="post-menu__success" onClick={close(onApprove)}>
              <LuCheck size={14} /> Aprovar
            </button>
          )}

          {post.status === 'pending' && onReject && (
            <button type="button" className="post-menu__danger" onClick={close(onReject)}>
              <LuX size={14} /> Rejeitar
            </button>
          )}

          {post.status !== 'published' && (
            <button type="button" className="post-menu__danger" onClick={close(onDelete)}>
              <LuTrash2 size={14} /> Excluir
            </button>
          )}
        </div>
      )}
    </div>
  )
}
