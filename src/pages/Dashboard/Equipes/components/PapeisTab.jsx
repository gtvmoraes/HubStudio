import { LuCheck, LuMinus } from 'react-icons/lu'
import { ROLES, ROLE_ORDER, PERMISSIONS, PERMISSION_MATRIX } from '../../../../services/team'

export default function PapeisTab() {
  return (
    <div className="papeis-tab">
      <div className="papeis-tab__intro">
        <h3>Papéis e permissões</h3>
        <p>
          Cada membro tem um papel que define o que ele pode fazer no time.
          Os papéis são pré-definidos e cobrem os casos mais comuns.
        </p>
      </div>

      {/* Cards descritivos dos papéis */}
      <div className="papeis-tab__cards">
        {ROLE_ORDER.map(id => {
          const r = ROLES[id]
          return (
            <div
              key={id}
              className="papel-card"
              style={{ borderTopColor: r.color }}
            >
              <strong style={{ color: r.color }}>{r.label}</strong>
              <p>{r.description}</p>
            </div>
          )
        })}
      </div>

      {/* Matriz de permissões */}
      <div className="papeis-tab__matrix-wrap">
        <h4>Matriz de permissões</h4>
        <div className="papeis-tab__matrix">
          <table>
            <thead>
              <tr>
                <th></th>
                {ROLE_ORDER.map(id => (
                  <th key={id} style={{ color: ROLES[id].color }}>
                    {ROLES[id].label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERMISSIONS.map(perm => (
                <tr key={perm.key}>
                  <td className="papeis-tab__matrix-label">{perm.label}</td>
                  {ROLE_ORDER.map(id => {
                    const has = PERMISSION_MATRIX[id][perm.key]
                    return (
                      <td key={id} className={`papeis-tab__matrix-cell${has ? ' papeis-tab__matrix-cell--yes' : ''}`}>
                        {has
                          ? <LuCheck size={16} style={{ color: ROLES[id].color }} />
                          : <LuMinus size={14} />
                        }
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
