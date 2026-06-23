import { Link } from 'react-router-dom'
import logoHub from '../../assets/images/logo-hub.png'
import './Footer.css'

const LINKS = [
  {
    title: 'Produto',
    items: [
      { label: 'Funcionalidades',       href: '#funcionalidades' },
      { label: 'Planos e preços',       href: '#precos'          },
      { label: 'Sobre nós',             href: '#sobre'           },
      { label: 'Perguntas frequentes',  href: '#faq'             },
    ],
  },
  {
    title: 'Conta',
    items: [
      { label: 'Começar grátis', to: '/cadastro' },
      { label: 'Entrar',         to: '/entrar'   },
    ],
  },
  {
    title: 'Suporte',
    items: [
      { label: 'Central de ajuda', to: '/dashboard/suporte'           },
      { label: 'Contato',          href: 'mailto:hubstudio@gmail.com' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="footer">
      {/* Gradient separator — topo do footer */}
      <div className="footer__gradient-line" />

      {/* Top glow decoration */}
      <div className="footer__top-glow" />

      {/* Espaçador garantido após a linha */}
      <div className="footer__spacer" />

      {/* Main body */}
      <div className="container footer__body">

        {/* Brand column */}
        <div className="footer__brand">
          <Link
            to="/"
            className="footer__logo"
            aria-label="HubStudio"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <img src={logoHub} alt="HubStudio" className="footer__logo-img" />
          </Link>

          <p className="footer__tagline">
            A plataforma completa para criadores de conteúdo que querem crescer sem complicação.
          </p>

        </div>

        {/* Link columns */}
        {LINKS.map(col => (
          <div key={col.title} className="footer__col">
            <h4 className="footer__col-title">{col.title}</h4>
            <ul>
              {col.items.map(item => (
                <li key={item.label}>
                  {item.to
                    ? <Link to={item.to}>{item.label}</Link>
                    : <a href={item.href}>{item.label}</a>
                  }
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <p>© 2026 HubStudio. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
