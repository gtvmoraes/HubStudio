import { useState } from 'react'
import { LuPlus } from 'react-icons/lu'

export default function FaqItem({ icon: Icon, question, answer }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`l-faq__item${open ? ' l-faq__item--open' : ''}`}>
      <button className="l-faq__q" onClick={() => setOpen(o => !o)}>
        <span className="l-faq__q-wrap">
          {Icon && (
            <span className="l-faq__q-icon">
              <Icon />
            </span>
          )}
          <span className="l-faq__q-text">{question}</span>
        </span>
        <span className="l-faq__icon">
          <LuPlus />
        </span>
      </button>
      <div className="l-faq__a-wrap">
        <div className="l-faq__a-inner">
          <div className="l-faq__a">
            <p>{answer}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
