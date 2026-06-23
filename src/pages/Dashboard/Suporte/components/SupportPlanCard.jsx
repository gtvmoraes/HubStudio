import { LuCrown, LuCheck, LuArrowRight } from 'react-icons/lu'

// Plano atual mockado — quando o backend chegar, vem do contexto do usuário.
const CURRENT = {
  name: 'Pro',
  tier: 'Suporte prioritário',
  perks: [
    'Resposta prioritária em até 4h',
    'Chat ao vivo em horário comercial',
    'Base de conhecimento completa',
  ],
}

const ELITE_PERKS = [
  'Atendimento 24/7',
  'Gerente de conta dedicado',
  'Onboarding personalizado',
]

export default function SupportPlanCard() {
  return (
    <div className="sup-plan chart-card">
      <div className="sup-section-head">
        <h3>Seu plano de suporte</h3>
      </div>

      <div className="sup-plan__current">
        <span className="sup-plan__badge">{CURRENT.name}</span>
        <strong className="sup-plan__tier">{CURRENT.tier}</strong>
      </div>

      <ul className="sup-plan__perks">
        {CURRENT.perks.map(p => (
          <li key={p}><LuCheck size={15} /> {p}</li>
        ))}
      </ul>

      <div className="sup-plan__upsell">
        <div className="sup-plan__upsell-head">
          <LuCrown size={16} />
          <strong>Suba para o Elite</strong>
        </div>
        <ul className="sup-plan__upsell-perks">
          {ELITE_PERKS.map(p => (
            <li key={p}><LuCheck size={13} /> {p}</li>
          ))}
        </ul>
        <button type="button" className="sup-plan__upsell-btn">
          Conhecer o Elite <LuArrowRight size={14} />
        </button>
      </div>
    </div>
  )
}
