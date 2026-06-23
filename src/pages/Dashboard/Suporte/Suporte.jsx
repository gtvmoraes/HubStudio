import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { LuCircleCheck } from 'react-icons/lu'
import { useAuth } from '../../../contexts/AuthContext'
import {
  getKnowledgeCategories, getPopularArticles, getSystemStatus,
  getTickets, createTicket, getSupportFaqs,
} from '../../../services/support'

import SupportHero from './components/SupportHero'
import SupportChannels from './components/SupportChannels'
import KnowledgeBase from './components/KnowledgeBase'
import SupportFaq from './components/SupportFaq'
import MyTickets from './components/MyTickets'
import NewTicketModal from './components/NewTicketModal'
import SystemStatus from './components/SystemStatus'
import SupportPlanCard from './components/SupportPlanCard'
import LiveChatWidget from './components/LiveChatWidget'

import './Suporte.css'

export default function Suporte() {
  const { user } = useAuth()
  const firstName = user?.name?.split(' ')[0] || 'por aí'

  const [categories, setCategories] = useState([])
  const [articles, setArticles] = useState([])
  const [status, setStatus] = useState(null)
  const [tickets, setTickets] = useState([])
  const [faqs, setFaqs] = useState([])

  const [ticketModalOpen, setTicketModalOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    Promise.all([
      getKnowledgeCategories(),
      getPopularArticles(),
      getSystemStatus(),
      getTickets(),
      getSupportFaqs(),
    ]).then(([cats, arts, sys, tks, fqs]) => {
      setCategories(cats)
      setArticles(arts)
      setStatus(sys)
      setTickets(tks)
      setFaqs(fqs)
    })
  }, [])

  const flashToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2600)
  }

  const handleCreateTicket = async (form) => {
    const ticket = await createTicket(form)
    setTickets(prev => [ticket, ...prev])
    flashToast(`Chamado #${ticket.id} aberto! Nosso time vai responder em breve.`)
  }

  return (
    <div className="sup-page">
      <SupportHero
        firstName={firstName}
        articles={articles}
        onOpenArticle={() => {}}
      />

      <SupportChannels
        onOpenChat={() => setChatOpen(true)}
        onOpenTicket={() => setTicketModalOpen(true)}
      />

      <div className="sup-grid">
        <div className="sup-grid__main">
          <KnowledgeBase
            categories={categories}
            articles={articles}
            onOpenArticle={() => {}}
            onOpenCategory={() => {}}
          />
          <MyTickets tickets={tickets} onNewTicket={() => setTicketModalOpen(true)} />
          <SupportFaq faqs={faqs} />
        </div>

        <aside className="sup-grid__aside">
          <SupportPlanCard />
          <SystemStatus data={status} />
        </aside>
      </div>

      <NewTicketModal
        isOpen={ticketModalOpen}
        onClose={() => setTicketModalOpen(false)}
        onSubmit={handleCreateTicket}
      />

      <LiveChatWidget open={chatOpen} onOpenChange={setChatOpen} />

      <AnimatePresence>
        {toast && (
          <motion.div
            className="sup-toast"
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
