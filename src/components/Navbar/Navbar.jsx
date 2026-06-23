import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LuArrowRight, LuX, LuMenu } from 'react-icons/lu'
import Button from '../Button/Button'
import logoHub from '../../assets/images/logo-hub.png'
import './Navbar.css'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 900)
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth < 900)
      if (window.innerWidth > 900) setMenuOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const close = () => setMenuOpen(false)

  const handleLogoClick = () => {
    close()
    window.location.href = '/'
  }

  return (
    <header className={`navbar${scrolled ? ' navbar--scrolled' : ''}${menuOpen ? ' navbar--open' : ''}`}>
      <div className="navbar__inner container">

        <Link to="/" className="navbar__logo" onClick={handleLogoClick}>
          <img src={logoHub} alt="HubStudio" className="navbar__logo-img" />
        </Link>

        <nav className={`navbar__nav${menuOpen ? ' navbar__nav--open' : ''}`} aria-hidden={!menuOpen && isMobile}>
          <a href="#funcionalidades" className="navbar__link" onClick={close}>Funcionalidades</a>
          <a href="#sobre"           className="navbar__link" onClick={close}>Sobre</a>
          <a href="#faq"             className="navbar__link" onClick={close}>FAQ</a>
          <a href="#precos"          className="navbar__link" onClick={close}>Planos</a>

          <div className="navbar__mobile-cta">
            <Button variant="outline" fullWidth onClick={() => { navigate('/entrar');   close() }}>Entrar</Button>
            <Button variant="primary" fullWidth onClick={() => { navigate('/cadastro'); close() }}>Começar grátis</Button>
          </div>
        </nav>

        <div className="navbar__actions">
          <Button variant="outline" size="sm" onClick={() => navigate('/entrar')}>Entrar</Button>
          <Button variant="primary" size="sm" iconRight={<LuArrowRight />} onClick={() => navigate('/cadastro')}>
            Cadastrar-se
          </Button>
        </div>

        <button
          className={`navbar__burger${menuOpen ? ' navbar__burger--open' : ''}`}
          onClick={() => setMenuOpen(v => !v)}
          aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
        >
          {menuOpen ? <LuX size={22} /> : <LuMenu size={22} />}
        </button>
      </div>

      {menuOpen && <div className="navbar__overlay" onClick={close} />}
    </header>
  )
}
