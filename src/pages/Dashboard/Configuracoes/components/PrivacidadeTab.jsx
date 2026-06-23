import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LuDownload, LuTriangleAlert } from 'react-icons/lu'
import { useAuth } from '../../../../contexts/AuthContext'
import Button from '../../../../components/Button/Button'
import Modal from '../../../../components/Modal/Modal'

const CONFIRM_WORD = 'EXCLUIR'

export default function PrivacidadeTab({ onToast }) {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [exporting, setExporting] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmText, setConfirmText] = useState('')

  const handleExport = () => {
    setExporting(true)
    setTimeout(() => {
      setExporting(false)
      onToast?.('Seus dados foram preparados e enviados para o seu e-mail.')
    }, 1400)
  }

  const handleDelete = () => {
    if (confirmText !== CONFIRM_WORD) return
    logout()
    navigate('/')
  }

  return (
    <div className="set-section">
      <div className="set-section__head">
        <h2>Privacidade & dados</h2>
        <p>Controle seus dados pessoais e a sua conta.</p>
      </div>

      {/* Exportar dados */}
      <div className="set-card set-export">
        <div className="set-export__info">
          <div className="set-export__icon"><LuDownload size={20} /></div>
          <div>
            <strong>Exportar meus dados</strong>
            <p>Baixe uma cópia de todos os seus dados — perfil, posts, métricas e configurações (LGPD).</p>
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
            <p>Esta ação é permanente. Todos os seus dados, posts e conexões serão apagados para sempre.</p>
          </div>
          <Button variant="danger" size="sm" onClick={() => setModalOpen(true)}>
            Excluir conta
          </Button>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Excluir conta" size="sm">
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
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button variant="danger" disabled={confirmText !== CONFIRM_WORD} onClick={handleDelete}>
              Excluir permanentemente
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
