import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar/Sidebar'
import SearchModal from '../../components/SearchModal/SearchModal'
import ShortcutsModal from '../../components/ShortcutsModal/ShortcutsModal'
import OnboardingTour from '../../components/OnboardingTour/OnboardingTour'
import useKeyboardShortcuts from '../../hooks/useKeyboardShortcuts'
import './DashboardLayout.css'

export default function DashboardLayout() {
  const navigate = useNavigate()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)

  // Substituiu o antigo PostModal por navegação pra página de composição
  const openComposer = () => navigate('/dashboard/posts/novo')

  useKeyboardShortcuts({
    'mod+k': () => setShowSearch(true),
    '/':     () => setShowSearch(true),
    'n':     openComposer,
    '?':     () => setShowShortcuts(true),
  })

  return (
    <div className={`dashboard-layout ${isCollapsed ? 'dashboard-layout--collapsed' : ''}`}>
      <Sidebar
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed(c => !c)}
        onNewPost={openComposer}
        onOpenSearch={() => setShowSearch(true)}
      />
      <main className="dashboard-main">
        <Outlet />
      </main>

      <SearchModal
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
        onNewPost={openComposer}
      />

      <ShortcutsModal
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />

      <OnboardingTour />
    </div>
  )
}
