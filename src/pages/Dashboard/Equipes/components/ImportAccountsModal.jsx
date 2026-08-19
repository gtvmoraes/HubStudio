import { useState, useEffect } from 'react'
import { LuCircleAlert, LuCheck } from 'react-icons/lu'
import Modal from '../../../../components/Modal/Modal'
import Button from '../../../../components/Button/Button'
import { getSocialAccounts } from '../../../../services/posts'
import { importAccountsApi } from '../../../../services/team'
import { showToast } from '../../../../components/Toast'

const PLATFORM_LABELS = {
  instagram: 'Instagram', facebook: 'Facebook', linkedin: 'LinkedIn',
  tiktok: 'TikTok', youtube: 'YouTube',
}

// Aberto quando o usuário acaba de criar/entrar numa equipe sem nenhuma conta
// ainda (TeamContext.pendingImport) — oferece trazer as contas pessoais pra
// ela. Aceitar = mover (deixam de ser pessoais); recusar = fecha sem alterar
// nada, as contas continuam pessoais.
export default function ImportAccountsModal({ team, isOpen, onClose }) {
  const [accounts, setAccounts] = useState([])
  const [selected, setSelected] = useState([])
  const [loading, setLoading] = useState(true)
  const [importing, setImporting] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setLoading(true)
    getSocialAccounts().then(list => {
      const connected = list.filter(a => a.status === 'connected' || a.status === 'expired')
      setAccounts(connected)
      setSelected(connected.map(a => a.id))
      setLoading(false)
      // Nada pra importar — não faz sentido mostrar o modal.
      if (connected.length === 0) onClose()
    })
  }, [isOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = (id) => setSelected(prev =>
    prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const handleImport = async () => {
    if (selected.length === 0) return
    setImporting(true)
    try {
      await importAccountsApi(team.id, selected)
      showToast({ type: 'success', title: 'Contas importadas', message: `Agora pertencem à equipe ${team.name}.` })
      onClose()
    } catch (e) {
      showToast({ type: 'error', title: 'Erro ao importar', message: e.message })
    } finally {
      setImporting(false)
    }
  }

  if (!team) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Trazer contas pessoais?" size="md">
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: 16 }}>
        A equipe <strong>{team.name}</strong> ainda não tem nenhuma rede social conectada.
        Você pode trazer suas contas pessoais pra ela.
      </p>

      <div style={{
        display: 'flex', gap: 10, padding: 12, borderRadius: 'var(--radius-md)',
        background: 'var(--color-warning-light, rgba(245, 158, 11, 0.1))', marginBottom: 16,
      }}>
        <LuCircleAlert size={18} style={{ color: 'var(--color-warning)', flexShrink: 0, marginTop: 1 }} />
        <span style={{ fontSize: '0.85rem' }}>
          Ao importar, as contas selecionadas <strong>deixam de ser pessoais</strong> e passam a
          pertencer somente à equipe {team.name}. Só você que decide — pode recusar e continuar
          usando essas contas no seu espaço pessoal.
        </span>
      </div>

      {loading ? (
        <p>Carregando suas contas...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
          {accounts.map(acc => {
            const isSelected = selected.includes(acc.id)
            return (
              <button
                key={acc.id}
                type="button"
                onClick={() => toggle(acc.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                  border: `1px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  borderRadius: 'var(--radius-md)', background: isSelected ? 'var(--color-primary-light)' : 'transparent',
                  cursor: 'pointer', textAlign: 'left', width: '100%', fontFamily: 'var(--font-family)',
                }}
              >
                <span style={{
                  width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                  border: `1.5px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  background: isSelected ? 'var(--color-primary)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                }}>
                  {isSelected && <LuCheck size={12} />}
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                  <strong style={{ fontSize: '0.9rem' }}>{acc.username || acc.handle}</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    {PLATFORM_LABELS[acc.platform] || acc.platform}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        <Button variant="ghost" onClick={onClose} disabled={importing}>Agora não</Button>
        <Button variant="primary" onClick={handleImport} loading={importing} disabled={selected.length === 0}>
          Importar selecionadas
        </Button>
      </div>
    </Modal>
  )
}
