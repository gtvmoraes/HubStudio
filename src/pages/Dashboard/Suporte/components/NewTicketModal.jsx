import { useState } from 'react'
import { LuCheck, LuPaperclip } from 'react-icons/lu'
import Modal from '../../../../components/Modal/Modal'
import Button from '../../../../components/Button/Button'

const CATEGORIES = ['Primeiros passos', 'Agendamento', 'Analytics', 'Conta & Cobrança', 'Integrações', 'Equipes']
const PRIORITIES = [
  { value: 'baixa', label: 'Baixa' },
  { value: 'media', label: 'Média' },
  { value: 'alta',  label: 'Alta'  },
]

const EMPTY = { subject: '', category: 'Primeiros passos', priority: 'media', description: '' }

export default function NewTicketModal({ isOpen, onClose, onSubmit }) {
  const [form, setForm] = useState(EMPTY)
  const [submitting, setSubmitting] = useState(false)

  const update = (key, value) => setForm(f => ({ ...f, [key]: value }))

  const canSubmit = form.subject.trim() && form.description.trim()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    await onSubmit(form)
    setSubmitting(false)
    setForm(EMPTY)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Abrir um chamado" size="md">
      <form className="sup-ticket-form" onSubmit={handleSubmit}>
        <div className="sup-field">
          <label htmlFor="tk-subject">Assunto</label>
          <input
            id="tk-subject"
            type="text"
            placeholder="Resuma seu problema em uma frase"
            value={form.subject}
            onChange={e => update('subject', e.target.value)}
            autoComplete="off"
          />
        </div>

        <div className="sup-field-row">
          <div className="sup-field">
            <label htmlFor="tk-category">Categoria</label>
            <select id="tk-category" value={form.category} onChange={e => update('category', e.target.value)}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="sup-field">
            <label htmlFor="tk-priority">Prioridade</label>
            <select id="tk-priority" value={form.priority} onChange={e => update('priority', e.target.value)}>
              {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
        </div>

        <div className="sup-field">
          <label htmlFor="tk-desc">Descrição</label>
          <textarea
            id="tk-desc"
            rows={5}
            placeholder="Descreva o que aconteceu, com o máximo de detalhes possível…"
            value={form.description}
            onChange={e => update('description', e.target.value)}
          />
        </div>

        <button type="button" className="sup-attach" onClick={() => {}}>
          <LuPaperclip size={15} /> Anexar arquivo (opcional)
        </button>

        <div className="sup-ticket-form__actions">
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={submitting} disabled={!canSubmit} icon={<LuCheck size={16} />}>
            Enviar chamado
          </Button>
        </div>
      </form>
    </Modal>
  )
}
