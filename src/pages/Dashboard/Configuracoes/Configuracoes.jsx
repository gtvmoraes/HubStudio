import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  LuUser, LuShare2, LuShieldCheck, LuBell, LuPalette, LuCreditCard, LuLock,
  LuCircleCheck,
} from 'react-icons/lu'

import PerfilTab from './components/PerfilTab'
import RedesTab from './components/RedesTab'
import SegurancaTab from './components/SegurancaTab'
import NotificacoesTab from './components/NotificacoesTab'
import AparenciaTab from './components/AparenciaTab'
import CobrancaTab from './components/CobrancaTab'
import PrivacidadeTab from './components/PrivacidadeTab'

import './Configuracoes.css'

const TABS = [
  { id: 'perfil',       label: 'Perfil',           icon: LuUser },
  { id: 'redes',        label: 'Redes sociais',    icon: LuShare2 },
  { id: 'seguranca',    label: 'Segurança',        icon: LuShieldCheck },
  { id: 'notificacoes', label: 'Notificações',     icon: LuBell },
  { id: 'aparencia',    label: 'Aparência',        icon: LuPalette },
  { id: 'cobranca',     label: 'Plano & Cobrança', icon: LuCreditCard },
  { id: 'privacidade',  label: 'Privacidade',      icon: LuLock },
]

const TAB_IDS = TABS.map(t => t.id)

export default function Configuracoes() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialTab = TAB_IDS.includes(searchParams.get('tab')) ? searchParams.get('tab') : 'perfil'
  const [tab, setTab] = useState(initialTab)
  const [toast, setToast] = useState('')

  const selectTab = (id) => {
    setTab(id)
    setSearchParams({ tab: id }, { replace: true })
  }

  const flashToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2800)
  }

  return (
    <div className="set-page">
      <div className="set-page__header">
        <h1>Configurações</h1>
        <p>Gerencie sua conta, redes, segurança e preferências.</p>
      </div>

      <div className="set-page__layout">
        <nav className="set-tabs">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className={`set-tab ${tab === id ? 'set-tab--active' : ''}`}
              onClick={() => selectTab(id)}
            >
              <Icon size={17} className="set-tab__icon" />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="set-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
            >
              {tab === 'perfil'       && <PerfilTab />}
              {tab === 'redes'        && <RedesTab />}
              {tab === 'seguranca'    && <SegurancaTab />}
              {tab === 'notificacoes' && <NotificacoesTab />}
              {tab === 'aparencia'    && <AparenciaTab />}
              {tab === 'cobranca'     && <CobrancaTab />}
              {tab === 'privacidade'  && <PrivacidadeTab onToast={flashToast} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            className="set-toast"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.25 }}
          >
            <LuCircleCheck size={18} />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
