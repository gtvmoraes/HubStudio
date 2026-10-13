import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { LuKeyRound, LuShieldCheck, LuMonitor, LuLogOut } from 'react-icons/lu'
import { getSessions, changePassword, revokeSession, revokeOtherSessions, requestTwoFactorCode, configureTwoFactor } from '../../../../services/settings'
import { useAuth } from '../../../../contexts/AuthContext'
import Button from '../../../../components/Button/Button'

export default function SegurancaTab() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' })
  const [sessions, setSessions] = useState([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [sessionLoading, setSessionLoading] = useState(true)
  const [factorPassword, setFactorPassword] = useState('')
  const [challengeId, setChallengeId] = useState(null)
  const [code, setCode] = useState('')

  useEffect(() => {
    let cancelled = false
    getSessions().then(list => { if (!cancelled) setSessions(list) })
      .catch(err => { if (!cancelled) setError(err.message) })
      .finally(() => { if (!cancelled) setSessionLoading(false) })
    return () => { cancelled = true }
  }, [])

  const run = async (action) => {
    if (busy) return
    setBusy(true); setError('')
    try { await action() } catch (err) { setError(err.message) } finally { setBusy(false) }
  }
  const reauthenticate = () => { logout(); navigate('/entrar') }
  const savePwd = (e) => {
    e.preventDefault()
    run(async () => { await changePassword(pwd.current, pwd.next); reauthenticate() })
  }
  const endSession = (id) => run(async () => {
    await revokeSession(id)
    setSessions(await getSessions())
  })
  const endOthers = () => run(async () => {
    await revokeOtherSessions()
    setSessions(await getSessions())
  })
  const configureFactor = (e) => {
    e.preventDefault()
    run(async () => {
      if (!challengeId) {
        const result = await requestTwoFactorCode(factorPassword)
        setChallengeId(result.challengeId)
      } else {
        await configureTwoFactor(!user.twoFactorEnabled, factorPassword, challengeId, code)
        reauthenticate()
      }
    })
  }

  return (
    <div className="set-section">
      <div className="set-section__head"><h2>Segurança</h2><p>Controle sua senha, verificação em duas etapas e sessões.</p></div>
      {error && <p role="alert">{error}</p>}
      {user.passwordLoginEnabled === false && <p>Sua conta usa Google. Para ações que pedem senha atual, <Link to="/esqueci-senha">defina uma senha pela recuperação de senha</Link>.</p>}
      <form className="set-card" onSubmit={savePwd}>
        <div className="set-card__title"><LuKeyRound size={18} /> Alterar senha</div>
        <div className="set-form-grid">
          <div className="set-field set-field--full"><label htmlFor="sec-cur">Senha atual</label>
            <input id="sec-cur" type="password" autoComplete="current-password" value={pwd.current} onChange={e => setPwd(p => ({ ...p, current: e.target.value }))} /></div>
          <div className="set-field"><label htmlFor="sec-new">Nova senha</label>
            <input id="sec-new" type="password" autoComplete="new-password" maxLength={72} value={pwd.next} onChange={e => setPwd(p => ({ ...p, next: e.target.value }))} /></div>
          <div className="set-field"><label htmlFor="sec-conf">Confirmar nova senha</label>
            <input id="sec-conf" type="password" autoComplete="new-password" value={pwd.confirm} onChange={e => setPwd(p => ({ ...p, confirm: e.target.value }))} /></div>
        </div>
        <p>Ao alterar a senha, todas as sessões serão encerradas. Entre novamente com a nova senha.</p>
        <div className="set-card__actions"><Button type="submit" loading={busy} disabled={busy || !pwd.current || pwd.next.length < 8 || pwd.next !== pwd.confirm}>Atualizar senha</Button></div>
      </form>

      <form className="set-card" onSubmit={configureFactor}>
        <div className="set-card__title"><LuShieldCheck size={18} /> Verificação em duas etapas por e-mail</div>
        <p>{user.twoFactorEnabled ? 'Ativada: cada login exige senha e um código enviado ao seu e-mail.' : 'Ao ativar, cada login exigirá senha e um código enviado ao seu e-mail.'}</p>
        <div className="set-field"><label htmlFor="factor-password">Senha atual</label>
          <input id="factor-password" type="password" autoComplete="current-password" value={factorPassword} onChange={e => setFactorPassword(e.target.value)} /></div>
        {challengeId && <div className="set-field"><label htmlFor="factor-code">Código recebido por e-mail (válido por 10 minutos)</label>
          <input id="factor-code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ''))} />
          <button type="button" disabled={busy} onClick={() => { setChallengeId(null); setCode('') }}>Solicitar outro código</button></div>}
        <p>A alteração encerra todas as sessões e exige um novo login.</p>
        <div className="set-card__actions"><Button type="submit" loading={busy} disabled={busy || !factorPassword || (challengeId && code.length !== 6)}>
          {!challengeId ? 'Enviar código de confirmação' : user.twoFactorEnabled ? 'Confirmar desativação' : 'Confirmar ativação'}
        </Button></div>
      </form>

      <div className="set-card">
        <div className="set-card__title set-card__title--row"><span><LuMonitor size={18} /> Sessões ativas</span>
          {sessions.length > 1 && <button type="button" className="set-link-danger" disabled={busy} onClick={endOthers}><LuLogOut size={14} /> Encerrar outras sessões</button>}</div>
        {sessionLoading && <p role="status">Carregando sessões…</p>}
        {!sessionLoading && sessions.length === 0 && <p>Nenhuma sessão carregada.</p>}
        <ul className="set-sessions">{sessions.map(s => <li key={s.id} className="set-session">
          <span className="set-session__icon"><LuMonitor size={18} /></span>
          <div className="set-session__info"><strong>{s.device}{s.current && <span className="set-session__current">Este dispositivo</span>}</strong>
            <span>Iniciada em {new Date(s.createdAt).toLocaleString('pt-BR')} · expira em {new Date(s.expiresAt).toLocaleString('pt-BR')}</span></div>
          {!s.current && <button type="button" className="set-session__end" disabled={busy} onClick={() => endSession(s.id)}>Encerrar</button>}
        </li>)}</ul>
      </div>
    </div>
  )
}
