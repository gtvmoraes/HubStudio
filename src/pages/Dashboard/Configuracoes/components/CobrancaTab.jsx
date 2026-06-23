import { useState, useEffect } from 'react'
import { LuCrown, LuDownload, LuCircleCheck } from 'react-icons/lu'
import { getUsage, getInvoices } from '../../../../services/settings'
import Button from '../../../../components/Button/Button'

const UsageBar = ({ label, used, total, unit }) => {
  const unlimited = total == null
  const pct = unlimited ? 30 : Math.min(100, Math.round((used / total) * 100))
  return (
    <div className="set-usage">
      <div className="set-usage__meta">
        <span>{label}</span>
        <strong>
          {used}{unit ? ` ${unit}` : ''}{unlimited ? '' : ` / ${total}${unit ? ` ${unit}` : ''}`}
          {unlimited && <span className="set-usage__inf"> · ilimitado</span>}
        </strong>
      </div>
      <div className="set-usage__track">
        <div className={`set-usage__fill ${unlimited ? 'set-usage__fill--inf' : ''}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default function CobrancaTab() {
  const [usage, setUsage] = useState(null)
  const [invoices, setInvoices] = useState([])

  useEffect(() => {
    getUsage().then(setUsage)
    getInvoices().then(setInvoices)
  }, [])

  return (
    <div className="set-section">
      <div className="set-section__head">
        <h2>Plano & Cobrança</h2>
        <p>Gerencie seu plano, acompanhe o uso e veja suas faturas.</p>
      </div>

      <div className="set-billing-grid">
        {/* Plano atual */}
        <div className="set-card set-plan">
          <span className="set-plan__badge"><LuCrown size={13} /> Plano Pro</span>
          <div className="set-plan__price">
            <span>R$</span><strong>39</strong><span>,90/mês</span>
          </div>
          <p className="set-plan__renew">Renova em <strong>01 de julho de 2026</strong></p>
          <div className="set-plan__actions">
            <Button size="sm" fullWidth>Fazer upgrade</Button>
            <button type="button" className="set-link-muted">Trocar para anual (−20%)</button>
          </div>
        </div>

        {/* Uso */}
        <div className="set-card set-usage-card">
          <div className="set-card__title">Uso do plano</div>
          {usage && (
            <>
              <UsageBar label="Perfis sociais" used={usage.profiles.used} total={usage.profiles.total} />
              <UsageBar label="Posts neste mês" used={usage.posts.used} total={usage.posts.total} />
              <UsageBar label="Armazenamento" used={usage.storage.used} total={usage.storage.total} unit={usage.storage.unit} />
            </>
          )}
        </div>
      </div>

      {/* Método de pagamento */}
      <div className="set-card set-paymethod">
        <div className="set-paymethod__info">
          <span className="set-paymethod__brand">VISA</span>
          <div>
            <strong>Visa terminando em 0000</strong>
            <span>Expira 09/2028</span>
          </div>
        </div>
        <button type="button" className="set-link-muted">Editar</button>
      </div>

      {/* Faturas */}
      <div className="set-card">
        <div className="set-card__title">Histórico de faturas</div>
        <ul className="set-invoices">
          {invoices.map(inv => (
            <li key={inv.id} className="set-invoice">
              <div className="set-invoice__main">
                <strong>{inv.id}</strong>
                <span>{inv.date} · {inv.plan}</span>
              </div>
              <span className="set-invoice__status"><LuCircleCheck size={13} /> Paga</span>
              <span className="set-invoice__amount">{inv.amount}</span>
              <button type="button" className="set-invoice__dl" aria-label={`Baixar ${inv.id}`}>
                <LuDownload size={15} />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
