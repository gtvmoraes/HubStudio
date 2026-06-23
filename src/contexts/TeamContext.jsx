import { createContext, useContext, useState, useEffect } from 'react'
import { getUserTeams, initTeamData } from '../services/team'
import { useAuth } from './AuthContext'

const TeamContext = createContext(null)
const STORAGE_KEY = 'hs-current-team'

export function TeamProvider({ children }) {
  const { user } = useAuth()
  const [teams, setTeams] = useState([])
  const [currentTeamId, setCurrentTeamId] = useState(() => localStorage.getItem(STORAGE_KEY))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getUserTeams().then(list => {
      setTeams(list)
      if (!currentTeamId || !list.find(t => t.id === currentTeamId)) {
        const firstId = list[0]?.id
        if (firstId) {
          setCurrentTeamId(firstId)
          localStorage.setItem(STORAGE_KEY, firstId)
        }
      }
      setLoading(false)
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const switchTeam = (teamId) => {
    if (!teams.find(t => t.id === teamId)) return
    setCurrentTeamId(teamId)
    localStorage.setItem(STORAGE_KEY, teamId)
  }

  const createTeam = ({ name, type, color }) => {
    const newTeam = {
      id: `t-${Date.now()}`,
      name,
      type,
      color,
      plan: 'lite',
      role: 'admin',
      totalMembers: 1,
      pendingPosts: 0,
      photo: null,
      description: '',
    }

    // Semeia a equipe com o usuário atual como único membro
    const founder = {
      id: 'u1',
      name: user?.name || 'Você',
      email: user?.email || 'voce@hubstudio.com',
      role: 'admin',
      joinedAt: new Date().toISOString(),
      lastActive: 'agora',
    }
    initTeamData(newTeam.id, founder)

    setTeams(prev => [...prev, newTeam])
    setCurrentTeamId(newTeam.id)
    localStorage.setItem(STORAGE_KEY, newTeam.id)
    return newTeam
  }

  /** Atualiza dados editáveis da equipe atual (nome, cor, foto, descrição). */
  const updateTeam = (teamId, updates) => {
    setTeams(prev => prev.map(t => t.id === teamId ? { ...t, ...updates } : t))
  }

  /** Remove uma equipe da lista do usuário. */
  const deleteTeam = (teamId) => {
    setTeams(prev => {
      const next = prev.filter(t => t.id !== teamId)
      if (currentTeamId === teamId && next.length) {
        setCurrentTeamId(next[0].id)
        localStorage.setItem(STORAGE_KEY, next[0].id)
      }
      return next
    })
  }

  const currentTeam = teams.find(t => t.id === currentTeamId) || teams[0] || null

  return (
    <TeamContext.Provider value={{
      teams, currentTeam, loading,
      switchTeam, createTeam, updateTeam, deleteTeam,
    }}>
      {children}
    </TeamContext.Provider>
  )
}

export const useTeam = () => useContext(TeamContext)
