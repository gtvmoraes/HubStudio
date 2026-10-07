import { useState, useEffect, useRef } from 'react'
import {
  LuEllipsisVertical, LuPencil, LuCopy, LuTrash2,
  LuSend, LuCheck, LuX, LuUndo2, LuCalendarX,
} from 'react-icons/lu'

// Menu de ações por post. O que aparece depende do status E do que o usuário
// pode fazer com aquele post (perms, calculado em Posts.jsx a partir do cargo).
export default function PostMenu({ post, perms = {}, submitLabel = 'Enviar', onAction }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const run = (action) => () => { setOpen(false); onAction(action) }

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
          {perms.canEdit && (
            <button type="button" onClick={run('edit')}>
              <LuPencil size={14} /> Editar
            </button>
          )}

          {perms.canSubmit && (
            <button type="button" onClick={run('submit')}>
              <LuSend size={14} /> {submitLabel}
            </button>
          )}

          {perms.canReview && (
            <button type="button" className="post-menu__success" onClick={run('approve')}>
              <LuCheck size={14} /> Aprovar
            </button>
          )}

          {perms.canReview && (
            <button type="button" className="post-menu__danger" onClick={run('reject')}>
              <LuX size={14} /> Rejeitar
            </button>
          )}

          {perms.canWithdraw && (
            <button type="button" onClick={run('withdraw')}>
              <LuUndo2 size={14} /> Retirar da aprovação
            </button>
          )}

          {perms.canCancel && (
            <button type="button" className="post-menu__danger" onClick={run('cancel')}>
              <LuCalendarX size={14} /> Cancelar agendamento
            </button>
          )}

          <button type="button" onClick={run('duplicate')}>
            <LuCopy size={14} /> Duplicar
          </button>

          {perms.canEdit && (
            <button type="button" className="post-menu__danger" onClick={run('delete')}>
              <LuTrash2 size={14} /> Excluir
            </button>
          )}
        </div>
      )}
    </div>
  )
}
