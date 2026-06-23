import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LuX, LuArrowLeft, LuArrowRight, LuCheck,
  LuUser, LuBuilding2, LuStore,
} from 'react-icons/lu'
import { TEAM_TYPES, TEAM_COLORS } from '../../../../services/team'

const TYPE_ICONS = { personal: LuUser, agency: LuBuilding2, brand: LuStore }

const initial = (name) => name.charAt(0).toUpperCase() || '?'

export default function CreateTeamModal({ isOpen, onClose, onCreate }) {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    name: '',
    type: 'agency',
    color: TEAM_COLORS[0].value,
  })
  const [creating, setCreating] = useState(false)

  const reset = () => {
    setStep(0)
    setForm({ name: '', type: 'agency', color: TEAM_COLORS[0].value })
    setCreating(false)
  }

  const handleClose = () => { reset(); onClose() }

  const canNext = step === 0
    ? form.name.trim().length >= 2
    : step === 1
    ? Boolean(form.type)
    : true

  const next = () => setStep(s => Math.min(2, s + 1))
  const prev = () => setStep(s => Math.max(0, s - 1))

  const submit = async () => {
    setCreating(true)
    await new Promise(r => setTimeout(r, 500))
    onCreate(form)
    reset()
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="create-team-root">
          <motion.div
            className="create-team__overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
          />
          <motion.div
            className="create-team"
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.22 }}
            role="dialog"
            aria-modal="true"
          >
            <div className="create-team__head">
              <h2>Criar nova equipe</h2>
              <button type="button" onClick={handleClose} aria-label="Fechar">
                <LuX size={18} />
              </button>
            </div>

            {/* Progress indicator */}
            <div className="create-team__steps">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className={`create-team__step-dot${i === step ? ' create-team__step-dot--active' : ''}${i < step ? ' create-team__step-dot--done' : ''}`}
                />
              ))}
            </div>

            <div className="create-team__body">
              {/* Preview do avatar (atualiza ao vivo) */}
              <div className="create-team__preview">
                <div
                  className="create-team__avatar"
                  style={{ background: form.color }}
                >
                  {initial(form.name)}
                </div>
                <strong>{form.name || 'Nome do time'}</strong>
              </div>

              {/* Step 0 — Nome */}
              {step === 0 && (
                <div className="create-team__step">
                  <h3>Como vai chamar essa equipe?</h3>
                  <p>Use um nome que identifique o time — pode ser sua empresa, marca ou projeto.</p>
                  <input
                    type="text"
                    placeholder="Ex: Studio Criativo"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value.slice(0, 40) }))}
                    autoFocus
                  />
                  <span className="create-team__hint">{form.name.length} / 40</span>
                </div>
              )}

              {/* Step 1 — Tipo */}
              {step === 1 && (
                <div className="create-team__step">
                  <h3>Qual o tipo da equipe?</h3>
                  <p>Isso ajuda a gente a sugerir as configurações certas. Pode mudar depois.</p>
                  <div className="create-team__types">
                    {TEAM_TYPES.map(t => {
                      const Icon = TYPE_ICONS[t.id]
                      return (
                        <button
                          key={t.id}
                          type="button"
                          className={`create-team__type${form.type === t.id ? ' create-team__type--active' : ''}`}
                          onClick={() => setForm(f => ({ ...f, type: t.id }))}
                        >
                          <span className="create-team__type-icon">
                            {Icon && <Icon size={20} />}
                          </span>
                          <div>
                            <strong>{t.label}</strong>
                            <span>{t.desc}</span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Step 2 — Cor */}
              {step === 2 && (
                <div className="create-team__step">
                  <h3>Escolha uma cor</h3>
                  <p>O avatar do time vai ter a inicial em cima dessa cor.</p>
                  <div className="create-team__colors">
                    {TEAM_COLORS.map(c => (
                      <button
                        key={c.id}
                        type="button"
                        className={`create-team__color${form.color === c.value ? ' create-team__color--active' : ''}`}
                        style={{ background: c.value }}
                        onClick={() => setForm(f => ({ ...f, color: c.value }))}
                        aria-label={`Cor ${c.id}`}
                      >
                        {form.color === c.value && <LuCheck size={16} />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="create-team__footer">
              {step > 0 ? (
                <button type="button" className="create-team__back" onClick={prev}>
                  <LuArrowLeft size={14} /> Voltar
                </button>
              ) : <span />}

              {step < 2 ? (
                <button
                  type="button"
                  className="create-team__next"
                  onClick={next}
                  disabled={!canNext}
                >
                  Próximo <LuArrowRight size={14} />
                </button>
              ) : (
                <button
                  type="button"
                  className="create-team__next"
                  onClick={submit}
                  disabled={creating || !form.name.trim()}
                >
                  {creating ? 'Criando...' : 'Criar equipe'} <LuCheck size={14} />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
