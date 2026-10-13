import { useState, useRef } from 'react'
import { LuCamera, LuCheck, LuAtSign } from 'react-icons/lu'
import { useAuth } from '../../../../contexts/AuthContext'
import { getInitials } from '../../../../utils/string'
import Button from '../../../../components/Button/Button'
import { updateProfile } from '../../../../services/settings'
import { useNavigate } from 'react-router-dom'

const TIMEZONES = [
  'America/Sao_Paulo (GMT-3)',
  'America/Manaus (GMT-4)',
  'America/Noronha (GMT-2)',
  'Europe/Lisbon (GMT+1)',
]
const LANGUAGES = ['Português (Brasil)', 'English (US)', 'Español']

export default function PerfilTab() {
  const { user, updateUser, logout } = useAuth()
  const navigate = useNavigate()
  const fileRef = useRef(null)
  const [photo, setPhoto] = useState(user?.profilePictureUrl || null)
  const [photoFile, setPhotoFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: user?.name || '',
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || '',
    timezone: TIMEZONES.find(t => t.startsWith(user?.timezone || 'America/Sao_Paulo')) || TIMEZONES[0],
    language: user?.language || LANGUAGES[0],
    currentPassword: '',
  })
  const [saved, setSaved] = useState(false)

  const update = (key, value) => setForm(f => ({ ...f, [key]: value }))

  const handlePhoto = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024 || !['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      setError('Selecione uma imagem JPG, PNG, WebP ou GIF de até 5 MB.')
      return
    }
    setPhotoFile(file)
    const reader = new FileReader()
    reader.onload = () => setPhoto(reader.result)
    reader.readAsDataURL(file)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const updated = await updateProfile({ ...form, timezone: form.timezone.split(' ')[0] }, photoFile)
      if (updated.email.toLowerCase() !== user.email.toLowerCase()) {
        logout()
        navigate('/entrar')
        return
      }
      updateUser(updated)
      setPhotoFile(null)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  return (
    <form className="set-section" onSubmit={handleSave}>
      <div className="set-section__head">
        <h2>Perfil pessoal</h2>
        <p>Atualize suas informações e como você aparece na plataforma.</p>
      </div>

      <div className="set-card">
        <div className="set-avatar-row">
          <div className="set-avatar">
            {photo
              ? <img src={photo} alt="" />
              : <span>{getInitials(form.name)}</span>
            }
            <button type="button" className="set-avatar__edit" onClick={() => fileRef.current?.click()} aria-label="Trocar foto">
              <LuCamera size={14} />
            </button>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={handlePhoto} />
          </div>
          <div className="set-avatar-info">
            <strong>{form.name || 'Seu nome'}</strong>
            <span>@{form.username}</span>
          </div>
        </div>

        <div className="set-form-grid">
          <div className="set-field set-field--full">
            <label htmlFor="pf-name">Nome completo</label>
            <input id="pf-name" value={form.name} onChange={e => update('name', e.target.value)} placeholder="Seu nome" />
          </div>

          <div className="set-field">
            <label htmlFor="pf-user">Nome de usuário</label>
            <div className="set-input-prefix">
              <LuAtSign size={15} />
              <input id="pf-user" value={form.username} onChange={e => update('username', e.target.value.replace(/\s+/g, ''))} placeholder="usuario" />
            </div>
          </div>

          <div className="set-field">
            <label htmlFor="pf-email">E-mail</label>
            <input id="pf-email" type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="seu@email.com" />
          </div>

          <div className="set-field set-field--full">
            <label htmlFor="pf-bio">Bio</label>
            <textarea id="pf-bio" rows={3} value={form.bio} onChange={e => update('bio', e.target.value)} placeholder="Conte um pouco sobre você ou sua marca…" />
          </div>
          {form.email.toLowerCase() !== user?.email?.toLowerCase() && <div className="set-field set-field--full">
            <label htmlFor="pf-password">Senha atual para alterar o e-mail</label>
            <input id="pf-password" type="password" autoComplete="current-password" value={form.currentPassword} onChange={e => update('currentPassword', e.target.value)} />
            <p>Após a alteração, entre novamente com o novo e-mail.</p>
          </div>}

          <div className="set-field">
            <label htmlFor="pf-tz">Fuso horário de preferência</label>
            <select id="pf-tz" value={form.timezone} onChange={e => update('timezone', e.target.value)}>
              {TIMEZONES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <p>Os horários de agendamento são informados no fuso de São Paulo.</p>
          </div>

          <div className="set-field">
            <label htmlFor="pf-lang">Idioma de preferência</label>
            <select id="pf-lang" value={form.language} onChange={e => update('language', e.target.value)}>
              {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <p>A interface está disponível em português.</p>
          </div>
        </div>

        <div className="set-card__actions">
          {error && <p role="alert">{error}</p>}
          <Button type="submit" loading={loading} disabled={loading} icon={saved ? <LuCheck size={16} /> : null}>
            {saved ? 'Salvo!' : 'Salvar alterações'}
          </Button>
        </div>
      </div>
    </form>
  )
}
