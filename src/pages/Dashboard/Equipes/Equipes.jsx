import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  getTeamMembers, getApprovalConfig, getTeamActivity,
  changeRoleApi, removeMemberApi, updateApprovalConfigApi,
} from '../../../services/team'
import { useAuth } from '../../../contexts/AuthContext'
import { useTeam } from '../../../contexts/TeamContext'
import EquipesHeader from './components/EquipesHeader'
import EquipesTabs from './components/EquipesTabs'
import MembrosTab from './components/MembrosTab'
import PapeisTab from './components/PapeisTab'
import AprovacaoTab from './components/AprovacaoTab'
import AtividadeTab from './components/AtividadeTab'
import ConfiguracoesTab from './components/ConfiguracoesTab'
import ShareCodeModal from './components/ShareCodeModal'
import CreateTeamModal from './components/CreateTeamModal'
import './Equipes.css'

export default function Equipes() {
  const { user } = useAuth()
  const { currentTeam, loading, createTeam, joinTeam, updateTeam, deleteTeam } = useTeam()

  const [members, setMembers] = useState([])
  const [config, setConfig] = useState(null)
  const [activity, setActivity] = useState([])

  const [activeTab, setActiveTab] = useState('membros')
  const [showShareCode, setShowShareCode] = useState(false)
  const [showCreateTeam, setShowCreateTeam] = useState(false)
  const [showJoinInput, setShowJoinInput] = useState(false)
  const [joinCode, setJoinCode] = useState('')
  const [joinError, setJoinError] = useState('')
  const [joinLoading, setJoinLoading] = useState(false)
  const [flash, setFlash] = useState('')

  useEffect(() => {
    if (!currentTeam) return
    Promise.all([
      getTeamMembers(currentTeam.id),
      getApprovalConfig(currentTeam.id),
      getTeamActivity(currentTeam.id),
    ]).then(([m, c, a]) => {
      setMembers(m)
      setConfig(c)
      setActivity(a)
    })
  }, [currentTeam?.id])

  const flashMsg = (msg, ms = 2200) => {
    setFlash(msg)
    setTimeout(() => setFlash(''), ms)
  }

  // ── Membros ──
  const handleRoleChange = async (memberId, newRole) => {
    try {
      const updated = await changeRoleApi(currentTeam.id, memberId, newRole)
      setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role: updated.role } : m))
      flashMsg('Cargo atualizado!')
    } catch (e) {
      flashMsg(e.message || 'Erro ao alterar cargo.')
    }
  }

  const handleRemove = async (memberId) => {
    const m = members.find(x => x.id === memberId)
    if (!m) return
    if (!window.confirm(`Remover ${m.name} do time?`)) return
    try {
      await removeMemberApi(currentTeam.id, memberId)
      setMembers(prev => prev.filter(x => x.id !== memberId))
      flashMsg('Membro removido.')
    } catch (e) {
      flashMsg(e.message || 'Erro ao remover membro.')
    }
  }

  // ── Aprovação ──
  const handleToggleConfig = async (key) => {
    const next = { ...config, [key]: !config[key] }
    setConfig(next)
    try {
      const saved = await updateApprovalConfigApi(currentTeam.id, {
        requireApprovalFromEditors: next.requireApprovalFromEditors,
        requireDoubleApprovalAbove100k: next.requireDoubleApprovalAbove100k,
        autoApproveScheduled48h: next.autoApproveScheduled48h,
        notifyManagersAfter24h: next.notifyManagersAfter24h,
        defaultApproverIds: next.defaultApproverIds || [],
      })
      setConfig(saved)
      flashMsg('Configuração salva.')
    } catch (e) {
      setConfig(config)
      flashMsg(e.message || 'Erro ao salvar configuração.')
    }
  }

  const handleRemoveApprover = async (userId) => {
    const next = { ...config, defaultApproverIds: config.defaultApproverIds.filter(id => id !== userId) }
    setConfig(next)
    try {
      const saved = await updateApprovalConfigApi(currentTeam.id, {
        requireApprovalFromEditors: next.requireApprovalFromEditors,
        requireDoubleApprovalAbove100k: next.requireDoubleApprovalAbove100k,
        autoApproveScheduled48h: next.autoApproveScheduled48h,
        notifyManagersAfter24h: next.notifyManagersAfter24h,
        defaultApproverIds: next.defaultApproverIds,
      })
      setConfig(saved)
      flashMsg('Aprovador removido.')
    } catch (e) {
      setConfig(config)
      flashMsg(e.message || 'Erro ao remover aprovador.')
    }
  }

  // ── Time ──
  const handleCreateTeam = async (data) => {
    try {
      const newTeam = await createTeam(data)
      flashMsg(`Bem-vindo ao ${newTeam.name}!`)
    } catch (e) {
      flashMsg(e.message || 'Erro ao criar equipe.')
    }
  }

  const handleUpdateTeam = async (updates) => {
    try {
      await updateTeam(currentTeam.id, updates)
      flashMsg('Equipe atualizada!')
    } catch (e) {
      flashMsg(e.message || 'Erro ao atualizar equipe.')
    }
  }

  const handleDeleteTeam = async () => {
    const name = currentTeam.name
    try {
      await deleteTeam(currentTeam.id)
      setActiveTab('membros')
      flashMsg(`Equipe "${name}" excluída.`)
    } catch (e) {
      flashMsg(e.message || 'Erro ao excluir equipe.')
    }
  }

  const handleLeaveTeam = async () => {
    const name = currentTeam.name
    try {
      await deleteTeam(currentTeam.id)
      setActiveTab('membros')
      flashMsg(`Você saiu de "${name}".`)
    } catch (e) {
      flashMsg(e.message || 'Erro ao sair da equipe.')
    }
  }

  const handleJoinByCode = async (e) => {
    e.preventDefault()
    if (!joinCode.trim()) return
    setJoinLoading(true)
    setJoinError('')
    try {
      const team = await joinTeam(joinCode.trim())
      setJoinCode('')
      flashMsg(`Você entrou em "${team.name}"!`)
    } catch (e) {
      setJoinError(e.message || 'Código inválido.')
    } finally {
      setJoinLoading(false)
    }
  }

  // ── Estado de carregamento ──
  if (loading) {
    return (
      <div className="eq-loading">
        <p>Carregando equipes...</p>
      </div>
    )
  }

  // ── Sem equipes: tela de entrada ──
  if (!currentTeam) {
    return (
      <motion.div
        className="eq-empty"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="eq-empty__content">
          <h2>Você ainda não faz parte de nenhuma equipe</h2>
          <p>Crie uma nova equipe ou entre em uma existente com um código de convite.</p>

          <div className="eq-empty__actions">
            <button
              className="eq-empty__btn eq-empty__btn--primary"
              onClick={() => setShowCreateTeam(true)}
            >
              Criar equipe
            </button>

            <span className="eq-empty__divider">ou</span>

            <form className="eq-empty__join" onSubmit={handleJoinByCode}>
              <input
                type="text"
                placeholder="Código da equipe"
                value={joinCode}
                onChange={e => { setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')); setJoinError('') }}
                maxLength={6}
              />
              <button type="submit" disabled={joinLoading || !joinCode.trim()}>
                {joinLoading ? 'Entrando...' : 'Entrar'}
              </button>
              {joinError && <span className="eq-empty__error">{joinError}</span>}
            </form>
          </div>
        </div>

        <CreateTeamModal
          isOpen={showCreateTeam}
          onClose={() => setShowCreateTeam(false)}
          onCreate={handleCreateTeam}
        />
      </motion.div>
    )
  }

  // ── Com equipe selecionada ──
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
        pendingPosts={currentTeam.pendingPosts}
        onCreateTeam={() => setShowCreateTeam(true)}
        onJoinTeam={() => setShowJoinInput(v => !v)}
      />

      <AnimatePresence>
        {showJoinInput && (
          <motion.form
            className="eq-join-inline"
            onSubmit={handleJoinByCode}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
          >
            <input
              type="text"
              placeholder="Código da equipe (ex: A3K7B)"
              value={joinCode}
              onChange={e => { setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')); setJoinError('') }}
              maxLength={6}
              autoFocus
            />
            <button type="submit" disabled={joinLoading || !joinCode.trim()}>
              {joinLoading ? 'Entrando...' : 'Entrar'}
            </button>
            {joinError && <span className="eq-empty__error">{joinError}</span>}
          </motion.form>
        )}
      </AnimatePresence>

      <EquipesTabs
        active={activeTab}
        onChange={setActiveTab}
        counts={{}}
        currentRole={currentTeam.role?.toLowerCase?.() || currentTeam.role}
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
                currentUserId={user?.id}
                currentRole={currentTeam.role?.toLowerCase?.() || currentTeam.role}
                onRoleChange={handleRoleChange}
                onRemove={handleRemove}
                onInviteClick={() => setShowShareCode(true)}
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
                currentRole={currentTeam.role?.toLowerCase?.() || currentTeam.role}
                onUpdate={handleUpdateTeam}
                onDelete={handleDeleteTeam}
                onLeave={handleLeaveTeam}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <ShareCodeModal
        isOpen={showShareCode}
        onClose={() => setShowShareCode(false)}
        team={currentTeam}
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
