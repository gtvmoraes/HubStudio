import { useState } from 'react'
import { LuPlus, LuMessageCircleQuestion } from 'react-icons/lu'

function FaqRow({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`sup-faq__item${open ? ' sup-faq__item--open' : ''}`}>
      <button type="button" className="sup-faq__q" onClick={() => setOpen(o => !o)}>
        <span className="sup-faq__q-text">{q}</span>
        <span className="sup-faq__plus"><LuPlus size={18} /></span>
      </button>
      <div className="sup-faq__a-wrap">
        <div className="sup-faq__a-inner">
          <p className="sup-faq__a">{a}</p>
        </div>
      </div>
    </div>
  )
}

export default function SupportFaq({ faqs = [] }) {
  return (
    <div className="sup-faq chart-card">
      <div className="sup-section-head">
        <h3><LuMessageCircleQuestion size={18} /> Perguntas frequentes</h3>
        <span className="sup-section-head__sub">As dúvidas mais comuns</span>
      </div>
      <div className="sup-faq__list">
        {faqs.map(f => <FaqRow key={f.id} q={f.q} a={f.a} />)}
      </div>
    </div>
  )
}
