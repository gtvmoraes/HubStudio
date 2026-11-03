import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { LuCrown, LuCircleCheck, LuClock } from 'react-icons/lu'
import { getUsage } from '../../../../services/settings'
import { getCurrentPlan, getPayments, startCheckout, confirmPayment, cancelPlan } from '../../../../services/billing'
import { useTeam } from '../../../../contexts/TeamContext'
import Button from '../../../../components/Button/Button'

// Mesmos preços da landing e do BillingService (anual = mensal com desconto, cobrado em 12x de uma vez)
const PLANS = [
  { id: 'pro',   label: 'Pro',   monthly: 39.90, annual: 31.90, perks: 'Até 5 membros na equipe' },
  { id: 'elite', label: 'Elite', monthly: 99.90, annual: 79.90, perks: 'Membros ilimitados e fluxo de aprovação' },
]
const PLAN_LABELS = { lite: 'Lite', pro: 'Pro', elite: 'Elite' }

const brl = (n) => n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmtDate = (iso) => iso
  ? new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
  : null

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
  const { activeContext } = useTeam()
  const companyId = activeContext?.personal ? null : activeContext?.id
  const [searchParams, setSearchParams] = useSearchParams()

  const [usage, setUsage] = useState(null)
  const [plan, setPlan] = useState(undefined)       // undefined = carregando
  const [payments, setPayments] = useState([])
  const [annual, setAnnual] = useState(true)       // anual pré-selecionado
  const [busyPlan, setBusyPlan] = useState(null)
  const [cancelling, setCancelling] = useState(false)
  const [notice, setNotice] = useState(null)        // { type: 'ok' | 'wait' | 'error', text }

  const reload = useCallback(() => {
    getCurrentPlan(companyId).then(setPlan)
    getPayments(companyId).then(setPayments)
  }, [companyId])

  useEffect(() => { getUsage().then(setUsage) }, [])
  useEffect(() => { reload() }, [reload])

  // Volta do checkout da AbacatePay (?checkout=<paymentId>): confirma algumas vezes,
  // porque o PIX pode levar alguns segundos pra constar como pago.
  useEffect(() => {
    const paymentId = searchParams.get('checkout')
    if (!paymentId) return
    let cancelled = false
    let attempts = 0
    setNotice({ type: 'wait', text: 'Confirmando seu pagamento…' })

    const check = async () => {
      attempts++
      try {
        const result = await confirmPayment(paymentId)
        if (cancelled) return
        if (result.status === 'paid') {
          setNotice({ type: 'ok', text: `Pagamento confirmado! Seu plano agora é ${PLAN_LABELS[result.plan] ?? result.plan}.` })
          const next = new URLSearchParams(searchParams)
          next.delete('checkout')
          setSearchParams(next, { replace: true })
          reload()
          return
        }
      } catch (e) {
        if (!cancelled) setNotice({ type: 'error', text: e.message })
        return
      }
      if (attempts < 10) setTimeout(check, 3000)
      else if (!cancelled) setNotice({ type: 'wait', text: 'Ainda não recebemos a confirmação. Se você já pagou, ela aparece aqui em instantes.' })
    }
    check()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubscribe = async (planId) => {
    setBusyPlan(planId)
    setNotice(null)
    try {
      const { url } = await startCheckout(planId, annual ? 'ANNUAL' : 'MONTHLY', companyId)
      window.location.href = url
    } catch (e) {
      setNotice({ type: 'error', text: e.message })
      setBusyPlan(null)
    }
  }

  const handleCancel = async () => {
    const label = PLAN_LABELS[currentId] ?? currentId
    if (!window.confirm(`Cancelar o plano ${label}? A conta volta para o Lite agora e os recursos do ${label} deixam de valer. O valor pago não é reembolsado automaticamente.`)) return
    setCancelling(true)
    setNotice(null)
    try {
      await cancelPlan(companyId)
      setNotice({ type: 'ok', text: 'Plano cancelado. Sua conta voltou para o Lite.' })
      reload()
    } catch (e) {
      setNotice({ type: 'error', text: e.message })
    } finally {
      setCancelling(false)
    }
  }

  const currentId = plan?.plan ?? 'lite'
  const current = PLANS.find(p => p.id === currentId)
  const paymentsEnabled = plan?.paymentsEnabled !== false

  return (
    <div className="set-section">
      <div className="set-section__head">
        <h2>Plano & Cobrança</h2>
        <p>
          Gerencie o plano {activeContext?.personal ? 'da sua conta' : <>da equipe <strong>{activeContext?.name}</strong></>},
          acompanhe o uso e veja seus pagamentos.
        </p>
      </div>

      {notice && (
        <div className={`set-billing-notice set-billing-notice--${notice.type}`} role="status">
          {notice.type === 'ok' ? <LuCircleCheck size={15} /> : <LuClock size={15} />} {notice.text}
        </div>
      )}

      <div className="set-billing-grid">
        {/* Plano atual */}
        <div className="set-card set-plan">
          <span className="set-plan__badge"><LuCrown size={13} /> Plano {PLAN_LABELS[currentId] ?? currentId}</span>
          <div className="set-plan__price">
            {current ? (
              <><span>R$</span><strong>{Math.floor(current.monthly)}</strong><span>,{brl(current.monthly).split(',')[1]}/mês</span></>
            ) : (
              <><span>R$</span><strong>0</strong><span>/mês</span></>
            )}
          </div>
          <p className="set-plan__renew">
            {plan?.validUntil
              ? <>Ativo até <strong>{fmtDate(plan.validUntil)}</strong></>
              : currentId === 'lite' ? 'Plano gratuito' : 'Plano ativo'}
          </p>
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

      {/* Escolha de plano */}
      <div className="set-card">
        <div className="set-billing-head">
          <div className="set-card__title">Mudar de plano</div>
          <div className="set-billing-cycle" role="group" aria-label="Ciclo de cobrança">
            <button type="button" className={!annual ? 'is-active' : ''} onClick={() => setAnnual(false)}>Mensal</button>
            <button type="button" className={annual ? 'is-active' : ''} onClick={() => setAnnual(true)}>Anual (−20%)</button>
          </div>
        </div>
        <div className="set-billing-plans">
          {PLANS.map(p => {
            const price = annual ? p.annual : p.monthly
            const isCurrent = p.id === currentId
            return (
              <div key={p.id} className={`set-billing-plan${isCurrent ? ' is-current' : ''}`}>
                <strong>{p.label}</strong>
                <span className="set-billing-plan__price">R$ {brl(price)}<small>/mês</small></span>
                <span className="set-billing-plan__note">
                  {annual ? `R$ ${brl(price * 12)} à vista por 12 meses` : 'Pagamento de 1 mês'}
                </span>
                <span className="set-billing-plan__perks">{p.perks}</span>
                <Button
                  size="sm"
                  fullWidth
                  variant={isCurrent ? 'secondary' : 'primary'}
                  loading={busyPlan === p.id}
                  disabled={!paymentsEnabled || busyPlan !== null}
                  onClick={() => handleSubscribe(p.id)}
                >
                  {isCurrent ? 'Renovar' : `Assinar ${p.label}`}
                </Button>
              </div>
            )
          })}
        </div>
        <p className="set-billing-foot">
          {paymentsEnabled
            ? 'Pagamento seguro via PIX ou cartão pela AbacatePay. Você volta pra cá ao concluir.'
            : 'Pagamentos indisponíveis no momento.'}
        </p>
      </div>

      {/* Pagamentos */}
      <div className="set-card">
        <div className="set-card__title">Histórico de pagamentos</div>
        {payments.length === 0 ? (
          <p className="set-billing-foot">Nenhum pagamento ainda.</p>
        ) : (
          <ul className="set-invoices">
            {payments.map(p => (
              <li key={p.id} className="set-invoice">
                <div className="set-invoice__main">
                  <strong>Plano {PLAN_LABELS[p.plan] ?? p.plan} · {p.cycle === 'ANNUAL' ? 'Anual' : 'Mensal'}</strong>
                  <span>{fmtDate(p.paidAt || p.createdAt)}</span>
                </div>
                <span className="set-invoice__status">
                  {p.status === 'paid' ? <><LuCircleCheck size={13} /> Pago</> : <><LuClock size={13} /> Pendente</>}
                </span>
                <span className="set-invoice__amount">R$ {brl(p.amountCents / 100)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Cancelamento */}
      {currentId !== 'lite' && (
        <div className="set-card set-billing-cancel">
          <div>
            <div className="set-card__title">Cancelar plano</div>
            <p className="set-billing-foot">
              A conta volta para o Lite na hora. Para pedir reembolso, fale com o suporte.
            </p>
          </div>
          <Button size="sm" variant="secondary" loading={cancelling} onClick={handleCancel}>
            Cancelar plano {PLAN_LABELS[currentId] ?? currentId}
          </Button>
        </div>
      )}
    </div>
  )
}
