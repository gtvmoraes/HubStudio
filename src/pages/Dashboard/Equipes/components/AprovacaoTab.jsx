import { useNavigate } from 'react-router-dom'
import { LuShieldCheck, LuArrowRight, LuUsers, LuX } from 'react-icons/lu'
import { getInitials } from '../../../../utils/string'

// Quem passa por aprovação não é um toggle: é quem não tem "Agendar sem
// aprovação" na aba Papéis (ver o aviso no topo da aba). As antigas regras de
// "2 aprovações pra 100k+" e "auto-aprovar com 48h" saíram — nunca funcionaram.
const CONFIG_OPTIONS = [
  {
    key: 'notifyManagersAfter24h',
    label: 'Lembrar os aprovadores por e-mail quando um post fica pendente por mais de 24h',
    desc: 'Um lembrete por envio, pra nada travar esperando alguém olhar.',
  },
]

export default function AprovacaoTab({
  config, members, permissionMatrix, canEdit, onToggle, onAddApprover, onRemoveApprover, pendingCount,
}) {
  const navigate = useNavigate()

  // defaultApproverIds são ids de usuário (não do vínculo de membro)
  const approverIds = config?.defaultApproverIds || []
  const approvers = approverIds
    .map(id => members.find(m => m.userId === id))
    .filter(Boolean)
  // Só quem pode aprovar pelo cargo pode ser aprovador padrão (o backend valida o mesmo)
  const candidates = members.filter(m =>
    permissionMatrix?.[m.role]?.approve && !approverIds.includes(m.userId))

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

      <div className="aprovacao-tab__how">
        <strong>Quem precisa de aprovação?</strong>
        <span>
          Todo cargo sem a permissão <em>Agendar sem aprovação</em> (por padrão, Editor).
          Os posts dele ficam aguardando até alguém com <em>Aprovar/rejeitar</em> revisar —
          e ninguém aprova o próprio post. Ajuste quem tem cada permissão na aba Papéis.
        </span>
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
              onClick={() => canEdit && onToggle(opt.key)}
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
          <span>
            Quem recebe o e-mail quando um post é enviado pra aprovação. Sem nenhum definido, todos
            que podem aprovar recebem.
          </span>
        </div>
        <div className="aprovacao-tab__approvers-list">
          {approvers.length === 0 ? (
            <p className="aprovacao-tab__approvers-empty">
              Nenhum aprovador definido — todos que podem aprovar recebem os avisos.
            </p>
          ) : (
            approvers.map(m => (
              <div key={m.id} className="aprovador-chip">
                <div className="aprovador-chip__avatar">{getInitials(m.name)}</div>
                <span>{m.name}</span>
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => onRemoveApprover(m.userId)}
                    aria-label="Remover aprovador"
                  >
                    <LuX size={12} />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
        {canEdit && candidates.length > 0 && (
          <select
            className="aprovacao-tab__add-approver"
            value=""
            onChange={e => e.target.value && onAddApprover(e.target.value)}
          >
            <option value="">+ Adicionar aprovador</option>
            {candidates.map(m => (
              <option key={m.userId} value={m.userId}>{m.name}</option>
            ))}
          </select>
        )}
      </div>
    </div>
  )
}
