import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LuArrowRight, LuArrowUpRight, LuCheck, LuStar, LuChevronRight,
  LuMessageCircle, LuRotateCcw, LuShieldCheck, LuCreditCard,
} from 'react-icons/lu'

import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'
import Button from '../../components/Button/Button'

import Counter from './components/Counter'
import FaqItem from './components/FaqItem'
import HeroMockup from './components/HeroMockup'
import {
  FeatureCalendarPreview, FeatureChartPreview,
  FeatureHashtagsPreview, FeaturePlatformsPreview,
} from './components/FeaturePreviews'

import { FEATURES, STEPS, PLANS, FAQS, fadeUp } from './data'
import './Landing.css'

const PREVIEWS = {
  calendar:  FeatureCalendarPreview,
  chart:     FeatureChartPreview,
  hashtags:  FeatureHashtagsPreview,
  platforms: FeaturePlatformsPreview,
}

// Formata o preço no padrão brasileiro: inteiros sem decimal ("0"), decimais com ","
const formatPrice = (n) => {
  if (n === 0) return '0'
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function Landing() {
  const navigate = useNavigate()
  const [annual, setAnnual] = useState(false)

  return (
    <div className="landing l-landing">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────── */}
      <section className="l-hero">
        <div className="l-hero__blobs">
          <div className="l-blob l-blob--1" />
          <div className="l-blob l-blob--2" />
          <div className="l-blob l-blob--3" />
        </div>

        <div className="container l-hero__inner">
          <motion.div
            className="l-hero__content"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.09 } } }}
          >
            <motion.h1 variants={fadeUp} className="l-hero__title">
              Suas redes sociais<br />
              <span className="l-hero__highlight">simplificadas.</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="l-hero__sub">
              Agende posts, analise métricas e receba insights de IA —
              tudo em uma plataforma feita para quem leva o conteúdo a sério.
            </motion.p>

            <motion.div variants={fadeUp} className="l-hero__ctas">
              <Button
                variant="primary"
                size="lg"
                iconRight={<LuArrowRight />}
                onClick={() => navigate('/cadastro')}
              >
                Começar grátis
              </Button>
              <Link to="/entrar" className="l-hero__link">
                Já tenho conta <LuChevronRight />
              </Link>
            </motion.div>
          </motion.div>

          <HeroMockup />
        </div>
      </section>

      {/* ── Features ─────────────────────────────────── */}
      <section className="l-features" id="funcionalidades">
        <div className="container">
          <div className="l-section-head">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Tudo que você precisa,<br /><span className="l-gradient-text">em um só lugar</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Do planejamento à análise, o HubStudio centraliza toda a sua gestão de redes sociais.
            </motion.p>
          </div>

          <div className="l-bento">
            {FEATURES.map((f, i) => {
              const Icon = f.icon
              const Preview = PREVIEWS[f.preview]
              return (
                <motion.div
                  key={f.title}
                  className={`l-bento__card l-bento__card--${f.slot}`}
                  style={{ '--accent': f.color }}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.55 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="l-bento__head">
                    <div className="l-bento__icon"><Icon /></div>
                    <h3>{f.title}</h3>
                    <p>{f.desc}</p>
                  </div>
                  {Preview && <Preview />}
                  <div className="l-bento__glow" />
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────── */}
      <section className="l-stats">
        <div className="l-stats__noise" />
        <div className="container l-stats__inner">
          <Counter end={1200}  suffix="+" label="Usuários ativos" delay={0}    />
          <Counter end={48000} suffix=""  label="Posts agendados" delay={0.1}  />
          <Counter end={6}     suffix=""  label="Plataformas"     delay={0.2}  />
          <Counter end={98}    suffix="%" label="Satisfação"      delay={0.3}  />
        </div>
      </section>

      {/* ── How it works ─────────────────────────────── */}
      <section className="l-steps" id="sobre">
        <div className="container">
          <div className="l-section-head">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Em <span className="l-gradient-text">3 passos simples</span><br />você já está no ar
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Configurar, criar e analisar nunca foi tão simples. Em minutos você conecta suas redes e começa a crescer de verdade.
            </motion.p>
          </div>

          <div className="l-steps__grid">
            {STEPS.map((s, i) => {
              const Icon = s.icon
              return (
                <motion.div
                  key={s.num}
                  className="l-step"
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.6 }}
                >
                  <div className="l-step__num">{s.num}</div>
                  <div className="l-step__icon"><Icon /></div>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────── */}
      <section className="l-faq" id="faq">
        <div className="l-faq__bg" aria-hidden="true" />
        <div className="container">
          <div className="l-faq__layout">
            <div className="l-faq__head-col">
              <div className="l-section-head l-section-head--left">
                <motion.h2
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  Perguntas<br /><span className="l-gradient-text">frequentes</span>
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  Tudo que você precisa saber antes de começar.
                </motion.p>
              </div>
            </div>

            <div className="l-faq__list-col">
              <div className="l-faq__list">
                {FAQS.map((f, i) => (
                  <motion.div
                    key={f.q}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.07, duration: 0.45 }}
                  >
                    <FaqItem icon={f.icon} question={f.q} answer={f.a} />
                  </motion.div>
                ))}
              </div>

              <motion.div
                className="l-faq__cta"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.15 }}
              >
                <div className="l-faq__cta-icon">
                  <LuMessageCircle />
                </div>
                <div className="l-faq__cta-text">
                  <h3>Ainda tem dúvidas?</h3>
                  <p>Nosso time responde em minutos.</p>
                </div>
                <Button
                  variant="primary"
                  size="md"
                  iconRight={<LuArrowRight />}
                  onClick={() => { window.location.href = 'mailto:contato@hubstudio.com' }}
                >
                  Falar com a gente
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────── */}
      <section className="l-pricing" id="precos">
        <div className="container">
          <div className="l-section-head">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Projetado para<br /><span className="l-gradient-text">cada etapa</span>
            </motion.h2>
          </div>

          <motion.div
            className="l-toggle"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className={!annual ? 'l-toggle__opt--active' : ''}>Mensal</span>
            <button
              className={`l-toggle__btn${annual ? ' l-toggle__btn--on' : ''}`}
              onClick={() => setAnnual(!annual)}
              aria-label="Alternar cobrança"
            >
              <motion.div
                className="l-toggle__thumb"
                animate={{ x: annual ? 24 : 2 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            </button>
            <span className={annual ? 'l-toggle__opt--active' : ''}>
              Anual <span className="l-toggle__save">-20%</span>
            </span>
          </motion.div>

          <motion.div
            className="l-pricing__trust"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <span><LuShieldCheck /> Primeiro mês grátis</span>
            <span><LuCreditCard /> Sem cartão de crédito</span>
            <span><LuRotateCcw /> Cancele quando quiser</span>
          </motion.div>

          <div className="l-plans">
            {PLANS.map((plan, i) => (
              <motion.div
                key={plan.name}
                className={`l-plan${plan.highlight ? ' l-plan--highlight' : ''}`}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.55 }}
                whileHover={{ y: -6 }}
              >
                {plan.highlight && (
                  <div className="l-plan__popular">
                    <LuStar /> Mais popular
                  </div>
                )}
                <div className="l-plan__head">
                  <span className="l-plan__tagline">{plan.tagline}</span>
                  <h3 className="l-plan__name">{plan.name}</h3>
                </div>
                <div className="l-plan__price">
                  <span className="l-plan__currency">R$</span>
                  {plan.monthly === 0 ? (
                    // Plano gratuito — sem animação, evita "tremor" ao trocar mensal/anual
                    <span className="l-plan__amount">0</span>
                  ) : (
                    <motion.span
                      className="l-plan__amount"
                      key={annual ? 'a' : 'm'}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      {formatPrice(annual ? plan.annual : plan.monthly)}
                    </motion.span>
                  )}
                  <span className="l-plan__period">/mês</span>
                </div>

                {/* PIX — anima a altura via grid trick (igual ao savings) */}
                {plan.monthly > 0 && (
                  <div className={`l-plan__pix-wrap${annual ? ' is-visible' : ''}`}>
                    <div className="l-plan__pix-inner">
                      <span className="l-plan__pix">
                        R$ {formatPrice(plan.annual * 12)} à vista no PIX
                      </span>
                    </div>
                  </div>
                )}

                <div className={`l-plan__savings-wrap${annual && plan.monthly > 0 ? ' is-visible' : ''}`}>
                  <div className="l-plan__savings-inner">
                    <span className="l-plan__savings">
                      Economize R$ {formatPrice((plan.monthly - plan.annual) * 12)} por ano
                    </span>
                  </div>
                </div>
                <p className="l-plan__desc">{plan.desc}</p>
                <ul className="l-plan__features">
                  {plan.features.map(f => (
                    <li key={f}>
                      <LuCheck className="l-plan__check" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  variant={plan.highlight ? 'primary' : 'outline'}
                  fullWidth
                  iconRight={plan.highlight ? <LuArrowUpRight /> : <LuArrowRight />}
                  onClick={() => navigate('/cadastro')}
                >
                  {plan.cta}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────── */}
      <section className="l-cta">
        <div className="l-cta__glow l-cta__glow--1" />
        <div className="l-cta__glow l-cta__glow--2" />
        <div className="container l-cta__inner">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.6 }}
          >
            Transforme sua presença<br />digital com o <span className="l-gradient-text">HubStudio</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Junte-se a mais de 1.200 criadores que já usam o HubStudio para crescer.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <Button
              variant="primary"
              size="lg"
              iconRight={<LuArrowRight />}
              onClick={() => navigate('/cadastro')}
              className="l-cta__btn"
            >
              Começar grátis
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
