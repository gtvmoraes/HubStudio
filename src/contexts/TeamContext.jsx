import { createContext, useContext, useState, useEffect } from 'react'
import { getUserTeams, createTeamApi, updateTeamApi, deleteTeamApi, joinByCodeApi } from '../services/team'
import { useAuth } from './AuthContext'

const TeamContext = createContext(null)
const STORAGE_KEY = 'hs-current-team'

export function TeamProvider({ children }) {
  const { user } = useAuth()
  const [teams, setTeams] = useState([])
  const [currentTeamId, setCurrentTeamId] = useState(() => localStorage.getItem(STORAGE_KEY))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    getUserTeams().then(list => {
      setTeams(list)
      if (list.length > 0) {
        const saved = list.find(t => t.id === currentTeamId)
        const activeId = saved ? currentTeamId : list[0].id
        setCurrentTeamId(activeId)
        localStorage.setItem(STORAGE_KEY, activeId)
      } else {
        setCurrentTeamId(null)
        localStorage.removeItem(STORAGE_KEY)
      }
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const switchTeam = (teamId) => {
    if (!teams.find(t => t.id === teamId)) return
    setCurrentTeamId(teamId)
    localStorage.setItem(STORAGE_KEY, teamId)
  }

  const createTeam = async (data) => {
    const newTeam = await createTeamApi(data)
    setTeams(prev => [...prev, newTeam])
    setCurrentTeamId(newTeam.id)
    localStorage.setItem(STORAGE_KEY, newTeam.id)
    return newTeam
  }

  const joinTeam = async (code) => {
    const team = await joinByCodeApi(code)
    setTeams(prev => [...prev, team])
    setCurrentTeamId(team.id)
    localStorage.setItem(STORAGE_KEY, team.id)
    return team
  }

  const updateTeam = async (teamId, updates) => {
    const updated = await updateTeamApi(teamId, updates)
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

  return (
    <TeamContext.Provider value={{
      teams, currentTeam, loading,
      switchTeam, createTeam, joinTeam, updateTeam, deleteTeam,
    }}>
      {children}
    </TeamContext.Provider>
  )
}

export const useTeam = () => useContext(TeamContext)
