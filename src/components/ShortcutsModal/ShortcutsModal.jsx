import Modal from '../Modal/Modal'
import './ShortcutsModal.css'

const SHORTCUTS = [
  {
    group: 'Navegação',
    items: [
      { keys: ['Ctrl', 'K'], desc: 'Abrir busca global' },
      { keys: ['G', 'D'],    desc: 'Ir para o Dashboard' },
      { keys: ['G', 'C'],    desc: 'Ir para Configurações' },
    ],
  },
  {
    group: 'Ações',
    items: [
      { keys: ['N'], desc: 'Novo post' },
      { keys: ['?'], desc: 'Mostrar atalhos' },
    ],
  },
  {
    group: 'Geral',
    items: [
      { keys: ['Esc'],         desc: 'Fechar modal / busca' },
      { keys: ['↑', '↓'],      desc: 'Navegar nos resultados de busca' },
      { keys: ['Enter'],       desc: 'Selecionar resultado ativo' },
    ],
  },
]

export default function ShortcutsModal({ isOpen, onClose }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Atalhos de teclado" size="md">
      <div className="shortcuts">
        {SHORTCUTS.map(({ group, items }) => (
          <div key={group} className="shortcuts__group">
            <h4>{group}</h4>
            <div className="shortcuts__list">
              {items.map(({ keys, desc }) => (
                <div key={desc} className="shortcuts__row">
                  <span className="shortcuts__desc">{desc}</span>
                  <span className="shortcuts__keys">
                    {keys.map((k, i) => (
                      <kbd key={i}>{k}</kbd>
                    ))}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  )
}
