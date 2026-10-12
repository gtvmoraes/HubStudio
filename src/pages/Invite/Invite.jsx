import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useTeam } from '../../contexts/TeamContext'
import { previewInviteApi, ROLES } from '../../services/team'
import '../EsqueciSenha/EsqueciSenha.css'

export default function Invite() {
  const { token } = useParams()
  const { user, logout } = useAuth()
  const { acceptInvite, loading: teamsLoading } = useTeam()
  const navigate = useNavigate()
  const [invite, setInvite] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const returnTo = `/invite/${token}`
  const authQuery = `?returnTo=${encodeURIComponent(returnTo)}`
  const wrongAccount = user && invite && user.email?.toLowerCase() !== invite.email?.toLowerCase()

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    setInvite(null)
    previewInviteApi(token).then(data => {
      if (!cancelled) setInvite(data)
    }).catch(err => {
      if (!cancelled) setError(err.message)
    }).finally(() => {
      if (!cancelled) setLoading(false)
    })
    return () => { cancelled = true }
  }, [token])

  const handleAccept = async () => {
    if (accepting || teamsLoading || wrongAccount) return
    setAccepting(true)
    setError('')
    try {
      await acceptInvite(token)
      navigate('/dashboard/equipes', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setAccepting(false)
    }
  }

  return (
    <main className="recovery">
      <div className="recovery__shell">
        <div className="recovery__card">
          <div className="recovery__heading">
            <h1>Convite para equipe</h1>
            {loading && <p role="status">Carregando convite…</p>}
            {invite && <>
              <p><strong>{invite.invitedBy}</strong> convidou você para a equipe <strong>{invite.companyName}</strong>.</p>
              <p>Cargo: {ROLES[invite.role]?.label || invite.role}. Convite para {invite.email}.</p>
            </>}
          </div>
          {error && <p className="recovery__field-error" role="alert">{error}</p>}
          {invite && !user && <>
            <p className="recovery__switch">Entre ou crie uma conta com o e-mail do convite.</p>
            <Link className="recovery__submit" to={`/entrar${authQuery}`}>Entrar para aceitar</Link>
            <p className="recovery__switch"><Link to={`/cadastro${authQuery}`}>Criar conta</Link></p>
          </>}
          {invite && user && (wrongAccount ? <>
            <p role="alert">Você está conectado como {user.email}. Entre com {invite.email} para aceitar.</p>
            <button className="recovery__submit" onClick={() => { logout(); navigate(`/entrar${authQuery}`) }}>Trocar de conta</button>
          </> : <button className="recovery__submit" disabled={accepting || teamsLoading} onClick={handleAccept}>
            {accepting ? 'Aceitando…' : 'Aceitar convite'}
          </button>)}
          <p className="recovery__switch"><Link to={user ? '/dashboard/equipes' : '/'}>Voltar</Link></p>
        </div>
      </div>
    </main>
  )
}
