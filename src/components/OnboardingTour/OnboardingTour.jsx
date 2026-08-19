import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LuPartyPopper, LuShare2, LuCalendarClock,
  LuSparkles, LuArrowRight, LuX, LuLink, LuUsers,
} from 'react-icons/lu'
import './OnboardingTour.css'

// Flag setada no cadastro (AuthContext). O tour só aparece quando ela existe —
// ou seja, logo após criar a conta. Logins normais não disparam.
const STORAGE_KEY = 'hs-show-onboarding'

const STEPS = [
  {
    icon: LuPartyPopper,
    title: 'Boas-vindas ao HubStudio!',
    text: 'Sua conta está pronta. Em poucos passos você vai conectar suas redes e começar a gerenciar tudo de um só lugar. Leva menos de um minuto.',
  },
  {
    icon: LuUsers,
    title: 'Pessoal ou equipe — você escolhe',
    text: 'No topo do menu lateral tem o seletor de contexto: suas contas pessoais ficam separadas das contas de cada equipe que você participa. Tudo que você faz (conectar redes, postar, ver dados) usa o contexto selecionado ali.',
  },
  {
    icon: LuShare2,
    title: 'Conecte suas redes sociais',
    text: 'Esse é o passo mais importante: em Configurações → Redes sociais você vincula Instagram, TikTok, YouTube, Facebook, LinkedIn e X — no contexto (pessoal ou equipe) que estiver selecionado. Sem isso, não dá pra agendar nem ver métricas.',
  },
  {
    icon: LuCalendarClock,
    title: 'Agende seus posts',
    text: 'Com as redes conectadas, use o botão "Novo post" pra criar e agendar publicações em várias redes ao mesmo tempo — com preview real de cada plataforma.',
  },
  {
    icon: LuSparkles,
    title: 'Deixe a IA trabalhar por você',
    text: 'No Dashboard você acompanha desempenho em tempo real e recebe sugestões de conteúdo e do melhor horário pra postar. Pronto pra vincular sua primeira rede?',
    cta: { label: 'Vincular minhas redes', to: '/dashboard/configuracoes?tab=redes' },
  },
]

export default function OnboardingTour() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    // Abre apenas se a flag de cadastro estiver presente
    if (localStorage.getItem(STORAGE_KEY)) {
      const t = setTimeout(() => setOpen(true), 500)
      return () => clearTimeout(t)
    }
  }, [])

  const finish = () => {
    localStorage.removeItem(STORAGE_KEY)
    setOpen(false)
  }

  const finishAndGo = (to) => {
    finish()
    navigate(to)
  }

  const next = () => {
    if (step === STEPS.length - 1) finish()
    else setStep(s => s + 1)
  }
  const skip = () => finish()
  const goTo = (i) => setStep(i)

  const current = STEPS[step]
  const Icon = current?.icon
  const isLast = step === STEPS.length - 1

  return (
    <AnimatePresence>
      {open && current && (
        <div className="onboarding-root">
          <motion.div
            className="onboarding__overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className="onboarding"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              type="button"
              className="onboarding__close"
              onClick={skip}
              aria-label="Pular tour"
            >
              <LuX size={16} />
            </button>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                className="onboarding__content"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.2 }}
              >
                <div className="onboarding__icon">
                  <Icon size={28} />
                </div>
                <h2>{current.title}</h2>
                <p>{current.text}</p>
              </motion.div>
            </AnimatePresence>

            <div className="onboarding__dots" role="tablist">
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`onboarding__dot${i === step ? ' onboarding__dot--active' : ''}`}
                  onClick={() => goTo(i)}
                  aria-label={`Passo ${i + 1}`}
                  aria-selected={i === step}
                  role="tab"
                />
              ))}
            </div>

            <div className="onboarding__footer">
              <button
                type="button"
                className="onboarding__skip"
                onClick={skip}
              >
                {isLast ? 'Agora não' : 'Pular tour'}
              </button>
              {isLast && current.cta ? (
                <button
                  type="button"
                  className="onboarding__next"
                  onClick={() => finishAndGo(current.cta.to)}
                >
                  {current.cta.label} <LuLink size={14} />
                </button>
              ) : (
                <button
                  type="button"
                  className="onboarding__next"
                  onClick={next}
                >
                  Próximo <LuArrowRight size={14} />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
