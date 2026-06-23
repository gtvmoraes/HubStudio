import { useState, useEffect } from 'react'
import { LuKeyRound, LuShieldCheck, LuMonitor, LuSmartphone, LuCheck, LuLogOut } from 'react-icons/lu'
import { getSessions } from '../../../../services/settings'
import Button from '../../../../components/Button/Button'
import Toggle from './Toggle'

export default function SegurancaTab() {
  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' })
  const [pwdSaved, setPwdSaved] = useState(false)
  const [twoFa, setTwoFa] = useState(false)
  const [sessions, setSessions] = useState([])

  useEffect(() => { getSessions().then(setSessions) }, [])

  const canSave = pwd.current && pwd.next.length >= 8 && pwd.next === pwd.confirm

  const savePwd = (e) => {
    e.preventDefault()
    if (!canSave) return
    setPwdSaved(true)
    setPwd({ current: '', next: '', confirm: '' })
    setTimeout(() => setPwdSaved(false), 2000)
  }

  const endSession = (id) => setSessions(s => s.filter(x => x.id !== id))
  const endAll = () => setSessions(s => s.filter(x => x.current))

  return (
    <div className="set-section">
      <div className="set-section__head">
        <h2>Segurança</h2>
        <p>Proteja sua conta com senha forte, 2FA e controle de sessões.</p>
      </div>

      {/* Senha */}
      <form className="set-card" onSubmit={savePwd}>
        <div className="set-card__title"><LuKeyRound size={18} /> Alterar senha</div>
        <div className="set-form-grid">
          <div className="set-field set-field--full">
            <label htmlFor="sec-cur">Senha atual</label>
            <input id="sec-cur" type="password" value={pwd.current} onChange={e => setPwd(p => ({ ...p, current: e.target.value }))} placeholder="••••••••" />
          </div>
          <div className="set-field">
            <label htmlFor="sec-new">Nova senha</label>
            <input id="sec-new" type="password" value={pwd.next} onChange={e => setPwd(p => ({ ...p, next: e.target.value }))} placeholder="Mínimo 8 caracteres" />
          </div>
          <div className="set-field">
            <label htmlFor="sec-conf">Confirmar nova senha</label>
            <input id="sec-conf" type="password" value={pwd.confirm} onChange={e => setPwd(p => ({ ...p, confirm: e.target.value }))} placeholder="Repita a nova senha" />
          </div>
        </div>
        <div className="set-card__actions">
          <Button type="submit" disabled={!canSave} icon={pwdSaved ? <LuCheck size={16} /> : null}>
            {pwdSaved ? 'Senha atualizada!' : 'Atualizar senha'}
          </Button>
        </div>
      </form>

      {/* 2FA */}
      <div className="set-card set-2fa">
        <div className="set-2fa__info">
          <div className="set-2fa__icon"><LuShieldCheck size={20} /></div>
          <div>
            <strong>Autenticação de dois fatores (2FA)</strong>
            <p>Exige um código do seu celular além da senha. Recomendado para máxima segurança.</p>
          </div>
        </div>
        <Toggle value={twoFa} onChange={setTwoFa} ariaLabel="Ativar 2FA" />
      </div>

      {/* Sessões */}
      <div className="set-card">
        <div className="set-card__title set-card__title--row">
          <span><LuMonitor size={18} /> Sessões ativas</span>
          {sessions.length > 1 && (
            <button type="button" className="set-link-danger" onClick={endAll}>
              <LuLogOut size={14} /> Encerrar todas
            </button>
          )}
        </div>
        <ul className="set-sessions">
          {sessions.map(s => (
            <li key={s.id} className="set-session">
              <span className="set-session__icon">
                {s.device.includes('iPhone') ? <LuSmartphone size={18} /> : <LuMonitor size={18} />}
              </span>
              <div className="set-session__info">
                <strong>
                  {s.device}
                  {s.current && <span className="set-session__current">Este dispositivo</span>}
                </strong>
                <span>{s.location} · {s.lastActive}</span>
              </div>
              {!s.current && (
                <button type="button" className="set-session__end" onClick={() => endSession(s.id)}>
                  Encerrar
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
