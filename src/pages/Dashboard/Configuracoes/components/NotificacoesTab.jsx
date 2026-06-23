import { useState } from 'react'
import { LuMail, LuSmartphone, LuBell } from 'react-icons/lu'
import Toggle from './Toggle'

const CHANNELS = [
  { id: 'email', label: 'E-mail', icon: LuMail },
  { id: 'push',  label: 'Push',   icon: LuSmartphone },
  { id: 'app',   label: 'No app', icon: LuBell },
]

const TYPES = [
  { id: 'approval', label: 'Aprovações de publicação', desc: 'Quando um membro envia um rascunho para revisão.' },
  { id: 'failure',  label: 'Falha no agendamento',     desc: 'Se uma publicação não for compartilhada nas redes.' },
  { id: 'summary',  label: 'Resumo semanal',           desc: 'Relatório de desempenho toda segunda-feira.' },
  { id: 'comments', label: 'Novos comentários',        desc: 'Quando alguém comenta nas suas publicações.' },
  { id: 'product',  label: 'Novidades do produto',     desc: 'Lançamentos, recursos e dicas do HubStudio.' },
]

const DEFAULTS = {
  approval: { email: true,  push: true,  app: true  },
  failure:  { email: true,  push: true,  app: true  },
  summary:  { email: true,  push: false, app: false },
  comments: { email: false, push: true,  app: true  },
  product:  { email: true,  push: false, app: false },
}

export default function NotificacoesTab() {
  const [prefs, setPrefs] = useState(DEFAULTS)

  const toggle = (typeId, channelId) =>
    setPrefs(p => ({ ...p, [typeId]: { ...p[typeId], [channelId]: !p[typeId][channelId] } }))

  return (
    <div className="set-section">
      <div className="set-section__head">
        <h2>Notificações</h2>
        <p>Escolha como e quando quer ser avisado sobre cada atividade.</p>
      </div>

      <div className="set-card set-notif">
        <div className="set-notif__legend">
          <span className="set-notif__legend-label">Tipo</span>
          <div className="set-notif__legend-channels">
            {CHANNELS.map(({ id, label, icon: Icon }) => (
              <span key={id} className="set-notif__legend-ch">
                <Icon size={14} /> {label}
              </span>
            ))}
          </div>
        </div>

        {TYPES.map(({ id, label, desc }) => (
          <div key={id} className="set-notif__row">
            <div className="set-notif__info">
              <strong>{label}</strong>
              <p>{desc}</p>
            </div>
            <div className="set-notif__toggles">
              {CHANNELS.map(ch => (
                <Toggle
                  key={ch.id}
                  value={prefs[id][ch.id]}
                  onChange={() => toggle(id, ch.id)}
                  ariaLabel={`${label} via ${ch.label}`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
