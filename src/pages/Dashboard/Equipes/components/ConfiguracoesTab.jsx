import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  LuCamera, LuTrash2, LuLogOut, LuCheck, LuTriangleAlert, LuLock,
  LuUser, LuBuilding2, LuStore,
} from 'react-icons/lu'
import { TEAM_COLORS, TEAM_TYPES, PERMISSION_MATRIX } from '../../../../services/team'

const TYPE_ICONS = { personal: LuUser, agency: LuBuilding2, brand: LuStore }

const initial = (name) => name?.charAt(0).toUpperCase() || '?'

export default function ConfiguracoesTab({ team, currentRole, onUpdate, onDelete, onLeave }) {
  const canEdit = PERMISSION_MATRIX[currentRole]?.accountSettings === true
  const fileInputRef = useRef(null)

  const [form, setForm] = useState({
    name: team.name,
    color: team.color,
    photo: team.photo || null,
    description: team.description || '',
    type: team.type,
  })
  const [saving, setSaving] = useState(false)
  const [savedFlash, setSavedFlash] = useState(false)
  const [showDanger, setShowDanger] = useState(false)

  // Reseta o form ao trocar de time
  useEffect(() => {
    setForm({
      name: team.name,
      color: team.color,
      photo: team.photo || null,
      description: team.description || '',
      type: team.type,
    })
  }, [team.id])

  const dirty =
    form.name !== team.name ||
    form.color !== team.color ||
    form.photo !== (team.photo || null) ||
    form.description !== (team.description || '') ||
    form.type !== team.type

  const handlePhotoPick = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setForm(f => ({ ...f, photo: reader.result }))
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    if (!dirty || !canEdit) return
    setSaving(true)
    await new Promise(r => setTimeout(r, 400))
    onUpdate({
      name: form.name.trim() || team.name,
      color: form.color,
      photo: form.photo,
      description: form.description,
      type: form.type,
    })
    setSaving(false)
    setSavedFlash(true)
    setTimeout(() => setSavedFlash(false), 1800)
  }

  return (
    <motion.div
      className="config-tab"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      {!canEdit && (
        <div className="config-tab__locked">
          <LuLock size={14} />
          Só Admins podem editar essas configurações. Você está como visualizador.
        </div>
      )}

      {/* Card: identidade */}
      <section className="config-card">
        <header>
          <h3>Identidade do time</h3>
          <p>Como o time aparece pra todo mundo no HubStudio.</p>
        </header>

        <div className="config-identity">
          <div className="config-identity__avatar-wrap">
            <div
              className="config-identity__avatar"
              style={{ background: form.photo ? 'transparent' : form.color }}
            >
              {form.photo
                ? <img src={form.photo} alt="" />
                : <span>{initial(form.name)}</span>}
            </div>
            {canEdit && (
              <>
                <button
                  type="button"
                  className="config-identity__photo-btn"
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Trocar foto"
                >
                  <LuCamera size={14} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoPick}
                  hidden
                />
                {form.photo && (
                  <button
                    type="button"
                    className="config-identity__photo-remove"
                    onClick={() => setForm(f => ({ ...f, photo: null }))}
                  >
                    Remover foto
                  </button>
                )}
              </>
            )}
          </div>

          <div className="config-identity__fields">
            <label className="config-field">
              <span>Nome da equipe</span>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value.slice(0, 40) }))}
                disabled={!canEdit}
                maxLength={40}
              />
              <small>{form.name.length} / 40</small>
            </label>

            <label className="config-field">
              <span>Descrição</span>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value.slice(0, 140) }))}
                disabled={!canEdit}
                rows={2}
                placeholder="Em poucas palavras, do que é esse time?"
              />
              <small>{form.description.length} / 140</small>
            </label>
          </div>
        </div>
      </section>

      {/* Card: visual */}
      {!form.photo && (
        <section className="config-card">
          <header>
            <h3>Cor do avatar</h3>
            <p>Usada quando o time não tem foto.</p>
          </header>

          <div className="config-colors">
            {TEAM_COLORS.map(c => (
              <button
                key={c.id}
                type="button"
                className={`config-color${form.color === c.value ? ' config-color--active' : ''}`}
                style={{ background: c.value }}
                onClick={() => canEdit && setForm(f => ({ ...f, color: c.value }))}
                disabled={!canEdit}
                aria-label={`Cor ${c.id}`}
              >
                {form.color === c.value && <LuCheck size={14} />}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Card: tipo */}
      <section className="config-card">
        <header>
          <h3>Tipo de equipe</h3>
          <p>Não muda permissões — só ajuda a gente a sugerir o que faz sentido.</p>
        </header>
        <div className="config-types">
          {TEAM_TYPES.map(t => {
            const Icon = TYPE_ICONS[t.id]
            return (
              <button
                key={t.id}
                type="button"
                className={`config-type${form.type === t.id ? ' config-type--active' : ''}`}
                onClick={() => canEdit && setForm(f => ({ ...f, type: t.id }))}
                disabled={!canEdit}
              >
                <span className="config-type__icon">
                  {Icon && <Icon size={22} />}
                </span>
                <strong>{t.label}</strong>
              </button>
            )
          })}
        </div>
      </section>

      {/* Save bar (flutua quando há mudanças) */}
      {canEdit && (
        <motion.div
          className={`config-savebar${dirty ? ' config-savebar--show' : ''}`}
          animate={{
            opacity: dirty ? 1 : 0,
            y: dirty ? 0 : 20,
            pointerEvents: dirty ? 'auto' : 'none',
          }}
          transition={{ duration: 0.25 }}
        >
          <span>{savedFlash ? 'Salvo!' : 'Você tem mudanças não salvas.'}</span>
          <button
            type="button"
            className="config-savebar__cancel"
            onClick={() => setForm({
              name: team.name,
              color: team.color,
              photo: team.photo || null,
              description: team.description || '',
              type: team.type,
            })}
            disabled={saving}
          >
            Descartar
          </button>
          <button
            type="button"
            className="config-savebar__save"
            onClick={handleSave}
            disabled={saving || !form.name.trim()}
          >
            {saving ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </motion.div>
      )}

      {/* Zona de perigo */}
      <section className="config-card config-danger">
        <header>
          <h3><LuTriangleAlert size={15} /> Zona de perigo</h3>
          <p>Ações irreversíveis. Pensa bem antes.</p>
        </header>

        <div className="config-danger__actions">
          {currentRole !== 'admin' && (
            <button
              type="button"
              className="config-danger__btn"
              onClick={() => {
                if (window.confirm(`Sair de "${team.name}"? Você vai perder acesso aos posts e analytics dessa equipe.`)) {
                  onLeave()
                }
              }}
            >
              <LuLogOut size={14} />
              <div>
                <strong>Sair da equipe</strong>
                <span>Você não fará mais parte desse time.</span>
              </div>
            </button>
          )}

          {canEdit && (
            !showDanger ? (
              <button
                type="button"
                className="config-danger__btn"
                onClick={() => setShowDanger(true)}
              >
                <LuTrash2 size={14} />
                <div>
                  <strong>Excluir equipe</strong>
                  <span>Apaga tudo: membros, posts, configurações.</span>
                </div>
              </button>
            ) : (
              <div className="config-danger__confirm">
                <p>Digite <strong>{team.name}</strong> pra confirmar:</p>
                <DangerConfirm teamName={team.name} onConfirm={onDelete} onCancel={() => setShowDanger(false)} />
              </div>
            )
          )}
        </div>
      </section>
    </motion.div>
  )
}

function DangerConfirm({ teamName, onConfirm, onCancel }) {
  const [value, setValue] = useState('')
  const matches = value.trim() === teamName.trim()
  return (
    <div className="config-danger__confirm-row">
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        autoFocus
        placeholder={teamName}
      />
      <button type="button" onClick={onCancel}>Cancelar</button>
      <button
        type="button"
        className="config-danger__confirm-go"
        disabled={!matches}
        onClick={onConfirm}
      >
        Excluir
      </button>
    </div>
  )
}
