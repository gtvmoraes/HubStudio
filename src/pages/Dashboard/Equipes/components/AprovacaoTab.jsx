import { useNavigate } from 'react-router-dom'
import { LuShieldCheck, LuArrowRight, LuUsers, LuX } from 'react-icons/lu'
import { getInitials } from '../../../../utils/string'

const CONFIG_OPTIONS = [
  {
    key: 'requireApprovalFromEditors',
    label: 'Posts de Editores precisam de aprovação antes de publicar',
    desc: 'Quando um Editor agendar um post, ele vira pending pra um Gerente revisar.',
  },
  {
    key: 'requireDoubleApprovalAbove100k',
    label: 'Exigir 2 aprovações pra contas com mais de 100k seguidores',
    desc: 'Camada extra de revisão pra contas grandes — útil pra marcas/agências.',
  },
  {
    key: 'autoApproveScheduled48h',
    label: 'Auto-aprovar posts agendados com 48h+ de antecedência',
    desc: 'Quando o autor for confiável e o post estiver no calendário com folga.',
  },
  {
    key: 'notifyManagersAfter24h',
    label: 'Notificar gerentes por e-mail quando posts pendentes ficam >24h',
    desc: 'Evita que algo trave esperando alguém olhar.',
  },
]

export default function AprovacaoTab({ config, members, onToggle, onRemoveApprover, pendingCount }) {
  const navigate = useNavigate()

  const approvers = (config?.defaultApproverIds || [])
    .map(id => members.find(m => m.id === id))
    .filter(Boolean)

  return (
    <div className="aprovacao-tab">
      <div className="aprovacao-tab__intro">
        <h3>Fluxo de aprovação</h3>
        <p>
          Configure como posts criados pela equipe são revisados antes de irem ao ar.
          {pendingCount > 0 && (
            <button
              type="button"
              className="aprovacao-tab__shortcut"
              onClick={() => navigate('/dashboard/posts')}
            >
              <LuShieldCheck size={14} />
              {pendingCount} {pendingCount === 1 ? 'post' : 'posts'} aguardando agora
              <LuArrowRight size={13} />
            </button>
          )}
        </p>
      </div>

      {/* Toggles de regras */}
      <div className="aprovacao-tab__rules">
        {CONFIG_OPTIONS.map(opt => (
          <label key={opt.key} className="aprovacao-rule">
            <div className="aprovacao-rule__text">
              <strong>{opt.label}</strong>
              <span>{opt.desc}</span>
            </div>
            <div
              className={`aprovacao-rule__toggle${config?.[opt.key] ? ' aprovacao-rule__toggle--on' : ''}`}
              onClick={() => onToggle(opt.key)}
              role="switch"
              aria-checked={Boolean(config?.[opt.key])}
            >
              <span />
            </div>
          </label>
        ))}
      </div>

      {/* Aprovadores padrão */}
      <div className="aprovacao-tab__approvers">
        <div className="aprovacao-tab__approvers-head">
          <h4><LuUsers size={16} /> Aprovadores padrão</h4>
          <span>Quem recebe notificação quando um post é submetido.</span>
        </div>
        <div className="aprovacao-tab__approvers-list">
          {approvers.length === 0 ? (
            <p className="aprovacao-tab__approvers-empty">
              Nenhum aprovador definido. Editores ainda podem submeter, mas você precisa
              decidir quem revisa.
            </p>
          ) : (
            approvers.map(m => (
              <div key={m.id} className="aprovador-chip">
                <div className="aprovador-chip__avatar">{getInitials(m.name)}</div>
                <span>{m.name}</span>
                <button
                  type="button"
                  onClick={() => onRemoveApprover(m.id)}
                  aria-label="Remover aprovador"
                >
                  <LuX size={12} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
