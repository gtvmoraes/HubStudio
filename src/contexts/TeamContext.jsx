import { createContext, useContext, useState, useEffect } from 'react'
import { getUserTeams, createTeamApi, updateTeamApi, deleteTeamApi, joinByCodeApi } from '../services/team'
import { getSocialAccounts } from '../services/posts'
import { useAuth } from './AuthContext'

// O backend as vezes manda o cargo em maiusculo (enum bruto) as vezes em
// minusculo (ja normalizado) — o front sempre trabalha em minusculo.
const normalizeTeam = (t) => t ? { ...t, role: t.role?.toLowerCase?.() ?? t.role } : t

const TeamContext = createContext(null)
const STORAGE_KEY = 'hs-current-team'

// Pseudo-contexto sempre disponível, ao lado das equipes reais — representa
// a company pessoal do usuário (nunca listada por GET /teams).
export const PERSONAL_CONTEXT = {
  id: null,
  name: 'Pessoal',
  personal: true,
  role: 'admin',
  plan: null,
  totalMembers: 1,
}

export function TeamProvider({ children }) {
  const { user } = useAuth()
  const [teams, setTeams] = useState([])
  const [currentTeamId, setCurrentTeamId] = useState(() => localStorage.getItem(STORAGE_KEY))
  const [loading, setLoading] = useState(true)
  // Equipe recém criada/entrada sem nenhuma conta ainda — dispara a oferta de
  // importar contas pessoais (ver ImportAccountsModal, montado no DashboardLayout).
  const [pendingImport, setPendingImport] = useState(null)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    getUserTeams().then(list => {
      setTeams(list.map(normalizeTeam))
      const saved = list.find(t => t.id === currentTeamId)
      if (saved) {
        setCurrentTeamId(currentTeamId)
      } else {
        // Sem seleção salva de uma sessão anterior — o ponto de partida
        // é sempre Pessoal, mesmo que o usuário já tenha equipes.
        setCurrentTeamId(null)
        localStorage.removeItem(STORAGE_KEY)
      }
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const switchTeam = (teamId) => {
    if (teamId !== null && !teams.find(t => t.id === teamId)) return
    setCurrentTeamId(teamId)
    if (teamId === null) localStorage.removeItem(STORAGE_KEY)
    else localStorage.setItem(STORAGE_KEY, teamId)
  }

  // Só oferece a importação se a equipe ainda não tem contas E o usuário tem
  // alguma conta pessoal conectada pra trazer — evita abrir o modal e fechar
  // ele sozinho na hora (nada pra mostrar).
  const maybeOfferImport = async (team) => {
    if (team.hasSocialAccounts) return
    const personalAccounts = await getSocialAccounts().catch(() => [])
    const hasImportable = personalAccounts.some(a => a.status === 'connected' || a.status === 'expired')
    if (hasImportable) setPendingImport(team)
  }

  const createTeam = async (data) => {
    const newTeam = normalizeTeam(await createTeamApi(data))
    setTeams(prev => [...prev, newTeam])
    setCurrentTeamId(newTeam.id)
    localStorage.setItem(STORAGE_KEY, newTeam.id)
    maybeOfferImport(newTeam)
    return newTeam
  }

  const joinTeam = async (code) => {
    const team = normalizeTeam(await joinByCodeApi(code))
    setTeams(prev => [...prev, team])
    setCurrentTeamId(team.id)
    localStorage.setItem(STORAGE_KEY, team.id)
    maybeOfferImport(team)
    return team
  }

  const updateTeam = async (teamId, updates) => {
    const updated = normalizeTeam(await updateTeamApi(teamId, updates))
    setTeams(prev => prev.map(t => t.id === teamId ? updated : t))
    return updated
  }

  const deleteTeam = async (teamId) => {
    await deleteTeamApi(teamId)
    setTeams(prev => {
      const next = prev.filter(t => t.id !== teamId)
      if (currentTeamId === teamId) {
        const nextId = next[0]?.id || null
        setCurrentTeamId(nextId)
        if (nextId) localStorage.setItem(STORAGE_KEY, nextId)
        else localStorage.removeItem(STORAGE_KEY)
      }
      return next
    })
  }

  const currentTeam = teams.find(t => t.id === currentTeamId) || null
  const activeContext = currentTeam || PERSONAL_CONTEXT
  const contexts = [PERSONAL_CONTEXT, ...teams]

  return (
    <TeamContext.Provider value={{
      teams, currentTeam, activeContext, contexts, loading,
      switchTeam, createTeam, joinTeam, updateTeam, deleteTeam,
      pendingImport, dismissPendingImport: () => setPendingImport(null),
    }}>
      {children}
    </TeamContext.Provider>
  )
}

export const useTeam = () => useContext(TeamContext)
