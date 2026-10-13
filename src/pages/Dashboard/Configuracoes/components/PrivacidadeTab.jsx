import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LuDownload, LuTriangleAlert } from 'react-icons/lu'
import { useAuth } from '../../../../contexts/AuthContext'
import Button from '../../../../components/Button/Button'
import Modal from '../../../../components/Modal/Modal'
import { exportAccount, deleteAccount } from '../../../../services/settings'

const CONFIRM_WORD = 'EXCLUIR'

export default function PrivacidadeTab({ onToast }) {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [exporting, setExporting] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [password, setPassword] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  const handleExport = async () => {
    setExporting(true)
    setError('')
    try {
      const data = await exportAccount()
      const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }))
      const link = document.createElement('a')
      link.href = url; link.download = 'hubstudio-dados.json'
      document.body.appendChild(link); link.click(); link.remove()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
      onToast?.('Exportação baixada com sucesso.')
    } catch (err) { setError(err.message) }
    finally { setExporting(false) }
  }

  const handleDelete = async () => {
    if (confirmText !== CONFIRM_WORD || deleting || !password) return
    setDeleting(true); setError('')
    try {
      await deleteAccount(password, confirmText)
      logout()
      navigate('/')
    } catch (err) { setError(err.message) }
    finally { setDeleting(false) }
  }

  return (
    <div className="set-section">
      <div className="set-section__head">
        <h2>Privacidade & dados</h2>
        <p>Controle seus dados pessoais e a sua conta.</p>
      </div>

      {error && !modalOpen && <p role="alert">{error}</p>}

      {/* Exportar dados */}
      <div className="set-card set-export">
        <div className="set-export__info">
          <div className="set-export__icon"><LuDownload size={20} /></div>
          <div>
            <strong>Exportar meus dados</strong>
            <p>Baixe seu perfil, posts pessoais e de sua autoria, métricas, conexões pessoais e configurações em JSON.</p>
          </div>
        </div>
        <Button variant="outline" size="sm" loading={exporting} onClick={handleExport}>
          {exporting ? 'Preparando…' : 'Solicitar exportação'}
        </Button>
      </div>

      {/* Zona de perigo */}
      <div className="set-card set-danger">
        <div className="set-danger__head">
          <LuTriangleAlert size={18} />
          <strong>Zona de perigo</strong>
        </div>
        <div className="set-danger__row">
          <div>
            <strong>Excluir minha conta</strong>
            <p>Remove sua conta, posts e conexões pessoais. Conteúdo de equipes compartilhadas permanece sem sua identificação; equipes em que você é o único membro são excluídas. Publicações nas redes sociais permanecem nas redes.</p>
          </div>
          <Button variant="danger" size="sm" onClick={() => setModalOpen(true)}>
            Excluir conta
          </Button>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => { if (!deleting) setModalOpen(false) }} title="Excluir conta" size="sm">
        <div className="set-delete-modal">
          <p>
            Esta ação <strong>não pode ser desfeita</strong>. Para confirmar, digite{' '}
            <code>{CONFIRM_WORD}</code> abaixo.
          </p>
          <input
            type="text"
            value={confirmText}
            onChange={e => setConfirmText(e.target.value)}
            placeholder={CONFIRM_WORD}
            autoComplete="off"
          />
          <div className="set-delete-modal__actions">
            <Button variant="ghost" disabled={deleting} onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button variant="danger" loading={deleting} disabled={deleting || confirmText !== CONFIRM_WORD || !password} onClick={handleDelete}>
              Excluir permanentemente
            </Button>
          </div>
          <label htmlFor="delete-password">Senha atual</label>
          <input id="delete-password" type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} />
          {error && <p role="alert">{error}</p>}
        </div>
      </Modal>
    </div>
  )
}
