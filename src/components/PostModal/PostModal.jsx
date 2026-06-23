import { useState, useEffect } from 'react'
import Modal from '../Modal/Modal'
import Button from '../Button/Button'
import { LuInstagram, LuTwitter, LuYoutube, LuCloudUpload, LuSparkles, LuCheck } from 'react-icons/lu'
import { schedulePost } from '../../services/posts'
import './PostModal.css'

const NETWORKS = [
  { id: 'instagram', label: 'Instagram', icon: LuInstagram, color: '#E1306C' },
  { id: 'twitter',   label: 'Twitter',   icon: LuTwitter,   color: '#1DA1F2' },
  { id: 'youtube',   label: 'YouTube',   icon: LuYoutube,   color: '#FF0000' },
]

const STEPS = ['Conteúdo', 'Agendamento', 'Confirmar']

export default function PostModal({ isOpen, onClose, prefill = null }) {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [form, setForm] = useState({
    text: '',
    networks: [],
    date: '',
    time: '12:00',
  })

  // Aplica prefill quando o modal abre com sugestão da IA / duplicação de post
  useEffect(() => {
    if (isOpen && prefill) {
      setForm(f => ({ ...f, ...prefill }))
    }
  }, [isOpen, prefill])

  const handleClose = () => {
    setStep(0)
    setDone(false)
    setForm({ text: '', networks: [], date: '', time: '12:00' })
    onClose()
  }

  const toggleNetwork = (id) => {
    setForm(f => ({
      ...f,
      networks: f.networks.includes(id)
        ? f.networks.filter(n => n !== id)
        : [...f.networks, id],
    }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    await schedulePost(form)
    setLoading(false)
    setDone(true)
  }

  const canNext = step === 0
    ? form.text.trim().length > 0
    : step === 1
    ? form.networks.length > 0 && form.date
    : true

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Novo post" size="lg">
      {done ? (
        <div className="post-modal__done">
          <div className="post-modal__done-icon"><LuCheck size={32} /></div>
          <h3>Post agendado com sucesso!</h3>
          <p>Seu conteúdo será publicado em {form.date} às {form.time}.</p>
          <Button onClick={handleClose}>Fechar</Button>
        </div>
      ) : (
        <>
          {/* Steps */}
          <div className="post-modal__steps">
            {STEPS.map((s, i) => (
              <div key={s} className={`post-modal__step ${i === step ? 'post-modal__step--active' : ''} ${i < step ? 'post-modal__step--done' : ''}`}>
                <div className="post-modal__step-dot">{i < step ? <LuCheck size={12} /> : i + 1}</div>
                <span>{s}</span>
              </div>
            ))}
            <div className="post-modal__steps-line" />
          </div>

          {/* Step 0 — Conteúdo */}
          {step === 0 && (
            <div className="post-modal__content">
              <div className="post-modal__field">
                <label>Legenda</label>
                <textarea
                  value={form.text}
                  onChange={e => setForm(f => ({ ...f, text: e.target.value }))}
                  placeholder="Escreva sua legenda aqui..."
                  rows={5}
                  maxLength={2200}
                />
                <span className="post-modal__char-count">{form.text.length}/2200</span>
              </div>
              <div className="post-modal__upload">
                <LuCloudUpload size={28} />
                <span>Carregar imagem ou vídeo</span>
                <small>PNG, JPG, MP4 — máx. 100MB</small>
              </div>
              <button className="post-modal__ai-btn">
                <LuSparkles size={15} /> Gerar sugestão com IA
              </button>
            </div>
          )}

          {/* Step 1 — Agendamento */}
          {step === 1 && (
            <div className="post-modal__schedule">
              <div className="post-modal__field">
                <label>Redes sociais</label>
                <div className="post-modal__networks">
                  {NETWORKS.map(({ id, label, icon: Icon, color }) => (
                    <button
                      key={id}
                      className={`post-modal__network ${form.networks.includes(id) ? 'post-modal__network--selected' : ''}`}
                      onClick={() => toggleNetwork(id)}
                      style={{ '--net-color': color }}
                    >
                      <Icon size={20} />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="post-modal__datetime">
                <div className="post-modal__field">
                  <label>Data</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="post-modal__field">
                  <label>Horário</label>
                  <input
                    type="time"
                    value={form.time}
                    onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                  />
                </div>
              </div>
              <div className="post-modal__ai-tip">
                <LuSparkles size={14} />
                <span>IA sugere: <strong>19h às 21h</strong> para maior engajamento no Instagram</span>
              </div>
            </div>
          )}

          {/* Step 2 — Confirmar */}
          {step === 2 && (
            <div className="post-modal__confirm">
              <div className="post-modal__confirm-row">
                <span>Legenda</span>
                <p>{form.text}</p>
              </div>
              <div className="post-modal__confirm-row">
                <span>Redes</span>
                <p>{form.networks.join(', ') || '—'}</p>
              </div>
              <div className="post-modal__confirm-row">
                <span>Agendamento</span>
                <p>{form.date} às {form.time}</p>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="post-modal__footer">
            {step > 0 && (
              <Button variant="ghost" onClick={() => setStep(s => s - 1)}>Voltar</Button>
            )}
            <div style={{ flex: 1 }} />
            {step < STEPS.length - 1 ? (
              <Button onClick={() => setStep(s => s + 1)} disabled={!canNext}>
                Próximo
              </Button>
            ) : (
              <Button onClick={handleSubmit} loading={loading} disabled={!canNext}>
                Agendar post
              </Button>
            )}
          </div>
        </>
      )}
    </Modal>
  )
}
