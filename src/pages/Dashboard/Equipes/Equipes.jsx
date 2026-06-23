import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  getTeamMembers, getPendingInvites, getApprovalConfig,
  getTeamActivity,
} from '../../../services/team'
import { useAuth } from '../../../contexts/AuthContext'
import { useTeam } from '../../../contexts/TeamContext'
import EquipesHeader from './components/EquipesHeader'
import EquipesTabs from './components/EquipesTabs'
import MembrosTab from './components/MembrosTab'
import ConvitesTab from './components/ConvitesTab'
import PapeisTab from './components/PapeisTab'
import AprovacaoTab from './components/AprovacaoTab'
import AtividadeTab from './components/AtividadeTab'
import ConfiguracoesTab from './components/ConfiguracoesTab'
import InviteModal from './components/InviteModal'
import CreateTeamModal from './components/CreateTeamModal'
import './Equipes.css'

export default function Equipes() {
  const { user } = useAuth()
  const { currentTeam, createTeam, updateTeam, deleteTeam } = useTeam()

  const [members, setMembers] = useState([])
  const [invites, setInvites] = useState([])
  const [config, setConfig] = useState(null)
  const [activity, setActivity] = useState([])

  const [activeTab, setActiveTab] = useState('membros')
  const [showInvite, setShowInvite] = useState(false)
  const [showCreateTeam, setShowCreateTeam] = useState(false)
  const [flash, setFlash] = useState('')

  useEffect(() => {
    if (!currentTeam) return
    Promise.all([
      getTeamMembers(currentTeam.id),
      getPendingInvites(currentTeam.id),
      getApprovalConfig(currentTeam.id),
      getTeamActivity(currentTeam.id),
    ]).then(([m, i, c, a]) => {
      setMembers(m)
      setInvites(i)
      setConfig(c)
      setActivity(a)
    })
  }, [currentTeam?.id])

  const flashMsg = (msg, ms = 2200) => {
    setFlash(msg)
    setTimeout(() => setFlash(''), ms)
  }

  // ── Membros ──
  const handleRoleChange = (memberId, newRole) => {
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role: newRole } : m))
    flashMsg('Papel atualizado!')
  }
  const handleRemove = (memberId) => {
    const m = members.find(x => x.id === memberId)
    if (!m) return
    if (!window.confirm(`Remover ${m.name} do time?`)) return
    setMembers(prev => prev.filter(x => x.id !== memberId))
    flashMsg('Membro removido.')
  }

  // ── Convites ──
  const handleInvite = ({ email, role }) => {
    const newInvite = {
      id: `inv-${Date.now()}`,
      email,
      role,
      invitedBy: user?.name || 'Você',
      invitedAt: new Date().toISOString(),
    }
    setInvites(prev => [newInvite, ...prev])
    setActiveTab('convites')
    flashMsg(`Convite enviado pra ${email}!`)
  }
  const handleResend = (inviteId) => {
    const inv = invites.find(i => i.id === inviteId)
    if (!inv) return
    flashMsg(`Convite reenviado pra ${inv.email}.`)
  }
  const handleCancelInvite = (inviteId) => {
    setInvites(prev => prev.filter(i => i.id !== inviteId))
    flashMsg('Convite cancelado.')
  }

  // ── Aprovação ──
  const handleToggleConfig = (key) => {
    setConfig(prev => ({ ...prev, [key]: !prev[key] }))
    flashMsg('Configuração salva.')
  }
  const handleRemoveApprover = (memberId) => {
    setConfig(prev => ({
      ...prev,
      defaultApproverIds: prev.defaultApproverIds.filter(id => id !== memberId),
    }))
    flashMsg('Aprovador removido.')
  }

  // ── Time ──
  const handleCreateTeam = (data) => {
    const newTeam = createTeam(data)
    flashMsg(`Bem-vindo ao ${newTeam.name}!`)
  }
  const handleUpdateTeam = (updates) => {
    updateTeam(currentTeam.id, updates)
    flashMsg('Equipe atualizada!')
  }
  const handleDeleteTeam = () => {
    const name = currentTeam.name
    deleteTeam(currentTeam.id)
    setActiveTab('membros')
    flashMsg(`Equipe "${name}" excluída.`)
  }
  const handleLeaveTeam = () => {
    const name = currentTeam.name
    deleteTeam(currentTeam.id)
    setActiveTab('membros')
    flashMsg(`Você saiu de "${name}".`)
  }

  if (!currentTeam) {
    return (
      <div className="eq-loading">
        <p>Carregando equipe...</p>
      </div>
    )
  }

  return (
    <motion.div
      className="eq-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <EquipesHeader
        team={currentTeam}
        members={members}
        invites={invites}
        pendingPosts={currentTeam.pendingPosts}
        onCreateTeam={() => setShowCreateTeam(true)}
      />

      <EquipesTabs
        active={activeTab}
        onChange={setActiveTab}
        counts={{ invites: invites.length }}
        currentRole={currentTeam.role}
      />

      <div className="eq-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentTeam.id}-${activeTab}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
          >
            {activeTab === 'membros' && (
              <MembrosTab
                members={members}
                currentUserId={'u1'}
                onRoleChange={handleRoleChange}
                onRemove={handleRemove}
                onInviteClick={() => setShowInvite(true)}
              />
            )}

            {activeTab === 'convites' && (
              <ConvitesTab
                invites={invites}
                onResend={handleResend}
                onCancel={handleCancelInvite}
                onInviteClick={() => setShowInvite(true)}
              />
            )}

            {activeTab === 'papeis' && <PapeisTab />}

            {activeTab === 'aprovacao' && (
              <AprovacaoTab
                config={config}
                members={members}
                onToggle={handleToggleConfig}
                onRemoveApprover={handleRemoveApprover}
                pendingCount={currentTeam.pendingPosts}
              />
            )}

            {activeTab === 'atividade' && <AtividadeTab events={activity} />}

            {activeTab === 'configuracoes' && (
              <ConfiguracoesTab
                team={currentTeam}
                currentRole={currentTeam.role}
                onUpdate={handleUpdateTeam}
                onDelete={handleDeleteTeam}
                onLeave={handleLeaveTeam}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <InviteModal
        isOpen={showInvite}
        onClose={() => setShowInvite(false)}
        onInvite={handleInvite}
      />

      <CreateTeamModal
        isOpen={showCreateTeam}
        onClose={() => setShowCreateTeam(false)}
        onCreate={handleCreateTeam}
      />

      <AnimatePresence>
        {flash && (
          <motion.div
            className="eq-toast"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.25 }}
          >
            {flash}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
