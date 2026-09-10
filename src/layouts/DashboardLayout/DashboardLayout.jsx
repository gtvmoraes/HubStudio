import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar/Sidebar'
import SearchModal from '../../components/SearchModal/SearchModal'
import ShortcutsModal from '../../components/ShortcutsModal/ShortcutsModal'
import { TourProvider } from '../../components/Tour/TourProvider'
import ImportAccountsModal from '../../pages/Dashboard/Equipes/components/ImportAccountsModal'
import useKeyboardShortcuts from '../../hooks/useKeyboardShortcuts'
import { useTeam } from '../../contexts/TeamContext'
import './DashboardLayout.css'

export default function DashboardLayout() {
  const navigate = useNavigate()
  const { pendingImport, dismissPendingImport } = useTeam()
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
    <TourProvider onExpandSidebar={() => setIsCollapsed(false)}>
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

      <ImportAccountsModal
        team={pendingImport}
        isOpen={Boolean(pendingImport)}
        onClose={dismissPendingImport}
      />
    </div>
    </TourProvider>
  )
}
