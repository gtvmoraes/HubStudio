import { NavLink, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LuLayoutDashboard, LuSquarePen, LuUsers,
  LuSettings, LuCircleHelp, LuSun, LuMoon,
  LuLogOut, LuChevronLeft, LuChevronRight, LuSearch,
} from 'react-icons/lu'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { getInitials } from '../../utils/string'
import logoHub from '../../assets/images/logo-hub.png'
import logoHubDark from '../../assets/images/logo-hub-dark.png'
import logoHubIcon from '../../assets/images/logo-hub-icon.png'
import './Sidebar.css'

const NAV_ITEMS = [
  { to: '/dashboard', icon: LuLayoutDashboard, label: 'Dashboard', end: true },
]

const BOTTOM_ITEMS = [
  { to: '/dashboard/configuracoes', icon: LuSettings, label: 'Configurações' },
]

// Os labels e elementos internos ficam SEMPRE no DOM. A visibilidade é
// controlada por CSS via .sidebar--collapsed — transições suaves de max-width
// e opacity, sincronizadas com a animação de largura da sidebar.
export default function Sidebar({ isCollapsed, onToggle, onNewPost, onOpenSearch }) {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <motion.aside
      className={`sidebar ${isCollapsed ? 'sidebar--collapsed' : ''}`}
      animate={{ width: isCollapsed ? 68 : 240 }}
      transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
    >
      {/* Toggle */}
      <button className="sidebar__toggle" onClick={onToggle} aria-label="Colapsar menu">
        {isCollapsed ? <LuChevronRight size={16} /> : <LuChevronLeft size={16} />}
      </button>

      {/* Logo — duas imagens empilhadas, crossfade via CSS */}
      <Link to="/dashboard" className="sidebar__logo" aria-label="Ir para o Dashboard">
        <div className="sidebar__logo-stage">
          <img src={theme === 'dark' ? logoHubDark : logoHub} alt="HubStudio" className="sidebar__logo-img sidebar__logo-img--full" />
          <img src={logoHubIcon} alt="" className="sidebar__logo-img sidebar__logo-img--icon" aria-hidden="true" />
        </div>
      </Link>

      {/* Search */}
      <button
        type="button"
        className="sidebar__search"
        onClick={onOpenSearch}
        aria-label="Abrir busca"
        data-tooltip="Pesquisar (Ctrl+K)"
      >
        <LuSearch size={16} className="sidebar__search-icon" />
        <span className="sidebar__search-label">
          Pesquisar
          <kbd>Ctrl K</kbd>
        </span>
      </button>

      {/* Main nav */}
      <nav className="sidebar__nav">
        {NAV_ITEMS.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            data-tooltip={label}
            className={({ isActive }) =>
              `sidebar__item ${isActive ? 'sidebar__item--active' : ''}`
            }
          >
            <Icon size={20} className="sidebar__item-icon" />
            <span className="sidebar__item-label">{label}</span>
          </NavLink>
        ))}

        {/* Posts — navega pra página dedicada */}
        <NavLink
          to="/dashboard/posts"
          data-tooltip="Posts"
          className={({ isActive }) =>
            `sidebar__item ${isActive ? 'sidebar__item--active' : ''}`
          }
        >
          <LuSquarePen size={20} className="sidebar__item-icon" />
          <span className="sidebar__item-label">Posts</span>
        </NavLink>

        {/* Equipes — em desenvolvimento */}
        <NavLink
          to="/dashboard/equipes"
          data-tooltip="Equipes"
          className={({ isActive }) =>
            `sidebar__item ${isActive ? 'sidebar__item--active' : ''}`
          }
        >
          <LuUsers size={20} className="sidebar__item-icon" />
          <span className="sidebar__item-label">Equipes</span>
        </NavLink>
      </nav>

      <div className="sidebar__divider" />

      {/* Bottom nav */}
      <nav className="sidebar__nav sidebar__nav--bottom">
        {BOTTOM_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            data-tooltip={label}
            className={({ isActive }) =>
              `sidebar__item ${isActive ? 'sidebar__item--active' : ''}`
            }
          >
            <Icon size={20} className="sidebar__item-icon" />
            <span className="sidebar__item-label">{label}</span>
          </NavLink>
        ))}

        {/* Suporte */}
        <NavLink
          to="/dashboard/suporte"
          data-tooltip="Suporte"
          className={({ isActive }) =>
            `sidebar__item ${isActive ? 'sidebar__item--active' : ''}`
          }
        >
          <LuCircleHelp size={20} className="sidebar__item-icon" />
          <span className="sidebar__item-label">Suporte</span>
        </NavLink>

        {/* Theme toggle */}
        <div className={`sidebar__theme ${isCollapsed ? 'sidebar__theme--collapsed' : ''}`}>
          <div className={`sidebar__theme-toggle ${isCollapsed ? 'sidebar__theme-toggle--vertical' : ''}`}>
            <button
              className={`sidebar__theme-btn ${theme === 'light' ? 'sidebar__theme-btn--active' : ''}`}
              onClick={() => theme !== 'light' && toggleTheme()}
              aria-label="Modo claro"
              data-tooltip="Modo claro"
            >
              <LuSun size={14} className="sidebar__theme-icon" />
              <span className="sidebar__theme-label">Claro</span>
            </button>
            <button
              className={`sidebar__theme-btn ${theme === 'dark' ? 'sidebar__theme-btn--active' : ''}`}
              onClick={() => theme !== 'dark' && toggleTheme()}
              aria-label="Modo escuro"
              data-tooltip="Modo escuro"
            >
              <LuMoon size={14} className="sidebar__theme-icon" />
              <span className="sidebar__theme-label">Escuro</span>
            </button>
          </div>
        </div>
      </nav>

      {/* User — avatar e nome levam à aba Perfil das Configurações */}
      <div className="sidebar__user">
        <Link
          to="/dashboard/configuracoes?tab=perfil"
          className="sidebar__avatar-link"
          aria-label="Ver perfil"
          data-tooltip="Perfil"
        >
          <div className="sidebar__avatar">{getInitials(user?.name)}</div>
        </Link>
        <Link
          to="/dashboard/configuracoes?tab=perfil"
          className="sidebar__user-info"
          aria-label="Ver perfil"
        >
          <span className="sidebar__user-name">{user?.name}</span>
          <span className="sidebar__user-email">{user?.email}</span>
        </Link>
        <button
          className="sidebar__logout"
          onClick={handleLogout}
          title="Sair"
          aria-label="Sair"
        >
          <LuLogOut size={17} />
        </button>
      </div>
    </motion.aside>
  )
}
